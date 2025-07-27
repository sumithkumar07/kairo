'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Save, 
  Play, 
  Download, 
  Upload,
  ZoomIn, 
  ZoomOut, 
  Maximize,
  Grid,
  Move,
  MousePointer,
  RotateCcw,
  Copy,
  Trash2,
  Settings,
  Link,
  Unlink,
  GitBranch,
  Clock,
  Mail,
  Database,
  Globe,
  Brain,
  Zap,
  Filter,
  CheckCircle,
  AlertCircle,
  Layers,
  Eye,
  EyeOff,
  Workflow,
  ArrowRight,
  ChevronDown,
  Search,
  Palette,
  Type,
  Hash
} from 'lucide-react';

// Enhanced Node Types
const nodeTypes = {
  trigger: {
    category: 'Triggers',
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-500',
    icon: Zap,
    nodes: [
      { id: 'webhook', name: 'Webhook', description: 'Receive HTTP requests', icon: Globe },
      { id: 'schedule', name: 'Schedule', description: 'Time-based triggers', icon: Clock },
      { id: 'email', name: 'Email Received', description: 'New email triggers', icon: Mail },
      { id: 'database', name: 'Database Change', description: 'DB change events', icon: Database }
    ]
  },
  action: {
    category: 'Actions',
    color: 'from-green-500 to-emerald-500',
    borderColor: 'border-green-500',
    icon: CheckCircle,
    nodes: [
      { id: 'send-email', name: 'Send Email', description: 'Send email messages', icon: Mail },
      { id: 'database-update', name: 'Update Database', description: 'Modify database records', icon: Database },
      { id: 'api-request', name: 'API Request', description: 'Make HTTP requests', icon: Globe },
      { id: 'ai-process', name: 'AI Processing', description: 'Use AI for data processing', icon: Brain }
    ]
  },
  logic: {
    category: 'Logic & Flow',
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500',
    icon: GitBranch,
    nodes: [
      { id: 'condition', name: 'Condition', description: 'If/then logic branches', icon: GitBranch },
      { id: 'loop', name: 'Loop', description: 'Repeat actions', icon: RotateCcw },
      { id: 'delay', name: 'Delay', description: 'Wait before next action', icon: Clock },
      { id: 'filter', name: 'Filter', description: 'Filter data', icon: Filter }
    ]
  }
};

// Canvas Node Component
interface CanvasNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  inputs?: string[];
  outputs?: string[];
  config?: any;
}

// Connection Interface
interface Connection {
  id: string;
  from: string;
  to: string;
  fromOutput?: string;
  toInput?: string;
}

