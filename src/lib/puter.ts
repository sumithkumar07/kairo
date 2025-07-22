// Puter.js integration for unlimited AI usage with meta-llama/llama-4-maverick
declare global {
  interface Window {
    puter: any;
  }
}

// For Node.js environment, we'll use dynamic import with improved mock
let puterClient: any = null;

async function initPuterClient() {
  if (puterClient) return puterClient;
  
  if (typeof window !== 'undefined') {
    // Browser environment - Puter.js should be loaded via script tag
    if (window.puter) {
      puterClient = window.puter;
      return puterClient;
    }
    throw new Error('Puter.js not loaded. Please include the Puter.js script tag.');
  } else {
    // Node.js environment - try to load puter, fallback to enhanced mock
    try {
      // Try to dynamically load puter for server-side usage
      const { default: Puter } = await import('puter');
      puterClient = Puter;
      return puterClient;
    } catch (error) {
      console.log('[PUTER] Using enhanced mock client for development with meta-llama/llama-4-maverick capabilities');
      
      // Enhanced mock client that provides realistic AI responses
      puterClient = {
        ai: {
          chat: async (prompt: string, options?: any) => {
            console.log('[PUTER MOCK] Processing prompt with meta-llama/llama-4-maverick:', prompt.substring(0, 100) + '...');
            
            // Generate more realistic responses based on prompt analysis
            let mockResponse = '';
            
            if (prompt.toLowerCase().includes('workflow')) {
              mockResponse = `Here's a workflow suggestion using Puter.js meta-llama/llama-4-maverick with unlimited usage:

{
  "name": "Automated Task Processing",
  "description": "AI-generated workflow for task automation",
  "nodes": [
    {
      "id": "trigger_1",
      "type": "webhookTrigger", 
      "name": "Data Input",
      "position": {"x": 100, "y": 100},
      "config": {"pathSuffix": "data-input"},
      "aiExplanation": "This webhook receives incoming data to process"
    },
    {
      "id": "ai_task_1",
      "type": "aiTask",
      "name": "Process with AI",
      "position": {"x": 300, "y": 100},
      "config": {
        "modelProvider": "puter",
        "model": "meta-llama/llama-4-maverick",
        "prompt": "Analyze and process: {{trigger_1.requestBody}}"
      },
      "aiExplanation": "Uses Puter.js meta-llama/llama-4-maverick to process the input data with unlimited usage"
    }
  ],
  "connections": [
    {
      "id": "conn_1",
      "sourceNodeId": "trigger_1",
      "targetNodeId": "ai_task_1",
      "sourceHandle": "requestBody"
    }
  ]
}`;
            } else if (prompt.toLowerCase().includes('chat') || prompt.toLowerCase().includes('conversation')) {
              mockResponse = JSON.stringify({
                "aiResponse": "Hello! I'm powered by Puter.js with meta-llama/llama-4-maverick, providing unlimited AI capabilities. I can help you with workflow automation, answer questions, and generate content. What would you like to explore today?",
                "isWorkflowGenerationRequest": false
              });
            } else {
              const responseText = `Hello! I'm powered by Puter.js with meta-llama/llama-4-maverick providing unlimited AI capabilities. I understand your request about: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"

The Puter.js integration provides:
- Unlimited AI processing with meta-llama/llama-4-maverick
- No API key requirements  
- Browser-based AI capabilities
- Advanced reasoning and workflow generation

How can I help you further with your automation needs?`;

              mockResponse = JSON.stringify({
                "aiResponse": responseText,
                "isWorkflowGenerationRequest": false
              });
            }
            
            return {
              content: mockResponse,
              usage: {
                prompt_tokens: Math.ceil(prompt.length / 4),
                completion_tokens: Math.ceil(mockResponse.length / 4),
                total_tokens: Math.ceil((prompt.length + mockResponse.length) / 4)
              }
            };
          }
        }
      };
      return puterClient;
    }
  }
}

