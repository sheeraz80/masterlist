/**
 * @jest-environment node
 */

import { 
  createGitHubClient,
  getRepository,
  listRepositories,
  createRepository,
  deleteRepository,
  createOrUpdateFile,
  createFiles,
  getRepositoryStats,
  checkRepositoryExists
} from '../github';
import { Octokit } from '@octokit/rest';

// Mock the Octokit client
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    repos: {
      get: jest.fn(),
      listForAuthenticatedUser: jest.fn(),
      createForAuthenticatedUser: jest.fn(),
      delete: jest.fn(),
      createOrUpdateFileContents: jest.fn(),
      listLanguages: jest.fn(),
      listContributors: jest.fn(),
    },
  })),
}));

describe('GitHub Integration Tests', () => {
  let mockOctokit: jest.Mocked<Octokit>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOctokit = new Octokit() as jest.Mocked<Octokit>;
    (Octokit as jest.MockedClass<typeof Octokit>).mockReturnValue(mockOctokit);
  });

  describe('createGitHubClient', () => {
    it('should create client with provided token', () => {
      const token = 'test-token';
      createGitHubClient(token);
      
      expect(Octokit).toHaveBeenCalledWith({
        auth: token,
      });
    });

    it('should create client with environment token if none provided', () => {
      const originalEnv = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = 'env-token';
      
      createGitHubClient();
      
      expect(Octokit).toHaveBeenCalledWith({
        auth: 'env-token',
      });
      
      process.env.GITHUB_TOKEN = originalEnv;
    });

    it('should create client with undefined auth if no token available', () => {
      const originalEnv = process.env.GITHUB_TOKEN;
      delete process.env.GITHUB_TOKEN;
      
      createGitHubClient();
      
      expect(Octokit).toHaveBeenCalledWith({
        auth: undefined,
      });
      
      process.env.GITHUB_TOKEN = originalEnv;
    });
  });

  describe('getRepository', () => {
    it('should fetch repository successfully', async () => {
      const mockRepo = {
        id: 123,
        name: 'test-repo',
        owner: { login: 'test-owner' },
        description: 'Test repository',
        html_url: 'https://github.com/test-owner/test-repo',
      };

      mockOctokit.repos.get.mockResolvedValue({ data: mockRepo } as any);

      const result = await getRepository('test-owner', 'test-repo');

      expect(mockOctokit.repos.get).toHaveBeenCalledWith({
        owner: 'test-owner',
        repo: 'test-repo',
      });
      expect(result).toEqual(mockRepo);
    });

    it('should handle repository not found error', async () => {
      const error = new Error('Not Found');
      (error as any).status = 404;
      
      mockOctokit.repos.get.mockRejectedValue(error);

      await expect(getRepository('test-owner', 'non-existent-repo')).rejects.toThrow('Not Found');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network Error');
      mockOctokit.repos.get.mockRejectedValue(error);

      await expect(getRepository('test-owner', 'test-repo')).rejects.toThrow('Network Error');
    });
  });

  describe('listRepositories', () => {
    it('should list repositories for authenticated user', async () => {
      const mockRepos = [
        { id: 1, name: 'repo1', owner: { login: 'user' } },
        { id: 2, name: 'repo2', owner: { login: 'user' } },
      ];

      mockOctokit.repos.listForAuthenticatedUser.mockResolvedValue({ data: mockRepos } as any);

      const result = await listRepositories();

      expect(mockOctokit.repos.listForAuthenticatedUser).toHaveBeenCalledWith({
        sort: 'updated',
        per_page: 100,
      });
      expect(result).toEqual(mockRepos);
    });

    it('should handle authentication error', async () => {
      const error = new Error('Bad credentials');
      (error as any).status = 401;
      
      mockOctokit.repos.listForAuthenticatedUser.mockRejectedValue(error);

      await expect(listRepositories()).rejects.toThrow('Bad credentials');
    });
  });

  describe('createRepository', () => {
    it('should create repository with all options', async () => {
      const mockRepo = {
        id: 123,
        name: 'new-repo',
        owner: { login: 'user' },
        html_url: 'https://github.com/user/new-repo',
      };

      const options = {
        description: 'A new repository',
        private: true,
        auto_init: true,
        gitignore_template: 'Node',
        license_template: 'MIT',
      };

      mockOctokit.repos.createForAuthenticatedUser.mockResolvedValue({ data: mockRepo } as any);

      const result = await createRepository('new-repo', options);

      expect(mockOctokit.repos.createForAuthenticatedUser).toHaveBeenCalledWith({
        name: 'new-repo',
        description: 'A new repository',
        private: true,
        auto_init: true,
        gitignore_template: 'Node',
        license_template: 'MIT',
      });
      expect(result).toEqual(mockRepo);
    });

    it('should create repository with minimal options', async () => {
      const mockRepo = {
        id: 123,
        name: 'simple-repo',
        owner: { login: 'user' },
      };

      mockOctokit.repos.createForAuthenticatedUser.mockResolvedValue({ data: mockRepo } as any);

      const result = await createRepository('simple-repo', {});

      expect(mockOctokit.repos.createForAuthenticatedUser).toHaveBeenCalledWith({
        name: 'simple-repo',
        description: undefined,
        private: undefined,
        auto_init: undefined,
        gitignore_template: undefined,
        license_template: undefined,
      });
      expect(result).toEqual(mockRepo);
    });

    it('should handle repository name conflicts', async () => {
      const error = new Error('Repository creation failed');
      (error as any).status = 422;
      
      mockOctokit.repos.createForAuthenticatedUser.mockRejectedValue(error);

      await expect(createRepository('existing-repo', {})).rejects.toThrow('Repository creation failed');
    });
  });

  describe('deleteRepository', () => {
    it('should delete repository successfully', async () => {
      mockOctokit.repos.delete.mockResolvedValue({} as any);

      const result = await deleteRepository('user', 'repo-to-delete');

      expect(mockOctokit.repos.delete).toHaveBeenCalledWith({
        owner: 'user',
        repo: 'repo-to-delete',
      });
      expect(result).toBe(true);
    });

    it('should handle repository not found for deletion', async () => {
      const error = new Error('Not Found');
      (error as any).status = 404;
      
      mockOctokit.repos.delete.mockRejectedValue(error);

      await expect(deleteRepository('user', 'non-existent-repo')).rejects.toThrow('Not Found');
    });

    it('should handle insufficient permissions', async () => {
      const error = new Error('Forbidden');
      (error as any).status = 403;
      
      mockOctokit.repos.delete.mockRejectedValue(error);

      await expect(deleteRepository('user', 'protected-repo')).rejects.toThrow('Forbidden');
    });
  });

  describe('createOrUpdateFile', () => {
    it('should create new file successfully', async () => {
      const mockResponse = {
        content: { name: 'test.txt', path: 'test.txt', sha: 'abc123' },
        commit: { sha: 'def456', message: 'Add test.txt' },
      };

      mockOctokit.repos.createOrUpdateFileContents.mockResolvedValue({ data: mockResponse } as any);

      const result = await createOrUpdateFile(
        'user',
        'repo',
        'test.txt',
        'Hello World',
        'Add test.txt'
      );

      expect(mockOctokit.repos.createOrUpdateFileContents).toHaveBeenCalledWith({
        owner: 'user',
        repo: 'repo',
        path: 'test.txt',
        message: 'Add test.txt',
        content: Buffer.from('Hello World').toString('base64'),
        branch: undefined,
        sha: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should update existing file with SHA', async () => {
      const mockResponse = {
        content: { name: 'test.txt', path: 'test.txt', sha: 'xyz789' },
        commit: { sha: 'uvw012', message: 'Update test.txt' },
      };

      mockOctokit.repos.createOrUpdateFileContents.mockResolvedValue({ data: mockResponse } as any);

      const result = await createOrUpdateFile(
        'user',
        'repo',
        'test.txt',
        'Updated content',
        'Update test.txt',
        { branch: 'main', sha: 'abc123' }
      );

      expect(mockOctokit.repos.createOrUpdateFileContents).toHaveBeenCalledWith({
        owner: 'user',
        repo: 'repo',
        path: 'test.txt',
        message: 'Update test.txt',
        content: Buffer.from('Updated content').toString('base64'),
        branch: 'main',
        sha: 'abc123',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle file creation errors', async () => {
      const error = new Error('Conflict');
      (error as any).status = 409;
      
      mockOctokit.repos.createOrUpdateFileContents.mockRejectedValue(error);

      await expect(createOrUpdateFile(
        'user',
        'repo',
        'test.txt',
        'Content',
        'Message'
      )).rejects.toThrow('Conflict');
    });
  });

  describe('createFiles', () => {
    it('should create multiple files successfully', async () => {
      const mockResponse = {
        content: { name: 'file.txt', path: 'file.txt', sha: 'abc123' },
        commit: { sha: 'def456', message: 'Add file.txt' },
      };

      mockOctokit.repos.createOrUpdateFileContents.mockResolvedValue({ data: mockResponse } as any);

      const files = {
        'file1.txt': 'Content 1',
        'file2.txt': 'Content 2',
      };

      const results = await createFiles('user', 'repo', files);

      expect(mockOctokit.repos.createOrUpdateFileContents).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        path: 'file1.txt',
        success: true,
        result: mockResponse,
      });
      expect(results[1]).toEqual({
        path: 'file2.txt',
        success: true,
        result: mockResponse,
      });
    });

    it('should handle partial failures', async () => {
      const mockResponse = {
        content: { name: 'file.txt', path: 'file.txt', sha: 'abc123' },
        commit: { sha: 'def456', message: 'Add file.txt' },
      };

      mockOctokit.repos.createOrUpdateFileContents
        .mockResolvedValueOnce({ data: mockResponse } as any)
        .mockRejectedValueOnce(new Error('Failed to create file'));

      const files = {
        'success.txt': 'Content 1',
        'failure.txt': 'Content 2',
      };

      const results = await createFiles('user', 'repo', files);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeInstanceOf(Error);
    });
  });

  describe('getRepositoryStats', () => {
    it('should fetch repository statistics', async () => {
      const mockRepo = { id: 123, name: 'repo', stargazers_count: 10 };
      const mockLanguages = { JavaScript: 12345, TypeScript: 6789 };
      const mockContributors = [
        { login: 'user1', contributions: 50 },
        { login: 'user2', contributions: 30 },
      ];

      mockOctokit.repos.get.mockResolvedValue({ data: mockRepo } as any);
      mockOctokit.repos.listLanguages.mockResolvedValue({ data: mockLanguages } as any);
      mockOctokit.repos.listContributors.mockResolvedValue({ data: mockContributors } as any);

      const result = await getRepositoryStats('user', 'repo');

      expect(mockOctokit.repos.get).toHaveBeenCalledWith({ owner: 'user', repo: 'repo' });
      expect(mockOctokit.repos.listLanguages).toHaveBeenCalledWith({ owner: 'user', repo: 'repo' });
      expect(mockOctokit.repos.listContributors).toHaveBeenCalledWith({ 
        owner: 'user', 
        repo: 'repo',
        per_page: 10
      });

      expect(result).toEqual({
        repository: mockRepo,
        languages: mockLanguages,
        contributors: mockContributors,
      });
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      mockOctokit.repos.get.mockRejectedValue(error);

      await expect(getRepositoryStats('user', 'repo')).rejects.toThrow('API Error');
    });
  });

  describe('checkRepositoryExists', () => {
    it('should return true for existing repository', async () => {
      const mockRepo = { id: 123, name: 'repo' };
      mockOctokit.repos.get.mockResolvedValue({ data: mockRepo } as any);

      const result = await checkRepositoryExists('user', 'repo');

      expect(mockOctokit.repos.get).toHaveBeenCalledWith({ owner: 'user', repo: 'repo' });
      expect(result).toBe(true);
    });

    it('should return false for non-existent repository', async () => {
      const error = new Error('Not Found');
      (error as any).status = 404;
      mockOctokit.repos.get.mockRejectedValue(error);

      const result = await checkRepositoryExists('user', 'non-existent-repo');

      expect(result).toBe(false);
    });

    it('should throw for non-404 errors', async () => {
      const error = new Error('Server Error');
      (error as any).status = 500;
      mockOctokit.repos.get.mockRejectedValue(error);

      await expect(checkRepositoryExists('user', 'repo')).rejects.toThrow('Server Error');
    });
  });

  describe('Integration Error Handling', () => {
    it('should handle rate limiting', async () => {
      const error = new Error('API rate limit exceeded');
      (error as any).status = 403;
      (error as any).headers = { 'x-ratelimit-remaining': '0' };
      
      mockOctokit.repos.get.mockRejectedValue(error);

      await expect(getRepository('user', 'repo')).rejects.toThrow('API rate limit exceeded');
    });

    it('should handle authentication errors consistently', async () => {
      const error = new Error('Bad credentials');
      (error as any).status = 401;
      
      mockOctokit.repos.listForAuthenticatedUser.mockRejectedValue(error);

      await expect(listRepositories()).rejects.toThrow('Bad credentials');
    });

    it('should handle network timeouts', async () => {
      const error = new Error('timeout of 5000ms exceeded');
      (error as any).code = 'ECONNABORTED';
      
      mockOctokit.repos.get.mockRejectedValue(error);

      await expect(getRepository('user', 'repo')).rejects.toThrow('timeout of 5000ms exceeded');
    });
  });

  describe('Token Management', () => {
    it('should use provided token over environment variable', () => {
      const originalEnv = process.env.GITHUB_TOKEN;
      process.env.GITHUB_TOKEN = 'env-token';
      
      createGitHubClient('explicit-token');
      
      expect(Octokit).toHaveBeenCalledWith({
        auth: 'explicit-token',
      });
      
      process.env.GITHUB_TOKEN = originalEnv;
    });

    it('should pass token through all API calls', async () => {
      const mockRepo = { id: 123, name: 'repo' };
      mockOctokit.repos.get.mockResolvedValue({ data: mockRepo } as any);

      await getRepository('user', 'repo', 'custom-token');

      expect(Octokit).toHaveBeenCalledWith({
        auth: 'custom-token',
      });
    });
  });
});