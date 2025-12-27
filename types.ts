
export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'beta' | 'concept';
  tags: string[];
  link?: string;
  githubUrl?: string;
  webUrl?: string;
}

export interface ArchitecturePrompt {
  description: string;
  styleGuidance: string;
}

export type UpdateType = 'progress' | 'decision' | 'risk' | 'note';
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export type Visibility = 'client' | 'associate' | 'both';
export type UserRole = 'client' | 'associate' | 'admin';

export interface Comment {
    id: string;
    author: string;
    text: string;
    timestamp: string;
}

export interface PortalUpdate {
  id: string;
  title: string;
  content: string;
  date: string; // ISO Date string
  updatedAt?: string; // ISO Timestamp for "what changed"
  type: UpdateType;
  confidence: ConfidenceLevel;
  visibility: Visibility;
  priority: 'low' | 'medium' | 'high' | 'critical';
  author: string;
  tags?: string[];
  comments?: Comment[];
}
