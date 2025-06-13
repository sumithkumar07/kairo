
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
import type { Workflow, ServerLogOutput, WorkflowNode } from '@/types/workflow';
import { ai } from '@/ai/genkit'; 

// Helper function to resolve placeholder values from workflowData
function resolveValue(value: any, workflowData: Record<string, any>): any {
  if (typeof value !== 'string') {
    return value;
  }

  // Regex to find placeholders like {{nodeId.output.path.to.value}} or {{nodeId.output}}
  const placeholderRegex = /{{\s*([^{}\s]+)\s*}}/g;
  let resolvedValue = value;

  let match;
  while ((match = placeholderRegex.exec(value)) !== null) {
    const placeholder = match[0]; // Full placeholder e.g., {{node_1.output}}
    const path = match[1]; // Path inside placeholder e.g., node_1.output
    const pathParts = path.split('.');
    
    let data = workflowData;
    let found = true;
    for (const part of pathParts) {
      if (data && typeof data === 'object' && part in data) {
        data = data[part];
      } else {
        found = false;
        break;
      }
    }
    
    if (found) {
      // If the placeholder is the entire string, replace it with the actual value (could be object/array)
      // Otherwise, cast to string for concatenation.
      if (placeholder === value) {
        resolvedValue = data; 
      } else {
        resolvedValue = resolvedValue.replace(placeholder, String(data));
      }
    } else {
      console.warn(`[WORKFLOW ENGINE] Placeholder '${placeholder}' not found in workflowData.`);
      // Keep the original placeholder if not found, or replace with empty string/undefined
      // resolvedValue = resolvedValue.replace(placeholder, ''); 
    }
  }
  return resolvedValue;
}

