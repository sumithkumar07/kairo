'use server';
/**
 * @fileOverview Defines Genkit tools for AI-driven workflow management.
 * These tools allow the AI to list, inspect, and execute workflows by interacting
 * with the central WorkflowStorage service.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { listAllWorkflows, getWorkflowByName } from '@/services/workflow-storage-service';
import type { WorkflowNode, WorkflowConnection } from '@/types/workflow';

// Schema for Workflow Nodes (simplified for tool input)
const WorkflowNodeInputSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  description: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }),
  config: z.any(),
  inputHandles: z.array(z.string()).optional(),
  outputHandles: z.array(z.string()).optional(),
  aiExplanation: z.string().optional(),
  category: z.string(),
  lastExecutionStatus: z.string().optional(),
});

// Schema for Workflow Connections (simplified for tool input)
const WorkflowConnectionInputSchema = z.object({
  id: z.string(),
  sourceNodeId: z.string(),
  sourceHandle: z.string().optional(),
  targetNodeId: z.string(),
  targetHandle: z.string().optional(),
});


export const listSavedWorkflowsTool = ai.defineTool(
  {
    name: 'listSavedWorkflows',
    description: 'Lists all available saved workflows, including examples and user-created ones.',
    inputSchema: z.undefined(),
    outputSchema: z.array(z.object({
        name: z.string(),
        description: z.string(),
        type: z.enum(['example', 'user']),
    })),
  },
  async () => {
    console.log('[Agent Tool] Listing all workflows from storage...');
    return await listAllWorkflows();
  }
);

export const getWorkflowDefinitionTool = ai.defineTool(
  {
    name: 'getWorkflowDefinition',
    description: 'Retrieves the full JSON definition (nodes and connections) for a specific workflow by its name.',
    inputSchema: z.object({ name: z.string().describe("The exact name of the workflow to retrieve.") }),
    outputSchema: z.object({
        nodes: z.array(WorkflowNodeInputSchema),
        connections: z.array(WorkflowConnectionInputSchema),
    }).optional(),
  },
  async ({ name }) => {
    console.log(`[Agent Tool] Getting definition for workflow: ${name} from storage...`);
    const workflow = await getWorkflowByName(name);
    if (workflow) {
      // Cast the workflow nodes and connections to the input schemas.
      return {
        nodes: workflow.nodes as z.infer<typeof WorkflowNodeInputSchema>[],
        connections: workflow.connections as z.infer<typeof WorkflowConnectionInputSchema>[],
      };
    }
    return undefined;
  }
);

export const runWorkflowTool = ai.defineTool(
    {
        name: 'runWorkflow',
        description: 'Executes a given workflow definition in simulation mode and returns the result.',
        inputSchema: z.object({
            nodes: z.array(WorkflowNodeInputSchema).describe("The array of nodes in the workflow."),
            connections: z.array(WorkflowConnectionInputSchema).describe("The array of connections between the nodes."),
        }),
        outputSchema: z.object({
            status: z.string().describe("The final status of the workflow execution ('Success' or 'Failed')."),
            summary: z.string().describe("A brief summary of the execution, including any error messages."),
        }),
    },
    async ({ nodes, connections }) => {
        console.log(`[Agent Tool] Running workflow with ${nodes.length} nodes...`);
        try {
            // FIX: Dynamic import to break circular dependency with actions.ts
            const { executeWorkflow } = await import('@/app/actions');
            const result = await executeWorkflow({ nodes: nodes as WorkflowNode[], connections: connections as WorkflowConnection[] }, true);
            const hasErrors = Object.values(result.finalWorkflowData).some((nodeOutput: any) => nodeOutput.lastExecutionStatus === 'error');
            const status = hasErrors ? 'Failed' : 'Success';

            let summary = `Workflow execution completed with status: ${status}.`;
            if (hasErrors) {
                const errorDetails = Object.entries(result.finalWorkflowData)
                    .filter(([_, value]) => (value as any).lastExecutionStatus === 'error')
                    .map(([key, value]) => `Node '${(nodes.find(n => n.id === key))?.name || key}' failed with error: ${(value as any).error_message}`)
                    .join('; ');
                summary += ` Errors: ${errorDetails}`;
            }

            return { status, summary };
        } catch (e: any) {
            console.error(`[Agent Tool] Critical error running workflow: ${e.message}`);
            return {
                status: 'Failed',
                summary: `A critical error occurred during workflow execution: ${e.message}`,
            };
        }
    }
);

// Conceptual tools to match the Zapier screenshot
export const youtubeFindVideoTool = ai.defineTool({
    name: 'youtubeFindVideo',
    description: 'Finds a YouTube video based on a search query.',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.object({ videoId: z.string(), title: z.string() }),
}, async ({ query }) => {
    // This is a placeholder implementation
    console.log(`[Agent Tool - Placeholder] Finding YouTube video for query: ${query}`);
    return { videoId: 'dQw4w9WgXcQ', title: 'Placeholder Video' };
});

export const youtubeGetReportTool = ai.defineTool({
    name: 'youtubeGetReport',
    description: 'Gets a report for a YouTube video.',
    inputSchema: z.object({ videoId: z.string() }),
    outputSchema: z.object({ views: z.number(), likes: z.number() }),
}, async ({ videoId }) => {
    console.log(`[Agent Tool - Placeholder] Getting report for YouTube video: ${videoId}`);
    return { views: 1000000, likes: 50000 };
});

export const googleDriveFindFileTool = ai.defineTool({
    name: 'googleDriveFindFile',
    description: 'Finds a file or folder in Google Drive by name.',
    inputSchema: z.object({ name: z.string() }),
    outputSchema: z.object({ fileId: z.string(), name: z.string(), mimeType: z.string() }),
}, async ({ name }) => {
    console.log(`[Agent Tool - Placeholder] Finding Google Drive file: ${name}`);
    return { fileId: '12345_placeholder_id', name: 'My Placeholder Document', mimeType: 'application/vnd.google-apps.document' };
});
