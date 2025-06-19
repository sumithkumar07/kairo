
'use server';
/**
 * @fileOverview An AI flow to handle conversational chat with the Kairo assistant.
 * It can also identify if a user's message is a request to generate a workflow.
 *
 * - assistantChat - A function that takes a user's message and returns an AI response.
 * - AssistantChatInput - The input type for the assistantChat function.
 * - AssistantChatOutput - The return type for the assistantChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistantChatInputSchema = z.object({
  userMessage: z.string().describe("The user's message in the chat."),
  workflowContext: z.string().optional().describe("Optional context about the current workflow, like selected node or overall goal. This helps the AI provide more relevant answers."),
  chatHistory: z.array(z.object({
    sender: z.enum(['user', 'ai']),
    message: z.string(),
  })).optional().describe("Previous messages in the conversation to maintain context."),
});
export type AssistantChatInput = z.infer<typeof AssistantChatInputSchema>;

const AssistantChatOutputSchema = z.object({
  aiResponse: z.string().describe("The AI assistant's textual response to the user's message."),
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

Your primary role is to:
1. Answer questions about Kairo (how to use it, its features, specific nodes, workflow automation concepts, best practices, troubleshooting).
2. Provide brief suggestions or high-level steps for how to approach a problem with Kairo.
3. If the user's message is a clear and detailed request to *create* or *generate* a new workflow (e.g., "Generate a workflow that does X, Y, and Z" or "Create an automation for [detailed description]"), then:
    - Set \`isWorkflowGenerationRequest\` to true.
    - Extract or refine the user's request into a clear prompt suitable for a dedicated workflow generation AI. Put this prompt into the \`workflowGenerationPrompt\` field.
    - Your \`aiResponse\` should be an encouraging and clear confirmation, like: 'Certainly! I can start drafting that workflow for you. I'll use this description: "[The prompt you put in workflowGenerationPrompt]". It will appear on the canvas shortly.' OR 'Great idea for an automation! I'll generate a workflow based on: "[The prompt you put in workflowGenerationPrompt]". This might take a moment; it will appear on the canvas when ready.'
4. For all other interactions (questions, requests for explanation, vague requests that are not detailed enough for full workflow generation), provide a helpful textual answer in the \`aiResponse\` field. In these cases, \`isWorkflowGenerationRequest\` should be false or omitted, and \`workflowGenerationPrompt\` should be empty or omitted.

IMPORTANT:
- When you decide to generate a workflow (\`isWorkflowGenerationRequest: true\`), the \`workflowGenerationPrompt\` field MUST contain the actual detailed prompt for the generator. Your \`aiResponse\` should ONLY be a short confirmation message.
- DO NOT output workflow JSON or complex structures directly in the \`aiResponse\` field. The separate \`workflowGenerationPrompt\` field and subsequent system actions handle the actual generation.
- If a user asks you to create a workflow but their request is too vague (e.g., "Make me a workflow"), politely ask clarifying questions in \`aiResponse\` to help them detail their needs, and set \`isWorkflowGenerationRequest\` to false. For example: 'I can definitely help with that! Could you tell me a bit more about what you'd like this workflow to do?'
- Keep your chat responses helpful, concise, and easy to understand.
- If you don't know the answer to a question, say so.

Workflow Node Types available in Kairo: webhookTrigger, fileSystemTrigger, getEnvironmentVariable, httpRequest, schedule, sendEmail, databaseQuery, googleCalendarListEvents, parseJson, logMessage, aiTask, conditionalLogic, dataTransform, executeFlowGroup, forEach, whileLoop, parallel, manualInput, callExternalWorkflow, delay, youtubeFetchTrending, youtubeDownloadVideo, videoConvertToShorts, youtubeUploadShort, workflowNode, unknown.

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
      return { aiResponse: "I'm sorry, I wasn't able to generate a response. Could you try rephrasing?" };
    }
    // Ensure that if it's a generation request, the prompt field is also populated.
    if (output.isWorkflowGenerationRequest && !output.workflowGenerationPrompt) {
        console.warn("AI indicated workflow generation but didn't provide a prompt. Treating as chat.");
        return {
            aiResponse: output.aiResponse || "It seems I was about to generate something, but I'm missing the details. Could you clarify what workflow you'd like?",
            isWorkflowGenerationRequest: false
        };
    }
    return output;
  }
);

