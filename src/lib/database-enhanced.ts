import { db } from './database';

// Create missing tables for notifications and learning progress
export async function createMissingTables(): Promise<void> {
  try {
    console.log('[DATABASE] Creating missing tables for notifications and learning progress...');
    
    // Create user_notifications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        read_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        metadata JSONB
      )
    `);

    // Create user_learning_progress table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_learning_progress (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id VARCHAR(255) NOT NULL,
        progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
        completed_modules TEXT[] DEFAULT '{}',
        total_modules INTEGER DEFAULT 0,
        last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, course_id)
      )
    `);

    // Create user_certifications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_certifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        certification_id VARCHAR(255) NOT NULL,
        earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        score INTEGER CHECK (score >= 0 AND score <= 100),
        certificate_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, certification_id)
      )
    `);

    // Create performance-optimized indexes
    await db.query(`CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_user_notifications_read_at ON user_notifications(read_at)`);
    
    await db.query(`CREATE INDEX IF NOT EXISTS idx_user_learning_progress_user_id ON user_learning_progress(user_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_user_learning_progress_course_id ON user_learning_progress(course_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_user_learning_progress_last_accessed ON user_learning_progress(last_accessed DESC)`);
    
    await db.query(`CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_user_certifications_earned_date ON user_certifications(earned_date DESC)`);

    console.log('[DATABASE] Missing tables created successfully');
  } catch (error) {
    console.error('[DATABASE] Error creating missing tables:', error);
    throw error;
  }
}

// Create sample data for demo account
export async function createSampleDataForDemo(userId: string): Promise<void> {
  try {
    console.log('[DATABASE] Creating sample data for demo account...');
    
    // Insert sample notifications
    await db.query(`
      INSERT INTO user_notifications (user_id, type, title, message, metadata)
      VALUES 
        ($1, 'welcome', 'Welcome to Kairo AI!', 'Your account has been created successfully. Explore our powerful workflow automation features.', '{"importance": "high"}'),
        ($1, 'feature', 'New God-Tier Features Available', 'The Reality Fabricator and Quantum Simulation Engine are now available in your dashboard.', '{"features": ["reality-fabricator", "quantum-simulation"]}'),
        ($1, 'system', 'System Maintenance Complete', 'All systems are running optimally. Enjoy enhanced performance across all features.', '{"status": "complete"}')
      ON CONFLICT DO NOTHING
    `, [userId]);

    // Insert sample learning progress
    await db.query(`
      INSERT INTO user_learning_progress (user_id, course_id, progress_percentage, completed_modules, total_modules)
      VALUES 
        ($1, 'workflow-fundamentals', 75, ARRAY['intro', 'basic-nodes', 'connections'], 4),
        ($1, 'advanced-automation', 30, ARRAY['advanced-triggers'], 6),
        ($1, 'god-tier-features', 90, ARRAY['quantum-basics', 'reality-fabrication', 'consciousness-feed'], 4)
      ON CONFLICT (user_id, course_id) 
      DO UPDATE SET 
        progress_percentage = EXCLUDED.progress_percentage,
        completed_modules = EXCLUDED.completed_modules,
        total_modules = EXCLUDED.total_modules,
        updated_at = NOW()
    `, [userId]);

    // Insert sample certifications
    await db.query(`
      INSERT INTO user_certifications (user_id, certification_id, score)
      VALUES 
        ($1, 'kairo-fundamentals', 95),
        ($1, 'workflow-expert', 87)
      ON CONFLICT (user_id, certification_id) 
      DO UPDATE SET 
        score = EXCLUDED.score,
        earned_date = NOW()
    `, [userId]);

    console.log('[DATABASE] Sample data created successfully');
  } catch (error) {
    console.error('[DATABASE] Error creating sample data:', error);
    throw error;
  }
}