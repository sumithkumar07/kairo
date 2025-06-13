
'use server';

import { 
  generateWorkflowFromPrompt as genkitGenerateWorkflowFromPrompt,
  type GenerateWorkflowFromPromptInput,
  type GenerateWorkflowFromPromptOutput
} from '@/ai/flows/generate-workflow-from-prompt';
import {
  suggestNextNode as genkitSuggestNextNode,
  type SuggestNextNodeInput,
  type SuggestNextNodeOutput
} from '@/ai/flows/suggest-next-node';
import type { Workflow, ServerLogOutput, WorkflowNode, WorkflowConnection } from '@/types/workflow';
import { ai } from '@/ai/genkit'; 

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

    if (firstPart === 'env' && pathParts.length === 2) {
      const envVarName = pathParts[1];
      const envVarValue = process.env[envVarName];
      if (envVarValue !== undefined) {
        resolvedValue = resolvedValue.replace(placeholder, envVarValue);
        serverLogs.push({ message: `[ENGINE] Resolved placeholder '{{env.${envVarName}}}' from environment.`, type: 'info' });
        // If the entire value was just this placeholder, make sure to assign the potentially non-string value directly
        if (placeholder === value) {
            resolvedValue = envVarValue;
        }
        continue; 
      } else {
        const warningMsg = `[ENGINE] Environment variable '${envVarName}' not found for placeholder '${placeholder}'. Placeholder remains unresolved.`;
        console.warn(warningMsg);
        serverLogs.push({ message: warningMsg, type: 'info' });
        continue;
      }
    }
    
    if (firstPart === 'secrets' && pathParts.length === 2) {
        const secretName = pathParts[1];
        const infoMsg = `[ENGINE] Placeholder '{{secrets.${secretName}}}' refers to a secret. Actual secret resolution is not yet implemented. Placeholder remains unresolved.`;
        console.info(infoMsg); 
        serverLogs.push({ message: infoMsg, type: 'info'});
        // Keep the placeholder string as is
        continue; 
    }

    let currentData = workflowData[firstPart]; // firstPart is nodeId here

    if (currentData === undefined) {
      const warningMsg = `[ENGINE] No data found for node '${firstPart}' in workflow data when resolving placeholder '${placeholder}'. Placeholder remains unresolved.`;
      console.warn(warningMsg);
      serverLogs.push({ message: warningMsg, type: 'info' });
      continue; 
    }
    
    let dataAtPath = currentData;
    let found = true;
    for (let i = 1; i < pathParts.length; i++) {
      const part = pathParts[i];
      const arrayMatch = part.match(/(\w+)\[(\d+)\]/); 
      if (arrayMatch) {
        const arrayKey = arrayMatch[1];
        const index = parseInt(arrayMatch[2], 10);
        if (dataAtPath && typeof dataAtPath === 'object' && dataAtPath !== null && Array.isArray(dataAtPath[arrayKey]) && dataAtPath[arrayKey].length > index) {
          dataAtPath = dataAtPath[arrayKey][index];
        } else {
          const warningMsg = `[ENGINE] Array access failed for '${part}' in placeholder '${placeholder}'. Attempted path: ${pathParts.slice(0, i+1).join('.')}. Data for node '${firstPart}' (start): ${JSON.stringify(currentData, null, 2).substring(0,100)}`;
          console.warn(warningMsg);
          serverLogs.push({ message: warningMsg, type: 'info' });
          found = false; break;
        }
      } else if (dataAtPath && typeof dataAtPath === 'object' && dataAtPath !== null && part in dataAtPath) {
        dataAtPath = dataAtPath[part];
      } else {
        const warningMsg = `[ENGINE] Path part '${part}' not found in data for node '${firstPart}' when resolving placeholder '${placeholder}'. Attempted path: ${pathParts.slice(0, i+1).join('.')}. Current data at path: ${JSON.stringify(dataAtPath, null, 2).substring(0,100)}`;
        console.warn(warningMsg);
        serverLogs.push({ message: warningMsg, type: 'info' });
        found = false;
        break;
      }
    }
    
    if (found) {
      if (placeholder === value) { 
        resolvedValue = dataAtPath; 
      } else { 
        const replacementValue = (typeof dataAtPath === 'string' || typeof dataAtPath === 'number' || typeof dataAtPath === 'boolean') 
          ? String(dataAtPath) 
          : JSON.stringify(dataAtPath);
        resolvedValue = resolvedValue.replace(placeholder, replacementValue);
      }
    } else {
        // Warning already logged by the loop
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


export async function generateWorkflow(input: GenerateWorkflowFromPromptInput): Promise<GenerateWorkflowFromPromptOutput> {
  try {
    console.log("[SERVER ACTION] Generating workflow with input:", JSON.stringify(input, null, 2));
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
    const unvisitedNodes = nodes.filter(n => !visitedNodeIds.has(n.id)).map(n => `${n.name || 'Unnamed Node'} (ID: ${n.id})`);
    const cycleHint = unvisitedNodes.length > 0 
        ? `Possible cycle involving or leading to unvisited nodes: ${unvisitedNodes.slice(0,3).join(', ')}${unvisitedNodes.length > 3 ? '...' : ''}.` 
        : 'Or, some nodes might be disconnected from the main flow.';
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
    console.error(`[ENGINE] ${sortError}`); // Already logged by getExecutionOrder
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
    console.log(`[ENGINE] Processing node: ${node.name || node.id} (Type: ${node.type}, ID: ${node.id})`);
    serverLogs.push({ message: `[ENGINE] Processing node: ${node.name || node.id} (ID: ${node.id}, Type: ${node.type})`, type: 'info' });

    try {
      const resolvedConfig = resolveNodeConfig(node.config || {}, workflowData, serverLogs);
      console.log(`[ENGINE] Node ${node.id} resolved config:`, JSON.stringify(resolvedConfig, null, 2));

      if (resolvedConfig.hasOwnProperty('_flow_run_condition')) {
        const conditionValue = resolvedConfig._flow_run_condition;
        // Explicitly check for boolean false, numeric 0, empty string, null, undefined.
        // Any other value (including string "false" not yet converted, or non-empty strings) would be considered truthy for skipping purposes.
        // True booleans or non-zero numbers or non-empty strings will let the node run.
        if (conditionValue === false || conditionValue === 0 || conditionValue === '' || conditionValue === null || conditionValue === undefined) {
          serverLogs.push({ message: `[ENGINE] Node '${node.name || node.id}' (ID: ${node.id}) SKIPPED due to _flow_run_condition evaluating to falsy (Value: '${String(conditionValue)}').`, type: 'info' });
          console.log(`[ENGINE] Node ${node.id} SKIPPED due to _flow_run_condition: ${conditionValue}`);
          workflowData[node.id] = { status: 'skipped', reason: `_flow_run_condition was falsy: ${String(conditionValue)}` };
          continue; 
        }
        serverLogs.push({ message: `[ENGINE] Node '${node.name || node.id}' (ID: ${node.id}) proceeding: _flow_run_condition evaluated to truthy (Value: '${String(conditionValue)}').`, type: 'info' });
      }


      let nodeOutput: any = null; 

      switch (node.type) {
        case 'trigger': 
        case 'schedule': 
          serverLogs.push({ message: `[NODE ${node.type.toUpperCase()}] '${node.name || node.id}': Trigger activated with config: ${JSON.stringify(resolvedConfig, null, 2)}`, type: 'info' });
          nodeOutput = { status: "simulated_trigger_activated", details: resolvedConfig, triggeredAt: new Date().toISOString() };
          break;

        case 'logMessage':
          const messageToLog = resolvedConfig?.message || `Default log message from ${node.name || node.id}`;
          console.log(`[WORKFLOW LOG] ${node.name || node.id}: ${messageToLog}`); 
          serverLogs.push({ message: `[NODE LOGMESSAGE] ${node.name || node.id}: ${messageToLog}`, type: 'info' });
          nodeOutput = { output: messageToLog };
          break;

        case 'httpRequest':
          const { url, method = 'GET', headers: headersString = '{}', body } = resolvedConfig;
          if (!url) {
            throw new Error(`Node '${node.name || node.id}' (Type: httpRequest): URL is not configured or resolved.`);
          }
          serverLogs.push({ message: `[NODE HTTPREQUEST] '${node.name || node.id}': Attempting ${method} request to ${url}`, type: 'info' });
          
          let parsedHeaders: Record<string, string> = {};
          try {
            if (headersString && typeof headersString === 'string' && headersString.trim() !== '') {
                 parsedHeaders = JSON.parse(headersString);
            } else if (typeof headersString === 'object' && headersString !== null) { 
                parsedHeaders = headersString; 
            }
          } catch (e: any) {
            throw new Error(`Node '${node.name || node.id}' (Type: httpRequest): Invalid headers JSON: ${e.message}. Headers provided: '${headersString}'`);
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
            serverLogs.push({ message: `[NODE HTTPREQUEST] '${node.name || node.id}': Request to ${url} FAILED with status ${response.status}. Response: ${responseText}`, type: 'error' });
            throw new Error(`HTTP request failed for ${node.name || node.id} (Type: httpRequest) with status ${response.status}: ${responseText}`);
          }
          serverLogs.push({ message: `[NODE HTTPREQUEST] '${node.name || node.id}': Request to ${url} SUCCEEDED with status ${response.status}. Response (first 200 chars): ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`, type: 'success' });
          
          let parsedResponse: any;
          try {
             parsedResponse = JSON.parse(responseText);
          } catch (e) {
             parsedResponse = responseText; 
          }
          nodeOutput = { response: parsedResponse, status_code: response.status };
          break;

        case 'aiTask':
          const { prompt: aiPrompt, model: aiModelFromConfig } = resolvedConfig;
          if (!aiPrompt) {
            throw new Error(`Node '${node.name || node.id}' (Type: aiTask): AI Prompt is not configured or resolved.`);
          }
          const modelToUse = aiModelFromConfig || 'googleai/gemini-1.5-flash-latest'; 
          serverLogs.push({ message: `[NODE AITASK] '${node.name || node.id}': Sending prompt to model ${modelToUse}. Prompt (first 100 chars): "${String(aiPrompt).substring(0, 100)}${String(aiPrompt).length > 100 ? '...' : ''}"`, type: 'info' });
          
          const genkitResponse = await ai.generate({ 
            prompt: String(aiPrompt), 
            model: modelToUse as any, 
          });
          const aiResponseTextContent = genkitResponse.text; 
          
          serverLogs.push({ message: `[NODE AITASK] '${node.name || node.id}': Received response from AI. Response (first 200 chars): ${aiResponseTextContent.substring(0, 200)}${aiResponseTextContent.length > 200 ? '...' : ''}`, type: 'success' });
          nodeOutput = { output: aiResponseTextContent }; 
          break;

        case 'parseJson':
          const { jsonString, path } = resolvedConfig;
          let dataToParse: any;

          if (typeof jsonString === 'string') {
            if (jsonString.trim() === '') {
              if (!path || path.trim() === '' || path.trim() === '$' || path.trim() === '$.') {
                dataToParse = {}; // Empty string with root path yields empty object
                serverLogs.push({ message: `[NODE PARSEJSON] '${node.name || node.id}': Input JSON string is empty, path is root. Parsing as empty object.`, type: 'info' });
              } else {
                throw new Error(`Node '${node.name || node.id}' (Type: parseJson): Cannot extract path '${path}' from an empty JSON string.`);
              }
            } else {
              try {
                dataToParse = JSON.parse(jsonString);
              } catch (e: any) {
                throw new Error(`Node '${node.name || node.id}' (Type: parseJson): Invalid JSON input string: ${e.message}. Input (first 100 chars): '${jsonString.substring(0,100)}...'`);
              }
            }
          } else if (typeof jsonString === 'object' && jsonString !== null) {
            dataToParse = jsonString; // Already an object
            serverLogs.push({ message: `[NODE PARSEJSON] '${node.name || node.id}': Input is already an object. No parsing needed.`, type: 'info' });
          } else if (jsonString === null) {
            if (!path || path.trim() === '' || path.trim() === '$' || path.trim() === '$.') {
              dataToParse = null; // Null input with root path yields null
              serverLogs.push({ message: `[NODE PARSEJSON] '${node.name || node.id}': Input JSON is null, path is root. Outputting null.`, type: 'info' });
            } else {
              throw new Error(`Node '${node.name || node.id}' (Type: parseJson): Cannot extract path '${path}' from a null JSON input.`);
            }
          } else { // undefined, number, boolean, or other non-string/non-object types
            throw new Error(`Node '${node.name || node.id}' (Type: parseJson): JSON input must be a non-null string or an object. Received type: ${typeof jsonString}, value: ${JSON.stringify(jsonString)}`);
          }
          
          serverLogs.push({ message: `[NODE PARSEJSON] '${node.name || node.id}': Parsing JSON. Path: ${path || '(root)'}`, type: 'info' });

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
              throw new Error(`Node '${node.name || node.id}' (Type: parseJson): Path "${path}" not found in JSON object. Current object (first 200 chars): ${JSON.stringify(dataToParse, null, 2).substring(0,200)}`);
            }
          }
          serverLogs.push({ message: `[NODE PARSEJSON] '${node.name || node.id}': Extracted value (first 200 chars): ${JSON.stringify(extractedValue).substring(0,200)}`, type: 'success' });
          nodeOutput = { output: extractedValue }; 
          break;

        case 'conditionalLogic':
          let resolvedCondition = resolvedConfig.condition;
          if (resolvedCondition === undefined || resolvedCondition === null || typeof resolvedCondition !== 'string') { // Condition must be a string to parse
            throw new Error(`Node '${node.name || node.id}' (Type: conditionalLogic): Condition string is missing, null, or not a string. Received: ${JSON.stringify(resolvedCondition)}`);
          }
          serverLogs.push({ message: `[NODE CONDITIONALLOGIC] '${node.name || node.id}': Evaluating condition: "${resolvedCondition}"`, type: 'info' });
          
          let evaluationResult = false;
          try {
            // Handle direct boolean "true" or "false" strings more robustly
            const lowerCondition = resolvedCondition.toLowerCase();
            if (lowerCondition === 'true') {
                evaluationResult = true;
            } else if (lowerCondition === 'false') {
                evaluationResult = false;
            } else {
                const operators = ['==', '!=', '<=', '>=', '<', '>'];
                let operatorFound: string | null = null;
                let conditionParts: string[] = [];

                for (const op of operators) {
                    if (resolvedCondition.includes(op)) {
                        operatorFound = op;
                        // Split carefully to handle multiple occurrences, only take first one for simple comparison
                        const splitIndex = resolvedCondition.indexOf(op);
                        conditionParts = [
                            resolvedCondition.substring(0, splitIndex).trim(),
                            resolvedCondition.substring(splitIndex + op.length).trim()
                        ];
                        break;
                    }
                }

                if (operatorFound && conditionParts.length === 2) {
                    let val1: any = conditionParts[0];
                    let val2: any = conditionParts[1];

                    const parseOperand = (operand: string) => {
                        if (operand.toLowerCase() === 'true') return true;
                        if (operand.toLowerCase() === 'false') return false;
                        // Check if operand is explicitly quoted (string literal)
                        if ((operand.startsWith("'") && operand.endsWith("'")) || (operand.startsWith('"') && operand.endsWith('"'))) {
                            return operand.substring(1, operand.length -1);
                        }
                        const num = parseFloat(operand);
                        return isNaN(num) ? operand : num; // Keep as string if not a clear number
                    };
                    
                    val1 = parseOperand(val1);
                    val2 = parseOperand(val2);

                    switch(operatorFound) {
                        case '==': evaluationResult = val1 == val2; break; // Loose equality
                        case '!=': evaluationResult = val1 != val2; break; // Loose inequality
                        case '<':  evaluationResult = val1 < val2; break;
                        case '>':  evaluationResult = val1 > val2; break;
                        case '<=': evaluationResult = val1 <= val2; break;
                        case '>=': evaluationResult = val1 >= val2; break;
                    }
                } else {
                      // If no operator or not two parts, treat as simple truthiness of the resolved (potentially non-string) value
                      // This case might need re-evaluation if `resolvedCondition` isn't a string initially
                      // For now, if it's not "true" or "false" and has no operator, consider it falsy unless it's a non-empty string that isn't "false"
                      evaluationResult = (resolvedCondition !== '' && resolvedCondition.toLowerCase() !== 'false');
                }
            }
          } catch (e: any) {
            throw new Error(`Node '${node.name || node.id}' (Type: conditionalLogic): Error evaluating condition "${resolvedCondition}": ${e.message}`);
          }
          serverLogs.push({ message: `[NODE CONDITIONALLOGIC] '${node.name || node.id}': Condition "${resolvedCondition}" evaluated to ${evaluationResult}.`, type: 'success' });
          nodeOutput = { result: evaluationResult };
          break;

        case 'sendEmail':
        case 'databaseQuery':
        case 'dataTransform':
        case 'youtubeFetchTrending':
        case 'youtubeDownloadVideo':
        case 'videoConvertToShorts':
        case 'youtubeUploadShort':
        case 'workflowNode': 
          const simulationMessage = `[NODE ${node.type.toUpperCase()}] SIMULATE: Node '${node.name || node.id}' (Type: ${node.type}): Intended action with config: ${JSON.stringify(resolvedConfig, null, 2)}`;
          console.log(simulationMessage);
          serverLogs.push({ message: simulationMessage, type: 'info' });
          nodeOutput = { status: "simulated_execution", simulated_config: resolvedConfig };
          break;
          
        default:
          const defaultMessage = `[ENGINE] Node type '${node.type}' for node '${node.name || node.id}' (ID: ${node.id}) is not specifically handled for execution. Config: ${JSON.stringify(resolvedConfig, null, 2)}`;
          console.log(defaultMessage);
          serverLogs.push({ message: `[ENGINE] Node type '${node.type}' for node '${node.name || node.id}' execution is not yet implemented or recognized. Skipped.`, type: 'info' });
          nodeOutput = { output: `Execution not implemented for type: ${node.type}`, simulated_config: resolvedConfig };
          break;
      }
      
      if (nodeOutput !== null && nodeOutput !== undefined) {
        workflowData[node.id] = nodeOutput; 
        console.log(`[ENGINE] Node ${node.id} output stored (first 500 chars):`, JSON.stringify(workflowData[node.id], null, 2).substring(0, 500));
        serverLogs.push({ message: `[ENGINE] Node '${node.name || node.id}' (ID: ${node.id}) output stored.`, type: 'info' });
      }
      serverLogs.push({ message: `[ENGINE] Node '${node.name || node.id}' (ID: ${node.id}) processed successfully.`, type: 'success' });

    } catch (error: any) {
      console.error(`[ENGINE] Error executing node ${node.name || node.id} (ID: ${node.id}):`, error.message, error.stack);
      const errorDetails = error.message ? error.message : 'Unknown error during node execution.';
      serverLogs.push({ message: `[ENGINE] Error executing node ${node.name || node.id} (ID: ${node.id}): ${errorDetails}`, type: 'error' });
      workflowData[node.id] = { error: errorDetails, status: 'error' }; 
      serverLogs.push({ message: `[ENGINE] Workflow execution HALTED due to error in node ${node.name || node.id}.`, type: 'error' });
      return serverLogs; 
    }
  }

  console.log("[ENGINE] Workflow execution finished. Final workflowData (first 1000 chars):", JSON.stringify(workflowData, null, 2).substring(0,1000));
  serverLogs.push({ message: "[ENGINE] Workflow execution finished.", type: 'info' }); 
  return serverLogs;
}

