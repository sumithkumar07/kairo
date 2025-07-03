
'use server';

import type { Workflow, ServerLogOutput, WorkflowNode, WorkflowConnection, RetryConfig, OnErrorWebhookConfig, WorkflowExecutionResult } from '@/types/workflow';
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
      // In a real app, you might throw or handle this more gracefully.
      // For this prototype, we'll allow it to fail later if a DB node is actually used.
      // throw new Error(fatalErrorMsg);
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

async function resolveValue(
  value: any,
  workflowData: Record<string, any>,
  serverLogs: ServerLogOutput[],
  userId: string,
  additionalContexts?: Record<string, any>
): Promise<any> {
  if (typeof value !== 'string') {
    return value;
  }

  const placeholderRegex = /{{\s*([^{}\s]+)\s*}}/g;
  let resolvedValue = value;
  let match;

  // Use a while loop to handle multiple placeholders in a single string
  const matches = Array.from(value.matchAll(placeholderRegex));

  for (const match of matches) {
      const placeholder = match[0];
      const path = match[1];
      const pathParts = path.split('.');

      if (pathParts.length === 0) continue;

      const firstPart = pathParts[0];
      let dataFound = false;
      let dataAtPath: any;
      
      // 1. Check additionalContexts (e.g., item for forEach, error details for webhooks, or mapped inputs)
      if (additionalContexts && additionalContexts.hasOwnProperty(firstPart)) {
          dataAtPath = additionalContexts[firstPart];
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

      // 2. Check for 'credential' placeholder
      if (!dataFound && firstPart === 'credential' && pathParts.length >= 2) {
          const credentialName = pathParts.slice(1).join('.');
          // Attempt to fetch from the secure Credential Manager first
          const credentialValue = await WorkflowStorage.getCredentialValueByNameForUser(credentialName, userId);

          if (credentialValue !== null) {
              dataAtPath = credentialValue;
              dataFound = true;
          } else {
              // Fallback to environment variables for local development convenience
              dataAtPath = process.env[credentialName] || process.env[`${credentialName}_API_KEY`] || process.env[`${credentialName}_SECRET`] || process.env[`${credentialName}_TOKEN`];
              if (dataAtPath !== undefined) {
                  dataFound = true;
                  serverLogs.push({ timestamp: new Date().toISOString(), message: `[RESOLVE_VALUE] Credential '${credentialName}' resolved from environment variable as a fallback.`, type: 'info' });
              } else {
                  serverLogs.push({ timestamp: new Date().toISOString(), message: `[RESOLVE_VALUE] Credential '${credentialName}' not found in Credential Manager or environment variables.`, type: 'info' });
              }
          }
      }

      // 3. Check for 'env' placeholder
      if (!dataFound && firstPart === 'env' && pathParts.length >= 2) {
          const envVarName = pathParts.slice(1).join('.');
          dataAtPath = process.env[envVarName];
          if (dataAtPath !== undefined) {
              dataFound = true;
          } else {
              serverLogs.push({ timestamp: new Date().toISOString(), message: `[RESOLVE_VALUE] Env var '${envVarName}' not found for placeholder '${placeholder}'.`, type: 'info' });
          }
      }

      // 4. Check workflowData (node outputs)
      if (!dataFound && workflowData.hasOwnProperty(firstPart)) {
          dataAtPath = workflowData[firstPart];
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
          if (placeholder === value) { // If the entire value is just one placeholder
              return dataAtPath;
          }
          const replacementValue = (typeof dataAtPath === 'object' && dataAtPath !== null)
              ? JSON.stringify(dataAtPath)
              : String(dataAtPath ?? '');
          resolvedValue = resolvedValue.replace(placeholder, replacementValue);
      }
  }

  return resolvedValue;
}

async function resolveNodeConfig(
  nodeConfig: Record<string, any>,
  workflowData: Record<string, any>,
  serverLogs: ServerLogOutput[],
  userId: string,
  additionalContexts?: Record<string, any>
): Promise<Record<string, any>> {
  const resolvedConfig: Record<string, any> = {};

  // 1. Resolve inputMapping first to create mappedInputs context
  const mappedInputs: Record<string, any> = {};
  if (nodeConfig.inputMapping && typeof nodeConfig.inputMapping === 'object') {
    for (const key in nodeConfig.inputMapping) {
      mappedInputs[key] = await resolveValue(nodeConfig.inputMapping[key], workflowData, serverLogs, userId, additionalContexts);
    }
  }

  // Combine contexts: mappedInputs take precedence over other additional contexts
  const combinedContexts = { ...additionalContexts, ...mappedInputs };
  
  // 2. Resolve the rest of the config using the combined context
  for (const key in nodeConfig) {
    if (key === 'inputMapping') { // Don't copy inputMapping to final resolved config
        continue;
    }

    if (Object.prototype.hasOwnProperty.call(nodeConfig, key)) {
      const value = nodeConfig[key];
      // Do not resolve sub-flow definitions, as they have their own scopes and will be resolved during their execution.
      const specialKeys = ['flowGroupNodes', 'flowGroupConnections', 'iterationNodes', 'iterationConnections', 'loopNodes', 'loopConnections', 'branches', 'inputFieldsSchema', 'retry'];
      if (specialKeys.includes(key)) {
        resolvedConfig[key] = value;
      } else if (key === 'onErrorWebhook' && typeof value === 'object' && value !== null) {
         // Resolve placeholders inside the webhook config, but not the whole object itself.
         resolvedConfig[key] = await resolveNodeConfig(value, workflowData, serverLogs, userId, combinedContexts);
      } else if (Array.isArray(value)) {
        resolvedConfig[key] = await Promise.all(
          value.map(item => (typeof item === 'object' && item !== null) 
              ? resolveNodeConfig(item, workflowData, serverLogs, userId, combinedContexts) 
              : resolveValue(item, workflowData, serverLogs, userId, combinedContexts)
          )
        );
      } else if (typeof value === 'object' && value !== null) {
        resolvedConfig[key] = await resolveNodeConfig(value, workflowData, serverLogs, userId, combinedContexts);
      } else {
        resolvedConfig[key] = await resolveValue(value, workflowData, serverLogs, userId, combinedContexts);
      }
    }
  }
  return { ...resolvedConfig, input: mappedInputs }; // Also add the mapped inputs to a dedicated 'input' key for easy access
}

function evaluateCondition(conditionString: string, nodeIdentifier: string, serverLogs: ServerLogOutput[]): boolean {
  if (typeof conditionString !== 'string' || conditionString.trim() === '') {
      serverLogs.push({ timestamp: new Date().toISOString(), message: `[CONDITION EVAL] Node ${nodeIdentifier}: Condition is empty or not a string. Evaluating to false.`, type: 'info' });
      return false;
  }

  try {
      // Very basic evaluation logic. For a production system, use a secure sandbox like `vm2`.
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

      // Helper to parse operands, supporting strings, numbers, booleans, null, undefined
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
          // Simple comparisons. Note: For non-number types, this is a basic string comparison.
          switch(operatorFound) {
              case '===': return val1 === val2;
              case '!==': return val1 !== val2;
              case '==':  return val1 == val2; // Using '==' for loose comparison as intended in many simple template engines
              case '!=':  return val1 != val2;
              case '<':   return (typeof val1 === typeof val2 && typeof val1 === 'number') ? val1 < val2 : String(val1) < String(val2);
              case '>':   return (typeof val1 === typeof val2 && typeof val1 === 'number') ? val1 > val2 : String(val1) > val2;
              case '<=':  return (typeof val1 === typeof val2 && typeof val1 === 'number') ? val1 <= val2 : String(val1) <= val2;
              case '>=':  return (typeof val1 === typeof val2 && typeof val1 === 'number') ? val1 >= val2 : String(val1) >= val2;
          }
      }
      // If no operator, treat the whole string as a value and evaluate its truthiness.
      return !!parseOperand(conditionString);
  } catch (e: any) {
      serverLogs.push({ timestamp: new Date().toISOString(), message: `[CONDITION EVAL] Node ${nodeIdentifier}: Error evaluating condition "${conditionString}": ${e.message}`, type: 'error' });
      return false; // Fail safe
  }
}

