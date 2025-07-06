
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-next-node.ts';
import '@/ai/flows/generate-workflow-from-prompt.ts';
import '@/ai/flows/enhance-user-prompt-flow.ts'; 
import '@/ai/flows/explain-workflow-flow.ts'; 
import '@/ai/flows/assistant-chat-flow.ts'; 
import '@/ai/flows/generate-test-data-flow.ts';
import '@/ai/flows/diagnose-workflow-error-flow.ts';
import '@/ai/flows/generate-workflow-ideas.ts';
import '@/ai/flows/text-to-speech-flow.ts';

// Import tools to register them with Genkit
import '@/ai/tools/index.ts';

    
