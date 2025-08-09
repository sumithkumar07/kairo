'use server';

import type { Workflow, ServerLogOutput, WorkflowNode, WorkflowConnection, RetryConfig, OnErrorWebhookConfig, WorkflowExecutionResult } from '@/types/workflow';
import { ai } from '@/ai/genkit';
import nodemailer from 'nodemailer';
import { Pool } from 'pg';
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import { format, parseISO } from 'date-fns';
import * as WorkflowStorage from '@/services/workflow-storage-service';
import type { SubscriptionTier, SubscriptionFeatures } from '@/types/subscription';
import { FREE_TIER_FEATURES, GOLD_TIER_FEATURES, DIAMOND_TIER_FEATURES } from '@/types/subscription';
import { textToSpeechAction } from '@/app/actions';
import { generateImage } from '@/ai/flows/generate-image-flow';


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
          const envVarName = pathParts.slice(1).join('_').toUpperCase();
          dataAtPath = process.env[envVarName];
          if (dataAtPath !== undefined) {
              dataFound = true;
              serverLogs.push({ timestamp: new Date().toISOString(), message: `[RESOLVE_VALUE] Environment variable '${envVarName}' resolved.`, type: 'info' });
          } else {
              serverLogs.push({ timestamp: new Date().toISOString(), message: `[RESOLVE_VALUE] Environment variable '${envVarName}' not found.`, type: 'info' });
          }
      }

      // 4. Otherwise, check workflow data
      if (!dataFound && workflowData.hasOwnProperty(firstPart)) {
          dataAtPath = workflowData[firstPart];
          let nodeFound = true;
          // Navigate through the path
          for (let i = 1; i < pathParts.length; i++) {
              const part = pathParts[i];
              if (dataAtPath && typeof dataAtPath === 'object' && dataAtPath !== null && part in dataAtPath) {
                  dataAtPath = dataAtPath[part];
              } else {
                  nodeFound = false;
                  break;
              }
          }
          if (nodeFound) dataFound = true;
      }

      if (dataFound) {
          // Convert the data to string for replacement
          let stringifiedData: string;
          if (typeof dataAtPath === 'object' && dataAtPath !== null) {
              stringifiedData = JSON.stringify(dataAtPath);
          } else {
              stringifiedData = String(dataAtPath);
          }
          resolvedValue = resolvedValue.replace(placeholder, stringifiedData);
      } else {
          // Keep the placeholder unresolved
          serverLogs.push({ timestamp: new Date().toISOString(), message: `[RESOLVE_VALUE] Unable to resolve placeholder '${placeholder}' in value '${value}'`, type: 'info' });
      }
  }

  // Try to convert back to original type if it's a simple type
  if (typeof value === 'string' && resolvedValue !== value) {
      // If the original was a pure placeholder (just {{...}}), try to parse
      if (value.trim().startsWith('{{') && value.trim().endsWith('}}') && matches.length === 1) {
          try {
              const parsed = JSON.parse(resolvedValue);
              return parsed;
          } catch {
              // If it can't be parsed as JSON, return as string
              return resolvedValue;
          }
      }
  }

  return resolvedValue;
}

// ================================================================= //
// ==================== CONFIG RESOLUTION ========================= //
// ================================================================= //

async function resolveNodeConfig(
  baseConfig: Record<string, any>,
  inputMapping: Record<string, any> = {},
  workflowData: Record<string, any>,
  serverLogs: ServerLogOutput[],
  userId: string
): Promise<Record<string, any>> {
  // First, resolve all input mappings to create the mapped input context
  const resolvedInputs: Record<string, any> = {};
  for (const [key, value] of Object.entries(inputMapping)) {
    resolvedInputs[key] = await resolveValue(value, workflowData, serverLogs, userId);
  }

  // Then, resolve the base config using both workflow data and mapped inputs
  const resolvedConfig: Record<string, any> = {};
  for (const [key, value] of Object.entries(baseConfig)) {
    if (Array.isArray(value)) {
      resolvedConfig[key] = await Promise.all(
        value.map(item => resolveValue(item, workflowData, serverLogs, userId, resolvedInputs))
      );
    } else {
      resolvedConfig[key] = await resolveValue(value, workflowData, serverLogs, userId, resolvedInputs);
    }
  }

  // Add the resolved inputs to the config as a special 'input' property
  resolvedConfig.input = resolvedInputs;

  return resolvedConfig;
}

