import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withSecurity, securityPresets } from '@/lib/middleware/security';

const securityMiddleware = withSecurity(
  async (request: NextRequest) => {
    return NextResponse.next();
  },
  process.env.NODE_ENV === 'production' ? securityPresets.api : securityPresets.development
);

export function middleware(request: NextRequest) {
  return securityMiddleware(request);
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};