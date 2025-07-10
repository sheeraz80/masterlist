'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { DeploymentEvent } from '@/types/deployment';

interface UseDeploymentEventsOptions {
  projectId?: string;
  deploymentId?: string;
  onEvent?: (event: DeploymentEvent) => void;
  enabled?: boolean;
}

interface UseDeploymentEventsReturn {
  events: DeploymentEvent[];
  isConnected: boolean;
  error: Error | null;
  reconnect: () => void;
  clearEvents: () => void;
}

export function useDeploymentEvents({
  projectId,
  deploymentId,
  onEvent,
  enabled = true
}: UseDeploymentEventsOptions = {}): UseDeploymentEventsReturn {
  const [events, setEvents] = useState<DeploymentEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (!enabled || eventSourceRef.current) return;

    try {
      const params = new URLSearchParams();
      if (projectId) params.append('projectId', projectId);
      if (deploymentId) params.append('deploymentId', deploymentId);

      const url = `/api/deployments/events${params.toString() ? `?${params}` : ''}`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('connected', () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      });

      eventSource.addEventListener('deployment-update', (event) => {
        try {
          const data: DeploymentEvent = JSON.parse(event.data);
          setEvents(prev => [data, ...prev].slice(0, 100)); // Keep last 100 events
          onEvent?.(data);
        } catch (err) {
          console.error('Failed to parse deployment event:', err);
        }
      });

      eventSource.addEventListener('incident', (event) => {
        try {
          const data: DeploymentEvent = JSON.parse(event.data);
          setEvents(prev => [data, ...prev].slice(0, 100));
          onEvent?.(data);
        } catch (err) {
          console.error('Failed to parse incident event:', err);
        }
      });

      eventSource.onerror = (err) => {
        console.error('EventSource error:', err);
        setIsConnected(false);
        setError(new Error('Connection lost'));
        
        // Reconnect with exponential backoff
        if (reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            disconnect();
            connect();
          }, delay);
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect'));
    }
  }, [enabled, projectId, deploymentId, onEvent]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    disconnect();
    connect();
  }, [connect, disconnect]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    events,
    isConnected,
    error,
    reconnect,
    clearEvents
  };
}