function evaluateCondition(condition: string, nodeId: string, serverLogs: ServerLogOutput[]): boolean {
  try {
    // Simple evaluation for boolean conditions
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition === 'true' || lowerCondition === '1') {
      return true;
    }
    if (lowerCondition === 'false' || lowerCondition === '0') {
      return false;
    }

    // Try to evaluate as a simple expression
    // For security, we only allow very basic evaluations
    const result = Boolean(condition);
    serverLogs.push({ timestamp: new Date().toISOString(), message: `[CONDITION] Node ${nodeId}: Condition '${condition}' evaluated to ${result}`, type: 'info' });
    return result;
  } catch (error) {
    serverLogs.push({ timestamp: new Date().toISOString(), message: `[CONDITION] Node ${nodeId}: Error evaluating condition '${condition}'. Treating as false.`, type: 'info' });
    return false;
  }
}

// ================================================================= //
// ==================== NODE EXECUTION FUNCTIONS ================== //
// ================================================================= //

async function executeWebhookTriggerNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
  if (allWorkflowData[node.id] && allWorkflowData[node.id].triggered) {
    return allWorkflowData[node.id];
  } else {
    return { message: "Webhook trigger not activated in this execution.", triggered: false };
  }
}

async function executeScheduleNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
  if (allWorkflowData[node.id] && allWorkflowData[node.id].triggered_at) {
    return allWorkflowData[node.id];
  } else {
    return { message: "Schedule trigger not activated in this execution.", triggered: false };
  }
}

async function executeHttpRequestNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
  if (isSimulationMode) {
    serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE HTTP] SIMULATION: Would make ${config.method} request to ${config.url}`, type: 'info' });
    return { response: config.simulatedResponse || { status: 200, data: "Simulated response" } };
  }

  if (!config.url) throw new Error("URL is required for HTTP request.");

  const method = config.method || 'GET';
  const headers = config.headers || {};
  let body = config.body;

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    if (typeof body === 'object') {
      body = JSON.stringify(body);
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }
  } else {
    body = undefined;
  }

  const response = await fetch(config.url, { method, headers, body });
  const responseData = await response.text();

  let parsedData;
  try {
    parsedData = JSON.parse(responseData);
  } catch {
    parsedData = responseData;
  }

  return {
    response: {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: parsedData
    }
  };
}

async function executeAiTaskNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
  if (isSimulationMode) {
    serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE AI] SIMULATION: Would process AI task with GROQ API using Llama models`, type: 'info' });
    return { output: config.simulatedOutput || "Simulated AI response from GROQ API with Llama models" };
  }

  if (!config.prompt) {
    throw new Error("Prompt is required for AI task.");
  }

  // Use Puter.js meta-llama/llama-4-maverick instead of Mistral AI
  const model = 'meta-llama/llama-4-maverick';
  
  try {
    const result = await ai.generate(config.prompt, { 
      model: model,
      temperature: config.temperature || 0.7,
      max_tokens: config.max_tokens || 1000
    });
    
    return { output: result.content || result };
  } catch (error: any) {
    throw new Error(`Puter.js AI task failed: ${error.message}`);
  }
}

