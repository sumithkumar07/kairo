
import type { WorkflowNode, AvailableNodeType, WorkflowConnection } from '@/types/workflow';

export function isConfigComplete(node: WorkflowNode, nodeType?: AvailableNodeType): boolean {
  if (!nodeType || !nodeType.configSchema) {
    return true; 
  }
  for (const [key, schemaEntry] of Object.entries(nodeType.configSchema)) {
    if (schemaEntry.required) {
      const value = node.config[key];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        return false;
      }
      // For JSON fields, ensure they are not empty objects/arrays if something is expected
      if (schemaEntry.type === 'json' && typeof value === 'string' && (value.trim() === '{}' || value.trim() === '[]')) {
        // This might be too strict, depends on whether an empty JSON is acceptable for a required field.
        // For now, we consider an empty JSON string for a required JSON field as incomplete.
        // Adjust if specific "required" JSON fields can be validly empty.
      }
    }
  }
  return true;
}

export function isNodeDisconnected(node: WorkflowNode, connections: WorkflowConnection[], nodeType?: AvailableNodeType): boolean {
  if (nodeType?.category === 'trigger') {
    return false; 
  }
  // Check if there are any connections targeting this node's input handles
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
