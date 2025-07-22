'use server';
/**
 * @fileOverview An AI flow to enhance user prompts using Puter.js meta-llama/llama-4-maverick.
 */

import { chatWithPuter, PuterChatMessage } from '@/lib/puter';
import { z } from 'zod';

// Input and Output Schemas
const EnhanceUserPromptInputSchema = z.object({
  userPrompt: z.string().describe('The original user prompt to enhance'),
  context: z.string().optional().describe('Additional context about the intended use'),
});
export type EnhanceUserPromptInput = z.infer<typeof EnhanceUserPromptInputSchema>;

const EnhanceUserPromptOutputSchema = z.object({
  enhancedPrompt: z.string().describe('The enhanced and improved prompt'),
  improvements: z.array(z.string()).describe('List of improvements made'),
  originalPrompt: z.string().describe('The original prompt for reference'),
});
export type EnhanceUserPromptOutput = z.infer<typeof EnhanceUserPromptOutputSchema>;

// Exported wrapper function
export async function enhanceUserPrompt(input: EnhanceUserPromptInput): Promise<EnhanceUserPromptOutput> {
  const systemPrompt = `You are an expert prompt engineer. Your task is to enhance user prompts to be more clear, specific, and actionable. Focus on:
1. Adding clarity and specificity
2. Including relevant context
3. Making the prompt more actionable
4. Maintaining the original intent

Provide the enhanced prompt and list the improvements you made.`;

  const messages: PuterChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { 
      role: 'user', 
      content: `Please enhance this user prompt:
      
Original Prompt: "${input.userPrompt}"
Context: ${input.context || 'No additional context provided'}

Please provide:
1. An enhanced version of the prompt
2. A list of improvements you made
3. Keep the original intent intact` 
    }
  ];

  const response = await chatWithPuter(messages, {
    model: 'meta-llama/llama-4-maverick',
    temperature: 0.5,
    max_tokens: 1000
  });

  try {
    const parsed = JSON.parse(response.content);
    return {
      enhancedPrompt: parsed.enhancedPrompt || response.content,
      improvements: parsed.improvements || ['Enhanced clarity and specificity'],
      originalPrompt: input.userPrompt
    };
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      enhancedPrompt: response.content,
      improvements: ['Enhanced clarity and specificity'],
      originalPrompt: input.userPrompt
    };
  }
}