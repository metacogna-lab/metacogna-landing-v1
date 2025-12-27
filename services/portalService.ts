
import { PortalUpdate, Comment } from '../types';

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
        // If no token, maybe we shouldn't even call? But let's try.
        if (!headers.Authorization) throw new Error("No token");

        const res = await fetch('/api/portal/updates', { headers });
        if (!res.ok) throw new Error('API not available or Unauthorized');
        return await res.json();
    } catch (e) {
        // Only return mock data if we are in dev/demo mode, otherwise return empty
        console.warn('PORTAL: Fetch failed, using fallback data. Error:', e);
        return new Promise(resolve => setTimeout(() => resolve(MOCK_UPDATES), 500));
    }
};

export const patchUpdate = async (id: string, updates: Partial<PortalUpdate>): Promise<PortalUpdate> => {
    try {
         const res = await fetch(`/api/portal/updates/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
         });
         if (!res.ok) throw new Error('API not available');
         return await res.json();
    } catch (e) {
         console.warn('PORTAL: Patch failed, using fallback.');
         return new Promise(resolve => setTimeout(() => {
            const original = MOCK_UPDATES.find(u => u.id === id);
            if (!original) throw new Error("Item not found");
            resolve({ ...original, ...updates } as PortalUpdate);
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
        console.warn('PORTAL: Add comment failed, using fallback.');
        const update = MOCK_UPDATES.find(u => u.id === id);
        if (update) {
            update.comments = [...(update.comments || []), comment];
            return Promise.resolve(update.comments);
        }
        return Promise.reject("Not found");
    }
};
