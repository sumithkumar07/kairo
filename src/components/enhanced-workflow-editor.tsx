'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Pause, 
  Square, 
  Save, 
  Download, 
  Upload, 
  Share2, 
  Settings,
  Zap,
  Brain,
  Users,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Bot,
  Sparkles,
  Code,
  Database,
  Network,
  Shield,
  Rocket,
  Target,
  Layers,
  GitBranch,
  Activity,
  FileText,
  BarChart3,
  Workflow as WorkflowIcon,
  Maximize2,
  Minimize2,
  RotateCcw,
  FastForward,
  Rewind,
  Eye,
  EyeOff,
  Grid,
  Move,
  MousePointer,
  Crosshair,
  Palette,
  Filter,
  Search,
  Archive,
  Star,
  Heart,
  MessageSquare,
  Bell,
  Cpu,
  HardDrive,
  Wifi,
  DollarSign,
  Calendar,
  User,
  Lock,
  Unlock,
  History,
  Bookmark,
  Tag,
  Folder,
  FolderOpen,
  Link,
  Unlink,
  Copy,
  Scissors,
  Clipboard,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  List,
  ListOrdered,
  Hash,
  AtSign,
  Percent,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  Subscript,
  PaintBucket,
  Pipette,
  Brush,
  Eraser,
  PenTool,
  Edit,
  Edit2,
  Edit3,
  Plus,
  Minus,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUpLeft,
  ArrowDownRight,
  ExternalLink,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Trash2,
  Archive as ArchiveIcon,
  RefreshCw,
  Power,
  PowerOff,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Mail,
  MailOpen,
  Send,
  Inbox,
  Outbox,
  Reply,
  ReplyAll,
  Forward,
  Image,
  FileImage,
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileSpreadsheet,
  FileVideo,
  Folder as FolderIcon,
  HardDriveIcon,
  SdCard,
  UsbIcon,
  WifiIcon,
  BluetoothIcon,
  Cast,
  Airplay,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Server,
  HardHat,
  Wrench,
  Hammer,
  Screwdriver,
  Nut,
  Bolt,
  Cog,
  Gear,
  SlashIcon,
  Slash,
  Divide,
  Percent as PercentIcon,
  Equal,
  NotEqual,
  GreaterThan,
  LessThan,
  GreaterThanOrEqual,
  LessThanOrEqual,
  And,
  Or,
  Not,
  Ampersand,
  Asterisk,
  AtSignIcon,
  Hash as HashIcon,
  DollarSignIcon,
  Percent as PercentIcon2,
  Caret,
  Tilde,
  Backtick,
  Quote,
  DoubleQuote,
  SingleQuote,
  Semicolon,
  Colon,
  Comma,
  Period,
  Question,
  Exclamation,
  Hyphen,
  Underscore,
  Pipe,
  Backslash,
  Parentheses,
  Brackets,
  Braces,
  AngleBrackets,
  ThreeDotsVertical,
  ThreeDotsHorizontal,
  MoreVertical,
  MoreHorizontal,
  Menu,
  MenuIcon,
  Sidebar,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  PanelLeftOpen,
  PanelRightOpen,
  PanelTopOpen,
  PanelBottomOpen,
  SplitSquareHorizontal,
  SplitSquareVertical,
  Rectangle,
  Square as SquareIcon,
  Circle,
  Triangle,
  Pentagon,
  Hexagon,
  Octagon,
  Diamond,
  Star as StarIcon,
  Heart as HeartIcon,
  Smile,
  Frown,
  Meh,
  Angry,
  Surprised,
  Confused,
  Neutral,
  Happy,
  Sad,
  Crying,
  Laughing,
  Winking,
  Kissing,
  Sleeping,
  Dizzy,
  Sick,
  Injured,
  Dead,
  Ghost,
  Alien,
  Robot,
  MonsterIcon,
  Skull,
  Crossbones,
  Biohazard,
  Radioactive,
  Warning,
  Caution,
  Danger,
  Poison,
  Explosive,
  Flammable,
  Corrosive,
  Toxic,
  Irritant,
  Harmful,
  Environmental,
  Recycle,
  Renewable,
  Sustainable,
  Eco,
  Green,
  Leaf,
  Tree,
  Forest,
  Mountain,
  Hill,
  Valley,
  Desert,
  Beach,
  Ocean,
  Sea,
  Lake,
  River,
  Stream,
  Waterfall,
  Rain,
  Snow,
  Storm,
  Lightning,
  Thunder,
  Wind,
  Tornado,
  Hurricane,
  Cyclone,
  Tsunami,
  Earthquake,
  Volcano,
  Fire,
  Flame,
  Smoke,
  Ash,
  Dust,
  Sand,
  Rock,
  Stone,
  Crystal,
  Gem,
  Diamond2,
  Gold,
  Silver,
  Bronze,
  Platinum,
  Copper,
  Iron,
  Steel,
  Aluminum,
  Titanium,
  Carbon,
  Silicon,
  Oxygen,
  Hydrogen,
  Nitrogen,
  Helium,
  Neon,
  Argon,
  Krypton,
  Xenon,
  Radon,
  Lithium,
  Beryllium,
  Boron,
  Magnesium,
  Phosphorus,
  Sulfur,
  Chlorine,
  Potassium,
  Calcium,
  Scandium,
  Vanadium,
  Chromium,
  Manganese,
  Cobalt,
  Nickel,
  Zinc,
  Gallium,
  Germanium,
  Arsenic,
  Selenium,
  Bromine,
  Rubidium,
  Strontium,
  Yttrium,
  Zirconium,
  Niobium,
  Molybdenum,
  Technetium,
  Ruthenium,
  Rhodium,
  Palladium,
  Cadmium,
  Indium,
  Tin,
  Antimony,
  Tellurium,
  Iodine,
  Cesium,
  Barium,
  Lanthanum,
  Cerium,
  Praseodymium,
  Neodymium,
  Promethium,
  Samarium,
  Europium,
  Gadolinium,
  Terbium,
  Dysprosium,
  Holmium,
  Erbium,
  Thulium,
  Ytterbium,
  Lutetium,
  Hafnium,
  Tantalum,
  Tungsten,
  Rhenium,
  Osmium,
  Iridium,
  Mercury,
  Thallium,
  Lead,
  Bismuth,
  Polonium,
  Astatine,
  Francium,
  Radium,
  Actinium,
  Thorium,
  Protactinium,
  Uranium,
  Neptunium,
  Plutonium,
  Americium,
  Curium,
  Berkelium,
  Californium,
  Einsteinium,
  Fermium,
  Mendelevium,
  Nobelium,
  Lawrencium,
  Rutherfordium,
  Dubnium,
  Seaborgium,
  Bohrium,
  Hassium,
  Meitnerium,
  Darmstadtium,
  Roentgenium,
  Copernicium,
  Nihonium,
  Flerovium,
  Moscovium,
  Livermorium,
  Tennessine,
  Oganesson
} from 'lucide-react';

