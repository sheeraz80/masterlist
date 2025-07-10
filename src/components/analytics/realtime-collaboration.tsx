'use client';

import { useRealtime } from '@/lib/realtime/use-realtime';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, Activity, Eye, Edit, MessageSquare, 
  TrendingUp, Clock, Zap, Globe
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RealtimeCollaborationProps {
  currentTab?: string;
}

export function RealtimeCollaboration({ currentTab }: RealtimeCollaborationProps) {
  const { isConnected, metrics, onlineUsers, recentActivities } = useRealtime({
    analyticsTab: currentTab
  });

  const getActionIcon = (action: string) => {
    if (action.includes('viewed')) return <Eye className="h-3 w-3" />;
    if (action.includes('updated')) return <Edit className="h-3 w-3" />;
    if (action.includes('commented')) return <MessageSquare className="h-3 w-3" />;
    return <Activity className="h-3 w-3" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('viewed')) return 'text-blue-500';
    if (action.includes('updated')) return 'text-green-500';
    if (action.includes('commented')) return 'text-purple-500';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <Badge variant="outline" className="gap-1">
          <Users className="h-3 w-3" />
          {onlineUsers} online
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Users Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Active Users</p>
                <p className="text-2xl font-bold">{metrics.activeUsers}</p>
                <p className="text-xs text-muted-foreground">Right now</p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities Count */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Recent Activities</p>
                <p className="text-2xl font-bold">{recentActivities.length}</p>
                <p className="text-xs text-muted-foreground">Last hour</p>
              </div>
              <Activity className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Top Collaboration */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Top Project</p>
                <p className="text-2xl font-bold">
                  {metrics.topCollaborations[0]?.userCount || 0}
                </p>
                <p className="text-xs text-muted-foreground">Collaborators</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Activity Rate */}
        <Card className="bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Activity Rate</p>
                <p className="text-2xl font-bold">
                  {(recentActivities.length / 60).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Per minute</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Live Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Activity Feed
              </span>
              <Badge variant="outline" className="animate-pulse">
                <span className="mr-1">●</span> Live
              </Badge>
            </CardTitle>
            <CardDescription>
              Real-time updates from across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {recentActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No recent activities
                  </p>
                ) : (
                  recentActivities.map((activity, index) => (
                    <div
                      key={`${activity.userId}-${activity.timestamp}-${index}`}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {activity.userName?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`${getActionColor(activity.action)}`}>
                            {getActionIcon(activity.action)}
                          </span>
                          <span className="text-sm font-medium">
                            {activity.userName || 'User'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {activity.action.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {activity.projectTitle && (
                          <p className="text-sm text-muted-foreground">
                            on {activity.projectTitle}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Top Collaborations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Active Collaborations
            </CardTitle>
            <CardDescription>
              Projects with the most active collaboration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topCollaborations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No active collaborations
                </p>
              ) : (
                metrics.topCollaborations.map((collab, index) => (
                  <div
                    key={collab.projectId}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Project {collab.projectId.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">
                          Active collaboration
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{collab.userCount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}