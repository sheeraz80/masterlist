/**
 * Advanced Jest Configuration Template for Chrome Extensions
 * Provides comprehensive testing setup with Chrome API mocking
 */

export const JEST_CONFIG_TEMPLATE = `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react'
      }
    }]
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/__tests__/*.{ts,tsx}'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/test/**/*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    chrome: {
      runtime: {},
      storage: {},
      tabs: {},
      // Add more Chrome APIs as needed
    }
  }
};`;

export const JEST_SETUP_TEMPLATE = `/**
 * Jest Setup File
 * Configures testing environment with Chrome API mocks
 */

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock Chrome APIs
global.chrome = {
  runtime: {
    id: 'test-extension-id',
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      hasListener: jest.fn()
    },
    connect: jest.fn(),
    onConnect: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    getManifest: jest.fn(() => ({
      version: '1.0.0',
      manifest_version: 3,
      name: 'Test Extension'
    }))
  },
  storage: {
    local: {
      get: jest.fn((keys, callback) => {
        if (callback) callback({});
        return Promise.resolve({});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
      remove: jest.fn((keys, callback) => {
        if (callback) callback();
        return Promise.resolve();
      }),
      clear: jest.fn((callback) => {
        if (callback) callback();
        return Promise.resolve();
      })
    },
    sync: {
      get: jest.fn((keys, callback) => {
        if (callback) callback({});
        return Promise.resolve({});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
        return Promise.resolve();
      })
    },
    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  tabs: {
    query: jest.fn((queryInfo, callback) => {
      if (callback) callback([]);
      return Promise.resolve([]);
    }),
    create: jest.fn((createProperties, callback) => {
      const tab = { id: 1, ...createProperties };
      if (callback) callback(tab);
      return Promise.resolve(tab);
    }),
    update: jest.fn((tabId, updateProperties, callback) => {
      const tab = { id: tabId, ...updateProperties };
      if (callback) callback(tab);
      return Promise.resolve(tab);
    }),
    remove: jest.fn((tabIds, callback) => {
      if (callback) callback();
      return Promise.resolve();
    }),
    sendMessage: jest.fn(),
    onActivated: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    onUpdated: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
    setIcon: jest.fn(),
    setPopup: jest.fn(),
    onClicked: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  contextMenus: {
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeAll: jest.fn(),
    onClicked: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  permissions: {
    request: jest.fn((permissions, callback) => {
      if (callback) callback(true);
      return Promise.resolve(true);
    }),
    remove: jest.fn((permissions, callback) => {
      if (callback) callback(true);
      return Promise.resolve(true);
    }),
    contains: jest.fn((permissions, callback) => {
      if (callback) callback(true);
      return Promise.resolve(true);
    })
  },
  notifications: {
    create: jest.fn((notificationId, options, callback) => {
      if (callback) callback(notificationId || 'test-notification');
      return Promise.resolve(notificationId || 'test-notification');
    }),
    clear: jest.fn((notificationId, callback) => {
      if (callback) callback(true);
      return Promise.resolve(true);
    }),
    onClicked: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  webRequest: {
    onBeforeRequest: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    onBeforeSendHeaders: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  i18n: {
    getMessage: jest.fn((messageName, substitutions) => messageName),
    getUILanguage: jest.fn(() => 'en'),
    detectLanguage: jest.fn((text, callback) => {
      const result = { languages: [{ language: 'en', percentage: 100 }] };
      if (callback) callback(result);
      return Promise.resolve(result);
    })
  }
} as any;

// Helper to reset all Chrome API mocks
global.resetChromeMocks = () => {
  Object.values(global.chrome).forEach(api => {
    if (typeof api === 'object') {
      Object.values(api).forEach(method => {
        if (typeof method === 'function' && method.mockReset) {
          method.mockReset();
        }
      });
    }
  });
};

// Reset mocks before each test
beforeEach(() => {
  global.resetChromeMocks();
});`;

