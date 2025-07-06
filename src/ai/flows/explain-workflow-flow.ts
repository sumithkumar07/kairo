
'use server';
/**
 * @fileOverview An AI flow to explain a given workflow structure.
 *
 * - explainWorkflow - A function that takes workflow nodes and connections and returns a natural language explanation.
 * - ExplainWorkflowInput - The input type for the explainWorkflow function.
 * - ExplainWorkflowOutput - The return type for the explainWorkflow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { WorkflowNodeSchema, WorkflowConnectionSchema } from '@/ai/schemas';

const ExplainWorkflowInputSchema = z.object({
  nodes: z.array(WorkflowNodeSchema).describe('List of all workflow nodes.'),
  connections: z.array(WorkflowConnectionSchema).describe('List of all connections between nodes.'),
});
export type ExplainWorkflowInput = z.infer<typeof ExplainWorkflowInputSchema>;

const ExplainWorkflowOutputSchema = z.object({
  explanation: z.string().describe('A concise, natural language summary of the workflow\'s purpose, main steps, and general data flow. The explanation should be clear, easy for a non-technical user to understand, yet accurate for a technical user.'),
});
export type ExplainWorkflowOutput = z.infer<typeof ExplainWorkflowOutputSchema>;

export async function explainWorkflow(input: ExplainWorkflowInput): Promise<ExplainWorkflowOutput> {
  return explainWorkflowFlow(input);
}

// A specific schema for the prompt's input, accepting JSON strings.
const ExplainWorkflowPromptInputSchema = z.object({
  nodesJson: z.string().describe('JSON string representing the list of all workflow nodes.'),
  connectionsJson: z.string().describe('JSON string representing the list of all connections between nodes.'),
});


const workflowExplainerPrompt = ai.definePrompt({
  name: 'workflowExplainerPrompt',
  input: {schema: ExplainWorkflowPromptInputSchema},
  output: {schema: ExplainWorkflowOutputSchema},
  prompt: `You are an expert AI technical analyst. Your task is to analyze the provided workflow structure (nodes and connections) and generate a high-level natural language summary.
The summary should be clear, concise, and easy for a non-technical user to understand, while still being accurate for a technical user.

Focus on:
- The overall purpose or goal of the workflow if it can be inferred (the "why").
- The main sequence of actions or stages (the "how" at a high level).
- How data generally flows between key nodes.
- Any significant branching, looping, or parallel processing.

Do NOT attempt to:
- Execute or simulate the workflow.
- Validate the configuration of individual nodes in detail.
- Provide a line-by-line code explanation.
- Criticize or suggest improvements unless specifically part of the analysis of "what it does".

The output should be a human-readable explanation that helps someone understand what the workflow is designed to achieve and how it generally operates.

Workflow Nodes:
\`\`\`json
{{{nodesJson}}}
\`\`\`

Workflow Connections:
\`\`\`json
{{{connectionsJson}}}
\`\`\`

Based on the nodes and connections, provide your explanation:
`,
});

const explainWorkflowFlow = ai.defineFlow(
  {
    name: 'explainWorkflowFlow',
    inputSchema: ExplainWorkflowInputSchema,
    outputSchema: ExplainWorkflowOutputSchema,
  },
  async (input) => {
    if (!input.nodes || input.nodes.length === 0) {
      return { explanation: "The workflow is empty. There is nothing to explain." };
    }
    
    // Prepare the input for the prompt by stringifying the arrays.
    const promptInput = {
      nodesJson: JSON.stringify(input.nodes, null, 2),
      connectionsJson: JSON.stringify(input.connections, null, 2),
    };

    const {output} = await workflowExplainerPrompt(promptInput);
    if (!output) {
      throw new Error("AI failed to generate an explanation for the workflow.");
    }
    return output;
  }
);
