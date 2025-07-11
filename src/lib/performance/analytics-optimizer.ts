import { prisma } from '@/lib/prisma';
import { logPerformanceMetric } from '@/lib/logger';

// Cache management
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

class AnalyticsCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly maxSize = 1000;

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.data as T;
  }

  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  getStats() {
    const now = Date.now();
    let expired = 0;
    let totalHits = 0;

    for (const [, entry] of this.cache) {
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      }
      totalHits += entry.hits;
    }

    return {
      size: this.cache.size,
      expired,
      totalHits,
      hitRate: totalHits / (this.cache.size || 1),
    };
  }
}

// Singleton cache instance
const analyticsCache = new AnalyticsCache();

// Database query optimization
interface QueryOptimization {
  useIndexHints?: boolean;
  batchSize?: number;
  parallelQueries?: boolean;
  streaming?: boolean;
}

export class AnalyticsPerformanceOptimizer {
  private readonly cache = analyticsCache;
  private readonly queryTimeout = 30000; // 30 seconds
  private readonly batchSize = 1000;

  // Optimized project analytics with caching and batching
  async getOptimizedProjectAnalytics(options: {
    useCache?: boolean;
    forceRefresh?: boolean;
    timeRange?: string;
    includeDetailedMetrics?: boolean;
  } = {}): Promise<any> {
    const { 
      useCache = true, 
      forceRefresh = false, 
      timeRange = '30d',
      includeDetailedMetrics = false 
    } = options;

    const cacheKey = `project_analytics_${timeRange}_${includeDetailedMetrics}`;
    const startTime = Date.now();

    try {
      // Check cache first
      if (useCache && !forceRefresh) {
        const cached = this.cache.get(cacheKey);
        if (cached) {
          logPerformanceMetric('analytics_cache_hit', Date.now() - startTime, { cacheKey });
          return cached;
        }
      }

      // Get time range filter
      const timeFilter = this.getTimeFilter(timeRange);

      // Parallel query execution for better performance
      const [
        projectStats,
        categoryStats,
        qualityMetrics,
        recentTrends
      ] = await Promise.all([
        this.getProjectStatsOptimized(timeFilter),
        this.getCategoryStatsOptimized(timeFilter),
        includeDetailedMetrics ? this.getQualityMetricsOptimized(timeFilter) : null,
        this.getRecentTrendsOptimized(timeFilter)
      ]);

      const result = {
        projectStats,
        categoryStats,
        qualityMetrics,
        recentTrends,
        generatedAt: new Date().toISOString(),
        cacheKey,
      };

      // Cache the result
      if (useCache) {
        const ttl = this.getTTLForTimeRange(timeRange);
        this.cache.set(cacheKey, result, ttl);
      }

      const duration = Date.now() - startTime;
      logPerformanceMetric('analytics_generation', duration, { 
        timeRange, 
        includeDetailedMetrics,
        cacheUsed: false 
      });

      return result;

    } catch (error) {
      logPerformanceMetric('analytics_generation_error', Date.now() - startTime, { 
        error: error instanceof Error ? error.message : 'Unknown error',
        timeRange 
      });
      throw error;
    }
  }

  // Optimized database queries with proper indexing
  private async getProjectStatsOptimized(timeFilter: any) {
    const query = `
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_projects,
        AVG(CAST("qualityScore" as DECIMAL)) as avg_quality_score,
        category,
        COUNT(*) as category_count
      FROM "Project"
      WHERE "createdAt" >= $1
      GROUP BY category
    `;

    const result = await prisma.$queryRawUnsafe(query, timeFilter);
    return this.processProjectStatsResult(result);
  }

  private async getCategoryStatsOptimized(timeFilter: any) {
    // Use database aggregation instead of application-level processing
    const query = `
      SELECT 
        category,
        COUNT(*) as project_count,
        AVG(CAST("qualityScore" as DECIMAL)) as avg_quality,
        AVG(CAST("technicalComplexity" as DECIMAL)) as avg_complexity,
        COUNT(CASE WHEN "qualityScore" >= 8 THEN 1 END) as high_quality_count
      FROM "Project"
      WHERE "createdAt" >= $1 AND category IS NOT NULL
      GROUP BY category
      ORDER BY project_count DESC
    `;

    const result = await prisma.$queryRawUnsafe(query, timeFilter);
    return this.processCategoryStatsResult(result);
  }