import type { 
  Workflow, 
  WorkflowNode, 
  WorkflowConnection, 
  AvailableNodeType 
} from '@/types/workflow';

import { EnhancedWorkflowCanvas } from './enhanced-workflow-canvas';
import { NodeLibrary } from './node-library';
import { NodeConfigPanel } from './node-config-panel';
import { AIWorkflowAssistantPanel } from './ai-workflow-assistant-panel';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface EnhancedWorkflowEditorProps {
  workflow: Workflow;
  onWorkflowChange: (workflow: Workflow) => void;
  isRunning?: boolean;
  onRun?: () => void;
  onStop?: () => void;
  onSave?: () => void;
  className?: string;
}

interface ExecutionMetrics {
  totalNodes: number;
  completedNodes: number;
  failedNodes: number;
  executionTime: number;
  throughput: number;
  errorRate: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    network: number;
  };
}

interface CollaborationState {
  activeUsers: Array<{
    id: string;
    name: string;
    avatar: string;
    cursor: { x: number; y: number };
    selection: string[];
  }>;
  comments: Array<{
    id: string;
    nodeId: string;
    author: string;
    content: string;
    timestamp: string;
    resolved: boolean;
  }>;
  changes: Array<{
    id: string;
    author: string;
    action: string;
    timestamp: string;
    description: string;
  }>;
}

interface WorkflowVersion {
  id: string;
  name: string;
  timestamp: string;
  author: string;
  description: string;
  workflow: Workflow;
  metrics?: ExecutionMetrics;
}

