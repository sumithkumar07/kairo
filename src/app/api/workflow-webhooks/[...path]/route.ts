
import { NextRequest, NextResponse } from 'next/server';
import { executeWorkflow } from '@/app/actions';
import type { Workflow, WorkflowNode } from '@/types/workflow';
import { EXAMPLE_WORKFLOWS } from '@/config/example-workflows'; // Import example workflows

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathSuffix = params.path.join('/');
    let requestBody: any = null;
    const contentType = request.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      try {
        requestBody = await request.json();
      } catch (e) {
        console.warn('[API Webhook] Could not parse JSON body:', e);
      }
    } else if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        requestBody = Object.fromEntries(formData.entries());
    } else if (contentType && contentType.startsWith('text/')) {
        requestBody = await request.text();
    }


    const requestHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      requestHeaders[key] = value;
    });

    const requestQuery: Record<string, string | string[]> = {};
    request.nextUrl.searchParams.forEach((value, key) => {
        if (requestQuery[key]) {
            if(Array.isArray(requestQuery[key])) {
                (requestQuery[key] as string[]).push(value);
            } else {
                requestQuery[key] = [requestQuery[key] as string, value];
            }
        } else {
            requestQuery[key] = value;
        }
    });


    console.log(`[API Webhook] Received POST for pathSuffix: '${pathSuffix}'`);
    console.log('[API Webhook] Headers:', JSON.stringify(requestHeaders, null, 2));
    console.log('[API Webhook] Query Params:', JSON.stringify(requestQuery, null, 2));
    console.log('[API Webhook] Parsed Body:', JSON.stringify(requestBody, null, 2));

    let workflowToExecute: Workflow | null = null;

    // Simple hardcoded lookup for a specific example
    if (pathSuffix === 'run-simple-api-example') {
      const example = EXAMPLE_WORKFLOWS.find(ex => ex.name === 'Simple API Fetch & Log');
      if (example) {
        workflowToExecute = { nodes: example.nodes, connections: example.connections };
        console.log(`[API Webhook] Found 'Simple API Fetch & Log' example workflow for path: ${pathSuffix}`);
      }
    }
    // Add more `else if` blocks here for other hardcoded webhook paths and their corresponding workflows

    if (!workflowToExecute) {
      console.error(`[API Webhook] No workflow configured for pathSuffix: ${pathSuffix}`);
      return NextResponse.json({ message: 'Webhook path not configured for any workflow' }, { status: 404 });
    }

    // Find the webhookTrigger node within this workflow
    const webhookTriggerNode = workflowToExecute.nodes.find(
      (n: WorkflowNode) => n.type === 'webhookTrigger' && (n.config?.pathSuffix === pathSuffix || !n.config?.pathSuffix) // Fallback if pathSuffix not in config for some reason
    );
    
    let webhookTriggerNodeId = webhookTriggerNode?.id;

    if (!webhookTriggerNodeId) {
      // Fallback: if no node has pathSuffix, assume the first webhookTrigger node is the one.
      const firstTrigger = workflowToExecute.nodes.find((n: WorkflowNode) => n.type === 'webhookTrigger');
      if (firstTrigger) {
        webhookTriggerNodeId = firstTrigger.id;
        console.warn(`[API Webhook] No webhookTrigger node with matching pathSuffix '${pathSuffix}'. Using first webhookTrigger node ID: '${webhookTriggerNodeId}'.`);
      } else {
        console.error(`[API Webhook] Workflow for ${pathSuffix} does not have a webhookTrigger node.`);
        return NextResponse.json({ message: 'Workflow configuration error: No webhookTrigger node found.' }, { status: 500 });
      }
    }
    
    const initialDataForWorkflow = {
      [webhookTriggerNodeId]: { 
        requestBody: requestBody,
        requestHeaders: requestHeaders,
        requestQuery: requestQuery,
        status: 'success' 
      }
    };
    console.log(`[API Webhook] Prepared initialData for node ${webhookTriggerNodeId}:`, JSON.stringify(initialDataForWorkflow, null, 2));

    try {
      console.log(`[API Webhook] Triggering workflow for pathSuffix: ${pathSuffix} in LIVE mode.`);
      // Note: Workflow ID isn't a concept here yet as we load from examples.
      const executionResult = await executeWorkflow(workflowToExecute, false, initialDataForWorkflow); // isSimulationMode = false
      console.log(`[API Webhook] Workflow for pathSuffix ${pathSuffix} executed. Final Data (sample):`, JSON.stringify(executionResult.finalWorkflowData, null, 2).substring(0, 200));
      
      // Determine overall success or failure from executionResult to send appropriate response
      const hasErrors = Object.values(executionResult.finalWorkflowData).some((nodeOutput: any) => nodeOutput.lastExecutionStatus === 'error');
      if (hasErrors) {
         return NextResponse.json(
          { message: 'Webhook received. Workflow executed with errors.', path: pathSuffix, executionDetails: { logs: executionResult.serverLogs.slice(-5) } }, // Send last 5 logs
          { status: 207 } // Multi-Status, indicating partial success or some failures
        );
      }

      return NextResponse.json(
        { message: 'Webhook received and workflow executed successfully.', path: pathSuffix },
        { status: 200 }
      );

    } catch (execError: any) {
      console.error(`[API Webhook] Error executing workflow for ${pathSuffix}:`, execError);
      return NextResponse.json(
        { message: 'Webhook received, but workflow execution failed.', path: pathSuffix, error: execError.message },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[API Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { message: 'Error processing webhook', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const pathSuffix = params.path.join('/');
    console.log(`[API Webhook] Received GET request for path: /api/workflow-webhooks/${pathSuffix}`);
    // For some services, GET is used for webhook validation (e.g. Facebook Messenger, Slack)
    return NextResponse.json(
        { message: 'Webhook endpoint is active. Use POST to send data.', path: pathSuffix },
        { status: 200 }
    );
}
