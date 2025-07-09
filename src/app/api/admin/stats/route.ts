import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Get CPU usage percentage
async function getCpuUsage(): Promise<number> {
  try {
    // Get CPU stats
    const cpus = os.cpus();
    const totalInfo = cpus.reduce((acc, cpu) => {
      acc.user += cpu.times.user;
      acc.nice += cpu.times.nice;
      acc.sys += cpu.times.sys;
      acc.idle += cpu.times.idle;
      acc.irq += cpu.times.irq;
      return acc;
    }, { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 });
    
    const total = Object.values(totalInfo).reduce((a, b) => a + b, 0);
    const idle = totalInfo.idle;
    const usage = 100 - Math.round((idle / total) * 100);
    
    return Math.max(0, Math.min(100, usage));
  } catch {
    return 0;
  }
}

// Get disk usage for the current directory
async function getDiskUsage(): Promise<number> {
  try {
    // Use df command to get disk usage
    const { stdout } = await execAsync('df -h . | tail -1');
    const parts = stdout.trim().split(/\s+/);
    // The usage percentage is typically the 5th column (e.g., "45%")
    const usageStr = parts[4] || parts[3]; // Handle different df output formats
    const usage = parseInt(usageStr.replace('%', ''), 10);
    return isNaN(usage) ? 0 : usage;
  } catch {
    // Fallback: calculate based on available Node.js APIs
    try {
      const { stdout } = await execAsync('df . | tail -1');
      const parts = stdout.trim().split(/\s+/);
      const used = parseInt(parts[2], 10);
      const available = parseInt(parts[3], 10);
      const total = used + available;
      return Math.round((used / total) * 100);
    } catch {
      return 0;
    }
  }
}

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
    
    // Get real CPU and disk usage
    const [cpuUsage, diskUsage] = await Promise.all([
      getCpuUsage(),
      getDiskUsage()
    ]);
    
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
        totalMemory: `${Math.round(totalMem / (1024 * 1024 * 1024))}GB`,
        freeMemory: `${Math.round(freeMem / (1024 * 1024 * 1024))}GB`,
        cpuCores: os.cpus().length,
        platform: os.platform(),
        nodeVersion: process.version,
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