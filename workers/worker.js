
import { Ai } from '@cloudflare/ai';

/**
 * CLOUDFLARE WORKER: MetaCogna API & Auth Gateway
 * 
 * Env Variables Required:
 * - GITHUB_CLIENT_ID
 * - GITHUB_CLIENT_SECRET
 * - JWT_SECRET
 * - ADMIN_PASSWORD (for the Steganography flow)
 * - PORTAL_UPDATES (KV Namespace)
 * - AI binding (optional but recommended)
 */

// --- UTILS ---

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders, ...extraHeaders },
  });
}

function errorResponse(message, status = 400, extraHeaders = {}) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders, ...extraHeaders },
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

const DEFAULT_GOALS = [
  {
    id: 'goal-1',
    title: 'Portal GA Launch',
    owner: 'Sunyata',
    status: 'on_track',
    progress: 0.68,
    dueDate: '2024-08-01',
    notionUrl: 'https://www.notion.so/example-goal-1',
    linearUrl: 'https://linear.app/metacogna/project/PORTAL',
    githubUrl: 'https://github.com/metacogna-lab/metacogna-landing',
    description: 'Align portal experience, deploy Cloudflare workers, and connect SSO.',
    lastSync: new Date().toISOString(),
    projectName: 'Portal Control Tower'
  },
  {
    id: 'goal-2',
    title: 'Agent Ops Playbook',
    owner: 'Lambda',
    status: 'at_risk',
    progress: 0.41,
    dueDate: '2024-07-15',
    notionUrl: 'https://www.notion.so/example-goal-2',
    linearUrl: 'https://linear.app/metacogna/project/AGENT-OPS',
    githubUrl: 'https://github.com/metacogna-lab/metacogna-playbooks',
    description: 'Codify Notion + Linear rituals into a repeatable ops framework.',
    lastSync: new Date().toISOString(),
    projectName: 'Agent Ops Playbook'
  },
  {
    id: 'goal-3',
    title: 'Debate Sense Alpha',
    owner: 'Pratej',
    status: 'blocked',
    progress: 0.22,
    dueDate: '2024-07-05',
    notionUrl: 'https://www.notion.so/example-goal-3',
    linearUrl: 'https://linear.app/metacogna/project/DEBATE',
    githubUrl: 'https://github.com/metacogna-lab/debate-sense',
    description: 'Ship the debating coach prototype with governance guardrails.',
    lastSync: new Date().toISOString(),
    projectName: 'Debate Sense'
  },
];

const DEFAULT_TOOLS = {
  notion: 'https://www.notion.so/metacogna',
  linear: 'https://linear.app/metacogna',
  github: 'https://github.com/metacogna-lab',
};

const SEARCH_INDEX = [
  {
    id: 'search-goal-1',
    title: 'Portal GA Launch',
    snippet: 'Align portal experience, deploy Cloudflare workers, and connect SSO.',
    source: 'goal',
    url: 'https://www.notion.so/example-goal-1',
  },
  {
    id: 'search-risk-1',
    title: 'Risk: Auth Rate Limiting',
    snippet: 'Cloudflare strict mode might block valid client IPs during the demo.',
    source: 'risk',
  },
  {
    id: 'search-update-1',
    title: 'System Migration: Phase 2',
    snippet: 'Migration of the legacy user database to the new KV store is 80% complete.',
    source: 'progress',
  },
];

const DEFAULT_STATUS = [
  { service: 'Notion', lastSync: new Date().toISOString(), status: 'healthy' },
  { service: 'Linear', lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(), status: 'healthy' },
  { service: 'GitHub', lastSync: new Date(Date.now() - 12 * 60 * 1000).toISOString(), status: 'delayed' },
];

const CACHE_TTL_MS = 5 * 60 * 1000;
const JWKS_CACHE_TTL_MS = 60 * 60 * 1000;

function hasD1(env) {
  return env.PORTAL_DB && typeof env.PORTAL_DB.prepare === 'function';
}

