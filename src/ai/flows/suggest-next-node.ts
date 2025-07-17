
'use server';

/**
 * @fileOverview Suggests the next logical node to add to a workflow based on the current structure and available node types.
 *
 * - suggestNextNode - A function that suggests the next node.
 * - SuggestNextNodeInput - The input type for the suggestNextNode function.
 * - SuggestNextNodeOutput - The return type for the suggestNextNode function.
 */

import { chatWithMistral, MistralChatMessage } from '@/lib/mistral';
import { z } from 'zod';

const AvailableNodeTypeSchema = z.object({
  type: z.string().describe('The unique type identifier of the node.'),
  name: z.string().describe('The display name of the node.'),
  description: z.string().optional().describe('A brief description of what the node does.'),
  category: z.string().describe('The category of the node (e.g., trigger, action, logic).')
});

const LeafNodeSchema = z.object({
    id: z.string(),
    type: z.string(),
    name: z.string(),
    description: z.string().optional(),
});

const SuggestNextNodeInputSchema = z.object({
  leafNodes: z.array(LeafNodeSchema).optional().describe('A list of current leaf nodes (nodes with open primary outputs) that could be a source for the next step. If empty, it means the canvas is empty.'),
  workflowContext: z.string().describe('General context about the workflow\'s goal or the nodes already on the canvas. (e.g., "User wants to process customer orders.")'),
  availableNodeTypes: z.array(AvailableNodeTypeSchema).describe('A list of all available node types the AI can suggest from.'),
});
export type SuggestNextNodeInput = z.infer<typeof SuggestNextNodeInputSchema>;

const SuggestNextNodeOutputSchema = z.object({
  suggestedNode: z.string().describe('The type of the suggested next node. This MUST be one of the types from the input availableNodeTypes list.'),
  reason: z.string().describe('The reasoning behind the suggestion, explaining why this node is a good fit given the context and available options.'),
  sourceNodeToConnect: z.string().optional().describe('If the suggestion involves connecting from an existing node, this is the ID of the leaf node to connect from.'),
});
export type SuggestNextNodeOutput = z.infer<typeof SuggestNextNodeOutputSchema>;

export async function suggestNextNode(input: SuggestNextNodeInput): Promise<SuggestNextNodeOutput> {
  try {
    console.log('[SUGGEST NODE] Generating next node suggestion with Mistral AI...');
    
    const systemPrompt = `You are a workflow automation expert. Your task is to suggest the next logical node to add to a workflow based on the current structure and available node types.

Given the current workflow state and available node types, suggest the most appropriate next node to add.

Rules:
1. The suggested node type MUST be exactly one of the types from the availableNodeTypes list
2. Consider the workflow context and existing leaf nodes
3. Suggest nodes that logically follow from the current state
4. If the canvas is empty, suggest appropriate trigger nodes
5. Provide clear reasoning for your suggestion

Your response MUST be a JSON object with:
- suggestedNode: The exact type from availableNodeTypes
- reason: Clear explanation of why this node is appropriate
- sourceNodeToConnect: (optional) ID of leaf node to connect from`;

    const userPrompt = `Workflow Context: ${input.workflowContext}

Current Leaf Nodes: ${input.leafNodes?.length ? input.leafNodes.map(n => `${n.id} (${n.type}): ${n.name}`).join(', ') : 'None (empty canvas)'}

Available Node Types: ${input.availableNodeTypes.map(n => `${n.type}: ${n.name} - ${n.description}`).join('\n')}

Suggest the next node to add to this workflow.`;

    const messages: MistralChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await chatWithMistral(messages, {
      model: 'mistral-small-latest',
      temperature: 0.7,
      max_tokens: 500
    });

    const result = JSON.parse(response.content);
    
    // Validate that the suggested node is in the available types
    const isValidType = input.availableNodeTypes.some(type => type.type === result.suggestedNode);
    
    if (!isValidType) {
      throw new Error(`Suggested node type "${result.suggestedNode}" is not in available node types`);
    }

    console.log('[SUGGEST NODE] Successfully generated suggestion:', result.suggestedNode);
    
    return {
      suggestedNode: result.suggestedNode,
      reason: result.reason,
      sourceNodeToConnect: result.sourceNodeToConnect
    };
    
  } catch (error) {
    console.error('[SUGGEST NODE] Error suggesting next node:', error);
    
    // Fallback suggestion
    const fallbackType = input.leafNodes?.length ? 'logMessage' : 'webhookTrigger';
    
    return {
      suggestedNode: fallbackType,
      reason: `Error occurred during suggestion. Providing fallback: ${fallbackType}`,
      sourceNodeToConnect: input.leafNodes?.[0]?.id
    };
  }
}

const prompt = ai.definePrompt({
  name: 'suggestNextNodePrompt',
  input: {schema: SuggestNextNodeInputSchema},
  output: {schema: SuggestNextNodeOutputSchema},
  prompt: `You are an AI Workflow Design Assistant. Your task is to suggest the most logical next node to add to a user's workflow based on the current context and a list of available node types.

Workflow Context/Goal: {{{workflowContext}}}

{{#if leafNodes}}
Current Leaf Nodes (nodes with open outputs):
{{#each leafNodes}}
- Node Name: "{{this.name}}", Type: "{{this.type}}", ID: "{{this.id}}"{{#if this.description}}, Description: "{{this.description}}"{{/if}}
{{/each}}
Based on these leaf nodes, suggest a logical next step. This could be a node that processes the output of one of the leaf nodes, or a new parallel task. If you suggest connecting from a leaf, specify its ID in the 'sourceNodeToConnect' field.
{{else}}
The workflow canvas is empty. Suggest a good trigger node to start the workflow.
{{/if}}

Available Node Types (Suggest ONLY from this list):
{{#each availableNodeTypes}}
- Type: "{{type}}", Name: "{{name}}", Description: "{{description}}", Category: "{{category}}"
{{/each}}

Based on the information above, analyze the user's likely intent and the capabilities of the available nodes.
Suggest the 'type' of the single most logical next node to add.
Provide a concise reason for your suggestion, explaining how it helps achieve the workflow goal or logically follows the current node(s).
If your suggestion connects to an existing leaf node, provide its ID in 'sourceNodeToConnect'.

Format your response as a JSON object with "suggestedNode", "reason", and optionally "sourceNodeToConnect" fields.
The "suggestedNode" MUST be one of the 'type' values from the "Available Node Types" list provided above.
`,
});

const suggestNextNodeFlow = ai.defineFlow(
  {
    name: 'suggestNextNodeFlow',
    inputSchema: SuggestNextNodeInputSchema,
    outputSchema: SuggestNextNodeOutputSchema,
  },
  async (input: SuggestNextNodeInput) => { // Explicitly type input here
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI failed to suggest a next node. Output was null.");
    }
    // Validate that the suggestedNode is one of the available types
    const isValidSuggestion = input.availableNodeTypes.some(node => node.type === output.suggestedNode);
    if (!isValidSuggestion) {
      console.warn(`AI suggested an invalid node type: ${output.suggestedNode}. Available types: ${input.availableNodeTypes.map(n => n.type).join(', ')}. Falling back to a generic suggestion if possible or erroring.`);
      // Potentially pick a default or throw a more specific error
      // For now, let's let it pass but ideally, the AI adheres to the prompt.
      // If this happens often, the prompt needs refinement or post-processing.
    }
    return output!;
  }
);
