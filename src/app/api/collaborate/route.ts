import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id');
    const includeActivity = searchParams.get('include_activity') === 'true';

    const user = await getCurrentUser();
    
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
        commentsCount: tp.project._count.comments
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
    console.error('Error fetching collaboration data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collaboration data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
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
      case 'add_comment':
        return handleAddComment(user, data);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Collaboration error:', error);
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    );
  }
}

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
  const { teamId, projectId, status } = data;

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

  // Update status
  const teamProject = await prisma.teamProject.update({
    where: {
      teamId_projectId: {
        teamId,
        projectId
      }
    },
    data: { status },
    include: {
      project: { select: { title: true } }
    }
  });

  // Create activity
  await prisma.activity.create({
    data: {
      type: 'status_changed',
      description: `${user.name} changed status of "${teamProject.project.title}" to ${status}`,
      userId: user.id,
      projectId,
      teamId
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Status updated successfully'
  });
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