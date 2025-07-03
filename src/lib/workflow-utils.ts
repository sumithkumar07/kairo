
import type { WorkflowNode, AvailableNodeType, WorkflowConnection } from '@/types/workflow';

export function isConfigComplete(node: WorkflowNode, nodeType?: AvailableNodeType): boolean {
  if (!nodeType || !nodeType.configSchema) {
    return true; 
  }
  for (const [key, schemaEntry] of Object.entries(nodeType.configSchema)) {
    if (schemaEntry.required) {
      const value = node.config[key];
      if (value === undefined || value === null) {
        return false;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return false;
      }
    }
  }
  return true;
}

export function hasUnconnectedInputs(node: WorkflowNode, connections: WorkflowConnection[], nodeType?: AvailableNodeType): boolean {
  if (nodeType?.category === 'trigger' || !nodeType?.inputHandles || nodeType.inputHandles.length === 0) {
    return false; 
  }
  for (const handleId of nodeType.inputHandles) {
    if (!connections.some(conn => conn.targetNodeId === node.id && conn.targetHandle === handleId)) {
      return true; 
    }
  }
  return false;
}

export function findPlaceholdersInObject(obj: any): { env: string[], secrets: string[] } {
  const envPlaceholders = new Set<string>();
  const secretPlaceholders = new Set<string>();

  const envRegex = /{{\s*env\.([^}\s]+)\s*}}/g;
  const secretRegex = /{{\s*(?:credential|secret)\.([^}\s]+)\s*}}/g;

  function recurse(current: any) {
    if (typeof current === 'string') {
      let match;
      // Important: Reset regex index for global flag
      envRegex.lastIndex = 0;
      secretRegex.lastIndex = 0;
      
      while ((match = envRegex.exec(current)) !== null) {
        envPlaceholders.add(match[1]); // Add only the name, e.g., VAR_NAME
      }
      while ((match = secretRegex.exec(current)) !== null) {
        secretPlaceholders.add(match[1]); // Add only the name, e.g., MyApiKey
      }
    } else if (Array.isArray(current)) {
      current.forEach(item => recurse(item));
    } else if (typeof current === 'object' && current !== null) {
      Object.values(current).forEach(value => recurse(value));
    }
  }

  recurse(obj);
  return {
    env: Array.from(envPlaceholders),
    secrets: Array.from(secretPlaceholders),
  };
}
