import type { AvailableNodeType, RetryConfig, OnErrorWebhookConfig } from '@/types/workflow';
import { Bot, Braces, FileJson, GitBranch, HelpCircle, LogOut, Network, Play, Terminal, Workflow as WorkflowIcon, Database, Mail, Clock, Youtube, TrendingUp, DownloadCloud, Scissors, UploadCloud, Filter, Combine, SplitSquareHorizontal, ListOrdered, Milestone, CaseSensitive, GitFork, Layers, Repeat, RotateCcw, LucideIcon, UserCheck, Share2, FilePlus2, Timer, CalendarDays, Webhook, KeyRound, Sheet, MessageSquare, CreditCard, AlertCircle, Github, UserPlus, Smartphone, Speaker, Image, FileText, CheckCircle2 } from 'lucide-react';
import { ALL_INTEGRATIONS } from './integrations';
import MISTRAL_AI_INTEGRATIONS from './mistral';
import { ADVANCED_NODES_CONFIG } from './advanced-nodes';

export const NODE_WIDTH = 200; 
export const NODE_HEIGHT = 100; 

const GENERIC_RETRY_CONFIG_SCHEMA = {
  retry: { 
    label: 'Retry Config (JSON, Optional)', 
    type: 'json', 
    placeholder: '{\n  "attempts": 3,\n  "delayMs": 1000,\n  "backoffFactor": 2,\n  "retryOnStatusCodes": [500, 503, 429],\n  "retryOnErrorKeywords": ["timeout", "unavailable"]\n}',
    helperText: 'Define retry strategy: attempts, delayMs, backoffFactor (e.g., 2 for exponential), retryOnStatusCodes (for HTTP nodes), retryOnErrorKeywords (case-insensitive keywords to match in error messages for any node type). All fields optional.',
    defaultValue: {} as RetryConfig
  }
};

const GENERIC_ON_ERROR_WEBHOOK_SCHEMA = {
  onErrorWebhook: {
    label: 'On-Error Webhook (JSON, Optional)',
    type: 'json',
    placeholder: '{\n  "url": "https://my-error-logger.com/log",\n  "method": "POST",\n  "headers": {"X-API-Key": "{{env.ERROR_API_KEY}}"},\n  "bodyTemplate": {\n    "nodeId": "{{failed_node_id}}",\n    "nodeName": "{{failed_node_name}}",\n    "errorMessage": "{{error_message}}",\n    "timestamp": "{{timestamp}}",\n    "workflowSnapshot": "{{workflow_data_snapshot_json}}"\n  }\n}',
    helperText: 'If node fails after all retries, send details to this webhook. Placeholders for body/headers: {{failed_node_id}}, {{failed_node_name}}, {{error_message}}, {{timestamp}}, {{workflow_data_snapshot_json}} (full workflow data as JSON string), and {{env.VAR_NAME}}. This is a fire-and-forget notification. It can be used for simple alerts or to send error details to an endpoint that acts as a Dead-Letter Queue (DLQ) processor or triggers a dedicated error-handling workflow. The `workflow_data_snapshot_json` payload is crucial for DLQ scenarios as it provides the complete context for later analysis or reprocessing.',
    defaultValue: undefined as (OnErrorWebhookConfig | undefined)
  }
};

