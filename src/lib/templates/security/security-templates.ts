/**
 * Comprehensive Security Templates for Chrome Extensions
 * Implements best practices for extension security
 */

export interface SecurityTemplate {
  name: string;
  description: string;
  files: {
    path: string;
    content: string;
  }[];
  configurations: {
    csp: string;
    permissions: string[];
    hostPermissions: string[];
  };
}

export const CONTENT_SECURITY_POLICY_TEMPLATE = `{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.corevecta.com wss://ws.corevecta.com; font-src 'self' https://fonts.gstatic.com;",
    "sandbox": "sandbox allow-scripts allow-forms allow-popups allow-modals; script-src 'self' 'unsafe-inline' 'unsafe-eval'; child-src 'self';"
  }
}`;

export const ENCRYPTION_UTILS_TEMPLATE = `/**
 * Encryption Utilities for Chrome Extension
 * Provides secure encryption/decryption for sensitive data
 */

export class EncryptionUtils {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;
  private static readonly SALT_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;
  private static readonly ITERATIONS = 100000;
  
  /**
   * Generate a cryptographically secure random key
   */
  static async generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * Derive a key from a password using PBKDF2
   */
  static async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    const importedKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256'
      },
      importedKey,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * Encrypt data using AES-GCM
   */
  static async encrypt(data: string, key: CryptoKey): Promise<{
    encrypted: ArrayBuffer;
    iv: Uint8Array;
    salt?: Uint8Array;
  }> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv
      },
      key,
      dataBuffer
    );
    
    return { encrypted, iv };
  }
  
  /**
   * Decrypt data using AES-GCM
   */
  static async decrypt(
    encryptedData: ArrayBuffer,
    key: CryptoKey,
    iv: Uint8Array
  ): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv
      },
      key,
      encryptedData
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
  
  /**
   * Encrypt and store data securely
   */
  static async secureStore(key: string, data: any, password?: string): Promise<void> {
    const jsonData = JSON.stringify(data);
    let cryptoKey: CryptoKey;
    let salt: Uint8Array | undefined;
    
    if (password) {
      salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
      cryptoKey = await this.deriveKeyFromPassword(password, salt);
    } else {
      // Use a stored master key or generate one
      const storedKey = await this.getOrCreateMasterKey();
      cryptoKey = storedKey;
    }
    
    const { encrypted, iv } = await this.encrypt(jsonData, cryptoKey);
    
    const storageData = {
      encrypted: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
      salt: salt ? Array.from(salt) : undefined,
      timestamp: Date.now()
    };
    
    await chrome.storage.local.set({ [key]: storageData });
  }
  
  /**
   * Retrieve and decrypt data
   */
  static async secureRetrieve(key: string, password?: string): Promise<any> {
    const result = await chrome.storage.local.get(key);
    const storageData = result[key];
    
    if (!storageData) {
      return null;
    }
    
    const encrypted = new Uint8Array(storageData.encrypted).buffer;
    const iv = new Uint8Array(storageData.iv);
    
    let cryptoKey: CryptoKey;
    
    if (password && storageData.salt) {
      const salt = new Uint8Array(storageData.salt);
      cryptoKey = await this.deriveKeyFromPassword(password, salt);
    } else {
      cryptoKey = await this.getOrCreateMasterKey();
    }
    
    try {
      const decrypted = await this.decrypt(encrypted, cryptoKey, iv);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Invalid password or corrupted data');
    }
  }
  
  /**
   * Get or create a master encryption key
   */
  private static async getOrCreateMasterKey(): Promise<CryptoKey> {
    const result = await chrome.storage.local.get('_masterKey');
    
    if (result._masterKey) {
      return crypto.subtle.importKey(
        'jwk',
        result._masterKey,
        {
          name: this.ALGORITHM,
          length: this.KEY_LENGTH
        },
        true,
        ['encrypt', 'decrypt']
      );
    }
    
    const key = await this.generateKey();
    const exportedKey = await crypto.subtle.exportKey('jwk', key);
    await chrome.storage.local.set({ _masterKey: exportedKey });
    
    return key;
  }
  
  /**
   * Hash data using SHA-256
   */
  static async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}`;

