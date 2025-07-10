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
  PieChart, Pie, Cell, Legend, LineChart, Line, ScatterChart, Scatter,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  BarChart3, TrendingUp, DollarSign, Star, Zap, Clock, Target,
  Users, Lightbulb, Award, Filter, Download, Activity, Briefcase,
  ArrowUp, ArrowDown, Gauge, FolderOpen
} from 'lucide-react';
import Link from 'next/link';
import { ExportDialog } from '@/components/export-dialog';
import { cn } from '@/lib/utils';
import { AIInsightsSimple } from '@/components/analytics/ai-insights-simple';
import { RealtimeCollaboration } from '@/components/analytics/realtime-collaboration';
import { ComparativeDashboard } from '@/components/analytics/comparative-dashboard';
import { ROICalculator } from '@/components/analytics/roi-calculator';
import { DashboardBuilder } from '@/components/analytics/dashboard-builder';
import { D3Visualizations } from '@/components/analytics/d3-visualizations';
import { AdvancedFilters } from '@/components/analytics/advanced-filters';
import { ExportReporting } from '@/components/analytics/export-reporting';
import { PerformanceBenchmarking } from '@/components/analytics/performance-benchmarking';
import { DataValidation } from '@/components/analytics/data-validation';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

async function fetchAnalytics() {
  const response = await fetch('/api/analytics');
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
}