async function handleOnErrorWebhook(node: WorkflowNode, errorMessage: string, webhookConfigInput: OnErrorWebhookConfig | string, workflowData: Record<string, any>, serverLogs: ServerLogOutput[], userId: string) {
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

    // Define the special context for resolving placeholders in the webhook body/headers
    const errorContext = {
        'failed_node_id': node.id,
        'failed_node_name': node.name || node.id,
        'error_message': errorMessage,
        'timestamp': new Date().toISOString(),
        'workflow_data_snapshot_json': JSON.stringify(workflowData) // This can be large!
    };

    try {
        const resolvedHeaders = webhookConfig.headers ? await resolveNodeConfig(webhookConfig.headers, workflowData, serverLogs, userId, errorContext) : {};
        // Default content type to JSON if a body is provided
        if (!resolvedHeaders['Content-Type'] && webhookConfig.bodyTemplate) {
            resolvedHeaders['Content-Type'] = 'application/json';
        }

        const resolvedBody = webhookConfig.bodyTemplate ? await resolveNodeConfig(webhookConfig.bodyTemplate, workflowData, serverLogs, userId, errorContext) : {};

        // Fire-and-forget fetch call
        fetch(webhookConfig.url, {
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

async function executeWebhookTriggerNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    const liveTriggerData = (!isSimulationMode && allWorkflowData && allWorkflowData[node.id]) ? allWorkflowData[node.id] : null;

    if (liveTriggerData && liveTriggerData.requestBody !== undefined) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE WEBHOOKTRIGGER] LIVE TRIGGER. Using data from API route.`, type: 'info' });
        return {
            requestBody: liveTriggerData.requestBody,
            requestHeaders: liveTriggerData.requestHeaders,
            requestQuery: liveTriggerData.requestQuery,
            status: 'success'
        };
    }

    serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE WEBHOOKTRIGGER] SIMULATION: Using simulated data.`, type: 'info' });
    let simBody = {};
    let simHeaders = {};
    let simQuery = {};

    try {
        simBody = typeof config.simulatedRequestBody === 'string' ? JSON.parse(config.simulatedRequestBody) : (config.simulatedRequestBody || {});
        simHeaders = typeof config.simulatedRequestHeaders === 'string' ? JSON.parse(config.simulatedRequestHeaders) : (config.simulatedRequestHeaders || {});
        simQuery = typeof config.simulatedRequestQuery === 'string' ? JSON.parse(config.simulatedRequestQuery) : (config.simulatedRequestQuery || {});
    } catch (e: any) {
        serverLogs.push({timestamp: new Date().toISOString(), message: `Error parsing simulated data for webhook trigger: ${e.message}`, type: 'info'});
    }

    return { requestBody: simBody, requestHeaders: simHeaders, requestQuery: simQuery, status: 'success' };
}