export const CHROME_MOCK_UTILS_TEMPLATE = `/**
 * Chrome Extension Testing Utilities
 * Provides helper functions for testing Chrome extension functionality
 */

export class ChromeMockUtils {
  /**
   * Mock chrome.storage.local with initial data
   */
  static mockStorage(initialData: Record<string, any>) {
    const storage = { ...initialData };
    
    (chrome.storage.local.get as jest.Mock).mockImplementation((keys, callback) => {
      const result: Record<string, any> = {};
      
      if (keys === null || keys === undefined) {
        Object.assign(result, storage);
      } else if (typeof keys === 'string') {
        if (keys in storage) result[keys] = storage[keys];
      } else if (Array.isArray(keys)) {
        keys.forEach(key => {
          if (key in storage) result[key] = storage[key];
        });
      } else if (typeof keys === 'object') {
        Object.keys(keys).forEach(key => {
          result[key] = key in storage ? storage[key] : keys[key];
        });
      }
      
      if (callback) callback(result);
      return Promise.resolve(result);
    });
    
    (chrome.storage.local.set as jest.Mock).mockImplementation((items, callback) => {
      Object.assign(storage, items);
      if (callback) callback();
      return Promise.resolve();
    });
    
    (chrome.storage.local.remove as jest.Mock).mockImplementation((keys, callback) => {
      const keysArray = Array.isArray(keys) ? keys : [keys];
      keysArray.forEach(key => delete storage[key]);
      if (callback) callback();
      return Promise.resolve();
    });
    
    (chrome.storage.local.clear as jest.Mock).mockImplementation((callback) => {
      Object.keys(storage).forEach(key => delete storage[key]);
      if (callback) callback();
      return Promise.resolve();
    });
  }
  
  /**
   * Mock chrome.tabs with predefined tabs
   */
  static mockTabs(tabs: chrome.tabs.Tab[]) {
    (chrome.tabs.query as jest.Mock).mockImplementation((queryInfo, callback) => {
      let filteredTabs = [...tabs];
      
      if (queryInfo.active !== undefined) {
        filteredTabs = filteredTabs.filter(tab => tab.active === queryInfo.active);
      }
      if (queryInfo.currentWindow !== undefined) {
        filteredTabs = filteredTabs.filter(tab => tab.windowId === 1);
      }
      if (queryInfo.url) {
        const urlPattern = new RegExp(queryInfo.url.replace(/\\*/g, '.*'));
        filteredTabs = filteredTabs.filter(tab => tab.url && urlPattern.test(tab.url));
      }
      
      if (callback) callback(filteredTabs);
      return Promise.resolve(filteredTabs);
    });
  }
  
  /**
   * Mock message passing between extension components
   */
  static setupMessageMocking() {
    const messageListeners: ((message: any, sender: any, sendResponse: any) => void)[] = [];
    
    (chrome.runtime.onMessage.addListener as jest.Mock).mockImplementation((listener) => {
      messageListeners.push(listener);
    });
    
    (chrome.runtime.sendMessage as jest.Mock).mockImplementation((message, callback) => {
      messageListeners.forEach(listener => {
        listener(message, { id: 'test-extension-id', tab: null }, callback);
      });
      return Promise.resolve();
    });
    
    (chrome.tabs.sendMessage as jest.Mock).mockImplementation((tabId, message, callback) => {
      messageListeners.forEach(listener => {
        listener(message, { id: 'test-extension-id', tab: { id: tabId } }, callback);
      });
      return Promise.resolve();
    });
  }
  
  /**
   * Simulate user clicking on extension action
   */
  static simulateActionClick() {
    const listeners = (chrome.action.onClicked.addListener as jest.Mock).mock.calls
      .map(call => call[0]);
    
    const mockTab: chrome.tabs.Tab = {
      id: 1,
      index: 0,
      windowId: 1,
      active: true,
      url: 'https://example.com',
      title: 'Example Page'
    } as chrome.tabs.Tab;
    
    listeners.forEach(listener => listener(mockTab));
  }
  
  /**
   * Wait for all pending promises to resolve
   */
  static async flushPromises() {
    await new Promise(resolve => setImmediate(resolve));
  }
}`;

