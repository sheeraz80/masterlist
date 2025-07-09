import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { optionalAuth, requireAuth } from '@/lib/middleware/auth';
import { AuthUser } from '@/types';
import { logError, logDatabaseOperation } from '@/lib/logger';

export const GET = withRateLimit(
  optionalAuth(async (request: NextRequest, user: AuthUser | null) => {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id');
    const includeActivity = searchParams.get('include_activity') === 'true';

    if (!user) {
      // Return public data for non-authenticated users
      const recentActivity = await prisma.activity.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          },
          project: {
            select: { id: true, title: true }
          }
        }
      });

      return NextResponse.json({
        teams: [],
        recentActivity: recentActivity.map(formatActivity),
        userRole: null
      });
    }

    // Get user's teams
    const userTeams = await prisma.team.findMany({
      where: {
        members: {
          some: { userId: user.id }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true }
            }
          }
        },
        projects: {
          include: {
            project: {
              include: {
                _count: {
                  select: { comments: true }
                }
              }
            }
          }
        },
        _count: {
          select: { 
            members: true,
            projects: true
          }
        }
      }
    });

    // Format teams data
    const teams = userTeams.map(team => ({
      id: team.id,
      name: team.name,
      description: team.description,
      memberCount: team._count.members,
      projectCount: team._count.projects,
      members: team.members.map(m => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        role: m.role,
        joinedAt: m.joinedAt
      })),
      projects: team.projects.map(tp => ({
        id: tp.project.id,
        title: tp.project.title,
        status: tp.status,
        assignedAt: tp.assignedAt,
        commentsCount: tp.project._count.comments,
        priority: tp.project.priority,
        progress: tp.project.progress
      }))
    }));

    let recentActivity = [];
    if (includeActivity) {
      const activities = await prisma.activity.findMany({
        where: teamId ? {
          teamId
        } : {
          OR: [
            { teamId: { in: userTeams.map(t => t.id) } },
            { userId: user.id }
          ]
        },
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, avatar: true }
          },
          project: {
            select: { id: true, title: true }
          },
          team: {
            select: { id: true, name: true }
          }
        }
      });

      recentActivity = activities.map(formatActivity);
    }

    // Get user's role in the selected team
    let userRole = null;
    if (teamId) {
      const membership = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId,
            userId: user.id
          }
        }
      });
      userRole = membership?.role || null;
    }

    return NextResponse.json({
      teams,
      recentActivity,
      userRole
    });
  } catch (error) {
    logError(error as Error, { 
      context: 'collaboration_get_data',
      userId: user?.id
    });
    return NextResponse.json(
      { error: 'Failed to fetch collaboration data' },
      { status: 500 }
    );
  }
  }),
  rateLimits.read
);

export const POST = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      const { action, ...data } = await request.json();

      switch (action) {
        case 'create_team':
          return handleCreateTeam(user, data);
        case 'invite_member':
          return handleInviteMember(user, data);
        case 'assign_project':
          return handleAssignProject(user, data);
        case 'update_project_status':
          return handleUpdateProjectStatus(user, data);
        case 'update_project_priority':
          return handleUpdateProjectPriority(user, data);
        case 'update_project_progress':
          return handleUpdateProjectProgress(user, data);
        case 'add_comment':
          return handleAddComment(user, data);
        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
          );
      }
    } catch (error: unknown) {
      logError(error as Error, { 
        context: 'collaboration_post_action',
        action: (error as any)?.action || 'unknown'
      });
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  }),
  rateLimits.write
);

async function handleCreateTeam(user: any, data: any) {
  const { name, description } = data;

  if (!name) {
    return NextResponse.json(
      { error: 'Team name is required' },
      { status: 400 }
    );
  }

  const team = await prisma.team.create({
    data: {
      name,
      description,
      members: {
        create: {
          userId: user.id,
          role: 'owner'
        }
      }
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      }
    }
  });

  // Create activity
  await prisma.activity.create({
    data: {
      type: 'team_created',
      description: `${user.name} created team "${name}"`,
      userId: user.id,
      teamId: team.id
    }
  });

  return NextResponse.json({
    success: true,
    team: {
      id: team.id,
      name: team.name,
      description: team.description,
      members: team.members.map(m => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        avatar: m.user.avatar,
        role: m.role
      }))
    }
  });
}

async function handleInviteMember(user: any, data: any) {
  const { teamId, email, role = 'member' } = data;

  // Check if user has permission
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: user.id
      }
    }
  });

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  // Find user by email
  const invitedUser = await prisma.user.findUnique({
    where: { email }
  });

  if (!invitedUser) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  // Check if already a member
  const existingMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: invitedUser.id
      }
    }
  });

  if (existingMember) {
    return NextResponse.json(
      { error: 'User is already a team member' },
      { status: 400 }
    );
  }

  // Add member
  await prisma.teamMember.create({
    data: {
      teamId,
      userId: invitedUser.id,
      role
    }
  });

  // Create activity
  await prisma.activity.create({
    data: {
      type: 'member_joined',
      description: `${invitedUser.name} joined the team`,
      userId: invitedUser.id,
      teamId
    }
  });

  // Create notification
  await prisma.notification.create({
    data: {
      type: 'team_invite',
      title: 'Team Invitation',
      message: `You have been added to a team by ${user.name}`,
      userId: invitedUser.id,
      metadata: JSON.stringify({ teamId })
    }
  });

  return NextResponse.json({
    success: true,
    member: {
      id: invitedUser.id,
      name: invitedUser.name,
      email: invitedUser.email,
      avatar: invitedUser.avatar,
      role
    }
  });
}

