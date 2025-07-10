import { GitHubClient } from '@/lib/github/github-client';
import { RepositoryService } from './repository-service';
import { prisma } from '@/lib/prisma';
import { CATEGORY_PROJECT_TEMPLATES } from '@/lib/templates/category-templates';
import { processTemplate } from '@/lib/templates/autonomous-project';
import fs from 'fs/promises';
import path from 'path';

interface ProjectDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  template: string;
  features: string[];
  tags: string[];
}

interface BatchCreationResult {
  created: number;
  failed: number;
  skipped: number;
  errors: Array<{ project: string; error: string }>;
}

export class RepositoryAutomationService {
  private githubClient: GitHubClient;
  private repoService: RepositoryService;
  
  constructor() {
    this.githubClient = new GitHubClient(
      process.env.GITHUB_PROJECTS_TOKEN!,
      process.env.GITHUB_PROJECTS_ORG || 'corevecta-projects'
    );
    this.repoService = new RepositoryService();
  }

  /**
   * Load project definitions from masterlist
   */
  async loadProjectDefinitions(): Promise<ProjectDefinition[]> {
    const projects = await prisma.project.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        title: true,
        problem: true,
        solution: true,
        category: true,
        tags: true,
        keyFeatures: true
      }
    });

    return projects.map(project => ({
      id: project.id,
      title: project.title,
      description: `${project.problem}\n\nSolution: ${project.solution}`,
      category: this.mapCategory(project.category),
      subcategory: this.inferSubcategory(project),
      template: this.selectTemplate(project),
      features: project.keyFeatures.split(',').map(f => f.trim()),
      tags: project.tags.split(',').map(t => t.trim())
    }));
  }

  /**
   * Create all repositories in batch
   */
  async createAllRepositories(dryRun = false, jobId?: string): Promise<BatchCreationResult> {
    const result: BatchCreationResult = {
      created: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    const projects = await this.loadProjectDefinitions();
    console.log(`Found ${projects.length} projects to process`);

    // Update job with total project count
    if (jobId) {
      await prisma.batchJob.update({
        where: { id: jobId },
        data: {
          metadata: {
            totalProjects: projects.length,
            dryRun,
            status: 'Processing projects...'
          }
        }
      });
    }

    // Process in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < projects.length; i += batchSize) {
      const batch = projects.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (project) => {
          try {
            // Check if repository already exists
            const existing = await prisma.repository.findUnique({
              where: { projectId: project.id }
            });

            if (existing) {
              console.log(`Repository already exists for ${project.title}`);
              result.skipped++;
              
              if (jobId) {
                await prisma.repositoryCreationLog.create({
                  data: {
                    batchJobId: jobId,
                    projectId: project.id,
                    projectTitle: project.title,
                    status: 'SKIPPED',
                    message: 'Repository already exists'
                  }
                });
              }
              return;
            }

            if (dryRun) {
              console.log(`[DRY RUN] Would create repository for ${project.title}`);
              result.created++;
              
              if (jobId) {
                await prisma.repositoryCreationLog.create({
                  data: {
                    batchJobId: jobId,
                    projectId: project.id,
                    projectTitle: project.title,
                    status: 'SUCCESS',
                    message: 'Dry run - would create repository'
                  }
                });
              }
              return;
            }

            // Create repository
            await this.createProjectRepository(project);
            result.created++;
            console.log(`✓ Created repository for ${project.title}`);

            if (jobId) {
              await prisma.repositoryCreationLog.create({
                data: {
                  batchJobId: jobId,
                  projectId: project.id,
                  projectTitle: project.title,
                  status: 'SUCCESS',
                  message: 'Repository created successfully'
                }
              });
            }

          } catch (error) {
            result.failed++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            result.errors.push({
              project: project.title,
              error: errorMessage
            });
            console.error(`✗ Failed to create repository for ${project.title}:`, error);

            if (jobId) {
              await prisma.repositoryCreationLog.create({
                data: {
                  batchJobId: jobId,
                  projectId: project.id,
                  projectTitle: project.title,
                  status: 'FAILED',
                  error: errorMessage
                }
              });
            }
          }
        })
      );

      // Update progress
      if (jobId) {
        const processed = Math.min(i + batchSize, projects.length);
        await prisma.batchJob.update({
          where: { id: jobId },
          data: {
            metadata: {
              totalProjects: projects.length,
              processedProjects: processed,
              progress: Math.round((processed / projects.length) * 100),
              ...result
            }
          }
        });
      }

      // Rate limit pause between batches
      if (i + batchSize < projects.length) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    return result;
  }

  /**
   * Create a single project repository with all features
   */
  async createProjectRepository(project: ProjectDefinition): Promise<void> {
    // 1. Create GitHub repository
    const repoName = this.generateRepositoryName(project);
    const githubRepo = await this.githubClient.createRepository({
      projectId: project.id,
      repoName,
      description: project.description.substring(0, 200),
      isPrivate: true,
      includeGitignore: true,
      includeLicense: true,
      licenseType: 'mit'
    });

    // 2. Save to database
    const repository = await prisma.repository.create({
      data: {
        projectId: project.id,
        githubRepoId: githubRepo.id.toString(),
        githubUrl: githubRepo.html_url,
        githubOwner: githubRepo.owner.login,
        githubName: githubRepo.name,
        defaultBranch: 'main',
        isPrivate: true,
        category: project.category,
        subcategory: project.subcategory,
        repoPath: `${project.category}/${project.subcategory}/${repoName}`,
        status: 'ACTIVE'
      }
    });

    // 3. Initialize repository content
    await this.initializeRepositoryContent(repository, project);

    // 4. Set up GitHub features
    await this.setupGitHubFeatures(githubRepo.owner.login, githubRepo.name, project);

    // 5. Create initial deployment configurations
    await this.createDeploymentConfigs(repository, project);
  }

  /**
   * Initialize repository with template content
   */
  private async initializeRepositoryContent(
    repository: any,
    project: ProjectDefinition
  ): Promise<void> {
    const template = CATEGORY_PROJECT_TEMPLATES[project.template];
    if (!template) {
      console.warn(`No template found for ${project.template}`);
      return;
    }

    const variables = {
      PROJECT_NAME: project.title,
      PROJECT_DESCRIPTION: project.description,
      PACKAGE_NAME: this.toPackageName(project.title),
      REPO_URL: repository.githubUrl,
      REPO_NAME: repository.githubName,
      FEATURES_LIST: project.features.map(f => `- ${f}`).join('\n')
    };

    // Create README.md
    const readmeContent = this.generateReadme(project, repository);
    await this.githubClient.createFile({
      owner: repository.githubOwner,
      repo: repository.githubName,
      path: 'README.md',
      message: 'Initial commit: Add README',
      content: Buffer.from(readmeContent).toString('base64')
    });

    // Create project structure based on template
    // This would create all necessary files from the template
    // For brevity, showing just package.json creation
    if (template.structure['package.json']) {
      const packageJson = {
        name: this.toPackageName(project.title),
        version: '0.1.0',
        description: project.description.substring(0, 100),
        private: true,
        scripts: template.scripts || {},
        dependencies: {},
        devDependencies: {}
      };

      await this.githubClient.createFile({
        owner: repository.githubOwner,
        repo: repository.githubName,
        path: 'package.json',
        message: 'Add package.json',
        content: Buffer.from(JSON.stringify(packageJson, null, 2)).toString('base64')
      });
    }
  }

  /**
   * Set up GitHub features (branch protection, webhooks, etc.)
   */
  private async setupGitHubFeatures(
    owner: string,
    repo: string,
    project: ProjectDefinition
  ): Promise<void> {
    // 1. Set up branch protection
    await this.githubClient.createBranchProtection({
      owner,
      repo,
      branch: 'main',
      requiredStatusChecks: ['build', 'test'],
      enforceAdmins: false,
      requiredPullRequestReviews: {
        requiredApprovingReviewCount: 1,
        dismissStaleReviews: true
      }
    });

    // 2. Add repository topics
    await this.githubClient.setRepositoryTopics({
      owner,
      repo,
      topics: [
        'corevecta',
        'masterlist',
        project.category,
        project.subcategory,
        ...project.tags.slice(0, 5) // GitHub limits to 20 topics
      ]
    });

    // 3. Enable security features
    await this.githubClient.enableSecurityFeatures({
      owner,
      repo,
      vulnerabilityAlerts: true,
      automatedSecurityFixes: true
    });

    // 4. Create GitHub Actions workflows
    await this.createGitHubWorkflows(owner, repo, project);
  }

  /**
   * Create GitHub Actions workflows
   */
  private async createGitHubWorkflows(
    owner: string,
    repo: string,
    project: ProjectDefinition
  ): Promise<void> {
    // CI workflow
    const ciWorkflow = `name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm test
    
    - name: Build project
      run: npm run build
`;

    await this.githubClient.createFile({
      owner,
      repo,
      path: '.github/workflows/ci.yml',
      message: 'Add CI workflow',
      content: Buffer.from(ciWorkflow).toString('base64')
    });

    // Security scanning workflow
    const securityWorkflow = `name: Security

on:
  push:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * MON'

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Run CodeQL Analysis
      uses: github/codeql-action/analyze@v2
    
    - name: Run Dependency Check
      uses: dependency-check/Dependency-Check_Action@main
`;

    await this.githubClient.createFile({
      owner,
      repo,
      path: '.github/workflows/security.yml',
      message: 'Add security scanning workflow',
      content: Buffer.from(securityWorkflow).toString('base64')
    });
  }

  /**
   * Create deployment configurations
   */
  private async createDeploymentConfigs(
    repository: any,
    project: ProjectDefinition
  ): Promise<void> {
    // Vercel configuration
    if (project.category === 'web-apps' || project.category === 'chrome-extensions') {
      const vercelConfig = {
        projectName: repository.githubName,
        framework: this.detectFramework(project),
        buildCommand: 'npm run build',
        outputDirectory: this.getOutputDirectory(project),
        installCommand: 'npm install',
        devCommand: 'npm run dev'
      };

      await this.githubClient.createFile({
        owner: repository.githubOwner,
        repo: repository.githubName,
        path: 'vercel.json',
        message: 'Add Vercel configuration',
        content: Buffer.from(JSON.stringify(vercelConfig, null, 2)).toString('base64')
      });
    }

    // Netlify configuration
    if (project.category === 'web-apps') {
      const netlifyConfig = `[build]
  command = "npm run build"
  publish = "${this.getOutputDirectory(project)}"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
`;

      await this.githubClient.createFile({
        owner: repository.githubOwner,
        repo: repository.githubName,
        path: 'netlify.toml',
        message: 'Add Netlify configuration',
        content: Buffer.from(netlifyConfig).toString('base64')
      });
    }
  }

  /**
   * Generate comprehensive README
   */
  private generateReadme(project: ProjectDefinition, repository: any): string {
    return `# ${project.title}

![CI](${repository.githubUrl}/workflows/CI/badge.svg)
![Security](${repository.githubUrl}/workflows/Security/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

${project.description}

## 🚀 Features

${project.features.map(f => `- ✨ ${f}`).join('\n')}

## 📦 Installation

\`\`\`bash
# Clone the repository
git clone ${repository.githubUrl}
cd ${repository.githubName}

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

## 🛠️ Tech Stack

- **Category**: ${project.category}
- **Type**: ${project.subcategory}
- **Template**: ${project.template}

## 📚 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [Usage Guide](docs/USAGE.md)
- [API Documentation](docs/API.md)
- [Contributing](docs/CONTRIBUTING.md)

## 🚀 Deployment

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=${encodeURIComponent(repository.githubUrl)})
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=${encodeURIComponent(repository.githubUrl)})

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏗️ Project Structure

\`\`\`
${repository.githubName}/
├── src/              # Source code
├── tests/            # Test files
├── docs/             # Documentation
├── .github/          # GitHub Actions workflows
└── package.json      # Project configuration
\`\`\`

## 📊 Status

- **Build**: ![Build Status](${repository.githubUrl}/workflows/CI/badge.svg)
- **Coverage**: ![Coverage](https://img.shields.io/codecov/c/github/${repository.githubOwner}/${repository.githubName})
- **Dependencies**: ![Dependencies](https://img.shields.io/david/${repository.githubOwner}/${repository.githubName})

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/corevecta">CoreVecta</a>
</p>`;
  }

  // Helper methods
  private mapCategory(category: string): string {
    const mapping = {
      'Chrome Extension': 'chrome-extensions',
      'Web App': 'web-apps',
      'Mobile App': 'mobile-apps',
      'API/Backend': 'api-backend',
      'Desktop App': 'desktop-apps',
      'VSCode Extension': 'vscode-extensions',
      'CLI Tool': 'cli-tools',
      'AI/ML': 'ai-ml-projects',
      'Blockchain/Web3': 'blockchain-web3',
      'Game': 'games'
    };
    return mapping[category] || 'other';
  }

  private inferSubcategory(project: any): string {
    // Logic to infer subcategory based on project details
    // This would analyze tags, features, etc.
    return 'general';
  }

  private selectTemplate(project: any): string {
    const categoryTemplateMap = {
      'chrome-extensions': 'chrome-extension',
      'web-apps': 'web-app-nextjs',
      'mobile-apps': 'mobile-app-react-native',
      'api-backend': 'api-backend-express',
      'desktop-apps': 'desktop-electron',
      'vscode-extensions': 'vscode-extension',
      'cli-tools': 'cli-tool',
      'ai-ml-projects': 'ai-ml-python',
      'blockchain-web3': 'blockchain-solidity'
    };
    return categoryTemplateMap[this.mapCategory(project.category)] || 'web-app-nextjs';
  }

  private generateRepositoryName(project: ProjectDefinition): string {
    const name = project.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${project.category}-${project.subcategory}-${name}`.substring(0, 100);
  }

  private toPackageName(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private detectFramework(project: ProjectDefinition): string {
    if (project.template.includes('nextjs')) return 'nextjs';
    if (project.template.includes('vite')) return 'vite';
    if (project.template.includes('react')) return 'create-react-app';
    return 'other';
  }

  private getOutputDirectory(project: ProjectDefinition): string {
    const outputMap = {
      'web-app-nextjs': '.next',
      'web-app-vite': 'dist',
      'chrome-extension': 'dist',
      'cli-tool': 'dist'
    };
    return outputMap[project.template] || 'dist';
  }
}

// Export singleton
export const repoAutomation = new RepositoryAutomationService();