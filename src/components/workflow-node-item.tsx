
'use client';

import type { WorkflowNode, AvailableNodeType, WorkflowConnection } from '@/types/workflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GripVertical, AlertTriangle } from 'lucide-react'; 
import { NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';

interface WorkflowNodeItemProps {
  node: WorkflowNode;
  nodeType: AvailableNodeType | undefined; 
  isSelected: boolean;
  onClick: (nodeId: string) => void;
  onDragStartInternal: (event: React.DragEvent<HTMLDivElement>, nodeId: string) => void;
  onHandleClick: (nodeId: string, handleId: string, handleType: 'input' | 'output', handlePosition: {x: number, y: number}) => void;
  isConnecting: boolean;
  connectionStartNodeId: string | null; 
  connectionStartHandleId: string | null; 
  connections: WorkflowConnection[]; // Added to check for disconnections
}

function isConfigComplete(node: WorkflowNode, nodeType?: AvailableNodeType): boolean {
  if (!nodeType || !nodeType.configSchema) {
    return true; 
  }
  for (const [key, schemaEntry] of Object.entries(nodeType.configSchema)) {
    if (schemaEntry.required) {
      const value = node.config[key];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        return false;
      }
    }
  }
  return true;
}

function isNodeDisconnected(node: WorkflowNode, connections: WorkflowConnection[], nodeType?: AvailableNodeType): boolean {
  if (nodeType?.category === 'trigger') {
    return false; // Triggers are entry points, not considered disconnected if they have no inputs
  }
  // Check if there are any connections targeting this node's input handles
  return !connections.some(conn => conn.targetNodeId === node.id);
}

function hasUnconnectedInputs(node: WorkflowNode, connections: WorkflowConnection[], nodeType?: AvailableNodeType): boolean {
  if (nodeType?.category === 'trigger' || !nodeType?.inputHandles || nodeType.inputHandles.length === 0) {
    return false; // Triggers or nodes without defined input handles don't have this issue
  }
  // Check if every defined input handle has at least one connection targeting it
  for (const handleId of nodeType.inputHandles) {
    if (!connections.some(conn => conn.targetNodeId === node.id && conn.targetHandle === handleId)) {
      return true; // Found an unconnected input handle
    }
  }
  return false;
}


