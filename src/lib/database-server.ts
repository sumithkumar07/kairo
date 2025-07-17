import { Pool, PoolClient } from 'pg';
import crypto from 'crypto';

// Database connection configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://kairo_db_user:KiMxEtyNTN0ngQr6weLgRU4fgPw5sQvw@dpg-d1rrl36r433s73amt4g0-a.oregon-postgres.render.com/kairo_db';

let pool: Pool | null = null;

// Create a connection pool
function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

// Database connection singleton
export class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = getPool();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  public async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// Export singleton instance
export const db = Database.getInstance();

// Database initialization and schema creation
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('[DATABASE] Initializing database schema...');
    
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
        subscription_tier TEXT DEFAULT 'Free' NOT NULL,
        trial_end_date TIMESTAMP WITH TIME ZONE,
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

    // Create indexes for performance
    await db.query(`CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_run_history_user_id ON run_history(user_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_run_history_timestamp ON run_history(timestamp)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_mcp_command_history_user_id ON mcp_command_history(user_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id)`);

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
      END;
      $$ LANGUAGE plpgsql;
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

    console.log('[DATABASE] Database schema initialized successfully');
  } catch (error) {
    console.error('[DATABASE] Error initializing database:', error);
    throw error;
  }
}

// Authentication utilities
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, storedHash] = hash.split(':');
  const computedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
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