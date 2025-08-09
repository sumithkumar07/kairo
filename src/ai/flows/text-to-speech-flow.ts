/**
 * @fileOverview AI flow for text-to-speech generation with voice customization
 * Note: This flow provides text-to-speech guidance using GROQ API for voice suggestions
 */

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { chatWithGroq, GroqChatMessage } from '@/lib/groq';

const TextToSpeechInputSchema = z.object({
  text: z.string(),
  voiceType: z.enum(['natural', 'professional', 'friendly', 'authoritative']).optional().default('natural'),
  language: z.string().optional().default('en'),
  speed: z.number().optional().default(1.0),
  customizations: z.string().optional(),
});

const TextToSpeechOutputSchema = z.object({
  processedText: z.string(),
  voiceRecommendations: z.array(z.object({
    voiceName: z.string(),
    description: z.string(),
    suitability: z.string(),
  })),
  pronunciationGuide: z.array(z.object({
    word: z.string(),
    phonetic: z.string(),
    note: z.string(),
  })),
  instructions: z.string(),
});

export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export const textToSpeechFlow = generate({
  name: 'textToSpeech',
  inputSchema: TextToSpeechInputSchema,
  outputSchema: TextToSpeechOutputSchema,
  fn: async (input: TextToSpeechInput): Promise<TextToSpeechOutput> => {
    const { text, voiceType, language } = input;

    const messages: GroqChatMessage[] = [
      {
        role: 'system',
        content: `You are a text-to-speech optimization expert. Help prepare text for optimal speech synthesis.

Your task is to:
1. Optimize the text for speech (add pauses, emphasis, etc.)
2. Recommend appropriate voice types
3. Identify words that might need pronunciation guidance
4. Provide setup instructions for TTS systems

Respond with a JSON object:
{
  "processedText": "Text optimized for speech synthesis with proper formatting",
  "voiceRecommendations": [
    {
      "voiceName": "Voice Name",
      "description": "Description of the voice",
      "suitability": "Why this voice works for this content"
    }
  ],
  "pronunciationGuide": [
    {
      "word": "difficult word",
      "phonetic": "phonetic spelling",
      "note": "pronunciation note"
    }
  ],
  "instructions": "Step-by-step instructions for implementing TTS"
}`
      },
      {
        role: 'user',
        content: `Optimize this text for text-to-speech synthesis:

Text: "${text}"
Voice Type: ${voiceType}
Language: ${language}

Please provide recommendations for voice selection, pronunciation guidance, and optimized text formatting for natural-sounding speech.`
      }
    ];

    const response = await chatWithGroq(messages, {
      model: 'llama-3.1-70b-versatile',
      temperature: 0.4,
      max_tokens: 2000
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      // Fallback response
      return {
        processedText: text,
        voiceRecommendations: [
          {
            voiceName: 'Standard Voice',
            description: 'Clear, neutral voice suitable for most content',
            suitability: 'Good general-purpose choice'
          }
        ],
        pronunciationGuide: [],
        instructions: 'Use any standard TTS service with the provided text and voice recommendations.'
      };
    }
  },
});