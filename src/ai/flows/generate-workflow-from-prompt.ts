
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
  type: z.string().describe('Type of the node (e.g., httpRequest, parseJson, aiTask, sendEmail, databaseQuery, dataTransform, conditionalLogic, executeFlowGroup). Choose the most appropriate type. Refer to available node types and their specific config requirements.'),
  name: z.string().optional().describe('A descriptive name for the node instance (e.g., "Fetch User Profile", "Summarize Article"). Keep it concise.'),
  description: z.string().optional().describe('A brief description of what this specific node instance does or its purpose in the workflow.'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).describe('The X, Y coordinates of the node in the visual editor. Nodes should be laid out logically, e.g., left-to-right or top-to-bottom flow. Stagger nodes if they are in sequence.'),
  config: z.any().describe("Configuration parameters for the node. This should be a valid JSON object. Populate relevant fields based on the node's 'type' and its corresponding 'configSchema'. Examples:\n- 'httpRequest': include 'url', 'method'. Node output includes 'status_code', 'response', and on error: 'status: \"error\"', 'error_message'.\n- 'aiTask': include 'prompt', 'model'. Node output includes 'output', and on error: 'status: \"error\"', 'error_message'.\n- 'sendEmail': include 'to', 'subject', 'body'. Expect EMAIL_* env vars for server settings. Node output includes 'messageId', and on error: 'status: \"error\"', 'error_message'.\n- 'databaseQuery': include 'queryText' (SQL with $1, $2 placeholders) and 'queryParams' (JSON array of values). Expect DB_CONNECTION_STRING env var. Node output includes 'results', 'rowCount', and on error: 'status: \"error\"', 'error_message'.\n- 'conditionalLogic': 'condition' string (e.g., '{{data.value}} == \"success\"', '{{data.count}} > 10', '{{prev_node.status}} == \"error\"'). Outputs a boolean 'result'.\n- 'dataTransform': include 'transformType' and specific params. See dataTransform types below. Node output is 'output_data', and on error: 'status: \"error\"', 'error_message'.\n- 'executeFlowGroup': includes 'flowGroupNodes' (array of node definitions), 'flowGroupConnections' (array of connection definitions), 'inputMapping' (object to map parent scope data to group scope, e.g., {\"internalVarName\": \"{{parent_node.output}}\"}), and 'outputMapping' (object to map group scope data to parent output, e.g., {\"finalResult\": \"{{group_node.data}}\"}).\n- Use placeholders like '{{previous_node_id.output_handle_name.property}}' to reference outputs. For credentials, PREFER '{{env.YOUR_VARIABLE_NAME}}' and mention this in aiExplanation. For conditional execution, include a '_flow_run_condition' field with a placeholder pointing to a boolean output, e.g., '{{conditional_node.result}}' (which MUST be a boolean)."),
  aiExplanation: z.string().optional().describe("AI-generated explanation for this node: why it was chosen, its configuration (especially data flow placeholders, credential placeholders like '{{env.YOUR_VARIABLE_NAME}}' to be set by user, conditional execution fields using '_flow_run_condition: \"{{id_of_conditional_node.result}}\"' which expects a boolean, and specific config for sendEmail/databaseQuery/dataTransform/executeFlowGroup like parameters for $1,$2, transformType, or group mappings/nodes), assumptions made, and its role. Explain if error handling is considered (e.g., checking '{{prev_node.status}} == \"error\"')."),
});

