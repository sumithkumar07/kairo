import { NextRequest } from 'next/server';
import { validateRequest, schemas, APIResponse } from '@/lib/validation';
import { withSecurity, rateLimiters } from '@/lib/security';
import { db } from '@/lib/database-server';
import { z } from 'zod';

// Error reporting schema
const errorReportSchema = z.object({
  error: z.object({
    message: z.string(),
    stack: z.string().optional(),
    name: z.string()
  }),
  errorInfo: z.object({
    componentStack: z.string().optional()
  }).optional(),
  timestamp: z.string(),
  userAgent: z.string(),
  url: z.string(),
  type: z.enum(['boundary_error', 'async_error', 'api_error']).default('boundary_error'),
  userId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  additionalContext: z.record(z.any()).optional()
});

async function handleErrorReport(request: NextRequest) {
  try {
    // Validate request data
    const validation = await validateRequest(errorReportSchema)(request);
    if (validation.error) {
      return APIResponse.validation([validation.error]);
    }

    const errorData = validation.data;

    // Store error in database
    try {
      await db.query(`
        INSERT INTO error_logs (
          error_message,
          error_stack,
          error_name,
          error_type,
          user_agent,
          url,
          user_id,
          session_id,
          additional_context,
          timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        errorData.error.message,
        errorData.error.stack || null,
        errorData.error.name,
        errorData.type,
        errorData.userAgent,
        errorData.url,
        errorData.userId || null,
        errorData.sessionId || null,
        JSON.stringify(errorData.additionalContext || {}),
        new Date(errorData.timestamp)
      ]);
    } catch (dbError) {
      // If database insert fails, at least log to console
      console.error('[ERROR_MONITORING] Failed to store error in database:', dbError);
      console.error('[ERROR_MONITORING] Original error:', errorData);
    }

    // Log to console for immediate visibility
    console.error('[ERROR_MONITORING] Client error reported:', {
      message: errorData.error.message,
      type: errorData.type,
      url: errorData.url,
      userAgent: errorData.userAgent,
      timestamp: errorData.timestamp
    });

    // In production, you might want to send critical errors to external monitoring
    if (shouldAlertOnError(errorData)) {
      await sendErrorAlert(errorData);
    }

    return APIResponse.success(
      { received: true },
      'Error report received successfully'
    );

  } catch (error) {
    console.error('[ERROR_MONITORING] Failed to process error report:', error);
    
    return APIResponse.error(
      'Failed to process error report',
      'ERROR_PROCESSING_FAILED',
      500
    );
  }
}

// Determine if error should trigger alerts
function shouldAlertOnError(errorData: z.infer<typeof errorReportSchema>): boolean {
  const criticalPatterns = [
    /database.*connection/i,
    /payment.*failed/i,
    /security.*breach/i,
    /unauthorized.*access/i,
    /data.*corruption/i
  ];

  return criticalPatterns.some(pattern => 
    pattern.test(errorData.error.message) || 
    pattern.test(errorData.error.name)
  );
}

// Send error alerts to external systems
async function sendErrorAlert(errorData: z.infer<typeof errorReportSchema>): Promise<void> {
  try {
    // Example: Send to Slack, Discord, email, or monitoring service
    // This is a placeholder for your actual alerting system
    
    console.warn('[ERROR_MONITORING] CRITICAL ERROR DETECTED:', {
      message: errorData.error.message,
      url: errorData.url,
      timestamp: errorData.timestamp,
      userAgent: errorData.userAgent
    });

    // Example Slack webhook (uncomment and configure for production)
    /*
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 Critical Error in Kairo`,
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'Error', value: errorData.error.message, short: false },
              { title: 'URL', value: errorData.url, short: true },
              { title: 'Timestamp', value: errorData.timestamp, short: true }
            ]
          }]
        })
      });
    }
    */

  } catch (alertError) {
    console.error('[ERROR_MONITORING] Failed to send error alert:', alertError);
  }
}

// Create error_logs table if it doesn't exist
async function ensureErrorLogsTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        error_message TEXT NOT NULL,
        error_stack TEXT,
        error_name VARCHAR(255),
        error_type VARCHAR(50) DEFAULT 'boundary_error',
        user_agent TEXT,
        url TEXT,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        session_id TEXT,
        additional_context JSONB,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create indexes for better query performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
      CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
    `);

  } catch (error) {
    console.error('[ERROR_MONITORING] Failed to create error_logs table:', error);
  }
}

// Initialize table on first import
ensureErrorLogsTable();

export const POST = withSecurity(handleErrorReport, {
  rateLimiter: rateLimiters.general, // Allow reasonable error reporting
  allowedMethods: ['POST']
});