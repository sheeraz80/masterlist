import { NextRequest, NextResponse } from 'next/server';
import { DeploymentService } from '@/lib/services/deployment-service';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';
import { DeploymentPlatform } from '@prisma/client';

const deploymentService = new DeploymentService();

// Get platform connection status
export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const url = new URL(request.url);
      const platform = url.searchParams.get('platform') as DeploymentPlatform | null;

      if (platform) {
        const status = await deploymentService.validatePlatformConnection(platform);
        return NextResponse.json(status);
      } else {
        const statuses = await deploymentService.validateAllConnections();
        return NextResponse.json({ platforms: statuses });
      }
    } catch (error) {
      console.error('Error checking platform connections:', error);
      return NextResponse.json(
        { error: 'Failed to check platform connections' },
        { status: 500 }
      );
    }
  }),
  rateLimits.read
);

// Configure platform credentials
export const POST = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const body = await request.json();
      const {
        platform,
        apiKey,
        apiSecret,
        accessToken,
        refreshToken,
        accountId,
        region,
        projectPrefix
      } = body;

      if (!platform) {
        return NextResponse.json(
          { error: 'Platform is required' },
          { status: 400 }
        );
      }

      const { prisma } = await import('@/lib/prisma');

      // Upsert platform credential
      await prisma.platformCredential.upsert({
        where: { platform },
        create: {
          userId: user?.id || 'system',
          platform,
          apiKey,
          apiSecret,
          accessToken,
          refreshToken,
          accountId,
          region,
          projectPrefix,
          isActive: true
        },
        update: {
          apiKey,
          apiSecret,
          accessToken,
          refreshToken,
          accountId,
          region,
          projectPrefix,
          isActive: true,
          updatedAt: new Date()
        }
      });

      // Validate connection
      const status = await deploymentService.validatePlatformConnection(platform);

      return NextResponse.json({
        success: true,
        connectionStatus: status
      });
    } catch (error) {
      console.error('Error configuring platform:', error);
      return NextResponse.json(
        { error: 'Failed to configure platform' },
        { status: 500 }
      );
    }
  }),
  rateLimits.write
);