import { prisma } from '@/lib/prisma';
import { databaseOptimizer } from './query-optimizer';
import { logPerformanceMetric, logError, logInfo } from '@/lib/logger';

export interface DatabaseHealthMetrics {
  connectionCount: number;
  activeConnections: number;
  idleConnections: number;
  longRunningQueries: number;
  blockedQueries: number;
  cacheHitRatio: number;
  indexHitRatio: number;
  diskUsage: {
    total: string;
    used: string;
    free: string;
    percentage: number;
  };
  memoryUsage: {
    sharedBuffers: string;
    effectiveCache: string;
    workMem: string;
  };
  replicationLag: number;
  checkpointStats: {
    timedCheckpoints: number;
    requestedCheckpoints: number;
    buffersSyncTime: number;
    buffersCheckpoint: number;
  };
}

export interface DatabaseAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

export class DatabaseHealthMonitor {
  private alerts: DatabaseAlert[] = [];
  private readonly thresholds = {
    maxConnections: 80, // percentage of max_connections
    longRunningQueryTime: 300000, // 5 minutes in milliseconds
    cacheHitRatio: 95, // percentage
    indexHitRatio: 95, // percentage
    diskUsage: 85, // percentage
    replicationLag: 30, // seconds
    blockedQueries: 5, // count
  };

  // Get comprehensive database health metrics
  async getHealthMetrics(): Promise<DatabaseHealthMetrics> {
    try {
      const [
        connectionStats,
        queryStats,
        cacheStats,
        diskStats,
        memoryStats,
        replicationStats,
        checkpointStats,
      ] = await Promise.all([
        this.getConnectionStats(),
        this.getQueryStats(),
        this.getCacheStats(),
        this.getDiskStats(),
        this.getMemoryStats(),
        this.getReplicationStats(),
        this.getCheckpointStats(),
      ]);

      return {
        connectionCount: connectionStats.total,
        activeConnections: connectionStats.active,
        idleConnections: connectionStats.idle,
        longRunningQueries: queryStats.longRunning,
        blockedQueries: queryStats.blocked,
        cacheHitRatio: cacheStats.hitRatio,
        indexHitRatio: cacheStats.indexHitRatio,
        diskUsage: diskStats,
        memoryUsage: memoryStats,
        replicationLag: replicationStats.lag,
        checkpointStats,
      };
    } catch (error) {
      logError('Failed to get database health metrics', error);
      throw error;
    }
  }

