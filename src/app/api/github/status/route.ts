import { NextRequest, NextResponse } from 'next/server';
import { enhancedRepositoryService } from '@/lib/services/enhanced-repository-service';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

// GET - Check GitHub configuration status
export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const { searchParams } = new URL(request.url);
      const includeInstructions = searchParams.get('include_instructions') === 'true';
      
      const githubStatus = await enhancedRepositoryService.getGitHubStatus();
      
      const response: any = {
        githubStatus,
        timestamp: new Date().toISOString()
      };
      
      if (includeInstructions || !githubStatus.isConfigured) {
        response.setupInstructions = enhancedRepositoryService.getSetupInstructions();
      }
      
      return NextResponse.json(response);
    } catch (error) {
      console.error('GitHub status check error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to check GitHub status',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }),
  rateLimits.read
);

// POST - Test GitHub connection
export const POST = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const body = await request.json();
      const { action } = body;
      
      if (action === 'test-connection') {
        const githubStatus = await enhancedRepositoryService.getGitHubStatus();
        
        return NextResponse.json({
          success: githubStatus.isConfigured,
          status: githubStatus,
          message: githubStatus.isConfigured 
            ? 'GitHub connection is working correctly'
            : 'GitHub is not configured properly',
          setupInstructions: githubStatus.isConfigured ? null : enhancedRepositoryService.getSetupInstructions()
        });
      }
      
      return NextResponse.json(
        { error: 'Invalid action. Use action: "test-connection"' },
        { status: 400 }
      );
    } catch (error) {
      console.error('GitHub connection test error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to test GitHub connection',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }),
  rateLimits.write
);