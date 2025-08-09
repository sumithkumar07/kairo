/**
 * @fileOverview AI flow for enhancing and expanding user prompts for better workflow generation
 */

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { chatWithGroq, GroqChatMessage } from '@/lib/groq';

const PromptEnhancementInputSchema = z.object({
  originalPrompt: z.string(),
  userContext: z.string().optional(),
  intendedComplexity: z.enum(['simple', 'medium', 'complex']).optional(),
});

const PromptEnhancementOutputSchema = z.object({
  enhancedPrompt: z.string(),
  suggestedImprovements: z.array(z.string()),
  clarifyingQuestions: z.array(z.string()),
  estimatedComplexity: z.string(),
});

export type PromptEnhancementInput = z.infer<typeof PromptEnhancementInputSchema>;
export type PromptEnhancementOutput = z.infer<typeof PromptEnhancementOutputSchema>;

export const enhanceUserPromptFlow = generate({
  name: 'enhanceUserPrompt',
  inputSchema: PromptEnhancementInputSchema,
  outputSchema: PromptEnhancementOutputSchema,
  fn: async (input: PromptEnhancementInput): Promise<PromptEnhancementOutput> => {
    const { originalPrompt, userContext } = input;

    const messages: GroqChatMessage[] = [
      {
        role: 'system',
        content: `You are a workflow automation expert that helps users refine their workflow ideas.

Your task is to enhance user prompts to make them more specific, actionable, and comprehensive for workflow generation.

Respond with a JSON object:
{
  "enhancedPrompt": "Improved, more detailed version of the original prompt",
  "suggestedImprovements": ["improvement1", "improvement2"],
  "clarifyingQuestions": ["question1", "question2"],
  "estimatedComplexity": "simple|medium|complex"
}`
      },
      {
        role: 'user',
        content: `Original prompt: "${originalPrompt}"
${userContext ? `User context: ${userContext}` : ''}

Please enhance this prompt to be more specific and actionable for workflow generation. Include relevant details, suggest improvements, and ask clarifying questions if needed.`
      }
    ];

    const response = await chatWithGroq(messages, {
      model: 'llama-3.1-70b-versatile',
      temperature: 0.6,
      max_tokens: 1500
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      // Fallback response
      return {
        enhancedPrompt: originalPrompt,
        suggestedImprovements: ['Add more specific details about inputs and outputs'],
        clarifyingQuestions: ['What specific data sources will you be working with?'],
        estimatedComplexity: 'medium'
      };
    }
  },
});