
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

// Setup for plugins
const plugins = [
    googleAI(),
];

// OpenAI plugin support removed to fix build issues.
if (process.env.OPENAI_API_KEY) {
    console.log('[GENKIT.TS INITIALIZATION] OpenAI plugin support has been temporarily removed due to a missing package. OpenAI models will not be available.');
}

export const ai = genkit({
  plugins: plugins,
  // Set the default model for the `ai` instance.
  model: 'googleai/gemini-1.5-pro-latest', 
});
