
'use client';

import type { WorkflowNode, AvailableNodeType } from '@/types/workflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GripVertical, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import { NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';

interface WorkflowNodeItemProps {
  node: WorkflowNode;
  nodeType: AvailableNodeType | undefined; 
  isSelected: boolean;
  onClick: (nodeId: string) => void;
  onDragStartInternal: (event: React.DragEvent<HTMLDivElement>, nodeId: string) => void;
  onHandleClick: (nodeId: string, handleId: string, handleType: 'input' | 'output', handlePosition: {x: number, y: number}) => void;
  isConnecting: boolean;
}

function isNodeConfigComplete(node: WorkflowNode, nodeType?: AvailableNodeType): boolean {
  if (!nodeType || !nodeType.configSchema) {
    return true; // No schema, or no specific fields to check, assume complete or not applicable
  }

  for (const [key, schemaEntry] of Object.entries(nodeType.configSchema)) {
    if (schemaEntry.required) {
      const value = node.config[key];
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        // Allow defaultValue to satisfy requirement if current value is exactly the default empty-like value
        if (schemaEntry.defaultValue === value || (schemaEntry.defaultValue === undefined && value === '')) {
           // If default is also empty/undefined, and current value is empty/undefined, it's incomplete
        } else if (schemaEntry.defaultValue !== undefined && value !== schemaEntry.defaultValue) {
            // If there's a non-empty default and value is empty, it might be okay if default is considered 'filled'
            // This logic can be tricky. For now, simple check: if required and empty string/null/undefined, it's incomplete.
        }
         // Simplified: if required and current value is undefined, null, or empty string, it's incomplete.
         if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
            return false;
         }
      }
    }
  }
  return true;
}


export function WorkflowNodeItem({
  node,
  nodeType,
  isSelected,
  onClick,
  onDragStartInternal,
  onHandleClick,
  isConnecting,
}: WorkflowNodeItemProps) {
  const IconComponent = nodeType?.icon || GripVertical; 
  const configComplete = isNodeConfigComplete(node, nodeType);

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
        !configComplete && !isSelected && 'ring-yellow-500/70 border-yellow-500/70', // Warning style if not selected but incomplete
        !configComplete && isSelected && 'ring-yellow-500 ring-offset-yellow-200' // Stronger warning if selected and incomplete
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
        {!configComplete && (
          <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" title="Configuration incomplete" />
        )}
      </CardHeader>
      <CardContent className="p-2 text-xs text-muted-foreground flex-grow overflow-hidden relative">
        <p className="truncate" title={node.type}>Type: {node.type}</p>
        
        {/* Input Handles */}
        {nodeType?.inputHandles?.map((handleId, index) => {
          const numHandles = nodeType.inputHandles?.length || 1;
          const yOffsetPercentage = (100 / (numHandles + 1)) * (index + 1);
          return (
            <div 
              key={`in-${node.id}-${handleId}`}
              data-handle-id={handleId}
              data-handle-type="input"
              className={cn(
                "absolute -left-2 w-4 h-4 bg-primary rounded-full border-2 border-background shadow transform -translate-y-1/2 transition-transform",
                isConnecting ? "cursor-pointer hover:scale-125 hover:bg-primary/70" : "cursor-default"
              )}
              style={{ top: `${yOffsetPercentage}%` }}
              title={`Input: ${handleId}`}
              onClick={(e) => {
                e.stopPropagation(); 
                if (isConnecting) {
                  onHandleClick(node.id, handleId, 'input', getHandleAbsolutePosition(handleId, false));
                }
              }}
            />
          );
        })}

        {/* Output Handles */}
        {nodeType?.outputHandles?.map((handleId, index) => {
           const numHandles = nodeType.outputHandles?.length || 1;
           const yOffsetPercentage = (100 / (numHandles + 1)) * (index + 1);
          return (
            <div
              key={`out-${node.id}-${handleId}`}
              data-handle-id={handleId}
              data-handle-type="output"
              className={cn(
                "absolute -right-2 w-4 h-4 bg-accent rounded-full border-2 border-background shadow transform -translate-y-1/2 transition-transform",
                !isConnecting ? "cursor-pointer hover:scale-125 hover:bg-accent/70" : "cursor-default"
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

