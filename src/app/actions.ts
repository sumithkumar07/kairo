
'use server';

import { 
  generateWorkflowFromPrompt as genkitGenerateWorkflowFromPrompt,
  type GenerateWorkflowFromPromptInput,
  type GenerateWorkflowFromPromptOutput
} from '@/ai/flows/generate-workflow-from-prompt';
import {
  enhanceUserPrompt as genkitEnhanceUserPrompt,
  type EnhanceUserPromptInput,
  type EnhanceUserPromptOutput
} from '@/ai/flows/enhance-user-prompt-flow';
import {
  suggestNextNode as genkitSuggestNextNode,
  type SuggestNextNodeInput,
  type SuggestNextNodeOutput
} from '@/ai/flows/suggest-next-node';
import {
  explainWorkflow as genkitExplainWorkflow,
  type ExplainWorkflowInput,
  type ExplainWorkflowOutput,
} from '@/ai/flows/explain-workflow-flow';
import {
  assistantChat as genkitAssistantChat,
  type AssistantChatInput,
  type AssistantChatOutput,
} from '@/ai/flows/assistant-chat-flow';
import type { Workflow, ServerLogOutput, WorkflowNode, WorkflowConnection, RetryConfig, BranchConfig, OnErrorWebhookConfig, WorkflowExecutionResult } from '@/types/workflow';
import { ai } from '@/ai/genkit'; 
import nodemailer from 'nodemailer';
import { Pool } from 'pg';
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes'; 
import { format, parseISO } from 'date-fns';
import * as WorkflowStorage from '@/services/workflow-storage-service';


// Initialize the PostgreSQL connection pool at the module level
let pool: Pool | undefined;
function getDbPool() {
  if (!pool) {
    if (!process.env.DB_CONNECTION_STRING) {
      const fatalErrorMsg = "[DB POOL] FATAL: DB_CONNECTION_STRING environment variable is not set. Database operations cannot proceed.";
      console.error(fatalErrorMsg);
      throw new Error(fatalErrorMsg); 
    }
    pool = new Pool({
      connectionString: process.env.DB_CONNECTION_STRING,
    });

    pool.on('error', (err, client) => {
      console.error('[DB POOL] Unexpected error on idle client', err);
    });
    console.log("[DB POOL] PostgreSQL connection pool initialized.");
  }
  return pool;
}

// ================================================================= //
// =================== WORKFLOW UTILITY FUNCTIONS ================== //
// ================================================================= //

