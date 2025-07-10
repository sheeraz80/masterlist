'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Bot, Eye, TrendingUp, Zap, Globe, 
  AlertTriangle, MessageSquare, Activity, Target
} from 'lucide-react';

// Import QA components
import { AutomatedTestingSuite } from '@/components/qa/automated-testing-suite';
import { VisualRegressionTesting } from '@/components/qa/visual-regression-testing';
import { PredictiveQualityMetrics } from '@/components/qa/predictive-quality-metrics';
import { CodeQualityDashboard } from '@/components/qa/code-quality-dashboard';
import { TestPrioritization } from '@/components/qa/test-prioritization';
import { PerformanceProfiling } from '@/components/qa/performance-profiling';
import { SecurityScanner } from '@/components/qa/security-scanner';
import { CompatibilityMatrix } from '@/components/qa/compatibility-matrix';
import { ChaosEngineering } from '@/components/qa/chaos-engineering';
import { NaturalLanguageTesting } from '@/components/qa/natural-language-testing';

export default function QAPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Quality Assurance Hub</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered testing and quality monitoring for your projects
          </p>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Code Coverage</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87.3%</div>
              <p className="text-xs text-muted-foreground">+2.4% from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Pass Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">1,243 of 1,319 passing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">A-</div>
              <p className="text-xs text-muted-foreground">3 medium issues found</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance Index</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92/100</div>
              <p className="text-xs text-muted-foreground">Lighthouse score</p>
            </CardContent>
          </Card>
        </div>

        {/* Main QA Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList className="flex w-max min-w-full justify-start gap-1">
              <TabsTrigger value="dashboard" className="whitespace-nowrap">
                <Activity className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="automated" className="whitespace-nowrap">
                <Bot className="h-4 w-4 mr-2" />
                AI Testing
              </TabsTrigger>
              <TabsTrigger value="visual" className="whitespace-nowrap">
                <Eye className="h-4 w-4 mr-2" />
                Visual Testing
              </TabsTrigger>
              <TabsTrigger value="predictive" className="whitespace-nowrap">
                <TrendingUp className="h-4 w-4 mr-2" />
                Predictive QA
              </TabsTrigger>
              <TabsTrigger value="prioritization" className="whitespace-nowrap">
                <Target className="h-4 w-4 mr-2" />
                Test Priority
              </TabsTrigger>
              <TabsTrigger value="performance" className="whitespace-nowrap">
                <Zap className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="security" className="whitespace-nowrap">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="compatibility" className="whitespace-nowrap">
                <Globe className="h-4 w-4 mr-2" />
                Compatibility
              </TabsTrigger>
              <TabsTrigger value="chaos" className="whitespace-nowrap">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Chaos Testing
              </TabsTrigger>
              <TabsTrigger value="natural" className="whitespace-nowrap">
                <MessageSquare className="h-4 w-4 mr-2" />
                Natural Language
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            <CodeQualityDashboard />
          </TabsContent>

          <TabsContent value="automated">
            <AutomatedTestingSuite />
          </TabsContent>

          <TabsContent value="visual">
            <VisualRegressionTesting />
          </TabsContent>

          <TabsContent value="predictive">
            <PredictiveQualityMetrics />
          </TabsContent>

          <TabsContent value="prioritization">
            <TestPrioritization />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceProfiling />
          </TabsContent>

          <TabsContent value="security">
            <SecurityScanner />
          </TabsContent>

          <TabsContent value="compatibility">
            <CompatibilityMatrix />
          </TabsContent>

          <TabsContent value="chaos">
            <ChaosEngineering />
          </TabsContent>

          <TabsContent value="natural">
            <NaturalLanguageTesting />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}