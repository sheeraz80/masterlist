import {
  Deployment,
  DeploymentLog,
  DeploymentEnv,
  BuildLog,
  Incident,
  PlatformCredential,
  DeploymentTemplate,
  DeploymentPlatform,
  DeploymentStatus,
  DeploymentHealth,
  LogType,
  LogLevel,
  BuildStatus,
  IncidentSeverity,
  IncidentStatus
} from '@prisma/client';

// Enhanced Deployment type with relations
export interface DeploymentWithDetails extends Deployment {
  project: {
    id: string;
    title: string;
    category: string;
    status: string;
  };
  repository?: {
    id: string;
    githubUrl: string | null;
    githubName: string | null;
    githubOwner: string | null;
  } | null;
  deploymentLogs: DeploymentLog[];
  buildLogs: BuildLog[];
  incidents: Incident[];
}

// Platform-specific deployment info
export interface PlatformDeployment {
  id: string;
  name: string;
  url: string;
  status: string;
  environment: string;
  createdAt: Date;
  updatedAt: Date;
  domains: string[];
  buildSettings?: {
    framework?: string;
    buildCommand?: string;
    outputDirectory?: string;
    installCommand?: string;
  };
  metrics?: {
    buildTime?: number;
    responseTime?: number;
    uptime?: number;
    errorRate?: number;
  };
}

// Vercel specific types
export interface VercelDeployment {
  uid: string;
  name: string;
  url: string;
  state: 'BUILDING' | 'READY' | 'ERROR' | 'CANCELED';
  type: 'LAMBDAS' | 'STATIC';
  creator: {
    uid: string;
    username: string;
  };
  created: number;
  buildingAt?: number;
  ready?: number;
  meta?: Record<string, any>;
  target?: 'production' | 'staging' | 'development';
  aliasAssigned?: boolean;
  aliases?: string[];
}

export interface VercelProject {
  id: string;
  name: string;
  accountId: string;
  framework?: string;
  devCommand?: string;
  buildCommand?: string;
  outputDirectory?: string;
  rootDirectory?: string;
  directoryListing: boolean;
  nodeVersion?: string;
}

// Netlify specific types
export interface NetlifyDeployment {
  id: string;
  site_id: string;
  build_id: string;
  state: 'building' | 'ready' | 'error' | 'new';
  name: string;
  url: string;
  ssl_url: string;
  admin_url: string;
  deploy_url: string;
  deploy_ssl_url: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  title?: string;
  branch?: string;
  commit_ref?: string;
  commit_url?: string;
  context: 'production' | 'deploy-preview' | 'branch-deploy';
  locked?: boolean;
  error_message?: string;
  framework?: string;
  function_schedules?: any[];
}

export interface NetlifySite {
  id: string;
  site_id: string;
  plan: string;
  ssl_plan?: string;
  premium: boolean;
  claimed: boolean;
  name: string;
  custom_domain?: string;
  domain_aliases: string[];
  password?: string;
  notification_email?: string;
  url: string;
  ssl_url: string;
  admin_url: string;
  screenshot_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  session_id?: string;
  ssl: boolean;
  force_ssl?: boolean;
  managed_dns: boolean;
  deploy_url: string;
  account_name: string;
  account_slug: string;
  git_provider?: string;
  deploy_hook?: string;
  capabilities: Record<string, any>;
  id_domain: string;
}

// AWS Amplify specific types
export interface AmplifyApp {
  appId: string;
  appArn: string;
  name: string;
  description?: string;
  repository?: string;
  platform: 'WEB' | 'REACT_NATIVE';
  createTime: Date;
  updateTime: Date;
  environmentVariables?: Record<string, string>;
  defaultDomain: string;
  enableBranchAutoBuild: boolean;
  enableBranchAutoDeletion?: boolean;
  enableBasicAuth?: boolean;
  customRules?: Array<{
    source: string;
    target: string;
    status?: string;
    condition?: string;
  }>;
  productionBranch?: {
    lastDeployTime?: Date;
    status?: string;
    thumbnailUrl?: string;
    branchName?: string;
  };
  buildSpec?: string;
  enableAutoBranchCreation?: boolean;
}

