
'use client';

import React from 'react';
import type { WorkflowNode, AvailableNodeType, WorkflowConnection } from '@/types/workflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GripVertical, AlertTriangle, CheckCircle2, XCircle, Loader2, SkipForward, AlertCircleIcon } from 'lucide-react'; 
import { NODE_HEIGHT, NODE_WIDTH, getDataTransformIcon, getCanvasNodeStyling } from '@/config/nodes';
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
  readOnly?: boolean;
  executionData?: any;
}


const WorkflowNodeItemComponent = ({
  node,
  nodeType,
  isSelected,
  onClick,
  onDragStartInternal,
  onHandleClick,
  isConnecting,
  connectionStartNodeId,
  connections,
  readOnly = false,
  executionData,
}: WorkflowNodeItemProps) => {
  
  const IconComponent = node.type === 'dataTransform' && nodeType 
    ? getDataTransformIcon(node.config?.transformType) 
    : nodeType?.icon || GripVertical;
  
  const configCompleteCheck = isConfigComplete(node, nodeType);
  const disconnectedCheck = nodeType?.category !== 'trigger' && isNodeDisconnected(node, connections, nodeType);
  const unconnectedInputsCheck = nodeType?.category !== 'trigger' && hasUnconnectedInputs(node, connections, nodeType);

  let warningMessage = "";
  if (!configCompleteCheck) warningMessage = "Configuration incomplete. Required fields are missing.";
  else if (disconnectedCheck) warningMessage = "Node is disconnected. Connect an input to it.";
  else if (unconnectedInputsCheck) warningMessage = "One or more required input handles are not connected.";

  const hasWarning = !configCompleteCheck || disconnectedCheck || unconnectedInputsCheck;

  const getHandleAbsolutePosition = (handleId: string, isOutput: boolean): { x: number, y: number } => {
    const handles = isOutput ? nodeType?.outputHandles : nodeType?.inputHandles;
    const numHandles = handles?.length || 1;
    const handleIndex = handles?.findIndex(h => h === handleId) ?? 0;
    
    const yOnNode = (NODE_HEIGHT / (numHandles + 1)) * (handleIndex + 1);
    const xOnNode = isOutput ? NODE_WIDTH : 0;
    
    return { x: node.position.x + xOnNode, y: node.position.y + yOnNode };
  };

  const categoryStyling = getCanvasNodeStyling(node.category);

  const getStatusIndicator = () => {
    if (!node.lastExecutionStatus || node.lastExecutionStatus === 'pending') return null;

    const statusMap = {
      success: { Icon: CheckCircle2, color: 'text-green-400', tooltip: 'Successfully Executed' },
      error: { Icon: XCircle, color: 'text-destructive', tooltip: 'Execution Error' },
      running: { Icon: Loader2, color: 'text-blue-400 animate-spin', tooltip: 'Currently Running' },
      skipped: { Icon: SkipForward, color: 'text-gray-500', tooltip: 'Execution Skipped' },
      partial_success: { Icon: AlertCircleIcon, color: 'text-yellow-400', tooltip: 'Partial Success' },
    };
    const statusInfo = statusMap[node.lastExecutionStatus];
    
    if (!statusInfo) return null;
    const { Icon, color, tooltip } = statusInfo;
    
    let finalTooltip = tooltip;
    if (node.lastExecutionStatus === 'error' && executionData?.error_message) {
      finalTooltip = `Error: ${executionData.error_message}`;
    }

    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild><Icon className={cn("h-3.5 w-3.5", color)} /></TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs"><p className="text-xs">{finalTooltip}</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  
  let nodeStyleClasses = categoryStyling.nodeBorder;
  if (node.lastExecutionStatus === 'error') nodeStyleClasses = 'ring-2 ring-destructive border-destructive/80';
  else if (hasWarning && !readOnly) nodeStyleClasses = 'ring-1 ring-orange-500 border-orange-500/80';
  else if (node.lastExecutionStatus === 'success') nodeStyleClasses = 'ring-1 ring-green-500/80 border-green-500/70';
  else if (node.lastExecutionStatus === 'partial_success') nodeStyleClasses = 'ring-1 ring-yellow-500/80 border-yellow-500/70';

  return (
    <Card
      id={`node-${node.id}`}
      draggable={!readOnly}
      onDragStart={(e) => !isConnecting && !readOnly && onDragStartInternal(e, node.id)}
      onClick={(e) => !(e.target as HTMLElement).closest('[data-handle-id]') && !readOnly && onClick(node.id)}
      className={cn(
        'workflow-node-item absolute shadow-lg transition-all duration-150 ease-in-out',
        'flex flex-col overflow-hidden bg-card/95 backdrop-blur-sm border',
        isConnecting ? 'cursor-crosshair' : (readOnly ? 'cursor-default' : 'cursor-grab hover:shadow-xl'),
        nodeStyleClasses, 
        isSelected && !readOnly && 'ring-2 ring-offset-2 ring-offset-background ring-primary',
      )}
      style={{ left: node.position.x, top: node.position.y, width: NODE_WIDTH, height: NODE_HEIGHT }}
    >
      <CardHeader className={cn("p-2 border-b flex-row items-center gap-1.5 space-y-0", categoryStyling.headerBg)}>
        <IconComponent className={cn("h-3.5 w-3.5 shrink-0", categoryStyling.headerIconColor)} />
        <CardTitle className={cn("text-xs font-medium truncate flex-grow", categoryStyling.headerTextColor)} title={node.name}>
          {node.name || nodeType?.name || 'Unknown Node'}
        </CardTitle>
        <div className="flex items-center gap-1 shrink-0">
          {getStatusIndicator()}
          {hasWarning && node.lastExecutionStatus !== 'error' && !readOnly && ( 
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild><AlertTriangle className="h-3.5 w-3.5 text-yellow-300 shrink-0" /></TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs"><p className="text-xs">{warningMessage}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 py-1.5 text-[11px] text-muted-foreground flex-grow overflow-hidden relative">
        <p className="truncate" title={node.type}>Type: <span className="font-medium text-foreground/80">{node.type}</span></p>
        {node.description && <p className="truncate text-[10px] opacity-80" title={node.description}>{node.description}</p>}
        
        {nodeType?.inputHandles?.map((handleId, index) => {
          const numHandles = nodeType.inputHandles?.length || 1;
          const yOffsetPercentage = (100 / (numHandles + 1)) * (index + 1);
          const isConnected = connections.some(c => c.targetNodeId === node.id && c.targetHandle === handleId);
          return (
            <TooltipProvider key={`in-tp-${node.id}-${handleId}`} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    data-handle-id={handleId}
                    className={cn(
                      "absolute -left-2 w-4 h-4 rounded-full border-2 shadow-md transform -translate-y-1/2 transition-all",
                      categoryStyling.inputHandleBorder,
                      isConnected ? categoryStyling.inputHandleColor : 'bg-card',
                      !readOnly && (isConnecting ? 'cursor-pointer' : 'cursor-default'),
                      readOnly && 'cursor-not-allowed',
                    )}
                    style={{ top: `${yOffsetPercentage}%` }}
                    onClick={(e) => { if (!readOnly) { e.stopPropagation(); onHandleClick(node.id, handleId, 'input', getHandleAbsolutePosition(handleId, false)); } }}
                  />
                </TooltipTrigger>
                <TooltipContent side="left"><p className="text-xs">Input: {handleId} {isConnected && "(Connected)"}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}

        {nodeType?.outputHandles?.map((handleId, index) => {
           const numHandles = nodeType.outputHandles?.length || 1;
           const yOffsetPercentage = (100 / (numHandles + 1)) * (index + 1);
           const isConnected = connections.some(c => c.sourceNodeId === node.id && c.sourceHandle === handleId);
          return (
            <TooltipProvider key={`out-tp-${node.id}-${handleId}`} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    data-handle-id={handleId}
                    className={cn(
                      "absolute -right-2 w-4 h-4 rounded-full border-2 shadow-md transform -translate-y-1/2 transition-all",
                      !readOnly && "cursor-pointer group-hover:scale-125",
                      readOnly && "cursor-not-allowed",
                      categoryStyling.outputHandleBorder,
                      isConnected ? categoryStyling.outputHandleColor : 'bg-card',
                    )}
                    style={{ top: `${yOffsetPercentage}%` }}
                    onClick={(e) => { if (!readOnly) { e.stopPropagation(); onHandleClick(node.id, handleId, 'output', getHandleAbsolutePosition(handleId, true)); } }}
                  />
                </TooltipTrigger>
                <TooltipContent side="right"><p className="text-xs">Output: {handleId} {isConnected && "(Connected)"}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </CardContent>
    </Card>
  );
};

export const WorkflowNodeItem = React.memo(WorkflowNodeItemComponent);
WorkflowNodeItem.displayName = 'WorkflowNodeItem';
