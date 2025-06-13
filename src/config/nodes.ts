
import type { AvailableNodeType } from '@/types/workflow';
import { Bot, Braces, FileJson, FunctionSquare, GitBranch, HelpCircle, LogOut, Network, Play, Terminal, Workflow as WorkflowIcon, Database, Mail, Clock } from 'lucide-react'; // Added Database, Mail, Clock

export const NODE_WIDTH = 180;
export const NODE_HEIGHT = 80;

export const AVAILABLE_NODES_CONFIG: AvailableNodeType[] = [
  {
    type: 'trigger',
    name: 'Manual Trigger', // Renamed for clarity
    icon: Play,
    description: 'Manually starts the workflow.',
    category: 'trigger',
    defaultConfig: { event: 'manualStart' },
    configSchema: {
      event: { label: 'Event Type', type: 'string', defaultValue: 'manualStart', placeholder: 'e.g., manual, webhook' },
    },
    outputHandles: ['output'],
  },
  {
    type: 'httpRequest',
    name: 'HTTP Request',
    icon: Network, // Using Network as in image
    description: 'Trigger workflow with HTTP request.', // Updated description
    category: 'trigger', // Could also be 'action' depending on use
    defaultConfig: { url: '', method: 'GET', headers: '{}', body: '' },
    configSchema: {
      url: { label: 'URL', type: 'string', placeholder: 'https://api.example.com/data' },
      method: { 
        label: 'Method', 
        type: 'select', 
        options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        defaultValue: 'GET',
      },
      headers: { label: 'Headers (JSON)', type: 'textarea', placeholder: '{\n  "Content-Type": "application/json"\n}' },
      body: { label: 'Body (JSON/Text)', type: 'textarea', placeholder: '{\n  "key": "value"\n}' },
    },
    inputHandles: ['input'],
    outputHandles: ['response', 'error'],
  },
  {
    type: 'schedule',
    name: 'Schedule',
    icon: Clock,
    description: 'Run workflow on schedule.',
    category: 'trigger',
    defaultConfig: { cron: '0 * * * *' }, // Example: every hour
    configSchema: {
      cron: { label: 'Cron Expression', type: 'string', defaultValue: '0 * * * *', placeholder: 'e.g., 0 9 * * MON' },
    },
    outputHandles: ['output'],
  },
  {
    type: 'sendEmail',
    name: 'Send Email',
    icon: Mail,
    description: 'Send an email notification.',
    category: 'action',
    defaultConfig: { to: '', subject: '', body: '' },
    configSchema: {
      to: { label: 'To', type: 'string', placeholder: 'recipient@example.com' },
      subject: { label: 'Subject', type: 'string', placeholder: 'Workflow Notification' },
      body: { label: 'Body (HTML or Text)', type: 'textarea', placeholder: 'Your workflow has completed.' },
    },
    inputHandles: ['input'],
    outputHandles: ['success', 'error'],
  },
  {
    type: 'databaseQuery',
    name: 'Database Query',
    icon: Database,
    description: 'Execute a query on a database.',
    category: 'io',
    defaultConfig: { connectionId: '', query: '' },
    configSchema: {
      connectionId: { label: 'Database Connection ID', type: 'string', placeholder: '{{secrets.DB_CONNECTION_ID}}' },
      query: { label: 'SQL Query', type: 'textarea', placeholder: 'SELECT * FROM users WHERE id = {{input.userId}};' },
    },
    inputHandles: ['input'],
    outputHandles: ['results', 'error'],
  },
  {
    type: 'parseJson',
    name: 'Parse JSON',
    icon: Braces,
    description: 'Parses a JSON string and extracts data using a path.',
    category: 'logic',
    defaultConfig: { jsonString: '', path: '' },
    configSchema: {
      jsonString: { label: 'JSON Input (from prev. step)', type: 'string', placeholder: '{{previous_node.output}}' },
      path: { label: 'JSONPath Expression', type: 'string', placeholder: '$.data.items[0].name' },
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
  },
  {
    type: 'logMessage',
    name: 'Log Message',
    icon: Terminal,
    description: 'Logs a message to the workflow execution log.',
    category: 'io',
    defaultConfig: { message: 'Workflow log: ' },
    configSchema: {
      message: { label: 'Message to Log', type: 'textarea', placeholder: 'Current value: {{data.value}}' },
    },
    inputHandles: ['input'],
    outputHandles: ['output'],
  },
  {
    type: 'aiTask',
    name: 'AI Task',
    icon: Bot,
    description: 'Performs a task using a GenAI model.',
    category: 'ai',
    defaultConfig: { prompt: '', model: 'gemini-1.5-flash-latest' },
    configSchema: {
      prompt: { label: 'Prompt', type: 'textarea', placeholder: 'Summarize the following text: {{input.text}}' },
      model: { label: 'Model', type: 'string', defaultValue: 'gemini-1.5-flash-latest' },
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
  },
  {
    type: 'conditionalLogic',
    name: 'Condition',
    icon: GitBranch,
    description: 'Routes workflow based on a condition.',
    category: 'logic',
    defaultConfig: { condition: '' },
    configSchema: {
        condition: { label: 'Condition (e.g., {{data.value}} > 10)', type: 'string' },
    },
    inputHandles: ['input'],
    outputHandles: ['true', 'false'],
  },
  {
    type: 'dataTransform',
    name: 'Transform Data',
    icon: FunctionSquare,
    description: 'Modifies data using JavaScript or expressions.',
    category: 'logic',
    defaultConfig: { script: 'return data;' },
    configSchema: {
        script: { label: 'JavaScript (e.g., return data.name.toUpperCase();)', type: 'textarea' },
    },
    inputHandles: ['input'],
    outputHandles: ['output'],
  },
  {
    type: 'workflowNode', 
    name: 'Workflow Step',
    icon: WorkflowIcon,
    description: 'A generic step in the workflow.',
    category: 'unknown',
    defaultConfig: { details: '' },
    configSchema: {
      details: { label: 'Configuration (JSON)', type: 'textarea' },
    },
    inputHandles: ['input'],
    outputHandles: ['output'],
  },
  {
    type: 'unknown',
    name: 'Unknown Node',
    icon: HelpCircle,
    description: 'Represents an unrecognized node type.',
    category: 'unknown',
    defaultConfig: { error: 'Unknown node type from AI' },
    configSchema: {
      originalType: { label: 'Original AI Type', type: 'string' },
      originalConfig: { label: 'Original AI Config', type: 'textarea' },
    },
    inputHandles: ['input'],
    outputHandles: ['output'],
  }
];

export const AI_NODE_TYPE_MAPPING: Record<string, string> = {
  'httprequest': 'httpRequest',
  'http request': 'httpRequest',
  'api call': 'httpRequest',
  'fetch data': 'httpRequest',
  'schedule': 'schedule',
  'cron': 'schedule',
  'send email': 'sendEmail',
  'email': 'sendEmail',
  'database query': 'databaseQuery',
  'sql query': 'databaseQuery',
  'parsejson': 'parseJson',
  'parse json': 'parseJson',
  'json transform': 'parseJson',
  'logmessage': 'logMessage',
  'log message': 'logMessage',
  'print to console': 'logMessage',
  'aitask': 'aiTask',
  'ai task': 'aiTask',
  'llm call': 'aiTask',
  'generate text': 'aiTask',
  'conditional': 'conditionalLogic',
  'if/else': 'conditionalLogic',
  'branch': 'conditionalLogic',
  'transform': 'dataTransform',
  'map data': 'dataTransform',
  'script': 'dataTransform',
  'trigger': 'trigger', // Generic trigger to manual
  'manual trigger': 'trigger',
  'start': 'trigger',
  'webhook': 'httpRequest', // Map webhook to httpRequest as it's often a trigger type of it
  'default': 'workflowNode', 
};
