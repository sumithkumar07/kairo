
'use server';
/**
 * @fileOverview A minimal flow to test API key and basic Genkit functionality.
 *
 * - testApiKey - A function that attempts a very simple AI generation.
 * - TestApiKeyOutput - The return type for the testApiKey function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TestApiKeyOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.string().optional(),
});
export type TestApiKeyOutput = z.infer<typeof TestApiKeyOutputSchema>;

export async function testApiKey(): Promise<TestApiKeyOutput> {
  return testApiKeyFlow();
}

const testPrompt = ai.definePrompt({
  name: 'testApiKeyPrompt',
  input: {schema: z.undefined()}, // No input needed
  output: {schema: z.object({responseText: z.string()})},
  prompt: `Say "Hello Kairo!"`,
});

const testApiKeyFlow = ai.defineFlow(
  {
    name: 'testApiKeyFlow',
    inputSchema: z.undefined(),
    outputSchema: TestApiKeyOutputSchema,
  },
  async () => {
    console.log('[TEST API KEY FLOW] Attempting simple AI generation...');
    try {
      const {output} = await testPrompt(undefined);
      if (!output || !output.responseText) {
        console.error('[TEST API KEY FLOW] AI returned empty or invalid response.');
        return {
          success: false,
          message: 'AI returned an empty or invalid response.',
        };
      }
      console.log('[TEST API KEY FLOW] AI generation successful:', output.responseText);
      return {
        success: true,
        message: 'AI Call Successful!',
        data: output.responseText,
      };
    } catch (error: any) {
      console.error('[TEST API KEY FLOW] Error during AI generation:', error);
      let errorMessage = 'Unknown error during AI call.';
      if (error.message) {
        errorMessage = error.message;
      }
      // Check for common API key related error messages
      const lowerErrorMessage = errorMessage.toLowerCase();
      if (lowerErrorMessage.includes('api key not valid') || 
          lowerErrorMessage.includes('permission denied') || 
          lowerErrorMessage.includes('forbidden') ||
          lowerErrorMessage.includes('provide an api key') ||
          lowerErrorMessage.includes('authenticate') ||
          (error.status && (error.status === 401 || error.status === 403)) ||
          (error.code && (error.code === 401 || error.code === 403))) {
        errorMessage = `API Key or Permissions Error: ${errorMessage}. Ensure your GOOGLE_API_KEY is correct and the Generative Language API is enabled in your Google Cloud project.`;
      } else if (lowerErrorMessage.includes('quota')) {
        errorMessage = `Quota Exceeded: ${errorMessage}.`;
      } else if (lowerErrorMessage.includes('safety') || lowerErrorMessage.includes('blocked')) {
        errorMessage = `Content Safety Issue: ${errorMessage}.`;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }
);
