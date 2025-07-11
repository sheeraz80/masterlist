import { NextRequest, NextResponse } from 'next/server';
import { enhancedRepositoryService } from '@/lib/services/enhanced-repository-service';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';
import { z } from 'zod';

const linkRepositorySchema = z.object({
  projectId: z.string().min(1),
  githubUrl: z.string().url()
});

// Link existing GitHub repository to project
export const POST = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const body = await request.json();
      const validation = linkRepositorySchema.safeParse(body);
      
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors[0].message },
          { status: 400 }
        );
      }
      
      const { projectId, githubUrl } = validation.data;
      
      // Validate GitHub URL format
      const githubUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/;
      if (!githubUrlPattern.test(githubUrl)) {
        return NextResponse.json(
          { error: 'Invalid GitHub URL format' },
          { status: 400 }
        );
      }

      // Check if project exists
      const { prisma } = await import('@/lib/prisma');
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      // Check if repository already exists for this project
      const existingRepo = await prisma.repository.findUnique({
        where: { projectId }
      });

      if (existingRepo) {
        return NextResponse.json(
          { error: 'Repository already linked to this project' },
          { status: 409 }
        );
      }

      // Use enhanced repository service to link existing repository
      const result = await enhancedRepositoryService.linkExistingRepository(projectId, githubUrl);
      
      if (!result.success) {
        const githubStatus = await enhancedRepositoryService.getGitHubStatus();
        return NextResponse.json({
          error: result.error,
          mode: result.mode,
          githubStatus,
          setupInstructions: githubStatus.isConfigured ? null : enhancedRepositoryService.getSetupInstructions()
        }, { status: 400 });
      }
      
      // Create activity record
      await prisma.activity.create({
        data: {
          projectId,
          userId: user?.id || 'anonymous',
          type: 'repository_linked',
          description: `Linked existing GitHub repository: ${githubUrl}`,
          metadata: JSON.stringify({
            repositoryId: result.repository!.id,
            githubUrl: result.githubUrl,
            mode: result.mode
          })
        }
      });
      
      return NextResponse.json({
        repository: result.repository,
        githubUrl: result.githubUrl,
        mode: result.mode,
        message: 'Repository linked successfully'
      }, { status: 201 });
    } catch (error) {
      console.error('Error linking repository:', error);
      return NextResponse.json(
        { error: 'Failed to link repository' },
        { status: 500 }
      );
    }
  }),
  rateLimits.write
);