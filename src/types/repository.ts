import { Repository, CodeAnalysis, RepositoryTag, RepositoryTemplate, GitHubWebhook, RepoStatus, AnalysisType, TagType } from '@prisma/client';

// Enhanced Repository type with relations
export interface RepositoryWithDetails extends Repository {
  project: {
    id: string;
    title: string;
    category: string;
    status: string;
  };
  codeAnalyses: CodeAnalysis[];
  repositoryTags: RepositoryTag[];
  webhooks: GitHubWebhook[];
}

// GitHub API types
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  private: boolean;
  language: string | null;
  size: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
  };
  protected: boolean;
}

// Repository creation options
export interface CreateRepositoryOptions {
  projectId: string;
  templateName?: string;
  repoName?: string;
  description?: string;
  isPrivate?: boolean;
  includeGitignore?: boolean;
  includeLicense?: boolean;
  licenseType?: string;
}

// Repository organization
export interface RepositoryPath {
  category: string;
  subcategory?: string;
  projectName: string;
  fullPath: string;
}

// Code analysis results
export interface CodeMetrics {
  linesOfCode: number;
  fileCount: number;
  directoryCount: number;
  complexity: number;
  testCoverage?: number;
  codeQuality: number;
  maintainabilityIndex: number;
}

export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  file?: string;
  line?: number;
  solution?: string;
}

export interface DependencyIssue {
  name: string;
  currentVersion: string;
  latestVersion: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'outdated' | 'vulnerable' | 'license';
  description: string;
  solution?: string;
}

// Repository synchronization
export interface SyncOptions {
  force?: boolean;
  analyzeCode?: boolean;
  updateMetrics?: boolean;
  pullLatest?: boolean;
}

export interface SyncResult {
  success: boolean;
  changes: string[];
  errors: string[];
  metrics?: CodeMetrics;
  duration: number;
}

// Repository templates
export interface TemplateVariable {
  name: string;
  description: string;
  type: 'string' | 'boolean' | 'array';
  required: boolean;
  default?: any;
}

export interface TemplateSetupStep {
  name: string;
  description: string;
  command?: string;
  files?: string[];
  variables?: string[];
}

// Hierarchical organization
export interface CategoryStructure {
  name: string;
  subcategories: SubcategoryStructure[];
  repositoryCount: number;
  templates: string[];
}

export interface SubcategoryStructure {
  name: string;
  repositoryCount: number;
  repositories: RepositoryInfo[];
}

export interface RepositoryInfo {
  id: string;
  name: string;
  path: string;
  status: RepoStatus;
  healthScore?: number;
  lastActivity: string;
}

// API responses
export interface RepositoryListResponse {
  repositories: RepositoryWithDetails[];
  total: number;
  categories: CategoryStructure[];
}

export interface RepositoryStatsResponse {
  totalRepositories: number;
  activeRepositories: number;
  needsSetup: number;
  healthyRepositories: number;
  averageHealthScore: number;
  languageDistribution: Record<string, number>;
  frameworkDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
}

// Webhook types
export interface GitHubWebhookPayload {
  action: string;
  repository: GitHubRepository;
  commits?: GitHubCommit[];
  head_commit?: GitHubCommit;
  ref?: string;
  before?: string;
  after?: string;
  sender: {
    login: string;
    avatar_url: string;
  };
}

// Export the Prisma types as well
export type {
  Repository,
  CodeAnalysis,
  RepositoryTag,
  RepositoryTemplate,
  GitHubWebhook,
  RepoStatus,
  AnalysisType,
  TagType
};