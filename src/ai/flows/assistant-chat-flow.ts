
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
import { ALL_AVAILABLE_TOOLS_MAP } from '@/ai/tools';
import type { Tool } from '@/types/workflow';

// Minimal Schemas for workflow context analysis by the chat AI
const MinimalWorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  config: z.any().optional().describe("Node's configuration object. The AI should infer common required fields based on node type (e.g., \"url\" for \"httpRequest\", \"prompt\" for \"aiTask\"). Consider general structure like 'url', 'method', 'body', 'headers' for 'httpRequest'; 'prompt', 'model' for 'aiTask'; 'queryText', 'queryParams' for 'databaseQuery'; 'to', 'subject', 'body' for 'sendEmail'; 'pathSuffix' for 'webhookTrigger', 'condition' for 'conditionalLogic', 'inputArrayPath' for 'forEach', etc. Crucially, this config includes simulation data like `simulatedResponse` which can be used to infer the node's output data structure."),
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
  userId: z.string().optional().describe("The ID of the user making the request. Required for API calls."),
  imageDataUri: z.string().optional().describe("An optional image provided by the user, as a data URI that must include a MIME type and use Base64 encoding. Use this image as context for the user's message, e.g., to analyze a screenshot of an error or a hand-drawn diagram of a workflow."),
  workflowContext: z.string().optional().describe("Optional context about the current workflow, like selected node or overall goal. This helps the AI provide more relevant answers and formulate new generation prompts if modifications are requested."),
  chatHistory: z.array(z.object({
    sender: z.enum(['user', 'ai']),
    message: z.string(),
  })).optional().describe("Previous messages in the conversation to maintain context."),
  currentWorkflowNodes: z.array(MinimalWorkflowNodeSchema).optional().describe("The current list of nodes on the workflow canvas. Used for analysis if the user asks for help with their workflow. This data is provided as a structured JSON array in your input. Use this to understand the current workflow structure if asked to modify it."),
  currentWorkflowConnections: z.array(MinimalWorkflowConnectionSchema).optional().describe("The current list of connections on the workflow canvas. Used for analysis. This data is provided as a structured JSON array in your input. Use this to understand the current workflow structure if asked to modify it."),
  enabledTools: z.array(z.string()).optional().describe("A list of tool names that the AI is currently configured to use. If not provided, the AI should use its default full set of capabilities."),
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


