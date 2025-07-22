// The directive tells the Next.js runtime to execute this code on the server.
'use server';

/**
 * @fileOverview AI-powered workflow generator from a plain-text prompt using Mistral AI.
 *
 * - generateWorkflowFromPrompt - A function that takes a plain-text workflow description and returns a JSON representation of the workflow.
 * - GenerateWorkflowFromPromptInput - The input type for the generateWorkflowFromPrompt function.
 * - GenerateWorkflowFromPromptOutput - The return type for the generateWorkflowFromPrompt function, which represents the workflow definition.
 */

import { generateWorkflowFromPrompt as puterGenerateWorkflow } from '@/lib/puter';
import { z } from 'zod';
import { GenerateWorkflowFromPromptOutputSchema } from '@/ai/schemas';

export type GenerateWorkflowFromPromptOutput = z.infer<typeof GenerateWorkflowFromPromptOutputSchema>;

// Input schema: a simple text prompt describing the desired workflow.
const GenerateWorkflowFromPromptInputSchema = z.object({
  prompt: z.string().describe('A plain-text description of the workflow to generate (e.g., "When I upload a YouTube video, download it, generate a transcript, create an AI summary, and post it to Slack channel #updates").'),
});

export type GenerateWorkflowFromPromptInput = z.infer<typeof GenerateWorkflowFromPromptInputSchema>;

// Exported function to generate a workflow from a prompt.
export async function generateWorkflowFromPrompt(input: GenerateWorkflowFromPromptInput): Promise<GenerateWorkflowFromPromptOutput> {
  try {
    console.log('[WORKFLOW GENERATION] Starting workflow generation with Mistral AI...');
    
    const result = await mistralGenerateWorkflow(input.prompt);
    
    // Validate the result structure
    if (!result || typeof result !== 'object') {
      throw new Error('Invalid workflow structure returned from Mistral');
    }
    
    // Ensure required fields exist
    const workflow = {
      name: result.name || 'Generated Workflow',
      description: result.description || 'AI-generated workflow',
      nodes: result.nodes || [],
      connections: result.connections || []
    };
    
    // Filter out any invalid nodes
    const validNodes = workflow.nodes.filter((node: any) => {
      if (typeof node === 'object' && node !== null && node.id && node.type && node.position) {
        return true;
      }
      console.warn('[WORKFLOW GENERATION] Filtering out invalid node:', node);
      return false;
    });
    
    // Ensure connections have IDs
    const connectionsWithIds = workflow.connections.map((conn: any) => ({
      ...conn,
      id: conn.id || crypto.randomUUID()
    }));
    
    const finalWorkflow = {
      ...workflow,
      nodes: validNodes,
      connections: connectionsWithIds
    };
    
    console.log('[WORKFLOW GENERATION] Successfully generated workflow with', validNodes.length, 'nodes');
    
    return finalWorkflow;
    
  } catch (error) {
    console.error('[WORKFLOW GENERATION] Error generating workflow:', error);
    throw new Error(`Failed to generate workflow: ${error.message}`);
  }
}
