'use client';

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils';
import { withAuth } from '@/components/auth/with-auth';
import { AppLayout } from '@/components/app-layout';
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
  Eye,
  EyeOff,
  Grid,
  Search,
  Filter,
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
  History,
  Bookmark,
  Tag,
  Folder,
  Link,
  Copy,
  Scissors,
  Clipboard,
  Plus,
  Minus,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  RefreshCw,
  Power,
  Volume2,
  Mic,
  Camera,
  Mail,
  Send,
  Image,
  File,
  Home,
  Building,
  Store,
  Wrench,
  Hammer,
  Cog,
  PieChart,
  LineChart,
  MoreHorizontal,
  Gauge,
  ThermometerSun,
  ShieldCheck,
  Move,
  Lightbulb,
  Globe,
  Smartphone,
  Tablet,
  Desktop,
  Server,
  Cloud,
  Palette,
  Brush,
  Crown,
  Wand2,
  Crosshair,
  Navigation,
  Compass,
  Route,
  Map,
  Flag,
  Plane,
  Car,
  Truck,
  Ship,
  Train,
  Bike,
  Bus,
  Taxi,
  Phone,
  Headphones,
  Speaker,
  Battery,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Thermometer,
  Flame,
  Snowflake,
  Leaf,
  Tree,
  Flower,
  Apple,
  Coffee,
  Cake,
  Pizza,
  Sandwich,
  Fish,
  Chicken,
  Egg,
  Milk,
  Bread,
  Cheese,
  Wine,
  Beer,
  Juice,
  Ice,
  Honey,
  Salt,
  Pepper,
  Sugar,
  Oil,
  Vinegar,
  Sauce,
  Spice,
  Herb,
  Lemon,
  Orange,
  Banana,
  Grapes,
  Strawberry,
  Cherry,
  Watermelon,
  Pineapple,
  Coconut,
  Avocado,
  Carrot,
  Broccoli,
  Tomato,
  Potato,
  Onion,
  Garlic,
  Mushroom,
  Corn,
  Pepper as PepperVeg,
  Eggplant
} from 'lucide-react';

// Types
interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  config: Record<string, any>;
  inputHandles: string[];
  outputHandles: string[];
  category: string;
  lastExecutionStatus: 'pending' | 'running' | 'success' | 'error';
}

interface WorkflowConnection {
  id: string;
  sourceNodeId: string;
  sourceHandle: string;
  targetNodeId: string;
  targetHandle: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'normal' | 'warning' | 'critical';
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  downloads: number;
  tags: string[];
  preview: string;
  workflow: Workflow;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'viewer' | 'editor' | 'admin';
  isOnline: boolean;
  lastActive: string;
}

interface CollaborationComment {
  id: string;
  nodeId?: string;
  userId: string;
  content: string;
  timestamp: string;
  resolved: boolean;
  replies: CollaborationComment[];
}

