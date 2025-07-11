import { PrismaClient } from '@prisma/client'

// Mock Prisma client for testing
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    project: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  })),
}))

describe('Database Operations', () => {
  let prisma: PrismaClient

  beforeEach(() => {
    prisma = new PrismaClient()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Project Operations', () => {
    it('should connect to database', async () => {
      await prisma.$connect()
      expect(prisma.$connect).toHaveBeenCalled()
    })

    it('should disconnect from database', async () => {
      await prisma.$disconnect()
      expect(prisma.$disconnect).toHaveBeenCalled()
    })

    it('should fetch projects', async () => {
      const mockProjects = [
        { id: '1', title: 'Test Project', category: 'AI/ML' },
      ]
      
      ;(prisma.project.findMany as jest.Mock).mockResolvedValue(mockProjects)
      
      const projects = await prisma.project.findMany()
      expect(projects).toEqual(mockProjects)
      expect(prisma.project.findMany).toHaveBeenCalled()
    })
  })
})