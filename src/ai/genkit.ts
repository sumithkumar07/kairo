
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai'; // Import Google AI plugin

// Define a Google AI model.
const geminiFlash = googleAI.model('gemini-1.5-flash-latest');

export const ai = genkit({
  plugins: [
    googleAI(), // Configure Genkit with the Google AI plugin
  ],
  models: [
    geminiFlash,
    // You can add other Google AI models here if needed
    // e.g., googleAI.model('gemini-pro')
  ],
  // Set the default model for the `ai` instance.
  model: 'googleai/gemini-1.5-flash-latest', 
});
