import type { SubscriptionTier } from './subscription';
import type { z } from 'zod';

export type RetryConfig = {
  attempts: number;
  delayMs: number;
  backoffFactor?: number;
};

export type OnErrorWebhookConfig = {
  url: string;
  includeWorkflowData?: boolean;
};

export type WorkflowNode = {
  id: string;
  type: string;
  name?: string;
  description?: string;
  position: { x: number; y: number };
  config?: Record<string, any>;
  inputMapping?: Record<string, any>;
  outputHandles?: string[];
};

export type WorkflowConnection = {
  id: string;
  sourceNodeId: string;
  sourceHandle: string;
  targetNodeId: string;
  targetHandle: string;
};

export type Workflow = {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
};

export interface Tool {
  name: string;
  description: string;
  icon: string;
  category: string;
}

export interface EnhancedTool extends Tool {
  id: string;
  version: string;
  author: string;
  rating: number;
  downloads: number;
  lastUpdated: string;
  pricing: 'free' | 'paid' | 'freemium';
  documentation: string;
  examples: ToolExample[];
  dependencies: string[];
}

export interface ToolExample {
  title: string;
  description: string;
  configuration: Record<string, any>;
}

export type ServerLogOutput = {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'warning';
};

export type WorkflowExecutionResult = {
  serverLogs: ServerLogOutput[];
  finalWorkflowData: Record<string, any>;
};

export interface WorkflowRunRecord {
  id: string;
  workflowName: string;
  timestamp: string;
  status: 'Success' | 'Failed';
  executionResult: WorkflowExecutionResult;
  initialData?: Record<string, any>;
  workflowSnapshot?: Workflow;
}

export interface SavedWorkflowMetadata {
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_community?: boolean;
  author?: string;
  rating?: number;
}

export interface ExampleWorkflow extends SavedWorkflowMetadata {
  workflow: Workflow;
}

export interface ManagedCredential {
  id: string;
  name: string;
  service?: string;
  value: string;
  user_id: string;
  created_at: string;
}

export interface AgentConfig {
  enabledTools: string[];
  customInstructions?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface DisplayUserApiKey {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at?: string;
  is_revoked: boolean;
}

export interface McpCommandRecord {
  id: string;
  user_id: string;
  command: string;
  response: string;
  status: 'Success' | 'Failed';
  timestamp: string;
}