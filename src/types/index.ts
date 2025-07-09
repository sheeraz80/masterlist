export interface Project {
  id: string;
  title: string;
  problem: string;
  solution: string;
  category: string;
  target_users: string;
  revenue_model: string;
  revenue_potential: {
    conservative: number;
    realistic: number;
    optimistic: number;
  };
  development_time: string;
  competition_level: string;
  technical_complexity: number;
  quality_score: number;
  key_features: string[];
  tags?: string[];
}

export interface Stats {
  total_projects: number;
  categories: Record<string, number>;
  unique_categories?: number;
  tags?: Record<string, number>;
  unique_tags?: number;
  quality_distribution: Record<string, number>;
  average_quality: number;
  total_revenue_potential: number;
}

export interface SearchFilters {
  category?: string;
  platform?: string;
  min_quality?: number;
  max_quality?: number;
  tags?: string[];
  competition_level?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: User[];
  projects: Project[];
  created_at: string;
}

export interface Collaboration {
  id: string;
  project_id: string;
  user_id: string;
  type: 'feedback' | 'rating' | 'comment';
  content: string;
  rating?: number;
  created_at: string;
}

export interface Report {
  id: string;
  title: string;
  type: 'executive' | 'quality' | 'trends' | 'custom';
  format: 'json' | 'csv' | 'pdf' | 'markdown';
  data: Record<string, unknown>;
  generated_at: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  projects: string[];
  generated_at: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    page: number;
    total_pages: number;
    has_more: boolean;
    has_previous: boolean;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'moderator';
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithOwner extends Project {
  owner: Pick<AuthUser, 'id' | 'name' | 'email' | 'avatar'>;
  comments_count: number;
  activities_count: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface DatabaseProject {
  id: string;
  title: string;
  problem: string;
  solution: string;
  category: string;
  targetUsers: string | null;
  revenueModel: string | null;
  revenuePotential: string; // JSON string
  developmentTime: string | null;
  competitionLevel: string | null;
  technicalComplexity: number | null;
  qualityScore: number | null;
  keyFeatures: string; // JSON string
  tags: string; // JSON string
  priority: string;
  progress: number;
  status: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  owner?: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  _count?: {
    comments: number;
    activities: number;
  };
}

export interface SystemInfo {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  database: {
    connected: boolean;
    responseTime: number;
  };
  services: Array<{
    name: string;
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
  }>;
}