function resolveValue(
  value: any, 
  workflowData: Record<string, any>, 
  serverLogs: ServerLogOutput[],
  additionalContexts?: Record<string, any> 
): any {
  if (typeof value !== 'string') {
    return value;
  }

  const placeholderRegex = /{{\s*([^{}\s]+)\s*}}/g;
  let resolvedValue = value;
  let match;
  
  while ((match = placeholderRegex.exec(value)) !== null) {
    const placeholder = match[0]; 
    const path = match[1]; 
    const pathParts = path.split('.'); 
    
    if (pathParts.length === 0) continue;

    const firstPart = pathParts[0];
    let dataFound = false;
    let dataAtPath: any;
    let resolutionSource = '';

    // Check additionalContexts first (e.g., errorContext for webhooks, item for forEach)
    if (additionalContexts && additionalContexts.hasOwnProperty(firstPart)) {
      dataAtPath = additionalContexts[firstPart];
      resolutionSource = 'additionalContext';
      let contextFound = true;
      for (let i = 1; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (dataAtPath && typeof dataAtPath === 'object' && dataAtPath !== null && part in dataAtPath) {
          dataAtPath = dataAtPath[part];
        } else {
          contextFound = false; 
          break;
        }
      }
      if (contextFound) dataFound = true;
    }

    // Then check environment variables
    if (!dataFound && firstPart === 'env' && pathParts.length >= 2) {
      const envVarName = pathParts.slice(1).join('.');
      dataAtPath = process.env[envVarName];
      if (dataAtPath !== undefined) {
        dataFound = true;
        resolutionSource = 'env';
      } else {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[RESOLVE_VALUE] Env var '${envVarName}' not found for placeholder '${placeholder}'.`, type: 'info' });
      }
    }
    
    // Then check credentials (with env fallback)
    if (!dataFound && firstPart === 'credential' && pathParts.length >= 2) {
        const credentialName = pathParts.slice(1).join('.');
        dataAtPath = process.env[credentialName] || process.env[`${credentialName}_API_KEY`] || process.env[`${credentialName}_SECRET`];
        if (dataAtPath !== undefined) {
            dataFound = true;
            resolutionSource = 'credential(env_fallback)';
        } else {
            serverLogs.push({ timestamp: new Date().toISOString(), message: `[RESOLVE_VALUE] Credential '${credentialName}' not found via env fallback.`, type: 'info' });
        }
    }

    // Finally, check workflowData (node outputs)
    if (!dataFound && workflowData.hasOwnProperty(firstPart)) {
        dataAtPath = workflowData[firstPart];
        resolutionSource = 'workflowData';
        let wfDataFound = true;
        for (let i = 1; i < pathParts.length; i++) {
            const part = pathParts[i];
            if (dataAtPath && typeof dataAtPath === 'object' && dataAtPath !== null && part in dataAtPath) {
                dataAtPath = dataAtPath[part];
            } else {
                wfDataFound = false;
                break;
            }
        }
        if (wfDataFound) dataFound = true;
    }
    
    if (dataFound) {
      if (placeholder === value) {
        resolvedValue = dataAtPath;
      } else {
        const replacementValue = (typeof dataAtPath === 'object' && dataAtPath !== null)
          ? JSON.stringify(dataAtPath) 
          : String(dataAtPath ?? '');
        resolvedValue = resolvedValue.replace(placeholder, replacementValue);
      }
    }
  }
  return resolvedValue;
}

function resolveNodeConfig(
  nodeConfig: Record<string, any>, 
  workflowData: Record<string, any>, 
  serverLogs: ServerLogOutput[],
  additionalContexts?: Record<string, any>
): Record<string, any> {
  const resolvedConfig: Record<string, any> = {};
  for (const key in nodeConfig) {
    if (Object.prototype.hasOwnProperty.call(nodeConfig, key)) {
      const value = nodeConfig[key];
      const specialKeys = ['flowGroupNodes', 'flowGroupConnections', 'iterationNodes', 'iterationConnections', 'loopNodes', 'loopConnections', 'branches', 'inputFieldsSchema', 'retry'];
      if (specialKeys.includes(key)) {
        resolvedConfig[key] = value;
      } else if (key === 'onErrorWebhook' && typeof value === 'object' && value !== null) {
         resolvedConfig[key] = resolveNodeConfig(value, workflowData, serverLogs, additionalContexts); 
      } else if (Array.isArray(value)) {
        resolvedConfig[key] = value.map(item => (typeof item === 'object' && item !== null) ? resolveNodeConfig(item, workflowData, serverLogs, additionalContexts) : resolveValue(item, workflowData, serverLogs, additionalContexts));
      } else if (typeof value === 'object' && value !== null) {
        resolvedConfig[key] = resolveNodeConfig(value, workflowData, serverLogs, additionalContexts); 
      } else {
        resolvedConfig[key] = resolveValue(value, workflowData, serverLogs, additionalContexts);
      }
    }
  }
  return resolvedConfig;
}

function evaluateCondition(conditionString: string, nodeIdentifier: string, serverLogs: ServerLogOutput[]): boolean {
  if (typeof conditionString !== 'string' || conditionString.trim() === '') {
      serverLogs.push({ timestamp: new Date().toISOString(), message: `[CONDITION EVAL] Node ${nodeIdentifier}: Condition is empty or not a string. Evaluating to false.`, type: 'info' });
      return false; 
  }
  
  try {
      const operators = ['===', '!==', '==', '!=', '<=', '>=', '<', '>'];
      let operatorFound: string | null = null;
      let parts: string[] = [];

      for (const op of operators) {
          const splitIndex = conditionString.indexOf(op);
          if (splitIndex !== -1) {
              operatorFound = op;
              parts = [conditionString.substring(0, splitIndex).trim(), conditionString.substring(splitIndex + op.length).trim()];
              break;
          }
      }

      const parseOperand = (operandStr: string): any => {
          operandStr = operandStr.trim();
          if (operandStr.toLowerCase() === 'true') return true;
          if (operandStr.toLowerCase() === 'false') return false;
          if (operandStr.toLowerCase() === 'null') return null;
          if (operandStr.toLowerCase() === 'undefined') return undefined;
          if ((operandStr.startsWith("'") && operandStr.endsWith("'")) || (operandStr.startsWith('"') && operandStr.endsWith('"'))) {
            return operandStr.substring(1, operandStr.length - 1);
          }
          const num = parseFloat(operandStr);
          return isNaN(num) ? operandStr : num; 
      };

      if (operatorFound && parts.length === 2) {
          let val1 = parseOperand(parts[0]);
          let val2 = parseOperand(parts[1]);
          switch(operatorFound) {
              case '===': return val1 === val2;
              case '!==': return val1 !== val2;
              case '==':  return val1 == val2; 
              case '!=':  return val1 != val2;
              case '<':   return (typeof val1 === typeof val2 && typeof val1 === 'number') ? val1 < val2 : String(val1) < String(val2);
              case '>':   return (typeof val1 === typeof val2 && typeof val1 === 'number') ? val1 > val2 : String(val1) > String(val2);
              case '<=':  return (typeof val1 === typeof val2 && typeof val1 === 'number') ? val1 <= val2 : String(val1) <= String(val2);
              case '>=':  return (typeof val1 === typeof val2 && typeof val1 === 'number') ? val1 >= val2 : String(val1) >= String(val2);
          }
      }
      return !!parseOperand(conditionString);
  } catch (e: any) {
      serverLogs.push({ timestamp: new Date().toISOString(), message: `[CONDITION EVAL] Node ${nodeIdentifier}: Error evaluating condition "${conditionString}": ${e.message}`, type: 'error' });
      return false; 
  }
}

async function handleOnErrorWebhook(node: WorkflowNode, errorMessage: string, webhookConfigInput: OnErrorWebhookConfig | string, workflowData: Record<string, any>, serverLogs: ServerLogOutput[]) {
    const nodeIdentifier = `'${node.name || 'Unnamed Node'}' (ID: ${node.id})`;
    
    let webhookConfig: OnErrorWebhookConfig;
    try {
        webhookConfig = typeof webhookConfigInput === 'string' ? JSON.parse(webhookConfigInput) : webhookConfigInput;
        if (!webhookConfig || typeof webhookConfig.url !== 'string' || !webhookConfig.url) {
            throw new Error('URL is missing or invalid in onErrorWebhook configuration.');
        }
    } catch (e: any) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[ON_ERROR_WEBHOOK] Node ${nodeIdentifier}: Invalid config. Error: ${e.message}`, type: 'error' });
        return;
    }

    serverLogs.push({ timestamp: new Date().toISOString(), message: `[ON_ERROR_WEBHOOK] Node ${nodeIdentifier}: Sending on-error webhook to ${webhookConfig.url}`, type: 'info' });

    const errorContext = {
        'failed_node_id': node.id,
        'failed_node_name': node.name || node.id,
        'error_message': errorMessage,
        'timestamp': new Date().toISOString(),
        'workflow_data_snapshot_json': JSON.stringify(workflowData) 
    };

    try {
        const resolvedHeaders = webhookConfig.headers ? resolveNodeConfig(webhookConfig.headers, workflowData, serverLogs, errorContext) : {};
        if (!resolvedHeaders['Content-Type'] && webhookConfig.bodyTemplate) {
            resolvedHeaders['Content-Type'] = 'application/json';
        }
        
        const resolvedBody = webhookConfig.bodyTemplate ? resolveNodeConfig(webhookConfig.bodyTemplate, workflowData, serverLogs, errorContext) : {};
        
        await fetch(webhookConfig.url, {
            method: webhookConfig.method || 'POST',
            headers: resolvedHeaders,
            body: JSON.stringify(resolvedBody),
        });
    } catch (err: any) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[ON_ERROR_WEBHOOK] Node ${nodeIdentifier}: Exception while sending webhook. Error: ${err.message}`, type: 'error' });
    }
}

// ================================================================= //
// ======================= NODE EXECUTION LOGIC ==================== //
// ================================================================= //
// Note: Each function returns the output object for the node.

async function executeWebhookTriggerNode(node: WorkflowNode, config: any, isSimulationMode: boolean, initialData: any, serverLogs: ServerLogOutput[]): Promise<any> {
    const liveTriggerData = (!isSimulationMode && initialData) ? initialData : null;
    if (liveTriggerData) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE WEBHOOKTRIGGER] LIVE TRIGGER. Using data from API route.`, type: 'info' });
        return { requestBody: liveTriggerData.requestBody, requestHeaders: liveTriggerData.requestHeaders, requestQuery: liveTriggerData.requestQuery };
    }
    
    serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE WEBHOOKTRIGGER] SIMULATION: Using simulated data.`, type: 'info' });
    let simBody = {}; let simHeaders = {}; let simQuery = {};
    try { simBody = typeof config.simulatedRequestBody === 'string' ? JSON.parse(config.simulatedRequestBody) : config.simulatedRequestBody || {}; } catch (e) { serverLogs.push({timestamp: new Date().toISOString(), message: `Error parsing simulatedRequestBody: ${(e as Error).message}`, type: 'info'}); }
    try { simHeaders = typeof config.simulatedRequestHeaders === 'string' ? JSON.parse(config.simulatedRequestHeaders) : config.simulatedRequestHeaders || {}; } catch (e) { serverLogs.push({timestamp: new Date().toISOString(), message: `Error parsing simulatedRequestHeaders: ${(e as Error).message}`, type: 'info'}); }
    try { simQuery = typeof config.simulatedRequestQuery === 'string' ? JSON.parse(config.simulatedRequestQuery) : config.simulatedRequestQuery || {}; } catch (e) { serverLogs.push({timestamp: new Date().toISOString(), message: `Error parsing simulatedRequestQuery: ${(e as Error).message}`, type: 'info'}); }
    return { requestBody: simBody, requestHeaders: simHeaders, requestQuery: simQuery };
}

async function executeHttpRequestNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[]): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE HTTPREQUEST] SIMULATION: Would make ${config.method || 'GET'} request to ${config.url}`, type: 'info' });
        const simStatusCode = config.simulatedStatusCode || 200;
        if (simStatusCode < 200 || simStatusCode >= 300) { 
            const simError = new Error(`Simulated HTTP error with status ${simStatusCode}`);
            (simError as any).statusCode = simStatusCode;
            throw simError; 
        }
        let simResponseData = {};
        try { simResponseData = typeof config.simulatedResponse === 'string' ? JSON.parse(config.simulatedResponse) : config.simulatedResponse; } catch (e) { simResponseData = config.simulatedResponse; }
        return { response: simResponseData, status_code: simStatusCode };
    }

    if (!config.url) throw new Error(`URL is not configured or resolved.`);
    const fetchOptions: RequestInit = { method: config.method || 'GET', headers: config.headers };
    if (config.body && (config.method === 'POST' || config.method === 'PUT' || config.method === 'PATCH')) {
        fetchOptions.body = typeof config.body === 'string' ? config.body : JSON.stringify(config.body);
        if (!config.headers['Content-Type'] && typeof config.body !== 'string') (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
    }
    const response = await fetch(config.url, fetchOptions);
    const responseText = await response.text();
    if (!response.ok) {
        const httpError = new Error(`HTTP request failed with status ${response.status}: ${responseText}`);
        (httpError as any).statusCode = response.status;
        throw httpError;
    }
    let parsedHttpResponse: any;
    try { parsedHttpResponse = JSON.parse(responseText); } catch (e) { parsedHttpResponse = responseText; }
    return { response: parsedHttpResponse, status_code: response.status };
}

