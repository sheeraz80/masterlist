import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { prisma } from '@/lib/prisma';

interface UserActivity {
  userId: string;
  userName: string;
  action: string;
  projectId?: string;
  projectTitle?: string;
  timestamp: Date;
  metadata?: any;
}

interface CollaborationMetrics {
  activeUsers: number;
  recentActivities: UserActivity[];
  projectCollaborations: Map<string, string[]>;
  userPresence: Map<string, { status: string; lastSeen: Date }>;
}

export class RealtimeCollaborationServer {
  private io: SocketServer;
  private metrics: CollaborationMetrics = {
    activeUsers: 0,
    recentActivities: [],
    projectCollaborations: new Map(),
    userPresence: new Map()
  };

  constructor(server: HTTPServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        credentials: true
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', async (data) => {
        const { userId, userName } = data;
        socket.data.userId = userId;
        socket.data.userName = userName;

        // Update user presence
        this.metrics.userPresence.set(userId, {
          status: 'online',
          lastSeen: new Date()
        });

        // Notify others of user presence
        socket.broadcast.emit('user-online', { userId, userName });

        // Send current metrics
        socket.emit('metrics-update', this.getPublicMetrics());
      });

      // Handle project view
      socket.on('view-project', async (data) => {
        const { projectId, projectTitle } = data;
        const userId = socket.data.userId;

        if (!userId) return;

        // Track collaboration
        if (!this.metrics.projectCollaborations.has(projectId)) {
          this.metrics.projectCollaborations.set(projectId, []);
        }
        const collaborators = this.metrics.projectCollaborations.get(projectId)!;
        if (!collaborators.includes(userId)) {
          collaborators.push(userId);
        }

        // Record activity
        const activity: UserActivity = {
          userId,
          userName: socket.data.userName,
          action: 'viewed_project',
          projectId,
          projectTitle,
          timestamp: new Date()
        };

        this.recordActivity(activity);

        // Join project room
        socket.join(`project:${projectId}`);

        // Notify others in the project
        socket.to(`project:${projectId}`).emit('user-viewing', {
          userId,
          userName: socket.data.userName,
          projectId
        });
      });

      // Handle analytics view
      socket.on('view-analytics', async (data) => {
        const { tab } = data;
        const userId = socket.data.userId;

        if (!userId) return;

        const activity: UserActivity = {
          userId,
          userName: socket.data.userName,
          action: 'viewed_analytics',
          timestamp: new Date(),
          metadata: { tab }
        };

        this.recordActivity(activity);

        // Join analytics room
        socket.join('analytics');

        // Broadcast to analytics viewers
        this.io.to('analytics').emit('analytics-activity', {
          userId,
          userName: socket.data.userName,
          tab,
          timestamp: new Date()
        });
      });

      // Handle real-time updates
      socket.on('project-update', async (data) => {
        const { projectId, updateType, update } = data;
        const userId = socket.data.userId;

        if (!userId) return;

        // Record activity
        const activity: UserActivity = {
          userId,
          userName: socket.data.userName,
          action: `updated_${updateType}`,
          projectId,
          timestamp: new Date(),
          metadata: update
        };

        this.recordActivity(activity);

        // Broadcast to project viewers
        socket.to(`project:${projectId}`).emit('project-updated', {
          userId,
          userName: socket.data.userName,
          updateType,
          update,
          timestamp: new Date()
        });

        // Update global metrics
        this.broadcastMetricsUpdate();
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        const userId = socket.data.userId;
        if (userId) {
          this.metrics.userPresence.set(userId, {
            status: 'offline',
            lastSeen: new Date()
          });

          socket.broadcast.emit('user-offline', { userId });
        }

        console.log('Client disconnected:', socket.id);
      });
    });

    // Periodic metrics broadcast
    setInterval(() => {
      this.broadcastMetricsUpdate();
    }, 30000); // Every 30 seconds
  }

  private recordActivity(activity: UserActivity) {
    this.metrics.recentActivities.unshift(activity);
    
    // Keep only last 100 activities
    if (this.metrics.recentActivities.length > 100) {
      this.metrics.recentActivities = this.metrics.recentActivities.slice(0, 100);
    }

    // Broadcast activity
    this.io.emit('new-activity', activity);
  }

  private getPublicMetrics() {
    const onlineUsers = Array.from(this.metrics.userPresence.entries())
      .filter(([_, presence]) => presence.status === 'online')
      .length;

    return {
      activeUsers: onlineUsers,
      recentActivities: this.metrics.recentActivities.slice(0, 20),
      topCollaborations: Array.from(this.metrics.projectCollaborations.entries())
        .map(([projectId, users]) => ({ projectId, userCount: users.length }))
        .sort((a, b) => b.userCount - a.userCount)
        .slice(0, 5)
    };
  }

  private broadcastMetricsUpdate() {
    this.io.emit('metrics-update', this.getPublicMetrics());
  }

  // Analytics-specific methods
  async getCollaborationInsights() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get activity counts
    const [dailyActivities, weeklyActivities] = await Promise.all([
      prisma.activity.count({
        where: { createdAt: { gte: oneDayAgo } }
      }),
      prisma.activity.count({
        where: { createdAt: { gte: oneWeekAgo } }
      })
    ]);

    // Get collaboration patterns
    const collaborationPatterns = await prisma.activity.groupBy({
      by: ['projectId', 'userId'],
      where: { createdAt: { gte: oneWeekAgo } },
      _count: true,
      orderBy: { _count: { projectId: 'desc' } },
      take: 10
    });

    return {
      realtime: {
        activeUsers: this.metrics.activeUsers,
        recentActivities: this.metrics.recentActivities.slice(0, 10),
        currentCollaborations: Array.from(this.metrics.projectCollaborations.entries())
      },
      historical: {
        dailyActivities,
        weeklyActivities,
        topCollaborations: collaborationPatterns
      }
    };
  }
}