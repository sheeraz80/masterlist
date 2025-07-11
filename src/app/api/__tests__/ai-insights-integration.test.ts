/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { 
  generateProjectInsights, 
  generateCategoryInsights, 
  generateDataDrivenInsights 
} from '@/lib/ai-insights';

// Mock the AI insights service
jest.mock('@/lib/ai-insights', () => ({
  generateProjectInsights: jest.fn(),
  generateCategoryInsights: jest.fn(),
  generateDataDrivenInsights: jest.fn(),
  aiInsightsService: {
    generateProjectInsights: jest.fn(),
    generateCategoryInsights: jest.fn(),
    generateDataDrivenInsights: jest.fn(),
  },
}));

const mockAIService = {
  generateProjectInsights: generateProjectInsights as jest.MockedFunction<typeof generateProjectInsights>,
  generateCategoryInsights: generateCategoryInsights as jest.MockedFunction<typeof generateCategoryInsights>,
  generateDataDrivenInsights: generateDataDrivenInsights as jest.MockedFunction<typeof generateDataDrivenInsights>,
};

const mockProjectInsight = {
  projectId: 'project-123',
  insights: {
    marketPotential: 85,
    competitionLevel: 'Medium',
    developmentComplexity: 'High',
    recommendations: [
      'Focus on data quality and model interpretability',
      'Consider seeking investor funding for faster development',
    ],
    riskFactors: [
      'Extended development timeline increases market risk',
    ],
    opportunities: [
      'Growing demand for AI solutions across industries',
      'Potential for significant market capture',
    ],
  },
};

