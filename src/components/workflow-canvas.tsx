
'use client';

import type { WorkflowNode, WorkflowConnection, AvailableNodeType } from '@/types/workflow';
import { WorkflowNodeItem } from './workflow-node-item';
import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AI_NODE_TYPE_MAPPING, AVAILABLE_NODES_CONFIG, NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, Zap, ZoomIn, ZoomOut, Grid, MousePointer, Move, RotateCcw, RotateCw, Copy, Scissors, Trash2, Save, Undo2, Redo2 } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Minimap } from './minimap';
import { useHotkeys } from 'react-hotkeys-hook';

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
  isPanningForCursor?: boolean;
  connectionStartNodeId?: string | null;
  connectionStartHandleId?: string | null;
  onDeleteSelectedConnection?: () => void;
  readOnly?: boolean;
  executionData?: Record<string, any>;
  canvasOffset?: { x: number, y: number };
  zoomLevel?: number;
  onZoomChange?: (zoom: number) => void;
  onCanvasOffsetChange?: (offset: { x: number, y: number }) => void;
  onDeleteSelectedNode?: () => void;
  onDuplicateSelectedNode?: () => void;
  onCopySelectedNode?: () => void;
  onPasteNodes?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  clipboard?: WorkflowNode[];
}

// Grid configuration
const GRID_SIZE = 20;
const GRID_COLOR = 'hsl(var(--border) / 0.3)';
const GRID_DASH = '1, 1';

// Snapping configuration
const SNAP_THRESHOLD = 10;
const ALIGNMENT_GUIDE_COLOR = 'hsl(var(--primary) / 0.5)';

interface MultiSelectState {
  isSelecting: boolean;
  selectionBox: { x: number; y: number; width: number; height: number } | null;
  selectedNodes: string[];
  startPosition: { x: number; y: number } | null;
}

