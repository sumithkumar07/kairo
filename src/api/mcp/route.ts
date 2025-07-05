
import { NextRequest, NextResponse } from 'next/server';
import {
  assistantChat,
  type AssistantChatInput,
  generateWorkflow,
} from '@/app/actions';
import { z } from 'zod';
import { getAgentConfig, saveMcpCommand } from '@/services/workflow-storage-service';
import type { Tool } from '@/types/workflow';

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
        await saveMcpCommand({ command: 'Auth Failure', response: aiResponseText, status, timestamp: new Date().toISOString() });
        return NextResponse.json({ aiResponse: aiResponseText, action: 'error', error: 'Server authentication not configured.' }, { status: 500 });
    }
    
    if (!authHeader || authHeader !== expectedApiKey) {
        console.warn(`[API Agent] Failed auth attempt. Provided: ${authHeader?.substring(0, 15)}...`);
        status = 'Failed';
        aiResponseText = 'Unauthorized. Invalid or missing API Key.';
        await saveMcpCommand({ command: 'Auth Failure', response: aiResponseText, status, timestamp: new Date().toISOString() });
        return NextResponse.json({ aiResponse: aiResponseText, action: 'error', error: 'Unauthorized' }, { status: 401 });
    }
    // --- End Authentication ---

    const body = await request.json();
    const parsedInput = McpInputSchema.safeParse(body);

    if (!parsedInput.success) {
      status = 'Failed';
      aiResponseText = 'Invalid input, expected { "command": "..." }';
      await saveMcpCommand({ command: 'Invalid Input', response: aiResponseText, status, timestamp: new Date().toISOString() });
      return NextResponse.json({ aiResponse: aiResponseText, action: 'error', error: 'Invalid input format.', details: parsedInput.error.format() }, { status: 400 });
    }

    command = parsedInput.data.command;
    console.log(`[API Agent] Received command: "${command}"`);
    
    // Load the currently configured agent skills for the AI
    const agentConfig = await getAgentConfig();

    const chatInput: AssistantChatInput = {
      userMessage: command,
      // Pass the configured tools to the chat function
      enabledTools: agentConfig.enabledTools,
      // No workflow context is provided, as this is a general command endpoint
    };

    const chatResult = await assistantChat(chatInput);
    aiResponseText = chatResult.aiResponse;
    console.log(`[API Agent] AI Response: "${aiResponseText}"`);
    
    // Check if the AI decided to generate a workflow
    if (chatResult.isWorkflowGenerationRequest && chatResult.workflowGenerationPrompt) {
      console.log(`[API Agent] AI requested workflow generation with prompt: "${chatResult.workflowGenerationPrompt}"`);
      try {
        const workflow = await generateWorkflow({ prompt: chatResult.workflowGenerationPrompt });
        aiResponseText += "\n\n[Action: Workflow Generated]"; // For history log
        await saveMcpCommand({ command, response: aiResponseText, status, timestamp: new Date().toISOString() });
        return NextResponse.json({
          aiResponse: chatResult.aiResponse,
          action: 'workflowGenerated',
          workflow: workflow,
        });
      } catch (genError: any) {
        console.error('[API Agent] Error during workflow generation:', genError);
        const errorMessage = `I tried to generate the workflow, but encountered an error: ${genError.message}`;
        aiResponseText = errorMessage; // Overwrite for saving to history
        status = 'Failed';
        await saveMcpCommand({ command, response: aiResponseText, status, timestamp: new Date().toISOString() });
        return NextResponse.json({
          aiResponse: errorMessage,
          action: 'error',
          error: `Workflow Generation Failed: ${genError.message}`,
        }, { status: 500 });
      }
    }

    await saveMcpCommand({ command, response: aiResponseText, status, timestamp: new Date().toISOString() });
    // Standard chat response
    return NextResponse.json({
      aiResponse: aiResponseText,
      action: 'chat',
    });

  } catch (error: any) {
    status = 'Failed';
    aiResponseText = error.message || 'An internal server error occurred.';
    console.error('[API Agent] Error processing request:', error);
    // Save error to history
    if (command) {
        await saveMcpCommand({ command, response: aiResponseText, status, timestamp: new Date().toISOString() });
    }
    return NextResponse.json(
      { aiResponse: aiResponseText, action: 'error', error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
