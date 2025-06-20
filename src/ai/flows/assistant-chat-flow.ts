
'use server';
/**
 * @fileOverview An AI flow to handle conversational chat with the Kairo assistant.
 * It can also identify if a user's message is a request to generate a workflow,
 * or analyze the current workflow for issues, providing suggestions or asking for clarification.
 * It can also guide users on how to modify their workflow or prompt for a re-generation for complex changes.
 * It can also signal when specific actions like "explain workflow", "suggest next node", or "analyze workflow efficiency" are requested.
 *
 * - assistantChat - A function that takes a user's message and returns an AI response.
 * - AssistantChatInput - The input type for the assistantChat function.
 * - AssistantChatOutput - The return type for the assistantChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Debug: Check if API key is available in this server environment
console.log(
  '[ASSISTANT CHAT FLOW] GOOGLE_API_KEY check. Available: ',
  process.env.GOOGLE_API_KEY ? `Yes (starts with: ${process.env.GOOGLE_API_KEY.substring(0, 5)})` : 'No / Empty'
);


// Minimal Schemas for workflow context analysis by the chat AI
const MinimalWorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  config: z.any().optional().describe("Node's configuration object. The AI should infer common required fields based on node type (e.g., \"url\" for \"httpRequest\", \"prompt\" for \"aiTask\")."),
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
  aiResponse: z.string().describe("The AI assistant's textual response to the user's message. This could be a general chat response, a confirmation for workflow generation, an analysis of the current workflow with suggestions/questions, or guidance on how to modify the workflow."),
  isWorkflowGenerationRequest: z.boolean().optional().describe("True if the AI believes the user's message is a request to generate a new workflow (or regenerate an existing one based on a new prompt). If true, \"workflowGenerationPrompt\" should be populated."),
  workflowGenerationPrompt: z.string().optional().describe("If \"isWorkflowGenerationRequest\" is true, this field contains the extracted or refined prompt that should be used for actual workflow generation by the main generation service. This new workflow will replace the current one."),
  actionRequest: z.enum(["explain_workflow", "suggest_next_node", "analyze_workflow_efficiency"]).optional().describe("If the AI determines the user is asking for a specific action like 'explain the current workflow', 'suggest a next node', or 'analyze workflow efficiency/robustness', this field will be set. The client application should then trigger the appropriate dedicated service/flow."),
});
export type AssistantChatOutput = z.infer<typeof AssistantChatOutputSchema>;

export async function assistantChat(input: AssistantChatInput): Promise<AssistantChatOutput> {
  return assistantChatFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'assistantChatPrompt',
  input: {schema: AssistantChatInputSchema},
  output: {schema: AssistantChatOutputSchema},
  config: { 
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
  prompt: `You are Kairo, a very friendly, patient, and highly skilled AI assistant for a workflow automation tool.
Your primary goal is to empower the user and make their workflow creation process smoother and more enjoyable.

Your primary roles are:
1.  **Answer questions about Kairo**: How to use it, its features, specific nodes, workflow automation concepts, best practices, troubleshooting.
    - If a user asks how to get a specific API key or fill a placeholder like "{{credential.SERVICE_API_KEY}}" (that might have been mentioned in a node's AI-generated explanation or config), explain the general process: they usually need to go to the service's website (e.g., platform.openai.com for OpenAI), sign up/log in, find the API key section in their account settings, and generate a new key. Then, they should add this key to Kairo's Credential Manager (if applicable in the Kairo version they are using) or set it as an environment variable (e.g., SERVICE_API_KEY=their_key_here). Remind them that the node's original "aiExplanation" field often contains specific hints for common services. Do not invent exact, detailed steps for every possible API key, but provide this general, actionable guidance.
2.  **Provide suggestions**: Offer brief suggestions or high-level steps for how to approach a problem with Kairo.
3.  **Generate NEW Workflows**:
    - If the user's message is a clear and detailed request to *create* or *generate* a **new** workflow (e.g., "Generate a workflow that does X, Y, and Z"):
        - Set "isWorkflowGenerationRequest" to true.
        - Extract or refine the user's request into a clear prompt suitable for a dedicated workflow generation AI. Put this prompt into the "workflowGenerationPrompt" field.
        - Your "aiResponse" should be an encouraging and clear confirmation, like: "Certainly! I can start drafting that workflow for you. I'll use this description: '[The prompt you put in workflowGenerationPrompt]'. It will appear on the canvas shortly, replacing any existing workflow."
    - If the user's message is a request to generate a new workflow but is **somewhat vague** (e.g., "Automate my social media posts", "Process customer feedback"):
        - **Do NOT immediately set "isWorkflowGenerationRequest" to true.**
        - Instead, in your "aiResponse", acknowledge the request and ask 1-2 targeted clarifying questions to get more details needed for generation.
        - Example: User says "Automate my marketing emails." AI Response: "I can help with that! To generate a marketing email workflow, could you tell me: 1. What triggers these emails (e.g., new subscriber, specific date)? 2. What's the main content or purpose of these emails? 3. Are there any specific tools or services involved (like Mailchimp, SendGrid)?"
        - Set "isWorkflowGenerationRequest" to false. The user's answers will form a better prompt for a subsequent generation request.
4.  **Analyze & Assist with CURRENT Workflow OR Request Specific Actions**:
    - If "currentWorkflowNodes" and "currentWorkflowConnections" are provided in your input data AND the user's message implies they need help with their current workflow (e.g., "Is my workflow okay?", "What's wrong here?", "Fix my workflow", "Help me with this flow", "How can I improve this workflow?", "Find issues in my flow"):
        - Analyze the provided nodes and connections for:
            1.  **Connectivity Issues**: Unconnected nodes, or nodes with required input handles that are not connected.
            2.  **Missing Essential Configuration**: Critical fields missing for a node's operation (e.g., "url" for "httpRequest", "prompt" for "aiTask", "queryText" for "databaseQuery", "pathSuffix" for "webhookTrigger").
            3.  **Basic Error Handling Gaps**: Identify nodes that can produce errors (like "httpRequest", "aiTask", "databaseQuery") where their "status" or "error_message" output handles are not connected to any subsequent node, or not used in a "conditionalLogic" node. Suggest adding error handling (e.g., "Consider adding a Conditional Logic node after 'Node X' to check its 'status' output and handle potential errors.").
            4.  **Potential Inefficiencies (High-Level)**: Briefly check for obvious redundancies (e.g., two HTTP Request nodes fetching the exact same URL right after each other without an apparent reason).
        - Formulate your findings in "aiResponse": Describe the problem clearly (mention specific node names or IDs) and suggest a specific, actionable solution, or ask specific, guiding questions.
        - For this analysis, your "aiResponse" should be purely textual. Do NOT set "isWorkflowGenerationRequest" to true unless the user explicitly asks to generate a *new* workflow.
    - If "currentWorkflowNodes" are provided AND the user asks a "how-to" question about configuring a *specific node type* that exists in their workflow (e.g., "How do I set the HTTP Request node to use POST?", "What fields do I need for the Send Email node?"):
        - Identify the relevant node type from the user's question.
        - Provide clear, step-by-step textual instructions on how to configure that node type's common/relevant fields in the Kairo UI. Mention key configuration field names.
        - Example: User asks "How do I make the HTTP node send a POST request?" AI Response: "To make an HTTP Request node send a POST request, you'll need to set its 'method' configuration field to 'POST' in the node's config panel. You'll also typically provide data in the 'body' field for a POST request, which can be a JSON string or text."
        - Set "isWorkflowGenerationRequest" to false.
    - **Explicit "Explain Workflow" Request**: If "currentWorkflowNodes" are provided AND the user explicitly asks "Explain this workflow", "Summarize this workflow", or similar:
        - Set "actionRequest" to "explain_workflow".
        - Set "aiResponse" to a confirmation, e.g., "Certainly! I can get an explanation of the current workflow for you. One moment..."
        - Do NOT attempt to generate the explanation yourself in "aiResponse".
    - **Explicit "Suggest Next Node" Request**: If the user asks "What node should I add next?", "Suggest next step", or similar:
        - Set "actionRequest" to "suggest_next_node".
        - Set "aiResponse" to a confirmation, e.g., "Okay, let me think of a good next step for your workflow..."
        - Do NOT attempt to generate the suggestion yourself in "aiResponse".
    - **Explicit "Analyze Workflow Efficiency/Robustness" Request**: If "currentWorkflowNodes" are provided AND the user explicitly asks to "analyze this workflow for efficiency", "make this workflow more robust", "find issues for improvement", or similar specific analysis requests beyond general help:
        - Set "actionRequest" to "analyze_workflow_efficiency".
        - Set "aiResponse" to a confirmation, e.g., "Okay, I'll perform a deeper analysis of your workflow for efficiency and robustness. One moment..."
        - Do NOT attempt to generate the analysis yourself in "aiResponse" if "actionRequest" is set.
5.  **Modify/Edit/Redesign CURRENT Workflow**: If "currentWorkflowNodes" and "currentWorkflowConnections" are provided AND the user's message indicates a desire to *change*, *update*, *edit*, or *redesign* the current workflow:
    - **Assess Change Type & Complexity**:
        - **Simple UI-Guidable Informational/Config Changes**: (e.g., "rename node Y to 'New Name'").
            - **AI Action**: Explain this change can be made directly in the Kairo UI. Provide clear, step-by-step textual instructions. Set "isWorkflowGenerationRequest" to false.
        - **Simple Structural Changes (AI-Assisted Re-generation)**: (e.g., "add a log node after node X").
            - **AI Action**:
                1.  Acknowledge the request.
                2.  Offer to help: "I can help you with that. To add a 'Log Message' node after 'Node X', I'll need to generate an updated workflow. This will replace the current one."
                3.  **Attempt to formulate a new, complete prompt describing the existing workflow plus the requested addition.** For example: "Based on your current setup which seems to [briefly describe flow up to Node X, and what happens after Node X if anything], I can describe the new workflow as: '[A workflow that starts with Trigger A, then goes to Node X, then logs a message with the output of Node X, then proceeds to Node Z].'"
                4.  Ask for confirmation: "Shall I proceed with generating this updated workflow based on that description?"
                5.  If the user confirms (in a follow-up message): Set "isWorkflowGenerationRequest" to "true", populate "workflowGenerationPrompt" with the AI-formulated prompt (or the user's confirmation if they edited it), and set "aiResponse" to a confirmation message.
                6.  If the user declines or the AI cannot confidently formulate the prompt: Fall back to explaining how the user can do this via the UI or ask for a full user-provided prompt. Set "isWorkflowGenerationRequest" to false.
        - **Targeted Configuration Change (including Credentials) via Re-generation**:
            (e.g., User says "Set the prompt for 'AI Task Alpha' to 'Summarize this text now.'" OR "My YouTube Client ID is X, Secret is Y, use it for the YouTube node.")
            - **AI Action**:
                1.  Acknowledge the request. If credentials are provided (like API keys, Client IDs, Secrets), acknowledge receiving them.
                2.  **If credentials were provided and a target node isn't explicitly stated by the user for these credentials**:
                    *   Scan "currentWorkflowNodes" for likely candidate nodes (e.g., "youtubeFetchTrending" for YouTube credentials, "aiTask" for API keys, "googleCalendarListEvents" for Google credentials, etc.).
                    *   If one clear candidate node type is found that matches the credential type: "Okay, I have your [YouTube Client ID/API Key/etc.]. It looks like your '[Node Name]' (type: [Node Type]) node in the current workflow could use this. Is that correct?"
                    *   If multiple candidate nodes are found: "I have your [credentials]. Nodes like '[Node A]' or '[Node B]' in your current workflow might use these. Which node should I target for this update?"
                    *   If no obvious candidate node is found, or if the user says "No" to a suggestion: "I have your [credentials]. Which node in your current workflow should use this?"
                3.  **Once a target node is confirmed or specified by the user for the credentials**: Proceed to step 4.
                4.  Explain re-generation: "To apply this specific change to the '[Target Node Name]' node, I'll need to generate an updated workflow. This will replace the current workflow on the canvas."
                5.  **Ask for a new, complete prompt describing the desired final state, explicitly including the change**: "Could you please provide a new, detailed prompt that describes the entire workflow as you now want it to be, ensuring you specify how the '[Target Node Name]' should use [the new prompt/the provided credentials with placeholders like {{credential.MyYouTubeClientID}} and {{credential.MyYouTubeClientSecret}}]}? For example: 'A workflow triggered by a webhook, then fetches trending YouTube videos using Client ID {{credential.YouTubeClientID}} and Secret {{credential.YouTubeClientSecret}}, and finally logs the video titles.'"
                6.  If the user provides this new, complete prompt in their current message or a follow-up:
                    *   Set "isWorkflowGenerationRequest" to "true".
                    *   Populate "workflowGenerationPrompt" with this new user-provided prompt.
                    *   Set "aiResponse" to a confirmation (e.g., "Great! I'll generate a new workflow based on this description: '[the new prompt]'. The new workflow will appear on the canvas shortly.").
        - **Complex Structural Changes or Full Redesign**: (e.g., "add three new nodes and connect them in a loop between node A and B", "redesign the whole thing to also process images", "I want to change this workflow to do X, Y, and Z instead").
            - **AI Action**: Explain that for such changes, re-generating the workflow is the best approach. Ask the user for a new, complete prompt describing the desired final state. If the user provides this new prompt, set "isWorkflowGenerationRequest" to true, populate "workflowGenerationPrompt", and set "aiResponse" to a confirmation.
        - **Vague Change Request**: (e.g., "this isn't right, change it", "make it better").
            - **AI Action**: Ask clarifying questions to understand what specific changes the user wants. Try to guide them towards either simple UI-guided changes, a more specific targeted change request, or a clear prompt for regeneration. Set "isWorkflowGenerationRequest" to false.
6.  **General Chat**: For all other interactions (questions, requests for explanation not covered by role 4, vague requests not detailed enough for full workflow generation or analysis), provide a helpful textual answer in "aiResponse". In these cases, "isWorkflowGenerationRequest" and "actionRequest" should be false or omitted.

IMPORTANT:
- You are a static analyzer and conversational assistant. You do NOT execute the workflow yourself.
- When "isWorkflowGenerationRequest: true", "workflowGenerationPrompt" MUST contain the detailed prompt for the generator. "aiResponse" should ONLY be a short confirmation.
- When "actionRequest" is set (e.g., to "explain_workflow"), "aiResponse" should be a short confirmation that you are initiating that action. The actual result of the action (like the explanation text) will come from a separate service call made by the application.
- **The "aiResponse" field in the JSON output MUST always be a simple string value.** It should not be an object or any other complex type. It contains the direct textual reply or confirmation for the user.
- DO NOT output workflow JSON in "aiResponse".
- Keep responses helpful, concise. If unknown, say so.
- Mention Kairo node types if relevant (e.g., "'httpRequest' node for external service calls"). Available Kairo node types: webhookTrigger, fileSystemTrigger, getEnvironmentVariable, httpRequest, schedule, sendEmail, databaseQuery, googleCalendarListEvents, parseJson, logMessage, aiTask, conditionalLogic, dataTransform, executeFlowGroup, forEach, whileLoop, parallel, manualInput, callExternalWorkflow, delay, youtubeFetchTrending, youtubeDownloadVideo, videoConvertToShorts, youtubeUploadShort, workflowNode, unknown.

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

IMPORTANT: Your entire response MUST be ONLY a single, valid JSON object that strictly conforms to the AssistantChatOutputSchema.
Do NOT include any explanatory text or markdown formatting (like \`\`\`json or \`\`\`) before or after the JSON object.
The JSON object should look like this:
{
  "aiResponse": "The AI's textual answer to the user.",
  "isWorkflowGenerationRequest": false,
  "workflowGenerationPrompt": null,
  "actionRequest": null
}
`
});

const assistantChatFlow = ai.defineFlow(
  {
    name: 'assistantChatFlow',
    inputSchema: AssistantChatInputSchema,
    outputSchema: AssistantChatOutputSchema,
  },
  async (input): Promise<AssistantChatOutput> => {
    console.log("assistantChatFlow: Received input (userMessage first 100 chars):", input.userMessage.substring(0,100) + "...");
    try {
      const result = await chatPrompt(input); 
      
      // Log the raw result from AI for better debugging if issues persist
      if (result === undefined || result === null) { 
        console.warn("assistantChatFlow: AI prompt returned undefined or null result. This can happen if the LLM response is empty, unparseable by Genkit before Zod validation, or due to strict safety filters.");
      } else {
        try {
          // Log the raw result from the AI model
          console.log("assistantChatFlow: Raw AI result object (attempting to stringify):", JSON.stringify(result, null, 2));
        } catch (stringifyError: any) {
          console.warn("assistantChatFlow: Could not stringify raw AI result object. Error during stringify:", stringifyError.message, "Raw result might be (displaying directly):", result);
        }
      }

      if (!result) { 
        console.warn("assistantChatFlow: AI prompt did not return a usable result object (it was undefined or null). Returning generic error message to user.");
        return {
          aiResponse: "I'm having a little trouble formulating a response right now. Could you try rephrasing or asking again in a moment?",
          isWorkflowGenerationRequest: false,
        };
      }
      
      let finalAiResponse = result.aiResponse;
      // Ensure isWorkflowGenerationRequest is properly coerced to boolean if it comes as string "true" or "false"
      const isGenRequest = typeof result.isWorkflowGenerationRequest === 'string' 
                            ? result.isWorkflowGenerationRequest.toLowerCase() === 'true' 
                            : !!result.isWorkflowGenerationRequest;
      const genPrompt = typeof result.workflowGenerationPrompt === 'string' ? result.workflowGenerationPrompt : undefined;
      const actionReq = typeof result.actionRequest === 'string' ? result.actionRequest as any : undefined;

      if (typeof finalAiResponse !== 'string') {
        const originalResponseType = typeof finalAiResponse;
        console.warn(`assistantChatFlow: Original 'aiResponse' was not a string (type: ${originalResponseType}). Attempting to salvage action if possible. Full result:`, result);
        if (isGenRequest && genPrompt && typeof genPrompt === 'string' && genPrompt.trim() !== '') {
          finalAiResponse = `Understood. I will generate a workflow based on: "${genPrompt.substring(0, 150)}${genPrompt.length > 150 ? '...' : ''}"`;
        } else if (actionReq && typeof actionReq === 'string' && actionReq.trim() !== '') {
          finalAiResponse = `Okay, I will perform the action: ${actionReq}.`;
        } else {
          console.warn("assistantChatFlow: 'aiResponse' was not a string and no other primary action could be salvaged. Returning structural error message. Result was:", JSON.stringify(result, null, 2));
          return {
            aiResponse: "I'm having a little trouble formulating a response right now (issue with 'aiResponse' structure). Could you try rephrasing or asking again in a moment?",
            isWorkflowGenerationRequest: false, 
            workflowGenerationPrompt: undefined,
            actionRequest: undefined,
          };
        }
        console.log(`assistantChatFlow: Salvaged 'aiResponse' to: "${finalAiResponse}" because original was type ${originalResponseType}.`);
      }
      
      if (isGenRequest && (!genPrompt || genPrompt.trim() === '')) {
          console.warn("assistantChatFlow: AI indicated workflow generation but didn't provide a valid 'workflowGenerationPrompt'. Treating as chat response. Original/Salvaged AI Response was:", finalAiResponse);
          return {
              aiResponse: finalAiResponse || "I was about to generate a workflow, but I'm missing the details. Could you clarify what you'd like me to create?", 
              isWorkflowGenerationRequest: false, 
              workflowGenerationPrompt: undefined,
              actionRequest: undefined 
          };
      }
      
      return {
        aiResponse: finalAiResponse,
        isWorkflowGenerationRequest: isGenRequest,
        workflowGenerationPrompt: isGenRequest ? genPrompt : undefined,
        actionRequest: actionReq,
      };
    } catch (error: any) {
      console.error("assistantChatFlow: Error caught during flow execution. Raw error:", error);
      
      let errorDetailsForLog = "Raw error logged above.";
      if (typeof error === 'object' && error !== null) {
        try {
          errorDetailsForLog = JSON.stringify(error, Object.getOwnPropertyNames(error));
        } catch (e) {
          errorDetailsForLog = `Name: ${error.name}, Message: ${error.message}, Stack: ${error.stack ? error.stack.substring(0, 200) + '...' : 'N/A'}`;
        }
      } else if (typeof error !== 'string') {
        errorDetailsForLog = String(error);
      }
      console.error(`assistantChatFlow: Processed error for user. Full Error Details: ${errorDetailsForLog}`);


      let userErrorMessage = "An unexpected error occurred while I was thinking. Please try your request again.";
      
      if (error && typeof error === 'object') {
        if (error.candidates && Array.isArray(error.candidates) && error.candidates.length > 0) {
          const firstCandidate = error.candidates[0];
          if (firstCandidate.finishReason && firstCandidate.finishReason !== 'STOP' && firstCandidate.finishReason !== 'MODEL_SPECIFIED_STOP') {
            switch (firstCandidate.finishReason) {
              case 'SAFETY':
                userErrorMessage = "I'm sorry, I couldn't process that request due to content safety guidelines. Please try rephrasing.";
                break;
              case 'RECITATION':
                userErrorMessage = "I'm unable to complete that request due to content restrictions related to recitation. Please try a different approach.";
                break;
              case 'MAX_TOKENS':
                userErrorMessage = "The request was too long or the response would be too long. Please try a shorter message or request.";
                break;
              default:
                userErrorMessage = "I'm sorry, I couldn't complete that request due to an unexpected reason (" + firstCandidate.finishReason + "). Please try rephrasing.";
            }
          }
        } else if (error.name === 'ZodError' && error.errors) {
            userErrorMessage = "The AI returned data in an unexpected format. I'll try to adapt. Please try your request again, or slightly rephrase it.";
            console.error("assistantChatFlow: Zod validation error from AI output:", error.errors);
        } else if (error.message) { 
          const errorMessageLower = String(error.message).toLowerCase();
          if (errorMessageLower.includes('api key') || errorMessageLower.includes('permission denied') || errorMessageLower.includes('forbidden') || String(error.status) === '401' || String(error.status) === '403' || String(error.code) === '401' || String(error.code) === '403') {
             userErrorMessage = "There's an issue with the AI service configuration. Please check your API key and project settings, then try again. (Code: ECONF)";
          } else if (errorMessageLower.includes('quota') || errorMessageLower.includes('rate limit') || String(error.status) === '429' || String(error.code) === '429') {
            userErrorMessage = "The AI service is currently experiencing high demand or you've reached a usage limit. Please try again in a few moments. (Code: ELIMIT)";
          } else if (errorMessageLower.includes('blocked') || errorMessageLower.includes('safety') || errorMessageLower.includes('harmful')) {
            userErrorMessage = "I'm sorry, I couldn't process that request due to content safety guidelines. Please try rephrasing. (Code: ESAFE)";
          } else if (error.name === 'SyntaxError' && (errorMessageLower.includes('json') || errorMessageLower.includes('unexpected token') || errorMessageLower.includes('parse error'))) {
            userErrorMessage = "The AI's response was not in the expected format. I'll try to learn from this. Please try again. (Code: EJSON)";
          } else {
            userErrorMessage = `An error occurred: ${String(error.message).substring(0,100)}. Please try again. (Code: EGEN)`;
          }
        } else if (error.status || error.code) { 
           if (String(error.status) === '401' || String(error.status) === '403' || String(error.code) === '401' || String(error.code) === '403') {
               userErrorMessage = "There's an issue with the AI service configuration (authentication/permission). Please check your API key and project settings. (Code: EAUTH)";
           } else if (String(error.status) === '429' || String(error.code) === '429') {
               userErrorMessage = "The AI service is busy or usage limits were reached. Please try again later. (Code: ERATE)";
           } else {
               userErrorMessage = `An unexpected error occurred. Status: ${error.status || 'N/A'}, Code: ${error.code || 'N/A'}. (Code: ESTAT)`;
           }
        }
      } else if (typeof error === 'string') { 
        const errorStringLower = error.toLowerCase();
        if (errorStringLower.includes('api key') || errorStringLower.includes('permission denied') || errorStringLower.includes('forbidden') || errorStringLower.includes('401') || errorStringLower.includes('403')) {
           userErrorMessage = "There's an issue with the AI service configuration. Please check your API key and project settings. (Code: SCONF)";
        } else if (errorStringLower.includes('quota') || errorStringLower.includes('rate limit') || errorStringLower.includes('429')) {
          userErrorMessage = "The AI service is currently experiencing high demand or usage limits. Please try again in a few moments. (Code: SLIMIT)";
        } else if (errorStringLower.includes('blocked') || errorStringLower.includes('safety') || errorStringLower.includes('harmful')) {
          userErrorMessage = "I'm sorry, I couldn't process that request due to content safety guidelines. Please try rephrasing. (Code: SSAFE)";
        } else if (errorStringLower.includes('json') || errorStringLower.includes('unexpected token') || errorStringLower.includes('parse error')) {
             userErrorMessage = "The AI's response was not in the expected format. I'll try to learn from this. Please try again. (Code: SJSON)";
        } else {
          userErrorMessage = `An error occurred: ${error.substring(0,100)}. Please try again. (Code: SGEN)`;
        }
      }
      
      return {
        aiResponse: userErrorMessage,
        isWorkflowGenerationRequest: false,
      };
    }
  }
);