export const SAMPLE_UNIT_TEST_TEMPLATE = `/**
 * Sample Unit Test for Chrome Extension
 * Demonstrates testing patterns for various Chrome APIs
 */

import { ChromeMockUtils } from '../test-utils/chrome-mock-utils';
import { StorageManager } from '../src/utils/storage-manager';

describe('StorageManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ChromeMockUtils.mockStorage({});
  });
  
  describe('get', () => {
    it('should retrieve data from chrome.storage.local', async () => {
      ChromeMockUtils.mockStorage({ testKey: 'testValue' });
      
      const result = await StorageManager.get('testKey');
      
      expect(result).toBe('testValue');
      expect(chrome.storage.local.get).toHaveBeenCalledWith('testKey', expect.any(Function));
    });
    
    it('should return default value if key does not exist', async () => {
      const result = await StorageManager.get('nonExistentKey', 'defaultValue');
      
      expect(result).toBe('defaultValue');
    });
    
    it('should handle multiple keys', async () => {
      ChromeMockUtils.mockStorage({
        key1: 'value1',
        key2: 'value2'
      });
      
      const result = await StorageManager.get(['key1', 'key2']);
      
      expect(result).toEqual({
        key1: 'value1',
        key2: 'value2'
      });
    });
  });
  
  describe('set', () => {
    it('should store data in chrome.storage.local', async () => {
      await StorageManager.set({ testKey: 'testValue' });
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        { testKey: 'testValue' },
        expect.any(Function)
      );
      
      const result = await StorageManager.get('testKey');
      expect(result).toBe('testValue');
    });
    
    it('should handle storage errors gracefully', async () => {
      const error = new Error('Storage quota exceeded');
      (chrome.storage.local.set as jest.Mock).mockImplementation((items, callback) => {
        chrome.runtime.lastError = error;
        if (callback) callback();
        return Promise.reject(error);
      });
      
      await expect(StorageManager.set({ key: 'value' })).rejects.toThrow('Storage quota exceeded');
    });
  });
  
  describe('remove', () => {
    it('should remove data from chrome.storage.local', async () => {
      ChromeMockUtils.mockStorage({ testKey: 'testValue' });
      
      await StorageManager.remove('testKey');
      
      expect(chrome.storage.local.remove).toHaveBeenCalledWith('testKey', expect.any(Function));
      
      const result = await StorageManager.get('testKey');
      expect(result).toBeUndefined();
    });
  });
  
  describe('clear', () => {
    it('should clear all data from chrome.storage.local', async () => {
      ChromeMockUtils.mockStorage({
        key1: 'value1',
        key2: 'value2'
      });
      
      await StorageManager.clear();
      
      expect(chrome.storage.local.clear).toHaveBeenCalledWith(expect.any(Function));
      
      const result = await StorageManager.get(['key1', 'key2']);
      expect(result).toEqual({});
    });
  });
});`;

export const SAMPLE_E2E_TEST_TEMPLATE = `/**
 * Sample E2E Test for Chrome Extension
 * Uses Puppeteer to test extension in real browser environment
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';

describe('Chrome Extension E2E Tests', () => {
  let browser: Browser;
  let page: Page;
  let extensionId: string;
  
  beforeAll(async () => {
    const extensionPath = path.join(__dirname, '../dist');
    
    browser = await puppeteer.launch({
      headless: false, // Extensions only work in headful mode
      args: [
        \`--disable-extensions-except=\${extensionPath}\`,
        \`--load-extension=\${extensionPath}\`,
        '--no-sandbox'
      ]
    });
    
    // Get extension ID
    const targets = await browser.targets();
    const extensionTarget = targets.find(target => 
      target.type() === 'service_worker' && 
      target.url().startsWith('chrome-extension://')
    );
    
    if (extensionTarget) {
      const urlParts = extensionTarget.url().split('/');
      extensionId = urlParts[2];
    }
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  beforeEach(async () => {
    page = await browser.newPage();
  });
  
  afterEach(async () => {
    await page.close();
  });
  
  describe('Extension Installation', () => {
    it('should install successfully', () => {
      expect(extensionId).toBeDefined();
      expect(extensionId).toMatch(/^[a-z]{32}$/);
    });
  });
  
  describe('Popup', () => {
    it('should open popup when clicked', async () => {
      const popupUrl = \`chrome-extension://\${extensionId}/popup.html\`;
      await page.goto(popupUrl);
      
      await page.waitForSelector('#app', { timeout: 5000 });
      
      const title = await page.$eval('h1', el => el.textContent);
      expect(title).toBe('My Extension');
    });
    
    it('should save settings', async () => {
      const popupUrl = \`chrome-extension://\${extensionId}/popup.html\`;
      await page.goto(popupUrl);
      
      await page.waitForSelector('#settings-form');
      
      // Type in settings
      await page.type('#api-key', 'test-api-key');
      await page.click('#enable-notifications');
      
      // Save settings
      await page.click('#save-settings');
      
      // Wait for success message
      await page.waitForSelector('.success-message', { timeout: 3000 });
      
      // Reload and verify settings persisted
      await page.reload();
      await page.waitForSelector('#api-key');
      
      const apiKeyValue = await page.$eval('#api-key', (el: any) => el.value);
      expect(apiKeyValue).toBe('test-api-key');
    });
  });
  
  describe('Content Script', () => {
    it('should inject content script on matching pages', async () => {
      // Navigate to a page that matches manifest patterns
      await page.goto('https://example.com');
      
      // Wait for content script to inject
      await page.waitForFunction(() => {
        return document.querySelector('[data-extension-injected]') !== null;
      }, { timeout: 5000 });
      
      // Verify content script functionality
      const injectedElement = await page.$('[data-extension-injected]');
      expect(injectedElement).toBeTruthy();
    });
    
    it('should not inject on non-matching pages', async () => {
      await page.goto('https://google.com');
      
      // Wait a bit to ensure content script would have loaded
      await page.waitForTimeout(1000);
      
      const injectedElement = await page.$('[data-extension-injected]');
      expect(injectedElement).toBeFalsy();
    });
  });
  
  describe('Background Service Worker', () => {
    it('should respond to messages', async () => {
      await page.goto('about:blank');
      
      const response = await page.evaluate((extId) => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage(
            extId,
            { type: 'PING' },
            (response) => resolve(response)
          );
        });
      }, extensionId);
      
      expect(response).toEqual({ type: 'PONG' });
    });
  });
  
  describe('Context Menu', () => {
    it('should create context menu items', async () => {
      await page.goto('https://example.com');
      
      // Right-click to open context menu
      await page.click('body', { button: 'right' });
      
      // This is tricky to test in Puppeteer as context menus are OS-level
      // In real tests, you might need to use browser APIs or screenshots
      // For now, we'll just verify the API was called
      
      const contextMenuCreated = await page.evaluate((extId) => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage(
            extId,
            { type: 'GET_CONTEXT_MENU_STATUS' },
            (response) => resolve(response.created)
          );
        });
      }, extensionId);
      
      expect(contextMenuCreated).toBe(true);
    });
  });
  
  describe('Permissions', () => {
    it('should have required permissions', async () => {
      const permissions = await page.evaluate((extId) => {
        return new Promise((resolve) => {
          chrome.runtime.sendMessage(
            extId,
            { type: 'GET_PERMISSIONS' },
            (response) => resolve(response.permissions)
          );
        });
      }, extensionId);
      
      expect(permissions).toContain('storage');
      expect(permissions).toContain('tabs');
    });
  });
});`;

