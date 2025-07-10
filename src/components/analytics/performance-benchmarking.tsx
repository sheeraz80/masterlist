'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Target, TrendingUp, TrendingDown, Trophy, Flag, Calendar,
  ArrowUp, ArrowDown, Minus, CheckCircle, AlertTriangle,
  Zap, DollarSign, Users, BarChart3, Clock, Star,
  Plus, Edit, Trash2, Save, RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface Goal {
  id: string;
  title: string;
  description: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  category: string;
  createdAt: string;
}

interface KPI {
  id: string;
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  unit: string;
  category: string;
  benchmark?: number;
}

interface PerformanceBenchmarkingProps {
  analytics: any;
  projects: any[];
}

export function PerformanceBenchmarking({ analytics, projects }: PerformanceBenchmarkingProps) {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Increase Portfolio Quality',
      description: 'Achieve average quality score of 8.5 across all projects',
      metric: 'quality_score',
      targetValue: 8.5,
      currentValue: analytics?.overview?.average_quality || 7.2,
      deadline: '2024-12-31',
      priority: 'high',
      status: 'in_progress',
      category: 'Quality',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      title: 'Revenue Growth Target',
      description: 'Reach $2M total revenue potential across portfolio',
      metric: 'revenue',
      targetValue: 2000000,
      currentValue: analytics?.overview?.total_revenue_potential || 1500000,
      deadline: '2024-06-30',
      priority: 'high',
      status: 'in_progress',
      category: 'Financial',
      createdAt: '2024-01-01'
    },
    {
      id: '3',
      title: 'Project Diversification',
      description: 'Have at least 8 different project categories',
      metric: 'categories',
      targetValue: 8,
      currentValue: analytics?.overview?.categories_count || 5,
      deadline: '2024-09-30',
      priority: 'medium',
      status: 'in_progress',
      category: 'Strategy',
      createdAt: '2024-01-01'
    }
  ]);

  const [kpis, setKpis] = useState<KPI[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    metric: 'quality_score',
    targetValue: '',
    deadline: '',
    priority: 'medium' as const,
    category: 'Quality'
  });
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);

  // Initialize KPIs from analytics data
  useEffect(() => {
    if (analytics) {
      const calculatedKPIs: KPI[] = [
        {
          id: 'quality',
          name: 'Average Quality Score',
          value: analytics.overview?.average_quality || 0,
          target: 8.5,
          trend: 'up',
          change: 5.2,
          unit: '/10',
          category: 'Quality',
          benchmark: 7.8
        },
        {
          id: 'revenue',
          name: 'Total Revenue Potential',
          value: analytics.overview?.total_revenue_potential || 0,
          target: 2000000,
          trend: 'up',
          change: 12.8,
          unit: '$',
          category: 'Financial',
          benchmark: 1800000
        },
        {
          id: 'projects',
          name: 'Total Projects',
          value: analytics.overview?.total_projects || 0,
          target: 700,
          trend: 'up',
          change: 8.4,
          unit: '',
          category: 'Volume',
          benchmark: 600
        },
        {
          id: 'complexity',
          name: 'Average Complexity',
          value: analytics.overview?.average_complexity || 0,
          target: 6.0,
          trend: 'down',
          change: -2.1,
          unit: '/10',
          category: 'Quality',
          benchmark: 6.5
        },
        {
          id: 'categories',
          name: 'Project Categories',
          value: analytics.overview?.categories_count || 0,
          target: 8,
          trend: 'up',
          change: 14.3,
          unit: '',
          category: 'Strategy',
          benchmark: 6
        },
        {
          id: 'activities',
          name: 'Recent Activities',
          value: analytics.overview?.total_activities || 0,
          target: 500,
          trend: 'up',
          change: 22.1,
          unit: '',
          category: 'Engagement',
          benchmark: 300
        }
      ];
      setKpis(calculatedKPIs);
    }
  }, [analytics]);

  const formatValue = (value: number, unit: string) => {
    if (unit === '$') {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
      return `$${value}`;
    }
    if (unit === '/10') return value.toFixed(1);
    return value.toString();
  };

  const getGoalProgress = (goal: Goal) => {
    return Math.min(100, (goal.currentValue / goal.targetValue) * 100);
  };

  const getGoalStatus = (goal: Goal) => {
    const progress = getGoalProgress(goal);
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const isOverdue = now > deadline;

    if (progress >= 100) return 'completed';
    if (isOverdue) return 'overdue';
    if (progress > 0) return 'in_progress';
    return 'not_started';
  };

  const addGoal = () => {
    if (!newGoal.title || !newGoal.targetValue || !newGoal.deadline) return;

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      metric: newGoal.metric,
      targetValue: parseFloat(newGoal.targetValue),
      currentValue: getCurrentValueForMetric(newGoal.metric),
      deadline: newGoal.deadline,
      priority: newGoal.priority,
      status: 'not_started',
      category: newGoal.category,
      createdAt: new Date().toISOString()
    };

    setGoals(prev => [...prev, goal]);
    setNewGoal({
      title: '',
      description: '',
      metric: 'quality_score',
      targetValue: '',
      deadline: '',
      priority: 'medium',
      category: 'Quality'
    });
    setShowNewGoalForm(false);
  };

  const getCurrentValueForMetric = (metric: string) => {
    switch (metric) {
      case 'quality_score': return analytics?.overview?.average_quality || 0;
      case 'revenue': return analytics?.overview?.total_revenue_potential || 0;
      case 'categories': return analytics?.overview?.categories_count || 0;
      case 'projects': return analytics?.overview?.total_projects || 0;
      case 'complexity': return analytics?.overview?.average_complexity || 0;
      default: return 0;
    }
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const benchmarkData = [
    { month: 'Jan', your: 7.2, industry: 6.8, target: 8.0 },
    { month: 'Feb', your: 7.4, industry: 6.9, target: 8.1 },
    { month: 'Mar', your: 7.6, industry: 7.0, target: 8.2 },
    { month: 'Apr', your: 7.8, industry: 7.1, target: 8.3 },
    { month: 'May', your: 8.0, industry: 7.2, target: 8.4 },
    { month: 'Jun', your: 8.2, industry: 7.3, target: 8.5 }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Benchmarking & Goals
          </CardTitle>
          <CardDescription>
            Track KPIs, set goals, and benchmark against industry standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="kpis">KPIs</TabsTrigger>
              <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Performance Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.slice(0, 4).map(kpi => (
                  <Card key={kpi.id} className="relative overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{kpi.name}</p>
                          <p className="text-2xl font-bold">
                            {formatValue(kpi.value, kpi.unit)}{kpi.unit !== '$' ? kpi.unit : ''}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            {kpi.trend === 'up' && <ArrowUp className="h-3 w-3 text-green-500" />}
                            {kpi.trend === 'down' && <ArrowDown className="h-3 w-3 text-red-500" />}
                            {kpi.trend === 'stable' && <Minus className="h-3 w-3 text-gray-500" />}
                            <span className={`text-xs ${
                              kpi.trend === 'up' ? 'text-green-500' : 
                              kpi.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                            }`}>
                              {Math.abs(kpi.change)}%
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Progress 
                            value={Math.min(100, (kpi.value / kpi.target) * 100)} 
                            className="w-16 h-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Target: {formatValue(kpi.target, kpi.unit)}{kpi.unit !== '$' ? kpi.unit : ''}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Goal Progress Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Goal Progress Summary</span>
                    <Badge variant="outline">
                      {goals.filter(g => getGoalStatus(g) === 'completed').length}/{goals.length} completed
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {goals.slice(0, 3).map(goal => {
                      const progress = getGoalProgress(goal);
                      const status = getGoalStatus(goal);
                      return (
                        <div key={goal.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{goal.title}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant={
                                status === 'completed' ? 'default' :
                                status === 'overdue' ? 'destructive' :
                                status === 'in_progress' ? 'secondary' : 'outline'
                              }>
                                {status.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {progress.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals" className="space-y-6">
              {/* Goal Management */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Goals & Targets</h3>
                <Button onClick={() => setShowNewGoalForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Goal
                </Button>
              </div>

              {showNewGoalForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Goal</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label>Goal Title</Label>
                        <Input
                          value={newGoal.title}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Increase Quality Score"
                        />
                      </div>
                      <div>
                        <Label>Metric</Label>
                        <Select value={newGoal.metric} onValueChange={(value) => setNewGoal(prev => ({ ...prev, metric: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quality_score">Quality Score</SelectItem>
                            <SelectItem value="revenue">Revenue Potential</SelectItem>
                            <SelectItem value="categories">Project Categories</SelectItem>
                            <SelectItem value="projects">Total Projects</SelectItem>
                            <SelectItem value="complexity">Technical Complexity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Target Value</Label>
                        <Input
                          type="number"
                          value={newGoal.targetValue}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, targetValue: e.target.value }))}
                          placeholder="8.5"
                        />
                      </div>
                      <div>
                        <Label>Deadline</Label>
                        <Input
                          type="date"
                          value={newGoal.deadline}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Priority</Label>
                        <Select value={newGoal.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewGoal(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={newGoal.category}
                          onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value }))}
                          placeholder="Quality"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={newGoal.description}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Detailed description of the goal"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addGoal}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Goal
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewGoalForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Goals List */}
              <div className="grid gap-4 md:grid-cols-2">
                {goals.map(goal => {
                  const progress = getGoalProgress(goal);
                  const status = getGoalStatus(goal);
                  const daysToDeadline = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  
                  return (
                    <Card key={goal.id} className={`${status === 'overdue' ? 'border-red-200' : ''}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{goal.title}</CardTitle>
                            <CardDescription>{goal.description}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              goal.priority === 'high' ? 'destructive' :
                              goal.priority === 'medium' ? 'secondary' : 'outline'
                            }>
                              {goal.priority}
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => deleteGoal(goal.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Progress</span>
                              <span className="text-sm">
                                {formatValue(goal.currentValue, goal.metric === 'revenue' ? '$' : goal.metric === 'quality_score' ? '/10' : '')} / 
                                {formatValue(goal.targetValue, goal.metric === 'revenue' ? '$' : goal.metric === 'quality_score' ? '/10' : '')}
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(0)}% complete</p>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className={daysToDeadline < 0 ? 'text-red-500' : daysToDeadline < 30 ? 'text-orange-500' : 'text-muted-foreground'}>
                                {daysToDeadline < 0 ? `${Math.abs(daysToDeadline)} days overdue` : `${daysToDeadline} days left`}
                              </span>
                            </div>
                            <Badge variant={
                              status === 'completed' ? 'default' :
                              status === 'overdue' ? 'destructive' :
                              status === 'in_progress' ? 'secondary' : 'outline'
                            }>
                              {status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {status === 'overdue' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="kpis" className="space-y-6">
              {/* KPI Dashboard */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Performance Indicators</CardTitle>
                    <CardDescription>Track your most important metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {kpis.map(kpi => (
                        <div key={kpi.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${
                              kpi.category === 'Quality' ? 'bg-blue-100' :
                              kpi.category === 'Financial' ? 'bg-green-100' :
                              kpi.category === 'Volume' ? 'bg-purple-100' :
                              kpi.category === 'Strategy' ? 'bg-orange-100' : 'bg-gray-100'
                            }`}>
                              {kpi.category === 'Quality' && <Star className="h-4 w-4 text-blue-600" />}
                              {kpi.category === 'Financial' && <DollarSign className="h-4 w-4 text-green-600" />}
                              {kpi.category === 'Volume' && <BarChart3 className="h-4 w-4 text-purple-600" />}
                              {kpi.category === 'Strategy' && <Target className="h-4 w-4 text-orange-600" />}
                              {kpi.category === 'Engagement' && <Users className="h-4 w-4 text-blue-600" />}
                            </div>
                            <div>
                              <p className="font-medium">{kpi.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatValue(kpi.value, kpi.unit)}{kpi.unit !== '$' ? kpi.unit : ''} of {formatValue(kpi.target, kpi.unit)}{kpi.unit !== '$' ? kpi.unit : ''}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              {kpi.trend === 'up' && <ArrowUp className="h-4 w-4 text-green-500" />}
                              {kpi.trend === 'down' && <ArrowDown className="h-4 w-4 text-red-500" />}
                              {kpi.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                              <span className={`font-medium ${
                                kpi.trend === 'up' ? 'text-green-500' : 
                                kpi.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                              }`}>
                                {kpi.change > 0 ? '+' : ''}{kpi.change}%
                              </span>
                            </div>
                            <Progress 
                              value={Math.min(100, (kpi.value / kpi.target) * 100)} 
                              className="w-20 h-2 mt-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>Track progress over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={benchmarkData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="your" stroke="#3b82f6" strokeWidth={2} name="Your Performance" />
                        <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="benchmarks" className="space-y-6">
              {/* Industry Benchmarks */}
              <Card>
                <CardHeader>
                  <CardTitle>Industry Benchmarks</CardTitle>
                  <CardDescription>Compare your performance against industry standards</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={benchmarkData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="industry" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Industry Average" />
                      <Area type="monotone" dataKey="your" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Your Performance" />
                      <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                {kpis.filter(kpi => kpi.benchmark).map(kpi => (
                  <Card key={kpi.id}>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{kpi.name}</h4>
                          <Badge variant={kpi.value > (kpi.benchmark || 0) ? 'default' : 'secondary'}>
                            {kpi.value > (kpi.benchmark || 0) ? 'Above' : 'Below'} Average
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Your Value</span>
                            <span className="font-medium">{formatValue(kpi.value, kpi.unit)}{kpi.unit !== '$' ? kpi.unit : ''}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Industry Avg</span>
                            <span>{formatValue(kpi.benchmark || 0, kpi.unit)}{kpi.unit !== '$' ? kpi.unit : ''}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Difference</span>
                            <span className={kpi.value > (kpi.benchmark || 0) ? 'text-green-500' : 'text-red-500'}>
                              {kpi.value > (kpi.benchmark || 0) ? '+' : ''}{((kpi.value - (kpi.benchmark || 0)) / (kpi.benchmark || 1) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        
                        <Progress 
                          value={Math.min(100, (kpi.value / (kpi.benchmark || 1)) * 100)} 
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}