'use server';
/**
 * @fileOverview An AI flow to diagnose workflow errors using Mistral AI.
 */

import { chatWithMistral, MistralChatMessage } from '@/lib/mistral';
import { z } from 'zod';

// Input and Output Schemas
const DiagnoseWorkflowErrorInputSchema = z.object({
  workflowData: z.any().describe('The workflow data that failed'),
  errorMessage: z.string().describe('The error message that occurred'),
  executionContext: z.any().optional().describe('Additional context about the execution'),
});
export type DiagnoseWorkflowErrorInput = z.infer<typeof DiagnoseWorkflowErrorInputSchema>;

const DiagnoseWorkflowErrorOutputSchema = z.object({
  diagnosis: z.string().describe('The diagnosis of the workflow error'),
  suggestions: z.array(z.string()).describe('Suggested fixes for the error'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).describe('The severity of the error'),
});
export type DiagnoseWorkflowErrorOutput = z.infer<typeof DiagnoseWorkflowErrorOutputSchema>;

// Exported wrapper function
export async function diagnoseWorkflowError(input: DiagnoseWorkflowErrorInput): Promise<DiagnoseWorkflowErrorOutput> {
  const systemPrompt = `You are an expert workflow automation engineer. Analyze the given workflow error and provide:
1. A clear diagnosis of what went wrong
2. Specific suggestions to fix the issue
3. The severity level of the error

Focus on practical, actionable solutions.`;

  const messages: MistralChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { 
      role: 'user', 
      content: `Analyze this workflow error:
      
Error Message: ${input.errorMessage}
Workflow Data: ${JSON.stringify(input.workflowData, null, 2)}
Execution Context: ${JSON.stringify(input.executionContext || {}, null, 2)}

Please provide a diagnosis, suggestions, and severity level.` 
    }
  ];

  const response = await chatWithMistral(messages, {
    model: 'mistral-small-latest',
    temperature: 0.3,
    max_tokens: 1000
  });

  try {
    const parsed = JSON.parse(response.content);
    return {
      diagnosis: parsed.diagnosis || response.content,
      suggestions: parsed.suggestions || ['Review the error message and check node configurations'],
      severity: parsed.severity || 'medium'
    };
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      diagnosis: response.content,
      suggestions: ['Review the error message and check node configurations'],
      severity: 'medium'
    };
  }
}