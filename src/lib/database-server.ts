import { Pool, PoolClient } from 'pg';
import bcrypt from 'bcryptjs';

// Database connection configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://kairo_db_user:KiMxEtyNTN0ngQr6weLgRU4fgPw5sQvw@dpg-d1rrl36r433s73amt4g0-a.oregon-postgres.render.com/kairo_db';

let pool: Pool | null = null;

// Create a connection pool with optimized settings
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: 5000, // Connection timeout
      acquireTimeoutMillis: 10000, // Acquire timeout
      statement_timeout: 30000, // Statement timeout (30 seconds)
      query_timeout: 30000, // Query timeout (30 seconds)
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('[DATABASE] Unexpected error on idle client', err);
    });

    pool.on('connect', () => {
      console.log('[DATABASE] New client connected to the pool');
    });

    pool.on('remove', () => {
      console.log('[DATABASE] Client removed from the pool');
    });
  }
  return pool;
}

// Database connection singleton with performance optimizations
export class Database {
  private static instance: Database;
  private pool: Pool;
  private queryCache: Map<string, { result: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

  private constructor() {
    this.pool = getPool();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Enhanced query method with caching and performance monitoring
  public async query(text: string, params?: any[]): Promise<any> {
    const startTime = Date.now();
    const cacheKey = `${text}:${JSON.stringify(params || [])}`;

    // Check cache for read-only queries
    if (text.trim().toLowerCase().startsWith('select')) {
      const cached = this.queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.result;
      }
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      const executionTime = Date.now() - startTime;

      // Log slow queries
      if (executionTime > 1000) {
        console.warn(`[DATABASE] Slow query detected: ${executionTime}ms`, {
          query: text.substring(0, 100),
          executionTime
        });
      }

      // Cache read-only results
      if (text.trim().toLowerCase().startsWith('select')) {
        this.queryCache.set(cacheKey, {
          result: result.rows,
          timestamp: Date.now()
        });
      }

      return result.rows;
    } catch (error) {
      console.error('[DATABASE] Query error:', {
        query: text,
        params,
        error: error.message
      });
      throw error;
    } finally {
      client.release();
    }
  }

  // Get a client for transactions
  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  // Enhanced transaction method with retry logic
  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      
      // Clear cache after write operations
      this.clearCache();
      
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[DATABASE] Transaction failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Clear query cache
  private clearCache(): void {
    this.queryCache.clear();
  }

  // Health check method
  public async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('[DATABASE] Health check failed:', error);
      return false;
    }
  }

  // Get pool statistics
  public getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }

  // Cleanup method
  public async close(): Promise<void> {
    if (pool) {
      await pool.end();
      pool = null;
    }
  }
}

// Export singleton instance
export const db = Database.getInstance();

