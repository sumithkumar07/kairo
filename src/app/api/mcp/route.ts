
import { NextRequest, NextResponse } from 'next/server';
import { assistantChat, type AssistantChatInput } from '@/app/actions';
import { z } from 'zod';
import { saveMcpCommand } from '@/services/workflow-storage-service';

const McpInputSchema = z.object({
  command: z.string(),
});

export async function POST(request: NextRequest) {
  let command = '';
  let status: 'Success' | 'Failed' = 'Success';
  let aiResponseText = '';

  try {
    const body = await request.json();
    const parsedInput = McpInputSchema.safeParse(body);

    if (!parsedInput.success) {
      status = 'Failed';
      aiResponseText = 'Invalid input, expected { "command": "..." }';
      return NextResponse.json({ error: aiResponseText, details: parsedInput.error.format() }, { status: 400 });
    }

    command = parsedInput.data.command;
    console.log(`[API MCP] Received command: "${command}"`);
    
    const chatInput: AssistantChatInput = {
      userMessage: command,
      // No workflow context is provided, as this is a general command endpoint
    };

    const result = await assistantChat(chatInput);
    aiResponseText = result.aiResponse;
    console.log(`[API MCP] AI Response: "${aiResponseText}"`);

    // The AI assistant now returns a comprehensive response object.
    // For this simplified API, we will just return the textual response.
    // A more advanced client could handle the other fields (like workflow generation requests).
    return NextResponse.json({ response: aiResponseText });

  } catch (error: any) {
    status = 'Failed';
    aiResponseText = error.message || 'An internal server error occurred.';
    console.error('[API MCP] Error processing MCP request:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.', details: error.message },
      { status: 500 }
    );
  } finally {
    // Save the command and response to history regardless of outcome
    if (command) {
      await saveMcpCommand({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        command,
        response: aiResponseText,
        status,
      });
    }
  }
}
