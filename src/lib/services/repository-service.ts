import { prisma } from '@/lib/prisma';
import { GitHubClient } from '@/lib/github/github-client';
import type { 
  Repository, 
  RepoStatus, 
  Project,
  RepositoryWithDetails,
  CreateRepositoryOptions,
  RepositoryPath,
  SyncOptions,
  SyncResult,
  CodeMetrics
} from '@/types/repository';

// Configuration
const GITHUB_CONFIG = {
  organizationName: process.env.GITHUB_ORG_NAME || 'masterlist-org',
  accessToken: process.env.GITHUB_ACCESS_TOKEN || '',
  localBasePath: process.env.LOCAL_REPOS_PATH || '/tmp/masterlist-repos'
};

// Category mapping for hierarchical organization
const CATEGORY_MAPPING = {
  'Chrome Extension': 'chrome-extensions',
  'VSCode Extension': 'vscode-extensions', 
  'Figma Plugin': 'figma-plugins',
  'Notion Templates': 'notion-templates',
  'Obsidian Plugin': 'obsidian-plugins',
  'AI Browser Tools': 'ai-browser-tools',
  'Crypto Browser Tools': 'crypto-browser-tools',
  'Web App': 'web-apps',
  'Mobile App': 'mobile-apps',
  'Desktop App': 'desktop-apps',
  'API/Backend': 'api-backend',
  'Library/Package': 'libraries'
};

const SUBCATEGORY_MAPPING = {
  'chrome-extensions': ['productivity', 'privacy', 'developer-tools', 'social', 'e-commerce'],
  'vscode-extensions': ['ai-tools', 'productivity', 'themes', 'language-support', 'debugging'],
  'web-apps': ['saas', 'tools', 'dashboards', 'e-commerce', 'portfolios'],
  'mobile-apps': ['ios', 'android', 'react-native', 'flutter'],
  'api-backend': ['rest-api', 'graphql', 'microservices', 'serverless']
};

export class RepositoryService {
  private githubClient: GitHubClient;

  constructor() {
    this.githubClient = new GitHubClient(
      GITHUB_CONFIG.accessToken,
      GITHUB_CONFIG.organizationName
    );
  }

  // Repository Creation and Management
  async createRepository(project: Project, options: Partial<CreateRepositoryOptions> = {}): Promise<Repository> {
    try {
      // Generate repository path
      const repoPath = this.generateRepositoryPath(project);
      
      // Create repository on GitHub
      const createOptions: CreateRepositoryOptions = {
        projectId: project.id,
        repoName: this.generateRepositoryName(project),
        description: this.generateRepositoryDescription(project),
        isPrivate: true,
        includeGitignore: true,
        includeLicense: true,
        licenseType: 'mit',
        ...options
      };

      const githubRepo = await this.githubClient.createRepository(createOptions);

      // Store in database
      const repository = await prisma.repository.create({
        data: {
          projectId: project.id,
          githubRepoId: githubRepo.id.toString(),
          githubUrl: githubRepo.html_url,
          githubOwner: GITHUB_CONFIG.organizationName,
          githubName: githubRepo.name,
          defaultBranch: githubRepo.default_branch,
          isPrivate: githubRepo.private,
          category: this.mapCategory(project.category),
          subcategory: this.inferSubcategory(project),
          repoPath: repoPath.fullPath,
          language: githubRepo.language,
          status: 'ACTIVE',
          lastCommit: new Date(githubRepo.pushed_at),
          commitCount: 0
        }
      });

      // Initialize repository with template if specified
      if (options.templateName) {
        await this.initializeFromTemplate(repository.id, options.templateName);
      }

      // Create webhook for repository events
      await this.createRepositoryWebhook(repository.id);

      return repository;
    } catch (error) {
      throw new Error(`Failed to create repository: ${error.message}`);
    }
  }

