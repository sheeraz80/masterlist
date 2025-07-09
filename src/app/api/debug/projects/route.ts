import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
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
}