
'use client';

import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { withAuth } from '@/components/auth/with-auth';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Bot, Plus, X, KeyRound, Copy, Check, Info, MoreVertical, Terminal, Send, Workflow, User, Settings, Zap } from 'lucide-react';
import type { McpCommandRecord, Tool, ManagedCredential, DisplayUserApiKey, Workflow as WorkflowType, RequiredCredentialInfo } from '@/types/workflow';
import { getMcpHistory } from '@/services/workflow-storage-service';
import { listCredentialsAction, saveCredentialAction, deleteCredentialAction, generateApiKeyAction, saveAgentConfigAction, getAgentConfigAction, listApiKeysAction, revokeApiKeyAction, agentCommandAction } from '@/app/actions';
import { format, formatDistanceToNow } from 'date-fns';
import { ALL_AVAILABLE_TOOLS } from '@/ai/tools';
import { Label } from '@/components/ui/label';
import { findPlaceholdersInObject } from '@/lib/workflow-utils';
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';

interface CommandMessage extends McpCommandRecord {
    generatedWorkflow?: GenerateWorkflowFromPromptOutput;
}


function MCPDashboardPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('terminal');

  // Terminal State
  const [messages, setMessages] = useState<CommandMessage[]>([]);
  const [commandInput, setCommandInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Skills State
  const [configuredTools, setConfiguredTools] = useState<Tool[]>([]);
  const [showAddToolDialog, setShowAddToolDialog] = useState(false);
  
  // Credentials State
  const [credentials, setCredentials] = useState<Omit<ManagedCredential, 'value'>[]>([]);
  const [showAddCredentialDialog, setShowAddCredentialDialog] = useState(false);
  const [credentialToDeleteId, setCredentialToDeleteId] = useState<string | null>(null);

  // API Key State
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
        toast({ title: 'Error', description: `Failed to load hub data: ${e.message}`, variant: 'destructive' });
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
      user_id: '', // Not needed on client
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


  const requiredCredentials = useMemo(() => {
    const requiredMap = new Map<string, {
        name: string;
        users: string[];
        services: Set<string>;
    }>();

    // 1. Scan nodes for credential placeholders
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

    // 2. Scan AI agent tools for required credentials
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

    // Convert map to array and services Set to array
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
      loadInitialData(); // Re-sync on error
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


  return (
    <AppLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6">
              <h1 className="text-xl font-semibold">AI Agent Hub</h1>
              <TabsList className="grid w-auto grid-cols-2 md:grid-cols-4 h-9">
                <TabsTrigger value="terminal" className="text-xs px-2 sm:px-3"><Terminal className="h-4 w-4 mr-1 sm:mr-1.5" />Terminal</TabsTrigger>
                <TabsTrigger value="skills" className="text-xs px-2 sm:px-3"><Settings className="h-4 w-4 mr-1 sm:mr-1.5" />Skills</TabsTrigger>
                <TabsTrigger value="credentials" className="text-xs px-2 sm:px-3"><KeyRound className="h-4 w-4 mr-1 sm:mr-1.5" />Credentials</TabsTrigger>
                <TabsTrigger value="connect" className="text-xs px-2 sm:px-3"><Zap className="h-4 w-4 mr-1 sm:mr-1.5" />API Access</TabsTrigger>
              </TabsList>
          </header>
          <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/40">
              <div className="max-w-4xl mx-auto grid gap-6">
                  <TabsContent value="terminal" className="m-0 space-y-6">
                    <Card className="h-[75vh] flex flex-col">
                        <CardHeader>
                            <CardTitle>Command Terminal</CardTitle>
                            <CardDescription>Interact directly with your AI Agent.</CardDescription>
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
                  <TabsContent value="skills" className="m-0 space-y-6">
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
                  <TabsContent value="credentials" className="m-0 space-y-6">
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
                  <TabsContent value="connect" className="m-0 space-y-6">
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
                                  {`curl -X POST "${typeof window !== 'undefined' ? window.location.origin : ''}/api/mcp" \\
-H "Authorization: Bearer YOUR_API_KEY" \\
-H "Content-Type: application/json" \\
-d '{"command": "Generate a workflow to get the weather and email it."}'`}
                              </pre>
                          </CardContent>
                      </Card>
                  </TabsContent>
              </div>
          </div>
      </Tabs>
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


export default withAuth(MCPDashboardPage);
