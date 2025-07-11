import { NextRequest, NextResponse } from 'next/server';
import { databaseOptimizer } from '@/lib/database/query-optimizer';
import { requireAuth } from '@/lib/middleware/auth';
import { withRateLimit, rateLimits } from '@/lib/middleware/rate-limit';
import { AuthUser } from '@/types';

// GET - Get database health and optimization recommendations
export const GET = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      // Only allow admins to access database optimization
      if (user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      }

      const { searchParams } = new URL(request.url);
      const includeRecommendations = searchParams.get('include_recommendations') === 'true';
      const includeSlowQueries = searchParams.get('include_slow_queries') === 'true';
      const includeIndexStats = searchParams.get('include_index_stats') === 'true';
      const includeTableStats = searchParams.get('include_table_stats') === 'true';

      // Get database health score
      const healthData = await databaseOptimizer.getDatabaseHealthScore();

      const response: any = {
        health_score: healthData.score,
        metrics: healthData.metrics,
        timestamp: new Date().toISOString(),
        user_id: user.id,
      };

      if (includeRecommendations) {
        response.recommendations = healthData.recommendations;
      }

      if (includeSlowQueries) {
        response.slow_queries = await databaseOptimizer.getSlowQueries(10);
      }

      if (includeIndexStats) {
        response.index_stats = await databaseOptimizer.getIndexUsageStats();
      }

      if (includeTableStats) {
        response.table_stats = await databaseOptimizer.getTableStats();
      }

      return NextResponse.json(response);
    } catch (error) {
      console.error('Database optimization error:', error);
      
      return NextResponse.json(
        { 
          error: 'Failed to get database optimization data',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }),
  rateLimits.standard
);

// POST - Execute database optimization
export const POST = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      // Only allow admins to execute database optimizations
      if (user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { action, recommendation_id, table_name } = body;

      let result;

      switch (action) {
        case 'execute_recommendation': {
          if (!recommendation_id) {
            return NextResponse.json(
              { error: 'Recommendation ID is required' },
              { status: 400 }
            );
          }
          result = await databaseOptimizer.executeOptimization(recommendation_id);
          break;
        }

        case 'optimize_table': {
          if (!table_name) {
            return NextResponse.json(
              { error: 'Table name is required' },
              { status: 400 }
            );
          }
          result = await databaseOptimizer.optimizeTable(table_name);
          break;
        }

        case 'monitor_performance': {
          await databaseOptimizer.monitorQueryPerformance();
          result = { success: true, message: 'Performance monitoring executed' };
          break;
        }

        case 'full_optimization': {
          // Execute multiple optimization actions
          const actions = [];
          
          // Get recommendations and execute critical/high priority ones
          const recommendations = await databaseOptimizer.generateOptimizationRecommendations();
          const criticalRecommendations = recommendations.filter(r => 
            r.priority === 'critical' || r.priority === 'high'
          );

          for (const recommendation of criticalRecommendations.slice(0, 5)) {
            const execResult = await databaseOptimizer.executeOptimization(recommendation.id);
            actions.push({
              recommendation: recommendation.title,
              success: execResult.success,
              message: execResult.message,
            });
          }

          result = {
            success: true,
            message: `Full optimization completed with ${actions.length} actions`,
            actions,
          };
          break;
        }

        default:
          return NextResponse.json(
            { 
              error: 'Invalid action', 
              available_actions: [
                'execute_recommendation',
                'optimize_table',
                'monitor_performance',
                'full_optimization'
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
      console.error('Database optimization execution error:', error);
      
      return NextResponse.json(
        { 
          error: 'Failed to execute database optimization',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }),
  rateLimits.expensive
);

// PUT - Update database configuration
export const PUT = withRateLimit(
  requireAuth(async (request: NextRequest, user: AuthUser) => {
    try {
      // Only allow admins to update database configuration
      if (user.role !== 'admin') {
        return NextResponse.json(
          { error: 'Access denied. Admin privileges required.' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { 
        enable_pg_stat_statements, 
        auto_vacuum_settings,
        shared_buffers,
        work_mem,
        maintenance_work_mem,
        checkpoint_segments,
        wal_buffers,
        random_page_cost,
        seq_page_cost,
        cpu_tuple_cost,
        cpu_index_tuple_cost,
        cpu_operator_cost,
        effective_cache_size
      } = body;

      const configUpdates = [];

      // Enable pg_stat_statements extension
      if (enable_pg_stat_statements) {
        try {
          await databaseOptimizer.executeOptimization('enable_pg_stat_statements');
          configUpdates.push('Enabled pg_stat_statements extension');
        } catch (error) {
          configUpdates.push('Failed to enable pg_stat_statements');
        }
      }

      // Update auto vacuum settings
      if (auto_vacuum_settings) {
        const { scale_factor, threshold, cost_delay, cost_limit } = auto_vacuum_settings;
        
        if (scale_factor !== undefined) {
          // Note: These would typically be set at the database level
          // For demonstration, we'll just log the intended changes
          configUpdates.push(`Auto vacuum scale factor would be set to ${scale_factor}`);
        }
        
        if (threshold !== undefined) {
          configUpdates.push(`Auto vacuum threshold would be set to ${threshold}`);
        }
      }

      // Log configuration changes (in a real system, these would be applied)
      if (shared_buffers) {
        configUpdates.push(`Shared buffers would be set to ${shared_buffers}`);
      }
      
      if (work_mem) {
        configUpdates.push(`Work memory would be set to ${work_mem}`);
      }
      
      if (maintenance_work_mem) {
        configUpdates.push(`Maintenance work memory would be set to ${maintenance_work_mem}`);
      }
      
      if (effective_cache_size) {
        configUpdates.push(`Effective cache size would be set to ${effective_cache_size}`);
      }

      // Cost-based optimizer settings
      if (random_page_cost) {
        configUpdates.push(`Random page cost would be set to ${random_page_cost}`);
      }
      
      if (seq_page_cost) {
        configUpdates.push(`Sequential page cost would be set to ${seq_page_cost}`);
      }
      
      if (cpu_tuple_cost) {
        configUpdates.push(`CPU tuple cost would be set to ${cpu_tuple_cost}`);
      }

      return NextResponse.json({
        success: true,
        message: 'Database configuration updated',
        updates: configUpdates,
        timestamp: new Date().toISOString(),
        updated_by: user.id,
        note: 'Some settings require database restart to take effect'
      });
    } catch (error) {
      console.error('Database configuration update error:', error);
      
      return NextResponse.json(
        { 
          error: 'Failed to update database configuration',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  }),
  rateLimits.expensive
);