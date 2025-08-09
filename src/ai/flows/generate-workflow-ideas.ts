/**
 * @fileOverview AI flow for generating creative workflow ideas based on user context
 */

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { chatWithGroq, GroqChatMessage } from '@/lib/groq';

const WorkflowIdeasInputSchema = z.object({
  industry: z.string().optional(),
  businessFunction: z.string().optional(),
  currentChallenges: z.string().optional(),
  availableTools: z.array(z.string()).optional(),
  complexity: z.enum(['simple', 'medium', 'complex']).optional(),
});

const WorkflowIdeasOutputSchema = z.object({
  ideas: z.array(z.object({
    title: z.string(),
    description: z.string(),
    benefits: z.array(z.string()),
    complexity: z.string(),
    estimatedTime: z.string(),
    requiredIntegrations: z.array(z.string()),
  })),
  recommendation: z.string(),
});

export type WorkflowIdeasInput = z.infer<typeof WorkflowIdeasInputSchema>;
export type WorkflowIdeasOutput = z.infer<typeof WorkflowIdeasOutputSchema>;

export const generateWorkflowIdeasFlow = generate({
  name: 'generateWorkflowIdeas',
  inputSchema: WorkflowIdeasInputSchema,
  outputSchema: WorkflowIdeasOutputSchema,
  fn: async (input: WorkflowIdeasInput): Promise<WorkflowIdeasOutput> => {
    const { industry, businessFunction, currentChallenges } = input;

    const messages: GroqChatMessage[] = [
      {
        role: 'system',
        content: `You are a workflow automation consultant that generates creative and practical workflow ideas.

Generate 5-7 workflow ideas that would be valuable for the user's context. Focus on:
1. Real business value and impact
2. Practical implementation
3. Clear benefits and outcomes
4. Appropriate complexity level

Respond with a JSON object:
{
  "ideas": [
    {
      "title": "Workflow Title",
      "description": "Detailed description",
      "benefits": ["benefit1", "benefit2"],
      "complexity": "simple|medium|complex",
      "estimatedTime": "time to implement",
      "requiredIntegrations": ["integration1", "integration2"]
    }
  ],
  "recommendation": "Overall recommendation on where to start"
}`
      },
      {
        role: 'user',
        content: `Generate workflow automation ideas for:

${industry ? `Industry: ${industry}` : ''}
${businessFunction ? `Business Function: ${businessFunction}` : ''}
${currentChallenges ? `Current Challenges: ${currentChallenges}` : ''}

Please suggest practical workflow automation ideas that would provide real business value.`
      }
    ];

    const response = await chatWithGroq(messages, {
      model: 'llama-3.1-70b-versatile',
      temperature: 0.7,
      max_tokens: 2500
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      // Fallback response
      return {
        ideas: [
          {
            title: 'Data Processing Automation',
            description: 'Automate routine data processing tasks',
            benefits: ['Save time', 'Reduce errors'],
            complexity: 'medium',
            estimatedTime: '2-3 hours to setup',
            requiredIntegrations: ['Database', 'Email']
          }
        ],
        recommendation: 'Start with simple data processing workflows to build familiarity with the platform'
      };
    }
  },
});