  // Monitor database health and generate alerts
  async monitorHealth(): Promise<DatabaseAlert[]> {
    try {
      const metrics = await this.getHealthMetrics();
      const newAlerts: DatabaseAlert[] = [];

      // Check connection count
      if (metrics.connectionCount > this.thresholds.maxConnections) {
        newAlerts.push(this.createAlert(
          'connection_count',
          'warning',
          'High Connection Count',
          `Database has ${metrics.connectionCount} active connections (${metrics.activeConnections} active, ${metrics.idleConnections} idle)`,
          'connectionCount',
          this.thresholds.maxConnections,
          metrics.connectionCount
        ));
      }

      // Check long running queries
      if (metrics.longRunningQueries > 0) {
        const severity = metrics.longRunningQueries > 5 ? 'error' : 'warning';
        newAlerts.push(this.createAlert(
          'long_running_queries',
          severity,
          'Long Running Queries Detected',
          `Found ${metrics.longRunningQueries} queries running longer than ${this.thresholds.longRunningQueryTime / 1000} seconds`,
          'longRunningQueries',
          0,
          metrics.longRunningQueries
        ));
      }

      // Check blocked queries
      if (metrics.blockedQueries > this.thresholds.blockedQueries) {
        newAlerts.push(this.createAlert(
          'blocked_queries',
          'error',
          'Blocked Queries Detected',
          `Found ${metrics.blockedQueries} blocked queries. This may indicate lock contention.`,
          'blockedQueries',
          this.thresholds.blockedQueries,
          metrics.blockedQueries
        ));
      }

      // Check cache hit ratio
      if (metrics.cacheHitRatio < this.thresholds.cacheHitRatio) {
        newAlerts.push(this.createAlert(
          'cache_hit_ratio',
          'warning',
          'Low Cache Hit Ratio',
          `Buffer cache hit ratio is ${metrics.cacheHitRatio.toFixed(2)}%. Consider increasing shared_buffers.`,
          'cacheHitRatio',
          this.thresholds.cacheHitRatio,
          metrics.cacheHitRatio
        ));
      }

      // Check index hit ratio
      if (metrics.indexHitRatio < this.thresholds.indexHitRatio) {
        newAlerts.push(this.createAlert(
          'index_hit_ratio',
          'warning',
          'Low Index Hit Ratio',
          `Index hit ratio is ${metrics.indexHitRatio.toFixed(2)}%. Indexes may not be cached effectively.`,
          'indexHitRatio',
          this.thresholds.indexHitRatio,
          metrics.indexHitRatio
        ));
      }

      // Check disk usage
      if (metrics.diskUsage.percentage > this.thresholds.diskUsage) {
        const severity = metrics.diskUsage.percentage > 90 ? 'critical' : 'warning';
        newAlerts.push(this.createAlert(
          'disk_usage',
          severity,
          'High Disk Usage',
          `Database disk usage is ${metrics.diskUsage.percentage.toFixed(1)}% (${metrics.diskUsage.used}/${metrics.diskUsage.total})`,
          'diskUsage',
          this.thresholds.diskUsage,
          metrics.diskUsage.percentage
        ));
      }

      // Check replication lag
      if (metrics.replicationLag > this.thresholds.replicationLag) {
        const severity = metrics.replicationLag > 60 ? 'error' : 'warning';
        newAlerts.push(this.createAlert(
          'replication_lag',
          severity,
          'High Replication Lag',
          `Replication lag is ${metrics.replicationLag} seconds`,
          'replicationLag',
          this.thresholds.replicationLag,
          metrics.replicationLag
        ));
      }

      // Store new alerts
      this.alerts.push(...newAlerts);

      // Log health metrics
      logPerformanceMetric('database_health_check', 0, {
        connectionCount: metrics.connectionCount,
        activeConnections: metrics.activeConnections,
        longRunningQueries: metrics.longRunningQueries,
        blockedQueries: metrics.blockedQueries,
        cacheHitRatio: metrics.cacheHitRatio,
        indexHitRatio: metrics.indexHitRatio,
        diskUsagePercentage: metrics.diskUsage.percentage,
        replicationLag: metrics.replicationLag,
        alertCount: newAlerts.length,
      });

      return newAlerts;
    } catch (error) {
      logError('Failed to monitor database health', error);
      return [];
    }
  }

  // Get active alerts
  getActiveAlerts(): DatabaseAlert[] {
    return this.alerts.filter(alert => !alert.acknowledged && !alert.resolvedAt);
  }

