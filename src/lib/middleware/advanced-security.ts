import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface SecurityConfig {
  // CSP Configuration
  contentSecurityPolicy?: {
    directives: Record<string, string[]>;
    reportOnly?: boolean;
    reportUri?: string;
  };
  
  // CORS Configuration
  cors?: {
    origin?: string | string[] | ((origin: string) => boolean);
    credentials?: boolean;
    methods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    maxAge?: number;
  };
  
  // Additional Security Headers
  strictTransportSecurity?: {
    maxAge: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  
  xFrameOptions?: 'DENY' | 'SAMEORIGIN' | string;
  xContentTypeOptions?: boolean;
  xXssProtection?: boolean;
  referrerPolicy?: string;
  permissionsPolicy?: Record<string, string[]>;
  
  // Request Security
  maxRequestSize?: number;
  trustedProxies?: string[];
  
  // CSRF Protection
  csrf?: {
    enabled: boolean;
    cookieName?: string;
    headerName?: string;
    excludePaths?: string[];
  };
}

// Generate CSP nonce
export function generateCSPNonce(): string {
  return crypto.randomBytes(16).toString('base64');
}

// Default CSP directives
const defaultCSPDirectives: Record<string, string[]> = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://api.github.com', 'wss://', 'ws://localhost:*'],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'frame-src': ["'self'"],
  'frame-ancestors': ["'self'"],
  'form-action': ["'self'"],
  'base-uri': ["'self'"],
  'manifest-src': ["'self'"],
  'worker-src': ["'self'", 'blob:'],
  'child-src': ["'self'", 'blob:'],
};

// Build CSP header
function buildCSPHeader(
  directives: Record<string, string[]>,
  nonce?: string,
  reportUri?: string
): string {
  const policy = Object.entries(directives)
    .map(([key, values]) => {
      // Add nonce to script-src and style-src if provided
      if (nonce && (key === 'script-src' || key === 'style-src')) {
        values = [...values, `'nonce-${nonce}'`];
      }
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');
  
  return reportUri ? `${policy}; report-uri ${reportUri}` : policy;
}

// CORS origin checker
function checkOrigin(
  origin: string | undefined,
  allowedOrigin: string | string[] | ((origin: string) => boolean)
): boolean {
  if (!origin) return false;
  
  if (typeof allowedOrigin === 'function') {
    return allowedOrigin(origin);
  }
  
  if (Array.isArray(allowedOrigin)) {
    return allowedOrigin.includes(origin);
  }
  
  if (allowedOrigin === '*') return true;
  
  return origin === allowedOrigin;
}

// CSRF token generation and validation
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(storedToken)
  );
}

// Main security middleware factory
export function createSecurityMiddleware(config: SecurityConfig = {}) {
  return async function securityMiddleware(
    request: NextRequest
  ): Promise<NextResponse | null> {
    const response = NextResponse.next();
    const origin = request.headers.get('origin');
    
    // Apply CORS if configured
    if (config.cors && origin) {
      const isAllowed = checkOrigin(origin, config.cors.origin || '*');
      
      if (isAllowed) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        
        if (config.cors.credentials) {
          response.headers.set('Access-Control-Allow-Credentials', 'true');
        }
        
        if (config.cors.methods) {
          response.headers.set('Access-Control-Allow-Methods', config.cors.methods.join(', '));
        }
        
        if (config.cors.allowedHeaders) {
          response.headers.set('Access-Control-Allow-Headers', config.cors.allowedHeaders.join(', '));
        }
        
        if (config.cors.exposedHeaders) {
          response.headers.set('Access-Control-Expose-Headers', config.cors.exposedHeaders.join(', '));
        }
        
        if (config.cors.maxAge) {
          response.headers.set('Access-Control-Max-Age', config.cors.maxAge.toString());
        }
      }
      
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, { status: 204, headers: response.headers });
      }
    }
    
    // Apply CSP
    if (config.contentSecurityPolicy) {
      const nonce = generateCSPNonce();
      const cspHeader = buildCSPHeader(
        config.contentSecurityPolicy.directives,
        nonce,
        config.contentSecurityPolicy.reportUri
      );
      
      const headerName = config.contentSecurityPolicy.reportOnly
        ? 'Content-Security-Policy-Report-Only'
        : 'Content-Security-Policy';
      
      response.headers.set(headerName, cspHeader);
      
      // Store nonce for use in rendered pages
      response.headers.set('X-CSP-Nonce', nonce);
    }
    
    // Apply HSTS
    if (config.strictTransportSecurity) {
      const { maxAge, includeSubDomains, preload } = config.strictTransportSecurity;
      let hstsValue = `max-age=${maxAge}`;
      
      if (includeSubDomains) hstsValue += '; includeSubDomains';
      if (preload) hstsValue += '; preload';
      
      response.headers.set('Strict-Transport-Security', hstsValue);
    }
    
    // Apply other security headers
    if (config.xFrameOptions) {
      response.headers.set('X-Frame-Options', config.xFrameOptions);
    }
    
    if (config.xContentTypeOptions !== false) {
      response.headers.set('X-Content-Type-Options', 'nosniff');
    }
    
    if (config.xXssProtection !== false) {
      response.headers.set('X-XSS-Protection', '1; mode=block');
    }
    
    if (config.referrerPolicy) {
      response.headers.set('Referrer-Policy', config.referrerPolicy);
    }
    
    // Apply Permissions Policy
    if (config.permissionsPolicy) {
      const policy = Object.entries(config.permissionsPolicy)
        .map(([feature, allowList]) => {
          if (allowList.length === 0) return `${feature}=()`;
          return `${feature}=(${allowList.join(' ')})`;
        })
        .join(', ');
      
      response.headers.set('Permissions-Policy', policy);
    }
    
    // CSRF Protection
    if (config.csrf?.enabled && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      const pathname = request.nextUrl.pathname;
      
      // Check if path is excluded
      const isExcluded = config.csrf.excludePaths?.some(path => 
        pathname.startsWith(path)
      );
      
      if (!isExcluded) {
        const cookieName = config.csrf.cookieName || 'csrf-token';
        const headerName = config.csrf.headerName || 'x-csrf-token';
        
        const cookieToken = request.cookies.get(cookieName)?.value;
        const headerToken = request.headers.get(headerName);
        
        if (!cookieToken || !headerToken || !validateCSRFToken(headerToken, cookieToken)) {
          return NextResponse.json(
            { error: 'Invalid CSRF token' },
            { status: 403 }
          );
        }
      }
    }
    
    // Additional security headers
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-Download-Options', 'noopen');
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
    
    return response;
  };
}

