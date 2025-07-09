import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { AuthUser } from '@/types';

export type UserRole = 'user' | 'admin' | 'moderator';

interface AuthOptions {
  requireAuth?: boolean;
  requireRoles?: UserRole[];
  allowGuest?: boolean;
}

export async function withAuth(
  request: NextRequest,
  handler: (req: NextRequest, user: AuthUser | null) => Promise<NextResponse>,
  options: AuthOptions = { requireAuth: true }
) {
  try {
    const user = await getCurrentUser(request);

    // Check if authentication is required
    if (options.requireAuth && !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check role requirements
    if (options.requireRoles && options.requireRoles.length > 0) {
      if (!user || !options.requireRoles.includes(user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Allow guest access if specified
    if (options.allowGuest && !user) {
      return handler(request, null);
    }

    return handler(request, user);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    );
  }
}

// Convenience wrappers
export const requireAuth = (
  handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>
) => (req: NextRequest) => withAuth(req, handler as (req: NextRequest, user: AuthUser | null) => Promise<NextResponse>, { requireAuth: true });

export const requireAdmin = (
  handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>
) => (req: NextRequest) => withAuth(req, handler as (req: NextRequest, user: AuthUser | null) => Promise<NextResponse>, { requireAuth: true, requireRoles: ['admin'] });

export const optionalAuth = (
  handler: (req: NextRequest, user: AuthUser | null) => Promise<NextResponse>
) => (req: NextRequest) => withAuth(req, handler, { requireAuth: false, allowGuest: true });