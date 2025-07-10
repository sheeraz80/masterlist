import { NextRequest, NextResponse } from 'next/server';
import { aiInsightsService } from '@/lib/ai-insights';
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
    
      // Get category insights from existing service
      const categoryInsights = await aiInsightsService.generateCategoryInsights();
      
      // Generate mock insights data that matches the expected format
      const insightsReport = await generateMockInsightsReport(categoryInsights, {
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

async function generateMockInsightsReport(categoryInsights: any[], filters: any): Promise<InsightsReport> {
  // Generate mock insights that match the expected format
  const mockInsights: Insight[] = [
    {
      id: 'insight_1',
      title: 'AI/ML Projects Show Strong Market Potential',
      description: 'Machine learning and AI projects demonstrate higher than average revenue potential and market demand.',
      type: 'opportunity',
      confidence: 85,
      impact: 'high',
      category: 'AI/ML',
      project_ids: ['ai-content-detector', 'ai-form-filler', 'ai-research-assistant'],
      data_points: [{ category: 'AI/ML', avg_revenue: 125000, project_count: 120 }],
      action_items: [
        'Focus development resources on AI/ML projects',
        'Investigate partnerships with AI infrastructure providers',
        'Consider specialized AI talent acquisition'
      ],
      priority_score: 90,
      generated_at: new Date().toISOString()
    },
    {
      id: 'insight_2',
      title: 'Browser Extension Market Saturation Risk',
      description: 'High competition in browser extension space may limit growth potential for new projects.',
      type: 'risk',
      confidence: 75,
      impact: 'medium',
      category: 'Browser/Web',
      project_ids: ['web-clipper', 'ad-blocker-pro', 'privacy-guardian'],
      data_points: [{ category: 'Browser/Web', competition_level: 'high', saturation: 78 }],
      action_items: [
        'Focus on unique value propositions',
        'Consider niche market segments',
        'Prioritize user experience differentiation'
      ],
      priority_score: 70,
      generated_at: new Date().toISOString()
    },
    {
      id: 'insight_3',
      title: 'Productivity Tools Show Consistent Growth',
      description: 'Productivity and workflow optimization tools maintain steady demand across market segments.',
      type: 'trend',
      confidence: 80,
      impact: 'medium',
      category: 'Productivity',
      project_ids: ['task-manager-pro', 'note-taking-app', 'calendar-sync'],
      data_points: [{ category: 'Productivity', growth_rate: 15, market_demand: 'stable' }],
      action_items: [
        'Develop cross-platform productivity solutions',
        'Focus on integration capabilities',
        'Consider subscription-based revenue models'
      ],
      priority_score: 75,
      generated_at: new Date().toISOString()
    }
  ];

  // Filter insights based on provided filters
  let filteredInsights = mockInsights;
  if (filters.type && filters.type !== 'all') {
    filteredInsights = filteredInsights.filter(insight => insight.type === filters.type);
  }
  if (filters.category && filters.category !== 'all') {
    filteredInsights = filteredInsights.filter(insight => insight.category === filters.category);
  }
  if (filters.minConfidence && filters.minConfidence > 0) {
    filteredInsights = filteredInsights.filter(insight => insight.confidence >= filters.minConfidence);
  }

  // Generate market trends
  const marketTrends: MarketTrend[] = [
    {
      trend_name: 'AI Integration Acceleration',
      direction: 'rising',
      strength: 90,
      affected_categories: ['AI/ML', 'Productivity', 'Content Creation'],
      evidence: [
        'Increased venture capital funding in AI startups',
        'Growing enterprise adoption of AI tools',
        'Consumer demand for AI-powered features'
      ],
      implications: [
        'Higher development costs for AI capabilities',
        'Competitive advantage for early AI adopters',
        'Need for specialized AI talent and infrastructure'
      ]
    },
    {
      trend_name: 'Privacy-First Solutions',
      direction: 'rising',
      strength: 75,
      affected_categories: ['Browser/Web', 'Communication', 'Data Management'],
      evidence: [
        'Stricter data protection regulations',
        'Consumer awareness of privacy issues',
        'Browser vendors implementing privacy features'
      ],
      implications: [
        'Opportunity for privacy-focused alternatives',
        'Need for transparent data handling',
        'Potential for premium privacy features'
      ]
    }
  ];

  // Build category insights from real data
  const categoryInsightsMap: Record<string, any> = {};
  for (const cat of categoryInsights) {
    categoryInsightsMap[cat.category] = {
      category: cat.category,
      opportunity_score: cat.trends.growth,
      risk_level: cat.trends.competitiveness > 70 ? 'high' : cat.trends.competitiveness > 40 ? 'medium' : 'low',
      key_insights: filteredInsights.filter(insight => insight.category === cat.category),
      recommended_actions: [
        `Leverage ${cat.category} market trends`,
        `Monitor competition in ${cat.category} space`,
        'Focus on unique value propositions'
      ]
    };
  }

  return {
    executive_summary: {
      key_insights: filteredInsights.slice(0, 3),
      market_trends: marketTrends,
      opportunity_score: 75,
      risk_score: 35,
      total_insights: filteredInsights.length
    },
    opportunity_insights: filteredInsights.filter(i => i.type === 'opportunity'),
    risk_insights: filteredInsights.filter(i => i.type === 'risk'),
    trend_insights: filteredInsights.filter(i => i.type === 'trend'),
    optimization_insights: filteredInsights.filter(i => i.type === 'optimization'),
    recommendations: filteredInsights.filter(i => i.type === 'recommendation'),
    category_insights: categoryInsightsMap,
    market_analysis: {
      emerging_opportunities: [
        {
          category: 'AI/ML',
          potential: 85,
          reasoning: 'High growth demand with relatively low barrier to entry for specialized solutions'
        },
        {
          category: 'Climate Tech',
          potential: 70,
          reasoning: 'Growing environmental awareness driving demand for sustainability solutions'
        }
      ],
      saturated_markets: [
        {
          category: 'Social Media',
          saturation_level: 85,
          reasoning: 'Dominated by established platforms with high user acquisition costs'
        },
        {
          category: 'Basic E-commerce',
          saturation_level: 75,
          reasoning: 'Mature market with intense price competition and low margins'
        }
      ],
      innovation_gaps: [
        {
          area: 'AI-Powered Personal Assistants',
          description: 'Gap between consumer expectations and current AI assistant capabilities',
          potential_solutions: [
            'Context-aware AI that learns from user behavior',
            'Specialized AI for specific professional domains',
            'Privacy-preserving AI that runs locally'
          ]
        }
      ]
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