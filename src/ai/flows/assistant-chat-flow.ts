
'use server';
/**
 * @fileOverview An AI flow to handle conversational chat with the Kairo assistant.
 * It can also identify if a user's message is a request to generate a workflow,
 * or analyze the current workflow for issues.
 *
 * - assistantChat - A function that takes a user's message and returns an AI response.
 * - AssistantChatInput - The input type for the assistantChat function.
 * - AssistantChatOutput - The return type for the assistantChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Minimal Schemas for workflow context analysis by the chat AI
const MinimalWorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  config: z.any().optional().describe("Node's configuration object. The AI should infer common required fields based on node type (e.g., 'url' for 'httpRequest', 'prompt' for 'aiTask')."),
  inputHandles: z.array(z.string()).optional().describe("List of input handle names."),
  outputHandles: z.array(z.string()).optional().describe("List of output handle names."),
  aiExplanation: z.string().optional().describe("AI-generated explanation for this node, if available."),
});

const MinimalWorkflowConnectionSchema = z.object({
  sourceNodeId: z.string(),
  sourceHandle: z.string().optional(),
  targetNodeId: z.string(),
  targetHandle: z.string().optional(),
});


const AssistantChatInputSchema = z.object({
  userMessage: z.string().describe("The user's message in the chat."),
  workflowContext: z.string().optional().describe("Optional context about the current workflow, like selected node or overall goal. This helps the AI provide more relevant answers."),
  chatHistory: z.array(z.object({
    sender: z.enum(['user', 'ai']),
    message: z.string(),
  })).optional().describe("Previous messages in the conversation to maintain context."),
  currentWorkflowNodes: z.array(MinimalWorkflowNodeSchema).optional().describe("The current list of nodes on the workflow canvas. Used for analysis if the user asks for help with their workflow."),
  currentWorkflowConnections: z.array(MinimalWorkflowConnectionSchema).optional().describe("The current list of connections on the workflow canvas. Used for analysis."),
});
export type AssistantChatInput = z.infer<typeof AssistantChatInputSchema>;

const AssistantChatOutputSchema = z.object({
  aiResponse: z.string().describe("The AI assistant's textual response to the user's message. This could be a general chat response, a confirmation for workflow generation, or an analysis of the current workflow with suggestions/questions."),
  isWorkflowGenerationRequest: z.boolean().optional().describe("True if the AI believes the user's message is a request to generate a new workflow. If true, `workflowGenerationPrompt` should be populated."),
  workflowGenerationPrompt: z.string().optional().describe("If `isWorkflowGenerationRequest` is true, this field contains the extracted or refined prompt that should be used for actual workflow generation by the main generation service."),
});
export type AssistantChatOutput = z.infer<typeof AssistantChatOutputSchema>;

export async function assistantChat(input: AssistantChatInput): Promise<AssistantChatOutput> {
  return assistantChatFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'assistantChatPrompt',
  input: {schema: AssistantChatInputSchema},
  output: {schema: AssistantChatOutputSchema},
  prompt: `You are Kairo, a very friendly, patient, and highly skilled AI assistant for a workflow automation tool.
Your primary goal is to empower the user and make their workflow creation process smoother and more enjoyable.

Your primary roles are:
1.  **Answer questions about Kairo**: How to use it, its features, specific nodes, workflow automation concepts, best practices, troubleshooting.
2.  **Provide suggestions**: Offer brief suggestions or high-level steps for how to approach a problem with Kairo.
3.  **Generate Workflows**: If the user's message is a clear and detailed request to *create* or *generate* a new workflow (e.g., "Generate a workflow that does X, Y, and Z"), then:
    - Set \`isWorkflowGenerationRequest\` to true.
    - Extract or refine the user's request into a clear prompt suitable for a dedicated workflow generation AI. Put this prompt into the \`workflowGenerationPrompt\` field.
    - Your \`aiResponse\` should be an encouraging and clear confirmation, like: 'Certainly! I can start drafting that workflow for you. I\\'ll use this description: "[The prompt you put in workflowGenerationPrompt]". It will appear on the canvas shortly.'
4.  **Analyze & Assist with Current Workflow**: If \`currentWorkflowNodes\` and \`currentWorkflowConnections\` are provided AND the user's message implies they need help with their current workflow (e.g., "Is my workflow okay?", "What's wrong here?", "Fix my workflow", "Help me with this flow"), then:
    - Analyze the provided nodes and connections for common issues.
    - Potential issues to look for:
        - **Connectivity**:
            - Nodes (especially non-trigger types) that have no incoming connections to their required input handles.
            - Nodes with critical output handles (e.g., main data output) that are not connected to anything.
        - **Configuration**:
            - Nodes missing obviously essential configuration based on their type (e.g., an 'httpRequest' node typically needs a 'url'; an 'aiTask' needs a 'prompt'; a 'sendEmail' needs 'to', 'subject', 'body'). Do not validate the *values*, just the presence of common keys if missing.
            - A node with a \`_flow_run_condition\` in its config that seems to point to a non-existent source or a non-boolean value (e.g., \`_flow_run_condition: "{{some_node.text_output}}"\` instead of \`{{some_node.boolean_result}}\`).
        - **Data Flow (Basic Checks)**:
            - A node trying to use a placeholder like \`{{another_node.output}}\` where \`another_node\` does not exist or is not logically expected to provide that output.
    - Formulate your findings in \`aiResponse\`:
        - If you find issues and can suggest a fix: Describe the problem clearly (mention specific node names or IDs) and suggest a specific, actionable solution. For example: "I noticed your 'Fetch Data' (httpRequest) node doesn't have a URL configured. You'll need to add the API endpoint you want to call in its 'url' parameter."
        - If you find issues but need more information from the user: Describe the problem and ask clarifying questions. For example: "The 'Process Order' node seems to be missing an input. What data should it receive to start processing?" or "Your 'Send Notification' (sendEmail) node is missing the recipient's email. Where should I get the 'to' address from?"
        - If the workflow seems valid or you don't find obvious issues based on the user's query: Reassure the user or ask if they have specific concerns. For example: "Looking at your current setup, the nodes seem connected and the basic configurations are there. Is there a particular part you're concerned about or want me to check in more detail?"
    - For this analysis, your \`aiResponse\` should be purely textual. Do NOT set \`isWorkflowGenerationRequest\` to true unless the user explicitly asks to generate a *new* workflow.
5.  **General Chat**: For all other interactions (questions, requests for explanation, vague requests not detailed enough for full workflow generation or analysis), provide a helpful textual answer in \`aiResponse\`. In these cases, \`isWorkflowGenerationRequest\` should be false or omitted.

IMPORTANT:
- When you decide to generate a workflow (\`isWorkflowGenerationRequest: true\`), the \`workflowGenerationPrompt\` field MUST contain the actual detailed prompt for the generator. Your \`aiResponse\` should ONLY be a short confirmation message.
- DO NOT output workflow JSON or complex structures directly in the \`aiResponse\` field for analysis or generation. The separate \`workflowGenerationPrompt\` field and subsequent system actions handle actual generation.
- If a user asks you to create a workflow but their request is too vague (e.g., "Make me a workflow"), politely ask clarifying questions in \`aiResponse\` to help them detail their needs, and set \`isWorkflowGenerationRequest\` to false. For example: 'I can help with that! To design the best workflow, could you tell me more about it? For instance, what event should trigger it? What are the main steps or actions involved? And what's the final result you're aiming for?'
- Keep your chat responses helpful, concise, and easy to understand.
- If you don't know the answer to a question, say so.
- When discussing workflow construction, if relevant, mention Kairo node types that could be used, and briefly explain *why* they are suitable or *what* they do in that context (e.g., "For sending data to an external service, you could use the 'httpRequest' node which allows you to make GET, POST, etc. requests."). Available Kairo node types: webhookTrigger, fileSystemTrigger, getEnvironmentVariable, httpRequest, schedule, sendEmail, databaseQuery, googleCalendarListEvents, parseJson, logMessage, aiTask, conditionalLogic, dataTransform, executeFlowGroup, forEach, whileLoop, parallel, manualInput, callExternalWorkflow, delay, youtubeFetchTrending, youtubeDownloadVideo, videoConvertToShorts, youtubeUploadShort, workflowNode, unknown.

{{#if chatHistory}}
Previous Conversation:
{{#each chatHistory}}
{{this.sender}}: {{this.message}}
{{/each}}
{{/if}}

{{#if workflowContext}}
Current Workflow Context: {{{workflowContext}}}
{{/if}}

{{#if currentWorkflowNodes}}
Current Workflow on Canvas:
Nodes:
{{{jsonEncode currentWorkflowNodes}}}
Connections:
{{{jsonEncode currentWorkflowConnections}}}
(Analyze these if the user's message implies they need help with their current setup.)
{{/if}}

User's Current Message: {{{userMessage}}}

Your response (as a JSON object conforming to AssistantChatOutputSchema):
`,
});

const assistantChatFlow = ai.defineFlow(
  {
    name: 'assistantChatFlow',
    inputSchema: AssistantChatInputSchema,
    outputSchema: AssistantChatOutputSchema,
  },
  async (input) => {
    const {output} = await chatPrompt(input);
    if (!output) {
      return { aiResponse: "I'm having a little trouble understanding that. Could you perhaps rephrase your message or try asking in a different way?" };
    }
    // Ensure that if it's a generation request, the prompt field is also populated.
    if (output.isWorkflowGenerationRequest && !output.workflowGenerationPrompt) {
        console.warn("AI indicated workflow generation but didn't provide a prompt. Treating as chat.");
        return {
            aiResponse: output.aiResponse || "I was about to help generate a workflow, but I seem to be missing the specific details. Could you please tell me a bit more about the workflow you'd like to create?",
            isWorkflowGenerationRequest: false
        };
    }
    return output;
  }
);

