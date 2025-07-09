import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
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
}