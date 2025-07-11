/**
 * Cross-Browser Extension Templates
 * Provides compatibility layers for Chrome, Firefox, Edge, and Safari
 */

export interface CrossBrowserTemplate {
  name: string;
  browser: 'chrome' | 'firefox' | 'edge' | 'safari' | 'universal';
  files: {
    path: string;
    content: string;
  }[];
  manifestOverrides?: Record<string, any>;
}

export const BROWSER_API_POLYFILL = `/**
 * Browser API Polyfill
 * Provides unified API across different browsers
 */

(function() {
  'use strict';
  
  // Create browser namespace if it doesn't exist
  if (typeof browser === 'undefined') {
    window.browser = chrome;
  }
  
  // Promisify Chrome APIs for Firefox compatibility
  const promisify = (fn: Function) => {
    return (...args: any[]) => {
      return new Promise((resolve, reject) => {
        fn(...args, (result: any) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        });
      });
    };
  };
  
  // Storage API compatibility
  if (browser.storage && !browser.storage.local.get.then) {
    const storage = browser.storage;
    ['local', 'sync', 'managed'].forEach(area => {
      if (storage[area]) {
        const originalArea = storage[area];
        storage[area] = {
          ...originalArea,
          get: promisify(originalArea.get.bind(originalArea)),
          set: promisify(originalArea.set.bind(originalArea)),
          remove: promisify(originalArea.remove.bind(originalArea)),
          clear: promisify(originalArea.clear.bind(originalArea)),
          getBytesInUse: originalArea.getBytesInUse ? 
            promisify(originalArea.getBytesInUse.bind(originalArea)) : undefined
        };
      }
    });
  }
  
  // Tabs API compatibility
  if (browser.tabs && !browser.tabs.query.then) {
    const tabs = browser.tabs;
    ['query', 'create', 'update', 'remove', 'sendMessage', 'executeScript', 'insertCSS'].forEach(method => {
      if (tabs[method]) {
        tabs[method] = promisify(tabs[method].bind(tabs));
      }
    });
  }
  
  // Runtime API compatibility
  if (browser.runtime && !browser.runtime.sendMessage.then) {
    const runtime = browser.runtime;
    ['sendMessage', 'sendNativeMessage'].forEach(method => {
      if (runtime[method]) {
        runtime[method] = promisify(runtime[method].bind(runtime));
      }
    });
  }
  
  // Permissions API compatibility
  if (browser.permissions && !browser.permissions.request.then) {
    const permissions = browser.permissions;
    ['request', 'remove', 'contains', 'getAll'].forEach(method => {
      if (permissions[method]) {
        permissions[method] = promisify(permissions[method].bind(permissions));
      }
    });
  }
  
  // Windows API compatibility
  if (browser.windows && !browser.windows.create.then) {
    const windows = browser.windows;
    ['get', 'getCurrent', 'getLastFocused', 'getAll', 'create', 'update', 'remove'].forEach(method => {
      if (windows[method]) {
        windows[method] = promisify(windows[method].bind(windows));
      }
    });
  }
  
  // Firefox-specific APIs
  if (browser.runtime.getBrowserInfo) {
    // Already Firefox, no changes needed
  } else {
    // Add Firefox-like API for other browsers
    browser.runtime.getBrowserInfo = async () => ({
      name: 'Chrome',
      vendor: 'Google',
      version: navigator.userAgent.match(/Chrome\\/([0-9.]+)/)?.[1] || 'unknown',
      buildID: ''
    });
  }
  
  // Safari-specific handling
  if (typeof safari !== 'undefined') {
    // Map Safari APIs to WebExtension APIs
    if (safari.extension) {
      browser.runtime.sendMessage = (message: any) => {
        return new Promise((resolve) => {
          safari.extension.dispatchMessage('message', message);
          // Safari doesn't support response callbacks directly
          resolve(undefined);
        });
      };
    }
  }
})();`;

