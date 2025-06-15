
'use client';

import type { WorkflowNode, AvailableNodeType } from '@/types/workflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';
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
        if (isConnecting) e.preventDefault(); // Prevent dragging node while connecting
        else onDragStartInternal(e, node.id);
      }}
      onClick={(e) => {
        // Prevent node selection if a handle was clicked
        if ((e.target as HTMLElement).closest('[data-handle-id]')) return;
        onClick(node.id);
      }}
      className={cn(
        'absolute shadow-md hover:shadow-xl transition-all duration-150 ease-in-out',
        'flex flex-col overflow-hidden',
        isConnecting ? 'cursor-crosshair' : 'cursor-grab',
        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'ring-1 ring-border',
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
                e.stopPropagation(); // Prevent card click
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
                e.stopPropagation(); // Prevent card click
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
