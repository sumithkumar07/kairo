
'use server';
/**
 * @fileOverview An AI flow to handle conversational chat with the Kairo assistant.
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
  aiResponse: z.string().describe("The AI assistant's response to the user's message."),
});
export type AssistantChatOutput = z.infer<typeof AssistantChatOutputSchema>;

export async function assistantChat(input: AssistantChatInput): Promise<AssistantChatOutput> {
  return assistantChatFlow(input);
}

const chatPrompt = ai.definePrompt({
  name: 'assistantChatPrompt',
  input: {schema: AssistantChatInputSchema},
  output: {schema: AssistantChatOutputSchema},
  prompt: `You are Kairo, a friendly and helpful AI assistant for a workflow automation tool.
The user is interacting with you in a chat window within the Kairo application.
Your primary role is to answer questions about:
- How to use Kairo.
- Features of Kairo.
- Specific workflow nodes (types: webhookTrigger, fileSystemTrigger, getEnvironmentVariable, httpRequest, schedule, sendEmail, databaseQuery, googleCalendarListEvents, parseJson, logMessage, aiTask, conditionalLogic, dataTransform, executeFlowGroup, forEach, whileLoop, parallel, manualInput, callExternalWorkflow, delay, youtubeFetchTrending, youtubeDownloadVideo, videoConvertToShorts, youtubeUploadShort, workflowNode, unknown) and their configurations.
- General concepts of workflow automation.
- Best practices for designing workflows.
- Troubleshooting common issues.

You can also provide:
- Brief suggestions for how to approach a problem with Kairo.
- Clarifications on workflow logic.

IMPORTANT:
- DO NOT attempt to generate full JSON workflow definitions in this chat. The user has a separate "Generate Workflow" feature for that.
- If the user asks you to "create a workflow for X" or "build this for me", politely guide them to use the dedicated "Generate Workflow" feature or to build it manually using the visual editor. You can offer high-level steps or suggest node types if appropriate, but not the full JSON.
- If the user's query seems like a command to generate a full workflow, respond by saying something like: "To generate a new workflow, please use the 'Describe your workflow to the AI...' prompt bar at the top of the main canvas area. I can help you understand how to build it or answer questions about specific parts!"
- Keep your responses concise and helpful.
- If you don't know the answer, say so.

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

AI Response:
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
    return output;
  }
);

