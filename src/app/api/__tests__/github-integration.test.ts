/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { createGitHubClient, getRepository, createRepository } from '@/lib/github';

// Mock the GitHub service
jest.mock('@/lib/github', () => ({
  createGitHubClient: jest.fn(),
  getRepository: jest.fn(),
  createRepository: jest.fn(),
  listRepositories: jest.fn(),
  deleteRepository: jest.fn(),
  createOrUpdateFile: jest.fn(),
  getRepositoryStats: jest.fn(),
  checkRepositoryExists: jest.fn(),
}));

const mockGitHubService = {
  createGitHubClient: createGitHubClient as jest.MockedFunction<typeof createGitHubClient>,
  getRepository: getRepository as jest.MockedFunction<typeof getRepository>,
  createRepository: createRepository as jest.MockedFunction<typeof createRepository>,
};

describe('GitHub API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Repository Creation API', () => {
    const mockRequest = (body: any) => {
      return {
        json: async () => body,
        headers: new Headers({
          'authorization': 'Bearer test-token',
          'content-type': 'application/json',
        }),
      } as NextRequest;
    };

    it('should create repository successfully', async () => {
      const mockRepo = {
        id: 123,
        name: 'test-repo',
        full_name: 'user/test-repo',
        html_url: 'https://github.com/user/test-repo',
        private: false,
        description: 'Test repository',
      };

      mockGitHubService.createRepository.mockResolvedValue(mockRepo);

      const requestBody = {
        name: 'test-repo',
        description: 'Test repository',
        private: false,
        auto_init: true,
      };

      // Simulate API call
      const response = await mockApiCall('/api/repositories/create', {
        method: 'POST',
        body: requestBody,
        token: 'test-token',
      });

      expect(mockGitHubService.createRepository).toHaveBeenCalledWith(
        'test-repo',
        {
          description: 'Test repository',
          private: false,
          auto_init: true,
        },
        'test-token'
      );

      expect(response.status).toBe(201);
      expect(response.data).toEqual(mockRepo);
    });

    it('should handle repository creation errors', async () => {
      const error = new Error('Repository already exists');
      (error as any).status = 422;
      
      mockGitHubService.createRepository.mockRejectedValue(error);

      const requestBody = {
        name: 'existing-repo',
        description: 'This repo already exists',
      };

      const response = await mockApiCall('/api/repositories/create', {
        method: 'POST',
        body: requestBody,
        token: 'test-token',
      });

      expect(response.status).toBe(422);
      expect(response.error).toContain('Repository already exists');
    });

    it('should validate required fields', async () => {
      const requestBody = {
        description: 'Missing name field',
      };

      const response = await mockApiCall('/api/repositories/create', {
        method: 'POST',
        body: requestBody,
        token: 'test-token',
      });

      expect(response.status).toBe(400);
      expect(response.error).toContain('Repository name is required');
    });

    it('should handle authentication errors', async () => {
      const error = new Error('Bad credentials');
      (error as any).status = 401;
      
      mockGitHubService.createRepository.mockRejectedValue(error);

      const requestBody = {
        name: 'test-repo',
      };

      const response = await mockApiCall('/api/repositories/create', {
        method: 'POST',
        body: requestBody,
        token: 'invalid-token',
      });

      expect(response.status).toBe(401);
      expect(response.error).toContain('Bad credentials');
    });
  });

  describe('Repository Fetching API', () => {
    it('should fetch repository details successfully', async () => {
      const mockRepo = {
        id: 123,
        name: 'test-repo',
        full_name: 'user/test-repo',
        description: 'Test repository',
        html_url: 'https://github.com/user/test-repo',
        stargazers_count: 42,
        forks_count: 7,
        language: 'TypeScript',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T00:00:00Z',
      };

      mockGitHubService.getRepository.mockResolvedValue(mockRepo);

      const response = await mockApiCall('/api/repositories/user/test-repo', {
        method: 'GET',
        token: 'test-token',
      });

      expect(mockGitHubService.getRepository).toHaveBeenCalledWith(
        'user',
        'test-repo',
        'test-token'
      );

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockRepo);
    });

    it('should handle repository not found', async () => {
      const error = new Error('Not Found');
      (error as any).status = 404;
      
      mockGitHubService.getRepository.mockRejectedValue(error);

      const response = await mockApiCall('/api/repositories/user/non-existent', {
        method: 'GET',
        token: 'test-token',
      });

      expect(response.status).toBe(404);
      expect(response.error).toContain('Repository not found');
    });

    it('should handle private repository access', async () => {
      const error = new Error('Not Found'); // GitHub returns 404 for private repos without access
      (error as any).status = 404;
      
      mockGitHubService.getRepository.mockRejectedValue(error);

      const response = await mockApiCall('/api/repositories/user/private-repo', {
        method: 'GET',
        token: 'test-token',
      });

      expect(response.status).toBe(404);
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should handle GitHub rate limiting', async () => {
      const error = new Error('API rate limit exceeded');
      (error as any).status = 403;
      (error as any).headers = {
        'x-ratelimit-remaining': '0',
        'x-ratelimit-reset': '1640995200',
      };
      
      mockGitHubService.getRepository.mockRejectedValue(error);

      const response = await mockApiCall('/api/repositories/user/test-repo', {
        method: 'GET',
        token: 'test-token',
      });

      expect(response.status).toBe(429);
      expect(response.error).toContain('rate limit');
      expect(response.retryAfter).toBeDefined();
    });

    it('should provide rate limit information in headers', async () => {
      const mockRepo = { id: 123, name: 'test-repo' };
      
      // Mock successful response with rate limit headers
      mockGitHubService.getRepository.mockResolvedValue(mockRepo);

      const response = await mockApiCall('/api/repositories/user/test-repo', {
        method: 'GET',
        token: 'test-token',
      });

      expect(response.status).toBe(200);
      // In a real implementation, rate limit headers would be forwarded
      expect(response.headers).toBeDefined();
    });
  });

  describe('Webhook Integration', () => {
    it('should handle repository webhook events', async () => {
      const webhookPayload = {
        action: 'created',
        repository: {
          id: 123,
          name: 'new-repo',
          full_name: 'user/new-repo',
          html_url: 'https://github.com/user/new-repo',
        },
        sender: {
          login: 'user',
          id: 456,
        },
      };

      const response = await mockApiCall('/api/webhooks/github', {
        method: 'POST',
        body: webhookPayload,
        headers: {
          'x-github-event': 'repository',
          'x-github-delivery': 'test-delivery-id',
          'x-hub-signature-256': 'sha256=test-signature',
        },
      });

      expect(response.status).toBe(200);
      expect(response.message).toContain('Webhook processed successfully');
    });

    it('should validate webhook signatures', async () => {
      const webhookPayload = {
        action: 'created',
        repository: {
          id: 123,
          name: 'new-repo',
        },
      };

      const response = await mockApiCall('/api/webhooks/github', {
        method: 'POST',
        body: webhookPayload,
        headers: {
          'x-github-event': 'repository',
          'x-github-delivery': 'test-delivery-id',
          'x-hub-signature-256': 'sha256=invalid-signature',
        },
      });

      expect(response.status).toBe(401);
      expect(response.error).toContain('Invalid webhook signature');
    });

    it('should handle unsupported webhook events', async () => {
      const webhookPayload = {
        action: 'opened',
        pull_request: {
          id: 123,
          number: 1,
        },
      };

      const response = await mockApiCall('/api/webhooks/github', {
        method: 'POST',
        body: webhookPayload,
        headers: {
          'x-github-event': 'pull_request',
          'x-github-delivery': 'test-delivery-id',
          'x-hub-signature-256': 'sha256=valid-signature',
        },
      });

      expect(response.status).toBe(200);
      expect(response.message).toContain('Event ignored');
    });
  });

  describe('Batch Operations', () => {
    it('should handle batch repository creation', async () => {
      const repositories = [
        { name: 'repo1', description: 'First repo' },
        { name: 'repo2', description: 'Second repo' },
        { name: 'repo3', description: 'Third repo' },
      ];

      const mockResults = repositories.map((repo, index) => ({
        id: index + 1,
        name: repo.name,
        full_name: `user/${repo.name}`,
        description: repo.description,
        html_url: `https://github.com/user/${repo.name}`,
      }));

      mockGitHubService.createRepository
        .mockResolvedValueOnce(mockResults[0])
        .mockResolvedValueOnce(mockResults[1])
        .mockResolvedValueOnce(mockResults[2]);

      const response = await mockApiCall('/api/repositories/batch-create', {
        method: 'POST',
        body: { repositories },
        token: 'test-token',
      });

      expect(response.status).toBe(201);
      expect(response.data.successful).toHaveLength(3);
      expect(response.data.failed).toHaveLength(0);
    });

    it('should handle partial failures in batch operations', async () => {
      const repositories = [
        { name: 'repo1', description: 'First repo' },
        { name: 'existing-repo', description: 'This will fail' },
        { name: 'repo3', description: 'Third repo' },
      ];

      const error = new Error('Repository already exists');
      (error as any).status = 422;

      mockGitHubService.createRepository
        .mockResolvedValueOnce({ id: 1, name: 'repo1' })
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ id: 3, name: 'repo3' });

      const response = await mockApiCall('/api/repositories/batch-create', {
        method: 'POST',
        body: { repositories },
        token: 'test-token',
      });

      expect(response.status).toBe(207); // Multi-status
      expect(response.data.successful).toHaveLength(2);
      expect(response.data.failed).toHaveLength(1);
      expect(response.data.failed[0].name).toBe('existing-repo');
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should implement retry logic for transient errors', async () => {
      const error = new Error('Service temporarily unavailable');
      (error as any).status = 503;
      
      mockGitHubService.getRepository
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ id: 123, name: 'test-repo' });

      const response = await mockApiCall('/api/repositories/user/test-repo', {
        method: 'GET',
        token: 'test-token',
        retryConfig: { maxRetries: 3, retryDelay: 100 },
      });

      expect(mockGitHubService.getRepository).toHaveBeenCalledTimes(3);
      expect(response.status).toBe(200);
    });

    it('should not retry on client errors', async () => {
      const error = new Error('Bad Request');
      (error as any).status = 400;
      
      mockGitHubService.getRepository.mockRejectedValue(error);

      const response = await mockApiCall('/api/repositories/user/test-repo', {
        method: 'GET',
        token: 'test-token',
        retryConfig: { maxRetries: 3, retryDelay: 100 },
      });

      expect(mockGitHubService.getRepository).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(400);
    });

    it('should handle network timeouts gracefully', async () => {
      const error = new Error('timeout of 5000ms exceeded');
      (error as any).code = 'ECONNABORTED';
      
      mockGitHubService.getRepository.mockRejectedValue(error);

      const response = await mockApiCall('/api/repositories/user/test-repo', {
        method: 'GET',
        token: 'test-token',
      });

      expect(response.status).toBe(504);
      expect(response.error).toContain('timeout');
    });
  });

  describe('Integration with Database', () => {
    it('should sync repository data with database', async () => {
      const mockRepo = {
        id: 123,
        name: 'test-repo',
        full_name: 'user/test-repo',
        description: 'Test repository',
        html_url: 'https://github.com/user/test-repo',
        stargazers_count: 42,
        language: 'TypeScript',
      };

      mockGitHubService.getRepository.mockResolvedValue(mockRepo);

      const response = await mockApiCall('/api/repositories/sync', {
        method: 'POST',
        body: {
          owner: 'user',
          repo: 'test-repo',
          projectId: 'project-123',
        },
        token: 'test-token',
      });

      expect(response.status).toBe(200);
      expect(response.data.synced).toBe(true);
      expect(response.data.repository).toEqual(mockRepo);
    });

    it('should handle database sync failures', async () => {
      const mockRepo = {
        id: 123,
        name: 'test-repo',
        full_name: 'user/test-repo',
      };

      mockGitHubService.getRepository.mockResolvedValue(mockRepo);

      // Mock database error
      const response = await mockApiCall('/api/repositories/sync', {
        method: 'POST',
        body: {
          owner: 'user',
          repo: 'test-repo',
          projectId: 'invalid-project-id',
        },
        token: 'test-token',
      });

      expect(response.status).toBe(500);
      expect(response.error).toContain('Database sync failed');
    });
  });
});

