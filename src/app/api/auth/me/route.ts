import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { requireAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    return NextResponse.json({ user });
  }),
  rateLimits.api
);