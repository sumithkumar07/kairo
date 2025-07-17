'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  Plus, 
  Play, 
  Pause, 
  Save, 
  Settings, 
  Smartphone, 
  Tablet, 
  Monitor,
  ZoomIn,
  ZoomOut,
  Grid,
  Eye,
  EyeOff,
  Layers,
  Move,
  Hand,
  Search,
  Filter
} from 'lucide-react';
import type { WorkflowNode, WorkflowConnection, AvailableNodeType } from '@/types/workflow';
import { WorkflowNodeItem } from '@/components/workflow-node-item';
import { NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';

// Mobile-specific constants
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const MOBILE_NODE_WIDTH = 160;
const MOBILE_NODE_HEIGHT = 80;
const MOBILE_GRID_SIZE = 16;

interface MobileWorkflowEditorProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  availableNodes: AvailableNodeType[];
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  onNodeAdd: (nodeType: AvailableNodeType, position: { x: number; y: number }) => void;
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  onConnectionCreate: (sourceId: string, targetId: string) => void;
  onExecute: () => void;
  onSave: () => void;
  isExecuting: boolean;
  className?: string;
}

export function MobileWorkflowEditor({
  nodes,
  connections,
  availableNodes,
  selectedNodeId,
  onNodeClick,
  onNodeAdd,
  onNodeMove,
  onConnectionCreate,
  onExecute,
  onSave,
  isExecuting,
  className
}: MobileWorkflowEditorProps) {
  const [viewMode, setViewMode] = useState<'phone' | 'tablet' | 'desktop'>('phone');
  const [showGrid, setShowGrid] = useState(true);
  const [showNodeLibrary, setShowNodeLibrary] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.8);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Device detection
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < MOBILE_BREAKPOINT);
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT);
      
      if (width < MOBILE_BREAKPOINT) {
        setViewMode('phone');
        setZoomLevel(0.6);
      } else if (width < TABLET_BREAKPOINT) {
        setViewMode('tablet');
        setZoomLevel(0.8);
      } else {
        setViewMode('desktop');
        setZoomLevel(1);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Mobile-optimized touch handlers
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      // Single touch - node selection or canvas pan
      const touch = event.touches[0];
      const target = event.target as HTMLElement;
      
      if (target.closest('.workflow-node-item')) {
        // Node interaction
        const nodeId = target.closest('.workflow-node-item')?.getAttribute('data-node-id');
        if (nodeId) {
          onNodeClick(nodeId);
        }
      }
    } else if (event.touches.length === 2) {
      // Two finger pinch/zoom
      event.preventDefault();
    }
  }, [onNodeClick]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (event.touches.length === 2) {
      // Pinch to zoom
      event.preventDefault();
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      // Implement pinch zoom logic here
    }
  }, []);

  // Mobile-optimized node dimensions
  const getNodeDimensions = () => {
    switch (viewMode) {
      case 'phone':
        return { width: MOBILE_NODE_WIDTH * 0.8, height: MOBILE_NODE_HEIGHT * 0.8 };
      case 'tablet':
        return { width: MOBILE_NODE_WIDTH, height: MOBILE_NODE_HEIGHT };
      default:
        return { width: NODE_WIDTH, height: NODE_HEIGHT };
    }
  };

  // Filter nodes based on search and category
  const filteredNodes = availableNodes.filter(node => {
    const matchesSearch = !searchTerm || 
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...new Set(availableNodes.map(node => node.category))];

  // Mobile Node Library
  const MobileNodeLibrary = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>
      
      <ScrollArea className="h-[60vh]">
        <div className="grid grid-cols-1 gap-2">
          {filteredNodes.map(node => (
            <Card 
              key={node.type}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                onNodeAdd(node, { x: centerX, y: centerY });
                setShowNodeLibrary(false);
              }}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <node.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{node.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {node.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  // Mobile Controls
  const MobileControls = () => (
    <div className="flex items-center gap-2 p-3 bg-background border-t">
      <Sheet open={showNodeLibrary} onOpenChange={setShowNodeLibrary}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh]">
          <div className="py-4">
            <h2 className="text-lg font-semibold mb-4">Add Node</h2>
            <MobileNodeLibrary />
          </div>
        </SheetContent>
      </Sheet>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShowGrid(!showGrid)}
      >
        <Grid className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setZoomLevel(Math.max(0.3, zoomLevel - 0.1))}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <div className="flex-1" />
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={onSave}
      >
        <Save className="h-4 w-4" />
      </Button>
      
      <Button 
        variant={isExecuting ? "destructive" : "default"}
        size="sm"
        onClick={onExecute}
        disabled={nodes.length === 0}
      >
        {isExecuting ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
    </div>
  );

  // Responsive canvas transform
  const canvasTransform = `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoomLevel})`;

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-3 bg-background border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-lg">Workflow Editor</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {viewMode === 'phone' ? <Smartphone className="h-3 w-3" /> : 
             viewMode === 'tablet' ? <Tablet className="h-3 w-3" /> : 
             <Monitor className="h-3 w-3" />}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      </div>

      {/* Workflow Stats */}
      <div className="flex items-center gap-4 px-3 py-2 bg-muted/50 border-b text-sm">
        <div className="flex items-center gap-1">
          <Layers className="h-4 w-4" />
          <span>{nodes.length} nodes</span>
        </div>
        <div className="flex items-center gap-1">
          <Move className="h-4 w-4" />
          <span>{connections.length} connections</span>
        </div>
        {selectedNodeId && (
          <Badge variant="outline" className="text-xs">
            Selected: {nodes.find(n => n.id === selectedNodeId)?.name}
          </Badge>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div 
          ref={canvasRef}
          className="absolute inset-0 select-none"
          style={{ 
            transform: canvasTransform,
            transformOrigin: 'top left'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {/* Grid */}
          {showGrid && (
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: `${MOBILE_GRID_SIZE}px ${MOBILE_GRID_SIZE}px`
              }}
            />
          )}

          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map(connection => {
              const sourceNode = nodes.find(n => n.id === connection.sourceNodeId);
              const targetNode = nodes.find(n => n.id === connection.targetNodeId);
              
              if (!sourceNode || !targetNode) return null;
              
              const { width: nodeWidth, height: nodeHeight } = getNodeDimensions();
              const sourceX = sourceNode.position.x + nodeWidth;
              const sourceY = sourceNode.position.y + nodeHeight / 2;
              const targetX = targetNode.position.x;
              const targetY = targetNode.position.y + nodeHeight / 2;
              
              const midX = (sourceX + targetX) / 2;
              
              return (
                <path
                  key={connection.id}
                  d={`M ${sourceX} ${sourceY} Q ${midX} ${sourceY} ${midX} ${(sourceY + targetY) / 2} Q ${midX} ${targetY} ${targetX} ${targetY}`}
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  fill="none"
                  className="drop-shadow-sm"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              className={cn(
                "absolute cursor-pointer transition-all duration-200",
                selectedNodeId === node.id && "ring-2 ring-primary"
              )}
              style={{
                left: node.position.x,
                top: node.position.y,
                width: getNodeDimensions().width,
                height: getNodeDimensions().height
              }}
              data-node-id={node.id}
              onClick={() => onNodeClick(node.id)}
            >
              <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-3 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1 bg-primary/10 rounded">
                      {/* <node.icon className="h-4 w-4 text-primary" /> */}
                    </div>
                    <h3 className="font-medium text-sm truncate">{node.name}</h3>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                    {node.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {node.category}
                    </Badge>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}

          {/* Empty State */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="p-4 bg-muted rounded-full inline-block mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No nodes yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tap the + button to add your first node
                </p>
                <Button onClick={() => setShowNodeLibrary(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Node
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Controls */}
      <MobileControls />
    </div>
  );
}

// Mobile-optimized node configuration
export function MobileNodeConfig({ 
  node, 
  onConfigChange, 
  onClose 
}: {
  node: WorkflowNode;
  onConfigChange: (config: any) => void;
  onClose: () => void;
}) {
  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[80vh]">
        <div className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Configure Node</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Node Name</label>
                <input
                  type="text"
                  value={node.name}
                  onChange={(e) => onConfigChange({ ...node.config, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={node.description || ''}
                  onChange={(e) => onConfigChange({ ...node.config, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1 resize-none"
                  rows={3}
                />
              </div>
              
              {/* Additional configuration fields based on node type */}
              {Object.entries(node.config).map(([key, value]) => (
                <div key={key}>
                  <label className="text-sm font-medium capitalize">{key}</label>
                  <input
                    type="text"
                    value={value?.toString() || ''}
                    onChange={(e) => onConfigChange({ ...node.config, [key]: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm mt-1"
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}