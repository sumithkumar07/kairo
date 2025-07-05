
'use server';
/**
 * @fileOverview An AI flow to enhance a user's prompt for workflow generation.
 *
 * - enhanceUserPrompt - A function that takes a user's raw prompt and returns an enhanced version.
 * - EnhanceUserPromptInput - The input type for the enhanceUserPrompt function.
 * - EnhanceUserPromptOutput - The return type for the enhanceUserPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceUserPromptInputSchema = z.object({
  originalPrompt: z.string().describe('The user\'s initial, potentially brief or ambiguous, prompt for a workflow.'),
});
export type EnhanceUserPromptInput = z.infer<typeof EnhanceUserPromptInputSchema>;

const EnhanceUserPromptOutputSchema = z.object({
  enhancedPrompt: z.string().describe('The enhanced prompt, which should be clearer, more detailed, and better structured for an AI workflow generation system. It should elaborate on steps, infer potential data flows, and clarify any ambiguities from the original prompt. The enhanced prompt should sound natural, as if a helpful expert refined the user\'s original idea.'),
});
export type EnhanceUserPromptOutput = z.infer<typeof EnhanceUserPromptOutputSchema>;

export async function enhanceUserPrompt(input: EnhanceUserPromptInput): Promise<EnhanceUserPromptOutput> {
  return enhanceUserPromptFlow(input);
}

const promptEnhancer = ai.definePrompt({
  name: 'enhanceUserPromptAssistant',
  input: {schema: EnhanceUserPromptInputSchema},
  output: {schema: EnhanceUserPromptOutputSchema},
  prompt: `You are an expert AI assistant specializing in understanding and refining user requests for workflow automation.
Your goal is to take a user's potentially brief or ambiguous prompt and transform it into a clear, detailed, and well-structured prompt that an AI workflow generator can easily understand and act upon. The enhanced prompt should sound natural, as if a helpful expert refined the user\'s original idea.

Consider the following when enhancing the prompt:
- **Explicitness:** Ensure all intended steps are clearly stated. If the user says "process a file and email results," what does "process" mean? What kind of file? What specific results should be emailed?
- **Detail:** Add reasonable details if they can be safely inferred or if they are common for such a task. For example, if a user wants to "fetch API data," mention that this usually involves specifying a URL and method.
- **Structure:** Organize the prompt logically, perhaps as a sequence of actions.
- **Data Flow:** If data seems to flow from one step to another, try to make this implicit connection more explicit in the enhanced prompt.
- **Ambiguity Reduction:** Identify and attempt to resolve any ambiguities. If clarification is impossible, the enhanced prompt can still highlight the ambiguous part.
- **Completeness:** Does the prompt seem to cover a full, logical operation?

Do NOT invent entirely new, unrelated functionalities. Stick to enhancing the user's stated intent.
The output should be only the enhanced prompt text.

User's Original Prompt:
"{{originalPrompt}}"

Enhanced Prompt:
`,
});

const enhanceUserPromptFlow = ai.defineFlow(
  {
    name: 'enhanceUserPromptFlow',
    inputSchema: EnhanceUserPromptInputSchema,
    outputSchema: EnhanceUserPromptOutputSchema,
  },
  async (input) => {
    const {output} = await promptEnhancer(input);
    if (!output) {
      // Fallback to original prompt if enhancer fails to produce output
      console.warn("Prompt enhancer failed to produce output. Using original prompt.");
      return { enhancedPrompt: input.originalPrompt };
    }
    return output;
  }
);




