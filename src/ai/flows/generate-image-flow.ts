/**
 * @fileOverview AI flow for generating image creation prompts and guidance
 * Note: This flow provides image generation guidance using GROQ API
 */

import { z } from 'zod';
import { generate } from '@genkit-ai/ai';
import { chatWithGroq, GroqChatMessage } from '@/lib/groq';

const ImageGenerationInputSchema = z.object({
  description: z.string(),
  style: z.enum(['realistic', 'artistic', 'cartoon', 'abstract', 'photographic']).optional().default('realistic'),
  aspectRatio: z.enum(['square', 'landscape', 'portrait']).optional().default('square'),
  colorScheme: z.string().optional(),
  additionalRequirements: z.string().optional(),
});

const ImageGenerationOutputSchema = z.object({
  optimizedPrompt: z.string(),
  styleRecommendations: z.array(z.object({
    style: z.string(),
    description: z.string(),
    whenToUse: z.string(),
  })),
  technicalSpecs: z.object({
    recommendedSize: z.string(),
    aspectRatio: z.string(),
    qualitySettings: z.string(),
  }),
  alternatives: z.array(z.string()),
  instructions: z.string(),
});

export type ImageGenerationInput = z.infer<typeof ImageGenerationInputSchema>;
export type ImageGenerationOutput = z.infer<typeof ImageGenerationOutputSchema>;

export const generateImageFlow = generate({
  name: 'generateImage',
  inputSchema: ImageGenerationInputSchema,
  outputSchema: ImageGenerationOutputSchema,
  fn: async (input: ImageGenerationInput): Promise<ImageGenerationOutput> => {
    const { description, style, aspectRatio, colorScheme } = input;

    const messages: GroqChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert in image generation prompts and visual design. Help optimize image generation requests.

Your task is to:
1. Create an optimized prompt for image generation
2. Recommend appropriate styles and settings
3. Suggest technical specifications
4. Provide alternative approaches
5. Give clear implementation instructions

Respond with a JSON object:
{
  "optimizedPrompt": "Detailed, optimized prompt for image generation",
  "styleRecommendations": [
    {
      "style": "Style Name",
      "description": "Description of the style",
      "whenToUse": "When this style is most appropriate"
    }
  ],
  "technicalSpecs": {
    "recommendedSize": "recommended image dimensions",
    "aspectRatio": "aspect ratio details",
    "qualitySettings": "quality recommendations"
  },
  "alternatives": ["alternative approach 1", "alternative approach 2"],
  "instructions": "Step-by-step instructions for image generation"
}`
      },
      {
        role: 'user',
        content: `Create an optimized image generation prompt for:

Description: "${description}"
Style: ${style}
Aspect Ratio: ${aspectRatio}
${colorScheme ? `Color Scheme: ${colorScheme}` : ''}

Please provide a comprehensive prompt optimization and implementation guidance.`
      }
    ];

    const response = await chatWithGroq(messages, {
      model: 'llama-3.1-70b-versatile',
      temperature: 0.6,
      max_tokens: 2000
    });

    try {
      return JSON.parse(response.content);
    } catch (error) {
      // Fallback response
      return {
        optimizedPrompt: description,
        styleRecommendations: [
          {
            style: style,
            description: `${style} style image generation`,
            whenToUse: 'For general purpose image creation'
          }
        ],
        technicalSpecs: {
          recommendedSize: '1024x1024',
          aspectRatio: aspectRatio,
          qualitySettings: 'High quality, detailed rendering'
        },
        alternatives: ['Try different style variations', 'Adjust lighting and composition'],
        instructions: 'Use any image generation service with the optimized prompt provided.'
      };
    }
  },
});