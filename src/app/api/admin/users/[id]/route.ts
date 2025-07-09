import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { role } = await request.json();
    const userId = params.id;

    if (!role || !['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Prevent admin from demoting themselves
    if (userId === user.id && role !== 'admin') {
      return NextResponse.json({ 
        error: 'Cannot change your own admin role' 
      }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      }
    });

    // Log the activity
    await prisma.activity.create({
      data: {
        type: 'user_role_updated',
        description: `User role changed to ${role}`,
        userId: user.id,
        metadata: {
          targetUserId: userId,
          newRole: role,
          updatedBy: user.name
        }
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const userId = params.id;

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return NextResponse.json({ 
        error: 'Cannot delete your own account' 
      }, { status: 400 });
    }

    // Get user info before deletion for logging
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user and all related data (cascade will handle most relations)
    await prisma.user.delete({
      where: { id: userId }
    });

    // Log the activity
    await prisma.activity.create({
      data: {
        type: 'user_deleted',
        description: `User account deleted: ${userToDelete.name} (${userToDelete.email})`,
        userId: user.id,
        metadata: {
          deletedUserId: userId,
          deletedUserName: userToDelete.name,
          deletedUserEmail: userToDelete.email,
          deletedBy: user.name
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}