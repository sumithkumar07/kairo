
'use server';
/**
 * @fileOverview Defines Genkit tools for AI-driven workflow management.
 * These tools allow the AI to list, inspect, and execute workflows.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { EXAMPLE_WORKFLOWS } from '@/config/example-workflows';
import { executeWorkflow } from '@/app/actions';
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
    description: 'Lists all available saved example workflows. In this prototype, this does not include user-saved workflows from the editor.',
    inputSchema: z.undefined(),
    outputSchema: z.array(z.object({
        name: z.string(),
        description: z.string(),
    })),
  },
  async () => {
    console.log('[MCP Tool] Listing example workflows...');
    return EXAMPLE_WORKFLOWS.map(wf => ({
        name: wf.name,
        description: wf.description,
    }));
  }
);

export const getWorkflowDefinitionTool = ai.defineTool(
  {
    name: 'getWorkflowDefinition',
    description: 'Retrieves the full JSON definition (nodes and connections) for a specific example workflow by its name.',
    inputSchema: z.object({ name: z.string().describe("The exact name of the example workflow to retrieve.") }),
    outputSchema: z.object({
        nodes: z.array(WorkflowNodeInputSchema),
        connections: z.array(WorkflowConnectionInputSchema),
    }).optional(),
  },
  async ({ name }) => {
    console.log(`[MCP Tool] Getting definition for workflow: ${name}`);
    const workflow = EXAMPLE_WORKFLOWS.find(wf => wf.name.toLowerCase() === name.toLowerCase());
    if (workflow) {
      // Cast the example workflow nodes and connections to the input schemas.
      // This is a simplification; in a real-world scenario, you might have a more robust mapping.
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
        console.log(`[MCP Tool] Running workflow with ${nodes.length} nodes...`);
        try {
            const result = await executeWorkflow({ nodes: nodes as WorkflowNode[], connections: connections as WorkflowConnection[] }, true);
            const hasErrors = Object.values(result.finalWorkflowData).some((nodeOutput: any) => nodeOutput.lastExecutionStatus === 'error');
            const status = hasErrors ? 'Failed' : 'Success';

            let summary = `Workflow execution completed with status: ${status}.`;
            if (hasErrors) {
                const errorDetails = Object.entries(result.finalWorkflowData)
                    .filter(([_, value]) => (value as any).lastExecutionStatus === 'error')
                    .map(([key, value]) => `Node '${key}' failed with error: ${(value as any).error_message}`)
                    .join('; ');
                summary += ` Errors: ${errorDetails}`;
            }

            return { status, summary };
        } catch (e: any) {
            console.error(`[MCP Tool] Critical error running workflow: ${e.message}`);
            return {
                status: 'Failed',
                summary: `A critical error occurred during workflow execution: ${e.message}`,
            };
        }
    }
);
