
'use server';
/**
 * @fileOverview An AI flow to handle conversational chat with the Kairo assistant.
 * It can use tools to manage and run workflows, identify if a user's message is a request to generate a workflow,
 * or analyze the current workflow for issues, providing suggestions or asking for clarification.
 * It can also guide users on how to modify their workflow or prompt for a re-generation for complex changes.
 *
 * - assistantChat - A function that takes a user's message and returns an AI response.
 * - AssistantChatInput - The input type for the assistantChat function.
 * - AssistantChatOutput - The return type for the assistantChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  listSavedWorkflowsTool,
  getWorkflowDefinitionTool,
  runWorkflowTool,
} from '@/ai/tools/workflow-management-tools';

// Minimal Schemas for workflow context analysis by the chat AI
const MinimalWorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  config: z.any().optional().describe("Node's configuration object. The AI should infer common required fields based on node type (e.g., \"url\" for \"httpRequest\", \"prompt\" for \"aiTask\"). Consider general structure like 'url', 'method', 'body', 'headers' for 'httpRequest'; 'prompt', 'model' for 'aiTask'; 'queryText', 'queryParams' for 'databaseQuery'; 'to', 'subject', 'body' for 'sendEmail'; 'pathSuffix' for 'webhookTrigger', 'condition' for 'conditionalLogic', 'inputArrayPath' for 'forEach', etc."),
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
  workflowContext: z.string().optional().describe("Optional context about the current workflow, like selected node or overall goal. This helps the AI provide more relevant answers and formulate new generation prompts if modifications are requested."),
  chatHistory: z.array(z.object({
    sender: z.enum(['user', 'ai']),
    message: z.string(),
  })).optional().describe("Previous messages in the conversation to maintain context."),
  currentWorkflowNodes: z.array(MinimalWorkflowNodeSchema).optional().describe("The current list of nodes on the workflow canvas. Used for analysis if the user asks for help with their workflow. This data is provided as a structured JSON array in your input. Use this to understand the current workflow structure if asked to modify it."),
  currentWorkflowConnections: z.array(MinimalWorkflowConnectionSchema).optional().describe("The current list of connections on the workflow canvas. Used for analysis. This data is provided as a structured JSON array in your input. Use this to understand the current workflow structure if asked to modify it."),
});
export type AssistantChatInput = z.infer<typeof AssistantChatInputSchema>;

const AssistantChatOutputSchema = z.object({
  aiResponse: z.string(),
  isWorkflowGenerationRequest: z.boolean().optional(),
  workflowGenerationPrompt: z.string().optional(),
  actionRequest: z.enum(["suggest_next_node"]).optional(),
});
export type AssistantChatOutput = z.infer<typeof AssistantChatOutputSchema>;

/**
 * Main exported function to handle assistant chat. It directly calls the Genkit flow.
 */
export async function assistantChat(input: AssistantChatInput): Promise<AssistantChatOutput> {
  return assistantChatFlow(input);
}