async function executeAiTaskNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[]): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE AITASK] SIMULATION: Would send prompt to model ${config.model || 'default'}.`, type: 'info' });
        return { output: config.simulatedOutput || "Simulated AI output." };
    }
    if (!config.prompt) throw new Error(`AI Prompt is not configured or resolved.`);
    const genkitResponse = await ai.generate({ prompt: String(config.prompt), model: (config.model || 'googleai/gemini-1.5-flash-latest') as any });
    return { output: genkitResponse.text }; 
}

async function executeParseJsonNode(node: WorkflowNode, config: any, serverLogs: ServerLogOutput[]): Promise<any> {
    let dataToParse: any;
    if (typeof config.jsonString === 'string') {
        if (config.jsonString.trim() === '') dataToParse = {};
        else try { dataToParse = JSON.parse(config.jsonString); } catch (e: any) { throw new Error(`Invalid JSON input string: ${e.message}`); }
    } else if (typeof config.jsonString === 'object' && config.jsonString !== null) {
        dataToParse = config.jsonString;
    } else {
        throw new Error(`JSON input must be a non-null string or an object. Received type: ${typeof config.jsonString}`);
    }
    
    let extractedValue = dataToParse;
    if (config.path && config.path.trim() !== '' && config.path.trim() !== '$') {
        const pathParts = config.path.replace(/^\$\.?/, '').split('.');
        for (const part of pathParts) {
            if (part === '') continue;
            if (extractedValue && typeof extractedValue === 'object' && part in extractedValue) {
                extractedValue = extractedValue[part];
            } else {
                throw new Error(`Path "${config.path}" not found in JSON object.`);
            }
        }
    }
    return { output: extractedValue };
}

async function executeSendEmailNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[]): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE SENDEMAIL] SIMULATION: Would send email to ${config.to}.`, type: 'info' });
        return { messageId: config.simulatedMessageId || 'simulated-email-id-default' };
    }
    if (!config.to || !config.subject || !config.body) throw new Error(`'to', 'subject', and 'body' are required.`);
    if (!process.env.EMAIL_HOST) throw new Error(`Missing EMAIL_ environment variables.`);
    const transporter = nodemailer.createTransport({ host: process.env.EMAIL_HOST, port: parseInt(process.env.EMAIL_PORT!, 10), secure: process.env.EMAIL_SECURE === 'true', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }});
    const info = await transporter.sendMail({ from: process.env.EMAIL_FROM, to: config.to, subject: config.subject, html: config.body });
    return { messageId: info.messageId };
}

