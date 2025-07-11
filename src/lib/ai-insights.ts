import { prisma } from '@/lib/prisma';
import { analyticsOptimizer, benchmarkAnalyticsOperation } from '@/lib/performance/analytics-optimizer';

export interface ProjectInsight {
  projectId: string;
  insights: {
    marketPotential: number;
    competitionLevel: string;
    developmentComplexity: string;
    recommendations: string[];
    riskFactors: string[];
    opportunities: string[];
  };
}

export interface CategoryInsight {
  category: string;
  totalProjects: number;
  avgRevenuePotential: number;
  trends: {
    growth: number;
    popularity: number;
    competitiveness: number;
  };
}

export async function generateProjectInsights(projectId: string): Promise<ProjectInsight | null> {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return null;
    }

    // Simple rule-based insights (in production, this would use AI/ML)
    const insights = {
      marketPotential: calculateMarketPotential(project),
      competitionLevel: assessCompetitionLevel(project.category),
      developmentComplexity: assessDevelopmentComplexity(project.developmentTime),
      recommendations: generateRecommendations(project),
      riskFactors: identifyRiskFactors(project),
      opportunities: identifyOpportunities(project),
    };

    return {
      projectId,
      insights,
    };
  } catch (error) {
    console.error('Error generating project insights:', error);
    return null;
  }
}

export async function generateCategoryInsights(): Promise<CategoryInsight[]> {
  try {
    const projects = await prisma.project.findMany({
      select: {
        category: true,
        revenuePotential: true,
        qualityScore: true,
      }
    });

    // Group by category manually since revenuePotential is a string
    const categoryMap = new Map<string, { count: number; totalRevenue: number; totalQuality: number }>();
    
    projects.forEach(project => {
      const current = categoryMap.get(project.category) || { count: 0, totalRevenue: 0, totalQuality: 0 };
      
      // Parse revenue potential
      let revenue = 0;
      if (project.revenuePotential) {
        const revenueStr = project.revenuePotential.toLowerCase();
        if (revenueStr.includes('k')) {
          revenue = parseFloat(revenueStr.replace(/[^0-9.-]/g, '')) * 1000;
        } else if (revenueStr.includes('m')) {
          revenue = parseFloat(revenueStr.replace(/[^0-9.-]/g, '')) * 1000000;
        } else {
          revenue = parseFloat(revenueStr.replace(/[^0-9.-]/g, '')) || 0;
        }
      }
      
      categoryMap.set(project.category, {
        count: current.count + 1,
        totalRevenue: current.totalRevenue + revenue,
        totalQuality: current.totalQuality + (project.qualityScore || 0)
      });
    });

    const categoryStats: CategoryInsight[] = [];
    for (const [category, stats] of categoryMap) {
      categoryStats.push({
        category,
        totalProjects: stats.count,
        avgRevenuePotential: stats.totalRevenue / stats.count,
        trends: {
          growth: calculateGrowthTrend(category),
          popularity: calculatePopularity(stats.count),
          competitiveness: calculateCompetitiveness(category),
        },
      });
    }

    return categoryStats.sort((a, b) => b.avgRevenuePotential - a.avgRevenuePotential);
  } catch (error) {
    console.error('Error generating category insights:', error);
    return [];
  }
}

function calculateMarketPotential(project: any): number {
  // Simple scoring based on revenue potential and target market size
  const revenueScore = getRevenueScore(project.revenuePotential);
  const marketScore = getMarketScore(project.targetUsers);
  return Math.round((revenueScore + marketScore) / 2);
}

function assessCompetitionLevel(category: string): string {
  const competitiveCategories = ['E-commerce', 'Social Media', 'Gaming'];
  const moderateCategories = ['Productivity', 'Education', 'Health'];
  
  if (competitiveCategories.includes(category)) return 'High';
  if (moderateCategories.includes(category)) return 'Medium';
  return 'Low';
}

function assessDevelopmentComplexity(developmentTime: string): string {
  if (developmentTime.includes('1-2')) return 'Low';
  if (developmentTime.includes('3-6')) return 'Medium';
  if (developmentTime.includes('6+')) return 'High';
  return 'Medium';
}

