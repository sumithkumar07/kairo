
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
      if (schemaEntry.type === 'json' && typeof value === 'string') {
        const trimmedValue = value.trim();
        if ((trimmedValue === '{}' || trimmedValue === '[]') && !schemaEntry.allowEmptyJson) {
            return false;
        }
        // Basic check for non-empty but potentially invalid JSON structure if required
        if (trimmedValue !== '' && (trimmedValue === '{}' || trimmedValue === '[]') && !schemaEntry.allowEmptyJson && schemaEntry.required) {
             // This scenario is tricky; an empty object/array might be invalid if content is expected.
             // However, if allowEmptyJson is false, it implies non-empty content is expected.
        }
      }
    }
  }
  return true;
}

export function isNodeDisconnected(node: WorkflowNode, connections: WorkflowConnection[], nodeType?: AvailableNodeType): boolean {
  if (nodeType?.category === 'trigger') {
    return false; 
  }
  return !connections.some(conn => conn.targetNodeId === node.id);
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

export function findPlaceholdersInObject(obj: any, type: 'env' | 'credential'): string[] {
  const placeholders = new Set<string>();
  const regex = new RegExp(`{{\\s*${type === 'secret' ? '(?:secret|credential)' : type}\\.([^}\\s]+)\\s*}}`, 'g');

  function recurse(current: any) {
    if (typeof current === 'string') {
      let match;
      // Reset lastIndex for global regex if it's being reused or if the string is different
      regex.lastIndex = 0; 
      while ((match = regex.exec(current)) !== null) {
        placeholders.add(match[0]); // match[0] is the full placeholder e.g. {{env.VAR_NAME}}
      }
    } else if (Array.isArray(current)) {
      current.forEach(item => recurse(item));
    } else if (typeof current === 'object' && current !== null) {
      Object.values(current).forEach(value => recurse(value));
    }
  }

  recurse(obj);
  return Array.from(placeholders);
}
