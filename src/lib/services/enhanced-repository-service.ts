import { prisma } from '@/lib/prisma';
import { createGitHubClient, createRepository as createGitHubRepo } from '@/lib/github';
import { logError } from '@/lib/logger';
import type { Repository } from '@/types/repository';
import type { Project } from '@/types';

export interface GitHubConfiguration {
  isConfigured: boolean;
  hasToken: boolean;
  hasOrgName: boolean;
  organizationName?: string;
  tokenStatus: 'valid' | 'invalid' | 'missing' | 'unknown';
  errorMessage?: string;
}

export interface RepositoryCreationOptions {
  useGitHub: boolean;
  fallbackToLocal: boolean;
  repositoryName?: string;
  templateName?: string;
  description?: string;
  isPrivate?: boolean;
  includeLicense?: boolean;
  includeReadme?: boolean;
  includeGitignore?: boolean;
}

export interface RepositoryCreationResult {
  success: boolean;
  repository?: Repository;
  githubRepository?: any;
  error?: string;
  warnings?: string[];
  mode: 'github' | 'local' | 'failed';
  githubUrl?: string;
}

export class EnhancedRepositoryService {
  private gitHubConfig: GitHubConfiguration;

  constructor() {
    this.gitHubConfig = this.validateGitHubConfiguration();
  }

  // Check GitHub configuration and token validity
  private validateGitHubConfiguration(): GitHubConfiguration {
    const token = process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN;
    // Use GITHUB_PROJECTS_ORG for project repositories, default to corevecta-projects
    const orgName = process.env.GITHUB_PROJECTS_ORG || process.env.GITHUB_ORG_NAME || process.env.GITHUB_ORGANIZATION || 'corevecta-projects';

    const config: GitHubConfiguration = {
      isConfigured: false,
      hasToken: !!token,
      hasOrgName: !!orgName,
      organizationName: orgName,
      tokenStatus: 'unknown'
    };

    if (!token) {
      config.tokenStatus = 'missing';
      config.errorMessage = 'GitHub token not configured. Set GITHUB_TOKEN or GITHUB_ACCESS_TOKEN environment variable.';
      return config;
    }

    if (!orgName) {
      config.errorMessage = 'GitHub organization not configured. Set GITHUB_ORG_NAME environment variable.';
      return config;
    }

    config.isConfigured = true;
    return config;
  }

  // Test GitHub token validity
  async testGitHubConnection(): Promise<GitHubConfiguration> {
    if (!this.gitHubConfig.hasToken) {
      return this.gitHubConfig;
    }

    try {
      const octokit = createGitHubClient();
      
      // Test basic API access
      const userResponse = await octokit.rest.users.getAuthenticated();
      
      // Test organization access if configured
      if (this.gitHubConfig.organizationName) {
        try {
          await octokit.rest.orgs.get({ 
            org: this.gitHubConfig.organizationName 
          });
        } catch (orgError: any) {
          this.gitHubConfig.tokenStatus = 'invalid';
          this.gitHubConfig.errorMessage = `Cannot access organization '${this.gitHubConfig.organizationName}'. Check organization name and token permissions.`;
          this.gitHubConfig.isConfigured = false;
          return this.gitHubConfig;
        }
      }

      this.gitHubConfig.tokenStatus = 'valid';
      this.gitHubConfig.isConfigured = true;
      delete this.gitHubConfig.errorMessage;
      
      console.log('GitHub connection validated successfully', {
        user: userResponse.data.login,
        organization: this.gitHubConfig.organizationName
      });

    } catch (error: any) {
      this.gitHubConfig.tokenStatus = 'invalid';
      this.gitHubConfig.isConfigured = false;
      
      if (error.status === 401) {
        this.gitHubConfig.errorMessage = 'GitHub token is invalid or expired. Please update your token.';
      } else if (error.status === 403) {
        this.gitHubConfig.errorMessage = 'GitHub token does not have sufficient permissions. Check token scopes.';
      } else {
        this.gitHubConfig.errorMessage = `GitHub connection failed: ${error.message}`;
      }
      
      logError(error as Error, { context: 'GitHub connection validation failed' });
    }

    return this.gitHubConfig;
  }

  // Get current GitHub configuration status
  async getGitHubStatus(): Promise<GitHubConfiguration> {
    return await this.testGitHubConnection();
  }

