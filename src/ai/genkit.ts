
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai'; // Import Google AI plugin

// CRITICAL CHECK for GOOGLE_API_KEY availability during Genkit initialization
console.log(
  '[GENKIT.TS INITIALIZATION] GOOGLE_API_KEY check. Available: ',
  process.env.GOOGLE_API_KEY ? `Yes (starts with: ${process.env.GOOGLE_API_KEY.substring(0, 8)}...)` : 'No / Empty / Undefined'
);
if (!process.env.GOOGLE_API_KEY) {
  console.error("[GENKIT.TS INITIALIZATION] FATAL: GOOGLE_API_KEY is not defined in the environment. Genkit GoogleAI plugin will likely fail to initialize, leading to errors when using the 'ai' object.");
}

// Define a Google AI model.
const geminiPro = googleAI.model('gemini-1.5-pro-latest');

export const ai = genkit({
  plugins: [
    googleAI(), // Configure Genkit with the Google AI plugin
  ],
  models: [
    geminiPro,
    // You can add other Google AI models here if needed
    // e.g., googleAI.model('gemini-1.5-flash-latest')
  ],
  // Set the default model for the `ai` instance.
  model: 'googleai/gemini-1.5-pro-latest', 
});


