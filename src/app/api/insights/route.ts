import { NextRequest, NextResponse } from 'next/server';
import { aiInsightsService } from '@/lib/ai-insights';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation' | 'optimization';
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  project_ids: string[];
  data_points: any[];
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const type = searchParams.get('type') || undefined;
    const minConfidence = searchParams.get('min_confidence') 
      ? parseInt(searchParams.get('min_confidence')!) 
      : undefined;
    
    // Get current user for tracking
    const user = await getCurrentUser();
    
    // Generate AI insights
    const insightsReport = await aiInsightsService.generateCompleteReport({
      category,
      type,
      minConfidence
    });
    
    // Save the generated insights to database for tracking
    if (user && insightsReport.executiveSummary.keyInsights.length > 0) {
      await Promise.all(
        insightsReport.executiveSummary.keyInsights.slice(0, 3).map(insight =>
          prisma.aIInsight.create({
            data: {
              type: insight.type,
              title: insight.title,
              description: insight.description,
              confidence: insight.confidence,
              impact: insight.impact,
              category: insight.category,
              metadata: JSON.stringify({
                dataPoints: insight.dataPoints,
                actionItems: insight.actionItems,
                projectIds: insight.projectIds
              })
            }
          })
        )
      );
    }
    
    // Format response to match expected structure
    const response = {
      executive_summary: {
        key_insights: insightsReport.executiveSummary.keyInsights.map(formatInsight),
        market_trends: insightsReport.executiveSummary.marketTrends,
        opportunity_score: insightsReport.executiveSummary.opportunityScore,
        risk_score: insightsReport.executiveSummary.riskScore,
        total_insights: insightsReport.executiveSummary.totalInsights
      },
      opportunity_insights: insightsReport.opportunityInsights.map(formatInsight),
      risk_insights: insightsReport.riskInsights.map(formatInsight),
      trend_insights: insightsReport.trendInsights.map(formatInsight),
      optimization_insights: insightsReport.optimizationInsights.map(formatInsight),
      recommendations: insightsReport.recommendations.map(formatInsight),
      category_insights: insightsReport.categoryInsights,
      market_analysis: insightsReport.marketAnalysis
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

function formatInsight(insight: any) {
  return {
    id: insight.id,
    title: insight.title,
    description: insight.description,
    type: insight.type,
    confidence: insight.confidence,
    impact: insight.impact,
    category: insight.category,
    project_ids: insight.projectIds,
    data_points: insight.dataPoints,
    action_items: insight.actionItems,
    priority_score: insight.priorityScore,
    generated_at: insight.generatedAt.toISOString()
  };
}

// Old mock functions removed - now using AI insights service
/*
async function generateInsights(projects: any[]): Promise<InsightsReport> {
  const insights: Insight[] = [];
  
  // Analyze project data to generate insights
  const categoryStats = analyzeCategoryTrends(projects);
  const revenuePatterns = analyzeRevenuePatterns(projects);
  const complexityInsights = analyzeComplexityPatterns(projects);
  const competitionAnalysis = analyzeCompetitionLandscape(projects);
  const qualityPatterns = analyzeQualityPatterns(projects);
  
  // Generate opportunity insights
  const opportunityInsights = generateOpportunityInsights(projects, categoryStats, revenuePatterns);
  
  // Generate risk insights
  const riskInsights = generateRiskInsights(projects, competitionAnalysis);
  
  // Generate trend insights
  const trendInsights = generateTrendInsights(projects, categoryStats);
  
  // Generate optimization insights
  const optimizationInsights = generateOptimizationInsights(projects, complexityInsights, qualityPatterns);
  
  // Generate recommendations
  const recommendations = generateRecommendations(projects, categoryStats, revenuePatterns);

  // Combine all insights
  insights.push(...opportunityInsights, ...riskInsights, ...trendInsights, ...optimizationInsights, ...recommendations);

  // Calculate scores
  const opportunityScore = calculateOpportunityScore(projects, opportunityInsights);
  const riskScore = calculateRiskScore(projects, riskInsights);

  // Generate market trends
  const marketTrends = generateMarketTrends(projects, categoryStats);

  // Generate category-specific insights
  const categoryInsights = generateCategoryInsights(projects, insights);

  // Generate market analysis
  const marketAnalysis = generateMarketAnalysis(projects, categoryStats, revenuePatterns);

  // Get top insights for executive summary
  const keyInsights = insights
    .sort((a, b) => b.priority_score - a.priority_score)
    .slice(0, 5);

  return {
    executive_summary: {
      key_insights: keyInsights,
      market_trends: marketTrends,
      opportunity_score: opportunityScore,
      risk_score: riskScore,
      total_insights: insights.length,
    },
    opportunity_insights: opportunityInsights,
    risk_insights: riskInsights,
    trend_insights: trendInsights,
    optimization_insights: optimizationInsights,
    recommendations: recommendations,
    category_insights: categoryInsights,
    market_analysis: marketAnalysis,
  };
}

function analyzeCategoryTrends(projects: any[]): Record<string, any> {
  const categoryData: Record<string, any> = {};
  
  projects.forEach(project => {
    const category = project.category || 'Uncategorized';
    if (!categoryData[category]) {
      categoryData[category] = {
        count: 0,
        total_revenue: 0,
        total_quality: 0,
        total_complexity: 0,
        competition_levels: [],
        development_times: [],
        projects: []
      };
    }
    
    categoryData[category].count++;
    categoryData[category].total_revenue += project.revenue_potential?.realistic || 0;
    categoryData[category].total_quality += project.quality_score || 0;
    categoryData[category].total_complexity += project.technical_complexity || 0;
    categoryData[category].competition_levels.push(project.competition_level?.toLowerCase() || 'medium');
    categoryData[category].development_times.push(project.development_time || '');
    categoryData[category].projects.push(project);
  });

  // Calculate averages and additional metrics
  Object.values(categoryData).forEach((data: any) => {
    data.avg_revenue = data.total_revenue / data.count;
    data.avg_quality = data.total_quality / data.count;
    data.avg_complexity = data.total_complexity / data.count;
    data.high_competition_ratio = data.competition_levels.filter((level: string) => level.includes('high')).length / data.count;
    data.low_competition_ratio = data.competition_levels.filter((level: string) => level.includes('low')).length / data.count;
  });

  return categoryData;
}

function analyzeRevenuePatterns(projects: any[]): any {
  const revenueRanges = {
    'low': projects.filter(p => (p.revenue_potential?.realistic || 0) < 2000).length,
    'medium': projects.filter(p => {
      const revenue = p.revenue_potential?.realistic || 0;
      return revenue >= 2000 && revenue < 8000;
    }).length,
    'high': projects.filter(p => (p.revenue_potential?.realistic || 0) >= 8000).length,
  };

  const topRevenue = projects
    .sort((a, b) => (b.revenue_potential?.realistic || 0) - (a.revenue_potential?.realistic || 0))
    .slice(0, 10);

  const avgRevenue = projects.reduce((sum, p) => sum + (p.revenue_potential?.realistic || 0), 0) / projects.length;

  return {
    distribution: revenueRanges,
    top_projects: topRevenue,
    average: avgRevenue,
    total: projects.reduce((sum, p) => sum + (p.revenue_potential?.realistic || 0), 0),
  };
}

function analyzeComplexityPatterns(projects: any[]): any {
  const complexityRevenue: Record<number, { total_revenue: number; count: number; projects: any[] }> = {};
  
  projects.forEach(project => {
    const complexity = project.technical_complexity || 0;
    if (!complexityRevenue[complexity]) {
      complexityRevenue[complexity] = { total_revenue: 0, count: 0, projects: [] };
    }
    complexityRevenue[complexity].total_revenue += project.revenue_potential?.realistic || 0;
    complexityRevenue[complexity].count++;
    complexityRevenue[complexity].projects.push(project);
  });

  const complexityAnalysis = Object.entries(complexityRevenue).map(([complexity, data]) => ({
    complexity: parseInt(complexity),
    avg_revenue: data.total_revenue / data.count,
    count: data.count,
    projects: data.projects
  }));

  return {
    by_complexity: complexityAnalysis,
    sweet_spot: complexityAnalysis.find(c => c.avg_revenue === Math.max(...complexityAnalysis.map(c => c.avg_revenue))),
  };
}

function analyzeCompetitionLandscape(projects: any[]): any {
  const competitionData = {
    low: projects.filter(p => (p.competition_level || '').toLowerCase().includes('low')),
    medium: projects.filter(p => (p.competition_level || '').toLowerCase().includes('medium')),
    high: projects.filter(p => (p.competition_level || '').toLowerCase().includes('high')),
  };

  const lowCompetitionHighRevenue = competitionData.low
    .filter(p => (p.revenue_potential?.realistic || 0) > 5000)
    .sort((a, b) => (b.revenue_potential?.realistic || 0) - (a.revenue_potential?.realistic || 0));

  return {
    distribution: {
      low: competitionData.low.length,
      medium: competitionData.medium.length,
      high: competitionData.high.length,
    },
    opportunities: lowCompetitionHighRevenue,
    oversaturated: competitionData.high.filter(p => (p.revenue_potential?.realistic || 0) < 3000),
  };
}

function analyzeQualityPatterns(projects: any[]): any {
  const qualityRanges = {
    'excellent': projects.filter(p => (p.quality_score || 0) >= 8),
    'good': projects.filter(p => {
      const score = p.quality_score || 0;
      return score >= 6 && score < 8;
    }),
    'average': projects.filter(p => {
      const score = p.quality_score || 0;
      return score >= 4 && score < 6;
    }),
    'poor': projects.filter(p => (p.quality_score || 0) < 4),
  };

  return {
    distribution: qualityRanges,
    improvement_candidates: qualityRanges.poor.concat(qualityRanges.average),
  };
}

function generateOpportunityInsights(projects: any[], categoryStats: any, revenuePatterns: any): Insight[] {
  const insights: Insight[] = [];

  // Undervalued categories opportunity
  const undervaluedCategories = Object.entries(categoryStats)
    .filter(([_, data]: [string, any]) => data.avg_revenue < revenuePatterns.average && data.low_competition_ratio > 0.6)
    .sort((a: any, b: any) => b[1].low_competition_ratio - a[1].low_competition_ratio);

  if (undervaluedCategories.length > 0) {
    insights.push({
      id: 'undervalued-categories',
      title: 'Undervalued Market Categories',
      description: `${undervaluedCategories.length} categories show low competition but below-average revenue, indicating potential for innovative solutions.`,
      type: 'opportunity',
      confidence: 85,
      impact: 'high',
      project_ids: undervaluedCategories.flatMap(([_, data]: [string, any]) => data.projects.map((p: any) => p.id)).slice(0, 10),
      data_points: undervaluedCategories.map(([category, data]: [string, any]) => ({
        category,
        avg_revenue: data.avg_revenue,
        competition_ratio: data.low_competition_ratio,
        project_count: data.count
      })),
      action_items: [
        'Focus on developing innovative solutions in these categories',
        'Research market gaps and user pain points',
        'Consider premium positioning strategies',
        'Leverage first-mover advantages'
      ],
      priority_score: 90,
      generated_at: new Date().toISOString(),
    });
  }

  // High-revenue, low-complexity opportunities
  const easyWins = projects.filter(p => 
    (p.revenue_potential?.realistic || 0) > 5000 && 
    (p.technical_complexity || 0) <= 4
  ).sort((a, b) => (b.revenue_potential?.realistic || 0) - (a.revenue_potential?.realistic || 0));

  if (easyWins.length > 0) {
    insights.push({
      id: 'quick-wins',
      title: 'Quick Win Opportunities',
      description: `${easyWins.length} high-revenue projects with low technical complexity offer excellent ROI potential.`,
      type: 'opportunity',
      confidence: 95,
      impact: 'high',
      project_ids: easyWins.slice(0, 10).map(p => p.id),
      data_points: easyWins.slice(0, 5).map(p => ({
        title: p.title,
        revenue: p.revenue_potential?.realistic,
        complexity: p.technical_complexity,
        ratio: (p.revenue_potential?.realistic || 0) / Math.max(p.technical_complexity || 1, 1)
      })),
      action_items: [
        'Prioritize these projects for immediate development',
        'Allocate resources to maximize quick wins',
        'Use profits to fund more complex projects',
        'Build momentum with early successes'
      ],
      priority_score: 95,
      generated_at: new Date().toISOString(),
    });
  }

  return insights;
}

function generateRiskInsights(projects: any[], competitionAnalysis: any): Insight[] {
  const insights: Insight[] = [];

  // Oversaturated market risk
  if (competitionAnalysis.oversaturated.length > 0) {
    insights.push({
      id: 'market-saturation',
      title: 'Market Saturation Risk',
      description: `${competitionAnalysis.oversaturated.length} projects face high competition with low revenue potential.`,
      type: 'risk',
      confidence: 80,
      impact: 'medium',
      project_ids: competitionAnalysis.oversaturated.map((p: any) => p.id),
      data_points: competitionAnalysis.oversaturated.slice(0, 5).map((p: any) => ({
        title: p.title,
        category: p.category,
        revenue: p.revenue_potential?.realistic,
        competition: p.competition_level
      })),
      action_items: [
        'Identify unique differentiators for these projects',
        'Consider pivoting to adjacent markets',
        'Focus on niche targeting',
        'Delay development until market conditions improve'
      ],
      priority_score: 70,
      generated_at: new Date().toISOString(),
    });
  }

  return insights;
}

function generateTrendInsights(projects: any[], categoryStats: any): Insight[] {
  const insights: Insight[] = [];

  // AI/Browser tools trend
  const aiProjects = projects.filter(p => 
    (p.category || '').toLowerCase().includes('ai') || 
    (p.title || '').toLowerCase().includes('ai')
  );

  if (aiProjects.length > 10) {
    insights.push({
      id: 'ai-trend',
      title: 'AI Integration Trend',
      description: `${aiProjects.length} projects leverage AI capabilities, indicating strong market demand for intelligent automation.`,
      type: 'trend',
      confidence: 90,
      impact: 'high',
      project_ids: aiProjects.slice(0, 10).map(p => p.id),
      data_points: [{
        ai_projects: aiProjects.length,
        avg_revenue: aiProjects.reduce((sum, p) => sum + (p.revenue_potential?.realistic || 0), 0) / aiProjects.length,
        categories: Array.from(new Set(aiProjects.map(p => p.category)))
      }],
      action_items: [
        'Integrate AI features into existing projects',
        'Explore AI-powered user experiences',
        'Research emerging AI technologies',
        'Position products around AI capabilities'
      ],
      priority_score: 85,
      generated_at: new Date().toISOString(),
    });
  }

  return insights;
}

function generateOptimizationInsights(projects: any[], complexityInsights: any, qualityPatterns: any): Insight[] {
  const insights: Insight[] = [];

  // Quality improvement opportunity
  if (qualityPatterns.improvement_candidates.length > 0) {
    insights.push({
      id: 'quality-optimization',
      title: 'Quality Score Optimization',
      description: `${qualityPatterns.improvement_candidates.length} projects have potential for significant quality improvements.`,
      type: 'optimization',
      confidence: 75,
      impact: 'medium',
      project_ids: qualityPatterns.improvement_candidates.slice(0, 15).map((p: any) => p.id),
      data_points: [{
        low_quality_count: qualityPatterns.distribution.poor.length,
        average_quality_count: qualityPatterns.distribution.average.length,
        improvement_potential: '2-4 point quality score increase possible'
      }],
      action_items: [
        'Review and enhance project documentation',
        'Improve problem and solution descriptions',
        'Add missing key features',
        'Validate revenue models and assumptions'
      ],
      priority_score: 60,
      generated_at: new Date().toISOString(),
    });
  }

  return insights;
}

function generateRecommendations(projects: any[], categoryStats: any, revenuePatterns: any): Insight[] {
  const insights: Insight[] = [];

  // Portfolio diversification recommendation
  const dominantCategory = Object.entries(categoryStats)
    .sort((a: any, b: any) => b[1].count - a[1].count)[0];

  if (dominantCategory && (dominantCategory[1] as any).count > projects.length * 0.3) {
    insights.push({
      id: 'portfolio-diversification',
      title: 'Portfolio Diversification',
      description: `${(dominantCategory[1] as any).count} projects (${Math.round((dominantCategory[1] as any).count / projects.length * 100)}%) are in ${dominantCategory[0]}. Consider diversifying.`,
      type: 'recommendation',
      confidence: 85,
      impact: 'medium',
      category: dominantCategory[0] as string,
      project_ids: [],
      data_points: [{
        dominant_category: dominantCategory[0],
        concentration: (dominantCategory[1] as any).count / projects.length,
        risk_level: 'Medium to High'
      }],
      action_items: [
        'Explore opportunities in other categories',
        'Reduce dependency on single market segment',
        'Balance portfolio risk and return',
        'Research emerging market categories'
      ],
      priority_score: 75,
      generated_at: new Date().toISOString(),
    });
  }

  return insights;
}

function calculateOpportunityScore(projects: any[], opportunities: Insight[]): number {
  const factors = {
    high_revenue_projects: projects.filter(p => (p.revenue_potential?.realistic || 0) > 10000).length / projects.length,
    low_competition_projects: projects.filter(p => (p.competition_level || '').toLowerCase().includes('low')).length / projects.length,
    opportunity_insights: opportunities.length,
    avg_confidence: opportunities.reduce((sum, o) => sum + o.confidence, 0) / Math.max(opportunities.length, 1),
  };

  return Math.min(100, (factors.high_revenue_projects * 30 + factors.low_competition_projects * 25 + 
                       (factors.opportunity_insights / 10) * 25 + factors.avg_confidence * 0.2));
}

function calculateRiskScore(projects: any[], risks: Insight[]): number {
  const factors = {
    high_competition_projects: projects.filter(p => (p.competition_level || '').toLowerCase().includes('high')).length / projects.length,
    low_revenue_projects: projects.filter(p => (p.revenue_potential?.realistic || 0) < 1000).length / projects.length,
    risk_insights: risks.length,
    portfolio_concentration: Math.max(...Object.values(analyzeCategoryTrends(projects)).map((data: any) => data.count)) / projects.length,
  };

  return Math.min(100, (factors.high_competition_projects * 30 + factors.low_revenue_projects * 25 + 
                       factors.risk_insights * 15 + factors.portfolio_concentration * 30));
}

function generateMarketTrends(projects: any[], categoryStats: any): MarketTrend[] {
  const trends: MarketTrend[] = [];

  // AI integration trend
  const aiCategories = Object.keys(categoryStats).filter(cat => cat.toLowerCase().includes('ai'));
  if (aiCategories.length > 0) {
    trends.push({
      trend_name: 'AI-Powered Solutions',
      direction: 'rising',
      strength: 85,
      affected_categories: aiCategories,
      evidence: [
        `${aiCategories.length} categories focus on AI integration`,
        'Growing demand for intelligent automation',
        'High revenue potential in AI projects'
      ],
      implications: [
        'Prioritize AI features in product development',
        'Invest in AI/ML capabilities',
        'Target AI-ready market segments'
      ]
    });
  }

  return trends;
}

function generateCategoryInsights(projects: any[], insights: Insight[]): Record<string, any> {
  const categoryInsights: Record<string, any> = {};
  const categoryStats = analyzeCategoryTrends(projects);

  Object.entries(categoryStats).forEach(([category, stats]: [string, any]) => {
    const categorySpecificInsights = insights.filter(i => 
      i.category === category || 
      i.project_ids.some(pid => stats.projects.some((p: any) => p.id === pid))
    );

    const opportunityScore = Math.min(100, 
      (stats.avg_revenue / 1000) * 20 + 
      stats.low_competition_ratio * 40 + 
      (stats.avg_quality / 10) * 40
    );

    categoryInsights[category] = {
      category,
      opportunity_score: opportunityScore,
      risk_level: stats.high_competition_ratio > 0.6 ? 'High' : 
                 stats.high_competition_ratio > 0.3 ? 'Medium' : 'Low',
      key_insights: categorySpecificInsights,
      recommended_actions: generateCategoryActions(stats, categorySpecificInsights),
    };
  });

  return categoryInsights;
}

function generateCategoryActions(stats: any, insights: Insight[]): string[] {
  const actions: string[] = [];

  if (stats.avg_revenue < 2000) {
    actions.push('Focus on premium positioning and value proposition');
  }

  if (stats.high_competition_ratio > 0.5) {
    actions.push('Develop unique differentiators and niche targeting');
  }

  if (stats.avg_quality < 6) {
    actions.push('Improve project documentation and feature specifications');
  }

  if (stats.low_competition_ratio > 0.6) {
    actions.push('Accelerate development to capture first-mover advantage');
  }

  return actions;
}

function generateMarketAnalysis(projects: any[], categoryStats: any, revenuePatterns: any): any {
  const categories = Object.entries(categoryStats);

  const emergingOpportunities = categories
    .filter(([_, data]: [string, any]) => data.count < 50 && data.avg_revenue > revenuePatterns.average)
    .sort((a: any, b: any) => b[1].avg_revenue - a[1].avg_revenue)
    .slice(0, 5)
    .map(([category, data]: [string, any]) => ({
      category,
      potential: Math.round((data.avg_revenue / revenuePatterns.average) * 100),
      reasoning: `Low project count (${data.count}) but high average revenue ($${Math.round(data.avg_revenue)})`
    }));

  const saturatedMarkets = categories
    .filter(([_, data]: [string, any]) => data.count > 80 && data.high_competition_ratio > 0.6)
    .sort((a: any, b: any) => b[1].high_competition_ratio - a[1].high_competition_ratio)
    .slice(0, 3)
    .map(([category, data]: [string, any]) => ({
      category,
      saturation_level: Math.round(data.high_competition_ratio * 100),
      reasoning: `High project count (${data.count}) with ${Math.round(data.high_competition_ratio * 100)}% high competition`
    }));

  const innovationGaps = [
    {
      area: 'Cross-Platform Integration',
      description: 'Few projects focus on seamless integration across multiple platforms',
      potential_solutions: ['Universal APIs', 'Platform-agnostic tools', 'Integration marketplaces']
    },
    {
      area: 'Privacy-First Solutions',
      description: 'Growing demand for privacy-focused alternatives to existing tools',
      potential_solutions: ['Zero-knowledge tools', 'Local-first applications', 'Decentralized platforms']
    },
    {
      area: 'Accessibility Innovation',
      description: 'Limited focus on accessibility features in most categories',
      potential_solutions: ['AI-powered accessibility', 'Voice interfaces', 'Adaptive UIs']
    }
  ];

  return {
    emerging_opportunities: emergingOpportunities,
    saturated_markets: saturatedMarkets,
    innovation_gaps: innovationGaps,
  };
}
*/