'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  Database,
  Cpu,
  HardDrive,
  Zap,
  AlertCircle,
  Users,
  Wifi,
  WifiOff
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useRealtime } from '@/contexts/realtime-context';

async function fetchSystemStatus() {
  const response = await fetch('/api/system/status');
  if (!response.ok) throw new Error('Failed to fetch system status');
  const data = await response.json();
  return data.status;
}

export function SystemStatus() {
  const { connected, subscribeToSystemStatus } = useRealtime();
  const queryClient = useQueryClient();
  
  const { data: systemMetrics, isLoading } = useQuery({
    queryKey: ['system-status'],
    queryFn: fetchSystemStatus,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Listen for real-time system status updates
  useEffect(() => {
    const unsubscribe = subscribeToSystemStatus((data) => {
      // Update the query cache with new system status
      queryClient.setQueryData(['system-status'], data.status);
    });

    return unsubscribe;
  }, [subscribeToSystemStatus, queryClient]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!systemMetrics) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'error':
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            System Status
          </span>
          <div className="flex items-center gap-2">
            {connected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <Badge variant="outline" className={`${
              systemMetrics.status === 'healthy' ? 'text-green-600 border-green-600' :
              systemMetrics.status === 'degraded' ? 'text-yellow-600 border-yellow-600' :
              'text-red-600 border-red-600'
            }`}>
              {getStatusIcon(systemMetrics.status)}
              <span className="ml-1">
                {systemMetrics.status === 'healthy' ? 'All Systems Operational' :
                 systemMetrics.status === 'degraded' ? 'Degraded Performance' :
                 'Service Disruption'}
              </span>
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              DB Response
            </div>
            <div className="text-2xl font-bold">{systemMetrics.database?.responseTime || 0}ms</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Uptime
            </div>
            <div className="text-2xl font-bold">{formatUptime(systemMetrics.uptime || 0)}</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              Database
            </div>
            <div className="text-2xl font-bold">
              {systemMetrics.database?.connected ? (
                <span className="text-green-600">Connected</span>
              ) : (
                <span className="text-red-600">Offline</span>
              )}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Cpu className="h-4 w-4" />
              CPU Usage
            </div>
            <div className="text-2xl font-bold">{Math.round(systemMetrics.cpu?.usage || 0)}%</div>
          </motion.div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <HardDrive className="h-4 w-4" />
              Memory
            </div>
            <div className="text-xl font-semibold">{Math.round(systemMetrics.memory?.percentage || 0)}%</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              CPU Cores
            </div>
            <div className="text-xl font-semibold">{systemMetrics.cpu?.cores || 0}</div>
          </motion.div>
        </div>

        {/* Service Status */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Service Health</h4>
          <div className="space-y-2">
            {/* Database Service */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${systemMetrics.database?.connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-sm font-medium">PostgreSQL Database</span>
              </div>
              <span className="text-xs text-muted-foreground">{systemMetrics.database?.responseTime || 0}ms</span>
            </motion.div>

            {/* API Service */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${systemMetrics.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                <span className="text-sm font-medium">API Server</span>
              </div>
              <span className="text-xs text-muted-foreground">Online</span>
            </motion.div>

            {/* Real-time Service */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-sm font-medium">Real-time Updates</span>
              </div>
              <span className="text-xs text-muted-foreground">{connected ? 'Connected' : 'Disconnected'}</span>
            </motion.div>
          </div>
        </div>

        {/* Last Update */}
        <div className="pt-2 text-xs text-muted-foreground text-center">
          Last updated: {new Date(systemMetrics.timestamp || new Date()).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}