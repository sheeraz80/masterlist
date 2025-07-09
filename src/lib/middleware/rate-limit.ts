import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (for production, use Redis or Upstash)
const requestCounts = new Map<string, RateLimitData>();

interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  max?: number; // Max requests per window
  message?: string; // Error message
  keyGenerator?: (req: NextRequest) => string; // Function to generate rate limit key
}

interface RateLimitData {
  count: number;
  resetTime: number;
}

const defaultOptions: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many requests, please try again later',
  keyGenerator: (req) => {
    // Use IP address as default key
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    return ip;
  },
};

export function rateLimit(options: RateLimitOptions = {}) {
  const config = { ...defaultOptions, ...options };

  return async function rateLimitMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const key = config.keyGenerator!(request);
    const now = Date.now();

    // Clean up old entries
    for (const [k, v] of requestCounts.entries()) {
      if (v.resetTime < now) {
        requestCounts.delete(k);
      }
    }

    // Get or create rate limit data
    let limitData: RateLimitData = requestCounts.get(key) || { count: 0, resetTime: 0 };
    if (!requestCounts.has(key) || limitData.resetTime < now) {
      limitData = {
        count: 0,
        resetTime: now + config.windowMs!,
      };
      requestCounts.set(key, limitData);
    }

    // Check rate limit
    if (limitData.count >= config.max!) {
      const retryAfter = Math.ceil((limitData.resetTime - now) / 1000);
      
      return NextResponse.json(
        { error: config.message },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.max!.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(limitData.resetTime).toISOString(),
          },
        }
      );
    }

    // Increment counter
    limitData.count++;

    // Process request
    const response = await handler(request);

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', config.max!.toString());
    response.headers.set('X-RateLimit-Remaining', (config.max! - limitData.count).toString());
    response.headers.set('X-RateLimit-Reset', new Date(limitData.resetTime).toISOString());

    return response;
  };
}

// Preset configurations
export const rateLimits = {
  // Strict limit for auth endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: 'Too many authentication attempts, please try again later',
  }),

  // Standard API limit
  api: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
  }),

  // Lenient limit for read operations
  read: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  }),

  // Strict limit for write operations
  write: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per minute
  }),

  // Very strict limit for expensive operations
  expensive: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour
    message: 'This operation is rate limited. Please try again later.',
  }),
};

// Helper to apply rate limit
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: RateLimitOptions
) {
  const limiter = rateLimit(options);
  return (req: NextRequest) => limiter(req, handler);
}