  // Create repository with fallback options
  async createRepository(
    project: Project, 
    options: RepositoryCreationOptions = {
      useGitHub: true,
      fallbackToLocal: true,
      isPrivate: true,
      includeReadme: true,
      includeGitignore: true,
      includeLicense: false
    }
  ): Promise<RepositoryCreationResult> {
    const warnings: string[] = [];
    
    // Check GitHub configuration first
    const gitHubStatus = await this.testGitHubConnection();
    
    if (options.useGitHub && gitHubStatus.isConfigured) {
      // Try GitHub creation
      try {
        const result = await this.createGitHubRepository(project, options);
        return result;
      } catch (error: any) {
        logError(error as Error, { context: 'GitHub repository creation failed' });
        warnings.push(`GitHub creation failed: ${error.message}`);
        
        if (!options.fallbackToLocal) {
          return {
            success: false,
            error: `GitHub repository creation failed: ${error.message}`,
            warnings,
            mode: 'failed'
          };
        }
        // Fall through to local creation
      }
    } else if (options.useGitHub) {
      warnings.push(`GitHub not configured: ${gitHubStatus.errorMessage}`);
      
      if (!options.fallbackToLocal) {
        return {
          success: false,
          error: gitHubStatus.errorMessage || 'GitHub not configured',
          warnings,
          mode: 'failed'
        };
      }
    }

    // Create local repository record
    try {
      const localRepo = await this.createLocalRepository(project, options);
      return {
        success: true,
        repository: localRepo,
        warnings,
        mode: 'local'
      };
    } catch (error: any) {
      logError(error as Error, { context: 'Local repository creation failed' });
      return {
        success: false,
        error: `Repository creation failed: ${error.message}`,
        warnings,
        mode: 'failed'
      };
    }
  }

  // Create GitHub repository
  private async createGitHubRepository(
    project: Project, 
    options: RepositoryCreationOptions
  ): Promise<RepositoryCreationResult> {
    try {
      // Use provided name if available, otherwise generate one
      const repoName = options.repositoryName || this.generateRepositoryName(project);
      const description = options.description || this.generateRepositoryDescription(project);
      
      // Create repository on GitHub
      const githubRepo = await createGitHubRepo(repoName, {
        description,
        private: options.isPrivate ?? true,
        auto_init: options.includeReadme ?? true,
        gitignore_template: options.includeGitignore ? this.getGitignoreTemplate(project) : undefined,
        license_template: options.includeLicense ? 'mit' : undefined,
      });

      // Create repository record in database
      const repository = await prisma.repository.create({
        data: {
          projectId: project.id,
          githubRepoId: githubRepo.id.toString(),
          githubUrl: githubRepo.html_url,
          githubOwner: githubRepo.owner?.login || this.gitHubConfig.organizationName || 'unknown',
          githubName: githubRepo.name,
          defaultBranch: githubRepo.default_branch || 'main',
          isPrivate: githubRepo.private,
          category: this.mapCategory(project.category),
          subcategory: this.inferSubcategory(project),
          repoPath: this.generateRepoPath(project),
          language: githubRepo.language,
          status: 'ACTIVE',
          lastCommit: githubRepo.pushed_at ? new Date(githubRepo.pushed_at) : new Date(),
          commitCount: 0,
          templateUsed: options.templateName,
        }
      });

      console.log('Repository created successfully on GitHub', {
        projectId: project.id,
        repositoryId: repository.id,
        githubUrl: githubRepo.html_url
      });

      return {
        success: true,
        repository,
        githubRepository: githubRepo,
        mode: 'github',
        githubUrl: githubRepo.html_url
      };

    } catch (error: any) {
      // Handle specific GitHub errors
      if (error.status === 422) {
        throw new Error('Repository name already exists or is invalid');
      } else if (error.status === 403) {
        throw new Error('Insufficient permissions to create repository');
      } else if (error.status === 401) {
        throw new Error('GitHub authentication failed');
      } else {
        throw new Error(`GitHub API error: ${error.message}`);
      }
    }
  }

  // Create local repository record (fallback)
  private async createLocalRepository(
    project: Project, 
    options: RepositoryCreationOptions
  ): Promise<Repository> {
    const repoPath = this.generateRepoPath(project);
    const repoName = this.generateRepositoryName(project);

    const repository = await prisma.repository.create({
      data: {
        projectId: project.id,
        githubRepoId: null,
        githubUrl: null,
        githubOwner: null,
        githubName: repoName,
        defaultBranch: 'main',
        isPrivate: true,
        category: this.mapCategory(project.category),
        subcategory: this.inferSubcategory(project),
        repoPath: repoPath,
        language: null,
        status: 'NEEDS_SETUP',
        lastCommit: null,
        commitCount: 0,
        templateUsed: options.templateName,
      }
    });

    console.log('Local repository record created', {
      projectId: project.id,
      repositoryId: repository.id,
      repoPath: repoPath
    });

    return repository;
  }

