export const AUTONOMOUS_PROJECT_TEMPLATES = {
  'chrome-extension': {
    files: {
      'README.md': `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Features
{{FEATURES_LIST}}

## Installation

1. Clone the repository:
\`\`\`bash
git clone {{REPO_URL}}
cd {{REPO_NAME}}
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Build the extension:
\`\`\`bash
npm run build
\`\`\`

4. Load in Chrome:
   - Open Chrome and go to \`chrome://extensions/\`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the \`dist\` folder

## Development

\`\`\`bash
npm run dev
\`\`\`

## License
MIT License - see LICENSE file for details`,

      'package.json': `{
  "name": "{{PACKAGE_NAME}}",
  "version": "1.0.0",
  "description": "{{PROJECT_DESCRIPTION}}",
  "private": true,
  "scripts": {
    "dev": "webpack --mode development --watch",
    "build": "webpack --mode production",
    "test": "jest",
    "lint": "eslint src/**/*.{js,jsx,ts,tsx}"
  },
  "devDependencies": {
    "@types/chrome": "^0.0.246",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "typescript": "^5.3.3",
    "ts-loader": "^9.5.1"
  },
  "dependencies": {}
}`,

      'manifest.json': `{
  "manifest_version": 3,
  "name": "{{PROJECT_NAME}}",
  "version": "1.0.0",
  "description": "{{PROJECT_DESCRIPTION}}",
  "permissions": [],
  "action": {
    "default_popup": "popup.html"
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": []
}`,

      '.gitignore': `# Dependencies
node_modules/

# Build output
dist/
build/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*`,

      'tsconfig.json': `{
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
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`
    }
  },

  'web-app': {
    files: {
      'README.md': `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Features
{{FEATURES_LIST}}

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone {{REPO_URL}}
cd {{REPO_NAME}}
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. Run development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url={{REPO_URL}})

### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository={{REPO_URL}})

## License
MIT License - see LICENSE file for details`,

      'package.json': `{
  "name": "{{PACKAGE_NAME}}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0",
    "typescript": "^5.3.3"
  }
}`,

      '.env.example': `# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (if needed)
# DATABASE_URL=

# Authentication (if needed)
# NEXTAUTH_SECRET=
# NEXTAUTH_URL=http://localhost:3000

# External APIs (if needed)
# API_KEY=`,

      'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add your custom configuration here
}

module.exports = nextConfig`
    }
  },

  'api-backend': {
    files: {
      'README.md': `# {{PROJECT_NAME}}

{{PROJECT_DESCRIPTION}}

## Features
{{FEATURES_LIST}}

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (optional)

### Installation

1. Clone the repository:
\`\`\`bash
git clone {{REPO_URL}}
cd {{REPO_NAME}}
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment:
\`\`\`bash
cp .env.example .env
# Configure your environment variables
\`\`\`

4. Run the server:
\`\`\`bash
npm run dev
\`\`\`

API will be available at [http://localhost:3001](http://localhost:3001)

## API Documentation

### Endpoints
- \`GET /api/health\` - Health check
- \`GET /api/v1/...\` - Your API endpoints

## Deployment

### Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template={{REPO_URL}})

### Heroku
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template={{REPO_URL}})

## License
MIT License`,

      'package.json': `{
  "name": "{{PACKAGE_NAME}}",
  "version": "1.0.0",
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
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.5",
    "@types/cors": "^2.8.17",
    "typescript": "^5.3.3",
    "nodemon": "^3.0.2",
    "ts-node": "^10.9.2"
  }
}`,

      'src/index.ts': `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Your routes here
// app.use('/api/v1', routes);

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
    }
  }
};

// Helper function to process template variables
export function processTemplate(
  template: string, 
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
}

// Function to get deploy buttons for README
export function getDeployButtons(repoUrl: string, projectType: string): string {
  const encodedUrl = encodeURIComponent(repoUrl);
  
  const buttons = {
    'web-app': `
### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=${encodedUrl})
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=${encodedUrl})
`,
    'api-backend': `
### One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=${encodedUrl})
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=${encodedUrl})
`,
    'chrome-extension': `
### Chrome Web Store

Ready to publish to Chrome Web Store. Follow the [publishing guide](https://developer.chrome.com/docs/webstore/publish/).
`
  };

  return buttons[projectType] || '';
}