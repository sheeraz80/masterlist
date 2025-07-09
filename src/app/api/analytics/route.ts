import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

interface AnalyticsData {
  overview: {
    total_projects: number;
    total_revenue_potential: number;
    average_quality: number;
    average_complexity: number;
    categories_count: number;
    total_users: number;
    total_teams: number;
    total_activities: number;
  };
  category_analysis: {
    by_count: Record<string, number>;
    by_revenue: Record<string, number>;
    by_quality: Record<string, number>;
  };
  quality_trends: {
    distribution: Record<string, number>;
    by_category: Record<string, number>;
    by_complexity: Record<string, number>;
  };
  revenue_analysis: {
    distribution: Record<string, number>;
    top_projects: Array<Record<string, unknown>>;
    by_category_avg: Record<string, number>;
    by_complexity_avg: Record<string, number>;
  };
  complexity_analysis: {
    distribution: Record<string, number>;
    by_category: Record<string, number>;
    correlation_with_revenue: number;
  };
  development_time_analysis: {
    distribution: Record<string, number>;
    by_category: Record<string, Record<string, number>>;
  };
  competition_analysis: {
    distribution: Record<string, number>;
    by_category: Record<string, Record<string, number>>;
  };
  recommendations: {
    high_potential_low_complexity: Array<Record<string, unknown>>;
    undervalued_categories: string[];
    optimal_projects: Array<Record<string, unknown>>;
  };
  recent_trends: {
    new_projects_last_week: number;
    active_users_last_week: number;
    trending_categories: string[];
  };
}

export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, _user: AuthUser | null) => {
  try {
    // Fetch all necessary data from database
    const [
      projects,
      userCount,
      teamCount,
      recentActivityCount,
      recentProjects,
      activeUsers
    ] = await Promise.all([
      prisma.project.findMany({
        include: {
          _count: {
            select: {
              comments: true,
              activities: true
            }
          }
        }
      }),
      prisma.user.count(),
      prisma.team.count(),
      prisma.activity.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.project.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.activity.groupBy({
        by: ['userId'],
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          },
          userId: {
            not: null
          }
        },
        _count: true
      })
    ]);

    // Transform projects to match expected format
    const transformedProjects = projects.map(project => ({
      id: project.id,
      title: project.title,
      problem: project.problem,
      solution: project.solution,
      category: project.category,
      target_users: project.targetUsers,
      revenue_model: project.revenueModel,
      revenue_potential: JSON.parse(project.revenuePotential || '{}'),
      development_time: project.developmentTime,
      competition_level: project.competitionLevel,
      technical_complexity: project.technicalComplexity,
      quality_score: project.qualityScore,
      key_features: JSON.parse(project.keyFeatures || '[]'),
      tags: JSON.parse(project.tags || '[]'),
      status: project.status,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
      comments_count: project._count.comments,
      activities_count: project._count.activities
    }));

    const analytics: AnalyticsData = generateAnalytics(
      transformedProjects, 
      userCount, 
      teamCount, 
      recentActivityCount,
      recentProjects,
      activeUsers.length
    );

    return NextResponse.json(analytics);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error generating analytics:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
  }),
  rateLimits.read
);