export const MANIFEST_CONVERTER = `/**
 * Manifest Converter
 * Converts between Manifest V3 and browser-specific formats
 */

export class ManifestConverter {
  /**
   * Convert Chrome Manifest V3 to Firefox format
   */
  static toFirefox(chromeManifest: any): any {
    const firefoxManifest = { ...chromeManifest };
    
    // Firefox uses browser_action instead of action
    if (firefoxManifest.action) {
      firefoxManifest.browser_action = firefoxManifest.action;
      delete firefoxManifest.action;
    }
    
    // Firefox uses background scripts array
    if (firefoxManifest.background?.service_worker) {
      firefoxManifest.background = {
        scripts: [firefoxManifest.background.service_worker],
        persistent: false
      };
    }
    
    // Firefox-specific applications field
    firefoxManifest.browser_specific_settings = {
      gecko: {
        id: '{' + crypto.randomUUID() + '}',
        strict_min_version: '109.0'
      }
    };
    
    // Host permissions in Firefox
    if (firefoxManifest.host_permissions) {
      firefoxManifest.permissions = [
        ...(firefoxManifest.permissions || []),
        ...firefoxManifest.host_permissions
      ];
      delete firefoxManifest.host_permissions;
    }
    
    // Firefox doesn't support some Chrome APIs
    firefoxManifest.permissions = firefoxManifest.permissions?.filter(
      (perm: string) => !['offscreen', 'sidePanel'].includes(perm)
    );
    
    return firefoxManifest;
  }
  
  /**
   * Convert Chrome Manifest V3 to Edge format
   */
  static toEdge(chromeManifest: any): any {
    // Edge uses mostly the same format as Chrome
    const edgeManifest = { ...chromeManifest };
    
    // Add Edge-specific branding if needed
    edgeManifest.author = edgeManifest.author || 'CoreVecta';
    
    return edgeManifest;
  }
  
  /**
   * Convert Chrome Manifest V3 to Safari format
   */
  static toSafari(chromeManifest: any): any {
    const safariManifest = { ...chromeManifest };
    
    // Safari uses browser_action
    if (safariManifest.action) {
      safariManifest.browser_action = safariManifest.action;
      delete safariManifest.action;
    }
    
    // Safari doesn't support service workers yet
    if (safariManifest.background?.service_worker) {
      safariManifest.background = {
        scripts: [safariManifest.background.service_worker],
        persistent: false
      };
    }
    
    // Safari-specific permissions handling
    const unsupportedPermissions = ['declarativeNetRequest', 'offscreen'];
    safariManifest.permissions = safariManifest.permissions?.filter(
      (perm: string) => !unsupportedPermissions.includes(perm)
    );
    
    return safariManifest;
  }
  
  /**
   * Create universal manifest that works across browsers
   */
  static createUniversal(baseManifest: any): any {
    return {
      ...baseManifest,
      // Use both action and browser_action for compatibility
      browser_action: baseManifest.action || baseManifest.browser_action,
      action: baseManifest.action || baseManifest.browser_action,
      
      // Background compatibility
      background: {
        service_worker: baseManifest.background?.service_worker,
        scripts: baseManifest.background?.scripts || [baseManifest.background?.service_worker],
        persistent: false
      },
      
      // Include browser-specific settings
      browser_specific_settings: {
        gecko: {
          id: '{' + crypto.randomUUID() + '}',
          strict_min_version: '109.0'
        }
      }
    };
  }
}`;

