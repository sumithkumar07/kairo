import type { LucideIcon } from 'lucide-react';

export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  description?: string; // Added description field
  position: { x: number; y: number };
  config: Record<string, any>;
  inputHandles?: string[]; // Optional: define specific input connection points
  outputHandles?: string[]; // Optional: define specific output connection points
}

export interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourceHandle?: string; // Connects to a specific outputHandle of the source node
  targetNodeId: string;
  targetHandle?: string; // Connects to a specific inputHandle of the target node
}

export interface Workflow {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
}

export interface ConfigFieldSchema {
  label: string;
  type: 'string' | 'number' | 'textarea' | 'select' | 'boolean';
  options?: Array<{value: string; label: string} | string>; // For select type
  placeholder?: string;
  defaultValue?: any;
}

export interface AvailableNodeType {
  type: string; // Unique identifier for the node type, matches AI output if possible
  name: string; // Display name in the library
  icon: LucideIcon;
  description?: string; // Short description for tooltip or library
  defaultConfig: Record<string, any>;
  configSchema?: Record<string, ConfigFieldSchema>; // Defines the configuration form
  inputHandles?: string[]; // e.g., ['input_1', 'input_data']
  outputHandles?: string[]; // e.g., ['output_success', 'output_error']
}
