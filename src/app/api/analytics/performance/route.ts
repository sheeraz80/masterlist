import { NextRequest, NextResponse } from 'next/server';
import { analyticsOptimizer } from '@/lib/performance/analytics-optimizer';
import { logError } from '@/lib/logger';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action') || 'insights';
      
      switch (action) {
        case 'insights':
          return await handlePerformanceInsights(request, user);
        case 'cache-stats':
          return await handleCacheStats(request, user);
        case 'optimize':
          return await handleOptimizationSuggestions(request, user);
        default:
          return NextResponse.json(
            { error: 'Invalid action. Use: insights, cache-stats, or optimize' },
            { status: 400 }
          );
      }
    } catch (error) {
      logError('Performance API error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }),
  rateLimits.standard
);

export const POST = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action') || 'cache-invalidate';
      
      switch (action) {
        case 'cache-invalidate':
          return await handleCacheInvalidation(request, user);
        case 'cache-preload':
          return await handleCachePreload(request, user);
        default:
          return NextResponse.json(
            { error: 'Invalid action. Use: cache-invalidate or cache-preload' },
            { status: 400 }
          );
      }
    } catch (error) {
      logError('Performance API POST error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }),
  rateLimits.standard
);

async function handlePerformanceInsights(request: NextRequest, user: AuthUser | null) {
  try {
    const insights = await analyticsOptimizer.getPerformanceInsights();
    
    return NextResponse.json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError('Failed to get performance insights:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve performance insights' },
      { status: 500 }
    );
  }
}

async function handleCacheStats(request: NextRequest, user: AuthUser | null) {
  try {
    const insights = await analyticsOptimizer.getPerformanceInsights();
    
    return NextResponse.json({
      success: true,
      data: {
        cache: insights.cacheStats,
        recommendations: insights.optimizationSuggestions.filter(s => 
          s.toLowerCase().includes('cache')
        )
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError('Failed to get cache stats:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve cache statistics' },
      { status: 500 }
    );
  }
}

async function handleOptimizationSuggestions(request: NextRequest, user: AuthUser | null) {
  try {
    const insights = await analyticsOptimizer.getPerformanceInsights();
    
    return NextResponse.json({
      success: true,
      data: {
        suggestions: insights.optimizationSuggestions,
        queryPerformance: insights.queryPerformance,
        prioritizedActions: insights.optimizationSuggestions.map((suggestion, index) => ({
          id: index + 1,
          suggestion,
          priority: index < 3 ? 'high' : index < 6 ? 'medium' : 'low',
          category: suggestion.toLowerCase().includes('cache') ? 'caching' :
                   suggestion.toLowerCase().includes('query') ? 'database' :
                   suggestion.toLowerCase().includes('streaming') ? 'processing' : 'general'
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError('Failed to get optimization suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve optimization suggestions' },
      { status: 500 }
    );
  }
}

async function handleCacheInvalidation(request: NextRequest, user: AuthUser | null) {
  try {
    const body = await request.json();
    const { pattern = '.*' } = body;
    
    // Validate pattern
    if (typeof pattern !== 'string' || pattern.length === 0) {
      return NextResponse.json(
        { error: 'Invalid pattern. Must be a non-empty string.' },
        { status: 400 }
      );
    }
    
    analyticsOptimizer.invalidateCache(pattern);
    
    console.log('Cache invalidated', { pattern, user: user?.id });
    
    return NextResponse.json({
      success: true,
      message: 'Cache invalidated successfully',
      pattern,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError('Failed to invalidate cache:', error);
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    );
  }
}

async function handleCachePreload(request: NextRequest, user: AuthUser | null) {
  try {
    const body = await request.json();
    const { timeRanges = ['1d', '7d', '30d'] } = body;
    
    // Validate timeRanges
    if (!Array.isArray(timeRanges) || timeRanges.length === 0) {
      return NextResponse.json(
        { error: 'Invalid timeRanges. Must be a non-empty array.' },
        { status: 400 }
      );
    }
    
    const validTimeRanges = ['1d', '7d', '30d', '90d', '1y'];
    const invalidRanges = timeRanges.filter(range => !validTimeRanges.includes(range));
    
    if (invalidRanges.length > 0) {
      return NextResponse.json(
        { 
          error: 'Invalid time ranges', 
          invalidRanges,
          validRanges: validTimeRanges 
        },
        { status: 400 }
      );
    }
    
    // Start preloading in background
    analyticsOptimizer.preloadCache(timeRanges).catch(error => {
      logError('Cache preload failed:', error);
    });
    
    console.log('Cache preload initiated', { timeRanges, user: user?.id });
    
    return NextResponse.json({
      success: true,
      message: 'Cache preloading initiated',
      timeRanges,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError('Failed to preload cache:', error);
    return NextResponse.json(
      { error: 'Failed to initiate cache preload' },
      { status: 500 }
    );
  }
}