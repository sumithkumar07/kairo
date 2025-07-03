
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, History, Zap, Plus, X, CheckCircle2, XCircle, Loader2, KeyRound, Copy, Check, Info, Trash2 } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/app-layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { McpCommandRecord, Tool, ManagedCredential } from '@/types/workflow';
import { getMcpHistory, getAgentConfig, saveAgentConfig } from '@/services/workflow-storage-service';
import { listCredentialsAction, saveCredentialAction, deleteCredentialAction } from '@/app/actions';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withAuth } from '@/components/auth/with-auth';
import { ALL_AVAILABLE_TOOLS } from '@/ai/tools';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { findPlaceholdersInObject } from '@/lib/workflow-utils';
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';

interface RequiredCredentialInfo {
  name: string;
  nodes: string[];
  service: string;
}

function MCPDashboardPage() {
  const { toast } = useToast();

  const [configuredTools, setConfiguredTools] = useState<Tool[]>([]);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [commandHistory, setCommandHistory] = useState<McpCommandRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showAddToolDialog, setShowAddToolDialog] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // New state for credentials
  const [credentials, setCredentials] = useState<Omit<ManagedCredential, 'value'>[]>([]);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(true);
  const [showAddCredentialDialog, setShowAddCredentialDialog] = useState(false);
  const [credentialToDeleteId, setCredentialToDeleteId] = useState<string | null>(null);

  const requiredCredentials = useMemo(() => {
    const requiredMap = new Map<string, RequiredCredentialInfo>();
    
    AVAILABLE_NODES_CONFIG.forEach(node => {
        const placeholders = findPlaceholdersInObject({ config: node.defaultConfig, inputMapping: {} });
        placeholders.secrets.forEach(secretName => {
            if (!requiredMap.has(secretName)) {
                requiredMap.set(secretName, {
                    name: secretName,
                    nodes: [],
                    service: node.name.split(':')[0] // Simple service name from node name
                });
            }
            const info = requiredMap.get(secretName)!;
            if (!info.nodes.includes(node.name)) {
                info.nodes.push(node.name);
            }
        });
    });

    return Array.from(requiredMap.values());
  }, []);


  const loadAgentConfig = useCallback(async () => {
    setIsLoadingConfig(true);
    try {
      const config = await getAgentConfig();
      const enabledTools = ALL_AVAILABLE_TOOLS.filter(tool => config.enabledTools.includes(tool.name));
      setConfiguredTools(enabledTools);
    } catch (e: any) {
      toast({ title: 'Error', description: 'Could not load agent skill configuration.', variant: 'destructive' });
    } finally {
      setIsLoadingConfig(false);
    }
  }, [toast]);
  
  const loadCredentials = useCallback(async () => {
    setIsLoadingCredentials(true);
    try {
        const creds = await listCredentialsAction();
        setCredentials(creds);
    } catch (e: any) {
        toast({ title: 'Error Loading Credentials', description: e.message, variant: 'destructive' });
    } finally {
        setIsLoadingCredentials(false);
    }
  }, [toast]);

  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const history = await getMcpHistory();
      setCommandHistory(history);
    } catch (e: any) {
      toast({ title: 'Error', description: 'Could not load command history.', variant: 'destructive' });
      setCommandHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAgentConfig();
    loadCredentials();
    loadHistory();
  }, [toast, loadAgentConfig, loadCredentials, loadHistory]);
  
  const unconfiguredTools = useMemo(() => {
    const configuredToolNames = new Set(configuredTools.map(t => t.name));
    return ALL_AVAILABLE_TOOLS.filter(t => !configuredToolNames.has(t.name));
  }, [configuredTools]);

  const handleToolToggle = useCallback(async (tool: Tool, isAdding: boolean) => {
    const updatedToolNames = isAdding
      ? [...configuredTools.map(t => t.name), tool.name]
      : configuredTools.map(t => t.name).filter(name => name !== tool.name);
    
    try {
      await saveAgentConfig({ enabledTools: updatedToolNames });
      const newConfiguredTools = ALL_AVAILABLE_TOOLS.filter(t => updatedToolNames.includes(t.name));
      setConfiguredTools(newConfiguredTools);
      toast({ title: isAdding ? 'Skill Added' : 'Skill Removed', description: `"${tool.name}" has been ${isAdding ? 'added to' : 'removed from'} your agent.` });
    } catch (e: any) {
      toast({ title: 'Error Saving Config', description: 'Could not save the agent skill configuration.', variant: 'destructive' });
      // Revert UI on failure
      loadAgentConfig();
    }
  }, [configuredTools, toast, loadAgentConfig]);

  const handleGenerateKey = () => {
    setApiKey(`kairo_sk_${crypto.randomUUID().replace(/-/g, '')}`);
    setIsCopied(false);
    toast({ title: 'API Key Generated', description: 'Your new API key is ready to be used.' });
  };

  const handleCopyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);
    toast({ title: 'Copied to Clipboard!', description: 'The API key has been copied.' });
    setTimeout(() => setIsCopied(false), 2000);
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

  const getStatusIndicator = (status: 'Success' | 'Failed') => {
      const styles = {
          Success: { Icon: CheckCircle2, color: 'text-green-500' },
          Failed: { Icon: XCircle, color: 'text-destructive' }
      };
      const { Icon, color } = styles[status];
      return <Icon className={cn("h-4 w-4 shrink-0", color)} title={status}/>;
  };

  return (
    <AppLayout>
      <Tabs defaultValue="skills" className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:px-6">
              <h1 className="text-xl font-semibold">AI Agent Hub</h1>
              <TabsList className="grid w-auto grid-cols-2 md:grid-cols-4 h-9">
                <TabsTrigger value="skills" className="text-xs px-2 sm:px-3"><Settings className="h-4 w-4 mr-1 sm:mr-1.5" />Skills</TabsTrigger>
                <TabsTrigger value="credentials" className="text-xs px-2 sm:px-3"><KeyRound className="h-4 w-4 mr-1 sm:mr-1.5" />Credentials</TabsTrigger>
                <TabsTrigger value="connect" className="text-xs px-2 sm:px-3"><Zap className="h-4 w-4 mr-1 sm:mr-1.5" />API Access</TabsTrigger>
                <TabsTrigger value="history" className="text-xs px-2 sm:px-3"><History className="h-4 w-4 mr-1 sm:mr-1.5" />API History</TabsTrigger>
              </TabsList>
          </header>
          <div className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/40">
              <div className="max-w-4xl mx-auto grid gap-6">
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
                              <div className="space-y-2">
                                  {isLoadingConfig ? (
                                    <div className="text-center py-6 text-sm text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" />Loading skills...</div>
                                  ) : configuredTools.length > 0 ? (
                                      configuredTools.map((tool) => (
                                          <div key={tool.name} className="flex items-center gap-4 p-2 border rounded-lg bg-background hover:bg-muted/50">
                                              <div className="p-1 bg-muted rounded-md">
                                                  <tool.icon className="h-5 w-5 text-muted-foreground" />
                                              </div>
                                              <div className="flex-1">
                                                  <p className="font-medium text-sm">{tool.name}</p>
                                              </div>
                                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleToolToggle(tool, false)}>
                                                  <X className="h-4 w-4 text-destructive" />
                                              </Button>
                                          </div>
                                      ))
                                  ) : (
                                  <div className="text-center py-6 text-sm text-muted-foreground">No skills configured. Click "Add Skill" to get started.</div>
                                  )}
                              </div>
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
                                {isLoadingCredentials ? (
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
                            <CardDescription>A guide to credentials used by nodes in the Node Library.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {requiredCredentials.map(info => (
                                    <div key={info.name} className="p-3 border rounded-lg bg-muted/30">
                                        <p className="font-semibold text-sm text-foreground">{info.service}</p>
                                        <p className="text-xs text-muted-foreground mb-1.5">Used by: {info.nodes.join(', ')}</p>
                                        <p className="text-sm">
                                            Create a credential named <code className="text-xs bg-background p-1 rounded font-mono text-amber-600 dark:text-amber-400">{info.name}</code> to use this integration.
                                        </p>
                                    </div>
                                ))}
                                {requiredCredentials.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No nodes require credentials.</p>}
                            </div>
                        </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="connect" className="m-0">
                      <Card>
                          <CardHeader>
                              <CardTitle>Programmatic API Access</CardTitle>
                              <CardDescription>Use this information to control your Kairo AI Agent from your own applications via its API.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-6">
                              <div>
                                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Agent API Endpoint</div>
                                  <pre className="mt-1 text-sm p-2 bg-muted rounded-md font-mono">/api/mcp</pre>
                              </div>
                              
                              <div>
                                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><KeyRound className="h-3.5 w-3.5"/>Authentication & Usage</div>
                                  <p className="text-sm mt-2 text-muted-foreground">Generate a unique API key for your agent. For this prototype, after generating a key, you must set it as an environment variable named <code className="text-xs bg-muted p-1 rounded font-mono">KAIRO_MCP_API_KEY</code> on the server. The key must be sent in the <code className="text-xs bg-muted p-1 rounded font-mono">Authorization</code> header as <code className="text-xs bg-muted p-1 rounded font-mono">Bearer YOUR_API_KEY</code>.</p>
                                  <div className="mt-4">
                                    {!apiKey ? (
                                        <Button onClick={handleGenerateKey}><KeyRound className="h-4 w-4 mr-2" />Generate API Key</Button>
                                    ) : (
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
                                            <pre className="text-sm font-mono flex-1 truncate">{apiKey}</pre>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyKey}>
                                              {isCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                            </Button>
                                          </div>
                                          <Button variant="destructive" size="sm" onClick={handleGenerateKey}>Revoke &amp; Regenerate Key</Button>
                                        </div>
                                    )}
                                  </div>
                              </div>
                              <div className="space-y-2">
                                <div className="text-sm font-medium">API Examples</div>
                                <Tabs defaultValue="curl" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 h-9">
                                        <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
                                        <TabsTrigger value="fetch" className="text-xs">JavaScript Fetch</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="curl">
                                        <pre className="text-xs p-3 bg-muted rounded-md font-mono whitespace-pre-wrap overflow-x-auto">
                                            {`curl -X POST "http://localhost:3000/api/mcp" \\
-H "Authorization: Bearer ${apiKey || 'YOUR_KAIRO_MCP_API_KEY'}" \\
-H "Content-Type: application/json" \\
-d '{"command": "Generate a workflow to get the weather and email it."}'`}
                                        </pre>
                                    </TabsContent>
                                    <TabsContent value="fetch">
                                        <pre className="text-xs p-3 bg-muted rounded-md font-mono whitespace-pre-wrap overflow-x-auto">
                                            {`const response = await fetch('http://localhost:3000/api/mcp', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer ${apiKey || 'YOUR_KAIRO_MCP_API_KEY'}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    command: 'Generate a workflow to get the weather and email it.'
  })
});

const data = await response.json();
console.log(data);`}
                                        </pre>
                                    </TabsContent>
                                </Tabs>
                              </div>
                          </CardContent>
                      </Card>
                  </TabsContent>
                  <TabsContent value="history" className="m-0">
                      <Card>
                          <CardHeader>
                              <CardTitle>API Command History</CardTitle>
                              <CardDescription>A log of commands sent to the AI agent via its API endpoint.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              {isLoadingHistory ? (
                                  <div className="text-center py-12"><Loader2 className="h-8 w-8 text-primary mx-auto animate-spin" /></div>
                              ) : commandHistory.length === 0 ? (
                                  <div className="text-center text-muted-foreground text-sm py-12">
                                  <History className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                  Command history will appear here once you use the API endpoint.
                                  </div>
                              ) : (
                                  <ScrollArea className="h-96">
                                      <div className="space-y-4">
                                      {commandHistory.map(record => (
                                          <div key={record.id} className="p-3 border rounded-lg bg-muted/30">
                                          <div className="flex justify-between items-start">
                                              <div className="flex-1">
                                              <p className="text-sm font-mono text-foreground font-semibold">
                                                  <span className="text-primary">&gt;</span> {record.command}
                                              </p>
                                              <p className="text-sm text-muted-foreground mt-1.5 whitespace-pre-wrap">{record.response}</p>
                                              </div>
                                              <div className="flex items-center gap-2 text-xs text-muted-foreground ml-4 shrink-0">
                                              {getStatusIndicator(record.status)}
                                              <span title={new Date(record.timestamp).toLocaleString()}>
                                                  {formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })}
                                              </span>
                                              </div>
                                          </div>
                                          </div>
                                      ))}
                                      </div>
                                  </ScrollArea>
                              )}
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
              {unconfiguredTools.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-4">All available skills have been added.</p>
              ) : (
                <ScrollArea className="h-64 border rounded-md">
                    <div className="p-2 space-y-1">
                      {unconfiguredTools.map(tool => (
                        <div key={tool.name} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                          <div className="flex items-center gap-3">
                            <tool.icon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{tool.name}</p>
                              <p className="text-xs text-muted-foreground">{tool.service}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleToolToggle(tool, true)}>Add</Button>
                        </div>
                      ))}
                    </div>
                </ScrollArea>
              )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="default">Done</Button></DialogClose>
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
                loadCredentials();
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
            Save an API key or other secret. It will be stored in the database.
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
          <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
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
