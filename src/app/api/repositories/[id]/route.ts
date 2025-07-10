import { NextRequest, NextResponse } from 'next/server';
import { RepositoryService } from '@/lib/services/repository-service';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

// Get single repository
export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: repositoryId } = await params;

      const repositoryService = new RepositoryService();
      const repository = await repositoryService.getRepository(repositoryId);

      if (!repository) {
        return NextResponse.json(
          { error: 'Repository not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(repository);
    } catch (error) {
      console.error('Error fetching repository:', error);
      return NextResponse.json(
        { error: 'Failed to fetch repository' },
        { status: 500 }
      );
    }
  }),
  rateLimits.read
);

// Update repository
export const PATCH = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: repositoryId } = await params;
      const body = await request.json();
      const { category, subcategory, status } = body;

      const repositoryService = new RepositoryService();

      // Move repository if category/subcategory changed
      if (category || subcategory) {
        const repository = await repositoryService.moveRepository(
          repositoryId,
          category,
          subcategory
        );
        return NextResponse.json(repository);
      }

      // Update status or other fields
      const { prisma } = await import('@/lib/prisma');
      const repository = await prisma.repository.update({
        where: { id: repositoryId },
        data: {
          ...(status && { status }),
          updatedAt: new Date()
        },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              category: true,
              status: true
            }
          },
          codeAnalyses: {
            orderBy: { analyzedAt: 'desc' },
            take: 1
          },
          repositoryTags: true,
          webhooks: {
            where: { isActive: true }
          }
        }
      });

      return NextResponse.json(repository);
    } catch (error) {
      console.error('Error updating repository:', error);
      return NextResponse.json(
        { error: 'Failed to update repository' },
        { status: 500 }
      );
    }
  }),
  rateLimits.write
);

// Delete repository
export const DELETE = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: repositoryId } = await params;

      const repositoryService = new RepositoryService();
      const repository = await repositoryService.getRepository(repositoryId);

      if (!repository) {
        return NextResponse.json(
          { error: 'Repository not found' },
          { status: 404 }
        );
      }

      // Archive repository on GitHub instead of deleting
      if (repository.githubOwner && repository.githubName) {
        const { GitHubClient } = await import('@/lib/github/github-client');
        const githubClient = new GitHubClient(
          process.env.GITHUB_ACCESS_TOKEN!,
          process.env.GITHUB_ORG_NAME!
        );
        
        await githubClient.archiveRepository(
          repository.githubOwner,
          repository.githubName
        );
      }

      // Update status in database
      const { prisma } = await import('@/lib/prisma');
      await prisma.repository.update({
        where: { id: repositoryId },
        data: { 
          status: 'ARCHIVED',
          updatedAt: new Date()
        }
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error archiving repository:', error);
      return NextResponse.json(
        { error: 'Failed to archive repository' },
        { status: 500 }
      );
    }
  }),
  rateLimits.write
);