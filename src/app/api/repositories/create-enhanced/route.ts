import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { optionalAuth } from '@/lib/middleware/auth';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { logError } from '@/lib/logger';
import { enhancedRepositoryService } from '@/lib/services/enhanced-repository-service';
import { AuthUser } from '@/types';
import { z } from 'zod';
import { getTemplate, generateRepositoryFiles } from '@/lib/templates/repository-templates';

// Validation schema
const createEnhancedRepoSchema = z.object({
  projectId: z.string().min(1),
  template: z.string().min(1),
  settings: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    isPrivate: z.boolean(),
    autoInit: z.boolean(),
    license: z.string().optional(),
    gitignore: z.string().optional(),
    branch: z.string().default('main')
  }),
  setupOptions: z.array(z.string()),
  techStack: z.array(z.string()),
  projectMetadata: z.object({
    category: z.string(),
    tags: z.array(z.string()),
    complexity: z.number()
  })
});

// Legacy template configurations (kept for backward compatibility)
const LEGACY_TEMPLATE_CONFIGS = {
  webapp: {
    files: {
      'README.md': (name: string, desc: string) => `# ${name}

${desc}

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL

### Installation
\`\`\`bash
npm install
\`\`\`

### Development
\`\`\`bash
npm run dev
\`\`\`

### Production
\`\`\`bash
npm run build
npm start
\`\`\`

## Tech Stack
- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL

## License
MIT`,
      '.gitignore': `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output

# Production
build/
dist/
.next/
out/

# Misc
.DS_Store
*.pem
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDEs
.vscode/
.idea/
*.swp
*.swo

# TypeScript
*.tsbuildinfo
next-env.d.ts`,
      'package.json': (name: string) => JSON.stringify({
        name,
        version: '1.0.0',
        private: true,
        scripts: {
          dev: 'next dev --turbo',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
          test: 'jest',
          'test:watch': 'jest --watch',
          'prisma:generate': 'prisma generate',
          'prisma:push': 'prisma db push',
          'type-check': 'tsc --noEmit'
        },
        dependencies: {
          next: '^15.0.0',
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          '@prisma/client': '^6.0.0',
          'tailwindcss': '^4.0.0',
          '@radix-ui/react-slot': '^1.1.0',
          'class-variance-authority': '^0.7.0',
          'clsx': '^2.1.1',
          'tailwind-merge': '^2.5.0',
          'lucide-react': '^0.400.0',
          'zod': '^3.23.0',
          '@tanstack/react-query': '^5.51.0'
        },
        devDependencies: {
          '@types/node': '^22.0.0',
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          'typescript': '^5.5.0',
          'eslint': '^9.0.0',
          'eslint-config-next': '^15.0.0',
          'prisma': '^6.0.0',
          'jest': '^29.7.0',
          '@testing-library/react': '^16.0.0',
          '@testing-library/jest-dom': '^6.4.0',
          'prettier': '^3.3.0',
          '@typescript-eslint/parser': '^8.0.0',
          '@typescript-eslint/eslint-plugin': '^8.0.0'
        }
      }, null, 2),
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          lib: ['dom', 'dom.iterable', 'ES2022'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          plugins: [{ name: 'next' }],
          paths: { '@/*': ['./src/*'] },
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
          useDefineForClassFields: true,
          verbatimModuleSyntax: true
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules']
      }, null, 2),
      '.env.example': `# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Optional: Analytics
NEXT_PUBLIC_GA_ID=`
    },
    workflows: {
      '.github/workflows/ci.yml': `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '22'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Type check
      run: npm run type-check
    
    - name: Run linter
      run: npm run lint
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
      
    - name: Upload coverage
      uses: codecov/codecov-action@v4
      if: always()
      with:
        token: \${{ secrets.CODECOV_TOKEN }}`
    }
  },
  api: {
    files: {
      'README.md': (name: string, desc: string) => `# ${name}

${desc}

## API Documentation

### Base URL
\`\`\`
http://localhost:3000/api
\`\`\`

### Authentication
All endpoints require JWT authentication:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Endpoints

### GET /health
Health check endpoint

### POST /auth/login
Login endpoint

### GET /users
Get all users (requires admin)

## Development

### Install
\`\`\`bash
npm install
\`\`\`

### Run
\`\`\`bash
npm run dev
\`\`\`

### Test
\`\`\`bash
npm test
\`\`\``,
      'package.json': (name: string) => JSON.stringify({
        name,
        version: '1.0.0',
        scripts: {
          dev: 'tsx watch src/index.ts',
          build: 'tsc && tsc-alias',
          start: 'node dist/index.js',
          test: 'vitest',
          'test:ui': 'vitest --ui',
          lint: 'eslint src --ext .ts',
          'type-check': 'tsc --noEmit'
        },
        dependencies: {
          express: '^4.21.0',
          'express-rate-limit': '^7.4.0',
          'jsonwebtoken': '^9.0.2',
          'bcryptjs': '^2.4.3',
          'cors': '^2.8.5',
          'helmet': '^8.0.0',
          'morgan': '^1.10.0',
          'dotenv': '^16.4.5',
          '@prisma/client': '^6.0.0',
          'zod': '^3.23.0',
          'winston': '^3.14.0',
          'compression': '^1.7.4'
        },
        devDependencies: {
          '@types/express': '^5.0.0',
          '@types/node': '^22.0.0',
          'typescript': '^5.5.0',
          'tsx': '^4.16.0',
          'tsc-alias': '^1.8.10',
          'eslint': '^9.0.0',
          '@typescript-eslint/parser': '^8.0.0',
          '@typescript-eslint/eslint-plugin': '^8.0.0',
          'vitest': '^2.0.0',
          '@vitest/ui': '^2.0.0',
          'supertest': '^7.0.0',
          '@types/bcryptjs': '^2.4.6',
          '@types/cors': '^2.8.17',
          '@types/morgan': '^1.9.9',
          '@types/compression': '^1.7.5'
        }
      }, null, 2)
    }
  }
};