interface AlignmentGuides {
  vertical: number | null;
  horizontal: number | null;
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
  onZoomChange = () => {},
  onCanvasOffsetChange = () => {},
  onDeleteSelectedNode = () => {},
  onDuplicateSelectedNode = () => {},
  onCopySelectedNode = () => {},
  onPasteNodes = () => {},
  onUndo = () => {},
  onRedo = () => {},
  canUndo = false,
  canRedo = false,
  clipboard = [],
}: WorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingNodeOffset, setDraggingNodeOffset] = useState<{ x: number, y: number } | null>(null);
  const [multiSelect, setMultiSelect] = useState<MultiSelectState>({
    isSelecting: false,
    selectionBox: null,
    selectedNodes: [],
    startPosition: null,
  });
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuides>({
    vertical: null,
    horizontal: null,
  });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [snapToNodes, setSnapToNodes] = useState(true);

  // Keyboard shortcuts
  useHotkeys('delete, backspace', (e) => {
    e.preventDefault();
    if (selectedNodeId) {
      onDeleteSelectedNode();
    } else if (selectedConnectionId) {
      onDeleteSelectedConnection();
    }
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+z, cmd+z', (e) => {
    e.preventDefault();
    if (canUndo) onUndo();
  });

  useHotkeys('ctrl+y, cmd+y, ctrl+shift+z, cmd+shift+z', (e) => {
    e.preventDefault();
    if (canRedo) onRedo();
  });

  useHotkeys('ctrl+c, cmd+c', (e) => {
    e.preventDefault();
    if (selectedNodeId) onCopySelectedNode();
  });

  useHotkeys('ctrl+v, cmd+v', (e) => {
    e.preventDefault();
    if (clipboard.length > 0) onPasteNodes();
  });

  useHotkeys('ctrl+d, cmd+d', (e) => {
    e.preventDefault();
    if (selectedNodeId) onDuplicateSelectedNode();
  });

  useHotkeys('ctrl+a, cmd+a', (e) => {
    e.preventDefault();
    // Select all nodes
  });

  useHotkeys('escape', (e) => {
    e.preventDefault();
    // Clear selection
  });

  const getNodeTypeConfig = useCallback((type: string): AvailableNodeType | undefined => {
    const mappedTypeKey = type.toLowerCase();
    const uiNodeType = AI_NODE_TYPE_MAPPING[mappedTypeKey] || AI_NODE_TYPE_MAPPING['default'] || type;
    let config = AVAILABLE_NODES_CONFIG.find(n => n.type === uiNodeType);
    if (!config) config = AVAILABLE_NODES_CONFIG.find(n => n.type === type);
    if (!config) config = AVAILABLE_NODES_CONFIG.find(n => n.type === 'unknown');
    return config;
  }, []);

  // Grid snapping function
  const snapToGridPosition = useCallback((position: { x: number; y: number }): { x: number; y: number } => {
    if (!snapToGrid) return position;
    return {
      x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
    };
  }, [snapToGrid]);

  // Node snapping function
  const snapToNodesPosition = useCallback((position: { x: number; y: number }): { x: number; y: number } & { guides: AlignmentGuides } => {
    if (!snapToNodes) return { ...position, guides: { vertical: null, horizontal: null } };

    let snappedPosition = { ...position };
    let guides: AlignmentGuides = { vertical: null, horizontal: null };

    nodes.forEach(node => {
      // Snap to node edges
      const nodeLeft = node.position.x;
      const nodeRight = node.position.x + NODE_WIDTH;
      const nodeTop = node.position.y;
      const nodeBottom = node.position.y + NODE_HEIGHT;
      const nodeCenterX = node.position.x + NODE_WIDTH / 2;
      const nodeCenterY = node.position.y + NODE_HEIGHT / 2;

      // Vertical alignment
      if (Math.abs(position.x - nodeLeft) < SNAP_THRESHOLD) {
        snappedPosition.x = nodeLeft;
        guides.vertical = nodeLeft;
      } else if (Math.abs(position.x - nodeRight) < SNAP_THRESHOLD) {
        snappedPosition.x = nodeRight;
        guides.vertical = nodeRight;
      } else if (Math.abs(position.x - nodeCenterX) < SNAP_THRESHOLD) {
        snappedPosition.x = nodeCenterX;
        guides.vertical = nodeCenterX;
      }

      // Horizontal alignment
      if (Math.abs(position.y - nodeTop) < SNAP_THRESHOLD) {
        snappedPosition.y = nodeTop;
        guides.horizontal = nodeTop;
      } else if (Math.abs(position.y - nodeBottom) < SNAP_THRESHOLD) {
        snappedPosition.y = nodeBottom;
        guides.horizontal = nodeBottom;
      } else if (Math.abs(position.y - nodeCenterY) < SNAP_THRESHOLD) {
        snappedPosition.y = nodeCenterY;
        guides.horizontal = nodeCenterY;
      }
    });

    return { ...snappedPosition, guides };
  }, [nodes, snapToNodes]);

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
      const initialPosition = { x: dropXContent - (NODE_WIDTH / 2), y: dropYContent - (NODE_HEIGHT / 2) };
      
      // Apply snapping
      const snappedPosition = snapToGridPosition(initialPosition);
      const finalPosition = snapToNodesPosition(snappedPosition);
      
      setAlignmentGuides(finalPosition.guides);
      setTimeout(() => setAlignmentGuides({ vertical: null, horizontal: null }), 1000);
      
      onCanvasDrop(nodeType, { x: Math.max(0, finalPosition.x), y: Math.max(0, finalPosition.y) });
    } else if (draggedNodeId && draggingNodeOffset) {
      const initialPosition = { x: dropXContent - draggingNodeOffset.x, y: dropYContent - draggingNodeOffset.y };
      const snappedPosition = snapToGridPosition(initialPosition);
      const finalPosition = snapToNodesPosition(snappedPosition);
      
      setAlignmentGuides(finalPosition.guides);
      setTimeout(() => setAlignmentGuides({ vertical: null, horizontal: null }), 1000);
      
      onNodeDragStop(draggedNodeId, { x: Math.max(0, finalPosition.x), y: Math.max(0, finalPosition.y) });
    }
    setDraggingNodeOffset(null);
    event.dataTransfer.clearData();
  }, [onCanvasDrop, onNodeDragStop, draggingNodeOffset, canvasOffset, zoomLevel, readOnly, snapToGridPosition, snapToNodesPosition]);

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

  // Multi-select handling
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    
    const target = event.target as HTMLElement;
    const isCanvas = target === event.currentTarget || 
                     target.classList.contains('pannable-content-wrapper') ||
                     target.closest('svg') === event.currentTarget?.querySelector('svg');
    
    const clickedOnConnectionTarget = target.closest('[data-connection-click-target="true"], [data-delete-connection-button="true"]');
    const clickedOnNode = target.closest('.workflow-node-item');
    const clickedOnHandle = target.closest('[data-handle-id]');

    if (isCanvas && !clickedOnConnectionTarget && !clickedOnNode && !clickedOnHandle) {
      if (event.button === 0) {
        // Start multi-select or pan
        if (event.ctrlKey || event.metaKey) {
          // Start multi-select
          setMultiSelect(prev => ({
            ...prev,
            isSelecting: true,
            startPosition: { x: event.clientX, y: event.clientY },
            selectionBox: { x: event.clientX, y: event.clientY, width: 0, height: 0 }
          }));
        } else {
          // Start panning
          onCanvasClick(event);
          onCanvasPanStart(event);
        }
      }
    }
  }, [readOnly, onCanvasClick, onCanvasPanStart]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    
    // Handle multi-select box
    if (multiSelect.isSelecting && multiSelect.startPosition) {
      const currentX = event.clientX;
      const currentY = event.clientY;
      const startX = multiSelect.startPosition.x;
      const startY = multiSelect.startPosition.y;
      
      setMultiSelect(prev => ({
        ...prev,
        selectionBox: {
          x: Math.min(startX, currentX),
          y: Math.min(startY, currentY),
          width: Math.abs(currentX - startX),
          height: Math.abs(currentY - startY)
        }
      }));
    }

    // Handle connection preview
    if (isConnecting && connectionPreview?.previewPosition && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      onUpdateConnectionPreview({
        x: (event.clientX - canvasRect.left + canvasRef.current.scrollLeft) / zoomLevel - canvasOffset.x,
        y: (event.clientY - canvasRect.top + canvasRef.current.scrollTop) / zoomLevel - canvasOffset.y,
      });
    }
  }, [readOnly, multiSelect.isSelecting, multiSelect.startPosition, isConnecting, connectionPreview, onUpdateConnectionPreview, canvasOffset, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    if (multiSelect.isSelecting) {
      // Process multi-select results
      setMultiSelect(prev => ({
        ...prev,
        isSelecting: false,
        selectionBox: null,
        startPosition: null
      }));
    }
  }, [multiSelect.isSelecting]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoomLevel + 0.1, 2);
    onZoomChange(newZoom);
  }, [zoomLevel, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoomLevel - 0.1, 0.25);
    onZoomChange(newZoom);
  }, [zoomLevel, onZoomChange]);

  const handleZoomReset = useCallback(() => {
    onZoomChange(1);
    onCanvasOffsetChange({ x: 0, y: 0 });
  }, [onZoomChange, onCanvasOffsetChange]);

  const startNodeForPreview = connectionPreview?.startNodeId ? nodes.find(n => n.id === connectionPreview.startNodeId) : null;
  let previewStartPos: {x: number, y: number} | null = null;
  if (startNodeForPreview && connectionPreview?.startHandleId) {
    previewStartPos = getHandlePosition(startNodeForPreview, connectionPreview.startHandleId, true);
  }

  return (
    <div className="relative w-full h-full">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-background/90 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In (Ctrl +)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.25}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out (Ctrl -)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomReset}
              >
                <MousePointer className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset View</TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-border" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showGrid ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Grid</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={snapToGrid ? "default" : "ghost"}
                size="sm"
                onClick={() => setSnapToGrid(!snapToGrid)}
              >
                <Move className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Snap to Grid</TooltipContent>
          </Tooltip>

          <div className="w-px h-4 bg-border" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onUndo}
                disabled={!canUndo}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRedo}
                disabled={!canRedo}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute top-4 right-4 z-50 bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-1 text-sm font-mono">
        {Math.round(zoomLevel * 100)}%
      </div>

      <ScrollArea className="flex-1 bg-muted/20">
        <div
          ref={canvasRef}
          className={cn(
            "relative w-full h-full min-w-[2000px] min-h-[1500px] p-4 overflow-auto select-none",
            isPanningForCursor ? 'cursor-grabbing' : (isConnecting ? 'crosshair' : (readOnly ? 'default' : 'grab'))
          )}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
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
            {/* Grid */}
            {showGrid && (
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ minWidth: 'inherit', minHeight: 'inherit' }}
              >
                <defs>
                  <pattern id="grid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
                    <path
                      d={`M ${GRID_SIZE} 0 L 0 0 0 ${GRID_SIZE}`}
                      fill="none"
                      stroke={GRID_COLOR}
                      strokeWidth="0.5"
                      strokeDasharray={GRID_DASH}
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            )}

            {/* Alignment guides */}
            {alignmentGuides.vertical && (
              <line
                x1={alignmentGuides.vertical}
                y1="0"
                x2={alignmentGuides.vertical}
                y2="100%"
                stroke={ALIGNMENT_GUIDE_COLOR}
                strokeWidth="2"
                strokeDasharray="5,5"
                className="pointer-events-none"
              />
            )}
            {alignmentGuides.horizontal && (
              <line
                x1="0"
                y1={alignmentGuides.horizontal}
                x2="100%"
                y2={alignmentGuides.horizontal}
                stroke={ALIGNMENT_GUIDE_COLOR}
                strokeWidth="2"
                strokeDasharray="5,5"
                className="pointer-events-none"
              />
            )}

            {/* Multi-select box */}
            {multiSelect.selectionBox && (
              <div
                className="absolute border-2 border-primary/50 bg-primary/10 pointer-events-none"
                style={{
                  left: multiSelect.selectionBox.x,
                  top: multiSelect.selectionBox.y,
                  width: multiSelect.selectionBox.width,
                  height: multiSelect.selectionBox.height
                }}
              />
            )}

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
                <marker id="arrow-error" markerWidth="10" markerHeight="7" refX="8" refY="3.5" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L0,7 L7,3.5 z" fill="hsl(var(--destructive) / 0.7)" />
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
                const isErrorPath = conn.sourceHandle === 'error';

                let strokeColor = 'hsl(var(--primary))';
                let strokeWidth = 1.5;
                let marker = 'url(#arrow)';
                let strokeDasharray = undefined as (string | undefined);

                if (isErrorPath) {
                  strokeColor = 'hsl(var(--destructive) / 0.7)';
                  strokeDasharray = "6, 4";
                  marker = 'url(#arrow-error)';
                }

                if (isSelected) {
                  strokeColor = 'hsl(var(--destructive))';
                  strokeWidth = 2.5;
                  marker = 'url(#arrow-selected)';
                }

                const c1x = sourcePos.x + Math.abs(targetPos.x - sourcePos.x) / 2;
                const c1y = sourcePos.y;
                const c2x = targetPos.x - Math.abs(targetPos.x - sourcePos.x) / 2;
                const c2y = targetPos.y;
                const pathD = `M ${sourcePos.x} ${sourcePos.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${targetPos.x} ${targetPos.y}`;

                return (
                  <g key={conn.id}>
                    <path d={pathD} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" markerEnd={marker} strokeDasharray={strokeDasharray} />
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

      {/* Minimap */}
      <Minimap
        nodes={nodes}
        connections={connections}
        viewport={{
          x: canvasOffset.x,
          y: canvasOffset.y,
          width: 800,
          height: 600
        }}
        onViewportChange={(viewport) => {
          onCanvasOffsetChange({ x: viewport.x, y: viewport.y });
        }}
      />
    </div>
  );
}
