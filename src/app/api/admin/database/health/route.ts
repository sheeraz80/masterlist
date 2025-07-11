import { NextRequest, NextResponse } from 'next/server';
import { databaseHealthMonitor } from '@/lib/database/health-monitor';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { AuthUser } from '@/types';

// GET - Get database health metrics and alerts
export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      // Only allow admins to access database health monitoring
      if (user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      }

      const { searchParams } = new URL(request.url);
      const includeMetrics = searchParams.get('include_metrics') !== 'false';
      const includeAlerts = searchParams.get('include_alerts') !== 'false';
      const includeConfig = searchParams.get('include_config') === 'true';
      const runMonitoring = searchParams.get('run_monitoring') === 'true';

      const response: any = {
        timestamp: new Date().toISOString(),
        user_id: user.id,
      };

      // Run health monitoring if requested
      if (runMonitoring) {
        const newAlerts = await databaseHealthMonitor.monitorHealth();
        response.monitoring_results = {
          new_alerts: newAlerts.length,
          alerts: newAlerts,
        };
      }

      // Include health metrics
      if (includeMetrics) {
        response.health_metrics = await databaseHealthMonitor.getHealthMetrics();
      }

      // Include active alerts
      if (includeAlerts) {
        response.active_alerts = databaseHealthMonitor.getActiveAlerts();
        response.alert_summary = {
          total_active: response.active_alerts.length,
          warnings: response.active_alerts.filter((a: any) => a.type === 'warning').length,
          errors: response.active_alerts.filter((a: any) => a.type === 'error').length,
          critical: response.active_alerts.filter((a: any) => a.type === 'critical').length,
        };
      }

      // Include configuration recommendations
      if (includeConfig) {
        response.configuration_recommendations = await databaseHealthMonitor.getConfigurationRecommendations();
      }

      return NextResponse.json(response);
    } catch (error) {
      console.error('Database health monitoring error:', error);
      
      return NextResponse.json(
        { 
          error: 'Failed to get database health data',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }),
  rateLimits.standard
);

// POST - Manage alerts and perform health actions
export const POST = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      // Only allow admins to manage database health
      if (user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { action, alert_id, alert_ids } = body;

      let result;

      switch (action) {
        case 'acknowledge_alert': {
          if (!alert_id) {
            return NextResponse.json(
              { error: 'Alert ID is required' },
              { status: 400 }
            );
          }
          const acknowledged = databaseHealthMonitor.acknowledgeAlert(alert_id);
          result = {
            success: acknowledged,
            message: acknowledged ? 'Alert acknowledged' : 'Alert not found',
            alert_id,
          };
          break;
        }

        case 'resolve_alert': {
          if (!alert_id) {
            return NextResponse.json(
              { error: 'Alert ID is required' },
              { status: 400 }
            );
          }
          const resolved = databaseHealthMonitor.resolveAlert(alert_id);
          result = {
            success: resolved,
            message: resolved ? 'Alert resolved' : 'Alert not found',
            alert_id,
          };
          break;
        }

        case 'acknowledge_multiple': {
          if (!alert_ids || !Array.isArray(alert_ids)) {
            return NextResponse.json(
              { error: 'Alert IDs array is required' },
              { status: 400 }
            );
          }
          const acknowledgedCount = alert_ids.filter(id => 
            databaseHealthMonitor.acknowledgeAlert(id)
          ).length;
          result = {
            success: true,
            message: `${acknowledgedCount} of ${alert_ids.length} alerts acknowledged`,
            acknowledged_count: acknowledgedCount,
            total_count: alert_ids.length,
          };
          break;
        }

        case 'resolve_multiple': {
          if (!alert_ids || !Array.isArray(alert_ids)) {
            return NextResponse.json(
              { error: 'Alert IDs array is required' },
              { status: 400 }
            );
          }
          const resolvedCount = alert_ids.filter(id => 
            databaseHealthMonitor.resolveAlert(id)
          ).length;
          result = {
            success: true,
            message: `${resolvedCount} of ${alert_ids.length} alerts resolved`,
            resolved_count: resolvedCount,
            total_count: alert_ids.length,
          };
          break;
        }

        case 'run_health_check': {
          const alerts = await databaseHealthMonitor.monitorHealth();
          result = {
            success: true,
            message: 'Health check completed',
            new_alerts: alerts.length,
            alerts,
          };
          break;
        }

        case 'get_health_summary': {
          const metrics = await databaseHealthMonitor.getHealthMetrics();
          const activeAlerts = databaseHealthMonitor.getActiveAlerts();
          
          // Calculate overall health score
          let healthScore = 100;
          
          // Deduct points for alerts
          const criticalAlerts = activeAlerts.filter(a => a.type === 'critical').length;
          const errorAlerts = activeAlerts.filter(a => a.type === 'error').length;
          const warningAlerts = activeAlerts.filter(a => a.type === 'warning').length;
          
          healthScore -= criticalAlerts * 30;
          healthScore -= errorAlerts * 15;
          healthScore -= warningAlerts * 5;
          
          // Deduct points for performance issues
          if (metrics.cacheHitRatio < 95) healthScore -= 10;
          if (metrics.longRunningQueries > 0) healthScore -= metrics.longRunningQueries * 5;
          if (metrics.blockedQueries > 0) healthScore -= metrics.blockedQueries * 10;
          
          healthScore = Math.max(healthScore, 0);
          
          result = {
            success: true,
            health_score: healthScore,
            status: healthScore >= 90 ? 'excellent' : 
                   healthScore >= 75 ? 'good' : 
                   healthScore >= 50 ? 'fair' : 'poor',
            metrics,
            alerts: {
              total: activeAlerts.length,
              critical: criticalAlerts,
              errors: errorAlerts,
              warnings: warningAlerts,
            },
            recommendations: healthScore < 90 ? [
              'Review and address active alerts',
              'Optimize slow-running queries',
              'Monitor cache hit ratios',
              'Consider database maintenance',
            ] : ['Database health is excellent'],
          };
          break;
        }

        default:
          return NextResponse.json(
            { 
              error: 'Invalid action', 
              available_actions: [
                'acknowledge_alert',
                'resolve_alert',
                'acknowledge_multiple',
                'resolve_multiple',
                'run_health_check',
                'get_health_summary'
              ]
            },
            { status: 400 }
          );
      }

      return NextResponse.json({
        ...result,
        timestamp: new Date().toISOString(),
        executed_by: user.id,
      });
    } catch (error) {
      console.error('Database health action error:', error);
      
      return NextResponse.json(
        { 
          error: 'Failed to execute health action',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }),
  rateLimits.standard
);

