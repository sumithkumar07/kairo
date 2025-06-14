
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
import type { RetryConfig, BranchConfig } from '@/types/workflow'; // Import RetryConfig type

// Define the schema for a node in the workflow.
const WorkflowNodeSchema = z.object({
  id: z.string().describe('Unique identifier for the node (e.g., "node_1", "fetch_data_api"). Use snake_case.'),
  type: z.string().describe('Type of the node (e.g., httpRequest, parseJson, aiTask, sendEmail, databaseQuery, dataTransform, conditionalLogic, executeFlowGroup, forEach, whileLoop, parallel). Choose the most appropriate type. Refer to available node types and their specific config requirements.'),
  name: z.string().optional().describe('A descriptive name for the node instance (e.g., "Fetch User Profile", "Summarize Article"). Keep it concise.'),
  description: z.string().optional().describe('A brief description of what this specific node instance does or its purpose in the workflow.'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).describe('The X, Y coordinates of the node in the visual editor. Nodes should be laid out logically, e.g., left-to-right or top-to-bottom flow. Stagger nodes if they are in sequence.'),
  config: z.any().describe("Configuration parameters for the node. This should be a valid JSON object. Populate relevant fields based on the node's 'type' and its corresponding 'configSchema'. Examples:\n- 'httpRequest': include 'url', 'method'. Node output includes 'status_code', 'response', and on error: 'status: \"error\"', 'error_message'.\n- 'aiTask': include 'prompt', 'model'. Node output includes 'output', and on error: 'status: \"error\"', 'error_message'.\n- 'sendEmail': include 'to', 'subject', 'body'. Expect EMAIL_* env vars for server settings. Node output includes 'messageId', and on error: 'status: \"error\"', 'error_message'.\n- 'databaseQuery': include 'queryText' (SQL with $1, $2 placeholders) and 'queryParams' (JSON array of values). Expect DB_CONNECTION_STRING env var. Node output includes 'results', 'rowCount', and on error: 'status: \"error\"', 'error_message'.\n- 'conditionalLogic': 'condition' string (e.g., '{{data.value}} == \"success\"', '{{data.count}} > 10', '{{prev_node.status}} == \"error\"'). Outputs a boolean 'result'.\n- 'dataTransform': include 'transformType' and specific params. See dataTransform types below. Node output is 'output_data', and on error: 'status: \"error\"', 'error_message'.\n- 'executeFlowGroup': includes 'flowGroupNodes' (array of node definitions), 'flowGroupConnections' (array of connection definitions), 'inputMapping' (object to map parent scope data to group scope, e.g., {\"internalVarName\": \"{{parent_node.output}}\"}), and 'outputMapping' (object to map group scope data to parent output, e.g., {\"finalResult\": \"{{group_node.data}}\"}).\n- 'forEach': includes 'inputArrayPath' (placeholder for the array, e.g., '{{api_node.users}}'), 'iterationNodes' (array of node definitions for the sub-flow), 'iterationConnections' (array of connections for the sub-flow), and optionally 'iterationResultSource' (placeholder like '{{last_sub_node.output}}' to specify what to collect from each iteration). Inside 'iterationNodes' config, use '{{item.property}}' to access properties of the current item being looped over. Output: 'results' (array of iteration results), 'status', 'error_message'.\n- 'whileLoop': includes 'condition' (string placeholder, e.g., '{{api_node.response.hasNextPage}} === true', '{{counter.value}} < 5'), 'loopNodes' (array of node definitions for the sub-flow), 'loopConnections' (array of connections for the sub-flow), and 'maxIterations' (optional number, default 100). The condition is evaluated *before* each iteration. Nodes within 'loopNodes' should eventually modify data that the 'condition' depends on. Output: 'iterations_completed', 'status', 'error_message'.\n- 'parallel': includes 'branches' (JSON array of branch definitions). Each branch definition is an object: { 'id': 'branch_unique_id', 'name': 'Optional Name', 'nodes': [...], 'connections': [...], 'inputMapping': {optional}, 'outputSource': 'optional_placeholder_from_branch_scope' }. Output: 'results' (object keyed by branch IDs, values are {status, value/reason}), 'status', 'error_message'.\n- Use placeholders like '{{previous_node_id.output_handle_name.property}}' to reference outputs. For credentials, PREFER '{{env.YOUR_VARIABLE_NAME}}' and mention this in aiExplanation. For conditional execution, include a '_flow_run_condition' field with a placeholder pointing to a boolean output, e.g., '{{conditional_node.result}}' (which MUST be a boolean).\n- Retry Configuration: For nodes like 'httpRequest', 'aiTask', 'sendEmail', 'databaseQuery', 'dataTransform', 'executeFlowGroup', 'forEach', 'whileLoop', and 'parallel', you can add an optional 'retry' object to their 'config'. Example: config: { ..., \"retry\": { \"attempts\": 3, \"delayMs\": 1000, \"backoffFactor\": 2, \"retryOnStatusCodes\": [500, 503, 429], \"retryOnErrorKeywords\": [\"timeout\", \"service unavailable\"] } }. 'attempts' is total tries. 'delayMs' is initial delay. 'backoffFactor' for exponential delay. 'retryOnStatusCodes' for HTTP errors. 'retryOnErrorKeywords' for specific error messages (case-insensitive). All fields in 'retry' are optional."),
  aiExplanation: z.string().optional().describe("AI-generated explanation for this node: why it was chosen, its configuration (especially data flow placeholders, credential placeholders like '{{env.YOUR_VARIABLE_NAME}}' to be set by user, conditional execution fields using '_flow_run_condition: \"{{id_of_conditional_node.result}}\"' which expects a boolean, specific config for sendEmail/databaseQuery/dataTransform/executeFlowGroup/forEach/whileLoop/parallel like parameters for $1,$2, transformType, group mappings/nodes, loop configurations including '{{item.property}}' usage for forEach, condition/maxIterations for whileLoop, branch definitions for parallel, and any 'retry' configuration if applicable), assumptions made, and its role. Explain if error handling is considered (e.g., checking '{{prev_node.status}} == \"error\"')."),
});

