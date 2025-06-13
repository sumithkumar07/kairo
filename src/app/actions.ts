
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
import type { Workflow, ServerLogOutput } from '@/types/workflow';
import { ai } from '@/ai/genkit'; // Import the global Genkit ai instance

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
  console.log("[WORKFLOW ENGINE] Starting workflow execution for", workflow.nodes.length, "nodes.");
  serverLogs.push({ message: `[ENGINE] Workflow execution started with ${workflow.nodes.length} nodes.`, type: 'info' });

  // TODO: Implement topological sort for correct execution order based on connections.
  // For now, executing in the order they appear in the nodes array.
  for (const node of workflow.nodes) {
    console.log(`[WORKFLOW ENGINE] Executing node: ${node.name} (Type: ${node.type})`);
    serverLogs.push({ message: `[ENGINE] Executing node: ${node.name} (ID: ${node.id}, Type: ${node.type})`, type: 'info' });

    try {
      switch (node.type) {
        case 'logMessage':
          const messageToLog = node.config?.message || `Default log message from ${node.name}`;
          console.log(`[WORKFLOW LOG] ${node.name}: ${messageToLog}`); 
          serverLogs.push({ message: `[LOG] ${node.name}: ${messageToLog}`, type: 'info' });
          break;

        case 'httpRequest':
          const { url, method = 'GET', headers: headersString = '{}', body } = node.config;
          if (!url) {
            throw new Error(`Node '${node.name}': URL is not configured.`);
          }
          serverLogs.push({ message: `[HTTP] Node '${node.name}': Attempting ${method} request to ${url}`, type: 'info' });
          
          let parsedHeaders: Record<string, string> = {};
          try {
            if (headersString && typeof headersString === 'string' && headersString.trim() !== '') {
                 parsedHeaders = JSON.parse(headersString);
            } else if (typeof headersString === 'object' && headersString !== null) {
                parsedHeaders = headersString;
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
          const responseText = await response.text(); // Read response body once

          if (!response.ok) {
            serverLogs.push({ message: `[HTTP] Node '${node.name}': Request to ${url} FAILED with status ${response.status}. Response: ${responseText}`, type: 'error' });
            throw new Error(`HTTP request failed with status ${response.status}: ${responseText}`);
          }
          serverLogs.push({ message: `[HTTP] Node '${node.name}': Request to ${url} SUCCEEDED with status ${response.status}. Response: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`, type: 'success' });
          // TODO: Store response data for subsequent nodes
          break;

        case 'aiTask':
          const { prompt: aiPrompt, model: aiModel = 'googleai/gemini-1.5-flash-latest' } = node.config;
          if (!aiPrompt) {
            throw new Error(`Node '${node.name}': AI Prompt is not configured.`);
          }
          serverLogs.push({ message: `[AI TASK] Node '${node.name}': Sending prompt to model ${aiModel}. Prompt: "${aiPrompt.substring(0, 100)}${aiPrompt.length > 100 ? '...' : ''}"`, type: 'info' });
          
          const { text: aiResponseText } = await ai.generate({
            prompt: aiPrompt,
            model: aiModel as any, // Cast because model can be specific, ai.generate is generic
          });
          
          serverLogs.push({ message: `[AI TASK] Node '${node.name}': Received response from AI. Response: ${aiResponseText().substring(0, 200)}${aiResponseText().length > 200 ? '...' : ''}`, type: 'success' });
          // TODO: Store AI response data for subsequent nodes
          break;
          
        default:
          console.log(`[WORKFLOW ENGINE] Node type '${node.type}' not yet implemented for real execution. Skipping.`);
          serverLogs.push({ message: `[ENGINE] Node type '${node.type}' execution is not yet implemented. Skipped.`, type: 'info' });
          break;
      }
      serverLogs.push({ message: `[ENGINE] Node '${node.name}' (ID: ${node.id}) processed successfully.`, type: 'success' });

    } catch (error: any) {
      console.error(`[WORKFLOW ENGINE] Error executing node ${node.name} (ID: ${node.id}):`, error);
      serverLogs.push({ message: `[ENGINE] Error executing node ${node.name} (ID: ${node.id}): ${error.message || 'Unknown error'}`, type: 'error' });
      // For now, we'll let the workflow continue even if a node fails.
      // In a real engine, this would be configurable (e.g., stop on error, continue on error).
    }
  }

  console.log("[WORKFLOW ENGINE] Workflow execution finished.");
  serverLogs.push({ message: "[ENGINE] Workflow execution finished.", type: 'success' });
  return serverLogs;
}