async function fetchTrends(days: number) {
  const response = await fetch(`/api/analytics/trends?days=${days}`);
  if (!response.ok) throw new Error('Failed to fetch trends');
  return response.json();
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30');
  
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    refetchInterval: 60000 // Refresh every minute
  });
  
  const { data: trends } = useQuery({
    queryKey: ['trends', timeRange],
    queryFn: () => fetchTrends(parseInt(timeRange)),
    enabled: !!analytics
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

  if (error || !analytics) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Analytics</h1>
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const { overview, category_analysis, quality_trends, 
         revenue_analysis, complexity_analysis, development_time_analysis,
         competition_analysis, recommendations, recent_trends } = analytics;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-500" />
              <span>Analytics Dashboard</span>
              <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                AI-Powered
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              Real-time insights and performance metrics from {overview.total_projects} projects • Powered by local DeepSeek R1 models
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <ExportDialog
              reportType="analytics"
              triggerText="Export Report"
            />
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.total_projects}</div>
              <p className="text-xs text-muted-foreground">
                Across {overview.categories_count} categories
              </p>
              <div className="flex items-center mt-2">
                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500 font-medium">
                  +{recent_trends.new_projects_last_week} this week
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Potential</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overview.total_revenue_potential)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(overview.total_revenue_potential / overview.total_projects)} avg/project
              </p>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Portfolio value</span>
                  <span className="font-medium text-green-600">Growing</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.average_quality.toFixed(1)}/10</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${overview.average_quality * 10}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {quality_trends.distribution['8-10']} excellent projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.total_activities}</div>
              <p className="text-xs text-muted-foreground">
                {recent_trends.active_users_last_week} active users
              </p>
              <div className="flex items-center mt-2">
                <Users className="h-3 w-3 text-blue-500 mr-1" />
                <span className="text-xs text-blue-500 font-medium">
                  {overview.total_users} total users
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="ai-insights" className="space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList className="flex w-max min-w-full justify-start gap-1">
            <TabsTrigger value="ai-insights" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white data-[state=active]:bg-gradient-to-r whitespace-nowrap">
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="realtime" className="whitespace-nowrap">Live</TabsTrigger>
            <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
            <TabsTrigger value="trends" className="whitespace-nowrap">Trends</TabsTrigger>
            <TabsTrigger value="compare" className="whitespace-nowrap">Compare</TabsTrigger>
            <TabsTrigger value="roi" className="whitespace-nowrap">ROI</TabsTrigger>
            <TabsTrigger value="categories" className="whitespace-nowrap">Categories</TabsTrigger>
            <TabsTrigger value="quality" className="whitespace-nowrap">Quality</TabsTrigger>
            <TabsTrigger value="revenue" className="whitespace-nowrap">Revenue</TabsTrigger>
            <TabsTrigger value="projects" className="whitespace-nowrap">Projects</TabsTrigger>
            <TabsTrigger value="insights" className="whitespace-nowrap">Insights</TabsTrigger>
            <TabsTrigger value="builder" className="whitespace-nowrap">Builder</TabsTrigger>
            <TabsTrigger value="d3-viz" className="whitespace-nowrap">D3 Viz</TabsTrigger>
            <TabsTrigger value="validation" className="whitespace-nowrap">Data Quality</TabsTrigger>
            </TabsList>
          </div>

          {/* AI Insights Tab - NEW! */}
          <TabsContent value="ai-insights" className="space-y-6">
            <AIInsightsSimple />
          </TabsContent>

          {/* Real-time Collaboration Tab */}
          <TabsContent value="realtime" className="space-y-6">
            <RealtimeCollaboration currentTab="realtime" />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Advanced Filters */}
            <AdvancedFilters 
              projects={analytics.projects || []}
              onFiltersChange={(filters) => {
                console.log('Filters changed:', filters);
                // TODO: Implement filtering logic
              }}
            />
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Quality Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Quality Score Distribution</CardTitle>
                  <CardDescription>Distribution of projects by quality scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(quality_trends.distribution).map(([range, count]) => ({
                      range, count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Revenue Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                  <CardDescription>Projects grouped by revenue potential</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(revenue_analysis.distribution).map(([range, count]) => ({
                          name: range, value: count
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {Object.entries(revenue_analysis.distribution).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Development Time */}
              <Card>
                <CardHeader>
                  <CardTitle>Development Time Distribution</CardTitle>
                  <CardDescription>Time required for project development</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(development_time_analysis.distribution).map(([time, count]) => ({
                      time, count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Competition Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Competition Level Distribution</CardTitle>
                  <CardDescription>Market competition across projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(competition_analysis.distribution).map(([level, count]) => ({
                          name: level, value: count
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {Object.entries(competition_analysis.distribution).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index + 5 % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            {trends ? (
              <div className="space-y-6">
                {/* Project Growth */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Growth Over Time</CardTitle>
                    <CardDescription>Daily new projects and cumulative growth</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={trends.daily_projects}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="count"
                          stroke="#3b82f6"
                          fill="#93c5fd"
                          name="New Projects"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="cumulative"
                          stroke="#10b981"
                          strokeWidth={2}
                          name="Total Projects"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* User Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>User Activity Trends</CardTitle>
                      <CardDescription>New users and active users over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trends.daily_users}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            name="New Users"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="active"
                            stroke="#10b981"
                            name="Active Users"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Revenue Trends */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Trends</CardTitle>
                      <CardDescription>Daily revenue potential from new projects</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trends.revenue_trends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis tickFormatter={(value) => `$${formatNumber(value)}`} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#10b981"
                            fill="#86efac"
                            name="Total Revenue"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Category Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Category Evolution</CardTitle>
                    <CardDescription>How categories are growing over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={trends.category_trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {Object.keys(trends.category_trends[0]?.categories || {}).slice(0, 5).map((category, index) => (
                          <Area
                            key={category}
                            type="monotone"
                            dataKey={`categories.${category}`}
                            stackId="1"
                            stroke={COLORS[index % COLORS.length]}
                            fill={COLORS[index % COLORS.length]}
                            name={category}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Quality Trends */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quality Score Evolution</CardTitle>
                    <CardDescription>Average quality score over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={trends.quality_trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="average"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          name="Average Quality"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading trends data...</p>
              </div>
            )}
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-6">
            <ComparativeDashboard projects={analytics.projects || []} />
          </TabsContent>

          {/* ROI Calculator Tab */}
          <TabsContent value="roi" className="space-y-6">
            <ROICalculator />
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Category by Count */}
              <Card>
                <CardHeader>
                  <CardTitle>Projects by Category</CardTitle>
                  <CardDescription>Number of projects in each category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={Object.entries(category_analysis.by_count)
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .slice(0, 10)
                      .map(([category, count]) => ({
                        category: category.length > 20 ? category.substring(0, 20) + '...' : category, 
                        count: count as number
                      }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category by Revenue */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Category</CardTitle>
                  <CardDescription>Total revenue potential per category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={Object.entries(category_analysis.by_revenue)
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .slice(0, 10)
                      .map(([category, revenue]) => ({
                        category: category.length > 20 ? category.substring(0, 20) + '...' : category,
                        revenue: Math.round((revenue as number) / 1000)
                      }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}K`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Category Quality Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Scores by Category</CardTitle>
                <CardDescription>Average quality score for each category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(category_analysis.by_quality)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .slice(0, 10)
                    .map(([category, quality]) => ({
                      category: category.length > 25 ? category.substring(0, 25) + '...' : category,
                      quality: Number((quality as number).toFixed(1))
                    }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Bar dataKey="quality" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quality Tab */}
          <TabsContent value="quality" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Quality Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Quality Score Distribution</CardTitle>
                  <CardDescription>Distribution of projects by quality scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(quality_trends.distribution).map(([range, count]) => ({
                      range, count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Quality by Category */}
              <Card>
                <CardHeader>
                  <CardTitle>Quality Scores by Category</CardTitle>
                  <CardDescription>Average quality score for each category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(quality_trends.by_category)
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .slice(0, 10)
                      .map(([category, quality]) => ({
                        category: category.length > 20 ? category.substring(0, 20) + '...' : category,
                        quality: Number((quality as number).toFixed(1))
                      }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Bar dataKey="quality" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quality Metrics Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics Overview</CardTitle>
                <CardDescription>Key quality indicators across all projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Average Quality</p>
                    <div className="flex items-baseline space-x-1">
                      <p className="text-2xl font-bold">{overview.average_quality}</p>
                      <span className="text-sm text-muted-foreground">/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${overview.average_quality * 10}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Excellent Projects</p>
                    <p className="text-2xl font-bold">{quality_trends.distribution['8-10']}</p>
                    <p className="text-xs text-green-600">
                      {Math.round((quality_trends.distribution['8-10'] / overview.total_projects) * 100)}% of total
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Good Projects</p>
                    <p className="text-2xl font-bold">{quality_trends.distribution['6-8']}</p>
                    <p className="text-xs text-blue-600">
                      {Math.round((quality_trends.distribution['6-8'] / overview.total_projects) * 100)}% of total
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Need Improvement</p>
                    <p className="text-2xl font-bold">
                      {quality_trends.distribution['0-2'] + quality_trends.distribution['2-4']}
                    </p>
                    <p className="text-xs text-red-600">
                      {Math.round(((quality_trends.distribution['0-2'] + quality_trends.distribution['2-4']) / overview.total_projects) * 100)}% of total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Top Revenue Projects */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Revenue Projects</CardTitle>
                  <CardDescription>Highest potential revenue projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {revenue_analysis.top_projects.slice(0, 8).map((project: any, index: number) => (
                      <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">#{index + 1}</span>
                            <Link 
                              href={`/projects/${project.id}`}
                              className="text-sm font-semibold hover:underline line-clamp-1"
                            >
                              {project.title}
                            </Link>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">{project.category}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Quality: {project.quality_score}/10
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">
                            ${project.revenue_potential.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Complexity: {project.technical_complexity}/10
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                  <CardDescription>Projects grouped by revenue potential</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={Object.entries(revenue_analysis.distribution).map(([range, count]) => ({
                          name: range, value: count
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {Object.entries(revenue_analysis.distribution).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Insights</CardTitle>
                <CardDescription>Key revenue metrics and opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <p className="text-sm font-medium">Total Revenue Potential</p>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(overview.total_revenue_potential)}</p>
                    <p className="text-xs text-muted-foreground">
                      Across {overview.total_projects} projects
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <p className="text-sm font-medium">Average per Project</p>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(overview.total_revenue_potential / overview.total_projects)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Mean revenue potential
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-purple-500" />
                      <p className="text-sm font-medium">High Value Projects</p>
                    </div>
                    <p className="text-2xl font-bold">{revenue_analysis.distribution['500k+']}</p>
                    <p className="text-xs text-muted-foreground">
                      Projects over $500k potential
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            {/* Performance Benchmarking */}
            <PerformanceBenchmarking analytics={analytics} projects={analytics.projects || []} />
            
            {/* Project Performance Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Complexity Distribution</CardTitle>
                  <CardDescription>Projects by technical complexity</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={Object.entries(complexity_analysis.distribution).map(([level, count]) => ({
                          name: level, value: count
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={false}
                      >
                        {Object.entries(complexity_analysis.distribution).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {Object.entries(complexity_analysis.distribution).map(([level, count], index) => (
                      <div key={level} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span>{level}</span>
                        </div>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Development Time</CardTitle>
                  <CardDescription>Time required for development</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={Object.entries(development_time_analysis.distribution).map(([time, count]) => ({
                      time: time.replace(' months', 'm').replace(' month', 'm'), 
                      count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Competition Levels</CardTitle>
                  <CardDescription>Market competition analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={Object.entries(competition_analysis.distribution).map(([level, count]) => ({
                      level, count
                    }))}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="level" />
                      <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
                      <Radar 
                        name="Projects" 
                        dataKey="count" 
                        stroke="#8b5cf6" 
                        fill="#8b5cf6" 
                        fillOpacity={0.6} 
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Project Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Project Performance Overview</CardTitle>
                <CardDescription>Comprehensive project metrics and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Status Summary */}
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Projects</p>
                      <p className="text-2xl font-bold">{overview.total_projects}</p>
                      <div className="flex items-center text-xs text-green-600">
                        <ArrowUp className="h-3 w-3 mr-1" />
                        +{recent_trends.new_projects_last_week} this week
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Avg. Complexity</p>
                      <p className="text-2xl font-bold">{overview.average_complexity}/10</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${overview.average_complexity * 10}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Categories</p>
                      <p className="text-2xl font-bold">{overview.categories_count}</p>
                      <p className="text-xs text-muted-foreground">
                        Diverse project types
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Correlation</p>
                      <p className="text-2xl font-bold">
                        {(complexity_analysis.correlation_with_revenue * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Complexity-Revenue correlation
                      </p>
                    </div>
                  </div>

                  {/* Trending Categories */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Trending Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {recent_trends.trending_categories.map((category) => (
                        <Badge key={category} variant="secondary">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {/* Export & Reporting */}
            <ExportReporting analytics={analytics} projects={analytics.projects || []} />
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* High Potential, Low Complexity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <span>Quick Wins</span>
                  </CardTitle>
                  <CardDescription>High revenue potential, low complexity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.high_potential_low_complexity.map((project: any) => (
                      <div key={project.id} className="p-3 rounded-lg border">
                        <Link 
                          href={`/projects/${project.id}`}
                          className="text-sm font-semibold hover:underline line-clamp-2"
                        >
                          {project.title}
                        </Link>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">{project.category}</Badge>
                          <div className="text-xs text-green-600 font-medium">
                            ${project.revenue_potential.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                          <span>Complexity: {project.technical_complexity}/10</span>
                          <span>•</span>
                          <span>Quality: {project.quality_score}/10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Optimal Projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-blue-500" />
                    <span>Best Quality</span>
                  </CardTitle>
                  <CardDescription>High quality, reasonable complexity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.optimal_projects.slice(0, 5).map((project: any) => (
                      <div key={project.id} className="p-3 rounded-lg border">
                        <Link 
                          href={`/projects/${project.id}`}
                          className="text-sm font-semibold hover:underline line-clamp-2"
                        >
                          {project.title}
                        </Link>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">{project.category}</Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs font-medium">{project.quality_score}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1 text-xs text-muted-foreground">
                          <span>Complexity: {project.technical_complexity}/10</span>
                          <span>•</span>
                          <span>${project.revenue_potential.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Undervalued Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <span>Opportunities</span>
                  </CardTitle>
                  <CardDescription>Undervalued categories to explore</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recommendations.undervalued_categories.map((category: any, index: number) => (
                      <div key={category} className="p-3 rounded-lg border">
                        <div className="font-semibold text-sm">{category}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Below average revenue potential - room for innovation
                        </div>
                        <Button size="sm" variant="outline" className="mt-2 w-full" asChild>
                          <Link href={`/search?category=${encodeURIComponent(category)}`}>
                            Explore Projects
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Insights Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Key Analytics Insights</CardTitle>
                <CardDescription>Data-driven recommendations for project success</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Growth Opportunity</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {recent_trends.new_projects_last_week} new projects added this week, 
                        with {recent_trends.trending_categories[0]} being the most active category.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Star className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Quality Focus</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {quality_trends.distribution['8-10']} projects ({Math.round((quality_trends.distribution['8-10'] / overview.total_projects) * 100)}%) 
                        have excellent quality scores, indicating strong project standards.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-purple-100 p-2">
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Quick Win Potential</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {recommendations.high_potential_low_complexity.length} projects identified with 
                        high revenue potential and low complexity - ideal for rapid implementation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="rounded-full bg-yellow-100 p-2">
                      <Gauge className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Performance Balance</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Average complexity of {overview.average_complexity}/10 with {overview.average_quality}/10 quality score 
                        indicates well-balanced project portfolio.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dashboard Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <DndProvider backend={HTML5Backend}>
              <DashboardBuilder />
            </DndProvider>
          </TabsContent>

          {/* D3 Visualizations Tab */}
          <TabsContent value="d3-viz" className="space-y-6">
            <D3Visualizations projects={analytics.projects || []} />
          </TabsContent>

          {/* Data Validation Tab */}
          <TabsContent value="validation" className="space-y-6">
            <DataValidation 
              analytics={analytics} 
              projects={analytics.projects || []} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}