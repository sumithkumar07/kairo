import { Pool, PoolClient } from 'pg';
import { db } from './database-server';

// Database connection pool wrapper with advanced features
export class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager;
  private connectionAttempts = 0;
  private maxRetries = 5;
  private retryDelay = 1000; // Start with 1 second
  private isHealthy = true;
  private lastHealthCheck = 0;
  private healthCheckInterval = 30000; // 30 seconds

  private constructor() {
    this.startHealthCheckTimer();
  }

  public static getInstance(): DatabaseConnectionManager {
    if (!DatabaseConnectionManager.instance) {
      DatabaseConnectionManager.instance = new DatabaseConnectionManager();
    }
    return DatabaseConnectionManager.instance;
  }

  // Execute query with automatic retry and circuit breaker
  public async executeQuery<T = any>(
    query: string,
    params?: any[],
    options: {
      maxRetries?: number;
      timeout?: number;
      priority?: 'high' | 'normal' | 'low';
    } = {}
  ): Promise<T[]> {
    const { maxRetries = this.maxRetries, timeout = 30000, priority = 'normal' } = options;

    // Circuit breaker - if database is unhealthy, fail fast for low priority queries
    if (!this.isHealthy && priority === 'low') {
      throw new Error('Database is currently unhealthy, skipping low priority query');
    }

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await Promise.race([
          db.query(query, params),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), timeout)
          )
        ]);

        // Reset connection attempts on success
        this.connectionAttempts = 0;
        this.isHealthy = true;
        
        return result;
      } catch (error) {
        lastError = error as Error;
        this.connectionAttempts++;

        console.warn(`[DATABASE] Query attempt ${attempt + 1} failed:`, {
          error: lastError.message,
          query: query.substring(0, 100),
          attempt: attempt + 1,
          maxRetries
        });

        // Mark as unhealthy if too many failures
        if (this.connectionAttempts >= 3) {
          this.isHealthy = false;
        }

        // Don't retry on certain errors
        if (this.isNonRetryableError(lastError)) {
          break;
        }

        // Wait before retrying with exponential backoff
        if (attempt < maxRetries - 1) {
          const delay = this.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Database query failed after all retries');
  }

  // Execute transaction with automatic retry
  public async executeTransaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    options: { maxRetries?: number; timeout?: number } = {}
  ): Promise<T> {
    const { maxRetries = 3, timeout = 60000 } = options;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await Promise.race([
          db.transaction(callback),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Transaction timeout')), timeout)
          )
        ]);

        this.connectionAttempts = 0;
        this.isHealthy = true;
        return result;
      } catch (error) {
        lastError = error as Error;
        console.warn(`[DATABASE] Transaction attempt ${attempt + 1} failed:`, lastError.message);

        // Don't retry on certain errors
        if (this.isNonRetryableError(lastError)) {
          break;
        }

        if (attempt < maxRetries - 1) {
          const delay = this.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Database transaction failed after all retries');
  }

  // Check if error should not be retried
  private isNonRetryableError(error: Error): boolean {
    const nonRetryablePatterns = [
      /unique constraint/i,
      /foreign key constraint/i,
      /check constraint/i,
      /not null violation/i,
      /permission denied/i,
      /relation.*does not exist/i,
      /column.*does not exist/i,
      /function.*does not exist/i,
      /syntax error/i
    ];

    return nonRetryablePatterns.some(pattern => pattern.test(error.message));
  }

  // Periodic health check
  private startHealthCheckTimer(): void {
    setInterval(async () => {
      try {
        const now = Date.now();
        if (now - this.lastHealthCheck < this.healthCheckInterval) {
          return;
        }

        await this.executeQuery('SELECT 1', [], { maxRetries: 1, priority: 'high' });
        this.isHealthy = true;
        this.lastHealthCheck = now;
      } catch (error) {
        this.isHealthy = false;
        console.error('[DATABASE] Health check failed:', error);
      }
    }, this.healthCheckInterval);
  }

  // Get current health status
  public getHealthStatus(): {
    healthy: boolean;
    connectionAttempts: number;
    lastHealthCheck: number;
    poolStats: any;
  } {
    return {
      healthy: this.isHealthy,
      connectionAttempts: this.connectionAttempts,
      lastHealthCheck: this.lastHealthCheck,
      poolStats: db.getPoolStats()
    };
  }

  // Force health check
  public async checkHealth(): Promise<boolean> {
    try {
      await this.executeQuery('SELECT 1', [], { maxRetries: 1, priority: 'high' });
      this.isHealthy = true;
      this.lastHealthCheck = Date.now();
      return true;
    } catch (error) {
      this.isHealthy = false;
      return false;
    }
  }
}

// Database query builder for common operations
export class QueryBuilder {
  private query = '';
  private params: any[] = [];
  private paramCount = 0;

  static select(columns: string[] | string = '*'): QueryBuilder {
    const qb = new QueryBuilder();
    const cols = Array.isArray(columns) ? columns.join(', ') : columns;
    qb.query = `SELECT ${cols}`;
    return qb;
  }

