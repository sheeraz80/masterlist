import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';
import { ProjectSuccessPredictor, AnomalyDetector, SentimentAnalyzer } from '@/lib/analytics/ml-predictor';
import { ComparativeAnalytics } from '@/lib/analytics/realtime-analytics';

interface InsightsResponse {
  predictions: {
    high_success_projects: Array<{
      id: string;
      title: string;
      success_probability: number;
      risk_level: string;
      factors: { positive: string[]; negative: string[] };
    }>;
    at_risk_projects: Array<{
      id: string;
      title: string;
      success_probability: number;
      risk_level: string;
      factors: { positive: string[]; negative: string[] };
    }>;
  };
  anomalies: {
    revenue_anomalies: Array<{ date: string; value: number; expected: number }>;
    activity_anomalies: Array<{ date: string; value: number; expected: number }>;
    quality_anomalies: Array<{ project_id: string; title: string; score: number; expected: number }>;
  };
  comparative: {
    best_performers: any[];
    underperformers: any[];
    recommendations: string[];
    benchmarks: Record<string, any>;
  };
  sentiment: {
    overall: { positive: number; neutral: number; negative: number };
    trending_positive: string[];
    trending_negative: string[];
  };
}

export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, _user: AuthUser | null) => {
    try {
      // Fetch all necessary data
      const [projects, activities, comments] = await Promise.all([
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
        prisma.activity.findMany({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.comment.findMany({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          },
          include: {
            project: {
              select: { title: true }
            }
          }
        })
      ]);

      // Initialize analytics engines
      const predictor = new ProjectSuccessPredictor();
      const anomalyDetector = new AnomalyDetector();
      const comparativeAnalytics = new ComparativeAnalytics();
      const sentimentAnalyzer = new SentimentAnalyzer();

      // For demo purposes, we'll use mock training data
      // In production, you'd load this from historical success data
      await predictor.initialize();

      // 1. Project Success Predictions
      const projectsWithFeatures = projects.map(project => ({
        ...project,
        features: {
          qualityScore: project.qualityScore || 5,
          technicalComplexity: project.technicalComplexity || 5,
          revenuePotential: JSON.parse(project.revenuePotential || '{}').realistic || 0,
          categoryPopularity: 0.5, // Would calculate from category distribution
          competitionLevel: project.competitionLevel === 'Low' ? 1 : 
                          project.competitionLevel === 'Medium' ? 2 : 
                          project.competitionLevel === 'High' ? 3 : 4,
          teamSize: 1, // Would get from team data
          activitiesCount: project._count.activities
        }
      }));

      // For demo, simulate predictions
      const predictions = projectsWithFeatures.map(project => ({
        id: project.id,
        title: project.title,
        success_probability: Math.random() * 0.4 + 0.5, // 0.5-0.9 for demo
        risk_level: Math.random() > 0.7 ? 'low' : Math.random() > 0.4 ? 'medium' : 'high',
        factors: {
          positive: ['Strong market demand', 'Experienced team'],
          negative: ['High competition', 'Complex implementation']
        }
      }));

      const highSuccessProjects = predictions
        .filter(p => p.success_probability > 0.7)
        .sort((a, b) => b.success_probability - a.success_probability)
        .slice(0, 5);

      const atRiskProjects = predictions
        .filter(p => p.success_probability < 0.5)
        .sort((a, b) => a.success_probability - b.success_probability)
        .slice(0, 5);

      // 2. Anomaly Detection
      const revenueValues = projects
        .map(p => JSON.parse(p.revenuePotential || '{}').realistic || 0)
        .filter(v => v > 0);
      
      const revenueAnomalies = anomalyDetector.detectAnomalies(revenueValues);
      
      const qualityScores = projects.map(p => p.qualityScore || 0).filter(v => v > 0);
      const qualityAnomalies = anomalyDetector.detectAnomalies(qualityScores);

      // Daily activity counts
      const dailyActivities = new Map<string, number>();
      activities.forEach(activity => {
        const date = activity.createdAt.toISOString().split('T')[0];
        dailyActivities.set(date, (dailyActivities.get(date) || 0) + 1);
      });

      const activityCounts = Array.from(dailyActivities.values());
      const activityAnomalies = anomalyDetector.detectAnomalies(activityCounts);

      // 3. Comparative Analytics
      const comparativeResults = comparativeAnalytics.compareProjects(
        projects.map(p => ({
          ...p,
          revenue_potential: JSON.parse(p.revenuePotential || '{}').realistic || 0,
          activities_count: p._count.activities,
          quality_score: p.qualityScore,
          technical_complexity: p.technicalComplexity,
          competition_level: p.competitionLevel === 'Low' ? 1 : 
                           p.competitionLevel === 'Medium' ? 2 : 
                           p.competitionLevel === 'High' ? 3 : 4
        }))
      );

      const benchmarks = comparativeAnalytics.generateBenchmarks(projects);

      // 4. Sentiment Analysis
      const commentSentiments = comments.map(comment => ({
        ...sentimentAnalyzer.analyze(comment.content),
        projectTitle: comment.project.title
      }));

      const sentimentCounts = {
        positive: commentSentiments.filter(s => s.sentiment === 'positive').length,
        neutral: commentSentiments.filter(s => s.sentiment === 'neutral').length,
        negative: commentSentiments.filter(s => s.sentiment === 'negative').length
      };

      const total = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative;
      const sentimentPercentages = {
        positive: total > 0 ? (sentimentCounts.positive / total) * 100 : 0,
        neutral: total > 0 ? (sentimentCounts.neutral / total) * 100 : 0,
        negative: total > 0 ? (sentimentCounts.negative / total) * 100 : 0
      };

      // Group sentiments by project
      const projectSentiments = new Map<string, { positive: number; negative: number }>();
      commentSentiments.forEach(sentiment => {
        if (!projectSentiments.has(sentiment.projectTitle)) {
          projectSentiments.set(sentiment.projectTitle, { positive: 0, negative: 0 });
        }
        const counts = projectSentiments.get(sentiment.projectTitle)!;
        if (sentiment.sentiment === 'positive') counts.positive++;
        if (sentiment.sentiment === 'negative') counts.negative++;
      });

      const trendingPositive = Array.from(projectSentiments.entries())
        .filter(([_, counts]) => counts.positive > counts.negative)
        .sort((a, b) => b[1].positive - a[1].positive)
        .slice(0, 3)
        .map(([title]) => title);

      const trendingNegative = Array.from(projectSentiments.entries())
        .filter(([_, counts]) => counts.negative > 0)
        .sort((a, b) => b[1].negative - a[1].negative)
        .slice(0, 3)
        .map(([title]) => title);

      // Build response
      const insights: InsightsResponse = {
        predictions: {
          high_success_projects: highSuccessProjects,
          at_risk_projects: atRiskProjects
        },
        anomalies: {
          revenue_anomalies: revenueAnomalies.map(index => ({
            date: new Date().toISOString().split('T')[0],
            value: revenueValues[index],
            expected: revenueValues.reduce((a, b) => a + b) / revenueValues.length
          })),
          activity_anomalies: activityAnomalies.map(index => {
            const dates = Array.from(dailyActivities.keys());
            return {
              date: dates[index] || new Date().toISOString().split('T')[0],
              value: activityCounts[index],
              expected: activityCounts.reduce((a, b) => a + b) / activityCounts.length
            };
          }),
          quality_anomalies: qualityAnomalies.map(index => ({
            project_id: projects[index]?.id || '',
            title: projects[index]?.title || 'Unknown',
            score: qualityScores[index],
            expected: qualityScores.reduce((a, b) => a + b) / qualityScores.length
          }))
        },
        comparative: {
          best_performers: comparativeResults.bestPerformers.slice(0, 5),
          underperformers: comparativeResults.underperformers.slice(0, 5),
          recommendations: comparativeResults.recommendations,
          benchmarks: Object.fromEntries(benchmarks)
        },
        sentiment: {
          overall: sentimentPercentages,
          trending_positive: trendingPositive,
          trending_negative: trendingNegative
        }
      };

      return NextResponse.json(insights);
    } catch (error) {
      console.error('Error generating insights:', error);
      return NextResponse.json(
        { error: 'Failed to generate insights' },
        { status: 500 }
      );
    }
  }),
  rateLimits.read
);