async function executeGenerateImageNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
  if (isSimulationMode) {
    serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE GENERATEIMAGE] SIMULATION: Would generate image with prompt: ${config.prompt}`, type: 'info' });
    return { output: config.simulatedOutput || { imageUrl: "https://via.placeholder.com/512x512?text=Generated+Image" } };
  }

  if (!config.prompt) {
    throw new Error("Prompt is required for image generation.");
  }

  try {
    const result = await generateImage({ prompt: config.prompt });
    return { output: result };
  } catch (error: any) {
    throw new Error(`Image generation failed: ${error.message}`);
  }
}

async function executeParseJsonNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
  const jsonString = config.jsonString;
  if (!jsonString || typeof jsonString !== 'string') {
    throw new Error("Valid JSON string is required.");
  }

  try {
    const parsed = JSON.parse(jsonString);
    return { output: parsed };
  } catch (error) {
    throw new Error(`Invalid JSON: ${(error as Error).message}`);
  }
}

async function handleOnErrorWebhook(node: WorkflowNode, errorMessage: string, webhookConfig: OnErrorWebhookConfig, workflowData: Record<string, any>, serverLogs: ServerLogOutput[], userId: string): Promise<void> {
  try {
    const payload = {
      error: errorMessage,
      nodeId: node.id,
      nodeName: node.name || 'Unnamed Node',
      timestamp: new Date().toISOString(),
      workflowData: webhookConfig.includeWorkflowData ? workflowData : undefined
    };

    const webhookUrl = await resolveValue(webhookConfig.url, workflowData, serverLogs, userId);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      serverLogs.push({ timestamp: new Date().toISOString(), message: `[ON_ERROR_WEBHOOK] Successfully sent error notification for node '${node.name}'`, type: 'info' });
    } else {
      serverLogs.push({ timestamp: new Date().toISOString(), message: `[ON_ERROR_WEBHOOK] Failed to send error notification: ${response.statusText}`, type: 'error' });
    }
  } catch (webhookError: any) {
    serverLogs.push({ timestamp: new Date().toISOString(), message: `[ON_ERROR_WEBHOOK] Error sending webhook: ${webhookError.message}`, type: 'error' });
  }
}

async function executeSendEmailNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
  if (isSimulationMode) {
    serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE EMAIL] SIMULATION: Would send email to ${config.to} with subject "${config.subject}"`, type: 'info' });
    return { output: config.simulated_config || { messageId: 'simulated-message-id', accepted: [config.to] } };
  }

  // Required email configuration
  const { host, port, secure, user, pass, to, subject, body } = config;
  
  if (!host || !port || !user || !pass) {
    throw new Error("SMTP configuration (host, port, user, pass) is required.");
  }
  if (!to || !subject) {
    throw new Error("Email recipient ('to') and subject are required.");
  }

  // Create transporter
  const transporter = nodemailer.createTransporter({
    host,
    port: Number(port),
    secure: Boolean(secure),
    auth: { user, pass }
  });

  // Send email
  const result = await transporter.sendMail({
    from: user,
    to,
    subject,
    text: body || '',
    html: config.htmlBody
  });

  return { output: result };
}

