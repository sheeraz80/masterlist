'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DeploymentAnalytics } from '@/components/deployments/deployment-analytics';
import { DeploymentInsights } from '@/components/deployments/deployment-insights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DeploymentStatsResponse, DeploymentListResponse } from '@/types/deployment';

export default function DeploymentAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('analytics');

  // Fetch deployment stats
  const { data: statsData, isLoading: statsLoading, refetch: refetchStats } = useQuery<DeploymentStatsResponse>({
    queryKey: ['deployment-stats'],
    queryFn: async () => {
      const response = await fetch('/api/deployments/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch deployments for analysis
  const { data: deploymentsData, isLoading: deploymentsLoading } = useQuery<DeploymentListResponse>({
    queryKey: ['deployments-analytics'],
    queryFn: async () => {
      const response = await fetch('/api/deployments?limit=100');
      if (!response.ok) throw new Error('Failed to fetch deployments');
      return response.json();
    },
    refetchInterval: 60000
  });

  const handleExportData = () => {
    if (!statsData || !deploymentsData) return;

    const exportData = {
      exportDate: new Date().toISOString(),
      stats: statsData,
      recentDeployments: deploymentsData.deployments.slice(0, 50)
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deployment-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isLoading = statsLoading || deploymentsLoading;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/deployments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Deployment Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Analyze deployment performance, trends, and insights
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              refetchStats();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={isLoading || !statsData || !deploymentsData}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      ) : statsData && deploymentsData ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="insights">Insights & Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <DeploymentAnalytics 
              stats={statsData} 
              deployments={deploymentsData.deployments}
            />
          </TabsContent>

          <TabsContent value="insights">
            <DeploymentInsights 
              stats={statsData} 
              deployments={deploymentsData.deployments}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load analytics data</p>
          <Button onClick={() => refetchStats()} className="mt-4">
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}