async function getChatPrompt(enabledToolNames?: string[]) {
  let toolsToUse = Array.from(ALL_AVAILABLE_TOOLS_MAP.values()).map(t => t.genkitTool);

  if (enabledToolNames && enabledToolNames.length > 0) {
    console.log(`[Chat Flow] AI has a specific toolset configured with ${enabledToolNames.length} tools.`);
    toolsToUse = enabledToolNames
      .map(name => ALL_AVAILABLE_TOOLS_MAP.get(name)?.genkitTool)
      .filter(Boolean) as any[];
  } else {
    console.log(`[Chat Flow] AI using default full toolset (${toolsToUse.length} tools).`);
  }

  return ai.definePrompt({
    name: 'assistantChatPrompt_dynamic', // Name can be dynamic for debugging if needed
    input: {schema: AssistantChatInputSchema},
    output: {schema: AssistantChatOutputSchema},
    tools: toolsToUse,
    config: {
      safetySettings: [ 
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    },
    prompt: `You are Kairo, a friendly, conversational, and highly skilled AI assistant for a workflow automation tool. Your goal is to be a true partner to the user, helping them create, manage, and debug workflows through dialogue. You are an **agent** that can use tools to gather information before acting.

**Core Principle: Agentic & Multimodal Thinking**
Your primary directive is to think like an agent. Follow these steps for every user message:
1.  **Analyze All Inputs**: Understand the user's ultimate objective. What are they trying to accomplish? This includes analyzing any images they have provided, which are a critical source of context. A screenshot of an error or a hand-drawn diagram is often more important than the text message.
2.  **Plan & Gather Information (Tool-First Approach)**: Before generating a workflow or giving a final answer, determine if you need more information. If the user's request is abstract (e.g., "my latest video," "the Q3 report"), you **must** use your available tools to find concrete details (like a specific Video ID or a File ID) **first**.
3.  **Execute & Respond**: Once you have the necessary information (either from the user directly, from the image, or from your tools), take the appropriate action. This could be:
    -   **Generating a Workflow**: If the user's request is to build an automation.
    -   **Answering a Question**: If the user is asking for information.
    -   **Analyzing the Canvas**: If the user asks for help with their current workflow.

**Scenario-Based Actions:**

1.  **Conversational Workflow Generation**:
    -   If the user provides an **image of a diagram**, use that as the primary source for building a workflow. In your response, acknowledge the diagram: "Thanks for the diagram! I'll generate a workflow based on what you've drawn. It will appear on the canvas shortly." Then set 'isWorkflowGenerationRequest: true' and create a detailed 'workflowGenerationPrompt' that describes the diagram's flow and components.
    -   If the user's request is **clear and actionable** (e.g., "Generate a workflow that gets data from API X and emails it to Y"), confirm you're starting and set 'isWorkflowGenerationRequest: true' with a well-formed 'workflowGenerationPrompt'. Your 'aiResponse' should be: "Certainly. I'll generate a workflow for that. It will appear on the canvas shortly."
    -   If the user's request is **ambiguous or incomplete** (e.g., "Make a workflow to process orders"), DO NOT generate immediately. Instead, set 'isWorkflowGenerationRequest: false' and use your 'aiResponse' to ask clarifying questions. For example: "I can help with that. What's the first step in processing an order? Where does the order data come from (like a webhook or an API)?"
    -   If a user asks for **instructions** (e.g., "How do I connect to a database?"), first provide a brief explanation, then proactively offer to build it: "You'd use a Database Query node. You'll need to provide the connection details and your SQL query. Would you like me to add and configure a database node for you?"

2.  **Proactive Analysis & Debugging**:
    -   When the user asks for help with their current workflow ("analyze this", "is this right?", "why is this failing?") or provides a screenshot of an error, analyze the provided 'currentWorkflowNodes', 'currentWorkflowConnections', and especially the 'imageDataUri'.
    -   In your 'aiResponse', report your findings clearly and concisely. Point out specific problems like connectivity gaps, configuration errors, or logic flaws.
    -   After reporting the issues, ask the user how they'd like to proceed: "I can try to fix this for you. Shall I generate a corrected version of the workflow?"

3.  **Collaborative Workflow Modification**:
    -   When the user wants to *change* or *add to* the current workflow (e.g., "add a logging step after the API call"), understand the request in the context of the 'currentWorkflowNodes'.
    -   Formulate a new, complete 'workflowGenerationPrompt' that describes the *entire modified workflow*.
    -   In your 'aiResponse', confirm your understanding and ask for permission before generating: "Okay, you want to add a logging step after the API call. To do that, I'll need to regenerate the workflow with the new step included. Is that okay?"
    -   If they confirm in the next turn, set 'isWorkflowGenerationRequest: true' with the new prompt.

4.  **Tool-Based Workflow Management**:
    -   Use your tools to fulfill user requests to manage their workflows. The user's ID is '{{userId}}'.
    -   'listSavedWorkflowsTool': Use when asked to "list my workflows" or "show me what's saved."
    -   'getWorkflowDefinitionTool': Use when asked to "show me the 'Order Processing' workflow" or before running one.
    -   'runWorkflowTool': When asked to "run the 'Order Processing' workflow," first get its definition. **Crucially, if the workflow's trigger node (e.g., a webhookTrigger) implies it needs input data (like an order ID), you MUST ask the user for that data first.** For example: "I can run that workflow. It looks like it needs an Order ID to start. What is the Order ID you'd like to use?" Once you have the data from the user, call the 'runWorkflowTool' and provide the user's input in the 'initialData' parameter. By default, this runs in simulation mode. If the user explicitly asks to run it "for real" or "live", set 'isSimulation: false'. Always confirm with the user before initiating a live run.
    -   Always report the results of your tool usage clearly in your 'aiResponse'.

5.  **General Assistance**:
    -   Answer general questions about Kairo's features and workflow automation concepts.
    -   Provide guidance on where to find external credentials (e.g., "You can find your API key in your service provider's dashboard, usually under 'Developer Settings' or 'API'").
    -   If the user asks "what data is available from the previous node?" or a similar question, use the 'currentWorkflowContext' to identify the selected node. Then, look at the 'currentWorkflowConnections' to find the source node connected to it. Finally, inspect that source node's 'config' in 'currentWorkflowNodes', specifically looking for simulation data fields like 'simulatedResponse' or 'simulatedOutput'. Use this to explain the structure of the data available. For example: "The 'Fetch User' node provides a 'response' object. Based on its simulation data, it looks like you can use placeholders like '{{Fetch_User.response.id}}' and '{{Fetch_User.response.email}}'."

{{#if imageDataUri}}
User has provided an image for context. Analyze this image in conjunction with the user's message. The image is the primary source of truth if it conflicts with the text.
{{media url=imageDataUri}}
{{/if}}

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
}

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
      // Dynamically get the prompt with the correct set of tools
      const chatPrompt = await getChatPrompt(input.enabledTools);
      
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

    