// Helper function to resolve placeholders in node configuration
function resolveNodeConfig(nodeConfig: Record<string, any>, workflowData: Record<string, any>): Record<string, any> {
  const resolvedConfig: Record<string, any> = {};
  for (const key in nodeConfig) {
    if (Object.prototype.hasOwnProperty.call(nodeConfig, key)) {
      const value = nodeConfig[key];
      if (typeof value === 'string') {
        resolvedConfig[key] = resolveValue(value, workflowData);
      } else if (Array.isArray(value)) {
        resolvedConfig[key] = value.map(item => resolveValue(item, workflowData));
      } else if (typeof value === 'object' && value !== null) {
        resolvedConfig[key] = resolveNodeConfig(value, workflowData); // Recursively resolve for nested objects
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

export async function executeWorkflow(workflow: Workflow): Promise<ServerLogOutput[]> {
  const serverLogs: ServerLogOutput[] = [];
  const workflowData: Record<string, any> = {}; // To store outputs of nodes

  console.log("[WORKFLOW ENGINE] Starting workflow execution for", workflow.nodes.length, "nodes.");
  serverLogs.push({ message: `[ENGINE] Workflow execution started with ${workflow.nodes.length} nodes.`, type: 'info' });

  // TODO: Implement topological sort for correct execution order based on connections.
  // For now, executing in the order they appear in the nodes array.
  for (const node of workflow.nodes) {
    console.log(`[WORKFLOW ENGINE] Processing node: ${node.name} (Type: ${node.type}, ID: ${node.id})`);
    serverLogs.push({ message: `[ENGINE] Processing node: ${node.name} (ID: ${node.id}, Type: ${node.type})`, type: 'info' });

    try {
      // Resolve config placeholders before execution
      const resolvedConfig = resolveNodeConfig(node.config || {}, workflowData);
      console.log(`[WORKFLOW ENGINE] Node ${node.id} resolved config:`, JSON.stringify(resolvedConfig, null, 2));

      let nodeOutput: any = null;

      switch (node.type) {
        case 'logMessage':
          const messageToLog = resolvedConfig?.message || `Default log message from ${node.name}`;
          console.log(`[WORKFLOW LOG] ${node.name}: ${messageToLog}`); 
          serverLogs.push({ message: `[LOG] ${node.name}: ${messageToLog}`, type: 'info' });
          nodeOutput = messageToLog; // Log node can output its message
          break;

        case 'httpRequest':
          const { url, method = 'GET', headers: headersString = '{}', body } = resolvedConfig;
          if (!url) {
            throw new Error(`Node '${node.name}': URL is not configured or resolved.`);
          }
          serverLogs.push({ message: `[HTTP] Node '${node.name}': Attempting ${method} request to ${url}`, type: 'info' });
          
          let parsedHeaders: Record<string, string> = {};
          try {
            if (headersString && typeof headersString === 'string' && headersString.trim() !== '') {
                 parsedHeaders = JSON.parse(headersString);
            } else if (typeof headersString === 'object' && headersString !== null) {
                parsedHeaders = headersString; // Already an object
            }
          } catch (e: any) {
            throw new Error(`Node '${node.name}': Invalid headers JSON: ${e.message}`);
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
            serverLogs.push({ message: `[HTTP] Node '${node.name}': Request to ${url} FAILED with status ${response.status}. Response: ${responseText}`, type: 'error' });
            throw new Error(`HTTP request failed with status ${response.status}: ${responseText}`);
          }
          serverLogs.push({ message: `[HTTP] Node '${node.name}': Request to ${url} SUCCEEDED with status ${response.status}. Response (first 200 chars): ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`, type: 'success' });
          nodeOutput = responseText; // Store response text as output
          try {
             // Try to parse as JSON for easier access if it is JSON
             nodeOutput = JSON.parse(responseText);
          } catch (e) {
             // If not JSON, keep as text
          }
          break;

        case 'aiTask':
          const { prompt: aiPrompt, model: aiModel = 'googleai/gemini-1.5-flash-latest' } = resolvedConfig;
          if (!aiPrompt) {
            throw new Error(`Node '${node.name}': AI Prompt is not configured or resolved.`);
          }
          serverLogs.push({ message: `[AI TASK] Node '${node.name}': Sending prompt to model ${aiModel}. Prompt (first 100 chars): "${String(aiPrompt).substring(0, 100)}${String(aiPrompt).length > 100 ? '...' : ''}"`, type: 'info' });
          
          const genkitResponse = await ai.generate({ // Corrected to genkitResponse
            prompt: String(aiPrompt), // Ensure prompt is a string
            model: aiModel as any, 
          });
          const aiResponseTextContent = genkitResponse.text; // Access text directly
          
          serverLogs.push({ message: `[AI TASK] Node '${node.name}': Received response from AI. Response (first 200 chars): ${aiResponseTextContent.substring(0, 200)}${aiResponseTextContent.length > 200 ? '...' : ''}`, type: 'success' });
          nodeOutput = aiResponseTextContent; // Store AI response text as output
          break;

        case 'parseJson':
          const { jsonString, path } = resolvedConfig;
          if (!jsonString) {
            throw new Error(`Node '${node.name}': JSON string input is missing or not resolved.`);
          }
          if (typeof jsonString !== 'string' && typeof jsonString !== 'object') { // Allow pre-parsed JSON objects
            throw new Error(`Node '${node.name}': JSON input must be a string or an object, received ${typeof jsonString}.`);
          }

          let dataToParse: any;
          if (typeof jsonString === 'string') {
            try {
              dataToParse = JSON.parse(jsonString);
            } catch (e: any) {
              throw new Error(`Node '${node.name}': Invalid JSON input string: ${e.message}`);
            }
          } else {
            dataToParse = jsonString; // Already an object
          }
          
          serverLogs.push({ message: `[PARSE JSON] Node '${node.name}': Parsing JSON. Path: ${path || '(root)'}`, type: 'info' });

          if (!path || path.trim() === '' || path.trim() === '$' || path.trim() === '$.') {
            nodeOutput = dataToParse; // Return the whole object if path is empty or root
          } else {
            // Basic path resolver (e.g., "data.items[0].name")
            const pathParts = path.replace(/^\$\.?/, '').split('.'); // Remove leading "$." or "$"
            let currentData = dataToParse;
            let found = true;
            for (const part of pathParts) {
              const arrayMatch = part.match(/(\w+)\[(\d+)\]/); // Match array access like items[0]
              if (arrayMatch) {
                const arrayKey = arrayMatch[1];
                const index = parseInt(arrayMatch[2], 10);
                if (currentData && Array.isArray(currentData[arrayKey]) && currentData[arrayKey].length > index) {
                  currentData = currentData[arrayKey][index];
                } else {
                  found = false; break;
                }
              } else if (currentData && typeof currentData === 'object' && part in currentData) {
                currentData = currentData[part];
              } else {
                found = false; break;
              }
            }
            if (found) {
              nodeOutput = currentData;
            } else {
              throw new Error(`Node '${node.name}': Path "${path}" not found in JSON object.`);
            }
          }
          serverLogs.push({ message: `[PARSE JSON] Node '${node.name}': Extracted value: ${JSON.stringify(nodeOutput).substring(0,200)}`, type: 'success' });
          break;
          
        default:
          console.log(`[WORKFLOW ENGINE] Node type '${node.type}' not yet implemented for real execution. Skipping.`);
          serverLogs.push({ message: `[ENGINE] Node type '${node.type}' execution is not yet implemented. Skipped.`, type: 'info' });
          nodeOutput = `Execution not implemented for type: ${node.type}`;
          break;
      }
      
      // Store the output of the current node for subsequent nodes
      // We'll store it under a generic 'output' key for simplicity for now.
      // More complex nodes might have multiple named outputs.
      if (nodeOutput !== null && nodeOutput !== undefined) {
        workflowData[node.id] = { output: nodeOutput };
        console.log(`[WORKFLOW ENGINE] Node ${node.id} output stored:`, JSON.stringify(workflowData[node.id], null, 2).substring(0, 500));
        serverLogs.push({ message: `[ENGINE] Node '${node.name}' (ID: ${node.id}) output stored.`, type: 'info' });
      }
      serverLogs.push({ message: `[ENGINE] Node '${node.name}' (ID: ${node.id}) processed successfully.`, type: 'success' });

    } catch (error: any) {
      console.error(`[WORKFLOW ENGINE] Error executing node ${node.name} (ID: ${node.id}):`, error);
      serverLogs.push({ message: `[ENGINE] Error executing node ${node.name} (ID: ${node.id}): ${error.message || 'Unknown error'}`, type: 'error' });
      workflowData[node.id] = { error: error.message || 'Unknown error' }; // Store error info
      // For now, we'll let the workflow continue even if a node fails.
    }
  }

  console.log("[WORKFLOW ENGINE] Workflow execution finished. Final workflowData:", JSON.stringify(workflowData, null, 2).substring(0,1000));
  serverLogs.push({ message: "[ENGINE] Workflow execution finished.", type: 'success' });
  return serverLogs;
}
