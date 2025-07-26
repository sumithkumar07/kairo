'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus,
  Search,
  Grid3X3,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Play,
  Pause,
  Save,
  Share,
  MoreHorizontal,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  Settings,
  BrainCircuit,
  Zap,
  Database,
  Mail,
  Calendar,
  Code,
  Webhook,
  Filter,
  ArrowRight,
  CircleDot,
  Square,
  Diamond,
  Triangle,
  Layers,
  MousePointer,
  Hand,
  Route,
  GitBranch,
  Workflow
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'webhook' | 'ai';
  title: string;
  description?: string;
  position: { x: number; y: number };
  isSelected?: boolean;
  isConnected?: boolean;
  status?: 'idle' | 'running' | 'success' | 'error';
  config?: any;
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type?: 'success' | 'error' | 'condition';
}

interface NodeLibraryItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'webhook' | 'ai';
  color: string;
  isNew?: boolean;
  isPro?: boolean;
}

const nodeLibrary: NodeLibraryItem[] = [
  // Triggers
  {
    id: 'webhook-trigger',
    title: 'Webhook Trigger',
    description: 'Start workflow when webhook is received',
    icon: Webhook,
    category: 'Triggers',
    type: 'trigger',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'schedule-trigger',
    title: 'Schedule Trigger',
    description: 'Run workflow on a schedule',
    icon: Calendar,
    category: 'Triggers',
    type: 'trigger',
    color: 'from-green-500 to-emerald-500'
  },
  
  // Actions
  {
    id: 'email-action',
    title: 'Send Email',
    description: 'Send email notifications',
    icon: Mail,
    category: 'Actions',
    type: 'action',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'database-action',
    title: 'Database Query',
    description: 'Query or update database',
    icon: Database,
    category: 'Actions',
    type: 'action',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'ai-action',
    title: 'AI Processing',
    description: 'Process data with AI',
    icon: BrainCircuit,
    category: 'AI & ML',
    type: 'ai',
    color: 'from-indigo-500 to-purple-500',
    isNew: true
  },
  
  // Conditions
  {
    id: 'condition',
    title: 'If/Then Condition',
    description: 'Branch workflow based on conditions',
    icon: GitBranch,
    category: 'Logic',
    type: 'condition',
    color: 'from-yellow-500 to-orange-500'
  },
  
  // Utilities
  {
    id: 'delay',
    title: 'Delay',
    description: 'Wait for specified time',
    icon: Pause,
    category: 'Utilities',
    type: 'delay',
    color: 'from-gray-500 to-slate-500'
  },
  {
    id: 'code-action',
    title: 'Custom Code',
    description: 'Execute custom JavaScript',
    icon: Code,
    category: 'Advanced',
    type: 'action',
    color: 'from-teal-500 to-blue-500',
    isPro: true
  }
];

