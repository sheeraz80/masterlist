'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadialBarChart, RadialBar, PieChart, Pie, Cell
} from 'recharts';
import {
  Brain, Lightbulb, TrendingUp, AlertTriangle, Target, Zap,
  ArrowUp, ArrowDown, Minus, Star, Award, Eye, Download
} from 'lucide-react';
import Link from 'next/link';
import { ExportDialog } from '@/components/export-dialog';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const IMPACT_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#16a34a'
};

async function fetchInsights(category?: string, type?: string, minConfidence?: number) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (type && type !== 'all') params.set('type', type);
  if (minConfidence && minConfidence > 0) params.set('min_confidence', minConfidence.toString());

  const response = await fetch(`/api/insights?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch insights');
  return response.json();
}

export default function InsightsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [minConfidence, setMinConfidence] = useState(0);

  const { data: insightsReport, isLoading, error } = useQuery({
    queryKey: ['insights', selectedCategory, selectedType, minConfidence],
    queryFn: () => fetchInsights(selectedCategory, selectedType, minConfidence),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-8">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="mt-2 h-4 w-96" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !insightsReport) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">AI Insights</h1>
          <p className="text-muted-foreground">Failed to load insights report</p>
        </div>
      </div>
    );
  }

  const { executive_summary, opportunity_insights, risk_insights, trend_insights, 
         optimization_insights, recommendations, category_insights, market_analysis } = insightsReport;

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Target className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Eye className="h-4 w-4 text-green-500" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'risk': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'trend': return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'optimization': return <Zap className="h-5 w-5 text-purple-500" />;
      case 'recommendation': return <Star className="h-5 w-5 text-green-500" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'rising': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-500" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Brain className="h-8 w-8 text-purple-500" />
              <span>AI Insights</span>
            </h1>
            <p className="text-muted-foreground">
              Data-driven insights and market intelligence for strategic decision making
            </p>
          </div>
          <div className="flex space-x-2">
            <ExportDialog
              filters={{
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                type: selectedType !== 'all' ? selectedType : undefined,
                minConfidence
              }}
              reportType="summary"
              triggerText="Export Report"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="opportunity">Opportunities</SelectItem>
              <SelectItem value="risk">Risks</SelectItem>
              <SelectItem value="trend">Trends</SelectItem>
              <SelectItem value="optimization">Optimizations</SelectItem>
              <SelectItem value="recommendation">Recommendations</SelectItem>
            </SelectContent>
          </Select>

          <Select value={minConfidence.toString()} onValueChange={(value) => setMinConfidence(parseInt(value))}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Min confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">All Confidence Levels</SelectItem>
              <SelectItem value="50">50%+ Confidence</SelectItem>
              <SelectItem value="70">70%+ Confidence</SelectItem>
              <SelectItem value="85">85%+ Confidence</SelectItem>
              <SelectItem value="95">95%+ Confidence</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Executive Summary */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opportunity Score</CardTitle>
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {executive_summary.opportunity_score.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Market opportunity potential
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {executive_summary.risk_score.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Portfolio risk level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{executive_summary.total_insights}</div>
              <p className="text-xs text-muted-foreground">
                Generated insights
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Trends</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{executive_summary.market_trends.length}</div>
              <p className="text-xs text-muted-foreground">
                Active trends identified
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Insights Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Key Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-gold-500" />
                    <span>Key Insights</span>
                  </CardTitle>
                  <CardDescription>Highest priority insights for immediate action</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {executive_summary.key_insights.map((insight, index) => (
                      <div key={insight.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getTypeIcon(insight.type)}
                            <div className="flex-1">
                              <h4 className="font-medium">{insight.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {insight.description}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {insight.confidence}% confidence
                                </Badge>
                                <Badge variant={insight.impact === 'high' ? 'default' : 'secondary'} className="text-xs">
                                  {insight.impact} impact
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        {insight.action_items.length > 0 && (
                          <div className="mt-3 pl-8">
                            <div className="text-xs font-medium mb-1">Action Items:</div>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {insight.action_items.slice(0, 2).map((action, i) => (
                                <li key={i}>• {action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Market Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span>Market Trends</span>
                  </CardTitle>
                  <CardDescription>Current and emerging market movements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {executive_summary.market_trends.map((trend, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getTrendIcon(trend.direction)}
                            <h4 className="font-medium">{trend.trend_name}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {trend.strength}% strength
                            </Badge>
                            <Badge variant={trend.direction === 'rising' ? 'default' : 'secondary'} className="text-xs">
                              {trend.direction}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs font-medium">Evidence:</div>
                            <ul className="text-xs text-muted-foreground">
                              {trend.evidence.slice(0, 2).map((evidence, i) => (
                                <li key={i}>• {evidence}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <div className="text-xs font-medium">Implications:</div>
                            <ul className="text-xs text-muted-foreground">
                              {trend.implications.slice(0, 2).map((implication, i) => (
                                <li key={i}>• {implication}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="space-y-6">
            <div className="space-y-4">
              {opportunity_insights.map((insight: any) => (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Lightbulb className="h-6 w-6 text-yellow-500 mt-1" />
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <CardDescription className="mt-1">{insight.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                          {insight.confidence}% confidence
                        </Badge>
                        <Badge variant={insight.impact === 'high' ? 'default' : 'secondary'}>
                          {insight.impact} impact
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insight.data_points.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Key Metrics</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {insight.data_points.map((dataPoint, dpIndex) => (
                            <div key={dpIndex} className="space-y-2">
                              {Object.entries(dataPoint).map(([key, value]) => {
                                // Format the key to be more readable
                                const formattedKey = key
                                  .replace(/_/g, ' ')
                                  .replace(/\b\w/g, l => l.toUpperCase());
                                
                                // Handle different value types
                                const renderValue = () => {
                                  if (typeof value === 'number') {
                                    // Format numbers appropriately
                                    if (key.includes('revenue') || key.includes('Revenue')) {
                                      return `$${value.toLocaleString()}`;
                                    } else if (key.includes('ratio') || key.includes('score') || key.includes('interest')) {
                                      return `${value}%`;
                                    } else {
                                      return value.toLocaleString();
                                    }
                                  } else if (Array.isArray(value)) {
                                    // Check if array contains objects
                                    if (value.length > 0 && typeof value[0] === 'object') {
                                      return (
                                        <div className="space-y-1">
                                          {value.slice(0, 3).map((item, idx) => (
                                            <div key={idx} className="text-xs bg-background p-1 rounded">
                                              {Object.entries(item).map(([k, v], i) => (
                                                <span key={k}>
                                                  {i > 0 && ' • '}
                                                  <span className="font-medium">{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span> {
                                                    k.includes('revenue') || k.includes('Revenue') ? `$${Number(v).toLocaleString()}` :
                                                    typeof v === 'number' ? v.toLocaleString() : String(v)
                                                  }
                                                </span>
                                              ))}
                                            </div>
                                          ))}
                                          {value.length > 3 && <div className="text-xs text-muted-foreground">...and {value.length - 3} more</div>}
                                        </div>
                                      );
                                    } else {
                                      return value.slice(0, 3).join(', ') + (value.length > 3 ? '...' : '');
                                    }
                                  } else if (typeof value === 'object' && value !== null) {
                                    // Handle nested objects
                                    return (
                                      <div className="ml-2 space-y-1">
                                        {Object.entries(value).slice(0, 3).map(([k, v]) => (
                                          <div key={k} className="text-xs">
                                            <span className="font-medium">{k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span> {
                                              Array.isArray(v) ? v.slice(0, 2).join(', ') : String(v)
                                            }
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  } else {
                                    return String(value);
                                  }
                                };
                                
                                return (
                                  <div key={key} className="bg-muted p-2 rounded">
                                    <div className="text-xs font-medium text-muted-foreground">
                                      {formattedKey}
                                    </div>
                                    <div className="text-sm font-medium mt-1">
                                      {renderValue()}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium mb-2">Recommended Actions</h4>
                      <ul className="space-y-1">
                        {insight.action_items.map((action, i) => (
                          <li key={i} className="flex items-start space-x-2 text-sm">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {(insight.related_projects?.length > 0 || insight.project_ids.length > 0) && (
                      <div>
                        <h4 className="font-medium mb-2">Related Projects</h4>
                        <div className="flex flex-wrap gap-2">
                          {insight.related_projects ? (
                            // Use related_projects if available (new format with titles)
                            insight.related_projects.slice(0, 5).map(project => (
                              <Button key={project.id} variant="outline" size="sm" asChild>
                                <Link href={`/projects/${project.id}`}>
                                  {project.title || `Project ${project.id}`}
                                </Link>
                              </Button>
                            ))
                          ) : (
                            // Fallback to project_ids (old format)
                            insight.project_ids.slice(0, 5).map(id => (
                              <Button key={id} variant="outline" size="sm" asChild>
                                <Link href={`/projects/${id}`}>
                                  View Project
                                </Link>
                              </Button>
                            ))
                          )}
                          {(insight.related_projects?.length || insight.project_ids.length) > 5 && (
                            <Badge variant="outline">
                              +{(insight.related_projects?.length || insight.project_ids.length) - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Market Analysis Tab */}
          <TabsContent value="market" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Emerging Opportunities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-green-500" />
                    <span>Emerging Opportunities</span>
                  </CardTitle>
                  <CardDescription>High-potential, low-competition markets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {market_analysis.emerging_opportunities.map((opp, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{opp.category}</h4>
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            {opp.potential}% potential
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{opp.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Saturated Markets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <span>Saturated Markets</span>
                  </CardTitle>
                  <CardDescription>High-competition areas to avoid</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {market_analysis.saturated_markets.map((market, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{market.category}</h4>
                          <Badge variant="destructive" className="text-xs">
                            {market.saturation_level}% saturated
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{market.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Innovation Gaps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-purple-500" />
                    <span>Innovation Gaps</span>
                  </CardTitle>
                  <CardDescription>Unexplored areas with potential</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {market_analysis.innovation_gaps.map((gap, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <h4 className="font-medium text-sm mb-2">{gap.area}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{gap.description}</p>
                        <div>
                          <div className="text-xs font-medium mb-1">Potential Solutions:</div>
                          <ul className="text-xs text-muted-foreground">
                            {gap.potential_solutions.slice(0, 2).map((solution, i) => (
                              <li key={i}>• {solution}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(category_insights).map(([category, analysis]: [string, any]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-sm">{category}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span>Risk: {analysis.risk_level}</span>
                      <span>•</span>
                      <span>Score: {analysis.opportunity_score.toFixed(0)}%</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${analysis.opportunity_score}%` }}
                      ></div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Recommended Actions</div>
                      <ul className="space-y-1">
                        {analysis.recommended_actions.map((action: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground">
                            • {action}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {analysis.key_insights.length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">Key Insights</div>
                        <div className="space-y-1">
                          {analysis.key_insights.slice(0, 2).map((insight: any, i: number) => (
                            <div key={i} className="flex items-center space-x-2">
                              {getTypeIcon(insight.type)}
                              <span className="text-xs">{insight.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}