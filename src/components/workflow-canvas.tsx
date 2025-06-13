'use client';

import type { WorkflowNode, WorkflowConnection, AvailableNodeType } from '@/types/workflow';
import { WorkflowNodeItem } from './workflow-node-item';
import React, { useRef, useCallback, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AI_NODE_TYPE_MAPPING, AVAILABLE_NODES_CONFIG, NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';

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

  const getNodeTypeConfig = useCallback((type: string): AvailableNodeType | undefined => {
    const mappedTypeKey = type.toLowerCase();
    const uiNodeType = AI_NODE_TYPE_MAPPING[mappedTypeKey] || AI_NODE_TYPE_MAPPING['default'] || type;
    let config = AVAILABLE_NODES_CONFIG.find(n => n.type === uiNodeType);
    if (!config) {
      // If direct match or mapped match fails, try to find if 'type' itself is a valid config
      config = AVAILABLE_NODES_CONFIG.find(n => n.type === type);
    }
    if (!config) { // Fallback to unknown if everything else fails
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

    let x = event.clientX - canvasRect.left + scrollLeft;
    let y = event.clientY - canvasRect.top + scrollTop;

    const draggedNodeData = event.dataTransfer.getData('application/json');
    const draggedNodeId = event.dataTransfer.getData('application/nodeId');

    if (draggedNodeData) { 
      const nodeType = JSON.parse(draggedNodeData) as AvailableNodeType;
      x -= NODE_WIDTH / 2; 
      y -= NODE_HEIGHT / 2;
      onCanvasDrop(nodeType, { x: Math.max(0, x), y: Math.max(0, y) });
    } else if (draggedNodeId && draggingNodeOffset) { 
      onNodeDragStop(draggedNodeId, { 
        x: Math.max(0, x - draggingNodeOffset.x), 
        y: Math.max(0, y - draggingNodeOffset.y) 
      });
    }
    setDraggingNodeOffset(null);
    event.dataTransfer.clearData();
  }, [onCanvasDrop, onNodeDragStop, draggingNodeOffset]);


  const handleNodeDragStartInternal = useCallback((event: React.DragEvent<HTMLDivElement>, nodeId: string) => {
    event.dataTransfer.setData('application/nodeId', nodeId);
    event.dataTransfer.effectAllowed = 'move';
    
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (nodeElement && canvasRef.current) {
        const nodeRect = nodeElement.getBoundingClientRect();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        
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


  return (
    <ScrollArea className="flex-1 bg-muted/20">
      <div
        ref={canvasRef}
        className="relative w-full h-full min-w-[2000px] min-h-[1500px] p-4 overflow-auto" 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ minWidth: '2000px', minHeight: '1500px' }}>
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
