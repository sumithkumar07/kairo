
'use server';
/**
 * @fileOverview An AI flow to diagnose a failed workflow run.
 *
 * - diagnoseWorkflowError - A function that takes a failed workflow run and returns a diagnosis.
 * - DiagnoseWorkflowErrorInput - The input type for the function.
 * - DiagnoseWorkflowErrorOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schemas
const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string().optional(),
  config: z.any().optional(),
});
const WorkflowConnectionSchema = z.object({
  sourceNodeId: z.string(),
  targetNodeId: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
});
const ServerLogOutputSchema = z.object({
  timestamp: z.string(),
  message: z.string(),
  type: z.enum(['info', 'error', 'success']),
});

const DiagnoseWorkflowErrorInputSchema = z.object({
  nodes: z.array(WorkflowNodeSchema).describe('The nodes of the failed workflow.'),
  connections: z.array(WorkflowConnectionSchema).describe('The connections of the failed workflow.'),
  serverLogs: z.array(ServerLogOutputSchema).describe('The server logs captured during the failed execution.'),
});
export type DiagnoseWorkflowErrorInput = z.infer<typeof DiagnoseWorkflowErrorInputSchema>;

// Output Schema
const DiagnoseWorkflowErrorOutputSchema = z.object({
  diagnosis: z.string().describe("A clear, concise explanation of the root cause of the failure. Identify the failing node and the reason for its failure (e.g., bad input, misconfiguration, external API error)."),
  recommendedFix: z.string().describe("A step-by-step recommendation on how to fix the workflow. Be specific (e.g., 'Add a Conditional Logic node after the HTTP Request to check if the status code is 200 before attempting to parse the JSON.')."),
});
export type DiagnoseWorkflowErrorOutput = z.infer<typeof DiagnoseWorkflowErrorOutputSchema>;

// Exported function
export async function diagnoseWorkflowError(input: DiagnoseWorkflowErrorInput): Promise<DiagnoseWorkflowErrorOutput> {
  return diagnoseWorkflowErrorFlow(input);
}


// Prompt Schema - accepts JSON strings
const DiagnosePromptInputSchema = z.object({
  nodesJson: z.string(),
  connectionsJson: z.string(),
  logsJson: z.string(),
});

// Prompt Definition
const errorDiagnoserPrompt = ai.definePrompt({
  name: 'errorDiagnoserPrompt',
  input: {schema: DiagnosePromptInputSchema},
  output: {schema: DiagnoseWorkflowErrorOutputSchema},
  prompt: `You are an expert AI software engineer specializing in debugging automation workflows. Your task is to analyze the provided workflow structure and its execution logs to determine the root cause of a failure.

Workflow Analysis Steps:
1.  **Identify the Failing Node**: Scan the server logs for the first critical error message. The log will usually pinpoint the node that failed.
2.  **Determine the Cause**:
    *   **Configuration Error**: Is a required field in the failing node's config empty or using a placeholder that resolved to an invalid value? (e.g., a URL is 'undefined').
    *   **Bad Input**: Did the failing node receive incorrect or empty data from an upstream node? Check the logs for the output of the nodes connected to the failing one. (e.g., a 'Parse JSON' node received a non-JSON string because a preceding 'HTTP Request' node returned an HTML error page).
    *   **Logic Error**: Is there a faulty condition in a conditional node, or is a node being skipped incorrectly?
    *   **External Service Error**: Did an external API (like in an 'HTTP Request' node) return an error status (e.g., 404, 500)?
3.  **Formulate Diagnosis**: State clearly which node failed and why. Be direct.
4.  **Recommend a Fix**: Provide a clear, actionable solution. If it's a configuration issue, tell the user exactly what to fix. If it's a data issue, suggest adding error handling (e.g., a conditional check) or modifying the upstream node.

Workflow Nodes:
\`\`\`json
{{{nodesJson}}}
\`\`\`

Workflow Connections:
\`\`\`json
{{{connectionsJson}}}
\`\`\`

Execution Logs:
\`\`\`json
{{{logsJson}}}
\`\`\`

Based on your analysis, provide a diagnosis and recommended fix.
`,
});

// Flow Definition
const diagnoseWorkflowErrorFlow = ai.defineFlow(
  {
    name: 'diagnoseWorkflowErrorFlow',
    inputSchema: DiagnoseWorkflowErrorInputSchema,
    outputSchema: DiagnoseWorkflowErrorOutputSchema,
  },
  async (input) => {
    if (!input.nodes || input.nodes.length === 0 || !input.serverLogs || input.serverLogs.length === 0) {
      return { 
        diagnosis: "Insufficient data for analysis.",
        recommendedFix: "The workflow or its logs are empty. Unable to perform diagnosis."
      };
    }
    
    // Prepare the input for the prompt by stringifying the arrays.
    const promptInput = {
      nodesJson: JSON.stringify(input.nodes, null, 2),
      connectionsJson: JSON.stringify(input.connections, null, 2),
      logsJson: JSON.stringify(input.serverLogs, null, 2),
    };

    const {output} = await errorDiagnoserPrompt(promptInput);
    if (!output) {
      throw new Error("AI failed to generate a diagnosis for the workflow error.");
    }
    return output;
  }
);