async function executeHttpRequestNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
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

async function executeAiTaskNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE AITASK] SIMULATION: Would send prompt to model ${config.model || 'default'}.`, type: 'info' });
        return { output: config.simulatedOutput || "Simulated AI output." };
    }
    if (!process.env.GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY environment variable is not set. It's required for AI Tasks in Live Mode.");
    if (!config.prompt) throw new Error(`AI Prompt is not configured or resolved.`);
    const genkitResponse = await ai.generate({ prompt: String(config.prompt), model: (config.model || 'googleai/gemini-1.5-flash-latest') as any });
    return { output: genkitResponse.text };
}

async function executeParseJsonNode(node: WorkflowNode, config: any, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
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

async function executeSendEmailNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE SENDEMAIL] SIMULATION: Would send email to ${config.to}.`, type: 'info' });
        return { messageId: config.simulatedMessageId || 'simulated-email-id-default' };
    }
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM) {
        throw new Error("Missing EMAIL_* environment variables. All are required for sending emails in Live Mode.");
    }
    if (!config.to || !config.subject || !config.body) throw new Error(`'to', 'subject', and 'body' are required.`);

    const transporter = nodemailer.createTransport({ host: process.env.EMAIL_HOST, port: parseInt(process.env.EMAIL_PORT!, 10), secure: process.env.EMAIL_SECURE === 'true', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }});
    const info = await transporter.sendMail({ from: process.env.EMAIL_FROM, to: config.to, subject: config.subject, html: config.body });
    return { messageId: info.messageId };
}

