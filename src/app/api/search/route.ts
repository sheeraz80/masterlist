import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface SearchFilters {
  q?: string;
  category?: string;
  platform?: string;
  min_quality?: number;
  max_quality?: number;
  min_revenue?: number;
  max_revenue?: number;
  min_complexity?: number;
  max_complexity?: number;
  competition_level?: string;
  development_time?: string;
  tags?: string[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: SearchFilters = {
      q: searchParams.get('q') || undefined,
      category: searchParams.get('category') || undefined,
      platform: searchParams.get('platform') || undefined,
      min_quality: searchParams.get('min_quality') ? parseFloat(searchParams.get('min_quality')!) : undefined,
      max_quality: searchParams.get('max_quality') ? parseFloat(searchParams.get('max_quality')!) : undefined,
      min_revenue: searchParams.get('min_revenue') ? parseInt(searchParams.get('min_revenue')!) : undefined,
      max_revenue: searchParams.get('max_revenue') ? parseInt(searchParams.get('max_revenue')!) : undefined,
      min_complexity: searchParams.get('min_complexity') ? parseInt(searchParams.get('min_complexity')!) : undefined,
      max_complexity: searchParams.get('max_complexity') ? parseInt(searchParams.get('max_complexity')!) : undefined,
      competition_level: searchParams.get('competition_level') || undefined,
      development_time: searchParams.get('development_time') || undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
      sort_by: searchParams.get('sort_by') || 'qualityScore',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Build where clause
    const where: any = {};

    // Text search across multiple fields
    if (filters.q) {
      where.OR = [
        { title: { contains: filters.q, mode: 'insensitive' } },
        { problem: { contains: filters.q, mode: 'insensitive' } },
        { solution: { contains: filters.q, mode: 'insensitive' } },
        { targetUsers: { contains: filters.q, mode: 'insensitive' } },
        { revenueModel: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    // Quality score range
    if (filters.min_quality !== undefined || filters.max_quality !== undefined) {
      where.qualityScore = {};
      if (filters.min_quality !== undefined) {
        where.qualityScore.gte = filters.min_quality;
      }
      if (filters.max_quality !== undefined) {
        where.qualityScore.lte = filters.max_quality;
      }
    }

    // Technical complexity range
    if (filters.min_complexity !== undefined || filters.max_complexity !== undefined) {
      where.technicalComplexity = {};
      if (filters.min_complexity !== undefined) {
        where.technicalComplexity.gte = filters.min_complexity;
      }
      if (filters.max_complexity !== undefined) {
        where.technicalComplexity.lte = filters.max_complexity;
      }
    }

    // Competition level filter
    if (filters.competition_level && filters.competition_level !== 'all') {
      where.competitionLevel = { contains: filters.competition_level, mode: 'insensitive' };
    }

    // Development time filter
    if (filters.development_time && filters.development_time !== 'all') {
      const devTimeFilter = filters.development_time.toLowerCase();
      if (devTimeFilter === 'fast') {
        where.OR = [
          { developmentTime: { contains: 'day', mode: 'insensitive' } },
          { developmentTime: { contains: 'week', mode: 'insensitive' } },
        ];
      } else if (devTimeFilter === 'medium') {
        where.AND = [
          { developmentTime: { contains: 'month', mode: 'insensitive' } },
          { NOT: { developmentTime: { contains: '6 month', mode: 'insensitive' } } },
        ];
      } else if (devTimeFilter === 'slow') {
        where.OR = [
          { developmentTime: { contains: '6 month', mode: 'insensitive' } },
          { developmentTime: { contains: 'year', mode: 'insensitive' } },
        ];
      }
    }

    // Get total count
    const total = await prisma.project.count({ where });

    // Get paginated results
    const projects = await prisma.project.findMany({
      where,
      skip: filters.offset,
      take: filters.limit,
      orderBy: {
        [filters.sort_by === 'quality_score' ? 'qualityScore' : 
         filters.sort_by === 'revenue_potential' ? 'id' : // We'll sort by revenue in memory
         filters.sort_by === 'technical_complexity' ? 'technicalComplexity' :
         filters.sort_by || 'qualityScore']: filters.sort_order
      },
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
          select: { comments: true }
        }
      }
    });

    // Transform projects to match frontend expectations
    const transformedProjects = projects.map(project => {
      const revenuePotential = project.revenuePotential ? JSON.parse(project.revenuePotential) : null;
      const keyFeatures = project.keyFeatures ? JSON.parse(project.keyFeatures) : [];
      const tags = project.tags ? JSON.parse(project.tags) : [];

      return {
        id: project.id,
        title: project.title,
        problem: project.problem,
        solution: project.solution,
        category: project.category,
        target_users: project.targetUsers,
        revenue_model: project.revenueModel,
        revenue_potential: revenuePotential,
        development_time: project.developmentTime,
        competition_level: project.competitionLevel,
        technical_complexity: project.technicalComplexity,
        quality_score: project.qualityScore,
        key_features: keyFeatures,
        tags,
        status: project.status,
        owner: project.owner,
        comments_count: project._count.comments,
        created_at: project.createdAt,
        updated_at: project.updatedAt
      };
    });

    // Sort by revenue if needed (since we can't sort JSON fields in Prisma)
    if (filters.sort_by === 'revenue_potential') {
      transformedProjects.sort((a, b) => {
        const aRevenue = a.revenue_potential?.realistic || 0;
        const bRevenue = b.revenue_potential?.realistic || 0;
        return filters.sort_order === 'desc' ? bRevenue - aRevenue : aRevenue - bRevenue;
      });
    }

    // Filter by revenue range after transformation
    let filteredProjects = transformedProjects;
    if (filters.min_revenue !== undefined || filters.max_revenue !== undefined) {
      filteredProjects = transformedProjects.filter(project => {
        const revenue = project.revenue_potential?.realistic || 0;
        if (filters.min_revenue !== undefined && revenue < filters.min_revenue) return false;
        if (filters.max_revenue !== undefined && revenue > filters.max_revenue) return false;
        return true;
      });
    }

    // Filter by tags after transformation
    if (filters.tags && filters.tags.length > 0) {
      filteredProjects = filteredProjects.filter(project => {
        return filters.tags!.some(tag => project.tags.includes(tag));
      });
    }

    // Calculate aggregated statistics
    const searchStats = {
      total_results: filteredProjects.length,
      categories: await calculateCategoryDistribution(where),
      quality_distribution: await calculateQualityDistribution(where),
      revenue_stats: calculateRevenueStats(filteredProjects),
      complexity_stats: await calculateComplexityStats(where),
    };

    // Track search if user is logged in
    const user = await getCurrentUser();
    if (user && filters.q) {
      await prisma.searchHistory.create({
        data: {
          userId: user.id,
          query: filters.q,
          filters: JSON.stringify(filters),
          results: filteredProjects.length
        }
      }).catch(err => console.error('Failed to save search history:', err));
    }

    return NextResponse.json({
      projects: filteredProjects,
      total: filteredProjects.length,
      limit: filters.limit,
      offset: filters.offset,
      has_more: filters.offset! + filters.limit! < filteredProjects.length,
      filters_applied: Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      ),
      search_stats: searchStats,
    });
  } catch (error) {
    console.error('Error searching projects:', error);
    return NextResponse.json(
      { error: 'Failed to search projects' },
      { status: 500 }
    );
  }
}

async function calculateCategoryDistribution(where: any): Promise<Record<string, number>> {
  const categories = await prisma.project.groupBy({
    by: ['category'],
    where,
    _count: true
  });

  return categories.reduce((acc, cat) => {
    acc[cat.category] = cat._count;
    return acc;
  }, {} as Record<string, number>);
}

async function calculateQualityDistribution(where: any): Promise<Record<string, number>> {
  const distribution: Record<string, number> = {
    '0-2': 0,
    '2-4': 0,
    '4-6': 0,
    '6-8': 0,
    '8-10': 0,
  };

  const ranges = [
    { key: '0-2', min: 0, max: 2 },
    { key: '2-4', min: 2, max: 4 },
    { key: '4-6', min: 4, max: 6 },
    { key: '6-8', min: 6, max: 8 },
    { key: '8-10', min: 8, max: 10 },
  ];

  for (const range of ranges) {
    const count = await prisma.project.count({
      where: {
        ...where,
        qualityScore: {
          gte: range.min,
          lt: range.max === 10 ? 11 : range.max
        }
      }
    });
    distribution[range.key] = count;
  }

  return distribution;
}

function calculateRevenueStats(projects: any[]) {
  const revenues = projects
    .map(p => p.revenue_potential?.realistic || 0)
    .filter(r => r > 0);
  
  if (revenues.length === 0) {
    return { min: 0, max: 0, average: 0, total: 0 };
  }
  
  return {
    min: Math.min(...revenues),
    max: Math.max(...revenues),
    average: revenues.reduce((sum, r) => sum + r, 0) / revenues.length,
    total: revenues.reduce((sum, r) => sum + r, 0),
  };
}

async function calculateComplexityStats(where: any) {
  const stats = await prisma.project.aggregate({
    where,
    _min: { technicalComplexity: true },
    _max: { technicalComplexity: true },
    _avg: { technicalComplexity: true }
  });

  return {
    min: stats._min.technicalComplexity || 0,
    max: stats._max.technicalComplexity || 0,
    average: stats._avg.technicalComplexity || 0,
  };
}