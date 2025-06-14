
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
import type { Workflow, ServerLogOutput, WorkflowNode, WorkflowConnection, RetryConfig, BranchConfig } from '@/types/workflow';
import { ai } from '@/ai/genkit'; 
import nodemailer from 'nodemailer';
import { Pool } from 'pg';

// Helper function to resolve placeholder values
function resolveValue(
  value: any, 
  workflowData: Record<string, any>, 
  serverLogs: ServerLogOutput[],
  additionalContexts?: Record<string, any> // For loop item, branch-specific data, etc.
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
    
    if (pathParts.length === 0) {
      const warningMsg = `[ENGINE] Invalid placeholder path: '${path}' in value '${value}'. Placeholder remains unresolved.`;
      console.warn(warningMsg);
      serverLogs.push({ message: warningMsg, type: 'info' });
      continue;
    }

    const firstPart = pathParts[0];
    let dataFound = false;
    let dataAtPath: any;

    // 1. Check additionalContexts (e.g., loop item, branch data)
    if (additionalContexts && additionalContexts.hasOwnProperty(firstPart)) {
      dataAtPath = additionalContexts[firstPart];
      let currentPathForLog = firstPart;
      let contextFound = true;
      for (let i = 1; i < pathParts.length; i++) {
        const part = pathParts[i];
        currentPathForLog += `.${part}`;
        const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
        if (arrayMatch) {
          const arrayKey = arrayMatch[1]; const index = parseInt(arrayMatch[2], 10);
          if (dataAtPath && typeof dataAtPath === 'object' && dataAtPath !== null && Array.isArray(dataAtPath[arrayKey]) && dataAtPath[arrayKey].length > index) dataAtPath = dataAtPath[arrayKey][index];
          else { contextFound = false; break; }
        } else if (dataAtPath && typeof dataAtPath === 'object' && dataAtPath !== null && part in dataAtPath) dataAtPath = dataAtPath[part];
        else { contextFound = false; break; }
      }
      if (contextFound) {
        dataFound = true;
      } else {
         serverLogs.push({ message: `[ENGINE] Path part '${pathParts.slice(1).join('.')}' not found in additional context '${firstPart}' for placeholder '${placeholder}'.`, type: 'info' });
      }
    }

    // 2. Check environment variables
    if (!dataFound && firstPart === 'env' && pathParts.length >= 2) {
      const envVarName = pathParts.slice(1).join('.');
      const envVarValue = process.env[envVarName];
      if (envVarValue !== undefined) {
        resolvedValue = resolvedValue.replace(placeholder, envVarValue);
        if (placeholder === value) resolvedValue = envVarValue; 
        dataFound = true; 
        serverLogs.push({ message: `[ENGINE] Resolved '{{env.${envVarName}}}' from environment.`, type: 'info' });
        continue; 
      } else {
        const warningMsg = `[ENGINE] Environment variable '${envVarName}' not found for placeholder '${placeholder}'. Define it in .env.local or server environment. Placeholder remains unresolved.`;
        console.warn(warningMsg); serverLogs.push({ message: warningMsg, type: 'info' });
        continue;
      }
    }
    
    // 3. Check conceptual secrets (vault)
    if (!dataFound && firstPart === 'secret' && pathParts.length >= 2) {
        const secretName = pathParts.slice(1).join('.');
        const infoMsg = `[ENGINE] Placeholder '{{secret.${secretName}}}' encountered. In a production environment, this would be resolved from a secure secrets vault. Actual vault integration is not yet implemented. Placeholder remains unresolved. For local development, consider using '{{env.${secretName}}}' and defining it in a .env.local file.`;
        console.info(infoMsg); 
        serverLogs.push({ message: infoMsg, type: 'info'});
        continue; 
    }

    // 4. Check workflowData (node outputs from the current scope)
    if (!dataFound) {
        if (!workflowData.hasOwnProperty(firstPart)) {
            const warningMsg = `[ENGINE] No data found for node ID or context key '${firstPart}' in current workflow data scope when resolving placeholder '${placeholder}'. Full placeholder: '${value}'. Available node IDs/keys in current scope: ${Object.keys(workflowData).join(', ') || 'none'}. Placeholder remains unresolved.`;
            console.warn(warningMsg); serverLogs.push({ message: warningMsg, type: 'info' });
            continue;
        }
        dataAtPath = workflowData[firstPart];
        let currentPathForLog = firstPart;
        let wfDataFound = true;
        for (let i = 1; i < pathParts.length; i++) {
            const part = pathParts[i];
            currentPathForLog += `.${part}`;
            const arrayMatch = part.match(/(\w+)\[(\d+)\]/);
            if (arrayMatch) {
                const arrayKey = arrayMatch[1]; const index = parseInt(arrayMatch[2], 10);
                if (dataAtPath && typeof dataAtPath === 'object' && dataAtPath !== null && Array.isArray(dataAtPath[arrayKey]) && dataAtPath[arrayKey].length > index) dataAtPath = dataAtPath[arrayKey][index];
                else { wfDataFound = false; break; }
            } else if (dataAtPath && typeof dataAtPath === 'object' && dataAtPath !== null && part in dataAtPath) dataAtPath = dataAtPath[part];
            else { wfDataFound = false; break; }
        }
        if (wfDataFound) {
            dataFound = true;
        } else {
            const warningMsg = `[ENGINE] Path part '${pathParts.slice(1).join('.')}' not found in data for node '${firstPart}' when resolving placeholder '${placeholder}'. Attempted path: ${currentPathForLog}. Data at path start: ${JSON.stringify(workflowData[firstPart], null, 2).substring(0,100)}. Placeholder remains unresolved.`;
            console.warn(warningMsg); serverLogs.push({ message: warningMsg, type: 'info' });
        }
    }
    
    if (dataFound) {
      if (placeholder === value && (typeof dataAtPath !== 'string' && typeof dataAtPath !== 'number' && typeof dataAtPath !== 'boolean' && dataAtPath !== null)) { 
        resolvedValue = dataAtPath; 
      } else { 
        const replacementValue = (typeof dataAtPath === 'string' || typeof dataAtPath === 'number' || typeof dataAtPath === 'boolean' || dataAtPath === null) 
          ? String(dataAtPath) 
          : JSON.stringify(dataAtPath); 
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
      if (key === 'flowGroupNodes' || key === 'flowGroupConnections' || 
          key === 'iterationNodes' || key === 'iterationConnections' || 
          key === 'loopNodes' || key === 'loopConnections' ||
          key === 'branches') {
        resolvedConfig[key] = value; 
        continue;
      }
      if (key === 'retry' && typeof value === 'object' && value !== null) {
        resolvedConfig[key] = value; 
        continue;
      }
      if (typeof value === 'string') {
        resolvedConfig[key] = resolveValue(value, workflowData, serverLogs, additionalContexts);
      } else if (Array.isArray(value)) {
        resolvedConfig[key] = value.map(item => (typeof item === 'string' ? resolveValue(item, workflowData, serverLogs, additionalContexts) : 
                                                 (typeof item === 'object' && item !== null ? resolveNodeConfig(item, workflowData, serverLogs, additionalContexts) : item)
                                           ));
      } else if (typeof value === 'object' && value !== null) {
        resolvedConfig[key] = resolveNodeConfig(value, workflowData, serverLogs, additionalContexts); 
      } else {
        resolvedConfig[key] = value; 
      }
    }
  }
  return resolvedConfig;
}

