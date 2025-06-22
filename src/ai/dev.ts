
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-next-node.ts';
import '@/ai/flows/generate-workflow-from-prompt.ts';
import '@/ai/flows/enhance-user-prompt-flow.ts'; // Added import for the new flow
import '@/ai/flows/explain-workflow-flow.ts'; // Added import for workflow explanation flow
import '@/ai/flows/assistant-chat-flow.ts'; // Added import for the new chat flow
import '@/ai/flows/test-api-key-flow.ts'; // Added import for API key test flow
import '@/ai/flows/mcp-flow.ts'; // Added import for MCP flow