export function WorkflowCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [currentTool, setCurrentTool] = useState<'select' | 'hand' | 'connect'>('select');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Triggers', 'Actions', 'Logic', 'AI & ML', 'Utilities', 'Advanced'];

  const filteredNodes = nodeLibrary.filter(node => {
    const matchesSearch = node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || node.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addNode = useCallback((nodeType: NodeLibraryItem, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: nodeType.type,
      title: nodeType.title,
      description: nodeType.description,
      position,
      status: 'idle'
    };
    
    setNodes(prev => [...prev, newNode]);
  }, []);

  const selectNode = useCallback((nodeId: string, multiSelect = false) => {
    setSelectedNodes(prev => {
      if (multiSelect) {
        return prev.includes(nodeId) 
          ? prev.filter(id => id !== nodeId)
          : [...prev, nodeId];
      }
      return [nodeId];
    });
  }, []);

  const deleteSelectedNodes = useCallback(() => {
    setNodes(prev => prev.filter(node => !selectedNodes.includes(node.id)));
    setConnections(prev => prev.filter(conn => 
      !selectedNodes.includes(conn.from) && !selectedNodes.includes(conn.to)
    ));
    setSelectedNodes([]);
  }, [selectedNodes]);

  const duplicateSelectedNodes = useCallback(() => {
    const nodesToDuplicate = nodes.filter(node => selectedNodes.includes(node.id));
    const duplicatedNodes = nodesToDuplicate.map((node, index) => ({
      ...node,
      id: `node-${Date.now()}-${index}`,
      position: { x: node.position.x + 100, y: node.position.y + 50 }
    }));
    
    setNodes(prev => [...prev, ...duplicatedNodes]);
    setSelectedNodes(duplicatedNodes.map(node => node.id));
  }, [nodes, selectedNodes]);

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 200));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 50));
  
  const resetCanvas = () => {
    setZoomLevel(100);
    setCanvasPosition({ x: 0, y: 0 });
  };

  const getNodeIcon = (type: string) => {
    const nodeType = nodeLibrary.find(n => n.type === type);
    return nodeType?.icon || Square;
  };

  const getNodeColor = (type: string) => {
    const nodeType = nodeLibrary.find(n => n.type === type);
    return nodeType?.color || 'from-gray-500 to-slate-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
      case 'success': return 'border-green-500 bg-green-50 dark:bg-green-950/20';
      case 'error': return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      default: return 'border-border';
    }
  };

  const NodeComponent = ({ node }: { node: WorkflowNode }) => {
    const Icon = getNodeIcon(node.type);
    const isSelected = selectedNodes.includes(node.id);

    return (
      <div
        className={cn(
          "absolute bg-card rounded-lg border-2 shadow-lg transition-all duration-200 cursor-pointer min-w-[180px]",
          getStatusColor(node.status || 'idle'),
          isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          "hover:shadow-xl hover:-translate-y-1"
        )}
        style={{
          left: node.position.x,
          top: node.position.y,
          transform: `scale(${zoomLevel / 100})`
        }}
        onClick={(e) => {
          e.stopPropagation();
          selectNode(node.id, e.ctrlKey || e.metaKey);
        }}
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "p-2 rounded-lg bg-gradient-to-r",
              getNodeColor(node.type)
            )}>
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{node.title}</h4>
              {node.description && (
                <p className="text-xs text-muted-foreground">{node.description}</p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Connection Points */}
          <div className="flex justify-between">
            <div className="w-3 h-3 bg-muted border-2 border-border rounded-full -ml-6 mt-1" />
            <div className="w-3 h-3 bg-muted border-2 border-border rounded-full -mr-6 mt-1" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Node Library Sidebar */}
      <div className="w-80 border-r bg-card/50 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="font-semibold mb-3">Node Library</h3>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {filteredNodes.map((node) => {
              const Icon = node.icon;
              return (
                <Card
                  key={node.id}
                  className="cursor-grab hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('nodeType', JSON.stringify(node));
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg bg-gradient-to-r",
                        node.color
                      )}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{node.title}</h4>
                          {node.isNew && (
                            <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-500">
                              New
                            </Badge>
                          )}
                          {node.isPro && (
                            <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500">
                              Pro
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{node.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b bg-card/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border rounded-lg p-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={currentTool === 'select' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentTool('select')}
                      >
                        <MousePointer className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Select Tool</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={currentTool === 'hand' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentTool('hand')}
                      >
                        <Hand className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Pan Tool</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={currentTool === 'connect' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentTool('connect')}
                      >
                        <Route className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Connect Tool</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                  className={showGrid ? 'bg-muted' : ''}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="sm" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                
                <span className="text-sm font-medium min-w-[50px] text-center">
                  {zoomLevel}%
                </span>
                
                <Button variant="ghost" size="sm" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="sm" onClick={resetCanvas}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Play className="h-4 w-4 mr-2" />
                Test
              </Button>
              <Button variant="ghost" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button size="sm">
                <Share className="h-4 w-4 mr-2" />
                Deploy
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className={cn(
              "w-full h-full relative",
              showGrid && "bg-grid-pattern",
              currentTool === 'hand' && "cursor-grab"
            )}
            style={{
              backgroundSize: `${20 * (zoomLevel / 100)}px ${20 * (zoomLevel / 100)}px`
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const nodeTypeData = e.dataTransfer.getData('nodeType');
              if (nodeTypeData) {
                const nodeType = JSON.parse(nodeTypeData);
                const rect = canvasRef.current?.getBoundingClientRect();
                if (rect) {
                  const position = {
                    x: (e.clientX - rect.left - canvasPosition.x) / (zoomLevel / 100),
                    y: (e.clientY - rect.top - canvasPosition.y) / (zoomLevel / 100)
                  };
                  addNode(nodeType, position);
                }
              }
            }}
            onClick={() => setSelectedNodes([])}
          >
            {/* Render Nodes */}
            {nodes.map(node => (
              <NodeComponent key={node.id} node={node} />
            ))}

            {/* Selection Rectangle */}
            {selectedNodes.length > 1 && (
              <div className="absolute border-2 border-primary border-dashed bg-primary/5 pointer-events-none" />
            )}
          </div>

          {/* Minimap */}
          {showMinimap && (
            <div className="absolute bottom-4 right-4 w-48 h-32 bg-card border rounded-lg shadow-lg">
              <div className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">Minimap</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => setShowMinimap(false)}
                  >
                    <EyeOff className="h-3 w-3" />
                  </Button>
                </div>
                <div className="bg-muted/50 rounded h-20 relative">
                  {/* Minimap nodes would be rendered here as small dots */}
                  {nodes.map(node => (
                    <div
                      key={node.id}
                      className="absolute w-2 h-2 bg-primary rounded-full"
                      style={{
                        left: (node.position.x / 10),
                        top: (node.position.y / 10)
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}