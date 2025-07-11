import { NextRequest } from 'next/server';
import { GET, POST } from '../projects/route';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/middleware/auth', () => ({
  optionalAuth: jest.fn((handler) => handler),
  requireAuth: jest.fn((handler) => handler),
}));

jest.mock('@/lib/middleware/rate-limit', () => ({
  withRateLimit: jest.fn((handler) => handler),
  rateLimits: {
    read: jest.fn(),
    write: jest.fn(),
  },
}));

jest.mock('@/lib/validations', () => ({
  validateQuery: jest.fn(),
  validateRequest: jest.fn(),
  paginationSchema: {},
  searchSchema: {},
  createProjectSchema: {},
}));

jest.mock('@/lib/cache', () => ({
  projectCache: {
    getProjectList: jest.fn(),
    setProjectList: jest.fn(),
    invalidateProject: jest.fn(),
  },
  statsCache: {
    invalidateStats: jest.fn(),
  },
}));

describe('/api/projects', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return projects with valid pagination', async () => {
      const { prisma } = require('@/lib/prisma');
      const { validateQuery } = require('@/lib/validations');
      const { projectCache } = require('@/lib/cache');

      // Mock validation
      validateQuery.mockReturnValue({ 
        data: { limit: 10, offset: 0, search: '', category: '', sortBy: 'createdAt', sortOrder: 'desc' },
        error: null 
      });

      // Mock cache miss
      projectCache.getProjectList.mockReturnValue(null);

      // Mock database
      const mockProjects = [
        {
          id: '1',
          title: 'Test Project',
          problem: 'Test problem',
          solution: 'Test solution',
          category: 'AI/ML',
          targetUsers: 'Developers',
          revenueModel: 'Subscription',
          revenuePotential: JSON.stringify({ realistic: 10000 }),
          developmentTime: '3 months',
          competitionLevel: 'Medium',
          technicalComplexity: 5,
          qualityScore: 8,
          keyFeatures: 'Feature 1, Feature 2',
          tags: 'AI, Web',
          priority: 'high',
          progress: 0,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          owner: { id: '1', name: 'Test User', email: 'test@example.com', avatar: null },
          _count: { comments: 0, activities: 0 }
        }
      ];

      prisma.project.findMany.mockResolvedValue(mockProjects);
      prisma.project.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/projects');
      const response = await GET(request, null);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.total).toBe(1);
    });

    it('should return 400 for invalid pagination parameters', async () => {
      const { validateQuery } = require('@/lib/validations');
      
      validateQuery.mockReturnValue({ 
        data: null,
        error: 'Invalid limit parameter' 
      });

      const request = new NextRequest('http://localhost:3000/api/projects?limit=invalid');
      const response = await GET(request, null);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid pagination');
    });

    it('should handle database errors gracefully', async () => {
      const { validateQuery } = require('@/lib/validations');
      const { projectCache } = require('@/lib/cache');
      const { prisma } = require('@/lib/prisma');

      validateQuery.mockReturnValue({ 
        data: { limit: 10, offset: 0, search: '', category: '', sortBy: 'createdAt', sortOrder: 'desc' },
        error: null 
      });

      projectCache.getProjectList.mockReturnValue(null);
      prisma.project.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/projects');
      const response = await GET(request, null);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch projects');
    });
  });

  describe('POST', () => {
    it('should create a new project with valid data', async () => {
      const { validateRequest } = require('@/lib/validations');
      const { prisma } = require('@/lib/prisma');
      const { projectCache, statsCache } = require('@/lib/cache');

      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
      const mockProjectData = {
        title: 'New Project',
        problem: 'Test problem',
        solution: 'Test solution',
        category: 'AI/ML',
        targetUsers: 'Developers',
        revenueModel: 'Subscription',
        revenuePotential: { realistic: 10000 },
        developmentTime: '3 months',
        competitionLevel: 'Medium',
        technicalComplexity: 5,
        qualityScore: 8,
        keyFeatures: ['Feature 1'],
        tags: ['AI'],
        priority: 'high',
        progress: 0
      };

      validateRequest.mockResolvedValue({ 
        data: mockProjectData,
        error: null 
      });

      const createdProject = { id: '1', ...mockProjectData };
      prisma.project.create.mockResolvedValue(createdProject);

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify(mockProjectData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await POST(request, mockUser);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('1');
      expect(data.title).toBe('New Project');
      expect(projectCache.invalidateProject).toHaveBeenCalledWith('1');
      expect(statsCache.invalidateStats).toHaveBeenCalled();
    });

    it('should return 400 for invalid project data', async () => {
      const { validateRequest } = require('@/lib/validations');
      
      validateRequest.mockResolvedValue({ 
        data: null,
        error: 'Missing required field: title' 
      });

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' }
      });

      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com' };
      const response = await POST(request, mockUser);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid project data');
    });
  });
});