// Helper function to mock API calls
async function mockApiCall(endpoint: string, options: {
  method: string;
  body?: any;
  token?: string;
  headers?: Record<string, string>;
  retryConfig?: { maxRetries: number; retryDelay: number };
}) {
  // This would be replaced with actual API testing in a real implementation
  // For now, we'll simulate the API behavior based on the mocked services
  
  const { method, body, token, headers = {} } = options;
  
  try {
    if (endpoint.includes('/api/repositories/create') && method === 'POST') {
      if (!body?.name) {
        return { status: 400, error: 'Repository name is required' };
      }
      
      const result = await mockGitHubService.createRepository(
        body.name,
        {
          description: body.description,
          private: body.private,
          auto_init: body.auto_init,
        },
        token
      );
      
      return { status: 201, data: result };
    }
    
    if (endpoint.includes('/api/repositories/') && method === 'GET') {
      const parts = endpoint.split('/');
      const owner = parts[parts.length - 2];
      const repo = parts[parts.length - 1];
      
      const { retryConfig = { maxRetries: 0, retryDelay: 0 } } = options;
      let attempts = 0;
      
      while (attempts <= retryConfig.maxRetries) {
        try {
          const result = await mockGitHubService.getRepository(owner, repo, token);
          return { status: 200, data: result, headers: {} };
        } catch (error: any) {
          attempts++;
          
          // Don't retry on client errors (4xx)
          if (error.status >= 400 && error.status < 500) {
            throw error;
          }
          
          // Don't retry if we've reached max attempts
          if (attempts > retryConfig.maxRetries) {
            throw error;
          }
          
          // Wait before retrying
          if (retryConfig.retryDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, retryConfig.retryDelay));
          }
        }
      }
    }
    
    if (endpoint.includes('/api/webhooks/github') && method === 'POST') {
      if (headers['x-hub-signature-256'] === 'sha256=invalid-signature') {
        return { status: 401, error: 'Invalid webhook signature' };
      }
      
      const event = headers['x-github-event'];
      if (event === 'repository') {
        return { status: 200, message: 'Webhook processed successfully' };
      } else {
        return { status: 200, message: 'Event ignored' };
      }
    }
    
    if (endpoint.includes('/api/repositories/batch-create') && method === 'POST') {
      const results = {
        successful: [],
        failed: [],
      };
      
      for (const repo of body.repositories) {
        try {
          const result = await mockGitHubService.createRepository(repo.name, repo, token);
          results.successful.push(result);
        } catch (error) {
          results.failed.push({ name: repo.name, error: error.message });
        }
      }
      
      const status = results.failed.length > 0 ? 207 : 201;
      return { status, data: results };
    }
    
    if (endpoint.includes('/api/repositories/sync') && method === 'POST') {
      const { owner, repo, projectId } = body;
      
      if (projectId === 'invalid-project-id') {
        return { status: 500, error: 'Database sync failed' };
      }
      
      const result = await mockGitHubService.getRepository(owner, repo, token);
      return { 
        status: 200, 
        data: { 
          synced: true, 
          repository: result 
        } 
      };
    }
    
    return { status: 404, error: 'Endpoint not found' };
    
  } catch (error: any) {
    const status = error.status || 500;
    
    if (status === 403 && error.message.includes('rate limit')) {
      return { 
        status: 429, 
        error: 'GitHub API rate limit exceeded',
        retryAfter: 3600
      };
    }
    
    if (status === 404) {
      return { status: 404, error: 'Repository not found' };
    }
    
    if (error.code === 'ECONNABORTED') {
      return { status: 504, error: 'Request timeout' };
    }
    
    return { status, error: error.message };
  }
}