  // Link existing GitHub repository
  async linkExistingRepository(
    projectId: string, 
    githubUrl: string
  ): Promise<RepositoryCreationResult> {
    try {
      // Parse GitHub URL
      const urlMatch = githubUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/);
      if (!urlMatch) {
        return {
          success: false,
          error: 'Invalid GitHub URL format. Expected: https://github.com/owner/repo',
          mode: 'failed'
        };
      }

      const [, owner, repoName] = urlMatch;

      // Test GitHub connection
      const gitHubStatus = await this.testGitHubConnection();
      if (!gitHubStatus.isConfigured) {
        return {
          success: false,
          error: gitHubStatus.errorMessage || 'GitHub not configured',
          mode: 'failed'
        };
      }

      // Get repository info from GitHub
      const octokit = createGitHubClient();
      const { data: githubRepo } = await octokit.rest.repos.get({
        owner,
        repo: repoName
      });

      // Get project
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        return {
          success: false,
          error: 'Project not found',
          mode: 'failed'
        };
      }

      // Check if repository is already linked
      const existingRepo = await prisma.repository.findUnique({
        where: { projectId }
      });

      if (existingRepo) {
        return {
          success: false,
          error: 'Project already has a linked repository',
          mode: 'failed'
        };
      }

      // Create repository record
      const repository = await prisma.repository.create({
        data: {
          projectId: project.id,
          githubRepoId: githubRepo.id.toString(),
          githubUrl: githubRepo.html_url,
          githubOwner: owner,
          githubName: repoName,
          defaultBranch: githubRepo.default_branch,
          isPrivate: githubRepo.private,
          category: this.mapCategory(project.category),
          subcategory: this.inferSubcategory(project),
          repoPath: this.generateRepoPath(project),
          language: githubRepo.language,
          status: 'ACTIVE',
          lastCommit: githubRepo.pushed_at ? new Date(githubRepo.pushed_at) : new Date(),
          commitCount: 0,
        }
      });

      console.log('Existing repository linked successfully', {
        projectId: project.id,
        repositoryId: repository.id,
        githubUrl: githubRepo.html_url
      });

