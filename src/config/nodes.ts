
import type { AvailableNodeType } from '@/types/workflow';
import { Bot, Braces, FileJson, FunctionSquare, GitBranch, HelpCircle, LogOut, Network, Play, Terminal, Workflow as WorkflowIcon, Database, Mail, Clock, Youtube, TrendingUp, DownloadCloud, Scissors, UploadCloud, Filter } from 'lucide-react';

export const NODE_WIDTH = 180;
export const NODE_HEIGHT = 80;

export const AVAILABLE_NODES_CONFIG: AvailableNodeType[] = [
  {
    type: 'trigger',
    name: 'Manual Trigger',
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
    icon: Network,
    description: 'Makes an HTTP request to a specified URL.', // General action
    category: 'action', 
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
    outputHandles: ['response', 'error'], // 'response' for successful data
  },
  {
    type: 'schedule',
    name: 'Schedule',
    icon: Clock,
    description: 'Triggers workflow on a defined schedule.',
    category: 'trigger',
    defaultConfig: { cron: '0 * * * *' }, 
    configSchema: {
      cron: { label: 'Cron Expression', type: 'string', defaultValue: '0 * * * *', placeholder: 'e.g., 0 9 * * MON' },
    },
    outputHandles: ['triggered_at'],
  },
  {
    type: 'sendEmail',
    name: 'Send Email',
    icon: Mail,
    description: 'Sends an email notification.',
    category: 'action',
    defaultConfig: { to: '', subject: '', body: '' },
    configSchema: {
      to: { label: 'To', type: 'string', placeholder: 'recipient@example.com' },
      subject: { label: 'Subject', type: 'string', placeholder: 'Workflow Notification' },
      body: { label: 'Body (HTML or Text)', type: 'textarea', placeholder: 'Your workflow has completed.' },
    },
    inputHandles: ['input'],
    outputHandles: ['status'], // 'status' for success/failure
  },
  {
    type: 'databaseQuery',
    name: 'Database Query',
    icon: Database,
    description: 'Executes a query on a database.',
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
      jsonString: { label: 'JSON Input (e.g. {{prev_node.response}})', type: 'textarea', placeholder: '{{previous_node.response}}' },
      path: { label: 'Extraction Path (e.g. $.data.items[0].name)', type: 'string', placeholder: '$.data.items[0].name' },
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
    outputHandles: ['output'], // The logged message itself
  },
  {
    type: 'aiTask',
    name: 'AI Task',
    icon: Bot,
    description: 'Performs a task using a GenAI model.',
    category: 'ai',
    defaultConfig: { prompt: '', model: 'googleai/gemini-1.5-flash-latest' },
    configSchema: {
      prompt: { label: 'Prompt', type: 'textarea', placeholder: 'Summarize the following text: {{input.text}}' },
      model: { label: 'Model', type: 'string', defaultValue: 'googleai/gemini-1.5-flash-latest' },
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
  },
  {
    type: 'conditionalLogic',
    name: 'Condition',
    icon: Filter, // Changed icon to Filter
    description: 'Routes workflow based on a condition.',
    category: 'logic',
    defaultConfig: { condition: '' },
    configSchema: {
        condition: { label: 'Condition (e.g., {{data.value}} == "success")', type: 'string', placeholder: '{{data.value}} == "success"' },
    },
    inputHandles: ['input'],
    outputHandles: ['result'], // 'result' will be true or false
  },
  {
    type: 'dataTransform',
    name: 'Transform Data',
    icon: FunctionSquare,
    description: 'Modifies data using JavaScript or expressions (conceptual).',
    category: 'logic',
    defaultConfig: { script: 'return data;' },
    configSchema: {
        script: { label: 'JavaScript (e.g., return data.name.toUpperCase();)', type: 'textarea' },
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
  },
  {
    type: 'youtubeFetchTrending',
    name: 'YouTube: Fetch Trending',
    icon: TrendingUp,
    description: 'Fetches trending videos from YouTube (conceptual).',
    category: 'trigger', // Can also be an action if triggered by something else
    defaultConfig: { region: 'US', maxResults: 3 },
    configSchema: {
      region: { label: 'Region Code', type: 'string', defaultValue: 'US', placeholder: 'US, GB, IN, etc.' },
      maxResults: { label: 'Max Results', type: 'number', defaultValue: 3, placeholder: 'Number of videos' },
    },
    outputHandles: ['videos', 'error'],
  },
  {
    type: 'youtubeDownloadVideo',
    name: 'YouTube: Download Video',
    icon: DownloadCloud,
    description: 'Downloads a YouTube video (conceptual).',
    category: 'action',
    defaultConfig: { videoUrl: '', quality: 'best' },
    configSchema: {
      videoUrl: { label: 'Video URL', type: 'string', placeholder: '{{prev_node.videos[0].url}}' },
      quality: { label: 'Quality', type: 'select', options: ['best', '1080p', '720p', '480p'], defaultValue: 'best' },
    },
    inputHandles: ['input'],
    outputHandles: ['filePath', 'error'],
  },
  {
    type: 'videoConvertToShorts',
    name: 'Video: Convert to Shorts',
    icon: Scissors,
    description: 'Converts a video to a short format (conceptual).',
    category: 'action',
    defaultConfig: { inputFile: '', duration: 60, strategy: 'center_cut' },
    configSchema: {
      inputFile: { label: 'Input Video File Path', type: 'string', placeholder: '{{download_node.filePath}}' },
      duration: { label: 'Short Duration (seconds)', type: 'number', defaultValue: 60 },
      strategy: { label: 'Conversion Strategy', type: 'select', options: ['center_cut', 'first_segment', 'ai_highlights'], defaultValue: 'center_cut'},
    },
    inputHandles: ['input'],
    outputHandles: ['shortFilePath', 'error'],
  },
  {
    type: 'youtubeUploadShort',
    name: 'YouTube: Upload Short',
    icon: UploadCloud,
    description: 'Uploads a video short to YouTube (conceptual).',
    category: 'action',
    defaultConfig: { filePath: '', title: '', description: '', tags: [], privacy: 'public' },
    configSchema: {
      filePath: { label: 'Video File Path', type: 'string', placeholder: '{{convert_node.shortFilePath}}' },
      title: { label: 'Title', type: 'string', placeholder: 'My Awesome Short' },
      description: { label: 'Description', type: 'textarea' },
      tags: { label: 'Tags (comma-separated)', type: 'string', placeholder: 'short, funny, tech' },
      privacy: { label: 'Privacy', type: 'select', options: ['public', 'private', 'unlisted'], defaultValue: 'public'},
    },
    inputHandles: ['input'],
    outputHandles: ['uploadStatus', 'videoId', 'error'],
  },
  {
    type: 'workflowNode', // Renamed from 'customAction' for broader use by AI if no specific type matches
    name: 'Generic Workflow Step', // Renamed for clarity
    icon: WorkflowIcon,
    description: 'A generic, configurable step in the workflow. Used by AI when a specific node type isn\'t matched.',
    category: 'action', // General action
    defaultConfig: { task_description: '', parameters: {} },
    configSchema: {
      task_description: {label: 'Task Description', type: 'string', placeholder: 'Describe what this node should do'},
      parameters: { label: 'Parameters (JSON)', type: 'textarea', placeholder: '{\n  "custom_param": "value"\n}'},
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'error'],
  },
  {
    type: 'unknown',
    name: 'Unknown Node',
    icon: HelpCircle,
    description: 'Represents an unrecognized or AI-generated node type that needs mapping.',
    category: 'unknown',
    defaultConfig: { error: 'Unknown node type from AI', originalType: '', originalConfig: {} },
    configSchema: {
      originalType: { label: 'Original AI Type', type: 'string' },
      originalConfig: { label: 'Original AI Config (JSON)', type: 'textarea' },
    },
    inputHandles: ['input'],
    outputHandles: ['output'],
  }
];

export const AI_NODE_TYPE_MAPPING: Record<string, string> = {
  // General & Triggers
  'trigger': 'trigger',
  'manual trigger': 'trigger',
  'start': 'trigger',
  'webhook': 'httpRequest', // Webhook is essentially an HTTP trigger
  'http trigger': 'httpRequest',
  'schedule': 'schedule',
  'cron': 'schedule',
  'cron job': 'schedule',
  'timed trigger': 'schedule',
  
  // Actions & I/O
  'httprequest': 'httpRequest',
  'http request': 'httpRequest',
  'api call': 'httpRequest',
  'fetch data': 'httpRequest',
  'get request': 'httpRequest',
  'post request': 'httpRequest',
  'send email': 'sendEmail',
  'email': 'sendEmail',
  'notify by email': 'sendEmail',
  'database query': 'databaseQuery',
  'sql query': 'databaseQuery',
  'query database': 'databaseQuery',
  'read database': 'databaseQuery',
  'write database': 'databaseQuery', // Could map to a more specific "databaseWrite" if created
  'logmessage': 'logMessage',
  'log message': 'logMessage',
  'print to console': 'logMessage',
  'debug log': 'logMessage',

  // Logic & Data
  'parsejson': 'parseJson',
  'parse json': 'parseJson',
  'json transform': 'parseJson',
  'extract from json': 'parseJson',
  'conditional': 'conditionalLogic',
  'condition': 'conditionalLogic',
  'if/else': 'conditionalLogic',
  'if condition': 'conditionalLogic',
  'branch': 'conditionalLogic',
  'filter': 'conditionalLogic', // "filter" can also map to conditional
  'transform': 'dataTransform',
  'transform data': 'dataTransform',
  'map data': 'dataTransform',
  'script': 'dataTransform',
  'custom script': 'dataTransform',
  'run code': 'dataTransform',

  // AI
  'aitask': 'aiTask',
  'ai task': 'aiTask',
  'llm call': 'aiTask',
  'genai': 'aiTask',
  'generate text': 'aiTask',
  'summarize': 'aiTask', // Could be a specific AI task type or a general one
  'translate': 'aiTask',

  // YouTube Specific (Conceptual)
  'youtube fetch trending': 'youtubeFetchTrending',
  'get trending youtube videos': 'youtubeFetchTrending',
  'youtube download': 'youtubeDownloadVideo',
  'download youtube video': 'youtubeDownloadVideo',
  'video convert to shorts': 'videoConvertToShorts',
  'make youtube short': 'videoConvertToShorts',
  'edit video for shorts': 'videoConvertToShorts',
  'youtube upload short': 'youtubeUploadShort',
  'upload youtube short': 'youtubeUploadShort',
  'post youtube short': 'youtubeUploadShort',
  'youtube upload': 'youtubeUploadShort', // Generic upload might map to shorts or a general video upload node
  
  // Default/Fallback
  'default': 'workflowNode', // AI will use 'workflowNode' if it cannot map to anything more specific
  'custom action': 'workflowNode',
  'generic step': 'workflowNode',
  'unknown': 'unknown' // For explicitly unknown types identified post-generation
};
