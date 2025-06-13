
import type { LucideIcon } from 'lucide-react';

export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  description?: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  inputHandles?: string[];
  outputHandles?: string[];
  aiExplanation?: string; 
  category: AvailableNodeType['category']; // Ensure category is part of WorkflowNode
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
  type: 'string' | 'number' | 'textarea' | 'select' | 'boolean' | 'json'; // Added json for array/object inputs
  options?: Array<{value: string; label: string} | string>;
  placeholder?: string;
  defaultValue?: any;
  helperText?: string; // Optional helper text
}

export interface AvailableNodeType {
  type: string;
  name: string;
  icon: LucideIcon;
  description?: string;
  category: 'trigger' | 'action' | 'logic' | 'ai' | 'io' | 'unknown';
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
