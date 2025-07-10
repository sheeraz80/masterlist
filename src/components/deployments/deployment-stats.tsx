'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Activity, CheckCircle, AlertCircle, Clock,
  TrendingUp, Globe, Zap, Shield
} from 'lucide-react';
import type { DeploymentStatsResponse } from '@/types/deployment';

interface DeploymentStatsProps {
  stats: DeploymentStatsResponse;
  className?: string;
}

export function DeploymentStats({ stats, className }: DeploymentStatsProps) {
  const healthPercentage = stats.totalDeployments > 0
    ? (stats.healthMetrics.averageUptime / 100) * 100
    : 0;

  return (
    <div className={`grid gap-4 md:grid-cols-4 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Deployments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.totalDeployments}</p>
              <p className="text-xs text-muted-foreground">
                {stats.activeDeployments} active
              </p>
            </div>
            <Globe className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Average Uptime
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {stats.healthMetrics.averageUptime.toFixed(1)}%
              </p>
              <Progress value={healthPercentage} className="h-2 mt-2" />
            </div>
            <Activity className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Response Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">
                {Math.round(stats.healthMetrics.averageResponseTime)}ms
              </p>
              <p className="text-xs text-muted-foreground">
                Average response
              </p>
            </div>
            <Zap className="h-8 w-8 text-yellow-500 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.healthMetrics.totalIncidents}</p>
              <p className="text-xs text-muted-foreground">
                {stats.healthMetrics.resolvedIncidents} resolved
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}