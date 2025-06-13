
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
      const warningMsg = `[WORKFLOW ENGINE] Invalid placeholder path: '${path}' in '${value}'. Placeholder remains unresolved.`;
      console.warn(warningMsg);
      serverLogs.push({ message: warningMsg, type: 'info' }); // Changed from 'error' to 'info' for warnings
      continue;
    }

    const nodeId = pathParts[0];
    let currentData = workflowData[nodeId];

    if (currentData === undefined) {
      const warningMsg = `[WORKFLOW ENGINE] No data found for node '${nodeId}' in placeholder '${placeholder}'. Placeholder remains unresolved.`;
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
          const warningMsg = `[WORKFLOW ENGINE] Array access failed for '${part}' in placeholder '${placeholder}'. Path: ${pathParts.slice(0, i+1).join('.')}. Data for ${nodeId}: ${JSON.stringify(dataAtPath, null, 2).substring(0,100)}`;
          console.warn(warningMsg);
          serverLogs.push({ message: warningMsg, type: 'info' });
          found = false; break;
        }
      } else if (dataAtPath && typeof dataAtPath === 'object' && dataAtPath !== null && part in dataAtPath) {
        dataAtPath = dataAtPath[part];
      } else {
        const warningMsg = `[WORKFLOW ENGINE] Path part '${part}' not found in data for node '${nodeId}' using placeholder '${placeholder}'. Path: ${pathParts.slice(0, i+1).join('.')}. Data for ${nodeId}: ${JSON.stringify(dataAtPath, null, 2).substring(0,100)}`;
        console.warn(warningMsg);
        serverLogs.push({ message: warningMsg, type: 'info' });
        found = false;
        break;
      }
    }
    
    if (found) {
      if (placeholder === value) { // If the entire string is the placeholder
        resolvedValue = dataAtPath; 
      } else { // If placeholder is part of a larger string
        // Ensure only primitive types are stringified directly into the resolved string
        const replacementValue = (typeof dataAtPath === 'string' || typeof dataAtPath === 'number' || typeof dataAtPath === 'boolean') 
          ? String(dataAtPath) 
          : JSON.stringify(dataAtPath);
        resolvedValue = resolvedValue.replace(placeholder, replacementValue);
      }
    } else {
      // Warning already logged above if 'found' is false.
      // const warningMsg = `[WORKFLOW ENGINE] Placeholder '${placeholder}' could not be fully resolved. Path segment '${pathParts.slice(1).join('.')}' not found or invalid. Placeholder remains in string.`;
      // console.warn(warningMsg);
      // serverLogs.push({ message: warningMsg, type: 'info' });
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
        // Recursively resolve placeholders in array elements if they are strings
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
        console.warn(`[WORKFLOW ENGINE] Invalid connection: ${conn.sourceNodeId} -> ${conn.targetNodeId}. One or both nodes not found during graph build.`);
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
    const unvisitedNodes = nodes.filter(n => !executionOrder.find(en => en.id === n.id)).map(n => n.id);
    const cycleHint = unvisitedNodes.length > 0 ? `Possible cycle involving or leading to: ${unvisitedNodes.slice(0,3).join(', ')}...` : 'Check for disconnected components or invalid connections.';
    console.error(`[WORKFLOW ENGINE] Cycle detected or disconnected graph. Visited: ${executionOrder.length}, Total: ${nodes.length}. ${cycleHint}`);
    return { executionOrder: [], error: `Workflow has a cycle or disconnected components. ${cycleHint}` };
  }

  return { executionOrder };
}


