import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

interface TimeSeriesData {
  daily_projects: Array<{ date: string; count: number; cumulative: number }>;
  daily_users: Array<{ date: string; count: number; active: number }>;
  daily_activities: Array<{ date: string; count: number; type: Record<string, number> }>;
  category_trends: Array<{ date: string; categories: Record<string, number> }>;
  revenue_trends: Array<{ date: string; total: number; average: number }>;
  quality_trends: Array<{ date: string; average: number; distribution: Record<string, number> }>;
}

export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, _user: AuthUser | null) => {
    try {
      const { searchParams } = new URL(request.url);
      const days = parseInt(searchParams.get('days') || '30');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch projects with time series
      const projects = await prisma.project.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        select: {
          id: true,
          createdAt: true,
          category: true,
          qualityScore: true,
          revenuePotential: true,
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Fetch users with time series
      const users = await prisma.user.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        select: {
          id: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Fetch activities
      const activities = await prisma.activity.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        select: {
          id: true,
          createdAt: true,
          type: true,
          userId: true,
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      // Generate daily data points
      const dailyData: TimeSeriesData = {
        daily_projects: [],
        daily_users: [],
        daily_activities: [],
        category_trends: [],
        revenue_trends: [],
        quality_trends: []
      };

      // Create date map for the period
      const dateMap = new Map<string, {
        projects: any[];
        users: any[];
        activities: any[];
      }>();

      // Initialize date map
      for (let i = 0; i <= days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        dateMap.set(dateStr, {
          projects: [],
          users: [],
          activities: []
        });
      }

      // Populate date map
      projects.forEach(project => {
        const dateStr = project.createdAt.toISOString().split('T')[0];
        const data = dateMap.get(dateStr);
        if (data) data.projects.push(project);
      });

      users.forEach(user => {
        const dateStr = user.createdAt.toISOString().split('T')[0];
        const data = dateMap.get(dateStr);
        if (data) data.users.push(user);
      });

      activities.forEach(activity => {
        const dateStr = activity.createdAt.toISOString().split('T')[0];
        const data = dateMap.get(dateStr);
        if (data) data.activities.push(activity);
      });

      // Process daily data
      let cumulativeProjects = await prisma.project.count({
        where: {
          createdAt: {
            lt: startDate
          }
        }
      });

      let cumulativeUsers = await prisma.user.count({
        where: {
          createdAt: {
            lt: startDate
          }
        }
      });

      Array.from(dateMap.entries()).forEach(([dateStr, data]) => {
        // Projects trend
        cumulativeProjects += data.projects.length;
        dailyData.daily_projects.push({
          date: dateStr,
          count: data.projects.length,
          cumulative: cumulativeProjects
        });

        // Users trend
        cumulativeUsers += data.users.length;
        const activeUsers = new Set(
          data.activities
            .filter(a => a.userId)
            .map(a => a.userId)
        ).size;

        dailyData.daily_users.push({
          date: dateStr,
          count: data.users.length,
          active: activeUsers
        });

        // Activities trend
        const activityTypes = data.activities.reduce((acc, activity) => {
          acc[activity.type] = (acc[activity.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        dailyData.daily_activities.push({
          date: dateStr,
          count: data.activities.length,
          type: activityTypes
        });

        // Category trends
        const categories = data.projects.reduce((acc, project) => {
          const cat = project.category || 'Uncategorized';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        dailyData.category_trends.push({
          date: dateStr,
          categories
        });

        // Revenue trends
        const revenues = data.projects.map(p => {
          try {
            const parsed = JSON.parse(p.revenuePotential || '{}');
            return parsed.realistic || 0;
          } catch {
            return 0;
          }
        });

        const totalRevenue = revenues.reduce((sum, r) => sum + r, 0);
        const avgRevenue = revenues.length > 0 ? totalRevenue / revenues.length : 0;

        dailyData.revenue_trends.push({
          date: dateStr,
          total: totalRevenue,
          average: avgRevenue
        });

        // Quality trends
        const qualityScores = data.projects
          .map(p => p.qualityScore || 0)
          .filter(q => q > 0);

        const avgQuality = qualityScores.length > 0
          ? qualityScores.reduce((sum, q) => sum + q, 0) / qualityScores.length
          : 0;

        const qualityDistribution = qualityScores.reduce((acc, score) => {
          const bucket = score < 4 ? 'low' : score < 7 ? 'medium' : 'high';
          acc[bucket] = (acc[bucket] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        dailyData.quality_trends.push({
          date: dateStr,
          average: avgQuality,
          distribution: qualityDistribution
        });
      });

      return NextResponse.json(dailyData);
    } catch (error) {
      console.error('Error generating trend analytics:', error);
      return NextResponse.json(
        { error: 'Failed to generate trend analytics' },
        { status: 500 }
      );
    }
  }),
  rateLimits.read
);