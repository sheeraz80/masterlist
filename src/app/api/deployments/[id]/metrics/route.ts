import { NextRequest, NextResponse } from 'next/server';
import { DeploymentService } from '@/lib/services/deployment-service';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

const deploymentService = new DeploymentService();

// Get deployment metrics
export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null, { params }: { params: { id: string } }) => {
    try {
      const metrics = await deploymentService.getDeploymentMetrics(params.id);
      
      if (!metrics) {
        return NextResponse.json(
          { error: 'Metrics not available' },
          { status: 404 }
        );
      }

      return NextResponse.json(metrics);
    } catch (error) {
      console.error('Error getting deployment metrics:', error);
      return NextResponse.json(
        { error: 'Failed to get deployment metrics' },
        { status: 500 }
      );
    }
  }),
  rateLimits.read
);