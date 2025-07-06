

import type { LucideIcon } from 'lucide-react';
import type { Tool as GenkitTool } from 'genkit';
import type { SubscriptionTier } from './subscription';
import type { DiagnoseWorkflowErrorOutput } from '@/ai/flows/diagnose-workflow-error-flow';


export interface RetryConfig {
  attempts: number; 
  delayMs?: number; 
  backoffFactor?: number; 
  retryOnStatusCodes?: number[]; 
  retryOnErrorKeywords?: string[]; 
}

export interface OnErrorWebhookConfig {
  url: string;
  method?: 'POST' | 'PUT';
  headers?: Record<string, string>;
  bodyTemplate?: Record<string, any>; 
}

export interface ManualInputFieldSchema {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select';
  options?: string[]; 
  defaultValue?: any;
  placeholder?: string;
  required?: boolean;
}


export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  description?: string;
  position: { x: number; y: number };
  inputMapping?: Record<string, any>;
  config: Record<string, any> & { 
    retry?: RetryConfig;
    onErrorWebhook?: OnErrorWebhookConfig; 
  }; 
  inputHandles?: string[];
  outputHandles?: string[];
  aiExplanation?: string; 
  category: AvailableNodeType['category'];
  lastExecutionStatus?: 'success' | 'error' | 'skipped' | 'pending' | 'running' | 'partial_success';
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourceHandle?: string;
  targetNodeId: string;
  targetHandle?: string;
}

export interface Workflow {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  // Add metadata for canvas state
  canvasOffset?: { x: number; y: number };
  zoomLevel?: number;
  isSimulationMode?: boolean;
  name?: string; // Optional name from AI generation
  description?: string; // Optional description from AI generation
}

export interface ExampleWorkflow {
  name: string;
  description: string;
  workflow: Workflow;
}

export interface SavedWorkflowMetadata {
  name: string;
  type: 'example' | 'user' | 'community';
  description?: string;
  updated_at?: string;
}

export interface ConfigFieldSchema {
  label: string;
  type: 'string' | 'number' | 'textarea' | 'select' | 'boolean' | 'json';
  options?: Array<{value: string; label: string} | string>;
  placeholder?: string;
  defaultValue?: any;
  helperText?: string;
  required?: boolean; 
  relevantForTypes?: string[]; // For dataTransform node conditional fields
  allowEmptyJson?: boolean; // For JSON type, if an empty object/array is acceptable when required
}

export interface BranchConfig {
  id: string;
  name?: string; 
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  inputMapping?: Record<string, string>; 
  outputSource?: string; 
}


export interface AvailableNodeType {
  type: string;
  name: string;
  icon: LucideIcon;
  description?: string;
  category: 'trigger' | 'action' | 'logic' | 'ai' | 'io' | 'group' | 'iteration' | 'control' | 'interaction' | 'integrations' | 'unknown';
  defaultConfig: Record<string, any>;
  configSchema?: Record<string, ConfigFieldSchema>;
  inputHandles?: string[]; 
  outputHandles?: string[];
  isAdvanced?: boolean; // Added for Pro tier feature gating
}

export interface ServerLogOutput {
  timestamp: string; // ISO string
  message: string;
  type: 'info' | 'error' | 'success';
}

export interface WorkflowExecutionResult {
  serverLogs: ServerLogOutput[];
  finalWorkflowData: Record<string, any>; // Contains node outputs and their lastExecutionStatus
}

export interface WorkflowRunRecord {
  id: string;
  workflowName: string;
  timestamp: string; // ISO string
  status: 'Success' | 'Failed';
  executionResult: WorkflowExecutionResult;
  initialData?: Record<string, any>; // The initial data that triggered the workflow (e.g. from webhook)
  workflowSnapshot: Workflow; // A snapshot of the workflow at the time of execution
}


export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
}

export interface McpCommandRecord {
  id: string;
  user_id: string;
  timestamp: string; // ISO string
  command: string;
  response: string;
  status: 'Success' | 'Failed';
}

export type LogEntry = {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
  data?: any;
};

export type Tool = {
    name: string;
    description: string;
    icon: LucideIcon;
    service: string;
    genkitTool: GenkitTool<any, any>;
};

export type AgentConfig = {
  enabledTools: string[]; // Array of tool names
};

export interface ManagedCredential {
  id: string;
  name: string;
  value: string; // This would be encrypted in a real production system
  service?: string;
  created_at: string;
  user_id: string;
}

export interface UserApiKey {
    id: string; // A UUID for the key record
    user_id: string; // Foreign key to auth.users
    key_hash: string; // A SHA-256 hash of the API key
    prefix: string; // The non-secret prefix of the key (e.g., "kairo_sk_")
    created_at: string;
    last_used_at?: string | null;
}

export interface DisplayUserApiKey extends Omit<UserApiKey, 'key_hash' | 'user_id'> {}

export type { DiagnoseWorkflowErrorOutput };

export type SuggestNextNodeOutput = {
  suggestedNode: string;
  reason: string;
};
