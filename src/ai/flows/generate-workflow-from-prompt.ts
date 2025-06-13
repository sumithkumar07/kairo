
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
  id: z.string().describe('Unique identifier for the node (e.g., "node_1", "fetch_data_api").'),
  type: z.string().describe('Type of the node (e.g., httpRequest, parseJson, aiTask). Choose the most appropriate type based on the user intent and available functionalities.'),
  name: z.string().optional().describe('A descriptive name for the node instance (e.g., "Fetch User Profile", "Summarize Article").'),
  description: z.string().optional().describe('A brief description of what this specific node instance does or its purpose in the workflow.'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).describe('The X, Y coordinates of the node in the visual editor. Nodes should be laid out logically, e.g., left-to-right or top-to-bottom flow.'),
  config: z.any().describe('Configuration parameters for the node (e.g., API URL, database table name, prompt for an AI task). This should be a valid JSON object. For credentials, use placeholders like {{secrets.API_KEY}} or {{env.SERVICE_TOKEN}} and mention this in aiExplanation.'),
  aiExplanation: z.string().optional().describe('AI-generated explanation for this node: why it was chosen, its configuration, any assumptions made, and its role. This corresponds to the ##COMMENTS requirement.'),
});

// Define the schema for a workflow connection (an edge in the graph). Describes how nodes are connected.
const WorkflowConnectionSchema = z.object({
  source: z.string().describe('ID of the source node.'),
  sourcePort: z.string().optional().describe('The specific output port/handle on the source node to connect from (if applicable).'),
  target: z.string().describe('ID of the target node.'),
  targetPort: z.string().optional().describe('The specific input port/handle on the target node to connect to (if applicable).'),
});

// Define the overall workflow schema, containing nodes and connections.
const GenerateWorkflowFromPromptOutputSchema = z.object({
  nodes: z.array(WorkflowNodeSchema).describe('List of all workflow nodes required to fulfill the user\'s request.'),
  connections: z.array(WorkflowConnectionSchema).describe('List of all connections between nodes, ensuring a complete data flow.'),
});

export type GenerateWorkflowFromPromptOutput = z.infer<typeof GenerateWorkflowFromPromptOutputSchema>;

// Input schema: a simple text prompt describing the desired workflow.
const GenerateWorkflowFromPromptInputSchema = z.object({
  prompt: z.string().describe('A plain-text description of the workflow to generate (e.g., "When I upload a YouTube video, download it, generate a transcript, create an AI summary, and post it to Slack channel #updates").'),
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
  prompt: `You are an AI Technical Architect specializing in workflow automation systems. Your task is to generate complete, production-ready, executable workflows from natural language prompts.
Assume you have access to a conceptual 'Node Knowledge Graph' with detailed specifications for many node types (triggers, data transformations, AI tasks, outputs like Slack/Email/Databases, etc.).

Given the following user prompt, generate a JSON object representing the entire workflow:
User Prompt: "{{prompt}}"

Workflow Structure:
The workflow consists of 'nodes' and 'connections'.
- Each 'node' represents a distinct step (trigger, action, logic).
- Each 'connection' defines the data flow between nodes.

Node Requirements: For each node, you MUST provide:
- 'id': A unique string identifier (e.g., "youtube_trigger", "download_video_node").
- 'type': The most appropriate node type based on its function (e.g., 'youtube/upload_trigger', 'http/download_file', 'ai/whisper_transcription', 'ai/gpt_summary', 'slack/post_message'). Do not invent node types not implicitly covered by general automation categories; if a very specific operation is requested that doesn't map to a common node type, use a generic 'workflowNode' and detail the intended operation in its name, description, and aiExplanation.
- 'name': A short, descriptive name for this node instance (e.g., "YouTube Upload Trigger", "Download Video File").
- 'description': (Optional) A brief sentence explaining this node's purpose in the workflow.
- 'position': An object with 'x' and 'y' coordinates for visual layout. Distribute nodes clearly for readability.
- 'config': A JSON object for node-specific parameters (e.g., API URL, model name, Slack channel).
  - Credential Handling: For nodes requiring credentials, use placeholders like '{{secrets.MY_API_KEY}}' or '{{env.SERVICE_TOKEN}}' within the 'config' and clearly state this requirement in the 'aiExplanation'.
- 'aiExplanation': Your detailed explanation (like '##COMMENTS') for this node:
    - Why this node type was chosen.
    - Explanation of its configuration and any important parameters.
    - Any assumptions made (e.g., about data format from a previous step).
    - Its specific role in achieving the overall workflow goal.
    - Potential error considerations or alternative approaches if applicable.

Connection Requirements: For each connection:
- 'source': ID of the source node.
- 'target': ID of the target node.
- 'sourcePort'/'targetPort': (Optional) Specify if connecting to/from named handles on nodes.

Key Instructions:
1.  Completeness: Ensure ALL logical steps from the user's prompt are translated into distinct nodes.
2.  Connectivity: All nodes (except typically the final one) should be connected to form a coherent data flow. Triggers start the flow.
3.  Data Flow: Implicitly manage data flow. For example, the output of a 'download_file' node (e.g., '{{download-node.output}}') would be the input to a 'whisper_transcription' node.
4.  Error Handling: Consider potential error paths. While you may not add explicit error handling nodes unless requested or obvious, mention potential failure points and how they might be handled (e.g., retry, notification) in the 'aiExplanation' for relevant nodes.
5.  Production Focus: Aim for workflows that are robust and make sense in a production environment.

Output Format:
The output MUST be a single, valid JSON object that strictly conforms to the Zod schema detailed below (which includes 'nodes' and 'connections' arrays).

Schema Description:
${GenerateWorkflowFromPromptOutputSchema.description}
Nodes Schema: ${WorkflowNodeSchema.description}
Connections Schema: ${WorkflowConnectionSchema.description}

Analyze the user's request carefully and construct the complete workflow.
`,
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
