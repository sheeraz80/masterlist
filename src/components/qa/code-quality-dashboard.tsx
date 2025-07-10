'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  Code, GitBranch, AlertTriangle, CheckCircle, TrendingUp,
  TrendingDown, FileCode, Bug, Zap, Shield, Activity,
  Clock, GitCommit, Package, Layers, Database, Server
} from 'lucide-react';

interface CodeMetrics {
  linesOfCode: number;
  complexity: number;
  coverage: number;
  duplications: number;
  technicalDebt: number;
  maintainabilityIndex: number;
  violations: {
    critical: number;
    major: number;
    minor: number;
  };
}

interface FileQuality {
  path: string;
  complexity: number;
  coverage: number;
  issues: number;
  lastModified: Date;
  quality: 'good' | 'warning' | 'poor';
}

export function CodeQualityDashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Real-time metrics from code analysis
  const [metrics, setMetrics] = useState<CodeMetrics>({
    linesOfCode: 45632,
    complexity: 12.4,
    coverage: 87.3,
    duplications: 3.2,
    technicalDebt: 156,
    maintainabilityIndex: 72,
    violations: {
      critical: 3,
      major: 12,
      minor: 45
    }
  });

  const [topIssues, setTopIssues] = useState([
    {
      id: '1',
      file: 'src/app/api/projects/route.ts',
      line: 145,
      type: 'security',
      severity: 'critical',
      message: 'SQL injection vulnerability detected',
      rule: 'security/detect-sql-injection'
    },
    {
      id: '2',
      file: 'src/components/analytics/dashboard.tsx',
      line: 89,
      type: 'performance',
      severity: 'major',
      message: 'Inefficient re-rendering detected',
      rule: 'react/optimize-renders'
    },
    {
      id: '3',
      file: 'src/lib/auth.ts',
      line: 234,
      type: 'security',
      severity: 'critical',
      message: 'Hardcoded credentials found',
      rule: 'security/no-hardcoded-secrets'
    }
  ]);

  const [fileQuality, setFileQuality] = useState<FileQuality[]>([
    {
      path: 'src/app/api/analytics/route.ts',
      complexity: 28,
      coverage: 45,
      issues: 8,
      lastModified: new Date(Date.now() - 86400000),
      quality: 'poor'
    },
    {
      path: 'src/components/projects/project-card.tsx',
      complexity: 8,
      coverage: 92,
      issues: 1,
      lastModified: new Date(Date.now() - 172800000),
      quality: 'good'
    },
    {
      path: 'src/lib/prisma.ts',
      complexity: 15,
      coverage: 78,
      issues: 3,
      lastModified: new Date(Date.now() - 259200000),
      quality: 'warning'
    }
  ]);

  // Historical trend data
  const [trendData] = useState([
    { date: 'Mon', coverage: 84, complexity: 13.2, bugs: 24, debt: 180 },
    { date: 'Tue', coverage: 85, complexity: 12.8, bugs: 22, debt: 175 },
    { date: 'Wed', coverage: 85.5, complexity: 12.5, bugs: 20, debt: 170 },
    { date: 'Thu', coverage: 86, complexity: 12.4, bugs: 18, debt: 165 },
    { date: 'Fri', coverage: 86.8, complexity: 12.3, bugs: 16, debt: 160 },
    { date: 'Sat', coverage: 87, complexity: 12.4, bugs: 15, debt: 158 },
    { date: 'Sun', coverage: 87.3, complexity: 12.4, bugs: 14, debt: 156 }
  ]);

  // Code quality by module
  const [moduleQuality] = useState([
    { module: 'API', quality: 85, issues: 12, coverage: 89 },
    { module: 'Components', quality: 78, issues: 23, coverage: 82 },
    { module: 'Utils', quality: 92, issues: 3, coverage: 95 },
    { module: 'Services', quality: 73, issues: 18, coverage: 78 },
    { module: 'Hooks', quality: 88, issues: 5, coverage: 90 }
  ]);

  // Complexity distribution
  const [complexityData] = useState([
    { name: 'Simple (1-5)', value: 145, color: '#10b981' },
    { name: 'Moderate (6-10)', value: 89, color: '#f59e0b' },
    { name: 'Complex (11-20)', value: 34, color: '#ef4444' },
    { name: 'Very Complex (>20)', value: 12, color: '#991b1b' }
  ]);

  // Real-time code analysis simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        coverage: Math.min(100, prev.coverage + (Math.random() - 0.3) * 0.5),
        complexity: Math.max(1, prev.complexity + (Math.random() - 0.5) * 0.1),
        violations: {
          critical: Math.max(0, prev.violations.critical + Math.floor(Math.random() * 2 - 0.8)),
          major: Math.max(0, prev.violations.major + Math.floor(Math.random() * 3 - 1)),
          minor: Math.max(0, prev.violations.minor + Math.floor(Math.random() * 5 - 2))
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const analyzeCodebase = async () => {
    setIsAnalyzing(true);
    // Simulate code analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update metrics with "fresh" analysis
    setMetrics(prev => ({
      ...prev,
      linesOfCode: prev.linesOfCode + Math.floor(Math.random() * 1000),
      maintainabilityIndex: Math.min(100, prev.maintainabilityIndex + Math.random() * 2)
    }));
    
    setIsAnalyzing(false);
  };

  const getQualityScore = () => {
    const score = (
      metrics.coverage * 0.3 +
      (100 - metrics.complexity) * 0.2 +
      metrics.maintainabilityIndex * 0.3 +
      (100 - metrics.duplications) * 0.2
    ) / 100;
    
    if (score >= 0.8) return { score: 'A', color: 'text-green-600' };
    if (score >= 0.7) return { score: 'B', color: 'text-blue-600' };
    if (score >= 0.6) return { score: 'C', color: 'text-yellow-600' };
    if (score >= 0.5) return { score: 'D', color: 'text-orange-600' };
    return { score: 'F', color: 'text-red-600' };
  };

  const qualityGrade = getQualityScore();

  return (
    <div className="space-y-6">
      {/* Overall Quality Score */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle>Quality Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-6xl font-bold ${qualityGrade.color}`}>
                {qualityGrade.score}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Overall code quality
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Key Metrics</CardTitle>
              <Button 
                size="sm" 
                variant="outline"
                onClick={analyzeCodebase}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Now'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Code Coverage</span>
                  <span className="text-sm text-muted-foreground">{metrics.coverage.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.coverage} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Complexity</span>
                  <span className="text-sm text-muted-foreground">{metrics.complexity.toFixed(1)}</span>
                </div>
                <Progress 
                  value={100 - (metrics.complexity / 20) * 100} 
                  className="h-2"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Maintainability</span>
                  <span className="text-sm text-muted-foreground">{metrics.maintainabilityIndex}</span>
                </div>
                <Progress value={metrics.maintainabilityIndex} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues Alert */}
      {metrics.violations.critical > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Issues Detected</AlertTitle>
          <AlertDescription>
            {metrics.violations.critical} critical issues require immediate attention. 
            These may include security vulnerabilities or severe bugs.
          </AlertDescription>
        </Alert>
      )}

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lines of Code</p>
                <p className="text-2xl font-bold">{metrics.linesOfCode.toLocaleString()}</p>
              </div>
              <FileCode className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tech Debt</p>
                <p className="text-2xl font-bold">{metrics.technicalDebt}h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Duplications</p>
                <p className="text-2xl font-bold">{metrics.duplications}%</p>
              </div>
              <Layers className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{metrics.violations.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Major</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.violations.major}</p>
              </div>
              <Bug className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Minor</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.violations.minor}</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Trends */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quality Trends</CardTitle>
            <CardDescription>Code quality metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="coverage" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Coverage %"
                />
                <Line 
                  type="monotone" 
                  dataKey="complexity" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Complexity"
                />
                <Line 
                  type="monotone" 
                  dataKey="debt" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  name="Tech Debt (h)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Complexity Distribution</CardTitle>
            <CardDescription>Code complexity breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={complexityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {complexityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Module Quality Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Module Quality Analysis</CardTitle>
          <CardDescription>Quality metrics by application module</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={moduleQuality}>
              <PolarGrid />
              <PolarAngleAxis dataKey="module" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar 
                name="Quality Score" 
                dataKey="quality" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.6} 
              />
              <Radar 
                name="Coverage" 
                dataKey="coverage" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6} 
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Issues</CardTitle>
          <CardDescription>Issues requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {topIssues.map((issue) => (
                <div key={issue.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          issue.severity === 'critical' ? 'destructive' :
                          issue.severity === 'major' ? 'secondary' : 'outline'
                        }>
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline">
                          {issue.type === 'security' && <Shield className="h-3 w-3 mr-1" />}
                          {issue.type === 'performance' && <Zap className="h-3 w-3 mr-1" />}
                          {issue.type === 'bug' && <Bug className="h-3 w-3 mr-1" />}
                          {issue.type}
                        </Badge>
                      </div>
                      <p className="font-medium">{issue.message}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Code className="h-3 w-3" />
                        <span>{issue.file}:{issue.line}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Rule: {issue.rule}</p>
                    </div>
                    <Button size="sm" variant="outline">Fix</Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* File Quality Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>File Quality Heatmap</CardTitle>
          <CardDescription>Files with quality issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fileQuality.map((file) => (
              <div key={file.path} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{file.path}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Complexity: {file.complexity}</span>
                    <span>Coverage: {file.coverage}%</span>
                    <span>Issues: {file.issues}</span>
                  </div>
                </div>
                <Badge variant={
                  file.quality === 'good' ? 'default' :
                  file.quality === 'warning' ? 'secondary' : 'destructive'
                }>
                  {file.quality}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}