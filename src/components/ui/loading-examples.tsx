'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loading, 
  PageLoading, 
  InlineLoading, 
  ButtonLoading, 
  LoadingOverlay,
  AnalyticsLoading,
  RepositoryLoading,
  LoadingError 
} from '@/components/ui/loading';
import { 
  LoadingWrapper, 
  ListLoadingWrapper, 
  AsyncWrapper,
  PageWrapper 
} from '@/components/ui/loading-wrapper';
import { 
  ProjectCardSkeleton, 
  StatsCardSkeleton,
  AnalyticsDashboardSkeleton,
  FormSkeleton 
} from '@/components/ui/skeletons';
import { useLoading, useApiLoading } from '@/hooks/use-loading';

export function LoadingExamples() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  
  const { 
    isLoading: apiLoading, 
    error: apiError, 
    callApi, 
    reset 
  } = useApiLoading();

  const simulateApiCall = async () => {
    try {
      await callApi(async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (simulateError) {
          throw new Error('Simulated API error');
        }
        return { data: 'Success!' };
      });
    } catch (error) {
      console.error('API call failed:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Loading Component Examples</h2>
        <p className="text-muted-foreground">
          Comprehensive loading states and skeleton components for better UX
        </p>
      </div>

      {/* Basic Loading Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Loading Variants</CardTitle>
          <CardDescription>Different loading spinner variations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Badge variant="outline">Default</Badge>
              <div className="p-4 border rounded-lg">
                <Loading text="Loading..." />
              </div>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline">Dots</Badge>
              <div className="p-4 border rounded-lg">
                <Loading variant="dots" text="Loading..." />
              </div>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline">Pulse</Badge>
              <div className="p-4 border rounded-lg">
                <Loading variant="pulse" text="Loading..." />
              </div>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline">AI</Badge>
              <div className="p-4 border rounded-lg">
                <Loading variant="ai" text="AI Processing..." />
              </div>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline">Bars</Badge>
              <div className="p-4 border rounded-lg">
                <Loading variant="bars" text="Analyzing..." />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialized Loading Components */}
      <Card>
        <CardHeader>
          <CardTitle>Specialized Loading Components</CardTitle>
          <CardDescription>Context-specific loading states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Badge variant="outline">Analytics Loading</Badge>
            <div className="border rounded-lg p-4">
              <AnalyticsLoading />
            </div>
          </div>
          
          <div className="space-y-2">
            <Badge variant="outline">Repository Loading</Badge>
            <div className="border rounded-lg p-4">
              <RepositoryLoading />
            </div>
          </div>
          
          <div className="space-y-2">
            <Badge variant="outline">Page Loading</Badge>
            <div className="border rounded-lg p-4">
              <PageLoading title="Custom Loading Title" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skeleton Components */}
      <Card>
        <CardHeader>
          <CardTitle>Skeleton Components</CardTitle>
          <CardDescription>Placeholder content while loading</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Badge variant="outline">Project Card Skeleton</Badge>
            <div className="max-w-sm">
              <ProjectCardSkeleton />
            </div>
          </div>
          
          <div className="space-y-2">
            <Badge variant="outline">Stats Card Skeleton</Badge>
            <div className="max-w-sm">
              <StatsCardSkeleton />
            </div>
          </div>
          
          <div className="space-y-2">
            <Badge variant="outline">Form Skeleton</Badge>
            <div className="max-w-md">
              <FormSkeleton />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Loading Examples</CardTitle>
          <CardDescription>Test different loading states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setShowOverlay(true)}
              variant="outline"
            >
              Show Overlay
            </Button>
            <Button 
              onClick={() => setSimulateError(!simulateError)}
              variant={simulateError ? "destructive" : "outline"}
            >
              {simulateError ? 'Disable' : 'Enable'} Error Simulation
            </Button>
            <Button 
              onClick={() => setShowEmpty(!showEmpty)}
              variant={showEmpty ? "destructive" : "outline"}
            >
              {showEmpty ? 'Show' : 'Hide'} Content
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Badge variant="outline">API Loading Example</Badge>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={simulateApiCall}
                    disabled={apiLoading}
                  >
                    {apiLoading ? <ButtonLoading text="Loading..." /> : 'Test API Call'}
                  </Button>
                  {apiError && (
                    <Button onClick={reset} variant="outline" size="sm">
                      Reset
                    </Button>
                  )}
                </div>
                
                <div className="mt-4">
                  <LoadingWrapper
                    isLoading={apiLoading}
                    error={apiError}
                    onRetry={simulateApiCall}
                    skeleton="custom"
                    loadingText="Calling API..."
                  >
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-green-800">API call completed successfully!</p>
                    </div>
                  </LoadingWrapper>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Badge variant="outline">List Loading Example</Badge>
              <div className="border rounded-lg p-4">
                <ListLoadingWrapper
                  isLoading={apiLoading}
                  error={apiError}
                  items={showEmpty ? [] : [1, 2, 3]}
                  skeletonCount={3}
                  emptyMessage="No items to display"
                  onRetry={simulateApiCall}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="p-4 border rounded-lg">
                        <h4 className="font-medium">Item {item}</h4>
                        <p className="text-sm text-muted-foreground">Sample content</p>
                      </div>
                    ))}
                  </div>
                </ListLoadingWrapper>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error State Example */}
      <Card>
        <CardHeader>
          <CardTitle>Error State Example</CardTitle>
          <CardDescription>How errors are displayed with retry functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4">
            <LoadingError 
              error="Failed to load data. Please check your connection and try again."
              onRetry={() => console.log('Retry clicked')}
              retryText="Retry Loading"
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading Overlay */}
      <LoadingOverlay 
        isOpen={showOverlay}
        text="Processing your request..."
        variant="ai"
      />
      
      {showOverlay && (
        <Button 
          onClick={() => setShowOverlay(false)}
          className="fixed bottom-4 right-4 z-50"
        >
          Hide Overlay
        </Button>
      )}
    </div>
  );
}