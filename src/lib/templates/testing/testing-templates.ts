/**
 * Comprehensive Testing Templates for Chrome Extensions
 * Provides all testing configurations and examples
 */

import { 
  JEST_CONFIG_TEMPLATE, 
  JEST_SETUP_TEMPLATE,
  CHROME_MOCK_UTILS_TEMPLATE,
  SAMPLE_UNIT_TEST_TEMPLATE,
  SAMPLE_E2E_TEST_TEMPLATE,
  PERFORMANCE_TEST_TEMPLATE
} from './jest-config-template';

export interface TestingTemplate {
  name: string;
  description: string;
  files: {
    path: string;
    content: string;
  }[];
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
}

export const CHROME_EXTENSION_TESTING_TEMPLATE: TestingTemplate = {
  name: 'Chrome Extension Advanced Testing Suite',
  description: 'Complete testing setup with Jest, Puppeteer, and Chrome API mocks',
  files: [
    {
      path: 'jest.config.js',
      content: JEST_CONFIG_TEMPLATE
    },
    {
      path: 'tests/setup.ts',
      content: JEST_SETUP_TEMPLATE
    },
    {
      path: 'tests/test-utils/chrome-mock-utils.ts',
      content: CHROME_MOCK_UTILS_TEMPLATE
    },
    {
      path: 'tests/unit/storage-manager.test.ts',
      content: SAMPLE_UNIT_TEST_TEMPLATE
    },
    {
      path: 'tests/e2e/extension.e2e.test.ts',
      content: SAMPLE_E2E_TEST_TEMPLATE
    },
    {
      path: 'tests/performance/performance.test.ts',
      content: PERFORMANCE_TEST_TEMPLATE
    },
    {
      path: 'src/utils/storage-manager.ts',
      content: `/**
 * Storage Manager Utility
 * Provides a clean API for Chrome storage operations
 */

export class StorageManager {
  /**
   * Get data from chrome.storage.local
   */
  static async get<T = any>(keys: string | string[] | null): Promise<T>;
  static async get<T = any>(key: string, defaultValue: T): Promise<T>;
  static async get(keys: any, defaultValue?: any): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          console.error('Storage get error:', chrome.runtime.lastError);
          resolve(defaultValue ?? {});
          return;
        }
        
        if (typeof keys === 'string') {
          resolve(result[keys] ?? defaultValue);
        } else {
          resolve(result);
        }
      });
    });
  }
  
  /**
   * Set data in chrome.storage.local
   */
  static async set(items: Record<string, any>): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set(items, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }
  
  /**
   * Remove data from chrome.storage.local
   */
  static async remove(keys: string | string[]): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(keys, () => {
        if (chrome.runtime.lastError) {
          console.error('Storage remove error:', chrome.runtime.lastError);
        }
        resolve();
      });
    });
  }
  
  /**
   * Clear all data from chrome.storage.local
   */
  static async clear(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        if (chrome.runtime.lastError) {
          console.error('Storage clear error:', chrome.runtime.lastError);
        }
        resolve();
      });
    });
  }
  
  /**
   * Listen for storage changes
   */
  static onChanged(callback: (changes: chrome.storage.StorageChange, areaName: string) => void): void {
    chrome.storage.onChanged.addListener(callback);
  }
  
  /**
   * Remove storage change listener
   */
  static removeChangeListener(callback: (changes: chrome.storage.StorageChange, areaName: string) => void): void {
    chrome.storage.onChanged.removeListener(callback);
  }
}`
    },
    {
      path: 'tests/integration/message-passing.test.ts',
      content: `/**
 * Integration Test for Message Passing
 * Tests communication between extension components
 */

import { ChromeMockUtils } from '../test-utils/chrome-mock-utils';

describe('Message Passing Integration', () => {
  beforeEach(() => {
    ChromeMockUtils.setupMessageMocking();
  });
  
  describe('Background to Content Script', () => {
    it('should send messages from background to content script', async () => {
      const mockTab = { id: 1, url: 'https://example.com' };
      
      // Mock content script listener
      const contentScriptListener = jest.fn((message, sender, sendResponse) => {
        if (message.type === 'UPDATE_DOM') {
          sendResponse({ success: true, updated: message.data });
        }
      });
      
      chrome.runtime.onMessage.addListener(contentScriptListener);
      
      // Send message from background
      const response = await chrome.tabs.sendMessage(mockTab.id, {
        type: 'UPDATE_DOM',
        data: { element: '#test', content: 'Hello World' }
      });
      
      expect(contentScriptListener).toHaveBeenCalled();
      expect(response).toEqual({
        success: true,
        updated: { element: '#test', content: 'Hello World' }
      });
    });
  });
  
  describe('Popup to Background', () => {
    it('should handle request-response pattern', async () => {
      // Mock background script handler
      const backgroundListener = jest.fn((message, sender, sendResponse) => {
        switch (message.type) {
          case 'GET_USER_SETTINGS':
            sendResponse({ theme: 'dark', notifications: true });
            break;
          case 'UPDATE_USER_SETTINGS':
            sendResponse({ success: true });
            break;
        }
      });
      
      chrome.runtime.onMessage.addListener(backgroundListener);
      
      // Test getting settings
      const settings = await chrome.runtime.sendMessage({ type: 'GET_USER_SETTINGS' });
      expect(settings).toEqual({ theme: 'dark', notifications: true });
      
      // Test updating settings
      const updateResult = await chrome.runtime.sendMessage({
        type: 'UPDATE_USER_SETTINGS',
        settings: { theme: 'light' }
      });
      expect(updateResult).toEqual({ success: true });
    });
  });
  
  describe('Error Handling', () => {
    it('should handle errors in message passing', async () => {
      const errorListener = jest.fn((message, sender, sendResponse) => {
        if (message.type === 'WILL_FAIL') {
          throw new Error('Intentional error');
        }
      });
      
      chrome.runtime.onMessage.addListener(errorListener);
      
      await expect(
        chrome.runtime.sendMessage({ type: 'WILL_FAIL' })
      ).rejects.toThrow();
    });
  });
});`
    },
    {
      path: 'tests/visual-regression/visual.test.ts',
      content: `/**
 * Visual Regression Tests
 * Ensures UI consistency across changes
 */

import puppeteer from 'puppeteer';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

describe('Visual Regression Tests', () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 400, height: 600 });
  });
  
  afterEach(async () => {
    await page.close();
  });
  
  describe('Popup UI', () => {
    it('should match popup default state', async () => {
      await page.goto('http://localhost:3000/popup.html');
      await page.waitForSelector('#app');
      
      const screenshot = await page.screenshot();
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'popup-default',
        threshold: 0.1
      });
    });
    
    it('should match popup with settings open', async () => {
      await page.goto('http://localhost:3000/popup.html');
      await page.waitForSelector('#app');
      
      await page.click('#settings-button');
      await page.waitForSelector('#settings-panel');
      
      const screenshot = await page.screenshot();
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'popup-settings',
        threshold: 0.1
      });
    });
  });
  
  describe('Options Page', () => {
    it('should match options page layout', async () => {
      await page.goto('http://localhost:3000/options.html');
      await page.waitForSelector('#options-container');
      
      const screenshot = await page.screenshot({ fullPage: true });
      expect(screenshot).toMatchImageSnapshot({
        customSnapshotIdentifier: 'options-page',
        threshold: 0.1
      });
    });
  });
});`
    },
    {
      path: '.github/workflows/test.yml',
      content: `name: Test Chrome Extension

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js $\{{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: $\{{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run type-check
    
    - name: Run unit tests
      run: npm run test:unit -- --coverage
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Build extension
      run: npm run build
    
    - name: Run E2E tests
      run: |
        npm run test:e2e
      env:
        PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: true
        PUPPETEER_EXECUTABLE_PATH: /usr/bin/google-chrome-stable
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v4
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
    
    - name: Upload test artifacts
      if: failure()
      uses: actions/upload-artifact@v4
      with:
        name: test-artifacts
        path: |
          coverage/
          test-results/
          screenshots/`
    }
  ],
  dependencies: {
    'jest': '^29.7.0',
    '@types/jest': '^29.5.12',
    'ts-jest': '^29.2.0',
    '@testing-library/jest-dom': '^6.4.0',
    '@testing-library/react': '^16.0.0',
    '@testing-library/user-event': '^14.5.0',
    'jest-chrome': '^0.8.0',
    'puppeteer': '^23.0.0',
    '@types/puppeteer': '^7.0.0',
    'jest-image-snapshot': '^6.4.0',
    'jest-environment-jsdom': '^29.7.0',
    'identity-obj-proxy': '^3.0.0'
  },
  scripts: {
    'test': 'jest',
    'test:unit': 'jest tests/unit',
    'test:integration': 'jest tests/integration',
    'test:e2e': 'jest tests/e2e --runInBand',
    'test:performance': 'jest tests/performance',
    'test:visual': 'jest tests/visual-regression',
    'test:watch': 'jest --watch',
    'test:coverage': 'jest --coverage',
    'test:ci': 'jest --ci --coverage --maxWorkers=2'
  }
};