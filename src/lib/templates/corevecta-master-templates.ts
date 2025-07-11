/**
 * CoreVecta LLC - Master Template System
 * Production-ready templates for all platforms with enterprise standards
 */

export interface CoreVectaTemplate {
  core: Record<string, TemplateFile>;
  quality?: Record<string, TemplateFile>;
  security?: Record<string, TemplateFile>;
  business?: Record<string, TemplateFile>;
  operations?: Record<string, TemplateFile>;
  documentation?: Record<string, TemplateFile>;
}

export interface TemplateFile {
  content: string | object;
  description?: string;
  required?: boolean;
}

/**
 * Enhanced Chrome Extension Template with Master Checklist Standards
 */
export const CHROME_EXTENSION_MASTER_TEMPLATE: CoreVectaTemplate = {
  core: {
    'manifest.json': {
      content: {
        manifest_version: 3,
        name: '{{PROJECT_NAME}}',
        version: '1.0.0',
        description: '{{PROJECT_DESCRIPTION}}',
        author: 'Built with CoreVecta Masterlist',
        homepage_url: 'https://corevecta.com',
        permissions: [],
        host_permissions: [],
        background: {
          service_worker: 'src/background/index.js',
          type: 'module'
        },
        action: {
          default_popup: 'src/popup/index.html',
          default_icon: {
            16: 'assets/icons/icon-16.png',
            48: 'assets/icons/icon-48.png',
            128: 'assets/icons/icon-128.png'
          }
        },
        icons: {
          16: 'assets/icons/icon-16.png',
          48: 'assets/icons/icon-48.png',
          128: 'assets/icons/icon-128.png'
        },
        content_scripts: [{
          matches: ['<all_urls>'],
          js: ['src/content/index.js'],
          run_at: 'document_end'
        }],
        web_accessible_resources: [{
          resources: ['assets/*'],
          matches: ['<all_urls>']
        }],
        content_security_policy: {
          extension_pages: "script-src 'self'; object-src 'none';"
        }
      },
      required: true
    },
    'package.json': {
      content: {
        name: '{{PACKAGE_NAME}}',
        version: '1.0.0',
        description: '{{PROJECT_DESCRIPTION}}',
        author: 'CoreVecta LLC',
        license: 'MIT',
        scripts: {
          'dev': 'webpack --mode development --watch',
          'build': 'webpack --mode production',
          'build:secure': 'webpack --mode production --env secure',
          'test': 'jest --coverage',
          'test:watch': 'jest --watch',
          'test:e2e': 'playwright test',
          'lint': 'eslint src --ext .ts,.tsx,.js,.jsx',
          'lint:fix': 'eslint src --ext .ts,.tsx,.js,.jsx --fix',
          'type-check': 'tsc --noEmit',
          'security:check': 'npm audit && snyk test',
          'bundle:analyze': 'webpack-bundle-analyzer dist/stats.json',
          'package': 'npm run build && node scripts/package.js',
          'package:qa': 'npm run build && node scripts/package.js --qa',
          'validate': 'node scripts/validate-extension.js',
          'docs:generate': 'typedoc src --out docs',
          'pre-commit': 'lint-staged',
          'release': 'semantic-release'
        },
        dependencies: {
          '@corevecta/extension-core': '^1.0.0',
          'webextension-polyfill': '^0.12.0'
        },
        devDependencies: {
          '@types/chrome': '^0.0.270',
          '@types/jest': '^29.5.12',
          '@types/node': '^22.0.0',
          '@typescript-eslint/eslint-plugin': '^8.0.0',
          '@typescript-eslint/parser': '^8.0.0',
          'copy-webpack-plugin': '^12.0.0',
          'css-loader': '^7.1.0',
          'eslint': '^9.0.0',
          'eslint-config-prettier': '^9.1.0',
          'eslint-plugin-security': '^3.0.0',
          'html-webpack-plugin': '^5.6.0',
          'husky': '^9.0.0',
          'jest': '^29.7.0',
          'jest-chrome': '^0.8.0',
          'lint-staged': '^15.0.0',
          'playwright': '^1.48.0',
          'prettier': '^3.3.0',
          'semantic-release': '^24.0.0',
          'snyk': '^1.1300.0',
          'style-loader': '^4.0.0',
          'terser-webpack-plugin': '^5.3.0',
          'ts-jest': '^29.2.0',
          'ts-loader': '^9.5.0',
          'typedoc': '^0.26.0',
          'typescript': '^5.8.0',
          'webpack': '^5.95.0',
          'webpack-bundle-analyzer': '^4.10.0',
          'webpack-cli': '^5.1.0',
          'webpack-merge': '^6.0.0',
          'webpackbar': '^6.0.0'
        }
      },
      required: true
    },
    'README.md': {
      content: `# {{PROJECT_NAME}}

<div align="center">
  <img src="assets/logo.png" alt="{{PROJECT_NAME}} Logo" width="128" height="128">
  
  [![CoreVecta Certified](https://img.shields.io/badge/CoreVecta-Certified-gold)](https://corevecta.com)
  [![Chrome Web Store](https://img.shields.io/chrome-web-store/v/{{EXTENSION_ID}})](https://chrome.google.com/webstore/detail/{{EXTENSION_ID}})
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Tests](https://github.com/{{GITHUB_ORG}}/{{REPO_NAME}}/workflows/tests/badge.svg)](https://github.com/{{GITHUB_ORG}}/{{REPO_NAME}}/actions)
  [![Coverage](https://codecov.io/gh/{{GITHUB_ORG}}/{{REPO_NAME}}/branch/main/graph/badge.svg)](https://codecov.io/gh/{{GITHUB_ORG}}/{{REPO_NAME}})
</div>

## 🚀 Overview

{{PROJECT_DESCRIPTION}}

### ✨ Key Features

{{KEY_FEATURES}}

## 📦 Installation

### From Chrome Web Store
1. Visit [Chrome Web Store](https://chrome.google.com/webstore/detail/{{EXTENSION_ID}})
2. Click "Add to Chrome"
3. Follow the installation prompts

### From Source
\`\`\`bash
# Clone the repository
git clone https://github.com/{{GITHUB_ORG}}/{{REPO_NAME}}.git
cd {{REPO_NAME}}

# Install dependencies
npm install

# Build the extension
npm run build

# Load in Chrome
# 1. Open chrome://extensions
# 2. Enable Developer mode
# 3. Click "Load unpacked"
# 4. Select the 'dist' folder
\`\`\`

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm 9+
- Chrome browser

### Setup
\`\`\`bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
\`\`\`

### Building
\`\`\`bash
# Development build
npm run build

# Production build (minified)
npm run build:secure

# Create distribution package
npm run package
\`\`\`

## 🧪 Testing

\`\`\`bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
\`\`\`

## 🔒 Security

- Content Security Policy enforced
- All permissions minimized
- Input sanitization on all user inputs
- Regular security audits with Snyk

## 📊 Performance

- Loads in < 100ms
- Memory usage < 50MB
- Zero performance impact on browsing

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 🏆 CoreVecta Certification

This extension is **CoreVecta Gold Certified**, meeting the highest standards for:
- ✅ Code Quality
- ✅ Security
- ✅ Performance
- ✅ User Experience
- ✅ Documentation

---

<div align="center">
  Built with ❤️ using <a href="https://corevecta.com">CoreVecta Masterlist</a>
</div>`,
      required: true
    },
    'CLAUDE.md': {
      content: `# Claude AI Assistant Context

This file provides context for AI assistants working on this project.

## Project Overview
- **Name**: {{PROJECT_NAME}}
- **Type**: Chrome Extension (Manifest V3)
- **Purpose**: {{PROJECT_DESCRIPTION}}
- **Complexity**: {{COMPLEXITY}}
- **CoreVecta Certified**: Yes

## Architecture
- Service Worker for background tasks
- Content scripts for page interaction
- Popup for user interface
- Options page for settings
- Chrome Storage API for data persistence

## Key Files
- \`manifest.json\` - Extension configuration
- \`src/background/\` - Service worker code
- \`src/content/\` - Content scripts
- \`src/popup/\` - Popup UI
- \`src/options/\` - Options page
- \`src/shared/\` - Shared utilities

## Development Workflow
1. Run \`npm run dev\` for development
2. Load unpacked extension from \`dist/\` folder
3. Make changes and webpack will auto-reload
4. Run tests with \`npm test\`
5. Build for production with \`npm run build:secure\`

## Quality Standards
- Minimum 80% test coverage
- Zero ESLint errors
- All TypeScript strict checks pass
- Security scan clean
- Performance benchmarks met

## Common Tasks
- Add new feature: Create in appropriate module
- Fix bug: Add test first, then fix
- Update dependencies: Run security audit after
- Release: Use semantic versioning

## CoreVecta Standards
This project follows CoreVecta's quality standards for:
- Clean code architecture
- Comprehensive testing
- Security best practices
- Performance optimization
- Complete documentation`,
      required: true
    }
  },
  
  quality: {
    'jest.config.js': {
      content: `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.stories.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};`,
      required: true
    },
    '.eslintrc.json': {
      content: {
        extends: [
          'eslint:recommended',
          'plugin:@typescript-eslint/recommended',
          'plugin:security/recommended',
          'prettier'
        ],
        parser: '@typescript-eslint/parser',
        plugins: ['@typescript-eslint', 'security'],
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: 'module',
          project: './tsconfig.json'
        },
        env: {
          browser: true,
          es2022: true,
          node: true,
          webextensions: true
        },
        rules: {
          '@typescript-eslint/explicit-function-return-type': 'error',
          '@typescript-eslint/no-explicit-any': 'error',
          '@typescript-eslint/no-unused-vars': 'error',
          'security/detect-object-injection': 'warn',
          'no-console': ['error', { allow: ['warn', 'error'] }],
          'complexity': ['error', 10],
          'max-lines-per-function': ['error', 50],
          'max-lines': ['error', 300]
        }
      },
      required: true
    },
    '.prettierrc': {
      content: {
        semi: true,
        trailingComma: 'es5',
        singleQuote: true,
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
        arrowParens: 'always',
        endOfLine: 'lf'
      },
      required: true
    }
  },
  
  security: {
    'src/security/content-security-policy.ts': {
      content: `/**
 * CoreVecta Security - Content Security Policy Configuration
 */

export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'"],
  'style-src': ["'self'", "'unsafe-inline'"], // Required for some UI libraries
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'"],
  'connect-src': ["'self'", 'https://api.corevecta.com'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

export function generateCSP(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, values]) => 
      values.length > 0 
        ? \`\${directive} \${values.join(' ')}\`
        : directive
    )
    .join('; ');
}

export function applyCSP(): void {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = generateCSP();
  document.head.appendChild(meta);
}`,
      required: true
    },
    'src/security/sanitizer.ts': {
      content: `/**
 * CoreVecta Security - Input Sanitization Utilities
 */

import DOMPurify from 'dompurify';

export class Sanitizer {
  /**
   * Sanitize HTML content to prevent XSS
   */
  static sanitizeHTML(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'target', 'rel']
    });
  }

  /**
   * Sanitize user input for display
   */
  static sanitizeText(input: string): string {
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .trim();
  }

  /**
   * Validate and sanitize URLs
   */
  static sanitizeURL(url: string): string | null {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return null;
      }
      return parsed.toString();
    } catch {
      return null;
    }
  }

  /**
   * Escape HTML entities
   */
  static escapeHTML(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}`,
      required: true
    }
  },
  
  business: {
    'src/monetization/license-manager.ts': {
      content: `/**
 * CoreVecta Monetization - License Management System
 */

interface License {
  key: string;
  type: 'free' | 'pro' | 'enterprise';
  expiresAt: Date | null;
  features: string[];
  deviceLimit: number;
}

export class LicenseManager {
  private static LICENSE_KEY = 'corevecta_license';
  private static DEVICE_ID = 'corevecta_device_id';
  
  /**
   * Validate license with CoreVecta servers
   */
  static async validateLicense(licenseKey: string): Promise<License | null> {
    try {
      const response = await fetch('https://api.corevecta.com/v1/licenses/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-ID': chrome.runtime.id
        },
        body: JSON.stringify({
          key: licenseKey,
          deviceId: await this.getDeviceId(),
          extensionVersion: chrome.runtime.getManifest().version
        })
      });

      if (!response.ok) {
        return null;
      }

      const license = await response.json();
      await this.storeLicense(license);
      return license;
    } catch (error) {
      console.error('License validation failed:', error);
      return null;
    }
  }

  /**
   * Check if feature is available in current license
   */
  static async hasFeature(feature: string): Promise<boolean> {
    const license = await this.getCurrentLicense();
    if (!license) return false;
    
    if (license.type === 'free') {
      return ['basic-feature-1', 'basic-feature-2'].includes(feature);
    }
    
    return license.features.includes(feature);
  }

  /**
   * Get current license from storage
   */
  private static async getCurrentLicense(): Promise<License | null> {
    const { [this.LICENSE_KEY]: license } = await chrome.storage.sync.get(this.LICENSE_KEY);
    
    if (!license) return null;
    
    // Check expiration
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      await this.removeLicense();
      return null;
    }
    
    return license;
  }

  /**
   * Store license in secure storage
   */
  private static async storeLicense(license: License): Promise<void> {
    await chrome.storage.sync.set({
      [this.LICENSE_KEY]: license
    });
  }

  /**
   * Remove expired or invalid license
   */
  private static async removeLicense(): Promise<void> {
    await chrome.storage.sync.remove(this.LICENSE_KEY);
  }

  /**
   * Generate unique device ID
   */
  private static async getDeviceId(): Promise<string> {
    const { [this.DEVICE_ID]: existingId } = await chrome.storage.local.get(this.DEVICE_ID);
    
    if (existingId) return existingId;
    
    const newId = crypto.randomUUID();
    await chrome.storage.local.set({ [this.DEVICE_ID]: newId });
    return newId;
  }
}`,
      required: true
    },
    'src/analytics/tracker.ts': {
      content: `/**
 * CoreVecta Analytics - Privacy-Compliant Analytics
 */

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
}

export class Analytics {
  private static ANALYTICS_ENABLED = 'analytics_enabled';
  private static USER_ID = 'analytics_user_id';
  private static queue: AnalyticsEvent[] = [];
  private static isInitialized = false;

  /**
   * Initialize analytics with user consent
   */
  static async initialize(): Promise<void> {
    const { [this.ANALYTICS_ENABLED]: enabled } = await chrome.storage.sync.get(this.ANALYTICS_ENABLED);
    
    if (!enabled) return;
    
    this.isInitialized = true;
    await this.flushQueue();
  }

  /**
   * Track user event (privacy-compliant)
   */
  static async track(event: AnalyticsEvent): Promise<void> {
    if (!await this.isEnabled()) return;

    const enrichedEvent = {
      ...event,
      timestamp: Date.now(),
      version: chrome.runtime.getManifest().version,
      userId: await this.getUserId()
    };

    if (this.isInitialized) {
      await this.sendEvent(enrichedEvent);
    } else {
      this.queue.push(enrichedEvent);
    }
  }

  /**
   * Track feature usage
   */
  static async trackFeature(feature: string, metadata?: Record<string, any>): Promise<void> {
    await this.track({
      category: 'Features',
      action: 'Use',
      label: feature,
      ...metadata
    });
  }

  /**
   * Track conversion events
   */
  static async trackConversion(type: string, value?: number): Promise<void> {
    await this.track({
      category: 'Conversions',
      action: type,
      value
    });
  }

  /**
   * Check if analytics is enabled
   */
  private static async isEnabled(): Promise<boolean> {
    const { [this.ANALYTICS_ENABLED]: enabled } = await chrome.storage.sync.get(this.ANALYTICS_ENABLED);
    return enabled === true;
  }

  /**
   * Get or create anonymous user ID
   */
  private static async getUserId(): Promise<string> {
    const { [this.USER_ID]: userId } = await chrome.storage.sync.get(this.USER_ID);
    
    if (userId) return userId;
    
    const newId = crypto.randomUUID();
    await chrome.storage.sync.set({ [this.USER_ID]: newId });
    return newId;
  }

  /**
   * Send event to analytics server
   */
  private static async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('https://analytics.corevecta.com/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-ID': chrome.runtime.id
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  /**
   * Flush queued events
   */
  private static async flushQueue(): Promise<void> {
    const events = [...this.queue];
    this.queue = [];
    
    for (const event of events) {
      await this.sendEvent(event);
    }
  }
}`,
      required: true
    }
  },
  
  operations: {
    '.github/workflows/ci.yml': {
      content: `name: CI

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
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linter
      run: npm run lint
    
    - name: Type check
      run: npm run type-check
    
    - name: Run tests
      run: npm test -- --coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
    
    - name: Security audit
      run: npm audit --audit-level=high
    
    - name: Build extension
      run: npm run build
    
    - name: Validate extension
      run: npm run validate
    
    - name: Run E2E tests
      run: npm run test:e2e
    
    - name: Bundle size check
      run: npm run bundle:analyze -- --json > bundle-stats.json
      
    - name: Upload bundle stats
      uses: actions/upload-artifact@v3
      with:
        name: bundle-stats
        path: bundle-stats.json`,
      required: true
    },
    '.github/workflows/release.yml': {
      content: `name: Release

on:
  push:
    branches: [main]
    
permissions:
  contents: write
  issues: write
  pull-requests: write

jobs:
  release:
    runs-on: ubuntu-latest
    if: "!contains(github.event.head_commit.message, '[skip release]')"
    
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
        token: \${{ secrets.GITHUB_TOKEN }}
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build extension
      run: npm run build:secure
    
    - name: Create release package
      run: npm run package
    
    - name: Run semantic-release
      env:
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        NPM_TOKEN: \${{ secrets.NPM_TOKEN }}
      run: npm run release
    
    - name: Upload to Chrome Web Store
      uses: corevecta/chrome-webstore-upload@v1
      with:
        client-id: \${{ secrets.CHROME_CLIENT_ID }}
        client-secret: \${{ secrets.CHROME_CLIENT_SECRET }}
        refresh-token: \${{ secrets.CHROME_REFRESH_TOKEN }}
        extension-id: \${{ secrets.CHROME_EXTENSION_ID }}
        zip-file: ./dist/extension.zip
    
    - name: Create GitHub Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: v\${{ steps.version.outputs.version }}
        release_name: Release v\${{ steps.version.outputs.version }}
        draft: false
        prerelease: false`,
      required: true
    }
  },
  
  documentation: {
    'docs/API.md': {
      content: `# {{PROJECT_NAME}} API Documentation

## Overview

This document describes the public APIs available in {{PROJECT_NAME}}.

## Chrome Extension APIs

### Message Passing

#### Send Message to Background
\`\`\`typescript
chrome.runtime.sendMessage({
  action: 'actionName',
  data: { /* payload */ }
}, (response) => {
  // Handle response
});
\`\`\`

#### Listen for Messages
\`\`\`typescript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'actionName') {
    // Process request
    sendResponse({ success: true, data: result });
  }
  return true; // Keep channel open for async response
});
\`\`\`

### Storage API

#### Save Data
\`\`\`typescript
await chrome.storage.sync.set({ key: value });
await chrome.storage.local.set({ key: value });
\`\`\`

#### Retrieve Data
\`\`\`typescript
const { key } = await chrome.storage.sync.get('key');
const { key } = await chrome.storage.local.get(['key1', 'key2']);
\`\`\`

## Public APIs

### License Management
\`\`\`typescript
import { LicenseManager } from '@/monetization/license-manager';

// Validate license
const license = await LicenseManager.validateLicense('LICENSE-KEY');

// Check feature availability
const hasFeature = await LicenseManager.hasFeature('premium-feature');
\`\`\`

### Analytics
\`\`\`typescript
import { Analytics } from '@/analytics/tracker';

// Track event
await Analytics.track({
  category: 'User Action',
  action: 'Click',
  label: 'Button Name'
});

// Track feature usage
await Analytics.trackFeature('feature-name');
\`\`\`

### Security
\`\`\`typescript
import { Sanitizer } from '@/security/sanitizer';

// Sanitize HTML
const clean = Sanitizer.sanitizeHTML(dirtyHTML);

// Sanitize URL
const safeURL = Sanitizer.sanitizeURL(userInput);
\`\`\`

## Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| E001 | Invalid license key | Check license key format |
| E002 | Network error | Check internet connection |
| E003 | Storage quota exceeded | Clear unnecessary data |
| E004 | Permission denied | Grant required permissions |

## Rate Limits

- API calls: 100 requests per minute
- Storage operations: 1000 per hour
- License validation: 10 per hour

---

Generated with ❤️ by CoreVecta Masterlist`,
      required: true
    },
    'CONTRIBUTING.md': {
      content: `# Contributing to {{PROJECT_NAME}}

Thank you for your interest in contributing to {{PROJECT_NAME}}!

## Code of Conduct

This project follows CoreVecta's Code of Conduct. Please be respectful and professional.

## Development Setup

1. Fork the repository
2. Clone your fork: \`git clone https://github.com/YOUR-USERNAME/{{REPO_NAME}}.git\`
3. Install dependencies: \`npm install\`
4. Create a feature branch: \`git checkout -b feature/your-feature\`

## Development Workflow

1. Make your changes
2. Add tests for new functionality
3. Ensure all tests pass: \`npm test\`
4. Check linting: \`npm run lint\`
5. Build the extension: \`npm run build\`
6. Test manually in Chrome

## Code Standards

- Follow CoreVecta coding standards
- Write clean, readable code
- Add JSDoc comments for public APIs
- Keep functions under 50 lines
- Maintain 80%+ test coverage

## Testing

- Write unit tests for all new functions
- Add E2E tests for user flows
- Test in multiple Chrome versions
- Verify memory usage and performance

## Commit Messages

Follow conventional commits:
- \`feat:\` New features
- \`fix:\` Bug fixes
- \`docs:\` Documentation changes
- \`style:\` Code style changes
- \`refactor:\` Code refactoring
- \`test:\` Test additions/changes
- \`chore:\` Build/tool changes

## Pull Request Process

1. Update documentation
2. Add tests
3. Update CHANGELOG.md
4. Request review from maintainers
5. Address review feedback
6. Squash commits before merge

## Security

- Never commit secrets or API keys
- Report security issues privately
- Follow security best practices
- Run security audit before PR

## Questions?

Open an issue or contact the CoreVecta team.

Thank you for contributing! 🎉`,
      required: true
    }
  }
};

