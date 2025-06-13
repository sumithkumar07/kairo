
// The directive tells the Next.js runtime to execute this code on the server.
'use server';

/**
 * @fileOverview AI-powered workflow generator from a plain-text prompt.
 *
 * - generateWorkflowFromPrompt - A function that takes a plain-text workflow description and returns a JSON representation of the workflow.
 * - GenerateWorkflowFromPromptInput - The input type for the generateWorkflowFromPrompt function.
 * - GenerateWorkflowFromPromptOutput - The return type for the generateWorkflowFromPrompt function, which represents the workflow definition.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the schema for a node in the workflow.
const WorkflowNodeSchema = z.object({
  id: z.string().describe('Unique identifier for the node.'),
  type: z.string().describe('Type of the node (e.g., httpRequest, parseJson, databaseInsert).'),
  name: z.string().optional().describe('A descriptive name for the node instance.'),
  description: z.string().optional().describe('A brief description of what this node does or its purpose in the workflow.'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).describe('The X, Y coordinates of the node in the visual editor'),
  config: z.any().describe('Configuration parameters for the node (e.g., API URL, database table name). This can be any valid JSON object.'),
});

// Define the schema for a workflow connection (an edge in the graph). Describes how nodes are connected.
const WorkflowConnectionSchema = z.object({
  source: z.string().describe('ID of the source node.'),
  sourcePort: z.string().optional().describe('The output port on the source node to connect from'),
  target: z.string().describe('ID of the target node.'),
  targetPort: z.string().optional().describe('The input port on the target node to connect to'),
});

// Define the overall workflow schema, containing nodes and connections.
const GenerateWorkflowFromPromptOutputSchema = z.object({
  nodes: z.array(WorkflowNodeSchema).describe('List of workflow nodes.'),
  connections: z.array(WorkflowConnectionSchema).describe('List of connections between nodes.'),
});

export type GenerateWorkflowFromPromptOutput = z.infer<typeof GenerateWorkflowFromPromptOutputSchema>;

// Input schema: a simple text prompt describing the desired workflow.
const GenerateWorkflowFromPromptInputSchema = z.object({
  prompt: z.string().describe('A plain-text description of the workflow to generate (e.g., \'Fetch data from a REST API and store the result in a database\').'),
});

export type GenerateWorkflowFromPromptInput = z.infer<typeof GenerateWorkflowFromPromptInputSchema>;

// Exported function to generate a workflow from a prompt.
export async function generateWorkflowFromPrompt(input: GenerateWorkflowFromPromptInput): Promise<GenerateWorkflowFromPromptOutput> {
  return generateWorkflowFromPromptFlow(input);
}

// Define the prompt that instructs the LLM to generate a workflow definition.
const generateWorkflowPrompt = ai.definePrompt({
  name: 'generateWorkflowPrompt',
  input: {schema: GenerateWorkflowFromPromptInputSchema},
  output: {schema: GenerateWorkflowFromPromptOutputSchema},
  prompt: `You are an AI workflow generator.  Given a plain-text description of a workflow, you will generate a JSON object representing the workflow.

The workflow consists of nodes and connections.  Each node represents a step in the workflow, such as fetching data from an API, transforming the data, or storing it in a database.
Each connection represents the flow of data between two nodes.

Here is the description of the workflow to generate:

{{prompt}}

Be sure to include the 'id', 'type', 'name' (optional friendly name for the node), 'description' (optional brief purpose of the node), 'position', and 'config' fields for each node.
For connections, include 'source', 'sourcePort' (optional), 'target', and 'targetPort' (optional) fields.
The 'config' field for each node should be a JSON object containing specific settings for that node type.

Ensure that the output is valid JSON that conforms to the following schema:
${GenerateWorkflowFromPromptOutputSchema.description}`,
});

// Define the Genkit flow.
const generateWorkflowFromPromptFlow = ai.defineFlow(
  {
    name: 'generateWorkflowFromPromptFlow',
    inputSchema: GenerateWorkflowFromPromptInputSchema,
    outputSchema: GenerateWorkflowFromPromptOutputSchema,
  },
  async input => {
    const {output} = await generateWorkflowPrompt(input);
    return output!;
  }
);
