
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
  aiExplanation?: string; // AI-generated explanation for the node
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
  type: 'string' | 'number' | 'textarea' | 'select' | 'boolean';
  options?: Array<{value: string; label: string} | string>;
  placeholder?: string;
  defaultValue?: any;
}

export interface AvailableNodeType {
  type: string;
  name: string;
  icon: LucideIcon;
  description?: string;
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
