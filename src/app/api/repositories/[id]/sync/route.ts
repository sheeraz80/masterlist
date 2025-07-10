import { NextRequest, NextResponse } from 'next/server';
import { RepositoryService } from '@/lib/services/repository-service';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

// Sync repository with GitHub
export const POST = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: repositoryId } = await params;
      const body = await request.json();
      const { 
        force = false, 
        analyzeCode = true, 
        updateMetrics = true, 
        pullLatest = false 
      } = body;

      const repositoryService = new RepositoryService();
      const result = await repositoryService.syncRepository(repositoryId, {
        force,
        analyzeCode,
        updateMetrics,
        pullLatest
      });

      return NextResponse.json(result);
    } catch (error) {
      console.error('Error syncing repository:', error);
      return NextResponse.json(
        { error: 'Failed to sync repository' },
        { status: 500 }
      );
    }
  }),
  rateLimits.write
);