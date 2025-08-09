/**
 * @fileOverview AI flow for diagnosing workflow errors with detailed analysis
 */

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { chatWithGroq, GroqChatMessage } from '@/lib/groq';

const WorkflowErrorInputSchema = z.object({
  workflowData: z.any(),
  errorMessage: z.string(),
  nodeId: z.string().optional(),
  executionLog: z.array(z.any()).optional(),
});

const WorkflowErrorOutputSchema = z.object({
  diagnosis: z.string(),
  possibleCauses: z.array(z.string()),
  recommendations: z.array(z.string()),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  quickFix: z.string().optional(),
});

export type WorkflowErrorInput = z.infer<typeof WorkflowErrorInputSchema>;
export type WorkflowErrorOutput = z.infer<typeof WorkflowErrorOutputSchema>;

export const diagnoseWorkflowErrorFlow = generate({
  name: 'diagnoseWorkflowError',
  inputSchema: WorkflowErrorInputSchema,
  outputSchema: WorkflowErrorOutputSchema,
  fn: async (input: WorkflowErrorInput): Promise<WorkflowErrorOutput> => {
    const { workflowData, errorMessage, nodeId } = input;

    const messages: GroqChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert workflow debugging assistant. Analyze workflow errors and provide comprehensive diagnostics.
        
Your response must be a valid JSON object with the following structure:
{
  "diagnosis": "Clear explanation of what went wrong",
  "possibleCauses": ["cause1", "cause2", "cause3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "severity": "low|medium|high|critical",
  "quickFix": "Optional quick fix suggestion"
}`
      },
      {
        role: 'user',
        content: `Please diagnose this workflow error:

Error Message: ${errorMessage}
${nodeId ? `Failed Node ID: ${nodeId}` : ''}

Workflow Structure:
${JSON.stringify(workflowData, null, 2)}

Provide a detailed analysis of what went wrong and how to fix it.`
      }
    ];

    const response = await chatWithGroq(messages, {
      model: 'llama-3.1-70b-versatile',
      temperature: 0.3,
      max_tokens: 1500
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      // Fallback response if JSON parsing fails
      return {
        diagnosis: response.content,
        possibleCauses: ['Unable to parse detailed causes'],
        recommendations: ['Review the workflow configuration and error message'],
        severity: 'medium' as const,
        quickFix: 'Check node configurations and connections'
      };
    }
  },
});