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
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Shield, AlertTriangle, CheckCircle, XCircle, AlertCircle,
  TrendingUp, Target, FileText, Award, Filter, Download,
  Bug, Zap, Clock, Users
} from 'lucide-react';
import Link from 'next/link';
import { ExportDialog } from '@/components/export-dialog';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
const SEVERITY_COLORS = {
  critical: '#dc2626',
  high: '#ea580c', 
  medium: '#ca8a04',
  low: '#16a34a'
};

async function fetchQAReport(category?: string, severity?: string) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.set('category', category);
  if (severity && severity !== 'all') params.set('severity', severity);
  params.set('details', 'true');

  const response = await fetch(`/api/qa?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch QA report');
  return response.json();
}

export default function QAPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const { data: qaReport, isLoading, error } = useQuery({
    queryKey: ['qa-report', selectedCategory, selectedSeverity],
    queryFn: () => fetchQAReport(selectedCategory, selectedSeverity),
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

  if (error || !qaReport) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Quality Assurance</h1>
          <p className="text-muted-foreground">Failed to load QA report</p>
        </div>
      </div>
    );
  }

  const { summary, top_issues, projects_needing_attention, best_quality_projects, 
         category_quality_analysis, field_completeness } = qaReport;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-500" />
              <span>Quality Assurance</span>
            </h1>
            <p className="text-muted-foreground">
              Data quality validation and improvement recommendations
            </p>
          </div>
          <div className="flex space-x-2">
            <ExportDialog
              filters={{
                category: selectedCategory !== 'all' ? selectedCategory : undefined,
                severity: selectedSeverity !== 'all' ? selectedSeverity : undefined
              }}
              reportType="summary"
              triggerText="Export QA Report"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.keys(category_quality_analysis).map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_projects}</div>
              <p className="text-xs text-muted-foreground">
                {summary.projects_with_issues} with issues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Quality</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.average_quality_score.toFixed(1)}/10</div>
              <p className="text-xs text-muted-foreground">
                Quality score across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completeness</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.average_completeness.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average field completeness
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_issues}</div>
              <p className="text-xs text-muted-foreground">
                {summary.issues_by_severity.critical + summary.issues_by_severity.high} critical/high
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main QA Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="completeness">Completeness</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Issues by Severity */}
              <Card>
                <CardHeader>
                  <CardTitle>Issues by Severity</CardTitle>
                  <CardDescription>Distribution of quality issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(summary.issues_by_severity).map(([severity, count]) => ({
                          name: severity, value: count, fill: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS]
                        }))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {Object.entries(summary.issues_by_severity).map((_, index) => (
                          <Cell key={`cell-${index}`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Issues by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Issues by Type</CardTitle>
                  <CardDescription>Types of quality issues found</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(summary.issues_by_type).map(([type, count]) => ({
                      type: type.replace('_', ' '), count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Most Common Issues</CardTitle>
                <CardDescription>Top quality issues across all projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {top_issues.slice(0, 15).map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getSeverityIcon(issue.severity)}
                        <div>
                          <div className="font-medium">{issue.message}</div>
                          <div className="text-sm text-muted-foreground">
                            Field: {issue.field} • Type: {issue.type.replace('_', ' ')}
                          </div>
                          {issue.suggestion && (
                            <div className="text-sm text-blue-600 mt-1">
                              💡 {issue.suggestion}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getSeverityBadgeVariant(issue.severity)}>
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline">
                          {(issue as any).frequency} projects
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Projects Needing Attention */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span>Needs Attention</span>
                  </CardTitle>
                  <CardDescription>Projects with quality issues to resolve</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projects_needing_attention.slice(0, 10).map((project) => (
                      <div key={project.project_id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link 
                              href={`/projects/${project.project_id}`}
                              className="font-medium hover:underline line-clamp-1"
                            >
                              {project.title}
                            </Link>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">{project.category}</Badge>
                              <span className="text-xs text-muted-foreground">
                                Quality: {project.quality_score.toFixed(1)}/10
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Complete: {project.completeness_score.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <Badge variant="destructive" className="text-xs">
                            {project.quality_issues.length} issues
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          {project.quality_issues.slice(0, 2).map((issue, i) => (
                            <div key={i} className="flex items-center space-x-2 text-xs">
                              {getSeverityIcon(issue.severity)}
                              <span className="text-muted-foreground">{issue.message}</span>
                            </div>
                          ))}
                          {project.quality_issues.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{project.quality_issues.length - 2} more issues
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Best Quality Projects */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-green-500" />
                    <span>Highest Quality</span>
                  </CardTitle>
                  <CardDescription>Well-documented projects as examples</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {best_quality_projects.map((project) => (
                      <div key={project.project_id} className="p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link 
                              href={`/projects/${project.project_id}`}
                              className="font-medium hover:underline line-clamp-1"
                            >
                              {project.title}
                            </Link>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">{project.category}</Badge>
                              <span className="text-xs text-green-600 font-medium">
                                Quality: {project.quality_score.toFixed(1)}/10
                              </span>
                              <span className="text-xs text-green-600 font-medium">
                                Complete: {project.completeness_score.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Excellent
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Completeness Tab */}
          <TabsContent value="completeness" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Field Completeness Analysis</CardTitle>
                <CardDescription>How well each required field is populated</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={Object.entries(field_completeness).map(([field, stats]) => ({
                    field: field.replace('_', ' '),
                    percentage: (stats as any).percentage,
                    filled: (stats as any).filled_count,
                    missing: (stats as any).missing_count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="field" angle={-45} textAnchor="end" height={100} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value, name) => name === 'percentage' ? [`${(value as number).toFixed(1)}%`, 'Completeness'] : [value, name]} />
                    <Bar dataKey="percentage" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(category_quality_analysis).map(([category, analysis]) => (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-sm">{category}</CardTitle>
                    <CardDescription>{(analysis as any).project_count} projects</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Quality</span>
                      <Badge variant={(analysis as any).average_quality >= 7 ? 'default' : 'secondary'}>
                        {(analysis as any).average_quality.toFixed(1)}/10
                      </Badge>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium mb-2">Common Issues</div>
                      <div className="space-y-1">
                        {(analysis as any).common_issues.slice(0, 3).map((issue: any, i: number) => (
                          <div key={i} className="text-xs text-muted-foreground">
                            • {issue}
                          </div>
                        ))}
                      </div>
                    </div>
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