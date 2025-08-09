/**
 * @fileOverview AI flow for suggesting the next logical node in a workflow based on context
 */

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { chatWithGroq, GroqChatMessage } from '@/lib/groq';

const NextNodeSuggestionInputSchema = z.object({
  workflowData: z.any(),
  currentNodeId: z.string(),
  userObjective: z.string().optional(),
  availableIntegrations: z.array(z.string()).optional(),
});

const NextNodeSuggestionOutputSchema = z.object({
  suggestions: z.array(z.object({
    nodeType: z.string(),
    name: z.string(),
    reason: z.string(),
    confidence: z.number(),
    configSuggestions: z.any().optional(),
  })),
  overallRecommendation: z.string(),
});

export type NextNodeSuggestionInput = z.infer<typeof NextNodeSuggestionInputSchema>;
export type NextNodeSuggestionOutput = z.infer<typeof NextNodeSuggestionOutputSchema>;

export const suggestNextNodeFlow = generate({
  name: 'suggestNextNode',
  inputSchema: NextNodeSuggestionInputSchema,
  outputSchema: NextNodeSuggestionOutputSchema,
  fn: async (input: NextNodeSuggestionInput): Promise<NextNodeSuggestionOutput> => {
    const { workflowData, currentNodeId, userObjective } = input;

    const messages: GroqChatMessage[] = [
      {
        role: 'system',
        content: `You are an intelligent workflow assistant that suggests the next logical node based on the current workflow state.

Analyze the workflow and suggest 3-5 appropriate next nodes. Consider:
1. Data flow and what the current node outputs
2. Common workflow patterns
3. The user's stated objective
4. Logical next steps in automation

Respond with a JSON object:
{
  "suggestions": [
    {
      "nodeType": "node_type",
      "name": "Descriptive Name",
      "reason": "Why this node makes sense",
      "confidence": 0.85,
      "configSuggestions": {}
    }
  ],
  "overallRecommendation": "Summary of the best path forward"
}`
      },
      {
        role: 'user',
        content: `Current workflow:
${JSON.stringify(workflowData, null, 2)}

Current node: ${currentNodeId}
${userObjective ? `User objective: ${userObjective}` : ''}

What should be the next node(s) in this workflow?`
      }
    ];

    const response = await chatWithGroq(messages, {
      model: 'llama-3.1-70b-versatile',
      temperature: 0.6,
      max_tokens: 2000
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      // Fallback response
      return {
        suggestions: [
          {
            nodeType: 'logMessage',
            name: 'Log Current State',
            reason: 'Good practice to log intermediate results',
            confidence: 0.7,
          }
        ],
        overallRecommendation: 'Consider adding logging or error handling nodes to improve workflow robustness.'
      };
    }
  },
});