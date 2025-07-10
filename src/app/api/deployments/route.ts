import { NextRequest, NextResponse } from 'next/server';
import { DeploymentService } from '@/lib/services/deployment-service';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';
import { DeploymentPlatform } from '@prisma/client';

const deploymentService = new DeploymentService();

// List deployments
export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const url = new URL(request.url);
      const projectId = url.searchParams.get('projectId');
      const platform = url.searchParams.get('platform') as DeploymentPlatform | null;
      const status = url.searchParams.get('status');
      const environment = url.searchParams.get('environment');

      const response = await deploymentService.listDeployments({
        projectId: projectId || undefined,
        platform: platform || undefined,
        status: status as any || undefined,
        environmentName: environment || undefined
      });

      return NextResponse.json(response);
    } catch (error) {
      console.error('Error listing deployments:', error);
      return NextResponse.json(
        { error: 'Failed to list deployments' },
        { status: 500 }
      );
    }
  }),
  rateLimits.read
);

// Create deployment
export const POST = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const body = await request.json();
      const {
        projectId,
        platform,
        repositoryId,
        environmentName,
        branch,
        buildCommand,
        installCommand,
        outputDirectory,
        envVars
      } = body;

      if (!projectId || !platform) {
        return NextResponse.json(
          { error: 'Project ID and platform are required' },
          { status: 400 }
        );
      }

      const deployment = await deploymentService.createDeployment({
        projectId,
        platform,
        repositoryId,
        environmentName,
        branch,
        buildCommand,
        installCommand,
        outputDirectory,
        envVars
      });

      return NextResponse.json(deployment, { status: 201 });
    } catch (error) {
      console.error('Error creating deployment:', error);
      return NextResponse.json(
        { error: 'Failed to create deployment' },
        { status: 500 }
      );
    }
  }),
  rateLimits.write
);