  private async getQualityMetricsOptimized(timeFilter: any) {
    // Optimized quality metrics with time-series aggregation
    const query = `
      SELECT 
        DATE_TRUNC('day', "createdAt") as date,
        AVG(CAST("qualityScore" as DECIMAL)) as avg_quality,
        COUNT(*) as project_count,
        COUNT(CASE WHEN "qualityScore" >= 8 THEN 1 END) as excellent_count,
        COUNT(CASE WHEN "qualityScore" >= 6 AND "qualityScore" < 8 THEN 1 END) as good_count,
        COUNT(CASE WHEN "qualityScore" < 6 THEN 1 END) as needs_improvement_count
      FROM "Project"
      WHERE "createdAt" >= $1
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date DESC
      LIMIT 90
    `;

    const result = await prisma.$queryRawUnsafe(query, timeFilter);
    return this.processQualityMetricsResult(result);
  }

  private async getRecentTrendsOptimized(timeFilter: any) {
    // Get trending categories and tags efficiently
    const [categoryTrends, tagTrends] = await Promise.all([
      this.getCategoryTrends(timeFilter),
      this.getTagTrends(timeFilter)
    ]);

    return {
      categories: categoryTrends,
      tags: tagTrends,
    };
  }

  private async getCategoryTrends(timeFilter: any) {
    const query = `
      SELECT 
        category,
        COUNT(*) as recent_count,
        LAG(COUNT(*)) OVER (ORDER BY category) as previous_count
      FROM "Project"
      WHERE "createdAt" >= $1 AND category IS NOT NULL
      GROUP BY category
      ORDER BY recent_count DESC
      LIMIT 10
    `;

    return await prisma.$queryRawUnsafe(query, timeFilter);
  }

  private async getTagTrends(timeFilter: any) {
    // Optimized tag analysis using JSONB operations
    const query = `
      SELECT 
        tag_value,
        COUNT(*) as frequency
      FROM "Project", 
           jsonb_array_elements_text(CASE 
             WHEN jsonb_typeof(tags) = 'array' THEN tags
             ELSE '[]'::jsonb
           END) as tag_value
      WHERE "createdAt" >= $1 AND tags IS NOT NULL
      GROUP BY tag_value
      ORDER BY frequency DESC
      LIMIT 20
    `;

    return await prisma.$queryRawUnsafe(query, timeFilter);
  }

