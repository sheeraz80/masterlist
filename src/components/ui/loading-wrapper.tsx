'use client';

import React, { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Loading, LoadingError } from '@/components/ui/loading';
import { 
  ProjectCardSkeleton, 
  AnalyticsDashboardSkeleton, 
  FormSkeleton, 
  LoadingPageSkeleton 
} from '@/components/ui/skeletons';

interface LoadingWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  skeleton?: 'card' | 'dashboard' | 'form' | 'page' | 'custom';
  fallback?: React.ReactNode;
  onRetry?: () => void;
  retryText?: string;
  loadingText?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export function LoadingWrapper({
  children,
  isLoading = false,
  error = null,
  skeleton = 'card',
  fallback,
  onRetry,
  retryText = 'Try Again',
  loadingText = 'Loading...',
  emptyMessage = 'No data available',
  isEmpty = false
}: LoadingWrapperProps) {
  // Show error state
  if (error && onRetry) {
    return (
      <LoadingError 
        error={error} 
        onRetry={onRetry} 
        retryText={retryText} 
      />
    );
  }

  // Show error without retry
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-600">Error</h3>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Return appropriate skeleton based on type
    switch (skeleton) {
      case 'dashboard':
        return <AnalyticsDashboardSkeleton />;
      case 'form':
        return <FormSkeleton />;
      case 'page':
        return <LoadingPageSkeleton />;
      case 'custom':
        return (
          <div className="flex items-center justify-center py-8">
            <Loading variant="ai" text={loadingText} />
          </div>
        );
      default:
        return <ProjectCardSkeleton />;
    }
  }

  // Show empty state
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-muted-foreground">No Results</h3>
          <p className="text-muted-foreground text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Show content
  return <>{children}</>;
}

// List Loading Wrapper - for handling lists of items
export function ListLoadingWrapper({
  children,
  isLoading = false,
  error = null,
  items = [],
  skeletonCount = 6,
  skeletonComponent: SkeletonComponent = ProjectCardSkeleton,
  emptyMessage = 'No items found',
  onRetry,
  retryText = 'Try Again'
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  items?: any[];
  skeletonCount?: number;
  skeletonComponent?: React.ComponentType<any>;
  emptyMessage?: string;
  onRetry?: () => void;
  retryText?: string;
}) {
  const isEmpty = !isLoading && !error && items.length === 0;

  return (
    <LoadingWrapper
      isLoading={isLoading}
      error={error}
      isEmpty={isEmpty}
      emptyMessage={emptyMessage}
      onRetry={onRetry}
      retryText={retryText}
      fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <SkeletonComponent key={i} />
          ))}
        </div>
      }
    >
      {children}
    </LoadingWrapper>
  );
}

// Async Component Wrapper - wraps components with Suspense and Error Boundary
export function AsyncWrapper({
  children,
  fallback,
  errorFallback
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}) {
  const defaultFallback = (
    <div className="flex items-center justify-center py-8">
      <Loading variant="ai" text="Loading component..." />
    </div>
  );

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// HOC for adding loading states to components
export function withLoading<T extends object>(
  Component: React.ComponentType<T>,
  defaultProps?: Partial<LoadingWrapperProps>
) {
  return function WithLoadingComponent(props: T & LoadingWrapperProps) {
    const { isLoading, error, onRetry, ...componentProps } = props;
    
    return (
      <LoadingWrapper
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        {...defaultProps}
      >
        <Component {...(componentProps as T)} />
      </LoadingWrapper>
    );
  };
}

// Page-level loading wrapper
export function PageWrapper({
  children,
  title,
  description,
  isLoading = false,
  error = null,
  onRetry
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  if (isLoading) {
    return <LoadingPageSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <LoadingError 
            error={error} 
            onRetry={onRetry || (() => window.location.reload())}
            retryText="Reload Page"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {(title || description) && (
          <div className="mb-8 space-y-2">
            {title && <h1 className="text-3xl font-bold">{title}</h1>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}