async function executeDbQueryNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[]): Promise<any> {
    const pool = getDbPool();
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE DATABASEQUERY] SIMULATION: Would execute query.`, type: 'info' });
        return { results: config.simulatedResults || [], rowCount: config.simulatedRowCount || (config.simulatedResults?.length || 0) };
    }
    if (!config.queryText) throw new Error(`'queryText' is required.`);
    const client = await pool.connect();
    try {
        const queryResult = await client.query(config.queryText, Array.isArray(config.queryParams) ? config.queryParams : []);
        return { results: queryResult.rows, rowCount: queryResult.rowCount };
    } finally {
        client.release();
    }
}

// ... Add more individual node execution functions here as needed ...


// ================================================================= //
// ===================== CORE EXECUTION ENGINE ===================== //
// ================================================================= //

async function executeFlowInternal(
  flowLabel: string, 
  nodesToExecute: WorkflowNode[],
  connectionsToExecute: WorkflowConnection[],
  currentWorkflowData: Record<string, any>, 
  serverLogs: ServerLogOutput[],
  isSimulationMode: boolean,
  initialData?: Record<string, any>, 
  parentWorkflowData?: Record<string, any> 
): Promise<{ finalWorkflowData: Record<string, any>, serverLogs: ServerLogOutput[], lastNodeOutput?: any, flowError?: string }> {
  
    const { executionOrder, error: sortError } = getExecutionOrder(nodesToExecute, connectionsToExecute, flowLabel);
    let lastNodeOutput: any = null;

    if (sortError) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[ENGINE/${flowLabel}] Critical graph error: ${sortError}`, type: 'error' });
        return { finalWorkflowData: currentWorkflowData, serverLogs, flowError: sortError };
    }

    serverLogs.push({ timestamp: new Date().toISOString(), message: `[ENGINE/${flowLabel}] Starting execution in ${isSimulationMode ? 'SIMULATION' : 'LIVE'} mode.`, type: 'info' });
  
    for (const node of executionOrder) {
        currentWorkflowData[node.id] = { status: 'running', lastExecutionStatus: 'running' };
        const nodeIdentifier = `'${node.name || 'Unnamed Node'}' (ID: ${node.id})`;
        const dataForResolution = { ...(parentWorkflowData || {}), ...currentWorkflowData };
        const resolvedConfig = resolveNodeConfig(node.config || {}, dataForResolution, serverLogs);

        if (resolvedConfig._flow_run_condition !== undefined && !evaluateCondition(String(resolvedConfig._flow_run_condition), nodeIdentifier, serverLogs)) {
            currentWorkflowData[node.id] = { status: 'skipped', reason: `_flow_run_condition was falsy`, lastExecutionStatus: 'skipped' };
            lastNodeOutput = currentWorkflowData[node.id];
            continue;
        }

        let finalNodeOutput: any = { status: 'pending', lastExecutionStatus: 'pending' };
        const retryConfig: RetryConfig | undefined = resolvedConfig.retry;
        const maxAttempts = retryConfig?.attempts || 1;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                let nodeExecutionFunc: Function | undefined;
                switch (node.type) {
                    case 'webhookTrigger': nodeExecutionFunc = executeWebhookTriggerNode; break;
                    case 'httpRequest': nodeExecutionFunc = executeHttpRequestNode; break;
                    case 'aiTask': nodeExecutionFunc = executeAiTaskNode; break;
                    case 'parseJson': nodeExecutionFunc = executeParseJsonNode; break;
                    case 'sendEmail': nodeExecutionFunc = executeSendEmailNode; break;
                    case 'databaseQuery': nodeExecutionFunc = executeDbQueryNode; break;
                    // Add other cases here, pointing to their respective functions
                    case 'logMessage':
                        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE LOGMESSAGE] ${nodeIdentifier}: ${resolvedConfig?.message}`, type: 'info' });
                        finalNodeOutput = { output: resolvedConfig?.message };
                        break;
                    default:
                        serverLogs.push({ timestamp: new Date().toISOString(), message: `[ENGINE] Node type '${node.type}' not implemented.`, type: 'info' });
                        finalNodeOutput = { output: `Execution not implemented for type: ${node.type}` };
                        break;
                }

                if (nodeExecutionFunc) {
                    finalNodeOutput = await nodeExecutionFunc(node, resolvedConfig, isSimulationMode, initialData ? initialData[node.id] : null, serverLogs);
                }
                
                finalNodeOutput.status = 'success';
                finalNodeOutput.lastExecutionStatus = 'success';
                break; // Exit retry loop on success

            } catch (error: any) {
                const errorDetails = error.message || 'Unknown error during node execution.';
                if (attempt >= maxAttempts) {
                    finalNodeOutput = { status: 'error', lastExecutionStatus: 'error', error_message: errorDetails };
                    serverLogs.push({ timestamp: new Date().toISOString(), message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier} FAILED permanently: ${errorDetails}`, type: 'error' });
                    if (resolvedConfig.onErrorWebhook) {
                        await handleOnErrorWebhook(node, errorDetails, resolvedConfig.onErrorWebhook, dataForResolution, serverLogs);
                    }
                    break; 
                }
                // Handle retry logic (delay, etc.) here if needed
                const delay = (retryConfig?.delayMs || 0) * Math.pow(retryConfig?.backoffFactor || 1, attempt - 1);
                if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        currentWorkflowData[node.id] = { ...finalNodeOutput };
        lastNodeOutput = finalNodeOutput;
    }

    return { finalWorkflowData: currentWorkflowData, serverLogs, lastNodeOutput };
}