async function handleAssignProject(user: any, data: any) {
  const { teamId, projectId } = data;

  // Check permissions
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: user.id
      }
    }
  });

  if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  // Check if project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    );
  }

  // Check if already assigned
  const existing = await prisma.teamProject.findUnique({
    where: {
      teamId_projectId: {
        teamId,
        projectId
      }
    }
  });

  if (existing) {
    return NextResponse.json(
      { error: 'Project already assigned to team' },
      { status: 400 }
    );
  }

  // Assign project
  await prisma.teamProject.create({
    data: {
      teamId,
      projectId,
      status: 'assigned'
    }
  });

  // Create activity
  await prisma.activity.create({
    data: {
      type: 'project_assigned',
      description: `${user.name} assigned "${project.title}" to the team`,
      userId: user.id,
      projectId,
      teamId
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Project assigned successfully'
  });
}

async function handleUpdateProjectStatus(user: any, data: any) {
  const { teamId, projectId, status, priority, progress } = data;

  // Verify team membership
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId: user.id
      }
    }
  });

  if (!membership) {
    return NextResponse.json(
      { error: 'Not a team member' },
      { status: 403 }
    );
  }

  // Update team project status if provided
  if (status) {
    await prisma.teamProject.update({
      where: {
        teamId_projectId: {
          teamId,
          projectId
        }
      },
      data: { status }
    });
  }

  // Update project fields if provided
  const updateData: any = {};
  const changes: string[] = [];
  
  if (priority !== undefined) {
    updateData.priority = priority;
    changes.push(`priority to ${priority}`);
  }
  
  if (progress !== undefined) {
    updateData.progress = Math.max(0, Math.min(100, progress)); // Ensure 0-100 range
    changes.push(`progress to ${progress}%`);
  }
  
  let project;
  if (Object.keys(updateData).length > 0) {
    project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      select: { title: true }
    });
  } else {
    project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { title: true }
    });
  }

  // Create activity
  let description = `${user.name}`;
  if (status) {
    description += ` changed status of "${project?.title}" to ${status}`;
    if (changes.length > 0) description += ' and';
  }
  if (changes.length > 0) {
    description += ` updated ${changes.join(' and ')}`;
  }

  await prisma.activity.create({
    data: {
      type: status ? 'status_changed' : 'project_updated',
      description,
      userId: user.id,
      projectId,
      teamId
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Project updated successfully'
  });
}

async function handleUpdateProjectPriority(user: any, data: any) {
  const { teamId, projectId, priority } = data;

  if (!priority) {
    return NextResponse.json(
      { error: 'Priority is required' },
      { status: 400 }
    );
  }

  // Reuse existing handler with priority data
  return handleUpdateProjectStatus(user, { teamId, projectId, priority });
}

async function handleUpdateProjectProgress(user: any, data: any) {
  const { teamId, projectId, progress } = data;

  if (progress === undefined || progress === null) {
    return NextResponse.json(
      { error: 'Progress is required' },
      { status: 400 }
    );
  }

  // Validate progress range
  const validProgress = Math.max(0, Math.min(100, progress));
  
  // Reuse existing handler with progress data
  return handleUpdateProjectStatus(user, { teamId, projectId, progress: validProgress });
}

async function handleAddComment(user: any, data: any) {
  const { projectId, content, type = 'comment', rating } = data;

  if (!content) {
    return NextResponse.json(
      { error: 'Comment content is required' },
      { status: 400 }
    );
  }

  const comment = await prisma.comment.create({
    data: {
      projectId,
      userId: user.id,
      content,
      type,
      rating: type === 'review' && rating ? rating : null
    },
    include: {
      user: {
        select: { id: true, name: true, avatar: true }
      },
      project: {
        select: { title: true }
      }
    }
  });

  // Create activity
  await prisma.activity.create({
    data: {
      type: 'comment_added',
      description: `${user.name} commented on "${comment.project.title}"`,
      userId: user.id,
      projectId,
      metadata: JSON.stringify({ commentId: comment.id })
    }
  });

  return NextResponse.json({
    success: true,
    comment: {
      id: comment.id,
      content: comment.content,
      type: comment.type,
      rating: comment.rating,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        name: comment.user.name,
        avatar: comment.user.avatar
      }
    }
  });
}

function formatActivity(activity: any) {
  return {
    id: activity.id,
    type: activity.type,
    description: activity.description,
    createdAt: activity.createdAt,
    user: activity.user ? {
      id: activity.user.id,
      name: activity.user.name,
      avatar: activity.user.avatar
    } : null,
    project: activity.project ? {
      id: activity.project.id,
      title: activity.project.title
    } : null,
    team: activity.team ? {
      id: activity.team.id,
      name: activity.team.name
    } : null,
    metadata: activity.metadata ? JSON.parse(activity.metadata) : null
  };
}