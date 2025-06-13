import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Example of defining a Google AI model.
// You can define multiple models from different providers if needed.
const geminiFlash = googleAI.model('gemini-1.5-flash-latest');

export const ai = genkit({
  plugins: [
    googleAI(), // Configure Genkit with the Google AI plugin
  ],
  models: [
    geminiFlash,
    // You can add other models here, for example:
    // googleAI.model('gemini-1.5-pro-latest'),
  ],
  // Set the default model for the `ai` instance.
  // Genkit automatically prefixes models with the plugin name, e.g., 'googleai/gemini-1.5-flash-latest'.
  model: 'googleai/gemini-1.5-flash-latest', 
});
