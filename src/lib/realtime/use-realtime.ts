'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Real auth hook that checks for actual user authentication
const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      } finally {
        setIsLoaded(true);
      }
    };

    checkAuth();
  }, []);

  return {
    userId: user?.id || null,
    isLoaded,
    user
  };
};

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
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    activeUsers: 0,
    recentActivities: [],
    topCollaborations: []
  });
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [projectViewers, setProjectViewers] = useState<Map<string, Set<string>>>(new Map());

  // Fetch real-time metrics from API
  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoadingMetrics(true);
      setMetricsError(null);
      
      const response = await fetch('/api/realtime/metrics', {
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMetrics(result.data);
        setIsConnected(true);
      } else {
        setMetricsError(result.error || 'Failed to load metrics');
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Failed to fetch real-time metrics:', error);
      setMetricsError('Unable to connect to real-time service');
      setIsConnected(false);
    } finally {
      setIsLoadingMetrics(false);
    }
  }, []);

  // Initialize real-time metrics fetching
  useEffect(() => {
    if (!isLoaded) return;

    // Fetch metrics immediately
    fetchMetrics();
    
    // Set up periodic updates every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);

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
    onlineUsers: metrics.activeUsers,
    projectViewers: options.projectId ? 
      (metrics.topCollaborations.find(c => c.projectId === options.projectId)?.userCount || 0) : 0,
    emitProjectUpdate,
    recentActivities: metrics.recentActivities,
    isLoadingMetrics,
    metricsError,
    refreshMetrics: fetchMetrics
  };
}