export function EnhancedWorkflowEditor({
  workflow,
  onWorkflowChange,
  isRunning = false,
  onRun,
  onStop,
  onSave,
  className
}: EnhancedWorkflowEditorProps) {
  // State management
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isLibraryVisible, setIsLibraryVisible] = useState(true);
  const [isPropertiesVisible, setIsPropertiesVisible] = useState(true);
  const [isAssistantVisible, setIsAssistantVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('design');
  const [executionMetrics, setExecutionMetrics] = useState<ExecutionMetrics | null>(null);
  const [collaboration, setCollaboration] = useState<CollaborationState>({
    activeUsers: [],
    comments: [],
    changes: []
  });
  const [versions, setVersions] = useState<WorkflowVersion[]>([]);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  
  // Advanced editor state
  const [canvasMode, setCanvasMode] = useState<'design' | 'debug' | 'monitor'>('design');
  const [viewMode, setViewMode] = useState<'normal' | 'compact' | 'detailed'>('normal');
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoSave, setAutoSave] = useState(true);
  const [gridSnap, setGridSnap] = useState(true);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  const [showSecurityAnalysis, setShowSecurityAnalysis] = useState(false);
  const [showCostAnalysis, setShowCostAnalysis] = useState(false);
  
  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Computed values
  const selectedNode = useMemo(() => {
    return workflow.nodes.find(node => node.id === selectedNodeId) || null;
  }, [workflow.nodes, selectedNodeId]);

  const workflowStats = useMemo(() => {
    const nodes = workflow.nodes;
    const connections = workflow.connections;
    
    return {
      totalNodes: nodes.length,
      totalConnections: connections.length,
      categories: [...new Set(nodes.map(n => n.category))],
      complexity: calculateComplexity(nodes, connections),
      estimatedRuntime: estimateRuntime(nodes, connections),
      costEstimate: calculateCost(nodes, connections)
    };
  }, [workflow.nodes, workflow.connections]);

  // Event handlers
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedConnectionId(null);
  }, []);

  const handleConnectionClick = useCallback((connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setSelectedNodeId(null);
  }, []);

  const handleNodeDragStop = useCallback((nodeId: string, position: { x: number; y: number }) => {
    const updatedNodes = workflow.nodes.map(node =>
      node.id === nodeId ? { ...node, position } : node
    );
    
    onWorkflowChange({
      ...workflow,
      nodes: updatedNodes
    });
  }, [workflow, onWorkflowChange]);

  const handleCanvasDrop = useCallback((nodeType: AvailableNodeType, position: { x: number; y: number }) => {
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
    
    const updatedNodes = [...workflow.nodes, newNode];
    onWorkflowChange({
      ...workflow,
      nodes: updatedNodes
    });
    
    // Auto-select the new node
    setSelectedNodeId(newNode.id);
    
    toast({
      title: 'Node Added',
      description: `${nodeType.name} has been added to the workflow`,
    });
  }, [workflow, onWorkflowChange, toast]);

  const handleCreateConnection = useCallback((
    sourceNodeId: string,
    sourceHandle: string,
    targetNodeId: string,
    targetHandle: string
  ) => {
    const newConnection: WorkflowConnection = {
      id: `conn_${Date.now()}`,
      sourceNodeId,
      sourceHandle,
      targetNodeId,
      targetHandle
    };
    
    const updatedConnections = [...workflow.connections, newConnection];
    onWorkflowChange({
      ...workflow,
      connections: updatedConnections
    });
    
    toast({
      title: 'Connection Created',
      description: 'Nodes have been connected successfully',
    });
  }, [workflow, onWorkflowChange, toast]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    const updatedNodes = workflow.nodes.filter(node => node.id !== nodeId);
    const updatedConnections = workflow.connections.filter(
      conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
    );
    
    onWorkflowChange({
      ...workflow,
      nodes: updatedNodes,
      connections: updatedConnections
    });
    
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    
    toast({
      title: 'Node Deleted',
      description: 'Node and its connections have been removed',
    });
  }, [workflow, onWorkflowChange, selectedNodeId, toast]);

  const handleDeleteConnection = useCallback((connectionId: string) => {
    const updatedConnections = workflow.connections.filter(
      conn => conn.id !== connectionId
    );
    
    onWorkflowChange({
      ...workflow,
      connections: updatedConnections
    });
    
    if (selectedConnectionId === connectionId) {
      setSelectedConnectionId(null);
    }
    
    toast({
      title: 'Connection Deleted',
      description: 'Connection has been removed',
    });
  }, [workflow, onWorkflowChange, selectedConnectionId, toast]);

  const handleNodeConfigChange = useCallback((nodeId: string, config: Record<string, any>) => {
    const updatedNodes = workflow.nodes.map(node =>
      node.id === nodeId ? { ...node, config } : node
    );
    
    onWorkflowChange({
      ...workflow,
      nodes: updatedNodes
    });
  }, [workflow, onWorkflowChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            onSave?.();
            break;
          case 'z':
            event.preventDefault();
            // Implement undo
            break;
          case 'y':
            event.preventDefault();
            // Implement redo
            break;
          case 'a':
            event.preventDefault();
            // Select all nodes
            break;
          case 'c':
            event.preventDefault();
            // Copy selected nodes
            break;
          case 'v':
            event.preventDefault();
            // Paste nodes
            break;
          case 'd':
            event.preventDefault();
            // Duplicate selected nodes
            break;
        }
      } else {
        switch (event.key) {
          case 'Delete':
          case 'Backspace':
            if (selectedNodeId) {
              handleDeleteNode(selectedNodeId);
            } else if (selectedConnectionId) {
              handleDeleteConnection(selectedConnectionId);
            }
            break;
          case 'Escape':
            setSelectedNodeId(null);
            setSelectedConnectionId(null);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNodeId, selectedConnectionId, handleDeleteNode, handleDeleteConnection, onSave]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave) {
      const timer = setTimeout(() => {
        onSave?.();
      }, 5000); // Auto-save every 5 seconds

      return () => clearTimeout(timer);
    }
  }, [workflow, autoSave, onSave]);

  // Render functions
  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center space-x-2">
        <Button
          variant={isRunning ? "destructive" : "default"}
          size="sm"
          onClick={isRunning ? onStop : onRun}
          disabled={workflow.nodes.length === 0}
        >
          {isRunning ? (
            <>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run
            </>
          )}
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        
        <Button variant="outline" size="sm">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <div className="flex items-center space-x-1">
          <Button
            variant={canvasMode === 'design' ? "default" : "outline"}
            size="sm"
            onClick={() => setCanvasMode('design')}
          >
            <Edit className="h-4 w-4 mr-2" />
            Design
          </Button>
          
          <Button
            variant={canvasMode === 'debug' ? "default" : "outline"}
            size="sm"
            onClick={() => setCanvasMode('debug')}
          >
            <Bug className="h-4 w-4 mr-2" />
            Debug
          </Button>
          
          <Button
            variant={canvasMode === 'monitor' ? "default" : "outline"}
            size="sm"
            onClick={() => setCanvasMode('monitor')}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Monitor
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Badge variant="secondary">
          {workflowStats.totalNodes} nodes
        </Badge>
        
        <Badge variant="secondary">
          {workflowStats.totalConnections} connections
        </Badge>
        
        <Badge variant="secondary">
          {workflowStats.complexity} complexity
        </Badge>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLibraryVisible(!isLibraryVisible)}
        >
          <Layers className="h-4 w-4 mr-2" />
          Library
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPropertiesVisible(!isPropertiesVisible)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Properties
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAssistantVisible(!isAssistantVisible)}
        >
          <Bot className="h-4 w-4 mr-2" />
          AI Assistant
        </Button>
      </div>
    </div>
  );

  const renderStatusBar = () => (
    <div className="flex items-center justify-between p-2 border-t bg-muted/50 text-sm">
      <div className="flex items-center space-x-4">
        <span className="text-muted-foreground">
          Ready • {workflowStats.totalNodes} nodes • {workflowStats.totalConnections} connections
        </span>
        
        {executionMetrics && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{executionMetrics.executionTime}ms</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-3 w-3" />
                <span>{executionMetrics.throughput}/s</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{(executionMetrics.errorRate * 100).toFixed(1)}%</span>
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setGridSnap(!gridSnap)}
            className={cn(gridSnap && "bg-muted")}
          >
            <Grid className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoSave(!autoSave)}
            className={cn(autoSave && "bg-muted")}
          >
            <Save className="h-3 w-3" />
          </Button>
        </div>
        
        <span className="text-muted-foreground">
          {collaboration.activeUsers.length} user{collaboration.activeUsers.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );

  const renderSidePanels = () => (
    <>
      {/* Left Panel - Node Library */}
      {isLibraryVisible && (
        <div className="w-80 border-r bg-card">
          <div className="h-full">
            <NodeLibrary
              onNodeSelect={(nodeType) => {
                // Handle node selection from library
                console.log('Node selected:', nodeType);
              }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterTags={filterTags}
              onFilterChange={setFilterTags}
            />
          </div>
        </div>
      )}
      
      {/* Right Panel - Properties and Assistant */}
      {(isPropertiesVisible || isAssistantVisible) && (
        <div className="w-96 border-l bg-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
            </TabsList>
            
            <TabsContent value="design" className="h-full p-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Workflow Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Nodes</span>
                      <span className="text-sm font-medium">{workflowStats.totalNodes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Connections</span>
                      <span className="text-sm font-medium">{workflowStats.totalConnections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Complexity</span>
                      <Badge variant="secondary" className="text-xs">
                        {workflowStats.complexity}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Est. Runtime</span>
                      <span className="text-sm font-medium">{workflowStats.estimatedRuntime}ms</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Performance</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPerformanceMetrics(!showPerformanceMetrics)}
                        >
                          {showPerformanceMetrics ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {showPerformanceMetrics && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>CPU Usage</span>
                            <span>65%</span>
                          </div>
                          <Progress value={65} className="h-1" />
                          <div className="flex items-center justify-between text-xs">
                            <span>Memory Usage</span>
                            <span>42%</span>
                          </div>
                          <Progress value={42} className="h-1" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Security</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSecurityAnalysis(!showSecurityAnalysis)}
                        >
                          {showSecurityAnalysis ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {showSecurityAnalysis && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Security Score</span>
                            <Badge variant="secondary" className="text-xs">85/100</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            No critical vulnerabilities found
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Cost</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowCostAnalysis(!showCostAnalysis)}
                        >
                          {showCostAnalysis ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {showCostAnalysis && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Monthly Est.</span>
                            <span className="font-medium">${workflowStats.costEstimate}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Based on current usage patterns
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="properties" className="h-full">
              {selectedNode ? (
                <NodeConfigPanel
                  node={selectedNode}
                  onConfigChange={handleNodeConfigChange}
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Select a node to view its properties
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="assistant" className="h-full">
              {isAssistantVisible && (
                <AIWorkflowAssistantPanel
                  workflow={workflow}
                  onWorkflowChange={onWorkflowChange}
                  selectedNode={selectedNode}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );

  return (
    <div ref={editorRef} className={cn("flex flex-col h-full bg-background", className)}>
      {renderToolbar()}
      
      <div className="flex-1 flex overflow-hidden">
        {renderSidePanels()}
        
        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div ref={canvasRef} className="flex-1 relative">
            <EnhancedWorkflowCanvas
              workflow={workflow}
              selectedNodeId={selectedNodeId}
              selectedConnectionId={selectedConnectionId}
              onNodeClick={handleNodeClick}
              onConnectionClick={handleConnectionClick}
              onNodeDragStop={handleNodeDragStop}
              onCanvasDrop={handleCanvasDrop}
              onCreateConnection={handleCreateConnection}
              onDeleteNode={handleDeleteNode}
              onDeleteConnection={handleDeleteConnection}
              canvasMode={canvasMode}
              viewMode={viewMode}
              gridSnap={gridSnap}
              collaboration={collaboration}
              executionMetrics={executionMetrics}
            />
          </div>
        </div>
      </div>
      
      {renderStatusBar()}
    </div>
  );
}

// Helper functions
function calculateComplexity(nodes: WorkflowNode[], connections: WorkflowConnection[]): string {
  const nodeCount = nodes.length;
  const connectionCount = connections.length;
  const ratio = connectionCount / Math.max(nodeCount, 1);
  
  if (nodeCount <= 5 && ratio <= 1.5) return 'Simple';
  if (nodeCount <= 15 && ratio <= 2.5) return 'Medium';
  if (nodeCount <= 30 && ratio <= 3.5) return 'Complex';
  return 'Expert';
}

function estimateRuntime(nodes: WorkflowNode[], connections: WorkflowConnection[]): number {
  // Simple estimation based on node types and connections
  const baseTime = nodes.length * 100; // 100ms per node
  const connectionTime = connections.length * 50; // 50ms per connection
  const complexityMultiplier = nodes.filter(n => n.category === 'ai').length * 2;
  
  return baseTime + connectionTime + complexityMultiplier * 500;
}

function calculateCost(nodes: WorkflowNode[], connections: WorkflowConnection[]): number {
  // Simple cost calculation
  const baseCost = nodes.length * 0.1; // $0.10 per node
  const aiCost = nodes.filter(n => n.category === 'ai').length * 2; // $2 per AI node
  const integrationCost = nodes.filter(n => n.category === 'integrations').length * 0.5; // $0.50 per integration
  
  return Math.round((baseCost + aiCost + integrationCost) * 100) / 100;
}