// Repository template system - July 2025 versions
// This replaces the previous approach of creating actual GitHub repos for templates

export interface RepositoryTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  features: string[];
  techStack: string[];
  setupOptions: string[];
  files: Record<string, string | ((name: string, desc: string) => string)>;
  workflows?: Record<string, string>;
  configuration?: {
    requiredEnvVars?: string[];
    recommendedExtensions?: string[];
    dockerSupport?: boolean;
    testingFramework?: string;
  };
}

// Modern template library with July 2025 tech stack
export const REPOSITORY_TEMPLATES: Record<string, RepositoryTemplate> = {
  'webapp-nextjs': {
    id: 'webapp-nextjs',
    name: 'Next.js 15 Full-Stack App',
    description: 'Modern web application with Next.js 15, React 19, and Tailwind CSS 4',
    category: 'Web App',
    icon: 'Globe',
    features: [
      'Next.js 15 with App Router',
      'React 19 with Server Components',
      'TypeScript 5.5',
      'Tailwind CSS 4',
      'Prisma 6 ORM',
      'Radix UI Components',
      'Server Actions',
      'Streaming SSR',
      'Edge Runtime Support'
    ],
    techStack: ['Next.js', 'React', 'TypeScript', 'PostgreSQL', 'Tailwind CSS'],
    setupOptions: ['auth', 'database', 'analytics', 'ci_cd', 'docker'],
    files: {
      'package.json': (name: string) => JSON.stringify({
        name,
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev --turbo',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
          'type-check': 'tsc --noEmit',
          test: 'vitest',
          'test:ui': 'vitest --ui',
          'db:push': 'prisma db push',
          'db:studio': 'prisma studio'
        },
        dependencies: {
          'next': '^15.0.0',
          'react': '^19.0.0',
          'react-dom': '^19.0.0',
          '@prisma/client': '^6.0.0',
          'tailwindcss': '^4.0.0',
          '@radix-ui/react-dialog': '^1.1.0',
          '@radix-ui/react-dropdown-menu': '^2.1.0',
          '@radix-ui/react-select': '^2.1.0',
          '@radix-ui/react-tabs': '^1.1.0',
          '@radix-ui/react-tooltip': '^1.1.0',
          'class-variance-authority': '^0.7.0',
          'clsx': '^2.1.1',
          'tailwind-merge': '^2.5.0',
          'lucide-react': '^0.400.0',
          'zod': '^3.23.0',
          '@tanstack/react-query': '^5.51.0',
          'framer-motion': '^11.3.0',
          'date-fns': '^3.6.0',
          'react-hook-form': '^7.52.0',
          '@hookform/resolvers': '^3.9.0'
        },
        devDependencies: {
          '@types/node': '^22.0.0',
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          'typescript': '^5.5.0',
          'eslint': '^9.0.0',
          'eslint-config-next': '^15.0.0',
          'prisma': '^6.0.0',
          'vitest': '^2.0.0',
          '@vitejs/plugin-react': '^4.3.0',
          '@testing-library/react': '^16.0.0',
          '@testing-library/jest-dom': '^6.4.0',
          'prettier': '^3.3.0',
          'prettier-plugin-tailwindcss': '^0.6.0',
          '@typescript-eslint/parser': '^8.0.0',
          '@typescript-eslint/eslint-plugin': '^8.0.0',
          'autoprefixer': '^10.4.19',
          'postcss': '^8.4.39'
        }
      }, null, 2),
      'tsconfig.json': JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          lib: ['dom', 'dom.iterable', 'ES2022'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          plugins: [{ name: 'next' }],
          paths: { '@/*': ['./src/*'] }
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules']
      }, null, 2),
      'README.md': (name: string, desc: string) => `# ${name}

${desc}

## 🚀 Features

- **Next.js 15** - Latest features including Turbopack
- **React 19** - Server Components and Actions
- **TypeScript 5.5** - Type safety and modern features
- **Tailwind CSS 4** - Utility-first styling
- **Prisma 6** - Type-safe database ORM
- **Radix UI** - Accessible component library

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 15+
- pnpm (recommended) or npm

## 🛠️ Installation

\`\`\`bash
# Clone the repository
git clone <repository-url>
cd ${name}

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Set up database
pnpm db:push

# Run development server
pnpm dev
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utility functions
├── hooks/           # Custom React hooks
├── types/           # TypeScript types
└── styles/          # Global styles
\`\`\`

## 🧪 Testing

\`\`\`bash
# Run tests
pnpm test

# Run tests with UI
pnpm test:ui
\`\`\`

## 📦 Deployment

\`\`\`bash
# Build for production
pnpm build

# Start production server
pnpm start
\`\`\`

## 📄 License

MIT`
    },
    workflows: {
      '.github/workflows/ci.yml': `name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '22'

jobs:
  lint-and-type:
    name: Lint and Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v4
        with:
          version: 9
          
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run ESLint
        run: pnpm lint
        
      - name: Run type check
        run: pnpm type-check

  test:
    name: Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v4
        with:
          version: 9
          
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run tests
        run: pnpm test --run
        
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: \${{ secrets.CODECOV_TOKEN }}

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint-and-type, test]
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v4
        with:
          version: 9
          
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build application
        run: pnpm build
        
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: .next/`
    },
    configuration: {
      requiredEnvVars: ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'],
      recommendedExtensions: [
        'dbaeumer.vscode-eslint',
        'esbenp.prettier-vscode',
        'bradlc.vscode-tailwindcss',
        'prisma.prisma'
      ],
      dockerSupport: true,
      testingFramework: 'vitest'
    }
  },

  'api-express': {
    id: 'api-express',
    name: 'Express.js REST API',
    description: 'High-performance REST API with Express 4.21, TypeScript 5.5, and Prisma 6',
    category: 'API/Backend',
    icon: 'Database',
    features: [
      'Express 4.21',
      'TypeScript 5.5',
      'Prisma 6 ORM',
      'JWT Authentication',
      'Rate Limiting',
      'Request Validation (Zod)',
      'Error Handling',
      'API Documentation',
      'Health Checks'
    ],
    techStack: ['Node.js', 'Express', 'TypeScript', 'PostgreSQL'],
    setupOptions: ['auth', 'database', 'swagger', 'monitoring', 'docker'],
    files: {
      'package.json': (name: string) => JSON.stringify({
        name,
        version: '1.0.0',
        description: 'High-performance REST API',
        main: 'dist/index.js',
        scripts: {
          dev: 'tsx watch src/server.ts',
          build: 'tsc',
          start: 'node dist/server.js',
          test: 'vitest',
          'test:coverage': 'vitest --coverage',
          lint: 'eslint src --ext .ts',
          'type-check': 'tsc --noEmit',
          'db:generate': 'prisma generate',
          'db:push': 'prisma db push',
          'db:migrate': 'prisma migrate dev'
        },
        dependencies: {
          'express': '^4.21.0',
          '@prisma/client': '^6.0.0',
          'cors': '^2.8.5',
          'helmet': '^8.0.0',
          'compression': '^1.7.4',
          'express-rate-limit': '^7.4.0',
          'jsonwebtoken': '^9.0.2',
          'bcryptjs': '^2.4.3',
          'zod': '^3.23.0',
          'dotenv': '^16.4.5',
          'winston': '^3.14.0',
          'express-async-errors': '^3.1.1',
          'express-validator': '^7.2.0'
        },
        devDependencies: {
          '@types/express': '^5.0.0',
          '@types/node': '^22.0.0',
          '@types/cors': '^2.8.17',
          '@types/compression': '^1.7.5',
          '@types/bcryptjs': '^2.4.6',
          'typescript': '^5.5.0',
          'tsx': '^4.16.0',
          'prisma': '^6.0.0',
          'eslint': '^9.0.0',
          '@typescript-eslint/parser': '^8.0.0',
          '@typescript-eslint/eslint-plugin': '^8.0.0',
          'vitest': '^2.0.0',
          '@vitest/coverage-v8': '^2.0.0',
          'supertest': '^7.0.0',
          '@types/supertest': '^6.0.2',
          'prettier': '^3.3.0'
        }
      }, null, 2),
      'src/server.ts': `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import 'express-async-errors';
import { config } from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error';
import { authRouter } from './routes/auth';
import { apiRouter } from './routes/api';
import { healthRouter } from './routes/health';

config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api', limiter);

// Body parsing and compression
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Routes
app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/api', apiRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(\`Server running on port \${PORT}\`);
});

export default app;`
    }
  },

  'mobile-react-native': {
    id: 'mobile-react-native',
    name: 'React Native Mobile App',
    description: 'Cross-platform mobile app with React Native 0.75 and Expo SDK 52',
    category: 'Mobile App',
    icon: 'Smartphone',
    features: [
      'React Native 0.75',
      'Expo SDK 52',
      'TypeScript 5.5',
      'React Navigation 7',
      'Expo Router',
      'Native Wind (Tailwind)',
      'Zustand State Management',
      'Biometric Authentication',
      'Push Notifications'
    ],
    techStack: ['React Native', 'TypeScript', 'Expo'],
    setupOptions: ['auth', 'navigation', 'push_notifications', 'analytics'],
    files: {
      'package.json': (name: string) => JSON.stringify({
        name,
        version: '1.0.0',
        main: 'expo-router/entry',
        scripts: {
          start: 'expo start',
          android: 'expo start --android',
          ios: 'expo start --ios',
          web: 'expo start --web',
          test: 'jest --watchAll',
          lint: 'eslint . --ext .ts,.tsx',
          'type-check': 'tsc --noEmit'
        },
        dependencies: {
          'expo': '~52.0.0',
          'expo-status-bar': '~2.0.0',
          'react': '19.0.0',
          'react-native': '0.75.0',
          'expo-router': '~4.0.0',
          'expo-linking': '~7.0.0',
          'expo-constants': '~17.0.0',
          'react-native-safe-area-context': '4.11.0',
          'react-native-screens': '~4.0.0',
          '@react-navigation/native': '^7.0.0',
          'nativewind': '^4.0.0',
          'zustand': '^5.0.0',
          'react-native-mmkv': '^3.0.0',
          'expo-secure-store': '~14.0.0',
          'expo-local-authentication': '~15.0.0',
          'expo-notifications': '~0.29.0',
          'react-native-gesture-handler': '~2.18.0',
          'react-native-reanimated': '~3.15.0'
        },
        devDependencies: {
          '@babel/core': '^7.25.0',
          '@types/react': '~19.0.0',
          '@types/react-native': '~0.75.0',
          'typescript': '^5.5.0',
          'eslint': '^9.0.0',
          'eslint-config-expo': '^8.0.0',
          'jest': '^29.7.0',
          'jest-expo': '~52.0.0',
          '@testing-library/react-native': '^12.5.0',
          'prettier': '^3.3.0'
        }
      }, null, 2),
      'app.json': (name: string, desc: string) => JSON.stringify({
        expo: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          version: '1.0.0',
          orientation: 'portrait',
          icon: './assets/icon.png',
          userInterfaceStyle: 'automatic',
          splash: {
            image: './assets/splash.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff'
          },
          ios: {
            supportsTablet: true,
            bundleIdentifier: `com.yourcompany.${name.toLowerCase().replace(/\s+/g, '')}`
          },
          android: {
            adaptiveIcon: {
              foregroundImage: './assets/adaptive-icon.png',
              backgroundColor: '#ffffff'
            },
            package: `com.yourcompany.${name.toLowerCase().replace(/\s+/g, '')}`
          },
          web: {
            bundler: 'metro',
            favicon: './assets/favicon.png'
          },
          plugins: [
            'expo-router',
            'expo-secure-store',
            'expo-local-authentication'
          ]
        }
      }, null, 2)
    }
  },

  'ai-ml-python': {
    id: 'ai-ml-python',
    name: 'AI/ML Python Project',
    description: 'AI/ML project with Python 3.12, PyTorch 2.4, and modern ML tools',
    category: 'AI/ML',
    icon: 'Brain',
    features: [
      'Python 3.12',
      'PyTorch 2.4',
      'Transformers 4.44',
      'LangChain 0.3',
      'FastAPI',
      'Jupyter Lab',
      'MLflow Tracking',
      'Docker Support',
      'GPU Optimization'
    ],
    techStack: ['Python', 'PyTorch', 'FastAPI', 'Docker'],
    setupOptions: ['jupyter', 'mlflow', 'docker', 'gpu_support'],
    files: {
      'pyproject.toml': (name: string) => `[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "${name}"
version = "0.1.0"
description = "AI/ML project with modern Python stack"
readme = "README.md"
requires-python = ">=3.12"
dependencies = [
    "torch>=2.4.0",
    "transformers>=4.44.0",
    "langchain>=0.3.0",
    "langchain-community>=0.3.0",
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.31.0",
    "numpy>=2.0.0",
    "pandas>=2.2.0",
    "scikit-learn>=1.5.0",
    "matplotlib>=3.9.0",
    "seaborn>=0.13.0",
    "jupyter>=1.1.0",
    "jupyterlab>=4.2.0",
    "mlflow>=2.16.0",
    "wandb>=0.18.0",
    "python-dotenv>=1.0.0",
    "pydantic>=2.9.0",
    "pydantic-settings>=2.5.0",
    "httpx>=0.27.0",
    "rich>=13.8.0"
]

[project.optional-dependencies]
dev = [
    "pytest>=8.3.0",
    "pytest-cov>=5.0.0",
    "pytest-asyncio>=0.24.0",
    "black>=24.0.0",
    "ruff>=0.6.0",
    "mypy>=1.11.0",
    "pre-commit>=3.8.0"
]
gpu = [
    "accelerate>=0.34.0",
    "bitsandbytes>=0.44.0",
    "flash-attn>=2.6.0"
]

[tool.ruff]
line-length = 100
target-version = "py312"
select = ["E", "F", "I", "N", "W", "B", "C90", "UP"]

[tool.black]
line-length = 100
target-version = ['py312']

[tool.mypy]
python_version = "3.12"
strict = true
ignore_missing_imports = true`,
      'requirements.txt': `torch>=2.4.0
transformers>=4.44.0
langchain>=0.3.0
fastapi>=0.115.0
uvicorn[standard]>=0.31.0
numpy>=2.0.0
pandas>=2.2.0
scikit-learn>=1.5.0
jupyter>=1.1.0
mlflow>=2.16.0
python-dotenv>=1.0.0
pydantic>=2.9.0`,
      'src/main.py': `"""Main entry point for the AI/ML application."""
import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from src.api import health, inference, training
from src.config import settings
from src.utils.logger import setup_logger

# Load environment variables
load_dotenv()

# Setup logging
logger = setup_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="AI/ML API with modern Python stack"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(inference.router, prefix="/api/v1/inference", tags=["inference"])
app.include_router(training.router, prefix="/api/v1/training", tags=["training"])

@app.on_event("startup")
async def startup_event():
    """Initialize models and services on startup."""
    logger.info(f"Starting {settings.app_name} v{settings.version}")
    # Initialize your models here

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down application")

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info"
    )`
    }
  },

  'microservice-go': {
    id: 'microservice-go',
    name: 'Go Microservice',
    description: 'High-performance microservice with Go 1.23, Fiber, and modern tooling',
    category: 'API/Backend',
    icon: 'Zap',
    features: [
      'Go 1.23',
      'Fiber Web Framework',
      'GORM',
      'JWT Authentication',
      'OpenTelemetry',
      'Prometheus Metrics',
      'gRPC Support',
      'Docker Optimized',
      'Hot Reload'
    ],
    techStack: ['Go', 'PostgreSQL', 'Redis', 'Docker'],
    setupOptions: ['grpc', 'metrics', 'tracing', 'docker'],
    files: {
      'go.mod': (name: string) => `module github.com/yourusername/${name}

go 1.23

require (
    github.com/gofiber/fiber/v3 v3.0.0
    github.com/golang-jwt/jwt/v5 v5.2.1
    gorm.io/gorm v1.25.12
    gorm.io/driver/postgres v1.5.10
    github.com/joho/godotenv v1.5.1
    github.com/redis/go-redis/v9 v9.7.0
    go.uber.org/zap v1.27.0
    github.com/prometheus/client_golang v1.20.0
    go.opentelemetry.io/otel v1.31.0
    google.golang.org/grpc v1.68.0
)`,
      'main.go': (name: string) => `package main

import (
    "log"
    "os"
    
    "github.com/gofiber/fiber/v3"
    "github.com/gofiber/fiber/v3/middleware/cors"
    "github.com/gofiber/fiber/v3/middleware/logger"
    "github.com/gofiber/fiber/v3/middleware/recover"
    "github.com/joho/godotenv"
    
    "github.com/yourusername/${name}/internal/config"
    "github.com/yourusername/${name}/internal/database"
    "github.com/yourusername/${name}/internal/routes"
)

func main() {
    // Load .env file
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }
    
    // Initialize config
    cfg := config.New()
    
    // Connect to database
    db := database.Connect(cfg)
    
    // Create fiber app
    app := fiber.New(fiber.Config{
        AppName: "${name}",
        Prefork: cfg.Prefork,
    })
    
    // Middleware
    app.Use(recover.New())
    app.Use(logger.New())
    app.Use(cors.New(cors.Config{
        AllowOrigins: cfg.AllowedOrigins,
        AllowHeaders: "Origin, Content-Type, Accept, Authorization",
    }))
    
    // Routes
    routes.Setup(app, db)
    
    // Start server
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    
    log.Fatal(app.Listen(":" + port))
}`
    }
  },

  'cli-tool': {
    id: 'cli-tool',
    name: 'CLI Tool',
    description: 'Modern CLI tool with TypeScript, Commander.js, and beautiful output',
    category: 'CLI Tool',
    icon: 'Terminal',
    features: [
      'TypeScript 5.5',
      'Commander.js',
      'Interactive Prompts',
      'Beautiful Output (Chalk)',
      'Progress Bars',
      'Configuration Management',
      'Auto-completion',
      'Update Notifications',
      'Plugin System'
    ],
    techStack: ['Node.js', 'TypeScript'],
    setupOptions: ['interactive', 'config', 'plugins'],
    files: {
      'package.json': (name: string) => JSON.stringify({
        name,
        version: '1.0.0',
        description: 'Modern CLI tool',
        bin: {
          [name]: './dist/index.js'
        },
        scripts: {
          dev: 'tsx src/index.ts',
          build: 'tsup src/index.ts --format cjs,esm --dts --clean',
          start: 'node dist/index.js',
          test: 'vitest',
          lint: 'eslint src --ext .ts',
          prepublishOnly: 'npm run build'
        },
        dependencies: {
          'commander': '^12.1.0',
          'chalk': '^5.3.0',
          'inquirer': '^10.2.0',
          'ora': '^8.1.0',
          'conf': '^13.0.0',
          'update-notifier': '^7.3.0',
          'cli-table3': '^0.6.5',
          'figlet': '^1.7.0',
          'dotenv': '^16.4.5'
        },
        devDependencies: {
          '@types/node': '^22.0.0',
          '@types/inquirer': '^9.0.7',
          '@types/figlet': '^1.5.8',
          'typescript': '^5.5.0',
          'tsx': '^4.16.0',
          'tsup': '^8.2.0',
          'eslint': '^9.0.0',
          '@typescript-eslint/parser': '^8.0.0',
          '@typescript-eslint/eslint-plugin': '^8.0.0',
          'vitest': '^2.0.0',
          'prettier': '^3.3.0'
        }
      }, null, 2),
      'src/index.ts': (name: string) => `#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const packageJson = require('../package.json');

const program = new Command();

// ASCII art banner
console.log(
  chalk.cyan(
    figlet.textSync('${name}', { horizontalLayout: 'default' })
  )
);

program
  .name('${name}')
  .description('CLI tool description')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize a new project')
  .option('-n, --name <name>', 'project name')
  .option('-t, --template <template>', 'project template')
  .action(async (options) => {
    const { init } = await import('./commands/init.js');
    await init(options);
  });

program
  .command('build')
  .description('Build the project')
  .option('-w, --watch', 'watch for changes')
  .action(async (options) => {
    const { build } = await import('./commands/build.js');
    await build(options);
  });

program.parse(process.argv);`
    }
  }
};

