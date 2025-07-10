import { NextRequest, NextResponse } from 'next/server';
import { DeploymentService } from '@/lib/services/deployment-service';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

const deploymentService = new DeploymentService();

// Get deployment statistics
export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const stats = await deploymentService.getDeploymentStats();
      
      return NextResponse.json(stats);
    } catch (error) {
      console.error('Error getting deployment stats:', error);
      return NextResponse.json(
        { error: 'Failed to get deployment statistics' },
        { status: 500 }
      );
    }
  }),
  rateLimits.read
);