export const AVAILABLE_NODES_CONFIG: AvailableNodeType[] = [
  {
    type: 'webhookTrigger',
    name: 'Webhook Trigger',
    icon: Webhook,
    description: 'Triggers workflow via an HTTP request to a unique URL. Outputs the request body, headers, and query params. The webhook\'s base URL is /api/workflow-webhooks/.',
    category: 'trigger',
    defaultConfig: { 
      pathSuffix: 'my-hook', 
      securityToken: '',
      simulatedRequestBody: '{"message": "Hello from simulated webhook!"}',
      simulatedRequestHeaders: '{"Content-Type": "application/json", "X-Custom-Header": "SimValue"}',
      simulatedRequestQuery: '{"param1": "test", "param2": "true"}',
    },
    configSchema: {
      pathSuffix: { label: 'Path Suffix', type: 'string', placeholder: 'e.g., customer-updates-hook', helperText: "Unique path for this webhook. Full URL: /api/workflow-webhooks/YOUR_SUFFIX", required: true },
      securityToken: { label: 'Security Token (Optional)', type: 'string', placeholder: '{{credential.MyWebhookToken}} or {{env.MY_WEBHOOK_TOKEN}}', helperText: "If set, incoming request must have 'X-Webhook-Token' header with this value." },
      simulatedRequestBody: { label: 'Simulated Request Body (JSON for Simulation)', type: 'json', defaultValue: '{"message": "Hello!"}', helperText: "JSON data for the requestBody output during simulation." },
      simulatedRequestHeaders: { label: 'Simulated Request Headers (JSON for Simulation)', type: 'json', defaultValue: '{}', helperText: "JSON data for the requestHeaders output during simulation." },
      simulatedRequestQuery: { label: 'Simulated Request Query Params (JSON for Simulation)', type: 'json', defaultValue: '{}', helperText: "JSON data for the requestQuery output during simulation." },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: [],
    outputHandles: ['requestBody', 'requestHeaders', 'requestQuery', 'error'],
  },
  {
    type: 'fileSystemTrigger',
    name: 'File System Trigger',
    icon: FilePlus2,
    description: 'Triggers on file system events like creation or modification. Note: This is a conceptual node; its execution is simulated.',
    category: 'trigger',
    defaultConfig: { 
      directoryPath: '/uploads', 
      eventTypes: '["create", "modify"]', 
      fileNamePattern: '*.csv', 
      pollingIntervalSeconds: 60,
      simulatedFileEvent: '{"eventType": "create", "filePath": "/uploads/new_report.csv", "fileName": "new_report.csv"}',
    },
    configSchema: {
      directoryPath: { label: 'Directory Path', type: 'string', placeholder: '/mnt/shared_drive/input_files or {{env.WATCH_FOLDER}}', required: true },
      eventTypes: { label: 'Event Types (JSON Array)', type: 'json', placeholder: '["create", "modify", "delete"]', helperText: 'e.g., create, modify, delete.', required: true },
      fileNamePattern: { label: 'File Name Pattern (Glob, Optional)', type: 'string', placeholder: '*.txt, report-*.csv' },
      pollingIntervalSeconds: { label: 'Polling Interval (seconds, Conceptual)', type: 'number', defaultValue: 60, helperText: 'Conceptual interval for checking for new files.' },
      simulatedFileEvent: { label: 'Simulated File Event (JSON)', type: 'json', placeholder: '{"eventType": "create", "filePath": "/sim/data.txt", "fileName":"data.txt"}', helperText: 'JSON data representing the file event this trigger will output during simulation.', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: [],
    outputHandles: ['fileEvent', 'error'],
  },
  {
    type: 'getEnvironmentVariable',
    name: 'Get Environment Variable',
    icon: KeyRound,
    description: 'Retrieves the value of an environment variable from the server. Can be configured to fail if the variable is not set.',
    category: 'io',
    defaultConfig: { variableName: '', failIfNotSet: false },
    configSchema: {
      variableName: { label: 'Variable Name', type: 'string', placeholder: 'e.g., MY_API_KEY', required: true, helperText: 'The name of the environment variable to retrieve.' },
      failIfNotSet: { label: 'Fail if Not Set', type: 'boolean', defaultValue: false, helperText: 'If true, the node will error if the environment variable is not found.' },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['value', 'error'],
  },
  {
    type: 'httpRequest',
    name: 'HTTP Request',
    icon: Network,
    description: 'Makes an outbound HTTP request to any URL. Supports all common methods, headers, and bodies. Can be retried on failure.',
    category: 'action', 
    defaultConfig: { 
        url: '', 
        method: 'GET', 
        headers: '{\n  "Authorization": "{{credential.MyApiToken}}"\n}', 
        body: '', 
        simulatedResponse: '{"message": "Simulated HTTP success"}',
        simulatedStatusCode: 200 
    },
    configSchema: {
      url: { label: 'URL', type: 'string', placeholder: 'https://api.example.com/data', required: true },
      method: { 
        label: 'Method', 
        type: 'select', 
        options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        defaultValue: 'GET',
        required: true,
      },
      headers: { label: 'Headers (JSON)', type: 'textarea', placeholder: '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer {{credential.MyApiToken}}"\n}', helperText: "Use {{credential.CRED_NAME}} for secrets." },
      body: { label: 'Body (JSON/Text)', type: 'textarea', placeholder: '{\n  "key": "value"\n}' },
      simulatedResponse: { label: 'Simulated Response Body (JSON/Text for Simulation Mode)', type: 'json', placeholder: '{"data": "mock_value"}', helperText: 'Response body content returned by this node when in simulation mode.'},
      simulatedStatusCode: { label: 'Simulated Status Code (Number for Simulation)', type: 'number', defaultValue: 200, placeholder: '200', helperText: 'Definitive HTTP status code to simulate (e.g., 200, 404, 500). Used to test error handling and retries.' },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['response', 'status_code', 'error'],
  },
  {
    type: 'schedule',
    name: 'Schedule',
    icon: Clock,
    description: 'Triggers workflow on a schedule using a CRON expression. Requires an external service to call the scheduler API for live runs. Manual runs from the editor trigger it immediately.',
    category: 'trigger',
    defaultConfig: { cron: '0 * * * *' }, 
    configSchema: {
      cron: { label: 'Cron Expression', type: 'string', defaultValue: '0 * * * *', placeholder: 'e.g., 0 9 * * MON', required: true, helperText: 'e.g. "0 9 * * MON" for 9 AM every Monday.' },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: [],
    outputHandles: ['triggered_at', 'error'],
    aiExplanation: 'This node triggers the workflow based on its CRON schedule (e.g., \'0 9 * * *\' for 9 AM daily). For live production runs, you must set up an external service (like Vercel Cron Jobs or Google Cloud Scheduler) to make a POST request to your app\'s `/api/scheduler/run` endpoint. When you run the workflow manually from the editor, this node will trigger immediately for testing purposes.',
  },
  {
    type: 'sendEmail',
    name: 'Send Email',
    icon: Mail,
    description: 'Sends an email using an SMTP server. Requires EMAIL_* environment variables to be configured for live mode.',
    category: 'action',
    defaultConfig: { to: '', subject: '', body: '', simulatedMessageId: 'simulated-email-id-123' },
    configSchema: {
      to: { label: 'To', type: 'string', placeholder: 'recipient@example.com or {{input.email}}', required: true },
      subject: { label: 'Subject', type: 'string', placeholder: 'Workflow Notification: {{input.status}}', required: true },
      body: { label: 'Body (HTML or Text)', type: 'textarea', placeholder: 'Details: {{input.details}}', required: true },
      simulatedMessageId: { label: 'Simulated Message ID (String for Simulation Mode)', type: 'string', defaultValue: 'simulated-email-id-123', helperText: 'Message ID returned by this node when in simulation mode.' },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['messageId', 'error'],
  },
  {
    type: 'databaseQuery',
    name: 'Database Query',
    icon: Database,
    description: 'Executes a SQL query against a PostgreSQL database. Requires the DB_CONNECTION_STRING environment variable to be set.',
    category: 'io',
    defaultConfig: { queryText: 'SELECT * FROM my_table WHERE id = $1;', queryParams: '["{{input.id}}"]', simulatedResults: '[]', simulatedRowCount: 0 },
    configSchema: {
      queryText: { label: 'SQL Query (use $1, $2 for parameters)', type: 'textarea', placeholder: 'SELECT * FROM users WHERE id = $1 AND status = $2;', required: true },
      queryParams: { label: 'Query Parameters (JSON array)', type: 'json', placeholder: '["{{input.userId}}", "active"]', helperText: "Array of values or placeholders for $1, $2, etc." },
      simulatedResults: { label: 'Simulated Results (JSON Array for Simulation Mode)', type: 'json', placeholder: '[{"column1": "mock_data", "column2": 123}]', helperText: 'Results array returned by this node when in simulation mode.' },
      simulatedRowCount: { label: 'Simulated Row Count (Number for Simulation Mode)', type: 'number', defaultValue: 0, helperText: 'Row count returned by this node when in simulation mode. If simulatedResults is provided, this will be its length unless explicitly set.' },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input_array_data'], 
    outputHandles: ['results', 'rowCount', 'error'],
  },
  {
    type: 'googleCalendarListEvents',
    name: 'Google Calendar: List Events',
    icon: CalendarDays,
    description: 'Lists events from a Google Calendar. Note: This node is simulated. A real implementation would require Google OAuth.',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: { 
        maxResults: 10, 
        simulated_config: { events: [{"summary": "Team Sync", "start": {"dateTime": "2024-09-15T10:00:00-07:00"}, "end": {"dateTime": "2024-09-15T11:00:00-07:00"}}, {"summary": "Project Deadline", "start": {"date": "2024-09-20"}, "end": {"date": "2024-09-21"}}]}, 
    },
    configSchema: {
      maxResults: { label: 'Max Results (Optional)', type: 'number', defaultValue: 10, placeholder: '10', helperText: 'Maximum number of events to return.' },
      simulated_config: { label: 'Simulated Events (JSON)', type: 'json', placeholder: '{"events": [{"summary": "My Event", "start": {"dateTime": "YYYY-MM-DDTHH:mm:ssZ"}}]}', helperText: 'Event objects this node will output during simulation. Live mode for this node is also simulated.', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'], 
    outputHandles: ['output', 'error'],
  },
  {
    type: 'parseJson',
    name: 'Parse JSON',
    icon: Braces,
    description: 'Parses a JSON string and optionally extracts data using a JSON path (e.g., $.data[0].name).',
    category: 'logic',
    defaultConfig: { jsonString: '', path: '' },
    configSchema: {
      jsonString: { label: 'JSON Input (e.g. {{prev_node.response}})', type: 'textarea', placeholder: '{{previous_node.response}}', required: true },
      path: { label: 'Extraction Path (e.g. $.data.items[0].name)', type: 'string', placeholder: '$.data.items[0].name', helperText: 'Uses basic dot notation path. Leave empty to return the full parsed object.' },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
  },
  {
    type: 'logMessage',
    name: 'Log Message',
    icon: Terminal,
    description: 'Logs a message or an entire data object to the workflow execution history. Useful for debugging.',
    category: 'io',
    defaultConfig: { message: 'Workflow log: {{input}}', logFullInput: false },
    configSchema: {
      logFullInput: {
        label: 'Log Full Input Object',
        type: 'boolean',
        defaultValue: false,
        helperText: 'If checked, this node will log the entire input object it receives, ignoring the message field.'
      },
      message: { 
        label: 'Message to Log', 
        type: 'textarea', 
        placeholder: 'Current value: {{data.value}}', 
        required: false,
        helperText: 'You can use placeholders to log dynamic data. This is ignored if "Log Full Input Object" is checked.' 
      },
    },
    inputHandles: ['input'],
    outputHandles: ['output'],
  },
  {
    type: 'aiTask',
    name: 'AI Task',
    icon: Bot,
    description: 'Performs a task using Mistral AI for text generation, analysis, and processing.',
    category: 'ai',
    defaultConfig: { 
        modelProvider: 'mistral',
        model: 'mistral-small-latest',
        prompt: '',
        simulatedOutput: 'This is a simulated AI response.' 
    },
    configSchema: {
      modelProvider: {
        label: 'Model Provider',
        type: 'select',
        options: ['mistral'],
        defaultValue: 'mistral',
        required: true,
        helperText: 'Select the AI provider for the model.'
      },
      model: { 
        label: 'Model ID', 
        type: 'select',
        options: ['mistral-small-latest', 'mistral-large-latest', 'mistral-medium-latest', 'codestral-latest'],
        defaultValue: 'mistral-small-latest', 
        required: true,
        helperText: 'The specific Mistral model to use.'
      },
      prompt: { label: 'Prompt', type: 'textarea', placeholder: 'Summarize the following text: {{input.text}}', required: true },
      simulatedOutput: { label: 'Simulated AI Output (String for Simulation Mode)', type: 'string', placeholder: 'This is a simulated AI response.', helperText: 'Text output from the AI model when in simulation mode.' },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
    aiExplanation: "Performs a generative AI task using Mistral AI models. To use this node in Live Mode, ensure the `MISTRAL_API_KEY` environment variable is set on your server. The model will generate text based on your prompt using the selected Mistral model.",
  },
  {
    type: 'generateImage',
    name: 'Generate Image',
    icon: Image,
    description: 'Generates an image from a text prompt using an AI model. Outputs a data URI of the generated image.',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: {
      prompt: 'A photorealistic image of a futuristic cityscape at sunset',
      simulated_config: { imageDataUri: 'https://placehold.co/512x512.png' }
    },
    configSchema: {
      prompt: { label: 'Prompt', type: 'textarea', placeholder: 'A photorealistic image of a futuristic cityscape at sunset', required: true, helperText: 'A descriptive prompt of the image you want to generate.' },
      simulated_config: { label: 'Simulated Output (JSON for Simulation Mode)', type: 'json', placeholder: '{"imageDataUri": "data:image/png;base64,..."}', helperText: 'A data URI of a placeholder image to use during simulation.', required: true },
    },
    inputHandles: ['input'],
    outputHandles: ['imageDataUri', 'error'],
    aiExplanation: 'Generates an image using a powerful AI model. The output "imageDataUri" can be used in other nodes, for example, to upload the image or include it in an HTML email. This is a premium feature and requires a configured Google AI provider.'
  },
  {
    type: 'textToSpeech',
    name: 'Text to Speech',
    icon: Speaker,
    description: 'Converts text into audible speech using an AI model.',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: { 
      text: '{{input.text}}',
      voice: 'Algenib',
      simulated_config: { audioDataUri: '' }
    },
    configSchema: {
      text: { label: 'Text to Convert', type: 'textarea', placeholder: 'Hello, this is a test.', required: true },
      voice: { 
        label: 'Voice', 
        type: 'select', 
        options: ['Algenib', 'Achernar', 'Enif', 'Hadar', 'Markab', 'Rigel'],
        defaultValue: 'Algenib', 
        helperText: 'Select a pre-built voice for the speech synthesis.',
        required: true 
      },
      simulated_config: { label: 'Simulated Output (JSON for Simulation Mode)', type: 'json', placeholder: '{"audioDataUri": "data:audio/wav;base64,..."}', helperText: 'Data returned by this node when in simulation mode. Must contain a valid (even if silent) base64 WAV data URI.', required: true},
    },
    inputHandles: ['input'],
    outputHandles: ['audioDataUri', 'error'],
    aiExplanation: 'Converts the input text into speech audio. This node uses the Gemini Text-to-Speech model. The output is a data URI containing WAV audio data, which can be played in a browser.'
  },
  {
    type: 'conditionalLogic',
    name: 'Condition',
    icon: Filter,
    description: 'Evaluates a condition to produce a true/false result. Use this to control the flow of your workflow.',
    category: 'logic',
    defaultConfig: { condition: '' },
    configSchema: {
        condition: { label: 'Condition string (e.g., {{data.value}} == "success", {{data.count}} > 10, {{data.isValid}} === true)', type: 'string', placeholder: '{{data.temperature}} > 30', required: true, helperText: 'Use the output of this node in a subsequent node\'s `_flow_run_condition` config field.' },
        ...GENERIC_RETRY_CONFIG_SCHEMA,
        ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['result', 'error'],
  },
  {
    type: 'executeFlowGroup',
    name: 'Execute Flow Group',
    icon: Layers, 
    description: 'Executes an encapsulated group of nodes as a single, reusable step in your workflow.',
    category: 'group',
    isAdvanced: true,
    defaultConfig: {
      flowGroupNodes: '[]', 
      flowGroupConnections: '[]', 
      inputMapping: '{}', 
      outputMapping: '{}',
    },
    configSchema: {
      flowGroupNodes: { label: 'Flow Group Nodes (JSON Array of Node definitions)', type: 'json', placeholder: '[{\n  "id":"sub_node_1", \n  "type":"logMessage", \n  "name":"Log in Group", \n  "position":{"x":10,"y":10},\n  "config":{"message":"Message from sub-flow {{inputMapping.dataFromParent}}"}\n}]', helperText: 'Define the nodes for this group.', required: true },
      flowGroupConnections: { label: 'Flow Group Connections (JSON Array of Connection definitions)', type: 'json', placeholder: '[{\n  "sourceNodeId":"sub_node_1", \n  "targetNodeId":"sub_node_2", \n  "sourceHandle":"output"\n}]', helperText: 'Define connections between nodes in this group.' },
      inputMapping: { label: 'Input Mapping (JSON Object)', type: 'json', placeholder: '{\n  "internalInputName": "{{parentWorkflow.someNode.output}}",\n  "dataFromParent": "{{trigger.some_data}}"\n}', helperText: 'Map parent data to group inputs. Access mapped inputs inside group nodes using their "internalInputName".' },
      outputMapping: { label: 'Output Mapping (JSON Object)', type: 'json', placeholder: '{\n  "parentOutputName": "{{group_node_id.result}}"\n}', helperText: 'Map group results to parent outputs. This node will output these mapped values.' },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'], 
    outputHandles: ['output', 'error'], 
  },
  {
    type: 'forEach',
    name: 'For Each Loop',
    icon: Repeat,
    description: 'Iterates over an array from a previous step and executes a sub-flow for each item.',
    category: 'iteration',
    defaultConfig: {
      inputArrayPath: '',
      iterationNodes: '[]',
      iterationConnections: '[]',
      iterationResultSource: '', 
      continueOnError: false,
    },
    configSchema: {
      inputArrayPath: { label: 'Input Array Path', type: 'string', placeholder: '{{api_node.response.users}}', helperText: 'Placeholder for the array to iterate over.', required: true },
      iterationNodes: { label: 'Iteration Nodes (JSON Array of Node definitions)', type: 'json', placeholder: '[{\n  "id":"loop_log", \n  "type":"logMessage", \n  "name":"Log Item", \n  "position":{"x":10,"y":10},\n  "config":{"message":"Processing item: {{item.name}}"}\n}]', helperText: 'Nodes to execute for each item. Use {{item.property}} to access current item data.', required: true },
      iterationConnections: { label: 'Iteration Connections (JSON Array of Connection definitions)', type: 'json', placeholder: '[]', helperText: 'Connections between nodes within the iteration sub-flow.' },
      iterationResultSource: { label: 'Iteration Result Source (Optional Placeholder)', type: 'string', placeholder: '{{last_node_in_subflow.output}}', helperText: 'Placeholder to extract a specific value from each iteration\'s data. If omitted, the entire output of the last executed node in each sub-flow iteration is collected.' },
      continueOnError: { label: 'Continue On Error', type: 'boolean', defaultValue: false, helperText: 'If true, loop continues if an iteration errors; results will show individual statuses.'},
      ...GENERIC_RETRY_CONFIG_SCHEMA, 
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input_array_data'], 
    outputHandles: ['results', 'error'], 
  },
  {
    type: 'whileLoop',
    name: 'While Loop',
    icon: RotateCcw, 
    description: 'Executes a sub-flow repeatedly as long as a condition is true. The condition is evaluated before each iteration.',
    category: 'iteration',
    defaultConfig: {
      condition: '',
      loopNodes: '[]',
      loopConnections: '[]',
      maxIterations: 100, 
    },
    configSchema: {
      condition: { label: 'Loop Condition (evaluates to boolean)', type: 'string', placeholder: '{{data.status}} === "pending" || {{counter.value}} < 10', helperText: 'The loop continues as long as this condition is true. Evaluated before each iteration.', required: true },
      loopNodes: { label: 'Loop Nodes (JSON Array of Node definitions)', type: 'json', placeholder: '[{\n  "id":"loop_action", \n  "type":"httpRequest", \n  ...\n}]', helperText: 'Nodes to execute in each iteration. These nodes should eventually affect the loop condition.', required: true },
      loopConnections: { label: 'Loop Connections (JSON Array of Connection definitions)', type: 'json', placeholder: '[]', helperText: 'Connections between nodes within the loop sub-flow.' },
      maxIterations: { label: 'Max Iterations (Optional, Default 100)', type: 'number', defaultValue: 100, placeholder: '100', helperText: 'Safety limit to prevent infinite loops.' },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input_data'], 
    outputHandles: ['iterations_completed', 'error'],
  },
  {
    type: 'parallel',
    name: 'Parallel Execution',
    icon: GitFork, 
    description: 'Executes multiple branches of nodes concurrently. Use to perform independent tasks at the same time.',
    category: 'control', 
    isAdvanced: true,
    defaultConfig: {
      branches: '[]',
      concurrencyLimit: 0,
    },
    configSchema: {
      branches: { 
        label: 'Branches (JSON Array of Branch definitions)', 
        type: 'json', 
        placeholder: '[{\n  "id": "branch_1",\n  "name": "Image Processing",\n  "nodes": [{"id":"img_op_1", "type":"aiTask", ...}],\n  "connections": [],\n  "inputMapping": {"img_data": "{{parent.image_url}}"},\n  "outputSource": "{{img_op_1.processed_image_url}}"\n}]',
        helperText: 'Define branches to run in parallel. Each branch has id, nodes, connections, optional inputMapping, and optional outputSource.',
        required: true,
      },
      concurrencyLimit: {
        label: 'Concurrency Limit (Optional)',
        type: 'number',
        defaultValue: 0,
        placeholder: 'e.g., 3 (0 or less means no limit)',
        helperText: 'Max number of branches to run at once. 0 or less means unlimited concurrency.'
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'], 
    outputHandles: ['results', 'error'], 
  },
  {
    type: 'manualInput',
    name: 'Manual Input (Simulated)',
    icon: UserCheck,
    description: 'Simulates a step requiring human input, such as an approval or form submission. Outputs pre-configured mock data.',
    category: 'interaction',
    defaultConfig: {
      instructions: 'Please review and provide input.',
      inputFieldsSchema: '[{"id": "approval", "label": "Approve?", "type": "boolean", "defaultValue": true}]',
      simulatedResponse: '{"approval": true, "notes": "Simulated approval"}',
    },
    configSchema: {
      instructions: { label: 'User Instructions', type: 'textarea', placeholder: 'Describe what the user needs to do.', required: true },
      inputFieldsSchema: { label: 'Input Fields Schema (JSON Array)', type: 'json', placeholder: '[{"id":"field_id","label":"Field Label","type":"text"}]', helperText: 'Define the form fields for user input (id, label, type: text/textarea/number/boolean/select, options[] for select).', required: true },
      simulatedResponse: { label: 'Simulated Response (JSON)', type: 'json', placeholder: '{"field_id":"simulated_value"}', helperText: 'Data this node will output during simulation. This JSON object, when parsed, becomes the value available on the node\'s \'output\' handle and should be consistent with the structure defined by inputFieldsSchema.', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
  },
  {
    type: 'callExternalWorkflow',
    name: 'Call External Workflow',
    icon: Share2, 
    description: 'Calls another saved workflow by its ID. Note: This node is conceptual and its execution is simulated.',
    category: 'group',
    defaultConfig: {
      calledWorkflowId: '',
      inputMapping: '{}',
      outputMapping: '{}',
      simulatedOutput: '{"simulatedResult": "data from called workflow"}',
    },
    configSchema: {
      calledWorkflowId: { label: 'Called Workflow ID', type: 'string', placeholder: 'e.g., "customer_onboarding_flow_v2"', required: true },
      inputMapping: { label: 'Input Mapping (JSON)', type: 'json', placeholder: '{\n  "targetWorkflowInputName": "{{currentWorkflow.someNode.output}}"\n}', helperText: 'Map data from this workflow to the inputs of the called workflow.' },
      outputMapping: { label: 'Output Mapping (JSON)', type: 'json', placeholder: '{\n  "currentWorkflowOutputName": "{{calledWorkflow.result}}"\n}', helperText: 'Map outputs from the called workflow (from its simulatedOutput, via {{calledWorkflow.property}} placeholders) back to this node\'s output handle.' },
      simulatedOutput: { label: 'Simulated Output (JSON for called workflow)', type: 'json', placeholder: '{\n  "result": "mock data", "details": {"status":"ok"}\n}', helperText: 'Data this node will output to simulate the called workflow\'s execution. Structure this as if it were the entire output object of the called workflow. This JSON object is the direct data source that `outputMapping` placeholders (like `{{calledWorkflow.some_key}}`) will reference.', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
  },
  {
    type: 'delay',
    name: 'Delay',
    icon: Timer,
    description: 'Pauses workflow execution for a specified duration in milliseconds. Useful for rate limiting or waiting for external processes.',
    category: 'control',
    defaultConfig: { delayMs: 1000 },
    configSchema: {
      delayMs: { label: 'Delay (milliseconds)', type: 'number', defaultValue: 1000, required: true, placeholder: 'e.g., 5000 for 5 seconds', helperText: 'The duration for which the workflow will pause.' },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
  },
  {
    type: 'googleSheetsAppendRow',
    name: 'Google Sheets: Append Row',
    icon: Sheet,
    description: 'Appends a new row to a Google Sheet. Requires a Google Service Account credential for live mode.',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: { credentialName: 'GoogleServiceAccount', spreadsheetId: '', range: 'Sheet1', values: '[["{{input.name}}", "{{input.email}}"]]', simulated_config: { updatedRange: 'Sheet1!A1:B1', updatedRows: 1 } },
    configSchema: {
      credentialName: { label: 'Credential Name', type: 'string', defaultValue: 'GoogleServiceAccount', placeholder: 'GoogleServiceAccount', helperText: 'The name of the credential in Credential Manager that holds your Google Service Account JSON key.', required: true },
      spreadsheetId: { label: 'Spreadsheet ID', type: 'string', placeholder: 'Enter your Google Sheet ID here', required: true, helperText: 'Find this in your Google Sheet URL.' },
      range: { label: 'Sheet Name/Range', type: 'string', defaultValue: 'Sheet1', placeholder: 'Sheet1!A1', helperText: 'The sheet name, e.g., "Sheet1", or a range like "Sheet1!A1". Appends after the last row of the specified range/sheet.', required: true },
      values: { label: 'Values to Append (JSON Array of Arrays)', type: 'json', placeholder: '[["{{input.name}}", "{{input.email}}"]]', helperText: 'An array of rows, where each row is an array of cell values.', required: true },
      simulated_config: { label: 'Simulated Output (JSON)', type: 'json', placeholder: '{"updatedRange": "Sheet1!A1:B1"}', helperText: 'Mock response for simulation mode.', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
    aiExplanation: 'Appends one or more rows to a Google Sheet. Requires a Google Service Account to be authorized for the target sheet. To get a Service Account key, go to the Google Cloud Console, create a service account, generate a JSON key, and then share your Google Sheet with the service account\'s email address. Save the entire JSON key file contents as a credential named `GoogleServiceAccount` in the AI Agent Hub.',
  },
  {
    type: 'slackPostMessage',
    name: 'Slack: Post Message',
    icon: MessageSquare,
    description: 'Posts a message to a Slack channel. Requires a Slack Bot Token for live mode.',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: { channel: '#general', text: 'Hello from Kairo!', token: '{{credential.SlackBotToken}}', simulated_config: { ok: true, ts: new Date().getTime().toString() } },
    configSchema: {
      channel: { label: 'Channel ID or Name', type: 'string', placeholder: '#general or C12345678', required: true },
      text: { label: 'Message Text', type: 'textarea', placeholder: 'New order received: {{input.orderId}}', required: true },
      token: { label: 'Slack Bot Token', type: 'string', placeholder: '{{credential.SlackBotToken}}', helperText: "Use {{credential.SlackBotToken}} for a managed credential.", required: true },
      simulated_config: { label: 'Simulated Output (JSON)', type: 'json', placeholder: '{"ok": true}', helperText: 'Mock response for simulation mode.', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
    aiExplanation: 'Posts a message to a public or private Slack channel. Requires a Slack Bot Token. To get one, go to api.slack.com, create a new Slack App, add it to your workspace, grant it the `chat:write` permission scope, and copy the "Bot User OAuth Token". Save this token in the AI Agent Hub as a credential named `SlackBotToken`.',
  },
  {
    type: 'openAiChatCompletion',
    name: 'OpenAI: Chat Completion',
    icon: Bot,
    description: 'Generates a chat completion using OpenAI models. Requires an OpenAI API Key for live mode.',
    category: 'ai',
    isAdvanced: true,
    defaultConfig: { model: 'gpt-4', messages: '[{"role": "user", "content": "Hello, world!"}]', apiKey: '{{credential.OpenAIKey}}', simulated_config: { choices: [{ message: { role: 'assistant', content: 'Hello! How can I help you today?' } }] } },
    configSchema: {
      model: { label: 'Model', type: 'string', defaultValue: 'gpt-4', placeholder: 'gpt-4, gpt-3.5-turbo', required: true },
      messages: { label: 'Messages (JSON Array)', type: 'json', placeholder: '[{"role": "user", "content": "{{input.prompt}}"}]', helperText: 'An array of message objects (role and content).', required: true },
      apiKey: { label: 'OpenAI API Key', type: 'string', placeholder: '{{credential.OpenAIKey}}', helperText: "Use {{credential.OpenAIKey}} for a managed credential.", required: true },
      simulated_config: { label: 'Simulated Output (JSON)', type: 'json', placeholder: '{"choices": [{"message": {"content": "..."}}]}', helperText: 'Mock OpenAI response for simulation mode.', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
    aiExplanation: 'Sends a chat completion request to the OpenAI API. To use this, you need an OpenAI API key. Go to platform.openai.com, navigate to "API Keys," generate a new secret key, and save it in the AI Agent Hub as a credential named `OpenAIKey`.',
  },
  {
    type: 'stripeCreatePaymentLink',
    name: 'Stripe: Create Payment Link',
    icon: CreditCard,
    description: 'Creates a Stripe Payment Link. Requires a Stripe API Key for live mode.',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: { line_items: '[{"price_data": {"currency": "usd", "product_data": {"name": "T-shirt"}, "unit_amount": 2000}, "quantity": 1}]', apiKey: '{{credential.StripeApiKey}}', simulated_config: { id: 'plink_sim_123', url: 'https://checkout.stripe.com/pay/plink_sim_123' } },
    configSchema: {
      line_items: { label: 'Line Items (JSON Array)', type: 'json', placeholder: '[{"price": "price_123", "quantity": 1}]', helperText: 'Array of line items for the payment link.', required: true },
      apiKey: { label: 'Stripe API Key', type: 'string', placeholder: '{{credential.StripeApiKey}}', helperText: "Use {{credential.StripeApiKey}} for a managed credential.", required: true },
      simulated_config: { label: 'Simulated Output (JSON)', type: 'json', placeholder: '{"id": "plink_sim_123", "url": "..."}', helperText: 'Mock Stripe response for simulation mode.', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
    aiExplanation: 'Creates a Stripe Payment Link for one or more products. You will need a Stripe API Secret Key. Go to your Stripe Dashboard, navigate to Developers > API Keys, and find your secret key (it will start with `sk_live_` or `sk_test_`). Save this key in the AI Agent Hub as a credential named `StripeApiKey`.',
  },
  {
    type: 'hubspotCreateContact',
    name: 'HubSpot: Create Contact',
    icon: UserPlus,
    description: 'Creates a new contact in HubSpot. Requires a HubSpot API Key for live mode.',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: { email: '{{input.email}}', properties: '{"firstname": "{{input.firstName}}", "lastname": "{{input.lastName}}"}', apiKey: '{{credential.HubSpotApiKey}}', simulated_config: { id: "sim_contact_12345", properties: { email: "simulated@example.com", firstname: "Simulated", lastname: "User" }, createdAt: "2024-01-01T12:00:00Z" } },
    configSchema: {
      email: { label: 'Email', type: 'string', placeholder: '{{trigger.body.email}}', required: true },
      properties: { label: 'Contact Properties (JSON)', type: 'json', placeholder: '{"firstname": "{{trigger.body.fname}}"}', helperText: 'JSON object of HubSpot contact properties.', required: true },
      apiKey: { label: 'HubSpot API Key', type: 'string', placeholder: '{{credential.HubSpotApiKey}}', helperText: "Use {{credential.HubSpotApiKey}} for a managed credential.", required: true },
      simulated_config: { label: 'Simulated Output (JSON)', type: 'json', placeholder: '{"id": "contact_123", "properties": {"email": "..."}}', helperText: 'Mock HubSpot response for simulation mode.', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
    aiExplanation: 'Creates a new contact in your HubSpot account. To get your API key, go to your HubSpot account settings, navigate to Integrations > API Key, and create a new key. Save this key in the AI Agent Hub as a credential named `HubSpotApiKey`.',
  },
  {
    type: 'twilioSendSms',
    name: 'Twilio: Send SMS',
    icon: Smartphone,
    description: 'Sends an SMS message using Twilio. Requires Twilio credentials for live mode.',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: { to: '{{input.phone}}', from: '{{env.TWILIO_FROM_NUMBER}}', body: 'Message from Kairo!', accountSid: '{{credential.TwilioAccountSid}}', authToken: '{{credential.TwilioAuthToken}}', simulated_config: { sid: "SM_sim_12345", status: "queued" } },
    configSchema: {
      to: { label: 'To Phone Number', type: 'string', placeholder: '+15551234567', required: true },
      from: { label: 'From Phone Number (Twilio)', type: 'string', placeholder: '{{env.TWILIO_FROM_NUMBER}}', required: true },
      body: { label: 'Message Body', type: 'textarea', placeholder: 'Hello from your Kairo workflow!', required: true },
      accountSid: { label: 'Twilio Account SID', type: 'string', placeholder: '{{credential.TwilioAccountSid}}', required: true },
      authToken: { label: 'Twilio Auth Token', type: 'string', placeholder: '{{credential.TwilioAuthToken}}', required: true },
      simulated_config: { label: 'Simulated Output (JSON)', type: 'json', placeholder: '{"sid": "SM_sim_123", "status": "queued"}', helperText: 'Mock Twilio response for simulation mode.', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
    aiExplanation: 'Sends an SMS message via Twilio. You need your Account SID and Auth Token from your Twilio Console dashboard. Save them in the AI Agent Hub as credentials named `TwilioAccountSid` and `TwilioAuthToken`. You also need a Twilio phone number, which you should set as an environment variable (`TWILIO_FROM_NUMBER`) or provide directly.',
  },
  {
    type: 'githubCreateIssue',
    name: 'GitHub: Create Issue',
    icon: Github,
    description: 'Creates an issue in a GitHub repository. Requires a GitHub Token for live mode.',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: { owner: '{{env.GITHUB_REPO_OWNER}}', repo: '{{env.GITHUB_REPO_NAME}}', title: 'New issue from Kairo', body: 'Details: {{input.details}}', token: '{{credential.GitHubToken}}', simulated_config: { number: 99, html_url: "https://github.com/example/repo/issues/99" } },
    configSchema: {
      owner: { label: 'Repository Owner', type: 'string', placeholder: 'e.g., octocat', required: true },
      repo: { label: 'Repository Name', type: 'string', placeholder: 'e.g., Hello-World', required: true },
      title: { label: 'Issue Title', type: 'string', placeholder: 'Bug Report: {{trigger.body.title}}', required: true },
      body: { label: 'Issue Body', type: 'textarea', placeholder: 'Error details: {{trigger.body.error_log}}' },
      token: { label: 'GitHub Token', type: 'string', placeholder: '{{credential.GitHubToken}}', helperText: 'A Personal Access Token with repo scope.', required: true },
      simulated_config: { label: 'Simulated Output (JSON)', type: 'json', placeholder: '{"number": 123, "html_url": "..."}', helperText: 'Mock GitHub response for simulation mode.', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
    aiExplanation: 'Creates a new issue in a GitHub repository. This requires a GitHub Personal Access Token (PAT) with the `repo` scope. You can generate one in your GitHub account under Settings > Developer settings > Personal access tokens. Save the token in the AI Agent Hub as a credential named `GitHubToken`.',
  },
  {
    type: 'dropboxUploadFile',
    name: 'Dropbox: Upload File',
    icon: UploadCloud,
    description: 'Uploads a file to a Dropbox path. Note: This node is simulated. A real implementation would require a Dropbox Token.',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: { path: '/kairo-uploads/{{input.filename}}', content_placeholder: '{{input.file_content}}', token: '{{credential.DropboxToken}}', simulated_config: { id: "id:sim_abc123", name: "simulated_file.txt", path_display: "/kairo-uploads/simulated_file.txt" } },
    configSchema: {
      path: { label: 'File Path in Dropbox', type: 'string', placeholder: '/Apps/Kairo/{{trigger.body.filename}}', required: true },
      content_placeholder: { label: 'File Content (Placeholder)', type: 'string', placeholder: '{{api_node.response}}', helperText: 'A placeholder that resolves to the content to be uploaded.', required: true },
      token: { label: 'Dropbox Access Token', type: 'string', placeholder: '{{credential.DropboxToken}}', helperText:"Live mode for this node is simulated but would require the DROPBOX_TOKEN environment variable.", required: true},
      simulated_config: { label: 'Simulated Output (JSON)', type: 'json', placeholder: '{"name": "file.txt", "path_display": "/file.txt"}', helperText: 'Mock Dropbox response for simulation mode. Live mode is also simulated.', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
  },
  {
    type: 'youtubeFetchTrending',
    name: 'YouTube: Fetch Trending',
    icon: TrendingUp,
    description: 'Fetches the top trending videos from YouTube for a specific region.',
    category: 'integrations', 
    isAdvanced: true,
    defaultConfig: { region: 'US', maxResults: 3, apiKey: '{{credential.YouTubeApiKey}}', simulated_config: { videos: [{id: 'sim1', title: 'Simulated Video 1'}, {id: 'sim2', title: 'Simulated Video 2'}] } },
    configSchema: {
      region: { label: 'Region Code', type: 'string', defaultValue: 'US', placeholder: 'US, GB, IN, etc.', required: true },
      maxResults: { label: 'Max Results', type: 'number', defaultValue: 3, placeholder: 'Number of videos', required: true },
      apiKey: { label: 'YouTube API Key', type: 'string', placeholder: '{{credential.YouTubeApiKey}}', helperText:"A YouTube Data API v3 key. Use {{credential.YouTubeApiKey}} for a managed credential.", required: true},
      simulated_config: { label: 'Simulated Output (JSON for Simulation Mode)', type: 'json', placeholder: '{"videos": [{"id":"vid1", "title":"Mock Video"}]}', helperText: 'Data returned by this node when in simulation mode.', required: true},
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
    aiExplanation: 'Fetches the most popular videos currently trending on YouTube for a specific region. This node requires a YouTube Data API v3 key. To get one, visit the Google Cloud Console, create a project, enable the "YouTube Data API v3", and create an API key. Then, save it in the AI Agent Hub as a credential named `YouTubeApiKey` and reference it in the config as `{{credential.YouTubeApiKey}}`.'
  },
  {
    type: 'youtubeDownloadVideo',
    name: 'YouTube: Download Video',
    icon: DownloadCloud,
    description: 'Simulates downloading a YouTube video. A real implementation would require a server-side library like youtube-dl.',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: { videoUrl: '', quality: 'best', simulated_config: { filePath: '/simulated/path/to/video.mp4'} },
    configSchema: {
      videoUrl: { label: 'Video URL', type: 'string', placeholder: '{{prev_node.videos[0].url}}', required: true },
      quality: { label: 'Quality', type: 'select', options: ['best', '1080p', '720p', '480p'], defaultValue: 'best', required: true },
      simulated_config: { label: 'Simulated Output (JSON for Simulation Mode)', type: 'json', placeholder: '{"filePath": "/sim/video.mp4"}', helperText: 'Data returned by this node when in simulation mode. Live mode is also simulated.', required: true},
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
  },
  {
    type: 'videoConvertToShorts',
    name: 'Video: Convert to Shorts',
    icon: Scissors,
    description: 'Simulates converting a video to a short format (e.g., under 60s). A real implementation would use a library like FFmpeg.',
    category: 'action',
    isAdvanced: true,
    defaultConfig: { inputFile: '', duration: 60, strategy: 'center_cut', simulated_config: { shortFilePath: '/simulated/path/to/short.mp4' } },
    configSchema: {
      inputFile: { label: 'Input Video File Path', type: 'string', placeholder: '{{download_node.filePath}}', required: true },
      duration: { label: 'Short Duration (seconds)', type: 'number', defaultValue: 60, required: true },
      strategy: { label: 'Conversion Strategy', type: 'select', options: ['center_cut', 'first_segment', 'ai_highlights'], defaultValue: 'center_cut', required: true},
      simulated_config: { label: 'Simulated Output (JSON for Simulation Mode)', type: 'json', placeholder: '{"shortFilePath": "/sim/short.mp4"}', helperText: 'Data returned by this node when in simulation mode. Live mode is also simulated.', required: true},
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
  },
  {
    type: 'youtubeUploadShort',
    name: 'YouTube: Upload Short',
    icon: UploadCloud,
    description: 'Simulates uploading a video short to YouTube. A real implementation would require YouTube API OAuth credentials.',
    category: 'integrations',
    isAdvanced: true,
    defaultConfig: { filePath: '', title: '', description: '', tags: [], privacy: 'public', credentials: '{{credential.YouTubeOAuth}}', simulated_config: { uploadStatus: 'success', videoId: 'simulated-short-id'} },
    configSchema: {
      filePath: { label: 'Video File Path', type: 'string', placeholder: '{{convert_node.shortFilePath}}', required: true },
      title: { label: 'Title', type: 'string', placeholder: 'My Awesome Short', required: true },
      description: { label: 'Description', type: 'textarea' },
      tags: { label: 'Tags (comma-separated)', type: 'string', placeholder: 'short, funny, tech' },
      privacy: { label: 'Privacy', type: 'select', options: ['public', 'private', 'unlisted'], defaultValue: 'public', required: true},
      credentials: { label: 'YouTube Credentials/Token', type: 'string', placeholder: '{{credential.YouTubeOAuth}}', helperText: "Use {{credential.YouTubeOAuth}} for managed OAuth. Live mode is simulated.", required: true},
      simulated_config: { label: 'Simulated Output (JSON for Simulation Mode)', type: 'json', placeholder: '{"uploadStatus": "success", "videoId": "sim_yt_id"}', helperText: 'Data returned by this node when in simulation mode. Live mode is also simulated.', required: true},
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
  },
  {
    type: 'workflowNode', 
    name: 'Custom Action', 
    icon: WorkflowIcon,
    description: 'A generic, configurable step. Used by the AI when a specific pre-built node isn\'t available. Its execution is simulated.',
    category: 'action', 
    defaultConfig: { task_description: '', parameters: {}, simulated_config: {message: "Simulated custom action output"} },
    configSchema: {
      task_description: {label: 'Task Description', type: 'string', placeholder: 'Describe what this node should do', required: true},
      parameters: { label: 'Parameters (JSON)', type: 'textarea', placeholder: '{\n  "custom_param": "value"\n}'},
      simulated_config: { label: 'Simulated Output (JSON for Simulation Mode)', type: 'json', placeholder: '{"result": "mock_custom_result"}', helperText: 'Data returned by this node when in simulation mode, as its logic is not directly executable.'},
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
  },
  {
    type: 'toUpperCase',
    name: 'To Uppercase',
    icon: CaseSensitive,
    description: 'Converts an input string to uppercase.',
    category: 'logic',
    defaultConfig: { inputString: '' },
    configSchema: {
      inputString: { label: 'Input String', type: 'string', placeholder: '{{input.text}}', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input_data'],
    outputHandles: ['output_data', 'error'],
  },
  {
    type: 'toLowerCase',
    name: 'To Lowercase',
    icon: CaseSensitive,
    description: 'Converts an input string to lowercase.',
    category: 'logic',
    defaultConfig: { inputString: '' },
    configSchema: {
      inputString: { label: 'Input String', type: 'string', placeholder: '{{input.text}}', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input_data'],
    outputHandles: ['output_data', 'error'],
  },
  {
    type: 'concatenateStrings',
    name: 'Concatenate Strings',
    icon: Combine,
    description: 'Joins an array of strings into a single string, with an optional separator.',
    category: 'logic',
    defaultConfig: { stringsToConcatenate: '[]', separator: '' },
    configSchema: {
      stringsToConcatenate: { label: 'Strings to Concatenate (JSON Array)', type: 'json', placeholder: '["Hello", "World", "!"]', required: true },
      separator: { label: 'Separator (Optional)', type: 'string', placeholder: ' ' },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input_data'],
    outputHandles: ['output_data', 'error'],
  },
  {
    type: 'stringSplit',
    name: 'Split String',
    icon: SplitSquareHorizontal,
    description: 'Splits a string into an array of substrings based on a delimiter.',
    category: 'logic',
    defaultConfig: { inputString: '', delimiter: ',' },
    configSchema: {
      inputString: { label: 'Input String', type: 'string', placeholder: '{{input.csv_line}}', required: true },
      delimiter: { label: 'Delimiter', type: 'string', placeholder: 'e.g., , or |', defaultValue: ',', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input_data'],
    outputHandles: ['output_data', 'error'],
  },
  {
    type: 'formatDate',
    name: 'Format Date',
    icon: CalendarDays,
    description: 'Formats a date string (e.g., ISO 8601) into a custom format using date-fns tokens.',
    category: 'logic',
    defaultConfig: { inputDateString: '', outputFormatString: 'yyyy-MM-dd HH:mm:ss' },
    configSchema: {
      inputDateString: { label: 'Input Date String/ISO', type: 'string', placeholder: '{{api_node.response.createdAt}}', required: true },
      outputFormatString: { label: 'Output Date Format (date-fns)', type: 'string', defaultValue: 'yyyy-MM-dd HH:mm:ss', placeholder: 'EEEE, MMMM do, yyyy', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input_data'],
    outputHandles: ['output_data', 'error'],
  },
  {
    type: 'aggregateData',
    name: 'Aggregate Data',
    icon: ListOrdered,
    description: 'Performs aggregation operations (e.g., SUM, COUNT, JOIN) on an array of data.',
    category: 'logic',
    defaultConfig: { inputArrayPath: '', operations: '[{"type": "SUM", "inputPath": "item.amount", "outputPath": "totalRevenue"}]' },
    configSchema: {
      inputArrayPath: { label: 'Input Array Path', type: 'string', placeholder: '{{api_node.response.items}}', helperText: 'Placeholder for the array to process.', required: true },
      operations: { label: 'Aggregation Operations (JSON Array)', type: 'json', placeholder: '[{"type": "SUM", "inputPath": "item.amount", "outputPath": "totalRevenue"}, {"type": "JOIN", "inputPath": "item.email", "outputPath": "emailList", "separator": ","}]', helperText: 'Define aggregations. Use "item.property" to access data. Supported types: SUM, AVERAGE, COUNT, MIN, MAX, JOIN, COLLECT.', required: true },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input_array_data'],
    outputHandles: ['output_data', 'error'],
  },
  {
    type: 'unknown',
    name: 'Unknown Node',
    icon: HelpCircle,
    description: 'Represents an unrecognized or AI-generated node type that needs mapping to a known type.',
    category: 'unknown',
    defaultConfig: { error: 'Unknown node type from AI', originalType: '', originalConfig: {} },
    configSchema: {
      originalType: { label: 'Original AI Type', type: 'string' },
      originalConfig: { label: 'Original AI Config (JSON)', type: 'textarea' },
    },
    inputHandles: ['input'],
    outputHandles: ['output'],
  },
  {
    type: 'conditionalBranch',
    name: 'Conditional Branch',
    icon: GitBranch,
    description: 'Routes workflow execution based on conditions. Evaluates conditions in order and takes the first matching branch.',
    category: 'logic',
    defaultConfig: {
      conditions: [
        { id: 'condition1', expression: '{{input.value}} > 10', label: 'High Value', output: 'high' },
        { id: 'condition2', expression: '{{input.value}} > 5', label: 'Medium Value', output: 'medium' }
      ],
      defaultBranch: 'else',
      defaultOutput: 'low'
    },
    configSchema: {
      conditions: {
        label: 'Conditions (JSON Array)',
        type: 'json',
        placeholder: '[{"id":"cond1","expression":"{{input.value}} > 10","label":"High Value","output":"high"}]',
        helperText: 'Array of condition objects with id, expression, label, and output. Conditions are evaluated in order.',
        required: true
      },
      defaultBranch: {
        label: 'Default Branch Label',
        type: 'string',
        placeholder: 'else',
        helperText: 'Label for the default branch when no conditions match'
      },
      defaultOutput: {
        label: 'Default Output Value',
        type: 'string',
        placeholder: 'low',
        helperText: 'Value to output when no conditions match'
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['condition1', 'condition2', 'else', 'error'],
    aiExplanation: 'Evaluates conditions in sequence and routes to the first matching branch. Use expressions like "{{input.value}} > 10" or "{{input.status}} === \'active\'". The default branch is taken if no conditions match.',
  },
  {
    type: 'dataTransform',
    name: 'Data Transform',
    icon: Filter,
    description: 'Transforms data using mapping rules, filtering, or aggregation operations.',
    category: 'logic',
    defaultConfig: {
      transformType: 'map',
      mappingRules: [
        { source: '{{input.name}}', target: 'fullName' },
        { source: '{{input.email}}', target: 'contactEmail' }
      ],
      filterCondition: '',
      aggregateFunction: 'count',
      groupBy: ''
    },
    configSchema: {
      transformType: {
        label: 'Transform Type',
        type: 'select',
        options: ['map', 'filter', 'reduce', 'group'],
        defaultValue: 'map',
        helperText: 'Type of transformation to perform'
      },
      mappingRules: {
        label: 'Mapping Rules (JSON Array)',
        type: 'json',
        placeholder: '[{"source":"{{input.name}}","target":"fullName"}]',
        helperText: 'Array of source-to-target mappings for map operations',
        relevantForTypes: ['map']
      },
      filterCondition: {
        label: 'Filter Condition',
        type: 'string',
        placeholder: '{{item.value}} > 10',
        helperText: 'Condition to filter items (for filter operations)',
        relevantForTypes: ['filter']
      },
      aggregateFunction: {
        label: 'Aggregate Function',
        type: 'select',
        options: ['count', 'sum', 'average', 'min', 'max', 'concat'],
        defaultValue: 'count',
        helperText: 'Function to apply when reducing data',
        relevantForTypes: ['reduce']
      },
      groupBy: {
        label: 'Group By Field',
        type: 'string',
        placeholder: '{{item.category}}',
        helperText: 'Field to group by (for group operations)',
        relevantForTypes: ['group']
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['transformed', 'error'],
    aiExplanation: 'Transforms data using various operations. Map: transforms object structure. Filter: removes items that don\'t match condition. Reduce: aggregates data using functions like sum, count, average. Group: groups items by a field.',
  },
  {
    type: 'errorRecovery',
    name: 'Error Recovery',
    icon: RotateCcw,
    description: 'Implements advanced error recovery strategies including retry, fallback, circuit breaker, and dead letter queue.',
    category: 'control',
    isAdvanced: true,
    defaultConfig: {
      recoveryStrategy: 'retry',
      maxAttempts: 3,
      backoffMs: 1000,
      backoffFactor: 2,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000,
      fallbackNodeId: '',
      dlqEndpoint: '',
      retryOnStatusCodes: [500, 503, 429],
      retryOnErrorKeywords: ['timeout', 'unavailable']
    },
    configSchema: {
      recoveryStrategy: {
        label: 'Recovery Strategy',
        type: 'select',
        options: ['retry', 'fallback', 'circuit-breaker', 'dead-letter-queue'],
        defaultValue: 'retry',
        helperText: 'Strategy to use when this node fails'
      },
      maxAttempts: {
        label: 'Max Retry Attempts',
        type: 'number',
        defaultValue: 3,
        helperText: 'Maximum number of retry attempts',
        relevantForTypes: ['retry']
      },
      backoffMs: {
        label: 'Initial Backoff (ms)',
        type: 'number',
        defaultValue: 1000,
        helperText: 'Initial delay before first retry',
        relevantForTypes: ['retry']
      },
      backoffFactor: {
        label: 'Backoff Factor',
        type: 'number',
        defaultValue: 2,
        helperText: 'Multiplier for exponential backoff',
        relevantForTypes: ['retry']
      },
      circuitBreakerThreshold: {
        label: 'Circuit Breaker Threshold',
        type: 'number',
        defaultValue: 5,
        helperText: 'Number of failures before opening circuit',
        relevantForTypes: ['circuit-breaker']
      },
      circuitBreakerTimeout: {
        label: 'Circuit Breaker Timeout (ms)',
        type: 'number',
        defaultValue: 60000,
        helperText: 'Time before attempting to close circuit',
        relevantForTypes: ['circuit-breaker']
      },
      fallbackNodeId: {
        label: 'Fallback Node ID',
        type: 'string',
        placeholder: 'fallback_node_1',
        helperText: 'ID of node to execute as fallback',
        relevantForTypes: ['fallback']
      },
      dlqEndpoint: {
        label: 'Dead Letter Queue Endpoint',
        type: 'string',
        placeholder: 'https://api.example.com/dlq',
        helperText: 'Endpoint to send failed messages',
        relevantForTypes: ['dead-letter-queue']
      },
      retryOnStatusCodes: {
        label: 'Retry on Status Codes (JSON Array)',
        type: 'json',
        placeholder: '[500, 503, 429]',
        helperText: 'HTTP status codes that trigger retry',
        relevantForTypes: ['retry']
      },
      retryOnErrorKeywords: {
        label: 'Retry on Error Keywords (JSON Array)',
        type: 'json',
        placeholder: '["timeout", "unavailable"]',
        helperText: 'Error message keywords that trigger retry',
        relevantForTypes: ['retry']
      },
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
    aiExplanation: 'Implements sophisticated error recovery strategies. Retry: attempts operation multiple times with exponential backoff. Fallback: executes alternative node when primary fails. Circuit Breaker: prevents cascading failures by temporarily stopping requests. Dead Letter Queue: sends failed messages to external endpoint for later processing.',
  },
  {
    type: 'parallelExecution',
    name: 'Parallel Execution',
    icon: GitFork,
    description: 'Executes multiple branches of nodes concurrently for improved performance.',
    category: 'control',
    isAdvanced: true,
    defaultConfig: {
      branches: [
        {
          id: 'branch1',
          name: 'Branch 1',
          nodes: [],
          connections: [],
          inputMapping: {},
          outputSource: ''
        }
      ],
      concurrencyLimit: 0,
      timeoutMs: 30000
    },
    configSchema: {
      branches: {
        label: 'Branches (JSON Array)',
        type: 'json',
        placeholder: '[{"id":"branch1","name":"Branch 1","nodes":[],"connections":[],"inputMapping":{},"outputSource":""}]',
        helperText: 'Array of branch definitions with nodes, connections, and mappings',
        required: true
      },
      concurrencyLimit: {
        label: 'Concurrency Limit',
        type: 'number',
        defaultValue: 0,
        placeholder: '0 (unlimited)',
        helperText: 'Maximum number of branches to run simultaneously. 0 = unlimited.'
      },
      timeoutMs: {
        label: 'Timeout (ms)',
        type: 'number',
        defaultValue: 30000,
        helperText: 'Maximum time to wait for all branches to complete'
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['results', 'error'],
    aiExplanation: 'Executes multiple workflow branches in parallel for improved performance. Each branch can have its own nodes and connections. Use inputMapping to pass data to branches and outputSource to collect results. Set concurrencyLimit to control resource usage.',
  },
  {
    type: 'workflowTemplate',
    name: 'Workflow Template',
    icon: FileText,
    description: 'Loads and executes a predefined workflow template with customizable parameters.',
    category: 'group',
    defaultConfig: {
      templateId: '',
      parameters: {},
      version: 'latest'
    },
    configSchema: {
      templateId: {
        label: 'Template ID',
        type: 'string',
        placeholder: 'email-notification-template',
        helperText: 'ID of the workflow template to load',
        required: true
      },
      parameters: {
        label: 'Template Parameters (JSON)',
        type: 'json',
        placeholder: '{"recipient": "{{input.email}}", "subject": "Notification"}',
        helperText: 'Parameters to pass to the template'
      },
      version: {
        label: 'Template Version',
        type: 'string',
        defaultValue: 'latest',
        placeholder: 'latest or specific version',
        helperText: 'Version of the template to use'
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
    aiExplanation: 'Loads and executes a predefined workflow template. Templates are reusable workflow patterns that can be customized with parameters. This enables workflow composition and promotes reusability across different use cases.',
  },
  {
    type: 'apiRateLimiter',
    name: 'API Rate Limiter',
    icon: Timer,
    description: 'Controls the rate of API calls to prevent hitting rate limits and ensure fair usage.',
    category: 'control',
    isAdvanced: true,
    defaultConfig: {
      requestsPerSecond: 10,
      burstLimit: 50,
      windowSize: 60000,
      strategy: 'token-bucket'
    },
    configSchema: {
      requestsPerSecond: {
        label: 'Requests Per Second',
        type: 'number',
        defaultValue: 10,
        helperText: 'Maximum requests allowed per second'
      },
      burstLimit: {
        label: 'Burst Limit',
        type: 'number',
        defaultValue: 50,
        helperText: 'Maximum requests allowed in burst'
      },
      windowSize: {
        label: 'Window Size (ms)',
        type: 'number',
        defaultValue: 60000,
        helperText: 'Time window for rate limiting'
      },
      strategy: {
        label: 'Rate Limiting Strategy',
        type: 'select',
        options: ['token-bucket', 'leaky-bucket', 'fixed-window', 'sliding-window'],
        defaultValue: 'token-bucket',
        helperText: 'Algorithm used for rate limiting'
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
    aiExplanation: 'Implements rate limiting to control API call frequency. Prevents hitting rate limits and ensures fair usage of external APIs. Supports multiple strategies like token bucket, leaky bucket, and sliding window algorithms.',
  },
  {
    type: 'dataValidation',
    name: 'Data Validation',
    icon: CheckCircle2,
    description: 'Validates data against schemas and business rules to ensure data quality.',
    category: 'logic',
    defaultConfig: {
      validationRules: [
        { field: 'email', type: 'email', required: true },
        { field: 'age', type: 'number', min: 18, max: 100 }
      ],
      strictMode: false,
      customValidators: []
    },
    configSchema: {
      validationRules: {
        label: 'Validation Rules (JSON Array)',
        type: 'json',
        placeholder: '[{"field":"email","type":"email","required":true}]',
        helperText: 'Array of validation rules for different fields',
        required: true
      },
      strictMode: {
        label: 'Strict Mode',
        type: 'boolean',
        defaultValue: false,
        helperText: 'If true, stops execution on first validation error'
      },
      customValidators: {
        label: 'Custom Validators (JSON Array)',
        type: 'json',
        placeholder: '[{"field":"custom","expression":"{{input.value}} > 0"}]',
        helperText: 'Custom validation expressions'
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['valid', 'invalid', 'error'],
    aiExplanation: 'Validates data against schemas and business rules. Supports common validations like email, number ranges, required fields, and custom expressions. Can output valid and invalid data separately for different processing paths.',
  },
  {
    type: 'workflowMetrics',
    name: 'Workflow Metrics',
    icon: TrendingUp,
    description: 'Collects and reports metrics about workflow execution for monitoring and optimization.',
    category: 'io',
    isAdvanced: true,
    defaultConfig: {
      metrics: ['execution_time', 'memory_usage', 'api_calls', 'error_rate'],
      customMetrics: [],
      exportFormat: 'json'
    },
    configSchema: {
      metrics: {
        label: 'Metrics to Collect (JSON Array)',
        type: 'json',
        placeholder: '["execution_time", "memory_usage", "api_calls"]',
        helperText: 'Standard metrics to collect',
        required: true
      },
      customMetrics: {
        label: 'Custom Metrics (JSON Array)',
        type: 'json',
        placeholder: '[{"name":"custom_metric","expression":"{{input.value}}"}]',
        helperText: 'Custom metrics to calculate'
      },
      exportFormat: {
        label: 'Export Format',
        type: 'select',
        options: ['json', 'csv', 'prometheus'],
        defaultValue: 'json',
        helperText: 'Format for exporting metrics'
      },
      ...GENERIC_RETRY_CONFIG_SCHEMA,
      ...GENERIC_ON_ERROR_WEBHOOK_SCHEMA,
    },
    inputHandles: ['input'],
    outputHandles: ['metrics', 'error'],
    aiExplanation: 'Collects execution metrics for monitoring and optimization. Tracks performance, resource usage, API calls, and custom metrics. Exports data in various formats for integration with monitoring systems.',
  },
  // Add Mistral AI integrations
  ...MISTRAL_AI_INTEGRATIONS,
  // Add enhanced integrations
  ...ALL_INTEGRATIONS,
  // Add advanced nodes
  ...ADVANCED_NODES_CONFIG,
  
  // Add all integrations to available nodes
  ...ALL_INTEGRATIONS,
  
  // Add Mistral AI integrations
  ...MISTRAL_AI_INTEGRATIONS,
  
  // Add advanced nodes
  ...ADVANCED_NODES_CONFIG,
];

export const AI_NODE_TYPE_MAPPING: Record<string, string> = {
  // General & Triggers
  'webhooktrigger': 'webhookTrigger',
  'webhook trigger': 'webhookTrigger',
  'http webhook': 'webhookTrigger',
  'incoming webhook': 'webhookTrigger',
  'webhook': 'webhookTrigger',
  'http trigger': 'webhookTrigger', 
  'schedule': 'schedule',
  'cron': 'schedule',
  'cron job': 'schedule',
  'timed trigger': 'schedule',
  'filesystemtrigger': 'fileSystemTrigger',
  'file system trigger': 'fileSystemTrigger',
  'watch folder': 'fileSystemTrigger',
  'on new file': 'fileSystemTrigger',
  'on file create': 'fileSystemTrigger',
  'on file change': 'fileSystemTrigger',
  'file event': 'fileSystemTrigger',
  
  // Actions & I/O
  'httprequest': 'httpRequest',
  'http request': 'httpRequest',
  'api call': 'httpRequest',
  'fetch data': 'httpRequest',
  'get request': 'httpRequest',
  'post request': 'httpRequest',
  'put request': 'httpRequest',
  'delete request': 'httpRequest',
  'patch request': 'httpRequest',
  'sendemail': 'sendEmail',
  'send email': 'sendEmail',
  'email': 'sendEmail',
  'notify by email': 'sendEmail',
  'databasequery': 'databaseQuery',
  'database query': 'databaseQuery',
  'sql query': 'databaseQuery',
  'query database': 'databaseQuery',
  'read database': 'databaseQuery',
  'write database': 'databaseQuery', 
  'logmessage': 'logMessage',
  'log message': 'logMessage',
  'print to console': 'logMessage',
  'debug log': 'logMessage',
  'output message': 'logMessage',
  'log': 'logMessage',
  'getenvvar': 'getEnvironmentVariable',
  'get env var': 'getEnvironmentVariable',
  'get environment variable': 'getEnvironmentVariable',
  'read environment variable': 'getEnvironmentVariable',
  'env var': 'getEnvironmentVariable',

  // Logic & Data
  'parsejson': 'parseJson',
  'parse json': 'parseJson',
  'json transform': 'parseJson',
  'extract from json': 'parseJson',
  'conditionallogic': 'conditionalLogic',
  'conditional': 'conditionalLogic',
  'condition': 'conditionalLogic',
  'if/else': 'conditionalLogic',
  'if condition': 'conditionalLogic',
  'branch': 'conditionalLogic', 
  'filter': 'conditionalLogic', 
  'switch': 'conditionalLogic',
  'route based on condition': 'conditionalLogic',

  // Specific Utility Nodes
  'touppercase': 'toUpperCase',
  'uppercase': 'toUpperCase',
  'tolowercase': 'toLowerCase',
  'lowercase': 'toLowerCase',
  'concatenatestrings': 'concatenateStrings',
  'concatenate': 'concatenateStrings',
  'join strings': 'concatenateStrings',
  'stringsplit': 'stringSplit',
  'split string': 'stringSplit',
  'formatdate': 'formatDate',
  'format date': 'formatDate',
  'date format': 'formatDate',
  'convert date': 'formatDate',
  'aggregatedata': 'aggregateData',
  'aggregate data': 'aggregateData',
  'summarize data': 'aggregateData',
  'calculate total': 'aggregateData',
  'sum': 'aggregateData',
  'count': 'aggregateData',
  'average': 'aggregateData',
  'join': 'aggregateData',
  
  // AI
  'aitask': 'aiTask',
  'ai task': 'aiTask',
  'llm call': 'aiTask',
  'genai': 'aiTask',
  'generate text': 'aiTask',
  'summarize': 'aiTask', 
  'translate': 'aiTask',
  'analyze sentiment': 'aiTask',
  'classify text': 'aiTask',
  'texttospeech': 'textToSpeech',
  'text to speech': 'textToSpeech',
  'tts': 'textToSpeech',
  'speak': 'textToSpeech',
  'generate audio': 'textToSpeech',
  'generateimage': 'generateImage',
  'generate image': 'generateImage',
  'create image': 'generateImage',
  'image generation': 'generateImage',

  // Grouping / Sub-flows
  'executeflowgroup': 'executeFlowGroup',
  'execute flow group': 'executeFlowGroup',
  'sub workflow': 'executeFlowGroup', 
  'sub-workflow': 'executeFlowGroup',
  'run group': 'executeFlowGroup',
  'encapsulate flow': 'executeFlowGroup',
  'callexternalworkflow': 'callExternalWorkflow',
  'call external workflow': 'callExternalWorkflow',
  'call workflow by id': 'callExternalWorkflow',
  'invoke workflow': 'callExternalWorkflow',
  'run another workflow': 'callExternalWorkflow',

  // Iteration
  'foreach': 'forEach',
  'for each': 'forEach',
  'loop': 'forEach', 
  'iterate': 'forEach',
  'process list': 'forEach',
  'whileloop': 'whileLoop',
  'while loop': 'whileLoop',
  'conditional loop': 'whileLoop',
  'repeat while': 'whileLoop',

  // Control Flow 
  'parallel': 'parallel',
  'concurrent': 'parallel',
  'fork': 'parallel',
  'fan out': 'parallel',
  'run in parallel': 'parallel',
  'delay': 'delay',
  'wait': 'delay',
  'pause': 'delay',
  'sleep': 'delay',

  // Interaction
  'manualinput': 'manualInput',
  'manual input': 'manualInput',
  'user input': 'manualInput',
  'ask user': 'manualInput',
  'human task': 'manualInput',
  'human approval': 'manualInput',
  'get user data': 'manualInput',
  'user decision': 'manualInput',
  'form input': 'manualInput',
  
  // Specific Integrations (New)
  'googlesheetsappendrow': 'googleSheetsAppendRow',
  'google sheets append row': 'googleSheetsAppendRow',
  'add row to google sheet': 'googleSheetsAppendRow',
  'write to google sheets': 'googleSheetsAppendRow',
  'google sheets': 'googleSheetsAppendRow',
  'slackpostmessage': 'slackPostMessage',
  'slack post message': 'slackPostMessage',
  'send slack message': 'slackPostMessage',
  'notify slack': 'slackPostMessage',
  'slack': 'slackPostMessage',
  'openaichatcompletion': 'openAiChatCompletion',
  'openai chat completion': 'openAiChatCompletion',
  'chatgpt': 'openAiChatCompletion',
  'openai': 'openAiChatCompletion',
  'stripecreatepaymentlink': 'stripeCreatePaymentLink',
  'stripe create payment link': 'stripeCreatePaymentLink',
  'create stripe payment': 'stripeCreatePaymentLink',
  'stripe': 'stripeCreatePaymentLink',
  'hubspotcreatecontact': 'hubspotCreateContact',
  'hubspot create contact': 'hubspotCreateContact',
  'create hubspot contact': 'hubspotCreateContact',
  'hubspot': 'hubspotCreateContact',
  'twiliosendsms': 'twilioSendSms',
  'twilio send sms': 'twilioSendSms',
  'send twilio sms': 'twilioSendSms',
  'send sms': 'twilioSendSms',
  'twilio': 'twilioSendSms',
  'githubcreateissue': 'githubCreateIssue',
  'github create issue': 'githubCreateIssue',
  'create github issue': 'githubCreateIssue',
  'github': 'githubCreateIssue',
  'dropboxuploadfile': 'dropboxUploadFile',
  'dropbox upload file': 'dropboxUploadFile',
  'upload to dropbox': 'dropboxUploadFile',
  'dropbox': 'dropboxUploadFile',

  // Google Services (Simulated)
  'googlecalendarlistevents': 'googleCalendarListEvents',
  'list google calendar events': 'googleCalendarListEvents',
  'fetch calendar events': 'googleCalendarListEvents',
  'get calendar events': 'googleCalendarListEvents',
  'google calendar': 'googleCalendarListEvents',


  // YouTube Specific (Conceptual)
  'youtubefetchtrending': 'youtubeFetchTrending',
  'youtube fetch trending': 'youtubeFetchTrending',
  'get trending youtube videos': 'youtubeFetchTrending',
  'fetch youtube videos': 'youtubeFetchTrending',
  'youtubedownloadvideo': 'youtubeDownloadVideo',
  'youtube download': 'youtubeDownloadVideo',
  'download youtube video': 'youtubeDownloadVideo',
  'save youtube video': 'youtubeDownloadVideo',
  'videoconverttoshorts': 'videoConvertToShorts',
  'video convert to shorts': 'videoConvertToShorts',
  'make youtube short': 'videoConvertToShorts',
  'edit video for shorts': 'videoConvertToShorts',
  'create short video': 'videoConvertToShorts',
  'youtubeuploadshort': 'youtubeUploadShort',
  'youtube upload short': 'youtubeUploadShort',
  'post youtube short': 'youtubeUploadShort',
  'upload youtube short': 'youtubeUploadShort',
  'youtube upload': 'youtubeUploadShort', 
  
  // Default/Fallback
  'default': 'workflowNode', 
  'customaction': 'workflowNode',
  'custom action': 'workflowNode',
  'generic step': 'workflowNode',
  'workflowstep': 'workflowNode',
  'action': 'workflowNode',
  'task': 'workflowNode',
  'step': 'workflowNode',
  'workflownode': 'workflowNode', 
  'unknown': 'unknown'
};

export const getCanvasNodeStyling = (category: AvailableNodeType['category']) => {
  const common = {
    headerTextColor: 'dark:text-white text-slate-800',
  };

  switch (category) {
    case 'trigger':
      return {
        ...common,
        headerBg: 'bg-rose-100 dark:bg-rose-900/40',
        headerIconColor: 'text-rose-600 dark:text-rose-400',
        nodeBorder: 'border-rose-300 dark:border-rose-700/60',
        inputHandleColor: 'bg-rose-500 dark:bg-rose-400',
        inputHandleBorder: 'border-rose-600 dark:border-rose-300',
        outputHandleColor: 'bg-rose-500 dark:bg-rose-400',
        outputHandleBorder: 'border-rose-600 dark:border-rose-300',
      };
    case 'action':
      return {
        ...common,
        headerBg: 'bg-sky-100 dark:bg-sky-900/40',
        headerIconColor: 'text-sky-600 dark:text-sky-400',
        nodeBorder: 'border-sky-300 dark:border-sky-700/60',
        inputHandleColor: 'bg-sky-500 dark:bg-sky-400',
        inputHandleBorder: 'border-sky-600 dark:border-sky-300',
        outputHandleColor: 'bg-sky-500 dark:bg-sky-400',
        outputHandleBorder: 'border-sky-600 dark:border-sky-300',
      };
    case 'integrations':
       return {
        ...common,
        headerBg: 'bg-teal-100 dark:bg-teal-900/40',
        headerIconColor: 'text-teal-600 dark:text-teal-400',
        nodeBorder: 'border-teal-300 dark:border-teal-700/60',
        inputHandleColor: 'bg-teal-500 dark:bg-teal-400',
        inputHandleBorder: 'border-teal-600 dark:border-teal-300',
        outputHandleColor: 'bg-teal-500 dark:bg-teal-400',
        outputHandleBorder: 'border-teal-600 dark:border-teal-300',
      };
    case 'io':
      return {
        ...common,
        headerBg: 'bg-slate-200 dark:bg-slate-800/60',
        headerIconColor: 'text-slate-600 dark:text-slate-400',
        nodeBorder: 'border-slate-300 dark:border-slate-600/80',
        inputHandleColor: 'bg-slate-500 dark:bg-slate-400',
        inputHandleBorder: 'border-slate-600 dark:border-slate-300',
        outputHandleColor: 'bg-slate-500 dark:bg-slate-400',
        outputHandleBorder: 'border-slate-600 dark:border-slate-300',
      };
    case 'logic':
      return {
        ...common,
        headerBg: 'bg-amber-100 dark:bg-amber-900/40',
        headerIconColor: 'text-amber-600 dark:text-amber-400',
        nodeBorder: 'border-amber-300 dark:border-amber-700/60',
        inputHandleColor: 'bg-amber-500 dark:bg-amber-400',
        inputHandleBorder: 'border-amber-600 dark:border-amber-300',
        outputHandleColor: 'bg-amber-500 dark:bg-amber-400',
        outputHandleBorder: 'border-amber-600 dark:border-amber-300',
      };
    case 'ai':
      return {
        ...common,
        headerBg: 'bg-violet-100 dark:bg-violet-900/40',
        headerIconColor: 'text-violet-600 dark:text-violet-400',
        nodeBorder: 'border-violet-300 dark:border-violet-700/60',
        inputHandleColor: 'bg-violet-500 dark:bg-violet-400',
        inputHandleBorder: 'border-violet-600 dark:border-violet-300',
        outputHandleColor: 'bg-violet-500 dark:bg-violet-400',
        outputHandleBorder: 'border-violet-600 dark:border-violet-300',
      };
    case 'group':
    case 'iteration':
    case 'control':
    case 'interaction':
        return {
          ...common,
          headerBg: 'bg-emerald-100 dark:bg-emerald-900/40',
          headerIconColor: 'text-emerald-600 dark:text-emerald-400',
          nodeBorder: 'border-emerald-300 dark:border-emerald-700/60',
          inputHandleColor: 'bg-emerald-500 dark:bg-emerald-400',
          inputHandleBorder: 'border-emerald-600 dark:border-emerald-300',
          outputHandleColor: 'bg-emerald-500 dark:bg-emerald-400',
          outputHandleBorder: 'border-emerald-600 dark:border-emerald-300',
        };
    default:
      return {
        ...common,
        headerBg: 'bg-gray-200 dark:bg-gray-800/60',
        headerIconColor: 'text-gray-600 dark:text-gray-400',
        nodeBorder: 'border-gray-300 dark:border-gray-600/80',
        inputHandleColor: 'bg-gray-500 dark:bg-gray-400',
        inputHandleBorder: 'border-gray-600 dark:border-gray-300',
        outputHandleColor: 'bg-gray-500 dark:bg-gray-400',
        outputHandleBorder: 'border-gray-600 dark:border-gray-300',
      };
  }
};

export const getDataTransformIcon = (category: AvailableNodeType['category']) => {
    switch (category) {
        case 'logic': return Filter;
        case 'ai': return Bot;
        case 'io': return Database;
        default: return Milestone;
    }
};

// Function to get node type configuration
export function getNodeTypeConfig(nodeType: string): AvailableNodeType | undefined {
  const allNodes = [...AVAILABLE_NODES_CONFIG, ...ADVANCED_NODES_CONFIG];
  return allNodes.find(node => node.type === nodeType);
}

// Function to get all nodes including advanced ones
export function getAllNodesConfig(): AvailableNodeType[] {
  return [...AVAILABLE_NODES_CONFIG, ...ADVANCED_NODES_CONFIG];
}