function evaluateCondition(conditionString: string, nodeIdentifier: string, serverLogs: ServerLogOutput[]): boolean {
  if (typeof conditionString !== 'string' || conditionString.trim() === '') {
      const errMsg = `Node ${nodeIdentifier}: Condition string is missing, empty, or resolved to non-string. Cannot evaluate.`;
      serverLogs.push({ message: `[CONDITION EVAL] ${errMsg}`, type: 'error' });
      console.error(`[CONDITION EVAL] ${errMsg}`);
      return false; 
  }
  serverLogs.push({ message: `[CONDITION EVAL] Node ${nodeIdentifier}: Evaluating condition string: "${conditionString}"`, type: 'info' });
  
  let evaluationResult = false;
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
          
          serverLogs.push({ message: `[CONDITION EVAL] Parsed operands: val1=${JSON.stringify(val1)} (type: ${typeof val1}), op=${operatorFound}, val2=${JSON.stringify(val2)} (type: ${typeof val2})`, type: 'info' });

          switch(operatorFound) {
              case '===': evaluationResult = val1 === val2; break;
              case '!==': evaluationResult = val1 !== val2; break;
              case '==':  evaluationResult = val1 == val2; break; 
              case '!=':  evaluationResult = val1 != val2; break;
              case '<':   evaluationResult = (typeof val1 === typeof val2 && typeof val1 === 'number') ? val1 < val2 : String(val1) < String(val2); break;
              case '>':   evaluationResult = (typeof val1 === typeof val2 && typeof val1 === 'number') ? val1 > val2 : String(val1) > String(val2); break;
              case '<=':  evaluationResult = (typeof val1 === typeof val2 && typeof val1 === 'number') ? val1 <= val2 : String(val1) <= String(val2); break;
              case '>=':  evaluationResult = (typeof val1 === typeof val2 && typeof val1 === 'number') ? val1 >= val2 : String(val1) >= String(val2); break;
          }
      } else {
          
          const singleValue = parseOperand(conditionString);
          evaluationResult = !!singleValue;
          serverLogs.push({ message: `[CONDITION EVAL] No operator. Evaluated truthiness of '${singleValue}' to ${evaluationResult}`, type: 'info' });
      }
  } catch (e: any) {
      const errMsg = `Node ${nodeIdentifier}: Error evaluating condition "${conditionString}": ${e.message}`;
      serverLogs.push({ message: `[CONDITION EVAL] ${errMsg}`, type: 'error' });
      console.error(`[CONDITION EVAL] ${errMsg}`, e);
      evaluationResult = false; 
  }
  serverLogs.push({ message: `[CONDITION EVAL] Node ${nodeIdentifier}: Condition "${conditionString}" evaluated to ${evaluationResult}.`, type: 'success' });
  return evaluationResult;
}


export async function enhanceAndGenerateWorkflow(input: { originalPrompt: string }): Promise<GenerateWorkflowFromPromptOutput> {
  try {
    console.log("[SERVER ACTION] Enhancing prompt:", input.originalPrompt);
    const enhancementResult = await genkitEnhanceUserPrompt({ originalPrompt: input.originalPrompt });
    
    let promptForGeneration = input.originalPrompt;
    if (enhancementResult && enhancementResult.enhancedPrompt) {
      console.log("[SERVER ACTION] Enhanced prompt received:", enhancementResult.enhancedPrompt);
      promptForGeneration = enhancementResult.enhancedPrompt;
    } else {
      console.warn("[SERVER ACTION] Prompt enhancement failed or returned empty. Using original prompt.");
    }
    
    return generateWorkflow({ prompt: promptForGeneration });
  } catch (error) {
    console.error("[SERVER ACTION] Error in enhanceAndGenerateWorkflow:", error);
    if (error instanceof Error) {
      throw new Error(`Failed during prompt enhancement or workflow generation: ${error.message}`);
    }
    throw new Error("Failed during prompt enhancement or workflow generation due to an unknown error.");
  }
}


export async function generateWorkflow(input: GenerateWorkflowFromPromptInput): Promise<GenerateWorkflowFromPromptOutput> {
  try {
    console.log("[SERVER ACTION] Generating workflow with prompt:", JSON.stringify(input.prompt, null, 2));
    const result = await genkitGenerateWorkflowFromPrompt(input);
    console.log("[SERVER ACTION] Workflow generated:", JSON.stringify(result, null, 2));
    
    if (!result || !Array.isArray(result.nodes) || !Array.isArray(result.connections)) {
      throw new Error("AI returned an invalid workflow structure.");
    }
    
    return result;
  } catch (error) {
    console.error("[SERVER ACTION] Error in generateWorkflow:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate workflow from AI: ${error.message}`);
    }
    throw new Error("Failed to generate workflow from AI due to an unknown error.");
  }
}

export async function suggestNextWorkflowNode(input: SuggestNextNodeInput): Promise<SuggestNextNodeOutput> {
  try {
    const result = await genkitSuggestNextNode(input);
    if (!result || !result.suggestedNode) {
      throw new Error("AI failed to suggest a next node.");
    }
    return result;
  } catch (error) {
    console.error("[SERVER ACTION] Error in suggestNextWorkflowNode:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to suggest next node: ${error.message}`);
    }
    throw new Error("Failed to suggest next node due to an unknown error.");
  }
}

function getExecutionOrder(nodes: WorkflowNode[], connections: WorkflowConnection[]): { executionOrder: WorkflowNode[], error?: string } {
  const adj: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  const nodeMap: Record<string, WorkflowNode> = {};

  for (const node of nodes) {
    adj[node.id] = [];
    inDegree[node.id] = 0;
    nodeMap[node.id] = node;
  }

  for (const conn of connections) {
    if (nodeMap[conn.sourceNodeId] && nodeMap[conn.targetNodeId]) {
        adj[conn.sourceNodeId].push(conn.targetNodeId);
        inDegree[conn.targetNodeId]++;
    } else {
        console.warn(`[ENGINE] Invalid connection: ${conn.sourceNodeId} -> ${conn.targetNodeId}. One or both nodes not found during graph build.`);
    }
  }

  const queue: string[] = [];
  for (const nodeId in inDegree) {
    if (inDegree[nodeId] === 0) {
      queue.push(nodeId);
    }
  }

  const executionOrder: WorkflowNode[] = [];
  while (queue.length > 0) {
    const u = queue.shift()!;
    executionOrder.push(nodeMap[u]);

    if(adj[u]){ 
        for (const v of adj[u]) {
        inDegree[v]--;
        if (inDegree[v] === 0) {
            queue.push(v);
        }
        }
    }
  }

  if (executionOrder.length !== nodes.length) {
    const visitedNodeIds = new Set(executionOrder.map(n => n.id));
    const unvisitedNodes = nodes.filter(n => !visitedNodeIds.has(n.id)).map(n => `${n.name || 'Unnamed Node'} (ID: ${n.id}, Type: ${n.type})`);
    const cycleHint = unvisitedNodes.length > 0 
        ? `Possible cycle involving or leading to unvisited nodes: ${unvisitedNodes.slice(0,3).join(', ')}${unvisitedNodes.length > 3 ? '...' : ''}. Check connections to/from these nodes.` 
        : 'Or, some nodes might be disconnected from the main flow. Ensure all nodes intended to run are connected.';
    const errorMessage = `[ENGINE] Workflow has a cycle or disconnected components. ${nodes.length} nodes total, ${executionOrder.length} ordered. ${cycleHint}`;
    console.error(errorMessage);
    return { executionOrder: [], error: errorMessage };
  }

  return { executionOrder };
}

