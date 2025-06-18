
import { NextRequest, NextResponse } from 'next/server';
import { executeWorkflow } from '@/app/actions';
import type { Workflow, WorkflowNode } from '@/types/workflow';
import { EXAMPLE_WORKFLOWS } from '@/config/example-workflows'; // Import example workflows

// Helper function to resolve potential placeholders in the security token
function resolveSecurityToken(tokenValue: string | undefined): string | undefined {
  if (!tokenValue) return undefined;

  const envVarMatch = tokenValue.match(/^{{\s*env\.([^}\s]+)\s*}}$/);
  if (envVarMatch) {
    return process.env[envVarMatch[1]];
  }

  const credentialMatch = tokenValue.match(/^{{\s*credential\.([^}\s]+)\s*}}$/);
  if (credentialMatch) {
    // In a real credential manager, you'd look this up.
    // For now, fallback to an environment variable of the same name.
    return process.env[credentialMatch[1]] || process.env[`${credentialMatch[1]}_TOKEN`] || process.env[`${credentialMatch[1]}_SECRET`];
  }
  
  // If no placeholder, return the raw value
  return tokenValue;
}


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
        // Potentially allow body to be null or handle as text if parsing fails
      }
    } else if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await request.formData();
        requestBody = Object.fromEntries(formData.entries());
    } else if (contentType && (contentType.startsWith('text/') || !contentType)) { // Handle plain text or no content-type
        requestBody = await request.text();
        // If text is empty, it might be intentional, treat as null or empty string for body
        if (requestBody === '') requestBody = null; 
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
    // console.log('[API Webhook] Headers:', JSON.stringify(requestHeaders, null, 2));
    // console.log('[API Webhook] Query Params:', JSON.stringify(requestQuery, null, 2));
    // console.log('[API Webhook] Parsed Body:', JSON.stringify(requestBody, null, 2));

    let workflowToExecute: Workflow | null = null;

    // TODO: Replace this with dynamic workflow loading based on pathSuffix or a database lookup
    const exampleWorkflow = EXAMPLE_WORKFLOWS.find(ex => 
        ex.nodes.some(n => n.type === 'webhookTrigger' && n.config?.pathSuffix === pathSuffix)
    );

    if (exampleWorkflow) {
        workflowToExecute = { nodes: exampleWorkflow.nodes, connections: exampleWorkflow.connections };
        console.log(`[API Webhook] Found example workflow '${exampleWorkflow.name}' for path: ${pathSuffix}`);
    }
    

    if (!workflowToExecute) {
      console.error(`[API Webhook] No workflow configured for pathSuffix: ${pathSuffix}`);
      return NextResponse.json({ message: 'Webhook path not configured for any workflow' }, { status: 404 });
    }

    const webhookTriggerNode = workflowToExecute.nodes.find(
      (n: WorkflowNode) => n.type === 'webhookTrigger' && n.config?.pathSuffix === pathSuffix
    );
    
    let webhookTriggerNodeId = webhookTriggerNode?.id;

    if (webhookTriggerNode && webhookTriggerNode.config?.securityToken) {
        const expectedToken = resolveSecurityToken(webhookTriggerNode.config.securityToken);
        const receivedToken = request.headers.get('X-Webhook-Token');

        if (expectedToken) { // Only validate if a token is configured and resolved
            if (!receivedToken) {
                console.warn(`[API Webhook] Missing X-Webhook-Token header for ${pathSuffix}. Expected token.`);
                return NextResponse.json({ message: 'Unauthorized: Missing security token header.' }, { status: 401 });
            }
            if (receivedToken !== expectedToken) {
                console.warn(`[API Webhook] Invalid X-Webhook-Token for ${pathSuffix}.`);
                return NextResponse.json({ message: 'Forbidden: Invalid security token.' }, { status: 403 });
            }
            console.log(`[API Webhook] Security token validated successfully for ${pathSuffix}.`);
        }
    }


    if (!webhookTriggerNodeId && webhookTriggerNode) { // Should have ID if node exists
        webhookTriggerNodeId = webhookTriggerNode.id;
    } else if (!webhookTriggerNodeId) {
         // Fallback: if no node has matching pathSuffix, assume the first webhookTrigger node is the one.
        const firstTrigger = workflowToExecute.nodes.find((n: WorkflowNode) => n.type === 'webhookTrigger');
        if (firstTrigger) {
            webhookTriggerNodeId = firstTrigger.id;
            console.warn(`[API Webhook] No webhookTrigger node with matching pathSuffix '${pathSuffix}'. Using first webhookTrigger node ID: '${webhookTriggerNodeId}'. Note: Security token validation might be based on this first trigger if it has one.`);
             if (firstTrigger.config?.securityToken) {
                const expectedToken = resolveSecurityToken(firstTrigger.config.securityToken);
                const receivedToken = request.headers.get('X-Webhook-Token');
                if (expectedToken) {
                    if (!receivedToken) return NextResponse.json({ message: 'Unauthorized: Missing security token header (fallback trigger).' }, { status: 401 });
                    if (receivedToken !== expectedToken) return NextResponse.json({ message: 'Forbidden: Invalid security token (fallback trigger).' }, { status: 403 });
                    console.log(`[API Webhook] Security token for fallback trigger validated successfully for ${pathSuffix}.`);
                }
            }
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
    console.log(`[API Webhook] Prepared initialData for node ${webhookTriggerNodeId}`); // Removed potentially large data from log

    try {
      console.log(`[API Webhook] Triggering workflow for pathSuffix: ${pathSuffix} in LIVE mode.`);
      const executionResult = await executeWorkflow(workflowToExecute, false, initialDataForWorkflow); 
      console.log(`[API Webhook] Workflow for pathSuffix ${pathSuffix} executed. Final Data keys:`, Object.keys(executionResult.finalWorkflowData).join(', '));
      
      const hasErrors = Object.values(executionResult.finalWorkflowData).some((nodeOutput: any) => nodeOutput.lastExecutionStatus === 'error');
      if (hasErrors) {
         return NextResponse.json(
          { message: 'Webhook received. Workflow executed with errors.', path: pathSuffix, executionDetails: { logsSummary: `Found ${executionResult.serverLogs.filter(l=>l.type === 'error').length} error(s). Check server logs for full details.` } }, 
          { status: 207 } 
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
    // Example: Slack challenge
    const challenge = request.nextUrl.searchParams.get('challenge');
    if (challenge) {
        console.log(`[API Webhook] Responding to challenge for ${pathSuffix}.`);
        return NextResponse.json({ challenge: challenge }, { status: 200 });
    }

    return NextResponse.json(
        { message: 'Webhook endpoint is active. Use POST to send data.', path: pathSuffix },
        { status: 200 }
    );
}
