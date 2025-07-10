/**
 * Template file contents for different project types
 */

import { PLATFORM_TEMPLATES } from './platform-templates';

export const TEMPLATE_FILES = {
  'chrome-extension': {
    'manifest.json': {
      content: {
        "manifest_version": 3,
        "name": "{{PROJECT_NAME}}",
        "version": "0.1.0",
        "description": "{{PROJECT_DESCRIPTION}}",
        "permissions": [],
        "action": {
          "default_popup": "popup/popup.html",
          "default_icon": {
            "16": "icons/icon16.png",
            "48": "icons/icon48.png",
            "128": "icons/icon128.png"
          }
        },
        "background": {
          "service_worker": "background.js"
        },
        "content_scripts": [{
          "matches": ["<all_urls>"],
          "js": ["content.js"]
        }],
        "icons": {
          "16": "icons/icon16.png",
          "48": "icons/icon48.png",
          "128": "icons/icon128.png"
        }
      }
    },
    'package.json': {
      content: {
        "name": "{{PACKAGE_NAME}}",
        "version": "0.1.0",
        "description": "{{PROJECT_DESCRIPTION}}",
        "private": true,
        "scripts": {
          "dev": "webpack --mode development --watch",
          "build": "webpack --mode production",
          "test": "jest",
          "lint": "eslint src/**/*.{js,ts}",
          "clean": "rm -rf dist"
        },
        "devDependencies": {
          "@types/chrome": "^0.0.246",
          "webpack": "^5.89.0",
          "webpack-cli": "^5.1.4",
          "copy-webpack-plugin": "^11.0.0",
          "typescript": "^5.3.3",
          "ts-loader": "^9.5.1",
          "css-loader": "^6.8.1",
          "style-loader": "^3.3.3",
          "jest": "^29.7.0",
          "eslint": "^8.55.0",
          "@typescript-eslint/eslint-plugin": "^6.13.2",
          "@typescript-eslint/parser": "^6.13.2"
        }
      }
    },
    'webpack.config.js': {
      content: `const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background.js',
    content: './src/content.js',
    popup: './src/popup/popup.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/popup/popup.html', to: 'popup/popup.html' },
        { from: 'src/popup/popup.css', to: 'popup/popup.css' },
        { from: 'src/icons', to: 'icons' }
      ]
    })
  ]
};`
    },
    'src/background.js': {
      content: `// Background service worker for {{PROJECT_NAME}}

chrome.runtime.onInstalled.addListener(() => {
  console.log('{{PROJECT_NAME}} extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  // Handle messages from content scripts or popup
  sendResponse({ status: 'ok' });
});`
    },
    'src/content.js': {
      content: `// Content script for {{PROJECT_NAME}}

console.log('{{PROJECT_NAME}} content script loaded');

// Your content script logic here`
    },
    'src/popup/popup.html': {
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="popup.css">
  <title>{{PROJECT_NAME}}</title>
</head>
<body>
  <div class="container">
    <h1>{{PROJECT_NAME}}</h1>
    <p>{{PROJECT_DESCRIPTION}}</p>
    <div id="content">
      <!-- Dynamic content here -->
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>`
    },
    'src/popup/popup.css': {
      content: `body {
  width: 350px;
  min-height: 400px;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  padding: 16px;
}

h1 {
  font-size: 18px;
  margin: 0 0 12px 0;
  color: #333;
}

p {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}`
    },
    'src/popup/popup.js': {
      content: `// Popup script for {{PROJECT_NAME}}

document.addEventListener('DOMContentLoaded', () => {
  console.log('{{PROJECT_NAME}} popup loaded');
  
  // Initialize popup functionality
  init();
});

function init() {
  // Your popup logic here
}`
    },
    '.gitignore': {
      content: `# Dependencies
node_modules/

# Build output
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local`
    },
    'tsconfig.json': {
      content: {
        "compilerOptions": {
          "target": "ES2020",
          "module": "commonjs",
          "lib": ["ES2020", "DOM"],
          "outDir": "./dist",
          "rootDir": "./src",
          "strict": true,
          "esModuleInterop": true,
          "skipLibCheck": true,
          "forceConsistentCasingInFileNames": true,
          "types": ["chrome"]
        },
        "include": ["src/**/*"],
        "exclude": ["node_modules", "dist"]
      }
    },
    '.eslintrc.json': {
      content: {
        "env": {
          "browser": true,
          "es2021": true,
          "webextensions": true
        },
        "extends": [
          "eslint:recommended",
          "plugin:@typescript-eslint/recommended"
        ],
        "parser": "@typescript-eslint/parser",
        "parserOptions": {
          "ecmaVersion": 12,
          "sourceType": "module"
        },
        "plugins": ["@typescript-eslint"],
        "rules": {
          "indent": ["error", 2],
          "quotes": ["error", "single"],
          "semi": ["error", "always"]
        }
      }
    }
  },

  'web-app-nextjs': {
    'package.json': {
      content: {
        "name": "{{PACKAGE_NAME}}",
        "version": "0.1.0",
        "private": true,
        "scripts": {
          "dev": "next dev",
          "build": "next build",
          "start": "next start",
          "lint": "next lint",
          "test": "jest",
          "test:watch": "jest --watch",
          "type-check": "tsc --noEmit"
        },
        "dependencies": {
          "next": "14.0.4",
          "react": "^18.2.0",
          "react-dom": "^18.2.0",
          "@radix-ui/react-slot": "^1.0.2",
          "class-variance-authority": "^0.7.0",
          "clsx": "^2.0.0",
          "tailwind-merge": "^2.1.0",
          "tailwindcss-animate": "^1.0.7"
        },
        "devDependencies": {
          "@types/node": "^20.10.4",
          "@types/react": "^18.2.45",
          "@types/react-dom": "^18.2.17",
          "autoprefixer": "^10.4.16",
          "eslint": "^8.55.0",
          "eslint-config-next": "14.0.4",
          "postcss": "^8.4.32",
          "tailwindcss": "^3.3.6",
          "typescript": "^5.3.3",
          "@testing-library/react": "^14.1.2",
          "@testing-library/jest-dom": "^6.1.5",
          "jest": "^29.7.0",
          "jest-environment-jsdom": "^29.7.0"
        }
      }
    },
    'next.config.js': {
      content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig`
    },
    'tsconfig.json': {
      content: {
        "compilerOptions": {
          "target": "es5",
          "lib": ["dom", "dom.iterable", "esnext"],
          "allowJs": true,
          "skipLibCheck": true,
          "strict": true,
          "forceConsistentCasingInFileNames": true,
          "noEmit": true,
          "esModuleInterop": true,
          "module": "esnext",
          "moduleResolution": "bundler",
          "resolveJsonModule": true,
          "isolatedModules": true,
          "jsx": "preserve",
          "incremental": true,
          "plugins": [
            {
              "name": "next"
            }
          ],
          "paths": {
            "@/*": ["./src/*"]
          }
        },
        "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        "exclude": ["node_modules"]
      }
    },
    'tailwind.config.ts': {
      content: `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066FF',
          dark: '#0052CC',
        },
        secondary: {
          DEFAULT: '#6B7280',
          dark: '#4B5563',
        }
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config`
    },
    'postcss.config.js': {
      content: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`
    },
    'src/app/layout.tsx': {
      content: `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '{{PROJECT_NAME}}',
  description: '{{PROJECT_DESCRIPTION}}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`
    },
    'src/app/globals.css': {
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}`
    },
    'src/app/page.tsx': {
      content: `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">
          {{PROJECT_NAME}}
        </h1>
        <p className="text-xl text-center text-gray-600 mb-12">
          {{PROJECT_DESCRIPTION}}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Feature 1</h2>
            <p className="text-gray-600">Description of feature 1</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Feature 2</h2>
            <p className="text-gray-600">Description of feature 2</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Feature 3</h2>
            <p className="text-gray-600">Description of feature 3</p>
          </div>
        </div>
      </div>
    </main>
  )
}`
    },
    '.gitignore': {
      content: `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts`
    },
    '.eslintrc.json': {
      content: {
        "extends": "next/core-web-vitals"
      }
    },
    'jest.config.js': {
      content: `const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)`
    },
    'jest.setup.js': {
      content: `import '@testing-library/jest-dom'`
    }
  },

  'vscode-extension': {
    'package.json': {
      content: {
        "name": "{{PACKAGE_NAME}}",
        "displayName": "{{PROJECT_NAME}}",
        "description": "{{PROJECT_DESCRIPTION}}",
        "version": "0.1.0",
        "publisher": "corevecta",
        "engines": {
          "vscode": "^1.74.0"
        },
        "categories": ["Other"],
        "activationEvents": [],
        "main": "./dist/extension.js",
        "contributes": {
          "commands": [{
            "command": "{{PACKAGE_NAME}}.helloWorld",
            "title": "Hello World"
          }]
        },
        "scripts": {
          "vscode:prepublish": "npm run compile",
          "compile": "tsc -p ./",
          "watch": "tsc -watch -p ./",
          "pretest": "npm run compile && npm run lint",
          "lint": "eslint src --ext ts",
          "test": "node ./out/test/runTest.js"
        },
        "devDependencies": {
          "@types/vscode": "^1.74.0",
          "@types/node": "18.x",
          "@typescript-eslint/eslint-plugin": "^6.13.2",
          "@typescript-eslint/parser": "^6.13.2",
          "eslint": "^8.55.0",
          "typescript": "^5.3.3",
          "@vscode/test-electron": "^2.3.8"
        }
      }
    },
    'tsconfig.json': {
      content: {
        "compilerOptions": {
          "module": "commonjs",
          "target": "ES2020",
          "outDir": "dist",
          "lib": ["ES2020"],
          "sourceMap": true,
          "rootDir": "src",
          "strict": true
        },
        "include": ["src"],
        "exclude": ["node_modules", ".vscode-test"]
      }
    },
    'src/extension.ts': {
      content: `import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('{{PROJECT_NAME}} is now active!');

    let disposable = vscode.commands.registerCommand('{{PACKAGE_NAME}}.helloWorld', () => {
        vscode.window.showInformationMessage('Hello from {{PROJECT_NAME}}!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}`
    },
    '.vscodeignore': {
      content: `.vscode/**
.vscode-test/**
src/**
.gitignore
.yarnrc
vsc-extension-quickstart.md
**/tsconfig.json
**/.eslintrc.json
**/*.map
**/*.ts`
    },
    '.gitignore': {
      content: `out
dist
node_modules
.vscode-test/
*.vsix`
    }
  },

  'api-backend-express': {
    'package.json': {
      content: {
        "name": "{{PACKAGE_NAME}}",
        "version": "0.1.0",
        "description": "{{PROJECT_DESCRIPTION}}",
        "main": "dist/index.js",
        "scripts": {
          "dev": "nodemon --exec ts-node src/index.ts",
          "build": "tsc",
          "start": "node dist/index.js",
          "test": "jest",
          "lint": "eslint src/**/*.ts"
        },
        "dependencies": {
          "express": "^4.18.2",
          "cors": "^2.8.5",
          "dotenv": "^16.3.1",
          "helmet": "^7.1.0",
          "express-rate-limit": "^7.1.5",
          "joi": "^17.11.0",
          "winston": "^3.11.0"
        },
        "devDependencies": {
          "@types/express": "^4.17.21",
          "@types/node": "^20.10.4",
          "@types/cors": "^2.8.17",
          "typescript": "^5.3.3",
          "ts-node": "^10.9.2",
          "nodemon": "^3.0.2",
          "jest": "^29.7.0",
          "@types/jest": "^29.5.11",
          "ts-jest": "^29.1.1",
          "eslint": "^8.55.0",
          "@typescript-eslint/eslint-plugin": "^6.13.2",
          "@typescript-eslint/parser": "^6.13.2"
        }
      }
    },
    'tsconfig.json': {
      content: {
        "compilerOptions": {
          "target": "ES2020",
          "module": "commonjs",
          "lib": ["ES2020"],
          "outDir": "./dist",
          "rootDir": "./src",
          "strict": true,
          "esModuleInterop": true,
          "skipLibCheck": true,
          "forceConsistentCasingInFileNames": true,
          "resolveJsonModule": true,
          "moduleResolution": "node",
          "types": ["node", "jest"],
          "sourceMap": true
        },
        "include": ["src/**/*"],
        "exclude": ["node_modules", "dist"]
      }
    },
    'src/index.ts': {
      content: `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: '{{PROJECT_NAME}}' });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(\`{{PROJECT_NAME}} server running on port \${PORT}\`);
});`
    },
    'src/routes/index.ts': {
      content: `import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to {{PROJECT_NAME}} API',
    version: '0.1.0'
  });
});

// Add your routes here

export default router;`
    },
    'src/middleware/errorHandler.ts': {
      content: `import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err.stack);

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};`
    },
    'src/utils/logger.ts': {
      content: `import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: '{{PACKAGE_NAME}}' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}`
    },
    '.env.example': {
      content: `NODE_ENV=development
PORT=3000
LOG_LEVEL=info`
    },
    '.gitignore': {
      content: `# Dependencies
node_modules/

# Build
dist/
build/

# Logs
logs/
*.log

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db`
    },
    'Dockerfile': {
      content: `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]`
    }
  },
  
  // Add all platform-specific templates
  ...PLATFORM_TEMPLATES
};

/**
 * Get file content with variables replaced
 */
export function processFileContent(
  content: string | object,
  variables: Record<string, string>
): string {
  let processedContent = typeof content === 'object' 
    ? JSON.stringify(content, null, 2) 
    : content;

  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedContent = processedContent.replace(regex, value);
  });

  return processedContent;
}

/**
 * Get all files for a template
 */
export function getTemplateFiles(
  templateName: string,
  variables: Record<string, string>
): Array<{ path: string; content: string }> {
  const template = TEMPLATE_FILES[templateName];
  if (!template) return [];

  const files: Array<{ path: string; content: string }> = [];

  Object.entries(template).forEach(([path, file]) => {
    files.push({
      path,
      content: processFileContent(file.content, variables)
    });
  });

  return files;
}