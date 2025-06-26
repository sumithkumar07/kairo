
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, History, Zap, Plus, X, CheckCircle2, XCircle, Loader2, KeyRound, Copy, Check, MessageSquare, CreditCard, Github, UserPlus, Smartphone, Sheet as SheetIcon, UploadCloud, Bot as BotIcon, Cpu, FileLock2, Info } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils';
import { AppLayout } from '@/components/app-layout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { McpCommandRecord } from '@/types/workflow';
import { getMcpHistory } from '@/services/workflow-storage-service';
import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withAuth } from '@/components/auth/with-auth';
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';

type Tool = { name: string; description: string; icon: React.ElementType; service: string; };

const ALL_AVAILABLE_TOOLS: Tool[] = AVAILABLE_NODES_CONFIG
  .filter(node => node.category === 'integrations' || ['httpRequest', 'aiTask', 'databaseQuery', 'sendEmail'].includes(node.type))
  .map(node => ({
    name: node.name,
    description: node.description || 'No description available.',
    icon: node.icon,
    service: node.category === 'integrations' ? (node.name.split(':')[0] || 'Kairo') : 'Kairo Core',
  }));

const INITIAL_TOOLS = ALL_AVAILABLE_TOOLS.slice(0, 3);

const CREDENTIAL_INFO = [
  { name: 'GOOGLE_API_KEY', service: 'Google AI / Genkit', description: 'Required for all AI features like workflow generation, explanation, and the assistant chat. Obtain from Google Cloud Console.' },
  { name: 'SLACK_BOT_TOKEN', service: 'Slack', description: 'Required for the "Post Message" node to send messages to Slack. Starts with "xoxb-".' },
  { name: 'OPENAI_API_KEY', service: 'OpenAI', description: 'Required for the "OpenAI Chat Completion" node. Obtain from your OpenAI account dashboard.' },
  { name: 'GITHUB_TOKEN', service: 'GitHub', description: 'A Personal Access Token (PAT) with "repo" scope, required for the "Create Issue" node.' },
  { name: 'KAIRO_MCP_API_KEY', service: 'Kairo Agent Hub', description: 'A secret key you define and set here, then use for authenticating API requests to the Agent Hub.' },
  { name: 'DB_CONNECTION_STRING', service: 'PostgreSQL', description: 'Connection string for the "Database Query" node, e.g., "postgresql://user:pass@host:port/db".' },
  { name: 'EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM', service: 'Email', description: 'SMTP server details required for the "Send Email" node to work in Live Mode.' },
];


function MCPDashboardPage() {
  const { toast } = useToast();

  const [configuredTools, setConfiguredTools] = useState<Tool[]>(INITIAL_TOOLS);
  const [commandHistory, setCommandHistory] = useState<McpCommandRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showAddToolDialog, setShowAddToolDialog] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
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
    };
    fetchHistory();
  }, [toast]);
  
  const unconfiguredTools = useMemo(() => {
    const configuredToolNames = new Set(configuredTools.map(t => t.name));
    return ALL_AVAILABLE_TOOLS.filter(t => !configuredToolNames.has(t.name));
  }, [configuredTools]);

  const handleAddTool = (tool: Tool) => {
    setConfiguredTools(prev => [...prev, tool]);
    toast({ title: 'Skill Added', description: `"${tool.name}" has been added to your agent.` });
  };
  
  const handleRemoveTool = (toolName: string) => {
    setConfiguredTools(prev => prev.filter(t => t.name !== toolName));
    toast({ title: 'Skill Removed', description: `"${toolName}" has been removed from your agent.` });
  };

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
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/95 backdrop-blur-sm px-6">
              <h1 className="text-xl font-semibold">AI Agent Hub</h1>
              <TabsList className="grid w-auto grid-cols-4 h-9">
                <TabsTrigger value="skills" className="text-xs px-3"><Settings className="h-4 w-4 mr-1.5" />Skills</TabsTrigger>
                <TabsTrigger value="credentials" className="text-xs px-3"><FileLock2 className="h-4 w-4 mr-1.5" />Credentials</TabsTrigger>
                <TabsTrigger value="connect" className="text-xs px-3"><Zap className="h-4 w-4 mr-1.5" />API Access</TabsTrigger>
                <TabsTrigger value="history" className="text-xs px-3"><History className="h-4 w-4 mr-1.5" />API History</TabsTrigger>
              </TabsList>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/40">
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
                                  {configuredTools.map((tool) => (
                                      <div key={tool.name} className="flex items-center gap-4 p-2 border rounded-lg bg-background hover:bg-muted/50">
                                          <div className="p-1 bg-muted rounded-md">
                                              <tool.icon className="h-5 w-5 text-muted-foreground" />
                                          </div>
                                          <div className="flex-1">
                                              <p className="font-medium text-sm">{tool.name}</p>
                                          </div>
                                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveTool(tool.name)}>
                                              <X className="h-4 w-4 text-destructive" />
                                          </Button>
                                      </div>
                                  ))}
                                  {configuredTools.length === 0 && (
                                  <div className="text-center py-6 text-sm text-muted-foreground">No skills configured. Click "Add Skill" to get started.</div>
                                  )}
                              </div>
                          </CardContent>
                      </Card>
                  </TabsContent>
                  <TabsContent value="credentials" className="m-0 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Credential Setup Guide</CardTitle>
                        <CardDescription>
                          Kairo workflows use placeholders like <code className="text-xs bg-muted p-1 rounded font-mono">{`{{credential.MyApiKey}}`}</code> for sensitive values. 
                          This app securely loads these values from server environment variables.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-3 border rounded-lg bg-blue-500/10 text-blue-800 dark:text-blue-200 text-sm flex items-start gap-3">
                          <Info className="h-4 w-4 mt-0.5 shrink-0" />
                          <p>
                            To set these up, create a <code className="text-xs font-mono p-1 rounded bg-blue-500/15">.env.local</code> file in the project's root directory and add each key-value pair, like: <code className="text-xs font-mono p-1 rounded bg-blue-500/15">SLACK_BOT_TOKEN="xoxb-..."</code>.
                          </p>
                        </div>
                        <div className="mt-4 space-y-3">
                          {CREDENTIAL_INFO.map(cred => (
                            <div key={cred.name} className="p-3 border rounded-lg bg-background">
                              <p className="font-mono text-sm font-semibold text-primary">{cred.name}</p>
                              <p className="text-sm text-muted-foreground mt-1">{cred.description}</p>
                            </div>
                          ))}
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
                                  <p className="text-xs text-muted-foreground mt-1">Send a POST request with a JSON body: <code className="text-xs bg-muted p-1 rounded font-mono">{`{ "command": "your prompt here" }`}</code></p>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">API Response Format</div>
                                <p className="text-sm text-muted-foreground">The API returns a JSON object. If your command results in a workflow, the `action` will be `workflowGenerated` and the response will include the full workflow definition.</p>
                                <pre className="text-xs p-3 bg-muted rounded-md font-mono whitespace-pre-wrap">
                                  {`// Example Response for Workflow Generation
{
  "aiResponse": "Certainly. I'll generate a workflow for that...",
  "action": "workflowGenerated",
  "workflow": {
    "nodes": [...],
    "connections": [...]
  }
}`}
                                </pre>
                              </div>

                              <div>
                                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><KeyRound className="h-3.5 w-3.5"/>Authentication</div>
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
          </main>
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
                          <Button variant="outline" size="sm" onClick={() => handleAddTool(tool)}>Add</Button>
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
    </AppLayout>
  );
}

export default withAuth(MCPDashboardPage);
