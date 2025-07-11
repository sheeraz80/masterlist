/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, HEAD } from '../health/route';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return healthy status when database is working', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.$queryRaw.mockResolvedValue([{ '1': 1 }]);

      const request = new NextRequest('http://localhost:3000/api/health');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.checks.database.status).toBe('healthy');
      expect(data.timestamp).toBeDefined();
      expect(data.version).toBeDefined();
    });

    it('should return unhealthy status when database fails', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.$queryRaw.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/health');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy');
      expect(data.checks.database.status).toBe('unhealthy');
      expect(data.checks.database.message).toBe('Database connection failed');
    });

    it('should include proper cache headers', async () => {
      const { prisma } = require('@/lib/prisma');
      prisma.$queryRaw.mockResolvedValue([{ '1': 1 }]);

      const request = new NextRequest('http://localhost:3000/api/health');
      const response = await GET(request);

      expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('HEAD', () => {
    it('should return 200 for liveness probe', async () => {
      const request = new NextRequest('http://localhost:3000/api/health');
      const response = await HEAD(request);

      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });
  });
});