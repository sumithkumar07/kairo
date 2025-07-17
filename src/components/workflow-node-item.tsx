
'use client';

import React from 'react';
import type { WorkflowNode, AvailableNodeType, WorkflowConnection } from '@/types/workflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GripVertical, AlertTriangle, CheckCircle2, XCircle, Loader2, SkipForward, AlertCircleIcon, Brain, Users, Eye, HelpCircle, Gauge, Target, Shield } from 'lucide-react'; 
import { NODE_HEIGHT, NODE_WIDTH, getDataTransformIcon, getCanvasNodeStyling } from '@/config/nodes';
import { isConfigComplete, hasUnconnectedInputs } from '@/lib/workflow-utils';
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
  // CARES Framework props
  aiDecision?: {
    id: string;
    confidence: number;
    reasoning: string;
    riskLevel: 'low' | 'medium' | 'high';
    alternatives?: string[];
    humanReviewRequired?: boolean;
  };
  onShowReasoning?: (nodeId: string, decisionId: string) => void;
  onRequestHumanReview?: (nodeId: string, reason: string) => void;
  showCARESIndicators?: boolean;
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
  aiDecision,
  onShowReasoning,
  onRequestHumanReview,
  showCARESIndicators = true,
}: WorkflowNodeItemProps) => {
  
  const IconComponent = nodeType?.icon || GripVertical;
  
  const configCompleteCheck = isConfigComplete(node, nodeType);
  const unconnectedInputsCheck = nodeType?.category !== 'trigger' && hasUnconnectedInputs(node, connections, nodeType);

  let warningMessage = "";
  if (!configCompleteCheck) warningMessage = "Configuration incomplete. Required fields are missing.";
  else if (unconnectedInputsCheck) warningMessage = "One or more required input handles are not connected.";

  const hasWarning = !configCompleteCheck || unconnectedInputsCheck;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 90) return 'default';
    if (confidence >= 70) return 'secondary';
    return 'destructive';
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskLevelIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return <Shield className="h-3 w-3" />;
      case 'medium': return <AlertTriangle className="h-3 w-3" />;
      case 'high': return <AlertCircleIcon className="h-3 w-3" />;
      default: return <HelpCircle className="h-3 w-3" />;
    }
  };

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
    const statusToUse = executionData?.lastExecutionStatus || node.lastExecutionStatus;
    if (!statusToUse || statusToUse === 'pending') return null;

    const statusMap = {
      success: { Icon: CheckCircle2, color: 'text-green-500', tooltip: 'Successfully Executed' },
      error: { Icon: XCircle, color: 'text-red-500', tooltip: 'Execution Error' },
      running: { Icon: Loader2, color: 'text-blue-500 animate-spin', tooltip: 'Currently Running' },
      skipped: { Icon: SkipForward, color: 'text-gray-500', tooltip: 'Execution Skipped' },
      partial_success: { Icon: AlertCircleIcon, color: 'text-yellow-500', tooltip: 'Partial Success' },
    };
    const statusInfo = statusMap[statusToUse];
    
    if (!statusInfo) return null;
    const { Icon, color, tooltip } = statusInfo;
    
    let finalTooltip = tooltip;
    if (statusToUse === 'error' && executionData?.error_message) {
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
  
  const nodeExecutionStatus = executionData?.lastExecutionStatus || node.lastExecutionStatus;

  let nodeStyleClasses = categoryStyling.nodeBorder;
  if (nodeExecutionStatus === 'error') nodeStyleClasses = 'ring-2 ring-destructive/80 border-destructive/60';
  else if (hasWarning && !readOnly) nodeStyleClasses = 'ring-1 ring-orange-400 border-orange-400/80';
  else if (nodeExecutionStatus === 'success') nodeStyleClasses = 'ring-1 ring-green-500/60 border-green-500/50';
  else if (nodeExecutionStatus === 'partial_success') nodeStyleClasses = 'ring-1 ring-yellow-500/60 border-yellow-500/50';

  return (
    <Card
      id={`node-${node.id}`}
      draggable={!readOnly}
      onDragStart={(e) => !isConnecting && !readOnly && onDragStartInternal(e, node.id)}
      onClick={(e) => !(e.target as HTMLElement).closest('[data-handle-id]') && onClick(node.id)}
      className={cn(
        'workflow-node-item absolute shadow-md hover:shadow-lg transition-all duration-150 ease-in-out',
        'flex flex-col overflow-hidden bg-card border rounded-lg',
        isConnecting ? 'cursor-crosshair' : (readOnly ? 'cursor-pointer' : 'cursor-grab'),
        nodeStyleClasses, 
        isSelected && !readOnly && 'ring-2 ring-offset-1 ring-offset-background ring-primary',
        isSelected && readOnly && 'ring-2 ring-offset-1 ring-offset-background ring-blue-500',
      )}
      style={{ left: node.position.x, top: node.position.y, width: NODE_WIDTH, height: NODE_HEIGHT }}
    >
      <CardHeader className={cn("p-2 border-b flex-row items-center gap-2 space-y-0", categoryStyling.headerBg)}>
        <IconComponent className={cn("h-4 w-4 shrink-0", categoryStyling.headerIconColor)} />
        <CardTitle className={cn("text-sm font-semibold truncate flex-grow", categoryStyling.headerTextColor)} title={node.name}>
          {node.name || nodeType?.name || 'Unknown Node'}
        </CardTitle>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* CARES Framework Indicators */}
          {showCARESIndicators && aiDecision && (
            <>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant={getConfidenceBadgeVariant(aiDecision.confidence)}
                      className="text-xs px-1 py-0.5"
                    >
                      {aiDecision.confidence}%
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">AI Confidence: {aiDecision.confidence}%</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn("flex items-center", getRiskLevelColor(aiDecision.riskLevel))}>
                      {getRiskLevelIcon(aiDecision.riskLevel)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Risk Level: {aiDecision.riskLevel}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {aiDecision.humanReviewRequired && (
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Users className="h-3 w-3 text-orange-500" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="text-xs">Human review required</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </>
          )}
          
          {getStatusIndicator()}
          {hasWarning && nodeExecutionStatus !== 'error' && !readOnly && ( 
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild><AlertTriangle className="h-4 w-4 text-orange-400 shrink-0" /></TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs"><p className="text-xs">{warningMessage}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-2 text-[11px] text-muted-foreground flex-grow overflow-hidden relative leading-tight">
        <p className="truncate" title={node.description || 'No description'}>{node.description || 'No description'}</p>
        
        {/* CARES Framework Action Buttons */}
        {showCARESIndicators && aiDecision && !readOnly && (
          <div className="flex items-center gap-1 mt-1">
            {onShowReasoning && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowReasoning(node.id, aiDecision.id);
                      }}
                    >
                      <Brain className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Show AI reasoning</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {onRequestHumanReview && (aiDecision.confidence < 85 || aiDecision.humanReviewRequired) && (
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestHumanReview(node.id, `Low confidence decision (${aiDecision.confidence}%)`);
                      }}
                    >
                      <Users className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Request human review</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
        
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
                      "absolute -left-[9px] w-4 h-4 rounded-full border-2 shadow-sm transform -translate-y-1/2 transition-all",
                      categoryStyling.inputHandleBorder,
                      isConnected ? categoryStyling.inputHandleColor : 'bg-background hover:bg-muted',
                      !readOnly && (isConnecting ? 'cursor-pointer hover:scale-125' : 'cursor-default'),
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
           const isErrorHandle = handleId === 'error';
          return (
            <TooltipProvider key={`out-tp-${node.id}-${handleId}`} delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    data-handle-id={handleId}
                    className={cn(
                      "absolute -right-[9px] w-4 h-4 rounded-full border-2 shadow-sm transform -translate-y-1/2 transition-all",
                      !readOnly && "cursor-pointer hover:scale-125",
                      readOnly && "cursor-not-allowed",
                      isErrorHandle 
                          ? 'border-destructive/80' 
                          : categoryStyling.outputHandleBorder,
                      isConnected 
                          ? (isErrorHandle ? 'bg-destructive' : categoryStyling.outputHandleColor)
                          : 'bg-background hover:bg-muted',
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

    