  // Acknowledge an alert
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  // Resolve an alert
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolvedAt = new Date();
      return true;
    }
    return false;
  }

  // Get database configuration recommendations
  async getConfigurationRecommendations(): Promise<Array<{
    setting: string;
    currentValue: string;
    recommendedValue: string;
    reason: string;
    impact: string;
  }>> {
    try {
      const recommendations = [];
      const metrics = await this.getHealthMetrics();

      // Analyze current configuration
      const currentConfig = await this.getCurrentConfiguration();

      // Shared buffers recommendation
      if (metrics.cacheHitRatio < 95) {
        recommendations.push({
          setting: 'shared_buffers',
          currentValue: currentConfig.shared_buffers || 'unknown',
          recommendedValue: '256MB - 1GB (25% of RAM)',
          reason: `Current cache hit ratio is ${metrics.cacheHitRatio.toFixed(2)}%`,
          impact: 'Improve query performance by reducing disk I/O',
        });
      }

      // Work memory recommendation
      if (metrics.longRunningQueries > 2) {
        recommendations.push({
          setting: 'work_mem',
          currentValue: currentConfig.work_mem || 'unknown',
          recommendedValue: '16MB - 64MB per connection',
          reason: `${metrics.longRunningQueries} long-running queries detected`,
          impact: 'Improve sorting and hash operations performance',
        });
      }

      // Maintenance work memory
      recommendations.push({
        setting: 'maintenance_work_mem',
        currentValue: currentConfig.maintenance_work_mem || 'unknown',
        recommendedValue: '512MB - 2GB',
        reason: 'Optimize VACUUM, CREATE INDEX, and other maintenance operations',
        impact: 'Faster maintenance operations and better table statistics',
      });

      // Effective cache size
      recommendations.push({
        setting: 'effective_cache_size',
        currentValue: currentConfig.effective_cache_size || 'unknown',
        recommendedValue: '50-75% of available RAM',
        reason: 'Help query planner make better decisions',
        impact: 'Better query execution plans and performance',
      });

      // Random page cost
      if (currentConfig.random_page_cost === '4.0') {
        recommendations.push({
          setting: 'random_page_cost',
          currentValue: '4.0',
          recommendedValue: '1.1 - 1.5 (for SSD)',
          reason: 'Default value is optimized for traditional hard drives',
          impact: 'Better cost estimation for SSD storage',
        });
      }

      // Checkpoint settings
      if (metrics.checkpointStats.requestedCheckpoints > metrics.checkpointStats.timedCheckpoints) {
        recommendations.push({
          setting: 'checkpoint_completion_target',
          currentValue: currentConfig.checkpoint_completion_target || 'unknown',
          recommendedValue: '0.9',
          reason: 'Too many requested checkpoints detected',
          impact: 'Reduce I/O spikes during checkpoints',
        });
      }

      return recommendations;
    } catch (error) {
      logError('Failed to get configuration recommendations', error);
      return [];
    }
  }

  // Private helper methods
  private async getConnectionStats(): Promise<{
    total: number;
    active: number;
    idle: number;
    idleInTransaction: number;
  }> {
    try {
      const stats = await prisma.$queryRaw<any[]>`
        SELECT 
          state,
          COUNT(*) as count
        FROM pg_stat_activity 
        WHERE pid != pg_backend_pid()
        GROUP BY state
      `;

      const result = {
        total: 0,
        active: 0,
        idle: 0,
        idleInTransaction: 0,
      };

      stats.forEach(stat => {
        const count = parseInt(stat.count);
        result.total += count;
        
        switch (stat.state) {
          case 'active':
            result.active += count;
            break;
          case 'idle':
            result.idle += count;
            break;
          case 'idle in transaction':
            result.idleInTransaction += count;
            break;
        }
      });

      return result;
    } catch (error) {
      logError('Failed to get connection stats', error);
      return { total: 0, active: 0, idle: 0, idleInTransaction: 0 };
    }
  }

  private async getQueryStats(): Promise<{
    longRunning: number;
    blocked: number;
    total: number;
  }> {
    try {
      const [longRunning, blocked] = await Promise.all([
        prisma.$queryRaw<any[]>`
          SELECT COUNT(*) as count
          FROM pg_stat_activity
          WHERE state = 'active'
            AND query_start < NOW() - INTERVAL '${this.thresholds.longRunningQueryTime} milliseconds'
            AND pid != pg_backend_pid()
        `,
        prisma.$queryRaw<any[]>`
          SELECT COUNT(*) as count
          FROM pg_stat_activity
          WHERE wait_event_type = 'Lock'
            AND pid != pg_backend_pid()
        `,
      ]);

      return {
        longRunning: parseInt(longRunning[0]?.count || '0'),
        blocked: parseInt(blocked[0]?.count || '0'),
        total: 0,
      };
    } catch (error) {
      logError('Failed to get query stats', error);
      return { longRunning: 0, blocked: 0, total: 0 };
    }
  }

  private async getCacheStats(): Promise<{
    hitRatio: number;
    indexHitRatio: number;
  }> {
    try {
      const [bufferStats, indexStats] = await Promise.all([
        prisma.$queryRaw<any[]>`
          SELECT 
            ROUND(100.0 * blks_hit / (blks_hit + blks_read), 2) as hit_ratio
          FROM pg_stat_database
          WHERE datname = current_database()
        `,
        prisma.$queryRaw<any[]>`
          SELECT 
            ROUND(100.0 * idx_blks_hit / (idx_blks_hit + idx_blks_read), 2) as index_hit_ratio
          FROM pg_statio_user_indexes
          WHERE idx_blks_hit + idx_blks_read > 0
        `,
      ]);

      return {
        hitRatio: parseFloat(bufferStats[0]?.hit_ratio || '0'),
        indexHitRatio: parseFloat(indexStats[0]?.index_hit_ratio || '0'),
      };
    } catch (error) {
      logError('Failed to get cache stats', error);
      return { hitRatio: 0, indexHitRatio: 0 };
    }
  }

  private async getDiskStats(): Promise<{
    total: string;
    used: string;
    free: string;
    percentage: number;
  }> {
    try {
      const stats = await prisma.$queryRaw<any[]>`
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as total_size,
          pg_size_pretty(pg_database_size(current_database())) as used_size,
          '0 MB' as free_size,
          0 as percentage
      `;

      // Note: This is a simplified implementation
      // In a real system, you'd query actual disk usage
      return {
        total: stats[0]?.total_size || '0 MB',
        used: stats[0]?.used_size || '0 MB',
        free: stats[0]?.free_size || '0 MB',
        percentage: parseFloat(stats[0]?.percentage || '0'),
      };
    } catch (error) {
      logError('Failed to get disk stats', error);
      return {
        total: '0 MB',
        used: '0 MB',
        free: '0 MB',
        percentage: 0,
      };
    }
  }

  private async getMemoryStats(): Promise<{
    sharedBuffers: string;
    effectiveCache: string;
    workMem: string;
  }> {
    try {
      const config = await this.getCurrentConfiguration();
      return {
        sharedBuffers: config.shared_buffers || 'unknown',
        effectiveCache: config.effective_cache_size || 'unknown',
        workMem: config.work_mem || 'unknown',
      };
    } catch (error) {
      logError('Failed to get memory stats', error);
      return {
        sharedBuffers: 'unknown',
        effectiveCache: 'unknown',
        workMem: 'unknown',
      };
    }
  }

  private async getReplicationStats(): Promise<{
    lag: number;
    status: string;
  }> {
    try {
      const replicationData = await prisma.$queryRaw<any[]>`
        SELECT 
          CASE 
            WHEN pg_is_in_recovery() THEN 
              EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))
            ELSE 0
          END as lag_seconds,
          CASE 
            WHEN pg_is_in_recovery() THEN 'replica'
            ELSE 'primary'
          END as status
      `;

      return {
        lag: parseFloat(replicationData[0]?.lag_seconds || '0'),
        status: replicationData[0]?.status || 'primary',
      };
    } catch (error) {
      logError('Failed to get replication stats', error);
      return { lag: 0, status: 'unknown' };
    }
  }

  private async getCheckpointStats(): Promise<{
    timedCheckpoints: number;
    requestedCheckpoints: number;
    buffersSyncTime: number;
    buffersCheckpoint: number;
  }> {
    try {
      const stats = await prisma.$queryRaw<any[]>`
        SELECT 
          checkpoints_timed,
          checkpoints_req,
          buffers_checkpoint,
          checkpoint_sync_time
        FROM pg_stat_bgwriter
      `;

      const stat = stats[0] || {};
      return {
        timedCheckpoints: parseInt(stat.checkpoints_timed || '0'),
        requestedCheckpoints: parseInt(stat.checkpoints_req || '0'),
        buffersCheckpoint: parseInt(stat.buffers_checkpoint || '0'),
        buffersSyncTime: parseFloat(stat.checkpoint_sync_time || '0'),
      };
    } catch (error) {
      logError('Failed to get checkpoint stats', error);
      return {
        timedCheckpoints: 0,
        requestedCheckpoints: 0,
        buffersCheckpoint: 0,
        buffersSyncTime: 0,
      };
    }
  }

  private async getCurrentConfiguration(): Promise<Record<string, string>> {
    try {
      const config = await prisma.$queryRaw<any[]>`
        SELECT name, setting, unit
        FROM pg_settings
        WHERE name IN (
          'shared_buffers', 'work_mem', 'maintenance_work_mem', 
          'effective_cache_size', 'random_page_cost', 'seq_page_cost',
          'checkpoint_completion_target', 'max_connections', 'wal_buffers'
        )
      `;

      const result: Record<string, string> = {};
      config.forEach(item => {
        result[item.name] = item.setting + (item.unit || '');
      });

      return result;
    } catch (error) {
      logError('Failed to get current configuration', error);
      return {};
    }
  }

  private createAlert(
    id: string,
    type: 'warning' | 'error' | 'critical',
    title: string,
    message: string,
    metric: string,
    threshold: number,
    currentValue: number
  ): DatabaseAlert {
    return {
      id: `${id}_${Date.now()}`,
      type,
      title,
      message,
      metric,
      threshold,
      currentValue,
      timestamp: new Date(),
      acknowledged: false,
    };
  }
}

// Export singleton instance
export const databaseHealthMonitor = new DatabaseHealthMonitor();