import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Add authentication check here
    // const user = await getCurrentUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: body.title,
        problem: body.problem,
        solution: body.solution,
        category: body.category,
        targetUsers: body.target_users,
        revenueModel: body.revenue_model,
        revenuePotential: JSON.stringify(body.revenue_potential || {}),
        developmentTime: body.development_time,
        competitionLevel: body.competition_level,
        technicalComplexity: body.technical_complexity,
        qualityScore: body.quality_score,
        keyFeatures: JSON.stringify(body.key_features || []),
        tags: JSON.stringify(body.tags || []),
        status: body.status
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'project_updated',
        description: `Updated project: ${project.title}`,
        projectId: project.id,
        // userId: user.id
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
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Add authentication check here
    // const user = await getCurrentUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

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
}