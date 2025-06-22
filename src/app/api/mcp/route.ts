
import { NextRequest, NextResponse } from 'next/server';
import { mcpFlow, McpInputSchema } from '@/ai/flows/mcp-flow';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsedInput = McpInputSchema.safeParse(body);

    if (!parsedInput.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsedInput.error.format() }, { status: 400 });
    }

    console.log(`[API MCP] Received command: "${parsedInput.data.command}"`);
    const result = await mcpFlow(parsedInput.data);
    console.log(`[API MCP] AI Response: "${result.response}"`);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('[API MCP] Error processing MCP request:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.', details: error.message },
      { status: 500 }
    );
  }
}