export const CROSS_BROWSER_STORAGE = `/**
 * Cross-Browser Storage Manager
 * Handles storage differences between browsers
 */

export class CrossBrowserStorage {
  private static readonly STORAGE_AREAS = ['local', 'sync', 'managed'] as const;
  
  /**
   * Get storage area with fallback
   */
  private static getStorageArea(area: 'local' | 'sync' | 'managed' = 'local') {
    // Safari doesn't support sync storage
    if (area === 'sync' && !browser.storage.sync) {
      console.warn('Sync storage not available, falling back to local');
      return browser.storage.local;
    }
    
    return browser.storage[area];
  }
  
  /**
   * Get data from storage
   */
  static async get(
    keys: string | string[] | null,
    area: 'local' | 'sync' = 'local'
  ): Promise<any> {
    const storage = this.getStorageArea(area);
    
    try {
      const result = await storage.get(keys);
      return keys && typeof keys === 'string' ? result[keys] : result;
    } catch (error) {
      console.error('Storage get error:', error);
      
      // Fallback for Safari
      if (typeof safari !== 'undefined' && safari.extension?.settings) {
        if (typeof keys === 'string') {
          return safari.extension.settings[keys];
        }
      }
      
      return null;
    }
  }
  
  /**
   * Set data in storage
   */
  static async set(
    items: Record<string, any>,
    area: 'local' | 'sync' = 'local'
  ): Promise<void> {
    const storage = this.getStorageArea(area);
    
    try {
      // Firefox has storage quotas
      if (area === 'sync') {
        const quotaInfo = await this.checkQuota(items, area);
        if (!quotaInfo.canStore) {
          throw new Error(\`Storage quota exceeded: \${quotaInfo.message}\`);
        }
      }
      
      await storage.set(items);
    } catch (error) {
      console.error('Storage set error:', error);
      
      // Fallback for Safari
      if (typeof safari !== 'undefined' && safari.extension?.settings) {
        Object.entries(items).forEach(([key, value]) => {
          safari.extension.settings[key] = value;
        });
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Remove data from storage
   */
  static async remove(
    keys: string | string[],
    area: 'local' | 'sync' = 'local'
  ): Promise<void> {
    const storage = this.getStorageArea(area);
    
    try {
      await storage.remove(keys);
    } catch (error) {
      console.error('Storage remove error:', error);
      
      // Fallback for Safari
      if (typeof safari !== 'undefined' && safari.extension?.settings) {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        keysArray.forEach(key => {
          delete safari.extension.settings[key];
        });
      }
    }
  }
  
  /**
   * Clear storage area
   */
  static async clear(area: 'local' | 'sync' = 'local'): Promise<void> {
    const storage = this.getStorageArea(area);
    
    try {
      await storage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      
      // Fallback for Safari
      if (typeof safari !== 'undefined' && safari.extension?.settings) {
        Object.keys(safari.extension.settings).forEach(key => {
          delete safari.extension.settings[key];
        });
      }
    }
  }
  
  /**
   * Check storage quota
   */
  private static async checkQuota(
    items: Record<string, any>,
    area: 'sync' | 'local'
  ): Promise<{ canStore: boolean; message?: string }> {
    // Storage quotas
    const quotas = {
      sync: {
        QUOTA_BYTES: 102400, // 100KB total
        QUOTA_BYTES_PER_ITEM: 8192, // 8KB per item
        MAX_ITEMS: 512
      },
      local: {
        QUOTA_BYTES: 5242880 // 5MB
      }
    };
    
    const quota = quotas[area];
    const itemsJson = JSON.stringify(items);
    const totalSize = new Blob([itemsJson]).size;
    
    if (area === 'sync') {
      // Check total size
      if (totalSize > quota.QUOTA_BYTES) {
        return {
          canStore: false,
          message: \`Total size exceeds \${quota.QUOTA_BYTES} bytes\`
        };
      }
      
      // Check individual item sizes
      for (const [key, value] of Object.entries(items)) {
        const itemSize = new Blob([JSON.stringify({ [key]: value })]).size;
        if (itemSize > quota.QUOTA_BYTES_PER_ITEM) {
          return {
            canStore: false,
            message: \`Item '\${key}' exceeds \${quota.QUOTA_BYTES_PER_ITEM} bytes\`
          };
        }
      }
      
      // Check item count
      const currentItems = await this.get(null, 'sync');
      const totalItems = Object.keys(currentItems).length + Object.keys(items).length;
      if (totalItems > quota.MAX_ITEMS) {
        return {
          canStore: false,
          message: \`Would exceed maximum item count of \${quota.MAX_ITEMS}\`
        };
      }
    } else {
      // Local storage check
      if (totalSize > quota.QUOTA_BYTES) {
        return {
          canStore: false,
          message: \`Total size exceeds \${quota.QUOTA_BYTES} bytes\`
        };
      }
    }
    
    return { canStore: true };
  }
  
  /**
   * Add change listener
   */
  static addChangeListener(
    callback: (changes: any, areaName: string) => void
  ): void {
    if (browser.storage.onChanged) {
      browser.storage.onChanged.addListener(callback);
    } else if (typeof safari !== 'undefined' && safari.extension?.settings) {
      // Safari doesn't have storage change events, use polling
      let previousSettings = { ...safari.extension.settings };
      
      setInterval(() => {
        const currentSettings = { ...safari.extension.settings };
        const changes: any = {};
        let hasChanges = false;
        
        // Check for changes
        Object.keys(currentSettings).forEach(key => {
          if (previousSettings[key] !== currentSettings[key]) {
            changes[key] = {
              oldValue: previousSettings[key],
              newValue: currentSettings[key]
            };
            hasChanges = true;
          }
        });
        
        // Check for deletions
        Object.keys(previousSettings).forEach(key => {
          if (!(key in currentSettings)) {
            changes[key] = {
              oldValue: previousSettings[key],
              newValue: undefined
            };
            hasChanges = true;
          }
        });
        
        if (hasChanges) {
          callback(changes, 'local');
          previousSettings = currentSettings;
        }
      }, 1000);
    }
  }
}`;

