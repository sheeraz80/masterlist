import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import os from 'os';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get basic counts
    const [totalUsers, totalProjects, totalActivities] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.activity.count(),
    ]);

    // Get active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // Get user growth data (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const userGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const [usersCount, projectsCount] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        }),
        prisma.project.count({
          where: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        })
      ]);
      
      userGrowth.push({
        date: startOfDay.toISOString().split('T')[0],
        users: usersCount,
        projects: projectsCount
      });
    }

    // Get projects by category
    const projectsByCategory = await prisma.project.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });

    const categoryData = projectsByCategory.map(item => ({
      category: item.category || 'Uncategorized',
      count: item._count.category,
      percentage: Math.round((item._count.category / totalProjects) * 100)
    }));

    // System health metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);
    
    const cpus = os.cpus();
    const cpuUsage = Math.round(Math.random() * 30 + 10); // Simulated CPU usage
    
    const diskUsage = Math.round(Math.random() * 40 + 20); // Simulated disk usage
    
    const uptime = os.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    const uptimeString = `${uptimeHours}h ${uptimeMinutes}m`;

    const adminStats = {
      totalUsers,
      totalProjects,
      totalActivities,
      activeUsers,
      systemHealth: {
        uptime: uptimeString,
        memoryUsage,
        cpuUsage,
        diskUsage,
      },
      recentUsers,
      userGrowth,
      projectsByCategory: categoryData,
    };

    return NextResponse.json(adminStats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}