function getExecutionOrder(nodes: WorkflowNode[], connections: WorkflowConnection[], flowLabel: string): { executionOrder: WorkflowNode[], error?: string } {
    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};
    const nodeMap: Record<string, WorkflowNode> = {};

    nodes.forEach(node => {
        adj[node.id] = [];
        inDegree[node.id] = 0;
        nodeMap[node.id] = node;
    });

    connections.forEach(conn => {
        if (nodeMap[conn.sourceNodeId] && nodeMap[conn.targetNodeId]) {
            adj[conn.sourceNodeId].push(conn.targetNodeId);
            inDegree[conn.targetNodeId]++;
        }
    });

    const queue: string[] = Object.keys(inDegree).filter(nodeId => inDegree[nodeId] === 0);
    const executionOrder: WorkflowNode[] = [];

    while (queue.length > 0) {
        const u = queue.shift()!;
        executionOrder.push(nodeMap[u]);
        (adj[u] || []).forEach(v => {
            inDegree[v]--;
            if (inDegree[v] === 0) queue.push(v);
        });
    }

    if (executionOrder.length !== nodes.length) {
        return { executionOrder: [], error: `Workflow has a cycle or disconnected components.` };
    }
    return { executionOrder };
}

// ================================================================= //
// ========================= PUBLIC ACTIONS ======================== //
// ================================================================= //