export const CROSS_BROWSER_MESSAGING = `/**
 * Cross-Browser Messaging
 * Handles message passing differences between browsers
 */

export class CrossBrowserMessaging {
  private static messageListeners = new Map<string, Set<Function>>();
  
  /**
   * Send message to background script
   */
  static async sendMessage(message: any): Promise<any> {
    try {
      // Standard WebExtension API
      if (browser.runtime?.sendMessage) {
        return await browser.runtime.sendMessage(message);
      }
      
      // Safari fallback
      if (typeof safari !== 'undefined' && safari.extension) {
        return new Promise((resolve) => {
          const messageId = Date.now().toString();
          
          // Listen for response
          const handleResponse = (event: any) => {
            if (event.name === \`response-\${messageId}\`) {
              safari.self.removeEventListener('message', handleResponse);
              resolve(event.message);
            }
          };
          
          safari.self.addEventListener('message', handleResponse);
          
          // Send message
          safari.extension.dispatchMessage('message', {
            ...message,
            _messageId: messageId
          });
          
          // Timeout after 5 seconds
          setTimeout(() => {
            safari.self.removeEventListener('message', handleResponse);
            resolve(undefined);
          }, 5000);
        });
      }
      
      throw new Error('No messaging API available');
    } catch (error) {
      console.error('Message send error:', error);
      throw error;
    }
  }
  
  /**
   * Send message to content script
   */
  static async sendToTab(
    tabId: number,
    message: any,
    frameId?: number
  ): Promise<any> {
    try {
      // Standard WebExtension API
      if (browser.tabs?.sendMessage) {
        return await browser.tabs.sendMessage(tabId, message, { frameId });
      }
      
      // Safari fallback
      if (typeof safari !== 'undefined' && safari.application) {
        const tabs = safari.application.browserWindows
          .map(win => Array.from(win.tabs))
          .flat();
        
        const tab = tabs.find(t => t.id === tabId);
        if (tab) {
          tab.page.dispatchMessage('message', message);
        }
        
        return undefined;
      }
      
      throw new Error('No tab messaging API available');
    } catch (error) {
      console.error('Tab message error:', error);
      throw error;
    }
  }
  
  /**
   * Add message listener
   */
  static addMessageListener(
    callback: (message: any, sender: any, sendResponse: Function) => void
  ): void {
    // Standard WebExtension API
    if (browser.runtime?.onMessage) {
      browser.runtime.onMessage.addListener(callback);
    }
    
    // Safari fallback
    if (typeof safari !== 'undefined') {
      const safariHandler = (event: any) => {
        const sender = {
          tab: { id: event.target?.id },
          id: safari.extension?.baseURI
        };
        
        const sendResponse = (response: any) => {
          if (event.target && event.message._messageId) {
            event.target.page.dispatchMessage(
              \`response-\${event.message._messageId}\`,
              response
            );
          }
        };
        
        callback(event.message, sender, sendResponse);
      };
      
      if (safari.application) {
        safari.application.addEventListener('message', safariHandler);
      } else if (safari.self) {
        safari.self.addEventListener('message', safariHandler);
      }
    }
  }
  
  /**
   * Remove message listener
   */
  static removeMessageListener(callback: Function): void {
    if (browser.runtime?.onMessage) {
      browser.runtime.onMessage.removeListener(callback as any);
    }
    
    // Safari doesn't support removing specific listeners
  }
  
  /**
   * Connect to background script (long-lived connection)
   */
  static connect(name?: string): any {
    // Standard WebExtension API
    if (browser.runtime?.connect) {
      return browser.runtime.connect({ name });
    }
    
    // Safari fallback - simulate with message passing
    if (typeof safari !== 'undefined') {
      const port = {
        name: name || 'default',
        postMessage: (message: any) => {
          this.sendMessage({ _port: name, ...message });
        },
        onMessage: {
          addListener: (callback: Function) => {
            const wrappedCallback = (message: any) => {
              if (message._port === name) {
                callback(message);
              }
            };
            this.addMessageListener(wrappedCallback);
          }
        },
        disconnect: () => {
          // Cleanup
        }
      };
      
      return port;
    }
    
    throw new Error('No connect API available');
  }
}`;

