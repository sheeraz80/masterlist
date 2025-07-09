import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/lib/auth';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { registerSchema, validateRequest } from '@/lib/validations';

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    // Validate request body
    const { data, error } = await validateRequest(request, registerSchema);
    
    if (error) {
      return NextResponse.json(
        { error: `Invalid registration data: ${error}` },
        { status: 400 }
      );
    }

    const result = await register(data.email, data.password, data.name);

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
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}, rateLimits.auth);