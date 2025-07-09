import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user data with additional info
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true
      }
    });
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get user stats
    const [totalProjects, totalComments, totalActivities, teamsJoined] = await Promise.all([
      prisma.project.count({
        where: { ownerId: user.id }
      }),
      prisma.comment.count({
        where: { userId: user.id }
      }),
      prisma.activity.count({
        where: { userId: user.id }
      }),
      prisma.teamMember.count({
        where: { userId: user.id }
      })
    ]);
    
    // Get recent activities
    const recentActivity = await prisma.activity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        description: true,
        createdAt: true
      }
    });
    
    return NextResponse.json({
      user: {
        ...userData,
        bio: '' // We'll add bio field to the schema later if needed
      },
      stats: {
        totalProjects,
        totalComments,
        totalActivities,
        teamsJoined
      },
      recentActivity
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name, bio } = body;
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name.trim()
        // We'll add bio to the schema later if needed
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true
      }
    });
    
    // Create activity for profile update
    await prisma.activity.create({
      data: {
        type: 'profile_updated',
        description: 'Updated profile information',
        userId: user.id
      }
    });
    
    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}