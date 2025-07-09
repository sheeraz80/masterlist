import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { requireAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    // Only allow admin users to access test endpoints
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Only allow in development or with explicit debug flag
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_DEBUG) {
      return NextResponse.json(
        { error: 'Test endpoints disabled in production' },
        { status: 403 }
      );
    }
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    
    // Get database version
    const version = await prisma.$queryRaw`SELECT version()`;
    
    return NextResponse.json({
      success: true,
      database: 'PostgreSQL',
      connection: 'successful',
      version: version[0]?.version || 'Unknown',
      stats: {
        users: userCount,
        projects: projectCount
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    }, { status: 500 });
  }
  }),
  rateLimits.api
);