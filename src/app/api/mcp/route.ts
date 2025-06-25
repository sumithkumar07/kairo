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
    // --- API Key Authentication ---
    const authHeader = request.headers.get('Authorization');
    const expectedApiKey = `Bearer ${process.env.KAIRO_MCP_API_KEY}`;
    
    if (!process.env.KAIRO_MCP_API_KEY) {
        console.error('[API Agent] FATAL: KAIRO_MCP_API_KEY is not set on the server.');
        status = 'Failed';
        aiResponseText = 'API authentication is not configured on the server.';
        return NextResponse.json({ error: aiResponseText }, { status: 500 });
    }
    
    if (!authHeader || authHeader !== expectedApiKey) {
        console.warn(`[API Agent] Failed auth attempt. Provided: ${authHeader?.substring(0, 15)}...`);
        status = 'Failed';
        aiResponseText = 'Unauthorized. Invalid or missing API Key.';
        return NextResponse.json({ error: aiResponseText }, { status: 401 });
    }
    // --- End Authentication ---

    const body = await request.json();
    const parsedInput = McpInputSchema.safeParse(body);

    if (!parsedInput.success) {
      status = 'Failed';
      aiResponseText = 'Invalid input, expected { "command": "..." }';
      return NextResponse.json({ error: aiResponseText, details: parsedInput.error.format() }, { status: 400 });
    }

    command = parsedInput.data.command;
    console.log(`[API Agent] Received command: "${command}"`);
    
    const chatInput: AssistantChatInput = {
      userMessage: command,
      // No workflow context is provided, as this is a general command endpoint
    };

    const result = await assistantChat(chatInput);
    aiResponseText = result.aiResponse;
    console.log(`[API Agent] AI Response: "${aiResponseText}"`);

    // The AI assistant now returns a comprehensive response object.
    // For this simplified API, we will just return the textual response.
    // A more advanced client could handle the other fields (like workflow generation requests).
    return NextResponse.json({ response: aiResponseText });

  } catch (error: any) {
    status = 'Failed';
    aiResponseText = error.message || 'An internal server error occurred.';
    console.error('[API Agent] Error processing request:', error);
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
