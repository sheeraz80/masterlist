/**
 * Enhanced template files with 2025 tech stacks and platform-specific content
 */

// Complete platform-specific templates
export const ENHANCED_TEMPLATE_FILES: Record<string, any> = {
  // Chrome/Browser Extension Template
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
          "@types/chrome": "^0.0.278",
          "webpack": "^5.97.0",
          "webpack-cli": "^5.1.4",
          "copy-webpack-plugin": "^12.0.2",
          "typescript": "^5.8.0",
          "ts-loader": "^9.5.1",
          "css-loader": "^7.1.2",
          "style-loader": "^4.0.0",
          "jest": "^29.7.0",
          "eslint": "^9.17.0",
          "@typescript-eslint/eslint-plugin": "^8.19.0",
          "@typescript-eslint/parser": "^8.19.0"
        }
      }
    },
    'webpack.config.js': `const path = require('path');
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
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'src/popup/popup.html', to: 'popup/popup.html' },
        { from: 'src/popup/popup.css', to: 'popup/popup.css' },
        { from: 'icons', to: 'icons' }
      ],
    }),
  ],
};`,
    'src/background.js': `// Background service worker for {{PROJECT_NAME}}
console.log('{{PROJECT_NAME}} background service worker started');

// Example: Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked on tab:', tab.url);
});

// Example: Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  sendResponse({ status: 'received' });
});`,
    'src/content.js': `// Content script for {{PROJECT_NAME}}
console.log('{{PROJECT_NAME}} content script loaded');

// Example: Interact with the page
document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded, {{PROJECT_NAME}} is ready');
});`,
    'src/popup/popup.html': `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>{{PROJECT_NAME}}</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <h1>{{PROJECT_NAME}}</h1>
    <p>{{PROJECT_DESCRIPTION}}</p>
    <button id="actionButton">Take Action</button>
  </div>
  <script src="popup.js"></script>
</body>
</html>`,
    'src/popup/popup.css': `body {
  min-width: 300px;
  min-height: 200px;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  padding: 16px;
}

h1 {
  font-size: 18px;
  margin: 0 0 8px 0;
}

p {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #0056b3;
}`,
    'src/popup/popup.js': `// Popup script for {{PROJECT_NAME}}
document.addEventListener('DOMContentLoaded', () => {
  const actionButton = document.getElementById('actionButton');
  
  actionButton.addEventListener('click', () => {
    console.log('Action button clicked');
    // Add your action logic here
  });
});`,
    'icons/.gitkeep': '',
    '.gitignore': `node_modules/
dist/
.env
*.log
.DS_Store
.idea/
.vscode/`
  },

  // Web App templates
  'web-app-nextjs': {
    'package.json': {
      content: {
        "name": "{{PACKAGE_NAME}}",
        "version": "0.1.0",
        "description": "{{PROJECT_DESCRIPTION}}",
        "scripts": {
          "dev": "next dev",
          "build": "next build",
          "start": "next start",
          "lint": "next lint",
          "test": "jest",
          "type-check": "tsc --noEmit"
        },
        "dependencies": {
          "next": "15.0.3",
          "react": "19.0.0",
          "react-dom": "19.0.0",
          "@tanstack/react-query": "^5.62.3",
          "zod": "^3.23.8"
        },
        "devDependencies": {
          "@types/node": "^22.10.2",
          "@types/react": "^19.0.1",
          "@types/react-dom": "^19.0.1",
          "typescript": "^5.8.0",
          "eslint": "^9.17.0",
          "eslint-config-next": "15.0.3",
          "tailwindcss": "^3.4.16",
          "postcss": "^8.4.49",
          "autoprefixer": "^10.4.20",
          "jest": "^29.7.0",
          "@testing-library/react": "^16.1.0",
          "@testing-library/jest-dom": "^6.6.3"
        }
      }
    },
    'tsconfig.json': {
      content: {
        "compilerOptions": {
          "target": "ES2022",
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
          "paths": {
            "@/*": ["./src/*"]
          }
        },
        "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
        "exclude": ["node_modules"]
      }
    },
    'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig`,
    'src/app/layout.tsx': `import type { Metadata } from 'next'
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
}`,
    'src/app/page.tsx': `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold">{{PROJECT_NAME}}</h1>
        <p className="mt-4">{{PROJECT_DESCRIPTION}}</p>
      </div>
    </main>
  )
}`,
    'src/app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}`,
    'tailwind.config.ts': `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config`,
    '.env.example': `# Environment variables
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api`,
    '.gitignore': `# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts`
  },

  'web-app-vite': {
    'package.json': {
      content: {
        "name": "{{PACKAGE_NAME}}",
        "version": "0.1.0",
        "description": "{{PROJECT_DESCRIPTION}}",
        "type": "module",
        "scripts": {
          "dev": "vite",
          "build": "tsc && vite build",
          "preview": "vite preview",
          "test": "vitest",
          "lint": "eslint src --ext ts,tsx",
          "type-check": "tsc --noEmit"
        },
        "dependencies": {
          "react": "^19.0.0",
          "react-dom": "^19.0.0",
          "@tanstack/react-router": "^1.92.0",
          "@tanstack/react-query": "^5.62.3"
        },
        "devDependencies": {
          "@types/react": "^19.0.1",
          "@types/react-dom": "^19.0.1",
          "@vitejs/plugin-react": "^4.3.4",
          "typescript": "^5.8.0",
          "vite": "^6.0.3",
          "vitest": "^2.1.8",
          "eslint": "^9.17.0",
          "@typescript-eslint/eslint-plugin": "^8.19.0",
          "@typescript-eslint/parser": "^8.19.0",
          "tailwindcss": "^3.4.16",
          "postcss": "^8.4.49",
          "autoprefixer": "^10.4.20"
        }
      }
    },
    'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        }
      }
    }
  }
})`,
    'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
    'src/App.tsx': `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <h1>{{PROJECT_NAME}}</h1>
      <p>{{PROJECT_DESCRIPTION}}</p>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App`,
    'src/App.css': `.App {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.card {
  padding: 2em;
}`,
    'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}`,
    'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{PROJECT_NAME}}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
    'tsconfig.json': {
      content: {
        "compilerOptions": {
          "target": "ES2022",
          "useDefineForClassFields": true,
          "lib": ["ES2022", "DOM", "DOM.Iterable"],
          "module": "ESNext",
          "skipLibCheck": true,
          "moduleResolution": "bundler",
          "allowImportingTsExtensions": true,
          "resolveJsonModule": true,
          "isolatedModules": true,
          "noEmit": true,
          "jsx": "react-jsx",
          "strict": true,
          "noUnusedLocals": true,
          "noUnusedParameters": true,
          "noFallthroughCasesInSwitch": true
        },
        "include": ["src"],
        "references": [{ "path": "./tsconfig.node.json" }]
      }
    },
    'tsconfig.node.json': {
      content: {
        "compilerOptions": {
          "composite": true,
          "skipLibCheck": true,
          "module": "ESNext",
          "moduleResolution": "bundler",
          "allowSyntheticDefaultImports": true
        },
        "include": ["vite.config.ts"]
      }
    },
    'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
    'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
    '.gitignore': `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`
  },

  // Default Node.js template
  'default': {
    'package.json': {
      content: {
        "name": "{{PACKAGE_NAME}}",
        "version": "0.1.0",
        "description": "{{PROJECT_DESCRIPTION}}",
        "main": "dist/index.js",
        "scripts": {
          "build": "tsc",
          "dev": "tsx watch src/index.ts",
          "start": "node dist/index.js",
          "test": "jest",
          "lint": "eslint src/**/*.ts"
        },
        "dependencies": {},
        "devDependencies": {
          "@types/node": "^22.10.2",
          "typescript": "^5.8.0",
          "tsx": "^4.19.2",
          "jest": "^29.7.0",
          "@types/jest": "^29.5.14",
          "eslint": "^9.17.0",
          "@typescript-eslint/eslint-plugin": "^8.19.0",
          "@typescript-eslint/parser": "^8.19.0"
        }
      }
    },
    'tsconfig.json': {
      content: {
        "compilerOptions": {
          "target": "ES2022",
          "module": "commonjs",
          "lib": ["ES2022"],
          "outDir": "./dist",
          "rootDir": "./src",
          "strict": true,
          "esModuleInterop": true,
          "skipLibCheck": true,
          "forceConsistentCasingInFileNames": true,
          "resolveJsonModule": true,
          "declaration": true,
          "declarationMap": true,
          "sourceMap": true
        },
        "include": ["src/**/*"],
        "exclude": ["node_modules", "dist"]
      }
    },
    'src/index.ts': `// {{PROJECT_NAME}}
// {{PROJECT_DESCRIPTION}}

export function main() {
  console.log('{{PROJECT_NAME}} is running!');
}

if (require.main === module) {
  main();
}`,
    '.gitignore': `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
coverage/
.vscode/
.idea/`
  }
};

