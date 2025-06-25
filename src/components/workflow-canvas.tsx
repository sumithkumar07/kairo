'use client';

import type { WorkflowNode, WorkflowConnection, AvailableNodeType } from '@/types/workflow';
import { WorkflowNodeItem } from './workflow-node-item';
import React, { useRef, useCallback, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AI_NODE_TYPE_MAPPING, AVAILABLE_NODES_CONFIG, NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, Zap } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  selectedNodeId?: string | null;
  selectedConnectionId?: string | null;
  onNodeClick?: (nodeId: string) => void;
  onConnectionClick?: (connectionId: string) => void;
  onNodeDragStop?: (nodeId: string, position: { x: number; y: number }) => void;
  onCanvasDrop?: (nodeType: AvailableNodeType, position: { x: number; y: number }) => void;
  isConnecting?: boolean;
  onStartConnection?: (nodeId: string, handleId: string, handlePosition: { x: number, y: number }) => void;
  onCompleteConnection?: (nodeId: string, handleId: string) => void;
  onUpdateConnectionPreview?: (position: { x: number; y: number }) => void;
  connectionPreview?: {
    startNodeId: string | null;
    startHandleId: string | null;
    previewPosition: { x: number; y: number } | null;
  } | null;
  onCanvasClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  onCanvasPanStart?: (event: React.MouseEvent) => void;
  canvasOffset?: { x: number; y: number };
  isPanningForCursor?: boolean;
  connectionStartNodeId?: string | null;
  connectionStartHandleId?: string | null;
  zoomLevel?: number;
  onDeleteSelectedConnection?: () => void;
  readOnly?: boolean;
  executionData?: Record<string, any>;
}

