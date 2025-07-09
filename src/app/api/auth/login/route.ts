import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { loginSchema, validateRequest } from '@/lib/validations';

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    // Validate request body
    const { data, error } = await validateRequest(request, loginSchema);
    
    if (error) {
      return NextResponse.json(
        { error: `Invalid login data: ${error}` },
        { status: 400 }
      );
    }

    const result = await login(data.email, data.password);

    const response = NextResponse.json({
      user: result.user,
      token: result.token
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 401 }
    );
  }
}, rateLimits.auth);