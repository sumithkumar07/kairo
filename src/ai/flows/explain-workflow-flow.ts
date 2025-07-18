'use server';
/**
 * @fileOverview An AI flow to explain workflows using Mistral AI.
 */

import { chatWithMistral, MistralChatMessage } from '@/lib/mistral';
import { z } from 'zod';

// Input and Output Schemas
const ExplainWorkflowInputSchema = z.object({
  workflowData: z.any().describe('The workflow data to explain'),
  focus: z.string().optional().describe('Specific aspect to focus on (e.g., logic, performance, security)'),
  audience: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('intermediate').describe('Target audience level'),
});
export type ExplainWorkflowInput = z.infer<typeof ExplainWorkflowInputSchema>;

const ExplainWorkflowOutputSchema = z.object({
  explanation: z.string().describe('Detailed explanation of the workflow'),
  keyPoints: z.array(z.string()).describe('Key points about the workflow'),
  recommendations: z.array(z.string()).describe('Recommendations for improvement'),
  complexity: z.enum(['simple', 'medium', 'complex']).describe('Assessed complexity level'),
});
export type ExplainWorkflowOutput = z.infer<typeof ExplainWorkflowOutputSchema>;

// Exported wrapper function
export async function explainWorkflow(input: ExplainWorkflowInput): Promise<ExplainWorkflowOutput> {
  const systemPrompt = `You are an expert workflow automation consultant. Explain the given workflow in clear, understandable terms. Focus on:
1. Overall purpose and flow
2. Key components and their roles
3. Data flow and dependencies
4. Potential issues or improvements
5. Best practices

Tailor your explanation to the specified audience level.`;

  const messages: MistralChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { 
      role: 'user', 
      content: `Please explain this workflow:
      
Workflow Data: ${JSON.stringify(input.workflowData, null, 2)}
Focus: ${input.focus || 'general overview'}
Audience: ${input.audience || 'intermediate'}

Provide a clear explanation, key points, and recommendations for improvement.` 
    }
  ];

  const response = await chatWithMistral(messages, {
    model: 'mistral-small-latest',
    temperature: 0.4,
    max_tokens: 1500
  });

  try {
    const parsed = JSON.parse(response.content);
    return {
      explanation: parsed.explanation || response.content,
      keyPoints: parsed.keyPoints || ['This workflow processes data through multiple stages'],
      recommendations: parsed.recommendations || ['Consider adding error handling', 'Add monitoring for performance'],
      complexity: parsed.complexity || 'medium'
    };
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      explanation: response.content,
      keyPoints: ['This workflow processes data through multiple stages'],
      recommendations: ['Consider adding error handling', 'Add monitoring for performance'],
      complexity: 'medium'
    };
  }
}