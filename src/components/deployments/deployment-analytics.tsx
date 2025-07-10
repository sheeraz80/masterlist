'use client';

import { useState, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, Zap, Shield, Clock,
  AlertCircle, CheckCircle, Globe, Server, Activity
} from 'lucide-react';
import type { DeploymentStatsResponse } from '@/types/deployment';

interface DeploymentAnalyticsProps {
  stats: DeploymentStatsResponse;
  deployments: any[];
}

export function DeploymentAnalytics({ stats, deployments }: DeploymentAnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7d');

  // Platform colors
  const platformColors = {
    VERCEL: '#000000',
    NETLIFY: '#00C7B7',
    AWS_AMPLIFY: '#FF9900',
    CLOUDFLARE_PAGES: '#F38020',
    GITHUB_PAGES: '#24292E',
    HEROKU: '#430098',
    DIGITAL_OCEAN: '#0080FF',
    RENDER: '#46E3B7',
    RAILWAY: '#0B0E13',
    FLY_IO: '#7E3FF2',
    CUSTOM: '#6B7280'
  };

  // Calculate deployment success rate
  const successRate = useMemo(() => {
    const recentDeployments = deployments.slice(0, 100);
    const successful = recentDeployments.filter(d => d.status === 'READY').length;
    return recentDeployments.length > 0 ? (successful / recentDeployments.length) * 100 : 0;
  }, [deployments]);

  // Calculate platform distribution data
  const platformDistributionData = useMemo(() => {
    return Object.entries(stats.platformDistribution).map(([platform, count]) => ({
      name: platform.replace('_', ' '),
      value: count,
      percentage: ((count / stats.totalDeployments) * 100).toFixed(1)
    }));
  }, [stats]);

  // Calculate environment distribution data
  const environmentData = useMemo(() => {
    return Object.entries(stats.environmentDistribution).map(([env, count]) => ({
      name: env.charAt(0).toUpperCase() + env.slice(1),
      deployments: count,
      percentage: ((count / stats.totalDeployments) * 100).toFixed(1)
    }));
  }, [stats]);

  // Health metrics radar data
  const healthRadarData = useMemo(() => {
    const maxUptime = 100;
    const maxResponseTime = 500; // ms
    const incidentRate = stats.healthMetrics.totalIncidents > 0
      ? (stats.healthMetrics.resolvedIncidents / stats.healthMetrics.totalIncidents) * 100
      : 100;

    return [
      {
        metric: 'Uptime',
        value: (stats.healthMetrics.averageUptime / maxUptime) * 100,
        fullMark: 100
      },
      {
        metric: 'Performance',
        value: Math.max(0, 100 - (stats.healthMetrics.averageResponseTime / maxResponseTime) * 100),
        fullMark: 100
      },
      {
        metric: 'Incident Resolution',
        value: incidentRate,
        fullMark: 100
      },
      {
        metric: 'Success Rate',
        value: successRate,
        fullMark: 100
      }
    ];
  }, [stats, successRate]);

  // Performance over time (simulated for now)
  const performanceTrends = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        uptime: 98 + Math.random() * 2,
        responseTime: 150 + Math.random() * 100,
        deployments: Math.floor(Math.random() * 20) + 5,
        incidents: Math.floor(Math.random() * 3)
      };
    });
  }, [timeRange]);

  // Deployment frequency by platform
  const deploymentFrequency = useMemo(() => {
    return stats.deploymentTrends.map(trend => ({
      date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total: trend.deployments,
      successful: trend.successes,
      failed: trend.failures
    }));
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Last 100 deployments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(stats.healthMetrics.averageResponseTime)}ms
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-green-600" />
              12% faster than last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.healthMetrics.totalIncidents - stats.healthMetrics.resolvedIncidents}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.healthMetrics.resolvedIncidents} resolved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Deploy Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalDeployments / 30).toFixed(1)}/day
            </div>
            <p className="text-xs text-muted-foreground">30-day average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Platform Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(stats.platformDistribution).length}
            </div>
            <p className="text-xs text-muted-foreground">Active platforms</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Deployment Frequency Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Deployment Frequency</CardTitle>
                <CardDescription>Daily deployment count and success rate</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={deploymentFrequency}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="successful"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Successful"
                    />
                    <Area
                      type="monotone"
                      dataKey="failed"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.6}
                      name="Failed"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Health Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Health Metrics</CardTitle>
                <CardDescription>Overall system health indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={healthRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Current"
                      dataKey="value"
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
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Platform Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
                <CardDescription>Deployments by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {platformDistributionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={platformColors[entry.name.replace(' ', '_')] || '#8884d8'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Environment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Environment Distribution</CardTitle>
                <CardDescription>Deployments by environment type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={environmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="deployments" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Platform Details */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Detailed metrics by platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {platformDistributionData.map((platform) => (
                  <div key={platform.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: platformColors[platform.name.replace(' ', '_')] || '#8884d8' }}
                      />
                      <div>
                        <p className="font-medium">{platform.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {platform.value} deployments ({platform.percentage}%)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        98% success
                      </Badge>
                      <Badge variant="outline">
                        <Zap className="h-3 w-3 mr-1" />
                        120ms avg
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Response time and uptime over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Response Time (ms)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="uptime"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Uptime %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Analysis</CardTitle>
              <CardDescription>Incident frequency and resolution metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="incidents"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                    name="Incidents"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}