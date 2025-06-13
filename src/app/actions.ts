
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
function resolveValue(value: any, workflowData: Record<string, any>): any {
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
      console.warn(`[WORKFLOW ENGINE] Invalid placeholder path: '${path}' in '${value}'`);
      continue;
    }

    const nodeId = pathParts[0];
    let currentData = workflowData[nodeId];

    if (currentData === undefined) {
      console.warn(`[WORKFLOW ENGINE] No data found for node '${nodeId}' in placeholder '${placeholder}'. Placeholder remains unresolved.`);
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
          console.warn(`[WORKFLOW ENGINE] Array access failed for '${part}' in placeholder '${placeholder}'. Path: ${pathParts.slice(0, i+1).join('.')}`);
          found = false; break;
        }
      } else if (dataAtPath && typeof dataAtPath === 'object' && dataAtPath !== null && part in dataAtPath) {
        dataAtPath = dataAtPath[part];
      } else {
        console.warn(`[WORKFLOW ENGINE] Path part '${part}' not found in data for node '${nodeId}' using placeholder '${placeholder}'. Path: ${pathParts.slice(0, i+1).join('.')}`);
        found = false;
        break;
      }
    }
    
    if (found) {
      if (placeholder === value) {
        resolvedValue = dataAtPath; 
      } else {
        resolvedValue = resolvedValue.replace(placeholder, String(dataAtPath));
      }
    } else {
      console.warn(`[WORKFLOW ENGINE] Placeholder '${placeholder}' could not be fully resolved. Remaining: ${pathParts.slice(1).join('.')}`);
    }
  }
  return resolvedValue;
}

