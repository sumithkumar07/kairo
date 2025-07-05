
import { NextRequest, NextResponse } from 'next/server';
import {
  assistantChat,
  type AssistantChatInput,
  generateWorkflow,
} from '@/app/actions';
import { z } from 'zod';
import { getAgentConfig, saveMcpCommand } from '@/services/workflow-storage-service';
import type { Tool } from '@/types/workflow';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const McpInputSchema = z.object({
  command: z.string(),
});

export async function POST(request: NextRequest) {
  let command = '';
  let status: 'Success' | 'Failed' = 'Success';
  let aiResponseText = '';
  let userId = '';

  try {
    // --- JWT Authentication ---
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ aiResponse: 'Unauthorized: Missing or invalid Authorization header.', action: 'error', error: 'Unauthorized' }, { status: 401 });
    }
    const jwt = authHeader.substring(7);

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
        console.warn(`[API Agent] Failed auth attempt with JWT. Error: ${userError?.message}`);
        return NextResponse.json({ aiResponse: 'Unauthorized: Invalid or expired token.', action: 'error', error: 'Unauthorized' }, { status: 401 });
    }
    userId = user.id;
    // --- End Authentication ---

    const body = await request.json();
    const parsedInput = McpInputSchema.safeParse(body);

    if (!parsedInput.success) {
      status = 'Failed';
      aiResponseText = 'Invalid input, expected { "command": "..." }';
      await saveMcpCommand({ command: 'Invalid Input', response: aiResponseText, status, timestamp: new Date().toISOString() }, userId);
      return NextResponse.json({ aiResponse: aiResponseText, action: 'error', error: 'Invalid input format.', details: parsedInput.error.format() }, { status: 400 });
    }

    command = parsedInput.data.command;
    console.log(`[API Agent] Received command from user ${userId}: "${command}"`);
    
    // Pass the userId to get the correct agent config
    const agentConfig = await getAgentConfig(userId);

    const chatInput: AssistantChatInput = {
      userMessage: command,
      enabledTools: agentConfig.enabledTools,
      userId, // Pass userId to the chat flow
    };

    const chatResult = await assistantChat(chatInput);
    aiResponseText = chatResult.aiResponse;
    console.log(`[API Agent] AI Response: "${aiResponseText}"`);
    
    if (chatResult.isWorkflowGenerationRequest && chatResult.workflowGenerationPrompt) {
      console.log(`[API Agent] AI requested workflow generation with prompt: "${chatResult.workflowGenerationPrompt}"`);
      try {
        const workflow = await generateWorkflow({ prompt: chatResult.workflowGenerationPrompt }, userId);
        aiResponseText += "\n\n[Action: Workflow Generated]";
        await saveMcpCommand({ command, response: aiResponseText, status, timestamp: new Date().toISOString() }, userId);
        return NextResponse.json({
          aiResponse: chatResult.aiResponse,
          action: 'workflowGenerated',
          workflow: workflow,
        });
      } catch (genError: any) {
        console.error('[API Agent] Error during workflow generation:', genError);
        const errorMessage = `I tried to generate the workflow, but encountered an error: ${genError.message}`;
        aiResponseText = errorMessage;
        status = 'Failed';
        await saveMcpCommand({ command, response: aiResponseText, status, timestamp: new Date().toISOString() }, userId);
        return NextResponse.json({
          aiResponse: errorMessage,
          action: 'error',
          error: `Workflow Generation Failed: ${genError.message}`,
        }, { status: 500 });
      }
    }

    await saveMcpCommand({ command, response: aiResponseText, status, timestamp: new Date().toISOString() }, userId);
    return NextResponse.json({
      aiResponse: aiResponseText,
      action: 'chat',
    });

  } catch (error: any) {
    status = 'Failed';
    aiResponseText = error.message || 'An internal server error occurred.';
    console.error('[API Agent] Error processing request:', error);
    if (userId && command) {
        await saveMcpCommand({ command, response: aiResponseText, status, timestamp: new Date().toISOString() }, userId);
    }
    return NextResponse.json(
      { aiResponse: aiResponseText, action: 'error', error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
