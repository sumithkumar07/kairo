
'use client';

import type { WorkflowNode, AvailableNodeType, WorkflowConnection } from '@/types/workflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GripVertical, AlertTriangle } from 'lucide-react'; 
import { NODE_HEIGHT, NODE_WIDTH, getDataTransformIcon } from '@/config/nodes'; // Added getDataTransformIcon
import { isConfigComplete, isNodeDisconnected, hasUnconnectedInputs } from '@/lib/workflow-utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
  connections: WorkflowConnection[]; 
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
  
  let IconComponent;
  if (node.type === 'dataTransform' && nodeType) {
    IconComponent = getDataTransformIcon(node.config?.transformType);
  } else {
    IconComponent = nodeType?.icon || GripVertical;
  }
  
  const configCompleteCheck = isConfigComplete(node, nodeType);
  const disconnectedCheck = nodeType?.category !== 'trigger' && isNodeDisconnected(node, connections, nodeType);
  const unconnectedInputsCheck = nodeType?.category !== 'trigger' && hasUnconnectedInputs(node, connections, nodeType);

  let warningMessage = "";
  if (!configCompleteCheck) warningMessage = "Configuration incomplete. Required fields are missing.";
  else if (disconnectedCheck) warningMessage = "Node is disconnected. Connect an input to it (unless it's a trigger).";
  else if (unconnectedInputsCheck) warningMessage = "One or more input handles are not connected.";

  const hasWarning = !configCompleteCheck || disconnectedCheck || unconnectedInputsCheck;

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
        'absolute shadow-lg hover:shadow-xl transition-all duration-150 ease-in-out',
        'flex flex-col overflow-hidden bg-card', 
        isConnecting ? 'cursor-crosshair' : 'cursor-grab',
        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-primary/30' : 'ring-1 ring-border',
        hasWarning && !isSelected && 'ring-yellow-500/70 border-yellow-500/70', 
        hasWarning && isSelected && 'ring-yellow-500 ring-offset-yellow-300/50' 
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: `${NODE_WIDTH}px`,
        height: `${NODE_HEIGHT}px`,
      }}
    >
      <CardHeader className={cn(
        "p-2 border-b flex-row items-center gap-2 space-y-0",
        isSelected ? "bg-primary/20" : "bg-card-foreground/5" 
      )}>
        <IconComponent className="h-4 w-4 text-primary shrink-0" />
        <CardTitle className="text-xs font-medium truncate flex-grow text-foreground" title={node.name}>
          {node.name || nodeType?.name || 'Unknown Node'}
        </CardTitle>
        {hasWarning && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{warningMessage}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardHeader>
      <CardContent className="p-2 text-xs text-muted-foreground flex-grow overflow-hidden relative">
        <p className="truncate" title={node.type}>Type: {node.type}</p>
        
        {nodeType?.inputHandles?.map((handleId, index) => {
          const numHandles = nodeType.inputHandles?.length || 1;
          const yOffsetPercentage = (100 / (numHandles + 1)) * (index + 1);
          const isPotentialTarget = isConnecting && node.id !== connectionStartNodeId;
          const isSelfInputDuringConnect = isConnecting && node.id === connectionStartNodeId;

          return (
            <TooltipProvider key={`in-tp-${node.id}-${handleId}`} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    data-handle-id={handleId}
                    data-handle-type="input"
                    className={cn(
                      "absolute -left-2 w-4 h-4 rounded-full border-2 bg-green-500 shadow-md transform -translate-y-1/2 transition-all duration-150 ease-in-out",
                       isPotentialTarget 
                        ? "border-background hover:bg-green-400 scale-110 hover:scale-125 cursor-pointer" 
                        : (isSelfInputDuringConnect ? "border-muted bg-muted opacity-50 cursor-not-allowed" : "border-background bg-primary cursor-default"),
                      isConnecting && !isPotentialTarget && !isSelfInputDuringConnect && "opacity-50 cursor-not-allowed" 
                    )}
                    style={{ top: `${yOffsetPercentage}%` }}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      if (isPotentialTarget) { 
                        onHandleClick(node.id, handleId, 'input', getHandleAbsolutePosition(handleId, false));
                      }
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Input: {handleId}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}

        {nodeType?.outputHandles?.map((handleId, index) => {
           const numHandles = nodeType.outputHandles?.length || 1;
           const yOffsetPercentage = (100 / (numHandles + 1)) * (index + 1);
           const isActiveSource = isConnecting && node.id === connectionStartNodeId && handleId === connectionStartHandleId;
           const isOtherNodeOutputDuringConnect = isConnecting && node.id !== connectionStartNodeId;
          return (
            <TooltipProvider key={`out-tp-${node.id}-${handleId}`} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    data-handle-id={handleId}
                    data-handle-type="output"
                    className={cn(
                      "absolute -right-2 w-4 h-4 rounded-full border-2 border-background shadow-md transform -translate-y-1/2 transition-all duration-150 ease-in-out",
                      isActiveSource 
                        ? "bg-orange-500 scale-110 cursor-grabbing" 
                        : "bg-accent", 
                      !isConnecting ? "cursor-pointer hover:scale-125 hover:bg-accent/70" : "cursor-default",
                      isOtherNodeOutputDuringConnect && "opacity-50 cursor-not-allowed" 
                    )}
                    style={{ top: `${yOffsetPercentage}%` }}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      if (!isConnecting) {
                        onHandleClick(node.id, handleId, 'output', getHandleAbsolutePosition(handleId, true));
                      }
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Output: {handleId}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </CardContent>
    </Card>
  );
}