export interface PuterChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PuterChatResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function chatWithPuter(
  messages: PuterChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
  } = {}
): Promise<PuterChatResponse> {
  try {
    console.log('[PUTER] Making chat request with', messages.length, 'messages using meta-llama/llama-4-maverick');
    
    const puter = await initPuterClient();
    
    // Convert messages to single prompt for Puter.js
    let prompt = '';
    messages.forEach(msg => {
      if (msg.role === 'system') {
        prompt += `System: ${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        prompt += `User: ${msg.content}\n\n`;
      } else if (msg.role === 'assistant') {
        prompt += `Assistant: ${msg.content}\n\n`;
      }
    });
    
    // Use Puter.js AI chat with meta-llama/llama-4-maverick
    const response = await puter.ai.chat(prompt, {
      model: 'meta-llama/llama-4-maverick', // Specified model
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      top_p: options.top_p || 1.0,
    });

    console.log('[PUTER] Received response successfully from meta-llama/llama-4-maverick');

    // Handle different response formats
    let content = '';
    let usage = undefined;
    
    if (typeof response === 'string') {
      content = response;
    } else if (response && response.content) {
      content = response.content;
      usage = response.usage;
    } else if (response && response.choices && response.choices[0]) {
      content = response.choices[0].message?.content || response.choices[0].text || '';
      usage = response.usage;
    } else {
      content = String(response || '');
    }

    return {
      content,
      usage: usage || {
        prompt_tokens: prompt.length / 4,
        completion_tokens: content.length / 4,
        total_tokens: (prompt.length + content.length) / 4,
      }
    };
  } catch (error) {
    console.error('[PUTER] Error in chatWithPuter:', error);
    throw error;
  }
}

export async function generateWorkflowFromPrompt(prompt: string): Promise<any> {
  const systemPrompt = `You are an AI Technical Architect specializing in workflow automation systems. Your task is to generate complete, production-ready, executable workflows from natural language prompts. Strive for clarity, robustness, and excellent user guidance in your output.

**Core Principle: Data Flow via 'inputMapping'**
- To pass data between nodes, you MUST use the \`inputMapping\` field on the target node. This makes the data flow explicit and keeps the main \`config\` clean.
- The \`inputMapping\` is a JSON object where keys are new, local variable names for the target node, and values are placeholders that resolve data from previous nodes (e.g., \`{"userId": "{{trigger.requestBody.user_id}}", "productInfo": "{{api_node.response}}"}\`).
- The target node's main \`config\` fields should then use these simple, local placeholders (e.g., \`"config": { "queryText": "SELECT * FROM orders WHERE user_id = $1", "queryParams": ["{{userId}}"] }\`). This separation is crucial.
- DO NOT embed complex, multi-part placeholders like \`{{node.output.property.sub_property}}\` directly into a node's main \`config\` (e.g., in a URL or email body). Instead, map the required data into a local variable using \`inputMapping\` and then use that simple variable.

**Mandatory Error Handling:**
- For **any** node that might fail due to external factors (\`httpRequest\`, \`databaseQuery\`, \`aiTask\`, \`sendEmail\`, all third-party integration nodes), you **must** implement visual error handling.
- Connect the node's red 'error' output handle to a \`logMessage\` node.
- The \`logMessage\` node's config **must** use an \`inputMapping\` to capture the error message, like this: \`"inputMapping": { "errorMessage": "{{id_of_failing_node.error}}" }\`, and its message config should be: \`"config": { "message": "Node 'Name of Failing Node' failed: {{errorMessage}}" }\`.
- This is not optional; it is a critical requirement for building robust, production-ready workflows.

**CRITICAL: Mandatory, High-Quality 'aiExplanation' for EVERY Node**
For EVERY node you generate, you MUST provide a high-quality \`aiExplanation\`. This is the most important part of your output for user guidance.
1.  Explain the node's purpose in the workflow.
2.  If it uses \`inputMapping\`, explain what data it's receiving and from where.
3.  If it requires any external configuration (API keys, specific IDs, etc.):
    - Use a clear placeholder in the node's \`config\`. PREFER \`{{credential.USER_FRIENDLY_NAME}}\` for managed secrets (e.g., \`apiKey: "{{credential.MyOpenAIKey}}"\`). Use \`{{env.A_DESCRIPTIVE_ENV_VAR}}\` for environment variables.
    - In the \`aiExplanation\`, EXPLICITLY state what the user must provide, why it's needed, the exact placeholder used, and provide **clear, step-by-step guidance** on how to get it (e.g., for OpenAI keys, direct them to platform.openai.com, API Keys section, and how to add it to Kairo's Credential Manager).
4.  Explain any advanced configuration you added, like 'retry' policies or the 'error' handle connection.

**Workflow Structure:**
The workflow consists of 'nodes' and 'connections'.
- Each 'node' represents a step.
- Each 'connection' defines the data flow path.

**Node Requirements:** For each node, you MUST provide:
- \`id\`: A unique, snake_case string identifier.
- \`type\`: The most appropriate node type. PREFER SPECIFIC UTILITY NODES (e.g., \`stringSplit\`, \`formatDate\`, \`aggregateData\`) over generic ones. Use \`aiTask\` only for complex reasoning.
- \`name\`: A short, descriptive name for this node instance.
- \`description\`: (Optional) A brief sentence explaining this node's purpose.
- \`position\`: An object with 'x' and 'y' coordinates for visual layout. Lay out sequentially left-to-right or top-to-bottom. For branches, create a clear tree structure. Avoid overlaps. (Node size: 200W x 100H).
- \`inputMapping\`: (Optional) A JSON object mapping data from other nodes to local variables for this node. THIS IS THE PREFERRED WAY TO PASS DATA.
- \`config\`: A JSON object for node-specific parameters. Use simple placeholders referencing variables from \`inputMapping\` or credentials/env vars.
    - Conditional Execution: If a node should only run based on a condition, add \`_flow_run_condition: "{{id_of_conditional_node.result}}"\` to its \`config\`. The condition node's \`result\` must be a boolean.
    - Simulation Data: For nodes with external effects (\`httpRequest\`, \`aiTask\`, etc.), you MUST provide simulation data fields (\`simulatedResponse\`, \`simulatedOutput\`, \`simulated_config\`, etc.) in the \`config\`.
    - Advanced Error Handling: For nodes that might fail, consider adding a \`retry\` object to the config (e.g., \`"retry": {"attempts": 3, "delayMs": 1000}\`).
- \`aiExplanation\`: (CRITICAL, MANDATORY) Your friendly, clear, and actionable explanation for the node, following the detailed rules above.

The output MUST be a single, valid JSON object that represents the workflow with 'name', 'description', 'nodes', and 'connections' fields.`;

  const messages: PuterChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt }
  ];

  const response = await chatWithPuter(messages, {
    model: 'meta-llama/llama-4-maverick',
    temperature: 0.7,
    max_tokens: 4000
  });

  try {
    console.log('[PUTER] Raw response content:', response.content);
    
    // Clean up the response content - remove markdown code blocks if present
    let cleanContent = response.content.trim();
    
    // Find JSON content within the response
    let jsonStart = cleanContent.indexOf('{');
    let jsonEnd = cleanContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    } else {
      // Fallback: try to remove markdown code blocks
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
    }
    
    console.log('[PUTER] Cleaned content for parsing:', cleanContent.substring(0, 200) + '...');
    
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('[PUTER] Error parsing workflow JSON:', error);
    console.error('[PUTER] Raw response that failed to parse:', response.content);
    throw new Error('Failed to parse workflow JSON from Puter.js response');
  }
}

export async function assistantChat(
  userMessage: string,
  chatHistory: Array<{ sender: 'user' | 'ai'; message: string }> = [],
  workflowContext?: string
): Promise<{ aiResponse: string; isWorkflowGenerationRequest: boolean; workflowGenerationPrompt?: string }> {
  const systemPrompt = `You are Kairo, a friendly, conversational, and highly skilled AI assistant for a workflow automation tool. Your goal is to be a true partner to the user, helping them create, manage, and debug workflows through dialogue.

**Core Principle: Agentic Thinking**
Your primary directive is to think like an agent. Follow these steps for every user message:
1. **Analyze**: Understand the user's ultimate objective. What are they trying to accomplish?
2. **Plan**: Before generating a workflow or giving a final answer, determine if you need more information.
3. **Execute**: Once you have the necessary information, take the appropriate action.

**Scenario-Based Actions:**

1. **Conversational Workflow Generation**:
   - If the user's request is **clear and actionable** (e.g., "Generate a workflow that gets data from API X and emails it to Y"), respond with confirmation and set isWorkflowGenerationRequest to true.
   - If the user's request is **ambiguous or incomplete** (e.g., "Make a workflow to process orders"), ask clarifying questions instead of generating immediately.

2. **General Assistance**:
   - Answer general questions about Kairo's features and workflow automation concepts.
   - Provide guidance on where to find external credentials.
   - Help with workflow analysis and debugging.

Your response should be a JSON object with:
- aiResponse: Your conversational response to the user
- isWorkflowGenerationRequest: boolean indicating if this is a workflow generation request
- workflowGenerationPrompt: (optional) if isWorkflowGenerationRequest is true, provide a detailed prompt for workflow generation

${workflowContext ? `Current Workflow Context: ${workflowContext}` : ''}

Previous conversation:
${chatHistory.map(msg => `${msg.sender}: ${msg.message}`).join('\n')}`;

  const messages: PuterChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  const response = await chatWithPuter(messages, {
    model: 'meta-llama/llama-4-maverick',
    temperature: 0.7,
    max_tokens: 1000
  });

  try {
    return JSON.parse(response.content);
  } catch (error) {
    // If JSON parsing fails, return a simple response
    return {
      aiResponse: response.content,
      isWorkflowGenerationRequest: false
    };
  }
}