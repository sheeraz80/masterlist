import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Advanced rate limiting with sliding window, burst protection, and distributed store support
interface RateLimitConfig {
  windowMs: number;
  max: number;
  burst?: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
  handler?: (req: NextRequest, res: NextResponse) => void;
  onLimitReached?: (req: NextRequest, options: RateLimitConfig) => void;
  skip?: (req: NextRequest) => boolean | Promise<boolean>;
  requestPropertyName?: string;
  store?: RateLimitStore;
}

interface RateLimitStore {
  increment(key: string): Promise<RateLimitInfo>;
  decrement(key: string): Promise<void>;
  resetKey(key: string): Promise<void>;
  get(key: string): Promise<RateLimitInfo | undefined>;
}

interface RateLimitInfo {
  totalHits: number;
  resetTime: Date;
  history: number[];
}

// In-memory store with sliding window
class MemoryStore implements RateLimitStore {
  private data = new Map<string, RateLimitInfo>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  async increment(key: string): Promise<RateLimitInfo> {
    const now = Date.now();
    let info = this.data.get(key);

    if (!info) {
      info = {
        totalHits: 0,
        resetTime: new Date(now + 60000),
        history: []
      };
      this.data.set(key, info);
    }

    // Add current request to history
    info.history.push(now);
    info.totalHits++;

    return info;
  }

  async decrement(key: string): Promise<void> {
    const info = this.data.get(key);
    if (info && info.totalHits > 0) {
      info.totalHits--;
      info.history.pop();
    }
  }

  async resetKey(key: string): Promise<void> {
    this.data.delete(key);
  }

  async get(key: string): Promise<RateLimitInfo | undefined> {
    return this.data.get(key);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, info] of this.data.entries()) {
      if (info.resetTime.getTime() < now) {
        this.data.delete(key);
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

// Default key generator with multiple strategies
function defaultKeyGenerator(req: NextRequest): string {
  // Get client identifier
  const forwarded = req.headers.get('x-forwarded-for');
  const real = req.headers.get('x-real-ip');
  const cloudflare = req.headers.get('cf-connecting-ip');
  const ip = forwarded?.split(',')[0] || real || cloudflare || 'unknown';

  // Check for authenticated user
  const userId = req.headers.get('x-user-id');
  const apiKey = req.headers.get('x-api-key');
  const authorization = req.headers.get('authorization');

  if (userId) return `user:${userId}`;
  if (apiKey) return `api:${crypto.createHash('sha256').update(apiKey).digest('hex').substring(0, 16)}`;
  if (authorization) {
    const token = authorization.replace('Bearer ', '');
    return `token:${crypto.createHash('sha256').update(token).digest('hex').substring(0, 16)}`;
  }

  return `ip:${ip}`;
}

// Sliding window algorithm
function checkSlidingWindow(
  history: number[],
  windowMs: number,
  max: number,
  burst?: number
): { allowed: boolean; retryAfter: number; remaining: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Filter requests within the window
  const recentRequests = history.filter(time => time > windowStart);

  // Check burst limit (requests within 1 second)
  if (burst && burst > 0) {
    const oneSecondAgo = now - 1000;
    const burstRequests = recentRequests.filter(time => time > oneSecondAgo);
    
    if (burstRequests.length >= burst) {
      return {
        allowed: false,
        retryAfter: 1,
        remaining: 0
      };
    }
  }

  // Check window limit
  if (recentRequests.length >= max) {
    const oldestRequest = recentRequests[0];
    const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000);
    
    return {
      allowed: false,
      retryAfter,
      remaining: 0
    };
  }

  return {
    allowed: true,
    retryAfter: 0,
    remaining: max - recentRequests.length - 1
  };
}

// Main rate limiter factory
export function createAdvancedRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const options: RateLimitConfig = {
    windowMs: 60000, // 1 minute
    max: 60, // 60 requests per minute
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: true,
    keyGenerator: defaultKeyGenerator,
    store: new MemoryStore(),
    ...config
  };

  return async function rateLimiter(
    request: NextRequest,
    handler?: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    // Check if should skip
    if (options.skip) {
      const shouldSkip = await Promise.resolve(options.skip(request));
      if (shouldSkip && handler) {
        return handler(request);
      }
    }

    const key = options.keyGenerator!(request);
    const store = options.store!;

    // Get current state
    let info = await store.get(key);
    const now = Date.now();

    if (!info) {
      info = {
        totalHits: 0,
        resetTime: new Date(now + options.windowMs),
        history: []
      };
    }

    // Clean old entries from history
    info.history = info.history.filter(time => time > now - options.windowMs);

    // Check rate limit
    const { allowed, retryAfter, remaining } = checkSlidingWindow(
      info.history,
      options.windowMs,
      options.max,
      options.burst
    );

    if (!allowed) {
      // Call limit reached handler
      if (options.onLimitReached) {
        options.onLimitReached(request, options);
      }

      // Log rate limit violation
      console.warn(`Rate limit exceeded for ${key}`, {
        totalHits: info.totalHits,
        windowMs: options.windowMs,
        max: options.max,
        burst: options.burst,
        path: request.nextUrl.pathname,
        method: request.method
      });

      const response = NextResponse.json(
        { 
          error: options.message,
          retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': options.max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(now + options.windowMs).toISOString(),
          }
        }
      );

      // Add RateLimit headers
      if (options.standardHeaders) {
        response.headers.set('RateLimit-Limit', options.max.toString());
        response.headers.set('RateLimit-Remaining', '0');
        response.headers.set('RateLimit-Reset', Math.ceil((now + options.windowMs) / 1000).toString());
        response.headers.set('RateLimit-Policy', `${options.max};w=${options.windowMs / 1000}`);
      }

      return response;
    }

    // Increment counter
    await store.increment(key);

    // Process request if handler provided
    if (handler) {
      const response = await handler(request);
      
      // Skip counting successful/failed requests if configured
      if (
        (options.skipSuccessfulRequests && response.status < 400) ||
        (options.skipFailedRequests && response.status >= 400)
      ) {
        await store.decrement(key);
      }

      // Add rate limit headers
      if (options.standardHeaders) {
        response.headers.set('RateLimit-Limit', options.max.toString());
        response.headers.set('RateLimit-Remaining', remaining.toString());
        response.headers.set('RateLimit-Reset', Math.ceil((now + options.windowMs) / 1000).toString());
        response.headers.set('RateLimit-Policy', `${options.max};w=${options.windowMs / 1000}`);
      }

      if (options.legacyHeaders) {
        response.headers.set('X-RateLimit-Limit', options.max.toString());
        response.headers.set('X-RateLimit-Remaining', remaining.toString());
        response.headers.set('X-RateLimit-Reset', new Date(now + options.windowMs).toISOString());
      }

      return response;
    }

    // Return null if no handler (for middleware chaining)
    return NextResponse.next();
  };
}

