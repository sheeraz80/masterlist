import { GitHubClient } from '@/lib/github/github-client';
import { RepositoryService } from './repository-service';
import { prisma } from '@/lib/prisma';
import { CATEGORY_PROJECT_TEMPLATES } from '@/lib/templates/category-templates';
import { getTemplateFiles } from '@/lib/templates/template-files';
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
  problem?: string;
  solution?: string;
  targetUsers?: string;
  revenueModel?: string;
  revenuePotential?: string;
  developmentTime?: string;
  competitionLevel?: string;
  technicalComplexity?: number;
  qualityScore?: number;
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
        keyFeatures: true,
        targetUsers: true,
        revenueModel: true,
        revenuePotential: true,
        developmentTime: true,
        competitionLevel: true,
        technicalComplexity: true,
        qualityScore: true
      }
    });

    return projects.map(project => ({
      id: project.id,
      title: project.title,
      description: `${project.problem} | Solution: ${project.solution}`.replace(/[\n\r\t]/g, ' ').substring(0, 200),
      category: this.mapCategory(project.category),
      subcategory: this.inferSubcategory(project),
      template: this.selectTemplate(project),
      features: project.keyFeatures.split(',').map(f => f.trim()),
      tags: project.tags.split(',').map(t => t.trim()),
      problem: project.problem,
      solution: project.solution,
      targetUsers: project.targetUsers,
      revenueModel: project.revenueModel,
      revenuePotential: project.revenuePotential,
      developmentTime: project.developmentTime,
      competitionLevel: project.competitionLevel,
      technicalComplexity: project.technicalComplexity,
      qualityScore: project.qualityScore
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
    // Reduced batch size and increased delay to avoid secondary rate limits
    const batchSize = 3; // Reduced from 10 to 3
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
      // Increased delay to avoid secondary rate limits
      if (i + batchSize < projects.length) {
        console.log(`Waiting 30 seconds before next batch to avoid rate limits...`);
        await new Promise(resolve => setTimeout(resolve, 30000)); // Increased from 5s to 30s
      }
    }

    return result;
  }

  /**
   * Create a single project repository with all features
   */
  async createProjectRepository(project: ProjectDefinition): Promise<void> {
    // Check if repository already exists in database
    const existingRepo = await prisma.repository.findUnique({
      where: { projectId: project.id }
    });
    
    if (existingRepo) {
      console.log(`  ⚠️  Repository already exists for ${project.title}`);
      return;
    }
    
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
        githubOwner: process.env.GITHUB_PROJECTS_ORG || 'corevecta-projects', // Use org from env
        githubName: githubRepo.name,
        defaultBranch: 'main',
        isPrivate: true,
        category: project.category,
        subcategory: project.subcategory,
        repoPath: `${project.category}/${project.subcategory}/${repoName}`,
        status: 'ACTIVE'
      }
    });

    // Wait for GitHub to fully initialize the repository
    console.log('  Waiting for repository initialization...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 3. Initialize repository content
    await this.initializeRepositoryContent(repository, project);

    // 4. Set up GitHub features
    await this.setupGitHubFeatures(repository.githubOwner, githubRepo.name, project);

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
    const variables = {
      PROJECT_NAME: project.title,
      PROJECT_DESCRIPTION: project.description.substring(0, 200),
      PACKAGE_NAME: this.toPackageName(project.title),
      REPO_URL: repository.githubUrl,
      REPO_NAME: repository.githubName,
      FEATURES_LIST: project.features.map(f => `- ${f}`).join('\n')
    };

    // Create README.md with proper formatting
    const readmeContent = this.generateReadme(project, repository);
    await this.githubClient.createFile({
      owner: repository.githubOwner,
      repo: repository.githubName,
      path: 'README.md',
      message: 'Initial commit: Add README with CoreVecta branding',
      content: readmeContent
    });

    // Get all template files
    const templateFiles = getTemplateFiles(project.template, variables);
    
    // Create all template files
    for (const file of templateFiles) {
      try {
        // Skip if it's a directory marker
        if (file.path.endsWith('/')) continue;
        
        await this.githubClient.createFile({
          owner: repository.githubOwner,
          repo: repository.githubName,
          path: file.path,
          message: `Add ${file.path}`,
          content: file.content
        });
        
        console.log(`  ✓ Created ${file.path}`);
      } catch (error) {
        console.error(`  ✗ Failed to create ${file.path}:`, error.message);
      }
    }

    // Create .github/workflows directory and CI/CD files
    await this.createGitHubWorkflows(repository.githubOwner, repository.githubName, project);
    
    // Create additional configuration files based on project type
    await this.createProjectSpecificFiles(repository, project, variables);
  }

  /**
   * Create project-specific configuration files
   */
  private async createProjectSpecificFiles(
    repository: any,
    project: ProjectDefinition,
    variables: Record<string, string>
  ): Promise<void> {
    // Add CI/CD configuration
    const cicdConfig = this.generateCICDConfig(project);
    if (cicdConfig) {
      await this.githubClient.createFile({
        owner: repository.githubOwner,
        repo: repository.githubName,
        path: '.github/workflows/deploy.yml',
        message: 'Add deployment workflow',
        content: cicdConfig
      });
    }

    // Add CLAUDE.md for AI-assisted development
    const claudeMd = this.generateClaudeMd(project, repository);
    await this.githubClient.createFile({
      owner: repository.githubOwner,
      repo: repository.githubName,
      path: 'CLAUDE.md',
      message: 'Add AI development guide',
      content: claudeMd
    });

    // Add CONTRIBUTING.md
    const contributingMd = this.generateContributingMd(project);
    await this.githubClient.createFile({
      owner: repository.githubOwner,
      repo: repository.githubName,
      path: 'CONTRIBUTING.md',
      message: 'Add contributing guidelines',
      content: contributingMd
    });

    // Add PROJECT_DETAILS.md with comprehensive project information
    const projectDetailsMd = this.generateProjectDetailsMd(project);
    await this.githubClient.createFile({
      owner: repository.githubOwner,
      repo: repository.githubName,
      path: 'PROJECT_DETAILS.md',
      message: 'Add comprehensive project details',
      content: projectDetailsMd
    });

    // Add ENHANCED_PROMPT.md for AI development
    const enhancedPromptMd = this.generateEnhancedPromptMd(project);
    await this.githubClient.createFile({
      owner: repository.githubOwner,
      repo: repository.githubName,
      path: 'ENHANCED_PROMPT.md',
      message: 'Add enhanced AI development prompt',
      content: enhancedPromptMd
    });
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
    // First create .github directory with a placeholder
    try {
      await this.githubClient.createFile({
        owner,
        repo,
        path: '.github/.gitkeep',
        message: 'Create .github directory',
        content: ''
      });
    } catch (error) {
      // Directory might already exist
    }

    // Wait for directory to be created
    await new Promise(resolve => setTimeout(resolve, 2000));

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
      content: ciWorkflow
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
      content: securityWorkflow
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
        content: JSON.stringify(vercelConfig, null, 2)
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
        content: netlifyConfig
      });
    }
  }

  /**
   * Generate comprehensive README
   */
  private generateReadme(project: ProjectDefinition, repository: any): string {
    const quickStartCommands = this.getQuickStartCommands(project.template);
    const techStackDetails = this.getTechStackDetails(project.template);
    const projectStructure = this.getProjectStructureForTemplate(project.template);
    
    return `# ${project.title}

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)
![Node](https://img.shields.io/badge/Node.js-18+-green.svg)
[![CI](https://github.com/${repository.githubOwner}/${repository.githubName}/workflows/CI/badge.svg)](https://github.com/${repository.githubOwner}/${repository.githubName}/actions)

</div>

<p align="center">
  <strong>${project.description.split('|')[0].trim()}</strong>
</p>

## 🎯 Problem & Solution

**Problem:** ${project.problem}

**Solution:** ${project.solution}

## ✨ Key Features

${project.features.map(f => `- **${f}**`).join('\n')}

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
${project.template === 'chrome-extension' ? '- Chrome/Chromium browser for testing' : ''}
${project.template === 'vscode-extension' ? '- VS Code installed' : ''}

### Installation

\`\`\`bash
# Clone the repository
git clone ${repository.githubUrl}
cd ${repository.githubName}

# Install dependencies
npm install

# Start development
${quickStartCommands.dev}
\`\`\`

${project.template === 'chrome-extension' ? `### Chrome Extension Setup

1. Run \`npm run build\` to build the extension
2. Open Chrome and navigate to \`chrome://extensions/\`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the \`dist\` folder
5. The extension is now installed and ready to use!` : ''}

