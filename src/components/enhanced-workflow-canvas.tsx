'use client';

import React, { useCallback, useRef, useState, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  ZoomIn, 
  ZoomOut, 
  MousePointer, 
  Grid, 
  Move, 
  Undo2, 
  Redo2,
  Copy,
  Paste,
  Trash2,
  Select,
  Hand,
  Search,
  Filter,
  Layers,
  Settings,
  Info,
  Maximize,
  Minimize,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Zap,
  X
} from 'lucide-react';
import type { WorkflowNode, WorkflowConnection, AvailableNodeType } from '@/types/workflow';
import { WorkflowNodeItem } from '@/components/workflow-node-item';
import { getNodeTypeConfig, NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';

// Enhanced canvas configuration
const GRID_SIZE = 20;
const GRID_COLOR = 'hsl(var(--border))';
const GRID_DASH = '2,2';
const ALIGNMENT_GUIDE_COLOR = 'hsl(var(--primary))';
const ALIGNMENT_THRESHOLD = 10;
const SNAP_THRESHOLD = 15;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

interface ConnectionPreview {
  startNodeId: string;
  startHandleId: string;
  previewPosition: { x: number; y: number } | null;
}

interface MultiSelectState {
  isSelecting: boolean;
  startPosition: { x: number; y: number } | null;
  selectionBox: { x: number; y: number; width: number; height: number } | null;
  selectedNodes: string[];
}

interface AlignmentGuides {
  vertical: number | null;
  horizontal: number | null;
}

interface EnhancedWorkflowCanvasProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  canvasOffset: { x: number; y: number };
  zoomLevel: number;
  isConnecting: boolean;
  connectionPreview: ConnectionPreview | null;
  readOnly?: boolean;
  executionData?: Record<string, any>;
  
  // Event handlers
  onNodeClick: (nodeId: string) => void;
  onConnectionClick: (connectionId: string) => void;
  onCanvasClick: (event: React.MouseEvent) => void;
  onCanvasDrop: (nodeType: AvailableNodeType, position: { x: number; y: number }) => void;
  onNodeDragStop: (nodeId: string, position: { x: number; y: number }) => void;
  onStartConnection: (nodeId: string, handleId: string, position: { x: number; y: number }) => void;
  onCompleteConnection: (nodeId: string, handleId: string) => void;
  onCancelConnection: () => void;
  onUpdateConnectionPreview: (position: { x: number; y: number }) => void;
  onDeleteSelectedConnection: () => void;
  onCanvasOffsetChange: (offset: { x: number; y: number }) => void;
  onZoomChange: (zoom: number) => void;
  onCanvasPanStart: (event: React.MouseEvent) => void;
  onUndo: () => void;
  onRedo: () => void;
  
  // Enhanced features
  canUndo: boolean;
  canRedo: boolean;
  isPanningForCursor: boolean;
  connectionStartNodeId: string | null;
  connectionStartHandleId: string | null;
}

