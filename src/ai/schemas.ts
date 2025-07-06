/**
 * @fileOverview Defines shared Zod schemas for workflow structures.
 * This file does not use the 'use server' directive, so its contents can be
 * safely imported into both server and client components.
 */

import {z} from 'zod';

// Define the schema for a node in the workflow.
export const WorkflowNodeSchema = z.object({
  id: z.string().describe('Unique identifier for the node (e.g., "node_1", "fetch_data_api"). Use snake_case.'),
  type: z.string().describe('Type of the node (e.g., httpRequest, parseJson, aiTask, sendEmail, databaseQuery, conditionalLogic, executeFlowGroup, forEach, whileLoop, parallel, manualInput, callExternalWorkflow, fileSystemTrigger, googleCalendarListEvents, delay, webhookTrigger, getEnvironmentVariable, googleSheetsAppendRow, slackPostMessage, openAiChatCompletion, stripeCreatePaymentLink, hubspotCreateContact, twilioSendSms, githubCreateIssue, dropboxUploadFile, toUpperCase, toLowerCase, concatenateStrings, stringSplit, formatDate, aggregateData).Choose the most appropriate type. Refer to available node types and their specific config requirements.'),
  name: z.string().optional().describe('A descriptive name for the node instance (e.g., "Fetch User Profile", "Summarize Article"). Keep it concise.'),
  description: z.string().optional().describe('A brief description of what this specific node instance does or its purpose in the workflow.'),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }).describe('The X, Y coordinates of the node in the visual editor. Nodes should be laid out logically. General flow: left-to-right or top-to-bottom. For sequences, stagger nodes slightly (e.g., y = previous.y + NODE_HEIGHT + 40). For conditional branches: place the conditional node, then position the "true" path downwards and to one side (e.g., x = conditional.x - NODE_WIDTH - 60, y = conditional.y + NODE_HEIGHT + 40) and the "false" path downwards and to the other side (e.g., x = conditional.x + NODE_WIDTH + 60, y = conditional.y + NODE_HEIGHT + 40) to create a clear tree-like structure. For parallel nodes, lay out their internal branches distinctly. Avoid overlaps. Start triggers near (50,50). A typical node is 200px wide (NODE_WIDTH) and 100px high (NODE_HEIGHT).'),
  inputMapping: z.any().optional().describe("A JSON object that explicitly maps data from other nodes to this node's inputs. This is the PREFERRED way to pass data. Keys are local names for this node, and values are placeholders referencing other nodes' outputs (e.g., '{\"userId\": \"{{trigger.body.id}}\", \"productData\": \"{{api_node.response}}\"}'). The core 'config' fields can then use these mapped keys (e.g., 'url: \"https://api.example.com/products/{{productData.id}}\"'). This separates data flow from configuration."),
  config: z.any().describe("Configuration parameters for the node. This should be a valid JSON object. Populate relevant fields based on the node's 'type'. PREFER using 'inputMapping' to bring data into the node, and then use simple placeholders in the config (e.g., '{{mapped_input_name}}'). For values not from other nodes (like static text or credentials), place them directly here. For credentials, PREFER '{{credential.USER_FRIENDLY_NAME_HERE}}' (e.g., '{{credential.MyOpenAIKey}}'), or use descriptive placeholders like '{{env.SERVICE_API_KEY}}'. Explicitly state requirements for user setup in the 'aiExplanation'."),
  aiExplanation: z.string().optional().describe("CRITICAL FOR USER GUIDANCE: Your detailed explanation for this node *must be friendly, clear, and highly actionable*. Explain why the node was chosen. If this node has an 'inputMapping', explain what data it receives. If it requires any external configuration (API keys, specific IDs, server addresses, etc.), ensure a clear placeholder for this configuration exists (in 'config' or 'inputMapping'), EXPLICITLY state what information the user needs to provide, why it's needed, the placeholder used, AND PROVIDE *simple, step-by-step instructions* OR VERY SPECIFIC HINTS on where/how to find it (e.g., 'For `{{credential.MyOpenAIKey}}`, go to platform.openai.com, log in, navigate to API Keys, and generate a new secret key. Add it in Kairo's Credential Manager under the name `MyOpenAIKey`.'). Also explain any 'retry' or visual 'error' path configurations you added for robustness."),
});


// Define the schema for a workflow connection (an edge in the graph). Describes how nodes are connected.
export const WorkflowConnectionSchema = z.object({
  id: z.string().optional().describe('Unique identifier for the connection (e.g., "conn_1"). If not provided, one will be generated.'),
  sourceNodeId: z.string().describe('ID of the source node.'),
  sourcePort: z.string().optional().describe("The specific output port/handle on the source node to connect from. For successful data flow, use handles like `response`, `output`, `results`, etc. For error handling, connect from the special `error` handle to an error-processing node (like `logMessage`). Refer to the source node type's 'outputHandles' definition for available handles."),
  targetNodeId: z.string().describe('ID of the target node.'),
  targetPort: z.string().optional().describe("The specific input port/handle on the target node to connect to (e.g., 'input', 'jsonData', 'input_data', 'input_array_data'). Refer to the target node type's 'inputHandles' definition."),
});

// Define the overall workflow schema, containing nodes and connections.
export const GenerateWorkflowFromPromptOutputSchema = z.object({
  nodes: z.array(WorkflowNodeSchema).describe('List of all workflow nodes required to fulfill the user\'s request. Ensure all steps from the prompt are covered.'),
  connections: z.array(WorkflowConnectionSchema).describe('List of all connections between nodes, ensuring a complete data flow from triggers to final actions. Ensure sourcePort and targetPort are specified where applicable and match defined node handles.'),
});
