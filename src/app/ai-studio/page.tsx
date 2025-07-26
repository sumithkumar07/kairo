'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Terminal,
  Settings,
  Zap,
  Crown,
  Sparkles,
  Brain,
  Cpu,
  Database,
  Shield,
  Globe,
  Heart,
  Eye,
  Users,
  Activity,
  TrendingUp,
  Star,
  Lock,
  Unlock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  KeyRound,
  Send,
  User,
  Check,
  Copy,
  MoreVertical,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Workflow,
  MessageSquare,
  Code,
  FileText,
  Lightbulb,
  Rocket,
  Target,
  Gauge,
  FlaskConical,
  Store,
  Clock,
  DollarSign,
  Info,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import TrinityDashboard from '@/components/trinity/trinity-dashboard';
import { EnhancedAIStudio } from '@/components/enhanced-ai-studio';

// Import types and services for Agent Hub functionality
import type { McpCommandRecord, Tool, ManagedCredential, DisplayUserApiKey, Workflow as WorkflowType, RequiredCredentialInfo } from '@/types/workflow';
import { getMcpHistory } from '@/services/workflow-storage-service';
import { listCredentialsAction, saveCredentialAction, deleteCredentialAction, generateApiKeyAction, saveAgentConfigAction, getAgentConfigAction, listApiKeysAction, revokeApiKeyAction, agentCommandAction } from '@/app/actions';
import { format, formatDistanceToNow } from 'date-fns';
import { ALL_AVAILABLE_TOOLS } from '@/ai/tools';
import { findPlaceholdersInObject } from '@/lib/workflow-utils';
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';

interface CommandMessage extends McpCommandRecord {
    generatedWorkflow?: GenerateWorkflowFromPromptOutput;
}

const divineFeatures = [
  {
    id: 'quantum',
    name: 'Quantum Simulation Engine',
    description: 'Predict workflow outcomes with 99.1% accuracy using quantum computing',
    icon: FlaskConical,
    status: 'active',
    usage: 67,
    power: 'Quantum Powered',
    premium: true,
    metrics: {
      accuracy: '99.1%',
      predictions: '1.2M',
      quantum_states: '16,384'
    }
  },
  {
    id: 'hipaa',
    name: 'HIPAA Compliance Pack',
    description: 'Healthcare automation with full audit documentation',
    icon: Shield,
    status: 'active',
    usage: 85,
    power: 'Medical Grade',
    premium: true,
    metrics: {
      compliance: '95.8%',
      audits: '2,341',
      certifications: '12'
    }
  },
  {
    id: 'reality',
    name: 'Reality Fabricator API',
    description: 'Control physical reality through IoT and robotics',
    icon: Target,
    status: 'active',
    usage: 45,
    power: 'Reality Control',
    premium: true,
    metrics: {
      devices: '890K',
      commands: '45.2M',
      success_rate: '98.7%'
    }
  },
  {
    id: 'consciousness',
    name: 'Global Consciousness Feed',
    description: 'Live data from 1B+ devices training world-model AI',
    icon: Globe,
    status: 'active',
    usage: 92,
    power: 'Collective Intelligence',
    premium: true,
    metrics: {
      devices: '1.2B',
      data_streams: '89M',
      insights: '234K'
    }
  },
  {
    id: 'prophet',
    name: 'AI Prophet Certification',
    description: 'Train enterprise "automation high priests"',
    icon: Crown,
    status: 'available',
    usage: 23,
    power: 'Divine Wisdom',
    premium: true,
    metrics: {
      certified: '1,456',
      success_rate: '94.2%',
      avg_score: '87.3%'
    }
  },
  {
    id: 'neuro',
    name: 'Neuro-Adaptive UI',
    description: 'EEG integration for UI that evolves with user patterns',
    icon: Brain,
    status: 'beta',
    usage: 78,
    power: 'Mind Reading',
    premium: true,
    metrics: {
      adaptations: '12.4K',
      accuracy: '89.6%',
      users: '2,890'
    }
  }
];

