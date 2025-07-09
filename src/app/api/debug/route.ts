import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Debug endpoint working',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    }
  });
}