  async linkExistingRepository(projectId: string, githubUrl: string): Promise<Repository> {
    try {
      // Parse GitHub URL
      const urlParts = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!urlParts) {
        throw new Error('Invalid GitHub URL format');
      }

      const [, owner, repoName] = urlParts;

      // Get repository info from GitHub
      const githubRepo = await this.githubClient.getRepository(owner, repoName);

      // Get project info
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // Generate repository path
      const repoPath = this.generateRepositoryPath(project);

      // Store in database
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
          repoPath: repoPath.fullPath,
          language: githubRepo.language,
          status: 'ACTIVE',
          lastCommit: new Date(githubRepo.pushed_at),
          commitCount: 0
        }
      });

      // Analyze existing repository
      await this.analyzeRepository(repository.id);

      return repository;
    } catch (error) {
      throw new Error(`Failed to link repository: ${error.message}`);
    }
  }

  async getRepository(repositoryId: string): Promise<RepositoryWithDetails | null> {
    return await prisma.repository.findUnique({
      where: { id: repositoryId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true
          }
        },
        codeAnalyses: {
          orderBy: { analyzedAt: 'desc' },
          take: 1
        },
        repositoryTags: true,
        webhooks: {
          where: { isActive: true }
        }
      }
    });
  }

  async getRepositoryByProject(projectId: string): Promise<Repository | null> {
    return await prisma.repository.findUnique({
      where: { projectId }
    });
  }

  async listRepositories(options: {
    category?: string;
    subcategory?: string;
    status?: RepoStatus;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ repositories: RepositoryWithDetails[]; total: number }> {
    const where: any = {};
    
    if (options.category) where.category = options.category;
    if (options.subcategory) where.subcategory = options.subcategory;
    if (options.status) where.status = options.status;

    const [repositories, total] = await Promise.all([
      prisma.repository.findMany({
        where,
        include: {
          project: {
            select: {
              id: true,
              title: true,
              category: true,
              status: true
            }
          },
          codeAnalyses: {
            orderBy: { analyzedAt: 'desc' },
            take: 1
          },
          repositoryTags: true,
          webhooks: {
            where: { isActive: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: options.limit || 50,
        skip: options.offset || 0
      }),
      prisma.repository.count({ where })
    ]);

    return { repositories, total };
  }

  // Hierarchical Organization
  async getRepositoryPath(project: Project): Promise<RepositoryPath> {
    const category = this.mapCategory(project.category);
    const subcategory = this.inferSubcategory(project);
    const projectName = this.sanitizeProjectName(project.title);

    return {
      category,
      subcategory,
      projectName,
      fullPath: subcategory 
        ? `${category}/${subcategory}/${projectName}`
        : `${category}/${projectName}`
    };
  }

  async moveRepository(repositoryId: string, newCategory: string, newSubcategory?: string): Promise<Repository> {
    try {
      const repository = await this.getRepository(repositoryId);
      if (!repository) {
        throw new Error('Repository not found');
      }

      const projectName = this.sanitizeProjectName(repository.project.title);
      const newPath = newSubcategory 
        ? `${newCategory}/${newSubcategory}/${projectName}`
        : `${newCategory}/${projectName}`;

      // Update repository path and organization
      const updatedRepository = await prisma.repository.update({
        where: { id: repositoryId },
        data: {
          category: newCategory,
          subcategory: newSubcategory,
          repoPath: newPath,
          updatedAt: new Date()
        }
      });

      // TODO: Move actual repository on GitHub (if needed)
      // This would involve renaming or transferring the repository

      return updatedRepository;
    } catch (error) {
      throw new Error(`Failed to move repository: ${error.message}`);
    }
  }

  async getRepositoriesByCategory(): Promise<Record<string, RepositoryWithDetails[]>> {
    const repositories = await this.listRepositories();
    const grouped: Record<string, RepositoryWithDetails[]> = {};

    repositories.repositories.forEach(repo => {
      const key = repo.subcategory 
        ? `${repo.category}/${repo.subcategory}`
        : repo.category;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(repo);
    });

    return grouped;
  }

  // Repository Synchronization
  async syncRepository(repositoryId: string, options: SyncOptions = {}): Promise<SyncResult> {
    const startTime = Date.now();
    const changes: string[] = [];
    const errors: string[] = [];

    try {
      const repository = await this.getRepository(repositoryId);
      if (!repository) {
        throw new Error('Repository not found');
      }

      // Update repository status
      await prisma.repository.update({
        where: { id: repositoryId },
        data: { status: 'SYNCING' }
      });

      // Get latest commit info
      try {
        const latestCommit = await this.githubClient.getLatestCommit(
          repository.githubOwner!,
          repository.githubName!,
          repository.defaultBranch
        );

        if (latestCommit) {
          await prisma.repository.update({
            where: { id: repositoryId },
            data: {
              lastCommit: new Date(latestCommit.commit.author.date),
              lastSync: new Date()
            }
          });
          changes.push('Updated last commit timestamp');
        }
      } catch (error) {
        errors.push(`Failed to get latest commit: ${error.message}`);
      }

      // Clone or pull latest changes if requested
      if (options.pullLatest) {
        try {
          await this.cloneOrPullRepository(repository);
          changes.push('Updated local repository');
        } catch (error) {
          errors.push(`Failed to update local repository: ${error.message}`);
        }
      }

      // Run code analysis if requested
      let metrics: CodeMetrics | undefined;
      if (options.analyzeCode) {
        try {
          metrics = await this.analyzeRepository(repositoryId);
          changes.push('Updated code analysis');
        } catch (error) {
          errors.push(`Failed to analyze code: ${error.message}`);
        }
      }

      // Update repository status
      await prisma.repository.update({
        where: { id: repositoryId },
        data: { 
          status: 'ACTIVE',
          updatedAt: new Date()
        }
      });

      return {
        success: errors.length === 0,
        changes,
        errors,
        metrics,
        duration: Date.now() - startTime
      };
    } catch (error) {
      // Reset status on failure
      await prisma.repository.update({
        where: { id: repositoryId },
        data: { status: 'ERROR' }
      });

      throw new Error(`Sync failed: ${error.message}`);
    }
  }

  // Code Analysis Integration
  async analyzeRepository(repositoryId: string): Promise<CodeMetrics> {
    // This is a placeholder - we'll implement detailed code analysis later
    // For now, return basic metrics from GitHub API
    
    const repository = await this.getRepository(repositoryId);
    if (!repository || !repository.githubOwner || !repository.githubName) {
      throw new Error('Repository not found or not linked to GitHub');
    }

    try {
      const stats = await this.githubClient.getRepositoryStats(
        repository.githubOwner,
        repository.githubName
      );

      const metrics: CodeMetrics = {
        linesOfCode: 0, // TODO: Calculate from cloned repo
        fileCount: 0,   // TODO: Calculate from cloned repo
        directoryCount: 0, // TODO: Calculate from cloned repo
        complexity: 5,  // TODO: Calculate using complexity analysis tools
        testCoverage: 0, // TODO: Parse coverage reports
        codeQuality: 7.5, // TODO: Calculate using quality metrics
        maintainabilityIndex: 8.0 // TODO: Calculate maintainability
      };

      // Store analysis results
      await prisma.codeAnalysis.create({
        data: {
          repositoryId,
          linesOfCode: metrics.linesOfCode,
          fileCount: metrics.fileCount,
          directoryCount: metrics.directoryCount,
          complexity: metrics.complexity,
          testCoverage: metrics.testCoverage,
          codeQuality: metrics.codeQuality,
          maintainabilityIndex: metrics.maintainabilityIndex,
          dependencies: stats.languages,
          analyzer: 'github-api-basic',
          analysisType: 'QUICK'
        }
      });

      return metrics;
    } catch (error) {
      throw new Error(`Failed to analyze repository: ${error.message}`);
    }
  }

  // Helper Methods
  private generateRepositoryPath(project: Project): RepositoryPath {
    const category = this.mapCategory(project.category);
    const subcategory = this.inferSubcategory(project);
    const projectName = this.sanitizeProjectName(project.title);

    return {
      category,
      subcategory,
      projectName,
      fullPath: subcategory 
        ? `${category}/${subcategory}/${projectName}`
        : `${category}/${projectName}`
    };
  }

  private generateRepositoryName(project: Project): string {
    const sanitized = this.sanitizeProjectName(project.title);
    return `project-${project.id.slice(-8)}-${sanitized}`;
  }

  private generateRepositoryDescription(project: Project): string {
    return `${project.title} - ${project.problem.substring(0, 100)}...`;
  }

  private mapCategory(category: string): string {
    return CATEGORY_MAPPING[category] || 'misc';
  }

  private inferSubcategory(project: Project): string | undefined {
    const category = this.mapCategory(project.category);
    const subcategories = SUBCATEGORY_MAPPING[category];
    
    if (!subcategories) return undefined;

    // Simple inference based on project title and tags
    const title = project.title.toLowerCase();
    const tags = JSON.parse(project.tags || '[]').map((tag: string) => tag.toLowerCase());
    
    for (const subcategory of subcategories) {
      if (title.includes(subcategory) || tags.includes(subcategory)) {
        return subcategory;
      }
    }

    // Default to first subcategory
    return subcategories[0];
  }

  private sanitizeProjectName(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  private async cloneOrPullRepository(repository: RepositoryWithDetails): Promise<void> {
    // Placeholder for local repository management
    // This would involve git clone/pull operations
    console.log(`Cloning/updating repository: ${repository.githubUrl}`);
    
    // Update local path in database
    const localPath = `${GITHUB_CONFIG.localBasePath}/${repository.repoPath}`;
    await prisma.repository.update({
      where: { id: repository.id },
      data: {
        localPath,
        isCloned: true
      }
    });
  }

  private async initializeFromTemplate(repositoryId: string, templateName: string): Promise<void> {
    // Placeholder for template initialization
    console.log(`Initializing repository ${repositoryId} from template: ${templateName}`);
  }

  private async createRepositoryWebhook(repositoryId: string): Promise<void> {
    // Placeholder for webhook creation
    console.log(`Creating webhook for repository: ${repositoryId}`);
  }
}