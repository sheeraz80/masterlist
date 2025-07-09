import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { recordResponseTime } from './lib/system-monitor';

export function middleware(request: NextRequest) {
  const start = Date.now();
  
  // Clone the response to add timing
  const response = NextResponse.next();
  
  // Record API response times
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const duration = Date.now() - start;
    recordResponseTime(duration);
  }
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};