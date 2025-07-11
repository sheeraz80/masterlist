import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth, requireAuth } from '@/lib/middleware/auth';
import { updateProjectSchema, validateRequest } from '@/lib/validations';
import { AuthUser } from '@/types';

export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, _user: AuthUser | null) => {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/').pop();

      if (!id) {
        return NextResponse.json(
          { error: 'Project ID is required' },
          { status: 400 }
        );
      }

      const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            comments: true,
            activities: true,
            teamProjects: true
          }
        }
      }
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Transform the project to match expected format
    const transformedProject = {
      id: project.id,
      title: project.title,
      problem: project.problem,
      solution: project.solution,
      category: project.category,
      target_users: project.targetUsers,
      revenue_model: project.revenueModel,
      revenue_potential: (() => {
        try {
          if (!project.revenuePotential) return {};
          if (typeof project.revenuePotential === 'object') return project.revenuePotential;
          return JSON.parse(project.revenuePotential);
        } catch {
          return { conservative: 0, realistic: 0, optimistic: 0 };
        }
      })(),
      development_time: project.developmentTime,
      competition_level: project.competitionLevel,
      technical_complexity: project.technicalComplexity,
      quality_score: project.qualityScore,
      key_features: (() => {
        try {
          if (!project.keyFeatures) return [];
          if (Array.isArray(project.keyFeatures)) return project.keyFeatures;
          if (project.keyFeatures.startsWith('[')) return JSON.parse(project.keyFeatures);
          return project.keyFeatures.split(',').map(f => f.trim());
        } catch {
          return [];
        }
      })(),
      tags: (() => {
        try {
          if (!project.tags) return [];
          if (Array.isArray(project.tags)) return project.tags;
          if (project.tags.startsWith('[')) return JSON.parse(project.tags);
          return project.tags.split(',').map(t => t.trim());
        } catch {
          return [];
        }
      })(),
      status: project.status,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
      owner: project.owner,
      comments: project.comments,
      activities: project.activities,
      _count: project._count,
      // New platform enhancement fields
      complexity: project.complexity || 'basic',
      feature_modules: project.feature_modules || [],
      testing_coverage: project.testing_coverage || 0,
      security_score: project.security_score || 0,
      documentation_level: project.documentation_level || 'basic',
      deployment_ready: project.deployment_ready || false,
      monitoring_enabled: project.monitoring_enabled || false,
      internationalization_ready: project.internationalization_ready || false,
      accessibility_score: project.accessibility_score || 0,
      business_metrics: project.business_metrics || {},
      corevecta_certified: project.corevecta_certified || false,
      certification_level: project.certification_level || null,
      quality_audit_date: project.quality_audit_date,
      estimated_development_hours: project.estimated_development_hours
    };

    return NextResponse.json(transformedProject);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
  }),
  rateLimits.read
);

export const PUT = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/').pop();

      if (!id) {
        return NextResponse.json(
          { error: 'Project ID is required' },
          { status: 400 }
        );
      }

      // Validate request body
      const { data, error } = await validateRequest(request, updateProjectSchema);
      
      if (error) {
        return NextResponse.json(
          { error: `Invalid project data: ${error}` },
          { status: 400 }
        );
      }

      // Check if project exists and user has permission
      const existingProject = await prisma.project.findUnique({
        where: { id },
        select: { id: true, ownerId: true, title: true }
      });

      if (!existingProject) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      // Check ownership or admin role
      if (existingProject.ownerId !== user.id && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        problem: data.problem,
        solution: data.solution,
        category: data.category,
        targetUsers: data.targetUsers,
        revenueModel: data.revenueModel,
        revenuePotential: JSON.stringify(data.revenuePotential || {}),
        developmentTime: data.developmentTime,
        competitionLevel: data.competitionLevel,
        technicalComplexity: data.technicalComplexity,
        qualityScore: data.qualityScore,
        keyFeatures: JSON.stringify(data.keyFeatures || []),
        tags: JSON.stringify(data.tags || []),
        priority: data.priority,
        progress: data.progress
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'project_updated',
        description: `Updated project: ${project.title}`,
        projectId: project.id,
        userId: user.id
      }
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
  }),
  rateLimits.write
);

export const PATCH = withRateLimit(
  async (request: NextRequest) => {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/').pop();

      if (!id) {
        return NextResponse.json(
          { error: 'Project ID is required' },
          { status: 400 }
        );
      }

      const body = await request.json();

      // Check if project exists
      const existingProject = await prisma.project.findUnique({
        where: { id },
        select: { id: true, title: true }
      });

      if (!existingProject) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      // Prepare update data (only include fields that are provided)
      const updateData: any = {
        updatedAt: new Date()
      };

      if (body.title !== undefined) updateData.title = body.title;
      if (body.problem !== undefined) updateData.problem = body.problem;
      if (body.solution !== undefined) updateData.solution = body.solution;
      if (body.category !== undefined) updateData.category = body.category;
      if (body.targetUsers !== undefined) updateData.targetUsers = body.targetUsers;
      if (body.revenueModel !== undefined) updateData.revenueModel = body.revenueModel;
      if (body.keyFeatures !== undefined) updateData.keyFeatures = body.keyFeatures;
      if (body.tags !== undefined) updateData.tags = body.tags;

      const project = await prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          },
          _count: {
            select: {
              comments: true,
              activities: true
            }
          }
        }
      });

      return NextResponse.json(project);
    } catch (error) {
      console.error('Error updating project:', error);
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }
  },
  rateLimits.write
);

export const DELETE = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      const url = new URL(request.url);
      const id = url.pathname.split('/').pop();

      if (!id) {
        return NextResponse.json(
          { error: 'Project ID is required' },
          { status: 400 }
        );
      }

      // Check if project exists and user has permission
      const existingProject = await prisma.project.findUnique({
        where: { id },
        select: { id: true, ownerId: true, title: true }
      });

      if (!existingProject) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      // Check ownership or admin role
      if (existingProject.ownerId !== user.id && user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

    // Log activity before deletion
    await prisma.activity.create({
      data: {
        type: 'project_deleted',
        description: `Deleted project: ${existingProject.title}`,
        projectId: existingProject.id,
        userId: user.id
      }
    });

    await prisma.project.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
  }),
  rateLimits.write
);