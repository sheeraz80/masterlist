'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  Globe, Activity, AlertCircle, CheckCircle, Clock,
  ExternalLink, Terminal, RefreshCw, MoreVertical,
  Zap, Shield, TrendingUp, AlertTriangle
} from 'lucide-react';

// UI Components
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Types
import type { DeploymentWithDetails } from '@/types/deployment';

interface DeploymentListProps {
  deployments: DeploymentWithDetails[];
  onRefresh: () => void;
}

export function DeploymentList({ deployments, onRefresh }: DeploymentListProps) {
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentWithDetails | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'VERCEL':
        return '▲';
      case 'NETLIFY':
        return '◆';
      case 'AWS_AMPLIFY':
        return '☁️';
      case 'CLOUDFLARE_PAGES':
        return '🌐';
      default:
        return '🚀';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'BUILDING':
      case 'DEPLOYING':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'ERROR':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'CANCELLED':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      default:
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'HEALTHY':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'DEGRADED':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'UNHEALTHY':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const handleSync = async (deploymentId: string) => {
    try {
      await fetch(`/api/deployments/${deploymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updateMetrics: true,
          checkHealth: true,
          fetchLogs: true
        })
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to sync deployment:', error);
    }
  };

  if (deployments.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">No deployments found</p>
          <p className="text-muted-foreground">
            Deploy your first project to see it here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {deployments.map((deployment) => (
          <motion.div
            key={deployment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getPlatformIcon(deployment.platform)}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{deployment.project.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{deployment.platform}</span>
                          <span>•</span>
                          <span>{deployment.environmentName}</span>
                          {deployment.branch && (
                            <>
                              <span>•</span>
                              <span>{deployment.branch}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status and Health */}
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(deployment.status)}>
                        {deployment.status === 'BUILDING' && (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        )}
                        {deployment.status.replace('_', ' ')}
                      </Badge>
                      
                      <div className="flex items-center gap-1">
                        {getHealthIcon(deployment.health)}
                        <span className="text-sm">{deployment.health}</span>
                      </div>

                      {deployment.deploymentUrl && (
                        <a
                          href={deployment.deploymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Visit Site
                        </a>
                      )}
                    </div>

                    {/* Metrics */}
                    {deployment.uptime !== null && (
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span>Uptime: {deployment.uptime?.toFixed(1)}%</span>
                        </div>
                        {deployment.responseTime !== null && (
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-muted-foreground" />
                            <span>Response: {Math.round(deployment.responseTime)}ms</span>
                          </div>
                        )}
                        {deployment.errorRate !== null && (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            <span>Errors: {deployment.errorRate.toFixed(2)}%</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Active Incidents */}
                    {deployment.incidents.length > 0 && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600">
                          {deployment.incidents.length} active incident{deployment.incidents.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Deployed {formatDistanceToNow(new Date(deployment.lastDeployedAt || deployment.createdAt))} ago
                      </span>
                      {deployment.buildTime && (
                        <span>Build time: {deployment.buildTime}s</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSync(deployment.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Status
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setSelectedDeployment(deployment);
                        setShowMetrics(true);
                      }}>
                        <Activity className="h-4 w-4 mr-2" />
                        View Metrics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedDeployment(deployment)}>
                        <Terminal className="h-4 w-4 mr-2" />
                        View Logs
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {deployment.platformUrl && (
                        <DropdownMenuItem asChild>
                          <a
                            href={deployment.platformUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Platform Dashboard
                          </a>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Metrics Dialog */}
      {selectedDeployment && showMetrics && (
        <Dialog open={showMetrics} onOpenChange={setShowMetrics}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Deployment Metrics</DialogTitle>
              <DialogDescription>
                Performance and resource metrics for {selectedDeployment.project.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Placeholder for metrics visualization */}
              <p className="text-muted-foreground">
                Detailed metrics visualization would go here
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}