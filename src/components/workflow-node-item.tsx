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
}

export function WorkflowNodeItem({
  node,
  nodeType,
  isSelected,
  onClick,
  onDragStartInternal,
}: WorkflowNodeItemProps) {
  const IconComponent = nodeType?.icon || GripVertical; 

  return (
    <Card
      id={`node-${node.id}`}
      draggable
      onDragStart={(e) => onDragStartInternal(e, node.id)}
      onClick={() => onClick(node.id)}
      className={cn(
        'absolute cursor-grab shadow-md hover:shadow-xl transition-all duration-150 ease-in-out',
        'flex flex-col overflow-hidden',
        isSelected ? 'ring-2 ring-primary ring-offset-2' : 'ring-1 ring-border',
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: `${NODE_WIDTH}px`,
        height: `${NODE_HEIGHT}px`,
      }}
    >
      <CardHeader className="p-2 border-b bg-muted/50 flex-row items-center gap-2 space-y-0">
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
              key={`in-${handleId}`}
              className="absolute -left-1.5 w-3 h-3 bg-primary rounded-full border-2 border-background transform -translate-y-1/2"
              style={{ top: `${yOffsetPercentage}%` }}
              title={`Input: ${handleId}`}
            />
          );
        })}

        {/* Output Handles */}
        {nodeType?.outputHandles?.map((handleId, index) => {
           const numHandles = nodeType.outputHandles?.length || 1;
           const yOffsetPercentage = (100 / (numHandles + 1)) * (index + 1);
          return (
            <div
              key={`out-${handleId}`}
              className="absolute -right-1.5 w-3 h-3 bg-accent rounded-full border-2 border-background transform -translate-y-1/2"
              style={{ top: `${yOffsetPercentage}%` }}
              title={`Output: ${handleId}`}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