// Template mapping for similar templates
export const TEMPLATE_MAPPING: Record<string, string> = {
  'firefox-extension': 'chrome-extension',
  'edge-extension': 'chrome-extension',
  'safari-extension': 'chrome-extension',
  'ai-browser-tools': 'chrome-extension',
  'crypto-browser-tools': 'chrome-extension',
  'ai-web-app': 'web-app-nextjs',
  'desktop-electron': 'default',
  'cli-tool': 'default',
  'vscode-extension': 'default',
  'api-backend-express': 'default',
  'react-native-app': 'default',
  'flutter-app': 'default',
  'ios-app': 'default',
  'android-app': 'default'
};

/**
 * Get template files for a specific template
 */
export function getEnhancedTemplateFiles(template: string): any {
  // Check if it's mapped to another template
  const mappedTemplate = TEMPLATE_MAPPING[template];
  if (mappedTemplate) {
    return ENHANCED_TEMPLATE_FILES[mappedTemplate] || ENHANCED_TEMPLATE_FILES.default;
  }
  
  return ENHANCED_TEMPLATE_FILES[template] || ENHANCED_TEMPLATE_FILES.default;
}

/**
 * Process template placeholders
 */
export function processTemplatePlaceholders(content: string, data: any): string {
  return content.replace(/{{([^}]+)}}/g, (match, key) => {
    switch (key) {
      case 'PROJECT_NAME':
        return data.title || 'Project';
      case 'PROJECT_DESCRIPTION':
        return data.description || data.problem || 'Project description';
      case 'PACKAGE_NAME':
        return data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'project';
      case 'REPO_NAME':
        return data.repoName || data.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'project';
      default:
        return data[key] || match;
    }
  });
}

/**
 * Generate template files with processed content
 */
export function generateEnhancedTemplateFiles(template: string, projectData: any): Record<string, string> {
  const templateFiles = getEnhancedTemplateFiles(template);
  const processedFiles: Record<string, string> = {};
  
  for (const [filepath, content] of Object.entries(templateFiles)) {
    const processedPath = processTemplatePlaceholders(filepath, projectData);
    
    if (typeof content === 'object' && content.content) {
      // JSON file
      const jsonString = JSON.stringify(content.content, null, 2);
      processedFiles[processedPath] = processTemplatePlaceholders(jsonString, projectData);
    } else if (typeof content === 'string') {
      processedFiles[processedPath] = processTemplatePlaceholders(content, projectData);
    }
  }
  
  return processedFiles;
}