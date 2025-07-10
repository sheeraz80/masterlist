'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  Brain, TrendingUp, AlertTriangle, Target, Zap,
  FileWarning, Bug, Shield, Clock, Activity,
  GitBranch, Users, Code, Database
} from 'lucide-react';

interface RiskPrediction {
  module: string;
  riskScore: number;
  confidence: number;
  factors: {
    complexity: number;
    churn: number;
    bugs: number;
    coverage: number;
    dependencies: number;
  };
  prediction: {
    bugProbability: number;
    estimatedBugs: number;
    timeToFix: number;
  };
}

interface QualityTrend {
  date: string;
  actual: number;
  predicted: number;
  confidence: number;
}

interface HotspotFile {
  path: string;
  riskScore: number;
  complexity: number;
  churn: number;
  authors: number;
  lastModified: Date;
  predictedIssues: number;
}

export function PredictiveQualityMetrics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedModule, setSelectedModule] = useState('all');
  
  // ML-based risk predictions
  const [riskPredictions] = useState<RiskPrediction[]>([
    {
      module: 'Authentication',
      riskScore: 78,
      confidence: 0.89,
      factors: {
        complexity: 85,
        churn: 72,
        bugs: 45,
        coverage: 68,
        dependencies: 92
      },
      prediction: {
        bugProbability: 0.74,
        estimatedBugs: 5,
        timeToFix: 16
      }
    },
    {
      module: 'Analytics',
      riskScore: 65,
      confidence: 0.92,
      factors: {
        complexity: 72,
        churn: 89,
        bugs: 38,
        coverage: 82,
        dependencies: 45
      },
      prediction: {
        bugProbability: 0.62,
        estimatedBugs: 3,
        timeToFix: 8
      }
    },
    {
      module: 'Projects',
      riskScore: 42,
      confidence: 0.87,
      factors: {
        complexity: 45,
        churn: 34,
        bugs: 12,
        coverage: 91,
        dependencies: 38
      },
      prediction: {
        bugProbability: 0.38,
        estimatedBugs: 1,
        timeToFix: 3
      }
    }
  ]);

  // Quality trend with predictions
  const [qualityTrends] = useState<QualityTrend[]>([
    { date: 'Week 1', actual: 72, predicted: 71, confidence: 0.85 },
    { date: 'Week 2', actual: 74, predicted: 73, confidence: 0.87 },
    { date: 'Week 3', actual: 73, predicted: 74, confidence: 0.86 },
    { date: 'Week 4', actual: 76, predicted: 75, confidence: 0.88 },
    { date: 'Week 5', actual: 78, predicted: 77, confidence: 0.90 },
    { date: 'Week 6', actual: null, predicted: 79, confidence: 0.89 },
    { date: 'Week 7', actual: null, predicted: 81, confidence: 0.87 },
    { date: 'Week 8', actual: null, predicted: 82, confidence: 0.85 }
  ]);

  // Hotspot analysis
  const [hotspotFiles] = useState<HotspotFile[]>([
    {
      path: 'src/app/api/auth/[...nextauth]/route.ts',
      riskScore: 92,
      complexity: 34,
      churn: 156,
      authors: 8,
      lastModified: new Date(Date.now() - 86400000),
      predictedIssues: 4
    },
    {
      path: 'src/lib/analytics/ai-insights.ts',
      riskScore: 85,
      complexity: 42,
      churn: 98,
      authors: 5,
      lastModified: new Date(Date.now() - 172800000),
      predictedIssues: 3
    },
    {
      path: 'src/components/projects/project-form.tsx',
      riskScore: 73,
      complexity: 28,
      churn: 67,
      authors: 6,
      lastModified: new Date(Date.now() - 259200000),
      predictedIssues: 2
    }
  ]);

  // Defect prediction by category
  const [defectPredictions] = useState([
    { category: 'Logic Errors', current: 12, predicted: 18, trend: 'up' },
    { category: 'UI Issues', current: 8, predicted: 6, trend: 'down' },
    { category: 'Performance', current: 5, predicted: 9, trend: 'up' },
    { category: 'Security', current: 3, predicted: 4, trend: 'up' },
    { category: 'Integration', current: 7, predicted: 5, trend: 'down' }
  ]);

  // Technical debt forecast
  const [debtForecast] = useState([
    { month: 'Current', debt: 156, cost: 31200 },
    { month: 'Month 1', debt: 168, cost: 33600 },
    { month: 'Month 2', debt: 182, cost: 36400 },
    { month: 'Month 3', debt: 198, cost: 39600 },
    { month: 'Month 4', debt: 216, cost: 43200 },
    { month: 'Month 5', debt: 236, cost: 47200 }
  ]);

  // Calculate overall risk score
  const overallRisk = riskPredictions.reduce((sum, pred) => sum + pred.riskScore, 0) / riskPredictions.length;
  
  const getRiskLevel = (score: number) => {
    if (score >= 80) return { level: 'Critical', color: 'text-red-600', bg: 'bg-red-100' };
    if (score >= 60) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (score >= 40) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const riskLevel = getRiskLevel(overallRisk);

  return (
    <div className="space-y-6">
      {/* Overall Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI-Powered Risk Assessment
          </CardTitle>
          <CardDescription>
            Machine learning predictions based on code metrics and historical data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="text-center p-6 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Overall Risk Score</p>
                <div className={`text-5xl font-bold ${riskLevel.color}`}>
                  {Math.round(overallRisk)}
                </div>
                <Badge className={`mt-2 ${riskLevel.bg} ${riskLevel.color}`}>
                  {riskLevel.level} Risk
                </Badge>
              </div>
              
              <Alert variant={overallRisk >= 60 ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Risk Summary</AlertTitle>
                <AlertDescription>
                  {overallRisk >= 80 
                    ? "Critical risk detected. Immediate action recommended to prevent quality degradation."
                    : overallRisk >= 60
                    ? "High risk areas identified. Consider allocating more resources to testing and review."
                    : "Risk levels are manageable. Continue monitoring key metrics."}
                </AlertDescription>
              </Alert>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Predicted Issues (Next 30 Days)</h4>
              <div className="grid gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Estimated Bugs</span>
                  </div>
                  <span className="font-bold text-lg">
                    {riskPredictions.reduce((sum, p) => sum + p.prediction.estimatedBugs, 0)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Time to Fix</span>
                  </div>
                  <span className="font-bold text-lg">
                    {riskPredictions.reduce((sum, p) => sum + p.prediction.timeToFix, 0)}h
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Confidence</span>
                  </div>
                  <span className="font-bold text-lg">
                    {Math.round(riskPredictions.reduce((sum, p) => sum + p.confidence, 0) / riskPredictions.length * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Module Risk Analysis</CardTitle>
          <CardDescription>
            Risk factors and predictions by application module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskPredictions.map((prediction) => (
              <div key={prediction.module} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{prediction.module}</h4>
                    <p className="text-sm text-muted-foreground">
                      {prediction.prediction.bugProbability > 0.6 ? 'High' : 'Moderate'} bug probability
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getRiskLevel(prediction.riskScore).color}`}>
                      {prediction.riskScore}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(prediction.confidence * 100)}% confidence
                    </Badge>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Complexity</span>
                      <span>{prediction.factors.complexity}</span>
                    </div>
                    <Progress value={prediction.factors.complexity} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Code Churn</span>
                      <span>{prediction.factors.churn}</span>
                    </div>
                    <Progress value={prediction.factors.churn} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Test Coverage</span>
                      <span>{prediction.factors.coverage}%</span>
                    </div>
                    <Progress value={prediction.factors.coverage} className="h-2" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Predicted: </span>
                    <span className="font-medium">{prediction.prediction.estimatedBugs} bugs</span>
                    <span className="text-muted-foreground"> in next 30 days</span>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quality Trend Prediction */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Trend & Forecast</CardTitle>
          <CardDescription>
            Historical quality metrics with AI predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={qualityTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[60, 90]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Actual Quality"
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Predicted Quality"
              />
              <Area
                type="monotone"
                dataKey="confidence"
                stroke="none"
                fill="#8b5cf6"
                fillOpacity={0.1}
                name="Confidence"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Hotspot Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Code Hotspots</CardTitle>
            <CardDescription>
              Files with highest predicted defect probability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hotspotFiles.map((file) => (
                <div key={file.path} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.path}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Complexity: {file.complexity}</span>
                      <span>Churn: {file.churn}</span>
                      <span>{file.authors} authors</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`font-bold ${getRiskLevel(file.riskScore).color}`}>
                      {file.riskScore}
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {file.predictedIssues} issues
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Defect Category Predictions */}
        <Card>
          <CardHeader>
            <CardTitle>Defect Predictions by Type</CardTitle>
            <CardDescription>
              Expected defect distribution in next sprint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={defectPredictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="current" fill="#94a3b8" name="Current" />
                <Bar dataKey="predicted" fill="#8b5cf6" name="Predicted" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Technical Debt Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Debt Forecast</CardTitle>
          <CardDescription>
            Projected technical debt accumulation and cost impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={debtForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'Cost') return `$${value.toLocaleString()}`;
                  return `${value} hours`;
                }}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="debt" 
                stroke="#ef4444" 
                fill="#ef4444"
                fillOpacity={0.3}
                name="Debt (hours)"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="cost" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Cost"
              />
            </AreaChart>
          </ResponsiveContainer>
          
          <Alert className="mt-4">
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Technical debt is projected to increase by 51% over the next 5 months, 
              resulting in an additional $16,000 in development costs. 
              Consider allocating 20% of sprint capacity to debt reduction.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}