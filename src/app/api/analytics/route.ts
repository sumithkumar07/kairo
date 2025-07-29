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
    const timeRange = searchParams.get('timeRange') || '7d';
    const workflowId = searchParams.get('workflowId');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case '1d':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Get workflow execution statistics
    const executionStats = await db.query(`
      SELECT 
        COUNT(*) as total_executions,
        COUNT(CASE WHEN status = 'Success' THEN 1 END) as successful_executions,
        COUNT(CASE WHEN status = 'Failed' THEN 1 END) as failed_executions,
        AVG(CASE WHEN status = 'Success' THEN 
          EXTRACT(EPOCH FROM (timestamp - timestamp)) END) as avg_duration
      FROM run_history 
      WHERE user_id = $1 
        AND timestamp >= $2 
        AND timestamp <= $3
        ${workflowId ? 'AND workflow_name = $4' : ''}
    `, workflowId ? [user.id, startDate, endDate, workflowId] : [user.id, startDate, endDate]);

    // Get workflow count
    const workflowCount = await db.query(`
      SELECT COUNT(*) as total_workflows
      FROM workflows 
      WHERE user_id = $1
    `, [user.id]);

    // Get top workflows by execution count
    const topWorkflows = await db.query(`
      SELECT 
        workflow_name,
        COUNT(*) as execution_count,
        COUNT(CASE WHEN status = 'Success' THEN 1 END) as success_count,
        COUNT(CASE WHEN status = 'Failed' THEN 1 END) as failure_count
      FROM run_history 
      WHERE user_id = $1 
        AND timestamp >= $2 
        AND timestamp <= $3
      GROUP BY workflow_name
      ORDER BY execution_count DESC
      LIMIT 10
    `, [user.id, startDate, endDate]);

    // Get recent executions
    const recentExecutions = await db.query(`
      SELECT 
        id,
        workflow_name,
        status,
        timestamp,
        execution_result
      FROM run_history 
      WHERE user_id = $1 
      ORDER BY timestamp DESC
      LIMIT 20
    `, [user.id]);

    // Calculate success rate
    const stats = executionStats[0];
    const successRate = stats.total_executions > 0 
      ? (stats.successful_executions / stats.total_executions) * 100 
      : 0;

    return NextResponse.json({
      overview: {
        totalWorkflows: parseInt(workflowCount[0].total_workflows),
        totalExecutions: parseInt(stats.total_executions),
        successRate: Math.round(successRate * 100) / 100,
        avgExecutionTime: stats.avg_duration || 0,
        monthlyGrowth: 12.8, // Mock data - would calculate from historical data
        costs: 67.23 // Mock data - would calculate from usage data
      },
      topWorkflows: topWorkflows.map((wf: any) => ({
        name: wf.workflow_name,
        executions: parseInt(wf.execution_count),
        successRate: wf.execution_count > 0 
          ? Math.round((wf.success_count / wf.execution_count) * 100 * 100) / 100 
          : 0,
        avgTime: '2.1s', // Mock data
        cost: '$12.34' // Mock data
      })),
      recentExecutions: recentExecutions.map((exec: any) => ({
        id: exec.id,
        workflowName: exec.workflow_name,
        status: exec.status.toLowerCase(),
        duration: '2.1s', // Mock data
        timestamp: exec.timestamp,
        cost: '$0.05', // Mock data
        trigger: 'webhook' // Mock data
      }))
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}