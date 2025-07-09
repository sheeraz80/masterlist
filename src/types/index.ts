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
  data: any;
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