// Define the schema for a workflow connection (an edge in the graph). Describes how nodes are connected.
const WorkflowConnectionSchema = z.object({
  sourceNodeId: z.string().describe('ID of the source node.'),
  sourcePort: z.string().optional().describe("The specific output port/handle on the source node to connect from (e.g., 'response', 'videos', 'result', 'output_data', 'status', 'error_message', 'results', 'iterations_completed'). Refer to the source node type's 'outputHandles' definition. Nodes that can fail (httpRequest, aiTask, databaseQuery, dataTransform, sendEmail, executeFlowGroup, forEach, whileLoop, parallel) will output a 'status' (e.g., 'success', 'error') and 'error_message' field if an error occurs."),
  targetNodeId: z.string().describe('ID of the target node.'),
  targetPort: z.string().optional().describe("The specific input port/handle on the target node to connect to (e.g., 'input', 'jsonData', 'input_data', 'input_array_data'). Refer to the target node type's 'inputHandles' definition."),
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
- Each 'node' represents a distinct step (trigger, action, logic, group, iteration, control).
- Each 'connection' defines the data flow between nodes.

Node Requirements: For each node, you MUST provide:
- 'id': A unique, snake_case string identifier. Node IDs within an 'executeFlowGroup', 'forEach', 'whileLoop', or 'parallel' branch's sub-flow nodes should be unique within that sub-flow.
- 'type': The most appropriate node type. Examples: 'httpRequest', 'parseJson', 'aiTask', 'sendEmail', 'databaseQuery', 'dataTransform', 'conditionalLogic', 'executeFlowGroup', 'forEach', 'whileLoop', 'parallel'. If the user mentions "code" or "script", try to map it to a 'dataTransform' node with a suitable 'transformType' if possible, otherwise use 'aiTask'. For encapsulating a sequence of steps, use 'executeFlowGroup'. For iterating over a list, use 'forEach'. For conditional looping, use 'whileLoop'. For concurrent execution of multiple independent task sequences, use 'parallel'.
- 'name': A short, descriptive name for this node instance.
- 'description': (Optional) A brief sentence explaining this node's purpose.
- 'position': An object with 'x' and 'y' coordinates for visual layout.
- 'config': A JSON object for node-specific parameters.
    - Populate fields relevant to the node's 'type' and its 'configSchema'.
    - Data Flow: Use placeholders like '{{source_node_id.output_handle_name.optional_property}}' within config values to reference outputs from preceding nodes. For 'forEach' iteration nodes, use '{{item.property_name}}' to access properties of the current item being iterated over. For 'whileLoop' iteration nodes, the 'condition' and internal nodes will resolve placeholders against the main workflow data, which can be modified by the loop's internal nodes. For 'parallel' branch nodes, 'inputMapping' can be used to bring parent data into the branch's scope, and 'outputSource' can specify what part of the branch's execution data is its primary output.
    - Credential Handling: For nodes requiring credentials (e.g., API keys, tokens, DB connections, Email server settings), PREFER using placeholders like '{{env.YOUR_DESCRIPTIVE_VARIABLE_NAME}}' (e.g., '{{env.GOOGLE_API_KEY}}', '{{env.DB_CONNECTION_STRING}}', '{{env.EMAIL_HOST}}'). Clearly state this requirement and the specific environment variable placeholder used in the 'aiExplanation'.
    - Conditional Execution: If a node should only run if a certain condition (typically from a 'conditionalLogic' node) is met, add a '_flow_run_condition' field to its 'config', like '_flow_run_condition: "{{id_of_conditional_node.result}}"'. The 'result' from 'conditionalLogic' is a boolean.
    - Retry Configuration (Optional): For nodes that might fail due to transient issues (e.g., 'httpRequest', 'aiTask', 'sendEmail', 'databaseQuery', 'dataTransform', 'executeFlowGroup', 'forEach', 'whileLoop', 'parallel'), you can add a 'retry' object to their 'config'. Example: "retry": { "attempts": 3, "delayMs": 1000, "backoffFactor": 2, "retryOnStatusCodes": [500, 503, 429], "retryOnErrorKeywords": ["timeout", "unavailable"] }. All fields within 'retry' are optional. 'attempts' is the total number of execution attempts. 'delayMs' is the initial delay for the first retry. 'backoffFactor' multiplies the delay for subsequent retries (e.g., 2 for exponential). 'retryOnStatusCodes' applies to HTTP nodes and lists status codes that should trigger a retry. 'retryOnErrorKeywords' lists case-insensitive keywords; if an error message contains any of these, a retry is attempted. If retry conditions (status code, keywords) are specified and not met by an error, the node won't retry even if attempts remain.
    - Specific Node Config Examples:
        - 'sendEmail': 'to', 'subject', 'body'. The system expects EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, EMAIL_SECURE (true/false) as env vars for Nodemailer. Output: 'status', 'messageId', 'error_message'.
        - 'databaseQuery': 'queryText' (SQL with $1, $2... for parameters) and 'queryParams' (a JSON array of values/placeholders for $1, $2...). The system expects DB_CONNECTION_STRING (e.g. 'postgresql://user:pass@host:port/db') as an env var. Example: config: { "queryText": "SELECT name FROM users WHERE id = $1 AND active = $2", "queryParams": ["{{trigger.userId}}", true] }. Output: 'status', 'results', 'rowCount', 'error_message'.
        - 'conditionalLogic': 'condition' (e.g., '{{data.value}} == "success"', '{{data.count}} > 10', '{{prev_node.status}} == "error"', '{{data.is_valid_flag}} === true'). Evaluates various types and operators (==, !=, ===, !==, <, >, <=, >=). Outputs a boolean 'result'.
        - 'dataTransform': Must include 'transformType' and specific parameters based on the type:
            - 'toUpperCase': Needs 'inputString'. Config: { "transformType": "toUpperCase", "inputString": "{{some_node.text_output}}" }
            - 'toLowerCase': Needs 'inputString'. Config: { "transformType": "toLowerCase", "inputString": "{{some_node.text_output}}" }
            - 'extractFields': Needs 'inputObject' and 'fieldsToExtract' (JSON array of *top-level* field names, e.g., ["userId", "status"], NOT 'user.id'). Config: { "transformType": "extractFields", "inputObject": "{{api_node.response}}", "fieldsToExtract": ["name", "orderTotal"] }
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
        - 'forEach': For iterating over items in an array. Config must include:
            - 'inputArrayPath': A string placeholder for the array to iterate over (e.g., '{{api_node.response.users}}').
            - 'iterationNodes': A JSON array of valid WorkflowNode objects defining the sub-flow to execute for each item. Node IDs should be unique within this sub-flow. Inside these nodes' configs, use '{{item.propertyName}}' to access properties of the current item being processed.
            - 'iterationConnections': A JSON array of valid WorkflowConnection objects for the 'iterationNodes'.
            - 'iterationResultSource': (Optional) A string placeholder (e.g., '{{last_node_in_subflow.output}}'). This defines what value from each iteration's execution scope is collected. If omitted, the entire output of the last executed node in each iteration is collected.
            The 'forEach' node outputs an object: '{ "results": [...], "status": "success/error", "error_message": "..." }', where 'results' is an array of collected values from each successful iteration.
        - 'whileLoop': For conditional iteration. Config must include:
            - 'condition': A string placeholder (e.g., '{{api_node.response.hasNextPage}} === true', '{{shared_counter.value}} < 5'). This condition is resolved and evaluated to a boolean *before* each iteration.
            - 'loopNodes': A JSON array of valid WorkflowNode objects defining the sub-flow to execute in each iteration.
            - 'loopConnections': A JSON array of valid WorkflowConnection objects for the 'loopNodes'.
            - 'maxIterations': (Optional number, default 100) A safety limit to prevent infinite loops.
            Nodes within 'loopNodes' should affect data that the 'condition' relies on, to eventually terminate the loop. The 'whileLoop' node outputs: '{ "iterations_completed": N, "status": "success/error", "error_message": "..." }'.
        - 'parallel': For concurrent execution of multiple sequences of tasks. Config must include:
            - 'branches': A JSON array of 'branch' definitions. Each 'branch' object must have:
                - 'id': A unique string identifier for this branch (e.g., "process_images", "analyze_text").
                - 'name': (Optional) A descriptive name for the branch.
                - 'nodes': A JSON array of valid WorkflowNode objects for this branch.
                - 'connections': A JSON array of valid WorkflowConnection objects for this branch's nodes.
                - 'inputMapping': (Optional) A JSON object to map parent scope data to this branch's scope (e.g., '{"branchInputData": "{{parent_node.output}}"}').
                - 'outputSource': (Optional) A string placeholder (e.g., '{{last_node_in_branch.result}}') specifying what data from this branch's execution is its primary output. If omitted, the output of the last node in the branch is used.
            The 'parallel' node itself outputs an object: '{ "results": { "branch_id_1": { "status": "fulfilled/rejected", "value": ..., "reason": ... }, ... }, "status": "success/partial_success/error", "error_message": "..." }'.
- 'aiExplanation': Your detailed explanation for this node: why chosen, config details (data flow, env vars, conditions, specific params for complex nodes like 'sendEmail', 'databaseQuery', 'dataTransform', 'conditionalLogic', 'executeFlowGroup', 'forEach' (including '{{item.property}}' usage), 'whileLoop' (including 'condition', 'maxIterations' and how loop state is managed), 'parallel' (including definitions for each 'branch', their 'nodes', 'connections', 'inputMapping', and 'outputSource'), and any 'retry' config), assumptions, role. Crucially, if this node's execution depends on the success/failure of a previous node, or if its own failure might need to be handled, explain how the workflow addresses this using conditional logic and checks on 'status' or 'error_message' outputs. For 'executeFlowGroup', 'forEach', 'whileLoop', or 'parallel' branches, explain the sub-flow definition, mappings, and purpose of the group/loop/branch.

Key Instructions:
1.  Completeness: Translate ALL logical steps into nodes.
2.  Connectivity: Form a coherent data flow.
3.  Data Flow: Use placeholders for inter-node data. For 'executeFlowGroup', 'forEach', 'whileLoop', and 'parallel' branches, use their respective mechanisms for data scoping and access ('inputMapping', 'outputMapping', '{{item.property}}', 'outputSource').
4.  Conditional Paths & Error Handling: Use 'conditionalLogic' nodes (outputting a boolean 'result') and the '_flow_run_condition' config field on subsequent nodes. Design paths to handle potential errors from preceding nodes by checking their 'status' or 'error_message' outputs. Consider using the 'retry' config for nodes prone to transient failures.
5.  Node Type Selection: Be specific. If "script" or "code" is requested, attempt to use a 'dataTransform' type or 'aiTask' if appropriate. For encapsulating steps, use 'executeFlowGroup'. For iterating over lists, use 'forEach'. For conditional looping, use 'whileLoop'. For concurrent tasks, use 'parallel'.
6.  Configuration: Provide sensible defaults/placeholders. Crucially, use '{{env.VARIABLE_NAME}}' for credentials/sensitive configs and note these in 'aiExplanation'. Ensure configuration for implemented nodes like 'sendEmail', 'databaseQuery', 'dataTransform', 'conditionalLogic', 'executeFlowGroup', 'forEach', 'whileLoop', 'parallel' matches their requirements, including sub-flow or branch definitions.
7.  Production Focus: Aim for robust, sensible workflows, including basic error handling considerations and retry mechanisms where appropriate. For 'whileLoop', consider if 'maxIterations' is suitable. For 'parallel', ensure branches are logically independent where possible.

Output Format:
The output MUST be a single, valid JSON object that strictly conforms to the Zod schema detailed below.

Schema Description:
${GenerateWorkflowFromPromptOutputSchema.description}
Nodes Schema: ${WorkflowNodeSchema.description}
Connections Schema: ${WorkflowConnectionSchema.description}

Analyze the user's request carefully and construct the complete workflow. Be meticulous about node types, configurations (with data flow placeholders, credential placeholders using '{{env.VARIABLE_NAME}}' where possible, conditional execution fields, retry configurations, and specific configs for 'executeFlowGroup', 'forEach', 'whileLoop', or 'parallel' including sub-flow/branch definitions, '{{item.property}}' usage for 'forEach', 'condition'/'maxIterations' for 'whileLoop', 'branch' structure for 'parallel'), and connections (with port/handle names where appropriate). Explicitly consider error paths.
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
