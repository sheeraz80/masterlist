import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // For now, just pass through all requests
  // We can add authentication and monitoring later
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};