  static insert(table: string): QueryBuilder {
    const qb = new QueryBuilder();
    qb.query = `INSERT INTO ${table}`;
    return qb;
  }

  static update(table: string): QueryBuilder {
    const qb = new QueryBuilder();
    qb.query = `UPDATE ${table}`;
    return qb;
  }

  static delete(table: string): QueryBuilder {
    const qb = new QueryBuilder();
    qb.query = `DELETE FROM ${table}`;
    return qb;
  }

  from(table: string): QueryBuilder {
    this.query += ` FROM ${table}`;
    return this;
  }

  where(condition: string, value?: any): QueryBuilder {
    const operator = this.query.includes('WHERE') ? 'AND' : 'WHERE';
    
    if (value !== undefined) {
      this.paramCount++;
      this.query += ` ${operator} ${condition.replace('?', `$${this.paramCount}`)}`;
      this.params.push(value);
    } else {
      this.query += ` ${operator} ${condition}`;
    }
    
    return this;
  }

  orWhere(condition: string, value?: any): QueryBuilder {
    if (value !== undefined) {
      this.paramCount++;
      this.query += ` OR ${condition.replace('?', `$${this.paramCount}`)}`;
      this.params.push(value);
    } else {
      this.query += ` OR ${condition}`;
    }
    
    return this;
  }

  join(table: string, condition: string): QueryBuilder {
    this.query += ` JOIN ${table} ON ${condition}`;
    return this;
  }

  leftJoin(table: string, condition: string): QueryBuilder {
    this.query += ` LEFT JOIN ${table} ON ${condition}`;
    return this;
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
    this.query += ` ORDER BY ${column} ${direction}`;
    return this;
  }

  limit(count: number): QueryBuilder {
    this.paramCount++;
    this.query += ` LIMIT $${this.paramCount}`;
    this.params.push(count);
    return this;
  }

  offset(count: number): QueryBuilder {
    this.paramCount++;
    this.query += ` OFFSET $${this.paramCount}`;
    this.params.push(count);
    return this;
  }

  values(data: Record<string, any>): QueryBuilder {
    const columns = Object.keys(data);
    const placeholders = columns.map(() => {
      this.paramCount++;
      return `$${this.paramCount}`;
    });

    this.query += ` (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
    this.params.push(...Object.values(data));
    return this;
  }

  set(data: Record<string, any>): QueryBuilder {
    const updates = Object.keys(data).map(key => {
      this.paramCount++;
      return `${key} = $${this.paramCount}`;
    });

    this.query += ` SET ${updates.join(', ')}`;
    this.params.push(...Object.values(data));
    return this;
  }

  returning(columns: string[] | string = '*'): QueryBuilder {
    const cols = Array.isArray(columns) ? columns.join(', ') : columns;
    this.query += ` RETURNING ${cols}`;
    return this;
  }

  build(): { query: string; params: any[] } {
    return {
      query: this.query,
      params: this.params
    };
  }

  async execute<T = any>(): Promise<T[]> {
    const dbManager = DatabaseConnectionManager.getInstance();
    return await dbManager.executeQuery<T>(this.query, this.params);
  }
}

// Database migration utilities
export class DatabaseMigrator {
  private static migrations: Array<{
    version: string;
    description: string;
    up: (db: DatabaseConnectionManager) => Promise<void>;
    down: (db: DatabaseConnectionManager) => Promise<void>;
  }> = [];

  static addMigration(migration: {
    version: string;
    description: string;
    up: (db: DatabaseConnectionManager) => Promise<void>;
    down: (db: DatabaseConnectionManager) => Promise<void>;
  }): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version.localeCompare(b.version));
  }

  static async runMigrations(): Promise<void> {
    const dbManager = DatabaseConnectionManager.getInstance();

    // Create migrations table if it doesn't exist
    await dbManager.executeQuery(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        description TEXT,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Get applied migrations
    const appliedMigrations = await dbManager.executeQuery<{ version: string }>(
      'SELECT version FROM schema_migrations ORDER BY version'
    );
    const appliedVersions = new Set(appliedMigrations.map(m => m.version));

    // Run pending migrations
    for (const migration of this.migrations) {
      if (!appliedVersions.has(migration.version)) {
        console.log(`[MIGRATION] Running migration ${migration.version}: ${migration.description}`);
        
        try {
          await migration.up(dbManager);
          await dbManager.executeQuery(
            'INSERT INTO schema_migrations (version, description) VALUES ($1, $2)',
            [migration.version, migration.description]
          );
          console.log(`[MIGRATION] Migration ${migration.version} completed successfully`);
        } catch (error) {
          console.error(`[MIGRATION] Migration ${migration.version} failed:`, error);
          throw error;
        }
      }
    }
  }
}

// Export singleton instance
export const dbManager = DatabaseConnectionManager.getInstance();