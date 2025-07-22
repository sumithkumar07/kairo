'use server';
/**
 * @fileOverview An AI flow to generate workflow ideas using Puter.js meta-llama/llama-4-maverick.
 */

import { chatWithPuter, PuterChatMessage } from '@/lib/puter';
import { z } from 'zod';

// Input and Output Schemas
const GenerateWorkflowIdeasInputSchema = z.object({
  industry: z.string().optional().describe('The industry or domain for workflow ideas'),
  useCase: z.string().optional().describe('Specific use case or problem to solve'),
  complexity: z.enum(['simple', 'medium', 'complex']).optional().default('medium').describe('Desired complexity level'),
  keywords: z.array(z.string()).optional().describe('Keywords related to the workflow'),
});
export type GenerateWorkflowIdeasInput = z.infer<typeof GenerateWorkflowIdeasInputSchema>;

const GenerateWorkflowIdeasOutputSchema = z.object({
  ideas: z.array(z.object({
    title: z.string().describe('Title of the workflow idea'),
    description: z.string().describe('Description of what the workflow does'),
    useCase: z.string().describe('Primary use case for this workflow'),
    complexity: z.enum(['simple', 'medium', 'complex']).describe('Complexity level'),
    estimatedTime: z.string().describe('Estimated time to implement'),
    benefits: z.array(z.string()).describe('Key benefits of this workflow'),
    requiredIntegrations: z.array(z.string()).describe('Required third-party integrations'),
  })).describe('Array of workflow ideas'),
});
export type GenerateWorkflowIdeasOutput = z.infer<typeof GenerateWorkflowIdeasOutputSchema>;

// Exported wrapper function
export async function generateWorkflowIdeas(input: GenerateWorkflowIdeasInput): Promise<GenerateWorkflowIdeasOutput> {
  const systemPrompt = `You are an expert workflow automation consultant. Generate creative and practical workflow ideas based on the given criteria. Focus on:
1. Real-world applicability
2. Clear business value
3. Realistic implementation
4. Diverse use cases

Provide 3-5 workflow ideas with detailed information for each.`;

  const messages: MistralChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { 
      role: 'user', 
      content: `Generate workflow ideas based on these criteria:
      
Industry: ${input.industry || 'Any industry'}
Use Case: ${input.useCase || 'General automation'}
Complexity: ${input.complexity || 'medium'}
Keywords: ${input.keywords?.join(', ') || 'automation, efficiency'}

Please provide 3-5 practical workflow ideas with details about implementation, benefits, and required integrations.` 
    }
  ];

  const response = await chatWithMistral(messages, {
    model: 'mistral-small-latest',
    temperature: 0.8,
    max_tokens: 2000
  });

  try {
    const parsed = JSON.parse(response.content);
    return {
      ideas: parsed.ideas || [
        {
          title: 'Automated Data Processing',
          description: 'Process and transform data from multiple sources',
          useCase: 'Data management and analysis',
          complexity: 'medium',
          estimatedTime: '2-3 hours',
          benefits: ['Time savings', 'Error reduction', 'Consistency'],
          requiredIntegrations: ['Database', 'File storage', 'Email notifications']
        }
      ]
    };
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      ideas: [
        {
          title: 'Custom Workflow Solution',
          description: response.content,
          useCase: input.useCase || 'General automation',
          complexity: input.complexity || 'medium',
          estimatedTime: '1-2 hours',
          benefits: ['Improved efficiency', 'Reduced manual work'],
          requiredIntegrations: ['API connections', 'Data storage']
        }
      ]
    };
  }
}