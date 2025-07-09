import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { requireAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    // Only allow admin users to access debug endpoints
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Only allow in development or with explicit debug flag
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_DEBUG) {
      return NextResponse.json(
        { error: 'Debug endpoints disabled in production' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      message: 'Debug endpoint working',
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      },
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  }),
  rateLimits.api
);