${project.template === 'vscode-extension' ? `### VS Code Extension Setup

1. Run \`npm run compile\` to build the extension
2. Press \`F5\` in VS Code to open a new Extension Development Host window
3. The extension will be automatically loaded in the new window` : ''}

${project.template === 'web-app-nextjs' ? `### Development Server

The development server runs on [http://localhost:3000](http://localhost:3000)

\`\`\`bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
\`\`\`` : ''}

## 🛠️ Technology Stack

${techStackDetails}

## 📁 Project Structure

\`\`\`
${projectStructure}
\`\`\`

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
\`\`\`

## 📦 Building for Production

\`\`\`bash
# Build the project
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check
\`\`\`

## 🚀 Deployment

${project.template === 'web-app-nextjs' ? `### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=${encodeURIComponent(repository.githubUrl)})

### Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=${encodeURIComponent(repository.githubUrl)})` : ''}

${project.template === 'chrome-extension' ? `### Publishing to Chrome Web Store

1. Build the production version: \`npm run build\`
2. Create a zip file of the \`dist\` folder
3. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)` : ''}

${project.template === 'vscode-extension' ? `### Publishing to VS Code Marketplace

1. Install vsce: \`npm install -g vsce\`
2. Build: \`vsce package\`
3. Publish: \`vsce publish\`` : ''}

