'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, ScatterChart, Scatter
} from 'recharts';
import {
  BarChart3, TrendingUp, DollarSign, Star, Zap, Clock, Target,
  Users, Lightbulb, Award, Filter, Download
} from 'lucide-react';
import Link from 'next/link';
import { ExportDialog } from '@/components/export-dialog';

const COLORS = [
  '#2563eb', '#3b82f6', '#60a5fa', '#93bbfc', '#c3d9fe',
  '#10b981', '#34d399', '#86efac', '#bbf7d0', '#d1fae5',
  '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7',
  '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'
];

async function fetchAnalytics() {
  const response = await fetch('/api/analytics');
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
}

export default function AnalyticsPage() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
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

  const { overview, category_analysis, platform_analysis, quality_trends, 
         revenue_analysis, complexity_analysis, development_time_analysis,
         competition_analysis, recommendations } = analytics;

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Comprehensive insights and trends across all {overview.total_projects} projects
            </p>
          </div>
          <div className="flex space-x-2">
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
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.total_projects}</div>
              <p className="text-xs text-muted-foreground">
                Across {overview.categories_count} categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue Potential</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(overview.total_revenue_potential / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">
                ${(overview.total_revenue_potential / overview.total_projects).toFixed(0)} avg per project
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Quality</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.average_quality.toFixed(1)}/10</div>
              <p className="text-xs text-muted-foreground">
                Quality score distribution
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Complexity</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.average_complexity.toFixed(1)}/10</div>
              <p className="text-xs text-muted-foreground">
                Technical complexity level
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="complexity">Complexity</TabsTrigger>
            <TabsTrigger value="recommendations">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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

              {/* Revenue by Complexity */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Complexity</CardTitle>
                  <CardDescription>Average revenue by technical complexity</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={Object.entries(revenue_analysis.by_complexity_avg).map(([complexity, revenue]) => ({
                      complexity, revenue: Math.round(revenue as number)
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="complexity" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, 'Avg Revenue']} />
                      <Bar dataKey="revenue" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}