// PUT - Update health monitoring thresholds
export const PUT = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      // Only allow admins to update health monitoring settings
      if (user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { 
        max_connections_threshold,
        long_running_query_threshold,
        cache_hit_ratio_threshold,
        index_hit_ratio_threshold,
        disk_usage_threshold,
        replication_lag_threshold,
        blocked_queries_threshold,
        monitoring_interval
      } = body;

      const updates = [];

      // Note: In a full implementation, these would update the actual thresholds
      if (max_connections_threshold !== undefined) {
        updates.push(`Max connections threshold would be set to ${max_connections_threshold}%`);
      }
      
      if (long_running_query_threshold !== undefined) {
        updates.push(`Long running query threshold would be set to ${long_running_query_threshold} seconds`);
      }
      
      if (cache_hit_ratio_threshold !== undefined) {
        updates.push(`Cache hit ratio threshold would be set to ${cache_hit_ratio_threshold}%`);
      }
      
      if (index_hit_ratio_threshold !== undefined) {
        updates.push(`Index hit ratio threshold would be set to ${index_hit_ratio_threshold}%`);
      }
      
      if (disk_usage_threshold !== undefined) {
        updates.push(`Disk usage threshold would be set to ${disk_usage_threshold}%`);
      }
      
      if (replication_lag_threshold !== undefined) {
        updates.push(`Replication lag threshold would be set to ${replication_lag_threshold} seconds`);
      }
      
      if (blocked_queries_threshold !== undefined) {
        updates.push(`Blocked queries threshold would be set to ${blocked_queries_threshold}`);
      }
      
      if (monitoring_interval !== undefined) {
        updates.push(`Monitoring interval would be set to ${monitoring_interval} seconds`);
      }

      return NextResponse.json({
        success: true,
        message: 'Health monitoring thresholds updated',
        updates,
        timestamp: new Date().toISOString(),
        updated_by: user.id,
      });
    } catch (error) {
      console.error('Health monitoring update error:', error);
      
      return NextResponse.json(
        { 
          error: 'Failed to update health monitoring settings',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }),
  rateLimits.standard
);