async function fetchGoalsFromDb(env) {
  if (!hasD1(env)) return [];
  const query = `SELECT g.id, g.title, g.owner, g.status, g.progress, g.due_date as dueDate,
                        g.description, g.notion_url as notionUrl, g.linear_url as linearUrl,
                        g.github_url as githubUrl, g.last_sync as lastSync, p.name as projectName
                 FROM goals g
                 LEFT JOIN projects p ON g.project_id = p.id
                 ORDER BY g.due_date IS NULL, g.due_date`;
  const { results } = await env.PORTAL_DB.prepare(query).all();
  return results.map(row => ({
    id: row.id,
    title: row.title,
    owner: row.owner,
    status: row.status,
    progress: Number(row.progress ?? 0),
    dueDate: row.dueDate,
    description: row.description,
    notionUrl: row.notionUrl,
    linearUrl: row.linearUrl,
    githubUrl: row.githubUrl,
    lastSync: row.lastSync,
    projectName: row.projectName,
  }));
}

async function fetchOrgMatrixFromDb(env) {
  if (!hasD1(env)) return [];
  const query = `SELECT tm.name as member, tm.role as role, t.name as team, p.name as project
                 FROM team_members tm
                 LEFT JOIN teams t ON tm.team_id = t.id
                 LEFT JOIN projects p ON t.project_id = p.id
                 ORDER BY t.name, tm.name`;
  const { results } = await env.PORTAL_DB.prepare(query).all();
  return results;
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

    const sessionCookieName = 'metacogna_session';

    function createSessionCookie(token) {
        const maxAge = 60 * 60 * 24; // 24 hours
        return `${sessionCookieName}=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
    }

    function expireSessionCookie() {
        return `${sessionCookieName}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`;
    }

    function extractToken(req) {
        const authHeader = req.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.split(' ')[1];
        }
        const cookieHeader = req.headers.get('Cookie');
        if (cookieHeader) {
            const cookies = cookieHeader.split(';').map(c => c.trim());
            for (const cookie of cookies) {
                if (cookie.startsWith(`${sessionCookieName}=`)) {
                    return cookie.substring(sessionCookieName.length + 1);
                }
            }
        }
        return null;
    }

    function respondWithSession(token, user, role) {
        return jsonResponse({ token, user, role }, 200, { 'Set-Cookie': createSessionCookie(token) });
    }

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

            return respondWithSession(token, username, role);

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
            
            return respondWithSession(token, 'Sunyata', 'admin');
        }
        return errorResponse('Invalid Credentials', 401);
    }

    // GET /api/session
    if (method === 'GET' && url.pathname === '/api/session') {
        const token = extractToken(request);
        if (!token) return errorResponse('Unauthorized', 401, { 'Set-Cookie': expireSessionCookie() });

        const claims = await verifyJwt(token, env.JWT_SECRET);
        if (!claims) return errorResponse('Invalid session', 401, { 'Set-Cookie': expireSessionCookie() });

        return jsonResponse({ user: claims.sub, role: claims.role, token });
    }

    // POST /api/session/refresh
    if (method === 'POST' && url.pathname === '/api/session/refresh') {
        const token = extractToken(request);
        if (!token) return errorResponse('Unauthorized', 401, { 'Set-Cookie': expireSessionCookie() });

        const claims = await verifyJwt(token, env.JWT_SECRET);
        if (!claims) return errorResponse('Invalid session', 401, { 'Set-Cookie': expireSessionCookie() });

        const refreshed = await signJwt({
            sub: claims.sub,
            role: claims.role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)
        }, env.JWT_SECRET);

        return respondWithSession(refreshed, claims.sub, claims.role);
    }

    // POST /api/logout
    if (method === 'POST' && url.pathname === '/api/logout') {
        return jsonResponse({ success: true }, 200, { 'Set-Cookie': expireSessionCookie() });
    }

    // --- PROTECTED DATA ROUTES ---

    // Verify JWT Middleware
    let userClaims = null;
    const sessionToken = extractToken(request);
    if (sessionToken) {
        userClaims = await verifyJwt(sessionToken, env.JWT_SECRET);
        if (!userClaims) {
            userClaims = await verifyCognitoToken(sessionToken, env);
        }
    }

    // Helper to get KV Lists
    async function getUpdatesList() {
        const listStr = await env.PORTAL_UPDATES.get('UPDATES_LIST');
        return listStr ? JSON.parse(listStr) : [];
    }

    async function getGoalsList() {
        if (hasD1(env)) {
            try {
                const dbGoals = await fetchGoalsFromDb(env);
                if (dbGoals.length) return dbGoals;
            } catch (err) {
                console.error('D1 goals read failed', err);
            }
        }
        const listStr = await env.PORTAL_UPDATES.get('GOALS_LIST');
        if (listStr) return JSON.parse(listStr);
        await env.PORTAL_UPDATES.put('GOALS_LIST', JSON.stringify(DEFAULT_GOALS));
        return [...DEFAULT_GOALS];
    }

    async function getToolLinks() {
        const cached = await env.PORTAL_UPDATES.get('TOOL_LINKS');
        if (cached) return JSON.parse(cached);
        await env.PORTAL_UPDATES.put('TOOL_LINKS', JSON.stringify(DEFAULT_TOOLS));
        return { ...DEFAULT_TOOLS };
    }

    async function getOrgMatrix() {
        if (hasD1(env)) {
            try {
                return await fetchOrgMatrixFromDb(env);
            } catch (err) {
                console.error('D1 org matrix failed', err);
            }
        }
        return [];
    }

    async function createSsoState(provider, target) {
        const state = crypto.randomUUID();
        await env.PORTAL_UPDATES.put(`SSO_STATE_${state}`, JSON.stringify({ provider, target, createdAt: Date.now() }), { expirationTtl: 600 });
        return state;
    }

    async function validateSsoState(provider, state) {
        const stored = await env.PORTAL_UPDATES.get(`SSO_STATE_${state}`);
        if (!stored) return null;
        const payload = JSON.parse(stored);
        if (payload.provider !== provider) return null;
        await env.PORTAL_UPDATES.delete(`SSO_STATE_${state}`);
        return payload;
    }

const jwksCache = {
  keys: null,
  fetchedAt: 0,
};

function base64UrlToUint8Array(base64UrlString) {
  const padding = '='.repeat((4 - (base64UrlString.length % 4)) % 4);
  const base64 = (base64UrlString + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function getJwks(env) {
  if (!env.COGNITO_REGION || !env.COGNITO_USER_POOL_ID) return null;
  if (jwksCache.keys && Date.now() - jwksCache.fetchedAt < JWKS_CACHE_TTL_MS) {
    return jwksCache.keys;
  }
  const url = `https://cognito-idp.${env.COGNITO_REGION}.amazonaws.com/${env.COGNITO_USER_POOL_ID}/.well-known/jwks.json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  jwksCache.keys = data.keys || [];
  jwksCache.fetchedAt = Date.now();
  return jwksCache.keys;
}

async function verifyCognitoToken(token, env) {
  try {
    if (!env.COGNITO_REGION || !env.COGNITO_USER_POOL_ID || !env.COGNITO_CLIENT_ID) return null;
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) return null;
    const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (header.alg !== 'RS256') return null;
    const keys = await getJwks(env);
    if (!keys) return null;
    const jwk = keys.find((key) => key.kid === header.kid);
    if (!jwk) return null;
    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const signature = base64UrlToUint8Array(signatureB64);
    const verified = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      signature,
      new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    );
    if (!verified) return null;
    const iss = `https://cognito-idp.${env.COGNITO_REGION}.amazonaws.com/${env.COGNITO_USER_POOL_ID}`;
    if (payload.iss !== iss) return null;
    if (payload.aud !== env.COGNITO_CLIENT_ID) return null;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return {
      sub: payload.sub,
      role: payload['cognito:groups']?.includes('admin') ? 'admin' : 'associate',
      email: payload.email,
      source: 'cognito'
    };
  } catch (err) {
    console.error('Cognito token verification failed', err);
    return null;
  }
}

