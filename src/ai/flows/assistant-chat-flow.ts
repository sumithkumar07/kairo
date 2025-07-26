
'use server';
/**
 * @fileOverview An AI flow to handle conversational chat with the Kairo assistant using Puter.js meta-llama/llama-4-maverick.
 * It can manage and run workflows, identify if a user's message is a request to generate a workflow,
 * or analyze the current workflow for issues, providing suggestions or asking for clarification.
 */

import { assistantChat as puterAssistantChat } from '@/lib/puter';
import { z } from 'zod';

// Minimal Schemas for workflow context analysis by the chat AI
const MinimalWorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  config: z.any().optional(),
  inputHandles: z.array(z.string()).optional(),
  outputHandles: z.array(z.string()).optional(),
  aiExplanation: z.string().optional(),
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
  imageDataUri: z.string().optional().describe("An optional image provided by the user, as a data URI."),
  workflowContext: z.string().optional().describe("Optional context about the current workflow."),
  chatHistory: z.array(z.object({
    sender: z.enum(['user', 'ai']),
    message: z.string(),
  })).optional().describe("Previous messages in the conversation to maintain context."),
  currentWorkflowNodes: z.array(MinimalWorkflowNodeSchema).optional().describe("The current list of nodes on the workflow canvas."),
  currentWorkflowConnections: z.array(MinimalWorkflowConnectionSchema).optional().describe("The current list of connections on the workflow canvas."),
  enabledTools: z.array(z.string()).optional().describe("A list of tool names that the AI is currently configured to use."),
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
 * Main exported function to handle assistant chat using Puter.js meta-llama/llama-4-maverick.
 */
export async function assistantChat(input: AssistantChatInput): Promise<AssistantChatOutput> {
  try {
    console.log('[ASSISTANT CHAT] Processing user message with Puter.js meta-llama/llama-4-maverick...');
    
    // Prepare workflow context if available
    let workflowContext = input.workflowContext || '';
    
    if (input.currentWorkflowNodes && input.currentWorkflowNodes.length > 0) {
      workflowContext += `\nCurrent workflow has ${input.currentWorkflowNodes.length} nodes: ${input.currentWorkflowNodes.map(n => `${n.name || n.id} (${n.type})`).join(', ')}`;
    }
    
    const result = await puterAssistantChat(
      input.userMessage,
      input.chatHistory || [],
      workflowContext
    );
    
    console.log('[ASSISTANT CHAT] Successfully processed message');
    
    return {
      aiResponse: result.aiResponse,
      isWorkflowGenerationRequest: result.isWorkflowGenerationRequest,
      workflowGenerationPrompt: result.workflowGenerationPrompt,
    };
    
  } catch (error) {
    console.error('[ASSISTANT CHAT] Error in assistant chat:', error);
    
    let userErrorMessage = "I'm sorry, I encountered an error while processing your message. Please try again.";
    
    if ((error as Error)?.message) {
      const msg = String((error as Error).message).toLowerCase();
      if (msg.includes('api key') || msg.includes('unauthorized')) {
        userErrorMessage = "There's an issue with the AI service configuration. Please check the API key settings.";
      } else if (msg.includes('quota') || msg.includes('rate limit')) {
        userErrorMessage = "The AI service is currently busy. Please try again in a few moments.";
      } else {
        userErrorMessage = `I encountered an error: ${String((error as Error)?.message || error).substring(0, 100)}. Please try again.`;
      }
    }
    
    return {
      aiResponse: userErrorMessage,
      isWorkflowGenerationRequest: false,
    };
  }
}

    