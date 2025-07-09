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
      case 'online':
      case 'operational':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
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
            <Badge variant="outline" className="text-green-600 border-green-600">
              {getStatusIcon(systemMetrics.status)}
              <span className="ml-1">All Systems Operational</span>
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
              Response Time
            </div>
            <div className="text-2xl font-bold">{systemMetrics.responseTime}</div>
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
            <div className="text-2xl font-bold">{systemMetrics.uptime}</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Database className="h-4 w-4" />
              Projects
            </div>
            <div className="text-2xl font-bold">{systemMetrics.projectsProcessed}</div>
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
            <div className="text-2xl font-bold">{systemMetrics.metrics?.cpu || 0}%</div>
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
            <div className="text-xl font-semibold">{systemMetrics.metrics?.memory || 0}%</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-1"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              Active Users
            </div>
            <div className="text-xl font-semibold">{systemMetrics.metrics?.activeUsers || 0}</div>
          </motion.div>
        </div>

        {/* Service Status */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Service Health</h4>
          <div className="space-y-2">
            {systemMetrics.services.map((service, index) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(service.status)} animate-pulse`} />
                  <span className="text-sm font-medium">{service.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{service.latency}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Last Update */}
        <div className="pt-2 text-xs text-muted-foreground text-center">
          Last updated: {new Date(systemMetrics.lastUpdate).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}