/**
 * Get complete template for a platform with specified complexity
 */
export function getMasterTemplate(
  platform: string,
  complexity: 'basic' | 'intermediate' | 'advanced' | 'enterprise'
): CoreVectaTemplate {
  const baseTemplate = getBaseTemplate(platform);
  
  // Add quality features for intermediate and above
  if (complexity !== 'basic') {
    baseTemplate.quality = CHROME_EXTENSION_MASTER_TEMPLATE.quality;
  }
  
  // Add security features for intermediate and above
  if (complexity !== 'basic') {
    baseTemplate.security = CHROME_EXTENSION_MASTER_TEMPLATE.security;
  }
  
  // Add business features for advanced and above
  if (complexity === 'advanced' || complexity === 'enterprise') {
    baseTemplate.business = CHROME_EXTENSION_MASTER_TEMPLATE.business;
  }
  
  // Add operations features for advanced and above
  if (complexity === 'advanced' || complexity === 'enterprise') {
    baseTemplate.operations = CHROME_EXTENSION_MASTER_TEMPLATE.operations;
  }
  
  // Add comprehensive documentation for all levels
  baseTemplate.documentation = CHROME_EXTENSION_MASTER_TEMPLATE.documentation;
  
  return baseTemplate;
}

function getBaseTemplate(platform: string): CoreVectaTemplate {
  // Platform-specific base templates
  const templates = {
    'chrome-extension': CHROME_EXTENSION_MASTER_TEMPLATE,
    // Add other platforms here
  };
  
  return templates[platform] || CHROME_EXTENSION_MASTER_TEMPLATE;
}