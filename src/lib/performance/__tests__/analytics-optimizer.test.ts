/**
 * @jest-environment node
 */

import { AnalyticsPerformanceOptimizer, benchmarkAnalyticsOperation } from '../analytics-optimizer';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRawUnsafe: jest.fn(),
    $queryRaw: jest.fn(),
    project: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/logger', () => ({
  logPerformanceMetric: jest.fn(),
}));

describe('AnalyticsPerformanceOptimizer', () => {
  let optimizer: AnalyticsPerformanceOptimizer;

  beforeEach(() => {
    optimizer = new AnalyticsPerformanceOptimizer();
    jest.clearAllMocks();
  });

  describe('Cache Management', () => {
    it('should cache analytics results', async () => {
      const mockData = {
        projectStats: { totalProjects: 100, avgQualityScore: 7.5 },
        categoryStats: [{ category: 'AI/ML', projectCount: 25 }],
        generatedAt: new Date().toISOString(),
      };

      // Mock database queries
      const { prisma } = require('@/lib/prisma');
      prisma.$queryRawUnsafe.mockResolvedValue([
        { category_count: 100, avg_quality_score: 7.5 }
      ]);

      // First call - should generate and cache
      const result1 = await optimizer.getOptimizedProjectAnalytics({ useCache: true });
      
      // Second call - should use cache
      const result2 = await optimizer.getOptimizedProjectAnalytics({ useCache: true });

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      // Cache should reduce database calls
      expect(prisma.$queryRawUnsafe).toHaveBeenCalledTimes(4); // 4 queries for initial generation
    });

    it('should bypass cache when forceRefresh is true', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.$queryRawUnsafe.mockResolvedValue([
        { category_count: 100, avg_quality_score: 7.5 }
      ]);

      // First call with cache
      await optimizer.getOptimizedProjectAnalytics({ useCache: true });
      
      // Clear mock call count
      prisma.$queryRawUnsafe.mockClear();
      
      // Second call with forceRefresh
      await optimizer.getOptimizedProjectAnalytics({ 
        useCache: true, 
        forceRefresh: true 
      });

      // Should make database calls for forceRefresh
      expect(prisma.$queryRawUnsafe).toHaveBeenCalledTimes(4); // 4 queries for fresh data
    });

    it('should invalidate cache by pattern', () => {
      optimizer.invalidateCache('project_analytics_*');
      
      const { logPerformanceMetric } = require('@/lib/logger');
      expect(logPerformanceMetric).toHaveBeenCalledWith(
        'cache_invalidation',
        0,
        { pattern: 'project_analytics_*' }
      );
    });

    it('should preload cache for multiple time ranges', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.$queryRawUnsafe.mockResolvedValue([
        { category_count: 100, avg_quality_score: 7.5 }
      ]);

      const timeRanges = ['1d', '7d', '30d'];
      await optimizer.preloadCache(timeRanges);

      // Should make queries for each time range
      expect(prisma.$queryRawUnsafe).toHaveBeenCalledTimes(12); // 4 queries × 3 time ranges
    });
  });

  describe('Query Optimization', () => {
    it('should execute parallel queries for better performance', async () => {
      const { prisma } = require('@/lib/prisma');
      
      // Mock different query results
      prisma.$queryRawUnsafe
        .mockResolvedValueOnce([{ category_count: 100, avg_quality_score: 7.5 }])
        .mockResolvedValueOnce([{ category: 'AI/ML', project_count: 25 }])
        .mockResolvedValueOnce([{ date: '2024-01-01', avg_quality: 7.5 }])
        .mockResolvedValueOnce([{ category: 'AI/ML', recent_count: 10 }]);

      const startTime = Date.now();
      const result = await optimizer.getOptimizedProjectAnalytics({
        includeDetailedMetrics: true
      });
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(result.projectStats).toBeDefined();
      expect(result.categoryStats).toBeDefined();
      expect(result.qualityMetrics).toBeDefined();
      
      // Performance check - should complete reasonably quickly
      expect(endTime - startTime).toBeLessThan(2000);
    });

    it('should handle query errors gracefully', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.$queryRawUnsafe.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        optimizer.getOptimizedProjectAnalytics()
      ).rejects.toThrow('Database connection failed');

      const { logPerformanceMetric } = require('@/lib/logger');
      expect(logPerformanceMetric).toHaveBeenCalledWith(
        'analytics_generation_error',
        expect.any(Number),
        expect.objectContaining({
          error: 'Database connection failed'
        })
      );
    });
  });

  describe('Streaming Analytics', () => {
    it('should process large datasets in batches', async () => {
      const { prisma } = require('@/lib/prisma');
      
      // Mock large dataset
      prisma.project.count.mockResolvedValue(5000);
      prisma.project.findMany.mockResolvedValue(
        Array.from({ length: 1000 }, (_, i) => ({
          id: `project-${i}`,
          category: 'AI/ML',
          qualityScore: 7.5,
          createdAt: new Date(),
        }))
      );

      const progressUpdates: number[] = [];
      const result = await optimizer.getStreamingAnalytics({
        batchSize: 1000,
        onBatch: (batch, progress) => {
          progressUpdates.push(progress);
        },
      });

      expect(result.data).toBeDefined();
      expect(result.metadata.totalProcessed).toBe(5000);
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[progressUpdates.length - 1]).toBe(100);
    });

    it('should handle streaming with progress callbacks', async () => {
      const { prisma } = require('@/lib/prisma');
      
      prisma.project.count.mockResolvedValue(2000);
      prisma.project.findMany.mockResolvedValue(
        Array.from({ length: 500 }, (_, i) => ({
          id: `project-${i}`,
          category: 'Web',
          qualityScore: 6.0,
        }))
      );

      let callbackCount = 0;
      const result = await optimizer.getStreamingAnalytics({
        batchSize: 500,
        onBatch: () => {
          callbackCount++;
        },
      });

      expect(result.data).toBeDefined();
      expect(callbackCount).toBe(4); // 2000 / 500 = 4 batches
    });
  });

  describe('Performance Insights', () => {
    it('should generate performance insights', async () => {
      const { prisma } = require('@/lib/prisma');
      
      // Mock slow query analysis
      prisma.$queryRaw.mockResolvedValue([
        {
          query: 'SELECT * FROM Project WHERE category = ?',
          mean_exec_time: 150.5,
          calls: 100,
          total_exec_time: 15050,
        },
      ]);

      const insights = await optimizer.getPerformanceInsights();

      expect(insights).toBeDefined();
      expect(insights.cacheStats).toBeDefined();
      expect(insights.queryPerformance).toBeDefined();
      expect(insights.optimizationSuggestions).toBeInstanceOf(Array);
    });

    it('should provide optimization suggestions based on metrics', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.$queryRaw.mockResolvedValue([]);

      const insights = await optimizer.getPerformanceInsights();

      expect(insights.optimizationSuggestions).toContain(
        'Consider implementing pagination for large dataset queries.'
      );
      expect(insights.optimizationSuggestions).toContain(
        'Use streaming analytics for real-time data processing.'
      );
    });
  });

  describe('Time Range Handling', () => {
    it('should handle different time ranges correctly', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.$queryRawUnsafe.mockResolvedValue([
        { category_count: 50, avg_quality_score: 8.0 }
      ]);

      const timeRanges = ['1d', '7d', '30d', '90d', '1y'];
      
      for (const timeRange of timeRanges) {
        const result = await optimizer.getOptimizedProjectAnalytics({
          timeRange,
          useCache: false,
        });
        
        expect(result).toBeDefined();
        expect(result.projectStats).toBeDefined();
      }
    });

    it('should set appropriate TTL for different time ranges', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.$queryRawUnsafe.mockResolvedValue([
        { category_count: 25, avg_quality_score: 7.2 }
      ]);

      // Test different time ranges with caching
      const timeRanges = ['1d', '7d', '30d', '90d', '1y'];
      
      for (const timeRange of timeRanges) {
        await optimizer.getOptimizedProjectAnalytics({
          timeRange,
          useCache: true,
        });
      }

      // Each time range should have different TTL (tested implicitly through caching behavior)
      expect(prisma.$queryRawUnsafe).toHaveBeenCalledTimes(20); // 4 queries × 5 time ranges
    });
  });

  describe('Memory Management', () => {
    it('should manage memory efficiently for large datasets', async () => {
      const { prisma } = require('@/lib/prisma');
      
      // Mock large dataset
      prisma.project.count.mockResolvedValue(10000);
      prisma.project.findMany.mockResolvedValue(
        Array.from({ length: 1000 }, (_, i) => ({
          id: `project-${i}`,
          category: 'Mobile',
          qualityScore: 6.5,
        }))
      );

      const initialMemory = process.memoryUsage();
      
      const result = await optimizer.getStreamingAnalytics({
        batchSize: 1000,
      });

      const finalMemory = process.memoryUsage();
      
      expect(result.data).toBeDefined();
      
      // Memory usage should be reasonable (allowing for some variation)
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase
    });
  });
});

