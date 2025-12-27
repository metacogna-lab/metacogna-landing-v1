
// Auth Service

export interface AuthResponse {
    token: string;
    user: string;
    role: 'admin' | 'associate' | 'client';
    error?: string;
}

// Safely access env vars to prevent crashes if import.meta.env is undefined
const env = (import.meta as any).env || {};
export const GITHUB_CLIENT_ID = env.VITE_GITHUB_CLIENT_ID || 'Iv1.placeholder_client_id';

/**
 * Handle GitHub OAuth Code Exchange
 * STRATEGY: Network Only. 
 * This relies strictly on the backend worker. If the worker is offline, this WILL fail.
 * There is no mock fallback for GitHub login to ensure security boundaries.
 */
export const exchangeGithubCode = async (code: string): Promise<AuthResponse> => {
    try {
        console.log("AuthService: Exchanging GitHub code...");
        const response = await fetch('/api/auth/github', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Authentication failed');
            return data;
        }
        
        throw new Error('Auth Service Unavailable (Invalid Response Type)');
    } catch (error: any) {
        console.error("GitHub Auth Error:", error);
        throw new Error(error.message || 'GitHub Authentication Failed');
    }
};

/**
 * Handle Admin/Steganography Login
 * STRATEGY: Network First -> Local Fallback.
 * This ensures the demo works even if the backend is unreachable.
 */
export const loginAdmin = async (password: string): Promise<AuthResponse> => {
    const cleanPass = password.trim();
    
    // --- Local Fallback Logic (Mock Admin) ---
    const runFallback = async (): Promise<AuthResponse> => {
        console.warn("Auth Service: Network failed or rejected. Running Local Fallback.");
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency

        // Hardcoded demo credentials
        if (cleanPass.toLowerCase() === 'entropy' || cleanPass.toLowerCase() === 'clarity') {
            return {
                token: 'mock-admin-token-local-' + Date.now(),
                user: 'Sunyata',
                role: 'admin'
            };
        }
        throw new Error('Invalid Passphrase');
    };

    // --- Network Attempt ---
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

        const response = await fetch('/api/auth/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: cleanPass }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            
            // If the server explicitly validates and returns success
            if (response.ok) {
                return data;
            }
            
            // If server explicitly rejects (401), we normally throw.
            // HOWEVER, for this DEMO, we proceed to fallback check 
            // in case the server env vars are not set but user knows the demo pass.
            console.warn("Auth Service: Server rejected credentials. Checking local override...");
            return runFallback();
        }
        
        // Non-JSON response (e.g. 404 HTML from Vercel/Cloudflare if route missing)
        throw new Error('API_ROUTE_MISSING');

    } catch (error: any) {
        // Network error, Timeout, or API Route Missing -> Use Fallback
        console.log(`Auth Service: Network attempt failed (${error.message}). Switching to fallback.`);
        return runFallback();
    }
};
