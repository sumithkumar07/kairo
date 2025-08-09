// AI flow generation using GROQ API
import { chatWithGroq, GroqChatMessage } from '@/lib/groq';

export async function generateFlow(prompt: string) {
  const messages: GroqChatMessage[] = [
    { role: 'system', content: 'You are an AI assistant that helps generate workflows.' },
    { role: 'user', content: prompt }
  ];

  const response = await chatWithGroq(messages, {
    model: 'llama-3.1-70b-versatile',
    temperature: 0.7,
    max_tokens: 1000
  });

  return response.content;
}