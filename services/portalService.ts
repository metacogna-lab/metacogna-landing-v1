
import { PortalUpdate, Comment, PortalGoal, ToolLinkResponse, SearchResponse, StatusResponse, LinearTask, NotionPage, OrgMatrixRow } from '../types';

// Mock Data for fallback
const MOCK_UPDATES: PortalUpdate[] = [
    {
        id: '1',
        title: 'System Migration: Phase 2',
        content: 'Migration of the legacy user database to the new KV store is 80% complete. Expected downtime: None.',
        date: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
        type: 'progress',
        confidence: 'high',
        visibility: 'both',
        priority: 'high',
        author: 'Sunyata',
        tags: ['Infra', 'KV'],
        comments: []
    },
    {
        id: '2',
        title: 'Architecture Decision: No SQL',
        content: 'We are officially dropping SQL support for the pilot. KV constraints force better data discipline.',
        date: '2023-10-24',
        updatedAt: '2023-10-24T10:00:00Z',
        type: 'decision',
        confidence: 'medium',
        visibility: 'associate',
        priority: 'medium',
        author: 'Admin',
        tags: ['Arch'],
        comments: [{ id: 'c1', author: 'Client', text: 'Does this impact export?', timestamp: '2023-10-25T09:00:00Z' }]
    },
    {
        id: '3',
        title: 'Risk: Auth Rate Limiting',
        content: 'Cloudflare strict mode might block valid client IPs during the demo.',
        date: '2023-10-26',
        updatedAt: '2023-10-26T14:30:00Z',
        type: 'risk',
        confidence: 'high',
        visibility: 'associate',
        priority: 'critical',
        author: 'SecOps',
        tags: ['Security']
    },
    {
        id: '4',
        title: 'Milestone Reached: Alpha Release',
        content: 'The portal is live for internal testing.',
        date: '2023-10-27',
        updatedAt: '2023-10-27T16:00:00Z',
        type: 'progress',
        confidence: 'high',
        visibility: 'client',
        priority: 'medium',
        author: 'Sunyata',
        tags: ['Milestone']
    }
];

// In-memory store for session persistence during Fallback mode
let SESSION_MOCK_UPDATES = [...MOCK_UPDATES];

const getAuthHeaders = () => {
    const token = localStorage.getItem('metacogna_token');
    return token ? { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    } : { 'Content-Type': 'application/json' };
};

export const fetchUpdates = async (): Promise<PortalUpdate[]> => {
    try {
        const headers = getAuthHeaders();
        // If no token, default to fallback immediately
        if (!headers.Authorization) throw new Error("No token");

        const res = await fetch('/api/portal/updates', { headers, credentials: 'include' });
        
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        
        const data = await res.json();
        // Sync API data to session cache
        SESSION_MOCK_UPDATES = data;
        return data;

    } catch (e) {
        console.warn('PORTAL: Fetch failed or Offline Mode. Using Mock Data.');
        // Return valid promise with session data
        return new Promise(resolve => setTimeout(() => resolve([...SESSION_MOCK_UPDATES]), 500));
    }
};

export const patchUpdate = async (id: string, updates: Partial<PortalUpdate>): Promise<PortalUpdate> => {
    try {
         const res = await fetch(`/api/portal/updates/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
         });
         if (!res.ok) throw new Error('API Error');
         return await res.json();
    } catch (e) {
         console.warn('PORTAL: Patch failed. Updating local session state.');
         return new Promise(resolve => setTimeout(() => {
            const index = SESSION_MOCK_UPDATES.findIndex(u => u.id === id);
            if (index === -1) throw new Error("Item not found");
            
            // Update local session
            const updatedItem = { ...SESSION_MOCK_UPDATES[index], ...updates };
            SESSION_MOCK_UPDATES[index] = updatedItem;
            
            resolve(updatedItem);
         }, 500));
    }
};

export const addComment = async (id: string, comment: Comment): Promise<Comment[]> => {
    try {
        const res = await fetch(`/api/portal/updates/${id}/comments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(comment)
        });
        if (!res.ok) throw new Error('API Error');
        return await res.json();
    } catch (e) {
        console.warn('PORTAL: Add comment failed. Updating local session state.');
        return new Promise(resolve => setTimeout(() => {
            const update = SESSION_MOCK_UPDATES.find(u => u.id === id);
            if (update) {
                const newComments = [...(update.comments || []), comment];
                update.comments = newComments;
                resolve(newComments);
            } else {
                resolve([]);
            }
        }, 300));
    }
};

export const fetchGoals = async (): Promise<PortalGoal[]> => {
    try {
        const headers = getAuthHeaders();
        if (!headers.Authorization) throw new Error("No token");

        const res = await fetch('/api/portal/goals', { headers, credentials: 'include' });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
    } catch (e) {
        console.warn('PORTAL: Goals fetch failed. Using empty set.');
        return [];
    }
};

export const fetchToolLinks = async (): Promise<ToolLinkResponse> => {
    try {
        const res = await fetch('/api/portal/tools', {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error('Failed to load tool links');
        return res.json();
    } catch (e) {
        console.warn('PORTAL: Tool link fetch failed.', e);
        return {};
    }
};

export const searchPortal = async (query: string): Promise<SearchResponse> => {
    if (!query.trim()) return { results: [], latencyMs: 0 };

    const start = performance.now();
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    const latencyMs = Math.round(performance.now() - start);
    return { ...data, latencyMs };
};

export const fetchStatus = async (): Promise<StatusResponse> => {
    const res = await fetch('/api/status', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('Status endpoint unavailable');
    return res.json();
};
export const fetchLinearTasks = async (): Promise<LinearTask[]> => {
    const res = await fetch('/api/linear/tasks', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Linear tasks unavailable');
    return res.json();
};

export const fetchNotionPages = async (): Promise<NotionPage[]> => {
    const res = await fetch('/api/notion/pages', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Notion pages unavailable');
    return res.json();
};

export const fetchOrgMatrix = async (): Promise<OrgMatrixRow[]> => {
    const res = await fetch('/api/org/matrix', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Org matrix unavailable');
    return res.json();
};

export interface SsoStartResponse {
    url: string;
    state: string;
    callbackUrl: string;
}

export const startSso = async (provider: string): Promise<SsoStartResponse> => {
    const res = await fetch(`/api/sso/start?provider=${encodeURIComponent(provider)}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('SSO start failed');
    return res.json();
};