export const API_SECURITY_TEMPLATE = `/**
 * API Security Manager
 * Handles secure API communication and key management
 */

export class APISecurityManager {
  private static readonly API_KEY_STORAGE_KEY = '_api_keys';
  private static readonly REQUEST_SIGNING_KEY = '_request_signing_key';
  
  /**
   * Store API keys securely
   */
  static async storeAPIKey(service: string, apiKey: string): Promise<void> {
    const keys = await this.getAPIKeys();
    keys[service] = apiKey;
    await EncryptionUtils.secureStore(this.API_KEY_STORAGE_KEY, keys);
  }
  
  /**
   * Retrieve API key for a service
   */
  static async getAPIKey(service: string): Promise<string | null> {
    const keys = await this.getAPIKeys();
    return keys[service] || null;
  }
  
  /**
   * Get all stored API keys
   */
  private static async getAPIKeys(): Promise<Record<string, string>> {
    try {
      const keys = await EncryptionUtils.secureRetrieve(this.API_KEY_STORAGE_KEY);
      return keys || {};
    } catch {
      return {};
    }
  }
  
  /**
   * Sign a request with HMAC
   */
  static async signRequest(
    method: string,
    url: string,
    body?: any,
    timestamp?: number
  ): Promise<{
    signature: string;
    timestamp: number;
    nonce: string;
  }> {
    const ts = timestamp || Date.now();
    const nonce = EncryptionUtils.generateSecureToken(16);
    
    const signatureBase = [
      method.toUpperCase(),
      url,
      ts.toString(),
      nonce,
      body ? JSON.stringify(body) : ''
    ].join('\\n');
    
    const signingKey = await this.getOrCreateSigningKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureBase);
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      signingKey,
      data
    );
    
    return {
      signature: btoa(String.fromCharCode(...new Uint8Array(signature))),
      timestamp: ts,
      nonce
    };
  }
  
  /**
   * Verify request signature
   */
  static async verifySignature(
    signature: string,
    method: string,
    url: string,
    timestamp: number,
    nonce: string,
    body?: any
  ): Promise<boolean> {
    // Check timestamp to prevent replay attacks
    const currentTime = Date.now();
    const timeDiff = Math.abs(currentTime - timestamp);
    if (timeDiff > 300000) { // 5 minutes
      return false;
    }
    
    const signatureBase = [
      method.toUpperCase(),
      url,
      timestamp.toString(),
      nonce,
      body ? JSON.stringify(body) : ''
    ].join('\\n');
    
    const signingKey = await this.getOrCreateSigningKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(signatureBase);
    
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      signingKey,
      data
    );
    
    const expectedSignatureString = btoa(
      String.fromCharCode(...new Uint8Array(expectedSignature))
    );
    
    return signature === expectedSignatureString;
  }
  
  /**
   * Create secure headers for API requests
   */
  static async createSecureHeaders(
    method: string,
    url: string,
    body?: any
  ): Promise<Headers> {
    const { signature, timestamp, nonce } = await this.signRequest(
      method,
      url,
      body
    );
    
    const headers = new Headers({
      'X-Request-Signature': signature,
      'X-Request-Timestamp': timestamp.toString(),
      'X-Request-Nonce': nonce,
      'X-Extension-ID': chrome.runtime.id,
      'X-Extension-Version': chrome.runtime.getManifest().version
    });
    
    return headers;
  }
  
  /**
   * Get or create HMAC signing key
   */
  private static async getOrCreateSigningKey(): Promise<CryptoKey> {
    const result = await chrome.storage.local.get(this.REQUEST_SIGNING_KEY);
    
    if (result[this.REQUEST_SIGNING_KEY]) {
      return crypto.subtle.importKey(
        'jwk',
        result[this.REQUEST_SIGNING_KEY],
        {
          name: 'HMAC',
          hash: 'SHA-256'
        },
        true,
        ['sign', 'verify']
      );
    }
    
    const key = await crypto.subtle.generateKey(
      {
        name: 'HMAC',
        hash: 'SHA-256',
        length: 256
      },
      true,
      ['sign', 'verify']
    );
    
    const exportedKey = await crypto.subtle.exportKey('jwk', key);
    await chrome.storage.local.set({
      [this.REQUEST_SIGNING_KEY]: exportedKey
    });
    
    return key;
  }
  
  /**
   * Rate limiting for API requests
   */
  static async checkRateLimit(endpoint: string, limit: number = 60): Promise<boolean> {
    const key = \`rate_limit_\${endpoint}\`;
    const now = Date.now();
    const window = 60000; // 1 minute window
    
    const result = await chrome.storage.local.get(key);
    const requests = result[key] || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter((time: number) => now - time < window);
    
    if (validRequests.length >= limit) {
      return false;
    }
    
    validRequests.push(now);
    await chrome.storage.local.set({ [key]: validRequests });
    
    return true;
  }
}`;

