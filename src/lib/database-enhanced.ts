import { Database, db } from './database';
import { databaseCache, AdvancedCache } from './advanced-cache';
import { performanceMonitor } from './performance-monitor';

export interface QueryOptions {
  cache?: boolean;
  cacheTTL?: number;
  timeout?: number;
  retries?: number;
}

export class EnhancedDatabase extends Database {
  private queryCache: AdvancedCache<any>;
  private connectionPool: any;
  private queryStats = new Map<string, {
    count: number;
    totalTime: number;
    avgTime: number;
    errors: number;
  }>();

  constructor() {
    super();
    this.queryCache = new AdvancedCache({
      ttl: 10 * 60 * 1000, // 10 minutes default
      maxSize: 500
    });
  }

  public async query(
    text: string, 
    params?: any[], 
    options: QueryOptions = {}
  ): Promise<any> {
    const startTime = performance.now();
    const queryHash = this.hashQuery(text, params);
    
    // Check cache first if enabled
    if (options.cache !== false) {
      const cached = this.queryCache.get(queryHash);
      if (cached) {
        return cached;
      }
    }

    try {
      const result = await super.query(text, params);
      const duration = performance.now() - startTime;
      
      // Update query statistics
      this.updateQueryStats(text, duration, false);
      
      // Cache the result if it's a SELECT query and caching is enabled
      if (options.cache !== false && text.trim().toLowerCase().startsWith('select')) {
        const cacheTTL = options.cacheTTL || 10 * 60 * 1000; // 10 minutes default
        this.queryCache.set(queryHash, result, cacheTTL);
      }

      return result;
      
    } catch (error) {
      const duration = performance.now() - startTime;
      this.updateQueryStats(text, duration, true);
      throw error;
    }
  }

  private hashQuery(text: string, params?: any[]): string {
    return `${text}:${params ? JSON.stringify(params) : ''}`;
  }

  private updateQueryStats(query: string, duration: number, isError: boolean): void {
    const key = query.split(' ').slice(0, 3).join(' '); // First 3 words for grouping
    const stats = this.queryStats.get(key) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      errors: 0
    };

    stats.count++;
    stats.totalTime += duration;
    stats.avgTime = stats.totalTime / stats.count;
    
    if (isError) {
      stats.errors++;
    }

