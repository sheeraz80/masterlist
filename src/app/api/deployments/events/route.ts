import { NextRequest } from 'next/server';
import { DeploymentService } from '@/lib/services/deployment-service';
import { prisma } from '@/lib/prisma';
import { DeploymentEvent } from '@/types/deployment';

const deploymentService = new DeploymentService();

// SSE endpoint for real-time deployment updates
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  // Get query parameters
  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId');
  const deploymentId = url.searchParams.get('deploymentId');
  
  // Create a TransformStream for SSE
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  
  // Send initial connection message
  writer.write(encoder.encode('event: connected\ndata: {"status": "connected"}\n\n'));
  
  // Set up interval for sending updates
  const interval = setInterval(async () => {
    try {
      let deployments;
      
      if (deploymentId) {
        // Monitor specific deployment
        const deployment = await prisma.deployment.findUnique({
          where: { id: deploymentId },
          include: {
            buildLogs: {
              orderBy: { startedAt: 'desc' },
              take: 1
            },
            incidents: {
              where: { status: { not: 'CLOSED' } }
            }
          }
        });
        
        if (deployment) {
          deployments = [deployment];
        }
      } else if (projectId) {
        // Monitor project deployments
        deployments = await prisma.deployment.findMany({
          where: { 
            projectId,
            isActive: true
          },
          include: {
            buildLogs: {
              orderBy: { startedAt: 'desc' },
              take: 1
            },
            incidents: {
              where: { status: { not: 'CLOSED' } }
            }
          }
        });
      } else {
        // Monitor all active deployments
        deployments = await prisma.deployment.findMany({
          where: { 
            isActive: true,
            status: { in: ['BUILDING', 'DEPLOYING'] }
          },
          include: {
            buildLogs: {
              orderBy: { startedAt: 'desc' },
              take: 1
            }
          },
          take: 20 // Limit to prevent overload
        });
      }
      
      // Send deployment updates
      for (const deployment of deployments || []) {
        const event: DeploymentEvent = {
          type: 'deployment',
          deploymentId: deployment.id,
          timestamp: new Date(),
          data: {
            status: deployment.status,
            health: deployment.health,
            message: `Deployment ${deployment.status.toLowerCase()}`,
            details: {
              buildTime: deployment.buildTime,
              uptime: deployment.uptime,
              errorRate: deployment.errorRate,
              incidents: deployment.incidents?.length || 0,
              lastBuild: deployment.buildLogs?.[0]
            }
          }
        };
        
        await writer.write(
          encoder.encode(`event: deployment-update\ndata: ${JSON.stringify(event)}\n\n`)
        );
      }
      
      // Also check for new incidents
      const recentIncidents = await prisma.incident.findMany({
        where: {
          detectedAt: {
            gte: new Date(Date.now() - 30000) // Last 30 seconds
          }
        },
        include: {
          deployment: {
            select: {
              id: true,
              platform: true,
              project: {
                select: { title: true }
              }
            }
          }
        },
        take: 10
      });
      
      for (const incident of recentIncidents) {
        const event: DeploymentEvent = {
          type: 'incident',
          deploymentId: incident.deploymentId,
          timestamp: new Date(),
          data: {
            message: incident.title,
            details: {
              severity: incident.severity,
              status: incident.status,
              project: incident.deployment.project.title
            }
          }
        };
        
        await writer.write(
          encoder.encode(`event: incident\ndata: ${JSON.stringify(event)}\n\n`)
        );
      }
      
      // Send heartbeat
      await writer.write(encoder.encode(':heartbeat\n\n'));
      
    } catch (error) {
      console.error('Error sending deployment updates:', error);
    }
  }, 5000); // Send updates every 5 seconds
  
  // Clean up on client disconnect
  request.signal.addEventListener('abort', () => {
    clearInterval(interval);
    writer.close();
  });
  
  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}