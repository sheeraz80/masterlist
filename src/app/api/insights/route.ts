import { NextRequest, NextResponse } from 'next/server';
import { aiInsightsService } from '@/lib/ai-insights';
import { marketDataService } from '@/lib/market-data';
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
    
      // Get real data insights from both internal and external sources
      const [realData, categoryInsights, marketData] = await Promise.all([
        aiInsightsService.generateDataDrivenInsights(),
        aiInsightsService.generateCategoryInsights(),
        null // Placeholder for market data
      ]);
      
      // Now fetch market data with top categories
      const topCategories = categoryInsights.slice(0, 5).map(c => c.category);
      const enhancedMarketData = await marketDataService.analyzeMarketTrends(topCategories);
      
      // Generate insights report with both internal and external data
      const insightsReport = await generateRealInsightsReport(realData, enhancedMarketData, {
        category,
        type,
        minConfidence
      });
    
      return NextResponse.json(insightsReport);
    } catch (error) {
      console.error('Insights error:', error);
      return NextResponse.json(
        { error: 'Failed to generate insights' },
        { status: 500 }
      );
    }
  }),
  rateLimits.expensive
);

async function generateRealInsightsReport(realData: any, marketData: any, filters: any): Promise<InsightsReport> {
  const { summary, categoryStats, recentTrends, competitionAnalysis, qualityDistribution, projects } = realData;
  
  // Generate insights based on real data
  const insights: Insight[] = [];
  
  // Top performing category insight
  if (categoryStats.length > 0) {
    const topCategory = categoryStats[0];
    const categoryAvgRevenue = topCategory.avgRevenue;
    const portfolioAvgRevenue = summary.avgRevenuePotential;
    const revenueAdvantage = ((categoryAvgRevenue - portfolioAvgRevenue) / portfolioAvgRevenue * 100).toFixed(1);
    
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
        avg_quality: topCategory.avgQuality.toFixed(1),
        project_count: topCategory.projectCount,
        high_quality_ratio: topCategory.highQualityRatio
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
  const excellentRatio = (qualityDistribution.excellent / summary.totalProjects * 100);
  const poorRatio = (qualityDistribution.poor / summary.totalProjects * 100);
  
  // Always add quality risk insight
  if (true) {
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
        excellent_projects: qualityDistribution.excellent,
        good_projects: qualityDistribution.good,
        average_projects: qualityDistribution.average,
        poor_projects: qualityDistribution.poor,
        avg_quality_score: summary.avgQualityScore.toFixed(1)
      }],
      action_items: [
        'Review and improve evaluation criteria for low-scoring projects',
        'Implement quality improvement initiatives',
        'Consider removing or pivoting poor-performing projects'
      ],
      priority_score: 75,
      generated_at: new Date().toISOString()
    });
  }
  
  // Competition analysis insight
  const highCompetition = competitionAnalysis['High'] || 0;
  const competitionRatio = (highCompetition / summary.totalProjects * 100);
  
  // Always add competition risk
  if (true) {
    insights.push({
      id: 'insight_competition_warning',
      title: 'High Competition in Multiple Sectors',
      description: `${competitionRatio.toFixed(0)}% of projects face high competition. Focus on differentiation and niche markets to improve success rates.`,
      type: 'risk',
      confidence: 85,
      impact: 'high',
      category: 'Market Analysis',
      project_ids: [],
      data_points: [competitionAnalysis],
      action_items: [
        'Prioritize unique value propositions in competitive markets',
        'Consider pivoting high-competition projects to niche segments',
        'Invest in innovation to differentiate from competitors'
      ],
      priority_score: 80,
      generated_at: new Date().toISOString()
    });
  }
  
  // Revenue potential insight
  const totalRevenue = summary.totalRevenuePotential;
  const topRevenueCategories = categoryStats.slice(0, 3).filter(c => c.avgRevenue > summary.avgRevenuePotential);
  
  insights.push({
    id: 'insight_revenue_opportunity',
    title: `$${(totalRevenue / 1000000).toFixed(1)}M Total Revenue Potential Identified`,
    description: `Portfolio shows $${Math.round(summary.avgRevenuePotential).toLocaleString()} average revenue per project. ${topRevenueCategories.map(c => c.category).join(', ')} lead in revenue generation.`,
    type: 'opportunity',
    confidence: 90,
    impact: 'high',
    category: 'Revenue Analysis',
    project_ids: [],
    data_points: [{
      total_revenue_potential: totalRevenue,
      avg_revenue_per_project: Math.round(summary.avgRevenuePotential),
      top_revenue_categories: topRevenueCategories.map(c => ({
        category: c.category,
        avg_revenue: Math.round(c.avgRevenue)
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
  
  // Growth trend insight - always generate
  if (true) {
    const trendingCategories = Object.entries(recentTrends)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    insights.push({
      id: 'insight_growth_trend',
      title: 'Portfolio Showing Active Growth',
      description: `${summary.recentGrowthRate.toFixed(1)}% of projects added in last 30 days. ${trendingCategories.map(([cat]) => cat).join(', ')} show highest activity.`,
      type: 'trend',
      confidence: 87,
      impact: 'medium',
      category: 'Growth Analysis',
      project_ids: [],
      data_points: [{
        recent_growth_rate: summary.recentGrowthRate,
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
  }
  
  // Enhanced market validation with multiple sources
  if (marketData.trends.length > 0) {
    const validatedCategories = categoryStats.filter(cat => {
      const marketTrend = marketData.trends.find(t => 
        t.keyword.toLowerCase() === cat.category.toLowerCase()
      );
      return marketTrend && marketTrend.trend_value > 60;
    });
    
    if (validatedCategories.length > 0) {
      const topValidated = validatedCategories[0];
      const marketTrend = marketData.trends.find(t => 
        t.keyword.toLowerCase() === topValidated.category.toLowerCase()
      );
      
      // Find supporting evidence from other sources
      const redditSupport = marketData.redditTrends?.filter(r => 
        r.title.toLowerCase().includes(topValidated.category.toLowerCase())
      ).length || 0;
      
      const devArticles = marketData.devToArticles?.filter(d => 
        d.tags.some(tag => tag.toLowerCase().includes(topValidated.category.toLowerCase()))
      ).length || 0;
      
      const confidenceBoost = (redditSupport > 0 ? 2 : 0) + (devArticles > 0 ? 1 : 0);
      
      insights.push({
        id: 'insight_market_validation',
        title: `${topValidated.category} Validated by Multiple Market Signals`,
        description: `${topValidated.category} shows ${marketTrend?.trend_value}% Google Trends interest (${marketTrend?.direction}), ${redditSupport} Reddit discussions, and ${devArticles} trending developer articles.`,
        type: 'opportunity',
        confidence: Math.min(99, 94 + confidenceBoost),
        impact: 'high',
        category: topValidated.category,
        project_ids: topValidated.projects.slice(0, 3).map((p: any) => p.id),
        related_projects: topValidated.projects.slice(0, 3),
        data_points: [{
          internal_metrics: {
            avg_revenue: topValidated.avgRevenue,
            project_count: topValidated.projectCount,
            quality_score: topValidated.avgQuality
          },
          external_validation: {
            google_trends_score: marketTrend?.trend_value,
            trend_direction: marketTrend?.direction,
            related_topics: marketTrend?.related_topics,
            reddit_discussions: redditSupport,
            dev_articles: devArticles,
            top_regions: marketTrend?.geographic_data?.slice(0, 3).map(g => g.region)
          }
        }],
        action_items: [
          `Accelerate ${topValidated.category} development to capture market momentum`,
          `Target top regions: ${marketTrend?.geographic_data?.slice(0, 3).map(g => g.region).join(', ')}`,
          `Research trending subtopics: ${marketTrend?.related_topics?.slice(0, 3).join(', ')}`,
          'Leverage multi-source validation for investor communications'
        ],
        priority_score: 96,
        generated_at: new Date().toISOString()
      });
    }
  }
  
  // Regional opportunity insight
  if (marketData.analysis?.regional_opportunities?.length > 0) {
    const topRegion = marketData.analysis.regional_opportunities[0];
    
    insights.push({
      id: 'insight_regional_opportunity',
      title: `${topRegion.region} Shows Strongest Market Interest`,
      description: `${topRegion.region} demonstrates ${topRegion.strength}% average interest across ${topRegion.categories.join(', ')} categories, presenting localization opportunities.`,
      type: 'opportunity',
      confidence: 86,
      impact: 'medium',
      category: 'Geographic Expansion',
      project_ids: [],
      data_points: [{
        regional_data: marketData.analysis.regional_opportunities.slice(0, 5),
        top_categories_by_region: topRegion.categories
      }],
      action_items: [
        `Consider ${topRegion.region}-specific features or partnerships`,
        `Translate key projects for ${topRegion.region} market`,
        'Research local regulations and market conditions',
        'Connect with regional developer communities'
      ],
      priority_score: 82,
      generated_at: new Date().toISOString()
    });
  }
  
  // GitHub trending insight
  if (marketData.githubProjects.length > 0) {
    const techLanguages = marketData.githubProjects
      .map(p => p.language)
      .filter(l => l && l !== 'Unknown');
    
    const topLanguage = techLanguages[0] || 'Python';
    const relatedProjects = marketData.githubProjects
      .filter(p => p.language === topLanguage)
      .slice(0, 2);
    
    insights.push({
      id: 'insight_github_trends',
      title: 'GitHub Trends Signal Technology Shifts',
      description: `${topLanguage} dominates trending repositories with ${relatedProjects.length} top projects. Consider ${topLanguage}-based implementations for competitive advantage.`,
      type: 'trend',
      confidence: 82,
      impact: 'medium',
      category: 'Technology Trends',
      project_ids: [],
      data_points: [{
        trending_languages: techLanguages.slice(0, 5),
        top_projects: relatedProjects.map(p => ({
          name: p.name,
          stars: p.stars,
          description: p.description
        }))
      }],
      action_items: [
        `Evaluate ${topLanguage} for new project implementations`,
        `Study architecture patterns from: ${relatedProjects.map(p => p.name).join(', ')}`,
        'Monitor GitHub trends monthly for technology shifts'
      ],
      priority_score: 73,
      generated_at: new Date().toISOString()
    });
  }
  
  // Community sentiment and emerging tech insight
  if (marketData.hackerNewsTopics.length > 0 || marketData.analysis?.developer_sentiment) {
    const emergingTech = marketData.analysis.emerging_technologies;
    const sentiment = marketData.analysis.developer_sentiment;
    
    if (emergingTech.length > 0) {
      insights.push({
        id: 'insight_emerging_tech',
        title: 'Developer Community Signals New Opportunities',
        description: `Community discussions highlight ${emergingTech.slice(0, 3).join(', ')} as emerging technologies. Positive sentiment around: ${sentiment?.positive_topics?.slice(0, 2).join(', ') || 'innovation'}.`,
        type: 'opportunity',
        confidence: 83,
        impact: 'medium',
        category: 'Market Intelligence',
        project_ids: [],
        data_points: [{
          emerging_technologies: emergingTech,
          developer_sentiment: sentiment,
          top_discussions: marketData.hackerNewsTopics.slice(0, 3).map(s => ({
            title: s.title,
            score: s.score,
            engagement: s.descendants
          })),
          trending_on_product_hunt: marketData.productHuntItems?.slice(0, 2).map(p => ({
            name: p.name,
            votes: p.votes_count,
            topics: p.topics
          }))
        }],
        action_items: [
          `Research ${emergingTech[0]} integration opportunities`,
          `Build with trending tools: ${sentiment?.trending_tools?.slice(0, 3).join(', ') || 'modern stack'}`,
          'Monitor tech community discussions for early signals',
          `Address developer concerns: ${sentiment?.concerns?.[0] || 'performance'}`
        ],
        priority_score: 75,
        generated_at: new Date().toISOString()
      });
    }
  }
  
  // Add portfolio diversification risk
  const categoryCounts = categoryStats.map(c => c.projectCount);
  const maxCategorySize = Math.max(...categoryCounts);
  const categoryConcentration = (maxCategorySize / summary.totalProjects * 100);
  
  if (categoryConcentration > 15) {
    insights.push({
      id: 'insight_diversification_risk',
      title: 'Portfolio Concentration Risk Detected',
      description: `${categoryConcentration.toFixed(0)}% of projects are concentrated in a single category. Consider diversifying to reduce market risk.`,
      type: 'risk',
      confidence: 85,
      impact: 'medium',
      category: 'Portfolio Risk',
      project_ids: [],
      data_points: [{
        concentration_percentage: categoryConcentration,
        dominant_category: categoryStats[0].category,
        category_distribution: categoryStats.slice(0, 5).map(c => ({
          category: c.category,
          percentage: (c.projectCount / summary.totalProjects * 100).toFixed(1)
        }))
      }],
      action_items: [
        'Diversify portfolio across multiple categories',
        'Identify emerging markets for expansion',
        'Balance risk with strategic category allocation'
      ],
      priority_score: 72,
      generated_at: new Date().toISOString()
    });
  }
  
  // Add technology adoption trend
  const techComplexityDistribution = projects.reduce((acc, p) => {
    const complexity = p.technicalComplexity || 'Medium';
    acc[complexity] = (acc[complexity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  insights.push({
    id: 'insight_tech_complexity_trend',
    title: 'Technology Complexity Trends',
    description: `Portfolio shows ${((techComplexityDistribution['High'] || 0) / summary.totalProjects * 100).toFixed(0)}% high-complexity projects, indicating ${techComplexityDistribution['High'] > techComplexityDistribution['Low'] ? 'advanced' : 'accessible'} technology focus.`,
    type: 'trend',
    confidence: 80,
    impact: 'medium',
    category: 'Technology Analysis',
    project_ids: [],
    data_points: [{
      complexity_distribution: techComplexityDistribution,
      high_complexity_ratio: ((techComplexityDistribution['High'] || 0) / summary.totalProjects * 100).toFixed(1),
      trend_direction: techComplexityDistribution['High'] > techComplexityDistribution['Low'] ? 'upward' : 'downward'
    }],
    action_items: [
      'Balance portfolio with varied complexity levels',
      'Ensure adequate resources for high-complexity projects',
      'Consider market readiness for advanced solutions'
    ],
    priority_score: 68,
    generated_at: new Date().toISOString()
  });
  
  // Product Hunt launch timing insight
  if (marketData.productHuntItems?.length > 0) {
    const topProducts = marketData.productHuntItems.slice(0, 3);
    const commonTopics = new Set<string>();
    topProducts.forEach(p => p.topics.forEach(t => commonTopics.add(t)));
    
    insights.push({
      id: 'insight_launch_timing',
      title: 'Product Launch Trends Signal Market Readiness',
      description: `Recent Product Hunt successes focus on ${Array.from(commonTopics).slice(0, 3).join(', ')}. Top launch garnered ${topProducts[0].votes_count} votes.`,
      type: 'trend',
      confidence: 77,
      impact: 'medium',
      category: 'Launch Strategy',
      project_ids: [],
      data_points: [{
        trending_products: topProducts.map(p => ({
          name: p.name,
          tagline: p.tagline,
          votes: p.votes_count,
          topics: p.topics
        })),
        common_topics: Array.from(commonTopics)
      }],
      action_items: [
        'Study successful launch patterns from top products',
        `Position products around trending topics: ${Array.from(commonTopics).slice(0, 3).join(', ')}`,
        'Prepare compelling taglines focusing on clear value props',
        'Build pre-launch community for initial momentum'
      ],
      priority_score: 68,
      generated_at: new Date().toISOString()
    });
  }

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
  
  // Analyze category trends
  const topGrowthCategories = Object.entries(recentTrends)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2);
  
  if (topGrowthCategories.length > 0) {
    const [topCategory, topCount] = topGrowthCategories[0];
    const growthStrength = Math.min(90, Math.round(topCount / summary.totalProjects * 1000));
    
    marketTrends.push({
      trend_name: `${topCategory} Sector Expansion`,
      direction: 'rising',
      strength: growthStrength,
      affected_categories: [topCategory, ...categoryStats.filter(c => c.category.includes(topCategory.split('/')[0])).map(c => c.category)].slice(0, 3),
      evidence: [
        `${topCount} new ${topCategory} projects in last 30 days`,
        `${categoryStats.find(c => c.category === topCategory)?.avgQuality.toFixed(1) || 'N/A'} average quality score`,
        `Growing portfolio concentration in this sector`
      ],
      implications: [
        `Increased competition expected in ${topCategory} space`,
        `Opportunity for specialized ${topCategory} solutions`,
        `Need for differentiation strategies`
      ]
    });
  }
  
  // Quality trend
  const qualityTrend = qualityDistribution.excellent > qualityDistribution.poor ? 'rising' : 'declining';
  marketTrends.push({
    trend_name: 'Portfolio Quality Evolution',
    direction: qualityTrend,
    strength: Math.round(Math.abs(excellentRatio - poorRatio)),
    affected_categories: categoryStats.slice(0, 3).map(c => c.category),
    evidence: [
      `${excellentRatio.toFixed(1)}% of projects achieve excellent ratings`,
      `Average quality score: ${summary.avgQualityScore.toFixed(1)}`,
      `${qualityDistribution.good} projects in good quality range`
    ],
    implications: [
      qualityTrend === 'rising' ? 'Quality improvements driving portfolio value' : 'Quality issues may impact portfolio performance',
      'Focus on best practices from high-scoring projects',
      'Consider quality-based resource allocation'
    ]
  });
  
  // Add comprehensive external market trends
  if (marketData.analysis.hottest_categories.length > 0) {
    marketTrends.push({
      trend_name: 'Multi-Source Market Validation',
      direction: 'rising',
      strength: 88,
      affected_categories: marketData.analysis.hottest_categories,
      evidence: [
        `Google Trends validates: ${marketData.analysis.hottest_categories.join(', ')}`,
        `${marketData.githubProjects.length} trending GitHub projects analyzed`,
        `${marketData.redditTrends?.length || 0} active Reddit discussions tracked`,
        `${marketData.devToArticles?.length || 0} trending developer articles`,
        `Top market opportunity: ${marketData.analysis.market_opportunities[0]?.confidence_score}% confidence`
      ],
      implications: [
        'Strong multi-source validation indicates market readiness',
        'Prioritize development in validated categories',
        'Leverage community engagement for growth',
        'Consider regional expansion strategies'
      ]
    });
  }
  
  // Developer ecosystem trend
  if (marketData.analysis?.developer_sentiment?.trending_tools?.length > 0) {
    const tools = marketData.analysis.developer_sentiment.trending_tools;
    marketTrends.push({
      trend_name: 'Developer Tool Adoption Shift',
      direction: 'rising',
      strength: 75,
      affected_categories: ['Developer Tools', 'Productivity', 'AI/ML'],
      evidence: [
        `Trending tools: ${tools.slice(0, 3).join(', ')}`,
        `${marketData.devToArticles?.length || 0} technical articles published`,
        'High engagement on developer platforms'
      ],
      implications: [
        `Build integrations with ${tools[0]} for developer adoption`,
        'Focus on developer experience and documentation',
        'Consider open-source strategies for community growth'
      ]
    });
  }

  // Build category insights from real data
  const categoryInsightsMap: Record<string, any> = {};
  for (const cat of categoryStats) {
    const categoryScore = (cat.avgQuality * 0.4 + (cat.avgRevenue / 1000) * 0.6);
    const competitionLevel = competitionAnalysis[cat.category] || 0;
    
    categoryInsightsMap[cat.category] = {
      category: cat.category,
      opportunity_score: Math.min(100, Math.round(categoryScore)),
      risk_level: competitionLevel > 70 ? 'high' : competitionLevel > 40 ? 'medium' : 'low',
      key_insights: filteredInsights.filter(insight => insight.category === cat.category),
      recommended_actions: [
        `${cat.highQualityRatio > 0.5 ? 'Maintain' : 'Improve'} quality standards in ${cat.category}`,
        `Target $${Math.round(cat.avgRevenue * 1.2).toLocaleString()} revenue potential per project`,
        cat.projectCount > 50 ? 'Consider market segmentation' : 'Expand project portfolio'
      ]
    };
  }

  return {
    executive_summary: {
      key_insights: filteredInsights.slice(0, 3),
      market_trends: marketTrends,
      opportunity_score: Math.round((summary.avgQualityScore * 10) + (topRevenueCategories.length * 5)),
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
        .filter(cat => cat.projectCount < 20 && cat.avgRevenue > summary.avgRevenuePotential)
        .slice(0, 3)
        .map(cat => ({
          category: cat.category,
          potential: Math.round(cat.avgQuality * 10 + (cat.avgRevenue / summary.avgRevenuePotential * 50)),
          reasoning: `Low competition (${cat.projectCount} projects) with ${((cat.avgRevenue / summary.avgRevenuePotential - 1) * 100).toFixed(0)}% above-average revenue potential`
        })),
      saturated_markets: categoryStats
        .filter(cat => cat.projectCount > 50)
        .sort((a, b) => b.projectCount - a.projectCount)
        .slice(0, 3)
        .map(cat => ({
          category: cat.category,
          saturation_level: Math.min(95, Math.round(cat.projectCount / summary.totalProjects * 200)),
          reasoning: `High concentration with ${cat.projectCount} projects (${(cat.projectCount / summary.totalProjects * 100).toFixed(1)}% of portfolio)`
        })),
      innovation_gaps: categoryStats
        .filter(cat => cat.avgQuality < summary.avgQualityScore && cat.avgRevenue > summary.avgRevenuePotential)
        .slice(0, 2)
        .map(cat => ({
          area: `${cat.category} Quality Enhancement`,
          description: `${cat.category} shows revenue potential but quality scores lag at ${cat.avgQuality.toFixed(1)} vs ${summary.avgQualityScore.toFixed(1)} average`,
          potential_solutions: [
            `Improve ${cat.category} project evaluation criteria`,
            `Invest in quality improvements for high-revenue potential`,
            `Study successful patterns from other categories`
          ]
        }))
    }
  };
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