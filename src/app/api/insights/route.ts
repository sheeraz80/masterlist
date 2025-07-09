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
              category: insight.category || null,
              projectIds: JSON.stringify(insight.projectIds || []),
              metadata: JSON.stringify({
                dataPoints: insight.dataPoints,
                actionItems: insight.actionItems
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
    // eslint-disable-next-line no-console
    console.error('Insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
  }),
  rateLimits.expensive
);

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