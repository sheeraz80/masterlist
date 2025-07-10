import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { optionalAuth } from '@/lib/middleware/auth';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';

export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, user) => {
    try {
      // Get recent activities (last 24 hours)
      const recentActivities = await prisma.activity.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          project: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      });

      // Get active users (users who have been active in the last hour)
      const activeUsers = await prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000)
          }
        }
      });

      // Get project collaboration stats
      const projectStats = await prisma.activity.groupBy({
        by: ['projectId'],
        where: {
          projectId: {
            not: null
          },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        _count: {
          userId: true
        },
        _groupBy: {
          userId: true
        }
      });

      // Get top collaborations
      const topCollaborations = await Promise.all(
        projectStats
          .slice(0, 5)
          .map(async (stat) => {
            const uniqueUsers = await prisma.activity.findMany({
              where: {
                projectId: stat.projectId,
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
              },
              select: {
                userId: true
              },
              distinct: ['userId']
            });

            return {
              projectId: stat.projectId!,
              userCount: uniqueUsers.length
            };
          })
      );

      // Format activities for the frontend
      const formattedActivities = recentActivities.map(activity => ({
        userId: activity.userId,
        userName: activity.user?.name || 'Unknown User',
        action: activity.action,
        projectId: activity.projectId,
        projectTitle: activity.project?.title,
        timestamp: activity.createdAt,
        metadata: activity.metadata || {}
      }));

      return NextResponse.json({
        success: true,
        data: {
          activeUsers,
          recentActivities: formattedActivities,
          topCollaborations
        }
      });

    } catch (error) {
      console.error('Realtime metrics error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch real-time metrics',
        data: {
          activeUsers: 0,
          recentActivities: [],
          topCollaborations: []
        }
      }, { status: 500 });
    }
  }),
  rateLimits.api
);