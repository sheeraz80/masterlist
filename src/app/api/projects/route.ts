import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { problem: { contains: search, mode: 'insensitive' } },
        { solution: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === 'quality') {
      orderBy.qualityScore = sortOrder;
    } else if (sortBy === 'complexity') {
      orderBy.technicalComplexity = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // Get projects with pagination
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
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
      }),
      prisma.project.count({ where })
    ]);

    // Transform projects to match expected format
    const transformedProjects = projects.map(project => ({
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
      comments_count: project._count.comments,
      activities_count: project._count.activities
    }));

    // Calculate pagination info
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      projects: transformedProjects,
      pagination: {
        total,
        limit,
        offset,
        page,
        total_pages: totalPages,
        has_more: page < totalPages,
        has_previous: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // TODO: Add authentication check here
    // const user = await getCurrentUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const project = await prisma.project.create({
      data: {
        id: body.id || undefined, // Let Prisma generate if not provided
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
        status: body.status || 'active',
        // ownerId: user.id
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}