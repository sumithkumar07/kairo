'use server';

/**
 * @fileOverview Suggests the next logical node to add to a workflow based on the current structure.
 *
 * - suggestNextNode - A function that suggests the next node.
 * - SuggestNextNodeInput - The input type for the suggestNextNode function.
 * - SuggestNextNodeOutput - The return type for the suggestNextNode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNextNodeInputSchema = z.object({
  currentNodeType: z.string().describe('The type of the current node.'),
  workflowContext: z.string().describe('Context about the current workflow.'),
});
export type SuggestNextNodeInput = z.infer<typeof SuggestNextNodeInputSchema>;

const SuggestNextNodeOutputSchema = z.object({
  suggestedNode: z.string().describe('The type of the suggested next node.'),
  reason: z.string().describe('The reasoning behind the suggestion.'),
});
export type SuggestNextNodeOutput = z.infer<typeof SuggestNextNodeOutputSchema>;

export async function suggestNextNode(input: SuggestNextNodeInput): Promise<SuggestNextNodeOutput> {
  return suggestNextNodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNextNodePrompt',
  input: {schema: SuggestNextNodeInputSchema},
  output: {schema: SuggestNextNodeOutputSchema},
  prompt: `You are an AI assistant that suggests the next logical node to add to a workflow.

  Given the current node type: {{{currentNodeType}}}
  And the workflow context: {{{workflowContext}}}

  Suggest the next node to add, and explain your reasoning.
  Format your response as a JSON object with "suggestedNode" and "reason" fields.
  `,
});

const suggestNextNodeFlow = ai.defineFlow(
  {
    name: 'suggestNextNodeFlow',
    inputSchema: SuggestNextNodeInputSchema,
    outputSchema: SuggestNextNodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
