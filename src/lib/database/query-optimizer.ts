import { prisma } from '@/lib/prisma';
import { logPerformanceMetric, logError } from '@/lib/logger';

export interface QueryPerformanceMetrics {
  query: string;
  avgExecutionTime: number;
  totalExecutions: number;
  totalExecutionTime: number;
  avgRows: number;
  lastExecuted: Date;
}

export interface IndexUsageStats {
  schemaName: string;
  tableName: string;
  indexName: string;
  totalReads: number;
  totalScans: number;
  userSeeks: number;
  userScans: number;
  userLookups: number;
  userUpdates: number;
  lastUserSeek: Date | null;
  lastUserScan: Date | null;
  lastUserLookup: Date | null;
  lastUserUpdate: Date | null;
}

export interface TableStats {
  schemaName: string;
  tableName: string;
  rowCount: number;
  totalSize: string;
  indexSize: string;
  tableSize: string;
  avgRowSize: number;
  deadTuples: number;
  liveTuples: number;
  lastVacuum: Date | null;
  lastAnalyze: Date | null;
}

export interface DatabaseOptimizationRecommendation {
  id: string;
  type: 'index' | 'query' | 'maintenance' | 'configuration';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  sqlScript?: string;
  metadata: Record<string, any>;
  estimatedImprovement: string;
}

export class DatabaseQueryOptimizer {
  private readonly performanceThreshold = 1000; // 1 second
  private readonly lowUsageThreshold = 100;
  private readonly highDeadTupleRatio = 0.1;

  // Get slow query performance metrics
  async getSlowQueries(limit: number = 20): Promise<QueryPerformanceMetrics[]> {
    try {
      const slowQueries = await prisma.$queryRaw<any[]>`
        SELECT 
          query,
          mean_exec_time as "avgExecutionTime",
          calls as "totalExecutions",
          total_exec_time as "totalExecutionTime",
          mean_rows as "avgRows",
          last_exec as "lastExecuted"
        FROM pg_stat_statements 
        WHERE mean_exec_time > ${this.performanceThreshold}
        ORDER BY mean_exec_time DESC 
        LIMIT ${limit}
      `;

      return slowQueries.map(row => ({
        query: row.query,
        avgExecutionTime: parseFloat(row.avgExecutionTime),
        totalExecutions: parseInt(row.totalExecutions),
        totalExecutionTime: parseFloat(row.totalExecutionTime),
        avgRows: parseFloat(row.avgRows || '0'),
        lastExecuted: new Date(row.lastExecuted),
      }));
    } catch (error) {
      logError('Failed to get slow queries', error);
      return [];
    }
  }

  // Get index usage statistics
  async getIndexUsageStats(): Promise<IndexUsageStats[]> {
    try {
      const indexStats = await prisma.$queryRaw<any[]>`
        SELECT 
          schemaname as "schemaName",
          tablename as "tableName",
          indexname as "indexName",
          idx_tup_read as "totalReads",
          idx_tup_fetch as "totalScans",
          idx_scan as "userSeeks",
          idx_tup_read as "userScans",
          idx_tup_fetch as "userLookups",
          0 as "userUpdates",
          NULL as "lastUserSeek",
          NULL as "lastUserScan", 
          NULL as "lastUserLookup",
          NULL as "lastUserUpdate"
        FROM pg_stat_user_indexes
        ORDER BY idx_tup_read DESC
      `;

      return indexStats.map(row => ({
        schemaName: row.schemaName,
        tableName: row.tableName,
        indexName: row.indexName,
        totalReads: parseInt(row.totalReads || '0'),
        totalScans: parseInt(row.totalScans || '0'),
        userSeeks: parseInt(row.userSeeks || '0'),
        userScans: parseInt(row.userScans || '0'),
        userLookups: parseInt(row.userLookups || '0'),
        userUpdates: parseInt(row.userUpdates || '0'),
        lastUserSeek: row.lastUserSeek ? new Date(row.lastUserSeek) : null,
        lastUserScan: row.lastUserScan ? new Date(row.lastUserScan) : null,
        lastUserLookup: row.lastUserLookup ? new Date(row.lastUserLookup) : null,
        lastUserUpdate: row.lastUserUpdate ? new Date(row.lastUserUpdate) : null,
      }));
    } catch (error) {
      logError('Failed to get index usage stats', error);
      return [];
    }
  }

