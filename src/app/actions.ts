
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

export async function generateWorkflow(input: GenerateWorkflowFromPromptInput): Promise<GenerateWorkflowFromPromptOutput> {
  try {
    console.log("Generating workflow with input:", JSON.stringify(input, null, 2));
    const result = await genkitGenerateWorkflowFromPrompt(input);
    console.log("Workflow generated:", JSON.stringify(result, null, 2));
    
    if (!result || !Array.isArray(result.nodes) || !Array.isArray(result.connections)) {
      throw new Error("AI returned an invalid workflow structure.");
    }
    
    return result;
  } catch (error) {
    console.error("Error in generateWorkflow server action:", error);
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
    console.error("Error in suggestNextWorkflowNode server action:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to suggest next node: ${error.message}`);
    }
    throw new Error("Failed to suggest next node due to an unknown error.");
  }
}

export async function executeWorkflow(workflow: Workflow): Promise<ServerLogOutput[]> {
  const serverLogs: ServerLogOutput[] = [];
  console.log("[SERVER EXECUTION ENGINE] Starting workflow execution for", workflow.nodes.length, "nodes.");
  serverLogs.push({ message: `[SERVER] Workflow execution started with ${workflow.nodes.length} nodes.`, type: 'info' });

  // TODO: Implement topological sort for correct execution order based on connections.
  // For now, executing in the order they appear in the nodes array.
  for (const node of workflow.nodes) {
    console.log(`[SERVER EXECUTION ENGINE] Executing node: ${node.name} (Type: ${node.type})`);
    serverLogs.push({ message: `[SERVER] Executing node: ${node.name} (Type: ${node.type})`, type: 'info' });

    try {
      switch (node.type) {
        case 'logMessage':
          const messageToLog = node.config?.message || `Default log message from ${node.name}`;
          console.log(`[WORKFLOW LOG] ${node.name}: ${messageToLog}`); // Actual server-side log
          serverLogs.push({ message: `[LOG] ${node.name}: ${messageToLog}`, type: 'info' });
          break;
        case 'httpRequest':
          // Placeholder for actual HTTP request logic
          console.log(`[SERVER EXECUTION ENGINE] HTTP Request node '${node.name}' would make a call to: ${node.config?.url}`);
          serverLogs.push({ message: `[HTTP] Node '${node.name}' to ${node.config?.url} - (Execution not yet implemented)`, type: 'info' });
          // Example: const response = await fetch(node.config.url, { method: node.config.method, headers: node.config.headers, body: node.config.body });
          // const data = await response.json();
          // serverLogs.push({ message: `[HTTP] Response from ${node.name}: ${JSON.stringify(data)}`, type: 'info' });
          break;
        case 'aiTask':
          console.log(`[SERVER EXECUTION ENGINE] AI Task node '${node.name}' would run with prompt: ${node.config?.prompt}`);
          serverLogs.push({ message: `[AI TASK] Node '${node.name}' prompt: "${node.config?.prompt}" - (Execution not yet implemented)`, type: 'info' });
          // Example: const aiResult = await someGenkitFlow({ prompt: node.config.prompt, model: node.config.model });
          // serverLogs.push({ message: `[AI TASK] Result from ${node.name}: ${aiResult}`, type: 'info' });
          break;
        default:
          console.log(`[SERVER EXECUTION ENGINE] Node type '${node.type}' not yet implemented for real execution. Skipping.`);
          serverLogs.push({ message: `[SERVER] Node type '${node.type}' execution is not yet implemented. Skipped.`, type: 'info' });
          break;
      }
      // Simulate some processing time if actual work was done
      // await new Promise(resolve => setTimeout(resolve, 100)); 
      serverLogs.push({ message: `[SERVER] Node '${node.name}' processed.`, type: 'success' });

    } catch (error: any) {
      console.error(`[SERVER EXECUTION ENGINE] Error executing node ${node.name}:`, error);
      serverLogs.push({ message: `[SERVER] Error executing node ${node.name}: ${error.message || 'Unknown error'}`, type: 'error' });
      // For now, we'll let the workflow continue even if a node fails.
      // In a real engine, this would be configurable.
    }
  }

  console.log("[SERVER EXECUTION ENGINE] Workflow execution finished.");
  serverLogs.push({ message: "[SERVER] Workflow execution finished.", type: 'success' });
  return serverLogs;
}
