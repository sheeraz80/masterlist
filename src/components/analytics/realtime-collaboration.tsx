'use client';

import React, { useState, useEffect } from 'react';
import { useRealtime } from '@/lib/realtime/use-realtime';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Users, Activity, Eye, Edit, MessageSquare, 
  TrendingUp, Clock, Zap, Globe, RefreshCw, AlertTriangle,
  Bell, BellOff, Settings, Wifi, WifiOff, CheckCircle,
  UserPlus, UserMinus, FileEdit, Plus, Share
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface RealtimeCollaborationProps {
  currentTab?: string;
}

export function RealtimeCollaboration({ currentTab }: RealtimeCollaborationProps) {
  const { 
    isConnected, 
    metrics, 
    onlineUsers, 
    recentActivities, 
    isLoadingMetrics, 
    metricsError,
    refreshMetrics 
  } = useRealtime({
    analyticsTab: currentTab
  });

  // Notification and collaboration state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [collaborationSettings, setCollaborationSettings] = useState({
    autoRefresh: true,
    showUserActivity: true,
    enableSounds: false,
    highlightChanges: true
  });
  const [connectedUsers, setConnectedUsers] = useState<any[]>([
    { id: '1', name: 'John Doe', avatar: 'JD', status: 'active', lastSeen: new Date(), currentProject: 'Project Alpha' },
    { id: '2', name: 'Jane Smith', avatar: 'JS', status: 'idle', lastSeen: new Date(Date.now() - 300000), currentProject: 'Project Beta' },
    { id: '3', name: 'Mike Johnson', avatar: 'MJ', status: 'active', lastSeen: new Date(), currentProject: 'Project Gamma' }
  ]);

  // Simulate real-time notifications
  useEffect(() => {
    if (!notificationsEnabled) return;

    const interval = setInterval(() => {
      const activityTypes = [
        { type: 'project_update', message: 'updated a project quality score', icon: FileEdit },
        { type: 'user_joined', message: 'joined the collaboration', icon: UserPlus },
        { type: 'comment_added', message: 'added a comment to a project', icon: MessageSquare },
        { type: 'goal_achieved', message: 'achieved a performance goal', icon: CheckCircle },
        { type: 'risk_detected', message: 'flagged a potential risk', icon: AlertTriangle }
      ];

      const users = ['Alex Chen', 'Sarah Wilson', 'David Brown', 'Emma Davis'];
      const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];

      const notification = {
        id: Date.now().toString(),
        user: randomUser,
        message: randomActivity.message,
        type: randomActivity.type,
        icon: randomActivity.icon,
        timestamp: new Date(),
        read: false
      };

      setNotifications(prev => [notification, ...prev.slice(0, 19)]); // Keep last 20

      // Show toast notification
      if (collaborationSettings.autoRefresh) {
        toast.info(`${randomUser} ${randomActivity.message}`, {
          icon: React.createElement(randomActivity.icon, { className: "h-4 w-4" })
        });
      }
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, [notificationsEnabled, collaborationSettings.autoRefresh]);

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const toggleCollaborationSetting = (setting: keyof typeof collaborationSettings) => {
    setCollaborationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

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

  if (isLoadingMetrics) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">Loading real-time data...</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (metricsError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-sm text-muted-foreground">Real-time service unavailable</span>
          </div>
          <Button variant="outline" size="sm" onClick={refreshMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Real-time Features Unavailable</h3>
            <p className="text-muted-foreground mb-4">
              Unable to connect to the real-time collaboration service. 
              This may be because the Socket.io server is not running.
            </p>
            <p className="text-sm text-muted-foreground">
              Error: {metricsError}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Connection Status & Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Connected to database' : 'Service unavailable'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {notificationsEnabled ? (
              <Bell className="h-4 w-4 text-blue-500" />
            ) : (
              <BellOff className="h-4 w-4 text-gray-400" />
            )}
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
            <span className="text-xs text-muted-foreground">Notifications</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {connectedUsers.filter(u => u.status === 'active').length} active
          </Badge>
          {notifications.filter(n => !n.read).length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <Bell className="h-3 w-3" />
              {notifications.filter(n => !n.read).length}
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={refreshMetrics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Collaboration Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Collaboration Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Auto Refresh</Label>
              <Switch
                checked={collaborationSettings.autoRefresh}
                onCheckedChange={() => toggleCollaborationSetting('autoRefresh')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Show User Activity</Label>
              <Switch
                checked={collaborationSettings.showUserActivity}
                onCheckedChange={() => toggleCollaborationSetting('showUserActivity')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Enable Sounds</Label>
              <Switch
                checked={collaborationSettings.enableSounds}
                onCheckedChange={() => toggleCollaborationSetting('enableSounds')}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Highlight Changes</Label>
              <Switch
                checked={collaborationSettings.highlightChanges}
                onCheckedChange={() => toggleCollaborationSetting('highlightChanges')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Enhanced Collaboration Features */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Live Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Live Notifications
              </CardTitle>
              <div className="flex items-center gap-2">
                {notifications.filter(n => !n.read).length > 0 && (
                  <Badge variant="destructive">
                    {notifications.filter(n => !n.read).length} new
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                  Clear All
                </Button>
              </div>
            </div>
            <CardDescription>
              Real-time updates from team collaboration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                        notification.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded-full ${
                          notification.type === 'project_update' ? 'bg-blue-100' :
                          notification.type === 'user_joined' ? 'bg-green-100' :
                          notification.type === 'comment_added' ? 'bg-purple-100' :
                          notification.type === 'goal_achieved' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          <notification.icon className={`h-3 w-3 ${
                            notification.type === 'project_update' ? 'text-blue-600' :
                            notification.type === 'user_joined' ? 'text-green-600' :
                            notification.type === 'comment_added' ? 'text-purple-600' :
                            notification.type === 'goal_achieved' ? 'text-yellow-600' :
                            'text-red-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{notification.user}</span>
                            <span className="text-sm text-muted-foreground">{notification.message}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Connected Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Connected Users
            </CardTitle>
            <CardDescription>
              Team members currently active in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {connectedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-medium">
                          {user.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                        user.status === 'active' ? 'bg-green-500' : 
                        user.status === 'idle' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.status === 'active' ? `Working on ${user.currentProject}` : 
                         `Last seen ${formatDistanceToNow(user.lastSeen, { addSuffix: true })}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      user.status === 'active' ? 'default' :
                      user.status === 'idle' ? 'secondary' : 'outline'
                    }>
                      {user.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Invite Collaborators */}
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Invite Collaborators
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}