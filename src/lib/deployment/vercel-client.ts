import { DeploymentPlatform } from '@prisma/client';
import { BasePlatformClient } from './base-client';
import type {
  PlatformDeployment,
  DeploymentMetrics,
  PlatformConnectionStatus,
  CreateDeploymentOptions,
  VercelDeployment,
  VercelProject
} from '@/types/deployment';

export class VercelClient extends BasePlatformClient {
  private teamId?: string;

  constructor(apiKey?: string, teamId?: string) {
    super(DeploymentPlatform.VERCEL, apiKey);
    this.teamId = teamId;
  }

  getBaseUrl(): string {
    return 'https://api.vercel.com';
  }

  protected getAuthHeader(): string {
    return `Bearer ${this.apiKey}`;
  }

  async validateConnection(): Promise<PlatformConnectionStatus> {
    try {
      const user = await this.makeRequest<{ user: { username: string } }>('/v2/user');
      
      return {
        platform: this.platform,
        connected: true,
        lastChecked: new Date(),
        capabilities: {
          deployments: true,
          metrics: true,
          logs: true,
          domains: true,
          environment: true,
        },
      };
    } catch (error) {
      return {
        platform: this.platform,
        connected: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  async listDeployments(projectId: string): Promise<PlatformDeployment[]> {
    const params = new URLSearchParams({
      projectId,
      limit: '100',
    });

    if (this.teamId) {
      params.append('teamId', this.teamId);
    }

    const response = await this.makeRequest<{ deployments: VercelDeployment[] }>(
      `/v6/deployments?${params}`
    );

    return response.deployments.map(this.transformDeployment);
  }

  async getDeployment(deploymentId: string): Promise<PlatformDeployment | null> {
    try {
      const params = this.teamId ? `?teamId=${this.teamId}` : '';
      const deployment = await this.makeRequest<VercelDeployment>(
        `/v13/deployments/${deploymentId}${params}`
      );

      return this.transformDeployment(deployment);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async createDeployment(options: CreateDeploymentOptions): Promise<PlatformDeployment> {
    // First, ensure project exists
    const project = await this.ensureProject(options.projectId);

    // Create deployment
    const body = {
      name: project.name,
      project: project.id,
      target: options.environmentName || 'production',
      gitSource: options.repositoryId ? {
        ref: options.branch || 'main',
        repoId: options.repositoryId,
      } : undefined,
      buildEnv: options.envVars,
      functions: {},
      routes: [],
    };

    const params = this.teamId ? `?teamId=${this.teamId}` : '';
    const deployment = await this.makeRequest<VercelDeployment>(
      `/v13/deployments${params}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );

    return this.transformDeployment(deployment);
  }

  async cancelDeployment(deploymentId: string): Promise<void> {
    const params = this.teamId ? `?teamId=${this.teamId}` : '';
    await this.makeRequest(
      `/v12/deployments/${deploymentId}/cancel${params}`,
      { method: 'PATCH' }
    );
  }

  async getBuildLogs(deploymentId: string): Promise<string[]> {
    const params = this.teamId ? `&teamId=${this.teamId}` : '';
    const response = await this.makeRequest<Array<{ text: string }>>(
      `/v2/deployments/${deploymentId}/events?type=build-logs${params}`
    );

    return response.map(log => log.text);
  }

  async getDeploymentLogs(deploymentId: string, type: 'build' | 'runtime' = 'runtime'): Promise<string[]> {
    const params = this.teamId ? `&teamId=${this.teamId}` : '';
    const logType = type === 'build' ? 'build-logs' : 'lambda-logs';
    
    const response = await this.makeRequest<Array<{ text: string }>>(
      `/v2/deployments/${deploymentId}/events?type=${logType}${params}`
    );

    return response.map(log => log.text);
  }

  async getMetrics(deploymentId: string): Promise<DeploymentMetrics | null> {
    // Vercel doesn't provide detailed metrics via API for individual deployments
    // We'll need to aggregate from project analytics
    const deployment = await this.getDeployment(deploymentId);
    if (!deployment) return null;

    // Mock metrics for now - in production, integrate with Vercel Analytics API
    return {
      deploymentId,
      timestamp: new Date(),
      performance: {
        responseTime: 150 + Math.random() * 100,
        uptime: 99.5 + Math.random() * 0.5,
        errorRate: Math.random() * 2,
        requestsPerSecond: Math.floor(Math.random() * 1000),
      },
      resources: {
        bandwidth: Math.floor(Math.random() * 1024 * 1024 * 100),
        storage: Math.floor(Math.random() * 1024 * 1024 * 50),
        executions: Math.floor(Math.random() * 10000),
      },
      build: {
        duration: deployment.metrics?.buildTime || 0,
        size: Math.floor(Math.random() * 1024 * 1024 * 10),
        cached: Math.random() > 0.5,
      },
    };
  }

  async getHealth(deploymentId: string): Promise<'healthy' | 'degraded' | 'unhealthy'> {
    const deployment = await this.getDeployment(deploymentId);
    if (!deployment) return 'unhealthy';

    switch (deployment.status) {
      case 'ready':
        return 'healthy';
      case 'error':
        return 'unhealthy';
      default:
        return 'degraded';
    }
  }

  async getDomains(deploymentId: string): Promise<string[]> {
    const deployment = await this.makeRequest<VercelDeployment>(
      `/v13/deployments/${deploymentId}${this.teamId ? `?teamId=${this.teamId}` : ''}`
    );

    return deployment.aliases || [];
  }

  async addDomain(deploymentId: string, domain: string): Promise<void> {
    const params = this.teamId ? `?teamId=${this.teamId}` : '';
    await this.makeRequest(
      `/v10/deployments/${deploymentId}/aliases${params}`,
      {
        method: 'POST',
        body: JSON.stringify({ alias: domain }),
      }
    );
  }

  async removeDomain(deploymentId: string, domain: string): Promise<void> {
    const params = this.teamId ? `?teamId=${this.teamId}` : '';
    await this.makeRequest(
      `/v2/aliases/${domain}${params}`,
      { method: 'DELETE' }
    );
  }

  async getEnvironmentVariables(deploymentId: string): Promise<Record<string, string>> {
    // Get project ID from deployment
    const deployment = await this.makeRequest<VercelDeployment>(
      `/v13/deployments/${deploymentId}${this.teamId ? `?teamId=${this.teamId}` : ''}`
    );

    const projectId = deployment.meta?.projectId;
    if (!projectId) return {};

    // Get env vars from project
    const params = this.teamId ? `?teamId=${this.teamId}` : '';
    const response = await this.makeRequest<{ envs: Array<{ key: string; value: string }> }>(
      `/v8/projects/${projectId}/env${params}`
    );

    return response.envs.reduce((acc, env) => {
      acc[env.key] = env.value;
      return acc;
    }, {} as Record<string, string>);
  }

  async setEnvironmentVariables(deploymentId: string, vars: Record<string, string>): Promise<void> {
    // Get project ID from deployment
    const deployment = await this.makeRequest<VercelDeployment>(
      `/v13/deployments/${deploymentId}${this.teamId ? `?teamId=${this.teamId}` : ''}`
    );

    const projectId = deployment.meta?.projectId;
    if (!projectId) throw new Error('Project ID not found');

    // Set env vars on project
    const params = this.teamId ? `?teamId=${this.teamId}` : '';
    
    for (const [key, value] of Object.entries(vars)) {
      await this.makeRequest(
        `/v10/projects/${projectId}/env${params}`,
        {
          method: 'POST',
          body: JSON.stringify({
            key,
            value,
            type: 'encrypted',
            target: ['production', 'preview', 'development'],
          }),
        }
      );
    }
  }

  // Helper methods
  private async ensureProject(projectId: string): Promise<VercelProject> {
    const params = this.teamId ? `?teamId=${this.teamId}` : '';
    
    try {
      // Try to get existing project
      return await this.makeRequest<VercelProject>(`/v9/projects/${projectId}${params}`);
    } catch (error) {
      // Create new project if not exists
      const body = {
        name: projectId,
        framework: 'nextjs',
      };

      return await this.makeRequest<VercelProject>(
        `/v10/projects${params}`,
        {
          method: 'POST',
          body: JSON.stringify(body),
        }
      );
    }
  }

  private transformDeployment(deployment: VercelDeployment): PlatformDeployment {
    return {
      id: deployment.uid,
      name: deployment.name,
      url: `https://${deployment.url}`,
      status: this.normalizeVercelStatus(deployment.state),
      environment: deployment.target || 'production',
      createdAt: new Date(deployment.created),
      updatedAt: new Date(deployment.ready || deployment.created),
      domains: deployment.aliases || [],
      buildSettings: {
        framework: deployment.meta?.framework,
        buildCommand: deployment.meta?.buildCommand,
        outputDirectory: deployment.meta?.outputDirectory,
        installCommand: deployment.meta?.installCommand,
      },
      metrics: {
        buildTime: deployment.buildingAt && deployment.ready
          ? Math.floor((deployment.ready - deployment.buildingAt) / 1000)
          : undefined,
      },
    };
  }

  private normalizeVercelStatus(state: string): string {
    switch (state) {
      case 'BUILDING':
        return 'building';
      case 'READY':
        return 'ready';
      case 'ERROR':
        return 'error';
      case 'CANCELED':
        return 'cancelled';
      default:
        return 'unknown';
    }
  }
}