// Define the schema for a workflow connection (an edge in the graph). Describes how nodes are connected.
const WorkflowConnectionSchema = z.object({
  sourceNodeId: z.string().describe('ID of the source node.'),
  sourcePort: z.string().optional().describe("The specific output port/handle on the source node to connect from (e.g., 'response', 'videos', 'result', 'output_data', 'status', 'error_message'). Refer to the source node type's 'outputHandles' definition. Nodes that can fail (httpRequest, aiTask, databaseQuery, dataTransform, sendEmail) will output a 'status' (e.g., 'success', 'error') and 'error_message' field if an error occurs."),
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
The workflow execution engine will attempt to continue to the next node even if a prior node encounters an error. The failed node's output will include 'status: "error"' and 'error_message'. You can use 'conditionalLogic' nodes to check these fields (e.g., '{{failed_node.status}} == "error"') to implement error handling paths.

Given the following user prompt, generate a JSON object representing the entire workflow:
User Prompt: "{{prompt}}"

Workflow Structure:
The workflow consists of 'nodes' and 'connections'.
- Each 'node' represents a distinct step (trigger, action, logic, group).
- Each 'connection' defines the data flow between nodes.

Node Requirements: For each node, you MUST provide:
- 'id': A unique, snake_case string identifier. Node IDs within an 'executeFlowGroup' node's 'flowGroupNodes' should be unique within that group.
- 'type': The most appropriate node type. Examples: 'httpRequest', 'parseJson', 'aiTask', 'sendEmail', 'databaseQuery', 'dataTransform', 'conditionalLogic', 'executeFlowGroup'. If the user mentions "code" or "script", try to map it to a 'dataTransform' node with a suitable 'transformType' if possible, otherwise use 'aiTask'. For encapsulating a sequence of steps, use 'executeFlowGroup'.
- 'name': A short, descriptive name for this node instance.
- 'description': (Optional) A brief sentence explaining this node's purpose.
- 'position': An object with 'x' and 'y' coordinates for visual layout.
- 'config': A JSON object for node-specific parameters.
    - Populate fields relevant to the node's 'type' and its 'configSchema'.
    - Data Flow: Use placeholders like '{{source_node_id.output_handle_name.optional_property}}' within config values to reference outputs from preceding nodes.
    - Credential Handling: For nodes requiring credentials (e.g., API keys, tokens, DB connections, Email server settings), PREFER using placeholders like '{{env.YOUR_DESCRIPTIVE_VARIABLE_NAME}}' (e.g., '{{env.GOOGLE_API_KEY}}', '{{env.DB_CONNECTION_STRING}}', '{{env.EMAIL_HOST}}'). Clearly state this requirement and the specific environment variable placeholder used in the 'aiExplanation'.
    - Conditional Execution: If a node should only run if a certain condition (typically from a 'conditionalLogic' node) is met, add a '_flow_run_condition' field to its 'config', like '_flow_run_condition: "{{id_of_conditional_node.result}}"'. The 'result' from 'conditionalLogic' is a boolean.
    - Specific Node Config Examples:
        - 'sendEmail': 'to', 'subject', 'body'. The system expects EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, EMAIL_SECURE (true/false) as env vars for Nodemailer. Output: 'status', 'messageId', 'error_message'.
        - 'databaseQuery': 'queryText' (SQL with $1, $2... for parameters) and 'queryParams' (a JSON array of values/placeholders for $1, $2...). The system expects DB_CONNECTION_STRING (e.g. 'postgresql://user:pass@host:port/db') as an env var. Example: config: { "queryText": "SELECT name FROM users WHERE id = $1 AND active = $2", "queryParams": ["{{trigger.userId}}", true] }. Output: 'status', 'results', 'rowCount', 'error_message'.
        - 'conditionalLogic': 'condition' (e.g., '{{data.value}} == "success"', '{{data.count}} > 10', '{{prev_node.status}} == "error"', '{{data.is_valid_flag}} === true'). Evaluates various types and operators (==, !=, ===, !==, <, >, <=, >=). Outputs a boolean 'result'.
        - 'dataTransform': Must include 'transformType' and specific parameters based on the type:
            - 'toUpperCase': Needs 'inputString'. Config: { "transformType": "toUpperCase", "inputString": "{{some_node.text_output}}" }
            - 'toLowerCase': Needs 'inputString'. Config: { "transformType": "toLowerCase", "inputString": "{{some_node.text_output}}" }
            - 'extractFields': Needs 'inputObject' and 'fieldsToExtract' (JSON array of *top-level* field names, e.g., ["userId", "status"], NOT "user.id"). Config: { "transformType": "extractFields", "inputObject": "{{api_node.response}}", "fieldsToExtract": ["name", "orderTotal"] }
            - 'concatenateStrings': Needs 'stringsToConcatenate' (JSON array of strings/placeholders) and optionally 'separator'. Config: { "transformType": "concatenateStrings", "stringsToConcatenate": ["User: ", "{{user_node.name}}", " - Status: ", "{{status_node.result}}"], "separator": "" }
            - 'stringSplit': Needs 'inputString' and 'delimiter'. Config: { "transformType": "stringSplit", "inputString": "{{csv_line.data}}", "delimiter": "," }. Outputs an object: '{ "array": [...] }'.
            - 'arrayLength': Needs 'inputArray'. Config: { "transformType": "arrayLength", "inputArray": "{{split_node.array}}" }. Outputs an object: '{ "length": 5 }'.
            - 'getItemAtIndex': Needs 'inputArray' and 'index' (number). Config: { "transformType": "getItemAtIndex", "inputArray": "{{user_list.users}}", "index": 0 }. Outputs an object: '{ "item": ... }'.
            - 'getObjectProperty': Needs 'inputObject' and 'propertyName' (string). Config: { "transformType": "getObjectProperty", "inputObject": "{{user_data.details}}", "propertyName": "email" }. Outputs an object: '{ "propertyValue": ... }'.
            All 'dataTransform' nodes output under 'output_data'. On error, they also provide 'status: "error"' and 'error_message'.
        - 'executeFlowGroup': For encapsulating a sequence of steps. Config must include:
            - 'flowGroupNodes': A JSON array of valid WorkflowNode objects that define the sub-flow. Node IDs within this group should be unique within the group.
            - 'flowGroupConnections': A JSON array of valid WorkflowConnection objects for the sub-flow nodes.
            - 'inputMapping': A JSON object. Keys are names for data items *inside* the group. Values are placeholders referencing data from the *parent* scope (e.g., '{"internalUserId": "{{trigger_node.userId}}", "productInfo": "{{product_fetch_node.response}}"}').
            - 'outputMapping': A JSON object. Keys are names for outputs of this 'executeFlowGroup' node *itself*. Values are placeholders referencing data from *within* the group's scope (e.g., '{"processedOrder": "{{group_process_node.final_order_data}}", "summaryText": "{{group_summary_node.text_output}}"}').
            The 'executeFlowGroup' node itself outputs an object where keys are defined by 'outputMapping'. On error during group execution, it provides 'status: "error"' and 'error_message'.
- 'aiExplanation': Your detailed explanation for this node: why chosen, config details (data flow, env vars, conditions, specific params for complex nodes like 'sendEmail', 'databaseQuery', 'dataTransform', 'conditionalLogic', 'executeFlowGroup'), assumptions, role. Crucially, if this node's execution depends on the success/failure of a previous node, or if its own failure might need to be handled, explain how the workflow addresses this using conditional logic and checks on 'status' or 'error_message' outputs. For 'executeFlowGroup', explain the input/output mappings and the purpose of the group.

Key Instructions:
1.  Completeness: Translate ALL logical steps into nodes.
2.  Connectivity: Form a coherent data flow.
3.  Data Flow: Use placeholders for inter-node data. For 'executeFlowGroup', use 'inputMapping' and 'outputMapping' for data scoping.
4.  Conditional Paths & Error Handling: Use 'conditionalLogic' nodes (outputting a boolean 'result') and the '_flow_run_condition' config field on subsequent nodes. Design paths to handle potential errors from preceding nodes by checking their 'status' or 'error_message' outputs.
5.  Node Type Selection: Be specific. If "script" or "code" is requested, attempt to use a 'dataTransform' type or 'aiTask' if appropriate. For encapsulating steps, use 'executeFlowGroup'.
6.  Configuration: Provide sensible defaults/placeholders. Crucially, use '{{env.VARIABLE_NAME}}' for credentials/sensitive configs and note these in 'aiExplanation'. Ensure configuration for implemented nodes like 'sendEmail', 'databaseQuery', 'dataTransform', 'conditionalLogic', 'executeFlowGroup' matches their requirements.
7.  Production Focus: Aim for robust, sensible workflows, including basic error handling considerations.

Output Format:
The output MUST be a single, valid JSON object that strictly conforms to the Zod schema detailed below.

Schema Description:
${GenerateWorkflowFromPromptOutputSchema.description}
Nodes Schema: ${WorkflowNodeSchema.description}
Connections Schema: ${WorkflowConnectionSchema.description}

Analyze the user's request carefully and construct the complete workflow. Be meticulous about node types, configurations (with data flow placeholders, credential placeholders using '{{env.VARIABLE_NAME}}' where possible, and conditional execution fields), and connections (with port/handle names where appropriate). Explicitly consider error paths. For 'executeFlowGroup', ensure 'flowGroupNodes', 'flowGroupConnections', 'inputMapping', and 'outputMapping' are well-defined.
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

