
'use client';

import type { WorkflowNode, WorkflowConnection, AvailableNodeType } from '@/types/workflow';
import { WorkflowNodeItem } from './workflow-node-item';
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AI_NODE_TYPE_MAPPING, AVAILABLE_NODES_CONFIG, NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';
import { cn } from '@/lib/utils';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null; 
  onNodeClick: (nodeId: string) => void;
  onConnectionClick: (connectionId: string) => void; 
  onNodeDragStop: (nodeId: string, position: { x: number; y: number }) => void;
  onCanvasDrop: (nodeType: AvailableNodeType, position: { x: number; y: number }) => void;
  isConnecting: boolean;
  onStartConnection: (nodeId: string, handleId: string, handlePosition: { x: number, y: number }) => void;
  onCompleteConnection: (nodeId: string, handleId: string) => void;
  onUpdateConnectionPreview: (position: { x: number, y: number }) => void;
  connectionPreview: {
    startNodeId: string | null;
    startHandleId: string | null;
    previewPosition: { x: number; y: number } | null;
  } | null;
  onCanvasClick: () => void; 
  onCanvasPanStart: (event: React.MouseEvent) => void; 
  canvasOffset: { x: number; y: number }; 
  isPanningForCursor: boolean; 
  connectionStartNodeId: string | null; 
  connectionStartHandleId: string | null; 
  zoomLevel: number;
}

export function WorkflowCanvas({
  nodes,
  connections,
  selectedNodeId,
  selectedConnectionId,
  onNodeClick,
  onConnectionClick,
  onNodeDragStop,
  onCanvasDrop,
  isConnecting,
  onStartConnection,
  onCompleteConnection,
  onUpdateConnectionPreview,
  connectionPreview,
  onCanvasClick,
  onCanvasPanStart,
  canvasOffset, 
  isPanningForCursor, 
  connectionStartNodeId,
  connectionStartHandleId,
  zoomLevel,
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
    event.dataTransfer.dropEffect = 'move';
    if (isConnecting && connectionPreview?.previewPosition && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      onUpdateConnectionPreview({
        x: (event.clientX - canvasRect.left + canvasRef.current.scrollLeft) / zoomLevel - canvasOffset.x,
        y: (event.clientY - canvasRect.top + canvasRef.current.scrollTop) / zoomLevel - canvasOffset.y,
      });
    }
  }, [isConnecting, onUpdateConnectionPreview, connectionPreview, canvasOffset.x, canvasOffset.y, zoomLevel]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!canvasRef.current) return;

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
      const finalX = dropXContent - (NODE_WIDTH / 2); // Center the node on drop
      const finalY = dropYContent - (NODE_HEIGHT / 2);
      onCanvasDrop(nodeType, { x: Math.max(0, finalX), y: Math.max(0, finalY) });
    } else if (draggedNodeId && draggingNodeOffset) { 
      const finalX = dropXContent - draggingNodeOffset.x;
      const finalY = dropYContent - draggingNodeOffset.y;
      onNodeDragStop(draggedNodeId, { x: Math.max(0, finalX), y: Math.max(0, finalY) });
    }
    setDraggingNodeOffset(null);
    event.dataTransfer.clearData();
  }, [onCanvasDrop, onNodeDragStop, draggingNodeOffset, canvasOffset, zoomLevel]);

  const handleNodeDragStartInternal = useCallback((event: React.DragEvent<HTMLDivElement>, nodeId: string) => {
    event.dataTransfer.setData('application/nodeId', nodeId);
    event.dataTransfer.effectAllowed = 'move';
    
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (nodeElement) {
        const nodeRect = nodeElement.getBoundingClientRect(); // Screen coordinates
        const canvasRect = canvasRef.current?.getBoundingClientRect(); // Screen coordinates
        if (canvasRect) {
            // Calculate offset relative to node's top-left, adjusted for canvas offset and zoom
            // event.clientX/Y are screen coordinates of the mouse
            // nodeRect.left/top are screen coordinates of the node's top-left
            // The difference is the mouse's position *within the node element*, already scaled.
            // We need to store this initial offset *within the node* at current zoom.
            setDraggingNodeOffset({
                x: (event.clientX - nodeRect.left) / zoomLevel, 
                y: (event.clientY - nodeRect.top) / zoomLevel,
            });
        }
    }
  }, [zoomLevel]); // Removed canvasOffset from dependencies as it's implicitly handled by using nodeRect
  
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
    const targetIsCanvas = event.target === event.currentTarget || 
                           (event.target as HTMLElement).classList.contains('pannable-content-wrapper') ||
                           (event.target as HTMLElement).closest('svg') === event.currentTarget?.querySelector('svg'); 

    const clickedOnConnectionTarget = (event.target as HTMLElement).dataset?.connectionClickTarget === 'true';

    if (targetIsCanvas && !clickedOnConnectionTarget) {
      if (event.button === 0) { 
        onCanvasClick(); 
        onCanvasPanStart(event); 
      }
    } else if (!targetIsCanvas && !clickedOnConnectionTarget) {
        onCanvasClick(); 
    }
  };
  
  const handleMouseMoveOnCanvas = (event: React.MouseEvent<HTMLDivElement>) => {
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
          isPanningForCursor ? 'cursor-grabbing' : (isConnecting ? 'crosshair' : 'grab')
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
              const strokeWidth = isSelected ? 3 : 2;
              const marker = isSelected ? "url(#arrow-selected)" : "url(#arrow)";

              return (
                <g key={conn.id}>
                  <line x1={sourcePos.x} y1={sourcePos.y} x2={targetPos.x} y2={targetPos.y} stroke={strokeColor} strokeWidth={strokeWidth} markerEnd={marker} />
                  <line data-connection-click-target="true" x1={sourcePos.x} y1={sourcePos.y} x2={targetPos.x} y2={targetPos.y} stroke="transparent" strokeWidth="10" className="cursor-pointer pointer-events-stroke"
                    onClick={(e) => { e.stopPropagation(); onConnectionClick(conn.id); }}
                  />
                </g>
              );
            })}
            {isConnecting && previewStartPos && connectionPreview?.previewPosition && (
              <line
                x1={previewStartPos.x} y1={previewStartPos.y}
                x2={connectionPreview.previewPosition.x} y2={connectionPreview.previewPosition.y}
                stroke="hsl(var(--accent))" strokeWidth="2" strokeDasharray="5,5"
                markerEnd="url(#arrow-preview)"
              />
            )}
          </svg>

          {nodes.map((node) => (
            <WorkflowNodeItem
              key={node.id}
              node={node}
              nodeType={getNodeTypeConfig(node.type)}
              isSelected={selectedNodeId === node.id}
              onClick={onNodeClick}
              onDragStartInternal={handleNodeDragStartInternal}
              onHandleClick={(nodeId, handleId, handleType, handlePosition) => {
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
            />
          ))}
        </div>
        
        {nodes.length === 0 && !isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground text-lg">
              Generate a workflow, drag nodes, or load a saved one.
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

