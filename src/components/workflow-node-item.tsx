
'use client';

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
    
    const yOnNode = (NODE_HEIGHT / (numHandles + 1)) * (handleIndex + 1);
    const xOnNode = isOutput ? NODE_WIDTH : 0;
    
    return { x: node.position.x + xOnNode, y: node.position.y + yOnNode };
  };

  const categoryStyling = getCanvasNodeStyling(node.category);

  const getStatusIndicator = () => {
    if (!node.lastExecutionStatus || node.lastExecutionStatus === 'pending') {
      return null; 
    }
    switch (node.lastExecutionStatus) {
      case 'success':
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" title="Success" />;
      case 'error':
        return <XCircle className="h-3.5 w-3.5 text-destructive" title="Error" />;
      case 'running':
        return <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" title="Running" />;
      case 'skipped':
        return <SkipForward className="h-3.5 w-3.5 text-gray-400" title="Skipped" />;
      case 'partial_success':
        return <AlertCircleIcon className="h-3.5 w-3.5 text-yellow-500" title="Partial Success" />;
      default:
        return null;
    }
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
        'border',
        hasWarning && node.lastExecutionStatus !== 'error' ? 'ring-2 ring-yellow-400 border-yellow-400/80 shadow-yellow-400/20' : 
        node.lastExecutionStatus === 'error' ? 'ring-2 ring-destructive border-destructive/80 shadow-destructive/20' : 
        node.lastExecutionStatus === 'success' ? 'ring-1 ring-green-500 border-green-500/70 shadow-green-500/10' : categoryStyling.nodeBorder,
        isSelected && !hasWarning && node.lastExecutionStatus !== 'error' && 'ring-2 ring-primary shadow-lg shadow-primary/30', 
        isSelected && 'ring-offset-2 ring-offset-background', 
        isSelected && hasWarning && node.lastExecutionStatus !== 'error' && 'ring-yellow-400 shadow-yellow-400/40',
        isSelected && node.lastExecutionStatus === 'error' && 'ring-destructive shadow-destructive/40'
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: `${NODE_WIDTH}px`,
        height: `${NODE_HEIGHT}px`,
      }}
    >
      <CardHeader className={cn(
        "p-2 border-b flex-row items-center gap-1.5 space-y-0",
        categoryStyling.headerBg,
      )}>
        <IconComponent className={cn("h-3.5 w-3.5 shrink-0", categoryStyling.headerIconColor)} />
        <CardTitle className={cn("text-xs font-medium truncate flex-grow", categoryStyling.headerTextColor)} title={node.name}>
          {node.name || nodeType?.name || 'Unknown Node'}
        </CardTitle>
        <div className="flex items-center gap-1 shrink-0">
          {getStatusIndicator()}
          {hasWarning && node.lastExecutionStatus !== 'error' && ( 
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400 shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">{warningMessage}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 py-1.5 text-[11px] text-muted-foreground flex-grow overflow-hidden relative bg-card/80 backdrop-blur-sm">
        <p className="truncate" title={node.type}>
          Type: <span className="font-medium text-foreground/80">{node.type}</span>
        </p>
        {node.description && (
          <p className="truncate text-[10px] opacity-80" title={node.description}>
            {node.description}
          </p>
        )}
        
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
                      "absolute -left-2 w-4 h-4 rounded-full border-2 shadow-md transform -translate-y-1/2 transition-all duration-150 ease-in-out group",
                      categoryStyling.inputHandleColor, 
                      categoryStyling.inputHandleBorder,
                       isPotentialTarget 
                        ? "border-green-400 bg-green-500 hover:bg-green-400 scale-125 hover:scale-150 cursor-pointer ring-2 ring-green-400/50" 
                        : (isSelfInputDuringConnect ? "border-muted bg-muted opacity-40 cursor-not-allowed" : "cursor-default"),
                      isConnecting && !isPotentialTarget && !isSelfInputDuringConnect && "opacity-40 cursor-not-allowed" ,
                      !isConnecting && "hover:scale-110 hover:border-primary"
                    )}
                    style={{ top: `${yOffsetPercentage}%` }}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      if (isPotentialTarget) { 
                        onHandleClick(node.id, handleId, 'input', getHandleAbsolutePosition(handleId, false));
                      }
                    }}
                  >
                    <span className="sr-only">Input handle {handleId}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-xs">Input: {handleId}</p>
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
                      "absolute -right-2 w-4 h-4 rounded-full border-2 shadow-md transform -translate-y-1/2 transition-all duration-150 ease-in-out group",
                      categoryStyling.outputHandleColor,
                      categoryStyling.outputHandleBorder,
                      isActiveSource 
                        ? "bg-orange-500 scale-150 cursor-grabbing ring-2 ring-orange-400/50 border-orange-500" 
                        : "", 
                      !isConnecting ? "cursor-pointer group-hover:scale-125 group-hover:border-primary" : "cursor-default",
                      isOtherNodeOutputDuringConnect && "opacity-40 cursor-not-allowed" 
                    )}
                    style={{ top: `${yOffsetPercentage}%` }}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      if (!isConnecting) {
                        onHandleClick(node.id, handleId, 'output', getHandleAbsolutePosition(handleId, true));
                      }
                    }}
                  >
                  <span className="sr-only">Output handle {handleId}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">Output: {handleId}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </CardContent>
    </Card>
  );
}



