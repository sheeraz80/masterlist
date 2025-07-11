import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { CHROME_EXTENSION_MASTER_TEMPLATE } from '@/lib/templates/corevecta-master-templates';
import { CHROME_EXTENSION_TESTING_TEMPLATE } from '@/lib/templates/testing/testing-templates';
import { CHROME_EXTENSION_SECURITY_TEMPLATE } from '@/lib/templates/security/security-templates';
import { CROSS_BROWSER_TEMPLATES } from '@/lib/templates/cross-browser/cross-browser-templates';
import { CoreVectaPromptGenerator } from '@/lib/prompts/corevecta-prompt-generator';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const projectConfig = await request.json();
    
    // Create a new project in the database
    const project = await prisma.project.create({
      data: {
        title: projectConfig.basic.title,
        description: projectConfig.basic.description,
        category: projectConfig.basic.category,
        complexity: projectConfig.basic.complexity,
        targetUsers: projectConfig.basic.targetUsers,
        revenueModel: projectConfig.basic.revenueModel,
        problem: `Creating a ${projectConfig.basic.complexity} level ${projectConfig.basic.category.toLowerCase()} to solve modern web development challenges.`,
        solution: projectConfig.basic.description,
        keyFeatures: JSON.stringify(projectConfig.features.filter((f: any) => f.enabled).map((f: any) => f.name)),
        tags: JSON.stringify(['corevecta', projectConfig.basic.category.toLowerCase(), projectConfig.basic.complexity]),
        technicalComplexity: projectConfig.basic.complexity === 'enterprise' ? 9 : projectConfig.basic.complexity === 'advanced' ? 7 : projectConfig.basic.complexity === 'intermediate' ? 5 : 3,
        developmentTime: calculateDevelopmentTime(projectConfig),
        qualityScore: 8.5,
        featured: false
      }
    });

    // Generate project files
    const zip = new JSZip();
    
    // Add base template files
    const baseTemplate = CHROME_EXTENSION_MASTER_TEMPLATE;
    
    // Add manifest.json
    const manifest = {
      manifest_version: 3,
      name: projectConfig.basic.title,
      version: "1.0.0",
      description: projectConfig.basic.description,
      action: {
        default_popup: "popup.html",
        default_icon: {
          "16": "icons/icon-16.png",
          "48": "icons/icon-48.png",
          "128": "icons/icon-128.png"
        }
      },
      background: {
        service_worker: "background.js"
      },
      content_scripts: [
        {
          matches: ["<all_urls>"],
          js: ["content.js"],
          css: ["content.css"]
        }
      ],
      permissions: ["storage", "tabs", "activeTab"],
      host_permissions: ["<all_urls>"],
      content_security_policy: {
        extension_pages: "script-src 'self'; object-src 'self'"
      }
    };
    
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));
    
    // Add package.json
    const packageJson = {
      name: projectConfig.basic.title.toLowerCase().replace(/\s+/g, '-'),
      version: "1.0.0",
      description: projectConfig.basic.description,
      main: "background.js",
      scripts: {
        build: "webpack --mode production",
        dev: "webpack --mode development --watch",
        test: "jest",
        lint: "eslint src/**/*.{ts,tsx}",
        format: "prettier --write src/**/*.{ts,tsx,css}"
      },
      dependencies: baseTemplate.config.dependencies,
      devDependencies: baseTemplate.config.devDependencies
    };
    
    // Add testing dependencies if enabled
    if (projectConfig.advanced.testing) {
      Object.assign(packageJson.devDependencies, CHROME_EXTENSION_TESTING_TEMPLATE.dependencies);
    }
    
    zip.file('package.json', JSON.stringify(packageJson, null, 2));
    
    // Add source files
    zip.folder('src');
    
    // Background script
    zip.file('src/background.ts', `/**
 * Background Service Worker
 * ${projectConfig.basic.title}
 */

console.log('${projectConfig.basic.title} - Background script loaded');

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);
  
  switch (message.type) {
    case 'GET_DATA':
      // Handle data retrieval
      chrome.storage.local.get(['data'], (result) => {
        sendResponse({ success: true, data: result.data });
      });
      return true; // Keep message channel open
      
    case 'SAVE_DATA':
      // Handle data saving
      chrome.storage.local.set({ data: message.data }, () => {
        sendResponse({ success: true });
      });
      return true;
      
    default:
      sendResponse({ success: false, error: 'Unknown message type' });
  }
});

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
    // Open welcome page
    chrome.tabs.create({ url: 'welcome.html' });
  } else if (details.reason === 'update') {
    console.log('Extension updated');
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked');
  // You can open a popup or perform an action here
});`);

    // Popup files
    zip.file('src/popup.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectConfig.basic.title}</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <header>
      <img src="icons/icon-48.png" alt="Extension Icon" class="logo">
      <h1>${projectConfig.basic.title}</h1>
    </header>
    
    <main>
      <div id="content">
        <p class="description">${projectConfig.basic.description}</p>
        
        <div class="actions">
          <button id="mainAction" class="btn btn-primary">Get Started</button>
          <button id="settings" class="btn btn-secondary">Settings</button>
        </div>
        
        <div id="status" class="status"></div>
      </div>
    </main>
    
    <footer>
      <p>Powered by CoreVecta</p>
    </footer>
  </div>
  
  <script src="popup.js"></script>
</body>
</html>`);

    zip.file('src/popup.css', `/* Popup Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  width: 350px;
  min-height: 400px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

header {
  background: ${projectConfig.customization.customColors || '#3b82f6'};
  color: white;
  padding: 20px;
  text-align: center;
}

.logo {
  width: 48px;
  height: 48px;
  margin-bottom: 10px;
}

h1 {
  font-size: 20px;
  font-weight: 600;
}

main {
  flex: 1;
  padding: 20px;
}

.description {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: ${projectConfig.customization.customColors || '#3b82f6'};
  color: white;
}

.btn-primary:hover {
  background: ${projectConfig.customization.customColors ? adjustColor(projectConfig.customization.customColors, -20) : '#2563eb'};
}

.btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background: #d1d5db;
}

.status {
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  display: none;
}

.status.success {
  background: #d1fae5;
  color: #065f46;
  display: block;
}

.status.error {
  background: #fee2e2;
  color: #991b1b;
  display: block;
}

footer {
  background: #f9fafb;
  padding: 10px;
  text-align: center;
  font-size: 12px;
  color: #6b7280;
  border-top: 1px solid #e5e7eb;
}`);

    zip.file('src/popup.ts', `/**
 * Popup Script
 * ${projectConfig.basic.title}
 */

document.addEventListener('DOMContentLoaded', () => {
  const mainActionBtn = document.getElementById('mainAction');
  const settingsBtn = document.getElementById('settings');
  const statusDiv = document.getElementById('status');
  
  // Main action button click
  mainActionBtn?.addEventListener('click', async () => {
    try {
      // Send message to background script
      const response = await chrome.runtime.sendMessage({ type: 'MAIN_ACTION' });
      
      if (response.success) {
        showStatus('Action completed successfully!', 'success');
      } else {
        showStatus('Action failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showStatus('An error occurred.', 'error');
    }
  });
  
  // Settings button click
  settingsBtn?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Show status message
  function showStatus(message: string, type: 'success' | 'error') {
    if (statusDiv) {
      statusDiv.textContent = message;
      statusDiv.className = \`status \${type}\`;
      
      setTimeout(() => {
        statusDiv.className = 'status';
      }, 3000);
    }
  }
  
  // Load initial state
  loadState();
  
  async function loadState() {
    try {
      const result = await chrome.storage.local.get(['enabled']);
      if (result.enabled) {
        mainActionBtn?.textContent = 'Disable';
      } else {
        mainActionBtn?.textContent = 'Enable';
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }
});`);

    // Content script
    zip.file('src/content.ts', `/**
 * Content Script
 * ${projectConfig.basic.title}
 */

console.log('${projectConfig.basic.title} - Content script injected');

// Example: Add a custom element to the page
const init = () => {
  const indicator = document.createElement('div');
  indicator.setAttribute('data-extension-injected', 'true');
  indicator.style.cssText = \`
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${projectConfig.customization.customColors || '#3b82f6'};
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    font-size: 14px;
    z-index: 9999;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  \`;
  indicator.textContent = '${projectConfig.basic.title} Active';
  
  // Click to toggle
  indicator.addEventListener('click', () => {
    indicator.style.display = 'none';
  });
  
  document.body.appendChild(indicator);
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Listen for messages from extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_DOM') {
    // Handle DOM updates
    console.log('Updating DOM:', message.data);
    sendResponse({ success: true });
  }
});`);

    // Add test files if testing is enabled
    if (projectConfig.advanced.testing) {
      const testingTemplate = CHROME_EXTENSION_TESTING_TEMPLATE;
      testingTemplate.files.forEach(file => {
        zip.file(file.path, file.content);
      });
    }

    // Add security files if security is enabled
    if (projectConfig.advanced.security) {
      const securityTemplate = CHROME_EXTENSION_SECURITY_TEMPLATE;
      securityTemplate.files.forEach(file => {
        zip.file(file.path, file.content);
      });
    }

    // Add cross-browser support if enabled
    if (projectConfig.advanced.crossBrowser) {
      const crossBrowserTemplate = CROSS_BROWSER_TEMPLATES[0];
      crossBrowserTemplate.files.forEach(file => {
        zip.file(file.path, file.content);
      });
    }

    // Add README
    const readme = generateReadme(projectConfig);
    zip.file('README.md', readme);

    // Add .gitignore
    zip.file('.gitignore', `node_modules/
dist/
.env
.env.local
.DS_Store
*.log
coverage/
.vscode/
.idea/
*.zip`);

    // Add TypeScript config
    zip.file('tsconfig.json', JSON.stringify({
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        lib: ["ES2020", "DOM"],
        jsx: "react",
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        moduleResolution: "node",
        typeRoots: ["./node_modules/@types", "./src/types"]
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist"]
    }, null, 2));

    // Add webpack config
    zip.file('webpack.config.js', generateWebpackConfig(projectConfig));

    // Generate icons
    const iconSizes = [16, 48, 128];
    const iconsFolder = zip.folder('icons');
    iconSizes.forEach(size => {
      // Create simple SVG icon
      const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${projectConfig.customization.customColors || '#3b82f6'}"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="${size * 0.4}px" font-family="Arial">
          ${projectConfig.basic.title.charAt(0).toUpperCase()}
        </text>
      </svg>`;
      iconsFolder?.file(`icon-${size}.svg`, svg);
    });

    // Generate the zip file
    const zipContent = await zip.generateAsync({ type: 'base64' });

    return NextResponse.json({
      success: true,
      projectId: project.id,
      download: {
        filename: `${projectConfig.basic.title.toLowerCase().replace(/\s+/g, '-')}-extension.zip`,
        content: zipContent,
        contentType: 'application/zip'
      }
    });

  } catch (error) {
    console.error('Project generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate project' },
      { status: 500 }
    );
  }
}

function calculateDevelopmentTime(config: any): string {
  const hours = config.features
    .filter((f: any) => f.enabled)
    .reduce((total: number, feature: any) => total + feature.estimatedHours, 0);
  
  if (hours <= 40) return '1 week';
  if (hours <= 80) return '2 weeks';
  if (hours <= 160) return '1 month';
  if (hours <= 320) return '2 months';
  return '3+ months';
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function generateReadme(config: any): string {
  return `# ${config.basic.title}

${config.basic.description}

## Features

${config.features.filter((f: any) => f.enabled).map((f: any) => `- ${f.name}: ${f.description}`).join('\n')}

## Installation

### Development

1. Clone this repository
2. Install dependencies: \`npm install\`
3. Build the extension: \`npm run build\`
4. Load the extension in Chrome:
   - Open Chrome and navigate to \`chrome://extensions\`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the \`dist\` folder

### Production

1. Build for production: \`npm run build:prod\`
2. The extension will be packaged in the \`dist\` folder
3. Upload to Chrome Web Store

## Development

- \`npm run dev\` - Start development mode with hot reload
- \`npm run test\` - Run tests
- \`npm run lint\` - Run linting
- \`npm run format\` - Format code

## Configuration

The extension can be configured through the options page. Access it by:
1. Right-clicking the extension icon
2. Selecting "Options"

## Revenue Model

${config.basic.revenueModel}

## Target Users

${config.basic.targetUsers}

## Support

For support, please visit [CoreVecta Support](https://corevecta.com/support)

## License

This project is licensed under the MIT License.

---

Built with ❤️ by CoreVecta
`;
}

function generateWebpackConfig(config: any): string {
  return `const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: process.env.NODE_ENV === 'production' ? false : 'inline-source-map',
  
  entry: {
    background: './src/background.ts',
    content: './src/content.ts',
    popup: './src/popup.ts'
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
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
        { from: 'icons', to: 'icons' },
        { from: 'src/popup.html', to: 'popup.html' },
        { from: 'src/popup.css', to: 'popup.css' }
      ]
    })
  ]
};`;
}