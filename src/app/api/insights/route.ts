import { NextRequest, NextResponse } from 'next/server';
import { aiInsightsService } from '@/lib/ai-insights';
import { marketDataService } from '@/lib/market-data';
import { analyticsOptimizer } from '@/lib/performance/analytics-optimizer';
import { prisma } from '@/lib/prisma';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation' | 'optimization';
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  project_ids: string[];
  related_projects?: Array<{ id: string; title: string }>;
  data_points: Array<Record<string, unknown>>;
  action_items: string[];
  priority_score: number;
  generated_at: string;
}

interface MarketTrend {
  trend_name: string;
  direction: 'rising' | 'declining' | 'stable';
  strength: number; // 0-100
  affected_categories: string[];
  evidence: string[];
  implications: string[];
}

interface InsightsReport {
  executive_summary: {
    key_insights: Insight[];
    market_trends: MarketTrend[];
    opportunity_score: number;
    risk_score: number;
    total_insights: number;
  };
  opportunity_insights: Insight[];
  risk_insights: Insight[];
  trend_insights: Insight[];
  optimization_insights: Insight[];
  recommendations: Insight[];
  category_insights: Record<string, {
    category: string;
    opportunity_score: number;
    risk_level: string;
    key_insights: Insight[];
    recommended_actions: string[];
  }>;
  market_analysis: {
    emerging_opportunities: {
      category: string;
      potential: number;
      reasoning: string;
    }[];
    saturated_markets: {
      category: string;
      saturation_level: number;
      reasoning: string;
    }[];
    innovation_gaps: {
      area: string;
      description: string;
      potential_solutions: string[];
    }[];
  };
}

export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category') || undefined;
      const type = searchParams.get('type') || undefined;
      const minConfidence = searchParams.get('min_confidence') 
        ? parseInt(searchParams.get('min_confidence')!) 
        : undefined;
    
      // Check if database is connected
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch (dbError) {
        console.error('Database connection error:', dbError);
        return NextResponse.json(
          { error: 'Database connection failed', details: 'Unable to connect to database' },
          { status: 503 }
        );
      }

      // Get real data insights from both internal and external sources
      let realData, categoryInsights, marketData;
      
      try {
        // Get performance options from query params
        const useCache = searchParams.get('use_cache') !== 'false';
        const forceRefresh = searchParams.get('force_refresh') === 'true';
        const includePerformanceMetrics = searchParams.get('include_performance') === 'true';
        const useStreaming = searchParams.get('use_streaming') === 'true';
        
        // Use streaming analytics for large datasets
        if (useStreaming) {
          const streamingResults = await analyticsOptimizer.getStreamingAnalytics({
            batchSize: 500,
            includeProjects: true,
            onBatch: (batch, progress) => {
              // Could emit progress via WebSocket here
              console.log(`Processing batch: ${progress.toFixed(1)}% complete`);
            }
          });
          
          // Process streaming results into insights format
          realData = {
            summary: {
              totalProjects: streamingResults.data.length,
              avgQualityScore: streamingResults.data.reduce((sum, p) => sum + p.qualityScore, 0) / streamingResults.data.length,
              avgRevenuePotential: 0, // Will be calculated from streaming data
              totalRevenuePotential: 0,
              topCategory: 'Unknown',
              recentGrowthRate: 0
            },
            categoryStats: [],
            performanceMetrics: streamingResults.metadata
          };
        } else {
          // Use optimized analytics
          [realData, categoryInsights] = await Promise.all([
            aiInsightsService.generateDataDrivenInsights({
              useCache,
              forceRefresh,
              includePerformanceMetrics
            }),
            aiInsightsService.generateCategoryInsights()
          ]);
        }
      } catch (dataError) {
        console.error('Error fetching insights data:', dataError);
        
        // Return a minimal response with fallback data
        return NextResponse.json(getFallbackInsightsReport());
      }
      
      // Now fetch market data with top categories (can fail gracefully)
      try {
        const topCategories = categoryInsights.slice(0, 5).map(c => c.category);
        marketData = await marketDataService.analyzeMarketTrends(topCategories);
      } catch (marketError) {
        console.error('Market data fetch failed (non-critical):', marketError);
        marketData = { 
          trends: [], 
          analysis: { 
            hottest_categories: [],
            market_opportunities: [],
            regional_opportunities: [],
            developer_sentiment: null,
            emerging_technologies: []
          } 
        };
      }
      
      // Generate insights report with both internal and external data
      const insightsReport = await generateRealInsightsReport(realData, marketData, {
        category,
        type,
        minConfidence
      });
    
      return NextResponse.json(insightsReport);
    } catch (error) {
      console.error('Insights error:', error);
      
      // Return detailed error for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      
      return NextResponse.json(
        { 
          error: 'Failed to generate insights',
          message: errorMessage,
          stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
        },
        { status: 500 }
      );
    }
  }),
  rateLimits.expensive
);

