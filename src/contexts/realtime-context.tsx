'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './auth-context';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface RealtimeContextType {
  connected: boolean;
  
  // System status
  subscribeToSystemStatus: (callback: (data: any) => void) => () => void;
  
  // Team updates
  subscribeToTeamUpdates: (teamId: string, callback: (data: any) => void) => () => void;
  
  // Activity updates
  subscribeToActivities: (callback: (data: any) => void) => () => void;
  
  // Emit functions
  emitProjectStatusChange: (projectId: string, teamId: string, status: string) => Promise<void>;
  emitNewComment: (projectId: string, teamId: string | null, comment: any) => Promise<void>;
  emitActivity: (activity: any, teamId?: string) => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(true); // Always "connected" for polling
  const [systemStatusCallbacks, setSystemStatusCallbacks] = useState<Set<(data: any) => void>>(new Set());
  const [teamCallbacks, setTeamCallbacks] = useState<Map<string, Set<(data: any) => void>>>(new Map());
  const [activityCallbacks, setActivityCallbacks] = useState<Set<(data: any) => void>>(new Set());

  // Poll system status every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/system/status');
        if (response.ok) {
          const data = await response.json();
          systemStatusCallbacks.forEach(callback => callback(data));
        }
      } catch (error) {
        console.error('Failed to fetch system status:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [systemStatusCallbacks]);

  // Subscribe to system status updates
  const subscribeToSystemStatus = useCallback((callback: (data: any) => void) => {
    setSystemStatusCallbacks(prev => new Set(prev).add(callback));
    return () => {
      setSystemStatusCallbacks(prev => {
        const next = new Set(prev);
        next.delete(callback);
        return next;
      });
    };
  }, []);

  // Subscribe to team updates
  const subscribeToTeamUpdates = useCallback((teamId: string, callback: (data: any) => void) => {
    setTeamCallbacks(prev => {
      const next = new Map(prev);
      const callbacks = next.get(teamId) || new Set();
      callbacks.add(callback);
      next.set(teamId, callbacks);
      return next;
    });

    return () => {
      setTeamCallbacks(prev => {
        const next = new Map(prev);
        const callbacks = next.get(teamId);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            next.delete(teamId);
          }
        }
        return next;
      });
    };
  }, []);

  // Subscribe to activity updates
  const subscribeToActivities = useCallback((callback: (data: any) => void) => {
    setActivityCallbacks(prev => new Set(prev).add(callback));
    return () => {
      setActivityCallbacks(prev => {
        const next = new Set(prev);
        next.delete(callback);
        return next;
      });
    };
  }, []);

  // Emit project status change
  const emitProjectStatusChange = useCallback(async (projectId: string, teamId: string, status: string) => {
    try {
      const response = await fetch('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_project_status',
          teamId,
          projectId,
          status
        })
      });

      if (response.ok) {
        // Invalidate queries to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['collaborate', teamId] });
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        
        // Notify team callbacks
        const callbacks = teamCallbacks.get(teamId);
        if (callbacks) {
          callbacks.forEach(callback => callback({
            type: 'project_status_changed',
            projectId,
            status,
            timestamp: new Date()
          }));
        }
      }
    } catch (error) {
      console.error('Failed to update project status:', error);
      toast.error('Failed to update project status');
    }
  }, [queryClient, teamCallbacks]);

  // Emit new comment
  const emitNewComment = useCallback(async (projectId: string, teamId: string | null, comment: any) => {
    try {
      const response = await fetch('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_comment',
          projectId,
          ...comment
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        if (teamId) {
          queryClient.invalidateQueries({ queryKey: ['collaborate', teamId] });
        }
        
        // Notify callbacks
        if (teamId) {
          const callbacks = teamCallbacks.get(teamId);
          if (callbacks) {
            callbacks.forEach(callback => callback({
              type: 'comment_added',
              projectId,
              comment: data.comment,
              timestamp: new Date()
            }));
          }
        }
        
        toast.success('Comment added');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    }
  }, [queryClient, teamCallbacks]);

  // Emit activity
  const emitActivity = useCallback(async (activity: any, teamId?: string) => {
    // Activities are automatically tracked by the API
    // Just notify local callbacks
    activityCallbacks.forEach(callback => callback({
      ...activity,
      timestamp: new Date()
    }));

    if (teamId) {
      const callbacks = teamCallbacks.get(teamId);
      if (callbacks) {
        callbacks.forEach(callback => callback({
          type: 'activity_added',
          activity,
          timestamp: new Date()
        }));
      }
    }
  }, [activityCallbacks, teamCallbacks]);

  const value: RealtimeContextType = {
    connected,
    subscribeToSystemStatus,
    subscribeToTeamUpdates,
    subscribeToActivities,
    emitProjectStatusChange,
    emitNewComment,
    emitActivity,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}