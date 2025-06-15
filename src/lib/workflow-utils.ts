
import type { WorkflowNode, AvailableNodeType, WorkflowConnection } from '@/types/workflow';

export function isConfigComplete(node: WorkflowNode, nodeType?: AvailableNodeType): boolean {
  if (!nodeType || !nodeType.configSchema) {
    return true; 
  }
  for (const [key, schemaEntry] of Object.entries(nodeType.configSchema)) {
    if (schemaEntry.required) {
      const value = node.config[key];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        // Special check for retry and onErrorWebhook: if they are empty objects but schema requires them, it's fine if they are not truly "required" for basic functionality
        if ((key === 'retry' || key === 'onErrorWebhook') && typeof value === 'object' && Object.keys(value).length === 0) {
          // If the schema marks retry/onErrorWebhook itself as required but it's an empty object,
          // consider it "present" for this check, actual validation of its fields happens elsewhere or is implied.
          // This might need refinement based on how "required" is defined for these complex objects.
          // For now, an empty object satisfies a "required" complex field placeholder.
        } else {
          return false;
        }
      }
      if (schemaEntry.type === 'json' && typeof value === 'string' && (value.trim() === '{}' || value.trim() === '[]')) {
        // If a JSON field is required and it's an empty object/array string, this might be invalid.
        // However, some "required" JSON fields might accept empty structures.
        // This part of the logic is tricky without more context on specific field requirements.
        // For now, we assume an empty JSON string for a required JSON field might be incomplete.
        // Consider schemaEntry.allowEmptyJson: boolean if finer control is needed.
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

export function findPlaceholdersInObject(obj: any, type: 'env' | 'secret'): string[] {
  const placeholders = new Set<string>();
  const regex = new RegExp(`{{\\s*${type}\\.([^}\\s]+)\\s*}}`, 'g');

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