async function executeDbQueryNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE DB] SIMULATION: Would execute query: ${config.queryText}`, type: 'info' });
        return { results: config.simulated_config?.results || [], rowCount: 0 };
    }

    if (!process.env.DB_CONNECTION_STRING) {
        throw new Error("DB_CONNECTION_STRING environment variable is not set. This node requires database configuration.");
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
    let finalMessage: any;

    if (config.logFullInput) {
        // If the "Log Full Input" flag is set, log the entire resolved input object.
        // `config.input` already contains the resolved input mappings.
        finalMessage = config.input;
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE LOGMESSAGE] ${nodeIdentifier}: ${JSON.stringify(finalMessage, null, 2)}`, type: 'info' });
    } else {
        // Otherwise, resolve the message string as before.
        const resolvedMessage = await resolveValue(config?.message, allWorkflowData, serverLogs, userId, config.input);
        finalMessage = typeof resolvedMessage === 'object' ? JSON.stringify(resolvedMessage, null, 2) : resolvedMessage;
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE LOGMESSAGE] ${nodeIdentifier}: ${finalMessage}`, type: 'info' });
    }
    
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

async function executeAggregateDataNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    const inputArrayPath = await resolveValue(config.inputArrayPath, allWorkflowData, serverLogs, userId, config.input);
    if (!Array.isArray(inputArrayPath)) {
        throw new Error(`Input for aggregation must be an array. Received: ${typeof inputArrayPath}`);
    }

    let operations: { type: string, inputPath: string, outputPath: string, separator?: string }[];
    try {
        operations = typeof config.operations === 'string' ? JSON.parse(config.operations) : config.operations;
        if (!Array.isArray(operations)) throw new Error();
    } catch (e) {
        throw new Error('Aggregation Operations must be a valid JSON array.');
    }

    const inputArray: any[] = inputArrayPath;
    const results: Record<string, any> = {};

    const getValueFromItem = (item: any, path: string) => {
        if (!path.startsWith('item.')) return undefined;
        const parts = path.substring(5).split('.');
        let value = item;
        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                return undefined;
            }
        }
        return value;
    };

    for (const op of operations) {
        if (!op.type || !op.outputPath) {
            serverLogs.push({ timestamp: new Date().toISOString(), message: `[AGGREGATE] Skipping invalid operation: ${JSON.stringify(op)}`, type: 'info' });
            continue;
        }

        switch (op.type.toUpperCase()) {
            case 'SUM':
            case 'AVERAGE':
                const numbers = inputArray.map(item => Number(getValueFromItem(item, op.inputPath))).filter(n => !isNaN(n));
                if (numbers.length === 0) {
                    results[op.outputPath] = 0;
                } else {
                    const sum = numbers.reduce((a, b) => a + b, 0);
                    results[op.outputPath] = op.type.toUpperCase() === 'SUM' ? sum : sum / numbers.length;
                }
                break;
            case 'COUNT':
                results[op.outputPath] = inputArray.length;
                break;
            case 'MIN':
            case 'MAX':
                const minMaxNumbers = inputArray.map(item => Number(getValueFromItem(item, op.inputPath))).filter(n => !isNaN(n));
                if (minMaxNumbers.length > 0) {
                    results[op.outputPath] = op.type.toUpperCase() === 'MIN' ? Math.min(...minMaxNumbers) : Math.max(...minMaxNumbers);
                } else {
                    results[op.outputPath] = null;
                }
                break;
            case 'JOIN':
                const joinItems = inputArray.map(item => String(getValueFromItem(item, op.inputPath) ?? '')).filter(Boolean);
                results[op.outputPath] = joinItems.join(op.separator || ',');
                break;
            case 'COLLECT':
                 results[op.outputPath] = inputArray.map(item => getValueFromItem(item, op.inputPath));
                 break;
            default:
                serverLogs.push({ timestamp: new Date().toISOString(), message: `[AGGREGATE] Unsupported operation type: ${op.type}`, type: 'info' });
        }
    }

    return { output_data: results };
}

async function executeTextToSpeechNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE TEXTTOSPEECH] SIMULATION: Would convert text to speech.`, type: 'info' });
        return { audioDataUri: config.simulated_config?.audioDataUri || '' };
    }
    const result = await textToSpeechAction({ text: config.text, voice: config.voice });
    return result;
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
    
    let messages = config.messages;
    if (typeof messages === 'string') {
        try {
            messages = JSON.parse(messages);
        } catch (e: any) {
            throw new Error(`Invalid JSON for OpenAI messages: ${e.message}`);
        }
    }
    if (!messages || !Array.isArray(messages)) throw new Error("OpenAI messages are not configured or are not a valid array.");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: config.model,
            messages: messages,
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
    if (!config.owner || !config.repo || !config.title) throw new Error("GitHub repository owner, name, and issue title are required.");

    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/issues`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
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

async function executeTwilioSendSmsNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE TWILIO] SIMULATION: Would send SMS to ${config.to}.`, type: 'info' });
        return { output: config.simulated_config };
    }

    const accountSid = await resolveValue(config.accountSid, {}, serverLogs, userId);
    const authToken = await resolveValue(config.authToken, {}, serverLogs, userId);

    if (!accountSid) throw new Error("Twilio Account SID is not configured or resolved.");
    if (!authToken) throw new Error("Twilio Auth Token is not configured or resolved.");
    if (!config.to) throw new Error("Recipient 'To' phone number is not configured.");
    if (!config.from) throw new Error("'From' phone number is not configured.");
    if (!config.body) throw new Error("Message 'Body' is not configured.");

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const body = new URLSearchParams();
    body.append('To', config.to);
    body.append('From', config.from);
    body.append('Body', config.body);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(accountSid + ':' + authToken).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
    });

    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(`Twilio API error: ${responseData.message || `HTTP error ${response.status}`}`);
    }
    return { output: responseData };
}

async function executeStripeCreatePaymentLinkNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE STRIPE] SIMULATION: Would create a payment link.`, type: 'info' });
        return { output: config.simulated_config };
    }

    const apiKey = await resolveValue(config.apiKey, {}, serverLogs, userId);
    if (!apiKey) throw new Error("Stripe API Key is not configured or resolved. Please set the credential placeholder {{credential.StripeApiKey}} and ensure the credential or environment variable is available.");
    
    let lineItems = config.line_items;
    if (typeof lineItems === 'string') {
        try {
            lineItems = JSON.parse(lineItems);
        } catch (e: any) {
            throw new Error(`Invalid JSON for Stripe line_items: ${e.message}`);
        }
    }
    if (!lineItems || !Array.isArray(lineItems)) throw new Error("Line items are not configured or are not an array.");

    const body = new URLSearchParams();
    lineItems.forEach((item: any, index: number) => {
        // This handles nested objects in Stripe's form-encoded format
        const processObject = (obj: any, prefix: string) => {
            for(const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const newPrefix = prefix ? `${prefix}[${key}]` : key;
                    if(typeof obj[key] === 'object' && obj[key] !== null) {
                        processObject(obj[key], newPrefix);
                    } else {
                        body.append(newPrefix, obj[key]);
                    }
                }
            }
        }
        processObject(item, `line_items[${index}]`);
    });

    const response = await fetch('https://api.stripe.com/v1/payment_links', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
    });

    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(`Stripe API error: ${responseData.error?.message || `HTTP error ${response.status}`}`);
    }
    return { output: responseData };
}

async function executeHubSpotCreateContactNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE HUBSPOT] SIMULATION: Would create a contact.`, type: 'info' });
        return { output: config.simulated_config };
    }

    const apiKey = await resolveValue(config.apiKey, {}, serverLogs, userId);
    if (!apiKey) throw new Error("HubSpot API Key is not configured or resolved. Please set the credential placeholder {{credential.HubSpotApiKey}} and ensure the credential or environment variable is available.");
    
    let properties = config.properties;
    if(typeof properties === 'string') {
        try {
            properties = JSON.parse(properties);
        } catch(e: any) {
            throw new Error(`Invalid JSON for HubSpot properties: ${e.message}`);
        }
    }
    if (!properties || typeof properties !== 'object') throw new Error("HubSpot properties are not configured or are not an object.");
    
    const requestBody = {
        properties: {
            ...properties,
            email: config.email,
        }
    };

    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(`HubSpot API error: ${responseData.message || `HTTP error ${response.status}`}`);
    }
    return { output: responseData };
}

async function executeGoogleSheetsAppendRowNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE GOOGLESHEETS] SIMULATION: Would append row to ${config.spreadsheetId}.`, type: 'info' });
        return { output: config.simulated_config || { updatedRange: 'Sheet1!A1:B1', updatedRows: 1 } };
    }

    // Google Sheets functionality has been removed as we're using Puter.js AI only
    // This would require a direct HTTP API call to Google Sheets API
    serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE GOOGLESHEETS] ERROR: Google Sheets integration requires googleapis package which has been removed.`, type: 'error' });
    throw new Error('Google Sheets integration is not available in this version. Please use alternative data storage methods.');
}


// Simulated Live Mode for complex auth integrations
async function executeSimulatedLiveNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string, serviceName: string): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE ${serviceName.toUpperCase()}] SIMULATION: Returning simulated data.`, type: 'info' });
        return { output: config.simulated_config || {} };
    }

    serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE ${serviceName.toUpperCase()}] LIVE (SIMULATED): This integration requires complex setup (e.g., OAuth2), which is not fully implemented. Returning simulated data for workflow continuity.`, type: 'info' });

    // In a real scenario, you'd check for OAuth tokens here.
    const hasCreds = Object.values(config).some(val => typeof val === 'string' && val.includes('{{credential.'));
    if (!hasCreds) {
       serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE ${serviceName.toUpperCase()}] WARNING: No credential placeholder found in config. Real execution would fail.`, type: 'info' });
    }

    return { output: config.simulated_config || {} };
}

async function executeYoutubeFetchTrendingNode(node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string): Promise<any> {
    if (isSimulationMode) {
        serverLogs.push({ timestamp: new Date().toISOString(), message: `[NODE YOUTUBE] SIMULATION: Would fetch trending videos for region ${config.region}.`, type: 'info' });
        return { output: config.simulated_config || { videos: [] } };
    }

    const apiKey = config.apiKey;
    if (!apiKey) {
        throw new Error("YouTube API Key not found. Please set it in the node's config, likely using a credential placeholder like {{credential.YouTubeApiKey}}.");
    }

    // Direct API call since Google APIs are removed
    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&regionCode=${config.region || 'US'}&maxResults=${config.maxResults || 5}&key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`YouTube API error: ${data.error?.message || `HTTP error ${response.status}`}`);
        }

        const videos = data.items?.map((item: any) => ({
            id: item.id,
            title: item.snippet?.title,
            description: item.snippet?.description,
            channelTitle: item.snippet?.channelTitle,
            publishedAt: item.snippet?.publishedAt,
            tags: item.snippet?.tags,
            viewCount: item.statistics?.viewCount,
            likeCount: item.statistics?.likeCount,
            commentCount: item.statistics?.commentCount,
            duration: item.contentDetails?.duration,
        })) || [];

        return { output: { videos: videos } };
    } catch (e: any) {
        console.error(`[NODE YOUTUBE] YouTube API Error: ${e.message}`);
        throw new Error(`YouTube API error: ${e.message}`);
    }
}


const nodeExecutionFunctions: Record<string, Function> = {
    webhookTrigger: executeWebhookTriggerNode,
    schedule: executeScheduleNode,
    httpRequest: executeHttpRequestNode,
    aiTask: executeAiTaskNode,
    generateImage: executeGenerateImageNode,
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
    aggregateData: executeAggregateDataNode,
    textToSpeech: executeTextToSpeechNode,

    // Integration Nodes
    slackPostMessage: executeSlackPostMessageNode,
    openAiChatCompletion: executeOpenAiChatCompletionNode,
    githubCreateIssue: executeGithubCreateIssueNode,
    twilioSendSms: executeTwilioSendSmsNode,
    stripeCreatePaymentLink: executeStripeCreatePaymentLinkNode,
    hubspotCreateContact: executeHubSpotCreateContactNode,
    googleSheetsAppendRow: executeGoogleSheetsAppendRowNode,
    youtubeFetchTrending: executeYoutubeFetchTrendingNode,
    dropboxUploadFile: (node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string) =>
        executeSimulatedLiveNode(node, config, isSimulationMode, serverLogs, allWorkflowData, userId, 'Dropbox'),
    googleCalendarListEvents: (node: WorkflowNode, config: any, isSimulationMode: boolean, serverLogs: ServerLogOutput[], allWorkflowData: Record<string, any>, userId: string) =>
        executeSimulatedLiveNode(node, config, isSimulationMode, serverLogs, allWorkflowData, userId, 'Google Calendar'),
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
  userId: string
): Promise<{ finalWorkflowData: Record<string, any>, serverLogs: ServerLogOutput[], lastNodeOutput?: any, flowError?: string }> {

    const { executionOrder, error: sortError } = getExecutionOrder(nodesToExecute, connectionsToExecute, flowLabel);
    let lastNodeOutput: any = null;

    if (sortError) {
        const errorMessage = `[ENGINE/${flowLabel}] Critical graph error: ${sortError}`;
        serverLogs.push({ timestamp: new Date().toISOString(), message: errorMessage, type: 'error' });
        // Throwing the error here to be caught by the top-level executeWorkflow function
        throw new Error(errorMessage);
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

        const dataForResolution = { ...currentWorkflowData };
        const resolvedConfig = await resolveNodeConfig(node.config || {}, node.inputMapping, dataForResolution, serverLogs, userId);

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
  
    // New Rate Limiting Logic
    if (!isSimulationMode) { // Only rate-limit live runs
        const profile = await WorkflowStorage.getUserProfile(userId);
        let tier: SubscriptionTier = 'Free';
        if (profile) {
            if (profile.subscription_tier === 'Gold' || profile.subscription_tier === 'Diamond') {
                tier = profile.subscription_tier;
            } else if (profile.trial_end_date && new Date(profile.trial_end_date) > new Date()) {
                tier = 'Gold Trial';
            }
        }
        
        let features: SubscriptionFeatures;
        switch(tier) {
            case 'Gold': features = GOLD_TIER_FEATURES; break;
            case 'Gold Trial':
            case 'Diamond': features = DIAMOND_TIER_FEATURES; break;
            default: features = FREE_TIER_FEATURES;
        }

        if (features.maxRunsPerMonth !== 'unlimited') {
            const currentRuns = await WorkflowStorage.getMonthlyRunCount(userId);
            if (currentRuns >= features.maxRunsPerMonth) {
                // Do not increment the count if the run is blocked
                throw new Error(`Monthly run limit of ${features.maxRunsPerMonth} has been reached for the ${tier} plan. Please upgrade your plan to continue.`);
            }
        }
    }
    
    let mutableInitialData = initialData ? { ...initialData } : undefined;
    const serverLogs: ServerLogOutput[] = [];

    // Special handling for editor-initiated runs of scheduled workflows
    if (!mutableInitialData) {
        // Find trigger nodes that don't depend on other nodes
        const nodesWithInputs = new Set(workflow.connections.map(c => c.targetNodeId));
        const rootNodes = workflow.nodes.filter(n => !nodesWithInputs.has(n.id));
        const scheduleNode = rootNodes.find(n => n.type === 'schedule');

        if (scheduleNode) {
            mutableInitialData = {
                [scheduleNode.id]: { triggered_at: new Date().toISOString() }
            };
            serverLogs.push({ timestamp: new Date().toISOString(), message: `[ENGINE] Manually triggering schedule node '${scheduleNode.name}' for editor run.`, type: 'info' });
        }
    }


    try {
        const initialWorkflowData: Record<string, any> = {};

        // Pre-populate with initial trigger data if available
        if (mutableInitialData) {
            for (const nodeId in mutableInitialData) {
                if (workflow.nodes.some(n => n.id === nodeId)) {
                    initialWorkflowData[nodeId] = mutableInitialData[nodeId];
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
    } finally {
        if (!isSimulationMode) {
            await WorkflowStorage.incrementMonthlyRunCount(userId);
        }
    }
}