'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
// Mock auth hook for development - replace with actual auth when available
const useAuth = () => ({
  userId: 'demo-user-' + Math.random().toString(36).substr(2, 9),
  isLoaded: true
});

interface UserActivity {
  userId: string;
  userName: string;
  action: string;
  projectId?: string;
  projectTitle?: string;
  timestamp: Date;
  metadata?: any;
}

interface RealtimeMetrics {
  activeUsers: number;
  recentActivities: UserActivity[];
  topCollaborations: Array<{ projectId: string; userCount: number }>;
}

interface UseRealtimeOptions {
  projectId?: string;
  analyticsTab?: string;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { userId, isLoaded } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(true); // Mock connection for demo
  // Mock data for demonstration
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    activeUsers: 3 + Math.floor(Math.random() * 5),
    recentActivities: [
      {
        userId: 'user-1',
        userName: 'Alice Johnson',
        action: 'updated project',
        projectId: 'proj-1',
        projectTitle: 'AI Chat Assistant',
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        metadata: {}
      },
      {
        userId: 'user-2',
        userName: 'Bob Smith',
        action: 'viewed analytics',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        metadata: {}
      },
      {
        userId: 'user-3',
        userName: 'Carol Davis',
        action: 'commented on',
        projectId: 'proj-2',
        projectTitle: 'E-commerce Platform',
        timestamp: new Date(Date.now() - 8 * 60 * 1000),
        metadata: {}
      },
      {
        userId: 'user-4',
        userName: 'David Wilson',
        action: 'updated project',
        projectId: 'proj-3',
        projectTitle: 'Mobile App',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        metadata: {}
      }
    ],
    topCollaborations: [
      { projectId: 'proj-1', userCount: 4 },
      { projectId: 'proj-2', userCount: 3 },
      { projectId: 'proj-3', userCount: 2 }
    ]
  });
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [projectViewers, setProjectViewers] = useState<Map<string, Set<string>>>(new Map());

  // Initialize socket connection (disabled for demo)
  useEffect(() => {
    if (!isLoaded || !userId) return;

    // Mock socket connection - replace with actual implementation when ready
    console.log('Mock socket connection initialized for user:', userId);
    
    // Simulate periodic updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeUsers: 3 + Math.floor(Math.random() * 5)
      }));
    }, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
    };

    /* Actual socket implementation - enable when ready
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      auth: {
        userId
      }
    });

    socketInstance.on('connect', () => {
      console.log('Connected to realtime server');
      setIsConnected(true);
      
      // Authenticate
      socketInstance.emit('authenticate', {
        userId,
        userName: userId // In production, get actual user name
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from realtime server');
      setIsConnected(false);
    });

    // Listen for metrics updates
    socketInstance.on('metrics-update', (data: RealtimeMetrics) => {
      setMetrics(data);
    });

    // Listen for user presence
    socketInstance.on('user-online', ({ userId }) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    });

    socketInstance.on('user-offline', ({ userId }) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    // Listen for new activities
    socketInstance.on('new-activity', (activity: UserActivity) => {
      setMetrics(prev => ({
        ...prev,
        recentActivities: [activity, ...prev.recentActivities].slice(0, 20)
      }));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
    */
  }, [userId, isLoaded]);

  // Mock project update function
  const emitProjectUpdate = useCallback((projectId: string, updateType: string, update: any) => {
    console.log('Mock project update:', { projectId, updateType, update });
  }, []);

  return {
    isConnected,
    metrics,
    onlineUsers: metrics.activeUsers, // Use mock data
    projectViewers: options.projectId ? 2 : 0, // Mock viewer count
    emitProjectUpdate,
    recentActivities: metrics.recentActivities
  };
}