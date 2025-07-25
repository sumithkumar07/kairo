-- Database migrations for enhanced features
-- Run these migrations to support the new consolidated functionality

-- Learning Progress Table
CREATE TABLE IF NOT EXISTS user_learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    progress_percentage INTEGER DEFAULT 0,
    completed_modules TEXT[] DEFAULT '{}',
    total_modules INTEGER DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- User Certifications Table
CREATE TABLE IF NOT EXISTS user_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    certification_id TEXT NOT NULL,
    earned_date TIMESTAMP DEFAULT NOW(),
    score INTEGER,
    certificate_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, certification_id)
);

-- User Notifications Table
CREATE TABLE IF NOT EXISTS user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'info', 'warning', 'error', 'success'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read_at TIMESTAMP NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Run History with Performance Metrics
ALTER TABLE run_history ADD COLUMN IF NOT EXISTS execution_duration INTERVAL;
ALTER TABLE run_history ADD COLUMN IF NOT EXISTS resource_usage JSONB DEFAULT '{}';
ALTER TABLE run_history ADD COLUMN IF NOT EXISTS trigger_type TEXT DEFAULT 'manual';
ALTER TABLE run_history ADD COLUMN IF NOT EXISTS cost_cents INTEGER DEFAULT 0;

-- User Activity Log
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    activity_title TEXT NOT NULL,
    activity_description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced Workflow Metrics
CREATE TABLE IF NOT EXISTS workflow_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    workflow_name TEXT NOT NULL,
    metric_type TEXT NOT NULL, -- 'execution_time', 'success_rate', 'error_rate'
    metric_value DECIMAL,
    recorded_at TIMESTAMP DEFAULT NOW(),
    time_period TEXT DEFAULT 'daily' -- 'hourly', 'daily', 'weekly', 'monthly'
);

-- Integration Usage Tracking
CREATE TABLE IF NOT EXISTS integration_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    integration_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP DEFAULT NOW(),
    month_year TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM'),
    UNIQUE(user_id, integration_name, month_year)
);

-- Tutorial Progress
CREATE TABLE IF NOT EXISTS tutorial_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    tutorial_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMP,
    progress_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, tutorial_id)
);

-- Feature Usage Analytics
CREATE TABLE IF NOT EXISTS feature_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_user_id ON user_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_user_id ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read_at ON user_notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_metrics_user_id ON workflow_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_metrics_recorded_at ON workflow_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_integration_usage_user_id ON integration_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_progress_user_id ON tutorial_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON feature_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_run_history_timestamp ON run_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_run_history_user_id_timestamp ON run_history(user_id, timestamp);

-- Functions for analytics
CREATE OR REPLACE FUNCTION get_user_analytics(p_user_id TEXT, p_days INTEGER DEFAULT 7)
RETURNS TABLE (
    total_workflows INTEGER,
    total_executions INTEGER,
    success_rate DECIMAL,
    avg_execution_time DECIMAL,
    most_used_integration TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM workflows WHERE user_id = p_user_id) as total_workflows,
        (SELECT COUNT(*)::INTEGER FROM run_history WHERE user_id = p_user_id 
         AND timestamp >= NOW() - INTERVAL '%s days' FORMAT(p_days)) as total_executions,
        (SELECT ROUND(
            CASE 
                WHEN COUNT(*) = 0 THEN 0
                ELSE COUNT(CASE WHEN status = 'Success' THEN 1 END)::DECIMAL / COUNT(*) * 100
            END, 2
        ) FROM run_history WHERE user_id = p_user_id 
         AND timestamp >= NOW() - INTERVAL '%s days' FORMAT(p_days)) as success_rate,
        (SELECT ROUND(AVG(EXTRACT(EPOCH FROM execution_duration))::DECIMAL, 2) 
         FROM run_history WHERE user_id = p_user_id 
         AND timestamp >= NOW() - INTERVAL '%s days' FORMAT(p_days)
         AND execution_duration IS NOT NULL) as avg_execution_time,
        (SELECT integration_name FROM integration_usage WHERE user_id = p_user_id 
         ORDER BY usage_count DESC LIMIT 1) as most_used_integration;
END;
$$ LANGUAGE plpgsql;

-- Function to update feature usage
CREATE OR REPLACE FUNCTION update_feature_usage(p_user_id TEXT, p_feature_name TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO feature_usage (user_id, feature_name, usage_count, last_used)
    VALUES (p_user_id, p_feature_name, 1, NOW())
    ON CONFLICT (user_id, feature_name) 
    DO UPDATE SET 
        usage_count = feature_usage.usage_count + 1,
        last_used = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id TEXT, 
    p_activity_type TEXT, 
    p_activity_title TEXT, 
    p_activity_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_activity_log (user_id, activity_type, activity_title, activity_description, metadata)
    VALUES (p_user_id, p_activity_type, p_activity_title, p_activity_description, p_metadata);
END;
$$ LANGUAGE plpgsql;

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id TEXT,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO user_notifications (user_id, type, title, message, metadata)
    VALUES (p_user_id, p_type, p_title, p_message, p_metadata)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Views for common queries
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT 
    u.id as user_id,
    (SELECT COUNT(*) FROM workflows WHERE user_id = u.id) as total_workflows,
    (SELECT COUNT(*) FROM run_history WHERE user_id = u.id AND timestamp >= NOW() - INTERVAL '30 days') as monthly_executions,
    (SELECT COUNT(*) FROM user_certifications WHERE user_id = u.id) as certifications_earned,
    (SELECT COUNT(*) FROM user_notifications WHERE user_id = u.id AND read_at IS NULL) as unread_notifications
FROM users u;

CREATE OR REPLACE VIEW workflow_performance_summary AS
SELECT 
    rh.user_id,
    rh.workflow_name,
    COUNT(*) as total_executions,
    COUNT(CASE WHEN status = 'Success' THEN 1 END) as successful_executions,
    COUNT(CASE WHEN status = 'Failed' THEN 1 END) as failed_executions,
    ROUND(COUNT(CASE WHEN status = 'Success' THEN 1 END)::DECIMAL / COUNT(*) * 100, 2) as success_rate,
    AVG(EXTRACT(EPOCH FROM execution_duration)) as avg_execution_time,
    SUM(cost_cents) as total_cost_cents
FROM run_history rh
WHERE rh.timestamp >= NOW() - INTERVAL '30 days'
GROUP BY rh.user_id, rh.workflow_name;

-- Update existing tables if needed
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS star_count INTEGER DEFAULT 0;

-- Insert default learning paths
INSERT INTO user_learning_progress (user_id, course_id, total_modules) VALUES 
('default', 'beginner', 12),
('default', 'intermediate', 18),
('default', 'ai-powered', 15),
('default', 'enterprise', 24)
ON CONFLICT (user_id, course_id) DO NOTHING;

COMMIT;