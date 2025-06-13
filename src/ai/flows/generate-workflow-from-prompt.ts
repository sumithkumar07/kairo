
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
  id: z.string().describe('Unique identifier for the node (e.g., "node_1", "fetch_data_api"). Use snake_case.'),
  type: z.string().describe('Type of the node (e.g., httpRequest, parseJson, aiTask, youtubeFetchTrending). Choose the most appropriate type based on the user intent and available functionalities. Refer to the list of available node types and their purposes.'),
  name: z.string().optional().describe('A descriptive name for the node instance (e.g., "Fetch User Profile", "Summarize Article"). Keep it concise.'),
  description: z.string().optional().describe('A brief description of what this specific node instance does or its purpose in the workflow.'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).describe('The X, Y coordinates of the node in the visual editor. Nodes should be laid out logically, e.g., left-to-right or top-to-bottom flow. Stagger nodes if they are in sequence.'),
  config: z.any().describe("Configuration parameters for the node. This should be a valid JSON object. Populate relevant fields based on the node's 'type' and its corresponding 'configSchema' (e.g., for 'httpRequest', include 'url' and 'method'; for 'aiTask', include 'prompt'). Use placeholders like '{{previous_node_id.output_handle_name.property}}' to reference outputs from preceding nodes. For credentials, use placeholders like '{{secrets.API_KEY}}' or '{{env.SERVICE_TOKEN}}' and mention this in aiExplanation."),
  aiExplanation: z.string().optional().describe('AI-generated explanation for this node: why it was chosen, its configuration (especially how placeholders are used for data flow), any assumptions made, and its role. This corresponds to the ##COMMENTS requirement.'),
});

// Define the schema for a workflow connection (an edge in the graph). Describes how nodes are connected.
const WorkflowConnectionSchema = z.object({
  sourceNodeId: z.string().describe('ID of the source node.'),
  sourcePort: z.string().optional().describe("The specific output port/handle on the source node to connect from (e.g., 'response', 'videos', 'result'). Refer to the source node type's 'outputHandles' definition. If the source node has only one obvious output or if the specific handle is ambiguous from the prompt, this can sometimes be omitted, but prefer to specify if known."),
  targetNodeId: z.string().describe('ID of the target node.'),
  targetPort: z.string().optional().describe("The specific input port/handle on the target node to connect to (e.g., 'input', 'jsonData'). Refer to the target node type's 'inputHandles' definition. If the target node has only one obvious input or if the specific handle is ambiguous, this can sometimes be omitted, but prefer to specify if known."),
});

