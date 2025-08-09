/**
 * @fileOverview AI flow for generating realistic test data for workflow testing
 */

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { chatWithGroq, GroqChatMessage } from '@/lib/groq';

const TestDataGenerationInputSchema = z.object({
  workflowData: z.any(),
  nodeType: z.string(),
  dataType: z.string().optional(),
  count: z.number().optional().default(5),
  customRequirements: z.string().optional(),
});

const TestDataGenerationOutputSchema = z.object({
  testData: z.array(z.any()),
  description: z.string(),
  usageInstructions: z.string(),
});

export type TestDataGenerationInput = z.infer<typeof TestDataGenerationInputSchema>;
export type TestDataGenerationOutput = z.infer<typeof TestDataGenerationOutputSchema>;

export const generateTestDataFlow = generate({
  name: 'generateTestData',
  inputSchema: TestDataGenerationInputSchema,
  outputSchema: TestDataGenerationOutputSchema,
  fn: async (input: TestDataGenerationInput): Promise<TestDataGenerationOutput> => {
    const { workflowData, nodeType, dataType, count, customRequirements } = input;

    const messages: GroqChatMessage[] = [
      {
        role: 'system',
        content: `You are a test data generation expert. Create realistic, diverse test data for workflow testing.

The test data should be:
1. Realistic and representative of real-world scenarios
2. Diverse to cover edge cases
3. Properly formatted for the specified node type
4. Include both positive and negative test cases

Respond with a JSON object:
{
  "testData": [/* array of test data objects */],
  "description": "Description of the generated test data",
  "usageInstructions": "How to use this test data"
}`
      },
      {
        role: 'user',
        content: `Generate ${count} test data samples for:

Node Type: ${nodeType}
${dataType ? `Data Type: ${dataType}` : ''}
${customRequirements ? `Custom Requirements: ${customRequirements}` : ''}

Workflow Context:
${JSON.stringify(workflowData, null, 2)}

Generate realistic, diverse test data that would be appropriate for this workflow.`
      }
    ];

    const response = await chatWithGroq(messages, {
      model: 'llama-3.1-70b-versatile',
      temperature: 0.8,
      max_tokens: 2000
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      // Fallback response
      return {
        testData: [
          { id: 1, name: 'Sample Test Data', value: 'test_value' },
          { id: 2, name: 'Another Sample', value: 'another_test_value' }
        ],
        description: 'Basic test data samples',
        usageInstructions: 'Use these samples to test your workflow nodes'
      };
    }
  },
});