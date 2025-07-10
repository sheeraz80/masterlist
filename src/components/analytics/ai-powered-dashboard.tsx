'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Brain, Sparkles, TrendingUp, MessageSquare, Loader2,
  AlertTriangle, CheckCircle, Search, RefreshCw, Zap
} from 'lucide-react';
import Link from 'next/link';

interface AIInsightsProps {
  projectId?: string;
}

export function AIPoweredDashboard({ projectId }: AIInsightsProps) {
  const [query, setQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(projectId);

  // Fetch AI overview
  const { data: overview, isLoading: overviewLoading, refetch: refetchOverview } = useQuery({
    queryKey: ['ai-insights', 'overview'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/ai-insights');
      if (!response.ok) throw new Error('Failed to fetch AI insights');
      return response.json();
    },
    enabled: !projectId
  });

  // Fetch project-specific analysis
  const { data: projectAnalysis, isLoading: projectLoading } = useQuery({
    queryKey: ['ai-insights', 'project', selectedProject],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/ai-insights?type=project&projectId=${selectedProject}`);
      if (!response.ok) throw new Error('Failed to fetch project analysis');
      return response.json();
    },
    enabled: !!selectedProject
  });

  // Natural language query
  const queryMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await fetch(`/api/analytics/ai-insights?type=query&q=${encodeURIComponent(question)}`);
      if (!response.ok) throw new Error('Failed to process query');
      return response.json();
    }
  });

  // Generate embeddings
  const embeddingsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/analytics/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-embeddings' })
      });
      if (!response.ok) throw new Error('Failed to generate embeddings');
      return response.json();
    }
  });

  const handleQuery = () => {
    if (query.trim()) {
      queryMutation.mutate(query);
    }
  };

  if (overviewLoading || projectLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-500" />
            <span>AI-Powered Analytics</span>
          </h2>
          <p className="text-muted-foreground">
            Powered by local Ollama models for privacy-preserving insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchOverview()}
            disabled={overviewLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${overviewLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => embeddingsMutation.mutate()}
            disabled={embeddingsMutation.isPending}
          >
            {embeddingsMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            Index Projects
          </Button>
        </div>
      </div>

      {/* Natural Language Query */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Ask Analytics Assistant</span>
          </CardTitle>
          <CardDescription>
            Ask questions about your projects in natural language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="e.g., Which projects have the highest revenue potential?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                disabled={queryMutation.isPending}
              />
              <Button 
                onClick={handleQuery}
                disabled={queryMutation.isPending || !query.trim()}
              >
                {queryMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {queryMutation.data && (
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription className="whitespace-pre-wrap">
                  {queryMutation.data.answer}
                </AlertDescription>
              </Alert>
            )}

            {queryMutation.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Failed to process query. Please try again.
                </AlertDescription>
              </Alert>
            )}

            {/* Suggested queries */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Try:</span>
              {[
                'What are the top revenue opportunities?',
                'Which categories are trending?',
                'What projects need attention?',
                'How is the portfolio health?'
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs"
                  onClick={() => {
                    setQuery(suggestion);
                    queryMutation.mutate(suggestion);
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {selectedProject && projectAnalysis ? (
        // Project-specific analysis
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Deep Analysis</CardTitle>
              <CardDescription>{projectAnalysis.analysis.title}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Success Prediction */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Success Probability</span>
                    <Badge 
                      variant={projectAnalysis.prediction.riskLevel === 'low' ? 'default' : 
                              projectAnalysis.prediction.riskLevel === 'medium' ? 'secondary' : 
                              'destructive'}
                    >
                      {projectAnalysis.prediction.riskLevel} risk
                    </Badge>
                  </div>
                  <Progress 
                    value={projectAnalysis.prediction.successProbability * 100} 
                    className="h-3"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.round(projectAnalysis.prediction.successProbability * 100)}% chance of success
                  </p>
                </div>

                {/* AI Insights */}
                <div>
                  <h4 className="font-medium mb-2">AI Insights</h4>
                  <p className="text-sm text-muted-foreground">
                    {projectAnalysis.analysis.insights}
                  </p>
                </div>

                {/* Market Analysis */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Market Opportunity</p>
                    <p className="text-sm text-muted-foreground">
                      {projectAnalysis.analysis.marketAnalysis.opportunity}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Competition</p>
                    <p className="text-sm text-muted-foreground">
                      {projectAnalysis.analysis.marketAnalysis.competition}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Target Audience</p>
                    <p className="text-sm text-muted-foreground">
                      {projectAnalysis.analysis.marketAnalysis.targetAudience}
                    </p>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-2">
                    {projectAnalysis.analysis.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Factors */}
                <div>
                  <h4 className="font-medium mb-2">Risk Assessment</h4>
                  <div className="space-y-2">
                    {projectAnalysis.analysis.riskAssessment.factors.map((factor: string, idx: number) => (
                      <Alert key={idx} variant="destructive" className="py-2">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{factor}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : overview ? (
        // Portfolio overview
        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="insights">Top Insights</TabsTrigger>
            <TabsTrigger value="trends">AI Predictions</TabsTrigger>
            <TabsTrigger value="strategy">Strategic View</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            {overview.overview.topInsights.map((insight: any, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-lg">{insight.project}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{insight.insight}</p>
                  <div className="space-y-2">
                    {insight.recommendations.map((rec: string, ridx: number) => (
                      <div key={ridx} className="flex items-start space-x-2">
                        <Sparkles className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            {overview.trends.map((trend: any, idx: number) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{trend.category}</span>
                    <Badge variant={
                      trend.confidence === 'high' ? 'default' :
                      trend.confidence === 'medium' ? 'secondary' : 'outline'
                    }>
                      {trend.confidence} confidence
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-2">{trend.prediction}</p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Reasoning:</strong> {trend.reasoning}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong>Timeframe:</strong> {trend.timeframe}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="strategy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Health Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Diversification Score</span>
                      <span className="text-sm font-bold">{overview.strategy.score}/10</span>
                    </div>
                    <Progress value={overview.strategy.score * 10} className="h-2" />
                  </div>
                  
                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertDescription>{overview.strategy.health}</AlertDescription>
                  </Alert>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>Top Opportunity</span>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {overview.strategy.topOpportunity}
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                        <span>Recommended Action</span>
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {overview.strategy.topAction}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}