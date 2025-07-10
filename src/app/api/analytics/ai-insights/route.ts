import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';
import { OllamaAnalytics } from '@/lib/analytics/ollama-insights';
import { mlClient } from '@/lib/analytics/ml-client';
import { SimpleProjectPredictor, SimpleAnomalyDetector, SimpleSentimentAnalyzer } from '@/lib/analytics/simple-predictor';
import { RealtimeAnalyticsEngine } from '@/lib/analytics/realtime-analytics';

export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, _user: AuthUser | null) => {
    const { searchParams } = new URL(request.url);
    const analysisType = searchParams.get('type') || 'overview';
    const projectId = searchParams.get('projectId');
    const question = searchParams.get('q');

    try {
      // Initialize analytics engines
      const ollamaAnalytics = new OllamaAnalytics();
      await ollamaAnalytics.initialize();
      
      // Check if ML Docker service is available
      let useMLService = false;
      try {
        const health = await mlClient.healthCheck();
        useMLService = health.gpu_available;
        console.log(`ML Service: ${useMLService ? 'GPU-accelerated' : 'CPU fallback'}`);
      } catch (e) {
        console.log('ML Docker service not available, using fallback');
      }
      
      // Use simple predictors as fallback
      const anomalyDetector = new SimpleAnomalyDetector();
      const sentimentAnalyzer = new SimpleSentimentAnalyzer();
      const realtimeEngine = new RealtimeAnalyticsEngine();

      // Fetch base data
      const projects = await prisma.project.findMany({
        include: {
          _count: {
            select: {
              comments: true,
              activities: true
            }
          }
        }
      });

      // Handle different analysis types
      switch (analysisType) {
        case 'project': {
          if (!projectId) {
            return NextResponse.json(
              { error: 'Project ID required' },
              { status: 400 }
            );
          }
          
          const project = projects.find(p => p.id === projectId);
          if (!project) {
            return NextResponse.json(
              { error: 'Project not found' },
              { status: 404 }
            );
          }

          const projectAnalysis = await ollamaAnalytics.analyzeProject(project);
          
          // Add ML predictions - use Docker service if available
          let mlPrediction;
          const features = {
            quality_score: project.qualityScore || 5,
            technical_complexity: project.technicalComplexity || 5,
            revenue_potential: JSON.parse(project.revenuePotential || '{}').realistic || 0,
            category_popularity: 0.5,
            competition_level: project.competitionLevel === 'Low' ? 1 : 
                            project.competitionLevel === 'Medium' ? 2 : 3,
            team_size: 1,
            activities_count: project._count.activities
          };
          
          if (useMLService) {
            mlPrediction = await mlClient.predict(features);
          } else {
            const simplePredictor = new SimpleProjectPredictor();
            mlPrediction = simplePredictor.predict({
              qualityScore: features.quality_score,
              technicalComplexity: features.technical_complexity,
              revenuePotential: features.revenue_potential,
              categoryPopularity: features.category_popularity,
              competitionLevel: features.competition_level,
              teamSize: features.team_size,
              activitiesCount: features.activities_count
            });
          }

          return NextResponse.json({
            analysis: projectAnalysis,
            prediction: mlPrediction
          });
        }

        case 'trends': {
          const trends = await ollamaAnalytics.predictTrends(projects);
          
          // Add anomaly detection
          const revenueValues = projects.map(p => 
            JSON.parse(p.revenuePotential || '{}').realistic || 0
          );
          const anomalies = anomalyDetector.detectAnomalies(revenueValues, 2.5);

          return NextResponse.json({
            trends,
            anomalies: anomalies.map(idx => ({
              project: projects[idx].title,
              value: revenueValues[idx]
            }))
          });
        }

        case 'strategy': {
          const strategy = await ollamaAnalytics.generateStrategicRecommendations(projects);
          
          return NextResponse.json(strategy);
        }

        case 'predictions': {
          try {
            // Get real project data for predictions
            const topProjects = projects
              .sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0))
              .slice(0, 10);

            const predictions = await Promise.all(
              topProjects.map(async (project) => {
                try {
                  const features = {
                    quality_score: project.qualityScore || 5,
                    technical_complexity: project.technicalComplexity || 5,
                    revenue_potential: JSON.parse(project.revenuePotential || '{}').realistic || 0,
                    category_popularity: 0.5,
                    competition_level: project.competitionLevel === 'Low' ? 1 : 
                                    project.competitionLevel === 'Medium' ? 2 : 3,
                    team_size: 1,
                    activities_count: project.activitiesCount || 0
                  };

                  // Try ML prediction, fallback to simple calculation
                  let prediction;
                  try {
                    prediction = await mlClient.predictSuccess(features);
                  } catch (mlError) {
                    // Fallback calculation
                    const qualityFactor = features.quality_score / 10;
                    const revenueFactor = Math.min(features.revenue_potential / 100000, 1);
                    const complexityPenalty = 1 - (features.technical_complexity / 15);
                    const score = (qualityFactor * 0.4 + revenueFactor * 0.4 + complexityPenalty * 0.2) * 100;
                    
                    prediction = {
                      success_probability: Math.max(10, Math.min(95, score)),
                      confidence: 0.7,
                      risk_level: score > 70 ? 'low' : score > 40 ? 'medium' : 'high'
                    };
                  }

                  return {
                    name: project.title.substring(0, 20) + (project.title.length > 20 ? '...' : ''),
                    value: Math.round(prediction.success_probability),
                    risk: prediction.risk_level,
                    confidence: prediction.confidence,
                    projectId: project.id
                  };
                } catch (error) {
                  return {
                    name: project.title.substring(0, 20) + (project.title.length > 20 ? '...' : ''),
                    value: 50,
                    risk: 'medium',
                    confidence: 0.5,
                    projectId: project.id
                  };
                }
              })
            );

            return NextResponse.json({
              predictions: predictions.filter(p => p.value > 0)
            });
          } catch (error) {
            console.error('Predictions error:', error);
            return NextResponse.json({
              error: 'AI prediction service unavailable. ML models may not be properly configured.'
            });
          }
        }

        case 'query': {
          if (!question) {
            return NextResponse.json(
              { error: 'Question required' },
              { status: 400 }
            );
          }

          const context = {
            totalProjects: projects.length,
            totalRevenue: projects.reduce((sum, p) => 
              sum + (JSON.parse(p.revenuePotential || '{}').realistic || 0), 0
            ),
            avgQuality: projects.reduce((sum, p) => sum + (p.qualityScore || 0), 0) / projects.length,
            categories: [...new Set(projects.map(p => p.category))],
            recentActivity: await prisma.activity.count({
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
              }
            }),
            additionalData: {
              topProjects: projects
                .sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0))
                .slice(0, 5)
                .map(p => ({ title: p.title, score: p.qualityScore }))
            }
          };

          const answer = await ollamaAnalytics.queryAnalytics(question, context);
          
          return NextResponse.json({ answer });
        }

        case 'realtime': {
          // Set up real-time monitoring
          const getMetrics = async () => {
            const [projectCount, activeUsers, revenue] = await Promise.all([
              prisma.project.count(),
              prisma.activity.groupBy({
                by: ['userId'],
                where: {
                  createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                  }
                },
                _count: true
              }),
              prisma.project.aggregate({
                _avg: {
                  qualityScore: true
                }
              })
            ]);

            return [
              {
                metric: 'total_projects',
                value: projectCount,
                timestamp: new Date()
              },
              {
                metric: 'active_users_24h',
                value: activeUsers.length,
                timestamp: new Date()
              },
              {
                metric: 'avg_quality',
                value: revenue._avg.qualityScore || 0,
                timestamp: new Date()
              }
            ];
          };

          // Get current metrics
          const metrics = await getMetrics();
          metrics.forEach(m => realtimeEngine.updateMetric(m));

          return NextResponse.json({
            metrics: metrics.map(m => ({
              ...m,
              history: realtimeEngine.getMetricHistory(m.metric)
            })),
            alerts: realtimeEngine.getAlerts()
          });
        }

        default: {
          // Batch analyze top projects
          const topProjects = projects
            .sort((a, b) => 
              (JSON.parse(b.revenuePotential || '{}').realistic || 0) - 
              (JSON.parse(a.revenuePotential || '{}').realistic || 0)
            )
            .slice(0, 10);

          const [projectAnalyses, trendAnalysis, strategyAnalysis] = await Promise.all([
            ollamaAnalytics.batchAnalyzeProjects(topProjects, 3),
            ollamaAnalytics.predictTrends(projects),
            ollamaAnalytics.generateStrategicRecommendations(projects)
          ]);

          return NextResponse.json({
            overview: {
              totalProjects: projects.length,
              analyzedProjects: projectAnalyses.length,
              topInsights: projectAnalyses.slice(0, 3).map(a => ({
                project: a.title,
                insight: a.insights,
                recommendations: a.recommendations.slice(0, 2)
              }))
            },
            trends: trendAnalysis.slice(0, 3),
            strategy: {
              health: strategyAnalysis.portfolioHealth,
              score: strategyAnalysis.diversificationScore,
              topOpportunity: strategyAnalysis.opportunities[0] || 'None identified',
              topAction: strategyAnalysis.actionPlan[0] || 'No immediate action required'
            }
          });
        }
      }
    } catch (error) {
      console.error('AI insights error:', error);
      return NextResponse.json(
        { error: 'Failed to generate AI insights' },
        { status: 500 }
      );
    }
  }),
  rateLimits.read
);

export const POST = withRateLimit(
  optionalAuth(async (request: NextRequest, _user: AuthUser | null) => {
    try {
      const body = await request.json();
      const { action, data } = body;

      const ollamaAnalytics = new OllamaAnalytics();
      await ollamaAnalytics.initialize();

      switch (action) {
        case 'generate-embeddings': {
          // Generate embeddings for all projects
          const projects = await prisma.project.findMany();
          await ollamaAnalytics.generateProjectEmbeddings(projects);
          
          return NextResponse.json({ 
            success: true, 
            message: `Generated embeddings for ${projects.length} projects` 
          });
        }

        case 'find-similar': {
          if (!data.projectId) {
            return NextResponse.json(
              { error: 'Project ID required' },
              { status: 400 }
            );
          }
          
          const similarProjects = await ollamaAnalytics.findSimilarProjects(
            data.projectId,
            data.limit || 5
          );
          
          return NextResponse.json({ similarProjects });
        }

        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('AI insights POST error:', error);
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      );
    }
  }),
  rateLimits.write
);