async function executeDbQueryNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE DATABASEQUERY] SIMULATION: Would execute query.`, type: 'info' });
        return { results: config.simulatedResults || [], rowCount: config.simulatedRowCount || (config.simulatedResults?.length || 0) };
    }

    const resolvedConnectionString = await resolveValue("{{credential.DatabaseConnectionString}}", {}, serverLogs, userId) || process.env.DB_CONNECTION_STRING;
    if (!resolvedConnectionString) {
       throw new Error("Database connection string not found. Set it in the Credential Manager as 'DatabaseConnectionString' or as a DB_CONNECTION_STRING environment variable.");
    }

    const pool = getDbPool();
    if (!config.queryText) throw new Error(`'queryText' is required.`);

    const client = await pool.connect();
    try {
        const queryResult = await client.query(config.queryText, Array.isArray(config.queryParams) ? config.queryParams : []);
        return { results: queryResult.rows, rowCount: queryResult.rowCount };
    } finally {
        client.release();
    }
}

async function executeLogMessageNode(node: WorkflowNode, config: any, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    const nodeIdentifier = `'${node.name || 'Unnamed Node'}' (ID: ${node.id})`;
    const resolvedMessage = await resolveValue(config?.message, allWorkflowData, serverLogs, userId, config.input); // Pass mapped inputs to resolveValue
    const finalMessage = typeof resolvedMessage === 'object' ? JSON.stringify(resolvedMessage, null, 2) : resolvedMessage;
    serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE LOGMESSAGE] ${nodeIdentifier}: ${finalMessage}`, type: 'info' });
    return { output: finalMessage };
}

// === NEW UTILITY NODE EXECUTION FUNCTIONS ===
async function executeToUpperCaseNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (typeof config.inputString !== 'string') throw new Error('Input must be a string.');
    return { output_data: config.inputString.toUpperCase() };
}
async function executeToLowerCaseNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (typeof config.inputString !== 'string') throw new Error('Input must be a string.');
    return { output_data: config.inputString.toLowerCase() };
}
async function executeConcatenateStringsNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (!Array.isArray(config.stringsToConcatenate)) throw new Error('Input must be an array of strings.');
    const separator = config.separator || '';
    return { output_data: config.stringsToConcatenate.join(separator) };
}
async function executeStringSplitNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (typeof config.inputString !== 'string') throw new Error('Input must be a string.');
    const delimiter = config.delimiter || ',';
    return { output_data: { array: config.inputString.split(delimiter) } };
}
async function executeFormatDateNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (!config.inputDateString) throw new Error('Input date string is required.');
    const date = parseISO(config.inputDateString);
    if (isNaN(date.getTime())) throw new Error('Invalid input date string.');
    const formatString = config.outputFormatString || 'yyyy-MM-dd HH:mm:ss';
    return { output_data: { formattedDate: format(date, formatString) } };
}

async function executeDelayNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
  const delayMs = config.delayMs || 0;
  if (!isSimulationMode && delayMs > 0) {
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  return { output: config.input };
}

// === NEW INTEGRATION NODE EXECUTION FUNCTIONS ===