    this.queryStats.set(key, stats);
  }

  public async queryWithCache<T>(
    text: string,
    params?: any[],
    cacheTTL: number = 10 * 60 * 1000
  ): Promise<T[]> {
    return this.query(text, params, { cache: true, cacheTTL });
  }

  public async queryWithoutCache<T>(
    text: string,
    params?: any[]
  ): Promise<T[]> {
    return this.query(text, params, { cache: false });
  }

  // Optimized user queries with intelligent caching
  public async getUserWithCache(userId: string): Promise<any> {
    return this.queryCache.getOrSet(
      `user:${userId}`,
      async () => {
        const users = await this.query(
          'SELECT id, email, created_at FROM users WHERE id = $1',
          [userId]
        );
        return users[0] || null;
      },
      30 * 60 * 1000 // 30 minutes
    );
  }

  public async getUserProfileWithCache(userId: string): Promise<any> {
    return this.queryCache.getOrSet(
      `profile:${userId}`,
      async () => {
        const profiles = await this.query(`
          SELECT u.id, u.email, u.created_at, 
                 up.subscription_tier, up.trial_end_date, 
                 up.monthly_workflow_runs, up.monthly_ai_generations
          FROM users u
          LEFT JOIN user_profiles up ON u.id = up.id
          WHERE u.id = $1
        `, [userId]);
        return profiles[0] || null;
      },
      15 * 60 * 1000 // 15 minutes
    );
  }

  public async getWorkflowsWithCache(userId: string): Promise<any[]> {
    return this.queryCache.getOrSet(
      `workflows:${userId}`,
      async () => {
        return this.query(
          'SELECT name, workflow_data, created_at, updated_at FROM workflows WHERE user_id = $1 ORDER BY updated_at DESC',
          [userId]
        );
      },
      5 * 60 * 1000 // 5 minutes
    );
  }

  // Batch operations for better performance
  public async batchInsert(
    table: string,
    columns: string[],
    values: any[][],
    options: { batchSize?: number } = {}
  ): Promise<void> {
    const batchSize = options.batchSize || 100;
    const columnStr = columns.join(', ');
    
    for (let i = 0; i < values.length; i += batchSize) {
      const batch = values.slice(i, i + batchSize);
      const valueStrings: string[] = [];
      const allParams: any[] = [];
      
      batch.forEach((row, rowIndex) => {
        const rowParams = row.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`);
        valueStrings.push(`(${rowParams.join(', ')})`);
        allParams.push(...row);
      });
      
      const query = `INSERT INTO ${table} (${columnStr}) VALUES ${valueStrings.join(', ')}`;
      await this.query(query, allParams, { cache: false });
    }
  }

  // Performance analysis methods
  public getQueryStats(): Map<string, any> {
    return this.queryStats;
  }

  public getCacheStats() {
    return this.queryCache.getStats();
  }

  public getTopSlowQueries(limit: number = 10) {
    return Array.from(this.queryStats.entries())
      .sort(([, a], [, b]) => b.avgTime - a.avgTime)
      .slice(0, limit)
      .map(([query, stats]) => ({
        query,
        avgTime: Math.round(stats.avgTime),
        count: stats.count,
        errors: stats.errors,
        errorRate: Math.round((stats.errors / stats.count) * 100)
      }));
  }

  public clearQueryCache(): void {
    this.queryCache.clear();
  }

  public invalidateUserCache(userId: string): void {
    this.queryCache.delete(`user:${userId}`);
    this.queryCache.delete(`profile:${userId}`);
    this.queryCache.delete(`workflows:${userId}`);
  }

  // Enhanced health check with detailed performance metrics
  public async enhancedHealthCheck(): Promise<{
    healthy: boolean;
    performance: any;
    cache: any;
    queries: any;
  }> {
    const baseHealth = await this.healthCheck();
    const cacheStats = this.getCacheStats();
    const topSlowQueries = this.getTopSlowQueries(5);
    
    return {
      healthy: baseHealth.healthy,
      performance: {
        ...baseHealth.details,
        queryCount: Array.from(this.queryStats.values()).reduce((sum, stat) => sum + stat.count, 0),
        avgQueryTime: this.getAverageQueryTime(),
        errorRate: this.getQueryErrorRate()
      },
      cache: {
        hitRate: cacheStats.hitRate,
        size: cacheStats.size,
        maxSize: cacheStats.maxSize,
        hits: cacheStats.hits,
        misses: cacheStats.misses
      },
      queries: {
        slowQueries: topSlowQueries,
        totalQueries: this.queryStats.size
      }
    };
  }

  private getAverageQueryTime(): number {
    const stats = Array.from(this.queryStats.values());
    if (stats.length === 0) return 0;
    
    const totalTime = stats.reduce((sum, stat) => sum + stat.totalTime, 0);
    const totalCount = stats.reduce((sum, stat) => sum + stat.count, 0);
    
    return totalCount > 0 ? Math.round(totalTime / totalCount) : 0;
  }

  private getQueryErrorRate(): number {
    const stats = Array.from(this.queryStats.values());
    if (stats.length === 0) return 0;
    
    const totalErrors = stats.reduce((sum, stat) => sum + stat.errors, 0);
    const totalCount = stats.reduce((sum, stat) => sum + stat.count, 0);
    
    return totalCount > 0 ? Math.round((totalErrors / totalCount) * 100) : 0;
  }
}

// Export enhanced database instance
export const enhancedDb = new EnhancedDatabase();