// Preset security configurations
export const securityPresets = {
  // Strict security for production
  production: createSecurityMiddleware({
    contentSecurityPolicy: {
      directives: {
        ...defaultCSPDirectives,
        'upgrade-insecure-requests': [''],
      },
      reportUri: '/api/csp-report',
    },
    strictTransportSecurity: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    xFrameOptions: 'DENY',
    xContentTypeOptions: true,
    xXssProtection: true,
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      'interest-cohort': [],
    },
    csrf: {
      enabled: true,
      excludePaths: ['/api/webhooks/', '/api/public/'],
    },
  }),
  
  // Relaxed security for development
  development: createSecurityMiddleware({
    contentSecurityPolicy: {
      directives: {
        ...defaultCSPDirectives,
        'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        'connect-src': ["'self'", 'ws://localhost:*', 'http://localhost:*'],
      },
    },
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    },
    xFrameOptions: 'SAMEORIGIN',
    csrf: {
      enabled: false, // Disabled in development
    },
  }),
  
  // API-specific security
  api: createSecurityMiddleware({
    cors: {
      origin: (origin) => {
        // Allow specific origins or patterns
        const allowedPatterns = [
          /^https:\/\/.*\.yourdomain\.com$/,
          /^http:\/\/localhost:\d+$/,
        ];
        
        return allowedPatterns.some(pattern => pattern.test(origin));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      maxAge: 86400, // 24 hours
    },
    xFrameOptions: 'DENY',
    referrerPolicy: 'no-referrer',
  }),
};

// Request size limiting middleware
export function createRequestSizeLimiter(maxSize = 10 * 1024 * 1024) { // 10MB default
  return async function sizeLimiter(
    request: NextRequest
  ): Promise<NextResponse | null> {
    const contentLength = request.headers.get('content-length');
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return NextResponse.json(
        { error: 'Request entity too large' },
        { status: 413 }
      );
    }
    
    return null;
  };
}

// Security logging middleware
export function createSecurityLogger() {
  return async function securityLogger(
    request: NextRequest
  ): Promise<NextResponse | null> {
    const suspicious = [];
    
    // Check for suspicious patterns
    const userAgent = request.headers.get('user-agent') || '';
    const suspiciousUAPatterns = [
      /sqlmap/i,
      /nikto/i,
      /acunetix/i,
      /nmap/i,
      /masscan/i,
      /hydra/i,
    ];
    
    if (suspiciousUAPatterns.some(pattern => pattern.test(userAgent))) {
      suspicious.push('Suspicious user agent');
    }
    
    // Check for SQL injection attempts
    const url = request.nextUrl.toString();
    const sqlPatterns = [
      /(\bunion\b.*\bselect\b|\bselect\b.*\bunion\b)/i,
      /(\bdrop\b.*\btable\b|\bdelete\b.*\bfrom\b)/i,
      /(\binsert\b.*\binto\b|\bupdate\b.*\bset\b)/i,
      /(\bscript\b.*\balert\b|\balert\b.*\bscript\b)/i,
      /<script[^>]*>[\s\S]*?<\/script>/gi,
    ];
    
    if (sqlPatterns.some(pattern => pattern.test(url))) {
      suspicious.push('Potential SQL injection attempt');
    }
    
    // Check for path traversal
    if (/\.\.\/|\.\.\\/.test(url)) {
      suspicious.push('Path traversal attempt');
    }
    
    // Log suspicious activity
    if (suspicious.length > 0) {
      const ip = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown';
      
      console.error('Suspicious request detected', {
        ip,
        method: request.method,
        path: request.nextUrl.pathname,
        userAgent,
        suspicious,
        timestamp: new Date().toISOString(),
      });
      
      // Optionally block suspicious requests
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    return null;
  };
}

// Combine multiple security middlewares
export function createSecurityStack(...middlewares: Array<(req: NextRequest) => Promise<NextResponse | null>>) {
  return async function securityStack(request: NextRequest): Promise<NextResponse | null> {
    for (const middleware of middlewares) {
      const response = await middleware(request);
      if (response) return response;
    }
    
    return null;
  };
}