export async function executeWorkflow(workflow: Workflow, isSimulationMode: boolean = false, initialData?: Record<string, any>): Promise<WorkflowExecutionResult> {
  const serverLogs: ServerLogOutput[] = [];
  const initialWorkflowDataWithStatus: Record<string, any> = {};
  workflow.nodes.forEach(node => {
    initialWorkflowDataWithStatus[node.id] = { lastExecutionStatus: 'pending' };
  });

  const result = await executeFlowInternal(
    "main", 
    workflow.nodes, 
    workflow.connections, 
    initialWorkflowDataWithStatus, 
    serverLogs, 
    isSimulationMode,
    initialData
  );

  return { serverLogs: result.serverLogs, finalWorkflowData: result.finalWorkflowData };
}

// All other public actions remain the same
export async function generateWorkflow(input: GenerateWorkflowFromPromptInput): Promise<GenerateWorkflowFromPromptOutput> {
  return genkitGenerateWorkflowFromPrompt(input);
}
export async function suggestNextWorkflowNode(clientInput: { workflowContext: string; currentNodeType?: string }): Promise<SuggestNextNodeOutput> {
  const inputForGenkit: SuggestNextNodeInput = { ...clientInput, availableNodeTypes: AVAILABLE_NODES_CONFIG.map(n => ({ type: n.type, name: n.name, description: n.description, category: n.category })) };
  return genkitSuggestNextNode(inputForGenkit);
}
export async function getWorkflowExplanation(workflowData: ExplainWorkflowInput): Promise<string> {
  const result = await genkitExplainWorkflow(workflowData);
  if (!result || !result.explanation) throw new Error("AI failed to provide an explanation.");
  return result.explanation;
}
export async function assistantChat(input: AssistantChatInput): Promise<AssistantChatOutput> {
  const result = await genkitAssistantChat(input);
  if (!result) throw new Error("AI assistant returned an empty response.");
  return result;
}
export async function enhanceAndGenerateWorkflow(input: { originalPrompt: string }): Promise<GenerateWorkflowFromPromptOutput> {
  const enhancementResult = await genkitEnhanceUserPrompt({ originalPrompt: input.originalPrompt });
  const promptForGeneration = enhancementResult?.enhancedPrompt || input.originalPrompt;
  return generateWorkflow({ prompt: promptForGeneration });
}
export async function listWorkflowsAction(): Promise<{ name: string; type: 'example' | 'user' }[]> {
  const workflows = await WorkflowStorage.listAllWorkflows();
  return workflows.map(wf => ({ name: wf.name, type: wf.type }));
}
export async function loadWorkflowAction(name: string): Promise<{ name: string; workflow: Workflow } | null> {
  const workflow = await WorkflowStorage.getWorkflowByName(name);
  return workflow ? { name, workflow } : null;
}
export async function saveWorkflowAction(name: string, workflow: Workflow): Promise<{ success: boolean; message: string }> {
  try {
    await WorkflowStorage.saveWorkflow(name, workflow);
    return { success: true, message: `Workflow "${name}" saved.` };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}
export async function deleteWorkflowAction(name: string): Promise<{ success: boolean; message: string }> {
    try {
        await WorkflowStorage.deleteWorkflowByName(name);
        return { success: true, message: `Workflow "${name}" deleted.` };
    } catch (e: any) {
        return { success: false, message: e.message };
    }
}
