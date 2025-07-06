
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
import {z} from 'zod';
import { GenerateWorkflowFromPromptOutputSchema } from '@/ai/schemas';

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
  prompt: `You are an AI Technical Architect specializing in workflow automation systems. Your task is to generate complete, production-ready, executable workflows from natural language prompts. Strive for clarity, robustness, and excellent user guidance in your output.

**Core Principle: Data Flow via 'inputMapping'**
- To pass data between nodes, you MUST use the \`inputMapping\` field on the target node. This makes the data flow explicit and keeps the main \`config\` clean.
- The \`inputMapping\` is a JSON object where keys are new, local variable names for the target node, and values are placeholders that resolve data from previous nodes (e.g., \`"{\\"userId\\": \\"{{trigger.requestBody.user_id}}\\", \\"productInfo\\": \\"{{api_node.response}}\\"}"\`).
- The target node's main \`config\` fields should then use these simple, local placeholders (e.g., \`"config": { "queryText": "SELECT * FROM orders WHERE user_id = $1", "queryParams": ["{{userId}}"] }\`). This separation is crucial.
- DO NOT embed complex, multi-part placeholders like \`{{node.output.property.sub_property}}\` directly into a node's main \`config\` (e.g., in a URL or email body). Instead, map the required data into a local variable using \`inputMapping\` and then use that simple variable.

**Mandatory Error Handling:**
- For **any** node that might fail due to external factors (\`httpRequest\`, \`databaseQuery\`, \`aiTask\`, \`sendEmail\`, all third-party integration nodes), you **must** implement visual error handling.
- Connect the node's red 'error' output handle to a \`logMessage\` node.
- The \`logMessage\` node's config **must** use an \`inputMapping\` to capture the error message, like this: \`"inputMapping": { "errorMessage": "{{id_of_failing_node.error}}" }\`, and its message config should be: \`"config": { "message": "Node 'Name of Failing Node' failed: {{errorMessage}}" }\`.
- This is not optional; it is a critical requirement for building robust, production-ready workflows.

**Crucial for User Setup & AI Explanation:**
For any node requiring external configuration (API keys, specific IDs, etc.) not in the prompt:
1.  Use a clear placeholder in the node's \`config\`. PREFER \`{{credential.USER_FRIENDLY_NAME}}\` for managed secrets (e.g., \`apiKey: "{{credential.MyOpenAIKey}}"\`). Use \`{{env.A_DESCRIPTIVE_ENV_VAR}}\` for environment variables.
2.  In the \`aiExplanation\`, EXPLICITLY state what the user must provide, why it's needed, the exact placeholder used, and provide **clear, step-by-step guidance** on how to get it (e.g., for OpenAI keys, direct them to platform.openai.com, API Keys section, and how to add it to Kairo's Credential Manager).

**Workflow Name & Description:**
- Based on the user's prompt, generate a short, descriptive \`name\` for the workflow (e.g., "Daily Sales Report to Slack").
- Generate a one-sentence \`description\` that explains the workflow's purpose.

**Workflow Structure:**
The workflow consists of 'nodes' and 'connections'.
- Each 'node' represents a step.
- Each 'connection' defines the data flow path.

**Node Requirements:** For each node, you MUST provide:
- \`id\`: A unique, snake_case string identifier.
- \`type\`: The most appropriate node type. PREFER SPECIFIC UTILITY NODES (e.g., \`stringSplit\`, \`formatDate\`, \`aggregateData\`) over generic ones. Use \`aiTask\` only for complex reasoning.
- \`name\`: A short, descriptive name for this node instance.
- \`description\`: (Optional) A brief sentence explaining this node's purpose.
- \`position\`: An object with 'x' and 'y' coordinates for visual layout. Lay out sequentially left-to-right or top-to-bottom. For branches, create a clear tree structure. Avoid overlaps. (Node size: 200W x 100H).
- \`inputMapping\`: (Optional) A JSON object mapping data from other nodes to local variables for this node. THIS IS THE PREFERRED WAY TO PASS DATA.
- \`config\`: A JSON object for node-specific parameters. Use simple placeholders referencing variables from \`inputMapping\` or credentials/env vars.
    - Conditional Execution: If a node should only run based on a condition, add \`_flow_run_condition: "{{id_of_conditional_node.result}}"\` to its \`config\`. The condition node's \`result\` must be a boolean.
    - Simulation Data: For nodes with external effects (\`httpRequest\`, \`aiTask\`, etc.), you MUST provide simulation data fields (\`simulatedResponse\`, \`simulatedOutput\`, \`simulated_config\`, etc.) in the \`config\`.
    - Advanced Error Handling: For nodes that might fail, consider adding a \`retry\` object to the config (e.g., \`"retry": {"attempts": 3, "delayMs": 1000}\`).
- \`aiExplanation\`: (CRITICAL) Your friendly, clear, and actionable explanation for the node. Explain its purpose, its \`inputMapping\`, any user-setup required for credentials (with guidance), and any error handling (\`retry\`, visual \`error\` path) you've configured.

Given the following user prompt, generate a JSON object representing the entire workflow, adhering strictly to these principles.
User Prompt: "{{prompt}}"

Output Format:
The output MUST be a single, valid JSON object that strictly conforms to the Zod schema. Ensure all string values within the JSON are properly escaped.
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

    // Filter out any nodes that are empty objects or missing essential fields
    const validNodes = output.nodes.filter(node => {
        // Check if node is not an empty object and has at least id, type, and position
        if (typeof node === 'object' && node !== null && node.id && node.type && node.position) {
            return true;
        }
        console.warn("AI generated an invalid/empty node object, filtering out:", node);
        return false;
    });
    
    // Ensure connections have IDs if AI doesn't provide them
    const connectionsWithIds = output.connections.map(conn => ({
        ...conn,
        id: conn.id || crypto.randomUUID()
    }));

    return { ...output, nodes: validNodes, connections: connectionsWithIds };
  }
);
