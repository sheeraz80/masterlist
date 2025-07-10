'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  Activity, AlertCircle, CheckCircle, Clock,
  RefreshCw, Wifi, WifiOff, X, Bell, BellOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDeploymentEvents } from '@/hooks/use-deployment-events';
import type { DeploymentEvent } from '@/types/deployment';

interface RealTimeMonitorProps {
  projectId?: string;
  deploymentId?: string;
  className?: string;
}

export function RealTimeMonitor({ projectId, deploymentId, className }: RealTimeMonitorProps) {
  const [enabled, setEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<DeploymentEvent | null>(null);
  const [notificationQueue, setNotificationQueue] = useState<Array<{ id: string; message: string; type: string }>>([]);

  const { events, isConnected, error, reconnect } = useDeploymentEvents({
    projectId,
    deploymentId,
    enabled,
    onEvent: (event) => {
      // Show notifications for critical events
      if (notifications) {
        if (event.type === 'incident' && event.data.details?.severity === 'CRITICAL') {
          setNotificationQueue(prev => [...prev, {
            id: `${event.deploymentId}-${Date.now()}`,
            message: `Critical Incident: ${event.data.message}`,
            type: 'error'
          }]);
        } else if (event.data.status === 'ERROR') {
          setNotificationQueue(prev => [...prev, {
            id: `${event.deploymentId}-${Date.now()}`,
            message: `Deployment Failed: ${event.deploymentId}`,
            type: 'error'
          }]);
        } else if (event.data.status === 'READY') {
          setNotificationQueue(prev => [...prev, {
            id: `${event.deploymentId}-${Date.now()}`,
            message: `Deployment Successful: ${event.deploymentId}`,
            type: 'success'
          }]);
        }
      }
    }
  });

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    if (notificationQueue.length > 0) {
      const timer = setTimeout(() => {
        setNotificationQueue(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notificationQueue]);

  const getEventIcon = (event: DeploymentEvent) => {
    if (event.type === 'incident') {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
    
    switch (event.data.status) {
      case 'BUILDING':
      case 'DEPLOYING':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'READY':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'ERROR':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getEventColor = (event: DeploymentEvent) => {
    if (event.type === 'incident') {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
    
    switch (event.data.status) {
      case 'BUILDING':
      case 'DEPLOYING':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'READY':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'ERROR':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Monitor
          </CardTitle>
          <div className="flex items-center gap-4">
            {/* Notification Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
              <Label htmlFor="notifications" className="flex items-center gap-1 cursor-pointer">
                {notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                <span className="text-sm">Alerts</span>
              </Label>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="monitoring"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <Label htmlFor="monitoring" className="flex items-center gap-1 cursor-pointer">
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-600" />
                ) : (
                  <WifiOff className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm">Live</span>
              </Label>
            </div>

            {/* Reconnect Button */}
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={reconnect}
              >
                Reconnect
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Notifications */}
        <AnimatePresence>
          {notificationQueue.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className={`mb-2 p-3 rounded-lg flex items-center justify-between ${
                notification.type === 'error' 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' 
                  : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              }`}
            >
              <span className="text-sm">{notification.message}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setNotificationQueue(prev => prev.filter(n => n.id !== notification.id))}
              >
                <X className="h-3 w-3" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Connection Status */}
        {!isConnected && enabled && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center justify-between">
            <span className="text-sm text-yellow-800 dark:text-yellow-200">
              Connecting to real-time updates...
            </span>
            <RefreshCw className="h-4 w-4 animate-spin" />
          </div>
        )}

        {/* Events List */}
        <ScrollArea className="h-[400px] pr-4">
          <AnimatePresence mode="popLayout">
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No events yet</p>
                <p className="text-sm mt-1">
                  {enabled ? 'Waiting for deployment events...' : 'Monitoring is disabled'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((event, index) => (
                  <motion.div
                    key={`${event.deploymentId}-${event.timestamp}-${index}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${getEventColor(event)}`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {getEventIcon(event)}
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {event.data.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(event.timestamp))} ago
                          </p>
                        </div>
                      </div>
                      {event.type === 'incident' && (
                        <Badge variant="destructive" className="text-xs">
                          {event.data.details?.severity}
                        </Badge>
                      )}
                    </div>

                    {/* Event Details */}
                    {event.data.details && (
                      <div className="mt-2 pt-2 border-t text-xs space-y-1">
                        {event.data.details.buildTime && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Build Time:</span>
                            <span>{event.data.details.buildTime}s</span>
                          </div>
                        )}
                        {event.data.details.uptime !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Uptime:</span>
                            <span>{event.data.details.uptime.toFixed(1)}%</span>
                          </div>
                        )}
                        {event.data.details.errorRate !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Error Rate:</span>
                            <span>{event.data.details.errorRate.toFixed(2)}%</span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}