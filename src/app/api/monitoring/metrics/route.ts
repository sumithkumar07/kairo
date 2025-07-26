import { NextRequest } from 'next/server';
import { APIResponse } from '@/lib/validation';
import { withSecurity, rateLimiters } from '@/lib/security';
import { db } from '@/lib/database-server';

interface PerformanceMetrics {
  // System metrics
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    heapUsedPercentage: number;
  };
  uptime: number;
  cpu: {
    user: number;
    system: number;
  };
  
  // Database metrics
  database: {
    activeConnections: number;
    totalConnections: number;
    waitingConnections: number;
    queryPerformance: {
      averageQueryTime: number;
      slowQueries: number;
    };
  };
  
  // Application metrics
  application: {
    totalUsers: number;
    activeUsers: number;
    totalWorkflows: number;
    dailyExecutions: number;
    errorRate: number;
  };
}

async function getSystemMetrics(): Promise<Partial<PerformanceMetrics>> {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    memory: {
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      rss: memoryUsage.rss,
      heapUsedPercentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
    },
    uptime: process.uptime(),
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    }
  };
}

async function getDatabaseMetrics(): Promise<Partial<PerformanceMetrics>> {
  try {
    const poolStats = db.getPoolStats();
    
    // Get query performance metrics from the last hour
    const queryMetrics = await db.query(`
      SELECT 
        COUNT(*) as total_queries,
        AVG(EXTRACT(EPOCH FROM (created_at - created_at))) as avg_query_time,
        COUNT(CASE WHEN EXTRACT(EPOCH FROM (created_at - created_at)) > 1 THEN 1 END) as slow_queries
      FROM audit_logs 
      WHERE action = 'database_query' 
      AND timestamp > NOW() - INTERVAL '1 hour'
    `);

    return {
      database: {
        activeConnections: poolStats.totalCount - poolStats.idleCount,
        totalConnections: poolStats.totalCount,
        waitingConnections: poolStats.waitingCount,
        queryPerformance: {
          averageQueryTime: queryMetrics[0]?.avg_query_time || 0,
          slowQueries: queryMetrics[0]?.slow_queries || 0
        }
      }
    };
  } catch (error) {
    console.error('[PERFORMANCE] Failed to get database metrics:', error);
    return { database: {} } as any;
  }
}

async function getApplicationMetrics(): Promise<Partial<PerformanceMetrics>> {
  try {
    // Get total users
    const totalUsersResult = await db.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(totalUsersResult[0]?.count || '0');

    // Get active users (logged in within last 24 hours)
    const activeUsersResult = await db.query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM user_sessions 
      WHERE last_accessed > NOW() - INTERVAL '24 hours'
    `);
    const activeUsers = parseInt(activeUsersResult[0]?.count || '0');

    // Get total workflows
    const totalWorkflowsResult = await db.query('SELECT COUNT(*) as count FROM workflows');
    const totalWorkflows = parseInt(totalWorkflowsResult[0]?.count || '0');

    // Get daily executions
    const dailyExecutionsResult = await db.query(`
      SELECT COUNT(*) as count 
      FROM run_history 
      WHERE timestamp > NOW() - INTERVAL '24 hours'
    `);
    const dailyExecutions = parseInt(dailyExecutionsResult[0]?.count || '0');

    // Calculate error rate from the last hour
    const errorRateResult = await db.query(`
      SELECT 
        COUNT(CASE WHEN status = 'error' THEN 1 END) as errors,
        COUNT(*) as total
      FROM run_history 
      WHERE timestamp > NOW() - INTERVAL '1 hour'
    `);
    const errors = parseInt(errorRateResult[0]?.errors || '0');
    const total = parseInt(errorRateResult[0]?.total || '0');
    const errorRate = total > 0 ? (errors / total) * 100 : 0;

    return {
      application: {
        totalUsers,
        activeUsers,
        totalWorkflows,
        dailyExecutions,
        errorRate
      }
    };
  } catch (error) {
    console.error('[PERFORMANCE] Failed to get application metrics:', error);
    return { application: {} } as any;
  }
}

async function handleMetrics(request: NextRequest) {
  try {
    const [systemMetrics, databaseMetrics, applicationMetrics] = await Promise.all([
      getSystemMetrics(),
      getDatabaseMetrics(),
      getApplicationMetrics()
    ]);

    const metrics: PerformanceMetrics = {
      ...systemMetrics,
      ...databaseMetrics,
      ...applicationMetrics
    } as PerformanceMetrics;

    // Store performance snapshot for historical analysis
    try {
      await db.query(`
        INSERT INTO performance_snapshots (
          memory_usage,
          cpu_usage,
          active_connections,
          total_users,
          active_users,
          error_rate,
          timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `, [
        JSON.stringify(metrics.memory),
        JSON.stringify(metrics.cpu),
        metrics.database?.activeConnections || 0,
        metrics.application?.totalUsers || 0,
        metrics.application?.activeUsers || 0,
        metrics.application?.errorRate || 0
      ]);
    } catch (dbError) {
      console.error('[PERFORMANCE] Failed to store performance snapshot:', dbError);
    }

    return APIResponse.success(metrics, 'Performance metrics retrieved successfully');

  } catch (error) {
    console.error('[PERFORMANCE] Failed to get performance metrics:', error);
    
    return APIResponse.error(
      'Failed to retrieve performance metrics',
      'PERFORMANCE_ERROR',
      500
    );
  }
}

// Create performance_snapshots table if it doesn't exist
async function ensurePerformanceTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS performance_snapshots (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        memory_usage JSONB,
        cpu_usage JSONB,
        active_connections INTEGER,
        total_users INTEGER,
        active_users INTEGER,
        error_rate DECIMAL(5,2),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create index for time-based queries
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_performance_snapshots_timestamp 
      ON performance_snapshots(timestamp DESC)
    `);

    // Create a function to clean up old performance data (keep last 30 days)
    await db.query(`
      CREATE OR REPLACE FUNCTION cleanup_old_performance_data()
      RETURNS void AS $$
      BEGIN
        DELETE FROM performance_snapshots 
        WHERE timestamp < NOW() - INTERVAL '30 days';
      END;
      $$ LANGUAGE plpgsql;
    `);

  } catch (error) {
    console.error('[PERFORMANCE] Failed to create performance_snapshots table:', error);
  }
}

// Initialize table on first import
ensurePerformanceTable();

export const GET = withSecurity(handleMetrics, {
  rateLimiter: rateLimiters.general,
  requireAuth: true, // Only authenticated users can access metrics
  allowedMethods: ['GET']
});