async function executeFlowInternal(
  flowLabel: string, 
  nodesToExecute: WorkflowNode[],
  connectionsToExecute: WorkflowConnection[],
  currentWorkflowData: Record<string, any>, 
  serverLogs: ServerLogOutput[],
  parentWorkflowData?: Record<string, any>, 
  additionalContexts?: Record<string, any> 
): Promise<{ finalWorkflowData: Record<string, any>, serverLogs: ServerLogOutput[], lastNodeOutput?: any }> {
  
  const { executionOrder, error: sortError } = getExecutionOrder(nodesToExecute, connectionsToExecute);
  let lastNodeOutput: any = null;

  if (sortError) {
    serverLogs.push({ message: `[ENGINE/${flowLabel}] Graph error: ${sortError}`, type: 'error' });
    return { finalWorkflowData: currentWorkflowData, serverLogs, lastNodeOutput };
  }
  
  serverLogs.push({ message: `[ENGINE/${flowLabel}] Starting execution. Order: ${executionOrder.map(n=>n.id).join(' -> ')}`, type: 'info' });

  for (const node of executionOrder) {
    const nodeIdentifier = `'${node.name || 'Unnamed Node'}' (ID: ${node.id}, Type: ${node.type})`;
    console.log(`[ENGINE/${flowLabel}] Preparing to process node: ${nodeIdentifier}`);
    serverLogs.push({ message: `[ENGINE/${flowLabel}] Preparing to process node: ${nodeIdentifier}`, type: 'info' });

    const dataForResolution = parentWorkflowData ? { ...parentWorkflowData, ...currentWorkflowData } : currentWorkflowData;
    const resolvedConfig = resolveNodeConfig(node.config || {}, dataForResolution, serverLogs, additionalContexts);
    console.log(`[ENGINE/${flowLabel}] Node ${node.id} resolved config:`, JSON.stringify(resolvedConfig, null, 2));

    if (resolvedConfig.hasOwnProperty('_flow_run_condition')) {
      const conditionValue = resolvedConfig._flow_run_condition; 
      if (conditionValue === false || (typeof conditionValue === 'string' && conditionValue.toLowerCase() === 'false')) {
        serverLogs.push({ message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier} SKIPPED due to _flow_run_condition evaluating to falsy (Resolved Value: '${String(conditionValue)}').`, type: 'info' });
        currentWorkflowData[node.id] = { status: 'skipped', reason: `_flow_run_condition was falsy: ${String(conditionValue)}` };
        lastNodeOutput = currentWorkflowData[node.id];
        continue; 
      }
      serverLogs.push({ message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier} proceeding: _flow_run_condition evaluated to truthy (Resolved Value: '${String(conditionValue)}').`, type: 'info' });
    }

    let finalNodeOutput: any = { status: 'pending' }; 
    const retryConfig: RetryConfig | undefined = resolvedConfig.retry;
    const maxAttempts = retryConfig?.attempts || 1;
    const initialDelayMs = retryConfig?.delayMs || 0;
    const backoffFactor = retryConfig?.backoffFactor || 1; 
    const retryOnStatusCodes: number[] | undefined = retryConfig?.retryOnStatusCodes;
    const retryOnErrorKeywords: string[] | undefined = retryConfig?.retryOnErrorKeywords;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        let currentAttemptOutput: any = { status: 'success' }; 
        serverLogs.push({ message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier}: Attempt ${attempt}/${maxAttempts} starting...`, type: 'info' });

        switch (node.type) {
          case 'trigger': 
          case 'schedule': 
            serverLogs.push({ message: `[NODE ${node.type.toUpperCase()}] ${nodeIdentifier}: Trigger activated with config: ${JSON.stringify(resolvedConfig, null, 2)}`, type: 'info' });
            currentAttemptOutput = { ...currentAttemptOutput, details: resolvedConfig, triggeredAt: new Date().toISOString() };
            break;

          case 'logMessage':
            const messageToLog = resolvedConfig?.message || `Default log message from ${nodeIdentifier}`;
            console.log(`[WORKFLOW LOG] ${nodeIdentifier}: ${messageToLog}`); 
            serverLogs.push({ message: `[NODE LOGMESSAGE] ${nodeIdentifier}: ${messageToLog}`, type: 'info' });
            currentAttemptOutput = { ...currentAttemptOutput, output: messageToLog };
            break;

          case 'httpRequest':
            const { url, method = 'GET', headers: headersString = '{}', body } = resolvedConfig;
            if (!url) throw new Error(`Node ${nodeIdentifier}: URL is not configured or resolved.`);
            serverLogs.push({ message: `[NODE HTTPREQUEST] ${nodeIdentifier}: Attempting ${method} request to ${url}`, type: 'info' });
            
            let parsedHeaders: Record<string, string> = {};
            try {
              if (headersString && typeof headersString === 'string' && headersString.trim() !== '') parsedHeaders = JSON.parse(headersString);
              else if (typeof headersString === 'object' && headersString !== null) parsedHeaders = headersString; 
            } catch (e: any) { const err = new Error(`Node ${nodeIdentifier}: Invalid headers JSON: ${e.message}. Headers provided: '${headersString}'`); throw err; }

            const fetchOptions: RequestInit = { method, headers: parsedHeaders };
            if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
              fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
              if (!parsedHeaders['Content-Type'] && typeof body !== 'string') (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
            }
            
            const response = await fetch(url, fetchOptions);
            const responseText = await response.text(); 
            if (!response.ok) {
              const httpError = new Error(`HTTP request failed for node ${nodeIdentifier} with status ${response.status}: ${responseText}`);
              (httpError as any).statusCode = response.status;
              throw httpError;
            }
            serverLogs.push({ message: `[NODE HTTPREQUEST] ${nodeIdentifier}: Request to ${url} SUCCEEDED with status ${response.status}. Response (first 200 chars): ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`, type: 'success' });
            
            let parsedHttpResponse: any;
            try { parsedHttpResponse = JSON.parse(responseText); } catch (e) { parsedHttpResponse = responseText; }
            currentAttemptOutput = { ...currentAttemptOutput, response: parsedHttpResponse, status_code: response.status };
            break;

          case 'aiTask':
            const { prompt: aiPrompt, model: aiModelFromConfig } = resolvedConfig;
            if (!aiPrompt) throw new Error(`Node ${nodeIdentifier}: AI Prompt is not configured or resolved.`);
            const modelToUse = aiModelFromConfig || 'googleai/gemini-1.5-flash-latest'; 
            serverLogs.push({ message: `[NODE AITASK] ${nodeIdentifier}: Sending prompt to model ${modelToUse}. Prompt (first 100 chars): "${String(aiPrompt).substring(0, 100)}${String(aiPrompt).length > 100 ? '...' : ''}"`, type: 'info' });
            
            const genkitResponse = await ai.generate({ prompt: String(aiPrompt), model: modelToUse as any });
            const aiResponseTextContent = genkitResponse.text; 
            
            serverLogs.push({ message: `[NODE AITASK] ${nodeIdentifier}: Received response from AI. Response (first 200 chars): ${aiResponseTextContent.substring(0, 200)}${aiResponseTextContent.length > 200 ? '...' : ''}`, type: 'success' });
            currentAttemptOutput = { ...currentAttemptOutput, output: aiResponseTextContent }; 
            break;

          case 'parseJson':
            const { jsonString, path } = resolvedConfig;
            let dataToParse: any, parsedResponse: any;
            if (typeof jsonString === 'string') {
              if (jsonString.trim() === '') {
                if (!path || path.trim() === '' || path.trim() === '$' || path.trim() === '$.') { dataToParse = {}; serverLogs.push({ message: `[NODE PARSEJSON] ${nodeIdentifier}: Input JSON string is empty, path is root. Parsing as empty object.`, type: 'info' }); }
                else { throw new Error(`Node ${nodeIdentifier}: Cannot extract path '${path}' from an empty JSON string.`); }
              } else { try { dataToParse = JSON.parse(jsonString); } catch (e: any) { throw new Error(`Node ${nodeIdentifier}: Invalid JSON input string: ${e.message}. Input (first 100 chars): '${jsonString.substring(0,100)}...'`); }}
            } else if (typeof jsonString === 'object' && jsonString !== null) { dataToParse = jsonString; serverLogs.push({ message: `[NODE PARSEJSON] ${nodeIdentifier}: Input is already an object. No parsing needed.`, type: 'info' });}
            else if (jsonString === null) {
              if (!path || path.trim() === '' || path.trim() === '$' || path.trim() === '$.') { dataToParse = null; serverLogs.push({ message: `[NODE PARSEJSON] ${nodeIdentifier}: Input JSON is null, path is root. Outputting null.`, type: 'info' });}
              else { throw new Error(`Node ${nodeIdentifier}: Cannot extract path '${path}' from a null JSON input.`);}
            } else { throw new Error(`Node ${nodeIdentifier}: JSON input must be a non-null string or an object. Received type: ${typeof jsonString}, value: ${JSON.stringify(jsonString)}`);}
            
            serverLogs.push({ message: `[NODE PARSEJSON] ${nodeIdentifier}: Parsing JSON. Path: ${path || '(root)'}`, type: 'info' });
            let extractedValue: any;
            if (!path || path.trim() === '' || path.trim() === '$' || path.trim() === '$.') extractedValue = dataToParse; 
            else {
              const pathPartsToExtract = path.replace(/^\$\.?/, '').split('.'); 
              let currentExtractedData = dataToParse; let extractionFound = true;
              for (const part of pathPartsToExtract) {
                if (part === '') continue; 
                const arrayMatch = part.match(/(\w+)\[(\d+)\]/); 
                if (arrayMatch) {
                  const arrayKey = arrayMatch[1]; const index = parseInt(arrayMatch[2], 10);
                  if (currentExtractedData && typeof currentExtractedData === 'object' && currentExtractedData !== null && Array.isArray(currentExtractedData[arrayKey]) && currentExtractedData[arrayKey].length > index) currentExtractedData = currentExtractedData[arrayKey][index];
                  else { extractionFound = false; break; }
                } else if (currentExtractedData && typeof currentExtractedData === 'object' && currentExtractedData !== null && part in currentExtractedData) currentExtractedData = currentExtractedData[part];
                else { extractionFound = false; break; }
              }
              if (extractionFound) extractedValue = currentExtractedData;
              else throw new Error(`Node ${nodeIdentifier}: Path "${path}" not found in JSON object. Current object (first 200 chars): ${JSON.stringify(dataToParse, null, 2).substring(0,200)}`);
            }
            serverLogs.push({ message: `[NODE PARSEJSON] ${nodeIdentifier}: Extracted value (first 200 chars): ${JSON.stringify(extractedValue).substring(0,200)}`, type: 'success' });
            currentAttemptOutput = { ...currentAttemptOutput, output: extractedValue }; 
            break;

          case 'conditionalLogic':
              const conditionString = resolvedConfig.condition; 
              const conditionEvalResult = evaluateCondition(String(conditionString), nodeIdentifier, serverLogs); 
              currentAttemptOutput = { ...currentAttemptOutput, result: conditionEvalResult };
              break;
          
          case 'dataTransform':
              const { transformType, inputString, inputObject, inputArray, fieldsToExtract, stringsToConcatenate, separator, delimiter, index, propertyName } = resolvedConfig;
              let transformedData: any = null; serverLogs.push({ message: `[NODE DATATRANSFORM] ${nodeIdentifier}: Attempting transform: ${transformType}`, type: 'info' });
              switch (transformType) {
                case 'toUpperCase': if (typeof inputString !== 'string') throw new Error('toUpperCase requires inputString to be a string.'); transformedData = inputString.toUpperCase(); break;
                case 'toLowerCase': if (typeof inputString !== 'string') throw new Error('toLowerCase requires inputString to be a string.'); transformedData = inputString.toLowerCase(); break;
                case 'extractFields': if (typeof inputObject !== 'object' || inputObject === null) throw new Error('extractFields requires inputObject to be an object.'); if (!Array.isArray(fieldsToExtract) || !fieldsToExtract.every(f => typeof f === 'string')) throw new Error('extractFields requires fieldsToExtract to be an array of strings.'); transformedData = {}; for (const field of fieldsToExtract) if (inputObject.hasOwnProperty(field)) (transformedData as Record<string, any>)[field] = inputObject[field]; break;
                case 'concatenateStrings': let stringsToJoin = stringsToConcatenate; if (typeof stringsToConcatenate === 'string') stringsToJoin = [stringsToConcatenate]; if (!Array.isArray(stringsToJoin) || !stringsToJoin.every(s => typeof s === 'string' || typeof s === 'number' || typeof s === 'boolean' || s === null || s === undefined)) throw new Error('concatenateStrings requires stringsToConcatenate to be an array of strings, numbers, booleans, nulls or undefineds.'); transformedData = stringsToJoin.map(s => String(s ?? '')).join(separator || ''); break;
                case 'stringSplit': if (typeof inputString !== 'string') throw new Error('stringSplit requires inputString to be a string.'); if (typeof delimiter !== 'string') throw new Error('stringSplit requires delimiter to be a string.'); transformedData = { array: inputString.split(delimiter) }; break;
                case 'arrayLength': if (!Array.isArray(inputArray)) throw new Error('arrayLength requires inputArray to be an array.'); transformedData = { length: inputArray.length }; break;
                case 'getItemAtIndex': if (!Array.isArray(inputArray)) throw new Error('getItemAtIndex requires inputArray to be an array.'); const idx = Number(index); if (isNaN(idx) || idx < 0 || idx >= inputArray.length) throw new Error('getItemAtIndex requires a valid, in-bounds numeric index.'); transformedData = { item: inputArray[idx] }; break;
                case 'getObjectProperty': if (typeof inputObject !== 'object' || inputObject === null) throw new Error('getObjectProperty requires inputObject to be an object.'); if (typeof propertyName !== 'string' || propertyName.trim() === '') throw new Error('getObjectProperty requires a non-empty propertyName string.'); transformedData = { propertyValue: inputObject[propertyName] }; break;
                default: throw new Error(`Unsupported dataTransform type: ${transformType}`);
              }
              serverLogs.push({ message: `[NODE DATATRANSFORM] ${nodeIdentifier}: Transform '${transformType}' successful. Output: ${JSON.stringify(transformedData).substring(0,200)}`, type: 'success' });
              currentAttemptOutput = { ...currentAttemptOutput, output_data: transformedData }; 
              break;

          case 'sendEmail':
              const { to, subject, body: emailBody } = resolvedConfig;
              if (!to || !subject || !emailBody) throw new Error(`Node ${nodeIdentifier}: 'to', 'subject', and 'body' are required for sendEmail.`);
              if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM) throw new Error(`Node ${nodeIdentifier}: Missing one or more EMAIL_ environment variables for Nodemailer configuration.`);
              const transporter = nodemailer.createTransport({ host: process.env.EMAIL_HOST, port: parseInt(process.env.EMAIL_PORT, 10), secure: process.env.EMAIL_SECURE === 'true', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }});
              const mailOptions = { from: process.env.EMAIL_FROM, to: to, subject: subject, html: emailBody };
              serverLogs.push({ message: `[NODE SENDEMAIL] ${nodeIdentifier}: Attempting to send email to ${to} with subject "${subject}"`, type: 'info' });
              const info = await transporter.sendMail(mailOptions);
              serverLogs.push({ message: `[NODE SENDEMAIL] ${nodeIdentifier}: Email sent successfully. Message ID: ${info.messageId}`, type: 'success' });
              currentAttemptOutput = { ...currentAttemptOutput, messageId: info.messageId };
              break;
              
          case 'databaseQuery':
              const { queryText, queryParams } = resolvedConfig;
              if (!queryText) throw new Error(`Node ${nodeIdentifier}: 'queryText' is required for databaseQuery.`);
              if (!process.env.DB_CONNECTION_STRING) throw new Error(`Node ${nodeIdentifier}: Missing DB_CONNECTION_STRING environment variable.`);
              const pool = new Pool({ connectionString: process.env.DB_CONNECTION_STRING });
              const client = await pool.connect();
              serverLogs.push({ message: `[NODE DATABASEQUERY] ${nodeIdentifier}: Executing query: ${queryText} with params: ${JSON.stringify(queryParams)}`, type: 'info' });
              try { const queryResult = await client.query(queryText, Array.isArray(queryParams) ? queryParams : []); serverLogs.push({ message: `[NODE DATABASEQUERY] ${nodeIdentifier}: Query executed successfully. Row count: ${queryResult.rowCount}`, type: 'success' }); currentAttemptOutput = { ...currentAttemptOutput, results: queryResult.rows, rowCount: queryResult.rowCount };
              } finally { client.release(); await pool.end().catch(err => console.error('[ENGINE] Error ending DB pool:', err)); } 
              break;

          case 'executeFlowGroup':
              const { flowGroupNodes: groupNodesStr, flowGroupConnections: groupConnectionsStr, inputMapping, outputMapping } = resolvedConfig;
              let groupNodes: WorkflowNode[] = []; let groupConnections: WorkflowConnection[] = [];
              try { groupNodes = typeof groupNodesStr === 'string' ? JSON.parse(groupNodesStr) : groupNodesStr; if (!Array.isArray(groupNodes)) throw new Error("flowGroupNodes must be an array.");} catch (e:any) { throw new Error(`Node ${nodeIdentifier}: Invalid JSON or non-array for flowGroupNodes. Error: ${e.message}`); }
              try { groupConnections = typeof groupConnectionsStr === 'string' ? JSON.parse(groupConnectionsStr) : groupConnectionsStr; if (!Array.isArray(groupConnections)) throw new Error("flowGroupConnections must be an array.");} catch (e:any) { throw new Error(`Node ${nodeIdentifier}: Invalid JSON or non-array for flowGroupConnections. Error: ${e.message}`); }

              const subWorkflowInitialData: Record<string, any> = {};
              if (inputMapping && typeof inputMapping === 'object') {
                  for (const [internalKey, parentPlaceholder] of Object.entries(inputMapping)) {
                      
                      subWorkflowInitialData[internalKey] = resolveValue(parentPlaceholder, currentWorkflowData, serverLogs, additionalContexts);
                  }
              }
              serverLogs.push({ message: `[NODE EXECUTEFLOWGROUP] ${nodeIdentifier}: Starting sub-flow. Mapped inputs (first 200 chars): ${JSON.stringify(subWorkflowInitialData).substring(0,200)}`, type: 'info' });
              
              const subExecutionResult = await executeFlowInternal(
                  `group ${node.id}`, 
                  groupNodes, 
                  groupConnections, 
                  subWorkflowInitialData, 
                  serverLogs, 
                  currentWorkflowData, 
                  additionalContexts   
              );
              
              const groupFinalOutput: Record<string, any> = { status: 'success' }; 
              if (outputMapping && typeof outputMapping === 'object') {
                  for (const [parentKey, subPlaceholder] of Object.entries(outputMapping)) {
                      groupFinalOutput[parentKey] = resolveValue(subPlaceholder, subExecutionResult.finalWorkflowData, serverLogs );
                  }
              }

              const subFlowErrored = Object.values(subExecutionResult.finalWorkflowData).some(out => out && out.status === 'error');
              if (subFlowErrored) {
                const subError = Object.values(subExecutionResult.finalWorkflowData).find(out => out && out.status === 'error');
                const subErrorMessage = subError?.error_message || "Error in sub-flow execution.";
                groupFinalOutput.status = 'error';
                groupFinalOutput.error_message = subErrorMessage;
                serverLogs.push({ message: `[NODE EXECUTEFLOWGROUP] ${nodeIdentifier}: Sub-flow execution FAILED. Error: ${subErrorMessage}`, type: 'error'});
                throw new Error(subErrorMessage); 
              } else {
                 serverLogs.push({ message: `[NODE EXECUTEFLOWGROUP] ${nodeIdentifier}: Sub-flow execution completed successfully. Mapped outputs (first 200 chars): ${JSON.stringify(groupFinalOutput).substring(0,200)}`, type: 'success'});
              }
              currentAttemptOutput = groupFinalOutput;
              break;
            
          case 'forEach':
            const { inputArrayPath, iterationNodes: iterNodesStr, iterationConnections: iterConnsStr, iterationResultSource, continueOnError = false } = resolvedConfig;
            if (!inputArrayPath) throw new Error(`Node ${nodeIdentifier}: 'inputArrayPath' is required.`);
            const resolvedArray = resolveValue(inputArrayPath, currentWorkflowData, serverLogs, additionalContexts);
            if (!Array.isArray(resolvedArray)) throw new Error(`Node ${nodeIdentifier}: 'inputArrayPath' ("${inputArrayPath}") did not resolve to an array. Resolved to: ${JSON.stringify(resolvedArray)}`);

            let iterNodes: WorkflowNode[] = []; let iterConns: WorkflowConnection[] = [];
            try { iterNodes = typeof iterNodesStr === 'string' ? JSON.parse(iterNodesStr) : iterNodesStr; if(!Array.isArray(iterNodes)) throw new Error("iterationNodes must be an array."); } catch(e:any){ throw new Error(`Node ${nodeIdentifier}: Invalid JSON or non-array for iterationNodes. Error: ${e.message}`); }
            try { iterConns = typeof iterConnsStr === 'string' ? JSON.parse(iterConnsStr) : iterConnsStr; if(!Array.isArray(iterConns)) throw new Error("iterationConnections must be an array."); } catch(e:any){ throw new Error(`Node ${nodeIdentifier}: Invalid JSON or non-array for iterationConnections. Error: ${e.message}`); }

            const iterationResultsCollected: any[] = [];
            let anyIterationFailed = false;
            let allIterationsFailed = resolvedArray.length > 0; 

            serverLogs.push({ message: `[NODE FOREACH] ${nodeIdentifier}: Starting iteration over ${resolvedArray.length} items. Continue on error: ${continueOnError}.`, type: 'info' });

            for (let i = 0; i < resolvedArray.length; i++) {
              const currentItem = resolvedArray[i];
              const itemContext = { 'item': currentItem, ...(additionalContexts || {}) }; 
              serverLogs.push({ message: `[NODE FOREACH] ${nodeIdentifier}: Iteration ${i + 1}/${resolvedArray.length}. Item (first 100 chars): ${JSON.stringify(currentItem).substring(0,100)}`, type: 'info' });
              
              try {
                const iterInitialData: Record<string, any> = {}; 
                const iterExecutionResult = await executeFlowInternal(
                  `forEach ${node.id} iter ${i+1}`, 
                  iterNodes, 
                  iterConns, 
                  iterInitialData, 
                  serverLogs, 
                  currentWorkflowData, 
                  itemContext         
                );

                if (Object.values(iterExecutionResult.finalWorkflowData).some(out => out && out.status === 'error')) {
                   const iterError = Object.values(iterExecutionResult.finalWorkflowData).find(out => out && out.status === 'error');
                   const iterErrorMessage = iterError?.error_message || `Error in forEach iteration ${i+1}.`;
                   throw new Error(iterErrorMessage); 
                }
                
                let resultForItem: any;
                if (iterationResultSource && typeof iterationResultSource === 'string') {
                  resultForItem = resolveValue(iterationResultSource, iterExecutionResult.finalWorkflowData, serverLogs, itemContext);
                } else {
                  resultForItem = iterExecutionResult.lastNodeOutput; 
                }
                iterationResultsCollected.push({ status: 'fulfilled', value: resultForItem, item: currentItem });
                serverLogs.push({ message: `[NODE FOREACH] ${nodeIdentifier}: Iteration ${i+1} completed successfully. Result (first 100 chars): ${JSON.stringify(resultForItem).substring(0,100)}`, type: 'success'});
                allIterationsFailed = false; 
              } catch (iterError: any) {
                anyIterationFailed = true;
                serverLogs.push({ message: `[NODE FOREACH] ${nodeIdentifier}: Iteration ${i+1} FAILED. Error: ${iterError.message}`, type: 'error' });
                iterationResultsCollected.push({ status: 'rejected', reason: iterError.message, item: currentItem });
                if (!continueOnError) {
                  currentAttemptOutput = { status: 'error', error_message: `Error in forEach iteration ${i+1}: ${iterError.message}`, results: iterationResultsCollected };
                  throw currentAttemptOutput; 
                }
              }
            }
            
            let overallLoopStatus = 'success';
            if (anyIterationFailed) {
              overallLoopStatus = allIterationsFailed && resolvedArray.length > 0 ? 'error' : 'partial_success';
            }
             if (resolvedArray.length === 0) allIterationsFailed = false; 

            currentAttemptOutput = { ...currentAttemptOutput, status: overallLoopStatus, results: iterationResultsCollected };
            if(overallLoopStatus === 'error') currentAttemptOutput.error_message = 'All iterations failed or an unrecoverable error occurred.';
            else if (overallLoopStatus === 'partial_success') currentAttemptOutput.error_message = 'Some iterations failed.';
            
            serverLogs.push({ message: `[NODE FOREACH] ${nodeIdentifier}: All iterations processed. Overall status: ${overallLoopStatus}. Total results: ${iterationResultsCollected.length}.`, type: 'info' });
            if (overallLoopStatus === 'error' && attempt < maxAttempts && resolvedArray.length > 0) { 
                throw new Error(currentAttemptOutput.error_message);
            }
            break;

          case 'whileLoop':
            const { condition: whileConditionStr, loopNodes: whileLoopNodesStr, loopConnections: whileLoopConnsStr, maxIterations = 100 } = resolvedConfig;
            if (!whileConditionStr) throw new Error(`Node ${nodeIdentifier}: 'condition' is required for whileLoop.`);
            
            let whileLoopNodes: WorkflowNode[] = []; let whileLoopConns: WorkflowConnection[] = [];
            try { whileLoopNodes = typeof whileLoopNodesStr === 'string' ? JSON.parse(whileLoopNodesStr) : whileLoopNodesStr; if(!Array.isArray(whileLoopNodes)) throw new Error("loopNodes must be an array."); } catch(e:any){ throw new Error(`Node ${nodeIdentifier}: Invalid JSON or non-array for loopNodes. Error: ${e.message}`); }
            try { whileLoopConns = typeof whileLoopConnsStr === 'string' ? JSON.parse(whileLoopConnsStr) : whileLoopConnsStr; if(!Array.isArray(whileLoopConns)) throw new Error("loopConnections must be an array."); } catch(e:any){ throw new Error(`Node ${nodeIdentifier}: Invalid JSON or non-array for loopConnections. Error: ${e.message}`); }

            let iterationsCompleted = 0;
            serverLogs.push({ message: `[NODE WHILELOOP] ${nodeIdentifier}: Starting while loop. Max iterations: ${maxIterations}.`, type: 'info' });
            
            while (iterationsCompleted < maxIterations) {
                const resolvedWhileCondition = resolveValue(whileConditionStr, currentWorkflowData, serverLogs, additionalContexts);
                const conditionIsTrue = evaluateCondition(String(resolvedWhileCondition), `${nodeIdentifier} iter ${iterationsCompleted + 1} condition`, serverLogs);

                if (!conditionIsTrue) {
                    serverLogs.push({ message: `[NODE WHILELOOP] ${nodeIdentifier}: Condition resolved to "${resolvedWhileCondition}", evaluated to false. Exiting loop after ${iterationsCompleted} iterations.`, type: 'info' });
                    break;
                }
                
                serverLogs.push({ message: `[NODE WHILELOOP] ${nodeIdentifier}: Iteration ${iterationsCompleted + 1}/${maxIterations}. Condition is true. Executing sub-flow.`, type: 'info' });
                
                const loopIterationResult = await executeFlowInternal(
                    `whileLoop ${node.id} iter ${iterationsCompleted + 1}`,
                    whileLoopNodes,
                    whileLoopConns,
                    currentWorkflowData, 
                    serverLogs,
                    parentWorkflowData, 
                    additionalContexts  
                );

                if (Object.values(loopIterationResult.finalWorkflowData).some(out => out && out.status === 'error')) {
                    const iterError = Object.values(loopIterationResult.finalWorkflowData).find(out => out && out.status === 'error');
                    const iterErrorMessage = iterError?.error_message || `Error in whileLoop iteration ${iterationsCompleted + 1}.`;
                    serverLogs.push({ message: `[NODE WHILELOOP] ${nodeIdentifier}: Iteration ${iterationsCompleted + 1} FAILED. Error: ${iterErrorMessage}`, type: 'error' });
                    currentAttemptOutput = { status: 'error', error_message: iterErrorMessage, iterations_completed: iterationsCompleted };
                    throw new Error(iterErrorMessage); 
                }
                currentWorkflowData = {...currentWorkflowData, ...loopIterationResult.finalWorkflowData}; 
                lastNodeOutput = loopIterationResult.lastNodeOutput; 
                iterationsCompleted++;
            }

            if (iterationsCompleted >= maxIterations) {
                 serverLogs.push({ message: `[NODE WHILELOOP] ${nodeIdentifier}: Reached max iterations (${maxIterations}). Exiting loop.`, type: 'info' });
                 const finalResolvedCondition = resolveValue(whileConditionStr, currentWorkflowData, serverLogs, additionalContexts);
                 if (evaluateCondition(String(finalResolvedCondition), `${nodeIdentifier} max_iter_check`, serverLogs)) {
                    currentAttemptOutput = { status: 'error', error_message: `Loop reached max iterations (${maxIterations}) and condition was still true.`, iterations_completed: iterationsCompleted };
                    throw new Error(currentAttemptOutput.error_message);
                 }
            }
            currentAttemptOutput = { ...currentAttemptOutput, status: 'success', iterations_completed: iterationsCompleted };
            serverLogs.push({ message: `[NODE WHILELOOP] ${nodeIdentifier}: Loop finished. Total iterations: ${iterationsCompleted}.`, type: 'success' });
            break;

          case 'parallel':
            const { branches: branchesStr } = resolvedConfig;
            let parsedBranches: BranchConfig[] = [];
            try {
                parsedBranches = typeof branchesStr === 'string' ? JSON.parse(branchesStr) : branchesStr;
                if (!Array.isArray(parsedBranches) || !parsedBranches.every(b => b.id && Array.isArray(b.nodes) && Array.isArray(b.connections))) {
                    throw new Error("Branches configuration must be an array of valid BranchConfig objects (id, nodes, connections are required).");
                }
            } catch (e:any) { throw new Error(`Node ${nodeIdentifier}: Invalid JSON or structure for branches configuration: ${e.message}`); }

            serverLogs.push({ message: `[NODE PARALLEL] ${nodeIdentifier}: Starting execution of ${parsedBranches.length} branches concurrently.`, type: 'info' });

            const branchPromises = parsedBranches.map(async (branch) => {
                const branchLabel = `parallel ${node.id} branch ${branch.id}`;
                serverLogs.push({ message: `[ENGINE/${branchLabel}] Starting branch.`, type: 'info' });
                
                const branchInitialData: Record<string, any> = {};
                if (branch.inputMapping && typeof branch.inputMapping === 'object') {
                    for (const [internalKey, parentPlaceholder] of Object.entries(branch.inputMapping)) {
                        branchInitialData[internalKey] = resolveValue(parentPlaceholder, currentWorkflowData, serverLogs, additionalContexts);
                    }
                }
                
                const branchExecutionResult = await executeFlowInternal(
                    branchLabel,
                    branch.nodes,
                    branch.connections,
                    branchInitialData, 
                    serverLogs,
                    currentWorkflowData, 
                    additionalContexts 
                );

                let branchOutputValue: any;
                if (branch.outputSource && typeof branch.outputSource === 'string') {
                    branchOutputValue = resolveValue(branch.outputSource, branchExecutionResult.finalWorkflowData, serverLogs);
                } else {
                    branchOutputValue = branchExecutionResult.lastNodeOutput;
                }
                
                const branchErrored = Object.values(branchExecutionResult.finalWorkflowData).some(out => out && out.status === 'error');
                if (branchErrored) {
                  const branchError = Object.values(branchExecutionResult.finalWorkflowData).find(out => out && out.status === 'error');
                  const branchErrorMessage = branchError?.error_message || "Error in parallel branch execution.";
                  serverLogs.push({ message: `[ENGINE/${branchLabel}] Branch execution FAILED. Error: ${branchErrorMessage}`, type: 'error'});
                  return { id: branch.id, status: 'rejected', reason: branchErrorMessage, value: branchOutputValue };
                }

                serverLogs.push({ message: `[ENGINE/${branchLabel}] Branch execution SUCCEEDED. Output (first 100 chars): ${JSON.stringify(branchOutputValue).substring(0,100)}`, type: 'success'});
                return { id: branch.id, status: 'fulfilled', value: branchOutputValue, branchData: branchExecutionResult.finalWorkflowData };
            });

            const allSettledResults = await Promise.allSettled(branchPromises.map(p => p.catch(e => ({ status: 'rejected', reason: e.message, id: 'unknown_branch_error' }))));
            
            const aggregatedResults: Record<string, {status: string, value?: any, reason?: any}> = {};
            let allBranchesSucceeded = true;
            let someBranchesSucceeded = false;

            allSettledResults.forEach((settledResult, index) => {
                const defaultBranchId = parsedBranches[index]?.id || `branch_${index}`; 
                if (settledResult.status === 'fulfilled') {
                    const branchOutcome = settledResult.value as { id: string; status: 'fulfilled' | 'rejected'; value?: any; reason?: any, branchData?: Record<string,any>};
                    const branchIdToUse = branchOutcome.id || defaultBranchId;
                    aggregatedResults[branchIdToUse] = { status: branchOutcome.status, value: branchOutcome.value, reason: branchOutcome.reason };
                    if(branchOutcome.status === 'fulfilled') {
                        someBranchesSucceeded = true;
                        currentWorkflowData[branchIdToUse] = branchOutcome.branchData || {}; 
                    } else {
                        allBranchesSucceeded = false;
                    }
                } else { 
                    allBranchesSucceeded = false;
                    aggregatedResults[defaultBranchId] = { status: 'rejected', reason: settledResult.reason };
                }
            });
            
            let parallelExecutionStatus = 'error'; // Renamed from overallStatus
            if (allBranchesSucceeded) parallelExecutionStatus = 'success';
            else if (someBranchesSucceeded) parallelExecutionStatus = 'partial_success';
            
            currentAttemptOutput = { status: parallelExecutionStatus, results: aggregatedResults };
            if(parallelExecutionStatus !== 'success') {
                 const firstError = Object.values(aggregatedResults).find(r => r.status === 'rejected');
                 currentAttemptOutput.error_message = `One or more parallel branches failed. First error: ${firstError?.reason || 'Unknown parallel branch error.'}`;
                 if (parallelExecutionStatus === 'error' && attempt < maxAttempts) { 
                    serverLogs.push({ message: `[NODE PARALLEL] ${nodeIdentifier}: All branches failed or critical branches failed. Error: ${currentAttemptOutput.error_message}`, type: 'error' });
                     throw new Error(currentAttemptOutput.error_message);
                 } else {
                    serverLogs.push({ message: `[NODE PARALLEL] ${nodeIdentifier}: Some branches failed. Status: ${parallelExecutionStatus}. Details: ${currentAttemptOutput.error_message}`, type: 'info' });
                 }
            } else {
                serverLogs.push({ message: `[NODE PARALLEL] ${nodeIdentifier}: All branches completed successfully.`, type: 'success' });
            }
            break;

          case 'youtubeFetchTrending':
          case 'youtubeDownloadVideo':
          case 'videoConvertToShorts':
          case 'youtubeUploadShort':
          case 'workflowNode': 
            const simulationMessage = `[NODE ${node.type.toUpperCase()}] SIMULATE: Node ${nodeIdentifier}: Intended action with config: ${JSON.stringify(resolvedConfig, null, 2)}`;
            console.log(simulationMessage);
            serverLogs.push({ message: simulationMessage, type: 'info' });
            currentAttemptOutput = { ...currentAttemptOutput, simulated_config: resolvedConfig };
            break;
            
          default:
            serverLogs.push({ message: `[ENGINE/${flowLabel}] Node type '${node.type}' for node ${nodeIdentifier} execution is not yet implemented or recognized.`, type: 'info' });
            currentAttemptOutput = { ...currentAttemptOutput, output: `Execution not implemented for type: ${node.type}`, simulated_config: resolvedConfig };
            break;
        }
        
        finalNodeOutput = currentAttemptOutput;
        if (attempt > 1) { 
          serverLogs.push({ message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier} SUCCEEDED on attempt ${attempt}/${maxAttempts}.`, type: 'success' });
        }
        break; 
      
      } catch (error: any) { 
        const errorDetails = error.message ? error.message : 'Unknown error during node execution.';
        let statusCode: number | undefined;
        if (node.type === 'httpRequest' && error.statusCode) { 
            statusCode = error.statusCode;
        } else if (node.type === 'httpRequest' && errorDetails.startsWith('HTTP request failed')) { 
            const match = errorDetails.match(/status (\d+)/);
            if (match && match[1]) {
                statusCode = parseInt(match[1], 10);
            }
        }

        console.error(`[ENGINE/${flowLabel}] Node ${nodeIdentifier} FAILED on attempt ${attempt}/${maxAttempts}. Error: ${errorDetails}`, error.stack);
        serverLogs.push({ message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier} FAILED on attempt ${attempt}/${maxAttempts}. Error: ${errorDetails}`, type: 'info' });

        if (attempt >= maxAttempts) {
          finalNodeOutput = { status: 'error', error_message: errorDetails };
          if ((node.type === 'whileLoop' || node.type === 'parallel' || node.type === 'forEach') && finalNodeOutput.iterations_completed === undefined && finalNodeOutput.results === undefined) {
             if(node.type === 'whileLoop') finalNodeOutput.iterations_completed = (currentAttemptOutput as any)?.iterations_completed || 0;
             if(node.type === 'parallel' || node.type === 'forEach') finalNodeOutput.results = (currentAttemptOutput as any)?.results || {};
          }
          serverLogs.push({ message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier} FAILED PERMANENTLY after ${maxAttempts} attempts. Final error: ${errorDetails}`, type: 'error' });
          break; 
        }

        let shouldRetryThisError = true;
        if (statusCode && retryOnStatusCodes && retryOnStatusCodes.length > 0 && !retryOnStatusCodes.includes(statusCode)) {
          shouldRetryThisError = false;
          serverLogs.push({ message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier}: Error status code ${statusCode} not in retryOnStatusCodes [${retryOnStatusCodes.join(', ')}]. No further retries for this error.`, type: 'info' });
        }
        if (shouldRetryThisError && retryOnErrorKeywords && retryOnErrorKeywords.length > 0 && !retryOnErrorKeywords.some(keyword => errorDetails.toLowerCase().includes(keyword.toLowerCase()))) {
          shouldRetryThisError = false;
          serverLogs.push({ message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier}: Error message does not contain any specified retry keywords [${retryOnErrorKeywords.join(', ')}]. No further retries for this error.`, type: 'info' });
        }

        if (!shouldRetryThisError) {
          finalNodeOutput = { status: 'error', error_message: errorDetails };
           if ((node.type === 'whileLoop' || node.type === 'parallel' || node.type === 'forEach') && finalNodeOutput.iterations_completed === undefined && finalNodeOutput.results === undefined) {
             if(node.type === 'whileLoop') finalNodeOutput.iterations_completed = (currentAttemptOutput as any)?.iterations_completed || 0;
             if(node.type === 'parallel' || node.type === 'forEach') finalNodeOutput.results = (currentAttemptOutput as any)?.results || {};
          }
          serverLogs.push({ message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier} FAILED PERMANENTLY (retry conditions not met). Error: ${errorDetails}`, type: 'error' });
          break; 
        }

        const delay = (initialDelayMs || 0) * Math.pow(backoffFactor || 1, attempt - 1);
        if (delay > 0) {
          serverLogs.push({ message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier}: Retrying in ${delay}ms... (Next attempt: ${attempt + 1}/${maxAttempts})`, type: 'info' });
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          serverLogs.push({ message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier}: Retrying immediately... (Next attempt: ${attempt + 1}/${maxAttempts})`, type: 'info' });
        }
      }
    } 

    currentWorkflowData[node.id] = finalNodeOutput;
    lastNodeOutput = finalNodeOutput; 
    console.log(`[ENGINE/${flowLabel}] Node ${node.id} final output stored:`, JSON.stringify(currentWorkflowData[node.id], null, 2).substring(0, 500));

    if (finalNodeOutput.status === 'success') {
        serverLogs.push({ message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier} processed successfully overall.`, type: 'success' });
    } else if (finalNodeOutput.status === 'error') {
        serverLogs.push({ message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier} ultimately FAILED. Check previous logs for attempt details. Workflow continues.`, type: 'info' });
    } else if (finalNodeOutput.status === 'partial_success' && (node.type === 'parallel' || node.type === 'forEach')) {
        serverLogs.push({ message: `[ENGINE/${flowLabel}] Node ${nodeIdentifier} (${node.type}) completed with partial success. Some branches/iterations failed. Check 'results' for details. Workflow continues.`, type: 'info' });
    }
  }
  return { finalWorkflowData: currentWorkflowData, serverLogs, lastNodeOutput };
}


export async function executeWorkflow(workflow: Workflow): Promise<ServerLogOutput[]> {
  const serverLogs: ServerLogOutput[] = [];
  const initialWorkflowData: Record<string, any> = {}; 

  console.log("[ENGINE] Starting MAIN workflow execution for", workflow.nodes.length, "nodes.");
  serverLogs.push({ message: `[ENGINE] MAIN workflow execution started with ${workflow.nodes.length} nodes.`, type: 'info' });

  const result = await executeFlowInternal("main", workflow.nodes, workflow.connections, initialWorkflowData, serverLogs);
  
  console.log("[ENGINE] MAIN workflow execution finished. Final workflowData (first 1000 chars):", JSON.stringify(result.finalWorkflowData, null, 2).substring(0,1000));
  result.serverLogs.push({ message: "[ENGINE] MAIN workflow execution finished.", type: 'info' }); 
  return result.serverLogs;
}

