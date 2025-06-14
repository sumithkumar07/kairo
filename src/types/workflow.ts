
import type { LucideIcon } from 'lucide-react';

export interface RetryConfig {
  attempts: number; // Total number of attempts (e.g., 3 means 1 initial + 2 retries)
  delayMs?: number; // Initial delay in milliseconds before the first retry
  backoffFactor?: number; // Factor for exponential backoff (e.g., 2 means delay doubles each time)
  retryOnStatusCodes?: number[]; // For HTTP nodes, only retry if error status code is in this list
  retryOnErrorKeywords?: string[]; // Only retry if error message contains one of these (case-insensitive) keywords
}

export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  description?: string;
  position: { x: number; y: number };
  config: Record<string, any> & { retry?: RetryConfig }; 
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
}

export interface AvailableNodeType {
  type: string;
  name: string;
  icon: LucideIcon;
  description?: string;
  category: 'trigger' | 'action' | 'logic' | 'ai' | 'io' | 'group' | 'iteration' | 'unknown';
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

