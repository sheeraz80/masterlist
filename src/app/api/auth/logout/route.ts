import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (token) {
      await logout(token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth-token');

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
}