// Fallback insights report when database is unavailable
function getFallbackInsightsReport(): InsightsReport {
  const fallbackInsight: Insight = {
    id: 'fallback_1',
    title: 'System Insights Temporarily Unavailable',
    description: 'Real-time insights are being generated. Please check back in a moment.',
    type: 'recommendation',
    confidence: 100,
    impact: 'low',
    category: 'System',
    project_ids: [],
    data_points: [],
    action_items: ['Refresh the page', 'Check system status'],
    priority_score: 50,
    generated_at: new Date().toISOString()
  };

  const fallbackTrend: MarketTrend = {
    trend_name: 'Data Loading',
    direction: 'stable',
    strength: 0,
    affected_categories: [],
    evidence: ['System is initializing'],
    implications: ['Insights will be available shortly']
  };

  return {
    executive_summary: {
      key_insights: [fallbackInsight],
      market_trends: [fallbackTrend],
      opportunity_score: 0,
      risk_score: 0,
      total_insights: 1
    },
    opportunity_insights: [],
    risk_insights: [],
    trend_insights: [],
    optimization_insights: [],
    recommendations: [fallbackInsight],
    category_insights: {},
    market_analysis: {
      emerging_opportunities: [],
      saturated_markets: [],
      innovation_gaps: []
    }
  };
}