const chatPrompt = ai.definePrompt({
  name: 'assistantChatPrompt',
  input: {schema: AssistantChatInputSchema},
  output: {schema: AssistantChatOutputSchema},
  tools: [
    listSavedWorkflowsTool,
    getWorkflowDefinitionTool,
    runWorkflowTool,
  ],
  config: {
    safetySettings: [ 
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are Kairo, a friendly and highly skilled AI assistant for a workflow automation tool. Your goal is to help users create, manage, and debug workflows.

Your primary roles are:
1.  **Generate NEW Workflows**: If the user's message implies an intent to *create* or *build* a new workflow (e.g., "Generate a workflow that does X"), set "isWorkflowGenerationRequest" to true and formulate a clear "workflowGenerationPrompt". Your "aiResponse" should be a confirmation like: "Okay, I'll generate a workflow based on your request. It will appear on the canvas shortly."
2.  **Analyze & Fix CURRENT Workflows**:
    - If the user asks for help ("Is this okay?", "analyze this"), IMMEDIATELY analyze the provided \`currentWorkflowNodes\` and \`currentWorkflowConnections\`. In your \`aiResponse\`, directly report any issues found, such as:
        - Connectivity Problems: Unconnected nodes or required inputs without a connection.
        - Missing Configuration: Critical fields missing (e.g., URL for 'httpRequest', prompt for 'aiTask').
        - Error Handling Gaps: Nodes that can fail but don't have their error outputs connected.
    - If the user asks you to **"fix"** the workflow, first perform the analysis. If you need more information (like a missing URL), ask for it in \`aiResponse\`. If you have enough info, formulate a new, complete \`workflowGenerationPrompt\` that describes the corrected workflow and ask for confirmation in \`aiResponse\` before generating.
3.  **Modify/Edit CURRENT Workflows**: If the user wants to *change* or *update* the current workflow:
    - For simple UI changes (e.g., renaming a node), explain how to do it in the UI.
    - For structural changes (e.g., "add a log node after node X"), explain that you'll need to generate an updated workflow. Formulate a new prompt describing the full, modified workflow and ask for confirmation. If they confirm, set \`isWorkflowGenerationRequest: true\` with the new prompt in your next turn.
4. **Use Tools to Manage Workflows**:
    - If the user asks to **list** or **see** workflows, use the \`listSavedWorkflowsTool\`. Present the results clearly in your \`aiResponse\`.
    - If they ask to **see the details** of a workflow, use \`getWorkflowDefinitionTool\` and describe the workflow structure.
    - If they ask to **run** or **execute** a workflow, first get its definition with \`getWorkflowDefinitionTool\`, then execute it with \`runWorkflowTool\`, and report the final status and a summary of the outcome in your \`aiResponse\`.
5.  **Answer Questions**: Answer questions about Kairo, its features, and workflow automation concepts. Provide guidance on finding external credentials like API keys (e.g., "Go to the service's website, find API settings...").

{{#if chatHistory}}
Previous Conversation:
{{#each chatHistory}}
{{this.sender}}: {{this.message}}
{{/each}}
{{/if}}

{{#if workflowContext}}
Current Workflow Context: {{{workflowContext}}}
{{/if}}

User's Current Message: {{{userMessage}}}

IMPORTANT: Your entire response MUST be ONLY a single, valid JSON object that strictly conforms to the AssistantChatOutputSchema. Do not add any explanatory text before or after the JSON.
`
});

/**
 * Genkit flow that orchestrates the chat logic. It calls the prompt and processes the response.
 */
const assistantChatFlow = ai.defineFlow(
  {
    name: 'assistantChatFlow',
    inputSchema: AssistantChatInputSchema,
    outputSchema: AssistantChatOutputSchema,
  },
  async (input): Promise<AssistantChatOutput> => {
    try {
      const genkitResponse = await chatPrompt(input); 
      const result = genkitResponse.output; 

      if (!result) {
        throw new Error("AI prompt returned an undefined or null result.");
      }
      
      // Sanitize and validate the AI's output before returning
      const isGenRequest = !!result.isWorkflowGenerationRequest;
      const genPrompt = (isGenRequest && typeof result.workflowGenerationPrompt === 'string') ? result.workflowGenerationPrompt : undefined;
      const actionReq = (result.actionRequest && typeof result.actionRequest === 'string') ? result.actionRequest as any : undefined;
      const finalAiResponse = result.aiResponse || "I'm sorry, I couldn't generate a response.";

      if (isGenRequest && !genPrompt) {
          console.warn("assistantChatFlow: AI indicated workflow generation but didn't provide a valid 'workflowGenerationPrompt'.");
          return {
              aiResponse: finalAiResponse || "I was about to generate a workflow, but I'm missing the details. Could you clarify what you'd like me to create?",
              isWorkflowGenerationRequest: false,
          };
      }

      return {
        aiResponse: finalAiResponse, 
        isWorkflowGenerationRequest: isGenRequest,
        workflowGenerationPrompt: genPrompt,
        actionRequest: actionReq,
      };

    } catch (error: any) {
      console.error("assistantChatFlow: Error caught during flow execution.", error);

      let userErrorMessage = "An unexpected error occurred while I was thinking. Please try your request again.";

      if (error.message) {
        const msg = String(error.message).toLowerCase();
        if (msg.includes('api key') || msg.includes('permission denied')) {
           userErrorMessage = "There's an issue with the AI service configuration. Please check your API key and project settings.";
        } else if (msg.includes('quota') || msg.includes('rate limit')) {
          userErrorMessage = "The AI service is currently busy. Please try again in a few moments.";
        } else if (msg.includes('safety') || msg.includes('blocked')) {
          userErrorMessage = "I'm sorry, I couldn't process that request due to content safety guidelines.";
        } else {
          userErrorMessage = `An error occurred: ${String(error.message).substring(0,100)}.`;
        }
      }
      
      return {
        aiResponse: userErrorMessage,
        isWorkflowGenerationRequest: false,
      };
    }
  }
);
