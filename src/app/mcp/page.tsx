
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Workflow, User, Server, Settings, History, Tv, ListChecks, Play, Zap, Plus, MoreHorizontal, Youtube, FolderGit2 } from 'lucide-react';
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

// Mocking the tool list based on what's available and inspired by the image
const availableTools = [
    { name: 'Workflow: List Saved', description: 'Lists all available saved workflows.', icon: ListChecks, service: 'Kairo' },
    { name: 'Workflow: Get Definition', description: 'Retrieves the structure of a specific workflow.', icon: Tv, service: 'Kairo' },
    { name: 'Workflow: Run', description: 'Executes a workflow and returns the result.', icon: Play, service: 'Kairo' },
    { name: 'YouTube: Find Video', description: 'Finds a YouTube video based on a search query.', icon: Youtube, service: 'YouTube' },
    { name: 'YouTube: Get Report', description: 'Gets a report for a YouTube video.', icon: Youtube, service: 'YouTube' },
    { name: 'Google Drive: Find File', description: 'Finds a file or folder in Google Drive by name.', icon: FolderGit2, service: 'Google Drive' },
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
                                <Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-2" />Add tool</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {availableTools.map((tool) => (
                                    <div key={tool.name} className="flex items-center gap-4 p-2 border rounded-lg bg-background hover:bg-muted/50">
                                        <div className="p-1 bg-muted rounded-md">
                                            <tool.icon className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{tool.name}</p>
                                        </div>
                                         <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreHorizontal className="h-4 w-4" />
                                         </Button>
                                    </div>
                                ))}
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
                                <div className="text-xs font-semibold">API Endpoint</div>
                                <pre className="mt-1 text-sm p-2 bg-muted rounded-md font-mono text-muted-foreground">/api/mcp</pre>
                            </div>
                             <div>
                                <div className="text-xs font-semibold">Authentication</div>
                                <p className="text-sm mt-1 text-muted-foreground">Authentication would typically be managed via API keys generated in your profile settings (feature not implemented).</p>
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