export async function executeWorkflow(workflow: Workflow): Promise<ServerLogOutput[]> {
  const serverLogs: ServerLogOutput[] = [];
  const workflowData: Record<string, any> = {}; 

  console.log("[WORKFLOW ENGINE] Starting workflow execution for", workflow.nodes.length, "nodes.");
  serverLogs.push({ message: `[ENGINE] Workflow execution started with ${workflow.nodes.length} nodes.`, type: 'info' });

  const { executionOrder, error: sortError } = getExecutionOrder(workflow.nodes, workflow.connections);

  if (sortError) {
    console.error(`[WORKFLOW ENGINE] ${sortError}`);
    serverLogs.push({ message: `[ENGINE] Error determining execution order: ${sortError}`, type: 'error' });
    serverLogs.push({ message: "[ENGINE] Workflow execution HALTED due to graph error.", type: 'error' });
    return serverLogs;
  }
  
  if (executionOrder.length > 0) {
    serverLogs.push({ message: `[ENGINE] Determined execution order: ${executionOrder.map(n => n.name || n.id).join(' -> ')}`, type: 'info' });
  } else if (workflow.nodes.length > 0) {
    serverLogs.push({ message: `[ENGINE] No executable order found for nodes. Possible isolated nodes.`, type: 'info' });
  }


  for (const node of executionOrder) {
    console.log(`[WORKFLOW ENGINE] Processing node: ${node.name || node.id} (Type: ${node.type}, ID: ${node.id})`);
    serverLogs.push({ message: `[ENGINE] Processing node: ${node.name || node.id} (ID: ${node.id}, Type: ${node.type})`, type: 'info' });

    try {
      const resolvedConfig = resolveNodeConfig(node.config || {}, workflowData, serverLogs);
      console.log(`[WORKFLOW ENGINE] Node ${node.id} resolved config:`, JSON.stringify(resolvedConfig, null, 2));

      // Conditional Execution Check
      if (resolvedConfig.hasOwnProperty('_flow_run_condition')) {
        const conditionValue = resolvedConfig._flow_run_condition;
        // The conditionValue itself is the result of placeholder resolution, so it should be a boolean or evaluate to one.
        if (conditionValue === false || conditionValue === 'false' || conditionValue === 0 || conditionValue === '' || conditionValue === null || conditionValue === undefined) {
          serverLogs.push({ message: `[ENGINE] Node '${node.name || node.id}' (ID: ${node.id}) SKIPPED due to _flow_run_condition evaluating to falsy (${conditionValue}).`, type: 'info' });
          console.log(`[WORKFLOW ENGINE] Node ${node.id} SKIPPED due to _flow_run_condition: ${conditionValue}`);
          workflowData[node.id] = { status: 'skipped', reason: `_flow_run_condition was falsy: ${conditionValue}` };
          continue; // Skip to the next node in executionOrder
        }
        serverLogs.push({ message: `[ENGINE] Node '${node.name || node.id}' (ID: ${node.id}) proceeding: _flow_run_condition evaluated to truthy (${conditionValue}).`, type: 'info' });
      }


      let nodeOutput: any = null; 

      switch (node.type) {
        case 'trigger': // Example: Manual Trigger
        case 'schedule': // Example: Schedule Trigger
          serverLogs.push({ message: `[SIMULATE] Node '${node.name || node.id}' (Type: ${node.type}): Trigger activated with config: ${JSON.stringify(resolvedConfig, null, 2)}`, type: 'info' });
          nodeOutput = { status: "simulated_trigger_activated", details: resolvedConfig, triggeredAt: new Date().toISOString() };
          break;

        case 'logMessage':
          const messageToLog = resolvedConfig?.message || `Default log message from ${node.name || node.id}`;
          console.log(`[WORKFLOW LOG] ${node.name || node.id}: ${messageToLog}`); 
          serverLogs.push({ message: `[LOG] ${node.name || node.id}: ${messageToLog}`, type: 'info' });
          nodeOutput = { output: messageToLog };
          break;

        case 'httpRequest':
          const { url, method = 'GET', headers: headersString = '{}', body } = resolvedConfig;
          if (!url) {
            throw new Error(`Node '${node.name || node.id}': URL is not configured or resolved.`);
          }
          serverLogs.push({ message: `[HTTP] Node '${node.name || node.id}': Attempting ${method} request to ${url}`, type: 'info' });
          
          let parsedHeaders: Record<string, string> = {};
          try {
            if (headersString && typeof headersString === 'string' && headersString.trim() !== '') {
                 parsedHeaders = JSON.parse(headersString);
            } else if (typeof headersString === 'object' && headersString !== null) { 
                parsedHeaders = headersString; 
            }
          } catch (e: any) {
            throw new Error(`Node '${node.name || node.id}': Invalid headers JSON: ${e.message}`);
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
            serverLogs.push({ message: `[HTTP] Node '${node.name || node.id}': Request to ${url} FAILED with status ${response.status}. Response: ${responseText}`, type: 'error' });
            throw new Error(`HTTP request failed for ${node.name || node.id} with status ${response.status}: ${responseText}`);
          }
          serverLogs.push({ message: `[HTTP] Node '${node.name || node.id}': Request to ${url} SUCCEEDED with status ${response.status}. Response (first 200 chars): ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`, type: 'success' });
          
          let parsedResponse: any;
          try {
             parsedResponse = JSON.parse(responseText);
          } catch (e) {
             parsedResponse = responseText; 
          }
          nodeOutput = { response: parsedResponse, status_code: response.status };
          break;

        case 'aiTask':
          const { prompt: aiPrompt, model: aiModel = 'googleai/gemini-1.5-flash-latest' } = resolvedConfig;
          if (!aiPrompt) {
            throw new Error(`Node '${node.name || node.id}': AI Prompt is not configured or resolved.`);
          }
          serverLogs.push({ message: `[AI TASK] Node '${node.name || node.id}': Sending prompt to model ${aiModel}. Prompt (first 100 chars): "${String(aiPrompt).substring(0, 100)}${String(aiPrompt).length > 100 ? '...' : ''}"`, type: 'info' });
          
          const genkitResponse = await ai.generate({ 
            prompt: String(aiPrompt), 
            model: aiModel as any, // Cast as any if model type causes issues, ensure it's a valid model string
          });
          const aiResponseTextContent = genkitResponse.text; 
          
          serverLogs.push({ message: `[AI TASK] Node '${node.name || node.id}': Received response from AI. Response (first 200 chars): ${aiResponseTextContent.substring(0, 200)}${aiResponseTextContent.length > 200 ? '...' : ''}`, type: 'success' });
          nodeOutput = { output: aiResponseTextContent }; 
          break;

        case 'parseJson':
          const { jsonString, path } = resolvedConfig;
          if (jsonString === undefined || jsonString === null) { // Allow empty string if path is '$' or empty
             if (!(path && (path.trim() === '' || path.trim() === '$' || path.trim() === '$.') && jsonString === '')) {
                throw new Error(`Node '${node.name || node.id}': JSON string input is missing or not resolved. Received: ${jsonString}`);
            }
          }
          
          // Allow object directly if it's already parsed (e.g. from previous node's output)
          if (typeof jsonString !== 'string' && typeof jsonString !== 'object') { 
            throw new Error(`Node '${node.name || node.id}': JSON input must be a string or an object, received ${typeof jsonString}. Value: ${JSON.stringify(jsonString)}`);
          }

          let dataToParse: any;
          if (typeof jsonString === 'string') {
            try {
              dataToParse = JSON.parse(jsonString);
            } catch (e: any) {
              throw new Error(`Node '${node.name || node.id}': Invalid JSON input string: ${e.message}. Input: '${jsonString.substring(0,100)}...'`);
            }
          } else {
            dataToParse = jsonString; // Already an object/array
          }
          
          serverLogs.push({ message: `[PARSE JSON] Node '${node.name || node.id}': Parsing JSON. Path: ${path || '(root)'}`, type: 'info' });

          let extractedValue: any;
          if (!path || path.trim() === '' || path.trim() === '$' || path.trim() === '$.') {
            extractedValue = dataToParse; 
          } else {
            const pathPartsToExtract = path.replace(/^\$\.?/, '').split('.'); 
            let currentExtractedData = dataToParse;
            let extractionFound = true;
            for (const part of pathPartsToExtract) {
              if (part === '') continue; // Skip empty parts if path has consecutive dots like 'a..b'
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
              throw new Error(`Node '${node.name || node.id}': Path "${path}" not found in JSON object. Current object: ${JSON.stringify(dataToParse, null, 2).substring(0,200)}`);
            }
          }
          serverLogs.push({ message: `[PARSE JSON] Node '${node.name || node.id}': Extracted value (first 200 chars): ${JSON.stringify(extractedValue).substring(0,200)}`, type: 'success' });
          nodeOutput = { output: extractedValue }; 
          break;

        case 'conditionalLogic':
          const { condition } = resolvedConfig;
          if (condition === undefined || condition === null) {
            throw new Error(`Node '${node.name || node.id}': Condition string is missing or not resolved.`);
          }
          serverLogs.push({ message: `[CONDITIONAL] Node '${node.name || node.id}': Evaluating condition: "${condition}"`, type: 'info' });
          
          let evaluationResult = false;
          try {
            if (typeof condition === 'boolean') {
                evaluationResult = condition;
            } else if (typeof condition === 'string') {
                const lowerCondition = condition.toLowerCase();
                if (lowerCondition === 'true') {
                    evaluationResult = true;
                } else if (lowerCondition === 'false') {
                    evaluationResult = false;
                } else {
                    // Attempt basic comparison for strings like "value1 == value2"
                    const comparisonOperators = ['==', '!=', '<=', '>=', '<', '>'];
                    let operatorFound = null;
                    for (const op of comparisonOperators) {
                        if (condition.includes(op)) {
                            operatorFound = op;
                            break;
                        }
                    }

                    if (operatorFound) {
                        const parts = condition.split(operatorFound);
                        if (parts.length === 2) {
                            let p1 = parts[0].trim();
                            let p2 = parts[1].trim();

                            // Convert 'true'/'false' strings to booleans, and numbers to numbers
                            const convertOperand = (opVal: string) => {
                                if (opVal.toLowerCase() === 'true') return true;
                                if (opVal.toLowerCase() === 'false') return false;
                                const num = Number(opVal);
                                return isNaN(num) ? opVal : num; // Keep as string if not a number
                            };
                            
                            const val1 = convertOperand(p1);
                            const val2 = convertOperand(p2);

                            switch(operatorFound) {
                                case '==': evaluationResult = val1 == val2; break; // Loose equality
                                case '!=': evaluationResult = val1 != val2; break;
                                case '<':  evaluationResult = val1 < val2; break;
                                case '>':  evaluationResult = val1 > val2; break;
                                case '<=': evaluationResult = val1 <= val2; break;
                                case '>=': evaluationResult = val1 >= val2; break;
                            }
                        } else {
                             evaluationResult = Boolean(condition); // Fallback for malformed comparisons
                        }
                    } else {
                         evaluationResult = Boolean(condition); // Simple truthiness if no operator
                    }
                }
            } else { // Could be number or other type resolved from placeholder
                 evaluationResult = Boolean(condition); 
            }

          } catch (e: any) {
            throw new Error(`Node '${node.name || node.id}': Error evaluating condition: ${e.message}`);
          }
          serverLogs.push({ message: `[CONDITIONAL] Node '${node.name || node.id}': Condition evaluated to ${evaluationResult}.`, type: 'success' });
          nodeOutput = { result: evaluationResult };
          break;

        // Stubbed Nodes
        case 'sendEmail':
        case 'databaseQuery':
        case 'dataTransform':
        case 'youtubeFetchTrending':
        case 'youtubeDownloadVideo':
        case 'videoConvertToShorts':
        case 'youtubeUploadShort':
        case 'workflowNode': // Generic node, treat as stub for now
          const simulationMessage = `[SIMULATE] Node '${node.name || node.id}' (Type: ${node.type}): Intended action with config: ${JSON.stringify(resolvedConfig, null, 2)}`;
          console.log(simulationMessage);
          serverLogs.push({ message: simulationMessage, type: 'info' });
          nodeOutput = { status: "simulated_execution", simulated_config: resolvedConfig };
          break;
          
        default:
          const defaultMessage = `[WORKFLOW ENGINE] Node type '${node.type}' not yet implemented for real execution. Skipping. Config: ${JSON.stringify(resolvedConfig, null, 2)}`;
          console.log(defaultMessage);
          serverLogs.push({ message: `[ENGINE] Node type '${node.type}' for node '${node.name || node.id}' execution is not yet implemented. Skipped.`, type: 'info' });
          nodeOutput = { output: `Execution not implemented for type: ${node.type}`, simulated_config: resolvedConfig };
          break;
      }
      
      if (nodeOutput !== null && nodeOutput !== undefined) {
        workflowData[node.id] = nodeOutput; 
        console.log(`[WORKFLOW ENGINE] Node ${node.id} output stored:`, JSON.stringify(workflowData[node.id], null, 2).substring(0, 500));
        serverLogs.push({ message: `[ENGINE] Node '${node.name || node.id}' (ID: ${node.id}) output stored.`, type: 'info' });
      }
      serverLogs.push({ message: `[ENGINE] Node '${node.name || node.id}' (ID: ${node.id}) processed successfully.`, type: 'success' });

    } catch (error: any) {
      console.error(`[WORKFLOW ENGINE] Error executing node ${node.name || node.id} (ID: ${node.id}):`, error.message, error.stack);
      const errorDetails = error.message ? error.message : 'Unknown error during node execution.';
      serverLogs.push({ message: `[ENGINE] Error executing node ${node.name || node.id} (ID: ${node.id}): ${errorDetails}`, type: 'error' });
      workflowData[node.id] = { error: errorDetails, status: 'error' }; 
      serverLogs.push({ message: `[ENGINE] Workflow execution HALTED due to error in node ${node.name || node.id}.`, type: 'error' });
      return serverLogs; 
    }
  }

  console.log("[WORKFLOW ENGINE] Workflow execution finished. Final workflowData:", JSON.stringify(workflowData, null, 2).substring(0,1000));
  serverLogs.push({ message: "[ENGINE] Workflow execution finished.", type: 'success' }); // Changed type to info as it might not always be a 'success' if errors occurred earlier
  return serverLogs;
}


    