// Enhanced Workflow Editor Component
function EnhancedWorkflowEditor() {
  // State Management
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow>({
    id: 'new',
    name: 'Untitled Workflow',
    description: '',
    nodes: [],
    connections: [],
    tags: [],
    isPublic: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');
  const [leftPanelTab, setLeftPanelTab] = useState('templates');
  const [rightPanelTab, setRightPanelTab] = useState('ai-assistant');
  
  // Panel visibility states
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(false);

  // Real-time metrics
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetric[]>([
    { id: 'executions', name: 'Executions', value: 247, unit: '', trend: 'up', change: 12.5, status: 'normal' },
    { id: 'success-rate', name: 'Success Rate', value: 94.2, unit: '%', trend: 'up', change: 2.1, status: 'normal' },
    { id: 'avg-runtime', name: 'Avg Runtime', value: 1.8, unit: 's', trend: 'down', change: -8.3, status: 'normal' },
    { id: 'active-workflows', name: 'Active Workflows', value: 34, unit: '', trend: 'stable', change: 0, status: 'normal' }
  ]);

  // Templates data
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([
    {
      id: 'lead-nurturing',
      name: 'Lead Nurturing Campaign',
      description: 'Automatically nurture leads with personalized email sequences',
      category: 'Marketing',
      difficulty: 'intermediate',
      rating: 4.8,
      downloads: 2847,
      tags: ['email', 'marketing', 'crm'],
      preview: 'Email → CRM → Analytics',
      workflow: currentWorkflow
    },
    {
      id: 'customer-onboarding',
      name: 'Customer Onboarding',
      description: 'Streamline new customer onboarding process',
      category: 'Sales',
      difficulty: 'beginner',
      rating: 4.9,
      downloads: 3421,
      tags: ['onboarding', 'automation', 'welcome'],
      preview: 'Signup → Welcome → Setup',
      workflow: currentWorkflow
    },
    {
      id: 'invoice-processing',
      name: 'Invoice Processing',
      description: 'Automate invoice processing and approval workflow',
      category: 'Finance',
      difficulty: 'advanced',
      rating: 4.7,
      downloads: 1592,
      tags: ['invoice', 'finance', 'approval'],
      preview: 'Upload → Extract → Approve',
      workflow: currentWorkflow
    }
  ]);

  // Team collaboration
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Sarah Johnson', email: 'sarah@company.com', avatar: '', role: 'admin', isOnline: true, lastActive: '2 min ago' },
    { id: '2', name: 'Mike Chen', email: 'mike@company.com', avatar: '', role: 'editor', isOnline: true, lastActive: '5 min ago' },
    { id: '3', name: 'Emma Davis', email: 'emma@company.com', avatar: '', role: 'viewer', isOnline: false, lastActive: '1 hour ago' }
  ]);

  const [comments, setComments] = useState<CollaborationComment[]>([
    {
      id: '1',
      nodeId: 'node-1',
      userId: '1',
      content: 'Should we add error handling here?',
      timestamp: '2024-01-15T10:30:00Z',
      resolved: false,
      replies: []
    }
  ]);

  const { toast } = useToast();
  const { hasProFeatures, user } = useSubscription();

  // Event Handlers
  const handleTemplateSelect = useCallback((template: WorkflowTemplate) => {
    setCurrentWorkflow(template.workflow);
    toast({
      title: "Template Applied",
      description: `${template.name} has been loaded into the editor`
    });
  }, [toast]);

  const handleNodeAdd = useCallback((nodeType: string, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: nodeType,
      name: `${nodeType} Node`,
      description: '',
      position,
      config: {},
      inputHandles: ['input'],
      outputHandles: ['output'],
      category: 'general',
      lastExecutionStatus: 'pending'
    };

    setCurrentWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  }, []);

  const handleWorkflowExecute = useCallback(() => {
    if (currentWorkflow.nodes.length === 0) {
      toast({
        title: "No Workflow to Execute",
        description: "Add some nodes to create a workflow first"
      });
      return;
    }

    setIsExecuting(true);
    
    // Simulate workflow execution
    setTimeout(() => {
      setIsExecuting(false);
      toast({
        title: "Workflow Executed",
        description: "Your workflow has been executed successfully"
      });
    }, 3000);
  }, [currentWorkflow.nodes, toast]);

  const handleWorkflowSave = useCallback(() => {
    toast({
      title: "Workflow Saved",
      description: `${currentWorkflow.name} has been saved successfully`
    });
  }, [currentWorkflow.name, toast]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-500 bg-green-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      case 'critical': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/10 text-green-700';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-700';
      case 'advanced': return 'bg-red-500/10 text-red-700';
      default: return 'bg-gray-500/10 text-gray-700';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/10 text-purple-700';
      case 'editor': return 'bg-blue-500/10 text-blue-700';
      case 'viewer': return 'bg-gray-500/10 text-gray-700';
      default: return 'bg-gray-500/10 text-gray-700';
    }
  };

  // Update real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 10,
        change: (Math.random() - 0.5) * 20
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppLayout>
      <div className="h-screen flex flex-col bg-background">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <WorkflowIcon className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Enhanced Workflow Hub</h1>
              <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-purple-500/10">
                <Sparkles className="w-3 h-3 mr-1" />
                All-in-One
              </Badge>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Layers className="h-4 w-4" />
                <span>{currentWorkflow.nodes.length} nodes</span>
              </div>
              <div className="flex items-center space-x-1">
                <GitBranch className="h-4 w-4" />
                <span>{currentWorkflow.connections.length} connections</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{teamMembers.filter(m => m.isOnline).length} online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={isExecuting ? "destructive" : "default"}
              onClick={handleWorkflowExecute}
              disabled={currentWorkflow.nodes.length === 0}
            >
              {isExecuting ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Execute
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={handleWorkflowSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLeftPanel(!showLeftPanel)}
            >
              <Layers className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRightPanel(!showRightPanel)}
            >
              <Bot className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBottomPanel(!showBottomPanel)}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Real-time Metrics Bar */}
        <div className="flex items-center justify-between p-3 bg-muted/50 border-b">
          <div className="flex items-center space-x-6">
            {realTimeMetrics.map((metric) => (
              <div key={metric.id} className="flex items-center space-x-2">
                <div className={`p-1 rounded-full ${getStatusColor(metric.status)}`}>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">{metric.value.toFixed(1)}{metric.unit}</span>
                  <span className="text-muted-foreground ml-1">{metric.name}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-muted-foreground">Live</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowBottomPanel(true)}>
              <Activity className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Templates & Analytics */}
          {showLeftPanel && (
            <div className="w-80 border-r bg-card">
              <Tabs value={leftPanelTab} onValueChange={setLeftPanelTab} className="h-full">
                <TabsList className="grid w-full grid-cols-3 m-2">
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="nodes">Nodes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="templates" className="h-full p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Workflow Templates</h3>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Create
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search templates..." className="flex-1" />
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-[calc(100vh-220px)]">
                      <div className="space-y-3">
                        {templates.map((template) => (
                          <Card key={template.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-sm">{template.name}</h4>
                                <Badge className={getDifficultyColor(template.difficulty)}>
                                  {template.difficulty}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-xs">
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span>{template.rating}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Download className="h-3 w-3" />
                                    <span>{template.downloads}</span>
                                  </div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleTemplateSelect(template)}
                                >
                                  Use Template
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
                
                <TabsContent value="analytics" className="h-full p-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Real-time Analytics</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {realTimeMetrics.map((metric) => (
                        <Card key={metric.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{metric.name}</span>
                              <div className={`p-1 rounded-full ${getStatusColor(metric.status)}`}>
                                {getTrendIcon(metric.trend)}
                              </div>
                            </div>
                            <div className="text-2xl font-bold mb-1">
                              {metric.value.toFixed(1)}{metric.unit}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}% vs last period
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">System Health</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>CPU Usage</span>
                            <span>45%</span>
                          </div>
                          <Progress value={45} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Memory</span>
                            <span>67%</span>
                          </div>
                          <Progress value={67} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Network</span>
                            <span>23%</span>
                          </div>
                          <Progress value={23} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="nodes" className="h-full p-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Node Library</h3>
                    <div className="text-sm text-muted-foreground">
                      Drag nodes onto the canvas to build your workflow
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {['API Call', 'Database Query', 'AI Processing', 'Email Send', 'File Upload', 'Webhook'].map((nodeType) => (
                        <Card key={nodeType} className="cursor-move hover:bg-muted/50 transition-colors">
                          <CardContent className="p-3 text-center">
                            <Code className="h-6 w-6 mx-auto mb-2 text-primary" />
                            <div className="text-xs font-medium">{nodeType}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Canvas Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 bg-dot-pattern relative overflow-hidden">
              {currentWorkflow.nodes.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                      <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Start Building</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Choose a template from the left panel or drag nodes to create your workflow
                      </p>
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => setLeftPanelTab('templates')}>
                          <FileText className="h-4 w-4 mr-2" />
                          Browse Templates
                        </Button>
                        <Button variant="outline" onClick={() => setLeftPanelTab('nodes')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Nodes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Card className="max-w-md">
                    <CardContent className="p-6 text-center">
                      <WorkflowIcon className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="text-lg font-semibold mb-2">Workflow Canvas</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enhanced workflow canvas with {currentWorkflow.nodes.length} nodes
                      </p>
                      <Badge variant="secondary">
                        Interactive Canvas Coming Soon
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - AI Assistant & Collaboration */}
          {showRightPanel && (
            <div className="w-80 border-l bg-card">
              <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} className="h-full">
                <TabsList className="grid w-full grid-cols-3 m-2">
                  <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
                  <TabsTrigger value="collaboration">Team</TabsTrigger>
                  <TabsTrigger value="properties">Properties</TabsTrigger>
                </TabsList>
                
                <TabsContent value="ai-assistant" className="h-full p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">AI Assistant</h3>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-muted-foreground">Online</span>
                      </div>
                    </div>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Brain className="h-5 w-5 text-primary" />
                          <span className="font-medium">Workflow Insights</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>Your workflow structure looks optimal</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                            <span>Consider adding error handling nodes</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                            <span>Performance can be improved by 15%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Wand2 className="h-5 w-5 text-purple-500" />
                          <span className="font-medium">AI Suggestions</span>
                        </div>
                        <div className="space-y-2">
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Data Validation
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Shield className="h-4 w-4 mr-2" />
                            Add Security Check
                          </Button>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <Activity className="h-4 w-4 mr-2" />
                            Add Monitoring
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="flex-1 bg-muted/20 rounded-lg p-4 text-center">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Chat with AI assistant to get help with your workflow
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="collaboration" className="h-full p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Team Collaboration</h3>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Invite
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Team Members</h4>
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            {member.isOnline && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">{member.name}</div>
                            <div className="text-xs text-muted-foreground">{member.lastActive}</div>
                          </div>
                          <Badge className={getRoleColor(member.role)}>
                            {member.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Recent Activity</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>Sarah added a new node</span>
                          <span className="text-muted-foreground">2 min ago</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Mike updated configuration</span>
                          <span className="text-muted-foreground">5 min ago</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Emma left a comment</span>
                          <span className="text-muted-foreground">10 min ago</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Comments</h4>
                      {comments.map((comment) => (
                        <Card key={comment.id}>
                          <CardContent className="p-3">
                            <div className="flex items-start space-x-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-3 w-3 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm">{comment.content}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {new Date(comment.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="properties" className="h-full p-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Properties</h3>
                    
                    {selectedNodeId ? (
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="node-name">Node Name</Label>
                              <Input id="node-name" placeholder="Enter node name" />
                            </div>
                            <div>
                              <Label htmlFor="node-description">Description</Label>
                              <Input id="node-description" placeholder="Enter description" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="node-enabled" />
                              <Label htmlFor="node-enabled">Enabled</Label>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="text-center py-8">
                        <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Select a node to view its properties
                        </p>
                      </div>
                    )}
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Workflow Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="workflow-name">Workflow Name</Label>
                          <Input 
                            id="workflow-name" 
                            value={currentWorkflow.name}
                            onChange={(e) => setCurrentWorkflow(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="workflow-description">Description</Label>
                          <Input 
                            id="workflow-description" 
                            value={currentWorkflow.description}
                            onChange={(e) => setCurrentWorkflow(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="workflow-public"
                            checked={currentWorkflow.isPublic}
                            onCheckedChange={(checked) => setCurrentWorkflow(prev => ({ ...prev, isPublic: checked }))}
                          />
                          <Label htmlFor="workflow-public">Public</Label>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Bottom Panel - Performance Analytics */}
        {showBottomPanel && (
          <div className="h-64 border-t bg-card">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Performance Analytics</h3>
              <Button variant="outline" size="sm" onClick={() => setShowBottomPanel(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500 mb-2">247</div>
                    <div className="text-sm text-muted-foreground">Total Executions</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-500 mb-2">94.2%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-500 mb-2">1.8s</div>
                    <div className="text-sm text-muted-foreground">Avg Runtime</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-500 mb-2">34</div>
                    <div className="text-sm text-muted-foreground">Active Workflows</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default withAuth(EnhancedWorkflowEditor);