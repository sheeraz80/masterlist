import { NextRequest, NextResponse } from 'next/server';
import { analyticsOptimizer } from '@/lib/performance/analytics-optimizer';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { requireAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      const { searchParams } = new URL(request.url);
      const includeRecommendations = searchParams.get('include_recommendations') === 'true';
      const forceRefresh = searchParams.get('force_refresh') === 'true';
      
      // Get performance insights from analytics optimizer
      const insights = await analyticsOptimizer.getPerformanceInsights();
      
      // Get cache preload recommendations if requested
      let cacheRecommendations = null;
      if (includeRecommendations) {
        cacheRecommendations = await generateCacheRecommendations(insights);
      }
      
      // Optionally preload cache if requested
      if (forceRefresh) {
        await analyticsOptimizer.preloadCache(['1d', '7d', '30d']);
      }
      
      const response = {
        performance_insights: insights,
        cache_recommendations: cacheRecommendations,
        timestamp: new Date().toISOString(),
        user_id: user.id
      };
      
      return NextResponse.json(response);
    } catch (error) {
      console.error('Performance insights error:', error);
      
      return NextResponse.json(
        { 
          error: 'Failed to generate performance insights',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }),
  rateLimits.standard
);

export const POST = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      const body = await request.json();
      const { action, pattern, timeRanges } = body;
      
      let result;
      
      switch (action) {
        case 'invalidate_cache':
          analyticsOptimizer.invalidateCache(pattern || '.*');
          result = { message: 'Cache invalidated successfully', pattern };
          break;
          
        case 'preload_cache':
          await analyticsOptimizer.preloadCache(timeRanges || ['1d', '7d', '30d']);
          result = { message: 'Cache preloaded successfully', timeRanges };
          break;
          
        case 'benchmark_analytics':
          const benchmarkResults = await benchmarkAnalyticsOperations();
          result = { message: 'Benchmark completed', results: benchmarkResults };
          break;
          
        default:
          return NextResponse.json(
            { error: 'Invalid action', availableActions: ['invalidate_cache', 'preload_cache', 'benchmark_analytics'] },
            { status: 400 }
          );
      }
      
      return NextResponse.json(result);
    } catch (error) {
      console.error('Performance action error:', error);
      
      return NextResponse.json(
        { 
          error: 'Failed to execute performance action',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }),
  rateLimits.standard
);

async function generateCacheRecommendations(insights: any) {
  const { cacheStats, optimizationSuggestions } = insights;
  
  const recommendations = [];
  
  // Cache size recommendations
  if (cacheStats.size > 800) {
    recommendations.push({
      type: 'cache_size',
      priority: 'high',
      title: 'Cache Size Near Limit',
      description: `Cache is at ${cacheStats.size}/1000 entries. Consider increasing cache size or implementing more aggressive eviction.`,
      actions: [
        'Increase cache size limit',
        'Implement time-based eviction',
        'Add cache compression'
      ]
    });
  }
  
  // Hit rate recommendations
  if (cacheStats.hitRate < 0.6) {
    recommendations.push({
      type: 'hit_rate',
      priority: 'medium',
      title: 'Low Cache Hit Rate',
      description: `Cache hit rate is ${(cacheStats.hitRate * 100).toFixed(1)}%. Consider preloading frequently accessed data.`,
      actions: [
        'Preload popular time ranges',
        'Increase cache TTL for stable data',
        'Implement cache warming strategies'
      ]
    });
  }
  
  // Performance recommendations
  if (optimizationSuggestions.length > 0) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      title: 'Performance Optimizations Available',
      description: 'Several optimizations can improve analytics performance.',
      actions: optimizationSuggestions
    });
  }
  
  return recommendations;
}

async function benchmarkAnalyticsOperations() {
  const benchmarks = [];
  
  // Benchmark cache operations
  const cacheStart = Date.now();
  await analyticsOptimizer.getOptimizedProjectAnalytics({ useCache: true, timeRange: '30d' });
  const cacheTime = Date.now() - cacheStart;
  
  benchmarks.push({
    operation: 'cached_analytics',
    duration_ms: cacheTime,
    description: 'Time to generate analytics with cache'
  });
  
  // Benchmark non-cache operations
  const nonCacheStart = Date.now();
  await analyticsOptimizer.getOptimizedProjectAnalytics({ useCache: false, timeRange: '30d' });
  const nonCacheTime = Date.now() - nonCacheStart;
  
  benchmarks.push({
    operation: 'non_cached_analytics',
    duration_ms: nonCacheTime,
    description: 'Time to generate analytics without cache'
  });
  
  // Calculate cache performance improvement
  const improvement = ((nonCacheTime - cacheTime) / nonCacheTime * 100).toFixed(1);
  benchmarks.push({
    operation: 'cache_improvement',
    duration_ms: nonCacheTime - cacheTime,
    improvement_percentage: improvement,
    description: `Cache provides ${improvement}% performance improvement`
  });
  
  return benchmarks;
}