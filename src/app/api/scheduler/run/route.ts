
import { NextRequest, NextResponse } from 'next/server';
import { getAllScheduledWorkflows } from '@/services/workflow-storage-service';
import { executeWorkflow } from '@/lib/workflow-engine';
import { parseExpression } from 'cron-parser';

export async function POST(request: NextRequest) {
  // --- API Key Authentication ---
  const authHeader = request.headers.get('Authorization');
  const expectedApiKey = `Bearer ${process.env.SCHEDULER_SECRET_KEY}`;

  if (!process.env.SCHEDULER_SECRET_KEY) {
    console.error('[API Scheduler] FATAL: SCHEDULER_SECRET_KEY is not set on the server.');
    return NextResponse.json({ error: 'Scheduler not configured on server.' }, { status: 500 });
  }

  if (authHeader !== expectedApiKey) {
    console.warn(`[API Scheduler] Failed auth attempt.`);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // --- End Authentication ---

  try {
    const scheduledWorkflows = await getAllScheduledWorkflows();
    const now = new Date();
    let triggeredCount = 0;

    console.log(`[API Scheduler] Checking ${scheduledWorkflows.length} scheduled workflows at ${now.toISOString()}`);

    for (const { user_id, name, workflow_data } of scheduledWorkflows) {
      const scheduleNode = workflow_data.nodes.find(n => n.type === 'schedule');
      if (!scheduleNode || !scheduleNode.config?.cron) {
        continue;
      }
      
      const cronExpression = scheduleNode.config.cron;

      try {
        const interval = parseExpression(cronExpression, { currentDate: now });
        const previousRunTime = interval.prev().toDate(); // When it should have last run
        
        // Check if the workflow should have run in the last minute (or since the last check)
        const timeSinceLastRun = now.getTime() - previousRunTime.getTime();
        
        // We trigger if the scheduled time was within the last minute (60000ms).
        // This prevents re-triggering if the cron service calls the endpoint slightly late.
        if (timeSinceLastRun <= 60000) { 
          console.log(`[API Scheduler] Triggering workflow "${name}" for user ${user_id} scheduled for ${previousRunTime.toISOString()}`);
          
          const initialData = {
            [scheduleNode.id]: { triggered_at: new Date().toISOString() }
          };

          // Trigger the workflow asynchronously (fire and forget)
          // We don't await this, so the scheduler can quickly check all workflows
          executeWorkflow(workflow_data, false, user_id, initialData).catch(err => {
            console.error(`[API Scheduler] Error during background execution of workflow "${name}":`, err);
          });
          
          triggeredCount++;
        }
      } catch (err: any) {
        console.error(`[API Scheduler] Invalid CRON expression "${cronExpression}" for workflow "${name}". Error: ${err.message}`);
      }
    }

    console.log(`[API Scheduler] Check complete. Triggered ${triggeredCount} out of ${scheduledWorkflows.length} checked workflows.`);

    return NextResponse.json({
      message: 'Scheduler check complete.',
      workflowsChecked: scheduledWorkflows.length,
      workflowsTriggered: triggeredCount,
    });

  } catch (error: any) {
    console.error('[API Scheduler] Error processing scheduled workflows:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
