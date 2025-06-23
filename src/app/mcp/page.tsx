
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Workflow, User, Bot, Server, Settings, History, Tv, ListChecks, Play, Zap } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarFooter,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';


const availableTools = [
    { name: 'listSavedWorkflows', description: 'Lists all available saved workflows.', icon: ListChecks },
    { name: 'getWorkflowDefinition', description: 'Retrieves the structure of a specific workflow.', icon: Tv },
    { name: 'runWorkflow', description: 'Executes a workflow and returns the result.', icon: Play },
];

export default function MCPDashboardPage() {
  const [activeTab, setActiveTab] = useState('configure');
  const { user } = useSubscription();

  const getInitials = (email: string | undefined) => {
    if (!email) return '..';
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <SidebarProvider>
    <div className="flex h-screen w-full bg-muted/40 text-foreground dark:bg-background">
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas" className="group hidden w-64 shrink-0 flex-col justify-between border-r bg-card p-2 shadow-sm data-[mobile=true]:dark:bg-background md:flex">
          <SidebarHeader>
              <div className="flex items-center gap-3 p-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Server className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-base font-semibold">MCP Server</h2>
                    <p className="text-xs text-muted-foreground">AI Command Control</p>
                </div>
              </div>
          </SidebarHeader>
          <SidebarContent className="flex-1">
              <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeTab === 'configure'} onClick={() => setActiveTab('configure')}>
                      <Settings className="h-4 w-4" />
                      Configure
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeTab === 'connect'} onClick={() => setActiveTab('connect')}>
                      <Zap className="h-4 w-4" />
                      Connect
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={activeTab === 'history'} onClick={() => setActiveTab('history')}>
                      <History className="h-4 w-4" />
                      History
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
      <SidebarInset className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-card px-4 shadow-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden"/>
                <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Workflow className="h-6 w-6" />
                    Kairo
                </Link>
            </div>
            <Button asChild variant="outline">
                <Link href="/workflow">Go to Editor</Link>
            </Button>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6">
             <div className="max-w-4xl mx-auto">
                 {activeTab === 'configure' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Assistant Tools</CardTitle>
                            <CardDescription>These are the capabilities (tools) the Kairo AI assistant can use to help you automate tasks and manage workflows.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {availableTools.map((tool) => (
                                    <div key={tool.name} className="flex items-start gap-4 p-3 border rounded-lg bg-muted/50">
                                        <div className="p-2 bg-primary/10 text-primary rounded-md">
                                            <tool.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{tool.name}</p>
                                            <p className="text-xs text-muted-foreground">{tool.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                 )}
                  {activeTab === 'connect' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Connect to MCP</CardTitle>
                            <CardDescription>Use this information to connect your applications to the Kairo MCP.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="api-endpoint" className="text-xs">API Endpoint</Label>
                                <pre className="mt-1 text-xs p-2 bg-muted rounded-md font-mono text-muted-foreground">/api/mcp</pre>
                            </div>
                             <div>
                                <Label htmlFor="api-key" className="text-xs">Authentication</Label>
                                <p className="text-xs mt-1 text-muted-foreground">Authentication would typically be managed via API keys generated in your profile settings (feature not implemented).</p>
                            </div>
                        </CardContent>
                    </Card>
                 )}
                 {activeTab === 'history' && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Command History</CardTitle>
                            <CardDescription>A log of commands sent to the AI assistant (feature not yet implemented).</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground text-sm py-12">
                            <History className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            Command history will appear here.
                        </CardContent>
                    </Card>
                 )}
             </div>
          </main>
      </SidebarInset>
    </div>
    </SidebarProvider>
  );
}
