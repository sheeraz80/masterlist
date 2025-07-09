import { NextRequest, NextResponse } from 'next/server';

export interface SecurityOptions {
  csp?: boolean;
  hsts?: boolean;
  xssProtection?: boolean;
  frameOptions?: boolean;
  contentTypeOptions?: boolean;
  referrerPolicy?: boolean;
  cors?: {
    origin?: string | string[];
    credentials?: boolean;
    methods?: string[];
    headers?: string[];
  };
}

const defaultOptions: SecurityOptions = {
  csp: true,
  hsts: true,
  xssProtection: true,
  frameOptions: true,
  contentTypeOptions: true,
  referrerPolicy: true,
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },
};

export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: SecurityOptions = {}
) {
  const config = { ...defaultOptions, ...options };

  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return handleCors(request, config.cors);
    }

    const response = await handler(request);

    // Apply security headers
    applySecurityHeaders(response, config);

    // Apply CORS headers
    if (config.cors) {
      applyCorsHeaders(response, request, config.cors);
    }

    return response;
  };
}

function handleCors(request: NextRequest, corsOptions?: SecurityOptions['cors']): NextResponse {
  if (!corsOptions) return new NextResponse(null, { status: 204 });

  const response = new NextResponse(null, { status: 204 });
  
  const origin = request.headers.get('origin');
  const allowedOrigins = Array.isArray(corsOptions.origin) ? corsOptions.origin : [corsOptions.origin || ''];
  
  if (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin))) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  if (corsOptions.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  if (corsOptions.methods) {
    response.headers.set('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
  }

  if (corsOptions.headers) {
    response.headers.set('Access-Control-Allow-Headers', corsOptions.headers.join(', '));
  }

  response.headers.set('Access-Control-Max-Age', '86400');

  return response;
}

function applySecurityHeaders(response: NextResponse, config: SecurityOptions) {
  // Content Security Policy
  if (config.csp) {
    const cspValue = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' ws: wss:",
      "frame-ancestors 'none'",
    ].join('; ');
    
    response.headers.set('Content-Security-Policy', cspValue);
  }

  // HTTP Strict Transport Security
  if (config.hsts && process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // X-XSS-Protection
  if (config.xssProtection) {
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }

  // X-Frame-Options
  if (config.frameOptions) {
    response.headers.set('X-Frame-Options', 'DENY');
  }

  // X-Content-Type-Options
  if (config.contentTypeOptions) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }

  // Referrer Policy
  if (config.referrerPolicy) {
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
}

function applyCorsHeaders(response: NextResponse, request: NextRequest, corsOptions: SecurityOptions['cors']) {
  if (!corsOptions) return;

  const origin = request.headers.get('origin');
  const allowedOrigins = Array.isArray(corsOptions.origin) ? corsOptions.origin : [corsOptions.origin || ''];
  
  if (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin))) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  if (corsOptions.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Expose additional headers that the client can access
  response.headers.set('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');
}

// Preset configurations
export const securityPresets = {
  // Strict security for production
  strict: {
    csp: true,
    hsts: true,
    xssProtection: true,
    frameOptions: true,
    contentTypeOptions: true,
    referrerPolicy: true,
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      headers: ['Content-Type', 'Authorization'],
    },
  },

  // Relaxed security for development
  development: {
    csp: false,
    hsts: false,
    xssProtection: true,
    frameOptions: true,
    contentTypeOptions: true,
    referrerPolicy: true,
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
  },

  // API-specific security
  api: {
    csp: false,
    hsts: true,
    xssProtection: true,
    frameOptions: true,
    contentTypeOptions: true,
    referrerPolicy: true,
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
  },
};