import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logError } from '@/lib/logger';

interface HealthCheck {
  timestamp: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database: HealthCheckResult;
    memory: HealthCheckResult;
    disk: HealthCheckResult;
    external_apis: HealthCheckResult;
  };
  metrics: {
    response_time_ms: number;
    memory_usage_mb: number;
    cpu_usage_percent: number;
    active_connections: number;
  };
}

interface HealthCheckResult {
  status: 'pass' | 'fail' | 'warn';
  message: string;
  duration_ms: number;
  details?: Record<string, any>;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const healthCheck: HealthCheck = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        database: await checkDatabase(),
        memory: checkMemory(),
        disk: await checkDisk(),
        external_apis: await checkExternalAPIs(),
      },
      metrics: {
        response_time_ms: 0, // Will be set at the end
        memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        cpu_usage_percent: await getCPUUsage(),
        active_connections: await getActiveConnections(),
      },
    };

    // Calculate overall health status
    const failedChecks = Object.values(healthCheck.checks).filter(check => check.status === 'fail');
    const warnChecks = Object.values(healthCheck.checks).filter(check => check.status === 'warn');
    
    if (failedChecks.length > 0) {
      healthCheck.status = 'unhealthy';
    } else if (warnChecks.length > 0) {
      healthCheck.status = 'degraded';
    }

    // Set response time
    healthCheck.metrics.response_time_ms = Date.now() - startTime;

    // Return appropriate HTTP status
    let httpStatus = 200;
    if (healthCheck.status === 'unhealthy') {
      httpStatus = 503; // Service Unavailable
    }

    return NextResponse.json(healthCheck, {
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    logError('Health check failed:', error);
    
    const errorResponse: HealthCheck = {
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      checks: {
        database: { status: 'fail', message: 'Health check failed', duration_ms: 0 },
        memory: { status: 'fail', message: 'Health check failed', duration_ms: 0 },
        disk: { status: 'fail', message: 'Health check failed', duration_ms: 0 },
        external_apis: { status: 'fail', message: 'Health check failed', duration_ms: 0 },
      },
      metrics: {
        response_time_ms: Date.now() - startTime,
        memory_usage_mb: 0,
        cpu_usage_percent: 0,
        active_connections: 0,
      },
    };

    return NextResponse.json(errorResponse, { status: 503 });
  }
}

async function checkDatabase(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1 as health_check`;
    
    // Test read capability
    const testQuery = await prisma.project.count().catch(() => null);
    
    const duration = Date.now() - startTime;
    
    if (testQuery === null) {
      return {
        status: 'warn',
        message: 'Database accessible but some operations may be limited',
        duration_ms: duration,
      };
    }

    if (duration > 1000) {
      return {
        status: 'warn',
        message: 'Database responding slowly',
        duration_ms: duration,
        details: { query_time_ms: duration },
      };
    }

    return {
      status: 'pass',
      message: 'Database is healthy',
      duration_ms: duration,
      details: { 
        query_time_ms: duration,
        total_projects: testQuery,
      },
    };

  } catch (error) {
    return {
      status: 'fail',
      message: 'Database connection failed',
      duration_ms: Date.now() - startTime,
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

function checkMemory(): HealthCheckResult {
  const startTime = Date.now();
  
  try {
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };

    // Check for memory thresholds
    const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    
    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let message = 'Memory usage is normal';

    if (heapUsagePercent > 90) {
      status = 'fail';
      message = 'Memory usage critically high';
    } else if (heapUsagePercent > 75) {
      status = 'warn';
      message = 'Memory usage is elevated';
    }

    return {
      status,
      message,
      duration_ms: Date.now() - startTime,
      details: {
        ...memUsageMB,
        heap_usage_percent: Math.round(heapUsagePercent),
      },
    };

  } catch (error) {
    return {
      status: 'fail',
      message: 'Memory check failed',
      duration_ms: Date.now() - startTime,
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

async function checkDisk(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Check if we can write to disk (test file operations)
    const fs = require('fs').promises;
    const path = require('path');
    const testFile = path.join(process.cwd(), '.health-check-temp');
    
    await fs.writeFile(testFile, 'health-check');
    await fs.readFile(testFile);
    await fs.unlink(testFile);

    return {
      status: 'pass',
      message: 'Disk I/O is healthy',
      duration_ms: Date.now() - startTime,
    };

  } catch (error) {
    return {
      status: 'fail',
      message: 'Disk I/O check failed',
      duration_ms: Date.now() - startTime,
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

async function checkExternalAPIs(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const checks = [];

    // Check if GitHub API is accessible (if configured)
    if (process.env.GITHUB_TOKEN) {
      try {
        const response = await fetch('https://api.github.com/rate_limit', {
          headers: {
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
          signal: AbortSignal.timeout(5000),
        });
        
        if (response.ok) {
          const data = await response.json();
          checks.push({
            service: 'github',
            status: 'pass',
            remaining_requests: data.rate?.remaining || 0,
          });
        } else {
          checks.push({
            service: 'github',
            status: 'warn',
            message: `GitHub API returned ${response.status}`,
          });
        }
      } catch (error) {
        checks.push({
          service: 'github',
          status: 'fail',
          message: 'GitHub API unreachable',
        });
      }
    }

    const duration = Date.now() - startTime;
    const failedChecks = checks.filter(check => check.status === 'fail');
    const warnChecks = checks.filter(check => check.status === 'warn');

    let status: 'pass' | 'warn' | 'fail' = 'pass';
    let message = 'All external APIs are healthy';

    if (failedChecks.length > 0) {
      status = 'fail';
      message = `${failedChecks.length} external API(s) failed`;
    } else if (warnChecks.length > 0) {
      status = 'warn';
      message = `${warnChecks.length} external API(s) have warnings`;
    }

    return {
      status,
      message,
      duration_ms: duration,
      details: { 
        services: checks,
        total_checked: checks.length,
      },
    };

  } catch (error) {
    return {
      status: 'fail',
      message: 'External API check failed',
      duration_ms: Date.now() - startTime,
      details: { 
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

async function getCPUUsage(): Promise<number> {
  return new Promise((resolve) => {
    const startUsage = process.cpuUsage();
    setTimeout(() => {
      const currentUsage = process.cpuUsage(startUsage);
      const totalUsage = currentUsage.user + currentUsage.system;
      const percentage = (totalUsage / 100000) / 10; // Rough estimation
      resolve(Math.min(Math.round(percentage), 100));
    }, 100);
  });
}

async function getActiveConnections(): Promise<number> {
  try {
    // Get database connection count
    const result = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT count(*) 
      FROM pg_stat_activity 
      WHERE state = 'active'
    `.catch(() => [{ count: BigInt(0) }]);
    
    return Number(result[0]?.count || 0);
  } catch {
    return 0;
  }
}

// Simple liveness probe
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}