
'use server';
/**
 * @fileOverview An AI flow to diagnose a failed workflow run and propose a corrected workflow definition.
 *
 * - diagnoseWorkflowError - A function that takes a failed workflow run and returns a diagnosis and a corrected workflow.
 * - DiagnoseWorkflowErrorInput - The input type for the function.
 * - DiagnoseWorkflowErrorOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateWorkflowFromPromptOutputSchema, WorkflowNodeSchema, WorkflowConnectionSchema } from '@/ai/schemas';

// Input Schemas
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
  recommendedFix: z.string().describe("A step-by-step recommendation on how to fix the workflow. Be specific (e.g., '1. Add a Conditional Logic node after the HTTP Request. 2. Set its condition to check if the status code is 200. 3. Reconnect the 'Parse JSON' node to the output of the new conditional node.')."),
  correctedWorkflow: GenerateWorkflowFromPromptOutputSchema.optional().describe("If a fix is possible, provide the complete, corrected workflow definition as a JSON object with 'nodes' and 'connections'. This new definition should implement the recommended fix. If the workflow cannot be fixed automatically, this field should be omitted."),
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
  prompt: `You are an expert AI software engineer specializing in debugging and correcting automation workflows. Your task is to analyze the provided workflow structure and its execution logs to determine the root cause of a failure and generate a corrected version of the workflow.

**Analysis & Correction Steps:**

1.  **Identify the Failing Node**: Scan the server logs for the first critical error message. The log will usually pinpoint the node that failed.
2.  **Determine the Cause**:
    *   **Configuration Error**: Is a required field in the failing node's config empty or using a placeholder that resolved to an invalid value? (e.g., a URL is 'undefined').
    *   **Bad Input**: Did the failing node receive incorrect or empty data from an upstream node? Check the logs for the output of the nodes connected to the failing one.
    *   **Logic Error**: Is there a faulty condition in a conditional node, or is a node being skipped incorrectly?
    *   **External Service Error**: Did an external API return an error?
3.  **Formulate Diagnosis**: State clearly which node failed and why. Be direct.
4.  **Recommend a Fix**: Provide a clear, actionable, step-by-step solution that a user could follow manually if they chose to. Be specific (e.g., "1. Add a 'Conditional Logic' node after 'Fetch User API'. 2. Set its condition to '{{status_code}} == 200'. 3. Reconnect the 'Parse JSON' node to the output of the new conditional node.").
5.  **Generate Corrected Workflow**: Based on your analysis, generate a complete, corrected JSON definition for the workflow in the \`correctedWorkflow\` output field. This is the most critical part.
    *   **Preservation is Key**: You MUST preserve the exact positions, names, configurations, and IDs of all unaffected nodes. The corrected workflow should look as close to the original as possible, with only the necessary changes.
    *   **MANDATORY AI EXPLANATION**: For any node you add or modify, you **MUST** provide a clear, user-friendly \`aiExplanation\` detailing *what* you changed and *why*. For new nodes, explain their purpose. For modified nodes, explain the configuration change. This is non-negotiable.
    *   **Layout Logic**: If you add a new node (like a conditional check), position it logically between the source of the error and the next step. For example, if an HTTP request at (100, 200) fails and you add a conditional, place the conditional at (100, 340) and move the subsequent nodes down.
    *   **Adherence to Rules**: Adhere to all standard workflow generation rules: use \`inputMapping\` for data flow, use placeholders for credentials (\`{{credential.NAME}}\`), etc.
    *   **Omission**: If the workflow is unfixable (e.g., the error is due to an external service being permanently offline or a fundamental logic issue that requires human intervention), you may omit the \`correctedWorkflow\` field, but you must explain why in the \`recommendedFix\`.

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

Based on your analysis, provide a diagnosis, recommended fix, and the corrected workflow JSON.
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