## 📊 Project Information

- **Quality Score**: ${project.qualityScore ? `${(project.qualityScore * 100).toFixed(1)}%` : 'High'}
- **Technical Complexity**: ${project.technicalComplexity ? `${(project.technicalComplexity * 10).toFixed(1)}/10` : 'Moderate'}
- **Development Time**: ${project.developmentTime || 'TBD'}
- **Target Users**: ${project.targetUsers || 'General users'}

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Part of the [CoreVecta Masterlist](https://github.com/corevecta/masterlist) - 650+ AI-powered project ideas
- Built with modern web technologies and best practices

## 📞 Support

- 📧 Email: support@corevecta.com
- 📖 Documentation: [Project Docs](${repository.githubUrl}/wiki)
- 💬 Issues: [GitHub Issues](${repository.githubUrl}/issues)

---

<div align="center">
  <strong>Built with ❤️ by <a href="https://corevecta.com">CoreVecta LLC</a></strong>
  <br>
  <sub>Empowering developers with AI-ready project templates</sub>
</div>`;
  }

  // Helper methods
  private mapCategory(category: string): string {
    const mapping: Record<string, string> = {
      'Chrome Extension': 'chrome-extensions',
      'Figma Plugin': 'figma-plugins',
      'VSCode Extension': 'vscode-extensions',
      'AI Browser Tools': 'ai-browser-tools',
      'Notion Templates': 'notion-templates',
      'Obsidian Plugin': 'obsidian-plugins',
      'Crypto Browser Tools': 'crypto-browser-tools',
      'Zapier Apps': 'zapier-apps',
      'AI Productivity Tools': 'ai-productivity',
      'AI Writing Tools': 'ai-writing',
      'AI Automation Platforms': 'ai-automation',
      'Web App': 'web-apps',
      'Mobile App': 'mobile-apps',
      'API/Backend': 'api-backend',
      'Desktop App': 'desktop-apps',
      'CLI Tool': 'cli-tools',
      'Blockchain/Web3': 'blockchain-web3',
      'Game': 'games'
    };
    return mapping[category] || 'misc';
  }

  private inferSubcategory(project: any): string {
    // Infer subcategory based on project details
    const title = project.title.toLowerCase();
    const tags = project.tags ? project.tags.toLowerCase() : '';
    const features = project.keyFeatures ? project.keyFeatures.toLowerCase() : '';
    const combined = `${title} ${tags} ${features}`;

    // Common subcategories based on keywords
    if (combined.includes('productivity') || combined.includes('task') || combined.includes('todo')) {
      return 'productivity';
    }
    if (combined.includes('security') || combined.includes('privacy') || combined.includes('vpn')) {
      return 'security';
    }
    if (combined.includes('developer') || combined.includes('code') || combined.includes('debug')) {
      return 'developer-tools';
    }
    if (combined.includes('social') || combined.includes('twitter') || combined.includes('instagram')) {
      return 'social-media';
    }
    if (combined.includes('shopping') || combined.includes('price') || combined.includes('ecommerce')) {
      return 'e-commerce';
    }
    if (combined.includes('finance') || combined.includes('crypto') || combined.includes('wallet')) {
      return 'finance';
    }
    if (combined.includes('design') || combined.includes('ui') || combined.includes('ux')) {
      return 'design';
    }
    if (combined.includes('education') || combined.includes('learn') || combined.includes('study')) {
      return 'education';
    }
    if (combined.includes('health') || combined.includes('fitness') || combined.includes('medical')) {
      return 'health';
    }
    if (combined.includes('game') || combined.includes('play') || combined.includes('fun')) {
      return 'gaming';
    }
    
    return 'general';
  }

  private selectTemplate(project: any): string {
    const categoryTemplateMap: Record<string, string> = {
      'chrome-extensions': 'chrome-extension',
      'figma-plugins': 'figma-plugin',  // Now using proper Figma plugin template
      'vscode-extensions': 'vscode-extension',
      'ai-browser-tools': 'chrome-extension',
      'notion-templates': 'notion-integration',  // Now using proper Notion template
      'obsidian-plugins': 'obsidian-plugin',  // Now using proper Obsidian plugin template
      'crypto-browser-tools': 'chrome-extension',
      'zapier-apps': 'zapier-app',  // Now using proper Zapier app template
      'ai-productivity': 'ai-web-app',  // Now using AI-specific web app template
      'ai-writing': 'ai-web-app',  // Now using AI-specific web app template
      'ai-automation': 'ai-backend-api',  // Now using AI-specific backend template
      'web-apps': 'web-app-nextjs',
      'mobile-apps': 'mobile-app-react-native',
      'api-backend': 'api-backend-express',
      'desktop-apps': 'desktop-electron',
      'cli-tools': 'cli-tool',
      'blockchain-web3': 'blockchain-solidity',
      'games': 'web-app-nextjs'
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
      'cli-tool': 'dist',
      'figma-plugin': 'dist',
      'obsidian-plugin': 'main.js',
      'zapier-app': 'build',
      'notion-integration': '.next',
      'ai-web-app': '.next',
      'ai-backend-api': 'dist',
      'vscode-extension': 'dist',
      'api-backend-express': 'dist'
    };
    return outputMap[project.template] || 'dist';
  }

  /**
   * Generate CI/CD deployment configuration
   */
  private generateCICDConfig(project: ProjectDefinition): string {
    if (project.category === 'web-apps' || project.template === 'web-app-nextjs') {
      return `name: Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
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
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Vercel
      if: github.event_name == 'push'
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: \${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: \${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: \${{ secrets.VERCEL_PROJECT_ID }}`;
    }
    
    return '';
  }

  /**
   * Generate CLAUDE.md for AI-assisted development
   */
  private generateClaudeMd(project: ProjectDefinition, repository: any): string {
    return `# AI Development Guide

This file contains context and guidelines for AI assistants (like Claude) when working on this project.

## Project Overview

**Name**: ${project.title}
**Type**: ${project.category}
**Description**: ${project.description}
**Repository**: ${repository.githubUrl}

## Key Features

${project.features.map(f => `- ${f}`).join('\n')}

## Development Guidelines

### Code Style
- Use TypeScript/JavaScript best practices
- Follow existing code patterns in the repository
- Maintain consistent formatting
- Add appropriate comments for complex logic

### Testing
- Write tests for new features
- Ensure existing tests pass
- Follow TDD when appropriate

### Dependencies
- Minimize external dependencies
- Use well-maintained packages
- Check for security vulnerabilities

### Performance
- Optimize for production builds
- Consider bundle size impact
- Use lazy loading where appropriate

## Project Structure

\`\`\`
${this.getProjectStructureForTemplate(project.template)}
\`\`\`

## Common Tasks

### Adding a New Feature
1. Create feature branch from main
2. Implement feature with tests
3. Update documentation
4. Submit PR with clear description

### Fixing Bugs
1. Reproduce the issue
2. Write failing test
3. Implement fix
4. Verify all tests pass

### Updating Dependencies
1. Check for breaking changes
2. Update package.json
3. Run tests
4. Update lock file

## Deployment

This project is configured for automated deployment via GitHub Actions.
Merges to main branch trigger automatic deployment.

## Contact

Maintained by CoreVecta LLC
Part of the Masterlist platform: https://github.com/corevecta/masterlist`;
  }

  /**
   * Generate CONTRIBUTING.md
   */
  private generateContributingMd(project: ProjectDefinition): string {
    return `# Contributing to ${project.title}

Thank you for your interest in contributing to ${project.title}!

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup

\`\`\`bash
# Clone the repository
git clone <your-fork-url>
cd ${this.toPackageName(project.title)}

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

## Code Style

- Use TypeScript/JavaScript best practices
- Follow existing patterns in the codebase
- Run \`npm run lint\` before committing
- Ensure all tests pass with \`npm test\`

## Pull Request Process

1. Update documentation for any new features
2. Add tests for new functionality
3. Ensure CI passes
4. Request review from maintainers

## Code of Conduct

Be respectful and inclusive. We welcome contributions from everyone.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.`;
  }

  /**
   * Get project structure for template
   */
  private getProjectStructureForTemplate(template: string): string {
    const structures = {
      'chrome-extension': `src/
├── manifest.json
├── background.js
├── content.js
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
└── icons/`,
      'web-app-nextjs': `src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
├── lib/
└── public/`,
      'vscode-extension': `src/
├── extension.ts
├── commands/
├── providers/
└── test/`,
      'api-backend-express': `src/
├── index.ts
├── routes/
├── middleware/
├── services/
└── utils/`,
      'figma-plugin': `src/
├── code.ts
├── ui.html
├── ui.css
├── ui.ts
└── types/`,
      'obsidian-plugin': `src/
├── main.ts
├── modal.ts
├── settings.ts
├── styles.css
└── types/`,
      'zapier-app': `src/
├── index.js
├── triggers/
├── actions/
├── searches/
└── test/`,
      'notion-integration': `src/
├── app/
├── lib/
│   └── notion.ts
├── components/
└── pages/
    └── api/
        └── notion/`,
      'ai-web-app': `src/
├── app/
│   ├── api/
│   │   └── ai/
│   └── chat/
├── components/
├── lib/
│   └── ai/
└── hooks/`,
      'ai-backend-api': `src/
├── index.ts
├── routes/
│   └── ai/
├── services/
│   └── ai/
├── middleware/
└── utils/`
    };
    
    return structures[template] || 'src/';
  }

  /**
   * Generate PROJECT_DETAILS.md with comprehensive project information
   */
  private generateProjectDetailsMd(project: ProjectDefinition): string {
    return `# Project Details: ${project.title}

## 🎯 Problem Statement
${project.problem}

## 💡 Solution
${project.solution}

## 📊 Project Metrics

| Metric | Value |
|--------|-------|
| **Quality Score** | ${project.qualityScore ? `${(project.qualityScore * 100).toFixed(1)}%` : 'N/A'} |
| **Technical Complexity** | ${project.technicalComplexity ? `${(project.technicalComplexity * 10).toFixed(1)}/10` : 'N/A'} |
| **Competition Level** | ${project.competitionLevel || 'N/A'} |
| **Development Time** | ${project.developmentTime || 'N/A'} |

## 🎯 Target Audience
${project.targetUsers || 'General users'}

## 💰 Business Model

### Revenue Model
${project.revenueModel || 'To be determined'}

### Revenue Potential
${project.revenuePotential || 'To be determined'}

## 🚀 Key Features
${project.features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## 🏷️ Tags
${project.tags.map(t => `\`${t}\``).join(' ')}

## 🛠️ Technical Stack
- **Category**: ${project.category}
- **Project Type**: ${project.subcategory}
- **Template**: ${project.template}

## 📈 Market Analysis

### Competition Analysis
- **Competition Level**: ${project.competitionLevel || 'Medium'}
- **Market Gap**: The problem this project solves is not adequately addressed by existing solutions

### Growth Potential
Based on the quality score of ${project.qualityScore ? `${(project.qualityScore * 100).toFixed(1)}%` : 'N/A'} and the identified market need, 
this project has significant growth potential.

## 🔄 Development Roadmap

### Phase 1: MVP (${project.developmentTime || '1-2 months'})
- Core functionality implementation
- Basic UI/UX
- Essential features only

### Phase 2: Enhancement
- Additional features based on user feedback
- Performance optimization
- Improved user experience

### Phase 3: Scale
- Advanced features
- Integration capabilities
- Market expansion

## 📚 Additional Resources
- [README](README.md) - General project overview
- [ENHANCED_PROMPT](ENHANCED_PROMPT.md) - AI development guide
- [CLAUDE](CLAUDE.md) - AI assistant instructions
- [CONTRIBUTING](CONTRIBUTING.md) - Contribution guidelines

---

*This project is part of the CoreVecta Masterlist platform - a comprehensive collection of 650+ AI-powered project ideas.*`;
  }

  /**
   * Generate ENHANCED_PROMPT.md for AI development
   */
  private generateEnhancedPromptMd(project: ProjectDefinition): string {
    const techStackPrompts = {
      'chrome-extension': `- Use Chrome Extension Manifest V3
- Implement proper content security policy
- Follow Chrome Web Store guidelines
- Use webpack for bundling
- Implement proper message passing between content scripts and background`,
      'web-app-nextjs': `- Use Next.js 14 with App Router
- Implement server components where appropriate
- Use Tailwind CSS for styling
- Follow React best practices
- Implement proper SEO with metadata
- Use TypeScript for type safety`,
      'vscode-extension': `- Follow VS Code extension guidelines
- Use VS Code API properly
- Implement activation events correctly
- Handle workspace and global state
- Follow VS Code UX guidelines`,
      'api-backend-express': `- Use Express.js with TypeScript
- Implement proper error handling
- Use middleware for common functionality
- Follow RESTful API design principles
- Implement proper authentication/authorization
- Use environment variables for configuration`
    };

    return `# Enhanced AI Development Prompt

## 🎯 Project: ${project.title}

### Core Objective
Create a ${project.category} that solves the following problem: ${project.problem}

The solution should: ${project.solution}

### 🎨 Development Guidelines

#### Technical Requirements
${techStackPrompts[project.template] || '- Follow best practices for the chosen technology stack'}

#### Key Features to Implement
${project.features.map((f, i) => `${i + 1}. **${f}**\n   - Consider user experience when implementing this feature\n   - Ensure it integrates seamlessly with other features`).join('\n')}

#### Target User Considerations
- **Primary Users**: ${project.targetUsers || 'General users'}
- Design the interface to be intuitive for these users
- Consider their technical expertise level
- Optimize workflows for their use cases

#### Quality Standards
- **Code Quality**: Maintain clean, readable, and well-documented code
- **Performance**: Optimize for speed and efficiency (Technical Complexity: ${project.technicalComplexity ? `${(project.technicalComplexity * 10).toFixed(1)}/10` : 'N/A'})
- **Security**: Implement security best practices
- **Accessibility**: Ensure WCAG 2.1 AA compliance where applicable

### 💼 Business Context

#### Revenue Implementation
- **Model**: ${project.revenueModel || 'To be determined'}
- Consider how to implement monetization without degrading user experience
- Build in analytics to track key business metrics

#### Competition Awareness
- **Competition Level**: ${project.competitionLevel || 'Medium'}
- Differentiate by focusing on unique value proposition
- Study competitor weaknesses and address them

### 🚀 Implementation Strategy

1. **Start with Core Functionality**
   - Focus on the primary problem/solution first
   - Build MVP with essential features only

2. **Iterative Development**
   - Use agile methodology
   - Get feedback early and often
   - Iterate based on user testing

3. **Technical Best Practices**
   - Write tests for critical functionality
   - Use version control effectively
   - Document as you build
   - Follow coding standards for ${project.template}

### 📋 Specific Implementation Notes

#### For ${project.category} Projects:
${project.category === 'Chrome Extension' ? `- Ensure manifest.json is properly configured
- Handle permissions appropriately
- Test across different websites
- Consider Chrome Web Store requirements` : ''}
${project.category === 'AI Browser Tools' ? `- Implement efficient AI model integration
- Consider API rate limits and costs
- Provide fallbacks for AI failures
- Ensure user privacy with AI processing` : ''}
${project.category === 'Figma Plugin' ? `- Use Figma Plugin API effectively
- Handle large documents efficiently
- Provide real-time preview when possible
- Follow Figma design guidelines` : ''}
${project.category === 'VSCode Extension' ? `- Integrate seamlessly with VS Code workflow
- Use VS Code theming
- Provide helpful error messages
- Consider multi-workspace scenarios` : ''}

### 🎯 Success Criteria
- Solves the stated problem effectively
- Provides excellent user experience
- Meets quality score target of ${project.qualityScore ? `${(project.qualityScore * 100).toFixed(1)}%` : 'high quality'}
- Can be developed within ${project.developmentTime || 'reasonable timeframe'}
- Has clear path to ${project.revenuePotential || 'monetization'}

### 🤖 AI Assistant Instructions
When implementing this project:
1. Always refer back to the core problem and solution
2. Make decisions that benefit the target users
3. Balance feature completeness with development time
4. Consider long-term maintainability
5. Follow the technical stack specified for ${project.template}

Remember: The goal is to create a high-quality solution that users will love and that can grow into a sustainable product.`;
  }

  /**
   * Get quick start commands for different templates
   */
  private getQuickStartCommands(template: string): { dev: string; build: string; test: string } {
    const commands: Record<string, { dev: string; build: string; test: string }> = {
      'chrome-extension': {
        dev: 'npm run dev',
        build: 'npm run build',
        test: 'npm test'
      },
      'web-app-nextjs': {
        dev: 'npm run dev',
        build: 'npm run build',
        test: 'npm test'
      },
      'vscode-extension': {
        dev: 'npm run watch',
        build: 'npm run compile',
        test: 'npm test'
      },
      'api-backend-express': {
        dev: 'npm run dev',
        build: 'npm run build',
        test: 'npm test'
      },
      'figma-plugin': {
        dev: 'npm run dev',
        build: 'npm run build',
        test: 'npm test'
      },
      'obsidian-plugin': {
        dev: 'npm run dev',
        build: 'npm run build',
        test: 'npm test'
      },
      'zapier-app': {
        dev: 'zapier test',
        build: 'zapier build',
        test: 'zapier test'
      },
      'notion-integration': {
        dev: 'npm run dev',
        build: 'npm run build',
        test: 'npm test'
      },
      'ai-web-app': {
        dev: 'npm run dev',
        build: 'npm run build',
        test: 'npm test'
      },
      'ai-backend-api': {
        dev: 'npm run dev',
        build: 'npm run build',
        test: 'npm test'
      }
    };
    
    return commands[template] || commands['web-app-nextjs'];
  }

  /**
   * Get technology stack details for README
   */
  private getTechStackDetails(template: string): string {
    const stacks: Record<string, string> = {
      'chrome-extension': `- **Frontend**: Vanilla JavaScript/TypeScript, HTML5, CSS3
- **Build Tool**: Webpack 5
- **Chrome APIs**: Extension APIs, Storage API, Tabs API
- **Testing**: Jest for unit tests
- **Linting**: ESLint with TypeScript support`,
      
      'web-app-nextjs': `- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.0
- **UI Components**: Radix UI
- **State Management**: React Context / Zustand
- **Testing**: Jest & React Testing Library
- **Deployment**: Vercel / Netlify`,
      
      'vscode-extension': `- **Platform**: VS Code Extension API
- **Language**: TypeScript
- **Build System**: TypeScript Compiler
- **Testing**: VS Code Extension Test Framework
- **Package Manager**: npm/yarn`,
      
      'api-backend-express': `- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL / MongoDB (configurable)
- **Authentication**: JWT
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest & Supertest`,
      
      'figma-plugin': `- **Platform**: Figma Plugin API
- **Language**: TypeScript
- **UI Framework**: React (for UI)
- **Build System**: TypeScript Compiler
- **Figma APIs**: Scene Node APIs, UI APIs, Network APIs
- **Testing**: Jest for unit tests`,
      
      'obsidian-plugin': `- **Platform**: Obsidian Plugin API
- **Language**: TypeScript
- **Build Tool**: esbuild
- **Obsidian APIs**: Vault API, Editor API, Workspace API
- **Testing**: Jest
- **Development**: Hot reload support`,
      
      'zapier-app': `- **Platform**: Zapier CLI Platform
- **Language**: JavaScript/Node.js
- **Zapier CLI**: Version 14.x
- **Authentication**: OAuth2 / API Key
- **Testing**: Jest with Zapier test utilities
- **Deployment**: Zapier Platform`,
      
      'notion-integration': `- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Notion API SDK
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Notion as backend
- **Authentication**: Notion OAuth
- **Deployment**: Vercel`,
      
      'ai-web-app': `- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0+
- **AI Integration**: OpenAI API / Anthropic Claude
- **UI**: React Server Components, Streaming UI
- **Styling**: Tailwind CSS 3.0
- **State Management**: Zustand
- **Real-time**: Server-Sent Events
- **Deployment**: Vercel Edge Functions`,
      
      'ai-backend-api': `- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **AI Services**: OpenAI, Claude, LangChain
- **Database**: PostgreSQL with Prisma ORM
- **Vector DB**: Pinecone / Weaviate
- **Queue**: Bull for background jobs
- **Caching**: Redis
- **Monitoring**: OpenTelemetry`
    };
    
    return stacks[template] || stacks['web-app-nextjs'];
  }
}

// Export singleton
export const repoAutomation = new RepositoryAutomationService();