// Add a new GitHub status check endpoint
export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const { searchParams } = new URL(request.url);
      const action = searchParams.get('action');
      
      if (action === 'github-status') {
        const status = await enhancedRepositoryService.getGitHubStatus();
        return NextResponse.json({
          githubStatus: status,
          setupInstructions: status.isConfigured ? null : enhancedRepositoryService.getSetupInstructions()
        });
      }
      
      return NextResponse.json(
        { error: 'Invalid action. Use ?action=github-status' },
        { status: 400 }
      );
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to check GitHub status' },
        { status: 500 }
      );
    }
  }),
  rateLimits.read
);

export const POST = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      // Parse and validate request body
      const body = await request.json();
      const validation = createEnhancedRepoSchema.safeParse(body);
      
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.errors[0].message },
          { status: 400 }
        );
      }

      const { projectId, template, settings, setupOptions, techStack, projectMetadata } = validation.data;

      // Check if project exists
      // For now, allow any user to create repositories for any project
      // In production, you may want to restrict this based on user permissions
      const project = await prisma.project.findFirst({
        where: {
          id: projectId
        }
      });

      if (!project) {
        return NextResponse.json(
          { error: 'Project not found or access denied' },
          { status: 404 }
        );
      }

      // Check if repository already exists
      const existingRepo = await prisma.repository.findFirst({
        where: { projectId }
      });

      if (existingRepo) {
        return NextResponse.json(
          { error: 'Repository already exists for this project' },
          { status: 409 }
        );
      }

      // Use enhanced repository service for better error handling
      const result = await enhancedRepositoryService.createRepository(project, {
        useGitHub: true,
        fallbackToLocal: true,
        repositoryName: settings.name,
        templateName: template,
        description: settings.description || `${project.title} - ${template} project`,
        isPrivate: settings.isPrivate,
        includeReadme: settings.autoInit,
        includeGitignore: !!settings.gitignore,
        includeLicense: !!settings.license
      });

      if (!result.success) {
        const githubStatus = await enhancedRepositoryService.getGitHubStatus();
        return NextResponse.json({
          error: result.error,
          mode: result.mode,
          warnings: result.warnings,
          githubStatus,
          setupInstructions: githubStatus.isConfigured ? null : enhancedRepositoryService.getSetupInstructions(),
          fallbackOptions: {
            createLocal: true,
            linkExisting: true,
            setupGitHub: true
          }
        }, { status: 400 });
      }

      // Update repository with template information
      const updatedRepository = await prisma.repository.update({
        where: { id: result.repository!.id },
        data: {
          templateUsed: template
        }
      });
      
      // Store additional metadata as repository tags
      if (techStack && techStack.length > 0) {
        await Promise.all(techStack.map(tech => 
          prisma.repositoryTag.create({
            data: {
              repositoryId: result.repository!.id,
              name: `tech:${tech}`,
              value: tech,
              type: 'TECH_STACK'
            }
          }).catch(() => {}) // Ignore duplicate errors
        ));
      }
      
      if (setupOptions && setupOptions.length > 0) {
        await Promise.all(setupOptions.map(option => 
          prisma.repositoryTag.create({
            data: {
              repositoryId: result.repository!.id,
              name: `setup:${option}`,
              value: option,
              type: 'SETUP'
            }
          }).catch(() => {}) // Ignore duplicate errors
        ));
      }

      // Create initial activity
      if (user) {
        await prisma.activity.create({
          data: {
            projectId,
            userId: user.id,
            type: 'repository_created',
            description: `Created repository with ${template} template (${result.mode} mode)`,
            metadata: JSON.stringify({
              repositoryId: result.repository!.id,
              template,
              mode: result.mode,
              warnings: result.warnings
            })
          }
        });
      }

      return NextResponse.json({
        repository: updatedRepository,
        githubUrl: result.githubUrl,
        mode: result.mode,
        warnings: result.warnings,
        message: result.mode === 'github' 
          ? 'Repository created successfully with template' 
          : 'Repository created locally (GitHub not configured)'
      }, { status: 201 });

    } catch (error) {
      logError(error as Error, {
        context: 'create_enhanced_repository',
        userId: user?.id || 'anonymous'
      });
      
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to create repository' },
        { status: 500 }
      );
    }
  })
);