  // Streaming analytics for large datasets
  async getStreamingAnalytics(options: {
    batchSize?: number;
    onBatch?: (batch: any, progress: number) => void;
    includeProjects?: boolean;
  } = {}): Promise<any> {
    const { batchSize = this.batchSize, onBatch, includeProjects = false } = options;
    const startTime = Date.now();

    try {
      // Get total count for progress tracking
      const totalCount = await prisma.project.count();
      let processed = 0;
      const results: any[] = [];

      // Process in batches to avoid memory issues
      for (let offset = 0; offset < totalCount; offset += batchSize) {
        const batch = await prisma.project.findMany({
          skip: offset,
          take: batchSize,
          select: {
            id: true,
            category: true,
            qualityScore: true,
            technicalComplexity: true,
            createdAt: true,
            status: true,
            ...(includeProjects && {
              title: true,
              problem: true,
              tags: true,
            }),
          },
        });

        // Process batch
        const processedBatch = this.processBatch(batch);
        results.push(...processedBatch);

        processed += batch.length;
        const progress = (processed / totalCount) * 100;

        // Call progress callback
        if (onBatch) {
          onBatch(processedBatch, progress);
        }

        // Yield control to prevent blocking
        await new Promise(resolve => setImmediate(resolve));
      }

      const duration = Date.now() - startTime;
      logPerformanceMetric('streaming_analytics', duration, { 
        totalProjects: totalCount,
        batchSize,
        includeProjects 
      });

      return {
        data: results,
        metadata: {
          totalProcessed: processed,
          processingTime: duration,
          batchSize,
        },
      };

    } catch (error) {
      logPerformanceMetric('streaming_analytics_error', Date.now() - startTime, { 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Performance monitoring and optimization suggestions
  async getPerformanceInsights(): Promise<{
    cacheStats: any;
    queryPerformance: any;
    optimizationSuggestions: string[];
  }> {
    const cacheStats = this.cache.getStats();
    
    // Analyze recent query performance
    const queryPerformance = await this.analyzeQueryPerformance();
    
    // Generate optimization suggestions
    const optimizationSuggestions = this.generateOptimizationSuggestions(cacheStats, queryPerformance);

    return {
      cacheStats,
      queryPerformance,
      optimizationSuggestions,
    };
  }

  // Cache management methods
  invalidateCache(pattern: string = '.*'): void {
    this.cache.invalidate(pattern);
    logPerformanceMetric('cache_invalidation', 0, { pattern });
  }

  preloadCache(timeRanges: string[] = ['1d', '7d', '30d']): Promise<void[]> {
    const preloadTasks = timeRanges.map(timeRange =>
      this.getOptimizedProjectAnalytics({ 
        timeRange, 
        useCache: false,
        forceRefresh: true 
      })
    );

    return Promise.all(preloadTasks);
  }

  // Helper methods
  private getTimeFilter(timeRange: string): Date {
    const now = new Date();
    const timeMap: Record<string, number> = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };

    const days = timeMap[timeRange] || 30;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  private getTTLForTimeRange(timeRange: string): number {
    const ttlMap: Record<string, number> = {
      '1d': 5 * 60 * 1000,      // 5 minutes for daily data
      '7d': 15 * 60 * 1000,     // 15 minutes for weekly data
      '30d': 30 * 60 * 1000,    // 30 minutes for monthly data
      '90d': 60 * 60 * 1000,    // 1 hour for quarterly data
      '1y': 2 * 60 * 60 * 1000, // 2 hours for yearly data
    };

    return ttlMap[timeRange] || 15 * 60 * 1000;
  }

  private processBatch(batch: any[]): any[] {
    return batch.map(project => ({
      id: project.id,
      category: project.category,
      qualityScore: project.qualityScore || 0,
      technicalComplexity: project.technicalComplexity || 0,
      createdAt: project.createdAt,
      status: project.status,
    }));
  }

  private processProjectStatsResult(result: any): any {
    // Process raw database result into structured format
    const totalProjects = result.reduce((sum: number, row: any) => sum + parseInt(row.category_count), 0);
    const avgQualityScore = result.reduce((sum: number, row: any) => sum + parseFloat(row.avg_quality_score), 0) / result.length;
    
    const categoryDistribution: Record<string, number> = {};
    result.forEach((row: any) => {
      categoryDistribution[row.category] = parseInt(row.category_count);
    });

    return {
      totalProjects,
      avgQualityScore,
      categoryDistribution,
    };
  }

  private processCategoryStatsResult(result: any): any[] {
    return result.map((row: any) => ({
      category: row.category,
      projectCount: parseInt(row.project_count),
      avgQuality: parseFloat(row.avg_quality),
      avgComplexity: parseFloat(row.avg_complexity),
      highQualityRatio: parseInt(row.high_quality_count) / parseInt(row.project_count),
    }));
  }

  private processQualityMetricsResult(result: any): any {
    return {
      timeline: result.map((row: any) => ({
        date: row.date,
        avgQuality: parseFloat(row.avg_quality),
        projectCount: parseInt(row.project_count),
      })),
      distribution: {
        excellent: result.reduce((sum: number, row: any) => sum + parseInt(row.excellent_count), 0),
        good: result.reduce((sum: number, row: any) => sum + parseInt(row.good_count), 0),
        needsImprovement: result.reduce((sum: number, row: any) => sum + parseInt(row.needs_improvement_count), 0),
      },
    };
  }

  private async analyzeQueryPerformance(): Promise<any> {
    // Analyze database query performance
    const slowQueries = await prisma.$queryRaw`
      SELECT query, mean_exec_time, calls, total_exec_time
      FROM pg_stat_statements 
      WHERE query LIKE '%Project%'
      ORDER BY mean_exec_time DESC 
      LIMIT 10
    `.catch(() => []);

    return {
      slowQueries,
      analyzedAt: new Date().toISOString(),
    };
  }

  private generateOptimizationSuggestions(cacheStats: any, queryPerformance: any): string[] {
    const suggestions: string[] = [];

    if (cacheStats.hitRate < 0.5) {
      suggestions.push('Cache hit rate is low. Consider increasing cache TTL or preloading frequently accessed data.');
    }

    if (cacheStats.size > 800) {
      suggestions.push('Cache size is near maximum. Consider implementing more aggressive eviction policies.');
    }

    if (queryPerformance.slowQueries?.length > 0) {
      suggestions.push('Slow queries detected. Consider adding database indexes or optimizing query structure.');
    }

    suggestions.push('Consider implementing pagination for large dataset queries.');
    suggestions.push('Use streaming analytics for real-time data processing.');

    return suggestions;
  }
}

// Export singleton instance
export const analyticsOptimizer = new AnalyticsPerformanceOptimizer();

// Performance monitoring utilities
export async function benchmarkAnalyticsOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  metadata: Record<string, any> = {}
): Promise<{ result: T; duration: number; memoryUsage: any }> {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();

    const memoryUsage = {
      heapUsedDelta: endMemory.heapUsed - startMemory.heapUsed,
      heapTotalDelta: endMemory.heapTotal - startMemory.heapTotal,
      externalDelta: endMemory.external - startMemory.external,
    };

    logPerformanceMetric(operationName, duration, { 
      ...metadata, 
      memoryUsage 
    });

    return { result, duration, memoryUsage };

  } catch (error) {
    const duration = Date.now() - startTime;
    logPerformanceMetric(`${operationName}_error`, duration, { 
      ...metadata, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}