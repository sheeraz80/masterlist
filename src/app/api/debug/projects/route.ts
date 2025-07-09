import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { requireAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    // Only allow admin users to access debug endpoints
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Only allow in development or with explicit debug flag
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_DEBUG) {
      return NextResponse.json(
        { error: 'Debug endpoints disabled in production' },
        { status: 403 }
      );
    }
  try {
    // Get basic counts
    const projectCount = await prisma.project.count();
    const userCount = await prisma.user.count();
    
    // Get sample projects
    const sampleProjects = await prisma.project.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        qualityScore: true,
        createdAt: true
      }
    });

    // Test the same query as the main API
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 12,
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
      }),
      prisma.project.count()
    ]);

    // Return debug info
    return NextResponse.json({
      debug: {
        totalProjectsInDB: projectCount,
        totalUsersInDB: userCount,
        queryResultCount: projects.length,
        queryTotalCount: total,
        sampleProjects: sampleProjects,
        apiResponse: {
          projectsLength: projects.length,
          pagination: {
            total: total,
            limit: 12,
            offset: 0,
            page: 1,
            total_pages: Math.ceil(total / 12),
            has_more: total > 12,
            has_previous: false
          }
        }
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    );
  }
  }),
  rateLimits.api
);