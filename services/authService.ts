
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
const API_BASE = env.VITE_GATEWAY_URL ? `${env.VITE_GATEWAY_URL.replace(/\/$/, '')}/core` : '/api';

/**
 * Handle GitHub OAuth Code Exchange
 * STRATEGY: Network Only. 
 * This relies strictly on the backend worker. If the worker is offline, this WILL fail.
 * There is no mock fallback for GitHub login to ensure security boundaries.
 */
export const exchangeGithubCode = async (code: string): Promise<AuthResponse> => {
    try {
        console.log("AuthService: Exchanging GitHub code...");
        const response = await fetch(`${API_BASE}/auth/github`, {
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
    
    if (!cleanPass) {
        throw new Error('Password required');
    }

    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'sunyata', password: cleanPass })
    });

    if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || 'Invalid credentials');
    }

    return response.json();
};

export const fetchSession = async (): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/session`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('SESSION_NOT_FOUND');
    }
    return response.json();
};

export const refreshSession = async (): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE}/session/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('REFRESH_FAILED');
    }
    return response.json();
};

export const logoutSession = async (): Promise<void> => {
    await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });
};