// Helper function to get template by ID
export function getTemplate(templateId: string): RepositoryTemplate | null {
  return REPOSITORY_TEMPLATES[templateId] || null;
}

// Helper function to get templates by category
export function getTemplatesByCategory(category: string): RepositoryTemplate[] {
  return Object.values(REPOSITORY_TEMPLATES).filter(
    template => template.category === category
  );
}

// Helper function to generate repository files from template
export function generateRepositoryFiles(
  template: RepositoryTemplate,
  projectName: string,
  projectDescription: string
): Record<string, string> {
  const files: Record<string, string> = {};
  
  for (const [path, content] of Object.entries(template.files)) {
    if (typeof content === 'function') {
      files[path] = content(projectName, projectDescription);
    } else {
      files[path] = content;
    }
  }
  
  // Add workflows if present
  if (template.workflows) {
    for (const [path, content] of Object.entries(template.workflows)) {
      files[path] = content;
    }
  }
  
  return files;
}

// Helper function to get all available templates
export function getAllTemplates(): RepositoryTemplate[] {
  return Object.values(REPOSITORY_TEMPLATES);
}

// Helper function to search templates
export function searchTemplates(query: string): RepositoryTemplate[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(REPOSITORY_TEMPLATES).filter(template => 
    template.name.toLowerCase().includes(lowerQuery) ||
    template.description.toLowerCase().includes(lowerQuery) ||
    template.techStack.some(tech => tech.toLowerCase().includes(lowerQuery)) ||
    template.features.some(feature => feature.toLowerCase().includes(lowerQuery))
  );
}