const NodeComponent = ({ 
  node, 
  isSelected, 
  onSelect, 
  onDrag, 
  onDelete,
  onConfigure,
  scale = 1 
}: {
  node: CanvasNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
  onConfigure: (id: string) => void;
  scale: number;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const nodeTypeInfo = Object.values(nodeTypes)
    .flatMap(category => category.nodes)
    .find(n => n.id === node.type);
    
  const categoryInfo = Object.values(nodeTypes)
    .find(category => category.nodes.some(n => n.id === node.type));

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.x * scale,
      y: e.clientY - node.y * scale
    });
    onSelect(node.id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = (e.clientX - dragStart.x) / scale;
      const newY = (e.clientY - dragStart.y) / scale;
      onDrag(node.id, newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        const newX = (e.clientX - dragStart.x) / scale;
        const newY = (e.clientY - dragStart.y) / scale;
        onDrag(node.id, newX, newY);
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStart, scale, node.id, onDrag]);

  const IconComponent = nodeTypeInfo?.icon || CheckCircle;

  return (
    <div
      className={`
        absolute cursor-pointer transition-all duration-200 select-none
        ${isSelected ? 'z-20 scale-105' : 'z-10'}
        ${isDragging ? 'shadow-2xl' : 'hover:shadow-lg'}
      `}
      style={{
        left: node.x * scale,
        top: node.y * scale,
        transform: `scale(${scale})`
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Card className={`
        w-48 transition-all duration-200
        ${isSelected ? `ring-2 ring-offset-2 ${categoryInfo?.borderColor || 'ring-primary'}` : ''}
        ${isDragging ? 'shadow-2xl' : ''}
        hover:shadow-md
      `}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className={`
              p-2 rounded-lg bg-gradient-to-r ${categoryInfo?.color || 'from-gray-500 to-gray-600'}
              flex items-center justify-center
            `}>
              <IconComponent className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onConfigure(node.id);
                }}
                className="h-6 w-6 p-0"
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(node.id);
                }}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-1">{node.label}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {nodeTypeInfo?.description || 'Custom node'}
            </p>
          </div>

          {/* Connection Points */}
          <div className="flex justify-between mt-3">
            <div className="w-2 h-2 bg-primary rounded-full -ml-1 border border-background" />
            <div className="w-2 h-2 bg-primary rounded-full -mr-1 border border-background" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const EnhancedWorkflowCanvas = () => {
  const [nodes, setNodes] = useState<CanvasNode[]>([
    { id: 'start', type: 'webhook', label: 'Webhook Trigger', x: 100, y: 100 },
    { id: 'process', type: 'condition', label: 'Check Status', x: 350, y: 100 },
    { id: 'action1', type: 'send-email', label: 'Send Email', x: 600, y: 50 },
    { id: 'action2', type: 'database-update', label: 'Update Database', x: 600, y: 150 }
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    { id: 'c1', from: 'start', to: 'process' },
    { id: 'c2', from: 'process', to: 'action1' },
    { id: 'c3', from: 'process', to: 'action2' }
  ]);

  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [canvasScale, setCanvasScale] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('trigger');

  const canvasRef = useRef<HTMLDivElement>(null);

  // Canvas interaction handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedNodes([]);
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  // Node operations
  const handleNodeSelect = (id: string) => {
    setSelectedNodes([id]);
  };

  const handleNodeDrag = (id: string, x: number, y: number) => {
    setNodes(prev => prev.map(node => 
      node.id === id ? { ...node, x, y } : node
    ));
  };

  const handleNodeDelete = (id: string) => {
    setNodes(prev => prev.filter(node => node.id !== id));
    setConnections(prev => prev.filter(conn => 
      conn.from !== id && conn.to !== id
    ));
  };

  const handleNodeConfigure = (id: string) => {
    console.log('Configure node:', id);
  };

  const addNode = (nodeType: any) => {
    const newNode: CanvasNode = {
      id: `node_${Date.now()}`,
      type: nodeType.id,
      label: nodeType.name,
      x: 200 + Math.random() * 300,
      y: 200 + Math.random() * 200
    };
    setNodes(prev => [...prev, newNode]);
  };

  // Zoom controls
  const zoomIn = () => setCanvasScale(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setCanvasScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setCanvasScale(1);

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden bg-background">
      {/* Enhanced Node Library */}
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Node Library</h3>
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Category Tabs */}
          <div className="flex gap-1 mb-3">
            {Object.entries(nodeTypes).map(([key, category]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className="text-xs flex-1"
              >
                <category.icon className="h-3 w-3 mr-1" />
                {category.category.split(' ')[0]}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {nodeTypes[selectedCategory as keyof typeof nodeTypes]?.nodes.map((node) => (
            <div
              key={node.id}
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              draggable
              onClick={() => addNode(node)}
            >
              <div className={`
                p-2 rounded-md bg-gradient-to-r ${nodeTypes[selectedCategory as keyof typeof nodeTypes].color}
                flex items-center justify-center
              `}>
                <node.icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{node.name}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {node.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Toolbar */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <MousePointer className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Move className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm" onClick={() => setShowGrid(!showGrid)}>
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Layers className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">
              {Math.round(canvasScale * 100)}%
            </span>
            <Button variant="ghost" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={resetZoom}>
              <Maximize className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm">
              <Play className="h-4 w-4 mr-1" />
              Test
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full relative cursor-grab active:cursor-grabbing"
            style={{
              backgroundImage: showGrid ? 
                `radial-gradient(circle, #e5e7eb 1px, transparent 1px)` : 
                'none',
              backgroundSize: showGrid ? '20px 20px' : 'none',
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
          >
            {/* Render Nodes */}
            {nodes.map((node) => (
              <NodeComponent
                key={node.id}
                node={node}
                isSelected={selectedNodes.includes(node.id)}
                onSelect={handleNodeSelect}
                onDrag={handleNodeDrag}
                onDelete={handleNodeDelete}
                onConfigure={handleNodeConfigure}
                scale={canvasScale}
              />
            ))}

            {/* Render Connections */}
            <svg className="absolute inset-0 pointer-events-none">
              {connections.map((connection) => {
                const fromNode = nodes.find(n => n.id === connection.from);
                const toNode = nodes.find(n => n.id === connection.to);
                if (!fromNode || !toNode) return null;

                const startX = (fromNode.x + 190) * canvasScale + canvasOffset.x;
                const startY = (fromNode.y + 80) * canvasScale + canvasOffset.y;
                const endX = (toNode.x + 2) * canvasScale + canvasOffset.x;
                const endY = (toNode.y + 80) * canvasScale + canvasOffset.y;

                const controlX1 = startX + (endX - startX) * 0.5;
                const controlY1 = startY;
                const controlX2 = startX + (endX - startX) * 0.5;
                const controlY2 = endY;

                return (
                  <path
                    key={connection.id}
                    d={`M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    fill="none"
                    className="drop-shadow-sm"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};