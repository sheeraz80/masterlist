'use client';

import { useState, useCallback, useRef } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: any;
}

interface UseLoadingOptions {
  initialLoading?: boolean;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export function useLoading(options: UseLoadingOptions = {}) {
  const {
    initialLoading = false,
    timeout = 30000, // 30 seconds
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  const [state, setState] = useState<LoadingState>({
    isLoading: initialLoading,
    error: null,
    data: null
  });

  const attemptCountRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Set timeout
    if (timeout > 0) {
      timeoutRef.current = setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Operation timed out. Please try again.' 
        }));
      }, timeout);
    }
  }, [timeout]);

  const stopLoading = useCallback((data?: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setState(prev => ({ 
      ...prev, 
      isLoading: false, 
      data: data ?? prev.data 
    }));
    
    attemptCountRef.current = 0;
  }, []);

  const setError = useCallback((error: string | Error) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    const errorMessage = error instanceof Error ? error.message : error;
    setState(prev => ({ 
      ...prev, 
      isLoading: false, 
      error: errorMessage 
    }));
  }, []);

  const retry = useCallback(async (fn: () => Promise<any>) => {
    if (attemptCountRef.current >= retryAttempts) {
      setError('Maximum retry attempts exceeded');
      return;
    }

    attemptCountRef.current++;
    
    if (attemptCountRef.current > 1) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }

    try {
      startLoading();
      const result = await fn();
      stopLoading(result);
      return result;
    } catch (error) {
      if (attemptCountRef.current < retryAttempts) {
        return retry(fn);
      } else {
        setError(error instanceof Error ? error.message : 'An error occurred');
        throw error;
      }
    }
  }, [retryAttempts, retryDelay, startLoading, stopLoading, setError]);

  const execute = useCallback(async (fn: () => Promise<any>) => {
    attemptCountRef.current = 0;
    return retry(fn);
  }, [retry]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setState({
      isLoading: false,
      error: null,
      data: null
    });
    
    attemptCountRef.current = 0;
  }, []);

  return {
    ...state,
    startLoading,
    stopLoading,
    setError,
    execute,
    retry: () => state.error ? retry(() => Promise.resolve()) : undefined,
    reset,
    canRetry: state.error !== null && attemptCountRef.current < retryAttempts
  };
}

// Specialized hooks for common use cases
export function useApiLoading(options?: UseLoadingOptions) {
  const loading = useLoading({
    timeout: 10000, // 10 seconds for API calls
    retryAttempts: 2,
    ...options
  });

  const callApi = useCallback(async (apiCall: () => Promise<any>) => {
    return loading.execute(apiCall);
  }, [loading]);

  return {
    ...loading,
    callApi
  };
}

export function useFormLoading(options?: UseLoadingOptions) {
  const loading = useLoading({
    timeout: 15000, // 15 seconds for form submissions
    retryAttempts: 1,
    ...options
  });

  const submitForm = useCallback(async (submitFn: () => Promise<any>) => {
    return loading.execute(submitFn);
  }, [loading]);

  return {
    ...loading,
    submitForm
  };
}

export function useDataLoading(options?: UseLoadingOptions) {
  const loading = useLoading({
    timeout: 20000, // 20 seconds for data loading
    retryAttempts: 3,
    retryDelay: 2000,
    ...options
  });

  const loadData = useCallback(async (loadFn: () => Promise<any>) => {
    return loading.execute(loadFn);
  }, [loading]);

  return {
    ...loading,
    loadData
  };
}

// Global loading state manager
class LoadingManager {
  private listeners: Set<(states: Record<string, boolean>) => void> = new Set();
  private states: Record<string, boolean> = {};

  subscribe(listener: (states: Record<string, boolean>) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setLoading(key: string, isLoading: boolean) {
    this.states[key] = isLoading;
    this.notify();
  }

  getLoading(key: string): boolean {
    return this.states[key] || false;
  }

  isAnyLoading(): boolean {
    return Object.values(this.states).some(Boolean);
  }

  private notify() {
    this.listeners.forEach(listener => listener({ ...this.states }));
  }
}

export const loadingManager = new LoadingManager();

export function useGlobalLoading() {
  const [states, setStates] = useState<Record<string, boolean>>({});

  useState(() => {
    return loadingManager.subscribe(setStates);
  });

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    loadingManager.setLoading(key, isLoading);
  }, []);

  const getLoading = useCallback((key: string) => {
    return loadingManager.getLoading(key);
  }, []);

  return {
    states,
    setLoading,
    getLoading,
    isAnyLoading: loadingManager.isAnyLoading()
  };
}