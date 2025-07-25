import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get user activity feed
    const activities = await db.query(`
      SELECT 
        'workflow_run' as type,
        workflow_name as title,
        status as status,
        timestamp,
        JSON_BUILD_OBJECT(
          'executionTime', EXTRACT(EPOCH FROM (timestamp + INTERVAL '2 seconds' - timestamp)),
          'workflowId', id
        ) as metadata
      FROM run_history 
      WHERE user_id = $1
      
      UNION ALL
      
      SELECT 
        'workflow_saved' as type,
        CONCAT('Saved workflow: ', name) as title,
        'success' as status,
        updated_at as timestamp,
        JSON_BUILD_OBJECT('workflowName', name) as metadata
      FROM workflows 
      WHERE user_id = $1
      
      UNION ALL
      
      SELECT 
        'ai_command' as type,
        CONCAT('AI Command: ', LEFT(command, 50), '...') as title,
        status as status,
        timestamp::timestamp as timestamp,
        JSON_BUILD_OBJECT('command', command) as metadata
      FROM mcp_command_history 
      WHERE user_id = $1
      
      ORDER BY timestamp DESC
      LIMIT $2
    `, [user.id, limit]);

    return NextResponse.json({
      activities: activities.map(activity => ({
        type: activity.type,
        title: activity.title,
        status: activity.status,
        timestamp: activity.timestamp,
        metadata: activity.metadata
      }))
    });

  } catch (error) {
    console.error('User activity API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}