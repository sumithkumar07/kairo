
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathSuffix = params.path.join('/');
    const requestBody = await request.json().catch(() => null); // Gracefully handle no body or non-JSON body
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


    console.log(`[API Webhook] Received POST request for path: /api/workflow-webhooks/${pathSuffix}`);
    console.log('[API Webhook] Headers:', JSON.stringify(requestHeaders, null, 2));
    console.log('[API Webhook] Query Params:', JSON.stringify(requestQuery, null, 2));
    console.log('[API Webhook] Body:', JSON.stringify(requestBody, null, 2));

    // TODO:
    // 1. Authenticate the webhook (e.g., using a security token from the node's config).
    //    - Find the workflow node that has `pathSuffix` matching `pathSuffix`.
    //    - Compare `requestHeaders['x-webhook-token']` with `node.config.securityToken`.
    // 2. Find the workflow associated with this `pathSuffix`.
    //    - This requires a system to store and retrieve saved workflows.
    // 3. Trigger the execution of that workflow.
    //    - Prepare initial data for the workflow's webhookTrigger node:
    //      const initialData = {
    //        [webhookTriggerNodeId]: {
    //          requestBody: requestBody,
    //          requestHeaders: requestHeaders,
    //          requestQuery: requestQuery,
    //          status: 'success'
    //        }
    //      };
    //    - Call a modified `executeWorkflow` function:
    //      `await executeWorkflow(retrievedWorkflow, initialData, isSimulationMode: false);`
    //      (executeWorkflow needs to accept initial data and pass it to executeFlowInternal)

    return NextResponse.json(
      { message: 'Webhook received successfully', path: pathSuffix, receivedData: requestBody },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { message: 'Error processing webhook', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// Optionally, handle GET requests if needed (e.g., for webhook verification challenges)
export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const pathSuffix = params.path.join('/');
    console.log(`[API Webhook] Received GET request for path: /api/workflow-webhooks/${pathSuffix}`);
    // For some services, GET is used for webhook validation (e.g. Facebook Messenger, Slack)
    // You might need to implement specific challenge-response logic here based on the service.
    return NextResponse.json(
        { message: 'Webhook endpoint is active. Use POST to send data.', path: pathSuffix },
        { status: 200 }
    );
}
