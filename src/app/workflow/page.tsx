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
  Star
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

function AIWorkflowEditor() {
  const { toast } = useToast();
  const router = useRouter();
  
  // AI Panel State
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeAITab, setActiveAITab] = useState('assistant');
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
    // Workflow will be loaded by the canvas component
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

  return (
    <EnhancedAppLayout>
      <div className="h-screen flex flex-col">
        {/* Enhanced Header with AI Integration */}
        <div className="border-b bg-gradient-to-r from-card/50 via-card to-card/50 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-xl shadow-lg">
                <Workflow className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
                  AI-Native Workflow Editor
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

          {/* AI-Enhanced Feature Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 hover:shadow-md transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Brain className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold">AI Assistant</span>
                    <p className="text-xs text-muted-foreground">
                      Natural language workflow generation
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      Contextual node recommendations
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      Configurable AI capabilities
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      Secure integration management
                    </p>
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
                    <span className="text-sm font-semibold">AI Powers</span>
                    <p className="text-xs text-muted-foreground">
                      Advanced automation features
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Editor Layout */}
        <div className="flex-1 flex">
          {/* Workflow Canvas */}
          <div className={cn("flex-1 relative transition-all duration-300", rightPanelOpen && "mr-96")}>
            <WorkflowCanvas />
          </div>

          {/* AI-Integrated Right Panel */}
          {rightPanelOpen && (
            <div className="fixed right-0 top-[140px] bottom-0 w-96 border-l bg-card/50 backdrop-blur-sm z-20">
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

                {/* AI Tabs */}
                <Tabs value={activeAITab} onValueChange={setActiveAITab} className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
                    <TabsTrigger value="assistant" className="text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Assistant
                    </TabsTrigger>
                    <TabsTrigger value="skills" className="text-xs">
                      <Settings className="h-3 w-3 mr-1" />
                      Skills
                    </TabsTrigger>
                    <TabsTrigger value="credentials" className="text-xs">
                      <KeyRound className="h-3 w-3 mr-1" />
                      Keys
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Insights
                    </TabsTrigger>
                  </TabsList>

                  {/* AI Assistant Tab */}
                  <TabsContent value="assistant" className="flex-1 flex flex-col m-0 p-4 pt-0">
                    <div className="flex-1 flex flex-col">
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
                  </TabsContent>

                  {/* Agent Skills Tab */}
                  <TabsContent value="skills" className="flex-1 m-0 p-4 pt-0">
                    <ScrollArea className="h-full">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">AI Agent Skills</h4>
                            <p className="text-xs text-muted-foreground">Configure what your AI can do</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => setShowAddToolDialog(true)}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>

                        {isLoading ? (
                          <div className="text-center py-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Loading skills...
                          </div>
                        ) : configuredSkillsByService.size > 0 ? (
                          <div className="space-y-4">
                            {Array.from(configuredSkillsByService.entries()).map(([service, tools]) => (
                              <div key={service}>
                                <h5 className="text-sm font-semibold text-muted-foreground mb-2">{service}</h5>
                                <div className="space-y-2">
                                  {tools.map((tool) => (
                                    <div key={tool.name} className="flex items-start gap-3 p-3 border rounded-lg bg-background/50 hover:bg-muted/50">
                                      <div className="p-1.5 bg-muted rounded-md mt-0.5">
                                        <tool.icon className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{tool.name}</p>
                                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                                      </div>
                                      <Button variant="ghost" size="sm" onClick={() => handleToolToggle(tool, false)} className="h-6 w-6 p-0 shrink-0">
                                        <X className="h-3 w-3 text-destructive" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-sm text-muted-foreground">
                            <Settings className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                            <p>No skills configured</p>
                            <p className="text-xs">Add skills to enhance AI capabilities</p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Credentials Tab */}
                  <TabsContent value="credentials" className="flex-1 m-0 p-4 pt-0">
                    <ScrollArea className="h-full">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">Integration Keys</h4>
                            <p className="text-xs text-muted-foreground">Manage API keys and secrets</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => setShowAddCredentialDialog(true)}>
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>

                        <div className="p-3 border rounded-lg bg-blue-500/10 text-blue-800 dark:text-blue-200 text-xs flex items-start gap-2">
                          <Info className="h-3 w-3 mt-0.5 shrink-0" />
                          <p>Credentials are encrypted and referenced as <code className="bg-background/50 px-1 rounded font-mono">{`{{credential.NAME}}`}</code></p>
                        </div>

                        <div className="space-y-2">
                          {isLoading ? (
                            <div className="text-center py-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Loading credentials...
                            </div>
                          ) : credentials.length > 0 ? (
                            credentials.map((cred) => (
                              <div key={cred.id} className="flex items-center gap-3 p-3 border rounded-lg bg-background/50 hover:bg-muted/50">
                                <div className="p-2 bg-muted rounded-md">
                                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate">{cred.name}</p>
                                  <p className="text-xs text-muted-foreground">{cred.service || 'General'}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setCredentialToDeleteId(cred.id)} className="h-6 w-6 p-0">
                                  <Trash2 className="h-3 w-3 text-destructive/80 hover:text-destructive" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-6 text-sm text-muted-foreground">
                              <Key className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                              <p>No credentials saved</p>
                              <p className="text-xs">Add API keys to enable integrations</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* AI Insights Tab */}
                  <TabsContent value="insights" className="flex-1 m-0 p-4 pt-0">
                    <ScrollArea className="h-full">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">Workflow Insights</h4>
                          <p className="text-xs text-muted-foreground">AI-powered recommendations</p>
                        </div>

                        <div className="space-y-3">
                          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <div className="p-1 bg-green-500/20 rounded">
                                  <Lightbulb className="h-3 w-3 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">Performance Optimization</p>
                                  <p className="text-xs text-muted-foreground mt-1">Your workflow could benefit from parallel processing between email and database operations.</p>
                                  <Button size="sm" variant="outline" className="mt-2 h-6 text-xs">Apply Suggestion</Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <div className="p-1 bg-blue-500/20 rounded">
                                  <Shield className="h-3 w-3 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">Error Handling</p>
                                  <p className="text-xs text-muted-foreground mt-1">Consider adding retry logic for external API calls to improve reliability.</p>
                                  <Button size="sm" variant="outline" className="mt-2 h-6 text-xs">Add Error Handling</Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <div className="p-1 bg-purple-500/20 rounded">
                                  <Target className="h-3 w-3 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">Smart Routing</p>
                                  <p className="text-xs text-muted-foreground mt-1">Use conditional logic to route high-priority items to different handlers.</p>
                                  <Button size="sm" variant="outline" className="mt-2 h-6 text-xs">Add Conditions</Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <div className="pt-2">
                            <h5 className="text-sm font-medium mb-2">Workflow Statistics</h5>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Complexity Score</span>
                                <span className="font-medium">Medium</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Estimated Runtime</span>
                                <span className="font-medium">~2.3s</span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Success Rate</span>
                                <span className="font-medium text-green-600">98.5%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
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
              <InteractiveButton variant="outline" size="sm" icon={Code}>
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

      {/* Modals and Dialogs */}
      {showAddToolDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 max-h-96">
            <CardHeader>
              <CardTitle className="text-sm">Add AI Skill</CardTitle>
              <CardDescription>Select capabilities to add to your AI agent</CardDescription>
            </CardHeader>
            <CardContent>
              {unconfiguredToolsByService.size === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-4">All available skills have been added.</p>
              ) : (
                <ScrollArea className="h-48">
                  <div className="space-y-3">
                    {Array.from(unconfiguredToolsByService.entries()).map(([service, tools]) => (
                      <div key={service}>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-1">{service}</h4>
                        {tools.map(tool => (
                          <div key={tool.name} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <div className="flex items-center gap-3">
                              <tool.icon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium text-sm">{tool.name}</p>
                                <p className="text-xs text-muted-foreground">{tool.description}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => { handleToolToggle(tool, true); setShowAddToolDialog(false); }}>
                              Add
                            </Button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
            <CardContent className="pt-0">
              <Button variant="outline" onClick={() => setShowAddToolDialog(false)} className="w-full">
                Done
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {showAddCredentialDialog && (
        <AddCredentialDialog 
          open={showAddCredentialDialog} 
          onOpenChange={setShowAddCredentialDialog}
          onSave={handleCredentialSave}
        />
      )}

      {credentialToDeleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-sm">Delete Credential?</CardTitle>
              <CardDescription>This action cannot be undone. Workflows using this credential will fail.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" onClick={() => setCredentialToDeleteId(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteCredential} className="flex-1">
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </EnhancedAppLayout>
  );
}

// Add Credential Dialog Component
function AddCredentialDialog({ open, onOpenChange, onSave }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  onSave: (name: string, value: string, service?: string) => Promise<boolean>;
}) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [service, setService] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !value.trim()) {
      alert("Name and Value are required.");
      return;
    }
    setIsSaving(true);
    const success = await onSave(name, value, service);
    setIsSaving(false);
    if (success) {
      onOpenChange(false);
      setName('');
      setValue('');
      setService('');
    }
  };
  
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="text-sm">Add New Credential</CardTitle>
          <CardDescription>Save an API key or secret securely</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cred-name" className="text-xs">Name</Label>
            <Input 
              id="cred-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g., MyOpenAIKey" 
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cred-value" className="text-xs">Value</Label>
            <Input 
              id="cred-value" 
              type="password" 
              value={value} 
              onChange={(e) => setValue(e.target.value)} 
              placeholder="Paste your secret value here" 
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cred-service" className="text-xs">Service (Optional)</Label>
            <Input 
              id="cred-service" 
              value={service} 
              onChange={(e) => setService(e.target.value)} 
              placeholder="e.g., OpenAI" 
              className="mt-1"
            />
          </div>
        </CardContent>
        <CardContent className="pt-0 flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(AIWorkflowEditor);