  // Get table statistics
  async getTableStats(): Promise<TableStats[]> {
    try {
      const tableStats = await prisma.$queryRaw<any[]>`
        SELECT 
          schemaname as "schemaName",
          tablename as "tableName",
          n_tup_ins + n_tup_upd + n_tup_del as "rowCount",
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as "totalSize",
          pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as "indexSize",
          pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as "tableSize",
          CASE 
            WHEN n_live_tup > 0 THEN pg_relation_size(schemaname||'.'||tablename) / n_live_tup
            ELSE 0
          END as "avgRowSize",
          n_dead_tup as "deadTuples",
          n_live_tup as "liveTuples",
          last_vacuum as "lastVacuum",
          last_analyze as "lastAnalyze"
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `;

      return tableStats.map(row => ({
        schemaName: row.schemaName,
        tableName: row.tableName,
        rowCount: parseInt(row.rowCount || '0'),
        totalSize: row.totalSize,
        indexSize: row.indexSize,
        tableSize: row.tableSize,
        avgRowSize: parseFloat(row.avgRowSize || '0'),
        deadTuples: parseInt(row.deadTuples || '0'),
        liveTuples: parseInt(row.liveTuples || '0'),
        lastVacuum: row.lastVacuum ? new Date(row.lastVacuum) : null,
        lastAnalyze: row.lastAnalyze ? new Date(row.lastAnalyze) : null,
      }));
    } catch (error) {
      logError('Failed to get table stats', error);
      return [];
    }
  }

  // Generate optimization recommendations
  async generateOptimizationRecommendations(): Promise<DatabaseOptimizationRecommendation[]> {
    const recommendations: DatabaseOptimizationRecommendation[] = [];

    try {
      // Get performance data
      const [slowQueries, indexStats, tableStats] = await Promise.all([
        this.getSlowQueries(10),
        this.getIndexUsageStats(),
        this.getTableStats(),
      ]);

      // Analyze slow queries
      slowQueries.forEach((query, index) => {
        if (query.avgExecutionTime > this.performanceThreshold * 2) {
          recommendations.push({
            id: `slow_query_${index}`,
            type: 'query',
            priority: 'high',
            title: `Slow Query Optimization`,
            description: `Query with ${query.avgExecutionTime.toFixed(0)}ms average execution time needs optimization`,
            impact: `Executed ${query.totalExecutions} times with total time ${(query.totalExecutionTime / 1000).toFixed(1)}s`,
            effort: 'medium',
            sqlScript: `-- Analyze query plan\nEXPLAIN ANALYZE ${query.query.substring(0, 100)}...`,
            metadata: {
              avgExecutionTime: query.avgExecutionTime,
              totalExecutions: query.totalExecutions,
              query: query.query.substring(0, 200),
            },
            estimatedImprovement: `${Math.round((query.avgExecutionTime / this.performanceThreshold - 1) * 100)}% faster execution`,
          });
        }
      });

      // Analyze unused indexes
      const unusedIndexes = indexStats.filter(idx => 
        idx.totalReads < this.lowUsageThreshold && 
        idx.indexName !== 'PRIMARY' && 
        !idx.indexName.includes('_pkey')
      );

      unusedIndexes.forEach(idx => {
        recommendations.push({
          id: `unused_index_${idx.indexName}`,
          type: 'index',
          priority: 'low',
          title: `Consider Removing Unused Index`,
          description: `Index "${idx.indexName}" on table "${idx.tableName}" has low usage (${idx.totalReads} reads)`,
          impact: `Removing unused indexes can improve write performance and reduce storage`,
          effort: 'low',
          sqlScript: `-- Remove unused index\nDROP INDEX IF EXISTS "${idx.indexName}";`,
          metadata: {
            tableName: idx.tableName,
            indexName: idx.indexName,
            totalReads: idx.totalReads,
          },
          estimatedImprovement: '5-10% faster write operations',
        });
      });

      // Analyze table maintenance needs
      tableStats.forEach(table => {
        const deadTupleRatio = table.deadTuples / (table.liveTuples + table.deadTuples);
        
        if (deadTupleRatio > this.highDeadTupleRatio) {
          recommendations.push({
            id: `vacuum_${table.tableName}`,
            type: 'maintenance',
            priority: 'medium',
            title: `Table Needs Vacuuming`,
            description: `Table "${table.tableName}" has ${(deadTupleRatio * 100).toFixed(1)}% dead tuples`,
            impact: `High dead tuple ratio can slow down queries and increase storage usage`,
            effort: 'low',
            sqlScript: `-- Vacuum table\nVACUUM ANALYZE "${table.tableName}";`,
            metadata: {
              tableName: table.tableName,
              deadTuples: table.deadTuples,
              liveTuples: table.liveTuples,
              deadTupleRatio: deadTupleRatio,
            },
            estimatedImprovement: `${Math.round(deadTupleRatio * 20)}% query performance improvement`,
          });
        }

        // Check for tables that haven't been analyzed recently
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (!table.lastAnalyze || table.lastAnalyze < weekAgo) {
          recommendations.push({
            id: `analyze_${table.tableName}`,
            type: 'maintenance',
            priority: 'medium',
            title: `Table Statistics Need Updating`,
            description: `Table "${table.tableName}" statistics are outdated (last analyzed: ${table.lastAnalyze?.toDateString() || 'never'})`,
            impact: `Outdated statistics can lead to poor query execution plans`,
            effort: 'low',
            sqlScript: `-- Update table statistics\nANALYZE "${table.tableName}";`,
            metadata: {
              tableName: table.tableName,
              lastAnalyze: table.lastAnalyze,
              rowCount: table.rowCount,
            },
            estimatedImprovement: '10-15% better query planning',
          });
        }
      });

      // Add general recommendations
      recommendations.push({
        id: 'enable_pg_stat_statements',
        type: 'configuration',
        priority: 'medium',
        title: 'Enable Query Performance Monitoring',
        description: 'Enable pg_stat_statements extension for better query performance monitoring',
        impact: 'Provides detailed query performance metrics for optimization',
        effort: 'low',
        sqlScript: `-- Enable pg_stat_statements\nCREATE EXTENSION IF NOT EXISTS pg_stat_statements;\nSELECT pg_stat_statements_reset();`,
        metadata: {
          extension: 'pg_stat_statements',
        },
        estimatedImprovement: 'Better monitoring and optimization capabilities',
      });

      // Sort recommendations by priority
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

      return recommendations;
    } catch (error) {
      logError('Failed to generate optimization recommendations', error);
      return [];
    }
  }

