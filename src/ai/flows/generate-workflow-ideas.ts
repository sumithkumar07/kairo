
'use server';
/**
 * @fileOverview An AI flow to generate a list of workflow ideas based on a user's query.
 *
 * - generateWorkflowIdeas - A function that takes a query and returns a list of workflow ideas.
 * - GenerateWorkflowIdeasInput - The input type for the function.
 * - GenerateWorkflowIdeasOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
// We can reuse the output schema from the main generator, as each "idea" is a full workflow.
import {GenerateWorkflowFromPromptOutputSchema} from './generate-workflow-from-prompt';

const GenerateWorkflowIdeasInputSchema = z.object({
  query: z.string().describe('The user\'s topic or query for workflow ideas (e.g., "social media", "data processing", "daily reports").'),
  count: z.number().optional().default(3).describe('The number of distinct workflow ideas to generate.'),
});
export type GenerateWorkflowIdeasInput = z.infer<typeof GenerateWorkflowIdeasInputSchema>;


const WorkflowIdeaSchema = z.object({
    name: z.string().describe("A short, descriptive name for the workflow idea."),
    description: z.string().describe("A one or two-sentence description of what the workflow does and its value."),
    workflow: GenerateWorkflowFromPromptOutputSchema.describe("The complete, valid JSON definition of the workflow, including nodes and connections, ready to be loaded into the editor."),
});


const GenerateWorkflowIdeasOutputSchema = z.object({
    ideas: z.array(WorkflowIdeaSchema).describe('An array of generated workflow ideas.'),
});
export type GenerateWorkflowIdeasOutput = z.infer<typeof GenerateWorkflowIdeasOutputSchema>;


export async function generateWorkflowIdeas(input: GenerateWorkflowIdeasInput): Promise<GenerateWorkflowIdeasOutput> {
  return generateWorkflowIdeasFlow(input);
}


const ideaGeneratorPrompt = ai.definePrompt({
  name: 'workflowIdeaGeneratorPrompt',
  input: {schema: GenerateWorkflowIdeasInputSchema},
  output: {schema: GenerateWorkflowIdeasOutputSchema},
  prompt: `You are an expert AI Technical Architect specializing in creating practical and inspiring workflow automation examples.
Your task is to generate a list of {{count}} distinct, complete, and production-ready workflow ideas based on the user's query: "{{query}}".

For each idea, you MUST provide:
1.  **name**: A short, clear, and descriptive name for the workflow (e.g., "Social Media Content Scheduler", "Automated Customer Feedback Analysis").
2.  **description**: A one or two-sentence summary of the workflow's purpose, what it automates, and its key benefits.
3.  **workflow**: The full, executable workflow definition as a JSON object containing 'nodes' and 'connections'. This definition MUST adhere to the same strict rules as the main workflow generator, including:
    -   Logical layout of nodes using 'position'.
    -   Correct use of 'inputMapping' to pass data between nodes.
    -   Inclusion of 'aiExplanation' for each node to guide the user.
    -   Use of placeholders like '{{credential.YourApiKey}}' for required secrets.
    -   Inclusion of simulation data (e.g., 'simulatedResponse') for nodes with external effects.
    -   Mandatory visual error handling for any node that might fail (e.g., httpRequest).

Think creatively! If the query is "social media", you could generate ideas for scheduling posts, analyzing comments, or tracking brand mentions. If the query is "data", you could generate ideas for ETL pipelines, report generation, or database backups.

The entire output MUST be a single, valid JSON object that strictly conforms to the output schema.
`,
});


const generateWorkflowIdeasFlow = ai.defineFlow(
  {
    name: 'generateWorkflowIdeasFlow',
    inputSchema: GenerateWorkflowIdeasInputSchema,
    outputSchema: GenerateWorkflowIdeasOutputSchema,
  },
  async (input) => {
    const {output} = await ideaGeneratorPrompt(input);
    if (!output || !output.ideas || output.ideas.length === 0) {
      throw new Error("AI failed to generate any workflow ideas for the given query.");
    }
    return output;
  }
);