async function executeSlackPostMessageNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE SLACK] SIMULATION: Would post message to channel ${config.channel}.`, type: 'info' });
        return { output: config.simulated_config || { ok: true, message: { ts: 'simulated_timestamp' } } };
    }

    const token = await resolveValue(config.token, {}, serverLogs, userId);
    if (!token) throw new Error(`Slack Bot Token is not configured or resolved. Please set the credential placeholder {{credential.SlackBotToken}} and ensure the credential or environment variable is available.`);
    if (!config.channel) throw new Error(`Slack channel is not configured or resolved.`);
    if (!config.text) throw new Error(`Slack message text is not configured or resolved.`);

    const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            channel: config.channel,
            text: config.text,
        }),
    });

    const responseData = await response.json();

    if (!response.ok || !responseData.ok) {
        const slackError = responseData.error || `HTTP error ${response.status}`;
        throw new Error(`Slack API error: ${slackError}`);
    }

    return { output: responseData };
}

async function executeOpenAiChatCompletionNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE OPENAI] SIMULATION: Would send prompt to model ${config.model}.`, type: 'info' });
        return { output: config.simulated_config };
    }

    const apiKey = await resolveValue(config.apiKey, {}, serverLogs, userId);
    if (!apiKey) throw new Error("OpenAI API Key is not configured or resolved. Please set the credential placeholder {{credential.OpenAIKey}} and ensure the credential or environment variable is available.");
    if (!config.messages) throw new Error("OpenAI messages are not configured or resolved.");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: config.model,
            messages: Array.isArray(config.messages) ? config.messages : JSON.parse(config.messages),
        }),
    });

    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(`OpenAI API error: ${responseData.error?.message || `HTTP error ${response.status}`}`);
    }
    return { output: responseData };
}

async function executeGithubCreateIssueNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE GITHUB] SIMULATION: Would create issue in ${config.owner}/${config.repo}.`, type: 'info' });
        return { output: config.simulated_config };
    }

    const token = await resolveValue(config.token, {}, serverLogs, userId);
    if (!token) throw new Error("GitHub Token is not configured or resolved. Please set the credential placeholder {{credential.GitHubToken}} and ensure the credential or environment variable is available.");

    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/issues`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${token}`,
        },
        body: JSON.stringify({
            title: config.title,
            body: config.body,
        }),
    });

    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(`GitHub API error: ${responseData.message || `HTTP error ${response.status}`}`);
    }
    return { output: responseData };
}

// Simulated Live Mode for complex auth integrations
async function executeSimulatedLiveNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string, serviceName: string): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE ${serviceName.toUpperCase()}] SIMULATION: Returning simulated data.`, type: 'info' });
        return { output: config.simulated_config || {} };
    }

    serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE ${serviceName.toUpperCase()}] LIVE (SIMULATED): This integration requires OAuth2, which is not fully implemented. Returning simulated data for workflow continuity.`, type: 'info' });

    // In a real scenario, you'd check for OAuth tokens here.
    const hasCreds = Object.values(config).some(val => typeof val === 'string' && val.includes('{{credential.'));
    if (!hasCreds) {
       serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE ${serviceName.toUpperCase()}] WARNING: No credential placeholder found in config. Real execution would fail.`, type: 'info' });
    }

    return { output: config.simulated_config || {} };
}