// Preset configurations
export const advancedRateLimits = {
  // Very strict for authentication
  auth: createAdvancedRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    burst: 3,
    message: 'Too many authentication attempts. Please try again later.',
    skipSuccessfulRequests: true,
  }),

  // Standard API rate limit
  api: createAdvancedRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    burst: 100,
  }),

  // Lenient for read operations
  read: createAdvancedRateLimiter({
    windowMs: 60 * 1000,
    max: 100,
    burst: 200,
  }),

  // Stricter for write operations
  write: createAdvancedRateLimiter({
    windowMs: 60 * 1000,
    max: 20,
    burst: 30,
    message: 'Too many write requests. Please slow down.',
  }),

  // Very strict for expensive operations
  expensive: createAdvancedRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    burst: 0, // No burst allowed
    message: 'This operation is rate limited. Please try again later.',
  }),

  // File uploads
  upload: createAdvancedRateLimiter({
    windowMs: 60 * 1000,
    max: 5,
    burst: 0,
    message: 'Upload rate limit exceeded. Please wait before uploading more files.',
    keyGenerator: (req) => {
      // Rate limit by user for uploads
      const userId = req.headers.get('x-user-id');
      return userId ? `upload:user:${userId}` : `upload:${defaultKeyGenerator(req)}`;
    }
  }),

  // Data exports
  export: createAdvancedRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Export rate limit exceeded. Please wait before exporting again.',
  }),

  // Search operations
  search: createAdvancedRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    burst: 50,
    skipSuccessfulRequests: false,
    keyGenerator: (req) => {
      // Rate limit by query pattern
      const query = req.nextUrl.searchParams.get('q') || '';
      const queryHash = crypto.createHash('sha256').update(query).digest('hex').substring(0, 8);
      return `search:${defaultKeyGenerator(req)}:${queryHash}`;
    }
  }),
};

// Helper for route handlers
export function withAdvancedRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config?: Partial<RateLimitConfig>
) {
  const limiter = createAdvancedRateLimiter(config);
  return (req: NextRequest) => limiter(req, handler);
}

// IP blocking for severe violations
const blockedIPs = new Map<string, number>();
const ipViolations = new Map<string, number>();

export function blockIP(ip: string, duration = 24 * 60 * 60 * 1000) {
  blockedIPs.set(ip, Date.now() + duration);
}

export function isIPBlocked(ip: string): boolean {
  const blockUntil = blockedIPs.get(ip);
  if (!blockUntil) return false;
  
  if (blockUntil < Date.now()) {
    blockedIPs.delete(ip);
    return false;
  }
  
  return true;
}

export function recordIPViolation(ip: string, threshold = 100) {
  const violations = (ipViolations.get(ip) || 0) + 1;
  ipViolations.set(ip, violations);
  
  if (violations >= threshold) {
    blockIP(ip);
    ipViolations.delete(ip);
  }
}

// Middleware for IP blocking
export function createIPBlockMiddleware() {
  return async function ipBlocker(request: NextRequest): Promise<NextResponse | null> {
    const forwarded = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    const cloudflare = request.headers.get('cf-connecting-ip');
    const ip = forwarded?.split(',')[0] || real || cloudflare || 'unknown';
    
    if (isIPBlocked(ip)) {
      console.error(`Blocked IP attempting access: ${ip}`, {
        path: request.nextUrl.pathname,
        method: request.method,
        userAgent: request.headers.get('user-agent')
      });
      
      return new NextResponse(null, { status: 403 });
    }
    
    return null;
  };
}

// Cleanup blocked IPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, until] of blockedIPs.entries()) {
    if (until < now) {
      blockedIPs.delete(ip);
    }
  }
}, 60 * 60 * 1000); // Every hour

// Export stats for monitoring
export function getRateLimitStats() {
  return {
    blockedIPs: blockedIPs.size,
    ipViolations: ipViolations.size,
    topViolators: Array.from(ipViolations.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, violations: count }))
  };
}