export function EnhancedWorkflowCanvas({
  nodes,
  connections,
  selectedNodeId,
  selectedConnectionId,
  canvasOffset,
  zoomLevel,
  isConnecting,
  connectionPreview,
  readOnly = false,
  executionData,
  onNodeClick,
  onConnectionClick,
  onCanvasClick,
  onCanvasDrop,
  onNodeDragStop,
  onStartConnection,
  onCompleteConnection,
  onCancelConnection,
  onUpdateConnectionPreview,
  onDeleteSelectedConnection,
  onCanvasOffsetChange,
  onZoomChange,
  onCanvasPanStart,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isPanningForCursor,
  connectionStartNodeId,
  connectionStartHandleId
}: EnhancedWorkflowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [snapToNodes, setSnapToNodes] = useState(true);
  const [draggingNodeOffset, setDraggingNodeOffset] = useState<{ x: number; y: number } | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuides>({ vertical: null, horizontal: null });
  const [multiSelect, setMultiSelect] = useState<MultiSelectState>({
    isSelecting: false,
    startPosition: null,
    selectionBox: null,
    selectedNodes: []
  });
  const [copiedNodes, setCopiedNodes] = useState<WorkflowNode[]>([]);
  const [showMinimap, setShowMinimap] = useState(true);
  const [lockedNodes, setLockedNodes] = useState<Set<string>>(new Set());
  const [hiddenNodes, setHiddenNodes] = useState<Set<string>>(new Set());

  // Snapping functions
  const snapToGridPosition = useCallback((position: { x: number; y: number }) => {
    if (!snapToGrid) return position;
    
    return {
      x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(position.y / GRID_SIZE) * GRID_SIZE
    };
  }, [snapToGrid]);

  const snapToNodesPosition = useCallback((position: { x: number; y: number }) => {
    if (!snapToNodes) return { ...position, guides: { vertical: null, horizontal: null } };
    
    const guides: AlignmentGuides = { vertical: null, horizontal: null };
    let snappedPosition = { ...position };
    
    for (const node of nodes) {
      if (hiddenNodes.has(node.id)) continue;
      
      // Vertical alignment
      const nodeRight = node.position.x + NODE_WIDTH;
      const nodeLeft = node.position.x;
      const nodeCenter = node.position.x + NODE_WIDTH / 2;
      
      const positionRight = position.x + NODE_WIDTH;
      const positionCenter = position.x + NODE_WIDTH / 2;
      
      if (Math.abs(nodeLeft - position.x) < ALIGNMENT_THRESHOLD) {
        snappedPosition.x = nodeLeft;
        guides.vertical = nodeLeft;
      } else if (Math.abs(nodeRight - position.x) < ALIGNMENT_THRESHOLD) {
        snappedPosition.x = nodeRight;
        guides.vertical = nodeRight;
      } else if (Math.abs(nodeCenter - positionCenter) < ALIGNMENT_THRESHOLD) {
        snappedPosition.x = nodeCenter - NODE_WIDTH / 2;
        guides.vertical = nodeCenter;
      }
      
      // Horizontal alignment
      const nodeTop = node.position.y;
      const nodeBottom = node.position.y + NODE_HEIGHT;
      const nodeVerticalCenter = node.position.y + NODE_HEIGHT / 2;
      
      const positionBottom = position.y + NODE_HEIGHT;
      const positionVerticalCenter = position.y + NODE_HEIGHT / 2;
      
      if (Math.abs(nodeTop - position.y) < ALIGNMENT_THRESHOLD) {
        snappedPosition.y = nodeTop;
        guides.horizontal = nodeTop;
      } else if (Math.abs(nodeBottom - position.y) < ALIGNMENT_THRESHOLD) {
        snappedPosition.y = nodeBottom;
        guides.horizontal = nodeBottom;
      } else if (Math.abs(nodeVerticalCenter - positionVerticalCenter) < ALIGNMENT_THRESHOLD) {
        snappedPosition.y = nodeVerticalCenter - NODE_HEIGHT / 2;
        guides.horizontal = nodeVerticalCenter;
      }
    }
    
    return { ...snappedPosition, guides };
  }, [nodes, snapToNodes, hiddenNodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (readOnly) return;
      
      const isInputField = (event.target as HTMLElement).tagName === 'INPUT' || 
                          (event.target as HTMLElement).tagName === 'TEXTAREA' ||
                          (event.target as HTMLElement).contentEditable === 'true';
      
      if (isInputField) return;
      
      // Prevent default for known shortcuts
      const shortcutKeys = ['z', 'y', 'c', 'v', 'a', 'Delete', 'Backspace', 'Escape'];
      if (event.ctrlKey || event.metaKey) {
        if (shortcutKeys.includes(event.key.toLowerCase())) {
          event.preventDefault();
        }
      } else if (['Delete', 'Backspace', 'Escape'].includes(event.key)) {
        event.preventDefault();
      }
      
      // Handle shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'z':
            if (event.shiftKey) {
              onRedo();
            } else {
              onUndo();
            }
            break;
          case 'y':
            onRedo();
            break;
          case 'c':
            handleCopyNodes();
            break;
          case 'v':
            handlePasteNodes();
            break;
          case 'a':
            handleSelectAll();
            break;
          case 'd':
            handleDuplicateNodes();
            break;
        }
      } else {
        switch (event.key) {
          case 'Delete':
          case 'Backspace':
            handleDeleteSelected();
            break;
          case 'Escape':
            handleClearSelection();
            break;
          case 'g':
            setShowGrid(!showGrid);
            break;
          case 's':
            setSnapToGrid(!snapToGrid);
            break;
          case 'm':
            setShowMinimap(!showMinimap);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [readOnly, onUndo, onRedo, showGrid, snapToGrid, showMinimap, multiSelect.selectedNodes]);

  // Multi-select operations
  const handleCopyNodes = useCallback(() => {
    const selectedNodes = multiSelect.selectedNodes.length > 0 
      ? nodes.filter(node => multiSelect.selectedNodes.includes(node.id))
      : selectedNodeId ? [nodes.find(node => node.id === selectedNodeId)!].filter(Boolean) : [];
    
    setCopiedNodes(selectedNodes);
  }, [nodes, multiSelect.selectedNodes, selectedNodeId]);

  const handlePasteNodes = useCallback(() => {
    if (copiedNodes.length === 0) return;
    
    const baseOffset = { x: 50, y: 50 };
    const newNodes = copiedNodes.map((node, index) => ({
      ...node,
      id: `${node.type}_${Date.now()}_${index}`,
      position: {
        x: node.position.x + baseOffset.x,
        y: node.position.y + baseOffset.y
      }
    }));
    
    // This would need to be implemented in the parent component
    // onPasteNodes(newNodes);
  }, [copiedNodes]);

  const handleSelectAll = useCallback(() => {
    const visibleNodes = nodes.filter(node => !hiddenNodes.has(node.id));
    setMultiSelect(prev => ({
      ...prev,
      selectedNodes: visibleNodes.map(node => node.id)
    }));
  }, [nodes, hiddenNodes]);

  const handleDuplicateNodes = useCallback(() => {
    handleCopyNodes();
    setTimeout(() => handlePasteNodes(), 100);
  }, [handleCopyNodes, handlePasteNodes]);

  const handleDeleteSelected = useCallback(() => {
    if (multiSelect.selectedNodes.length > 0) {
      // This would need to be implemented in the parent component
      // onDeleteNodes(multiSelect.selectedNodes);
    } else if (selectedNodeId) {
      // onDeleteNode(selectedNodeId);
    } else if (selectedConnectionId) {
      onDeleteSelectedConnection();
    }
  }, [multiSelect.selectedNodes, selectedNodeId, selectedConnectionId, onDeleteSelectedConnection]);

  const handleClearSelection = useCallback(() => {
    setMultiSelect(prev => ({
      ...prev,
      selectedNodes: []
    }));
    if (isConnecting) {
      onCancelConnection();
    }
  }, [isConnecting, onCancelConnection]);

  // Node visibility and locking
  const toggleNodeVisibility = useCallback((nodeId: string) => {
    setHiddenNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  const toggleNodeLock = useCallback((nodeId: string) => {
    setLockedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Event handlers
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

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
    if (readOnly || lockedNodes.has(nodeId)) return;
    
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
  }, [zoomLevel, readOnly, lockedNodes]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM);
    onZoomChange(newZoom);
  }, [zoomLevel, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM);
    onZoomChange(newZoom);
  }, [zoomLevel, onZoomChange]);

  const handleZoomReset = useCallback(() => {
    onZoomChange(1);
    onCanvasOffsetChange({ x: 0, y: 0 });
  }, [onZoomChange, onCanvasOffsetChange]);

  const handleZoomToFit = useCallback(() => {
    if (nodes.length === 0) return;
    
    const minX = Math.min(...nodes.map(n => n.position.x));
    const maxX = Math.max(...nodes.map(n => n.position.x + NODE_WIDTH));
    const minY = Math.min(...nodes.map(n => n.position.y));
    const maxY = Math.max(...nodes.map(n => n.position.y + NODE_HEIGHT));
    
    const padding = 50;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;
    
    const containerWidth = canvasRef.current?.clientWidth || 800;
    const containerHeight = canvasRef.current?.clientHeight || 600;
    
    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    onZoomChange(scale);
    onCanvasOffsetChange({
      x: -(minX - padding) * scale,
      y: -(minY - padding) * scale
    });
  }, [nodes, onZoomChange, onCanvasOffsetChange]);

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
      if (multiSelect.selectionBox && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const selectedNodeIds: string[] = [];
        
        nodes.forEach(node => {
          if (hiddenNodes.has(node.id)) return;
          
          const nodeScreenX = (node.position.x + canvasOffset.x) * zoomLevel;
          const nodeScreenY = (node.position.y + canvasOffset.y) * zoomLevel;
          const nodeScreenWidth = NODE_WIDTH * zoomLevel;
          const nodeScreenHeight = NODE_HEIGHT * zoomLevel;
          
          const selectionBox = multiSelect.selectionBox!;
          const selectionLeft = selectionBox.x - canvasRect.left;
          const selectionTop = selectionBox.y - canvasRect.top;
          const selectionRight = selectionLeft + selectionBox.width;
          const selectionBottom = selectionTop + selectionBox.height;
          
          // Check if node intersects with selection box
          if (nodeScreenX < selectionRight && 
              nodeScreenX + nodeScreenWidth > selectionLeft && 
              nodeScreenY < selectionBottom && 
              nodeScreenY + nodeScreenHeight > selectionTop) {
            selectedNodeIds.push(node.id);
          }
        });
        
        setMultiSelect(prev => ({
          ...prev,
          selectedNodes: selectedNodeIds
        }));
      }
      
      setMultiSelect(prev => ({
        ...prev,
        isSelecting: false,
        selectionBox: null,
        startPosition: null
      }));
    }
  }, [multiSelect.isSelecting, multiSelect.selectionBox, nodes, hiddenNodes, canvasOffset, zoomLevel]);

  const getHandlePosition = (node: WorkflowNode, handleId: string, isOutput: boolean): { x: number, y: number } => {
    const nodeTypeConfig = getNodeTypeConfig(node.type);
    const handles = isOutput ? nodeTypeConfig?.outputHandles : nodeTypeConfig?.inputHandles;
    const numHandles = handles?.length || 1;
    const handleIndex = handles?.findIndex(h => h === handleId) ?? 0;

    const y = node.position.y + (NODE_HEIGHT / (numHandles + 1)) * (handleIndex + 1);
    const x = isOutput ? node.position.x + NODE_WIDTH : node.position.x;
    return { x, y };
  };

  const startNodeForPreview = connectionPreview?.startNodeId ? nodes.find(n => n.id === connectionPreview.startNodeId) : null;
  let previewStartPos: {x: number, y: number} | null = null;
  if (startNodeForPreview && connectionPreview?.startHandleId) {
    previewStartPos = getHandlePosition(startNodeForPreview, connectionPreview.startHandleId, true);
  }

  const visibleNodes = nodes.filter(node => !hiddenNodes.has(node.id));

  return (
    <div className="relative w-full h-full">
      {/* Enhanced Toolbar */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-background/95 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
        <TooltipProvider>
          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= MAX_ZOOM}
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
                  disabled={zoomLevel <= MIN_ZOOM}
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
              <TooltipContent>Reset View (100%)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomToFit}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom to Fit</TooltipContent>
            </Tooltip>
          </div>

          <div className="w-px h-4 bg-border" />

          {/* View Controls */}
          <div className="flex items-center gap-1">
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
              <TooltipContent>Toggle Grid (G)</TooltipContent>
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
              <TooltipContent>Snap to Grid (S)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showMinimap ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setShowMinimap(!showMinimap)}
                >
                  <Layers className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Minimap (M)</TooltipContent>
            </Tooltip>
          </div>

          <div className="w-px h-4 bg-border" />

          {/* Edit Controls */}
          <div className="flex items-center gap-1">
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

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyNodes}
                  disabled={multiSelect.selectedNodes.length === 0 && !selectedNodeId}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy (Ctrl+C)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePasteNodes}
                  disabled={copiedNodes.length === 0}
                >
                  <Paste className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Paste (Ctrl+V)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteSelected}
                  disabled={multiSelect.selectedNodes.length === 0 && !selectedNodeId && !selectedConnectionId}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete (Del)</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute top-4 right-4 z-50 bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-1 text-sm font-mono">
        {Math.round(zoomLevel * 100)}%
      </div>

      {/* Selection info */}
      {multiSelect.selectedNodes.length > 0 && (
        <div className="absolute top-16 right-4 z-50 bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-1 text-sm">
          {multiSelect.selectedNodes.length} nodes selected
        </div>
      )}

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
                  position: 'fixed',
                  left: multiSelect.selectionBox.x,
                  top: multiSelect.selectionBox.y,
                  width: multiSelect.selectionBox.width,
                  height: multiSelect.selectionBox.height,
                  zIndex: 1000
                }}
              />
            )}

            {/* Connections SVG */}
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
              
              {/* Render connections */}
              {connections.map((conn) => {
                const sourceNode = nodes.find(n => n.id === conn.sourceNodeId);
                const targetNode = nodes.find(n => n.id === conn.targetNodeId);
                if (!sourceNode || !targetNode) return null;
                if (hiddenNodes.has(sourceNode.id) || hiddenNodes.has(targetNode.id)) return null;

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
              
              {/* Connection preview */}
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
              if (hiddenNodes.has(sourceNode.id) || hiddenNodes.has(targetNode.id)) return null;

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

            {/* Render nodes */}
            {visibleNodes.map((node) => {
              const isSelected = selectedNodeId === node.id || multiSelect.selectedNodes.includes(node.id);
              const isLocked = lockedNodes.has(node.id);
              
              return (
                <div
                  key={node.id}
                  className={cn(
                    "absolute",
                    isSelected && "ring-2 ring-primary ring-offset-2",
                    isLocked && "opacity-60"
                  )}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT
                  }}
                >
                  <WorkflowNodeItem
                    node={node}
                    nodeType={getNodeTypeConfig(node.type)}
                    isSelected={isSelected}
                    onClick={onNodeClick}
                    onDragStartInternal={handleNodeDragStartInternal}
                    onHandleClick={(nodeId, handleId, handleType, handlePosition) => {
                      if (readOnly || isLocked) return;
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
                    readOnly={readOnly || isLocked}
                    executionData={executionData ? executionData[node.id] : undefined}
                  />
                  
                  {/* Node controls */}
                  {!readOnly && (
                    <div className="absolute -top-2 -right-2 flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 bg-background/80 hover:bg-background"
                              onClick={() => toggleNodeLock(node.id)}
                            >
                              {isLocked ? <Unlock className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isLocked ? 'Unlock Node' : 'Lock Node'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 bg-background/80 hover:bg-background"
                              onClick={() => toggleNodeVisibility(node.id)}
                            >
                              <EyeOff className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Hide Node
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {visibleNodes.length === 0 && !isConnecting && !readOnly && (
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
        </div>
      </ScrollArea>

      {/* Minimap */}
      {showMinimap && (
        <div className="absolute bottom-4 right-4 w-48 h-32 bg-background/90 border rounded-lg shadow-lg z-40">
          <div className="relative w-full h-full overflow-hidden">
            <div className="text-xs text-muted-foreground p-1 border-b">Minimap</div>
            <div className="relative flex-1 p-2">
              {visibleNodes.map(node => (
                <div
                  key={node.id}
                  className={cn(
                    "absolute bg-primary/20 border border-primary/40 rounded cursor-pointer hover:bg-primary/30",
                    selectedNodeId === node.id && "bg-primary/40 border-primary",
                    multiSelect.selectedNodes.includes(node.id) && "bg-primary/40 border-primary"
                  )}
                  style={{
                    left: `${(node.position.x / 2000) * 100}%`,
                    top: `${(node.position.y / 1500) * 100}%`,
                    width: '4px',
                    height: '4px'
                  }}
                  onClick={() => {
                    // Center view on clicked node
                    const centerX = -(node.position.x - 400);
                    const centerY = -(node.position.y - 300);
                    onCanvasOffsetChange({ x: centerX, y: centerY });
                  }}
                />
              ))}
              
              {/* Viewport indicator */}
              <div
                className="absolute border-2 border-primary bg-primary/10 pointer-events-none"
                style={{
                  left: `${(-canvasOffset.x / 2000) * 100}%`,
                  top: `${(-canvasOffset.y / 1500) * 100}%`,
                  width: `${(800 / 2000) * 100}%`,
                  height: `${(600 / 1500) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}