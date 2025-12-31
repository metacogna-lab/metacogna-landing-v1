
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

export type GoalStatus = 'on_track' | 'at_risk' | 'blocked' | 'done';

export interface PortalGoal {
  id: string;
  title: string;
  owner: string;
  status: GoalStatus;
  progress: number; // 0 - 1
  dueDate?: string;
  notionUrl?: string;
  linearUrl?: string;
  githubUrl?: string;
  description?: string;
  lastSync?: string;
  projectName?: string;
}

export interface ToolLinkResponse {
  notion?: string;
  linear?: string;
  github?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  source: string;
  url?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  latencyMs: number;
}

export interface StatusService {
  service: string;
  lastSync: string;
  status: 'healthy' | 'delayed' | 'failing';
}

export interface StatusResponse {
  ingestion: StatusService[];
}

export interface LinearTask {
  id: string;
  title: string;
  status: string;
  assignee?: string;
  url?: string;
  dueDate?: string;
}

export interface NotionPage {
  id: string;
  title: string;
  url: string;
  lastEditedTime?: string;
}

export interface OrgMatrixRow {
  member: string;
  role: string;
  team: string;
  project?: string;
}