// Define the overall workflow schema, containing nodes and connections.
const GenerateWorkflowFromPromptOutputSchema = z.object({
  nodes: z.array(WorkflowNodeSchema).describe('List of all workflow nodes required to fulfill the user\'s request. Ensure all steps from the prompt are covered.'),
  connections: z.array(WorkflowConnectionSchema).describe('List of all connections between nodes, ensuring a complete data flow from triggers to final actions. Ensure sourcePort and targetPort are specified where applicable and match defined node handles.'),
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
Assume you have access to a conceptual 'Node Knowledge Graph' with detailed specifications for many node types (triggers, data transformations, AI tasks, outputs like Slack/Email/Databases, etc.), including their 'inputHandles', 'outputHandles', and 'configSchema'.

Given the following user prompt, generate a JSON object representing the entire workflow:
User Prompt: "{{prompt}}"

Workflow Structure:
The workflow consists of 'nodes' and 'connections'.
- Each 'node' represents a distinct step (trigger, action, logic).
- Each 'connection' defines the data flow between nodes.

Node Requirements: For each node, you MUST provide:
- 'id': A unique, snake_case string identifier (e.g., "youtube_trigger", "download_video_node").
- 'type': The most appropriate node type (e.g., 'httpRequest', 'parseJson', 'aiTask', 'youtubeFetchTrending', 'conditionalLogic'). Choose from the available types. If a very specific operation is requested that doesn't map to a common node type, use a generic 'workflowNode' and detail the intended operation in its name, description, and aiExplanation.
- 'name': A short, descriptive name for this node instance (e.g., "YouTube Upload Trigger", "Download Video File").
- 'description': (Optional) A brief sentence explaining this node's purpose.
- 'position': An object with 'x' and 'y' coordinates for visual layout. Distribute nodes clearly.
- 'config': A JSON object for node-specific parameters.
    - Populate fields relevant to the node's 'type' and its 'configSchema'. For example, an 'httpRequest' node should have 'url' and 'method' in its config. An 'aiTask' should have a 'prompt'.
    - Data Flow: Use placeholders like '{{source_node_id.output_handle_name.optional_property}}' within config values to reference outputs from preceding nodes. For example, if 'node_1' (type: httpRequest) outputs data on its 'response' handle, a subsequent 'parseJson' node might have config: { "jsonString": "{{node_1.response}}" }.
    - Credential Handling: For nodes requiring credentials, use placeholders like '{{secrets.MY_API_KEY}}' or '{{env.SERVICE_TOKEN}}' within the 'config' and clearly state this requirement in the 'aiExplanation'.
- 'aiExplanation': Your detailed explanation for this node:
    - Why this node type was chosen.
    - Explanation of its configuration, especially how placeholders facilitate data flow from previous nodes and any important parameters.
    - Any assumptions made (e.g., about data format from a previous step, or if an API key is needed).
    - Its specific role in achieving the overall workflow goal.

Connection Requirements: For each connection:
- 'sourceNodeId': ID of the source node.
- 'targetNodeId': ID of the target node.
- 'sourcePort': (Recommended) Specify the output handle on the source node (e.g., 'response', 'videos', 'result'). This should match one of the 'outputHandles' of the source node's type.
- 'targetPort': (Recommended) Specify the input handle on the target node (e.g., 'input', 'jsonData'). This should match one of the 'inputHandles' of the target node's type.
  Specifying ports is crucial for clarity when nodes have multiple inputs/outputs.

Key Instructions:
1.  Completeness: Ensure ALL logical steps from the user's prompt are translated into distinct nodes.
2.  Connectivity: All nodes (except typically the final one(s)) should be connected to form a coherent data flow. Triggers start the flow.
3.  Data Flow: Explicitly manage data flow using placeholders in node 'config' that reference outputs from previous nodes via their 'outputHandles'.
4.  Node Type Selection: Choose the most specific node 'type' available that matches the requested function.
5.  Configuration: Provide sensible default or placeholder configurations for each node, referencing its purpose and expected inputs/outputs.
6.  Production Focus: Aim for workflows that are robust and make sense in a production environment.

Output Format:
The output MUST be a single, valid JSON object that strictly conforms to the Zod schema detailed below.

Schema Description:
${GenerateWorkflowFromPromptOutputSchema.description}
Nodes Schema: ${WorkflowNodeSchema.description}
Connections Schema: ${WorkflowConnectionSchema.description}

Analyze the user's request carefully and construct the complete workflow. Be meticulous about node types, configurations (with data flow placeholders), and connections (with port/handle names where appropriate).
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
    // Basic validation to ensure the AI output is not null, actual schema validation is handled by Genkit
    if (!output) {
        throw new Error("AI failed to generate a workflow. Output was null.");
    }
    // Additional check for empty nodes array, which is valid by schema but not useful
    if (output.nodes.length === 0 && input.prompt.trim() !== "") {
        console.warn("AI generated an empty workflow for a non-empty prompt.");
        // Depending on strictness, could throw error or return the empty (but valid) output
    }
    return output;
  }
);

// Example of how to access outputHandles from a node config for AI prompt (conceptual)
// This is not directly used in the code above but illustrates how AI might be "aware" of handles.
// const sampleNodeConfigKnowledge = {
//   "httpRequest": { outputHandles: ["response", "error"] },
//   "conditionalLogic": { outputHandles: ["result"] }
// };
// If AI has access to this kind of structured knowledge, it can make better decisions for sourcePort/targetPort.
// The prompt tries to guide it based on this conceptual knowledge.
