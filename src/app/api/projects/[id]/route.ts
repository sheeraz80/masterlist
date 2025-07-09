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
      revenue_potential: JSON.parse(project.revenuePotential || '{}'),
      development_time: project.developmentTime,
      competition_level: project.competitionLevel,
      technical_complexity: project.technicalComplexity,
      quality_score: project.qualityScore,
      key_features: JSON.parse(project.keyFeatures || '[]'),
      tags: JSON.parse(project.tags || '[]'),
      status: project.status,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
      owner: project.owner,
      comments: project.comments,
      activities: project.activities,
      _count: project._count
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