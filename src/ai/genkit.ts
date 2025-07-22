
import { chatWithPuter, PuterChatMessage } from '@/lib/puter';

// CRITICAL CHECK for Puter.js availability (no API keys required)
console.log('[PUTER AI] Using Puter.js meta-llama/llama-4-maverick with unlimited usage');

// Export Puter.js AI utilities for use throughout the app
export const ai = {
  chat: chatWithPuter,
  client: null, // Puter.js doesn't need a separate client
  
  // Helper method to generate content
  async generate(prompt: string, options: { model?: string; temperature?: number; max_tokens?: number } = {}) {
    const messages: PuterChatMessage[] = [
      { role: 'user', content: prompt }
    ];
    
    return await chatWithPuter(messages, {
      model: options.model || 'meta-llama/llama-4-maverick',
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000
    });
  },

  // Tool definition helper (placeholder for compatibility)
  defineTool(config: any, handler: any) {
    return {
      name: config.name,
      description: config.description,
      inputSchema: config.inputSchema,
      outputSchema: config.outputSchema,
      handler: handler
    };
  }
};
