
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
  type: z.string().describe('Type of the node (e.g., httpRequest, parseJson, aiTask, sendEmail, databaseQuery, dataTransform). Choose the most appropriate type. Refer to available node types and their specific config requirements (e.g., dataTransform types like toUpperCase, extractFields).'),
  name: z.string().optional().describe('A descriptive name for the node instance (e.g., "Fetch User Profile", "Summarize Article"). Keep it concise.'),
  description: z.string().optional().describe('A brief description of what this specific node instance does or its purpose in the workflow.'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).describe('The X, Y coordinates of the node in the visual editor. Nodes should be laid out logically, e.g., left-to-right or top-to-bottom flow. Stagger nodes if they are in sequence.'),
  config: z.any().describe("Configuration parameters for the node. This should be a valid JSON object. Populate relevant fields based on the node's 'type' and its corresponding 'configSchema'. Examples:\n- 'httpRequest': include 'url', 'method'.\n- 'aiTask': include 'prompt', 'model'.\n- 'sendEmail': include 'to', 'subject', 'body'. Expect EMAIL_* env vars for server settings.\n- 'databaseQuery': include 'queryText' (SQL with $1, $2 placeholders) and 'queryParams' (JSON array of values). Expect DB_CONNECTION_STRING env var.\n- 'dataTransform': include 'transformType' (e.g., 'toUpperCase', 'extractFields'), and specific params like 'inputString', 'inputObject', 'fieldsToExtract' (JSON array of *top-level* field names), 'stringsToConcatenate' (JSON array), 'separator'.\n- Use placeholders like '{{previous_node_id.output_handle_name.property}}' to reference outputs. For credentials, PREFER `{{env.YOUR_VARIABLE_NAME}}` and mention this in aiExplanation. For conditional execution, include a '_flow_run_condition' field with a placeholder pointing to a boolean output, e.g., '{{conditional_node.result}}'."),
  aiExplanation: z.string().optional().describe('AI-generated explanation for this node: why it was chosen, its configuration (especially data flow placeholders, credential placeholders like `{{env.YOUR_VARIABLE_NAME}}` to be set by user, conditional execution fields, and specific config for sendEmail/databaseQuery/dataTransform like parameters for $1,$2 or transformType), assumptions made, and its role.'),
});

