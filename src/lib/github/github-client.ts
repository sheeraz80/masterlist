import { Octokit } from '@octokit/rest';
import type { 
  GitHubRepository, 
  GitHubCommit, 
  GitHubBranch,
  CreateRepositoryOptions 
} from '@/types/repository';

// GitHub API configuration
const GITHUB_CONFIG = {
  baseUrl: 'https://api.github.com',
  userAgent: 'masterlist-app',
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000
};

export class GitHubClient {
  private octokit: Octokit;
  private organizationName: string;

  constructor(accessToken: string, organizationName: string) {
    this.octokit = new Octokit({
      auth: accessToken,
      baseUrl: GITHUB_CONFIG.baseUrl,
      userAgent: GITHUB_CONFIG.userAgent,
      request: {
        timeout: GITHUB_CONFIG.timeout
      }
    });
    this.organizationName = organizationName;
  }

  // Repository Management
  async createRepository(options: CreateRepositoryOptions): Promise<GitHubRepository> {
    try {
      const response = await this.octokit.repos.createInOrg({
        org: this.organizationName,
        name: options.repoName || `project-${options.projectId}`,
        description: options.description || 'Masterlist project repository',
        private: options.isPrivate ?? true,
        has_issues: true,
        has_projects: true,
        has_wiki: false,
        auto_init: true,
        gitignore_template: options.includeGitignore ? this.getGitignoreTemplate(options) : undefined,
        license_template: options.includeLicense ? (options.licenseType || 'mit') : undefined
      });

      return this.mapGitHubRepository(response.data);
    } catch (error) {
      throw new Error(`Failed to create repository: ${error.message}`);
    }
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const response = await this.octokit.repos.get({
        owner,
        repo
      });

      return this.mapGitHubRepository(response.data);
    } catch (error) {
      throw new Error(`Failed to get repository: ${error.message}`);
    }
  }

  async listOrganizationRepositories(): Promise<GitHubRepository[]> {
    try {
      const repositories = await this.octokit.paginate(
        this.octokit.repos.listForOrg,
        {
          org: this.organizationName,
          type: 'all',
          sort: 'created',
          direction: 'desc',
          per_page: 100
        }
      );

      return repositories.map(repo => this.mapGitHubRepository(repo));
    } catch (error) {
      throw new Error(`Failed to list repositories: ${error.message}`);
    }
  }

  async deleteRepository(owner: string, repo: string): Promise<void> {
    try {
      await this.octokit.repos.delete({
        owner,
        repo
      });
    } catch (error) {
      throw new Error(`Failed to delete repository: ${error.message}`);
    }
  }

  async archiveRepository(owner: string, repo: string): Promise<void> {
    try {
      await this.octokit.repos.update({
        owner,
        repo,
        archived: true
      });
    } catch (error) {
      throw new Error(`Failed to archive repository: ${error.message}`);
    }
  }

  // Branch Management
  async getBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    try {
      const response = await this.octokit.repos.listBranches({
        owner,
        repo
      });

      return response.data.map(branch => ({
        name: branch.name,
        commit: {
          sha: branch.commit.sha
        },
        protected: branch.protected
      }));
    } catch (error) {
      throw new Error(`Failed to get branches: ${error.message}`);
    }
  }

  async createBranch(owner: string, repo: string, branchName: string, fromBranch: string = 'main'): Promise<void> {
    try {
      // Get the SHA of the source branch
      const refResponse = await this.octokit.git.getRef({
        owner,
        repo,
        ref: `heads/${fromBranch}`
      });

      // Create new branch
      await this.octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: refResponse.data.object.sha
      });
    } catch (error) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }

  // Commit Management
  async getCommits(owner: string, repo: string, branch?: string, limit: number = 10): Promise<GitHubCommit[]> {
    try {
      const response = await this.octokit.repos.listCommits({
        owner,
        repo,
        sha: branch,
        per_page: limit
      });

      return response.data.map(commit => ({
        sha: commit.sha,
        commit: {
          message: commit.commit.message,
          author: {
            name: commit.commit.author?.name || 'Unknown',
            email: commit.commit.author?.email || 'unknown@example.com',
            date: commit.commit.author?.date || new Date().toISOString()
          }
        },
        author: commit.author ? {
          login: commit.author.login,
          avatar_url: commit.author.avatar_url
        } : null
      }));
    } catch (error) {
      throw new Error(`Failed to get commits: ${error.message}`);
    }
  }

  async getLatestCommit(owner: string, repo: string, branch: string = 'main'): Promise<GitHubCommit | null> {
    try {
      const commits = await this.getCommits(owner, repo, branch, 1);
      return commits.length > 0 ? commits[0] : null;
    } catch (error) {
      console.error(`Failed to get latest commit: ${error.message}`);
      return null;
    }
  }

  // File Management
  async getFileContent(owner: string, repo: string, path: string, branch?: string): Promise<string> {
    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch
      });

      if ('content' in response.data) {
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
      }
      throw new Error('File not found or is a directory');
    } catch (error) {
      throw new Error(`Failed to get file content: ${error.message}`);
    }
  }

  async createOrUpdateFile(
    owner: string, 
    repo: string, 
    path: string, 
    content: string, 
    message: string,
    branch?: string
  ): Promise<void> {
    try {
      // Check if file exists
      let sha: string | undefined;
      try {
        const existing = await this.octokit.repos.getContent({
          owner,
          repo,
          path,
          ref: branch
        });
        if ('sha' in existing.data) {
          sha = existing.data.sha;
        }
      } catch (error) {
        // File doesn't exist, which is fine for creation
      }

      await this.octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        sha,
        branch
      });
    } catch (error) {
      throw new Error(`Failed to create/update file: ${error.message}`);
    }
  }

  // Template Repository Creation
  async createFromTemplate(
    templateOwner: string,
    templateRepo: string,
    newRepoName: string,
    description?: string
  ): Promise<GitHubRepository> {
    try {
      const response = await this.octokit.repos.createUsingTemplate({
        template_owner: templateOwner,
        template_repo: templateRepo,
        owner: this.organizationName,
        name: newRepoName,
        description,
        private: true,
        include_all_branches: false
      });

      return this.mapGitHubRepository(response.data);
    } catch (error) {
      throw new Error(`Failed to create repository from template: ${error.message}`);
    }
  }

  // Webhook Management
  async createWebhook(
    owner: string,
    repo: string,
    webhookUrl: string,
    secret: string,
    events: string[] = ['push', 'pull_request']
  ): Promise<string> {
    try {
      const response = await this.octokit.repos.createWebhook({
        owner,
        repo,
        config: {
          url: webhookUrl,
          content_type: 'json',
          secret,
          insecure_ssl: '0'
        },
        events,
        active: true
      });

      return response.data.id.toString();
    } catch (error) {
      throw new Error(`Failed to create webhook: ${error.message}`);
    }
  }

  async deleteWebhook(owner: string, repo: string, webhookId: string): Promise<void> {
    try {
      await this.octokit.repos.deleteWebhook({
        owner,
        repo,
        hook_id: parseInt(webhookId)
      });
    } catch (error) {
      throw new Error(`Failed to delete webhook: ${error.message}`);
    }
  }

  // Statistics and Analysis
  async getRepositoryStats(owner: string, repo: string) {
    try {
      const [languages, contributors, stats] = await Promise.allSettled([
        this.octokit.repos.listLanguages({ owner, repo }),
        this.octokit.repos.listContributors({ owner, repo }),
        this.octokit.repos.getCodeFrequency({ owner, repo })
      ]);

      return {
        languages: languages.status === 'fulfilled' ? languages.value.data : {},
        contributors: contributors.status === 'fulfilled' ? contributors.value.data.length : 0,
        codeFrequency: stats.status === 'fulfilled' ? stats.value.data : []
      };
    } catch (error) {
      console.error(`Failed to get repository stats: ${error.message}`);
      return {
        languages: {},
        contributors: 0,
        codeFrequency: []
      };
    }
  }

  // Helper methods
  private mapGitHubRepository(repo: any): GitHubRepository {
    return {
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
      default_branch: repo.default_branch,
      private: repo.private,
      language: repo.language,
      size: repo.size,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      stargazers_count: repo.stargazers_count,
      watchers_count: repo.watchers_count,
      forks_count: repo.forks_count,
      open_issues_count: repo.open_issues_count
    };
  }

  private getGitignoreTemplate(options: CreateRepositoryOptions): string | undefined {
    // Determine gitignore template based on project category or tech stack
    const category = options.projectId; // We'll need to look this up
    
    // Default templates based on common project types
    const templates = {
      'node': 'Node',
      'react': 'Node',
      'vue': 'Node',
      'angular': 'Node',
      'python': 'Python',
      'django': 'Python',
      'fastapi': 'Python',
      'chrome-extension': 'Node',
      'vscode-extension': 'Node'
    };

    return templates['node']; // Default to Node for now
  }

  // Rate limiting helpers
  async getRateLimit() {
    try {
      const response = await this.octokit.rateLimit.get();
      return response.data;
    } catch (error) {
      console.error('Failed to get rate limit:', error);
      return null;
    }
  }

  async waitForRateLimit() {
    const rateLimit = await this.getRateLimit();
    if (rateLimit && rateLimit.rate.remaining === 0) {
      const resetTime = new Date(rateLimit.rate.reset * 1000);
      const waitTime = resetTime.getTime() - Date.now();
      if (waitTime > 0) {
        console.log(`Rate limit exceeded. Waiting ${waitTime}ms until reset.`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
}