import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paginationSchema, searchSchema, validateQuery, createProjectSchema, validateRequest } from '@/lib/validations';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth, requireAuth } from '@/lib/middleware/auth';
import { AuthUser, DatabaseProject, ProjectWithOwner, PaginatedResponse } from '@/types';
import { logError, logDatabaseOperation } from '@/lib/logger';
import { projectCache, statsCache } from '@/lib/cache';

export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, _user: AuthUser | null) => {
    try {
      const { searchParams } = new URL(request.url);
      
      // Validate query parameters
      const paginationResult = validateQuery(searchParams, paginationSchema);
      const searchResult = validateQuery(searchParams, searchSchema);
      
      if (paginationResult.error) {
        return NextResponse.json(
          { error: `Invalid pagination: ${paginationResult.error}` },
          { status: 400 }
        );
      }
      
      if (searchResult.error) {
        return NextResponse.json(
          { error: `Invalid search parameters: ${searchResult.error}` },
          { status: 400 }
        );
      }
      
      const { limit, offset } = paginationResult.data!;
      const { search, category, sortBy, sortOrder } = searchResult.data!;

      // Check cache first
      const cacheParams = { limit, offset, search, category, sortBy, sortOrder };
      const cachedResult = projectCache.getProjectList(cacheParams);
      if (cachedResult) {
        return NextResponse.json(cachedResult);
      }

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { problem: { contains: search, mode: 'insensitive' } },
        { solution: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy with validated sortBy field
    const orderBy: Record<string, 'asc' | 'desc'> = {};
    let needsInMemorySort = false;
    
    switch (sortBy) {
      case 'quality':
        orderBy.qualityScore = sortOrder;
        break;
      case 'complexity':
        orderBy.technicalComplexity = sortOrder;
        break;
      case 'revenue':
        // Sort by revenue requires custom logic since it's stored as JSON
        // We'll fetch all matching records and sort in memory
        needsInMemorySort = true;
        orderBy.createdAt = 'desc'; // Default order for fetching
        break;
      default:
        orderBy[sortBy] = sortOrder;
    }

    // Get projects (with or without pagination depending on revenue sorting)
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy,
        skip: needsInMemorySort ? undefined : offset,
        take: needsInMemorySort ? undefined : limit,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          _count: {
            select: {
              comments: true,
              activities: true
            }
          }
        }
      }) as Promise<DatabaseProject[]>,
      prisma.project.count({ where })
    ]);

    // Transform projects to match expected format
    let transformedProjects: ProjectWithOwner[] = projects.map(project => ({
      id: project.id,
      title: project.title,
      problem: project.problem,
      solution: project.solution,
      category: project.category,
      target_users: project.targetUsers || '',
      revenue_model: project.revenueModel || '',
      revenue_potential: (() => {
        try {
          return JSON.parse(project.revenuePotential || '{}');
        } catch {
          return { conservative: 0, realistic: 0, optimistic: 0 };
        }
      })(),
      development_time: project.developmentTime || '',
      competition_level: project.competitionLevel || '',
      technical_complexity: project.technicalComplexity || 0,
      quality_score: project.qualityScore || 0,
      key_features: project.keyFeatures ? project.keyFeatures.split(',').map(f => f.trim()) : [],
      tags: project.tags ? (project.tags.startsWith('[') ? JSON.parse(project.tags) : project.tags.split(',').map(t => t.trim())) : [],
      priority: project.priority as 'low' | 'medium' | 'high' | 'critical',
      progress: project.progress,
      status: project.status as 'active' | 'completed' | 'archived',
      created_at: project.createdAt.toISOString(),
      updated_at: project.updatedAt.toISOString(),
      owner: project.owner || { id: '', name: '', email: '', avatar: null },
      comments_count: project._count?.comments || 0,
      activities_count: project._count?.activities || 0
    }));

    // Handle in-memory sorting for revenue
    if (needsInMemorySort && sortBy === 'revenue') {
      transformedProjects.sort((a, b) => {
        const aRevenue = a.revenue_potential?.realistic || 0;
        const bRevenue = b.revenue_potential?.realistic || 0;
        const multiplier = sortOrder === 'desc' ? -1 : 1;
        return (aRevenue - bRevenue) * multiplier;
      });
      
      // Apply pagination after sorting
      const startIndex = offset;
      const endIndex = offset + limit;
      transformedProjects = transformedProjects.slice(startIndex, endIndex);
    }

    // Calculate pagination info
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    
    const response: PaginatedResponse<ProjectWithOwner> = {
      data: transformedProjects,
      pagination: {
        total,
        limit,
        offset,
        page,
        total_pages: totalPages,
        has_more: page < totalPages,
        has_previous: page > 1
      }
    };

    // Cache the results
    projectCache.setProjectList(cacheParams, response);

    return NextResponse.json(response);
    } catch (error) {
      logError(error as Error, { 
        context: 'projects_get',
        userId: _user?.id
      });
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }
  }),
  rateLimits.read
);

export const POST = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      // Validate request body
      const { data, error } = await validateRequest(request, createProjectSchema);
      
      if (error) {
        return NextResponse.json(
          { error: `Invalid project data: ${error}` },
          { status: 400 }
        );
      }

      const project = await prisma.project.create({
        data: {
          title: data.title,
          problem: data.problem,
          solution: data.solution,
          category: data.category,
          targetUsers: data.targetUsers,
          revenueModel: data.revenueModel,
          revenuePotential: JSON.stringify(data.revenuePotential || {}),
          developmentTime: data.developmentTime,
          competitionLevel: data.competitionLevel,
          technicalComplexity: data.technicalComplexity,
          qualityScore: data.qualityScore,
          keyFeatures: JSON.stringify(data.keyFeatures || []),
          tags: JSON.stringify(data.tags || []),
          priority: data.priority,
          progress: data.progress,
          status: 'active',
          ownerId: user.id
        }
      });

      // Invalidate related caches
      projectCache.invalidateProject(project.id);
      statsCache.invalidateStats();

      return NextResponse.json(project, { status: 201 });
    } catch (error) {
      logError(error as Error, { 
        context: 'projects_create',
        userId: user.id
      });
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }
  }),
  rateLimits.write
);