async function generateRealInsightsReport(realData: any, marketData: any, filters: any): Promise<InsightsReport> {
  // Handle case where realData might be null or empty
  if (!realData || !realData.summary) {
    return getFallbackInsightsReport();
  }

  const { summary, categoryStats, recentTrends, competitionAnalysis, qualityDistribution, projects } = realData;
  
  // Generate insights based on real data
  const insights: Insight[] = [];
  
  // Top performing category insight
  if (categoryStats && categoryStats.length > 0) {
    const topCategory = categoryStats[0];
    const categoryAvgRevenue = topCategory.avgRevenue || 0;
    const portfolioAvgRevenue = summary.avgRevenuePotential || 0;
    const revenueAdvantage = portfolioAvgRevenue > 0 
      ? ((categoryAvgRevenue - portfolioAvgRevenue) / portfolioAvgRevenue * 100).toFixed(1)
      : '0';
    
    insights.push({
      id: 'insight_category_leader',
      title: `${topCategory.category} Projects Lead Portfolio Performance`,
      description: `${topCategory.category} projects average $${Math.round(categoryAvgRevenue).toLocaleString()} revenue potential (${revenueAdvantage}% above portfolio average) with ${(topCategory.highQualityRatio * 100).toFixed(0)}% scoring 8+ quality.`,
      type: 'opportunity',
      confidence: 92,
      impact: 'high',
      category: topCategory.category,
      project_ids: topCategory.projects.slice(0, 5).map((p: any) => p.id),
      related_projects: topCategory.projects.slice(0, 5),
      data_points: [{
        category: topCategory.category,
        avg_revenue: Math.round(categoryAvgRevenue),
        avg_quality: topCategory.avgQuality?.toFixed(1) || '0',
        project_count: topCategory.projectCount || 0,
        high_quality_ratio: topCategory.highQualityRatio || 0
      }],
      action_items: [
        `Prioritize ${topCategory.category} projects for immediate development`,
        `Allocate resources to maintain quality standards in this category`,
        `Study successful patterns in top-performing ${topCategory.category} projects`
      ],
      priority_score: 95,
      generated_at: new Date().toISOString()
    });
  }
  
  // Quality distribution insight
  const totalProjects = summary.totalProjects || 1;
  const excellentRatio = (qualityDistribution?.excellent || 0) / totalProjects * 100;
  const poorRatio = (qualityDistribution?.poor || 0) / totalProjects * 100;
  
  // Always add quality risk insight
  insights.push({
    id: 'insight_quality_risk',
    title: 'Quality Standards Need Attention',
    description: `${poorRatio.toFixed(1)}% of projects score below 4.0, indicating potential quality issues. Only ${excellentRatio.toFixed(1)}% achieve excellent ratings (8+).`,
    type: 'risk',
    confidence: 88,
    impact: 'medium',
    category: 'Portfolio Health',
    project_ids: [],
    data_points: [{
      excellent_projects: qualityDistribution?.excellent || 0,
      good_projects: qualityDistribution?.good || 0,
      average_projects: qualityDistribution?.average || 0,
      poor_projects: qualityDistribution?.poor || 0,
      avg_quality_score: summary.avgQualityScore?.toFixed(1) || '0'
    }],
    action_items: [
      'Review and improve evaluation criteria for low-scoring projects',
      'Implement quality improvement initiatives',
      'Consider removing or pivoting poor-performing projects'
    ],
    priority_score: 75,
    generated_at: new Date().toISOString()
  });
  
  // Competition analysis insight
  const highCompetition = competitionAnalysis?.['High'] || 0;
  const competitionRatio = (highCompetition / totalProjects * 100);
  
  // Always add competition risk
  insights.push({
    id: 'insight_competition_warning',
    title: 'High Competition in Multiple Sectors',
    description: `${competitionRatio.toFixed(0)}% of projects face high competition. Focus on differentiation and niche markets to improve success rates.`,
    type: 'risk',
    confidence: 85,
    impact: 'high',
    category: 'Market Analysis',
    project_ids: [],
    data_points: [competitionAnalysis || {}],
    action_items: [
      'Prioritize unique value propositions in competitive markets',
      'Consider pivoting high-competition projects to niche segments',
      'Invest in innovation to differentiate from competitors'
    ],
    priority_score: 80,
    generated_at: new Date().toISOString()
  });
  
  // Revenue potential insight
  const totalRevenue = summary.totalRevenuePotential || 0;
  const avgRevenue = summary.avgRevenuePotential || 0;
  const topRevenueCategories = categoryStats?.slice(0, 3).filter(c => c.avgRevenue > avgRevenue) || [];
  
  insights.push({
    id: 'insight_revenue_opportunity',
    title: `$${(totalRevenue / 1000000).toFixed(1)}M Total Revenue Potential Identified`,
    description: `Portfolio shows $${Math.round(avgRevenue).toLocaleString()} average revenue per project. ${topRevenueCategories.map(c => c.category).join(', ')} lead in revenue generation.`,
    type: 'opportunity',
    confidence: 90,
    impact: 'high',
    category: 'Revenue Analysis',
    project_ids: [],
    data_points: [{
      total_revenue_potential: totalRevenue,
      avg_revenue_per_project: Math.round(avgRevenue),
      top_revenue_categories: topRevenueCategories.map(c => ({
        category: c.category,
        avg_revenue: Math.round(c.avgRevenue || 0)
      }))
    }],
    action_items: [
      'Focus resources on high-revenue potential categories',
      'Develop go-to-market strategies for top projects',
      'Create revenue optimization plans for underperforming categories'
    ],
    priority_score: 90,
    generated_at: new Date().toISOString()
  });
  
  // Growth trend insight
  const growthRate = summary.recentGrowthRate || 0;
  const trendingCategories = recentTrends 
    ? Object.entries(recentTrends)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
    : [];
  
  insights.push({
    id: 'insight_growth_trend',
    title: 'Portfolio Showing Active Growth',
    description: `${growthRate.toFixed(1)}% of projects added in last 30 days. ${trendingCategories.map(([cat]) => cat).join(', ')} show highest activity.`,
    type: 'trend',
    confidence: 87,
    impact: 'medium',
    category: 'Growth Analysis',
    project_ids: [],
    data_points: [{
      recent_growth_rate: growthRate,
      trending_categories: Object.fromEntries(trendingCategories)
    }],
    action_items: [
      'Maintain momentum in trending categories',
      'Analyze success factors in growing segments',
      'Scale resources to support growth areas'
    ],
    priority_score: 78,
    generated_at: new Date().toISOString()
  });

  // Filter insights based on provided filters
  let filteredInsights = insights;
  if (filters.type && filters.type !== 'all') {
    filteredInsights = filteredInsights.filter(insight => insight.type === filters.type);
  }
  if (filters.category && filters.category !== 'all') {
    filteredInsights = filteredInsights.filter(insight => insight.category === filters.category);
  }
  if (filters.minConfidence && filters.minConfidence > 0) {
    filteredInsights = filteredInsights.filter(insight => insight.confidence >= filters.minConfidence);
  }

  // Generate market trends based on real data
  const marketTrends: MarketTrend[] = [];
  
  // Quality trend
  const qualityTrend = (qualityDistribution?.excellent || 0) > (qualityDistribution?.poor || 0) ? 'rising' : 'declining';
  marketTrends.push({
    trend_name: 'Portfolio Quality Evolution',
    direction: qualityTrend,
    strength: Math.round(Math.abs(excellentRatio - poorRatio)),
    affected_categories: categoryStats?.slice(0, 3).map(c => c.category) || [],
    evidence: [
      `${excellentRatio.toFixed(1)}% of projects achieve excellent ratings`,
      `Average quality score: ${summary.avgQualityScore?.toFixed(1) || '0'}`,
      `${qualityDistribution?.good || 0} projects in good quality range`
    ],
    implications: [
      qualityTrend === 'rising' ? 'Quality improvements driving portfolio value' : 'Quality issues may impact portfolio performance',
      'Focus on best practices from high-scoring projects',
      'Consider quality-based resource allocation'
    ]
  });

  // Build category insights from real data
  const categoryInsightsMap: Record<string, any> = {};
  if (categoryStats) {
    for (const cat of categoryStats) {
      const categoryScore = ((cat.avgQuality || 0) * 0.4 + ((cat.avgRevenue || 0) / 1000) * 0.6);
      const competitionLevel = competitionAnalysis?.[cat.category] || 0;
      
      categoryInsightsMap[cat.category] = {
        category: cat.category,
        opportunity_score: Math.min(100, Math.round(categoryScore)),
        risk_level: competitionLevel > 70 ? 'high' : competitionLevel > 40 ? 'medium' : 'low',
        key_insights: filteredInsights.filter(insight => insight.category === cat.category),
        recommended_actions: [
          `${cat.highQualityRatio > 0.5 ? 'Maintain' : 'Improve'} quality standards in ${cat.category}`,
          `Target $${Math.round((cat.avgRevenue || 0) * 1.2).toLocaleString()} revenue potential per project`,
          cat.projectCount > 50 ? 'Consider market segmentation' : 'Expand project portfolio'
        ]
      };
    }
  }

  return {
    executive_summary: {
      key_insights: filteredInsights.slice(0, 3),
      market_trends: marketTrends,
      opportunity_score: Math.round((summary.avgQualityScore || 0) * 10 + (topRevenueCategories.length * 5)),
      risk_score: Math.round(competitionRatio + (poorRatio * 0.5)),
      total_insights: filteredInsights.length
    },
    opportunity_insights: filteredInsights.filter(i => i.type === 'opportunity'),
    risk_insights: filteredInsights.filter(i => i.type === 'risk'),
    trend_insights: filteredInsights.filter(i => i.type === 'trend'),
    optimization_insights: filteredInsights.filter(i => i.type === 'optimization'),
    recommendations: filteredInsights.filter(i => i.type === 'recommendation'),
    category_insights: categoryInsightsMap,
    market_analysis: {
      emerging_opportunities: categoryStats
        ?.filter(cat => cat.projectCount < 20 && (cat.avgRevenue || 0) > avgRevenue)
        .slice(0, 3)
        .map(cat => ({
          category: cat.category,
          potential: Math.round((cat.avgQuality || 0) * 10 + ((cat.avgRevenue || 0) / avgRevenue * 50)),
          reasoning: `Low competition (${cat.projectCount} projects) with ${(((cat.avgRevenue || 0) / avgRevenue - 1) * 100).toFixed(0)}% above-average revenue potential`
        })) || [],
      saturated_markets: categoryStats
        ?.filter(cat => cat.projectCount > 50)
        .sort((a, b) => b.projectCount - a.projectCount)
        .slice(0, 3)
        .map(cat => ({
          category: cat.category,
          saturation_level: Math.min(95, Math.round(cat.projectCount / totalProjects * 200)),
          reasoning: `High concentration with ${cat.projectCount} projects (${(cat.projectCount / totalProjects * 100).toFixed(1)}% of portfolio)`
        })) || [],
      innovation_gaps: categoryStats
        ?.filter(cat => (cat.avgQuality || 0) < (summary.avgQualityScore || 0) && (cat.avgRevenue || 0) > avgRevenue)
        .slice(0, 2)
        .map(cat => ({
          area: `${cat.category} Quality Enhancement`,
          description: `${cat.category} shows revenue potential but quality scores lag at ${cat.avgQuality?.toFixed(1) || '0'} vs ${summary.avgQualityScore?.toFixed(1) || '0'} average`,
          potential_solutions: [
            `Improve ${cat.category} project evaluation criteria`,
            `Invest in quality improvements for high-revenue potential`,
            `Study successful patterns from other categories`
          ]
        })) || []
    }
  };
}