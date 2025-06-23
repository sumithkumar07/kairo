'use server';
/**
 * @fileOverview A simple Genkit flow to test if the Google API key is configured correctly.
 * This flow is a developer utility and is not actively used in the main application.
 *
 * - testApiKey - A function that makes a basic call to the GenAI model.
 * - TestApiKeyOutput - The return type for the testApiKey function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const TestApiKeyOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.string().optional(),
});
export type TestApiKeyOutput = z.infer<typeof TestApiKeyOutputSchema>;

export async function testApiKey(): Promise<TestApiKeyOutput> {
  console.log("[API Key Test Flow] Initiating test call to AI model...");
  try {
    const genkitResponse = await ai.generate({
      prompt: "Hello, world! Respond with 'OK' if you are working.",
      model: 'googleai/gemini-1.5-flash-latest',
      config: {
        temperature: 0.1,
      },
    });
    
    const textResponse = genkitResponse.text;
    console.log("[API Key Test Flow] Received AI response:", textResponse);

    if (textResponse && textResponse.includes('OK')) {
      return {
        success: true,
        message: 'API Key Test Successful!',
        data: textResponse,
      };
    } else {
       return {
        success: false,
        message: 'AI responded, but not with the expected content.',
        data: textResponse,
      };
    }

  } catch (error: any) {
    console.error("[API Key Test Flow] Error during AI call:", error);
    let errorMessage = "An unknown error occurred.";
    if (error.message) {
        errorMessage = `An unexpected error occurred: ${error.message}`;
    }
    return {
      success: false,
      message: errorMessage,
    };
  }
}
