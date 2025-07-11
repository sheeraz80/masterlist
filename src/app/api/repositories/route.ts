import { NextRequest, NextResponse } from 'next/server';
import { RepositoryService } from '@/lib/services/repository-service';
import { enhancedRepositoryService } from '@/lib/services/enhanced-repository-service';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';
import { RepoStatus } from '@prisma/client';

// Get repositories with filtering and pagination
export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const url = new URL(request.url);
      const category = url.searchParams.get('category') || undefined;
      const subcategory = url.searchParams.get('subcategory') || undefined;
      const status = url.searchParams.get('status') as RepoStatus || undefined;
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      const repositoryService = new RepositoryService();
      const result = await repositoryService.listRepositories({
        category,
        subcategory,
        status,
        limit: Math.min(limit, 100), // Cap at 100
        offset
      });

      return NextResponse.json({
        repositories: result.repositories,
        total: result.total,
        pagination: {
          limit,
          offset,
          hasMore: offset + limit < result.total
        }
      });
    } catch (error) {
      console.error('Error fetching repositories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch repositories' },
        { status: 500 }
      );
    }
  }),
  rateLimits.read
);

// Create new repository
export const POST = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const body = await request.json();
      const { projectId, templateName, repoName, description, isPrivate, useGitHub = true, fallbackToLocal = true } = body;

      if (!projectId) {
        return NextResponse.json(
          { error: 'Project ID is required' },
          { status: 400 }
        );
      }

      // Get project details
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
          { error: 'Repository already exists for this project' },
          { status: 409 }
        );
      }

      // Use enhanced repository service for better error handling
      const result = await enhancedRepositoryService.createRepository(project, {
        useGitHub,
        fallbackToLocal,
        templateName,
        description,
        isPrivate: isPrivate ?? true,
        includeReadme: true,
        includeGitignore: true,
        includeLicense: false
      });

      if (!result.success) {
        return NextResponse.json(
          { 
            error: result.error,
            mode: result.mode,
            warnings: result.warnings,
            githubStatus: await enhancedRepositoryService.getGitHubStatus()
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        repository: result.repository,
        githubUrl: result.githubUrl,
        mode: result.mode,
        warnings: result.warnings
      }, { status: 201 });
    } catch (error) {
      console.error('Error creating repository:', error);
      return NextResponse.json(
        { error: 'Failed to create repository' },
        { status: 500 }
      );
    }
  }),
  rateLimits.write
);