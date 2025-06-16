
import type { LucideIcon } from 'lucide-react';

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
  config: Record<string, any> & { 
    retry?: RetryConfig;
    onErrorWebhook?: OnErrorWebhookConfig; 
  }; 
  inputHandles?: string[];
  outputHandles?: string[];
  aiExplanation?: string; 
  category: AvailableNodeType['category'];
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
}

export interface ExampleWorkflow {
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
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
  category: 'trigger' | 'action' | 'logic' | 'ai' | 'io' | 'group' | 'iteration' | 'control' | 'interaction' | 'unknown';
  defaultConfig: Record<string, any>;
  configSchema?: Record<string, ConfigFieldSchema>;
  inputHandles?: string[]; 
  outputHandles?: string[];
}

export interface LogEntry {
  timestamp: string; 
  message: string;
  type: 'info' | 'error' | 'success';
}

// ServerLogOutput now includes a server-generated timestamp (ISO string)
export interface ServerLogOutput {
  timestamp: string; // ISO string
  message: string;
  type: 'info' | 'error' | 'success';
}
