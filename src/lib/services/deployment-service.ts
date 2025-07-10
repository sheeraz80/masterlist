import { prisma } from '@/lib/prisma';
import { DeploymentPlatform, DeploymentStatus, DeploymentHealth } from '@prisma/client';
import { VercelClient } from '@/lib/deployment/vercel-client';
import { NetlifyClient } from '@/lib/deployment/netlify-client';
import { BasePlatformClient } from '@/lib/deployment/base-client';
import type {
  CreateDeploymentOptions,
  DeploymentWithDetails,
  DeploymentSyncOptions,
  PlatformConnectionStatus,
  DeploymentListResponse,
  DeploymentStatsResponse,
  DeploymentMetrics,
  DeploymentEvent
} from '@/types/deployment';

export class DeploymentService {
  private clients: Map<DeploymentPlatform, BasePlatformClient>;

  constructor() {
    this.clients = new Map();
    this.initializeClients();
  }

  private async initializeClients() {
    // Get platform credentials from database
    const credentials = await prisma.platformCredential.findMany({
      where: { isActive: true }
    });

    for (const cred of credentials) {
      switch (cred.platform) {
        case DeploymentPlatform.VERCEL:
          this.clients.set(
            DeploymentPlatform.VERCEL,
            new VercelClient(cred.apiKey || undefined, cred.accountId || undefined)
          );
          break;
        case DeploymentPlatform.NETLIFY:
          this.clients.set(
            DeploymentPlatform.NETLIFY,
            new NetlifyClient(cred.apiKey || undefined)
          );
          break;
        // Add more platforms as needed
      }
    }
  }

  // Platform management
  async validatePlatformConnection(platform: DeploymentPlatform): Promise<PlatformConnectionStatus> {
    const client = this.clients.get(platform);
    if (!client) {
      return {
        platform,
        connected: false,
        lastChecked: new Date(),
        error: 'Platform client not configured'
      };
    }

    return client.validateConnection();
  }

  async validateAllConnections(): Promise<PlatformConnectionStatus[]> {
    const platforms = Object.values(DeploymentPlatform);
    const statuses = await Promise.all(
      platforms.map(platform => this.validatePlatformConnection(platform))
    );
    return statuses;
  }

  // Deployment operations
  async createDeployment(options: CreateDeploymentOptions): Promise<DeploymentWithDetails> {
    const client = this.clients.get(options.platform);
    if (!client) {
      throw new Error(`Platform ${options.platform} not configured`);
    }

    // Create deployment on platform
    const platformDeployment = await client.createDeployment(options);

    // Save to database
    const deployment = await prisma.deployment.create({
      data: {
        projectId: options.projectId,
        repositoryId: options.repositoryId,
        platform: options.platform,
        platformId: platformDeployment.id,
        platformUrl: platformDeployment.url,
        environmentName: options.environmentName || 'production',
        branch: options.branch || 'main',
        deploymentUrl: platformDeployment.url,
        status: this.mapPlatformStatus(platformDeployment.status),
        health: DeploymentHealth.UNKNOWN,
        buildCommand: options.buildCommand,
        installCommand: options.installCommand,
        outputDirectory: options.outputDirectory,
        lastDeployedAt: new Date(),
      },
      include: {
        project: {
          select: { id: true, title: true, category: true, status: true }
        },
        repository: {
          select: { id: true, githubUrl: true, githubName: true, githubOwner: true }
        },
        deploymentLogs: true,
        buildLogs: true,
        incidents: true
      }
    });

    // Set environment variables if provided
    if (options.envVars && Object.keys(options.envVars).length > 0) {
      await this.setEnvironmentVariables(deployment.id, options.envVars);
    }

    return deployment;
  }