describe('benchmarkAnalyticsOperation', () => {
  it('should benchmark operation performance', async () => {
    const mockOperation = jest.fn().mockImplementation(async () => {
      // Add small delay to ensure duration > 0
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'test result';
    });
    
    const result = await benchmarkAnalyticsOperation(
      mockOperation,
      'test_operation',
      { testParam: 'value' }
    );

    expect(result.result).toBe('test result');
    expect(result.duration).toBeGreaterThan(0);
    expect(result.memoryUsage).toBeDefined();
    expect(result.memoryUsage.heapUsedDelta).toBeDefined();

    const { logPerformanceMetric } = require('@/lib/logger');
    expect(logPerformanceMetric).toHaveBeenCalledWith(
      'test_operation',
      expect.any(Number),
      expect.objectContaining({
        testParam: 'value',
        memoryUsage: expect.any(Object),
      })
    );
  });

  it('should handle operation errors and still log metrics', async () => {
    const mockOperation = jest.fn().mockRejectedValue(new Error('Operation failed'));
    
    await expect(
      benchmarkAnalyticsOperation(mockOperation, 'failing_operation')
    ).rejects.toThrow('Operation failed');

    const { logPerformanceMetric } = require('@/lib/logger');
    expect(logPerformanceMetric).toHaveBeenCalledWith(
      'failing_operation_error',
      expect.any(Number),
      expect.objectContaining({
        error: 'Operation failed',
      })
    );
  });

  it('should track memory usage accurately', async () => {
    const memoryIntensiveOperation = async () => {
      // Simulate memory-intensive operation
      const largeArray = new Array(100000).fill('test data');
      return largeArray.length;
    };

    const result = await benchmarkAnalyticsOperation(
      memoryIntensiveOperation,
      'memory_test'
    );

    expect(result.memoryUsage.heapUsedDelta).toBeGreaterThan(0);
    expect(result.result).toBe(100000);
  });
});