export const PERMISSION_MANAGER_TEMPLATE = `/**
 * Permission Manager
 * Handles dynamic permission requests and management
 */

export class PermissionManager {
  private static readonly PERMISSION_CACHE_KEY = '_permission_cache';
  
  /**
   * Request permissions dynamically
   */
  static async requestPermissions(
    permissions: string[],
    origins?: string[]
  ): Promise<boolean> {
    try {
      const granted = await chrome.permissions.request({
        permissions: permissions,
        origins: origins
      });
      
      if (granted) {
        await this.cachePermissions(permissions, origins);
      }
      
      return granted;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }
  
  /**
   * Check if permissions are granted
   */
  static async hasPermissions(
    permissions: string[],
    origins?: string[]
  ): Promise<boolean> {
    try {
      return await chrome.permissions.contains({
        permissions: permissions,
        origins: origins
      });
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }
  
  /**
   * Remove permissions
   */
  static async removePermissions(
    permissions: string[],
    origins?: string[]
  ): Promise<boolean> {
    try {
      const removed = await chrome.permissions.remove({
        permissions: permissions,
        origins: origins
      });
      
      if (removed) {
        await this.updatePermissionCache(permissions, origins, false);
      }
      
      return removed;
    } catch (error) {
      console.error('Permission removal failed:', error);
      return false;
    }
  }
  
  /**
   * Get all current permissions
   */
  static async getAllPermissions(): Promise<chrome.permissions.Permissions> {
    return chrome.permissions.getAll();
  }
  
  /**
   * Request permission with user-friendly explanation
   */
  static async requestPermissionWithReason(
    permission: string,
    reason: string,
    origins?: string[]
  ): Promise<boolean> {
    // Show notification or create a tab with explanation
    const granted = await this.showPermissionDialog(permission, reason);
    
    if (granted) {
      return this.requestPermissions([permission], origins);
    }
    
    return false;
  }
  
  /**
   * Cache granted permissions for quick access
   */
  private static async cachePermissions(
    permissions: string[],
    origins?: string[]
  ): Promise<void> {
    const cache = await this.getPermissionCache();
    const timestamp = Date.now();
    
    permissions.forEach(permission => {
      cache.permissions[permission] = { granted: true, timestamp };
    });
    
    if (origins) {
      origins.forEach(origin => {
        cache.origins[origin] = { granted: true, timestamp };
      });
    }
    
    await chrome.storage.local.set({
      [this.PERMISSION_CACHE_KEY]: cache
    });
  }
  
  /**
   * Update permission cache
   */
  private static async updatePermissionCache(
    permissions: string[],
    origins: string[] | undefined,
    granted: boolean
  ): Promise<void> {
    const cache = await this.getPermissionCache();
    const timestamp = Date.now();
    
    permissions.forEach(permission => {
      if (granted) {
        cache.permissions[permission] = { granted, timestamp };
      } else {
        delete cache.permissions[permission];
      }
    });
    
    if (origins) {
      origins.forEach(origin => {
        if (granted) {
          cache.origins[origin] = { granted, timestamp };
        } else {
          delete cache.origins[origin];
        }
      });
    }
    
    await chrome.storage.local.set({
      [this.PERMISSION_CACHE_KEY]: cache
    });
  }
  
  /**
   * Get permission cache
   */
  private static async getPermissionCache(): Promise<{
    permissions: Record<string, { granted: boolean; timestamp: number }>;
    origins: Record<string, { granted: boolean; timestamp: number }>;
  }> {
    const result = await chrome.storage.local.get(this.PERMISSION_CACHE_KEY);
    return result[this.PERMISSION_CACHE_KEY] || {
      permissions: {},
      origins: {}
    };
  }
  
  /**
   * Show permission dialog to user
   */
  private static async showPermissionDialog(
    permission: string,
    reason: string
  ): Promise<boolean> {
    // Create a new tab with permission explanation
    const tab = await chrome.tabs.create({
      url: chrome.runtime.getURL(\`permission-request.html?permission=\${permission}&reason=\${encodeURIComponent(reason)}\`)
    });
    
    return new Promise((resolve) => {
      const messageListener = (message: any, sender: chrome.runtime.MessageSender) => {
        if (sender.tab?.id === tab.id && message.type === 'PERMISSION_RESPONSE') {
          chrome.runtime.onMessage.removeListener(messageListener);
          chrome.tabs.remove(tab.id!);
          resolve(message.granted);
        }
      };
      
      chrome.runtime.onMessage.addListener(messageListener);
    });
  }
  
  /**
   * Monitor permission changes
   */
  static onPermissionsChanged(
    callback: (permissions: chrome.permissions.Permissions) => void
  ): void {
    chrome.permissions.onAdded.addListener(callback);
    chrome.permissions.onRemoved.addListener(callback);
  }
}`;