export const PERFORMANCE_TEST_TEMPLATE = `/**
 * Performance Tests for Chrome Extension
 * Measures and validates extension performance metrics
 */

import { performance } from 'perf_hooks';
import { ChromeMockUtils } from '../test-utils/chrome-mock-utils';

describe('Performance Tests', () => {
  describe('Storage Operations', () => {
    it('should complete storage operations within acceptable time', async () => {
      ChromeMockUtils.mockStorage({});
      
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        [\`key\${i}\`]: \`value\${i}\`.repeat(100)
      })).reduce((acc, curr) => ({ ...acc, ...curr }), {});
      
      const startTime = performance.now();
      
      await chrome.storage.local.set(largeData);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });
  });
  
  describe('Message Passing', () => {
    it('should handle high-frequency messages efficiently', async () => {
      ChromeMockUtils.setupMessageMocking();
      
      const messageCount = 1000;
      const startTime = performance.now();
      
      const promises = Array.from({ length: messageCount }, (_, i) => 
        chrome.runtime.sendMessage({ type: 'TEST', index: i })
      );
      
      await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      const avgTimePerMessage = duration / messageCount;
      
      expect(avgTimePerMessage).toBeLessThan(1); // Less than 1ms per message
    });
  });
  
  describe('Memory Usage', () => {
    it('should not leak memory during repeated operations', async () => {
      const iterations = 100;
      const memorySnapshots: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        // Perform operations that could leak memory
        await chrome.storage.local.set({ [\`temp\${i}\`]: 'x'.repeat(1000) });
        await chrome.storage.local.remove(\`temp\${i}\`);
        
        if (i % 10 === 0) {
          global.gc && global.gc(); // Force garbage collection if available
          const memUsage = process.memoryUsage();
          memorySnapshots.push(memUsage.heapUsed);
        }
      }
      
      // Check that memory usage doesn't consistently increase
      const firstHalf = memorySnapshots.slice(0, 5);
      const secondHalf = memorySnapshots.slice(5);
      
      const avgFirstHalf = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecondHalf = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      // Memory usage shouldn't increase by more than 10%
      expect(avgSecondHalf).toBeLessThan(avgFirstHalf * 1.1);
    });
  });
  
  describe('DOM Operations', () => {
    it('should efficiently update DOM elements', async () => {
      document.body.innerHTML = '<div id="container"></div>';
      const container = document.getElementById('container')!;
      
      const elementCount = 1000;
      const startTime = performance.now();
      
      // Create elements in batch
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < elementCount; i++) {
        const div = document.createElement('div');
        div.textContent = \`Item \${i}\`;
        div.className = 'list-item';
        fragment.appendChild(div);
      }
      
      container.appendChild(fragment);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(50); // Should complete within 50ms
      expect(container.children.length).toBe(elementCount);
    });
  });
});`;