      return {
        success: true,
        repository,
        githubRepository: githubRepo,
        mode: 'github',
        githubUrl: githubRepo.html_url
      };

    } catch (error: any) {
      logError(error as Error, { context: 'Failed to link existing repository' });
      
      if (error.status === 404) {
        return {
          success: false,
          error: 'Repository not found or not accessible',
          mode: 'failed'
        };
      } else if (error.status === 403) {
        return {
          success: false,
          error: 'Insufficient permissions to access repository',
          mode: 'failed'
        };
      } else {
        return {
          success: false,
          error: `Failed to link repository: ${error.message}`,
          mode: 'failed'
        };
      }
    }
  }

  // Setup instructions for GitHub configuration
  getSetupInstructions(): {
    steps: string[];
    envVariables: { name: string; description: string; required: boolean }[];
    troubleshooting: { issue: string; solution: string }[];
  } {
    return {
      steps: [
        '1. Create a GitHub Personal Access Token at https://github.com/settings/tokens',
        '2. Grant the following scopes: repo, admin:org, admin:repo_hook',
        '3. Set the GITHUB_TOKEN environment variable with your token',
        '4. Set the GITHUB_PROJECTS_ORG environment variable to "corevecta-projects" (or your org name)',
        '5. Ensure you have admin access to the corevecta-projects organization',
        '6. Restart your application to load the new configuration'
      ],
      envVariables: [
        {
          name: 'GITHUB_TOKEN',
          description: 'GitHub Personal Access Token with repo and org permissions',
          required: true
        },
        {
          name: 'GITHUB_PROJECTS_ORG',
          description: 'GitHub organization for project repositories (defaults to corevecta-projects)',
          required: false
        },
        {
          name: 'GITHUB_ORG_NAME',
          description: 'Alternative org name variable (deprecated, use GITHUB_PROJECTS_ORG)',
          required: false
        }
      ],
      troubleshooting: [
        {
          issue: 'Token authentication failed',
          solution: 'Verify token is correct and has not expired. Check token scopes include "repo".'
        },
        {
          issue: 'Organization access denied',
          solution: 'Ensure you have admin access to the organization or create repositories under your user account.'
        },
        {
          issue: 'Repository creation fails',
          solution: 'Check if repository name already exists or if you have reached your repository limit.'
        }
      ]
    };
  }

  // Helper methods
  private generateRepositoryName(project: Project): string {
    // Follow a consistent naming convention for corevecta-projects organization
    // Format: {category-prefix}-{project-name}-{unique-id}
    const categoryPrefix = this.getCategoryPrefix(project.category);
    
    const sanitized = project.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 40); // Slightly shorter to accommodate prefix
    
    // Use last 6 chars of ID for uniqueness (shorter but still unique)
    const uniqueId = project.id.slice(-6);
    
    return `${categoryPrefix}-${sanitized}-${uniqueId}`;
  }

  private getCategoryPrefix(category: string): string {
    const prefixMap: Record<string, string> = {
      'Chrome Extension': 'chrome',
      'VSCode Extension': 'vscode',
      'Figma Plugin': 'figma',
      'Web App': 'web',
      'Mobile App': 'mobile',
      'Desktop App': 'desktop',
      'API/Backend': 'api',
      'Library/Package': 'lib',
      'AI/ML': 'ai',
      'Blockchain': 'blockchain',
      'IoT': 'iot'
    };
    
    return prefixMap[category] || 'project';
  }

  private generateRepositoryDescription(project: Project): string {
    const maxLength = 100;
    const description = `${project.title} - ${project.problem}`;
    return description.length > maxLength 
      ? description.substring(0, maxLength - 3) + '...'
      : description;
  }

  private generateRepoPath(project: Project): string {
    // For corevecta-projects organization, use a flatter structure
    // The repository name already includes the category prefix
    const projectName = this.generateRepositoryName(project);
    const category = this.mapCategory(project.category);
    
    // Optional: Include category folder for better organization in the org
    // But since repo names are already prefixed, we can keep it flat
    return projectName; // Flat structure in the organization
  }

  private mapCategory(category: string): string {
    const categoryMap: Record<string, string> = {
      'Chrome Extension': 'chrome-extensions',
      'VSCode Extension': 'vscode-extensions',
      'Figma Plugin': 'figma-plugins',
      'Web App': 'web-apps',
      'Mobile App': 'mobile-apps',
      'Desktop App': 'desktop-apps',
      'API/Backend': 'api-backend',
      'Library/Package': 'libraries',
      'AI/ML': 'ai-ml',
      'Blockchain': 'blockchain',
      'IoT': 'iot'
    };
    
    return categoryMap[category] || 'misc';
  }

  private inferSubcategory(project: Project): string | undefined {
    const subcategoryMap: Record<string, string[]> = {
      'chrome-extensions': ['productivity', 'privacy', 'developer-tools', 'social'],
      'web-apps': ['saas', 'tools', 'dashboards', 'e-commerce'],
      'mobile-apps': ['ios', 'android', 'react-native', 'flutter'],
      'api-backend': ['rest-api', 'graphql', 'microservices']
    };

    const category = this.mapCategory(project.category);
    const subcategories = subcategoryMap[category];
    
    if (!subcategories) return undefined;

    // Simple inference based on project title and tags
    const title = project.title.toLowerCase();
    const tags = typeof project.tags === 'string' ? JSON.parse(project.tags || '[]') : project.tags || [];
    
    for (const subcategory of subcategories) {
      if (title.includes(subcategory) || tags.includes(subcategory)) {
        return subcategory;
      }
    }

    return subcategories[0]; // Default to first subcategory
  }

  private getGitignoreTemplate(project: Project): string {
    const category = project.category.toLowerCase();
    const title = project.title.toLowerCase();
    
    if (category.includes('node') || title.includes('node') || title.includes('react') || title.includes('vue')) {
      return 'Node';
    } else if (category.includes('python') || title.includes('python') || title.includes('django')) {
      return 'Python';
    } else if (category.includes('java') || title.includes('java')) {
      return 'Java';
    } else if (category.includes('go') || title.includes('go')) {
      return 'Go';
    } else if (category.includes('rust') || title.includes('rust')) {
      return 'Rust';
    }
    
    return 'Node'; // Default
  }
}

// Export singleton instance
export const enhancedRepositoryService = new EnhancedRepositoryService();