function resolveNodeConfig(nodeConfig: Record<string, any>, workflowData: Record<string, any>): Record<string, any> {
  const resolvedConfig: Record<string, any> = {};
  for (const key in nodeConfig) {
    if (Object.prototype.hasOwnProperty.call(nodeConfig, key)) {
      const value = nodeConfig[key];
      if (typeof value === 'string') {
        resolvedConfig[key] = resolveValue(value, workflowData);
      } else if (Array.isArray(value)) {
        resolvedConfig[key] = value.map(item => resolveValue(item, workflowData)); // Resolve for items in array if they are strings
      } else if (typeof value === 'object' && value !== null) {
        resolvedConfig[key] = resolveNodeConfig(value, workflowData); 
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
    // Ensure nodes exist before creating an edge
    if (nodeMap[conn.sourceNodeId] && nodeMap[conn.targetNodeId]) {
        adj[conn.sourceNodeId].push(conn.targetNodeId);
        inDegree[conn.targetNodeId]++;
    } else {
        // This case should ideally be caught by UI or validation before execution
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

    if(adj[u]){ // Check if u exists in adj, could be an isolated node not in connections
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
  
  serverLogs.push({ message: `[ENGINE] Determined execution order: ${executionOrder.map(n => n.name || n.id).join(' -> ')}`, type: 'info' });


  for (const node of executionOrder) {
    console.log(`[WORKFLOW ENGINE] Processing node: ${node.name || node.id} (Type: ${node.type}, ID: ${node.id})`);
    serverLogs.push({ message: `[ENGINE] Processing node: ${node.name || node.id} (ID: ${node.id}, Type: ${node.type})`, type: 'info' });

    try {
      const resolvedConfig = resolveNodeConfig(node.config || {}, workflowData);
      console.log(`[WORKFLOW ENGINE] Node ${node.id} resolved config:`, JSON.stringify(resolvedConfig, null, 2));

      let nodeOutput: any = null; 

      switch (node.type) {
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
          nodeOutput = { response: parsedResponse };
          break;

        case 'aiTask':
          const { prompt: aiPrompt, model: aiModel = 'googleai/gemini-1.5-flash-latest' } = resolvedConfig;
          if (!aiPrompt) {
            throw new Error(`Node '${node.name || node.id}': AI Prompt is not configured or resolved.`);
          }
          serverLogs.push({ message: `[AI TASK] Node '${node.name || node.id}': Sending prompt to model ${aiModel}. Prompt (first 100 chars): "${String(aiPrompt).substring(0, 100)}${String(aiPrompt).length > 100 ? '...' : ''}"`, type: 'info' });
          
          const genkitResponse = await ai.generate({ 
            prompt: String(aiPrompt), 
            model: aiModel as any, 
          });
          const aiResponseTextContent = genkitResponse.text; 
          
          serverLogs.push({ message: `[AI TASK] Node '${node.name || node.id}': Received response from AI. Response (first 200 chars): ${aiResponseTextContent.substring(0, 200)}${aiResponseTextContent.length > 200 ? '...' : ''}`, type: 'success' });
          nodeOutput = { output: aiResponseTextContent }; 
          break;

        case 'parseJson':
          const { jsonString, path } = resolvedConfig;
          if (jsonString === undefined || jsonString === null) {
            throw new Error(`Node '${node.name || node.id}': JSON string input is missing or not resolved. Received: ${jsonString}`);
          }
          if (typeof jsonString !== 'string' && typeof jsonString !== 'object') { 
            throw new Error(`Node '${node.name || node.id}': JSON input must be a string or an object, received ${typeof jsonString}.`);
          }

          let dataToParse: any;
          if (typeof jsonString === 'string') {
            try {
              dataToParse = JSON.parse(jsonString);
            } catch (e: any) {
              throw new Error(`Node '${node.name || node.id}': Invalid JSON input string: ${e.message}`);
            }
          } else {
            dataToParse = jsonString; 
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
              const arrayMatch = part.match(/(\w+)\[(\d+)\]/); 
              if (arrayMatch) {
                const arrayKey = arrayMatch[1];
                const index = parseInt(arrayMatch[2], 10);
                if (currentExtractedData && Array.isArray(currentExtractedData[arrayKey]) && currentExtractedData[arrayKey].length > index) {
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
              throw new Error(`Node '${node.name || node.id}': Path "${path}" not found in JSON object.`);
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
            // Basic evaluation: check for truthiness of the resolved condition string.
            // This is very simplistic. For "a == b", user must ensure condition is "{{a}} == {{b}}" which resolves to "val_a == val_b"
            // A more robust solution would involve a proper expression parser.
            if (typeof condition === 'string') {
                 // Attempt to handle simple equality for demo purposes, not a full expression engine
                const parts = condition.split('==').map(p => p.trim());
                if (parts.length === 2) {
                    // If parts resolve to 'true' or 'false' strings, convert to boolean
                    const p1 = parts[0] === 'true' ? true : parts[0] === 'false' ? false : parts[0];
                    const p2 = parts[1] === 'true' ? true : parts[1] === 'false' ? false : parts[1];
                    evaluationResult = p1 == p2; // Use loose equality for resolved string/number comparisons
                } else if (condition.toLowerCase() === 'true') {
                    evaluationResult = true;
                } else if (condition.toLowerCase() === 'false') {
                    evaluationResult = false;
                } else {
                    // For any other string, consider it "truthy" if not empty, or try to parse as boolean/number
                    evaluationResult = Boolean(condition);
                }
            } else {
                 evaluationResult = Boolean(condition); // If already resolved to boolean/number
            }

          } catch (e: any) {
            throw new Error(`Node '${node.name || node.id}': Error evaluating condition: ${e.message}`);
          }
          serverLogs.push({ message: `[CONDITIONAL] Node '${node.name || node.id}': Condition evaluated to ${evaluationResult}.`, type: 'success' });
          nodeOutput = { result: evaluationResult }; // Output handle name is 'result'
          break;
          
        default:
          console.log(`[WORKFLOW ENGINE] Node type '${node.type}' not yet implemented for real execution. Skipping.`);
          serverLogs.push({ message: `[ENGINE] Node type '${node.type}' for node '${node.name || node.id}' execution is not yet implemented. Skipped.`, type: 'info' });
          nodeOutput = { output: `Execution not implemented for type: ${node.type}` };
          break;
      }
      
      if (nodeOutput !== null && nodeOutput !== undefined) {
        workflowData[node.id] = nodeOutput; 
        console.log(`[WORKFLOW ENGINE] Node ${node.id} output stored:`, JSON.stringify(workflowData[node.id], null, 2).substring(0, 500));
        serverLogs.push({ message: `[ENGINE] Node '${node.name || node.id}' (ID: ${node.id}) output stored.`, type: 'info' });
      }
      serverLogs.push({ message: `[ENGINE] Node '${node.name || node.id}' (ID: ${node.id}) processed successfully.`, type: 'success' });

    } catch (error: any) {
      console.error(`[WORKFLOW ENGINE] Error executing node ${node.name || node.id} (ID: ${node.id}):`, error.message);
      serverLogs.push({ message: `[ENGINE] Error executing node ${node.name || node.id} (ID: ${node.id}): ${error.message || 'Unknown error'}`, type: 'error' });
      workflowData[node.id] = { error: error.message || 'Unknown error' }; 
      serverLogs.push({ message: `[ENGINE] Workflow execution HALTED due to error in node ${node.name || node.id}.`, type: 'error' });
      return serverLogs; 
    }
  }

  console.log("[WORKFLOW ENGINE] Workflow execution finished. Final workflowData:", JSON.stringify(workflowData, null, 2).substring(0,1000));
  serverLogs.push({ message: "[ENGINE] Workflow execution finished successfully.", type: 'success' });
  return serverLogs;
}
