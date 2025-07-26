'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Grid3X3,
  Route,
  Zap,
  Play,
  Pause,
  Square,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Settings,
  Eye,
  Code,
  Share,
  Download,
  Upload,
  Copy,
  Trash2,
  Plus,
  Target,
  Sparkles,
  Brain,
  Activity,
  Database,
  Globe,
  MessageSquare,
  Mail,
  Calendar,
  FileText,
  Image,
  Video,
  Music,
  Folder,
  Lock,
  Unlock,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'data';
  title: string;
  description?: string;
  icon: React.ElementType;
  color: string;
  position: { x: number; y: number };
  connections: string[];
  status?: 'idle' | 'running' | 'completed' | 'error';
  config?: any;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type?: 'success' | 'error' | 'conditional';
}

interface WorkflowCanvasProps {
  className?: string;
}

const SAMPLE_NODES: WorkflowNode[] = [
  {
    id: 'trigger-1',
    type: 'trigger',
    title: 'Webhook Received',
    description: 'Triggers when webhook is called',
    icon: Zap,
    color: 'from-green-500 to-emerald-500',
    position: { x: 100, y: 100 },
    connections: ['action-1'],
    status: 'completed'
  },
  {
    id: 'action-1',
    type: 'action',
    title: 'Process Data',
    description: 'Transform incoming data',
    icon: Database,
    color: 'from-blue-500 to-cyan-500',
    position: { x: 350, y: 100 },
    connections: ['condition-1'],
    status: 'completed'
  },
  {
    id: 'condition-1',
    type: 'condition',
    title: 'Check Value',
    description: 'Validate processed data',
    icon: Target,
    color: 'from-purple-500 to-pink-500',
    position: { x: 600, y: 100 },
    connections: ['action-2', 'action-3'],
    status: 'running'
  },
  {
    id: 'action-2',
    type: 'action',
    title: 'Send Email',
    description: 'Send notification email',
    icon: Mail,
    color: 'from-orange-500 to-red-500',
    position: { x: 500, y: 250 },
    connections: [],
    status: 'idle'
  },
  {
    id: 'action-3',
    type: 'action',
    title: 'Update Database',
    description: 'Store processed data',
    icon: Database,
    color: 'from-indigo-500 to-purple-500',
    position: { x: 700, y: 250 },
    connections: [],
    status: 'idle'
  }
];

