import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

interface Params {
  params: {
    jobId: string;
  };
}

// Get specific batch job status
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const session = await prisma.session.findUnique({
      where: { token: authToken.value },
      include: { user: true }
    });
    
    if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const job = await prisma.batchJob.findUnique({
      where: { id: params.jobId }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Get related repository creation logs
    const logs = await prisma.repositoryCreationLog.findMany({
      where: { batchJobId: params.jobId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      job,
      logs,
      progress: calculateProgress(job, logs)
    });
  } catch (error) {
    console.error('Failed to fetch job status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}

// Cancel a running job
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const session = await prisma.session.findUnique({
      where: { token: authToken.value },
      include: { user: true }
    });
    
    if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const job = await prisma.batchJob.findUnique({
      where: { id: params.jobId }
    });

    if (!job || job.status !== 'RUNNING') {
      return NextResponse.json(
        { error: 'Job cannot be cancelled' },
        { status: 400 }
      );
    }

    await prisma.batchJob.update({
      where: { id: params.jobId },
      data: {
        status: 'CANCELLED',
        metadata: {
          ...job.metadata,
          cancelledAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ message: 'Job cancelled successfully' });
  } catch (error) {
    console.error('Failed to cancel job:', error);
    return NextResponse.json(
      { error: 'Failed to cancel job' },
      { status: 500 }
    );
  }
}

function calculateProgress(job: any, logs: any[]): number {
  if (job.status === 'COMPLETED') return 100;
  if (job.status === 'FAILED' || job.status === 'CANCELLED') return 0;
  
  const totalProjects = job.metadata?.totalProjects || 650;
  const processedCount = logs.length;
  
  return Math.round((processedCount / totalProjects) * 100);
}