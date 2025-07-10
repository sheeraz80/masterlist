import { GitHubClient } from '@/lib/github/github-client';
import { RepositoryService } from './repository-service';
import { prisma } from '@/lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

interface AITaskRequest {
  projectId: string;
  taskType: 'bug-fix' | 'feature' | 'refactor' | 'update-deps' | 'security-fix';
  description: string;
  aiProvider: 'claude' | 'openai' | 'github-copilot';
  autoCommit?: boolean;
  autoPR?: boolean;
}

interface AITaskResult {
  success: boolean;
  changes: string[];
  commitUrl?: string;
  prUrl?: string;
  logs: string[];
  error?: string;
}

export class AIDevelopmentService {
  private githubClient: GitHubClient;
  private repoService: RepositoryService;
  private workDir: string;

  constructor() {
    this.githubClient = new GitHubClient(
      process.env.GITHUB_ACCESS_TOKEN!,
      process.env.GITHUB_PROJECTS_ORG || 'masterlist-projects'
    );
    this.repoService = new RepositoryService();
    this.workDir = process.env.AI_WORK_DIR || '/tmp/masterlist-ai-dev';
  }

  /**
   * Execute an AI-powered development task on a project
   */
  async executeAITask(request: AITaskRequest): Promise<AITaskResult> {
    const logs: string[] = [];
    
    try {
      // 1. Get repository information
      const repository = await this.repoService.getRepositoryByProject(request.projectId);
      if (!repository) {
        throw new Error('Repository not found for project');
      }

      // 2. Clone or update local repository
      const localPath = await this.setupLocalRepository(repository, logs);

      // 3. Create a new branch for the changes
      const branchName = `ai/${request.taskType}-${Date.now()}`;
      await execAsync(`git checkout -b ${branchName}`, { cwd: localPath });
      logs.push(`Created branch: ${branchName}`);

      // 4. Execute AI task based on provider
      const changes = await this.executeAIProvider(request, localPath, logs);

      if (changes.length === 0) {
        return {
          success: false,
          changes: [],
          logs,
          error: 'No changes made by AI'
        };
      }

      // 5. Commit changes if requested
      let commitUrl: string | undefined;
      if (request.autoCommit) {
        commitUrl = await this.commitChanges(
          repository, 
          branchName, 
          request, 
          changes, 
          localPath, 
          logs
        );
      }

      // 6. Create PR if requested
      let prUrl: string | undefined;
      if (request.autoPR && commitUrl) {
        prUrl = await this.createPullRequest(
          repository,
          branchName,
          request,
          changes,
          logs
        );
      }

      // 7. Update repository analysis
      await this.repoService.analyzeRepository(repository.id);

      return {
        success: true,
        changes,
        commitUrl,
        prUrl,
        logs
      };

    } catch (error) {
      return {
        success: false,
        changes: [],
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Batch execute AI tasks across multiple projects
   */
  async batchExecuteAITasks(
    projectIds: string[],
    taskTemplate: Omit<AITaskRequest, 'projectId'>
  ): Promise<Map<string, AITaskResult>> {
    const results = new Map<string, AITaskResult>();
    
    // Process in parallel with concurrency limit
    const concurrencyLimit = 5;
    for (let i = 0; i < projectIds.length; i += concurrencyLimit) {
      const batch = projectIds.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map(projectId => 
          this.executeAITask({ ...taskTemplate, projectId })
            .then(result => ({ projectId, result }))
        )
      );
      
      batchResults.forEach(({ projectId, result }) => {
        results.set(projectId, result);
      });
    }
    
    return results;
  }

  /**
   * AI-powered code search and fix across all repositories
   */
  async globalCodeFix(pattern: string, fix: string, description: string): Promise<Map<string, AITaskResult>> {
    // Find all repositories with matching code
    const repositories = await prisma.repository.findMany({
      where: { status: 'ACTIVE' }
    });

    const affectedProjects: string[] = [];

    for (const repo of repositories) {
      const hasMatch = await this.searchInRepository(repo, pattern);
      if (hasMatch) {
        affectedProjects.push(repo.projectId);
      }
    }

    // Execute fix on all affected projects
    return this.batchExecuteAITasks(affectedProjects, {
      taskType: 'bug-fix',
      description: `Fix: ${description}\nPattern: ${pattern}\nReplacement: ${fix}`,
      aiProvider: 'claude',
      autoCommit: true,
      autoPR: true
    });
  }

  /**
   * Setup local repository for AI operations
   */
  private async setupLocalRepository(repository: any, logs: string[]): Promise<string> {
    const localPath = path.join(this.workDir, repository.githubName);
    
    try {
      // Check if already cloned
      await fs.access(localPath);
      
      // Update existing clone
      await execAsync('git fetch origin', { cwd: localPath });
      await execAsync('git checkout main', { cwd: localPath });
      await execAsync('git pull origin main', { cwd: localPath });
      logs.push('Updated existing repository');
    } catch {
      // Clone fresh
      await fs.mkdir(this.workDir, { recursive: true });
      await execAsync(
        `git clone ${repository.githubUrl} ${localPath}`,
        { cwd: this.workDir }
      );
      logs.push('Cloned repository');
    }
    
    return localPath;
  }

  /**
   * Execute AI provider specific logic
   */
  private async executeAIProvider(
    request: AITaskRequest,
    localPath: string,
    logs: string[]
  ): Promise<string[]> {
    const changes: string[] = [];

    switch (request.aiProvider) {
      case 'claude': {
        // Use Claude CLI
        const claudePrompt = this.buildClaudePrompt(request);
        await execAsync(
          `claude-code --prompt "${claudePrompt}" --path .`,
          { cwd: localPath }
        );
        logs.push('Executed Claude AI task');
        
        // Parse changed files
        const gitStatus = await execAsync('git status --porcelain', { cwd: localPath });
        changes.push(...gitStatus.stdout.split('\n').filter(line => line.trim()).map(line => line.substring(3)));
        break;
      }

      case 'openai': {
        // OpenAI implementation
        logs.push('OpenAI provider not yet implemented');
        break;
      }

      case 'github-copilot': {
        // GitHub Copilot implementation
        logs.push('GitHub Copilot provider not yet implemented');
        break;
      }
    }

    return changes;
  }

  /**
   * Build Claude-specific prompt
   */
  private buildClaudePrompt(request: AITaskRequest): string {
    const prompts = {
      'bug-fix': `Fix the following bug: ${request.description}. Ensure the fix is complete and doesn't break existing functionality.`,
      'feature': `Implement the following feature: ${request.description}. Follow existing code patterns and add necessary tests.`,
      'refactor': `Refactor the code: ${request.description}. Improve code quality while maintaining functionality.`,
      'update-deps': `Update dependencies: ${request.description}. Ensure compatibility and update any breaking changes.`,
      'security-fix': `Fix security issue: ${request.description}. Ensure the fix is comprehensive and doesn't introduce new vulnerabilities.`
    };

    return prompts[request.taskType] || request.description;
  }

  /**
   * Commit changes to repository
   */
  private async commitChanges(
    repository: any,
    branchName: string,
    request: AITaskRequest,
    changes: string[],
    localPath: string,
    logs: string[]
  ): Promise<string> {
    // Stage all changes
    await execAsync('git add .', { cwd: localPath });
    
    // Commit with descriptive message
    const commitMessage = `${request.taskType}: ${request.description}\n\nChanges:\n${changes.map(c => `- ${c}`).join('\n')}\n\n🤖 AI-generated with masterlist`;
    await execAsync(`git commit -m "${commitMessage}"`, { cwd: localPath });
    
    // Push to remote
    await execAsync(`git push origin ${branchName}`, { cwd: localPath });
    logs.push('Committed and pushed changes');

    // Get commit URL
    const { stdout } = await execAsync('git rev-parse HEAD', { cwd: localPath });
    const commitSha = stdout.trim();
    
    return `${repository.githubUrl}/commit/${commitSha}`;
  }

  /**
   * Create pull request for AI changes
   */
  private async createPullRequest(
    repository: any,
    branchName: string,
    request: AITaskRequest,
    changes: string[],
    logs: string[]
  ): Promise<string> {
    const pr = await this.githubClient.createPullRequest({
      owner: repository.githubOwner,
      repo: repository.githubName,
      title: `[AI] ${request.taskType}: ${request.description.substring(0, 50)}...`,
      body: `## AI-Generated Changes

**Task Type:** ${request.taskType}
**Description:** ${request.description}
**AI Provider:** ${request.aiProvider}

### Changes Made:
${changes.map(c => `- \`${c}\``).join('\n')}

### Review Checklist:
- [ ] Code changes are correct
- [ ] No unintended side effects
- [ ] Tests pass (if applicable)
- [ ] Security implications reviewed

---
🤖 Generated by Masterlist AI Development Service`,
      head: branchName,
      base: repository.defaultBranch
    });

    logs.push(`Created PR: ${pr.html_url}`);
    return pr.html_url;
  }

  /**
   * Search for pattern in repository
   */
  private async searchInRepository(repository: any, pattern: string): Promise<boolean> {
    try {
      const results = await this.githubClient.searchCode({
        owner: repository.githubOwner,
        repo: repository.githubName,
        query: pattern
      });
      return results.length > 0;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const aiDevelopmentService = new AIDevelopmentService();