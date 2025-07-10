import { NextRequest, NextResponse } from 'next/server';
import { RepositoryService } from '@/lib/services/repository-service';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

// Link existing GitHub repository to project
export const POST = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const body = await request.json();
      const { projectId, githubUrl } = body;

      if (!projectId || !githubUrl) {
        return NextResponse.json(
          { error: 'Project ID and GitHub URL are required' },
          { status: 400 }
        );
      }

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

      const repositoryService = new RepositoryService();
      const repository = await repositoryService.linkExistingRepository(projectId, githubUrl);

      return NextResponse.json(repository, { status: 201 });
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