export function WorkflowNodeItem({
  node,
  nodeType,
  isSelected,
  onClick,
  onDragStartInternal,
  onHandleClick,
  isConnecting,
  connectionStartNodeId,
  connectionStartHandleId,
  connections,
}: WorkflowNodeItemProps) {
  const IconComponent = nodeType?.icon || GripVertical; 
  
  const configComplete = isConfigComplete(node, nodeType);
  const disconnected = isNodeDisconnected(node, connections, nodeType);
  const unconnectedInputs = hasUnconnectedInputs(node, connections, nodeType);

  let warningMessage = "";
  if (!configComplete) warningMessage = "Configuration incomplete.";
  else if (disconnected) warningMessage = "Node is disconnected. Connect an input to it.";
  else if (unconnectedInputs) warningMessage = "One or more input handles are not connected.";

  const hasWarning = !configComplete || disconnected || unconnectedInputs;

  const getHandleAbsolutePosition = (handleId: string, isOutput: boolean): { x: number, y: number } => {
    const handles = isOutput ? nodeType?.outputHandles : nodeType?.inputHandles;
    const numHandles = handles?.length || 1;
    const handleIndex = handles?.findIndex(h => h === handleId) ?? 0;
    
    const y = node.position.y + (NODE_HEIGHT / (numHandles + 1)) * (handleIndex + 1);
    const x = isOutput ? node.position.x + NODE_WIDTH : node.position.x;
    return { x, y };
  };

  return (
    <Card
      id={`node-${node.id}`}
      draggable
      onDragStart={(e) => {
        if (isConnecting) e.preventDefault(); 
        else onDragStartInternal(e, node.id);
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[data-handle-id]')) return;
        onClick(node.id);
      }}
      className={cn(
        'absolute shadow-md hover:shadow-xl transition-all duration-150 ease-in-out',
        'flex flex-col overflow-hidden',
        isConnecting ? 'cursor-crosshair' : 'cursor-grab',
        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'ring-1 ring-border',
        hasWarning && !isSelected && 'ring-yellow-500/70 border-yellow-500/70', 
        hasWarning && isSelected && 'ring-yellow-500 ring-offset-yellow-200' 
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: `${NODE_WIDTH}px`,
        height: `${NODE_HEIGHT}px`,
      }}
    >
      <CardHeader className="p-2 border-b bg-primary/5 flex-row items-center gap-2 space-y-0">
        <IconComponent className="h-4 w-4 text-primary shrink-0" />
        <CardTitle className="text-xs font-medium truncate flex-grow" title={node.name}>
          {node.name || nodeType?.name || 'Unknown Node'}
        </CardTitle>
        {hasWarning && (
          <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" title={warningMessage} />
        )}
      </CardHeader>
      <CardContent className="p-2 text-xs text-muted-foreground flex-grow overflow-hidden relative">
        <p className="truncate" title={node.type}>Type: {node.type}</p>
        
        {nodeType?.inputHandles?.map((handleId, index) => {
          const numHandles = nodeType.inputHandles?.length || 1;
          const yOffsetPercentage = (100 / (numHandles + 1)) * (index + 1);
          const isPotentialTarget = isConnecting && node.id !== connectionStartNodeId;
          return (
            <div 
              key={`in-${node.id}-${handleId}`}
              data-handle-id={handleId}
              data-handle-type="input"
              className={cn(
                "absolute -left-2 w-4 h-4 rounded-full border-2 border-background shadow transform -translate-y-1/2 transition-all duration-150 ease-in-out",
                isPotentialTarget 
                  ? "bg-green-500 hover:bg-green-400 scale-110 hover:scale-125 cursor-pointer" 
                  : (isConnecting && node.id === connectionStartNodeId ? "bg-muted opacity-50 cursor-not-allowed" : "bg-primary cursor-default"),
                 isConnecting && !isPotentialTarget && node.id !== connectionStartNodeId && "opacity-50 cursor-not-allowed" 
              )}
              style={{ top: `${yOffsetPercentage}%` }}
              title={`Input: ${handleId}`}
              onClick={(e) => {
                e.stopPropagation(); 
                if (isPotentialTarget) { 
                  onHandleClick(node.id, handleId, 'input', getHandleAbsolutePosition(handleId, false));
                }
              }}
            />
          );
        })}

        {nodeType?.outputHandles?.map((handleId, index) => {
           const numHandles = nodeType.outputHandles?.length || 1;
           const yOffsetPercentage = (100 / (numHandles + 1)) * (index + 1);
           const isActiveSource = isConnecting && node.id === connectionStartNodeId && handleId === connectionStartHandleId;
          return (
            <div
              key={`out-${node.id}-${handleId}`}
              data-handle-id={handleId}
              data-handle-type="output"
              className={cn(
                "absolute -right-2 w-4 h-4 rounded-full border-2 border-background shadow transform -translate-y-1/2 transition-all duration-150 ease-in-out",
                isActiveSource 
                  ? "bg-orange-500 scale-110 cursor-grabbing" 
                  : "bg-accent",
                !isConnecting ? "cursor-pointer hover:scale-125 hover:bg-accent/70" : "cursor-default",
                isConnecting && !isActiveSource && "opacity-50 cursor-not-allowed" 
              )}
              style={{ top: `${yOffsetPercentage}%` }}
              title={`Output: ${handleId}`}
              onClick={(e) => {
                e.stopPropagation(); 
                if (!isConnecting) {
                  onHandleClick(node.id, handleId, 'output', getHandleAbsolutePosition(handleId, true));
                }
              }}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}

