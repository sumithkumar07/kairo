
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
  onNodeClick: (nodeId: string) => void;
  onNodeDragStop: (nodeId: string, position: { x: number; y: number }) => void;
  onCanvasDrop: (nodeType: AvailableNodeType, position: { x: number; y: number }) => void;
}

export function WorkflowCanvas({
  nodes,
  connections,
  selectedNodeId,
  onNodeClick,
  onNodeDragStop,
  onCanvasDrop,
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingNodeOffset, setDraggingNodeOffset] = useState<{ x: number, y: number } | null>(null);

  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  const getNodeTypeConfig = useCallback((type: string): AvailableNodeType | undefined => {
    const mappedTypeKey = type.toLowerCase();
    const uiNodeType = AI_NODE_TYPE_MAPPING[mappedTypeKey] || AI_NODE_TYPE_MAPPING['default'] || type;
    let config = AVAILABLE_NODES_CONFIG.find(n => n.type === uiNodeType);
    if (!config) {
      config = AVAILABLE_NODES_CONFIG.find(n => n.type === type);
    }
    if (!config) { 
      config = AVAILABLE_NODES_CONFIG.find(n => n.type === 'unknown');
    }
    return config;
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    // Position relative to the visible part of canvasRef
    let dropX = event.clientX - canvasRect.left + scrollLeft;
    let dropY = event.clientY - canvasRect.top + scrollTop;

    const draggedNodeData = event.dataTransfer.getData('application/json');
    const draggedNodeId = event.dataTransfer.getData('application/nodeId');

    if (draggedNodeData) { 
      const nodeType = JSON.parse(draggedNodeData) as AvailableNodeType;
      // Adjust for canvas offset and center the new node under cursor
      const finalX = dropX - canvasOffset.x - (NODE_WIDTH / 2);
      const finalY = dropY - canvasOffset.y - (NODE_HEIGHT / 2);
      onCanvasDrop(nodeType, { x: Math.max(0, finalX), y: Math.max(0, finalY) });
    } else if (draggedNodeId && draggingNodeOffset) { 
      // Adjust for canvas offset when an existing node is dropped
      const finalX = dropX - canvasOffset.x - draggingNodeOffset.x;
      const finalY = dropY - canvasOffset.y - draggingNodeOffset.y;
      onNodeDragStop(draggedNodeId, { 
        x: Math.max(0, finalX), 
        y: Math.max(0, finalY) 
      });
    }
    setDraggingNodeOffset(null);
    event.dataTransfer.clearData();
  }, [onCanvasDrop, onNodeDragStop, draggingNodeOffset, canvasOffset]);

  const handleNodeDragStartInternal = useCallback((event: React.DragEvent<HTMLDivElement>, nodeId: string) => {
    event.dataTransfer.setData('application/nodeId', nodeId);
    event.dataTransfer.effectAllowed = 'move';
    
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (nodeElement) {
        const nodeRect = nodeElement.getBoundingClientRect();
        // Calculate offset relative to the node's top-left corner, considering the canvas offset
        // clientX/Y is relative to viewport, nodeRect.left/top is also relative to viewport
        setDraggingNodeOffset({
            x: event.clientX - nodeRect.left,
            y: event.clientY - nodeRect.top,
        });
    }
  }, []);
  
  const getHandlePosition = (node: WorkflowNode, handleId: string, isOutput: boolean): { x: number, y: number } => {
    const nodeTypeConfig = getNodeTypeConfig(node.type);
    const handles = isOutput ? nodeTypeConfig?.outputHandles : nodeTypeConfig?.inputHandles;
    const numHandles = handles?.length || 1;
    const handleIndex = handles?.indexOf(handleId) ?? 0;
    
    const y = node.position.y + (NODE_HEIGHT / (numHandles + 1)) * (handleIndex + 1);
    const x = isOutput ? node.position.x + NODE_WIDTH : node.position.x;
    return { x, y };
  };

  const handleMouseDownOnCanvas = (event: React.MouseEvent<HTMLDivElement>) => {
    // Only pan if clicking directly on the canvas background (event.target is canvasRef.current)
    // or the transformed container (which will be the case if it fills canvasRef)
    if (event.target === event.currentTarget || (event.target as HTMLElement)?.classList.contains('pannable-content-wrapper')) {
      // Check if it's not a middle or right click
      if (event.button !== 0) return;
      setIsPanning(true);
      panStartRef.current = { x: event.clientX, y: event.clientY };
      document.body.style.cursor = 'grabbing';
      event.preventDefault(); // Prevent text selection
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (!isPanning) return;
      const deltaX = event.clientX - panStartRef.current.x;
      const deltaY = event.clientY - panStartRef.current.y;
      setCanvasOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      panStartRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleGlobalMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        document.body.style.cursor = 'default';
      }
    };

    if (isPanning) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      if (document.body.style.cursor === 'grabbing') { // Failsafe
        document.body.style.cursor = 'default';
      }
    };
  }, [isPanning]);

  return (
    <ScrollArea className="flex-1 bg-muted/20">
      <div
        ref={canvasRef}
        className={cn(
          "relative w-full h-full min-w-[2000px] min-h-[1500px] p-4 overflow-auto select-none",
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        )}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseDown={handleMouseDownOnCanvas}
      >
        <div 
          className="absolute top-0 left-0 w-full h-full pannable-content-wrapper" // Class for mousedown target check
          style={{ 
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
            minWidth: 'inherit', // Ensure it takes up space for SVG
            minHeight: 'inherit',
          }}
        >
          <svg 
            className="absolute top-0 left-0 w-full h-full pointer-events-none" 
            // SVG needs to conceptually cover the same large area as canvasRef for connections
            // but its content is positioned relative to its own top-left.
            // The transform on parent handles the view.
            style={{ minWidth: 'inherit', minHeight: 'inherit' }}
          >
            {connections.map((conn) => {
              const sourceNode = nodes.find(n => n.id === conn.sourceNodeId);
              const targetNode = nodes.find(n => n.id === conn.targetNodeId);
              if (!sourceNode || !targetNode) return null;

              const sourcePos = conn.sourceHandle ? getHandlePosition(sourceNode, conn.sourceHandle, true) : { x: sourceNode.position.x + NODE_WIDTH / 2, y: sourceNode.position.y + NODE_HEIGHT / 2 };
              const targetPos = conn.targetHandle ? getHandlePosition(targetNode, conn.targetHandle, false) : { x: targetNode.position.x + NODE_WIDTH / 2, y: targetNode.position.y + NODE_HEIGHT / 2 };
              
              return (
                <line
                  key={conn.id}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  markerEnd="url(#arrow)"
                />
              );
            })}
            <defs>
              <marker
                id="arrow"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="hsl(var(--primary))" />
              </marker>
            </defs>
          </svg>

          {nodes.map((node) => (
            <WorkflowNodeItem
              key={node.id}
              node={node}
              nodeType={getNodeTypeConfig(node.type)}
              isSelected={selectedNodeId === node.id}
              onClick={onNodeClick}
              onDragStartInternal={handleNodeDragStartInternal}
            />
          ))}
        </div> {/* End of transformed content wrapper */}
        
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground text-lg">
              Generate a workflow using the prompt above, or drag nodes from the library.
            </p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
