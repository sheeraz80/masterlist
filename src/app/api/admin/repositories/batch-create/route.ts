import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { repoAutomation } from '@/lib/services/repository-automation-service';
import { prisma } from '@/lib/prisma';

// Admin-only endpoint for batch repository creation
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify admin
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

    const body = await request.json();
    const { dryRun = false, batchSize = 10 } = body;

    // Create a job record to track progress
    const job = await prisma.batchJob.create({
      data: {
        type: 'REPOSITORY_CREATION',
        status: 'RUNNING',
        metadata: {
          dryRun,
          batchSize,
          startedAt: new Date().toISOString()
        }
      }
    });

    // Execute batch creation asynchronously
    executeBatchCreation(job.id, dryRun).catch(error => {
      console.error('Batch creation failed:', error);
      prisma.batchJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          metadata: {
            error: error.message,
            completedAt: new Date().toISOString()
          }
        }
      });
    });

    return NextResponse.json({
      jobId: job.id,
      message: 'Batch repository creation started',
      trackingUrl: `/api/admin/repositories/batch-create/${job.id}`
    });
  } catch (error) {
    console.error('Failed to start batch creation:', error);
    return NextResponse.json(
      { error: 'Failed to start batch creation' },
      { status: 500 }
    );
  }
}

// Get batch creation job status
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
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

    const jobs = await prisma.batchJob.findMany({
      where: { type: 'REPOSITORY_CREATION' },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Failed to fetch batch jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch jobs' },
      { status: 500 }
    );
  }
}

async function executeBatchCreation(jobId: string, dryRun: boolean) {
  // Update job status
  await prisma.batchJob.update({
    where: { id: jobId },
    data: {
      metadata: {
        status: 'Loading projects...'
      }
    }
  });

  // Execute batch creation with jobId for progress tracking
  const result = await repoAutomation.createAllRepositories(dryRun, jobId);

  // Update job with results
  await prisma.batchJob.update({
    where: { id: jobId },
    data: {
      status: 'COMPLETED',
      metadata: {
        ...result,
        completedAt: new Date().toISOString()
      }
    }
  });

  // Send notification (webhook, email, etc.)
  await notifyCompletion(jobId, result);
}

async function notifyCompletion(jobId: string, result: any) {
  // Send webhook notification if configured
  if (process.env.WEBHOOK_URL) {
    await fetch(process.env.WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'batch_repository_creation_completed',
        jobId,
        result
      })
    });
  }
}