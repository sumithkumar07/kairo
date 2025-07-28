import { Pool, PoolClient } from 'pg';
import crypto from 'crypto';

// Enhanced database connection configuration with better error handling and connection pooling
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://kairo_db_user:KiMxEtyNTN0ngQr6weLgRU4fgPw5sQvw@dpg-d1rrl36r433s73amt4g0-a.oregon-postgres.render.com/kairo_db';

// Create a connection pool with enhanced stability settings
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Enhanced connection pool settings for stability
  max: 30, // Increased pool size for better concurrency
  min: 8,  // Higher minimum connections to maintain
  idleTimeoutMillis: 60000,     // Increased idle timeout
  connectionTimeoutMillis: 15000, // Increased connection timeout
  acquireTimeoutMillis: 80000,    // Increased acquire timeout
  createTimeoutMillis: 30000,     // Increased create timeout
  reapIntervalMillis: 2000,       // Less frequent reaping
  createRetryIntervalMillis: 500, // Longer retry interval
  reconnectOnDatabaseIsStartingError: true,
  // Additional stability settings
  query_timeout: 30000,
  statement_timeout: 45000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Enhanced error handling for pool with retry logic
pool.on('error', (err) => {
  console.error('[DATABASE] Pool error:', {
    message: err.message,
    code: err.code,
    severity: err.severity,
    timestamp: new Date().toISOString()
  });
  
  // Auto-recovery for specific error types
  if (err.code === 'ECONNRESET' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
    console.log('[DATABASE] Attempting automatic recovery...');
    setTimeout(() => {
      pool.totalCount = 0; // Reset pool
    }, 5000);
  }
});

pool.on('connect', (client) => {
  console.log('[DATABASE] New client connected to pool');
  // Set connection-specific settings for better performance
  client.query('SET application_name = $1', ['kairo_app']);
});

pool.on('acquire', (client) => {
  console.log('[DATABASE] Client acquired from pool - Active:', pool.totalCount - pool.idleCount);
});

pool.on('remove', (client) => {
  console.log('[DATABASE] Client removed from pool - Remaining:', pool.totalCount);
});

