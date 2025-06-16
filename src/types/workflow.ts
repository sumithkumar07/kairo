
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

export interface ConfigFieldSchema {
  label: string;
  type: 'string' | 'number' | 'textarea' | 'select' | 'boolean' | 'json';
  options?: Array<{value: string; label: string} | string>;
  placeholder?: string;
  defaultValue?: any;
  helperText?: string;
  required?: boolean; // Added
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

export type ServerLogOutput = Omit<LogEntry, 'timestamp'>;

// Moved ManagedCredential types to their own file if they become complex,
// but keeping simple ones here if not too broad.
// For now, creating a separate credentials.ts is better.