export const FIREFOX_SPECIFIC_TEMPLATE = `/**
 * Firefox-Specific Features
 * Handles Firefox-only APIs and behaviors
 */

export class FirefoxFeatures {
  /**
   * Check if running in Firefox
   */
  static isFirefox(): boolean {
    return typeof browser !== 'undefined' && 
           browser.runtime?.getBrowserInfo !== undefined;
  }
  
  /**
   * Get Firefox browser info
   */
  static async getBrowserInfo(): Promise<{
    name: string;
    vendor: string;
    version: string;
    buildID: string;
  }> {
    if (this.isFirefox() && browser.runtime.getBrowserInfo) {
      return browser.runtime.getBrowserInfo();
    }
    
    // Fallback for other browsers
    return {
      name: 'Unknown',
      vendor: 'Unknown',
      version: '0.0.0',
      buildID: ''
    };
  }
  
  /**
   * Firefox-specific container tabs
   */
  static async createContainerTab(
    url: string,
    cookieStoreId: string
  ): Promise<any> {
    if (this.isFirefox() && browser.tabs?.create) {
      return browser.tabs.create({
        url,
        cookieStoreId
      });
    }
    
    // Fallback to regular tab
    return browser.tabs.create({ url });
  }
  
  /**
   * Firefox sidebar API
   */
  static async openSidebar(): Promise<void> {
    if (this.isFirefox() && (browser as any).sidebarAction?.open) {
      await (browser as any).sidebarAction.open();
    } else {
      console.warn('Sidebar API not available');
    }
  }
  
  /**
   * Firefox theme integration
   */
  static async getCurrentTheme(): Promise<any> {
    if (this.isFirefox() && (browser as any).theme?.getCurrent) {
      return (browser as any).theme.getCurrent();
    }
    
    return null;
  }
}`;

export const SAFARI_SPECIFIC_TEMPLATE = `/**
 * Safari-Specific Features
 * Handles Safari Web Extension APIs
 */

export class SafariFeatures {
  /**
   * Check if running in Safari
   */
  static isSafari(): boolean {
    return typeof safari !== 'undefined' && 
           (safari.extension || safari.self);
  }
  
  /**
   * Safari-specific toolbar item handling
   */
  static setToolbarItemBadge(text: string, tabId?: number): void {
    if (!this.isSafari()) return;
    
    if (safari.extension?.toolbarItems) {
      safari.extension.toolbarItems.forEach(item => {
        if (!tabId || item.browserWindow.activeTab.id === tabId) {
          item.badge = text;
        }
      });
    }
  }
  
  /**
   * Safari popover handling
   */
  static showPopover(width?: number, height?: number): void {
    if (!this.isSafari()) return;
    
    if (safari.extension?.toolbarItems?.[0]) {
      const toolbarItem = safari.extension.toolbarItems[0];
      if (width && height && toolbarItem.popover) {
        toolbarItem.popover.width = width;
        toolbarItem.popover.height = height;
      }
      toolbarItem.showPopover();
    }
  }
  
  /**
   * Safari native app communication
   */
  static async sendToNativeApp(message: any): Promise<any> {
    if (!this.isSafari()) {
      throw new Error('Not running in Safari');
    }
    
    return new Promise((resolve, reject) => {
      if ((browser as any).runtime?.sendNativeMessage) {
        (browser as any).runtime.sendNativeMessage(
          'com.corevecta.safari.extension',
          message,
          (response: any) => {
            if (browser.runtime.lastError) {
              reject(browser.runtime.lastError);
            } else {
              resolve(response);
            }
          }
        );
      } else {
        reject(new Error('Native messaging not available'));
      }
    });
  }
}`;

export const UNIVERSAL_BUILD_CONFIG = `/**
 * Universal Build Configuration
 * Webpack config for building cross-browser extensions
 */

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = (env) => {
  const browser = env.browser || 'chrome';
  const isProduction = env.production === true;
  
  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'inline-source-map',
    
    entry: {
      // Browser polyfill should be loaded first
      polyfill: './src/polyfill/browser-polyfill.js',
      
      // Background script
      background: './src/background/index.ts',
      
      // Content scripts
      content: './src/content/index.ts',
      
      // Extension pages
      popup: './src/popup/index.tsx',
      options: './src/options/index.tsx'
    },
    
    output: {
      path: path.resolve(__dirname, \`dist/\${browser}\`),
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
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },
        {
          test: /\\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource'
        }
      ]
    },
    
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    
    plugins: [
      new CleanWebpackPlugin(),
      
      // Copy static assets and manifest
      new CopyPlugin({
        patterns: [
          {
            from: 'public',
            to: '.',
            globOptions: {
              ignore: ['**/manifest.json']
            }
          },
          {
            from: \`manifests/manifest.\${browser}.json\`,
            to: 'manifest.json',
            transform(content) {
              const manifest = JSON.parse(content.toString());
              
              // Add version from package.json
              const pkg = require('./package.json');
              manifest.version = pkg.version;
              
              return JSON.stringify(manifest, null, 2);
            }
          }
        ]
      }),
      
      // Generate HTML pages
      new HtmlWebpackPlugin({
        template: './src/popup/index.html',
        filename: 'popup.html',
        chunks: ['polyfill', 'popup']
      }),
      
      new HtmlWebpackPlugin({
        template: './src/options/index.html',
        filename: 'options.html',
        chunks: ['polyfill', 'options']
      }),
      
      // Create ZIP for distribution
      ...(isProduction ? [
        new ZipPlugin({
          filename: \`corevecta-extension-\${browser}-v\${require('./package.json').version}.zip\`,
          path: path.resolve(__dirname, 'releases')
        })
      ] : [])
    ],
    
    optimization: {
      splitChunks: {
        chunks: (chunk) => {
          // Don't split background or content scripts
          return !['background', 'content'].includes(chunk.name);
        }
      }
    }
  };
};`;