// Define the schema for a workflow connection (an edge in the graph). Describes how nodes are connected.
const WorkflowConnectionSchema = z.object({
  sourceNodeId: z.string().describe('ID of the source node.'),
  sourcePort: z.string().optional().describe("The specific output port/handle on the source node to connect from (e.g., 'response', 'videos', 'result', 'output_data'). Refer to the source node type's 'outputHandles' definition."),
  targetNodeId: z.string().describe('ID of the target node.'),
  targetPort: z.string().optional().describe("The specific input port/handle on the target node to connect to (e.g., 'input', 'jsonData', 'input_data'). Refer to the target node type's 'inputHandles' definition."),
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
Assume you have access to a conceptual 'Node Knowledge Graph' with detailed specifications for many node types, including their 'inputHandles', 'outputHandles', and 'configSchema'.

Given the following user prompt, generate a JSON object representing the entire workflow:
User Prompt: "{{prompt}}"

Workflow Structure:
The workflow consists of 'nodes' and 'connections'.
- Each 'node' represents a distinct step (trigger, action, logic).
- Each 'connection' defines the data flow between nodes.

Node Requirements: For each node, you MUST provide:
- 'id': A unique, snake_case string identifier.
- 'type': The most appropriate node type. Examples: 'httpRequest', 'parseJson', 'aiTask', 'sendEmail', 'databaseQuery', 'dataTransform', 'conditionalLogic'. If the user mentions "code" or "script", try to map it to a 'dataTransform' node with a suitable 'transformType' if possible.
- 'name': A short, descriptive name for this node instance.
- 'description': (Optional) A brief sentence explaining this node's purpose.
- 'position': An object with 'x' and 'y' coordinates for visual layout.
- 'config': A JSON object for node-specific parameters.
    - Populate fields relevant to the node's 'type' and its 'configSchema'.
    - Data Flow: Use placeholders like '{{source_node_id.output_handle_name.optional_property}}' within config values to reference outputs from preceding nodes.
    - Credential Handling: For nodes requiring credentials (e.g., API keys, tokens, DB connections, Email server settings), PREFER using placeholders like \`{{env.YOUR_DESCRIPTIVE_VARIABLE_NAME}}\` (e.g., \`{{env.GOOGLE_API_KEY}}\`, \`{{env.DB_CONNECTION_STRING}}\`, \`{{env.EMAIL_HOST}}\`). Clearly state this requirement and the specific environment variable placeholder used in the 'aiExplanation'.
    - Conditional Execution: If a node should only run if a certain condition is met, add a '_flow_run_condition' field to its 'config', like '_flow_run_condition: "{{id_of_conditional_node.result}}"'.
    - Specific Node Config Examples:
        - 'sendEmail': 'to', 'subject', 'body'. The system expects EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, EMAIL_SECURE (true/false) as env vars for Nodemailer.
        - 'databaseQuery': 'queryText' (SQL with $1, $2... for parameters) and 'queryParams' (a JSON array of values/placeholders for $1, $2...). The system expects DB_CONNECTION_STRING (e.g. 'postgresql://user:pass@host:port/db') as an env var. Example: config: { "queryText": "SELECT name FROM users WHERE id = $1 AND active = $2", "queryParams": ["{{trigger.userId}}", true] }
        - 'dataTransform': Must include 'transformType'.
            - 'toUpperCase': Needs 'inputString'. Config: { "transformType": "toUpperCase", "inputString": "{{some_node.text_output}}" }
            - 'toLowerCase': Needs 'inputString'. Config: { "transformType": "toLowerCase", "inputString": "{{some_node.text_output}}" }
            - 'extractFields': Needs 'inputObject' and 'fieldsToExtract' (JSON array of *top-level* field names, e.g., ["userId", "status"], NOT "user.id"). Config: { "transformType": "extractFields", "inputObject": "{{api_node.response}}", "fieldsToExtract": ["name", "orderTotal"] }
            - 'concatenateStrings': Needs 'stringsToConcatenate' (JSON array of strings/placeholders) and optionally 'separator'. Config: { "transformType": "concatenateStrings", "stringsToConcatenate": ["User: ", "{{user_node.name}}", " - Status: ", "{{status_node.result}}"], "separator": "" } (empty separator for direct join)
- 'aiExplanation': Your detailed explanation for this node: why chosen, config details (data flow, env vars, conditions, specific params for complex nodes), assumptions, role.

Connection Requirements: For each connection:
- 'sourceNodeId', 'targetNodeId'.
- 'sourcePort', 'targetPort': (Recommended) Specify output/input handles (e.g., 'response', 'output_data', 'input_data').

Key Instructions:
1.  Completeness: Translate ALL logical steps into nodes.
2.  Connectivity: Form a coherent data flow.
3.  Data Flow: Use placeholders for inter-node data.
4.  Conditional Paths: Use 'conditionalLogic' nodes and '_flow_run_condition'.
5.  Node Type Selection: Be specific. If "script" or "code" is requested, attempt to use a 'dataTransform' type or 'aiTask' if appropriate.
6.  Configuration: Provide sensible defaults/placeholders. Crucially, use \`{{env.VARIABLE_NAME}}\` for credentials/sensitive configs and note these in \`aiExplanation\`. Ensure configuration for implemented nodes like 'sendEmail', 'databaseQuery', 'dataTransform' matches their requirements.
7.  Production Focus: Aim for robust, sensible workflows.

Output Format:
The output MUST be a single, valid JSON object that strictly conforms to the Zod schema detailed below.

Schema Description:
${GenerateWorkflowFromPromptOutputSchema.description}
Nodes Schema: ${WorkflowNodeSchema.description}
Connections Schema: ${WorkflowConnectionSchema.description}

Analyze the user's request carefully and construct the complete workflow. Be meticulous about node types, configurations (with data flow placeholders, credential placeholders using \`{{env.VARIABLE_NAME}}\` where possible, and conditional execution fields), and connections (with port/handle names where appropriate).
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
    if (!output) {
        throw new Error("AI failed to generate a workflow. Output was null.");
    }
    if (output.nodes.length === 0 && input.prompt.trim() !== "") {
        console.warn("AI generated an empty workflow for a non-empty prompt.");
    }
    return output;
  }
);

