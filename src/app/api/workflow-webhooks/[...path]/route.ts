
import { NextRequest, NextResponse } from 'next/server';
import { executeWorkflow } from '@/app/actions';
import type { Workflow, WorkflowNode, WorkflowRunRecord } from '@/types/workflow';
import { findWorkflowByWebhookPath, saveRunRecord } from '@/services/workflow-storage-service';

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
        // Attempt to read as text if JSON parsing fails but content-type was json
        try {
            const textBody = await request.text();
            requestBody = textBody.trim() === '' ? null : textBody;
        } catch (textErr) {
            console.warn('[API Webhook] Could not read body as text after JSON parse failure:', textErr);
            requestBody = null;
        }
      }
    } else if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
        try {
            const formData = await request.formData();
            requestBody = Object.fromEntries(formData.entries());
        } catch (e) {
            console.warn('[API Webhook] Could not parse form-urlencoded body:', e);
            requestBody = null;
        }
    } else if (contentType && contentType.startsWith('text/')) { 
        try {
            const textBody = await request.text();
            requestBody = textBody.trim() === '' ? null : textBody;
        } catch (e) {
            console.warn('[API Webhook] Could not read text body:', e);
            requestBody = null;
        }
    } else if (!contentType) { // No content-type, try to read as text
        try {
            const textBody = await request.text();
            // If body is empty, it's fine, otherwise assign.
            requestBody = textBody.trim() === '' ? null : textBody;
        } catch (e) {
            console.warn('[API Webhook] Could not read body as text (no content-type specified):', e);
            requestBody = null; // Default to null if reading fails
        }
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

    const workflowToExecute = await findWorkflowByWebhookPath(pathSuffix);

    if (!workflowToExecute) {
      console.error(`[API Webhook] No workflow configured for pathSuffix: ${pathSuffix}`);
      return NextResponse.json({ message: 'Webhook path not configured for any workflow' }, { status: 404 });
    }

    const webhookTriggerNode = workflowToExecute.nodes.find(
      (n: WorkflowNode) => n.type === 'webhookTrigger' && n.config?.pathSuffix === pathSuffix
    );
    
    if (!webhookTriggerNode) {
      console.error(`[API Webhook] Workflow for path ${pathSuffix} found, but trigger node with matching path is missing.`);
      return NextResponse.json({ message: 'Workflow configuration error: Inconsistent webhook trigger node.' }, { status: 500 });
    }

    if (webhookTriggerNode.config?.securityToken) {
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
    
    const initialDataForWorkflow = {
      [webhookTriggerNode.id]: { 
        requestBody: requestBody,
        requestHeaders: requestHeaders,
        requestQuery: requestQuery,
        status: 'success' 
      }
    };
    console.log(`[API Webhook] Prepared initialData for node ${webhookTriggerNode.id}`);

    try {
      console.log(`[API Webhook] Triggering workflow for pathSuffix: ${pathSuffix} in LIVE mode.`);
      const executionResult = await executeWorkflow(workflowToExecute, false, initialDataForWorkflow); 
      console.log(`[API Webhook] Workflow for pathSuffix ${pathSuffix} executed. Final Data keys:`, Object.keys(executionResult.finalWorkflowData).join(', '));
      
      const hasErrors = Object.values(executionResult.finalWorkflowData).some((nodeOutput: any) => nodeOutput.lastExecutionStatus === 'error');
      
      // Save the run record
      const runRecord: WorkflowRunRecord = {
        id: crypto.randomUUID(),
        workflowName: `Webhook: ${pathSuffix}`,
        timestamp: new Date().toISOString(),
        status: hasErrors ? 'Failed' : 'Success',
        executionResult: executionResult,
        initialData: initialDataForWorkflow,
        workflowSnapshot: workflowToExecute,
      };
      await saveRunRecord(runRecord);

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