  // Execute optimization recommendations
  async executeOptimization(recommendationId: string): Promise<{ success: boolean; message: string }> {
    try {
      const recommendations = await this.generateOptimizationRecommendations();
      const recommendation = recommendations.find(r => r.id === recommendationId);

      if (!recommendation) {
        return { success: false, message: 'Recommendation not found' };
      }

      if (!recommendation.sqlScript) {
        return { success: false, message: 'No SQL script available for this recommendation' };
      }

      // Execute the SQL script
      await prisma.$executeRawUnsafe(recommendation.sqlScript);

      logPerformanceMetric('database_optimization_executed', 0, {
        recommendationId,
        type: recommendation.type,
        priority: recommendation.priority,
      });

      return { success: true, message: `Optimization "${recommendation.title}" executed successfully` };
    } catch (error) {
      logError('Failed to execute optimization', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get database health score
  async getDatabaseHealthScore(): Promise<{
    score: number;
    metrics: Record<string, any>;
    recommendations: DatabaseOptimizationRecommendation[];
  }> {
    try {
      const [slowQueries, indexStats, tableStats, recommendations] = await Promise.all([
        this.getSlowQueries(5),
        this.getIndexUsageStats(),
        this.getTableStats(),
        this.generateOptimizationRecommendations(),
      ]);

      // Calculate health score (0-100)
      let score = 100;

      // Deduct points for slow queries
      const slowQueryPenalty = Math.min(slowQueries.length * 10, 30);
      score -= slowQueryPenalty;

      // Deduct points for unused indexes
      const unusedIndexes = indexStats.filter(idx => 
        idx.totalReads < this.lowUsageThreshold && 
        !idx.indexName.includes('_pkey')
      ).length;
      const unusedIndexPenalty = Math.min(unusedIndexes * 5, 20);
      score -= unusedIndexPenalty;

      // Deduct points for maintenance issues
      const maintenanceIssues = tableStats.filter(table => {
        const deadTupleRatio = table.deadTuples / (table.liveTuples + table.deadTuples);
        return deadTupleRatio > this.highDeadTupleRatio;
      }).length;
      const maintenancePenalty = Math.min(maintenanceIssues * 8, 25);
      score -= maintenancePenalty;

      // Deduct points for outdated statistics
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const outdatedStats = tableStats.filter(table => 
        !table.lastAnalyze || table.lastAnalyze < weekAgo
      ).length;
      const outdatedStatsPenalty = Math.min(outdatedStats * 3, 15);
      score -= outdatedStatsPenalty;

      score = Math.max(score, 0);

      const metrics = {
        slowQueries: slowQueries.length,
        slowQueryPenalty,
        unusedIndexes,
        unusedIndexPenalty,
        maintenanceIssues,
        maintenancePenalty,
        outdatedStats,
        outdatedStatsPenalty,
        totalTables: tableStats.length,
        totalIndexes: indexStats.length,
        avgQueryTime: slowQueries.length > 0 
          ? slowQueries.reduce((sum, q) => sum + q.avgExecutionTime, 0) / slowQueries.length 
          : 0,
        healthScore: score,
      };

      return {
        score,
        metrics,
        recommendations: recommendations.slice(0, 10), // Top 10 recommendations
      };
    } catch (error) {
      logError('Failed to calculate database health score', error);
      return {
        score: 50,
        metrics: { error: 'Failed to calculate metrics' },
        recommendations: [],
      };
    }
  }

  // Monitor query performance in real-time
  async monitorQueryPerformance(): Promise<void> {
    try {
      const slowQueries = await this.getSlowQueries(5);
      
      slowQueries.forEach(query => {
        logPerformanceMetric('slow_query_detected', query.avgExecutionTime, {
          query: query.query.substring(0, 200),
          executions: query.totalExecutions,
          avgRows: query.avgRows,
        });
      });

      // Check for blocking queries
      const blockingQueries = await prisma.$queryRaw<any[]>`
        SELECT 
          blocked_locks.pid AS blocked_pid,
          blocked_activity.usename AS blocked_user,
          blocking_locks.pid AS blocking_pid,
          blocking_activity.usename AS blocking_user,
          blocked_activity.query AS blocked_statement,
          blocking_activity.query AS blocking_statement,
          blocked_activity.application_name AS blocked_application,
          blocking_activity.application_name AS blocking_application,
          blocked_activity.client_addr AS blocked_client_addr,
          blocking_activity.client_addr AS blocking_client_addr,
          blocked_activity.client_hostname AS blocked_client_hostname,
          blocking_activity.client_hostname AS blocking_client_hostname,
          blocked_activity.client_port AS blocked_client_port,
          blocking_activity.client_port AS blocking_client_port,
          (EXTRACT(EPOCH FROM clock_timestamp()) - EXTRACT(EPOCH FROM blocked_activity.query_start)) AS blocked_duration
        FROM pg_catalog.pg_locks blocked_locks
        JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
        JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
          AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
          AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
          AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
          AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
          AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
          AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
          AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
          AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
          AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
          AND blocking_locks.pid != blocked_locks.pid
        JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
        WHERE NOT blocked_locks.granted
        ORDER BY blocked_duration DESC
      `;

      if (blockingQueries.length > 0) {
        logPerformanceMetric('blocking_queries_detected', blockingQueries.length, {
          blockingQueries: blockingQueries.map(q => ({
            blockedPid: q.blocked_pid,
            blockingPid: q.blocking_pid,
            blockedDuration: q.blocked_duration,
            blockedQuery: q.blocked_statement?.substring(0, 100),
          })),
        });
      }

    } catch (error) {
      logError('Failed to monitor query performance', error);
    }
  }

  // Optimize specific table
  async optimizeTable(tableName: string): Promise<{ success: boolean; message: string; actions: string[] }> {
    const actions: string[] = [];

    try {
      // Vacuum and analyze the table
      await prisma.$executeRawUnsafe(`VACUUM ANALYZE "${tableName}"`);
      actions.push(`Vacuumed and analyzed table "${tableName}"`);

      // Reindex the table
      await prisma.$executeRawUnsafe(`REINDEX TABLE "${tableName}"`);
      actions.push(`Reindexed table "${tableName}"`);

      // Update table statistics
      await prisma.$executeRawUnsafe(`ANALYZE "${tableName}"`);
      actions.push(`Updated statistics for table "${tableName}"`);

      logPerformanceMetric('table_optimized', 0, {
        tableName,
        actions,
      });

      return {
        success: true,
        message: `Table "${tableName}" optimized successfully`,
        actions,
      };
    } catch (error) {
      logError('Failed to optimize table', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        actions,
      };
    }
  }
}

// Export singleton instance
export const databaseOptimizer = new DatabaseQueryOptimizer();