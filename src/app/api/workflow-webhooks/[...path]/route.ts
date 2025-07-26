
import { NextRequest, NextResponse } from 'next/server';
import type { Workflow, WorkflowNode, WorkflowRunRecord } from '@/types/workflow';
import { findWorkflowByWebhookPath, saveRunRecord, getCredentialValueByNameForUser } from '@/services/workflow-storage-service';
import { executeWorkflow } from '@/lib/workflow-engine';


// Helper function to resolve potential placeholders in the security token
async function resolveSecurityToken(tokenValue: string | undefined, userId: string): Promise<string | undefined> {
  if (!tokenValue) return undefined;

  const envVarMatch = tokenValue.match(/^{{\s*env\.([^}\s]+)\s*}}$/);
  if (envVarMatch) {
    return process.env[envVarMatch[1]];
  }

  const credentialMatch = tokenValue.match(/^{{\s*credential\.([^}\s]+)\s*}}$/);
  if (credentialMatch) {
    const credName = credentialMatch[1];
    const storedCred = await getCredentialValueByNameForUser(credName, userId);
    if (storedCred) return storedCred;
    
    // Fallback for local dev
    return process.env[credName] || process.env[`${credName}_TOKEN`] || process.env[`${credName}_SECRET`];
  }
  
  // If no placeholder, return the raw value
  return tokenValue;
}


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathSuffix = path.join('/');
    console.log(`[API Webhook] Received POST for pathSuffix: '${pathSuffix}'`);

    let requestBody: any = null;
    try {
      const bodyText = await request.text();
      if (bodyText.trim()) {
        const contentType = request.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          requestBody = JSON.parse(bodyText);
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const params = new URLSearchParams(bodyText);
          requestBody = Object.fromEntries(params.entries());
        } else {
          requestBody = bodyText; // Treat as plain text
        }
      }
    } catch (e: any) {
        console.warn(`[API Webhook] Could not parse request body for path '${pathSuffix}'. Error: ${e.message}. Treating body as null.`);
        requestBody = null;
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

    const findResult = await findWorkflowByWebhookPath(pathSuffix);

    if (!findResult) {
      console.error(`[API Webhook] No workflow configured for pathSuffix: ${pathSuffix}`);
      return NextResponse.json({ message: 'Webhook path not configured for any workflow' }, { status: 404 });
    }
    
    const { workflow: workflowToExecute, userId } = findResult;

    const webhookTriggerNode = workflowToExecute.nodes.find(
      (n: WorkflowNode) => n.type === 'webhookTrigger' && n.config?.pathSuffix === pathSuffix
    );
    
    if (!webhookTriggerNode) {
      console.error(`[API Webhook] Workflow for path ${pathSuffix} found, but trigger node with matching path is missing.`);
      return NextResponse.json({ message: 'Workflow configuration error: Inconsistent webhook trigger node.' }, { status: 500 });
    }

    if (webhookTriggerNode.config?.securityToken) {
        const expectedToken = await resolveSecurityToken(webhookTriggerNode.config.securityToken, userId);
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
      const executionResult = await executeWorkflow(workflowToExecute, false, userId, initialDataForWorkflow); 
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
      await saveRunRecord(runRecord, userId);

      if (hasErrors) {
         return NextResponse.json(
          { message: 'Webhook received. Workflow executed with errors.', path: pathSuffix, executionDetails: { logsSummary: `Found ${executionResult.serverLogs.filter(l=>l.type === 'error').length} error(s). Check server logs for full details.` } }, 
          { status: 207 } // Multi-Status
        );
      }

      return NextResponse.json(
        { message: 'Webhook received and workflow executed successfully.', path: pathSuffix },
        { status: 200 }
      );

    } catch (execError: any) {
      const errorMessage = execError.message || "An unknown execution error occurred.";
      if (errorMessage.includes('Monthly run limit')) {
        console.warn(`[API Webhook] User ${userId} exceeded run limit for path ${pathSuffix}.`);
        return NextResponse.json(
            { message: 'Monthly run limit exceeded.', error: errorMessage },
            { status: 429 } // 429 Too Many Requests is the standard for rate limiting
        );
      }

      console.error(`[API Webhook] Error executing workflow for ${pathSuffix}:`, execError);
      return NextResponse.json(
        { message: 'Webhook received, but workflow execution failed.', path: pathSuffix, error: errorMessage },
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
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathSuffix = path.join('/');
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
