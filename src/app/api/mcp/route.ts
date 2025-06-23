
import { NextRequest, NextResponse } from 'next/server';
import { assistantChat, type AssistantChatInput } from '@/app/actions';
import { z } from 'zod';

const McpInputSchema = z.object({
  command: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedInput = McpInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json({ error: 'Invalid input, expected { "command": "..." }', details: parsedInput.error.format() }, { status: 400 });
    }

    console.log(`[API MCP] Received command: "${parsedInput.data.command}"`);
    
    // We reuse the main assistantChat flow for the MCP endpoint.
    // The assistant is now powerful enough to handle these commands.
    const chatInput: AssistantChatInput = {
      userMessage: parsedInput.data.command,
      // No workflow context is provided, as this is a general command endpoint
    };

    const result = await assistantChat(chatInput);
    console.log(`[API MCP] AI Response: "${result.aiResponse}"`);

    // The AI assistant now returns a comprehensive response object.
    // For this simplified API, we will just return the textual response.
    // A more advanced client could handle the other fields (like workflow generation requests).
    return NextResponse.json({ response: result.aiResponse });

  } catch (error: any) {
    console.error('[API MCP] Error processing MCP request:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.', details: error.message },
      { status: 500 }
    );
  }
}
