import { NextRequest, NextResponse } from 'next/server';
import { DeploymentService } from '@/lib/services/deployment-service';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

const deploymentService = new DeploymentService();

// Get deployment details
export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null, { params }: { params: { id: string } }) => {
    try {
      const deployment = await deploymentService.getDeployment(params.id);
      
      if (!deployment) {
        return NextResponse.json(
          { error: 'Deployment not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(deployment);
    } catch (error) {
      console.error('Error getting deployment:', error);
      return NextResponse.json(
        { error: 'Failed to get deployment' },
        { status: 500 }
      );
    }
  }),
  rateLimits.read
);

// Update deployment (sync)
export const PATCH = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null, { params }: { params: { id: string } }) => {
    try {
      const body = await request.json();
      const { force, updateMetrics, fetchLogs, checkHealth } = body;

      await deploymentService.syncDeployment(params.id, {
        force,
        updateMetrics,
        fetchLogs,
        checkHealth
      });

      const deployment = await deploymentService.getDeployment(params.id);

      return NextResponse.json({
        success: true,
        deployment
      });
    } catch (error) {
      console.error('Error syncing deployment:', error);
      return NextResponse.json(
        { error: 'Failed to sync deployment' },
        { status: 500 }
      );
    }
  }),
  rateLimits.write
);

// Delete deployment
export const DELETE = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null, { params }: { params: { id: string } }) => {
    try {
      const { prisma } = await import('@/lib/prisma');
      
      // Soft delete by marking as inactive
      await prisma.deployment.update({
        where: { id: params.id },
        data: { isActive: false }
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting deployment:', error);
      return NextResponse.json(
        { error: 'Failed to delete deployment' },
        { status: 500 }
      );
    }
  }),
  rateLimits.write
);