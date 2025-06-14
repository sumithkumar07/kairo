
import type { AvailableNodeType } from '@/types/workflow';
import { Bot, Braces, FileJson, FunctionSquare, GitBranch, HelpCircle, LogOut, Network, Play, Terminal, Workflow as WorkflowIcon, Database, Mail, Clock, Youtube, TrendingUp, DownloadCloud, Scissors, UploadCloud, Filter, Combine, SplitSquareHorizontal, ListOrdered, Milestone, CaseSensitive, GitFork, Layers } from 'lucide-react';

export const NODE_WIDTH = 180;
export const NODE_HEIGHT = 90; 

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
    description: 'Makes an HTTP request to a specified URL.',
    category: 'action', 
    defaultConfig: { url: '', method: 'GET', headers: '{\n  "Authorization": "{{env.MY_API_TOKEN}}"\n}', body: '' },
    configSchema: {
      url: { label: 'URL', type: 'string', placeholder: 'https://api.example.com/data' },
      method: { 
        label: 'Method', 
        type: 'select', 
        options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        defaultValue: 'GET',
      },
      headers: { label: 'Headers (JSON)', type: 'textarea', placeholder: '{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer {{env.MY_API_TOKEN}}"\n}', helperText: "Use {{env.VAR_NAME}} for secrets." },
      body: { label: 'Body (JSON/Text)', type: 'textarea', placeholder: '{\n  "key": "value"\n}' },
    },
    inputHandles: ['input'],
    outputHandles: ['response', 'status_code', 'error_message', 'status'],
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
    description: 'Sends an email. Configure mail server via EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM, EMAIL_SECURE environment variables.',
    category: 'action',
    defaultConfig: { to: '', subject: '', body: '' },
    configSchema: {
      to: { label: 'To', type: 'string', placeholder: 'recipient@example.com or {{input.email}}' },
      subject: { label: 'Subject', type: 'string', placeholder: 'Workflow Notification: {{input.status}}' },
      body: { label: 'Body (HTML or Text)', type: 'textarea', placeholder: 'Details: {{input.details}}' },
    },
    inputHandles: ['input'],
    outputHandles: ['messageId', 'status', 'error_message'],
  },
  {
    type: 'databaseQuery',
    name: 'Database Query',
    icon: Database,
    description: 'Executes a SQL query. Configure DB_CONNECTION_STRING (e.g. postgresql://user:pass@host:port/db) environment variable.',
    category: 'io',
    defaultConfig: { queryText: 'SELECT * FROM my_table WHERE id = $1;', queryParams: '["{{input.id}}"]' },
    configSchema: {
      queryText: { label: 'SQL Query (use $1, $2 for parameters)', type: 'textarea', placeholder: 'SELECT * FROM users WHERE id = $1 AND status = $2;' },
      queryParams: { label: 'Query Parameters (JSON array)', type: 'json', placeholder: '["{{input.userId}}", "active"]', helperText: "Array of values or placeholders for $1, $2, etc." },
    },
    inputHandles: ['input'], 
    outputHandles: ['results', 'rowCount', 'status', 'error_message'],
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
    outputHandles: ['output', 'status', 'error_message'],
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
    defaultConfig: { prompt: '', model: 'googleai/gemini-1.5-flash-latest' },
    configSchema: {
      prompt: { label: 'Prompt', type: 'textarea', placeholder: 'Summarize the following text: {{input.text}}' },
      model: { label: 'Model ID', type: 'string', defaultValue: 'googleai/gemini-1.5-flash-latest', placeholder: 'e.g., googleai/gemini-1.5-pro-latest' },
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'status', 'error_message'],
  },
  {
    type: 'conditionalLogic',
    name: 'Condition',
    icon: Filter,
    description: 'Evaluates a condition. Use its boolean `result` in a subsequent node\'s `_flow_run_condition` config field (e.g. {{this_node_id.result}}) to control execution.',
    category: 'logic',
    defaultConfig: { condition: '' },
    configSchema: {
        condition: { label: 'Condition string (e.g., {{data.value}} == "success", {{data.count}} > 10, {{data.isValid}} === true)', type: 'string', placeholder: '{{data.temperature}} > 30' },
    },
    inputHandles: ['input'],
    outputHandles: ['result'],
  },
  {
    type: 'dataTransform',
    name: 'Transform Data',
    icon: FunctionSquare, 
    description: 'Performs various predefined data transformations.',
    category: 'logic',
    defaultConfig: { 
      transformType: 'toUpperCase', 
      inputString: '', 
      inputObject: {},
      inputArray: [],
      fieldsToExtract: '[]', 
      stringsToConcatenate: '[]', 
      separator: '',
      delimiter: ',',
      index: 0,
      propertyName: '',
    },
    configSchema: {
        transformType: { 
          label: 'Transformation Type', 
          type: 'select', 
          options: [
            {value: 'toUpperCase', label: 'To Uppercase'}, 
            {value: 'toLowerCase', label: 'To Lowercase'}, 
            {value: 'extractFields', label: 'Extract Fields from Object'}, 
            {value: 'concatenateStrings', label: 'Concatenate Strings'},
            {value: 'stringSplit', label: 'Split String to Array'},
            {value: 'arrayLength', label: 'Get Array Length'},
            {value: 'getItemAtIndex', label: 'Get Item From Array at Index'},
            {value: 'getObjectProperty', label: 'Get Property From Object'},
          ],
          defaultValue: 'toUpperCase'
        },
        inputString: { label: 'Input String (for case, split, concat)', type: 'textarea', placeholder: '{{input.text}}' },
        inputObject: { label: 'Input Object (for extractFields, getProperty)', type: 'textarea', placeholder: '{{input.data}}' },
        inputArray: { label: 'Input Array (for length, getItem, concat)', type: 'textarea', placeholder: '{{input.list}}' },
        fieldsToExtract: { label: 'Fields to Extract (JSON array of strings for extractFields)', type: 'json', placeholder: '["name", "email"]' },
        stringsToConcatenate: { label: 'Strings/Placeholders to Concatenate (JSON array for concatenateStrings)', type: 'json', placeholder: '["Hello ", "{{input.name}}", "!"]' },
        separator: { label: 'Separator (for concatenateStrings)', type: 'string', placeholder: '(empty for direct join)' },
        delimiter: { label: 'Delimiter (for stringSplit)', type: 'string', placeholder: ',' },
        index: { label: 'Index (for getItemAtIndex, 0-based)', type: 'number', placeholder: '0' },
        propertyName: { label: 'Property Name (for getObjectProperty)', type: 'string', placeholder: 'user.name' },
    },
    inputHandles: ['input_data'],
    outputHandles: ['output_data', 'status', 'error_message'],
  },
  {
    type: 'executeFlowGroup',
    name: 'Execute Flow Group',
    icon: Layers, // Using Layers icon for group/sub-flow
    description: 'Executes an encapsulated group of nodes as a sub-flow. Define nodes, connections, and input/output mappings.',
    category: 'group',
    defaultConfig: {
      flowGroupNodes: '[]', // JSON string representing WorkflowNode[]
      flowGroupConnections: '[]', // JSON string representing WorkflowConnection[]
      inputMapping: '{}', // JSON string: {"group_data_key": "{{parent_node.output.some_val}}"}
      outputMapping: '{}', // JSON string: {"this_node_output_key": "{{node_in_group.result}}"}
    },
    configSchema: {
      flowGroupNodes: { label: 'Flow Group Nodes (JSON Array)', type: 'json', placeholder: '[{"id":"sub_node_1", "type":"logMessage", ...}]', helperText: 'Define the nodes for this group.' },
      flowGroupConnections: { label: 'Flow Group Connections (JSON Array)', type: 'json', placeholder: '[{"sourceNodeId":"sub_node_1", ...}]', helperText: 'Define connections between nodes in this group.' },
      inputMapping: { label: 'Input Mapping (JSON Object)', type: 'json', placeholder: '{\n  "internalInputName": "{{parentWorkflow.someNode.output}}"\n}', helperText: 'Map parent data to group inputs.' },
      outputMapping: { label: 'Output Mapping (JSON Object)', type: 'json', placeholder: '{\n  "parentOutputName": "{{groupNode.result}}"\n}', helperText: 'Map group results to parent outputs.' },
    },
    inputHandles: ['input'], // Conceptual input, actual data comes via inputMapping
    outputHandles: ['output'], // Conceptual output, actual data set via outputMapping
  },
  {
    type: 'youtubeFetchTrending',
    name: 'YouTube: Fetch Trending',
    icon: TrendingUp,
    description: 'Fetches trending videos from YouTube (conceptual - currently logs intent). Requires YOUTUBE_API_KEY env var.',
    category: 'trigger',
    defaultConfig: { region: 'US', maxResults: 3, apiKey: '{{env.YOUTUBE_API_KEY}}' },
    configSchema: {
      region: { label: 'Region Code', type: 'string', defaultValue: 'US', placeholder: 'US, GB, IN, etc.' },
      maxResults: { label: 'Max Results', type: 'number', defaultValue: 3, placeholder: 'Number of videos' },
      apiKey: { label: 'YouTube API Key', type: 'string', placeholder: '{{env.YOUTUBE_API_KEY}}', helperText:"Set YOUTUBE_API_KEY in environment."}
    },
    outputHandles: ['videos', 'status', 'error_message'],
  },
  {
    type: 'youtubeDownloadVideo',
    name: 'YouTube: Download Video',
    icon: DownloadCloud,
    description: 'Downloads a YouTube video (conceptual - currently logs intent).',
    category: 'action',
    defaultConfig: { videoUrl: '', quality: 'best' },
    configSchema: {
      videoUrl: { label: 'Video URL', type: 'string', placeholder: '{{prev_node.videos[0].url}}' },
      quality: { label: 'Quality', type: 'select', options: ['best', '1080p', '720p', '480p'], defaultValue: 'best' },
    },
    inputHandles: ['input'],
    outputHandles: ['filePath', 'status', 'error_message'],
  },
  {
    type: 'videoConvertToShorts',
    name: 'Video: Convert to Shorts',
    icon: Scissors,
    description: 'Converts a video to a short format (conceptual - currently logs intent).',
    category: 'action',
    defaultConfig: { inputFile: '', duration: 60, strategy: 'center_cut' },
    configSchema: {
      inputFile: { label: 'Input Video File Path', type: 'string', placeholder: '{{download_node.filePath}}' },
      duration: { label: 'Short Duration (seconds)', type: 'number', defaultValue: 60 },
      strategy: { label: 'Conversion Strategy', type: 'select', options: ['center_cut', 'first_segment', 'ai_highlights'], defaultValue: 'center_cut'},
    },
    inputHandles: ['input'],
    outputHandles: ['shortFilePath', 'status', 'error_message'],
  },
  {
    type: 'youtubeUploadShort',
    name: 'YouTube: Upload Short',
    icon: UploadCloud,
    description: 'Uploads a video short to YouTube (conceptual - currently logs intent). Requires YOUTUBE_OAUTH_TOKEN env var.',
    category: 'action',
    defaultConfig: { filePath: '', title: '', description: '', tags: [], privacy: 'public', credentials: '{{env.YOUTUBE_OAUTH_TOKEN}}' },
    configSchema: {
      filePath: { label: 'Video File Path', type: 'string', placeholder: '{{convert_node.shortFilePath}}' },
      title: { label: 'Title', type: 'string', placeholder: 'My Awesome Short' },
      description: { label: 'Description', type: 'textarea' },
      tags: { label: 'Tags (comma-separated)', type: 'string', placeholder: 'short, funny, tech' },
      privacy: { label: 'Privacy', type: 'select', options: ['public', 'private', 'unlisted'], defaultValue: 'public'},
      credentials: { label: 'YouTube Credentials/Token', type: 'string', placeholder: '{{env.YOUTUBE_OAUTH_TOKEN}}', helperText: "Set YOUTUBE_OAUTH_TOKEN in environment."}
    },
    inputHandles: ['input'],
    outputHandles: ['uploadStatus', 'videoId', 'status', 'error_message'],
  },
  {
    type: 'workflowNode', 
    name: 'Custom Action', 
    icon: WorkflowIcon,
    description: 'A generic, configurable step in the workflow. Used by AI when a specific node type isn\'t matched.',
    category: 'action', 
    defaultConfig: { task_description: '', parameters: {} },
    configSchema: {
      task_description: {label: 'Task Description', type: 'string', placeholder: 'Describe what this node should do'},
      parameters: { label: 'Parameters (JSON)', type: 'textarea', placeholder: '{\n  "custom_param": "value"\n}'},
    },
    inputHandles: ['input'],
    outputHandles: ['output', 'status', 'error_message'],
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
  'webhook': 'httpRequest', 
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
  'datatransform': 'dataTransform',
  'transform data': 'dataTransform',
  'manipulate data': 'dataTransform',
  'map data': 'dataTransform',
  'script': 'dataTransform', 
  'custom script': 'dataTransform',
  'run code': 'dataTransform',
  'javascript': 'dataTransform',
  'code': 'dataTransform',
  'uppercase': 'dataTransform', 
  'touppercase': 'dataTransform',
  'lowercase': 'dataTransform',
  'tolowercase': 'dataTransform',
  'extractfields': 'dataTransform',
  'concatenate': 'dataTransform',
  'concatenatestrings': 'dataTransform',
  'stringsplit': 'dataTransform',
  'split string': 'dataTransform',
  'arraylength': 'dataTransform',
  'get array length': 'dataTransform',
  'count items in array': 'dataTransform',
  'getitematindex': 'dataTransform',
  'get item from array': 'dataTransform',
  'getobjectproperty': 'dataTransform',
  'get property from object': 'dataTransform',

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

  // Grouping / Sub-flows
  'executeflowgroup': 'executeFlowGroup',
  'execute flow group': 'executeFlowGroup',
  'sub workflow': 'executeFlowGroup',
  'sub-workflow': 'executeFlowGroup',
  'run group': 'executeFlowGroup',
  'call workflow': 'executeFlowGroup',
  'encapsulate flow': 'executeFlowGroup',

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

export const getDataTransformIcon = (transformType?: string): LucideIcon => {
  switch (transformType) {
    case 'toUpperCase':
    case 'toLowerCase':
      return CaseSensitive;
    case 'stringSplit':
      return SplitSquareHorizontal;
    case 'arrayLength':
    case 'getItemAtIndex':
      return ListOrdered;
    case 'getObjectProperty':
    case 'extractFields':
      return Milestone; 
    case 'concatenateStrings':
      return Combine;
    default:
      return FunctionSquare;
  }
}

