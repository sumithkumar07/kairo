import { NextRequest, NextResponse } from 'next/server';
import { generateWorkflowFromPrompt } from '@/ai/flows/generate-workflow-from-prompt';
import { assistantChat } from '@/ai/flows/assistant-chat-flow';

export async function POST(request: NextRequest) {
  try {
    const { type, prompt } = await request.json();
    
    console.log(`[TEST API] Testing ${type} with prompt using Puter.js meta-llama/llama-4-maverick:`, prompt);
    
    if (type === 'workflow') {
      const result = await generateWorkflowFromPrompt({ prompt });
      return NextResponse.json({ success: true, result });
    } else if (type === 'chat') {
      const result = await assistantChat({ 
        userMessage: prompt,
        chatHistory: [] 
      });
      return NextResponse.json({ success: true, result });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[TEST API] Puter.js Error:', error);
    return NextResponse.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
}