const nodeExecutionFunctions: Record<string, Function> = {
    webhookTrigger: executeWebhookTriggerNode,
    httpRequest: executeHttpRequestNode,
    aiTask: executeAiTaskNode,
    parseJson: executeParseJsonNode,
    sendEmail: executeSendEmailNode,
    databaseQuery: executeDbQueryNode,
    logMessage: executeLogMessageNode,

    // Utility Nodes
    toUpperCase: executeToUpperCaseNode,
    toLowerCase: executeToLowerCaseNode,
    concatenateStrings: executeConcatenateStringsNode,
    stringSplit: executeStringSplitNode,
    formatDate: executeFormatDateNode,
    delay: executeDelayNode,
    // Add other utility functions when implemented

    // Integration Nodes
    slackPostMessage: executeSlackPostMessageNode,
    openAiChatCompletion: executeOpenAiChatCompletionNode,
    githubCreateIssue: executeGithubCreateIssueNode,
    googleSheetsAppendRow: (node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string) =>
        executeSimulatedLiveNode(node, config, isSimulationMode, serverLogs, allWorkflowData, userId, 'Google Sheets'),
    stripeCreatePaymentLink: (node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string) =>
        executeSimulatedLiveNode(node, config, isSimulationMode, serverLogs, allWorkflowData, userId, 'Stripe'),
    hubspotCreateContact: (node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string) =>
        executeSimulatedLiveNode(node, config, isSimulationMode, serverLogs, allWorkflowData, userId, 'HubSpot'),
    twilioSendSms: (node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string) =>
        executeSimulatedLiveNode(node, config, isSimulationMode, serverLogs, allWorkflowData, userId, 'Twilio'),
    dropboxUploadFile: (node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string) =>
        executeSimulatedLiveNode(node, config, isSimulationMode, serverLogs, allWorkflowData, userId, 'Dropbox'),
    googleCalendarListEvents: (node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string) =>
        executeSimulatedLiveNode(node, config, isSimulationMode, serverLogs, allWorkflowData, userId, 'Google Calendar'),
    youtubeFetchTrending: (node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string) =>
        executeSimulatedLiveNode(node, config, isSimulationMode, serverLogs, allWorkflowData, userId, 'YouTube'),
    youtubeDownloadVideo: (node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string) =>
        executeSimulatedLiveNode(node, config, isSimulationMode, serverLogs, allWorkflowData, userId, 'YouTube'),
    videoConvertToShorts: (node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string) =>
        executeSimulatedLiveNode(node, config, isSimulationMode, serverLogs, allWorkflowData, userId, 'Video'),
    youtubeUploadShort: (node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string) =>
        executeSimulatedLiveNode(node, config, isSimulationMode, serverLogs, allWorkflowData, userId, 'YouTube'),
};


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
  userId: string,
  parentWorkflowData?: Record<string, any> // Data from a parent flow (for sub-flows)
): Promise<{ finalWorkflowData: Record<string, any>, serverLogs: ServerLogOutput[], lastNodeOutput?: any, flowError?: string }> {

    const { executionOrder, error: sortError } = getExecutionOrder(nodesToExecute, connectionsToExecute, flowLabel);
    let lastNodeOutput: any = null;

    if (sortError) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[ENGINE/${flowLabel}] Critical graph error: ${sortError}`, type: 'error' });
        return { finalWorkflowData: currentWorkflowData, serverLogs, flowError: sortError };
    }

    serverLogs.push({ timestamp: new Date().toISOString(), message: `[ENGINE/${flowLabel}] Starting execution in ${isSimulationMode ? 'SIMULATION' : 'LIVE'} mode for user ${userId}.`, type: 'info' });

    for (const node of executionOrder) {
        const nodeIdentifier = `'${node.name || 'Unnamed Node'}' (ID: ${node.id})`;

        // Find dependencies for the current node
        const dependencies = connectionsToExecute
            .filter(c => c.targetNodeId === node.id)
            .map(c => c.sourceNodeId);

        // Check if any dependency has failed
        const hasFailedDependency = dependencies.some(depId =>
            currentWorkflowData[depId]?.lastExecutionStatus === 'error'
        );

        if (hasFailedDependency) {
            serverLogs.push({ timestamp: new Date().toISOString(), message: `[ENGINE/${flowLabel}] Skipping node ${nodeIdentifier} due to upstream failure.`, type: 'info' });
            currentWorkflowData[node.id] = { ...currentWorkflowData[node.id], status: 'skipped', reason: 'Upstream dependency failed.', lastExecutionStatus: 'skipped' };
            lastNodeOutput = currentWorkflowData[node.id];
            continue;
        }

        currentWorkflowData[node.id] = { ...currentWorkflowData[node.id], status: 'running', lastExecutionStatus: 'running' };

        const dataForResolution = { ...(parentWorkflowData || {}), ...currentWorkflowData };
        const resolvedConfig = await resolveNodeConfig(node.config || {}, dataForResolution, serverLogs, userId, node.inputMapping);

        // Check for conditional execution
        if (resolvedConfig._flow_run_condition !== undefined && !evaluateCondition(String(resolvedConfig._flow_run_condition), nodeIdentifier, serverLogs)) {
            currentWorkflowData[node.id] = { ...currentWorkflowData[node.id], status: 'skipped', reason: `_flow_run_condition was falsy`, lastExecutionStatus: 'skipped' };
            lastNodeOutput = currentWorkflowData[node.id];
            continue;
        }

        let finalNodeOutput: any = { status: 'pending', lastExecutionStatus: 'pending' };
        const retryConfig: RetryConfig | undefined = resolvedConfig.retry;
        let maxAttempts = retryConfig?.attempts || 1;
        if (isSimulationMode) maxAttempts = 1; // Don't actually retry in simulation mode

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const executionFn = nodeExecutionFunctions[node.type];
                let nodeResult: any;

                if (executionFn) {
                    nodeResult = await executionFn(node, resolvedConfig, isSimulationMode, serverLogs, dataForResolution, userId);
                } else {
                    serverLogs.push({ timestamp: new Date().toISOString(), message: `[ENGINE] Node type '${node.type}' not implemented. Returning simulated_config if available.`, type: 'info' });
                    nodeResult = { output: resolvedConfig.simulated_config || `Execution not implemented for type: ${node.type}` };
                }

                finalNodeOutput = { ...nodeResult, status: 'success', lastExecutionStatus: 'success' };
                break; // Exit retry loop on success

            } catch (error: any) {
                const errorDetails = error.message || 'Unknown error during node execution.';
                if (attempt >= maxAttempts) {
                    finalNodeOutput = { status: 'error', lastExecutionStatus: 'error', error_message: errorDetails, error: errorDetails };
                    serverLogs.push({ timestamp: new Date().toISOString(), message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier} FAILED permanently: ${errorDetails}`, type: 'error' });
                    // Handle on-error webhook if configured
                    if (resolvedConfig.onErrorWebhook) {
                        await handleOnErrorWebhook(node, errorDetails, resolvedConfig.onErrorWebhook, dataForResolution, serverLogs, userId);
                    }
                    break;
                }
                // Handle retry logic (delay, etc.) here if needed
                const delay = (retryConfig?.delayMs || 0) * Math.pow(retryConfig?.backoffFactor || 1, attempt - 1);
                serverLogs.push({ timestamp: new Date().toISOString(), message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier} failed on attempt ${attempt}. Retrying in ${delay}ms...`, type: 'info' });
                if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        currentWorkflowData[node.id] = { ...currentWorkflowData[node.id], ...finalNodeOutput };
        lastNodeOutput = finalNodeOutput;
    }

    return { finalWorkflowData: currentWorkflowData, serverLogs, lastNodeOutput };
}

// Topological sort to determine execution order
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
        // This indicates a cycle or disconnected components, which is a critical workflow design error.
        return { executionOrder: [], error: `Workflow has a cycle or disconnected components.` };
    }
    return { executionOrder };
}


export async function executeWorkflow(workflow: Workflow, isSimulationMode: boolean, userId: string, initialData?: Record<string, any>): Promise<WorkflowExecutionResult> {
  const serverLogs: ServerLogOutput[] = [];
  const initialWorkflowData: Record<string, any> = {};

  // Pre-populate with initial trigger data if available
  if (initialData) {
    for (const nodeId in initialData) {
      if (workflow.nodes.some(n => n.id === nodeId)) {
        initialWorkflowData[nodeId] = initialData[nodeId];
      }
    }
  }

  // Pre-populate all nodes with pending status
  workflow.nodes.forEach(node => {
    if (!initialWorkflowData[node.id]) {
      initialWorkflowData[node.id] = { lastExecutionStatus: 'pending' };
    } else {
      initialWorkflowData[node.id].lastExecutionStatus = 'pending';
    }
  });


  const result = await executeFlowInternal(
    "main",
    workflow.nodes,
    workflow.connections,
    initialWorkflowData,
    serverLogs,
    isSimulationMode,
    userId
  );

  return { serverLogs: result.serverLogs, finalWorkflowData: result.finalWorkflowData };
}
