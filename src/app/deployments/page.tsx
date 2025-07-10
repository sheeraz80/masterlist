'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Cloud, Globe, Activity, AlertCircle, CheckCircle,
  Clock, Zap, Server, TrendingUp, Settings, Plus,
  RefreshCw, ExternalLink, Terminal, Shield, Database
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Components
import { DeploymentList } from '@/components/deployments/deployment-list';
import { DeploymentStats } from '@/components/deployments/deployment-stats';
import { PlatformStatus } from '@/components/deployments/platform-status';
import { CreateDeploymentDialog } from '@/components/deployments/create-deployment-dialog';

// Types
import type { DeploymentListResponse, DeploymentStatsResponse } from '@/types/deployment';

export default function DeploymentsPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch deployments
  const { data: deploymentsData, isLoading: deploymentsLoading, refetch: refetchDeployments } = useQuery<DeploymentListResponse>({
    queryKey: ['deployments', selectedPlatform, selectedEnvironment],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedPlatform !== 'all') params.append('platform', selectedPlatform);
      if (selectedEnvironment !== 'all') params.append('environment', selectedEnvironment);
      
      const response = await fetch(`/api/deployments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch deployments');
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch deployment stats
  const { data: statsData, isLoading: statsLoading } = useQuery<DeploymentStatsResponse>({
    queryKey: ['deployment-stats'],
    queryFn: async () => {
      const response = await fetch('/api/deployments/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    refetchInterval: 60000 // Refresh every minute
  });

  const filteredDeployments = deploymentsData?.deployments.filter(deployment => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return deployment.project.title.toLowerCase().includes(query) ||
             deployment.platform.toLowerCase().includes(query) ||
             deployment.deploymentUrl?.toLowerCase().includes(query);
    }
    return true;
  }) || [];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Deployments</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage your project deployments across all platforms
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchDeployments()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Deploy Project
          </Button>
        </div>
      </div>

      {/* Platform Status */}
      <PlatformStatus className="mb-8" />

      {/* Stats Overview */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : statsData ? (
        <DeploymentStats stats={statsData} className="mb-8" />
      ) : null}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search deployments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md:w-96"
            />
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="VERCEL">Vercel</SelectItem>
                <SelectItem value="NETLIFY">Netlify</SelectItem>
                <SelectItem value="AWS_AMPLIFY">AWS Amplify</SelectItem>
                <SelectItem value="CLOUDFLARE_PAGES">Cloudflare Pages</SelectItem>
                <SelectItem value="GITHUB_PAGES">GitHub Pages</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="All Environments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Environments</SelectItem>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="preview">Preview</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deployments List */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Deployments</TabsTrigger>
          <TabsTrigger value="all">All Deployments</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {deploymentsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <DeploymentList 
              deployments={filteredDeployments.filter(d => d.isActive)} 
              onRefresh={refetchDeployments}
            />
          )}
        </TabsContent>

        <TabsContent value="all">
          {deploymentsLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <DeploymentList 
              deployments={filteredDeployments} 
              onRefresh={refetchDeployments}
            />
          )}
        </TabsContent>

        <TabsContent value="incidents">
          <Card>
            <CardHeader>
              <CardTitle>Active Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              {deploymentsData?.deployments
                .filter(d => d.incidents.some(i => i.status !== 'CLOSED'))
                .map(deployment => (
                  <div key={deployment.id} className="mb-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{deployment.project.title}</h4>
                      <Badge variant="destructive">
                        {deployment.incidents.filter(i => i.status !== 'CLOSED').length} incidents
                      </Badge>
                    </div>
                    {deployment.incidents
                      .filter(i => i.status !== 'CLOSED')
                      .map(incident => (
                        <div key={incident.id} className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{incident.title}</span>
                            <Badge variant={
                              incident.severity === 'CRITICAL' ? 'destructive' :
                              incident.severity === 'HIGH' ? 'secondary' :
                              'outline'
                            }>
                              {incident.severity}
                            </Badge>
                          </div>
                          {incident.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {incident.description}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )) || (
                <p className="text-muted-foreground">No active incidents</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Deployment Dialog */}
      <CreateDeploymentDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          refetchDeployments();
        }}
      />
    </div>
  );
}