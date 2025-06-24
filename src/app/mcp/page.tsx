
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Workflow, User, Server, Settings, History, Tv, ListChecks, Play, Zap, Plus, MoreHorizontal, Youtube, FolderGit2, X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { McpCommandRecord } from '@/types/workflow';
import { getMcpHistory } from '@/services/workflow-storage-service';
import { format, formatDistanceToNow } from 'date-fns';


type Tool = { name: string; description: string; icon: React.ElementType; service: string; };

const ALL_AVAILABLE_TOOLS: Tool[] = [
    { name: 'Workflow: List Saved', description: 'Lists all available saved workflows.', icon: ListChecks, service: 'Kairo' },
    { name: 'Workflow: Get Definition', description: 'Retrieves the structure of a specific workflow.', icon: Tv, service: 'Kairo' },
    { name: 'Workflow: Run', description: 'Executes a workflow and returns the result.', icon: Play, service: 'Kairo' },
    { name: 'YouTube: Find Video', description: 'Finds a YouTube video based on a search query.', icon: Youtube, service: 'YouTube' },
    { name: 'YouTube: Get Report', description: 'Gets a report for a YouTube video.', icon: Youtube, service: 'YouTube' },
    { name: 'Google Drive: Find File', description: 'Finds a file or folder in Google Drive by name.', icon: FolderGit2, service: 'Google Drive' },
];

const INITIAL_TOOLS = ALL_AVAILABLE_TOOLS.slice(0, 3);


export default function MCPDashboardPage() {
  const [activeTab, setActiveTab] = useState('configure');
  const { user } = useSubscription();
  const { toast } = useToast();

  const [configuredTools, setConfiguredTools] = useState<Tool[]>(INITIAL_TOOLS);
  const [commandHistory, setCommandHistory] = useState<McpCommandRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showAddToolDialog, setShowAddToolDialog] = useState(false);

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
    toast({ title: 'Tool Added', description: `"${tool.name}" has been added to your server.` });
  };
  
  const handleRemoveTool = (toolName: string) => {
    setConfiguredTools(prev => prev.filter(t => t.name !== toolName));
    toast({ title: 'Tool Removed', description: `"${toolName}" has been removed from your server.` });
  };


  const getInitials = (email: string | undefined) => {
    if (!email) return '..';
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();
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
    <SidebarProvider>
    <div className="flex h-screen w-full bg-muted/40 text-foreground">
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas" className="group hidden w-64 shrink-0 flex-col justify-between border-r bg-card p-2 shadow-sm data-[mobile=true]:dark:bg-background md:flex">
          <SidebarHeader>
              <div className="flex items-center gap-3 p-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-base font-semibold">Kairo MCP</h2>
                    <p className="text-xs text-muted-foreground">AI Command Control</p>
                </div>
              </div>
          </SidebarHeader>
          <SidebarContent className="flex-1">
              <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="sm">
                      <Plus className="h-4 w-4" />
                      New MCP Server
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <Separator className="my-2" />
                  <SidebarMenuItem>
                    <SidebarMenuButton size="sm" isActive={true}>
                      <Server className="h-4 w-4" />
                      Cursor MCP Server
                    </SidebarMenuButton>
                  </SidebarMenuItem>
              </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
              <Separator className="my-2" />
              <div className="flex items-center gap-3 p-2">
                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {getInitials(user?.email)}
                </div>
                <div>
                  <p className="text-sm font-medium truncate">{user?.email || 'Guest User'}</p>
                  <p className="text-xs text-muted-foreground">Kairo User</p>
                </div>
              </div>
          </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col bg-background">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-card px-4 shadow-sm sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden"/>
                <h1 className="text-xl font-semibold">Cursor MCP Server</h1>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-secondary p-1">
                <Button variant={activeTab === 'configure' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('configure')} className="h-7 text-xs shadow-sm data-[variant=primary]:bg-background data-[variant=primary]:text-primary-foreground">
                    <Settings className="h-4 w-4 mr-1.5" />Configure
                </Button>
                 <Button variant={activeTab === 'connect' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('connect')} className="h-7 text-xs shadow-sm data-[variant=primary]:bg-background data-[variant=primary]:text-primary-foreground">
                    <Zap className="h-4 w-4 mr-1.5" />Connect
                </Button>
                 <Button variant={activeTab === 'history' ? 'primary' : 'ghost'} size="sm" onClick={() => setActiveTab('history')} className="h-7 text-xs shadow-sm data-[variant=primary]:bg-background data-[variant=primary]:text-primary-foreground">
                    <History className="h-4 w-4 mr-1.5" />History
                </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6">
             <div className="max-w-4xl mx-auto grid gap-6">
                 {activeTab === 'configure' && (
                    <>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Client</CardTitle>
                            <CardDescription className="text-xs">Choose which MCP client you want to use with this server.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button variant="outline" className="w-full justify-start">
                                <Workflow className="h-4 w-4 mr-2" /> Kairo
                             </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-base">Tools</CardTitle>
                                    <CardDescription className="text-xs">What your MCP server can do across various apps.</CardDescription>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => setShowAddToolDialog(true)}><Plus className="h-4 w-4 mr-2" />Add tool</Button>
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
                                  <div className="text-center py-6 text-sm text-muted-foreground">No tools configured. Click "Add tool" to get started.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    </>
                 )}
                 {activeTab === 'connect' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Connect to MCP</CardTitle>
                            <CardDescription>Use this information to connect your applications to the Kairo MCP.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">API Endpoint</div>
                                <pre className="mt-1 text-sm p-2 bg-muted rounded-md font-mono">/api/mcp</pre>
                                <p className="text-xs text-muted-foreground mt-1">Send a POST request with a JSON body: <code className="text-xs bg-muted p-1 rounded font-mono">{`{ "command": "your prompt here" }`}</code></p>
                            </div>
                             <div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Authentication</div>
                                <p className="text-sm mt-1 text-muted-foreground">In a production environment, you would generate a unique API key for your server here. That key would then be sent in the <code className="text-xs bg-muted p-1 rounded font-mono">Authorization</code> header of your requests (e.g., <code className="text-xs bg-muted p-1 rounded font-mono">Bearer YOUR_API_KEY</code>).</p>
                            </div>
                        </CardContent>
                    </Card>
                 )}
                 {activeTab === 'history' && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Command History</CardTitle>
                            <CardDescription>A log of commands sent to the AI assistant via the MCP endpoint.</CardDescription>
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
                 )}
             </div>
          </main>
      </SidebarInset>
    </div>
    <Dialog open={showAddToolDialog} onOpenChange={setShowAddToolDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a Tool</DialogTitle>
          <DialogDescription>Select a tool to add to your MCP server, enabling new AI capabilities.</DialogDescription>
        </DialogHeader>
        <div className="py-2">
            {unconfiguredTools.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-4">All available tools have been added.</p>
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
    </SidebarProvider>
  );
}