export const VULNERABILITY_SCANNER_TEMPLATE = `/**
 * Security Vulnerability Scanner
 * Scans extension code for common security issues
 */

export class VulnerabilityScanner {
  private static readonly DANGEROUS_PATTERNS = [
    {
      name: 'eval() usage',
      pattern: /eval\\s*\\(/g,
      severity: 'critical',
      message: 'eval() can execute arbitrary code and should be avoided'
    },
    {
      name: 'innerHTML usage',
      pattern: /\\.innerHTML\\s*=/g,
      severity: 'high',
      message: 'innerHTML can lead to XSS vulnerabilities. Use textContent or DOM methods instead'
    },
    {
      name: 'Hardcoded API keys',
      pattern: /['\\"](AIza[0-9A-Za-z\\-_]{35}|sk-[a-zA-Z0-9]{48})['\\"]/g,
      severity: 'critical',
      message: 'API keys should never be hardcoded in source code'
    },
    {
      name: 'HTTP URLs',
      pattern: /http:\\/\\/[^\\s'\\"]*/g,
      severity: 'medium',
      message: 'Use HTTPS instead of HTTP for secure communication'
    },
    {
      name: 'Unsafe jQuery patterns',
      pattern: /\\$\\([^)]*\\)\\.html\\s*\\(/g,
      severity: 'high',
      message: 'jQuery html() can lead to XSS. Sanitize input or use text()'
    },
    {
      name: 'LocalStorage for sensitive data',
      pattern: /localStorage\\.(setItem|getItem)\\s*\\(['\\"](password|token|key|secret)/gi,
      severity: 'high',
      message: 'Never store sensitive data in localStorage. Use secure storage instead'
    }
  ];
  
  /**
   * Scan code for vulnerabilities
   */
  static async scanCode(code: string): Promise<{
    vulnerabilities: Array<{
      type: string;
      severity: string;
      message: string;
      line: number;
      column: number;
      snippet: string;
    }>;
    score: number;
  }> {
    const vulnerabilities: Array<{
      type: string;
      severity: string;
      message: string;
      line: number;
      column: number;
      snippet: string;
    }> = [];
    
    const lines = code.split('\\n');
    
    this.DANGEROUS_PATTERNS.forEach(patternConfig => {
      const pattern = new RegExp(patternConfig.pattern.source, patternConfig.pattern.flags);
      
      lines.forEach((line, lineIndex) => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          vulnerabilities.push({
            type: patternConfig.name,
            severity: patternConfig.severity,
            message: patternConfig.message,
            line: lineIndex + 1,
            column: match.index + 1,
            snippet: line.trim()
          });
        }
      });
    });
    
    // Calculate security score
    const severityWeights = {
      critical: 30,
      high: 20,
      medium: 10,
      low: 5
    };
    
    const totalPenalty = vulnerabilities.reduce((sum, vuln) => {
      return sum + (severityWeights[vuln.severity as keyof typeof severityWeights] || 0);
    }, 0);
    
    const score = Math.max(0, 100 - totalPenalty);
    
    return { vulnerabilities, score };
  }
  
  /**
   * Scan manifest for security issues
   */
  static scanManifest(manifest: any): Array<{
    issue: string;
    severity: string;
    recommendation: string;
  }> {
    const issues: Array<{
      issue: string;
      severity: string;
      recommendation: string;
    }> = [];
    
    // Check for overly broad permissions
    if (manifest.permissions?.includes('*://*/*')) {
      issues.push({
        issue: 'Overly broad host permissions',
        severity: 'high',
        recommendation: 'Limit host permissions to specific domains needed'
      });
    }
    
    // Check for dangerous permissions
    const dangerousPermissions = ['debugger', 'experimental', 'proxy'];
    manifest.permissions?.forEach((perm: string) => {
      if (dangerousPermissions.includes(perm)) {
        issues.push({
          issue: \`Dangerous permission: \${perm}\`,
          severity: 'medium',
          recommendation: \`Avoid using \${perm} permission unless absolutely necessary\`
        });
      }
    });
    
    // Check CSP
    if (!manifest.content_security_policy) {
      issues.push({
        issue: 'Missing Content Security Policy',
        severity: 'medium',
        recommendation: 'Add a restrictive CSP to prevent code injection'
      });
    }
    
    // Check for remote code
    if (manifest.content_scripts?.some((cs: any) => 
      cs.js?.some((js: string) => js.startsWith('http'))
    )) {
      issues.push({
        issue: 'Loading remote scripts',
        severity: 'critical',
        recommendation: 'Bundle all scripts locally, never load from remote sources'
      });
    }
    
    return issues;
  }
  
  /**
   * Generate security report
   */
  static async generateSecurityReport(
    extensionFiles: Map<string, string>
  ): Promise<{
    overallScore: number;
    codeVulnerabilities: any[];
    manifestIssues: any[];
    recommendations: string[];
  }> {
    let totalScore = 0;
    let fileCount = 0;
    const allVulnerabilities: any[] = [];
    
    // Scan each JavaScript/TypeScript file
    for (const [filename, content] of extensionFiles) {
      if (filename.match(/\\.(js|ts|jsx|tsx)$/)) {
        const { vulnerabilities, score } = await this.scanCode(content);
        allVulnerabilities.push(...vulnerabilities.map(v => ({
          ...v,
          file: filename
        })));
        totalScore += score;
        fileCount++;
      }
    }
    
    // Scan manifest
    const manifestContent = extensionFiles.get('manifest.json');
    const manifest = manifestContent ? JSON.parse(manifestContent) : {};
    const manifestIssues = this.scanManifest(manifest);
    
    // Calculate overall score
    const codeScore = fileCount > 0 ? totalScore / fileCount : 100;
    const manifestScore = 100 - (manifestIssues.length * 10);
    const overallScore = (codeScore + manifestScore) / 2;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      allVulnerabilities,
      manifestIssues
    );
    
    return {
      overallScore,
      codeVulnerabilities: allVulnerabilities,
      manifestIssues,
      recommendations
    };
  }
  
  /**
   * Generate security recommendations
   */
  private static generateRecommendations(
    vulnerabilities: any[],
    manifestIssues: any[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (vulnerabilities.some(v => v.type === 'eval() usage')) {
      recommendations.push('Replace eval() with safer alternatives like JSON.parse() or Function constructor');
    }
    
    if (vulnerabilities.some(v => v.type === 'innerHTML usage')) {
      recommendations.push('Use textContent or createElement() instead of innerHTML to prevent XSS');
    }
    
    if (vulnerabilities.some(v => v.type === 'Hardcoded API keys')) {
      recommendations.push('Store API keys securely using chrome.storage and encryption');
    }
    
    if (manifestIssues.some(i => i.issue.includes('host permissions'))) {
      recommendations.push('Implement optional permissions to request access only when needed');
    }
    
    recommendations.push('Implement Content Security Policy to prevent code injection');
    recommendations.push('Use HTTPS for all external communications');
    recommendations.push('Regularly update dependencies to patch security vulnerabilities');
    recommendations.push('Implement input validation and sanitization');
    
    return recommendations;
  }
}`;

