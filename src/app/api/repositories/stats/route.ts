import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

// Get repository statistics
export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const { prisma } = await import('@/lib/prisma');

      // Get basic repository statistics
      const [
        totalRepositories,
        activeRepositories,
        needsSetupCount,
        archivedCount,
        repositoriesByCategory,
        repositoriesByLanguage,
        repositoriesByStatus,
        averageHealthScore
      ] = await Promise.all([
        prisma.repository.count(),
        prisma.repository.count({ where: { status: 'ACTIVE' } }),
        prisma.repository.count({ where: { status: 'NEEDS_SETUP' } }),
        prisma.repository.count({ where: { status: 'ARCHIVED' } }),
        prisma.repository.groupBy({
          by: ['category'],
          _count: { _all: true },
          orderBy: { _count: { _all: 'desc' } }
        }),
        prisma.repository.groupBy({
          by: ['language'],
          _count: { _all: true },
          where: { language: { not: null } },
          orderBy: { _count: { _all: 'desc' } }
        }),
        prisma.repository.groupBy({
          by: ['status'],
          _count: { _all: true }
        }),
        prisma.repository.aggregate({
          _avg: { healthScore: true },
          where: { healthScore: { not: null } }
        })
      ]);

      // Get recent code analysis data
      const recentAnalyses = await prisma.codeAnalysis.findMany({
        take: 100,
        orderBy: { analyzedAt: 'desc' },
        select: {
          codeQuality: true,
          testCoverage: true,
          linesOfCode: true,
          complexity: true,
          repository: {
            select: { category: true }
          }
        }
      });

      // Calculate quality distribution
      const qualityDistribution = recentAnalyses.reduce((acc, analysis) => {
        if (analysis.codeQuality) {
          const range = Math.floor(analysis.codeQuality / 2) * 2; // Group by 2-point ranges
          const key = `${range}-${range + 2}`;
          acc[key] = (acc[key] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      // Calculate health score distribution
      const healthyCount = await prisma.repository.count({
        where: { healthScore: { gte: 80 } }
      });

      const stats = {
        totalRepositories,
        activeRepositories,
        needsSetup: needsSetupCount,
        archivedRepositories: archivedCount,
        healthyRepositories: healthyCount,
        averageHealthScore: averageHealthScore._avg.healthScore || 0,
        
        // Distribution data
        categoryDistribution: repositoriesByCategory.reduce((acc, item) => {
          acc[item.category] = item._count._all;
          return acc;
        }, {} as Record<string, number>),
        
        languageDistribution: repositoriesByLanguage.reduce((acc, item) => {
          acc[item.language!] = item._count._all;
          return acc;
        }, {} as Record<string, number>),
        
        statusDistribution: repositoriesByStatus.reduce((acc, item) => {
          acc[item.status] = item._count._all;
          return acc;
        }, {} as Record<string, number>),
        
        qualityDistribution,
        
        // Calculated metrics
        healthPercentage: totalRepositories > 0 ? (healthyCount / totalRepositories) * 100 : 0,
        activePercentage: totalRepositories > 0 ? (activeRepositories / totalRepositories) * 100 : 0,
        
        // Recent trends (placeholder for now)
        trends: {
          newRepositoriesThisWeek: 0, // TODO: Calculate from createdAt
          analysesThisWeek: recentAnalyses.length,
          averageComplexity: recentAnalyses.reduce((sum, a) => sum + (a.complexity || 0), 0) / (recentAnalyses.length || 1),
          averageTestCoverage: recentAnalyses.reduce((sum, a) => sum + (a.testCoverage || 0), 0) / (recentAnalyses.length || 1)
        }
      };

      return NextResponse.json(stats);
    } catch (error) {
      console.error('Error fetching repository stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch repository statistics' },
        { status: 500 }
      );
    }
  }),
  rateLimits.read
);