'use client';

import React, { useRef, useCallback } from 'react';
import type { WorkflowNode, WorkflowConnection } from '@/types/workflow';
import { NODE_WIDTH, NODE_HEIGHT } from '@/config/nodes';
import { cn } from '@/lib/utils';

interface MinimapProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  viewport: { x: number; y: number; width: number; height: number };
  onViewportChange: (viewport: { x: number; y: number; width: number; height: number }) => void;
}

export function Minimap({ nodes, connections, viewport, onViewportChange }: MinimapProps) {
  const minimapRef = useRef<HTMLDivElement>(null);

  // Calculate the bounds of all nodes
  const bounds = React.useMemo(() => {
    if (nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 2000, maxY: 1500 };
    }

    const positions = nodes.map(node => node.position);
    const minX = Math.min(...positions.map(p => p.x));
    const maxX = Math.max(...positions.map(p => p.x + NODE_WIDTH));
    const minY = Math.min(...positions.map(p => p.y));
    const maxY = Math.max(...positions.map(p => p.y + NODE_HEIGHT));

    return { minX, minY, maxX, maxY };
  }, [nodes]);

  const canvasWidth = bounds.maxX - bounds.minX;
  const canvasHeight = bounds.maxY - bounds.minY;
  const minimapWidth = 200;
  const minimapHeight = 150;
  const scaleX = minimapWidth / Math.max(canvasWidth, 2000);
  const scaleY = minimapHeight / Math.max(canvasHeight, 1500);

  const handleMinimapClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!minimapRef.current) return;

    const rect = minimapRef.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / scaleX + bounds.minX;
    const y = (event.clientY - rect.top) / scaleY + bounds.minY;

    onViewportChange({
      x: x - viewport.width / 2,
      y: y - viewport.height / 2,
      width: viewport.width,
      height: viewport.height
    });
  }, [scaleX, scaleY, bounds.minX, bounds.minY, onViewportChange, viewport.width, viewport.height]);

  const viewportX = (viewport.x - bounds.minX) * scaleX;
  const viewportY = (viewport.y - bounds.minY) * scaleY;
  const viewportWidth = viewport.width * scaleX;
  const viewportHeight = viewport.height * scaleY;

  return (
    <div className="absolute bottom-4 right-4 z-50">
      <div className="bg-background/90 backdrop-blur-sm border rounded-lg shadow-lg p-2">
        <div className="text-xs font-medium text-muted-foreground mb-2">Minimap</div>
        <div
          ref={minimapRef}
          className="relative w-48 h-32 bg-muted/20 border rounded overflow-hidden cursor-pointer"
          onClick={handleMinimapClick}
        >
          {/* Render scaled-down nodes */}
          {nodes.map(node => {
            const nodeX = (node.position.x - bounds.minX) * scaleX;
            const nodeY = (node.position.y - bounds.minY) * scaleY;
            const nodeWidth = NODE_WIDTH * scaleX;
            const nodeHeight = NODE_HEIGHT * scaleY;

            return (
              <div
                key={node.id}
                className="absolute bg-primary/20 border border-primary/40 rounded"
                style={{
                  left: `${nodeX}px`,
                  top: `${nodeY}px`,
                  width: `${Math.max(nodeWidth, 2)}px`,
                  height: `${Math.max(nodeHeight, 2)}px`
                }}
              />
            );
          })}

          {/* Render scaled-down connections */}
          {connections.map(conn => {
            const sourceNode = nodes.find(n => n.id === conn.sourceNodeId);
            const targetNode = nodes.find(n => n.id === conn.targetNodeId);
            if (!sourceNode || !targetNode) return null;

            const sourceX = (sourceNode.position.x + NODE_WIDTH / 2 - bounds.minX) * scaleX;
            const sourceY = (sourceNode.position.y + NODE_HEIGHT / 2 - bounds.minY) * scaleY;
            const targetX = (targetNode.position.x + NODE_WIDTH / 2 - bounds.minX) * scaleX;
            const targetY = (targetNode.position.y + NODE_HEIGHT / 2 - bounds.minY) * scaleY;

            return (
              <svg
                key={conn.id}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              >
                <line
                  x1={sourceX}
                  y1={sourceY}
                  x2={targetX}
                  y2={targetY}
                  stroke="hsl(var(--primary) / 0.5)"
                  strokeWidth="1"
                  fill="none"
                />
              </svg>
            );
          })}

          {/* Viewport indicator */}
          <div
            className="absolute border-2 border-primary bg-primary/20 pointer-events-none"
            style={{
              left: `${viewportX}px`,
              top: `${viewportY}px`,
              width: `${viewportWidth}px`,
              height: `${viewportHeight}px`
            }}
          />
        </div>
      </div>
    </div>
  );
}