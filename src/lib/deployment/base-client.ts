import { DeploymentPlatform } from '@prisma/client';
import type {
  PlatformDeployment,
  DeploymentMetrics,
  PlatformConnectionStatus,
  CreateDeploymentOptions
} from '@/types/deployment';

export abstract class BasePlatformClient {
  protected platform: DeploymentPlatform;
  protected apiKey?: string;
  protected baseUrl: string;

  constructor(platform: DeploymentPlatform, apiKey?: string) {
    this.platform = platform;
    this.apiKey = apiKey;
    this.baseUrl = this.getBaseUrl();
  }

  abstract getBaseUrl(): string;

  // Connection and authentication
  abstract validateConnection(): Promise<PlatformConnectionStatus>;
  abstract refreshToken?(): Promise<void>;

  // Deployment operations
  abstract listDeployments(projectId: string): Promise<PlatformDeployment[]>;
  abstract getDeployment(deploymentId: string): Promise<PlatformDeployment | null>;
  abstract createDeployment(options: CreateDeploymentOptions): Promise<PlatformDeployment>;
  abstract cancelDeployment(deploymentId: string): Promise<void>;
  abstract deleteDeployment?(deploymentId: string): Promise<void>;

  // Build and logs
  abstract getBuildLogs(deploymentId: string): Promise<string[]>;
  abstract getDeploymentLogs(deploymentId: string, type?: 'build' | 'runtime'): Promise<string[]>;

  // Metrics and monitoring
  abstract getMetrics(deploymentId: string): Promise<DeploymentMetrics | null>;
  abstract getHealth(deploymentId: string): Promise<'healthy' | 'degraded' | 'unhealthy'>;

  // Domain management
  abstract getDomains(deploymentId: string): Promise<string[]>;
  abstract addDomain?(deploymentId: string, domain: string): Promise<void>;
  abstract removeDomain?(deploymentId: string, domain: string): Promise<void>;

  // Environment variables
  abstract getEnvironmentVariables(deploymentId: string): Promise<Record<string, string>>;
  abstract setEnvironmentVariables?(deploymentId: string, vars: Record<string, string>): Promise<void>;

  // Helper methods
  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = this.getAuthHeader();
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${this.platform} API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  protected abstract getAuthHeader(): string;

  // Utility methods
  protected normalizeStatus(platformStatus: string): 'building' | 'ready' | 'error' | 'cancelled' {
    // To be implemented by each platform client
    return 'ready';
  }

  protected normalizeEnvironment(platformEnv?: string): string {
    // To be implemented by each platform client
    return platformEnv || 'production';
  }
}