import { NextRequest, NextResponse } from 'next/server';
import { EnhancedQAService } from '@/lib/services/enhanced-qa-service';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';

// Get enhanced QA analysis for projects
export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const url = new URL(request.url);
      const projectId = url.searchParams.get('projectId');
      const projectIds = url.searchParams.get('projectIds')?.split(',');

      const qaService = new EnhancedQAService();

      if (projectId) {
        // Single project analysis
        const analysis = await qaService.analyzeProject(projectId);
        return NextResponse.json(analysis);
      } else if (projectIds && projectIds.length > 0) {
        // Multiple projects metrics
        const metrics = await qaService.getEnhancedMetrics(projectIds);
        return NextResponse.json({ metrics });
      } else {
        // Get metrics for all projects (limited to first 100)
        const { prisma } = await import('@/lib/prisma');
        const projects = await prisma.project.findMany({
          select: { id: true },
          take: 100,
          orderBy: { updatedAt: 'desc' }
        });
        
        const allProjectIds = projects.map(p => p.id);
        const metrics = await qaService.getEnhancedMetrics(allProjectIds);
        
        // Calculate aggregate statistics
        const totalProjects = metrics.length;
        const repositoryLinkedProjects = metrics.filter(m => m.repositoryId).length;
        const averageQualityScore = metrics.reduce((sum, m) => sum + m.qualityScore, 0) / totalProjects;
        const averageCodeQuality = metrics
          .filter(m => m.codeQuality)
          .reduce((sum, m) => sum + (m.codeQuality || 0), 0) / 
          metrics.filter(m => m.codeQuality).length || 0;

        return NextResponse.json({
          metrics,
          summary: {
            totalProjects,
            repositoryLinkedProjects,
            repositoryLinkagePercentage: (repositoryLinkedProjects / totalProjects) * 100,
            averageQualityScore,
            averageCodeQuality,
            improvingTrend: metrics.filter(m => m.qualityTrend === 'improving').length,
            decliningTrend: metrics.filter(m => m.qualityTrend === 'declining').length,
            stableTrend: metrics.filter(m => m.qualityTrend === 'stable').length
          }
        });
      }
    } catch (error) {
      console.error('Error in enhanced QA analysis:', error);
      return NextResponse.json(
        { error: 'Failed to perform QA analysis' },
        { status: 500 }
      );
    }
  }),
  rateLimits.read
);

// Trigger QA analysis for a project
export const POST = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
    try {
      const body = await request.json();
      const { projectId, forceRefresh = false } = body;

      if (!projectId) {
        return NextResponse.json(
          { error: 'Project ID is required' },
          { status: 400 }
        );
      }

      const qaService = new EnhancedQAService();
      const analysis = await qaService.analyzeProject(projectId);

      return NextResponse.json({
        analysis,
        timestamp: new Date().toISOString(),
        forceRefresh
      });
    } catch (error) {
      console.error('Error triggering QA analysis:', error);
      return NextResponse.json(
        { error: 'Failed to trigger QA analysis' },
        { status: 500 }
      );
    }
  }),
  rateLimits.write
);