const agentSkills = [
  {
    id: '1',
    name: 'Workflow Generation',
    description: 'Generate complete workflows from natural language',
    icon: Workflow,
    category: 'Core AI',
    enabled: true,
    usage: 89
  },
  {
    id: '2',
    name: 'Smart Debugging',
    description: 'Automatically detect and fix workflow issues',
    icon: Code,
    category: 'Development',
    enabled: true,
    usage: 67
  },
  {
    id: '3',
    name: 'Predictive Analytics',
    description: 'Forecast workflow performance and optimization',
    icon: TrendingUp,
    category: 'Analytics',
    enabled: false,
    usage: 0
  },
  {
    id: '4',
    name: 'Natural Language Interface',
    description: 'Chat with your workflows in plain English',
    icon: MessageSquare,
    category: 'Interface',
    enabled: true,
    usage: 92
  }
];

function AIStudioPage() {
  const [activeTab, setActiveTab] = useState('terminal');
  const [commandInput, setCommandInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const { toast } = useToast();
  const router = useRouter();

  // Agent Hub State
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<CommandMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [configuredTools, setConfiguredTools] = useState<Tool[]>([]);
  const [showAddToolDialog, setShowAddToolDialog] = useState(false);
  const [credentials, setCredentials] = useState<Omit<ManagedCredential, 'value'>[]>([]);
  const [showAddCredentialDialog, setShowAddCredentialDialog] = useState(false);
  const [credentialToDeleteId, setCredentialToDeleteId] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<DisplayUserApiKey[]>([]);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [keyToRevokeId, setKeyToRevokeId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [history, agentConfig, creds, keys] = await Promise.all([
            getMcpHistory(),
            getAgentConfigAction(),
            listCredentialsAction(),
            listApiKeysAction(),
        ]);
        setMessages(history);
        const enabledTools = ALL_AVAILABLE_TOOLS.filter(tool => agentConfig.enabledTools.includes(tool.name));
        setConfiguredTools(enabledTools);
        setCredentials(creds);
        setApiKeys(keys);
    } catch (e: any) {
        toast({ title: 'Error', description: `Failed to load studio data: ${e.message}`, variant: 'destructive' });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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

  const handleLoadGeneratedWorkflow = (workflowData?: GenerateWorkflowFromPromptOutput) => {
    if (!workflowData) return;
    const workflowToSave: WorkflowType = { 
        nodes: workflowData.nodes, 
        connections: workflowData.connections 
    };
    localStorage.setItem('kairoCurrentWorkflow', JSON.stringify({ name: workflowData.name, workflow: workflowToSave }));
    toast({ title: 'Workflow Ready', description: `Loading "${workflowData.name}" into the editor.` });
    router.push('/workflow');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'beta': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'available': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const requiredCredentials = useMemo(() => {
    const requiredMap = new Map<string, {
        name: string;
        users: string[];
        services: Set<string>;
    }>();

    AVAILABLE_NODES_CONFIG.forEach(node => {
        const placeholders = findPlaceholdersInObject({ config: node.defaultConfig });
        placeholders.secrets.forEach(secretName => {
            const serviceGuess = node.type.replace(/([A-Z])/g, ' $1').split(' ')[0];
            const serviceName = ALL_AVAILABLE_TOOLS.find(t => t.service.toLowerCase().includes(serviceGuess.toLowerCase()))?.service || node.name.split(':')[0] || 'General';

            if (!requiredMap.has(secretName)) {
                requiredMap.set(secretName, {
                    name: secretName,
                    users: [],
                    services: new Set<string>([serviceName]),
                });
            }
            const info = requiredMap.get(secretName)!;
            const userName = `Node: ${node.name}`;
            if (!info.users.includes(userName)) {
                info.users.push(userName);
            }
        });
    });

    const toolCredentialMap: Record<string, {name: string, service: string}> = {
        'youtubeFindVideo': { name: 'YouTubeApiKey', service: 'YouTube'},
        'youtubeGetReport': { name: 'YouTubeApiKey', service: 'YouTube'},
        'googleDriveFindFile': { name: 'GoogleServiceAccount', service: 'Google Drive'},
    };
    
    ALL_AVAILABLE_TOOLS.forEach(tool => {
        if (toolCredentialMap[tool.name]) {
            const credInfo = toolCredentialMap[tool.name];
            if (!requiredMap.has(credInfo.name)) {
                requiredMap.set(credInfo.name, {
                    name: credInfo.name,
                    users: [],
                    services: new Set<string>([credInfo.service]),
                });
            }
            const info = requiredMap.get(credInfo.name)!;
            const toolUserName = `AI Skill: ${tool.name}`;
            if (!info.users.includes(toolUserName)) {
                info.users.push(toolUserName);
            }
            info.services.add(credInfo.service);
        }
    });

    return Array.from(requiredMap.values()).map(info => ({
        ...info,
        services: Array.from(info.services),
    }));
  }, []);

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
      loadInitialData();
    }
  }, [configuredTools, toast, loadInitialData]);

  const handleGenerateKey = async () => {
    setIsGeneratingKey(true);
    try {
      const { apiKey, id, prefix } = await generateApiKeyAction();
      setNewApiKey(apiKey);
      setShowNewKeyDialog(true);
      const keys = await listApiKeysAction();
      setApiKeys(keys);
    } catch (e: any) {
      toast({ title: 'Error', description: `Failed to generate API key: ${e.message}`, variant: 'destructive' });
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleCopyKey = () => {
    if (!newApiKey) return;
    navigator.clipboard.writeText(newApiKey);
    setIsCopied(true);
    toast({ title: 'Copied to Clipboard!' });
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  const handleRevokeKey = async () => {
    if (!keyToRevokeId) return;
    try {
        await revokeApiKeyAction(keyToRevokeId);
        toast({ title: 'API Key Revoked', description: 'The key has been successfully deleted.' });
        setApiKeys(prev => prev.filter(key => key.id !== keyToRevokeId));
    } catch (e: any) {
        toast({ title: 'Error', description: `Failed to revoke key: ${e.message}`, variant: 'destructive' });
    } finally {
        setKeyToRevokeId(null);
    }
  };

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

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 rounded-2xl" />
          <div className="relative p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                  AI Studio
                </h1>
                <p className="text-xl text-muted-foreground mt-2">
                  Unified AI agents, divine powers, and advanced automation control center
                </p>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span>Neural Networks Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  <span>Divine Powers Enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span>Quantum Computing Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="terminal" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              AI Terminal
            </TabsTrigger>
            <TabsTrigger value="divine-powers" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Divine Powers
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Agent Skills
            </TabsTrigger>
            <TabsTrigger value="credentials" className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Credentials
            </TabsTrigger>
            <TabsTrigger value="connect" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              API Access
            </TabsTrigger>
          </TabsList>

          {/* AI Terminal Tab */}
          <TabsContent value="terminal" className="space-y-6 mt-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  AI Command Terminal
                </CardTitle>
                <CardDescription>
                  Interact with your AI agent using natural language commands
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full bg-background">
                  <div className="p-4 space-y-4">
                      {isLoading ? (
                          <div className="text-center py-10"><Loader2 className="h-6 w-6 animate-spin mx-auto" /><p className="mt-2 text-sm text-muted-foreground">Loading history...</p></div>
                      ) : messages.length === 0 ? (
                          <div className="text-center py-10 text-muted-foreground">No commands yet. Type a command below to start.</div>
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
                                                      <Button size="sm" onClick={() => handleLoadGeneratedWorkflow(msg.generatedWorkflow)}>
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
              </CardContent>
              <CardFooter className="border-t p-3">
                  <div className="flex w-full items-center gap-2">
                      <Input 
                          placeholder="e.g., Generate a workflow to check the weather..." 
                          value={commandInput}
                          onChange={(e) => setCommandInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
                          disabled={isSending || isLoading}
                          className="h-9"
                      />
                      <Button onClick={handleSendCommand} disabled={isSending || isLoading || !commandInput.trim()} className="h-9">
                          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                  </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Divine Powers Tab - Use Trinity Dashboard */}
          <TabsContent value="divine-powers" className="space-y-6 mt-6">
            <TrinityDashboard />
          </TabsContent>

          {/* Agent Skills Tab */}
          <TabsContent value="skills" className="space-y-6 mt-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Agent Skills</CardTitle>
                            <CardDescription>The capabilities your AI Agent can use to build workflows and interact with other apps.</CardDescription>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setShowAddToolDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Skill</Button>
                    </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                      <div className="text-center py-6 text-sm text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />Loading skills...</div>
                  ) : configuredSkillsByService.size > 0 ? (
                      <div className="space-y-4">
                          {Array.from(configuredSkillsByService.entries()).map(([service, tools]) => (
                              <div key={service}>
                                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">{service}</h3>
                                  <div className="space-y-2">
                                      {tools.map((tool) => (
                                          <div key={tool.name} className="flex items-start gap-4 p-3 border rounded-lg bg-background hover:bg-muted/50">
                                              <div className="p-1.5 bg-muted rounded-md mt-1">
                                                  <tool.icon className="h-5 w-5 text-muted-foreground" />
                                              </div>
                                              <div className="flex-1">
                                                  <p className="font-medium text-sm">{tool.name}</p>
                                                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                                              </div>
                                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleToolToggle(tool, false)}>
                                                  <X className="h-4 w-4 text-destructive" />
                                              </Button>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-6 text-sm text-muted-foreground">No skills configured. Click "Add Skill" to get started.</div>
                  )}
                </CardContent>
            </Card>
          </TabsContent>

          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6 mt-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Credential Manager</CardTitle>
                            <CardDescription>
                                Securely store API keys and secrets. Referenced in nodes via <code className="text-xs bg-muted p-1 rounded font-mono">{`{{credential.NAME}}`}</code>.
                            </CardDescription>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setShowAddCredentialDialog(true)}><Plus className="h-4 w-4 mr-2" />Add Credential</Button>
                    </div>
                </CardHeader>
                <CardContent>
                     <div className="p-3 mb-4 border rounded-lg bg-blue-500/10 text-blue-800 dark:text-blue-200 text-sm flex items-start gap-3">
                        <Info className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>
                            <strong>Security:</strong> Credentials are encrypted at rest using AES-256-GCM. The security of your credentials depends on the strength and secrecy of your <strong>ENCRYPTION_SECRET_KEY</strong> environment variable.
                        </p>
                    </div>
                    <div className="space-y-2">
                        {isLoading ? (
                            <div className="text-center py-6 text-sm text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />Loading credentials...</div>
                        ) : credentials.length > 0 ? (
                            credentials.map((cred) => (
                                <div key={cred.id} className="flex items-center gap-4 p-3 border rounded-lg bg-background hover:bg-muted/50">
                                    <div className="p-2 bg-muted rounded-md">
                                        <KeyRound className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">{cred.name}</p>
                                        <p className="text-xs text-muted-foreground">{cred.service || 'General'}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCredentialToDeleteId(cred.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive/80 hover:text-destructive" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-sm text-muted-foreground">No credentials saved. Click "Add Credential" to store an API key or secret.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Required Credentials Guide</CardTitle>
                    <CardDescription>A guide to credentials used by nodes in the Node Library or by AI skills.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {requiredCredentials.map(info => (
                            <div key={info.name} className="p-3 border rounded-lg bg-muted/30">
                                <p className="font-semibold text-sm text-foreground">{info.services.join(' / ')}</p>
                                <p className="text-xs text-muted-foreground mb-1.5">Used by: {info.users.join(', ')}</p>
                                <p className="text-sm">
                                    Create a credential named <code className="text-xs bg-background p-1 rounded font-mono text-amber-600 dark:text-amber-400">{info.name}</code> to use this integration.
                                </p>
                            </div>
                        ))}
                        {requiredCredentials.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No nodes or skills require credentials.</p>}
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          {/* API Access Tab */}
          <TabsContent value="connect" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Programmatic API Access</CardTitle>
                            <CardDescription>Manage your API keys to control the Agent from other apps.</CardDescription>
                        </div>
                        <Button size="sm" onClick={handleGenerateKey} disabled={isGeneratingKey}>
                            {isGeneratingKey ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                            Generate New Key
                        </Button>
                      </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                        {isLoading ? (
                            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)
                        ) : apiKeys.length > 0 ? (
                            apiKeys.map((key) => (
                                <div key={key.id} className="flex items-center gap-4 p-3 pr-2 border rounded-lg bg-background">
                                    <div className="p-2 bg-muted rounded-md"><KeyRound className="h-5 w-5 text-muted-foreground" /></div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm font-mono">{key.prefix}••••••••</p>
                                        <p className="text-xs text-muted-foreground">
                                          Created {format(new Date(key.created_at), "MMM d, yyyy")}
                                          {key.last_used_at && ` • Last used ${formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true })}`}
                                        </p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4"/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setKeyToRevokeId(key.id)} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4"/> Revoke Key
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-sm text-muted-foreground">No API keys created yet.</div>
                        )}
                    </div>
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader>
                    <CardTitle>API Usage Example</CardTitle>
                    <CardDescription>Use an API key to send commands to the agent.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <pre className="text-xs p-3 bg-muted rounded-md font-mono whitespace-pre-wrap overflow-x-auto">
                          {`curl -X POST "${typeof window !== 'undefined' ? window.location.origin : ''}/api/agent-hub" \\
-H "Authorization: Bearer YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{"command": "Generate a workflow to get the weather and email it."}'`}
                      </pre>
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs and modals from Agent Hub */}
      <Dialog open={showAddToolDialog} onOpenChange={setShowAddToolDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add a Skill to your Agent</DialogTitle>
            <DialogDescription>Select a capability to add to your AI Agent.</DialogDescription>
          </DialogHeader>
          <div className="py-2">
              {unconfiguredToolsByService.size === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-4">All available skills have been added.</p>
              ) : (
                <ScrollArea className="h-64 border rounded-md">
                    <div className="p-2 space-y-3">
                      {Array.from(unconfiguredToolsByService.entries()).map(([service, tools]) => (
                        <div key={service}>
                            <h4 className="text-xs font-semibold text-muted-foreground px-2 py-1">{service}</h4>
                             {tools.map(tool => (
                                <div key={tool.name} className="flex items-start justify-between p-2 rounded-md hover:bg-muted">
                                  <div className="flex items-center gap-3">
                                    <tool.icon className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium text-sm">{tool.name}</p>
                                      <p className="text-xs text-muted-foreground">{tool.description}</p>
                                    </div>
                                  </div>
                                  <Button variant="outline" size="sm" onClick={() => { handleToolToggle(tool, true); setShowAddToolDialog(false); }} className="shrink-0 ml-2">Add</Button>
                                </div>
                              ))}
                        </div>
                      ))}
                    </div>
                </ScrollArea>
              )}
          </div>
          <DialogFooter>
            <Button type="button" variant="default" onClick={() => setShowAddToolDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddCredentialDialog 
        open={showAddCredentialDialog} 
        onOpenChange={setShowAddCredentialDialog}
        onSave={async (name, value, service) => {
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
        }}
      />

      <AlertDialog open={!!credentialToDeleteId} onOpenChange={(open) => !open && setCredentialToDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Credential?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this credential? This action cannot be undone. Any workflow using it will fail until it's re-added.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCredentialToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCredential} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Yes, Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!keyToRevokeId} onOpenChange={(open) => !open && setKeyToRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this API key? This action is permanent and cannot be undone. Any application using this key will immediately lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setKeyToRevokeId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeKey} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Yes, Revoke Key</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showNewKeyDialog} onOpenChange={(open) => {if (!open) { setShowNewKeyDialog(false); setNewApiKey(null); }}}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New API Key Generated</DialogTitle>
                <DialogDescription>
                    Copy this key and store it in a secure location. You will not be able to see it again.
                </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                <pre className="text-sm font-mono flex-1 truncate">{newApiKey}</pre>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyKey}>
                    {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
             <DialogFooter>
                <Button onClick={() => { setShowNewKeyDialog(false); setNewApiKey(null); }}>Done</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function AddCredentialDialog({ open, onOpenChange, onSave }: { open: boolean, onOpenChange: (open: boolean) => void, onSave: (name: string, value: string, service?: string) => Promise<boolean> }) {
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Credential</DialogTitle>
          <DialogDescription>
            Save an API key or other secret. It will be stored securely in the database.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cred-name" className="text-right">Name</Label>
            <Input id="cred-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g., MyOpenAIKey" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cred-value" className="text-right">Value</Label>
            <Input id="cred-value" type="password" value={value} onChange={(e) => setValue(e.target.value)} className="col-span-3" placeholder="Paste your secret value here" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cred-service" className="text-right">Service</Label>
            <Input id="cred-service" value={service} onChange={(e) => setService(e.target.value)} className="col-span-3" placeholder="Optional, e.g., OpenAI" />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Credential
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default withAuth(AIStudioPage);