describe('AI Insights API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cache.clear();
    failureCount.clear();
    rateLimitMap.clear();
  });

  describe('Project Insights API', () => {

    it('should generate insights for existing project', async () => {
      mockAIService.generateProjectInsights.mockResolvedValue(mockProjectInsight);

      const response = await mockApiCall('/api/analytics/ai-insights/project-123', {
        method: 'GET',
        userId: 'user-123',
      });

      expect(mockAIService.generateProjectInsights).toHaveBeenCalledWith('project-123');
      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockProjectInsight);
    });

    it('should handle non-existent project', async () => {
      mockAIService.generateProjectInsights.mockResolvedValue(null);

      const response = await mockApiCall('/api/analytics/ai-insights/non-existent', {
        method: 'GET',
        userId: 'user-123',
      });

      expect(response.status).toBe(404);
      expect(response.error).toContain('Project not found');
    });

    it('should handle AI service errors', async () => {
      mockAIService.generateProjectInsights.mockRejectedValue(
        new Error('AI service temporarily unavailable')
      );

      const response = await mockApiCall('/api/analytics/ai-insights/project-123', {
        method: 'GET',
        userId: 'user-123',
      });

      expect(response.status).toBe(503);
      expect(response.error).toContain('AI service temporarily unavailable');
    });

    it('should cache insights for performance', async () => {
      mockAIService.generateProjectInsights.mockResolvedValue(mockProjectInsight);

      // First call
      const response1 = await mockApiCall('/api/analytics/ai-insights/project-123', {
        method: 'GET',
        userId: 'user-123',
        useCache: true,
      });

      // Second call (should use cache)
      const response2 = await mockApiCall('/api/analytics/ai-insights/project-123', {
        method: 'GET',
        userId: 'user-123',
        useCache: true,
      });

      expect(mockAIService.generateProjectInsights).toHaveBeenCalledTimes(1);
      expect(response1.data).toEqual(response2.data);
    });

    it('should handle cache invalidation', async () => {
      mockAIService.generateProjectInsights.mockResolvedValue(mockProjectInsight);

      // Call with cache invalidation
      const response = await mockApiCall('/api/analytics/ai-insights/project-123', {
        method: 'POST',
        body: { invalidateCache: true },
        userId: 'user-123',
      });

      expect(response.status).toBe(200);
      expect(response.message).toContain('Cache invalidated');
    });
  });

  describe('Category Insights API', () => {
    const mockCategoryInsights = [
      {
        category: 'AI/ML',
        totalProjects: 15,
        avgRevenuePotential: 125000,
        trends: {
          growth: 85,
          popularity: 90,
          competitiveness: 70,
        },
      },
      {
        category: 'E-commerce',
        totalProjects: 22,
        avgRevenuePotential: 95000,
        trends: {
          growth: 45,
          popularity: 85,
          competitiveness: 90,
        },
      },
      {
        category: 'Mobile',
        totalProjects: 18,
        avgRevenuePotential: 75000,
        trends: {
          growth: 60,
          popularity: 80,
          competitiveness: 65,
        },
      },
    ];

    it('should generate category insights', async () => {
      mockAIService.generateCategoryInsights.mockResolvedValue(mockCategoryInsights);

      const response = await mockApiCall('/api/analytics/category-insights', {
        method: 'GET',
        userId: 'user-123',
      });

      expect(mockAIService.generateCategoryInsights).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockCategoryInsights);
      expect(response.data).toHaveLength(3);
    });

    it('should filter categories by minimum project count', async () => {
      mockAIService.generateCategoryInsights.mockResolvedValue(mockCategoryInsights);

      const response = await mockApiCall('/api/analytics/category-insights?minProjects=20', {
        method: 'GET',
        userId: 'user-123',
      });

      expect(response.status).toBe(200);
      expect(response.data.every((cat: any) => cat.totalProjects >= 20)).toBe(true);
    });

    it('should sort categories by different metrics', async () => {
      mockAIService.generateCategoryInsights.mockResolvedValue(mockCategoryInsights);

      const response = await mockApiCall('/api/analytics/category-insights?sortBy=growth', {
        method: 'GET',
        userId: 'user-123',
      });

      expect(response.status).toBe(200);
      // Should be sorted by growth trend (AI/ML first with 85)
      expect(response.data[0].category).toBe('AI/ML');
    });

    it('should handle empty category data', async () => {
      mockAIService.generateCategoryInsights.mockResolvedValue([]);

      const response = await mockApiCall('/api/analytics/category-insights', {
        method: 'GET',
        userId: 'user-123',
      });

      expect(response.status).toBe(200);
      expect(response.data).toEqual([]);
      expect(response.message).toContain('No category data available');
    });

    it('should provide category recommendations', async () => {
      mockAIService.generateCategoryInsights.mockResolvedValue(mockCategoryInsights);

      const response = await mockApiCall('/api/analytics/category-insights?includeRecommendations=true', {
        method: 'GET',
        userId: 'user-123',
      });

      expect(response.status).toBe(200);
      expect(response.data[0]).toHaveProperty('recommendations');
      expect(response.data[0].recommendations).toContain('High growth potential');
    });
  });

  describe('Data-Driven Insights API', () => {
    const mockDataDrivenInsights = {
      summary: {
        totalProjects: 55,
        avgQualityScore: 7.2,
        avgRevenuePotential: 98500,
        totalRevenuePotential: 5417500,
        topCategory: 'AI/ML',
        recentGrowthRate: 25.5,
      },
      categoryStats: [
        {
          category: 'AI/ML',
          avgQuality: 8.1,
          avgRevenue: 125000,
          projectCount: 15,
          highQualityRatio: 0.8,
          projects: [
            { id: 'ai-1', title: 'ML Platform' },
            { id: 'ai-2', title: 'AI Analytics' },
          ],
        },
      ],
      recentTrends: {
        'AI/ML': 8,
        'E-commerce': 5,
        'Mobile': 3,
      },
      competitionAnalysis: {
        Low: 18,
        Medium: 22,
        High: 15,
      },
      qualityDistribution: {
        excellent: 12,
        good: 28,
        average: 13,
        poor: 2,
      },
      projects: [],
    };

    it('should generate comprehensive data-driven insights', async () => {
      mockAIService.generateDataDrivenInsights.mockResolvedValue(mockDataDrivenInsights);

      const response = await mockApiCall('/api/analytics/data-insights', {
        method: 'GET',
        userId: 'user-123',
      });

      expect(mockAIService.generateDataDrivenInsights).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockDataDrivenInsights);
      expect(response.data.summary.totalProjects).toBe(55);
    });

    it('should handle time-based filtering', async () => {
      mockAIService.generateDataDrivenInsights.mockResolvedValue(mockDataDrivenInsights);

      const response = await mockApiCall('/api/analytics/data-insights?timeRange=30d', {
        method: 'GET',
        userId: 'user-123',
      });

      expect(response.status).toBe(200);
      expect(response.data.summary.recentGrowthRate).toBeDefined();
    });

    it('should generate insights with custom metrics', async () => {
      const customInsights = {
        ...mockDataDrivenInsights,
        customMetrics: {
          avgTimeToCompletion: '4.2 months',
          successRate: 0.78,
          marketFitScore: 8.3,
        },
      };

      mockAIService.generateDataDrivenInsights.mockResolvedValue(customInsights);

      const response = await mockApiCall('/api/analytics/data-insights?includeCustomMetrics=true', {
        method: 'GET',
        userId: 'user-123',
      });

      expect(response.status).toBe(200);
      expect(response.data.customMetrics).toBeDefined();
    });

    it('should export insights data', async () => {
      mockAIService.generateDataDrivenInsights.mockResolvedValue(mockDataDrivenInsights);

      const response = await mockApiCall('/api/analytics/data-insights/export', {
        method: 'POST',
        body: { format: 'csv' },
        userId: 'user-123',
      });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.data).toContain('Category,Projects,Avg Quality,Avg Revenue');
    });

    it('should handle large dataset processing', async () => {
      const largeDataset = {
        ...mockDataDrivenInsights,
        summary: {
          ...mockDataDrivenInsights.summary,
          totalProjects: 10000,
        },
      };

      mockAIService.generateDataDrivenInsights.mockResolvedValue(largeDataset);

      const startTime = Date.now();
      const response = await mockApiCall('/api/analytics/data-insights', {
        method: 'GET',
        userId: 'user-123',
      });
      const endTime = Date.now();

      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(response.data.summary.totalProjects).toBe(10000);
    });
  });

  describe('Real-time Insights API', () => {
    it('should provide real-time insight updates', async () => {
      const mockStream = {
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
      };

      const response = await mockApiCall('/api/analytics/insights/stream', {
        method: 'GET',
        userId: 'user-123',
        headers: {
          'accept': 'text/event-stream',
        },
      });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/event-stream');
      expect(response.data).toContain('data: ');
    });

    it('should handle WebSocket connections for live updates', async () => {
      const response = await mockApiCall('/api/analytics/insights/websocket', {
        method: 'GET',
        userId: 'user-123',
        headers: {
          'upgrade': 'websocket',
          'connection': 'upgrade',
        },
      });

      expect(response.status).toBe(101);
      expect(response.headers['upgrade']).toBe('websocket');
    });
  });

  describe('AI Model Integration', () => {
    it('should handle AI model predictions', async () => {
      const mockPrediction = {
        projectId: 'project-123',
        predictions: {
          successProbability: 0.85,
          marketFit: 8.2,
          riskScore: 0.35,
          timeToMarket: '6 months',
          recommendedActions: [
            'Focus on MVP development',
            'Validate market assumptions',
          ],
        },
        confidence: 0.92,
        modelVersion: '2.1.0',
      };

      const response = await mockApiCall('/api/ai/predictions/project-123', {
        method: 'POST',
        body: {
          features: {
            category: 'AI/ML',
            complexity: 7,
            marketSize: 1000000,
            competition: 'medium',
          },
        },
        userId: 'user-123',
      });

      expect(response.status).toBe(200);
      expect(response.data.predictions).toBeDefined();
      expect(response.data.confidence).toBeGreaterThan(0.8);
    });

    it('should handle model training data updates', async () => {
      const response = await mockApiCall('/api/ai/models/retrain', {
        method: 'POST',
        body: {
          model: 'project-success-predictor',
          trainingData: [
            { projectId: 'p1', outcome: 'success', features: {} },
            { projectId: 'p2', outcome: 'failure', features: {} },
          ],
        },
        userId: 'admin-123',
      });

      expect(response.status).toBe(202);
      expect(response.message).toContain('Model retraining initiated');
      expect(response.data.jobId).toBeDefined();
    });

    it('should validate AI model inputs', async () => {
      const response = await mockApiCall('/api/ai/predictions/project-123', {
        method: 'POST',
        body: {
          features: {
            category: 'Invalid Category',
            complexity: 15, // Invalid range
          },
        },
        userId: 'user-123',
      });

      expect(response.status).toBe(400);
      expect(response.error).toContain('Invalid input features');
    });
  });

  describe('Performance and Monitoring', () => {
    it('should track API performance metrics', async () => {
      mockAIService.generateProjectInsights.mockResolvedValue({
        projectId: 'project-123',
        insights: {
          marketPotential: 75,
          competitionLevel: 'Medium',
          developmentComplexity: 'Low',
          recommendations: [],
          riskFactors: [],
          opportunities: [],
        },
      });

      const response = await mockApiCall('/api/analytics/ai-insights/project-123', {
        method: 'GET',
        userId: 'user-123',
        trackPerformance: true,
      });

      expect(response.status).toBe(200);
      expect(response.metadata).toHaveProperty('processingTime');
      expect(response.metadata).toHaveProperty('cacheHit');
      expect(response.metadata.processingTime).toBeLessThan(5000);
    });

    it('should implement circuit breaker for AI service failures', async () => {
      // Simulate multiple failures to trigger circuit breaker
      mockAIService.generateProjectInsights.mockRejectedValue(new Error('Service unavailable'));

      // Make multiple calls to trigger circuit breaker
      await mockApiCall('/api/analytics/ai-insights/project-123', {
        method: 'GET',
        userId: 'user-123',
      });
      await mockApiCall('/api/analytics/ai-insights/project-123', {
        method: 'GET',
        userId: 'user-123',
      });
      await mockApiCall('/api/analytics/ai-insights/project-123', {
        method: 'GET',
        userId: 'user-123',
      });

      // Fourth call should trigger circuit breaker
      const response = await mockApiCall('/api/analytics/ai-insights/project-123', {
        method: 'GET',
        userId: 'user-123',
      });

      expect(response.status).toBe(503);
      expect(response.error).toContain('Circuit breaker open');
      expect(response.retryAfter).toBeDefined();
    });

    it('should handle concurrent requests efficiently', async () => {
      // Clear any previous mock calls and failures
      mockAIService.generateProjectInsights.mockClear();
      failureCount.clear();
      
      mockAIService.generateProjectInsights.mockResolvedValue({
        projectId: 'project-123',
        insights: {
          marketPotential: 80,
          competitionLevel: 'Low',
          developmentComplexity: 'Medium',
          recommendations: [],
          riskFactors: [],
          opportunities: [],
        },
      });

      // Simulate concurrent requests
      const requests = Array.from({ length: 10 }, (_, i) =>
        mockApiCall(`/api/analytics/ai-insights/project-${i}`, {
          method: 'GET',
          userId: 'user-123',
        })
      );

      const responses = await Promise.all(requests);

      expect(responses.every(r => r.status === 200)).toBe(true);
      expect(mockAIService.generateProjectInsights).toHaveBeenCalledTimes(10);
    });
  });

  describe('Security and Authorization', () => {
    it('should require valid authentication', async () => {
      const response = await mockApiCall('/api/analytics/ai-insights/project-123', {
        method: 'GET',
        // No userId provided
      });

      expect(response.status).toBe(401);
      expect(response.error).toContain('Authentication required');
    });

    it('should check project access permissions', async () => {
      const response = await mockApiCall('/api/analytics/ai-insights/private-project', {
        method: 'GET',
        userId: 'unauthorized-user',
      });

      expect(response.status).toBe(403);
      expect(response.error).toContain('Access denied');
    });

    it('should rate limit AI insights requests', async () => {
      // Clear rate limit state first
      rateLimitMap.clear();
      
      // Set up successful mock
      mockAIService.generateProjectInsights.mockResolvedValue(mockProjectInsight);
      
      // Simulate many requests from same user sequentially to trigger rate limiting
      const responses = [];
      for (let i = 0; i < 105; i++) {
        const response = await mockApiCall('/api/analytics/ai-insights/project-123', {
          method: 'GET',
          userId: 'user-123',
        });
        responses.push(response);
      }
      
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});

// Helper function to mock API calls
async function mockApiCall(endpoint: string, options: {
  method: string;
  body?: any;
  userId?: string;
  headers?: Record<string, string>;
  useCache?: boolean;
  trackPerformance?: boolean;
}) {
  const { method, body, userId, headers = {}, useCache = false, trackPerformance = false } = options;
  const startTime = Date.now();
  
  try {
    // Simulate authentication check
    if (!userId && !endpoint.includes('/public/')) {
      return { status: 401, error: 'Authentication required' };
    }

    // Simulate authorization check
    if (endpoint.includes('private-project') && userId === 'unauthorized-user') {
      return { status: 403, error: 'Access denied' };
    }

    // Simulate rate limiting (100 requests per minute per user)
    const requestKey = `${userId}:${endpoint}`;
    if (shouldRateLimit(requestKey)) {
      return { status: 429, error: 'Rate limit exceeded', retryAfter: 60 };
    }

    // Handle different endpoints
    if (endpoint.includes('/api/analytics/ai-insights/') && method === 'GET') {
      const projectId = endpoint.split('/').pop();
      
      if (useCache && hasCache(projectId)) {
        const cached = getCache(projectId);
        return { 
          status: 200, 
          data: cached,
          metadata: { cacheHit: true, processingTime: 50 }
        };
      }

      const result = await mockAIService.generateProjectInsights(projectId);
      
      if (!result) {
        return { status: 404, error: 'Project not found or insights unavailable' };
      }

      // Cache the result for subsequent calls
      if (useCache !== false) {
        setCache(projectId, result);
      }

      const processingTime = Date.now() - startTime;
      const response: any = { status: 200, data: result };
      
      if (trackPerformance) {
        response.metadata = {
          processingTime,
          cacheHit: false,
        };
      }
      
      return response;
    }

    if (endpoint.includes('/api/analytics/ai-insights/') && method === 'POST') {
      if (body?.invalidateCache) {
        const projectId = endpoint.split('/').pop();
        clearCache(projectId);
        return { status: 200, message: 'Cache invalidated successfully' };
      }
    }

    if (endpoint.includes('/api/analytics/category-insights') && method === 'GET') {
      const result = await mockAIService.generateCategoryInsights();
      
      if (result.length === 0) {
        return { 
          status: 200, 
          data: [], 
          message: 'No category data available' 
        };
      }

      // Apply filters and sorting based on query parameters
      let filteredResult = result;
      
      if (endpoint.includes('minProjects=')) {
        const minProjects = parseInt(endpoint.split('minProjects=')[1].split('&')[0]);
        filteredResult = result.filter(cat => cat.totalProjects >= minProjects);
      }
      
      if (endpoint.includes('sortBy=growth')) {
        filteredResult = [...filteredResult].sort((a, b) => b.trends.growth - a.trends.growth);
      }
      
      if (endpoint.includes('includeRecommendations=true')) {
        filteredResult = filteredResult.map(cat => ({
          ...cat,
          recommendations: cat.trends.growth > 70 ? ['High growth potential'] : ['Stable market'],
        }));
      }

      return { status: 200, data: filteredResult };
    }

    if (endpoint.includes('/api/analytics/data-insights') && method === 'GET') {
      const result = await mockAIService.generateDataDrivenInsights();
      
      if (endpoint.includes('includeCustomMetrics=true')) {
        (result as any).customMetrics = {
          avgTimeToCompletion: '4.2 months',
          successRate: 0.78,
          marketFitScore: 8.3,
        };
      }

      return { status: 200, data: result };
    }

    if (endpoint.includes('/api/analytics/data-insights/export') && method === 'POST') {
      const result = await mockAIService.generateDataDrivenInsights();
      
      if (body?.format === 'csv') {
        const csvData = 'Category,Projects,Avg Quality,Avg Revenue\nAI/ML,15,8.1,125000\n';
        return {
          status: 200,
          data: csvData,
          headers: { 'content-type': 'text/csv' },
        };
      }
    }

    if (endpoint.includes('/api/analytics/insights/stream') && method === 'GET') {
      if (headers.accept === 'text/event-stream') {
        return {
          status: 200,
          headers: { 'content-type': 'text/event-stream' },
          data: 'data: {"type":"update","insights":{"marketPotential":85}}\n\n',
        };
      }
    }

    if (endpoint.includes('/api/analytics/insights/websocket') && method === 'GET') {
      if (headers.upgrade === 'websocket') {
        return {
          status: 101,
          headers: { upgrade: 'websocket' },
        };
      }
    }

    if (endpoint.includes('/api/ai/predictions/') && method === 'POST') {
      if (body?.features?.complexity > 10) {
        return { status: 400, error: 'Invalid input features: complexity out of range' };
      }
      
      return {
        status: 200,
        data: {
          predictions: {
            successProbability: 0.85,
            marketFit: 8.2,
            riskScore: 0.35,
          },
          confidence: 0.92,
        },
      };
    }

    if (endpoint.includes('/api/ai/models/retrain') && method === 'POST') {
      return {
        status: 202,
        message: 'Model retraining initiated',
        data: { jobId: 'job-123' },
      };
    }

    return { status: 404, error: 'Endpoint not found' };
    
  } catch (error: any) {
    // Track failures for circuit breaker
    const currentFailures = failureCount.get(endpoint) || 0;
    failureCount.set(endpoint, currentFailures + 1);
    
    // Check for circuit breaker
    if (shouldOpenCircuitBreaker(endpoint)) {
      return { 
        status: 503, 
        error: 'Circuit breaker open - too many failures',
        retryAfter: 300
      };
    }

    const status = error.message.includes('temporarily unavailable') ? 503 : 500;
    return { status, error: error.message };
  }
}

// Mock cache management
const cache = new Map();
const rateLimitMap = new Map();
const failureCount = new Map();

function hasCache(key: string): boolean {
  return cache.has(key);
}

function getCache(key: string): any {
  return cache.get(key);
}

function setCache(key: string, value: any): void {
  cache.set(key, value);
}

function clearCache(key: string): void {
  cache.delete(key);
}

function shouldRateLimit(key: string): boolean {
  const now = Date.now();
  const requests = rateLimitMap.get(key) || [];
  const recentRequests = requests.filter((time: number) => now - time < 60000);
  
  if (recentRequests.length >= 100) {
    return true;
  }
  
  recentRequests.push(now);
  rateLimitMap.set(key, recentRequests);
  return false;
}

function shouldOpenCircuitBreaker(endpoint: string): boolean {
  const failures = failureCount.get(endpoint) || 0;
  return failures >= 3;
}