export interface AmplifyDeployment {
  jobSummary: {
    jobArn: string;
    jobId: string;
    commitId: string;
    commitMessage: string;
    commitTime: Date;
    startTime: Date;
    status: 'PENDING' | 'PROVISIONING' | 'RUNNING' | 'FAILED' | 'SUCCEED' | 'CANCELLING' | 'CANCELLED';
    endTime?: Date;
    jobType: 'RELEASE' | 'RETRY' | 'MANUAL' | 'WEB_HOOK';
  };
  steps?: Array<{
    stepName: string;
    startTime: Date;
    status: string;
    endTime?: Date;
    logUrl?: string;
    artifactsUrl?: string;
    screenshots?: Record<string, string>;
  }>;
}

// Deployment creation options
export interface CreateDeploymentOptions {
  projectId: string;
  platform: DeploymentPlatform;
  repositoryId?: string;
  environmentName?: string;
  branch?: string;
  buildCommand?: string;
  installCommand?: string;
  outputDirectory?: string;
  envVars?: Record<string, string>;
}

// Deployment sync options
export interface DeploymentSyncOptions {
  force?: boolean;
  updateMetrics?: boolean;
  fetchLogs?: boolean;
  checkHealth?: boolean;
}

// Deployment metrics
export interface DeploymentMetrics {
  deploymentId: string;
  timestamp: Date;
  performance: {
    responseTime: number; // ms
    uptime: number; // percentage
    errorRate: number; // percentage
    requestsPerSecond?: number;
  };
  resources: {
    bandwidth: number; // bytes
    storage: number; // bytes
    executions?: number; // for serverless
    cpuUsage?: number; // percentage
    memoryUsage?: number; // percentage
  };
  build: {
    duration: number; // seconds
    size: number; // bytes
    cached: boolean;
  };
}

// Platform connection status
export interface PlatformConnectionStatus {
  platform: DeploymentPlatform;
  connected: boolean;
  lastChecked: Date;
  error?: string;
  capabilities?: {
    deployments: boolean;
    metrics: boolean;
    logs: boolean;
    domains: boolean;
    environment: boolean;
  };
}

// Deployment event for real-time updates
export interface DeploymentEvent {
  type: 'deployment' | 'build' | 'health' | 'incident';
  deploymentId: string;
  timestamp: Date;
  data: {
    status?: DeploymentStatus;
    health?: DeploymentHealth;
    message?: string;
    details?: any;
  };
}

// API responses
export interface DeploymentListResponse {
  deployments: DeploymentWithDetails[];
  total: number;
  platforms: Record<DeploymentPlatform, number>;
  healthSummary: {
    healthy: number;
    degraded: number;
    unhealthy: number;
    unknown: number;
  };
}

export interface DeploymentStatsResponse {
  totalDeployments: number;
  activeDeployments: number;
  platformDistribution: Record<DeploymentPlatform, number>;
  environmentDistribution: Record<string, number>;
  healthMetrics: {
    averageUptime: number;
    averageResponseTime: number;
    totalIncidents: number;
    resolvedIncidents: number;
  };
  deploymentTrends: Array<{
    date: string;
    deployments: number;
    successes: number;
    failures: number;
  }>;
}

// Export Prisma types
export type {
  Deployment,
  DeploymentLog,
  DeploymentEnv,
  BuildLog,
  Incident,
  PlatformCredential,
  DeploymentTemplate,
  DeploymentPlatform,
  DeploymentStatus,
  DeploymentHealth,
  LogType,
  LogLevel,
  BuildStatus,
  IncidentSeverity,
  IncidentStatus
};