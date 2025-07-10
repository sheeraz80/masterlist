'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { 
  GitCompare, TrendingUp, TrendingDown, Minus,
  Target, DollarSign, Users, Star, Clock, AlertTriangle
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  qualityScore: number;
  technicalComplexity: number;
  revenuePotential: number;
  activitiesCount: number;
  category: string;
  developmentTime: string;
  competitionLevel: string;
}

interface ComparativeDashboardProps {
  projects: Project[];
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function ComparativeDashboard({ projects }: ComparativeDashboardProps) {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'radar' | 'bar' | 'scatter'>('radar');

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectId)) {
        return prev.filter(id => id !== projectId);
      }
      if (prev.length >= 5) {
        return [...prev.slice(1), projectId];
      }
      return [...prev, projectId];
    });
  };

  const getSelectedProjectsData = () => {
    return projects.filter(p => selectedProjects.includes(p.id));
  };

  const getRadarData = () => {
    const selected = getSelectedProjectsData();
    const metrics = [
      'Quality',
      'Revenue',
      'Activity',
      'Simplicity',
      'Market'
    ];

    return metrics.map(metric => {
      const dataPoint: any = { metric };
      
      selected.forEach(project => {
        let value = 0;
        switch (metric) {
          case 'Quality':
            value = (project.qualityScore / 10) * 100;
            break;
          case 'Revenue':
            value = Math.min((project.revenuePotential / 500000) * 100, 100);
            break;
          case 'Activity':
            value = Math.min((project.activitiesCount / 100) * 100, 100);
            break;
          case 'Simplicity':
            value = ((10 - project.technicalComplexity) / 10) * 100;
            break;
          case 'Market':
            const competition = project.competitionLevel === 'Low' ? 3 : 
                              project.competitionLevel === 'Medium' ? 2 : 1;
            value = (competition / 3) * 100;
            break;
        }
        dataPoint[project.id] = value;
      });
      
      return dataPoint;
    });
  };

  const getComparisonMetrics = (project1: Project, project2: Project) => {
    const metrics = [
      {
        name: 'Quality Score',
        value1: project1.qualityScore,
        value2: project2.qualityScore,
        unit: '/10',
        better: project1.qualityScore > project2.qualityScore ? 1 : 
                project1.qualityScore < project2.qualityScore ? 2 : 0
      },
      {
        name: 'Revenue Potential',
        value1: project1.revenuePotential,
        value2: project2.revenuePotential,
        unit: '$',
        better: project1.revenuePotential > project2.revenuePotential ? 1 : 
                project1.revenuePotential < project2.revenuePotential ? 2 : 0
      },
      {
        name: 'Technical Complexity',
        value1: project1.technicalComplexity,
        value2: project2.technicalComplexity,
        unit: '/10',
        better: project1.technicalComplexity < project2.technicalComplexity ? 1 : 
                project1.technicalComplexity > project2.technicalComplexity ? 2 : 0
      },
      {
        name: 'Activities',
        value1: project1.activitiesCount,
        value2: project2.activitiesCount,
        unit: '',
        better: project1.activitiesCount > project2.activitiesCount ? 1 : 
                project1.activitiesCount < project2.activitiesCount ? 2 : 0
      }
    ];

    return metrics;
  };

  const getCategoryAverage = (category: string) => {
    const categoryProjects = projects.filter(p => p.category === category);
    if (categoryProjects.length === 0) return null;

    return {
      avgQuality: categoryProjects.reduce((sum, p) => sum + p.qualityScore, 0) / categoryProjects.length,
      avgRevenue: categoryProjects.reduce((sum, p) => sum + p.revenuePotential, 0) / categoryProjects.length,
      avgComplexity: categoryProjects.reduce((sum, p) => sum + p.technicalComplexity, 0) / categoryProjects.length,
      count: categoryProjects.length
    };
  };

  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Projects Available</h3>
          <p className="text-muted-foreground mb-4">
            No projects found for comparison. Please ensure you have projects in your database.
          </p>
          <p className="text-sm text-muted-foreground">
            Projects need to have quality scores, revenue potential, and other metrics to enable comparison.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Select Projects to Compare
          </CardTitle>
          <CardDescription>
            Choose up to 5 projects for detailed comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min(projects.length, 50)} of {projects.length} projects
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {projects.slice(0, 50).map(project => (
              <Badge
                key={project.id}
                variant={selectedProjects.includes(project.id) ? 'default' : 'outline'}
                className="cursor-pointer transition-all hover:bg-primary/10"
                onClick={() => toggleProjectSelection(project.id)}
                title={`${project.title} - Quality: ${project.qualityScore}/10, Revenue: $${(project.revenuePotential || 0).toLocaleString()}`}
              >
                {project.title?.length > 30 ? `${project.title.substring(0, 30)}...` : project.title || `Project ${project.id}`}
                {selectedProjects.includes(project.id) && (
                  <span className="ml-1">✓</span>
                )}
              </Badge>
            ))}
          </div>
          {selectedProjects.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              {selectedProjects.length} project{selectedProjects.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </CardContent>
      </Card>

      {selectedProjects.length >= 2 && (
        <>
          {/* Comparison Mode Selector */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Comparison Results</h3>
            <Tabs value={comparisonMode} onValueChange={(v) => setComparisonMode(v as any)}>
              <TabsList>
                <TabsTrigger value="radar">Radar</TabsTrigger>
                <TabsTrigger value="bar">Bar</TabsTrigger>
                <TabsTrigger value="scatter">Scatter</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Comparison Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Multi-dimensional Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Multi-dimensional Analysis</CardTitle>
                <CardDescription>
                  Compare projects across multiple metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {comparisonMode === 'radar' && (
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={getRadarData()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      {getSelectedProjectsData().map((project, index) => (
                        <Radar
                          key={project.id}
                          name={project.title}
                          dataKey={project.id}
                          stroke={COLORS[index]}
                          fill={COLORS[index]}
                          fillOpacity={0.3}
                        />
                      ))}
                      <Tooltip />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                )}

                {comparisonMode === 'bar' && (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={getSelectedProjectsData().map(p => ({
                        name: p.title.substring(0, 15) + '...',
                        quality: p.qualityScore,
                        revenue: p.revenuePotential / 10000,
                        complexity: p.technicalComplexity
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quality" fill="#8b5cf6" name="Quality (0-10)" />
                      <Bar dataKey="revenue" fill="#10b981" name="Revenue (x$10k)" />
                      <Bar dataKey="complexity" fill="#f59e0b" name="Complexity (0-10)" />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {comparisonMode === 'scatter' && (
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="revenue" 
                        name="Revenue Potential" 
                        unit="$"
                        domain={['dataMin', 'dataMax']}
                      />
                      <YAxis 
                        dataKey="quality" 
                        name="Quality Score" 
                        unit="/10"
                        domain={[0, 10]}
                      />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Legend />
                      {getSelectedProjectsData().map((project, index) => (
                        <Scatter
                          key={project.id}
                          name={project.title}
                          data={[{
                            revenue: project.revenuePotential,
                            quality: project.qualityScore,
                            complexity: project.technicalComplexity
                          }]}
                          fill={COLORS[index]}
                        />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Head-to-Head Comparison */}
            {selectedProjects.length === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Head-to-Head Comparison</CardTitle>
                  <CardDescription>
                    Direct comparison between two projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      const [p1, p2] = getSelectedProjectsData();
                      const metrics = getComparisonMetrics(p1, p2);
                      
                      return metrics.map(metric => (
                        <div key={metric.name} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{metric.name}</span>
                            <div className="flex items-center gap-2">
                              {metric.better === 1 && <TrendingUp className="h-4 w-4 text-green-500" />}
                              {metric.better === 2 && <TrendingDown className="h-4 w-4 text-red-500" />}
                              {metric.better === 0 && <Minus className="h-4 w-4 text-gray-500" />}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className={`p-3 rounded-lg border ${
                              metric.better === 1 ? 'border-green-200 bg-green-50' : 'border-gray-200'
                            }`}>
                              <p className="text-xs text-muted-foreground">{p1.title}</p>
                              <p className="text-lg font-semibold">
                                {metric.unit === '$' ? `$${metric.value1.toLocaleString()}` : 
                                 `${metric.value1}${metric.unit}`}
                              </p>
                            </div>
                            <div className={`p-3 rounded-lg border ${
                              metric.better === 2 ? 'border-green-200 bg-green-50' : 'border-gray-200'
                            }`}>
                              <p className="text-xs text-muted-foreground">{p2.title}</p>
                              <p className="text-lg font-semibold">
                                {metric.unit === '$' ? `$${metric.value2.toLocaleString()}` : 
                                 `${metric.value2}${metric.unit}`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Category Benchmarking */}
          <Card>
            <CardHeader>
              <CardTitle>Category Benchmarking</CardTitle>
              <CardDescription>
                Compare selected projects against category averages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getSelectedProjectsData().map(project => {
                  const categoryAvg = getCategoryAverage(project.category);
                  if (!categoryAvg) return null;

                  return (
                    <div key={project.id} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{project.title}</h4>
                        <Badge variant="outline">{project.category}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Quality</p>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{project.qualityScore}</span>
                            <span className="text-xs text-muted-foreground">
                              vs {categoryAvg.avgQuality.toFixed(1)} avg
                            </span>
                            {project.qualityScore > categoryAvg.avgQuality && 
                              <TrendingUp className="h-3 w-3 text-green-500" />}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              ${(project.revenuePotential / 1000).toFixed(0)}k
                            </span>
                            <span className="text-xs text-muted-foreground">
                              vs ${(categoryAvg.avgRevenue / 1000).toFixed(0)}k
                            </span>
                            {project.revenuePotential > categoryAvg.avgRevenue && 
                              <TrendingUp className="h-3 w-3 text-green-500" />}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-muted-foreground">Complexity</p>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{project.technicalComplexity}</span>
                            <span className="text-xs text-muted-foreground">
                              vs {categoryAvg.avgComplexity.toFixed(1)} avg
                            </span>
                            {project.technicalComplexity < categoryAvg.avgComplexity && 
                              <TrendingUp className="h-3 w-3 text-green-500" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}