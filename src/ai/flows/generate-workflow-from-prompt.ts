/**
 * @fileOverview AI-powered workflow generator from a plain-text prompt using GROQ API with Llama models.
 * Converts natural language descriptions into complete, executable workflows.
 */

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { generateWorkflowFromPrompt as groqGenerateWorkflow } from '@/lib/groq';

const WorkflowGenerationInputSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  context: z.string().optional(),
  complexity: z.enum(['simple', 'medium', 'complex']).optional().default('medium'),
  integrations: z.array(z.string()).optional(),
});

const WorkflowGenerationOutputSchema = z.object({
  name: z.string(),
  description: z.string(),
  nodes: z.array(z.any()),
  connections: z.array(z.any()),
  metadata: z.object({
    estimatedComplexity: z.string(),
    requiredIntegrations: z.array(z.string()),
    estimatedExecutionTime: z.string(),
  }).optional(),
});

export type WorkflowGenerationInput = z.infer<typeof WorkflowGenerationInputSchema>;
export type WorkflowGenerationOutput = z.infer<typeof WorkflowGenerationOutputSchema>;

export const generateWorkflowFromPromptFlow = generate({
  name: 'generateWorkflowFromPrompt',
  inputSchema: WorkflowGenerationInputSchema,
  outputSchema: WorkflowGenerationOutputSchema,
  fn: async (input: WorkflowGenerationInput): Promise<WorkflowGenerationOutput> => {
    const { prompt, context } = input;

    try {
      const workflow = await groqGenerateWorkflow(prompt);
      
      if (!workflow || !workflow.nodes || !Array.isArray(workflow.nodes)) {
        throw new Error('Invalid workflow structure returned from GROQ API');
      }

      return {
        name: workflow.name || 'Generated Workflow',
        description: workflow.description || 'AI-generated workflow',
        nodes: workflow.nodes,
        connections: workflow.connections || [],
        metadata: {
          estimatedComplexity: input.complexity || 'medium',
          requiredIntegrations: workflow.requiredIntegrations || [],
          estimatedExecutionTime: workflow.estimatedExecutionTime || 'Unknown',
        }
      };
    } catch (error) {
      console.error('Error generating workflow:', error);
      
      // Return a basic fallback workflow
      return {
        name: 'Basic Workflow',
        description: 'A simple workflow template',
        nodes: [
          {
            id: 'start',
            type: 'trigger',
            name: 'Start',
            position: { x: 100, y: 100 },
            config: {},
            aiExplanation: 'This is the starting point of your workflow'
          }
        ],
        connections: [],
        metadata: {
          estimatedComplexity: 'simple',
          requiredIntegrations: [],
          estimatedExecutionTime: '1-2 minutes',
        }
      };
    }
  },
});