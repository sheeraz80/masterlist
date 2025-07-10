'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import {
  Globe, Plus, ExternalLink, RefreshCw, Activity,
  CheckCircle, AlertCircle, Clock, Zap, Shield,
  TrendingUp, Terminal, Settings
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Components
import { CreateDeploymentDialog } from '@/components/deployments/create-deployment-dialog';

// Types
import type { DeploymentWithDetails } from '@/types/deployment';

interface DeploymentSectionProps {
  projectId: string;
}

export function DeploymentSection({ projectId }: DeploymentSectionProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch deployments for this project
  const { data: deployments, isLoading, refetch } = useQuery<DeploymentWithDetails[]>({
    queryKey: ['project-deployments', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/deployments?projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch deployments');
      const data = await response.json();
      return data.deployments;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const activeDeployments = deployments?.filter(d => d.isActive) || [];
  const productionDeployment = activeDeployments.find(d => d.environmentName === 'production');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'READY':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'BUILDING':
      case 'DEPLOYING':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'HEALTHY':
        return 'text-green-600';
      case 'DEGRADED':
        return 'text-yellow-600';
      case 'UNHEALTHY':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Deployments</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Deploy
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeDeployments.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No active deployments</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Deployment
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Production Deployment Highlight */}
            {productionDeployment && (
              <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">Production</span>
                    {getStatusIcon(productionDeployment.status)}
                  </div>
                  {productionDeployment.deploymentUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={productionDeployment.deploymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Visit
                      </a>
                    </Button>
                  )}
                </div>
                
                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Uptime</p>
                    <p className="font-semibold">
                      {productionDeployment.uptime?.toFixed(1) || '--'}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Response</p>
                    <p className="font-semibold">
                      {productionDeployment.responseTime ? 
                        `${Math.round(productionDeployment.responseTime)}ms` : '--'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Health</p>
                    <p className={`font-semibold ${getHealthColor(productionDeployment.health)}`}>
                      {productionDeployment.health}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* All Deployments */}
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">Active ({activeDeployments.length})</TabsTrigger>
                <TabsTrigger value="environments">By Environment</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-3">
                {activeDeployments.map((deployment) => (
                  <div key={deployment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(deployment.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{deployment.platform}</span>
                          <Badge variant="outline" className="text-xs">
                            {deployment.environmentName}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Deployed {formatDistanceToNow(new Date(deployment.lastDeployedAt || deployment.createdAt))} ago
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {deployment.deploymentUrl && (
                        <Button variant="ghost" size="icon" asChild>
                          <a
                            href={deployment.deploymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <Terminal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="environments" className="space-y-3">
                {['production', 'staging', 'preview', 'development'].map(env => {
                  const envDeployments = activeDeployments.filter(d => d.environmentName === env);
                  if (envDeployments.length === 0) return null;

                  return (
                    <div key={env} className="space-y-2">
                      <h4 className="font-medium capitalize">{env}</h4>
                      {envDeployments.map(deployment => (
                        <div key={deployment.id} className="ml-4 p-2 border rounded text-sm">
                          <div className="flex items-center justify-between">
                            <span>{deployment.platform}</span>
                            <span className="text-muted-foreground">
                              {deployment.branch || 'main'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>

      {/* Create Deployment Dialog */}
      <CreateDeploymentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          refetch();
        }}
        projectId={projectId}
      />
    </Card>
  );
}