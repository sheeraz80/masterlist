import { NextRequest, NextResponse } from 'next/server';
import { aiDevelopmentService } from '@/lib/services/ai-development-service';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { requireAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

export const POST = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      const body = await request.json();
      const { projectIds, taskType, description, aiProvider, autoCommit, autoPR } = body;

      if (!projectIds || !taskType || !description) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Execute AI tasks
      const results = await aiDevelopmentService.batchExecuteAITasks(
        projectIds,
        {
          taskType,
          description,
          aiProvider: aiProvider || 'claude',
          autoCommit: autoCommit ?? true,
          autoPR: autoPR ?? true
        }
      );

      // Convert Map to object for JSON response
      const resultsObject = Object.fromEntries(results);

      return NextResponse.json({
        success: true,
        results: resultsObject,
        summary: {
          total: projectIds.length,
          successful: Object.values(resultsObject).filter(r => r.success).length,
          failed: Object.values(resultsObject).filter(r => !r.success).length
        }
      });
    } catch (error) {
      console.error('AI development execution error:', error);
      return NextResponse.json(
        { error: 'Failed to execute AI development task' },
        { status: 500 }
      );
    }
  }),
  rateLimits.write
);