function generateRecommendations(project: any): string[] {
  const recommendations = [];
  
  if (project.revenuePotential === 'High') {
    recommendations.push('Consider seeking investor funding for faster development');
  }
  
  if (project.developmentTime.includes('6+')) {
    recommendations.push('Break down into smaller MVP phases');
  }
  
  if (project.category === 'AI/ML') {
    recommendations.push('Focus on data quality and model interpretability');
  }
  
  return recommendations;
}

function identifyRiskFactors(project: any): string[] {
  const risks = [];
  
  if (project.category === 'E-commerce') {
    risks.push('High competition in saturated market');
  }
  
  if (project.developmentTime.includes('6+')) {
    risks.push('Extended development timeline increases market risk');
  }
  
  return risks;
}

function identifyOpportunities(project: any): string[] {
  const opportunities = [];
  
  if (project.category === 'AI/ML') {
    opportunities.push('Growing demand for AI solutions across industries');
  }
  
  if (project.revenuePotential === 'High') {
    opportunities.push('Potential for significant market capture');
  }
  
  return opportunities;
}

function getRevenueScore(revenuePotential: string): number {
  switch (revenuePotential) {
    case 'Very High': return 90;
    case 'High': return 75;
    case 'Medium': return 50;
    case 'Low': return 25;
    default: return 40;
  }
}

function getMarketScore(targetUsers: string): number {
  if (targetUsers.toLowerCase().includes('enterprise')) return 80;
  if (targetUsers.toLowerCase().includes('consumer')) return 70;
  if (targetUsers.toLowerCase().includes('niche')) return 40;
  return 60;
}

function calculateGrowthTrend(category: string): number {
  // Mock growth trends (in production, this would use real market data)
  const trends: Record<string, number> = {
    'AI/ML': 85,
    'Blockchain': 70,
    'IoT': 65,
    'E-commerce': 45,
    'Social Media': 30,
  };
  
  return trends[category] || 50;
}

function calculatePopularity(projectCount: number): number {
  return Math.min(100, projectCount * 10);
}

function calculateCompetitiveness(category: string): number {
  const competitive: Record<string, number> = {
    'E-commerce': 90,
    'Social Media': 85,
    'Gaming': 80,
    'Productivity': 60,
    'AI/ML': 70,
  };
  
  return competitive[category] || 50;
}

