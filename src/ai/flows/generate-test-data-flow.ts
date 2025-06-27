'use server';
/**
 * @fileOverview An AI flow to generate plausible test data for a given workflow node.
 *
 * - generateTestDataForNode - A function that takes node context and returns suggested test data.
 * - GenerateTestDataInput - The input type for the function.
 * - GenerateTestDataOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateTestDataInputSchema = z.object({
  nodeType: z.string().describe('The type of the node for which to generate data (e.g., httpRequest, webhookTrigger).'),
  nodeName: z.string().describe('The user-given name of the node (e.g., "Fetch User Profile").'),
  nodeDescription: z.string().optional().describe('The user-given description of the node.'),
  configFieldsToGenerate: z.array(z.string()).describe('An array of configuration field names for which to generate data (e.g., ["simulatedResponse", "simulatedStatusCode"] for httpRequest, or ["simulatedRequestBody"] for webhookTrigger).'),
  workflowContext: z.string().optional().describe('Optional context about the workflow, such as the output of the preceding node, to help generate more relevant data.'),
});
export type GenerateTestDataInput = z.infer<typeof GenerateTestDataInputSchema>;

// The output will be a flexible object, where keys are the config field names.
const GenerateTestDataOutputSchema = z.object({
  generatedData: z.record(z.any()).describe('An object where keys are the names of the config fields from the input, and values are the generated test data for those fields. The data should be in a format that can be directly used in the node\'s config (e.g., a JSON object for simulatedResponse, a number for simulatedStatusCode).'),
});
export type GenerateTestDataOutput = z.infer<typeof GenerateTestDataOutputSchema>;

export async function generateTestDataForNode(input: GenerateTestDataInput): Promise<GenerateTestDataOutput> {
  return generateTestDataFlow(input);
}

const testDataGeneratorPrompt = ai.definePrompt({
  name: 'generateTestDataPrompt',
  input: {schema: GenerateTestDataInputSchema},
  output: {schema: GenerateTestDataOutputSchema},
  prompt: `You are an expert Test Data Generation Assistant for a workflow automation tool.
Your goal is to create realistic and useful mock data for a specific node in a workflow, based on its type, name, and context.
The generated data MUST be in a format that can be directly used as a JSON object or primitive value.

Node Details:
- Type: {{nodeType}}
- Name: {{nodeName}}
{{#if nodeDescription}}- Description: {{nodeDescription}}{{/if}}

{{#if workflowContext}}
Workflow Context (e.g., data from previous nodes):
{{workflowContext}}
{{/if}}

You need to generate plausible data for the following configuration fields: {{#each configFieldsToGenerate}}'{{this}}'{{/each}}.

Instructions for different node types:
- **httpRequest**: For 'simulatedResponse', generate a JSON object that would be a plausible API response given the node's name (e.g., if name is "Fetch Users", return an array of user objects). For 'simulatedStatusCode', return a common success code like 200.
- **webhookTrigger**: For 'simulatedRequestBody', 'simulatedRequestHeaders', 'simulatedRequestQuery', generate plausible JSON objects representing an incoming HTTP request. The body should contain data relevant to the node's name (e.g., if name is "New Order Webhook", create an order object).
- **aiTask**: For 'simulatedOutput', generate a short text string that looks like a plausible response from an AI model, based on the node's name.
- **databaseQuery**: For 'simulatedResults', generate a JSON array of objects, where each object represents a database row. The structure should match what the query might return. For 'simulatedRowCount', return the number of objects in the array.
- **manualInput**: For 'simulatedResponse', generate a JSON object that matches what a user might enter into the form described by the node's name/description.
- **fileSystemTrigger**: For 'simulatedFileEvent', generate a JSON object with 'eventType' and 'filePath' keys.
- **callExternalWorkflow**: For 'simulatedOutput', generate a plausible JSON object representing the entire output of the called workflow.

Generate the data and return it in the 'generatedData' object, where keys are the field names from the input. For example, if you need to generate for 'simulatedResponse' and 'simulatedStatusCode', the output should be:
{ "generatedData": { "simulatedResponse": { ... }, "simulatedStatusCode": 200 } }

IMPORTANT: The entire output MUST be a single, valid JSON object conforming to the output schema.
`,
});

const generateTestDataFlow = ai.defineFlow(
  {
    name: 'generateTestDataFlow',
    inputSchema: GenerateTestDataInputSchema,
    outputSchema: GenerateTestDataOutputSchema,
  },
  async (input) => {
    if (!input.configFieldsToGenerate || input.configFieldsToGenerate.length === 0) {
        return { generatedData: {} };
    }
    const {output} = await generateTestDataGeneratorPrompt(input);
    if (!output) {
      throw new Error("AI failed to generate test data.");
    }
    // Ensure the generated data for JSON fields is stringified if it's an object, so it can be placed in a textarea.
    const sanitizedData: Record<string, any> = {};
    for (const key in output.generatedData) {
        const value = output.generatedData[key];
        if (typeof value === 'object' && value !== null) {
            sanitizedData[key] = JSON.stringify(value, null, 2);
        } else {
            sanitizedData[key] = value;
        }
    }

    return { generatedData: sanitizedData };
  }
);
