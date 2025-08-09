/**
 * @fileOverview AI flow for explaining existing workflows in plain language
 */

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { chatWithGroq, GroqChatMessage } from '@/lib/groq';

const WorkflowExplanationInputSchema = z.object({
  workflowData: z.any(),
  detailLevel: z.enum(['brief', 'detailed', 'technical']).optional().default('detailed'),
  audience: z.enum(['beginner', 'intermediate', 'expert']).optional().default('intermediate'),
});

const WorkflowExplanationOutputSchema = z.object({
  summary: z.string(),
  stepByStepExplanation: z.array(z.object({
    nodeId: z.string(),
    nodeName: z.string(),
    explanation: z.string(),
    purpose: z.string(),
  })),
  dataFlow: z.string(),
  potentialIssues: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type WorkflowExplanationInput = z.infer<typeof WorkflowExplanationInputSchema>;
export type WorkflowExplanationOutput = z.infer<typeof WorkflowExplanationOutputSchema>;

export const explainWorkflowFlow = generate({
  name: 'explainWorkflow',
  inputSchema: WorkflowExplanationInputSchema,
  outputSchema: WorkflowExplanationOutputSchema,
  fn: async (input: WorkflowExplanationInput): Promise<WorkflowExplanationOutput> => {
    const { workflowData, detailLevel, audience } = input;

    const messages: GroqChatMessage[] = [
      {
        role: 'system',
        content: `You are a workflow documentation expert that explains complex workflows in clear, understandable language.

Analyze the workflow and provide:
1. A clear summary of what the workflow does
2. Step-by-step explanation of each node
3. How data flows through the workflow
4. Potential issues or limitations
5. Suggestions for improvement

Adjust your language for a ${audience} audience with ${detailLevel} level of detail.

Respond with a JSON object:
{
  "summary": "High-level summary of what this workflow accomplishes",
  "stepByStepExplanation": [
    {
      "nodeId": "node_id",
      "nodeName": "Node Name",
      "explanation": "What this node does",
      "purpose": "Why this node is needed"
    }
  ],
  "dataFlow": "How data moves through the workflow",
  "potentialIssues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`
      },
      {
        role: 'user',
        content: `Please explain this workflow:

${JSON.stringify(workflowData, null, 2)}

Target audience: ${audience}
Detail level: ${detailLevel}

Provide a comprehensive explanation that helps understand what this workflow does and how it works.`
      }
    ];

    const response = await chatWithGroq(messages, {
      model: 'llama-3.1-70b-versatile',
      temperature: 0.4,
      max_tokens: 2500
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      // Fallback response
      return {
        summary: 'This workflow processes data through a series of connected nodes.',
        stepByStepExplanation: [
          {
            nodeId: 'unknown',
            nodeName: 'Workflow Node',
            explanation: 'Processes data according to its configuration',
            purpose: 'Part of the overall workflow automation'
          }
        ],
        dataFlow: 'Data flows from input to output through the connected nodes.',
        potentialIssues: ['Unable to analyze specific issues without proper workflow structure'],
        suggestions: ['Review workflow configuration', 'Add error handling where appropriate']
      };
    }
  },
});