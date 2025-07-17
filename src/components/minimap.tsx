'use client';

import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';
import type { WorkflowNode, WorkflowConnection } from '@/types/workflow';
import { Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MinimapProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  viewport: { x: number; y: number; width: number; height: number };
  onViewportChange: (viewport: { x: number; y: number; width: number; height: number }) => void;
  className?: string;
}

export function Minimap({ nodes, connections, viewport, onViewportChange, className }: MinimapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Calculate bounds of all nodes
  const bounds = React.useMemo(() => {
    if (nodes.length === 0) {
      return { minX: 0, maxX: 800, minY: 0, maxY: 600 };
    }

    const minX = Math.min(...nodes.map(n => n.position.x));
    const maxX = Math.max(...nodes.map(n => n.position.x + NODE_WIDTH));
    const minY = Math.min(...nodes.map(n => n.position.y));
    const maxY = Math.max(...nodes.map(n => n.position.y + NODE_HEIGHT));

    return { 
      minX: Math.max(0, minX - 50), 
      maxX: maxX + 50, 
      minY: Math.max(0, minY - 50), 
      maxY: maxY + 50 
    };
  }, [nodes]);

  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;

  // Minimap dimensions
  const minimapWidth = isExpanded ? 300 : 200;
  const minimapHeight = isExpanded ? 200 : 150;

  // Scale factor to fit content in minimap
  const scaleX = minimapWidth / contentWidth;
  const scaleY = minimapHeight / contentHeight;
  const scale = Math.min(scaleX, scaleY);

  // Convert world coordinates to minimap coordinates
  const worldToMinimap = (worldX: number, worldY: number) => ({
    x: (worldX - bounds.minX) * scale,
    y: (worldY - bounds.minY) * scale
  });

  // Convert minimap coordinates to world coordinates
  const minimapToWorld = (minimapX: number, minimapY: number) => ({
    x: (minimapX / scale) + bounds.minX,
    y: (minimapY / scale) + bounds.minY
  });

  // Handle viewport dragging
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const minimapX = event.clientX - rect.left;
    const minimapY = event.clientY - rect.top;
    
    const worldPos = minimapToWorld(minimapX, minimapY);
    
    setIsDragging(true);
    onViewportChange({
      x: -worldPos.x + viewport.width / 2,
      y: -worldPos.y + viewport.height / 2,
      width: viewport.width,
      height: viewport.height
    });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const minimapX = event.clientX - rect.left;
    const minimapY = event.clientY - rect.top;
    
    const worldPos = minimapToWorld(minimapX, minimapY);
    
    onViewportChange({
      x: -worldPos.x + viewport.width / 2,
      y: -worldPos.y + viewport.height / 2,
      width: viewport.width,
      height: viewport.height
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove as any);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isVisible) {
    return (
      <div className={cn("absolute bottom-4 right-4 z-50", className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-background/90 backdrop-blur-sm"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn(
      "absolute bottom-4 right-4 z-50 bg-background/95 backdrop-blur-sm border shadow-lg",
      className
    )}>
      <div className="flex items-center justify-between p-2 border-b">
        <span className="text-xs font-medium">Minimap</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative overflow-hidden cursor-crosshair"
        style={{ width: minimapWidth, height: minimapHeight }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-muted/20" />
        
        {/* Connections */}
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox={`0 0 ${minimapWidth} ${minimapHeight}`}
        >
          {connections.map((conn) => {
            const sourceNode = nodes.find(n => n.id === conn.sourceNodeId);
            const targetNode = nodes.find(n => n.id === conn.targetNodeId);
            if (!sourceNode || !targetNode) return null;

            const sourcePos = worldToMinimap(
              sourceNode.position.x + NODE_WIDTH / 2,
              sourceNode.position.y + NODE_HEIGHT / 2
            );
            const targetPos = worldToMinimap(
              targetNode.position.x + NODE_WIDTH / 2,
              targetNode.position.y + NODE_HEIGHT / 2
            );

            return (
              <line
                key={conn.id}
                x1={sourcePos.x}
                y1={sourcePos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                opacity="0.6"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = worldToMinimap(node.position.x, node.position.y);
          const width = NODE_WIDTH * scale;
          const height = NODE_HEIGHT * scale;
          
          return (
            <div
              key={node.id}
              className="absolute bg-primary/60 border border-primary/80 rounded-sm"
              style={{
                left: pos.x,
                top: pos.y,
                width: Math.max(2, width),
                height: Math.max(2, height)
              }}
            />
          );
        })}

        {/* Viewport indicator */}
        <div
          className="absolute border-2 border-accent bg-accent/20 pointer-events-none"
          style={{
            left: (-viewport.x - bounds.minX) * scale,
            top: (-viewport.y - bounds.minY) * scale,
            width: (viewport.width * scale),
            height: (viewport.height * scale)
          }}
        />
      </div>
      
      <div className="p-2 text-xs text-muted-foreground border-t">
        {nodes.length} nodes • {connections.length} connections
      </div>
    </Card>
  );
}