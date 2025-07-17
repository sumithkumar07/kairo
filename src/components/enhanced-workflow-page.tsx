'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  Play, 
  Pause, 
  Save, 
  Download, 
  Upload, 
  Share2, 
  Settings, 
  Zap,
  Users,
  MessageSquare,
  Eye,
  EyeOff,
  Layers,
  Activity,
  BarChart3,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
  Grid,
  List,
  Search,
  Filter,
  Plus,
  Menu,
  X,
  Maximize,
  Minimize,
  RefreshCw,
  History,
  Bookmark,
  Star,
  Heart,
  Target,
  Wand2,
  Bot,
  Code,
  Database,
  Mail,
  Calendar,
  ShoppingCart,
  CreditCard,
  Phone,
  Camera,
  FileText,
  Image,
  Video,
  Music,
  Headphones,
  Mic,
  Speaker,
  Wifi,
  Bluetooth,
  Battery,
  Power,
  Lightbulb,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Thermometer,
  Flame,
  Snowflake,
  Cpu,
  Memory,
  HardDrive,
  Server,
  Shield,
  Lock,
  Key,
  Bell,
  Map,
  Navigation,
  Compass,
  Route,
  Flag,
  Home,
  Building,
  Store,
  Factory,
  Truck,
  Plane,
  Ship,
  Car,
  Bike,
  Train,
  Bus,
  Taxi,
  School,
  Hospital,
  Library,
  Bank,
  Church,
  Courthouse,
  Stadium,
  Theater,
  Museum,
  Zoo,
  Park,
  Beach,
  Mountain,
  Tree,
  Flower,
  Leaf,
  Wheat,
  Apple,
  Orange,
  Cherry,
  Grapes,
  Strawberry,
  Banana,
  Lemon,
  Watermelon,
  Pineapple,
  Coconut,
  Avocado,
  Broccoli,
  Carrot,
  Corn,
  Eggplant,
  Pepper,
  Tomato,
  Potato,
  Onion,
  Garlic,
  Mushroom,
  Bread,
  Croissant,
  Bagel,
  Pizza,
  Hamburger,
  Sandwich,
  Taco,
  Burrito,
  Salad,
  Soup,
  Pasta,
  Rice,
  Noodles,
  Sushi,
  Fish,
  Chicken,
  Beef,
  Pork,
  Bacon,
  Egg,
  Cheese,
  Milk,
  Butter,
  Yogurt,
  Ice,
  Coffee,
  Tea,
  Juice,
  Soda,
  Beer,
  Wine,
  Cocktail,
  Cake,
  Cookie,
  Candy,
  Chocolate,
  Donut,
  Pie,
  Pretzel,
  Popcorn,
  Chips,
  Nuts,
  Honey,
  Jam,
  Ketchup,
  Mustard,
  Salt,
  Pepper,
  Sugar,
  Flour,
  Oil,
  Vinegar,
  Sauce,
  Spice,
  Herb,
  Seasoning,
  Dressing,
  Marinade,
  Glaze,
  Syrup,
  Honey as HoneyIcon,
  Jam as JamIcon,
  Ketchup as KetchupIcon,
  Mustard as MustardIcon,
  Salt as SaltIcon,
  Pepper as PepperIcon,
  Sugar as SugarIcon,
  Flour as FlourIcon,
  Oil as OilIcon,
  Vinegar as VinegarIcon,
  Sauce as SauceIcon,
  Spice as SpiceIcon,
  Herb as HerbIcon,
  Seasoning as SeasoningIcon,
  Dressing as DressingIcon,
  Marinade as MarinadeIcon,
  Glaze as GlazeIcon,
  Syrup as SyrupIcon
} from 'lucide-react';

import type { WorkflowNode, WorkflowConnection, AvailableNodeType, Workflow } from '@/types/workflow';
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import { getAdvancedNodes } from '@/config/advanced-nodes';
import { ALL_INTEGRATIONS } from '@/config/integrations';
import { EnhancedWorkflowCanvas } from '@/components/enhanced-workflow-canvas';
import { EnhancedNodeLibrary } from '@/components/enhanced-node-library';
import { WorkflowTemplates } from '@/components/workflow-templates';
import { CollaborationPanel, CommentsPanel } from '@/components/collaboration-features';
import { WorkflowPerformanceMonitor } from '@/components/workflow-performance-monitor';
import { MobileWorkflowEditor } from '@/components/mobile-workflow-editor';
import { NodeConfigPanel } from '@/components/node-config-panel';
import { AIWorkflowBuilderPanel } from '@/components/ai-workflow-builder-panel';
import { AIWorkflowAssistantPanel } from '@/components/ai-workflow-assistant-panel';

