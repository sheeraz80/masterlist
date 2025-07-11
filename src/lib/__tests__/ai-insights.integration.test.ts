/**
 * @jest-environment node
 */

import {
  generateProjectInsights,
  generateCategoryInsights,
  generateDataDrivenInsights,
  aiInsightsService,
  ProjectInsight,
  CategoryInsight,
} from '../ai-insights';
import { prisma } from '../prisma';

// Mock Prisma
jest.mock('../prisma', () => ({
  prisma: {
    project: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('AI Insights Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateProjectInsights', () => {
    const mockProject = {
      id: 'test-project-1',
      title: 'AI-Powered Analytics Platform',
      problem: 'Businesses lack actionable insights from their data',
      solution: 'AI-driven analytics platform with real-time insights',
      category: 'AI/ML',
      targetUsers: 'Enterprise businesses',
      revenuePotential: 'High',
      developmentTime: '6-12 months',
      qualityScore: 8.5,
      technicalComplexity: 7.0,
      competitionLevel: 'Medium',
      tags: ['AI', 'Analytics', 'Enterprise'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
      status: 'active',
    };

    it('should generate insights for existing project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await generateProjectInsights('test-project-1');

      expect(mockPrisma.project.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-project-1' },
      });

      expect(result).toBeDefined();
      expect(result?.projectId).toBe('test-project-1');
      expect(result?.insights).toHaveProperty('marketPotential');
      expect(result?.insights).toHaveProperty('competitionLevel');
      expect(result?.insights).toHaveProperty('developmentComplexity');
      expect(result?.insights).toHaveProperty('recommendations');
      expect(result?.insights).toHaveProperty('riskFactors');
      expect(result?.insights).toHaveProperty('opportunities');
    });

    it('should return null for non-existent project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);

      const result = await generateProjectInsights('non-existent-id');

      expect(result).toBeNull();
    });

    it('should calculate market potential correctly', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await generateProjectInsights('test-project-1');

      expect(result?.insights.marketPotential).toBeGreaterThan(0);
      expect(result?.insights.marketPotential).toBeLessThanOrEqual(100);
    });

    it('should assess competition level based on category', async () => {
      const ecommerceProject = {
        ...mockProject,
        category: 'E-commerce',
      };
      mockPrisma.project.findUnique.mockResolvedValue(ecommerceProject);

      const result = await generateProjectInsights('test-project-1');

      expect(result?.insights.competitionLevel).toBe('High');
    });

    it('should assess development complexity based on timeline', async () => {
      const quickProject = {
        ...mockProject,
        developmentTime: '1-2 months',
      };
      mockPrisma.project.findUnique.mockResolvedValue(quickProject);

      const result = await generateProjectInsights('test-project-1');

      expect(result?.insights.developmentComplexity).toBe('Low');
    });

    it('should generate AI-specific recommendations', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await generateProjectInsights('test-project-1');

      expect(result?.insights.recommendations).toContain(
        'Focus on data quality and model interpretability'
      );
    });

    it('should identify revenue-based opportunities', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const result = await generateProjectInsights('test-project-1');

      expect(result?.insights.opportunities).toContain(
        'Potential for significant market capture'
      );
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.project.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await generateProjectInsights('test-project-1');

      expect(result).toBeNull();
    });
  });

  describe('generateCategoryInsights', () => {
    const mockProjects = [
      {
        category: 'AI/ML',
        revenuePotential: '100000',
        qualityScore: 8.5,
      },
      {
        category: 'AI/ML',
        revenuePotential: '50000',
        qualityScore: 7.0,
      },
      {
        category: 'E-commerce',
        revenuePotential: '200000',
        qualityScore: 6.5,
      },
      {
        category: 'Web Development',
        revenuePotential: '30000',
        qualityScore: 7.5,
      },
    ];

    it('should generate category insights from project data', async () => {
      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await generateCategoryInsights();

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith({
        select: {
          category: true,
          revenuePotential: true,
          qualityScore: true,
        },
      });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should calculate average revenue potential per category', async () => {
      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await generateCategoryInsights();

      const aiCategory = result.find(cat => cat.category === 'AI/ML');
      expect(aiCategory).toBeDefined();
      expect(aiCategory?.avgRevenuePotential).toBeCloseTo(75000, -2);
    });

    it('should sort categories by average revenue potential', async () => {
      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await generateCategoryInsights();

      expect(result[0].avgRevenuePotential).toBeGreaterThanOrEqual(
        result[result.length - 1].avgRevenuePotential
      );
    });

    it('should handle projects with string revenue format', async () => {
      const projectsWithStringRevenue = [
        {
          category: 'AI/ML',
          revenuePotential: '$50k-100k',
          qualityScore: 8.0,
        },
        {
          category: 'AI/ML',
          revenuePotential: '2M',
          qualityScore: 7.5,
        },
      ];

      mockPrisma.project.findMany.mockResolvedValue(projectsWithStringRevenue);

      const result = await generateCategoryInsights();

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toHaveProperty('avgRevenuePotential');
    });

    it('should return empty array on database error', async () => {
      mockPrisma.project.findMany.mockRejectedValue(new Error('Database error'));

      const result = await generateCategoryInsights();

      expect(result).toEqual([]);
    });

    it('should handle empty project list', async () => {
      mockPrisma.project.findMany.mockResolvedValue([]);

      const result = await generateCategoryInsights();

      expect(result).toEqual([]);
    });

    it('should calculate trends correctly', async () => {
      mockPrisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await generateCategoryInsights();

      const aiCategory = result.find(cat => cat.category === 'AI/ML');
      expect(aiCategory?.trends).toHaveProperty('growth');
      expect(aiCategory?.trends).toHaveProperty('popularity');
      expect(aiCategory?.trends).toHaveProperty('competitiveness');
      expect(aiCategory?.trends.growth).toBe(85); // AI/ML has high growth trend
    });
  });

  describe('generateDataDrivenInsights', () => {
    const mockDetailedProjects = [
      {
        id: 'project-1',
        title: 'AI Analytics Platform',
        category: 'AI/ML',
        qualityScore: 8.5,
        technicalComplexity: 7.0,
        revenuePotential: JSON.stringify({ realistic: 100000 }),
        competitionLevel: 'Medium',
        developmentTime: '6-12 months',
        tags: ['AI', 'Analytics'],
        createdAt: new Date('2024-01-01'),
        status: 'active',
      },
      {
        id: 'project-2',
        title: 'E-commerce Platform',
        category: 'E-commerce',
        qualityScore: 7.0,
        technicalComplexity: 5.0,
        revenuePotential: '$5K-20K MRR',
        competitionLevel: 'High',
        developmentTime: '3-6 months',
        tags: ['E-commerce', 'Web'],
        createdAt: new Date('2024-01-15'),
        status: 'active',
      },
      {
        id: 'project-3',
        title: 'Mobile App',
        category: 'Mobile',
        qualityScore: 6.0,
        technicalComplexity: 4.0,
        revenuePotential: '50000',
        competitionLevel: 'Low',
        developmentTime: '2-4 months',
        tags: ['Mobile', 'iOS'],
        createdAt: new Date('2024-02-01'),
        status: 'completed',
      },
    ];

    it('should generate comprehensive data-driven insights', async () => {
      mockPrisma.project.findMany.mockResolvedValue(mockDetailedProjects);

      const result = await generateDataDrivenInsights();

      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('categoryStats');
      expect(result).toHaveProperty('recentTrends');
      expect(result).toHaveProperty('competitionAnalysis');
      expect(result).toHaveProperty('qualityDistribution');
      expect(result).toHaveProperty('projects');
    });

    it('should calculate summary metrics correctly', async () => {
      mockPrisma.project.findMany.mockResolvedValue(mockDetailedProjects);

      const result = await generateDataDrivenInsights();

      expect(result.summary.totalProjects).toBe(3);
      expect(result.summary.avgQualityScore).toBeCloseTo(7.17, 1);
      expect(result.summary.topCategory).toBeDefined();
    });

    it('should parse JSON revenue potential correctly', async () => {
      mockPrisma.project.findMany.mockResolvedValue(mockDetailedProjects);

      const result = await generateDataDrivenInsights();

      expect(result.summary.avgRevenuePotential).toBeGreaterThan(0);
    });

    it('should parse string revenue potential correctly', async () => {
      const projectsWithStringRevenue = [
        {
          ...mockDetailedProjects[0],
          revenuePotential: '$5K-20K MRR',
        },
      ];

      mockPrisma.project.findMany.mockResolvedValue(projectsWithStringRevenue);

      const result = await generateDataDrivenInsights();

      expect(result.summary.avgRevenuePotential).toBeGreaterThan(0);
    });

    it('should identify recent trends', async () => {
      // Set created date to recent for trend analysis
      const recentProjects = mockDetailedProjects.map(p => ({
        ...p,
        createdAt: new Date(), // Current date
      }));

      mockPrisma.project.findMany.mockResolvedValue(recentProjects);

      const result = await generateDataDrivenInsights();

      expect(result.recentTrends).toBeDefined();
      expect(Object.keys(result.recentTrends).length).toBeGreaterThan(0);
    });

    it('should analyze competition levels', async () => {
      mockPrisma.project.findMany.mockResolvedValue(mockDetailedProjects);

      const result = await generateDataDrivenInsights();

      expect(result.competitionAnalysis).toHaveProperty('Medium');
      expect(result.competitionAnalysis).toHaveProperty('High');
      expect(result.competitionAnalysis).toHaveProperty('Low');
      expect(result.competitionAnalysis.Medium).toBe(1);
      expect(result.competitionAnalysis.High).toBe(1);
      expect(result.competitionAnalysis.Low).toBe(1);
    });

    it('should calculate quality distribution', async () => {
      mockPrisma.project.findMany.mockResolvedValue(mockDetailedProjects);

      const result = await generateDataDrivenInsights();

      expect(result.qualityDistribution).toHaveProperty('excellent');
      expect(result.qualityDistribution).toHaveProperty('good');
      expect(result.qualityDistribution).toHaveProperty('average');
      expect(result.qualityDistribution).toHaveProperty('poor');
      expect(result.qualityDistribution.excellent).toBe(1); // Project with score 8.5
      expect(result.qualityDistribution.good).toBe(1); // Project with score 7.0
      expect(result.qualityDistribution.average).toBe(1); // Project with score 6.0
    });

    it('should sort category stats by opportunity score', async () => {
      mockPrisma.project.findMany.mockResolvedValue(mockDetailedProjects);

      const result = await generateDataDrivenInsights();

      const categoryStats = result.categoryStats;
      expect(categoryStats.length).toBeGreaterThan(0);
      
      // Check that categories are sorted by opportunity score (quality + revenue)
      for (let i = 0; i < categoryStats.length - 1; i++) {
        const scoreA = categoryStats[i].avgQuality * 0.4 + (categoryStats[i].avgRevenue / 1000) * 0.6;
        const scoreB = categoryStats[i + 1].avgQuality * 0.4 + (categoryStats[i + 1].avgRevenue / 1000) * 0.6;
        expect(scoreA).toBeGreaterThanOrEqual(scoreB);
      }
    });

    it('should handle mixed revenue formats', async () => {
      const mixedProjects = [
        {
          ...mockDetailedProjects[0],
          revenuePotential: JSON.stringify({ realistic: 50000 }),
        },
        {
          ...mockDetailedProjects[1],
          revenuePotential: '$10K MRR',
        },
        {
          ...mockDetailedProjects[2],
          revenuePotential: '75000',
        },
      ];

      mockPrisma.project.findMany.mockResolvedValue(mixedProjects);

      const result = await generateDataDrivenInsights();

      expect(result.summary.avgRevenuePotential).toBeGreaterThan(0);
      expect(result.summary.totalRevenuePotential).toBeGreaterThan(0);
    });

    it('should handle database errors', async () => {
      mockPrisma.project.findMany.mockRejectedValue(new Error('Database connection failed'));

      await expect(generateDataDrivenInsights()).rejects.toThrow('Database connection failed');
    });

    it('should handle empty database', async () => {
      mockPrisma.project.findMany.mockResolvedValue([]);

      const result = await generateDataDrivenInsights();

      expect(result.summary.totalProjects).toBe(0);
      expect(result.summary.avgQualityScore).toBeNaN();
      expect(result.categoryStats).toEqual([]);
    });

    it('should calculate recent growth rate', async () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days ago
      const oldDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days ago

      const projectsWithDates = [
        { ...mockDetailedProjects[0], createdAt: recentDate },
        { ...mockDetailedProjects[1], createdAt: oldDate },
        { ...mockDetailedProjects[2], createdAt: oldDate },
      ];

      mockPrisma.project.findMany.mockResolvedValue(projectsWithDates);

      const result = await generateDataDrivenInsights();

      expect(result.summary.recentGrowthRate).toBeCloseTo(33.33, 1);
    });
  });

  describe('aiInsightsService', () => {
    it('should export all service methods', () => {
      expect(aiInsightsService).toHaveProperty('generateProjectInsights');
      expect(aiInsightsService).toHaveProperty('generateCategoryInsights');
      expect(aiInsightsService).toHaveProperty('generateDataDrivenInsights');
      
      expect(typeof aiInsightsService.generateProjectInsights).toBe('function');
      expect(typeof aiInsightsService.generateCategoryInsights).toBe('function');
      expect(typeof aiInsightsService.generateDataDrivenInsights).toBe('function');
    });

    it('should work consistently with direct function calls', async () => {
      const mockProject = {
        id: 'test-id',
        category: 'AI/ML',
        revenuePotential: 'High',
        developmentTime: '3-6 months',
        targetUsers: 'Enterprise',
      };

      mockPrisma.project.findUnique.mockResolvedValue(mockProject);

      const directResult = await generateProjectInsights('test-id');
      const serviceResult = await aiInsightsService.generateProjectInsights('test-id');

      expect(directResult).toEqual(serviceResult);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `project-${i}`,
        title: `Project ${i}`,
        category: ['AI/ML', 'E-commerce', 'Mobile'][i % 3],
        qualityScore: Math.random() * 10,
        technicalComplexity: Math.random() * 10,
        revenuePotential: JSON.stringify({ realistic: Math.floor(Math.random() * 100000) }),
        competitionLevel: ['Low', 'Medium', 'High'][i % 3],
        developmentTime: ['1-2 months', '3-6 months', '6-12 months'][i % 3],
        tags: ['tag1', 'tag2'],
        createdAt: new Date(),
        status: 'active',
      }));

      mockPrisma.project.findMany.mockResolvedValue(largeDataset);

      const startTime = Date.now();
      const result = await generateDataDrivenInsights();
      const endTime = Date.now();

      expect(result.summary.totalProjects).toBe(1000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle projects with null values', async () => {
      const projectsWithNulls = [
        {
          id: 'project-1',
          title: 'Project 1',
          category: null,
          qualityScore: null,
          technicalComplexity: null,
          revenuePotential: null,
          competitionLevel: null,
          developmentTime: null,
          tags: null,
          createdAt: new Date(),
          status: 'active',
        },
      ];

      mockPrisma.project.findMany.mockResolvedValue(projectsWithNulls);

      const result = await generateDataDrivenInsights();

      expect(result.summary.totalProjects).toBe(1);
      expect(result.summary.avgQualityScore).toBe(0);
    });

    it('should handle malformed revenue data gracefully', async () => {
      const projectsWithBadRevenue = [
        {
          id: 'project-1',
          title: 'Project 1',
          category: 'AI/ML',
          qualityScore: 8.0,
          revenuePotential: 'invalid json {',
          createdAt: new Date(),
          status: 'active',
        },
        {
          id: 'project-2',
          title: 'Project 2',
          category: 'AI/ML',
          qualityScore: 7.0,
          revenuePotential: 'not a number at all',
          createdAt: new Date(),
          status: 'active',
        },
      ];

      mockPrisma.project.findMany.mockResolvedValue(projectsWithBadRevenue);

      const result = await generateDataDrivenInsights();

      expect(result.summary.totalProjects).toBe(2);
      expect(result.summary.avgRevenuePotential).toBe(0);
    });
  });
});