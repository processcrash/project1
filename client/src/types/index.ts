export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  repoUrl?: string;
  language?: string;
  apiKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface CodeIssue {
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'bug' | 'security' | 'performance' | 'style' | 'best-practice';
  message: string;
  suggestion?: string;
  code?: string;
}

export interface ReviewResult {
  score: number;
  summary: string;
  issues: CodeIssue[];
  stats: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  analyzedAt: string;
}

export interface Review {
  id: string;
  projectId: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  language?: string;
  result?: ReviewResult;
  createdAt: string;
  completedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}