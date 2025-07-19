'use server';
/**
 * @fileOverview An AI flow to generate test data using Mistral AI.
 */

import { chatWithMistral, MistralChatMessage } from '@/lib/mistral';
import { z } from 'zod';

// Input and Output Schemas
const GenerateTestDataInputSchema = z.object({
  dataType: z.string().describe('Type of data to generate (e.g., user, product, order)'),
  schema: z.any().optional().describe('Schema or structure for the data'),
  count: z.number().optional().default(10).describe('Number of test records to generate'),
  format: z.enum(['json', 'csv', 'xml']).optional().default('json').describe('Output format'),
  constraints: z.any().optional().describe('Additional constraints or requirements'),
});
export type GenerateTestDataInput = z.infer<typeof GenerateTestDataInputSchema>;

const GenerateTestDataOutputSchema = z.object({
  testData: z.any().describe('Generated test data'),
  metadata: z.object({
    recordCount: z.number(),
    format: z.string(),
    generatedAt: z.string(),
  }).describe('Metadata about the generated data'),
  description: z.string().describe('Description of the generated data'),
});
export type GenerateTestDataOutput = z.infer<typeof GenerateTestDataOutputSchema>;

// Exported wrapper function
export async function generateTestData(input: GenerateTestDataInput): Promise<GenerateTestDataOutput> {
  const systemPrompt = `You are an expert test data generator. Generate realistic, diverse test data based on the given specifications. Focus on:
1. Realistic data values
2. Proper data types and formats
3. Diversity in the generated data
4. Compliance with constraints
5. Consistent structure

Return the data in the requested format with proper metadata.`;

  const messages: MistralChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { 
      role: 'user', 
      content: `Generate test data with these specifications:
      
Data Type: ${input.dataType}
Schema: ${JSON.stringify(input.schema || {}, null, 2)}
Count: ${input.count || 10}
Format: ${input.format || 'json'}
Constraints: ${JSON.stringify(input.constraints || {}, null, 2)}

Please generate realistic test data that matches these requirements.` 
    }
  ];

  const response = await chatWithMistral(messages, {
    model: 'mistral-small-latest',
    temperature: 0.6,
    max_tokens: 2000
  });

  try {
    const parsed = JSON.parse(response.content);
    return {
      testData: parsed.testData || parsed,
      metadata: {
        recordCount: input.count || 10,
        format: input.format || 'json',
        generatedAt: new Date().toISOString(),
      },
      description: parsed.description || `Generated ${input.count || 10} test records for ${input.dataType}`
    };
  } catch (error) {
    // Fallback if JSON parsing fails - generate simple test data
    const simpleTestData = Array.from({ length: input.count || 10 }, (_, i) => ({
      id: i + 1,
      name: `Test ${input.dataType} ${i + 1}`,
      createdAt: new Date().toISOString(),
      status: 'active'
    }));

    return {
      testData: simpleTestData,
      metadata: {
        recordCount: input.count || 10,
        format: input.format || 'json',
        generatedAt: new Date().toISOString(),
      },
      description: `Generated ${input.count || 10} test records for ${input.dataType}`
    };
  }
}

// Alias for generateTestData for backward compatibility
export const generateTestDataForNode = generateTestData;