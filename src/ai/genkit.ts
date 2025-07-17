
import { mistralClient, chatWithMistral, MistralChatMessage } from '@/lib/mistral';

// CRITICAL CHECK for MISTRAL_API_KEY availability
console.log(
  '[MISTRAL AI] MISTRAL_API_KEY check. Available: ',
  process.env.MISTRAL_API_KEY ? `Yes (starts with: ${process.env.MISTRAL_API_KEY.substring(0, 8)}...)` : 'Using fallback key'
);

if (!process.env.MISTRAL_API_KEY) {
  console.log("[MISTRAL AI] Using fallback API key for Mistral integration");
}

// Export Mistral client and utilities for use throughout the app
export const ai = {
  chat: chatWithMistral,
  client: mistralClient,
  
  // Helper method to generate content
  async generate(prompt: string, options: { model?: string; temperature?: number; max_tokens?: number } = {}) {
    const messages: MistralChatMessage[] = [
      { role: 'user', content: prompt }
    ];
    
    return await chatWithMistral(messages, {
      model: options.model || 'mistral-small-latest',
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000
    });
  }
};
