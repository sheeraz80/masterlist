/**
 * @jest-environment node
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db'
    }
  }
});

describe('Database - Projects', () => {
  beforeAll(async () => {
    // Connect to test database
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.project.deleteMany({
      where: {
        title: {
          startsWith: 'Test Project'
        }
      }
    });
  });

  describe('Project Creation', () => {
    it('should create a project with valid data', async () => {
      const projectData = {
        id: 'test-project-1',
        title: 'Test Project 1',
        problem: 'Test problem description',
        solution: 'Test solution description',
        category: 'AI/ML',
        targetUsers: 'Developers',
        revenueModel: 'Subscription',
        revenuePotential: JSON.stringify({ realistic: 10000 }),
        developmentTime: '3 months',
        competitionLevel: 'Medium',
        technicalComplexity: 5.0,
        qualityScore: 8.0,
        keyFeatures: JSON.stringify(['Feature 1', 'Feature 2']),
        tags: JSON.stringify(['AI', 'Web']),
        priority: 'high',
        progress: 0,
        status: 'active'
      };

      const project = await prisma.project.create({
        data: projectData
      });

      expect(project.id).toBe('test-project-1');
      expect(project.title).toBe('Test Project 1');
      expect(project.category).toBe('AI/ML');
      expect(project.technicalComplexity).toBe(5.0);
      expect(project.qualityScore).toBe(8.0);
      expect(project.createdAt).toBeDefined();
      expect(project.updatedAt).toBeDefined();
    });

    it('should fail to create project with duplicate ID', async () => {
      const projectData = {
        id: 'test-project-duplicate',
        title: 'Test Project Duplicate',
        problem: 'Test problem',
        solution: 'Test solution',
        category: 'AI/ML',
        targetUsers: 'Developers',
        revenueModel: 'Subscription',
        revenuePotential: JSON.stringify({ realistic: 10000 }),
        developmentTime: '3 months',
        competitionLevel: 'Medium',
        technicalComplexity: 5.0,
        qualityScore: 8.0,
        keyFeatures: JSON.stringify(['Feature 1']),
        tags: JSON.stringify(['AI']),
        priority: 'high',
        progress: 0,
        status: 'active'
      };

      // First creation should succeed
      await prisma.project.create({ data: projectData });

      // Second creation should fail
      await expect(
        prisma.project.create({ data: projectData })
      ).rejects.toThrow();
    });
  });

  describe('Project Queries', () => {
    beforeEach(async () => {
      // Create test projects
      await prisma.project.createMany({
        data: [
          {
            id: 'test-project-query-1',
            title: 'Test Project Query 1',
            problem: 'Test problem',
            solution: 'Test solution',
            category: 'AI/ML',
            targetUsers: 'Developers',
            revenueModel: 'Subscription',
            revenuePotential: JSON.stringify({ realistic: 10000 }),
            developmentTime: '3 months',
            competitionLevel: 'Medium',
            technicalComplexity: 5.0,
            qualityScore: 8.0,
            keyFeatures: JSON.stringify(['Feature 1']),
            tags: JSON.stringify(['AI']),
            priority: 'high',
            progress: 0,
            status: 'active'
          },
          {
            id: 'test-project-query-2',
            title: 'Test Project Query 2',
            problem: 'Test problem',
            solution: 'Test solution',
            category: 'Web Development',
            targetUsers: 'Users',
            revenueModel: 'One-time',
            revenuePotential: JSON.stringify({ realistic: 5000 }),
            developmentTime: '2 months',
            competitionLevel: 'Low',
            technicalComplexity: 3.0,
            qualityScore: 6.0,
            keyFeatures: JSON.stringify(['Feature 1']),
            tags: JSON.stringify(['Web']),
            priority: 'medium',
            progress: 50,
            status: 'active'
          }
        ]
      });
    });

    it('should find projects by category', async () => {
      const projects = await prisma.project.findMany({
        where: {
          category: 'AI/ML'
        }
      });

      expect(projects.length).toBeGreaterThanOrEqual(1);
      expect(projects.every(p => p.category === 'AI/ML')).toBe(true);
    });

    it('should find projects by quality score range', async () => {
      const projects = await prisma.project.findMany({
        where: {
          qualityScore: {
            gte: 7.0
          }
        }
      });

      expect(projects.length).toBeGreaterThanOrEqual(1);
      expect(projects.every(p => p.qualityScore >= 7.0)).toBe(true);
    });

    it('should order projects by quality score', async () => {
      const projects = await prisma.project.findMany({
        where: {
          title: {
            startsWith: 'Test Project Query'
          }
        },
        orderBy: {
          qualityScore: 'desc'
        }
      });

      expect(projects.length).toBe(2);
      expect(projects[0].qualityScore).toBeGreaterThanOrEqual(projects[1].qualityScore);
    });

    it('should count projects by status', async () => {
      const activeCount = await prisma.project.count({
        where: {
          status: 'active'
        }
      });

      expect(activeCount).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Project Updates', () => {
    let testProject: any;

    beforeEach(async () => {
      testProject = await prisma.project.create({
        data: {
          id: 'test-project-update',
          title: 'Test Project Update',
          problem: 'Test problem',
          solution: 'Test solution',
          category: 'AI/ML',
          targetUsers: 'Developers',
          revenueModel: 'Subscription',
          revenuePotential: JSON.stringify({ realistic: 10000 }),
          developmentTime: '3 months',
          competitionLevel: 'Medium',
          technicalComplexity: 5.0,
          qualityScore: 8.0,
          keyFeatures: JSON.stringify(['Feature 1']),
          tags: JSON.stringify(['AI']),
          priority: 'high',
          progress: 0,
          status: 'active'
        }
      });
    });

    it('should update project progress', async () => {
      const updatedProject = await prisma.project.update({
        where: { id: testProject.id },
        data: { progress: 75 }
      });

      expect(updatedProject.progress).toBe(75);
      expect(updatedProject.updatedAt.getTime()).toBeGreaterThan(testProject.updatedAt.getTime());
    });

    it('should update project status', async () => {
      const updatedProject = await prisma.project.update({
        where: { id: testProject.id },
        data: { status: 'completed' }
      });

      expect(updatedProject.status).toBe('completed');
    });
  });

  describe('Project Deletion', () => {
    it('should soft delete project', async () => {
      const project = await prisma.project.create({
        data: {
          id: 'test-project-delete',
          title: 'Test Project Delete',
          problem: 'Test problem',
          solution: 'Test solution',
          category: 'AI/ML',
          targetUsers: 'Developers',
          revenueModel: 'Subscription',
          revenuePotential: JSON.stringify({ realistic: 10000 }),
          developmentTime: '3 months',
          competitionLevel: 'Medium',
          technicalComplexity: 5.0,
          qualityScore: 8.0,
          keyFeatures: JSON.stringify(['Feature 1']),
          tags: JSON.stringify(['AI']),
          priority: 'high',
          progress: 0,
          status: 'active'
        }
      });

      // Update status to archived instead of hard delete
      const archivedProject = await prisma.project.update({
        where: { id: project.id },
        data: { status: 'archived' }
      });

      expect(archivedProject.status).toBe('archived');

      // Verify project still exists but is archived
      const foundProject = await prisma.project.findUnique({
        where: { id: project.id }
      });

      expect(foundProject).not.toBeNull();
      expect(foundProject?.status).toBe('archived');
    });
  });
});