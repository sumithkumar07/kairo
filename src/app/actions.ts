
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
import type { Workflow, ServerLogOutput, WorkflowNode, WorkflowConnection } from '@/types/workflow';
import { ai } from '@/ai/genkit'; 
import nodemailer from 'nodemailer';
import { Pool } from 'pg';

// Helper function to resolve placeholder values from workflowData
function resolveValue(value: any, workflowData: Record<string, any>, serverLogs: ServerLogOutput[]): any {
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

    if (firstPart === 'env' && pathParts.length >= 2) {
      const envVarName = pathParts.slice(1).join('.');
      const envVarValue = process.env[envVarName];
      if (envVarValue !== undefined) {
        resolvedValue = resolvedValue.replace(placeholder, envVarValue);
        if (placeholder === value) { 
            resolvedValue = envVarValue;
        }
        continue; 
      } else {
        const warningMsg = `[ENGINE] Environment variable '${envVarName}' not found for placeholder '${placeholder}'. Placeholder remains unresolved. Define it in your .env.local file or server environment.`;
        console.warn(warningMsg);
        serverLogs.push({ message: warningMsg, type: 'info' });
        continue;
      }
    }
    
    if (firstPart === 'secrets' && pathParts.length >= 2) {
        const secretName = pathParts.slice(1).join('.');
        const infoMsg = `[ENGINE] Placeholder '{{secrets.${secretName}}}' recognized. Actual secret resolution from a vault is not yet implemented. Placeholder remains unresolved. For local development, consider using '{{env.${secretName}}}' and defining it in .env.local.`;
        console.info(infoMsg); 
        serverLogs.push({ message: infoMsg, type: 'info'});
        continue; 
    }

    let currentData = workflowData[firstPart]; 

    if (currentData === undefined) {
      const warningMsg = `[ENGINE] No data found for node ID '${firstPart}' in workflow data when resolving placeholder '${placeholder}'. Full placeholder: '${value}'. Available node IDs in data: ${Object.keys(workflowData).join(', ') || 'none'}. Placeholder remains unresolved.`;
      console.warn(warningMsg);
      serverLogs.push({ message: warningMsg, type: 'info' });
      continue; 
    }
    
    let dataAtPath = currentData;
    let found = true;
    let currentPathForLog = firstPart;
    for (let i = 1; i < pathParts.length; i++) {
      const part = pathParts[i];
      currentPathForLog += `.${part}`;
      const arrayMatch = part.match(/(\w+)\[(\d+)\]/); 
      if (arrayMatch) {
        const arrayKey = arrayMatch[1];
        const index = parseInt(arrayMatch[2], 10);
        if (dataAtPath && typeof dataAtPath === 'object' && dataAtPath !== null && Array.isArray(dataAtPath[arrayKey]) && dataAtPath[arrayKey].length > index) {
          dataAtPath = dataAtPath[arrayKey][index];
        } else {
          const warningMsg = `[ENGINE] Array access failed for '${part}' in placeholder '${placeholder}'. Attempted path: ${currentPathForLog}. Data for node '${firstPart}' (start): ${JSON.stringify(currentData, null, 2).substring(0,100)}`;
          console.warn(warningMsg);
          serverLogs.push({ message: warningMsg, type: 'info' });
          found = false; break;
        }
      } else if (dataAtPath && typeof dataAtPath === 'object' && dataAtPath !== null && part in dataAtPath) {
        dataAtPath = dataAtPath[part];
      } else {
        const warningMsg = `[ENGINE] Path part '${part}' not found in data for node '${firstPart}' when resolving placeholder '${placeholder}'. Attempted path: ${currentPathForLog}. Current data at path: ${JSON.stringify(dataAtPath, null, 2).substring(0,100)}. Placeholder remains unresolved.`;
        console.warn(warningMsg);
        serverLogs.push({ message: warningMsg, type: 'info' });
        found = false;
        break;
      }
    }
    
    if (found) {
      if (placeholder === value && typeof dataAtPath !== 'string' && typeof dataAtPath !== 'number' && typeof dataAtPath !== 'boolean' && dataAtPath !== null) { 
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


function resolveNodeConfig(nodeConfig: Record<string, any>, workflowData: Record<string, any>, serverLogs: ServerLogOutput[]): Record<string, any> {
  const resolvedConfig: Record<string, any> = {};
  for (const key in nodeConfig) {
    if (Object.prototype.hasOwnProperty.call(nodeConfig, key)) {
      const value = nodeConfig[key];
      if (typeof value === 'string') {
        resolvedConfig[key] = resolveValue(value, workflowData, serverLogs);
      } else if (Array.isArray(value)) {
        resolvedConfig[key] = value.map(item => (typeof item === 'string' ? resolveValue(item, workflowData, serverLogs) : 
                                                 (typeof item === 'object' && item !== null ? resolveNodeConfig(item, workflowData, serverLogs) : item)
                                           ));
      } else if (typeof value === 'object' && value !== null) {
        resolvedConfig[key] = resolveNodeConfig(value, workflowData, serverLogs); 
      } else {
        resolvedConfig[key] = value; 
      }
    }
  }
  return resolvedConfig;
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


export async function executeWorkflow(workflow: Workflow): Promise<ServerLogOutput[]> {
  const serverLogs: ServerLogOutput[] = [];
  const workflowData: Record<string, any> = {}; 

  console.log("[ENGINE] Starting workflow execution for", workflow.nodes.length, "nodes.");
  serverLogs.push({ message: `[ENGINE] Workflow execution started with ${workflow.nodes.length} nodes.`, type: 'info' });

  const { executionOrder, error: sortError } = getExecutionOrder(workflow.nodes, workflow.connections);

  if (sortError) {
    serverLogs.push({ message: sortError, type: 'error' });
    serverLogs.push({ message: "[ENGINE] Workflow execution HALTED due to graph error.", type: 'error' });
    return serverLogs;
  }
  
  if (executionOrder.length > 0) {
    serverLogs.push({ message: `[ENGINE] Determined execution order: ${executionOrder.map(n => n.name || n.id).join(' -> ')}`, type: 'info' });
  } else if (workflow.nodes.length > 0) {
    serverLogs.push({ message: `[ENGINE] No executable order found for ${workflow.nodes.length} nodes. Check for isolated nodes or graph errors.`, type: 'info' });
  }


  for (const node of executionOrder) {
    const nodeIdentifier = `'${node.name || 'Unnamed Node'}' (ID: ${node.id}, Type: ${node.type})`;
    console.log(`[ENGINE] Processing node: ${nodeIdentifier}`);
    serverLogs.push({ message: `[ENGINE] Processing node: ${nodeIdentifier}`, type: 'info' });

    try {
      const resolvedConfig = resolveNodeConfig(node.config || {}, workflowData, serverLogs);
      console.log(`[ENGINE] Node ${node.id} resolved config:`, JSON.stringify(resolvedConfig, null, 2));

      if (resolvedConfig.hasOwnProperty('_flow_run_condition')) {
        const conditionValue = resolvedConfig._flow_run_condition;
        if (conditionValue === false || (typeof conditionValue === 'string' && conditionValue.toLowerCase() === 'false')) {
          serverLogs.push({ message: `[ENGINE] Node ${nodeIdentifier} SKIPPED due to _flow_run_condition evaluating to falsy (Resolved Value: '${String(conditionValue)}').`, type: 'info' });
          console.log(`[ENGINE] Node ${node.id} SKIPPED due to _flow_run_condition: ${conditionValue}`);
          workflowData[node.id] = { status: 'skipped', reason: `_flow_run_condition was falsy: ${String(conditionValue)}` };
          continue; 
        }
        serverLogs.push({ message: `[ENGINE] Node ${nodeIdentifier} proceeding: _flow_run_condition evaluated to truthy (Resolved Value: '${String(conditionValue)}').`, type: 'info' });
      }


      let nodeOutput: any = { status: 'success' }; // Default to success, individual nodes can override

      switch (node.type) {
        case 'trigger': 
        case 'schedule': 
          serverLogs.push({ message: `[NODE ${node.type.toUpperCase()}] ${nodeIdentifier}: Trigger activated with config: ${JSON.stringify(resolvedConfig, null, 2)}`, type: 'info' });
          nodeOutput = { ...nodeOutput, details: resolvedConfig, triggeredAt: new Date().toISOString() };
          break;

        case 'logMessage':
          const messageToLog = resolvedConfig?.message || `Default log message from ${nodeIdentifier}`;
          console.log(`[WORKFLOW LOG] ${nodeIdentifier}: ${messageToLog}`); 
          serverLogs.push({ message: `[NODE LOGMESSAGE] ${nodeIdentifier}: ${messageToLog}`, type: 'info' });
          nodeOutput = { ...nodeOutput, output: messageToLog };
          break;

        case 'httpRequest':
          const { url, method = 'GET', headers: headersString = '{}', body } = resolvedConfig;
          if (!url) {
            throw new Error(`Node ${nodeIdentifier}: URL is not configured or resolved.`);
          }
          serverLogs.push({ message: `[NODE HTTPREQUEST] ${nodeIdentifier}: Attempting ${method} request to ${url}`, type: 'info' });
          
          let parsedHeaders: Record<string, string> = {};
          try {
            if (headersString && typeof headersString === 'string' && headersString.trim() !== '') {
                 parsedHeaders = JSON.parse(headersString);
            } else if (typeof headersString === 'object' && headersString !== null) { 
                parsedHeaders = headersString; 
            }
          } catch (e: any) {
            throw new Error(`Node ${nodeIdentifier}: Invalid headers JSON: ${e.message}. Headers provided: '${headersString}'`);
          }

          const fetchOptions: RequestInit = { method, headers: parsedHeaders };
          if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
            if (!parsedHeaders['Content-Type'] && typeof body !== 'string') {
                (fetchOptions.headers as Record<string, string>)['Content-Type'] = 'application/json';
            }
          }
          
          const response = await fetch(url, fetchOptions);
          const responseText = await response.text(); 

          if (!response.ok) {
            serverLogs.push({ message: `[NODE HTTPREQUEST] ${nodeIdentifier}: Request to ${url} FAILED with status ${response.status}. Response: ${responseText}`, type: 'error' });
            throw new Error(`HTTP request failed for node ${nodeIdentifier} with status ${response.status}: ${responseText}`);
          }
          serverLogs.push({ message: `[NODE HTTPREQUEST] ${nodeIdentifier}: Request to ${url} SUCCEEDED with status ${response.status}. Response (first 200 chars): ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`, type: 'success' });
          
          let parsedResponse: any;
          try {
             parsedResponse = JSON.parse(responseText);
          } catch (e) {
             parsedResponse = responseText; 
          }
          nodeOutput = { ...nodeOutput, response: parsedResponse, status_code: response.status };
          break;

        case 'aiTask':
          const { prompt: aiPrompt, model: aiModelFromConfig } = resolvedConfig;
          if (!aiPrompt) {
            throw new Error(`Node ${nodeIdentifier}: AI Prompt is not configured or resolved.`);
          }
          const modelToUse = aiModelFromConfig || 'googleai/gemini-1.5-flash-latest'; 
          serverLogs.push({ message: `[NODE AITASK] ${nodeIdentifier}: Sending prompt to model ${modelToUse}. Prompt (first 100 chars): "${String(aiPrompt).substring(0, 100)}${String(aiPrompt).length > 100 ? '...' : ''}"`, type: 'info' });
          
          const genkitResponse = await ai.generate({ 
            prompt: String(aiPrompt), 
            model: modelToUse as any, 
          });
          const aiResponseTextContent = genkitResponse.text; 
          
          serverLogs.push({ message: `[NODE AITASK] ${nodeIdentifier}: Received response from AI. Response (first 200 chars): ${aiResponseTextContent.substring(0, 200)}${aiResponseTextContent.length > 200 ? '...' : ''}`, type: 'success' });
          nodeOutput = { ...nodeOutput, output: aiResponseTextContent }; 
          break;

        case 'parseJson':
          const { jsonString, path } = resolvedConfig;
          let dataToParse: any;

          if (typeof jsonString === 'string') {
            if (jsonString.trim() === '') {
              if (!path || path.trim() === '' || path.trim() === '$' || path.trim() === '$.') {
                dataToParse = {}; 
                serverLogs.push({ message: `[NODE PARSEJSON] ${nodeIdentifier}: Input JSON string is empty, path is root. Parsing as empty object.`, type: 'info' });
              } else {
                throw new Error(`Node ${nodeIdentifier}: Cannot extract path '${path}' from an empty JSON string.`);
              }
            } else {
              try {
                dataToParse = JSON.parse(jsonString);
              } catch (e: any) {
                throw new Error(`Node ${nodeIdentifier}: Invalid JSON input string: ${e.message}. Input (first 100 chars): '${jsonString.substring(0,100)}...'`);
              }
            }
          } else if (typeof jsonString === 'object' && jsonString !== null) {
            dataToParse = jsonString; 
            serverLogs.push({ message: `[NODE PARSEJSON] ${nodeIdentifier}: Input is already an object. No parsing needed.`, type: 'info' });
          } else if (jsonString === null) {
            if (!path || path.trim() === '' || path.trim() === '$' || path.trim() === '$.') {
              dataToParse = null; 
              serverLogs.push({ message: `[NODE PARSEJSON] ${nodeIdentifier}: Input JSON is null, path is root. Outputting null.`, type: 'info' });
            } else {
              throw new Error(`Node ${nodeIdentifier}: Cannot extract path '${path}' from a null JSON input.`);
            }
          } else { 
            throw new Error(`Node ${nodeIdentifier}: JSON input must be a non-null string or an object. Received type: ${typeof jsonString}, value: ${JSON.stringify(jsonString)}`);
          }
          
          serverLogs.push({ message: `[NODE PARSEJSON] ${nodeIdentifier}: Parsing JSON. Path: ${path || '(root)'}`, type: 'info' });

          let extractedValue: any;
          if (!path || path.trim() === '' || path.trim() === '$' || path.trim() === '$.') {
            extractedValue = dataToParse; 
          } else {
            const pathPartsToExtract = path.replace(/^\$\.?/, '').split('.'); 
            let currentExtractedData = dataToParse;
            let extractionFound = true;
            for (const part of pathPartsToExtract) {
              if (part === '') continue; 
              const arrayMatch = part.match(/(\w+)\[(\d+)\]/); 
              if (arrayMatch) {
                const arrayKey = arrayMatch[1];
                const index = parseInt(arrayMatch[2], 10);
                if (currentExtractedData && typeof currentExtractedData === 'object' && currentExtractedData !== null && Array.isArray(currentExtractedData[arrayKey]) && currentExtractedData[arrayKey].length > index) {
                  currentExtractedData = currentExtractedData[arrayKey][index];
                } else {
                  extractionFound = false; break;
                }
              } else if (currentExtractedData && typeof currentExtractedData === 'object' && currentExtractedData !== null && part in currentExtractedData) {
                currentExtractedData = currentExtractedData[part];
              } else {
                extractionFound = false; break;
              }
            }
            if (extractionFound) {
              extractedValue = currentExtractedData;
            } else {
              throw new Error(`Node ${nodeIdentifier}: Path "${path}" not found in JSON object. Current object (first 200 chars): ${JSON.stringify(dataToParse, null, 2).substring(0,200)}`);
            }
          }
          serverLogs.push({ message: `[NODE PARSEJSON] ${nodeIdentifier}: Extracted value (first 200 chars): ${JSON.stringify(extractedValue).substring(0,200)}`, type: 'success' });
          nodeOutput = { ...nodeOutput, output: extractedValue }; 
          break;

        case 'conditionalLogic':
            const conditionString = resolvedConfig.condition;
            if (typeof conditionString !== 'string' || conditionString.trim() === '') {
                throw new Error(`Node ${nodeIdentifier}: Condition string is missing or empty.`);
            }
            serverLogs.push({ message: `[NODE CONDITIONALLOGIC] ${nodeIdentifier}: Evaluating condition: "${conditionString}"`, type: 'info' });
            
            let evaluationResult = false;
            try {
                const operators = ['===', '!==', '==', '!=', '<=', '>=', '<', '>'];
                let operatorFound: string | null = null;
                let parts: string[] = [];
    
                for (const op of operators) {
                    const splitIndex = conditionString.indexOf(op);
                    if (splitIndex !== -1) {
                        operatorFound = op;
                        parts = [
                            conditionString.substring(0, splitIndex).trim(),
                            conditionString.substring(splitIndex + op.length).trim()
                        ];
                        break;
                    }
                }
    
                const parseOperand = (operandStr: string) => {
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
                        case '===': evaluationResult = val1 === val2; break;
                        case '!==': evaluationResult = val1 !== val2; break;
                        case '==':  evaluationResult = val1 == val2; break; 
                        case '!=':  evaluationResult = val1 != val2; break; 
                        case '<':   evaluationResult = (typeof val1 === typeof val2 || (typeof val1 === 'number' && typeof val2 === 'number')) && val1 < val2; break;
                        case '>':   evaluationResult = (typeof val1 === typeof val2 || (typeof val1 === 'number' && typeof val2 === 'number')) && val1 > val2; break;
                        case '<=':  evaluationResult = (typeof val1 === typeof val2 || (typeof val1 === 'number' && typeof val2 === 'number')) && val1 <= val2; break;
                        case '>=':  evaluationResult = (typeof val1 === typeof val2 || (typeof val1 === 'number' && typeof val2 === 'number')) && val1 >= val2; break;
                    }
                } else { 
                    const singleValue = parseOperand(conditionString);
                    evaluationResult = !!singleValue; 
                }
            } catch (e: any) {
                throw new Error(`Node ${nodeIdentifier}: Error evaluating condition "${conditionString}": ${e.message}`);
            }
            serverLogs.push({ message: `[NODE CONDITIONALLOGIC] ${nodeIdentifier}: Condition "${conditionString}" evaluated to ${evaluationResult}.`, type: 'success' });
            nodeOutput = { ...nodeOutput, result: evaluationResult };
            break;
        
        case 'dataTransform':
            const { 
                transformType, 
                inputString, 
                inputObject, 
                inputArray,
                fieldsToExtract, 
                stringsToConcatenate, 
                separator,
                delimiter,
                index,
                propertyName
            } = resolvedConfig;
            let transformedData: any = null;
            serverLogs.push({ message: `[NODE DATATRANSFORM] ${nodeIdentifier}: Attempting transform: ${transformType}`, type: 'info' });

            switch (transformType) {
              case 'toUpperCase':
                if (typeof inputString !== 'string') throw new Error('toUpperCase requires inputString to be a string.');
                transformedData = inputString.toUpperCase();
                break;
              case 'toLowerCase':
                if (typeof inputString !== 'string') throw new Error('toLowerCase requires inputString to be a string.');
                transformedData = inputString.toLowerCase();
                break;
              case 'extractFields':
                if (typeof inputObject !== 'object' || inputObject === null) throw new Error('extractFields requires inputObject to be an object.');
                if (!Array.isArray(fieldsToExtract) || !fieldsToExtract.every(f => typeof f === 'string')) {
                  throw new Error('extractFields requires fieldsToExtract to be an array of strings.');
                }
                transformedData = {};
                for (const field of fieldsToExtract) {
                  if (inputObject.hasOwnProperty(field)) {
                    (transformedData as Record<string, any>)[field] = inputObject[field];
                  }
                }
                break;
              case 'concatenateStrings':
                let stringsToJoin = stringsToConcatenate;
                if (typeof stringsToConcatenate === 'string') { 
                    stringsToJoin = [stringsToConcatenate];
                }
                if (!Array.isArray(stringsToJoin) || !stringsToJoin.every(s => typeof s === 'string' || typeof s === 'number' || typeof s === 'boolean')) {
                    throw new Error('concatenateStrings requires stringsToConcatenate to be an array of strings, numbers, or booleans.');
                }
                transformedData = stringsToJoin.map(String).join(separator || '');
                break;
              case 'stringSplit':
                if (typeof inputString !== 'string') throw new Error('stringSplit requires inputString to be a string.');
                if (typeof delimiter !== 'string') throw new Error('stringSplit requires delimiter to be a string.');
                transformedData = { array: inputString.split(delimiter) }; 
                break;
              case 'arrayLength':
                if (!Array.isArray(inputArray)) throw new Error('arrayLength requires inputArray to be an array.');
                transformedData = { length: inputArray.length }; 
                break;
              case 'getItemAtIndex':
                if (!Array.isArray(inputArray)) throw new Error('getItemAtIndex requires inputArray to be an array.');
                const idx = Number(index);
                if (isNaN(idx) || idx < 0 || idx >= inputArray.length) throw new Error('getItemAtIndex requires a valid, in-bounds numeric index.');
                transformedData = { item: inputArray[idx] }; 
                break;
              case 'getObjectProperty':
                 if (typeof inputObject !== 'object' || inputObject === null) throw new Error('getObjectProperty requires inputObject to be an object.');
                 if (typeof propertyName !== 'string' || propertyName.trim() === '') throw new Error('getObjectProperty requires a non-empty propertyName string.');
                 transformedData = { propertyValue: inputObject[propertyName] }; 
                 break;
              default:
                throw new Error(`Unsupported dataTransform type: ${transformType}`);
            }
            serverLogs.push({ message: `[NODE DATATRANSFORM] ${nodeIdentifier}: Transform '${transformType}' successful. Output: ${JSON.stringify(transformedData).substring(0,200)}`, type: 'success' });
            nodeOutput = { ...nodeOutput, output_data: transformedData }; 
            break;

        case 'sendEmail':
            const { to, subject, body: emailBody } = resolvedConfig;
            if (!to || !subject || !emailBody) {
              throw new Error(`Node ${nodeIdentifier}: 'to', 'subject', and 'body' are required for sendEmail.`);
            }
            if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM) {
              throw new Error(`Node ${nodeIdentifier}: Missing one or more EMAIL_ environment variables for Nodemailer configuration. Needed: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, EMAIL_SECURE (optional, defaults to false).`);
            }
            
            const transporter = nodemailer.createTransport({
              host: process.env.EMAIL_HOST,
              port: parseInt(process.env.EMAIL_PORT, 10),
              secure: process.env.EMAIL_SECURE === 'true', 
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            const mailOptions = {
              from: process.env.EMAIL_FROM,
              to: to,
              subject: subject,
              html: emailBody, 
            };

            serverLogs.push({ message: `[NODE SENDEMAIL] ${nodeIdentifier}: Attempting to send email to ${to} with subject "${subject}"`, type: 'info' });
            const info = await transporter.sendMail(mailOptions);
            serverLogs.push({ message: `[NODE SENDEMAIL] ${nodeIdentifier}: Email sent successfully. Message ID: ${info.messageId}`, type: 'success' });
            nodeOutput = { ...nodeOutput, messageId: info.messageId };
            break;
            
        case 'databaseQuery':
            const { queryText, queryParams } = resolvedConfig;
            if (!queryText) {
              throw new Error(`Node ${nodeIdentifier}: 'queryText' is required for databaseQuery.`);
            }
            if (!process.env.DB_CONNECTION_STRING) {
              throw new Error(`Node ${nodeIdentifier}: Missing DB_CONNECTION_STRING environment variable.`);
            }

            const pool = new Pool({ connectionString: process.env.DB_CONNECTION_STRING });
            const client = await pool.connect();
            
            serverLogs.push({ message: `[NODE DATABASEQUERY] ${nodeIdentifier}: Executing query: ${queryText} with params: ${JSON.stringify(queryParams)}`, type: 'info' });
            try {
              const queryResult = await client.query(queryText, Array.isArray(queryParams) ? queryParams : []);
              serverLogs.push({ message: `[NODE DATABASEQUERY] ${nodeIdentifier}: Query executed successfully. Row count: ${queryResult.rowCount}`, type: 'success' });
              nodeOutput = { ...nodeOutput, results: queryResult.rows, rowCount: queryResult.rowCount };
            } finally {
              client.release();
              await pool.end(); 
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
          nodeOutput = { ...nodeOutput, simulated_config: resolvedConfig };
          break;
          
        default:
          const defaultMessage = `[ENGINE] Node type '${node.type}' for node ${nodeIdentifier} is not specifically handled for execution. Config: ${JSON.stringify(resolvedConfig, null, 2)}`;
          console.log(defaultMessage);
          serverLogs.push({ message: `[ENGINE] Node type '${node.type}' for node ${nodeIdentifier} execution is not yet implemented or recognized.`, type: 'info' });
          nodeOutput = { ...nodeOutput, output: `Execution not implemented for type: ${node.type}`, simulated_config: resolvedConfig };
          break;
      }
      
      workflowData[node.id] = nodeOutput; 
      console.log(`[ENGINE] Node ${node.id} output stored (first 500 chars):`, JSON.stringify(workflowData[node.id], null, 2).substring(0, 500));
      serverLogs.push({ message: `[ENGINE] Node ${nodeIdentifier} processed successfully.`, type: 'success' });

    } catch (error: any) {
      const errorDetails = error.message ? error.message : 'Unknown error during node execution.';
      console.error(`[ENGINE] Error executing node ${nodeIdentifier}:`, errorDetails, error.stack);
      serverLogs.push({ message: `[ENGINE] Error executing node ${nodeIdentifier}: ${errorDetails}`, type: 'error' });
      workflowData[node.id] = { status: 'error', error_message: errorDetails }; 
      // Workflow continues to the next node, error is recorded in workflowData.
      serverLogs.push({ message: `[ENGINE] Node ${nodeIdentifier} FAILED. Continuing to next node if any.`, type: 'info' });
    }
  }

  console.log("[ENGINE] Workflow execution finished. Final workflowData (first 1000 chars):", JSON.stringify(workflowData, null, 2).substring(0,1000));
  serverLogs.push({ message: "[ENGINE] Workflow execution finished.", type: 'info' }); 
  return serverLogs;
}