export const CROSS_BROWSER_TEMPLATES: CrossBrowserTemplate[] = [
  {
    name: 'Universal Browser Extension',
    browser: 'universal',
    files: [
      {
        path: 'src/polyfill/browser-polyfill.js',
        content: BROWSER_API_POLYFILL
      },
      {
        path: 'src/utils/manifest-converter.ts',
        content: MANIFEST_CONVERTER
      },
      {
        path: 'src/utils/cross-browser-storage.ts',
        content: CROSS_BROWSER_STORAGE
      },
      {
        path: 'src/utils/cross-browser-messaging.ts',
        content: CROSS_BROWSER_MESSAGING
      },
      {
        path: 'src/utils/firefox-features.ts',
        content: FIREFOX_SPECIFIC_TEMPLATE
      },
      {
        path: 'src/utils/safari-features.ts',
        content: SAFARI_SPECIFIC_TEMPLATE
      },
      {
        path: 'webpack.config.js',
        content: UNIVERSAL_BUILD_CONFIG
      },
      {
        path: 'scripts/build-all.js',
        content: `/**
 * Build script for all browsers
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const browsers = ['chrome', 'firefox', 'edge', 'safari'];

async function buildAll() {
  console.log('🚀 Building for all browsers...');
  
  for (const browser of browsers) {
    console.log(\`\\n📦 Building for \${browser}...\`);
    
    try {
      // Run webpack build
      execSync(\`npm run webpack -- --env browser=\${browser} --env production=true\`, {
        stdio: 'inherit'
      });
      
      console.log(\`✅ \${browser} build complete\`);
    } catch (error) {
      console.error(\`❌ \${browser} build failed:\`, error);
      process.exit(1);
    }
  }
  
  console.log('\\n🎉 All builds complete!');
}

buildAll().catch(console.error);`
      },
      {
        path: 'manifests/manifest.chrome.json',
        content: JSON.stringify({
          manifest_version: 3,
          name: "CoreVecta Extension",
          version: "1.0.0",
          description: "Cross-browser extension built with CoreVecta",
          action: {
            default_popup: "popup.html",
            default_icon: {
              "16": "icon-16.png",
              "48": "icon-48.png",
              "128": "icon-128.png"
            }
          },
          background: {
            service_worker: "background.js"
          },
          content_scripts: [{
            matches: ["<all_urls>"],
            js: ["polyfill.js", "content.js"]
          }],
          permissions: ["storage", "tabs"],
          host_permissions: ["<all_urls>"]
        }, null, 2)
      },
      {
        path: 'manifests/manifest.firefox.json',
        content: JSON.stringify({
          manifest_version: 2,
          name: "CoreVecta Extension",
          version: "1.0.0",
          description: "Cross-browser extension built with CoreVecta",
          browser_action: {
            default_popup: "popup.html",
            default_icon: {
              "16": "icon-16.png",
              "48": "icon-48.png",
              "128": "icon-128.png"
            }
          },
          background: {
            scripts: ["polyfill.js", "background.js"],
            persistent: false
          },
          content_scripts: [{
            matches: ["<all_urls>"],
            js: ["polyfill.js", "content.js"]
          }],
          permissions: ["storage", "tabs", "<all_urls>"],
          browser_specific_settings: {
            gecko: {
              id: "{corevecta-extension@example.com}",
              strict_min_version: "109.0"
            }
          }
        }, null, 2)
      }
    ]
  }
];