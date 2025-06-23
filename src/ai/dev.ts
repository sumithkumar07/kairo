
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-next-node.ts';
import '@/ai/flows/generate-workflow-from-prompt.ts';
import '@/ai/flows/enhance-user-prompt-flow.ts'; 
import '@/ai/flows/explain-workflow-flow.ts'; 
import '@/ai/flows/assistant-chat-flow.ts'; 
// The test-api-key-flow is a developer utility and has been removed from the final user-facing application.
// import '@/ai/flows/test-api-key-flow.ts';