// Database connection singleton with enhanced retry logic
export class Database {
  private static instance: Database;
  private pool: Pool;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private constructor() {
    this.pool = pool;
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // Enhanced query method with retry logic and timeout handling
  public async query(text: string, params?: any[]): Promise<any> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      let client: PoolClient | null = null;
      try {
        client = await this.pool.connect();
        
        // Set a query timeout (static value to avoid parameter binding conflicts)
        await client.query('SET statement_timeout = 30000');
        
        const result = await client.query(text, params);
        this.reconnectAttempts = 0; // Reset on successful query
        return result.rows;
        
      } catch (error: any) {
        console.error(`[DATABASE] Query error (attempt ${attempt + 1}):`, {
          error: error.message,
          code: error.code,
          query: text.substring(0, 100) + '...',
          timestamp: new Date().toISOString()
        });
        
        // Handle specific error types
        if (this.isRetriableError(error)) {
          attempt++;
          if (attempt < maxRetries) {
            console.log(`[DATABASE] Retrying query in ${attempt * 1000}ms...`);
            await this.delay(attempt * 1000);
            continue;
          }
        }
        
        throw error;
      } finally {
        if (client) {
          try {
            client.release();
          } catch (releaseError) {
            console.error('[DATABASE] Error releasing client:', releaseError);
          }
        }
      }
    }
  }

  private isRetriableError(error: any): boolean {
    const retriableCodes = [
      'ECONNRESET',
      'ENOTFOUND', 
      'ETIMEDOUT',
      'ECONNREFUSED',
      'EPIPE',
      '53300', // PostgreSQL: too_many_connections
      '53200', // PostgreSQL: out_of_memory
      '57P01', // PostgreSQL: admin_shutdown
    ];
    
    return retriableCodes.includes(error.code) || 
           error.message?.includes('connection') ||
           error.message?.includes('timeout');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async getClient(): Promise<PoolClient> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        const client = await this.pool.connect();
        // Set client-specific settings (static value to avoid parameter binding conflicts)
        await client.query('SET application_name = \'kairo_app\'');
        return client;
        
      } catch (error: any) {
        console.error(`[DATABASE] Failed to get client (attempt ${attempt + 1}):`, error);
        
        if (this.isRetriableError(error) && attempt < maxRetries - 1) {
          attempt++;
          await this.delay(attempt * 2000);
          continue;
        }
        
        throw error;
      }
    }
    
    throw new Error('Failed to acquire database client after maximum retries');
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error: any) {
      console.error('[DATABASE] Transaction error:', error);
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('[DATABASE] Rollback error:', rollbackError);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  // Enhanced health check with detailed metrics
  public async healthCheck(): Promise<{ healthy: boolean; details: any }> {
    try {
      const start = Date.now();
      const result = await this.query('SELECT 1 as health, NOW() as server_time, version() as pg_version');
      const duration = Date.now() - start;
      
      const poolStats = this.getPoolStats();
      
      return {
        healthy: result.length > 0 && result[0].health === 1,
        details: {
          responseTime: `${duration}ms`,
          serverTime: result[0]?.server_time,
          pgVersion: result[0]?.pg_version?.split(' ')[0] + ' ' + result[0]?.pg_version?.split(' ')[1],
          poolStats,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('[DATABASE] Health check failed:', error);
      return {
        healthy: false,
        details: {
          error: error.message,
          code: error.code,
          poolStats: this.getPoolStats(),
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  // Enhanced pool stats with additional metrics
  public getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      activeCount: this.pool.totalCount - this.pool.idleCount,
      maxSize: 30,
      minSize: 8,
      utilizationPercent: Math.round(((this.pool.totalCount - this.pool.idleCount) / 30) * 100),
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // New method for graceful shutdown
  public async shutdown(): Promise<void> {
    console.log('[DATABASE] Initiating graceful shutdown...');
    try {
      await this.pool.end();
      console.log('[DATABASE] Pool closed successfully');
    } catch (error) {
      console.error('[DATABASE] Error during shutdown:', error);
    }
  }

  // Connection monitoring
  public startHealthMonitoring(intervalMs: number = 60000): void {
    setInterval(async () => {
      const health = await this.healthCheck();
      if (!health.healthy) {
        console.warn('[DATABASE] Health check failed:', health.details);
      } else {
        console.log('[DATABASE] Health check passed:', {
          responseTime: health.details.responseTime,
          utilization: health.details.poolStats.utilizationPercent + '%'
        });
      }
    }, intervalMs);
  }
}

// Export singleton instance
export const db = Database.getInstance();

// Database initialization with enhanced error handling
export async function initializeDatabase(): Promise<void> {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      console.log(`[DATABASE] Initializing database schema (attempt ${attempt + 1})...`);
      
      // Create users table with enhanced constraints
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
        )
      `);

      // Create user_profiles table with additional monitoring fields
      await db.query(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          subscription_tier TEXT DEFAULT 'Free' NOT NULL,
          trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + interval '15 days'),
          monthly_workflow_runs INTEGER DEFAULT 0,
          monthly_ai_generations INTEGER DEFAULT 0,
          last_login_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create workflows table
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

      // Create run_history table
      await db.query(`
        CREATE TABLE IF NOT EXISTS run_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          workflow_name VARCHAR(255) NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          status TEXT NOT NULL,
          execution_result JSONB,
          initial_data JSONB,
          workflow_snapshot JSONB
        )
      `);

      // Create mcp_command_history table
      await db.query(`
        CREATE TABLE IF NOT EXISTS mcp_command_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          command TEXT NOT NULL,
          response TEXT,
          status TEXT NOT NULL
        )
      `);

      // Create agent_config table
      await db.query(`
        CREATE TABLE IF NOT EXISTS agent_config (
          user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          enabled_tools JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Create credentials table
      await db.query(`
        CREATE TABLE IF NOT EXISTS credentials (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          value TEXT NOT NULL,
          service VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, name)
        )
      `);

      // Create user_api_keys table
      await db.query(`
        CREATE TABLE IF NOT EXISTS user_api_keys (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          key_hash TEXT NOT NULL UNIQUE,
          prefix TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_used_at TIMESTAMP WITH TIME ZONE
        )
      `);

      // Create workflow_runs_monthly table
      await db.query(`
        CREATE TABLE IF NOT EXISTS workflow_runs_monthly (
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          year_month TEXT NOT NULL,
          run_count INTEGER DEFAULT 0 NOT NULL,
          PRIMARY KEY (user_id, year_month)
        )
      `);

      // Create ai_generations_monthly table
      await db.query(`
        CREATE TABLE IF NOT EXISTS ai_generations_monthly (
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          year_month TEXT NOT NULL,
          generation_count INTEGER DEFAULT 0 NOT NULL,
          PRIMARY KEY (user_id, year_month)
        )
      `);

      // Create audit_logs table for security monitoring
      await db.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          action TEXT NOT NULL,
          resource_type TEXT,
          resource_id TEXT,
          ip_address INET,
          user_agent TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          details JSONB
        )
      `);

      // Create enhanced indexes for performance
      await db.query(`CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_run_history_user_id ON run_history(user_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_run_history_timestamp ON run_history(timestamp)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_mcp_command_history_user_id ON mcp_command_history(user_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_user_profiles_trial_end ON user_profiles(trial_end_date)`);

      // Create utility functions
      await db.query(`
        CREATE OR REPLACE FUNCTION find_user_by_api_key(p_key_hash text)
        RETURNS uuid AS $$
        DECLARE
            v_user_id uuid;
        BEGIN
            SELECT user_id INTO v_user_id
            FROM user_api_keys
            WHERE key_hash = p_key_hash;
            
            -- Update last_used_at
            IF v_user_id IS NOT NULL THEN
                UPDATE user_api_keys 
                SET last_used_at = NOW() 
                WHERE key_hash = p_key_hash;
            END IF;
            
            RETURN v_user_id;
        END;
        $$ LANGUAGE plpgsql;
      `);

      await db.query(`
        CREATE OR REPLACE FUNCTION find_workflow_by_webhook_path(path_suffix_to_find text)
        RETURNS TABLE(user_id_result uuid, workflow_data_result jsonb)
        LANGUAGE plpgsql AS $$
        BEGIN
          RETURN QUERY
          SELECT w.user_id, w.workflow_data
          FROM workflows AS w,
               jsonb_array_elements(w.workflow_data->'nodes') AS node
          WHERE node->>'type' = 'webhookTrigger'
            AND node->'config'->>'pathSuffix' = path_suffix_to_find
          LIMIT 1;
        END;
        $$;
      `);

      await db.query(`
        CREATE OR REPLACE FUNCTION increment_run_count(p_user_id uuid)
        RETURNS void AS $$
        BEGIN
            INSERT INTO workflow_runs_monthly (user_id, year_month, run_count)
            VALUES (p_user_id, to_char(CURRENT_DATE, 'YYYY-MM'), 1)
            ON CONFLICT (user_id, year_month)
            DO UPDATE SET run_count = workflow_runs_monthly.run_count + 1;
            
            -- Also update user_profiles
            UPDATE user_profiles 
            SET monthly_workflow_runs = (
                SELECT COALESCE(SUM(run_count), 0) 
                FROM workflow_runs_monthly 
                WHERE user_id = p_user_id 
                AND year_month = to_char(CURRENT_DATE, 'YYYY-MM')
            )
            WHERE id = p_user_id;
        END;
        $$ LANGUAGE plpgsql;
      `);

      await db.query(`
        CREATE OR REPLACE FUNCTION increment_generation_count(p_user_id uuid)
        RETURNS void AS $$
        BEGIN
            INSERT INTO ai_generations_monthly (user_id, year_month, generation_count)
            VALUES (p_user_id, to_char(CURRENT_DATE, 'YYYY-MM'), 1)
            ON CONFLICT (user_id, year_month)
            DO UPDATE SET generation_count = ai_generations_monthly.generation_count + 1;
            
            -- Also update user_profiles
            UPDATE user_profiles 
            SET monthly_ai_generations = (
                SELECT COALESCE(SUM(generation_count), 0) 
                FROM ai_generations_monthly 
                WHERE user_id = p_user_id 
                AND year_month = to_char(CURRENT_DATE, 'YYYY-MM')
            )
            WHERE id = p_user_id;
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Enhanced trigger function for user profile creation
      await db.query(`
        CREATE OR REPLACE FUNCTION handle_new_user()
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO user_profiles (id, trial_end_date)
          VALUES (NEW.id, NOW() + interval '15 days')
          ON CONFLICT (id) DO NOTHING;
          
          -- Log user creation
          INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
          VALUES (NEW.id, 'user_created', 'user', NEW.id::text, jsonb_build_object('email', NEW.email));
          
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

      // Function to update user login timestamp
      await db.query(`
        CREATE OR REPLACE FUNCTION update_user_login(p_user_id uuid)
        RETURNS void AS $$
        BEGIN
            UPDATE user_profiles 
            SET last_login_at = NOW(),
                updated_at = NOW()
            WHERE id = p_user_id;
            
            -- Log login event
            INSERT INTO audit_logs (user_id, action, resource_type, resource_id)
            VALUES (p_user_id, 'user_login', 'user', p_user_id::text);
        END;
        $$ LANGUAGE plpgsql;
      `);

      console.log('[DATABASE] Database schema initialized successfully');
      
      // Start health monitoring
      db.startHealthMonitoring(300000); // Every 5 minutes
      
      return;
    } catch (error: any) {
      attempt++;
      console.error(`[DATABASE] Error initializing database (attempt ${attempt}):`, error);
      
      if (attempt >= maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, attempt * 2000));
    }
  }
}

// Enhanced authentication utilities
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex'); // Increased iterations
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, storedHash] = hash.split(':');
  const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return computedHash === storedHash;
}

// JWT utilities for session management
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Enhanced audit logging
export async function logAuditEvent(
  userId: string | null,
  action: string,
  resourceType?: string,
  resourceId?: string,
  ipAddress?: string,
  userAgent?: string,
  details?: any
): Promise<void> {
  try {
    await db.query(`
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, details)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [userId, action, resourceType, resourceId, ipAddress, userAgent, details ? JSON.stringify(details) : null]);
  } catch (error) {
    console.error('[DATABASE] Failed to log audit event:', error);
  }
}