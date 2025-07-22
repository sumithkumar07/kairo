
'use server';

/**
 * @fileOverview Suggests the next logical node to add to a workflow based on the current structure and available node types.
 *
 * - suggestNextNode - A function that suggests the next node.
 * - SuggestNextNodeInput - The input type for the suggestNextNode function.
 * - SuggestNextNodeOutput - The return type for the suggestNextNode function.
 */

import { chatWithPuter, PuterChatMessage } from '@/lib/puter';
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
    console.log('[SUGGEST NODE] Generating next node suggestion with Puter.js meta-llama/llama-4-maverick...');
    
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

// These are legacy Genkit definitions that are no longer used
// The actual function implementation is above using Mistral AI directly