// New function to generate comprehensive insights from real data
export async function generateDataDrivenInsights(options: {
  useCache?: boolean;
  forceRefresh?: boolean;
  includePerformanceMetrics?: boolean;
} = {}) {
  const { useCache = true, forceRefresh = false, includePerformanceMetrics = false } = options;
  
  return await benchmarkAnalyticsOperation(
    async () => {
      try {
        // Use performance optimizer for better data retrieval
        const optimizedData = await analyticsOptimizer.getOptimizedProjectAnalytics({
          useCache,
          forceRefresh,
          timeRange: '30d',
          includeDetailedMetrics: true
        });

        // Get all projects with their data
        const projects = await prisma.project.findMany({
          select: {
            id: true,
            title: true,
            category: true,
            qualityScore: true,
            technicalComplexity: true,
            revenuePotential: true,
            competitionLevel: true,
            developmentTime: true,
            tags: true,
            createdAt: true,
            status: true,
          }
        });

    // Calculate real metrics
    const totalProjects = projects.length;
    const avgQualityScore = projects.reduce((sum, p) => sum + (p.qualityScore || 0), 0) / totalProjects;
    
    // Parse revenue potential (it's stored as a string like "$5K-20K MRR" or as JSON)
    const projectsWithRevenue = projects.map(p => {
      let revenue = 0;
      if (p.revenuePotential) {
        // First, try to parse as JSON (for older entries)
        try {
          const revenueObj = JSON.parse(p.revenuePotential);
          // Use realistic value if it's an object with that property
          if (revenueObj && typeof revenueObj === 'object' && revenueObj.realistic) {
            revenue = revenueObj.realistic;
          }
        } catch (e) {
          // If JSON parsing fails, parse as string format
          const revenueStr = p.revenuePotential.toLowerCase();
          // Extract numeric value
          const matches = revenueStr.match(/\d+/g);
          if (matches && matches.length > 0) {
            // Take the average if it's a range
            const values = matches.map(m => parseFloat(m));
            const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
            
            // Convert to yearly revenue
            if (revenueStr.includes('k')) {
              revenue = avgValue * 1000;
            } else if (revenueStr.includes('m')) {
              revenue = avgValue * 1000000;
            } else {
              revenue = avgValue;
            }
            
            // Convert MRR to yearly
            if (revenueStr.includes('mrr') || revenueStr.includes('monthly')) {
              revenue = revenue * 12;
            }
          }
        }
      }
      
      return { ...p, parsedRevenue: revenue };
    });
    
    const totalRevenuePotential = projectsWithRevenue.reduce((sum, p) => 
      sum + p.parsedRevenue, 0
    );
    const avgRevenuePotential = totalRevenuePotential / totalProjects;

    // Category analysis with real data
    const categoryAnalysis = projectsWithRevenue.reduce((acc, project) => {
      const category = project.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalQuality: 0,
          totalRevenue: 0,
          highQualityCount: 0,
          projects: []
        };
      }
      
      // Use the already parsed revenue from projectsWithRevenue
      const revenue = project.parsedRevenue;
      
      acc[category].count++;
      acc[category].totalQuality += project.qualityScore || 0;
      acc[category].totalRevenue += revenue;
      acc[category].projects.push({ id: project.id, title: project.title });
      
      if ((project.qualityScore || 0) >= 8) {
        acc[category].highQualityCount++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Find top performing categories
    const categoryStats = Object.entries(categoryAnalysis).map(([category, stats]) => ({
      category,
      avgQuality: stats.totalQuality / stats.count,
      avgRevenue: stats.totalRevenue / stats.count,
      projectCount: stats.count,
      highQualityRatio: stats.highQualityCount / stats.count,
      projects: stats.projects
    }));

    // Sort by opportunity score (combination of quality and revenue)
    categoryStats.sort((a, b) => {
      const scoreA = (a.avgQuality * 0.4 + (a.avgRevenue / 1000) * 0.6);
      const scoreB = (b.avgQuality * 0.4 + (b.avgRevenue / 1000) * 0.6);
      return scoreB - scoreA;
    });

    // Identify trends (projects created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentProjects = projects.filter(p => p.createdAt > thirtyDaysAgo);
    const recentCategories = recentProjects.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Competition analysis
    const competitionLevels = projects.reduce((acc, p) => {
      const level = p.competitionLevel || 'Medium';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Combine optimized data with calculated metrics
    const result = {
      summary: {
        totalProjects,
        avgQualityScore,
        avgRevenuePotential,
        totalRevenuePotential,
        topCategory: categoryStats[0]?.category || 'None',
        recentGrowthRate: (recentProjects.length / totalProjects) * 100
      },
      categoryStats,
      recentTrends: recentCategories,
      competitionAnalysis: competitionLevels,
      qualityDistribution: {
        excellent: projects.filter(p => (p.qualityScore || 0) >= 8).length,
        good: projects.filter(p => (p.qualityScore || 0) >= 6 && (p.qualityScore || 0) < 8).length,
        average: projects.filter(p => (p.qualityScore || 0) >= 4 && (p.qualityScore || 0) < 6).length,
        poor: projects.filter(p => (p.qualityScore || 0) < 4).length
      },
      projects, // Include projects for additional analysis
      optimizedMetrics: {
        cacheUsed: optimizedData.cacheKey ? true : false,
        generatedAt: optimizedData.generatedAt,
        dataFreshness: optimizedData.generatedAt
      }
    };

    // Add performance insights if requested
    if (includePerformanceMetrics) {
      const performanceInsights = await analyticsOptimizer.getPerformanceInsights();
      result.performanceInsights = performanceInsights;
    }

    return result;
      } catch (error) {
        console.error('Error generating data-driven insights:', error);
        throw error;
      }
    },
    'data_driven_insights_generation',
    { useCache, forceRefresh, includePerformanceMetrics }
  );
}

// Service object for easier importing
export const aiInsightsService = {
  generateProjectInsights,
  generateCategoryInsights,
  generateDataDrivenInsights,
};