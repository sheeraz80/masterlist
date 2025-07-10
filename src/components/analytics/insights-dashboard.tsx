'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Brain, Zap, ThumbsUp, ThumbsDown, BarChart3, Target
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

async function fetchInsights() {
  const response = await fetch('/api/analytics/insights');
  if (!response.ok) throw new Error('Failed to fetch insights');
  return response.json();
}

export function InsightsDashboard() {
  const { data: insights, isLoading, error } = useQuery({
    queryKey: ['analytics-insights'],
    queryFn: fetchInsights,
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !insights) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load AI insights</AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs defaultValue="predictions" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
        <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
        <TabsTrigger value="benchmarks">Benchmarking</TabsTrigger>
        <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
      </TabsList>

      {/* AI Predictions Tab */}
      <TabsContent value="predictions" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* High Success Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>High Success Probability</span>
              </CardTitle>
              <CardDescription>Projects likely to succeed based on ML analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.predictions.high_success_projects.map((project: any) => (
                  <div key={project.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Link 
                        href={`/projects/${project.id}`}
                        className="font-semibold hover:underline"
                      >
                        {project.title}
                      </Link>
                      <Badge variant="default" className="bg-green-500">
                        {Math.round(project.success_probability * 100)}% Success
                      </Badge>
                    </div>
                    <Progress value={project.success_probability * 100} className="h-2 mb-2" />
                    <div className="text-sm space-y-1">
                      <div className="text-green-600">
                        ✓ {project.factors.positive.join(', ')}
                      </div>
                      {project.factors.negative.length > 0 && (
                        <div className="text-amber-600">
                          ⚠ {project.factors.negative.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* At Risk Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>At Risk Projects</span>
              </CardTitle>
              <CardDescription>Projects that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.predictions.at_risk_projects.map((project: any) => (
                  <div key={project.id} className="p-4 border rounded-lg border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <Link 
                        href={`/projects/${project.id}`}
                        className="font-semibold hover:underline"
                      >
                        {project.title}
                      </Link>
                      <Badge variant="destructive">
                        {Math.round(project.success_probability * 100)}% Success
                      </Badge>
                    </div>
                    <Progress 
                      value={project.success_probability * 100} 
                      className="h-2 mb-2"
                    />
                    <div className="text-sm space-y-1">
                      {project.factors.negative.length > 0 && (
                        <div className="text-red-600">
                          ✗ {project.factors.negative.join(', ')}
                        </div>
                      )}
                      {project.factors.positive.length > 0 && (
                        <div className="text-green-600">
                          ✓ {project.factors.positive.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Anomaly Detection Tab */}
      <TabsContent value="anomalies" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Revenue Anomalies */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Anomalies</CardTitle>
              <CardDescription>Unusual revenue patterns detected</CardDescription>
            </CardHeader>
            <CardContent>
              {insights.anomalies.revenue_anomalies.length > 0 ? (
                <div className="space-y-3">
                  {insights.anomalies.revenue_anomalies.map((anomaly: any, index: number) => (
                    <Alert key={index} variant="default">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-semibold">${anomaly.value.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          Expected: ${Math.round(anomaly.expected).toLocaleString()}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No anomalies detected</p>
              )}
            </CardContent>
          </Card>

          {/* Activity Anomalies */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Anomalies</CardTitle>
              <CardDescription>Unusual activity patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {insights.anomalies.activity_anomalies.length > 0 ? (
                <div className="space-y-3">
                  {insights.anomalies.activity_anomalies.map((anomaly: any, index: number) => (
                    <Alert key={index} variant="default">
                      <Zap className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-semibold">{anomaly.date}</div>
                        <div className="text-xs">
                          {anomaly.value} activities (expected: {Math.round(anomaly.expected)})
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No anomalies detected</p>
              )}
            </CardContent>
          </Card>

          {/* Quality Anomalies */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Anomalies</CardTitle>
              <CardDescription>Projects with unusual quality scores</CardDescription>
            </CardHeader>
            <CardContent>
              {insights.anomalies.quality_anomalies.length > 0 ? (
                <div className="space-y-3">
                  {insights.anomalies.quality_anomalies.map((anomaly: any) => (
                    <Alert key={anomaly.project_id} variant="default">
                      <BarChart3 className="h-4 w-4" />
                      <AlertDescription>
                        <Link 
                          href={`/projects/${anomaly.project_id}`}
                          className="font-semibold hover:underline"
                        >
                          {anomaly.title}
                        </Link>
                        <div className="text-xs">
                          Score: {anomaly.score}/10 (avg: {anomaly.expected.toFixed(1)})
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No anomalies detected</p>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Benchmarking Tab */}
      <TabsContent value="benchmarks" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Best Performers */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Projects exceeding benchmarks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.comparative.best_performers.map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <Link 
                        href={`/projects/${project.id}`}
                        className="font-medium hover:underline"
                      >
                        {project.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">{project.category}</div>
                    </div>
                    <Badge variant="default" className="bg-green-500">
                      Score: {(project.score * 100).toFixed(0)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>Data-driven insights for improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.comparative.recommendations.map((rec: string, index: number) => (
                  <Alert key={index}>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benchmarks Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Benchmarks</CardTitle>
            <CardDescription>Key metrics compared to targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(insights.comparative.benchmarks).map(([metric, values]: [string, any]) => (
                <div key={metric} className="space-y-2">
                  <div className="text-sm font-medium capitalize">
                    {metric.replace(/_/g, ' ')}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Min</span>
                      <span>{values.min.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span>Target</span>
                      <span className="text-green-600">{values.target.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Max</span>
                      <span>{values.max.toFixed(0)}</span>
                    </div>
                    <Progress 
                      value={(values.avg / values.max) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Sentiment Analysis Tab */}
      <TabsContent value="sentiment" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Overall Sentiment */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Sentiment</CardTitle>
              <CardDescription>Comment sentiment distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Positive</span>
                  </div>
                  <span className="font-medium">{insights.sentiment.overall.positive.toFixed(1)}%</span>
                </div>
                <Progress value={insights.sentiment.overall.positive} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 rounded-full bg-gray-400" />
                    <span className="text-sm">Neutral</span>
                  </div>
                  <span className="font-medium">{insights.sentiment.overall.neutral.toFixed(1)}%</span>
                </div>
                <Progress value={insights.sentiment.overall.neutral} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Negative</span>
                  </div>
                  <span className="font-medium">{insights.sentiment.overall.negative.toFixed(1)}%</span>
                </div>
                <Progress value={insights.sentiment.overall.negative} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Trending Positive */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span>Trending Positive</span>
              </CardTitle>
              <CardDescription>Projects with positive sentiment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.sentiment.trending_positive.map((project: string) => (
                  <div key={project} className="p-2 bg-green-50 rounded">
                    <span className="text-sm font-medium">{project}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Areas of Concern */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <span>Areas of Concern</span>
              </CardTitle>
              <CardDescription>Projects with negative feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.sentiment.trending_negative.map((project: string) => (
                  <div key={project} className="p-2 bg-red-50 rounded">
                    <span className="text-sm font-medium">{project}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}