// Constants
const CURRENT_WORKFLOW_KEY = 'kairoCurrentWorkflow';
const PANEL_VISIBILITY_KEY = 'kairoPanelVisibility';
const VIEWPORT_SETTINGS_KEY = 'kairoViewportSettings';
const WORKSPACE_LAYOUT_KEY = 'kairoWorkspaceLayout';

interface PanelVisibility {
  nodeLibrary: boolean;
  properties: boolean;
  collaboration: boolean;
  comments: boolean;
  performance: boolean;
  assistant: boolean;
  templates: boolean;
}

interface ViewportSettings {
  zoom: number;
  offset: { x: number; y: number };
  gridVisible: boolean;
  minimapVisible: boolean;
  snapToGrid: boolean;
  snapToNodes: boolean;
}

interface WorkspaceLayout {
  leftPanelWidth: number;
  rightPanelWidth: number;
  bottomPanelHeight: number;
  activeLeftPanel: string;
  activeRightPanel: string;
  activeBottomPanel: string;
}

interface EnhancedWorkflowPageProps {
  initialWorkflow?: Workflow;
  workflowId?: string;
  readOnly?: boolean;
  collaborationMode?: boolean;
  className?: string;
}

export function EnhancedWorkflowPage({
  initialWorkflow,
  workflowId,
  readOnly = false,
  collaborationMode = false,
  className
}: EnhancedWorkflowPageProps) {
  // Core workflow state
  const [workflow, setWorkflow] = useState<Workflow>(initialWorkflow || {
    nodes: [],
    connections: [],
    canvasOffset: { x: 0, y: 0 },
    zoomLevel: 1,
    isSimulationMode: true
  });

  // UI state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileEditor, setShowMobileEditor] = useState(false);

  // Panel visibility state
  const [panelVisibility, setPanelVisibility] = useState<PanelVisibility>({
    nodeLibrary: true,
    properties: true,
    collaboration: collaborationMode,
    comments: false,
    performance: false,
    assistant: false,
    templates: false
  });

  // Viewport settings
  const [viewportSettings, setViewportSettings] = useState<ViewportSettings>({
    zoom: 1,
    offset: { x: 0, y: 0 },
    gridVisible: true,
    minimapVisible: true,
    snapToGrid: true,
    snapToNodes: true
  });

  // Layout state
  const [workspaceLayout, setWorkspaceLayout] = useState<WorkspaceLayout>({
    leftPanelWidth: 320,
    rightPanelWidth: 320,
    bottomPanelHeight: 300,
    activeLeftPanel: 'nodeLibrary',
    activeRightPanel: 'properties',
    activeBottomPanel: 'performance'
  });

  // History state
  const [history, setHistory] = useState<Workflow[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [savedWorkflows, setSavedWorkflows] = useState<Array<{ id: string; name: string; workflow: Workflow }>>([]);

  // Collaboration state
  const [collaborationUsers, setCollaborationUsers] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [workflowTemplates, setWorkflowTemplates] = useState<any[]>([]);

  // Refs and hooks
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { hasProFeatures, isLoggedIn, user } = useSubscription();

  // Combine all available nodes
  const allAvailableNodes = useMemo(() => {
    const baseNodes = AVAILABLE_NODES_CONFIG;
    const advancedNodes = getAdvancedNodes();
    const integrationNodes = ALL_INTEGRATIONS;
    
    return [...baseNodes, ...advancedNodes, ...integrationNodes];
  }, []);

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Load saved state
  useEffect(() => {
    const savedWorkflow = localStorage.getItem(CURRENT_WORKFLOW_KEY);
    if (savedWorkflow && !initialWorkflow) {
      try {
        const parsed = JSON.parse(savedWorkflow);
        setWorkflow(parsed);
      } catch (error) {
        console.error('Failed to load saved workflow:', error);
      }
    }

    const savedPanelVisibility = localStorage.getItem(PANEL_VISIBILITY_KEY);
    if (savedPanelVisibility) {
      try {
        const parsed = JSON.parse(savedPanelVisibility);
        setPanelVisibility(parsed);
      } catch (error) {
        console.error('Failed to load panel visibility:', error);
      }
    }

    const savedViewportSettings = localStorage.getItem(VIEWPORT_SETTINGS_KEY);
    if (savedViewportSettings) {
      try {
        const parsed = JSON.parse(savedViewportSettings);
        setViewportSettings(parsed);
      } catch (error) {
        console.error('Failed to load viewport settings:', error);
      }
    }

    const savedWorkspaceLayout = localStorage.getItem(WORKSPACE_LAYOUT_KEY);
    if (savedWorkspaceLayout) {
      try {
        const parsed = JSON.parse(savedWorkspaceLayout);
        setWorkspaceLayout(parsed);
      } catch (error) {
        console.error('Failed to load workspace layout:', error);
      }
    }
  }, [initialWorkflow]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(CURRENT_WORKFLOW_KEY, JSON.stringify(workflow));
  }, [workflow]);

  useEffect(() => {
    localStorage.setItem(PANEL_VISIBILITY_KEY, JSON.stringify(panelVisibility));
  }, [panelVisibility]);

  useEffect(() => {
    localStorage.setItem(VIEWPORT_SETTINGS_KEY, JSON.stringify(viewportSettings));
  }, [viewportSettings]);

  useEffect(() => {
    localStorage.setItem(WORKSPACE_LAYOUT_KEY, JSON.stringify(workspaceLayout));
  }, [workspaceLayout]);

  // Add to history
  const addToHistory = useCallback((newWorkflow: Workflow) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newWorkflow);
      
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Workflow manipulation functions
  const handleNodeAdd = useCallback((nodeType: AvailableNodeType, position: { x: number; y: number }) => {
    if (nodeType.isAdvanced && !hasProFeatures) {
      toast({
        title: "Premium Feature",
        description: "This node requires a Pro subscription. Upgrade to use advanced features.",
        variant: "destructive"
      });
      return;
    }

    const newNode: WorkflowNode = {
      id: `${nodeType.type}_${Date.now()}`,
      type: nodeType.type,
      name: nodeType.name,
      description: nodeType.description || '',
      position,
      config: { ...nodeType.defaultConfig },
      inputHandles: nodeType.inputHandles || [],
      outputHandles: nodeType.outputHandles || [],
      category: nodeType.category,
      lastExecutionStatus: 'pending'
    };

    const newWorkflow = {
      ...workflow,
      nodes: [...workflow.nodes, newNode]
    };

    setWorkflow(newWorkflow);
    addToHistory(newWorkflow);
    setSelectedNodeId(newNode.id);
    
    toast({
      title: "Node Added",
      description: `${nodeType.name} has been added to your workflow`
    });
  }, [workflow, hasProFeatures, toast, addToHistory]);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    const newWorkflow = {
      ...workflow,
      nodes: workflow.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      )
    };

    setWorkflow(newWorkflow);
    addToHistory(newWorkflow);
  }, [workflow, addToHistory]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    const newWorkflow = {
      ...workflow,
      nodes: workflow.nodes.filter(node => node.id !== nodeId),
      connections: workflow.connections.filter(conn => 
        conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
      )
    };

    setWorkflow(newWorkflow);
    addToHistory(newWorkflow);
    setSelectedNodeId(null);
    
    toast({
      title: "Node Deleted",
      description: "Node has been removed from your workflow"
    });
  }, [workflow, addToHistory, toast]);

  const handleConnectionCreate = useCallback((sourceNodeId: string, targetNodeId: string, sourceHandle?: string, targetHandle?: string) => {
    const newConnection: WorkflowConnection = {
      id: `conn_${Date.now()}`,
      sourceNodeId,
      targetNodeId,
      sourceHandle,
      targetHandle
    };

    const newWorkflow = {
      ...workflow,
      connections: [...workflow.connections, newConnection]
    };

    setWorkflow(newWorkflow);
    addToHistory(newWorkflow);
    
    toast({
      title: "Connection Created",
      description: "Nodes have been connected successfully"
    });
  }, [workflow, addToHistory, toast]);

  const handleConnectionDelete = useCallback((connectionId: string) => {
    const newWorkflow = {
      ...workflow,
      connections: workflow.connections.filter(conn => conn.id !== connectionId)
    };

    setWorkflow(newWorkflow);
    addToHistory(newWorkflow);
    setSelectedConnectionId(null);
    
    toast({
      title: "Connection Deleted",
      description: "Connection has been removed"
    });
  }, [workflow, addToHistory, toast]);

  // Execution functions
  const handleExecute = useCallback(async () => {
    if (workflow.nodes.length === 0) {
      toast({
        title: "No Nodes",
        description: "Add some nodes to your workflow before executing",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    
    try {
      // Mock execution - in real implementation, this would call your workflow engine
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = {
        success: true,
        executionTime: 1.2,
        nodesExecuted: workflow.nodes.length,
        errors: []
      };
      
      setExecutionResults(mockResults);
      
      toast({
        title: "Execution Complete",
        description: `Workflow executed successfully in ${mockResults.executionTime}s`
      });
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: "An error occurred during workflow execution",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  }, [workflow, toast]);

  const handleSave = useCallback(() => {
    const workflowToSave = {
      id: workflowId || `workflow_${Date.now()}`,
      name: workflow.name || 'Untitled Workflow',
      workflow
    };

    setSavedWorkflows(prev => {
      const existing = prev.find(w => w.id === workflowToSave.id);
      if (existing) {
        return prev.map(w => w.id === workflowToSave.id ? workflowToSave : w);
      }
      return [...prev, workflowToSave];
    });

    toast({
      title: "Workflow Saved",
      description: "Your workflow has been saved successfully"
    });
  }, [workflow, workflowId, toast]);

  // Undo/Redo functions
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setWorkflow(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setWorkflow(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Panel toggle functions
  const togglePanel = useCallback((panel: keyof PanelVisibility) => {
    setPanelVisibility(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
  }, []);

  const setActivePanel = useCallback((position: 'left' | 'right' | 'bottom', panel: string) => {
    setWorkspaceLayout(prev => ({
      ...prev,
      [`active${position.charAt(0).toUpperCase() + position.slice(1)}Panel`]: panel
    }));
  }, []);

  // Template functions
  const handleTemplateSelect = useCallback((template: any) => {
    setWorkflow(template.workflow);
    addToHistory(template.workflow);
    setPanelVisibility(prev => ({ ...prev, templates: false }));
    
    toast({
      title: "Template Applied",
      description: `${template.name} template has been applied to your workflow`
    });
  }, [addToHistory, toast]);

  // Collaboration functions
  const handleAddComment = useCallback((content: string, nodeId?: string, position?: { x: number; y: number }) => {
    const newComment = {
      id: `comment_${Date.now()}`,
      userId: user?.id || 'anonymous',
      content,
      timestamp: new Date(),
      nodeId,
      position,
      resolved: false
    };

    setComments(prev => [...prev, newComment]);
    
    toast({
      title: "Comment Added",
      description: "Your comment has been added to the workflow"
    });
  }, [user, toast]);

  const handleResolveComment = useCallback((commentId: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId ? { ...comment, resolved: true } : comment
    ));
  }, []);

  // Performance optimization functions
  const handleOptimizeWorkflow = useCallback((recommendations: string[]) => {
    // Mock optimization - in real implementation, this would apply optimizations
    toast({
      title: "Optimization Applied",
      description: "Workflow has been optimized based on performance recommendations"
    });
  }, [toast]);

  // Mobile view
  if (isMobileView) {
    return (
      <div className="h-screen bg-background">
        <MobileWorkflowEditor
          nodes={workflow.nodes}
          connections={workflow.connections}
          availableNodes={allAvailableNodes}
          selectedNodeId={selectedNodeId}
          onNodeClick={setSelectedNodeId}
          onNodeAdd={handleNodeAdd}
          onNodeMove={(nodeId, position) => handleNodeUpdate(nodeId, { position })}
          onConnectionCreate={(sourceId, targetId) => handleConnectionCreate(sourceId, targetId)}
          onExecute={handleExecute}
          onSave={handleSave}
          isExecuting={isExecuting}
          className={className}
        />
      </div>
    );
  }

  // Desktop view
  return (
    <div className={cn("h-screen flex flex-col bg-background", className)}>
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => togglePanel('nodeLibrary')}>
            <Sidebar className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Button 
            variant={isExecuting ? "destructive" : "default"} 
            size="sm"
            onClick={handleExecute}
            disabled={workflow.nodes.length === 0}
          >
            {isExecuting ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isExecuting ? 'Stop' : 'Execute'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => togglePanel('templates')}>
            <Layers className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button variant="outline" size="sm" onClick={() => togglePanel('collaboration')}>
            <Users className="h-4 w-4 mr-2" />
            Collaborate
          </Button>
          <Button variant="outline" size="sm" onClick={() => togglePanel('performance')}>
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        {panelVisibility.nodeLibrary && (
          <div className="flex-shrink-0 border-r" style={{ width: workspaceLayout.leftPanelWidth }}>
            <Tabs value={workspaceLayout.activeLeftPanel} onValueChange={(value) => setActivePanel('left', value)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="nodeLibrary">Nodes</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
              </TabsList>
              
              <TabsContent value="nodeLibrary" className="h-full">
                <EnhancedNodeLibrary
                  availableNodes={allAvailableNodes}
                  onNodeSelect={handleNodeAdd}
                />
              </TabsContent>
              
              <TabsContent value="templates" className="h-full">
                <WorkflowTemplates
                  onTemplateSelect={handleTemplateSelect}
                  onTemplatePreview={(template) => {
                    // Handle template preview
                  }}
                />
              </TabsContent>
              
              <TabsContent value="assistant" className="h-full">
                <AIWorkflowAssistantPanel
                  workflow={workflow}
                  onWorkflowUpdate={setWorkflow}
                  onNodeAdd={handleNodeAdd}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1 flex flex-col">
          <EnhancedWorkflowCanvas
            nodes={workflow.nodes}
            connections={workflow.connections}
            selectedNodeId={selectedNodeId}
            selectedConnectionId={selectedConnectionId}
            canvasOffset={viewportSettings.offset}
            zoomLevel={viewportSettings.zoom}
            isConnecting={false}
            connectionPreview={null}
            readOnly={readOnly}
            executionData={executionResults}
            onNodeClick={setSelectedNodeId}
            onConnectionClick={setSelectedConnectionId}
            onCanvasClick={() => {
              setSelectedNodeId(null);
              setSelectedConnectionId(null);
            }}
            onCanvasDrop={handleNodeAdd}
            onNodeDragStop={(nodeId, position) => handleNodeUpdate(nodeId, { position })}
            onStartConnection={() => {}}
            onCompleteConnection={() => {}}
            onCancelConnection={() => {}}
            onUpdateConnectionPreview={() => {}}
            onDeleteSelectedConnection={() => {
              if (selectedConnectionId) {
                handleConnectionDelete(selectedConnectionId);
              }
            }}
            onCanvasOffsetChange={(offset) => setViewportSettings(prev => ({ ...prev, offset }))}
            onZoomChange={(zoom) => setViewportSettings(prev => ({ ...prev, zoom }))}
            onCanvasPanStart={() => {}}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            isPanningForCursor={false}
            connectionStartNodeId={null}
            connectionStartHandleId={null}
          />
        </div>

        {/* Right Panel */}
        {panelVisibility.properties && (
          <div className="flex-shrink-0 border-l" style={{ width: workspaceLayout.rightPanelWidth }}>
            <Tabs value={workspaceLayout.activeRightPanel} onValueChange={(value) => setActivePanel('right', value)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="collaboration">Collaborate</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="properties" className="h-full">
                {selectedNodeId && (
                  <NodeConfigPanel
                    node={workflow.nodes.find(n => n.id === selectedNodeId)}
                    onNodeUpdate={(updates) => handleNodeUpdate(selectedNodeId, updates)}
                    onNodeDelete={() => handleNodeDelete(selectedNodeId)}
                    onTestNode={() => {
                      // Handle node testing
                    }}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="collaboration" className="h-full">
                <CollaborationPanel
                  users={collaborationUsers}
                  currentUser={user}
                  onInviteUser={(email, role) => {
                    // Handle user invitation
                  }}
                  onRemoveUser={(userId) => {
                    // Handle user removal
                  }}
                  onChangeUserRole={(userId, role) => {
                    // Handle role change
                  }}
                />
              </TabsContent>
              
              <TabsContent value="comments" className="h-full">
                <CommentsPanel
                  comments={comments}
                  onAddComment={handleAddComment}
                  onReplyToComment={(commentId, content) => {
                    // Handle comment reply
                  }}
                  onResolveComment={handleResolveComment}
                  currentUser={user}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      {panelVisibility.performance && (
        <div className="border-t" style={{ height: workspaceLayout.bottomPanelHeight }}>
          <WorkflowPerformanceMonitor
            workflowId={workflowId || 'current'}
            isExecuting={isExecuting}
            nodes={workflow.nodes}
            onOptimize={handleOptimizeWorkflow}
            onRefresh={() => {
              // Handle refresh
            }}
          />
        </div>
      )}
    </div>
  );
}