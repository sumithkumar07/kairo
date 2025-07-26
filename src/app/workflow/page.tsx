'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { EnhancedAppLayout } from '@/components/enhanced-app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { WorkflowCanvas } from '@/components/ui/enhanced-workflow-canvas';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InteractiveButton } from '@/components/ui/enhanced-interactive-elements';
import { StatusIndicator } from '@/components/ui/enhanced-status-indicators';
import { 
  Workflow,
  Brain,
  Sparkles,
  Grid3X3,
  Route,
  Code,
  Zap,
  ArrowRight,
  Target,
  Activity,
  Settings,
  Eye,
  Play,
  Share,
  Download,
  Upload,
  Copy,
  Layers,
  Monitor,
  BarChart3,
  MessageSquare,
  Bot,
  Terminal,
  Crown,
  KeyRound,
  Plus,
  User,
  Send,
  Loader2,
  Trash2,
  X,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Rocket,
  Database,
  Globe,
  Key,
  Lock,
  MoreVertical,
  Info,
  Check,
  AlertTriangle,
  TrendingUp,
  Award,
  FlaskConical,
  Shield,
  FileText,
  Clock,
  Star,
  Search,
  Filter,
  BookOpen,
  Wand2,
  PuzzleIcon,
  GitBranch,
  Cpu,
  Network,
  Webhook,
  Mail,
  CreditCard,
  ShoppingCart,
  Users,
  Calendar,
  Image,
  Video,
  Music,
  Folder,
  Archive,
  Save,
  Briefcase,
  Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Import AI Studio related types and services
import type { McpCommandRecord, Tool, ManagedCredential, DisplayUserApiKey, Workflow as WorkflowType } from '@/types/workflow';
import { getMcpHistory } from '@/services/workflow-storage-service';
import { listCredentialsAction, saveCredentialAction, deleteCredentialAction, generateApiKeyAction, saveAgentConfigAction, getAgentConfigAction, listApiKeysAction, revokeApiKeyAction, agentCommandAction } from '@/app/actions';
import { ALL_AVAILABLE_TOOLS } from '@/ai/tools';
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import { findPlaceholdersInObject } from '@/lib/workflow-utils';
import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';

interface CommandMessage extends McpCommandRecord {
    generatedWorkflow?: GenerateWorkflowFromPromptOutput;
}

// Mock workflow templates data
const workflowTemplates = [
  {
    id: 'email-automation',
    name: 'Email Marketing Campaign',
    description: 'Automated email sequences with personalization and tracking',
    category: 'Marketing',
    difficulty: 'Beginner',
    estimatedTime: '5 minutes',
    uses: 1247,
    rating: 4.8,
    tags: ['email', 'marketing', 'automation'],
    icon: Mail,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'lead-qualification',
    name: 'Lead Qualification Process',
    description: 'Intelligent lead scoring and routing to sales teams',
    category: 'Sales',
    difficulty: 'Intermediate',
    estimatedTime: '15 minutes',
    uses: 892,
    rating: 4.9,
    tags: ['sales', 'crm', 'lead-scoring'],
    icon: Target,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'inventory-management',
    name: 'Inventory Sync & Alerts',
    description: 'Real-time inventory tracking with low-stock notifications',
    category: 'E-commerce',
    difficulty: 'Advanced',
    estimatedTime: '30 minutes',
    uses: 654,
    rating: 4.7,
    tags: ['inventory', 'ecommerce', 'notifications'],
    icon: Database,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'customer-onboarding',
    name: 'Customer Onboarding Flow',
    description: 'Automated welcome series with progressive disclosure',
    category: 'Customer Success',
    difficulty: 'Intermediate',
    estimatedTime: '20 minutes',
    uses: 523,
    rating: 4.6,
    tags: ['onboarding', 'customer-success', 'automation'],
    icon: Users,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'data-processing',
    name: 'Data Transformation Pipeline',
    description: 'ETL pipeline with validation and error handling',
    category: 'Data',
    difficulty: 'Advanced',
    estimatedTime: '45 minutes',
    uses: 387,
    rating: 4.9,
    tags: ['data', 'etl', 'pipeline'],
    icon: GitBranch,
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'social-media',
    name: 'Social Media Scheduler',
    description: 'Multi-platform content scheduling with analytics',
    category: 'Marketing',
    difficulty: 'Beginner',
    estimatedTime: '10 minutes',
    uses: 756,
    rating: 4.5,
    tags: ['social-media', 'content', 'scheduling'],
    icon: Globe,
    color: 'from-pink-500 to-rose-500'
  }
];

const templateCategories = [
  { name: 'All', count: workflowTemplates.length },
  { name: 'Marketing', count: 2 },
  { name: 'Sales', count: 1 },
  { name: 'E-commerce', count: 1 },
  { name: 'Customer Success', count: 1 },
  { name: 'Data', count: 1 }
];

function ConsolidatedWorkflowEditor() {
  const { toast } = useToast();
  const router = useRouter();
  
  // Main state
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'builder';
    }
    return 'builder';
  });

  // Builder state
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [builderMode, setBuilderMode] = useState<'visual' | 'code'>('visual');

  // Templates state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof workflowTemplates[0] | null>(null);

  // AI Assistant state
  const [commandInput, setCommandInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<CommandMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Agent Skills State
  const [configuredTools, setConfiguredTools] = useState<Tool[]>([]);
  const [showAddToolDialog, setShowAddToolDialog] = useState(false);

  // Credentials State
  const [credentials, setCredentials] = useState<Omit<ManagedCredential, 'value'>[]>([]);
  const [showAddCredentialDialog, setShowAddCredentialDialog] = useState(false);
  const [credentialToDeleteId, setCredentialToDeleteId] = useState<string | null>(null);

  // Load AI data
  const loadAIData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [history, agentConfig, creds] = await Promise.all([
            getMcpHistory(),
            getAgentConfigAction(),
            listCredentialsAction(),
        ]);
        setMessages(history);
        const enabledTools = ALL_AVAILABLE_TOOLS.filter(tool => agentConfig.enabledTools.includes(tool.name));
        setConfiguredTools(enabledTools);
        setCredentials(creds);
    } catch (e: any) {
        toast({ title: 'Error', description: `Failed to load AI data: ${e.message}`, variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    loadAIData();
  }, [loadAIData]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle AI command
  const handleSendCommand = async () => {
    if (!commandInput.trim() || isSending) return;
    
    const commandText = commandInput;
    setCommandInput('');
    setIsSending(true);

    const optimisticUserMessage: CommandMessage = {
      id: crypto.randomUUID(),
      user_id: '',
      command: commandText,
      response: '',
      status: 'Success',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticUserMessage]);

    try {
        const { responseRecord, generatedWorkflow } = await agentCommandAction(commandText, messages);
        const finalMessage: CommandMessage = { ...responseRecord, generatedWorkflow };
        setMessages(prev => [...prev, finalMessage]);
    } catch (e: any) {
      const errorMessage: CommandMessage = {
        id: crypto.randomUUID(),
        user_id: '',
        command: '',
        response: `Error: ${e.message}`,
        status: 'Failed',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  // Handle loading generated workflow
  const handleLoadGeneratedWorkflow = (workflowData?: GenerateWorkflowFromPromptOutput) => {
    if (!workflowData) return;
    const workflowToSave: WorkflowType = { 
        nodes: workflowData.nodes, 
        connections: workflowData.connections 
    };
    localStorage.setItem('kairoCurrentWorkflow', JSON.stringify({ name: workflowData.name, workflow: workflowToSave }));
    toast({ title: 'Workflow Ready', description: `Loading "${workflowData.name}" into the editor.` });
    setActiveTab('builder'); // Switch to builder tab
  };

  // Handle template selection
  const handleTemplateSelect = (template: typeof workflowTemplates[0]) => {
    setSelectedTemplate(template);
    toast({ title: 'Template Selected', description: `Loading "${template.name}" template.` });
    setActiveTab('builder'); // Switch to builder tab
  };

  // Handle tool toggle
  const handleToolToggle = useCallback(async (tool: Tool, isAdding: boolean) => {
    const updatedToolNames = isAdding
      ? [...configuredTools.map(t => t.name), tool.name]
      : configuredTools.map(t => t.name).filter(name => name !== tool.name);
    
    try {
      await saveAgentConfigAction({ enabledTools: updatedToolNames });
      const newConfiguredTools = ALL_AVAILABLE_TOOLS.filter(t => updatedToolNames.includes(t.name));
      setConfiguredTools(newConfiguredTools);
      toast({ title: isAdding ? 'Skill Added' : 'Skill Removed', description: `"${tool.name}" has been ${isAdding ? 'added to' : 'removed from'} your agent.` });
    } catch (e: any) {
      toast({ title: 'Error Saving Config', description: 'Could not save the agent skill configuration.', variant: 'destructive' });
      loadAIData();
    }
  }, [configuredTools, toast, loadAIData]);

  // Handle credential save
  const handleCredentialSave = async (name: string, value: string, service?: string) => {
    const result = await saveCredentialAction(name, value, service);
    if (result.success) {
        toast({ title: "Credential Saved", description: result.message });
        const creds = await listCredentialsAction();
        setCredentials(creds);
        return true;
    } else {
        toast({ title: "Save Failed", description: result.message, variant: "destructive" });
        return false;
    }
  };

  // Handle credential delete
  const handleDeleteCredential = async () => {
    if (!credentialToDeleteId) return;
    try {
        const result = await deleteCredentialAction(credentialToDeleteId);
        if (result.success) {
            toast({ title: 'Credential Deleted', description: 'The credential has been removed.' });
            setCredentials(prev => prev.filter(c => c.id !== credentialToDeleteId));
        } else {
            throw new Error(result.message);
        }
    } catch (e: any) {
        toast({ title: 'Error', description: `Failed to delete credential: ${e.message}`, variant: 'destructive' });
    } finally {
        setCredentialToDeleteId(null);
    }
  };

  // Organized tools by service
  const configuredSkillsByService = useMemo(() => {
    const grouped = new Map<string, Tool[]>();
    configuredTools.forEach(tool => {
        const service = tool.service || 'General';
        if (!grouped.has(service)) {
            grouped.set(service, []);
        }
        grouped.get(service)!.push(tool);
    });
    return grouped;
  }, [configuredTools]);

  const unconfiguredToolsByService = useMemo(() => {
    const configuredToolNames = new Set(configuredTools.map(t => t.name));
    const unconfigured = ALL_AVAILABLE_TOOLS.filter(t => !configuredToolNames.has(t.name));
    
    const grouped = new Map<string, Tool[]>();
    unconfigured.forEach(tool => {
        const service = tool.service || 'General';
        if (!grouped.has(service)) {
            grouped.set(service, []);
        }
        grouped.get(service)!.push(tool);
    });
    return grouped;
  }, [configuredTools]);

  // Filter templates
  const filteredTemplates = workflowTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Builder Tab Component
  const BuilderTab = () => (
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Builder Header */}
      <div className="border-b bg-gradient-to-r from-card/50 via-card to-card/50 backdrop-blur-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-xl shadow-lg">
              <Workflow className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
                AI-Native Workflow Builder
              </h1>
              <p className="text-muted-foreground text-lg">
                Build workflows with integrated AI assistance, contextual suggestions, and intelligent automation
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <StatusIndicator status="healthy" label="AI Assistant Ready" size="sm" />
            <StatusIndicator status="active" label="Grid System Active" size="sm" />
            <StatusIndicator status="success" label="Smart Suggestions" size="sm" />
            
            <div className="flex items-center gap-2 border rounded-lg p-1">
              <Button
                variant={builderMode === 'visual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBuilderMode('visual')}
                className="h-8"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Visual
              </Button>
              <Button
                variant={builderMode === 'code' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBuilderMode('code')}
                className="h-8"
              >
                <Code className="h-4 w-4 mr-2" />
                Code
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="flex items-center gap-2"
            >
              {rightPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {rightPanelOpen ? 'Hide AI Panel' : 'Show AI Panel'}
            </Button>
          </div>
        </div>

        {/* Builder Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Brain className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold">AI Assistant</span>
                  <p className="text-xs text-muted-foreground">Natural language workflow generation</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold">Smart Suggestions</span>
                  <p className="text-xs text-muted-foreground">Contextual node recommendations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold">Agent Skills</span>
                  <p className="text-xs text-muted-foreground">Configurable AI capabilities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20 hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Database className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold">Credentials</span>
                  <p className="text-xs text-muted-foreground">Secure integration management</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-200 bg-pink-50/50 dark:bg-pink-950/20 hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <Crown className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold">Templates</span>
                  <p className="text-xs text-muted-foreground">Pre-built workflow patterns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Builder Layout */}
      <div className="flex-1 flex">
        {/* Workflow Canvas */}
        <div className={cn("flex-1 relative transition-all duration-300", rightPanelOpen && "mr-96")}>
          {builderMode === 'visual' ? (
            <WorkflowCanvas />
          ) : (
            <div className="h-full p-6">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Code Editor
                  </CardTitle>
                  <CardDescription>Write workflow logic using JavaScript/TypeScript</CardDescription>
                </CardHeader>
                <CardContent className="h-full">
                  <div className="h-full border rounded-lg bg-gray-900 text-green-400 p-4 font-mono text-sm">
                    <div className="opacity-60">// Workflow code editor - coming soon</div>
                    <div className="opacity-60">// Write custom logic for advanced automation</div>
                    <div className="mt-4">
                      <div>export default async function workflow(context) {`{`}</div>
                      <div className="ml-4 opacity-60">// Your workflow logic here</div>
                      <div className="ml-4">return await processData(context.input);</div>
                      <div>{`}`}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* AI-Integrated Right Panel */}
        {rightPanelOpen && (
          <div className="fixed right-0 top-[200px] bottom-0 w-96 border-l bg-card/50 backdrop-blur-sm z-20">
            <div className="h-full flex flex-col">
              {/* AI Panel Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">AI Workspace</h3>
                      <p className="text-xs text-muted-foreground">Integrated workflow assistance</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRightPanelOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* AI Assistant Interface */}
              <div className="flex-1 flex flex-col p-4">
                <ScrollArea className="flex-1 border rounded-lg bg-background/50">
                  <div className="p-4 space-y-4">
                    {isLoading ? (
                      <div className="text-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        <p className="mt-2 text-sm text-muted-foreground">Loading AI assistant...</p>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">
                        <Brain className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm">Ask me to generate workflows, suggest improvements, or help with automation!</p>
                        <div className="mt-4 space-y-2 text-xs">
                          <p className="text-muted-foreground/70">Try asking:</p>
                          <div className="space-y-1">
                            <Button variant="outline" size="sm" className="text-xs h-6" onClick={() => setCommandInput("Create a workflow to send daily email reports")}>
                              "Create a workflow to send daily email reports"
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs h-6" onClick={() => setCommandInput("How can I optimize this workflow for performance?")}>
                              "How can I optimize this workflow?"
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id}>
                          {msg.command && (
                            <div className="flex items-start gap-3">
                              <User className="h-4 w-4 mt-1 text-muted-foreground" />
                              <p className="font-mono text-sm font-semibold text-primary">&gt; {msg.command}</p>
                            </div>
                          )}
                          {msg.response && (
                            <div className={cn("flex items-start gap-3 mt-2", msg.status === 'Failed' && "text-destructive")}>
                              <Bot className="h-4 w-4 mt-1" />
                              <div className="flex-1">
                                <p className="whitespace-pre-wrap text-sm">{msg.response}</p>
                                {msg.generatedWorkflow && (
                                  <Card className="mt-2">
                                    <CardHeader className="p-3">
                                      <CardTitle className="text-sm flex items-center gap-2">
                                        <Workflow className="h-4 w-4" /> Workflow Generated
                                      </CardTitle>
                                      <CardDescription className="text-xs">{msg.generatedWorkflow.name}</CardDescription>
                                    </CardHeader>
                                    <CardFooter className="p-3">
                                      <Button size="sm" onClick={() => handleLoadGeneratedWorkflow(msg.generatedWorkflow)} className="w-full">
                                        Load into Editor
                                      </Button>
                                    </CardFooter>
                                  </Card>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="flex items-center gap-2 mt-4">
                  <Input 
                    placeholder="Ask AI to generate workflows, suggest improvements..." 
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
                    disabled={isSending || isLoading}
                    className="flex-1"
                  />
                  <Button onClick={handleSendCommand} disabled={isSending || isLoading || !commandInput.trim()}>
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Status Footer */}
      <div className="border-t bg-gradient-to-r from-muted/30 via-background to-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-sm">
              <StatusIndicator status="active" size="sm" showIcon={false} />
              <span className="text-muted-foreground">AI-native editor active</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <StatusIndicator status="healthy" size="sm" showIcon={false} />
              <span className="text-muted-foreground">Smart suggestions enabled</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <StatusIndicator status="success" size="sm" showIcon={false} />
              <span className="text-muted-foreground">Agent skills: {configuredTools.length} active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <InteractiveButton variant="outline" size="sm" icon={Brain}>
              AI Assist
            </InteractiveButton>
            <InteractiveButton variant="outline" size="sm" icon={FileText}>
              Templates
            </InteractiveButton>
            <InteractiveButton variant="outline" size="sm" icon={Monitor}>
              Analytics
            </InteractiveButton>
            <InteractiveButton 
              size="sm" 
              gradient="from-primary via-purple-600 to-pink-500"
              glow
              icon={Zap}
            >
              Deploy Workflow
              <ArrowRight className="h-4 w-4 ml-2" />
            </InteractiveButton>
          </div>
        </div>
      </div>
    </div>
  );

  // Templates Tab Component
  const TemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Workflow Templates
          </h2>
          <p className="text-muted-foreground text-lg">
            Pre-built workflows to accelerate your automation journey
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2">
          <BookOpen className="h-4 w-4 mr-2" />
          {workflowTemplates.length} Templates Available
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates by name, category, or features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              {templateCategories.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                  className="whitespace-nowrap"
                >
                  {category.name}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-xl bg-gradient-to-r", template.color)}>
                  <template.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{template.rating}</span>
                </div>
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {template.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm font-semibold">{template.difficulty}</div>
                  <div className="text-xs text-muted-foreground">Difficulty</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">{template.estimatedTime}</div>
                  <div className="text-xs text-muted-foreground">Setup Time</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">{template.uses}</div>
                  <div className="text-xs text-muted-foreground">Uses</div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-4">
              <Button 
                className="w-full group-hover:bg-primary/90"
                onClick={() => handleTemplateSelect(template)}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <PuzzleIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground">Try adjusting your search terms or category filters.</p>
        </div>
      )}
    </div>
  );

  // Agent Skills Tab Component
  const AgentSkillsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Agent Skills
          </h2>
          <p className="text-muted-foreground text-lg">
            Configure what your AI assistant can do to help with workflow automation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2">
            <Settings className="h-4 w-4 mr-2" />
            {configuredTools.length} Skills Active
          </Badge>
          <Button onClick={() => setShowAddToolDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        </div>
      </div>

      {/* Configured Skills */}
      {configuredSkillsByService.size > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Active Skills</h3>
          {Array.from(configuredSkillsByService.entries()).map(([service, tools]) => (
            <Card key={service}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {service}
                </CardTitle>
                <CardDescription>{tools.length} skills configured</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tools.map((tool) => (
                    <div key={tool.name} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="p-2 bg-muted rounded-md">
                        <tool.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{tool.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleToolToggle(tool, false)}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Available Skills */}
      {unconfiguredToolsByService.size > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Available Skills</h3>
          {Array.from(unconfiguredToolsByService.entries()).map(([service, tools]) => (
            <Card key={service}>
              <CardHeader>
                <CardTitle className="text-lg">{service}</CardTitle>
                <CardDescription>{tools.length} skills available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tools.map((tool) => (
                    <div key={tool.name} className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="p-2 bg-muted rounded-md">
                        <tool.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{tool.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleToolToggle(tool, true)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {configuredSkillsByService.size === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No skills configured</h3>
            <p className="text-muted-foreground mb-4">Add skills to enhance your AI assistant's capabilities</p>
            <Button onClick={() => setShowAddToolDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Skill
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Credentials Tab Component
  const CredentialsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Integration Credentials
          </h2>
          <p className="text-muted-foreground text-lg">
            Manage API keys and secrets for secure integration access
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2">
            <Lock className="h-4 w-4 mr-2" />
            {credentials.length} Credentials Stored
          </Badge>
          <Button onClick={() => setShowAddCredentialDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Credential
          </Button>
        </div>
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Security Information</h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>• All credentials are encrypted using AES-256 encryption</p>
                <p>• References in workflows use the format: <code className="bg-background/50 px-1 rounded">{`{{credential.NAME}}`}</code></p>
                <p>• Credentials are never logged or exposed in execution traces</p>
                <p>• Regular security audits ensure compliance with SOC 2 standards</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credentials List */}
      {credentials.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Stored Credentials</CardTitle>
            <CardDescription>Manage your API keys and integration secrets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {credentials.map((cred) => (
                <div key={cred.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="p-3 bg-muted rounded-lg">
                    <KeyRound className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{cred.name}</h4>
                    <p className="text-sm text-muted-foreground">{cred.service || 'General'} • Created {new Date(cred.created_at).toLocaleDateString()}</p>
                    <div className="mt-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {`{{credential.${cred.name}}}`}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setCredentialToDeleteId(cred.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Key className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No credentials stored</h3>
            <p className="text-muted-foreground mb-4">Add API keys and secrets to enable integrations</p>
            <Button onClick={() => setShowAddCredentialDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Credential
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <EnhancedAppLayout>
      <div className="flex-1 flex flex-col">
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 max-w-2xl">
              <TabsTrigger value="builder" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                <span className="hidden sm:inline">Builder</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Templates</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">AI Skills</span>
              </TabsTrigger>
              <TabsTrigger value="credentials" className="flex items-center gap-2">
                <KeyRound className="h-4 w-4" />
                <span className="hidden sm:inline">Credentials</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <TabsContent value="builder" className="flex-1 m-0">
            <BuilderTab />
          </TabsContent>

          <TabsContent value="templates" className="flex-1 m-0 p-6">
            <TemplatesTab />
          </TabsContent>

          <TabsContent value="skills" className="flex-1 m-0 p-6">
            <AgentSkillsTab />
          </TabsContent>

          <TabsContent value="credentials" className="flex-1 m-0 p-6">
            <CredentialsTab />
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedAppLayout>
  );
}

export default withAuth(ConsolidatedWorkflowEditor);