// Database initialization and schema creation with optimizations
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('[DATABASE] Initializing PostgreSQL database schema...');
    
    // Enable extensions
    await db.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await db.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    
    // Create users table with optimized indexes
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create user_profiles table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        subscription_tier TEXT DEFAULT 'Free' NOT NULL CHECK (subscription_tier IN ('Free', 'Gold', 'Diamond', 'Trial')),
        trial_end_date TIMESTAMP WITH TIME ZONE,
        monthly_workflow_runs INTEGER DEFAULT 0,
        monthly_ai_generations INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create workflows table with better indexing
    await db.query(`
      CREATE TABLE IF NOT EXISTS workflows (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        workflow_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (user_id, name)
      )
    `);

    // Create run_history table with partitioning preparation
    await db.query(`
      CREATE TABLE IF NOT EXISTS run_history (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        workflow_name VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status TEXT NOT NULL CHECK (status IN ('success', 'error', 'running', 'cancelled')),
        execution_result JSONB,
        initial_data JSONB,
        workflow_snapshot JSONB,
        execution_time_ms INTEGER,
        error_message TEXT
      )
    `);

    // Create sessions table for authentication
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_agent TEXT,
        ip_address INET
      )
    `);

    // Create other necessary tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS credentials (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        encrypted_value TEXT NOT NULL,
        service VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, name)
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_api_keys (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        key_hash TEXT NOT NULL UNIQUE,
        prefix TEXT NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_used_at TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE
      )
    `);

    // Create audit_logs table for CARES framework
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(255) NOT NULL,
        resource_type VARCHAR(100),
        resource_id TEXT,
        details JSONB,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ip_address INET,
        user_agent TEXT
      )
    `);

    // Create performance optimized indexes
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users USING btree(email)`,
      `CREATE INDEX IF NOT EXISTS idx_users_created_at ON users USING btree(created_at)`,
      `CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows USING btree(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_workflows_updated_at ON workflows USING btree(updated_at)`,
      `CREATE INDEX IF NOT EXISTS idx_run_history_user_id ON run_history USING btree(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_run_history_timestamp ON run_history USING btree(timestamp DESC)`,
      `CREATE INDEX IF NOT EXISTS idx_run_history_status ON run_history USING btree(status)`,
      `CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions USING btree(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions USING btree(expires_at)`,
      `CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials USING btree(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs USING btree(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs USING btree(timestamp DESC)`,
      // GIN indexes for JSONB columns for better search performance
      `CREATE INDEX IF NOT EXISTS idx_workflows_data_gin ON workflows USING gin(workflow_data)`,
      `CREATE INDEX IF NOT EXISTS idx_run_history_result_gin ON run_history USING gin(execution_result)`,
    ];

    for (const indexQuery of indexes) {
      try {
        await db.query(indexQuery);
      } catch (error) {
        console.warn('[DATABASE] Index creation warning:', error.message);
      }
    }

    // Create utility functions with better performance
    await db.query(`
      CREATE OR REPLACE FUNCTION find_user_by_api_key(p_key_hash text)
      RETURNS uuid AS $$
      DECLARE
          v_user_id uuid;
      BEGIN
          SELECT user_id INTO v_user_id
          FROM user_api_keys
          WHERE key_hash = p_key_hash
            AND (expires_at IS NULL OR expires_at > NOW());
          
          -- Update last_used_at
          UPDATE user_api_keys 
          SET last_used_at = NOW() 
          WHERE key_hash = p_key_hash AND user_id = v_user_id;
          
          RETURN v_user_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

    // Enhanced webhook function with better performance
    await db.query(`
      CREATE OR REPLACE FUNCTION find_workflow_by_webhook_path(path_suffix_to_find text)
      RETURNS TABLE(user_id_result uuid, workflow_data_result jsonb)
      LANGUAGE plpgsql AS $$
      BEGIN
        RETURN QUERY
        SELECT w.user_id, w.workflow_data
        FROM workflows AS w
        WHERE w.workflow_data @> jsonb_build_object('nodes', jsonb_build_array(
          jsonb_build_object('type', 'webhookTrigger', 'config', jsonb_build_object('pathSuffix', path_suffix_to_find))
        ))
        LIMIT 1;
      END;
      $$;
    `);

    // Create trigger function for user profile creation
    await db.query(`
      CREATE OR REPLACE FUNCTION handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO user_profiles (id, trial_end_date)
        VALUES (NEW.id, NOW() + interval '15 days');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create trigger
    await db.query(`
      DROP TRIGGER IF EXISTS on_user_created ON users;
      CREATE TRIGGER on_user_created
        AFTER INSERT ON users
        FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    `);

    // Create cleanup function for expired sessions
    await db.query(`
      CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
      RETURNS void AS $$
      BEGIN
        DELETE FROM user_sessions WHERE expires_at < NOW();
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('[DATABASE] PostgreSQL database schema initialized successfully');
    console.log('[DATABASE] Pool stats:', db.getPoolStats());
  } catch (error) {
    console.error('[DATABASE] Error initializing database:', error);
    throw error;
  }
}

// Enhanced authentication utilities using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Increased for better security
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Session management utilities
export function generateSessionToken(): string {
  return require('crypto').randomBytes(32).toString('hex');
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Performance monitoring utilities
export async function logSlowQuery(query: string, executionTime: number, params?: any[]): Promise<void> {
  if (executionTime > 1000) {
    console.warn('[DATABASE] Slow query detected:', {
      query: query.substring(0, 200),
      executionTime,
      timestamp: new Date().toISOString()
    });
  }
}

// Database health and maintenance
export async function performMaintenance(): Promise<void> {
  try {
    console.log('[DATABASE] Starting maintenance tasks...');
    
    // Clean up expired sessions
    await db.query(`SELECT cleanup_expired_sessions()`);
    
    // Update table statistics for better query planning
    await db.query(`ANALYZE`);
    
    console.log('[DATABASE] Maintenance completed successfully');
  } catch (error) {
    console.error('[DATABASE] Maintenance error:', error);
  }
}

// Export health check function
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  poolStats: any;
  responseTime: number;
}> {
  const startTime = Date.now();
  const healthy = await db.healthCheck();
  const responseTime = Date.now() - startTime;
  
  return {
    healthy,
    poolStats: db.getPoolStats(),
    responseTime
  };
}