export const CHROME_EXTENSION_SECURITY_TEMPLATE: SecurityTemplate = {
  name: 'Chrome Extension Security Suite',
  description: 'Comprehensive security implementation with encryption, API security, and vulnerability scanning',
  files: [
    {
      path: 'src/security/encryption-utils.ts',
      content: ENCRYPTION_UTILS_TEMPLATE
    },
    {
      path: 'src/security/api-security.ts',
      content: API_SECURITY_TEMPLATE
    },
    {
      path: 'src/security/permission-manager.ts',
      content: PERMISSION_MANAGER_TEMPLATE
    },
    {
      path: 'src/security/vulnerability-scanner.ts',
      content: VULNERABILITY_SCANNER_TEMPLATE
    },
    {
      path: 'src/security/security-config.ts',
      content: `/**
 * Security Configuration
 * Central configuration for all security settings
 */

export const SecurityConfig = {
  // Content Security Policy
  csp: {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'", 'https://api.corevecta.com', 'wss://ws.corevecta.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"]
  },
  
  // API endpoints that require authentication
  authenticatedEndpoints: [
    '/api/user/*',
    '/api/admin/*',
    '/api/billing/*'
  ],
  
  // Rate limiting configuration
  rateLimits: {
    '/api/auth/login': { requests: 5, window: 300000 }, // 5 requests per 5 minutes
    '/api/auth/register': { requests: 3, window: 3600000 }, // 3 requests per hour
    '/api/*': { requests: 60, window: 60000 } // 60 requests per minute (default)
  },
  
  // Encryption settings
  encryption: {
    algorithm: 'AES-GCM',
    keyLength: 256,
    saltLength: 16,
    iterations: 100000,
    tagLength: 16
  },
  
  // Session configuration
  session: {
    timeout: 1800000, // 30 minutes
    renewalThreshold: 300000, // 5 minutes before expiry
    maxAge: 86400000 // 24 hours
  },
  
  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }
};`
    },
    {
      path: 'src/security/secure-fetch.ts',
      content: `/**
 * Secure Fetch Wrapper
 * Provides secure HTTP client with built-in security features
 */

import { APISecurityManager } from './api-security';
import { SecurityConfig } from './security-config';

export class SecureFetch {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000;
  
  /**
   * Secure fetch with authentication and rate limiting
   */
  static async fetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    // Check rate limiting
    const endpoint = this.getEndpointFromUrl(url);
    const rateLimit = SecurityConfig.rateLimits[endpoint] || SecurityConfig.rateLimits['/api/*'];
    
    if (!await APISecurityManager.checkRateLimit(endpoint, rateLimit.requests)) {
      throw new Error('Rate limit exceeded');
    }
    
    // Add security headers
    const secureHeaders = await APISecurityManager.createSecureHeaders(
      options.method || 'GET',
      url,
      options.body
    );
    
    // Merge headers
    const headers = new Headers(options.headers);
    secureHeaders.forEach((value, key) => headers.set(key, value));
    
    // Add security headers from config
    Object.entries(SecurityConfig.headers).forEach(([key, value]) => {
      headers.set(key, value);
    });
    
    // Perform fetch with retry logic
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers,
          credentials: 'same-origin',
          mode: 'cors'
        });
        
        // Check for security issues in response
        this.validateResponse(response);
        
        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors
        if (error instanceof Response && error.status >= 400 && error.status < 500) {
          throw error;
        }
        
        // Wait before retry
        if (attempt < this.MAX_RETRIES - 1) {
          await this.delay(this.RETRY_DELAY * Math.pow(2, attempt));
        }
      }
    }
    
    throw lastError || new Error('Fetch failed after retries');
  }
  
  /**
   * Secure JSON fetch
   */
  static async fetchJSON<T = any>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await this.fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const text = await response.text();
    
    try {
      return JSON.parse(text);
    } catch (error) {
      throw new Error('Invalid JSON response');
    }
  }
  
  /**
   * Validate response for security issues
   */
  private static validateResponse(response: Response): void {
    // Check for security headers
    const csp = response.headers.get('Content-Security-Policy');
    if (!csp && response.url.startsWith('https://')) {
      console.warn('Response missing Content-Security-Policy header');
    }
    
    // Check for mixed content
    if (response.url.startsWith('http://') && !response.url.includes('localhost')) {
      throw new Error('Insecure HTTP response');
    }
    
    // Validate content type
    const contentType = response.headers.get('Content-Type');
    if (contentType?.includes('text/html') && !response.url.endsWith('.html')) {
      console.warn('Unexpected HTML response');
    }
  }
  
  /**
   * Extract endpoint from URL
   */
  private static getEndpointFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Match against configured endpoints
      for (const endpoint of Object.keys(SecurityConfig.rateLimits)) {
        if (endpoint.includes('*')) {
          const pattern = endpoint.replace(/\\*/g, '.*');
          if (new RegExp(pattern).test(pathname)) {
            return endpoint;
          }
        } else if (pathname === endpoint) {
          return endpoint;
        }
      }
      
      return '/api/*'; // Default
    } catch {
      return '/api/*';
    }
  }
  
  /**
   * Delay helper for retries
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}`
    },
    {
      path: 'permission-request.html',
      content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Permission Request - CoreVecta Extension</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 40px;
      background: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 40px;
      max-width: 500px;
      width: 100%;
    }
    h1 {
      margin: 0 0 20px;
      color: #333;
      font-size: 24px;
    }
    .permission-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 20px;
      display: block;
    }
    .permission-name {
      font-weight: 600;
      color: #2563eb;
      margin: 20px 0 10px;
    }
    .reason {
      color: #666;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .buttons {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .grant {
      background: #2563eb;
      color: white;
    }
    .grant:hover {
      background: #1d4ed8;
    }
    .deny {
      background: #f3f4f6;
      color: #333;
    }
    .deny:hover {
      background: #e5e7eb;
    }
    .warning {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 4px;
      padding: 12px;
      margin: 20px 0;
      color: #92400e;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <img src="icon-128.png" alt="Extension Icon" class="permission-icon">
    <h1>Permission Request</h1>
    
    <div class="permission-name" id="permission-name"></div>
    <div class="reason" id="reason"></div>
    
    <div class="warning">
      This permission will be granted until you remove it from the extension settings.
    </div>
    
    <div class="buttons">
      <button class="deny" id="deny-btn">Deny</button>
      <button class="grant" id="grant-btn">Grant Permission</button>
    </div>
  </div>
  
  <script src="permission-request.js"></script>
</body>
</html>`
    },
    {
      path: 'permission-request.js',
      content: `/**
 * Permission Request Page Script
 */

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const permission = params.get('permission');
  const reason = params.get('reason');
  
  // Display permission info
  document.getElementById('permission-name').textContent = \`Permission: \${permission}\`;
  document.getElementById('reason').textContent = reason || 'This permission is required for the extension to function properly.';
  
  // Handle button clicks
  document.getElementById('grant-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'PERMISSION_RESPONSE',
      granted: true
    });
  });
  
  document.getElementById('deny-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'PERMISSION_RESPONSE',
      granted: false
    });
  });
});`
    }
  ],
  configurations: {
    csp: CONTENT_SECURITY_POLICY_TEMPLATE,
    permissions: [
      'storage',
      'identity',
      'permissions'
    ],
    hostPermissions: []
  }
};