export function WorkflowCanvas({
  nodes,
  connections,
  selectedNodeId,
  selectedConnectionId,
  onNodeClick = () => {},
  onConnectionClick = () => {},
  onNodeDragStop = () => {},
  onCanvasDrop = () => {},
  isConnecting = false,
  onStartConnection = () => {},
  onCompleteConnection = () => {},
  onUpdateConnectionPreview = () => {},
  connectionPreview,
  onCanvasClick = () => {},
  onCanvasPanStart = () => {},
  canvasOffset = { x: 0, y: 0 },
  isPanningForCursor = false,
  connectionStartNodeId,
  connectionStartHandleId,
  zoomLevel = 1,
  onDeleteSelectedConnection = () => {},
  readOnly = false,
  executionData,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingNodeOffset, setDraggingNodeOffset] = useState<{ x: number, y: number } | null>(null);

  const getNodeTypeConfig = useCallback((type: string): AvailableNodeType | undefined => {
    const mappedTypeKey = type.toLowerCase();
    const uiNodeType = AI_NODE_TYPE_MAPPING[mappedTypeKey] || AI_NODE_TYPE_MAPPING['default'] || type;
    let config = AVAILABLE_NODES_CONFIG.find(n => n.type === uiNodeType);
    if (!config) config = AVAILABLE_NODES_CONFIG.find(n => n.type === type);
    if (!config) config = AVAILABLE_NODES_CONFIG.find(n => n.type === 'unknown');
    return config;
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (readOnly) return;
    event.dataTransfer.dropEffect = 'move';
    if (isConnecting && connectionPreview?.previewPosition && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();

      onUpdateConnectionPreview({
        x: (event.clientX - canvasRect.left + canvasRef.current.scrollLeft) / zoomLevel - canvasOffset.x,
        y: (event.clientY - canvasRect.top + canvasRef.current.scrollTop) / zoomLevel - canvasOffset.y,
      });
    }
  }, [isConnecting, onUpdateConnectionPreview, connectionPreview, canvasOffset.x, canvasOffset.y, zoomLevel, readOnly]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (readOnly || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    let dropXView = (event.clientX - canvasRect.left + scrollLeft) / zoomLevel;
    let dropYView = (event.clientY - canvasRect.top + scrollTop) / zoomLevel;

    const dropXContent = dropXView - canvasOffset.x;
    const dropYContent = dropYView - canvasOffset.y;

    const draggedNodeData = event.dataTransfer.getData('application/json');
    const draggedNodeId = event.dataTransfer.getData('application/nodeId');

    if (draggedNodeData) {
      const nodeType = JSON.parse(draggedNodeData) as AvailableNodeType;
      const finalX = dropXContent - (NODE_WIDTH / 2);
      const finalY = dropYContent - (NODE_HEIGHT / 2);
      onCanvasDrop(nodeType, { x: Math.max(0, finalX), y: Math.max(0, finalY) });
    } else if (draggedNodeId && draggingNodeOffset) {
      const finalX = dropXContent - draggingNodeOffset.x;
      const finalY = dropYContent - draggingNodeOffset.y;
      onNodeDragStop(draggedNodeId, { x: Math.max(0, finalX), y: Math.max(0, finalY) });
    }
    setDraggingNodeOffset(null);
    event.dataTransfer.clearData();
  }, [onCanvasDrop, onNodeDragStop, draggingNodeOffset, canvasOffset, zoomLevel, readOnly]);

  const handleNodeDragStartInternal = useCallback((event: React.DragEvent<HTMLDivElement>, nodeId: string) => {
    if (readOnly) return;
    event.dataTransfer.setData('application/nodeId', nodeId);
    event.dataTransfer.effectAllowed = 'move';

    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (nodeElement) {
        const nodeRect = nodeElement.getBoundingClientRect();
        if (canvasRef.current) {
            setDraggingNodeOffset({
                x: (event.clientX - nodeRect.left) / zoomLevel,
                y: (event.clientY - nodeRect.top) / zoomLevel,
            });
        }
    }
  }, [zoomLevel, readOnly]);

  const getHandlePosition = (node: WorkflowNode, handleId: string, isOutput: boolean): { x: number, y: number } => {
    const nodeTypeConfig = getNodeTypeConfig(node.type);
    const handles = isOutput ? nodeTypeConfig?.outputHandles : nodeTypeConfig?.inputHandles;
    const numHandles = handles?.length || 1;
    const handleIndex = handles?.findIndex(h => h === handleId) ?? 0;

    const y = node.position.y + (NODE_HEIGHT / (numHandles + 1)) * (handleIndex + 1);
    const x = isOutput ? node.position.x + NODE_WIDTH : node.position.x;
    return { x, y };
  };

  const handleLocalCanvasMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    const targetIsCanvas = event.target === event.currentTarget ||
                           (event.target as HTMLElement).classList.contains('pannable-content-wrapper') ||
                           (event.target as HTMLElement).closest('svg') === event.currentTarget?.querySelector('svg');

    const clickedOnConnectionTarget = (event.target as HTMLElement).closest('[data-connection-click-target="true"], [data-delete-connection-button="true"]');

    if (targetIsCanvas && !clickedOnConnectionTarget) {
      if (event.button === 0) {
        onCanvasClick(event);
        onCanvasPanStart(event);
      }
    } else if (!targetIsCanvas && !clickedOnConnectionTarget) {
        const isNodeOrHandle = (event.target as HTMLElement).closest('.workflow-node-item, [data-handle-id]');
        if (!isNodeOrHandle) {
          onCanvasClick(event);
        }
    }
  };

  const handleMouseMoveOnCanvas = (event: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    if (isConnecting && connectionPreview?.previewPosition && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      onUpdateConnectionPreview({
        x: (event.clientX - canvasRect.left + canvasRef.current.scrollLeft) / zoomLevel - canvasOffset.x,
        y: (event.clientY - canvasRect.top + canvasRef.current.scrollTop) / zoomLevel - canvasOffset.y,
      });
    }
  };

  const startNodeForPreview = connectionPreview?.startNodeId ? nodes.find(n => n.id === connectionPreview.startNodeId) : null;
  let previewStartPos: {x: number, y: number} | null = null;
  if (startNodeForPreview && connectionPreview?.startHandleId) {
    previewStartPos = getHandlePosition(startNodeForPreview, connectionPreview.startHandleId, true);
  }

  return (
    <ScrollArea className="flex-1 bg-muted/20">
      <div
        ref={canvasRef}
        className={cn(
          "relative w-full h-full min-w-[2000px] min-h-[1500px] p-4 overflow-auto select-none",
          isPanningForCursor ? 'cursor-grabbing' : (isConnecting ? 'crosshair' : (readOnly ? 'default' : 'grab'))
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseDown={handleLocalCanvasMouseDown}
        onMouseMove={handleMouseMoveOnCanvas}
      >
        <div
          className="absolute top-0 left-0 w-full h-full pannable-content-wrapper"
          style={{
            transform: `translate(${canvasOffset.x * zoomLevel}px, ${canvasOffset.y * zoomLevel}px) scale(${zoomLevel})`,
            transformOrigin: 'top left',
            minWidth: 'inherit',
            minHeight: 'inherit',
          }}
        >
          <svg
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ minWidth: 'inherit', minHeight: 'inherit' }}
          >
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,7 L7,3.5 z" fill="hsl(var(--primary))" />
              </marker>
              <marker id="arrow-selected" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,7 L7,3.5 z" fill="hsl(var(--destructive))" />
              </marker>
              <marker id="arrow-preview" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,7 L7,3.5 z" fill="hsl(var(--accent))" />
              </marker>
            </defs>
            {connections.map((conn) => {
              const sourceNode = nodes.find(n => n.id === conn.sourceNodeId);
              const targetNode = nodes.find(n => n.id === conn.targetNodeId);
              if (!sourceNode || !targetNode) return null;

              const sourcePos = conn.sourceHandle ? getHandlePosition(sourceNode, conn.sourceHandle, true) : { x: sourceNode.position.x + NODE_WIDTH / 2, y: sourceNode.position.y + NODE_HEIGHT / 2 };
              const targetPos = conn.targetHandle ? getHandlePosition(targetNode, conn.targetHandle, false) : { x: targetNode.position.x + NODE_WIDTH / 2, y: targetNode.position.y + NODE_HEIGHT / 2 };

              const isSelected = conn.id === selectedConnectionId;
              const strokeColor = isSelected ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';
              const strokeWidth = isSelected ? 2.5 : 1.5;
              const marker = isSelected ? "url(#arrow-selected)" : "url(#arrow)";

              const c1x = sourcePos.x + Math.abs(targetPos.x - sourcePos.x) / 2;
              const c1y = sourcePos.y;
              const c2x = targetPos.x - Math.abs(targetPos.x - sourcePos.x) / 2;
              const c2y = targetPos.y;
              const pathD = `M ${sourcePos.x} ${sourcePos.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${targetPos.x} ${targetPos.y}`;

              return (
                <g key={conn.id}>
                  <path d={pathD} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" markerEnd={marker} />
                  <path
                    data-connection-click-target="true"
                    d={pathD}
                    stroke="transparent"
                    strokeWidth="10"
                    fill="none"
                    className={cn("pointer-events-stroke", !readOnly && "cursor-pointer")}
                    onClick={(e) => { if(!readOnly) { e.stopPropagation(); onConnectionClick(conn.id || ''); } }}
                  />
                </g>
              );
            })}
            {isConnecting && previewStartPos && connectionPreview?.previewPosition && (
              <path
                d={`M ${previewStartPos.x} ${previewStartPos.y} C ${previewStartPos.x + 50} ${previewStartPos.y} ${connectionPreview.previewPosition.x - 50} ${connectionPreview.previewPosition.y} ${connectionPreview.previewPosition.x} ${connectionPreview.previewPosition.y}`}
                stroke="hsl(var(--accent))" strokeWidth="2" strokeDasharray="5,5"
                fill="none"
                markerEnd="url(#arrow-preview)"
              />
            )}
          </svg>

          {/* Render delete button for selected connection */}
          {selectedConnectionId && !readOnly && connections.find(c => c.id === selectedConnectionId) && (() => {
            const conn = connections.find(c => c.id === selectedConnectionId)!;
            const sourceNode = nodes.find(n => n.id === conn.sourceNodeId);
            const targetNode = nodes.find(n => n.id === conn.targetNodeId);
            if (!sourceNode || !targetNode) return null;

            const sourcePos = conn.sourceHandle ? getHandlePosition(sourceNode, conn.sourceHandle, true) : { x: sourceNode.position.x + NODE_WIDTH / 2, y: sourceNode.position.y + NODE_HEIGHT / 2 };
            const targetPos = conn.targetHandle ? getHandlePosition(targetNode, conn.targetHandle, false) : { x: targetNode.position.x + NODE_WIDTH / 2, y: targetNode.position.y + NODE_HEIGHT / 2 };
            
            // Bezier curve midpoint approximation
            const t = 0.5;
            const mt = 1 - t;
            const midX = (mt * mt * mt * sourcePos.x) + (3 * mt * mt * t * (sourcePos.x + Math.abs(targetPos.x - sourcePos.x) / 2)) + (3 * mt * t * t * (targetPos.x - Math.abs(targetPos.x - sourcePos.x) / 2)) + (t * t * t * targetPos.x);
            const midY = (mt * mt * mt * sourcePos.y) + (3 * mt * mt * t * sourcePos.y) + (3 * mt * t * t * targetPos.y) + (t * t * t * targetPos.y);

            return (
              <TooltipProvider>
                  <Tooltip>
                      <TooltipTrigger asChild>
                           <Button
                              data-delete-connection-button="true"
                              variant="destructive"
                              size="icon"
                              className="absolute w-7 h-7 rounded-full shadow-lg z-10 pointer-events-auto flex items-center justify-center"
                              style={{
                                left: `${midX - 14}px`,
                                top: `${midY - 14}px`,
                                transform: `scale(${1 / zoomLevel})`,
                                transformOrigin: 'center center',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSelectedConnection();
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>Delete Connection</p>
                      </TooltipContent>
                  </Tooltip>
              </TooltipProvider>
            );
          })()}


          {nodes.map((node) => (
            <WorkflowNodeItem
              key={node.id}
              node={node}
              nodeType={getNodeTypeConfig(node.type)}
              isSelected={selectedNodeId === node.id}
              onClick={onNodeClick}
              onDragStartInternal={handleNodeDragStartInternal}
              onHandleClick={(nodeId, handleId, handleType, handlePosition) => {
                if (readOnly) return;
                const absoluteHandlePosition = {
                    x: handlePosition.x,
                    y: handlePosition.y
                };
                if (handleType === 'output' && !isConnecting) {
                  onStartConnection(nodeId, handleId, absoluteHandlePosition);
                } else if (handleType === 'input' && isConnecting) {
                  onCompleteConnection(nodeId, handleId);
                }
              }}
              isConnecting={isConnecting}
              connectionStartNodeId={connectionStartNodeId}
              connectionStartHandleId={connectionStartHandleId}
              connections={connections}
              readOnly={readOnly}
              executionData={executionData ? executionData[node.id] : undefined}
            />
          ))}
        </div>

        {nodes.length === 0 && !isConnecting && !readOnly && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-8 bg-background/80 rounded-lg shadow-xl backdrop-blur-sm">
                <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
                    <Zap className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-1">Start Building Your Workflow</h3>
                <p className="text-muted-foreground text-sm max-w-sm">
                    Drag nodes from the library, or ask the AI assistant to generate a workflow from a prompt.
                </p>
            </div>
          </div>
        )}
         {nodes.length === 0 && readOnly && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="text-center p-8 bg-background/80 rounded-lg shadow-xl backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-foreground mb-1">Empty Workflow</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                This workflow snapshot does not contain any nodes.
              </p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