async function summarizeWebhook(body) {
        if (!env.AI) {
            return `Received webhook payload: ${JSON.stringify(body).slice(0, 1800)}`;
        }
        try {
            const ai = new Ai(env.AI);
            const response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
                messages: [
                    { role: 'system', content: 'You are a concise operations analyst. Summarize incoming webhook payloads in two brief sentences. Focus on actionable changes.' },
                    { role: 'user', content: JSON.stringify(body) }
                ]
            });
            if (response && response.response) {
                return response.response.trim();
            }
            if (Array.isArray(response?.result?.output_text)) {
                return response.result.output_text.join(' ').trim();
            }
            return `Webhook summary unavailable. Inspect payload: ${JSON.stringify(body).slice(0, 1200)}`;
        } catch (err) {
            console.error('AI summarization failed', err);
            return `Webhook summary unavailable. Inspect payload: ${JSON.stringify(body).slice(0, 1200)}`;
        }
    }

    async function getCachedData(key, fallback) {
        const cached = await env.PORTAL_UPDATES.get(key);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
                return parsed.data;
            }
        }
        const fresh = await fallback();
        await env.PORTAL_UPDATES.put(key, JSON.stringify({ timestamp: Date.now(), data: fresh }));
        return fresh;
    }

    async function fetchLinearTasks(env) {
        if (!env.LINEAR_API_KEY) return [];
        const query = `
            query PortalTasks {
                issues(first: 20, filter: { state: { type: { neq: \"completed\" } } }, orderBy: updatedAt, orderDirection: Desc) {
                    nodes {
                        id
                        identifier
                        title
                        url
                        dueDate
                        assignee { name }
                        state { name }
                    }
                }
            }
        `;

        const res = await fetch('https://api.linear.app/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': env.LINEAR_API_KEY
            },
            body: JSON.stringify({ query })
        });

        if (!res.ok) {
            console.error('Linear API error', await res.text());
            throw new Error('LINEAR_FETCH_ERROR');
        }

        const payload = await res.json();
        const nodes = payload?.data?.issues?.nodes || [];
        return nodes.map(node => ({
            id: node.id,
            title: `${node.identifier} · ${node.title}`,
            status: node.state?.name || 'Unknown',
            assignee: node.assignee?.name || 'Unassigned',
            url: node.url,
            dueDate: node.dueDate,
        }));
    }

    async function fetchNotionPages(env) {
        if (!env.NOTION_API_KEY || !env.NOTION_DATABASE_ID) return [];
        const res = await fetch(`https://api.notion.com/v1/databases/${env.NOTION_DATABASE_ID}/query`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.NOTION_API_KEY}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28',
            },
            body: JSON.stringify({
                page_size: 20,
                sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }]
            })
        });

        if (!res.ok) {
            console.error('Notion API error', await res.text());
            throw new Error('NOTION_FETCH_ERROR');
        }

        const payload = await res.json();
        return (payload.results || []).map(page => {
            const titleProp = page.properties?.Name;
            let title = 'Untitled';
            if (titleProp?.title?.length) {
                title = titleProp.title.map(t => t.plain_text).join('');
            }
            return {
                id: page.id,
                title,
                url: page.url,
                lastEditedTime: page.last_edited_time,
            };
        });
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

    // GET /api/portal/goals
    if (method === 'GET' && url.pathname === '/api/portal/goals') {
        if (!userClaims) return errorResponse('Unauthorized', 401);

        const goals = await getGoalsList();
        return jsonResponse(goals);
    }

    // GET /api/portal/tools
    if (method === 'GET' && url.pathname === '/api/portal/tools') {
        if (!userClaims) return errorResponse('Unauthorized', 401);
        const tools = await getToolLinks();
        return jsonResponse(tools);
    }

    // GET /api/org/matrix
    if (method === 'GET' && url.pathname === '/api/org/matrix') {
        if (!userClaims) return errorResponse('Unauthorized', 401);
        const matrix = await getOrgMatrix();
        return jsonResponse(matrix);
    }

    // GET /api/search
    if (method === 'GET' && url.pathname === '/api/search') {
        if (!userClaims) return errorResponse('Unauthorized', 401);
        const query = url.searchParams.get('q') || '';
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) return jsonResponse({ results: [], latencyMs: 0 });

        const start = Date.now();
        const results = SEARCH_INDEX.filter(item =>
            item.title.toLowerCase().includes(trimmed) ||
            item.snippet.toLowerCase().includes(trimmed)
        ).slice(0, 10);
        const latencyMs = Date.now() - start;
        return jsonResponse({ results, latencyMs });
    }

    // GET /api/status
    if (method === 'GET' && url.pathname === '/api/status') {
        return jsonResponse({ ingestion: DEFAULT_STATUS });
    }

    // GET /api/sso/start
    if (method === 'GET' && url.pathname === '/api/sso/start') {
        if (!userClaims) return errorResponse('Unauthorized', 401);
        const provider = (url.searchParams.get('provider') || '').toLowerCase();
        if (!provider) return errorResponse('Missing provider', 400);
        const tools = await getToolLinks();
        const target = tools[provider];
        if (!target) return errorResponse('Unknown provider', 400);
        const state = await createSsoState(provider, target);
        const callbackUrl = `${url.protocol}//${url.host}/?sso_provider=${provider}&sso_status=success&state=${state}`;
        return jsonResponse({ url: target, state, callbackUrl });
    }

    // GET /api/sso/callback
    if (method === 'GET' && url.pathname === '/api/sso/callback') {
        const provider = (url.searchParams.get('provider') || '').toLowerCase();
        const state = url.searchParams.get('state');
        const status = url.searchParams.get('status') || 'success';
        if (!provider || !state) return errorResponse('Missing parameters', 400);
        const payload = await validateSsoState(provider, state);
        if (!payload) return errorResponse('Invalid state', 400);
        return jsonResponse({ success: true, provider, status });
    }

    // GET /api/linear/tasks
    if (method === 'GET' && url.pathname === '/api/linear/tasks') {
        if (!userClaims) return errorResponse('Unauthorized', 401);
        try {
            const tasks = await getCachedData('LINEAR_TASKS_CACHE', () => fetchLinearTasks(env));
            return jsonResponse(tasks);
        } catch (err) {
            console.error('Linear fetch failed', err);
            return jsonResponse([]);
        }
    }

    // GET /api/notion/pages
    if (method === 'GET' && url.pathname === '/api/notion/pages') {
        if (!userClaims) return errorResponse('Unauthorized', 401);
        try {
            const pages = await getCachedData('NOTION_PAGES_CACHE', () => fetchNotionPages(env));
            return jsonResponse(pages);
        } catch (err) {
            console.error('Notion fetch failed', err);
            return jsonResponse([]);
        }
    }

    // POST /api/webhooks
    if (method === 'POST' && url.pathname === '/api/webhooks') {
        const body = await request.json().catch(() => ({}));
        const eventPayload = {
            receivedAt: new Date().toISOString(),
            body,
            headers: Object.fromEntries(request.headers)
        };

        await env.PORTAL_UPDATES.put(`WEBHOOK_${Date.now()}`, JSON.stringify(eventPayload), { expirationTtl: 60 * 60 * 24 });

        const summary = await summarizeWebhook(body);
        const list = await getUpdatesList();
        const update = {
            id: `webhook-${Date.now()}`,
            title: body?.title || body?.subject || 'External Update',
            content: summary,
            date: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: 'progress',
            confidence: 'medium',
            visibility: 'both',
            priority: 'medium',
            author: body?.author || 'automation',
            tags: body?.tags || ['webhook']
        };
        list.unshift(update);
        if (list.length > 100) list.pop();
        await env.PORTAL_UPDATES.put('UPDATES_LIST', JSON.stringify(list));

        return jsonResponse({ success: true, summary });
    }

    return errorResponse('Not Found', 404);
  },
};