function generateAnalytics(
  projects: any[], 
  userCount: number, 
  teamCount: number, 
  recentActivityCount: number,
  newProjectsCount: number,
  activeUsersCount: number
): AnalyticsData {
  // Overview metrics
  const totalProjects = projects.length;
  const totalRevenue = projects.reduce((sum, p) => sum + (p.revenue_potential?.realistic || 0), 0);
  const avgQuality = totalProjects > 0 
    ? projects.reduce((sum, p) => sum + (p.quality_score || 0), 0) / totalProjects 
    : 0;
  const avgComplexity = totalProjects > 0
    ? projects.reduce((sum, p) => sum + (p.technical_complexity || 0), 0) / totalProjects
    : 0;
  
  const categories = Array.from(new Set(projects.map(p => p.category).filter(Boolean)));

  // Category analysis
  const categoryCount: Record<string, number> = {};
  const categoryRevenue: Record<string, number> = {};
  const categoryQuality: Record<string, { total: number; count: number }> = {};

  projects.forEach(project => {
    const cat = project.category || 'Uncategorized';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (project.revenue_potential?.realistic || 0);
    
    if (!categoryQuality[cat]) categoryQuality[cat] = { total: 0, count: 0 };
    categoryQuality[cat].total += project.quality_score || 0;
    categoryQuality[cat].count += 1;
  });

  // Calculate average quality by category
  const categoryQualityAvg: Record<string, number> = {};
  Object.entries(categoryQuality).forEach(([cat, data]) => {
    categoryQualityAvg[cat] = data.count > 0 ? data.total / data.count : 0;
  });

  // Quality distribution
  const qualityDistribution: Record<string, number> = {
    '0-2': 0, '2-4': 0, '4-6': 0, '6-8': 0, '8-10': 0
  };
  
  projects.forEach(project => {
    const score = project.quality_score || 0;
    if (score < 2) qualityDistribution['0-2']++;
    else if (score < 4) qualityDistribution['2-4']++;
    else if (score < 6) qualityDistribution['4-6']++;
    else if (score < 8) qualityDistribution['6-8']++;
    else qualityDistribution['8-10']++;
  });

  // Revenue distribution
  const revenueDistribution: Record<string, number> = {
    '0-10k': 0, '10k-50k': 0, '50k-100k': 0, '100k-500k': 0, '500k+': 0
  };
  
  projects.forEach(project => {
    const revenue = project.revenue_potential?.realistic || 0;
    if (revenue < 10000) revenueDistribution['0-10k']++;
    else if (revenue < 50000) revenueDistribution['10k-50k']++;
    else if (revenue < 100000) revenueDistribution['50k-100k']++;
    else if (revenue < 500000) revenueDistribution['100k-500k']++;
    else revenueDistribution['500k+']++;
  });

  // Top revenue projects
  const topRevenueProjects = [...projects]
    .sort((a, b) => (b.revenue_potential?.realistic || 0) - (a.revenue_potential?.realistic || 0))
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      revenue_potential: p.revenue_potential?.realistic || 0,
      quality_score: p.quality_score
    }));

  // Complexity distribution
  const complexityDistribution: Record<string, number> = {
    'Low (0-3)': 0, 'Medium (3-6)': 0, 'High (6-8)': 0, 'Very High (8-10)': 0
  };
  
  projects.forEach(project => {
    const complexity = project.technical_complexity || 0;
    if (complexity < 3) complexityDistribution['Low (0-3)']++;
    else if (complexity < 6) complexityDistribution['Medium (3-6)']++;
    else if (complexity < 8) complexityDistribution['High (6-8)']++;
    else complexityDistribution['Very High (8-10)']++;
  });

  // Development time analysis
  const devTimeDistribution: Record<string, number> = {
    '< 1 month': 0,
    '1-3 months': 0,
    '3-6 months': 0,
    '6-12 months': 0,
    '> 12 months': 0
  };
  
  projects.forEach(project => {
    const time = project.development_time?.toLowerCase() || '';
    if (time.includes('week') || time.includes('< 1 month')) {
      devTimeDistribution['< 1 month']++;
    } else if (time.includes('1-3 month') || time.includes('2 month')) {
      devTimeDistribution['1-3 months']++;
    } else if (time.includes('3-6 month') || time.includes('4 month') || time.includes('5 month')) {
      devTimeDistribution['3-6 months']++;
    } else if (time.includes('6-12 month') || time.includes('year')) {
      devTimeDistribution['6-12 months']++;
    } else {
      devTimeDistribution['> 12 months']++;
    }
  });

  // Competition analysis
  const competitionDistribution: Record<string, number> = {
    'Low': 0, 'Medium': 0, 'High': 0, 'Very High': 0
  };
  
  projects.forEach(project => {
    const level = project.competition_level?.toLowerCase() || 'medium';
    if (level.includes('low')) competitionDistribution['Low']++;
    else if (level.includes('medium')) competitionDistribution['Medium']++;
    else if (level.includes('high') && !level.includes('very')) competitionDistribution['High']++;
    else if (level.includes('very high')) competitionDistribution['Very High']++;
    else competitionDistribution['Medium']++;
  });

  // Calculate complexity by category
  const complexityByCategory: Record<string, number> = {};
  const complexityByCategoryData: Record<string, { total: number; count: number }> = {};
  
  projects.forEach(project => {
    const cat = project.category || 'Uncategorized';
    if (!complexityByCategoryData[cat]) complexityByCategoryData[cat] = { total: 0, count: 0 };
    complexityByCategoryData[cat].total += project.technical_complexity || 0;
    complexityByCategoryData[cat].count += 1;
  });
  
  Object.entries(complexityByCategoryData).forEach(([cat, data]) => {
    complexityByCategory[cat] = data.count > 0 ? data.total / data.count : 0;
  });

  // Calculate revenue-complexity correlation
  let correlationSum = 0;
  let validCount = 0;
  projects.forEach(project => {
    if (project.revenue_potential?.realistic && project.technical_complexity) {
      const normalizedRevenue = project.revenue_potential.realistic / 1000000;
      const normalizedComplexity = project.technical_complexity / 10;
      correlationSum += normalizedRevenue * normalizedComplexity;
      validCount++;
    }
  });
  const correlation = validCount > 0 ? correlationSum / validCount : 0;

  // Recommendations
  const highPotentialLowComplexity = projects
    .filter(p => 
      (p.revenue_potential?.realistic || 0) > 100000 && 
      (p.technical_complexity || 0) < 5
    )
    .sort((a, b) => (b.revenue_potential?.realistic || 0) - (a.revenue_potential?.realistic || 0))
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      revenue_potential: p.revenue_potential?.realistic || 0,
      technical_complexity: p.technical_complexity
    }));

  // Find undervalued categories (high avg quality, low project count)
  const undervaluedCategories = Object.entries(categoryQualityAvg)
    .filter(([cat, avgQuality]) => 
      avgQuality > 7 && categoryCount[cat] < 3
    )
    .map(([cat]) => cat);

  // Optimal projects (high quality, medium complexity, good revenue)
  const optimalProjects = projects
    .filter(p => 
      (p.quality_score || 0) >= 7 &&
      (p.technical_complexity || 0) >= 4 && 
      (p.technical_complexity || 0) <= 7 &&
      (p.revenue_potential?.realistic || 0) >= 50000
    )
    .sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      quality_score: p.quality_score,
      revenue_potential: p.revenue_potential?.realistic || 0,
      technical_complexity: p.technical_complexity
    }));

  // Trending categories (most active in recent period)
  const recentCategoryActivity: Record<string, number> = {};
  projects
    .filter(p => {
      const daysSinceCreation = (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation <= 7;
    })
    .forEach(p => {
      const cat = p.category || 'Uncategorized';
      recentCategoryActivity[cat] = (recentCategoryActivity[cat] || 0) + 1;
    });

  const trendingCategories = Object.entries(recentCategoryActivity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);

  return {
    overview: {
      total_projects: totalProjects,
      total_revenue_potential: totalRevenue,
      average_quality: Math.round(avgQuality * 10) / 10,
      average_complexity: Math.round(avgComplexity * 10) / 10,
      categories_count: categories.length,
      total_users: userCount,
      total_teams: teamCount,
      total_activities: recentActivityCount
    },
    category_analysis: {
      by_count: categoryCount,
      by_revenue: categoryRevenue,
      by_quality: categoryQualityAvg
    },
    quality_trends: {
      distribution: qualityDistribution,
      by_category: categoryQualityAvg,
      by_complexity: {} // Could be implemented if needed
    },
    revenue_analysis: {
      distribution: revenueDistribution,
      top_projects: topRevenueProjects,
      by_category_avg: Object.entries(categoryRevenue).reduce((acc, [cat, total]) => {
        acc[cat] = categoryCount[cat] > 0 ? Math.round(total / categoryCount[cat]) : 0;
        return acc;
      }, {} as Record<string, number>),
      by_complexity_avg: {} // Could be implemented if needed
    },
    complexity_analysis: {
      distribution: complexityDistribution,
      by_category: complexityByCategory,
      correlation_with_revenue: correlation
    },
    development_time_analysis: {
      distribution: devTimeDistribution,
      by_category: {} // Could be implemented if needed
    },
    competition_analysis: {
      distribution: competitionDistribution,
      by_category: {} // Could be implemented if needed
    },
    recommendations: {
      high_potential_low_complexity: highPotentialLowComplexity,
      undervalued_categories: undervaluedCategories,
      optimal_projects: optimalProjects
    },
    recent_trends: {
      new_projects_last_week: newProjectsCount,
      active_users_last_week: activeUsersCount,
      trending_categories: trendingCategories
    }
  };
}