  async getDeployment(deploymentId: string): Promise<DeploymentWithDetails | null> {
    return prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: {
        project: {
          select: { id: true, title: true, category: true, status: true }
        },
        repository: {
          select: { id: true, githubUrl: true, githubName: true, githubOwner: true }
        },
        deploymentLogs: {
          orderBy: { timestamp: 'desc' },
          take: 100
        },
        buildLogs: {
          orderBy: { startedAt: 'desc' },
          take: 10
        },
        incidents: {
          orderBy: { detectedAt: 'desc' },
          take: 10
        }
      }
    });
  }

  async listDeployments(filters?: {
    projectId?: string;
    platform?: DeploymentPlatform;
    status?: DeploymentStatus;
    environmentName?: string;
  }): Promise<DeploymentListResponse> {
    const where = {
      ...(filters?.projectId && { projectId: filters.projectId }),
      ...(filters?.platform && { platform: filters.platform }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.environmentName && { environmentName: filters.environmentName }),
    };

    const [deployments, total] = await Promise.all([
      prisma.deployment.findMany({
        where,
        include: {
          project: {
            select: { id: true, title: true, category: true, status: true }
          },
          repository: {
            select: { id: true, githubUrl: true, githubName: true, githubOwner: true }
          },
          deploymentLogs: {
            orderBy: { timestamp: 'desc' },
            take: 10
          },
          buildLogs: {
            orderBy: { startedAt: 'desc' },
            take: 1
          },
          incidents: {
            where: { status: { not: 'CLOSED' } }
          }
        },
        orderBy: { lastDeployedAt: 'desc' },
        take: 100
      }),
      prisma.deployment.count({ where })
    ]);

    // Calculate platform distribution
    const platformCounts = await prisma.deployment.groupBy({
      by: ['platform'],
      where,
      _count: { _all: true }
    });

    const platforms = platformCounts.reduce((acc, item) => {
      acc[item.platform] = item._count._all;
      return acc;
    }, {} as Record<DeploymentPlatform, number>);

    // Calculate health summary
    const healthCounts = await prisma.deployment.groupBy({
      by: ['health'],
      where,
      _count: { _all: true }
    });

    const healthSummary = {
      healthy: 0,
      degraded: 0,
      unhealthy: 0,
      unknown: 0
    };

    healthCounts.forEach(item => {
      const key = item.health.toLowerCase() as keyof typeof healthSummary;
      healthSummary[key] = item._count._all;
    });

    return {
      deployments,
      total,
      platforms,
      healthSummary
    };
  }

  async syncDeployment(deploymentId: string, options?: DeploymentSyncOptions): Promise<void> {
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId }
    });

    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const client = this.clients.get(deployment.platform);
    if (!client) {
      throw new Error(`Platform ${deployment.platform} not configured`);
    }

    // Get latest deployment info from platform
    const platformDeployment = await client.getDeployment(deployment.platformId);
    if (!platformDeployment) {
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: {
          status: DeploymentStatus.ERROR,
          health: DeploymentHealth.UNHEALTHY
        }
      });
      return;
    }

    // Update deployment status
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: this.mapPlatformStatus(platformDeployment.status),
        deploymentUrl: platformDeployment.url,
        domain: platformDeployment.domains[0],
        customDomains: platformDeployment.domains.length > 1 ? platformDeployment.domains : undefined,
        lastCheckedAt: new Date()
      }
    });

    // Sync health status
    if (options?.checkHealth) {
      const health = await client.getHealth(deployment.platformId);
      await prisma.deployment.update({
        where: { id: deploymentId },
        data: { health: this.mapHealthStatus(health) }
      });
    }

    // Sync metrics
    if (options?.updateMetrics) {
      const metrics = await client.getMetrics(deployment.platformId);
      if (metrics) {
        await this.updateDeploymentMetrics(deploymentId, metrics);
      }
    }

    // Sync logs
    if (options?.fetchLogs) {
      const logs = await client.getBuildLogs(deployment.platformId);
      await this.saveBuildLogs(deploymentId, logs);
    }
  }

  async syncAllDeployments(): Promise<void> {
    const activeDeployments = await prisma.deployment.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    // Sync in batches to avoid overwhelming the APIs
    const batchSize = 10;
    for (let i = 0; i < activeDeployments.length; i += batchSize) {
      const batch = activeDeployments.slice(i, i + batchSize);
      await Promise.all(
        batch.map(deployment => 
          this.syncDeployment(deployment.id, {
            checkHealth: true,
            updateMetrics: true
          }).catch(error => {
            console.error(`Failed to sync deployment ${deployment.id}:`, error);
          })
        )
      );
    }
  }

  // Environment variables
  async getEnvironmentVariables(deploymentId: string): Promise<Record<string, string>> {
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { deploymentEnvs: true }
    });

    if (!deployment) {
      throw new Error('Deployment not found');
    }

    // Return cached env vars
    return deployment.deploymentEnvs.reduce((acc, env) => {
      acc[env.key] = env.value;
      return acc;
    }, {} as Record<string, string>);
  }

  async setEnvironmentVariables(deploymentId: string, vars: Record<string, string>): Promise<void> {
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId }
    });

    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const client = this.clients.get(deployment.platform);
    if (client?.setEnvironmentVariables) {
      await client.setEnvironmentVariables(deployment.platformId, vars);
    }

    // Save to database
    for (const [key, value] of Object.entries(vars)) {
      await prisma.deploymentEnv.upsert({
        where: {
          deploymentId_key: { deploymentId, key }
        },
        update: { value },
        create: { deploymentId, key, value }
      });
    }
  }

  // Metrics and monitoring
  async getDeploymentMetrics(deploymentId: string): Promise<DeploymentMetrics | null> {
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId }
    });

    if (!deployment) return null;

    const client = this.clients.get(deployment.platform);
    if (!client) return null;

    return client.getMetrics(deployment.platformId);
  }

  async getDeploymentStats(): Promise<DeploymentStatsResponse> {
    const [
      totalDeployments,
      activeDeployments,
      platformCounts,
      environmentCounts,
      incidentStats
    ] = await Promise.all([
      prisma.deployment.count(),
      prisma.deployment.count({ where: { isActive: true } }),
      prisma.deployment.groupBy({
        by: ['platform'],
        _count: { _all: true }
      }),
      prisma.deployment.groupBy({
        by: ['environmentName'],
        _count: { _all: true }
      }),
      prisma.incident.groupBy({
        by: ['status'],
        _count: { _all: true }
      })
    ]);

    // Calculate health metrics
    const healthMetrics = await prisma.deployment.aggregate({
      _avg: {
        uptime: true,
        responseTime: true,
        errorRate: true
      }
    });

    // Get deployment trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deploymentTrends = await prisma.$queryRaw<Array<{
      date: string;
      deployments: number;
      successes: number;
      failures: number;
    }>>`
      SELECT 
        DATE(last_deployed_at) as date,
        COUNT(*) as deployments,
        COUNT(CASE WHEN status = 'READY' THEN 1 END) as successes,
        COUNT(CASE WHEN status = 'ERROR' THEN 1 END) as failures
      FROM "Deployment"
      WHERE last_deployed_at >= ${thirtyDaysAgo}
      GROUP BY DATE(last_deployed_at)
      ORDER BY date DESC
    `;

    return {
      totalDeployments,
      activeDeployments,
      platformDistribution: platformCounts.reduce((acc, item) => {
        acc[item.platform] = item._count._all;
        return acc;
      }, {} as Record<DeploymentPlatform, number>),
      environmentDistribution: environmentCounts.reduce((acc, item) => {
        acc[item.environmentName] = item._count._all;
        return acc;
      }, {} as Record<string, number>),
      healthMetrics: {
        averageUptime: healthMetrics._avg.uptime || 0,
        averageResponseTime: healthMetrics._avg.responseTime || 0,
        totalIncidents: incidentStats.reduce((sum, item) => sum + item._count._all, 0),
        resolvedIncidents: incidentStats.find(i => i.status === 'RESOLVED')?._count._all || 0
      },
      deploymentTrends
    };
  }

  // Incident management
  async createIncident(deploymentId: string, incident: {
    title: string;
    description?: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }): Promise<void> {
    await prisma.incident.create({
      data: {
        deploymentId,
        ...incident
      }
    });

    // Update deployment health
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        health: incident.severity === 'CRITICAL' ? DeploymentHealth.UNHEALTHY : DeploymentHealth.DEGRADED
      }
    });
  }

  // Real-time updates
  async publishDeploymentEvent(event: DeploymentEvent): Promise<void> {
    // This would integrate with your real-time system (WebSockets, SSE, etc.)
    // For now, just log it
    console.log('Deployment event:', event);
  }

  // Helper methods
  private mapPlatformStatus(status: string): DeploymentStatus {
    switch (status.toLowerCase()) {
      case 'building':
        return DeploymentStatus.BUILDING;
      case 'ready':
        return DeploymentStatus.READY;
      case 'error':
        return DeploymentStatus.ERROR;
      case 'cancelled':
        return DeploymentStatus.CANCELLED;
      default:
        return DeploymentStatus.PENDING;
    }
  }

  private mapHealthStatus(health: string): DeploymentHealth {
    switch (health.toLowerCase()) {
      case 'healthy':
        return DeploymentHealth.HEALTHY;
      case 'degraded':
        return DeploymentHealth.DEGRADED;
      case 'unhealthy':
        return DeploymentHealth.UNHEALTHY;
      default:
        return DeploymentHealth.UNKNOWN;
    }
  }

  private async updateDeploymentMetrics(deploymentId: string, metrics: DeploymentMetrics): Promise<void> {
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        buildTime: metrics.build.duration,
        responseTime: metrics.performance.responseTime,
        uptime: metrics.performance.uptime,
        errorRate: metrics.performance.errorRate,
        bandwidth: metrics.resources.bandwidth,
        storage: metrics.resources.storage,
        executions: metrics.resources.executions
      }
    });
  }

  private async saveBuildLogs(deploymentId: string, logs: string[]): Promise<void> {
    const logText = logs.join('\n');
    
    await prisma.buildLog.create({
      data: {
        deploymentId,
        buildId: `build-${Date.now()}`,
        status: 'SUCCEEDED',
        startedAt: new Date(),
        completedAt: new Date(),
        logs: logText
      }
    });
  }
}