
import { NextRequest, NextResponse } from 'next/server';
// import { executeWorkflow } from '@/app/actions'; // TODO: Uncomment when workflow persistence is ready
// import type { Workflow } from '@/types/workflow'; // TODO: Uncomment when workflow persistence is ready

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
        // Keep requestBody as null or an empty object, or handle as an error depending on requirements
      }
    } else if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        requestBody = Object.fromEntries(formData.entries());
    } else if (contentType && contentType.startsWith('text/')) {
        requestBody = await request.text();
    }
    // Add more content type handlers if needed


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

    // TODO: Step 1: Workflow Lookup
    // const workflowToExecute: Workflow | null = await findWorkflowByPathSuffix(pathSuffix); // Implement this function
    // if (!workflowToExecute) {
    //   console.error(`[API Webhook] No workflow found for pathSuffix: ${pathSuffix}`);
    //   return NextResponse.json({ message: 'Webhook path not configured for any workflow' }, { status: 404 });
    // }
    console.log(`[API Webhook] TODO: Find workflow by pathSuffix '${pathSuffix}'.`);


    // TODO: Step 2: Find the Webhook Trigger Node ID within the workflow
    // This might require a convention, e.g., the first node is the trigger, or the node.config.pathSuffix matches.
    // For now, let's assume we'd find a `webhookTriggerNodeId` from `workflowToExecute.nodes`.
    // const webhookTriggerNodeId = workflowToExecute.nodes.find(n => n.type === 'webhookTrigger' && n.config.pathSuffix === pathSuffix)?.id;
    // if (!webhookTriggerNodeId) {
    //    console.error(`[API Webhook] Workflow for ${pathSuffix} does not have a matching webhookTrigger node.`);
    //    return NextResponse.json({ message: 'Workflow configuration error for webhook trigger' }, { status: 500 });
    // }
    const conceptualWebhookTriggerNodeId = "node_trigger_1"; // Placeholder
    console.log(`[API Webhook] TODO: Identify webhookTrigger node ID within the workflow (e.g., '${conceptualWebhookTriggerNodeId}').`);


    // Prepare initialData for workflow execution
    const initialDataForWorkflow = {
      [conceptualWebhookTriggerNodeId]: { // Use the actual ID of the webhookTrigger node from the workflow
        requestBody: requestBody,
        requestHeaders: requestHeaders,
        requestQuery: requestQuery,
        status: 'success' // Default status for received trigger data
      }
    };
    console.log('[API Webhook] Prepared initialData (conceptual):', JSON.stringify(initialDataForWorkflow, null, 2));

    // TODO: Step 3: Execute the workflow
    // try {
    //   console.log(`[API Webhook] Triggering workflow ID: ${workflowToExecute.id} (conceptual) for pathSuffix: ${pathSuffix}`);
    //   await executeWorkflow(workflowToExecute, false, initialDataForWorkflow); // isSimulationMode = false
    //   console.log(`[API Webhook] Workflow for pathSuffix ${pathSuffix} triggered successfully.`);
    // } catch (execError: any) {
    //   console.error(`[API Webhook] Error executing workflow for ${pathSuffix}:`, execError);
    //   // Depending on requirements, you might want to return a 500 error here
    //   // or still return a 200 if the webhook was received but execution failed later.
    // }
    console.log(`[API Webhook] TODO: Call executeWorkflow with the found workflow and prepared initialData.`);


    return NextResponse.json(
      { message: 'Webhook received. Workflow execution pending full implementation.', path: pathSuffix, receivedData: { body: requestBody, headers: requestHeaders, query: requestQuery } },
      { status: 202 } // 202 Accepted: request accepted, processing will occur (conceptually)
    );
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
