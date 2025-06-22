
'use server';
/**
 * @fileOverview The Model Context Protocol (MCP) flow.
 * This AI flow acts as a command orchestrator for the Kairo platform,
 * using tools to manage and execute workflows based on natural language commands.
 *
 * - mcpFlow - The main flow function.
 * - McpInput - The input schema for the flow.
 * - McpOutput - The output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  listSavedWorkflowsTool,
  getWorkflowDefinitionTool,
  runWorkflowTool,
} from '@/ai/tools/workflow-management-tools';

export const McpInputSchema = z.object({
  command: z.string().describe('The natural language command from the user.'),
});
export type McpInput = z.infer<typeof McpInputSchema>;

export const McpOutputSchema = z.object({
  response: z.string().describe('The AI-generated response, detailing actions taken or results found.'),
});
export type McpOutput = z.infer<typeof McpOutputSchema>;

export async function mcpFlow(input: McpInput): Promise<McpOutput> {
  const orchestratorPrompt = ai.definePrompt({
    name: 'mcpOrchestratorPrompt',
    input: { schema: McpInputSchema },
    output: { schema: McpOutputSchema },
    tools: [
      listSavedWorkflowsTool,
      getWorkflowDefinitionTool,
      runWorkflowTool,
    ],
    prompt: `You are the Kairo Model Context Protocol (MCP) Orchestrator.
Your role is to understand user commands and use the provided tools to manage, inspect, and run Kairo workflows.

- **Analyze the User's Command**: Determine the user's intent. Do they want to list workflows, see the details of one, or run one?
- **Use Tools Strategically**:
  - If the user asks to see what workflows are available, use 'listSavedWorkflowsTool'.
  - If the user asks to see or run a specific workflow by name, you might need to first use 'getWorkflowDefinitionTool' to retrieve its structure.
  - If the user's command is to execute a workflow, use the 'runWorkflowTool' with the workflow's nodes and connections. You may need to get the definition first if it's not provided.
- **Report Your Actions**: Your final response should be a clear, concise summary of the actions you took and the results you found or the result of the execution. If you cannot fulfill the request, explain why.

User Command: "{{command}}"
`,
  });

  const { output } = await orchestratorPrompt(input);
  if (!output) {
    return { response: "I was unable to process that command." };
  }
  return output;
}
