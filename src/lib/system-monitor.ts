import { prisma } from '@/lib/prisma';
import os from 'os';

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    memory: boolean;
    disk: boolean;
  };
  metrics: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
    dbConnections: number;
  };
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const checks = {
    database: await checkDatabase(),
    memory: checkMemory(),
    disk: checkDisk(),
  };

  const metrics = {
    uptime: Math.floor(process.uptime()),
    memoryUsage: getMemoryUsage(),
    cpuUsage: await getCpuUsage(),
    dbConnections: await getDatabaseConnections(),
  };

  const status = determineStatus(checks, metrics);

  return {
    status,
    checks,
    metrics,
  };
}

async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

function checkMemory(): boolean {
  const memoryUsage = getMemoryUsage();
  return memoryUsage < 80; // Consider unhealthy if memory usage > 80%
}

function checkDisk(): boolean {
  // Simple disk check - in production, use proper disk space monitoring
  return true;
}

function getMemoryUsage(): number {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  return Math.round((usedMemory / totalMemory) * 100);
}

async function getCpuUsage(): Promise<number> {
  // Simple CPU usage calculation
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - Math.round((100 * idle) / total);
  
  return Math.max(0, Math.min(100, usage));
}

async function getDatabaseConnections(): Promise<number> {
  try {
    // This is a simplified count - in production, use proper connection pool monitoring
    const userCount = await prisma.user.count();
    return Math.floor(userCount / 100); // Mock connection count based on user count
  } catch {
    return 0;
  }
}

function determineStatus(
  checks: SystemHealth['checks'],
  metrics: SystemHealth['metrics']
): SystemHealth['status'] {
  // Critical checks
  if (!checks.database) {
    return 'unhealthy';
  }

  // Performance checks
  if (metrics.memoryUsage > 90 || metrics.cpuUsage > 90) {
    return 'unhealthy';
  }

  if (metrics.memoryUsage > 70 || metrics.cpuUsage > 70 || !checks.memory) {
    return 'degraded';
  }

  return 'healthy';
}

export function getSystemInfo() {
  return {
    platform: os.platform(),
    architecture: os.arch(),
    nodeVersion: process.version,
    uptime: Math.floor(process.uptime()),
    hostname: os.hostname(),
    loadAverage: os.loadavg(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    cpuCount: os.cpus().length,
  };
}

export async function getSystemStatus(): Promise<SystemHealth> {
  return getSystemHealth();
}

export async function getHistoricalMetrics(hours: number = 24): Promise<any[]> {
  // Mock historical data - in production, this would come from a metrics database
  const metrics = [];
  const now = Date.now();
  
  for (let i = hours; i >= 0; i--) {
    const timestamp = now - (i * 60 * 60 * 1000);
    metrics.push({
      timestamp,
      memory: Math.random() * 80 + 10,
      cpu: Math.random() * 70 + 5,
      responseTime: Math.random() * 200 + 50,
    });
  }
  
  return metrics;
}