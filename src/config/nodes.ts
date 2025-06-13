import type { AvailableNodeType } from '@/types/workflow';
import { Bot, Braces, FileJson, FunctionSquare, GitBranch, HelpCircle, LogOut, Network, Play, Terminal, Workflow as WorkflowIcon } from 'lucide-react';

export const NODE_WIDTH = 180;
export const NODE_HEIGHT = 80; // Increased height for better text fit

export const AVAILABLE_NODES_CONFIG: AvailableNodeType[] = [
  {
    type: 'trigger',
    name: 'Trigger',
    icon: Play,
    description: 'Starts the workflow, e.g., manually or on an event.',
    defaultConfig: { event: 'manualStart' },
    configSchema: {
      event: { label: 'Event Type', type: 'string', defaultValue: 'manualStart', placeholder: 'e.g., webhook, schedule' },
    },
    outputHandles: ['output'],
  },
  {
    type: 'httpRequest',
    name: 'HTTP Request',
    icon: Network,
    description: 'Makes an HTTP request to an external service or API.',
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
    type: 'parseJson',
    name: 'Parse JSON',
    icon: Braces, // Or FileJson
    description: 'Parses a JSON string and extracts data using a path.',
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
    defaultConfig: { prompt: '', model: 'gemini-1.5-flash-latest' }, // Updated model name
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
    defaultConfig: { script: 'return data;' },
    configSchema: {
        script: { label: 'JavaScript (e.g., return data.name.toUpperCase();)', type: 'textarea' },
    },
    inputHandles: ['input'],
    outputHandles: ['output'],
  },
  {
    type: 'workflowNode', // Generic node type if AI suggests something unknown
    name: 'Workflow Step',
    icon: WorkflowIcon, // Changed from Workflow to WorkflowIcon
    description: 'A generic step in the workflow.',
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
    defaultConfig: { error: 'Unknown node type from AI' },
    configSchema: {
      originalType: { label: 'Original AI Type', type: 'string' },
      originalConfig: { label: 'Original AI Config', type: 'textarea' },
    },
    inputHandles: ['input'],
    outputHandles: ['output'],
  }
];

// Mapping from AI-generated node types (keys) to our UI AvailableNodeType.type (values)
export const AI_NODE_TYPE_MAPPING: Record<string, string> = {
  'httprequest': 'httpRequest',
  'http request': 'httpRequest',
  'api call': 'httpRequest',
  'fetch data': 'httpRequest',
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
  // Add more mappings as you discover AI outputs
  'trigger': 'trigger',
  'start': 'trigger',
  'webhook': 'trigger', // map generic webhook to a trigger type
  'databaseinsert': 'workflowNode', // Example: map to a generic or specific DB node if you create one
  'default': 'workflowNode', // Fallback for truly unknown types
};
