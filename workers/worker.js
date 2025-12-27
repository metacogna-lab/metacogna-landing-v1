
/**
 * CLOUDFLARE WORKER: MetaCogna API & Auth Gateway
 * 
 * Env Variables Required:
 * - GITHUB_CLIENT_ID
 * - GITHUB_CLIENT_SECRET
 * - JWT_SECRET
 * - ADMIN_PASSWORD (for the Steganography flow)
 * - PORTAL_UPDATES (KV Namespace)
 */

// --- UTILS ---

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function errorResponse(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// --- JWT HELPERS (Web Crypto API) ---

async function signJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

async function verifyJwt(token, secret) {
  try {
    const [h, p, s] = token.split('.');
    if (!h || !p || !s) return null;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      new Uint8Array(atob(s.replace(/-/g, '+').replace(/_/g, '/')).split('').map(c => c.charCodeAt(0))),
      new TextEncoder().encode(`${h}.${p}`)
    );

    if (!valid) return null;
    return JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')));
  } catch (e) {
    return null;
  }
}

// --- WORKER HANDLER ---

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;
    
    // 1. CORS Preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // --- AUTH ROUTES ---

    // POST /api/auth/github
    if (method === 'POST' && url.pathname === '/api/auth/github') {
        try {
            const { code } = await request.json();
            
            // A. Exchange Code for Access Token
            const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: { 
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: env.GITHUB_CLIENT_ID,
                    client_secret: env.GITHUB_CLIENT_SECRET,
                    code
                })
            });
            
            const tokenData = await tokenResponse.json();
            if (tokenData.error) return errorResponse(tokenData.error_description || 'GitHub handshake failed');
            
            const accessToken = tokenData.access_token;

            // B. Get User Profile
            const userRes = await fetch('https://api.github.com/user', {
                headers: { 
                    'Authorization': `Bearer ${accessToken}`,
                    'User-Agent': 'MetaCogna-Worker'
                }
            });
            const userData = await userRes.json();
            const username = userData.login;

            // C. Check Organizations
            const orgsRes = await fetch('https://api.github.com/user/orgs', {
                 headers: { 
                    'Authorization': `Bearer ${accessToken}`,
                    'User-Agent': 'MetaCogna-Worker'
                }
            });
            const orgsData = await orgsRes.json();
            
            const allowedOrgs = ['metacogna-lab', 'pratejratech', 'PratejraTech'];
            const userOrgs = orgsData.map(o => o.login);
            const isAuthorized = userOrgs.some(o => allowedOrgs.includes(o));

            // Default Role Logic
            let role = 'client'; 
            if (isAuthorized) role = 'associate';

            if (!isAuthorized) {
                // Optional: Allow specific users even if not in org? 
                // For now, strict requirement as requested.
                return errorResponse('Access Denied: You must be a member of @metacogna-lab or @PratejraTech', 403);
            }

            // D. Issue JWT
            const token = await signJwt({ 
                sub: username, 
                role: role, 
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
            }, env.JWT_SECRET);

            return jsonResponse({ token, user: username, role });

        } catch (e) {
            return errorResponse(`Auth Error: ${e.message}`, 500);
        }
    }

    // POST /api/auth/admin (For Steganography/Password Flow)
    if (method === 'POST' && url.pathname === '/api/auth/admin') {
        const { password } = await request.json();
        
        if (password === env.ADMIN_PASSWORD) {
            const token = await signJwt({ 
                sub: 'Sunyata', 
                role: 'admin', 
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
            }, env.JWT_SECRET);
            
            return jsonResponse({ token, user: 'Sunyata', role: 'admin' });
        }
        return errorResponse('Invalid Credentials', 401);
    }

    // --- PROTECTED DATA ROUTES ---

    // Verify JWT Middleware
    const authHeader = request.headers.get('Authorization');
    let userClaims = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        userClaims = await verifyJwt(token, env.JWT_SECRET);
    }

    // Helper to get KV List
    async function getUpdatesList() {
        const listStr = await env.PORTAL_UPDATES.get('UPDATES_LIST');
        return listStr ? JSON.parse(listStr) : [];
    }

    // GET /api/portal/updates
    if (method === 'GET' && url.pathname === '/api/portal/updates') {
        if (!userClaims) return errorResponse('Unauthorized', 401);

        const list = await getUpdatesList();
        
        // RBAC Filtering
        const filtered = list.filter(item => {
            if (userClaims.role === 'admin' || userClaims.role === 'associate') return true;
            // Clients only see specific visibility
            return item.visibility === 'client' || item.visibility === 'both';
        });

        return jsonResponse(filtered);
    }

    // PATCH /api/portal/updates/:id
    if (method === 'PATCH' && url.pathname.match(/\/api\/portal\/updates\/[^/]+$/)) {
        if (!userClaims || userClaims.role === 'client') return errorResponse('Unauthorized: insufficient permissions', 403);
        
        const id = url.pathname.split('/').pop();
        const body = await request.json();
        const list = await getUpdatesList();
        const index = list.findIndex(i => i.id === id);
        
        if (index === -1) return errorResponse('Not Found', 404);
        
        list[index] = { ...list[index], ...body, updatedAt: new Date().toISOString() };
        await env.PORTAL_UPDATES.put('UPDATES_LIST', JSON.stringify(list));
        
        return jsonResponse(list[index]);
    }

    // POST /api/portal/updates/:id/comments
    if (method === 'POST' && url.pathname.match(/\/api\/portal\/updates\/[^/]+\/comments$/)) {
        if (!userClaims) return errorResponse('Unauthorized', 401);

        const id = url.pathname.split('/')[4];
        const newComment = await request.json();
        const list = await getUpdatesList();
        const index = list.findIndex(i => i.id === id);

        if (index === -1) return errorResponse('Not Found', 404);

        // Ensure the comment author matches the token
        newComment.author = userClaims.sub;
        newComment.timestamp = new Date().toISOString();

        const comments = list[index].comments || [];
        comments.push(newComment);
        list[index].comments = comments;

        await env.PORTAL_UPDATES.put('UPDATES_LIST', JSON.stringify(list));
        return jsonResponse(comments);
    }

    return errorResponse('Not Found', 404);
  },
};