const NODE_LIBRARY = [
  {
    category: 'Triggers',
    nodes: [
      { type: 'trigger', title: 'Webhook', icon: Zap, color: 'from-green-500 to-emerald-500' },
      { type: 'trigger', title: 'Schedule', icon: Calendar, color: 'from-blue-500 to-cyan-500' },
      { type: 'trigger', title: 'Email', icon: Mail, color: 'from-purple-500 to-pink-500' },
      { type: 'trigger', title: 'Form Submit', icon: FileText, color: 'from-orange-500 to-red-500' }
    ]
  },
  {
    category: 'Actions',
    nodes: [
      { type: 'action', title: 'Send Email', icon: Mail, color: 'from-red-500 to-pink-500' },
      { type: 'action', title: 'HTTP Request', icon: Globe, color: 'from-blue-500 to-cyan-500' },
      { type: 'action', title: 'Database', icon: Database, color: 'from-green-500 to-emerald-500' },
      { type: 'action', title: 'Slack Message', icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
      { type: 'action', title: 'File Upload', icon: Upload, color: 'from-orange-500 to-yellow-500' },
      { type: 'action', title: 'Data Transform', icon: Activity, color: 'from-indigo-500 to-blue-500' }
    ]
  },
  {
    category: 'Logic',
    nodes: [
      { type: 'condition', title: 'If/Else', icon: Target, color: 'from-yellow-500 to-orange-500' },
      { type: 'condition', title: 'Filter', icon: Filter, color: 'from-green-500 to-teal-500' },
      { type: 'condition', title: 'Switch', icon: Route, color: 'from-purple-500 to-indigo-500' },
      { type: 'condition', title: 'Loop', icon: MoreHorizontal, color: 'from-blue-500 to-purple-500' }
    ]
  },
  {
    category: 'AI',
    nodes: [
      { type: 'action', title: 'AI Analysis', icon: Brain, color: 'from-pink-500 to-purple-500' },
      { type: 'action', title: 'Text Generation', icon: Sparkles, color: 'from-cyan-500 to-blue-500' },
      { type: 'action', title: 'Image Recognition', icon: Eye, color: 'from-green-500 to-cyan-500' },
      { type: 'action', title: 'Sentiment Analysis', icon: Activity, color: 'from-orange-500 to-pink-500' }
    ]
  }
];

export function WorkflowCanvas({ className }: WorkflowCanvasProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(SAMPLE_NODES);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-50 dark:bg-green-950/20';
      case 'running': return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 animate-pulse';
      case 'error': return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      default: return 'border-border bg-background';
    }
  };

  const getStatusIndicator = (status?: string) => {
    switch (status) {
      case 'completed': return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'running': return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />;
      case 'error': return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId === selectedNode ? null : nodeId);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      // Simulate workflow execution
      const executeNodes = async () => {
        for (const node of nodes) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setNodes(prev => prev.map(n => 
            n.id === node.id ? { ...n, status: 'running' } : n
          ));
          await new Promise(resolve => setTimeout(resolve, 1500));
          setNodes(prev => prev.map(n => 
            n.id === node.id ? { ...n, status: 'completed' } : n
          ));
        }
        setIsPlaying(false);
      };
      executeNodes();
    }
  };

  const renderConnections = () => {
    return nodes.map(node => 
      node.connections.map(targetId => {
        const targetNode = nodes.find(n => n.id === targetId);
        if (!targetNode) return null;

        const startX = node.position.x + 120; // Assuming node width of 240px
        const startY = node.position.y + 60;  // Center of node
        const endX = targetNode.position.x;
        const endY = targetNode.position.y + 60;

        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        return (
          <svg
            key={`${node.id}-${targetId}`}
            className="absolute inset-0 pointer-events-none"
            style={{ 
              left: 0, 
              top: 0, 
              width: '100%', 
              height: '100%',
              zIndex: 1 
            }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="currentColor"
                  className="text-muted-foreground"
                />
              </marker>
            </defs>
            <path
              d={`M ${startX} ${startY} Q ${midX} ${startY} ${midX} ${midY} Q ${midX} ${endY} ${endX} ${endY}`}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
              className="text-muted-foreground hover:text-primary transition-colors"
            />
          </svg>
        );
      })
    ).flat();
  };

  const NodeComponent = ({ node }: { node: WorkflowNode }) => {
    const Icon = node.icon;
    const isSelected = selectedNode === node.id;

    return (
      <div
        className={cn(
          "absolute cursor-pointer transition-all duration-200 z-10",
          isSelected && "z-20"
        )}
        style={{
          left: node.position.x,
          top: node.position.y,
          transform: `scale(${zoom / 100})`
        }}
        onClick={() => handleNodeClick(node.id)}
      >
        <Card className={cn(
          "w-60 transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
          getStatusColor(node.status),
          isSelected && "ring-2 ring-primary ring-offset-2 shadow-xl"
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg bg-gradient-to-r",
                  node.color
                )}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium">
                    {node.title}
                  </CardTitle>
                  {node.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {node.description}
                    </p>
                  )}
                </div>
              </div>
              {getStatusIndicator(node.status)}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs capitalize">
                {node.type}
              </Badge>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Settings className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const MiniMap = () => {
    if (!showMinimap) return null;

    return (
      <Card className="absolute bottom-4 right-4 w-48 h-32 z-30">
        <CardContent className="p-2">
          <div className="relative w-full h-full bg-muted/50 rounded overflow-hidden">
            {nodes.map(node => (
              <div
                key={node.id}
                className={cn(
                  "absolute w-3 h-2 rounded-sm bg-primary/60",
                  selectedNode === node.id && "bg-primary"
                )}
                style={{
                  left: `${(node.position.x / 1000) * 100}%`,
                  top: `${(node.position.y / 600) * 100}%`
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const NodeLibrary = () => {
    return (
      <Card className="absolute left-4 top-4 w-64 max-h-96 overflow-y-auto z-30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Node Library
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {NODE_LIBRARY.map(category => (
            <div key={category.category}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {category.category}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {category.nodes.map((nodeType, index) => {
                  const Icon = nodeType.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-auto p-3 flex-col gap-2 hover:shadow-md transition-all duration-200"
                      onClick={() => {
                        // Add node to canvas
                        const newNode: WorkflowNode = {
                          id: `${nodeType.type}-${Date.now()}`,
                          type: nodeType.type as any,
                          title: nodeType.title,
                          icon: nodeType.icon,
                          color: nodeType.color,
                          position: { x: 200, y: 200 },
                          connections: []
                        };
                        setNodes(prev => [...prev, newNode]);
                      }}
                    >
                      <div className={cn(
                        "p-1.5 rounded bg-gradient-to-r",
                        nodeType.color
                      )}>
                        <Icon className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs">{nodeType.title}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("relative w-full h-full overflow-hidden", className)}>
      {/* Grid Background */}
      {showGrid && (
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      )}

      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
        <Card className="p-2">
          <div className="flex items-center gap-2">
            <Button
              variant={isPlaying ? "default" : "outline"}
              size="sm"
              onClick={handlePlay}
              className="flex items-center gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Run'}
            </Button>
            
            <div className="w-px h-6 bg-border" />
            
            <Button variant="ghost" size="sm">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Redo className="h-4 w-4" />
            </Button>
            
            <div className="w-px h-6 bg-border" />
            
            <Button
              variant={showGrid ? "default" : "outline"}
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="w-px h-6 bg-border" />
            
            <Button variant="ghost" size="sm">
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="absolute inset-0 overflow-auto"
        style={{ cursor: draggedNode ? 'grabbing' : 'grab' }}
      >
        <div className="relative" style={{ width: '2000px', height: '1200px' }}>
          {/* Connections */}
          {renderConnections()}
          
          {/* Nodes */}
          {nodes.map(node => (
            <NodeComponent key={node.id} node={node} />
          ))}
        </div>
      </div>

      {/* Node Library */}
      <NodeLibrary />

      {/* Mini Map */}
      <MiniMap />

      {/* Properties Panel */}
      {selectedNode && (
        <Card className="absolute right-4 top-4 w-80 max-h-96 overflow-y-auto z-30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Node Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Node ID
                </label>
                <p className="text-sm font-mono bg-muted p-2 rounded mt-1">{selectedNode}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Configuration
                </label>
                <div className="text-sm text-muted-foreground">
                  Properties panel for the selected node would appear here with editable fields, dropdowns, and configuration options.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}