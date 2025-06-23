
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Workflow, Bot, Plus, Settings, History, Link as LinkIcon, MoreHorizontal, List, FileJson, Play, HelpCircle, User, Zap, Info } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Separator } from '@/components/ui/separator';

// This would typically come from a service/API, but we'll mock it for the UI
// to reflect the tools available to the AI assistant.
const availableTools = [
  {
    name: 'List Workflows',
    description: 'Lists all available saved example and user-created workflows.',
    icon: List,
  },
  {
    name: 'Get Workflow Definition',
    description: 'Retrieves the structure (nodes and connections) of a specific workflow by name.',
    icon: FileJson,
  },
  {
    name: 'Run Workflow',
    description: 'Executes a workflow in simulation mode and returns the result.',
    icon: Play,
  },
];

export default function MCPPage() {
  const { user } = useSubscription();
  const [activeTab, setActiveTab] = useState('configure');

  const getInitials = (email: string | undefined) => {
    if (!email) return '..';
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="flex h-screen w-full bg-muted/30 text-foreground dark:bg-background">
      {/* Left Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Kairo MCP</span>
            <span className="px-2 py-0.5 text-xs font-semibold text-primary bg-primary/10 rounded-full">Beta</span>
          </Link>
        </div>
        <div className="p-2 flex-1">
          <Button variant="outline" className="w-full justify-start mb-2">
            <Plus className="mr-2 h-4 w-4" /> New MCP Server
          </Button>
          <Button variant="secondary" className="w-full justify-start">
            Kairo Main Server
          </Button>
        </div>
        <div className="p-4 border-t border-border mt-auto">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="flex items-center gap-1.5"><Info className="h-4 w-4" /> Usage</span>
              <span>0/300</span>
            </div>
             <Link href="/contact" className="flex items-center gap-1.5 text-muted-foreground cursor-pointer hover:text-foreground">
              <HelpCircle className="h-4 w-4" />
              <span>Support</span>
            </Link>
            <Separator />
            <Link href="/profile" className="flex items-center gap-2 cursor-pointer group">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
              </Avatar>
              <span className="font-medium truncate group-hover:text-primary">{user?.email || 'Guest User'}</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kairo Main Server</h1>
          <div className="flex items-center gap-2">
            <Button variant={activeTab === 'configure' ? 'default' : 'outline'} onClick={() => setActiveTab('configure')}>
              <Settings className="mr-2 h-4 w-4" /> Configure
            </Button>
            <Button variant={activeTab === 'connect' ? 'default' : 'outline'} onClick={() => setActiveTab('connect')}>
              <LinkIcon className="mr-2 h-4 w-4" /> Connect
            </Button>
            <Button variant={activeTab === 'history' ? 'default' : 'outline'} onClick={() => setActiveTab('history')}>
              <History className="mr-2 h-4 w-4" /> History
            </Button>
             <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
          </div>
        </header>

        {activeTab === 'configure' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client</CardTitle>
                <CardDescription>Choose which MCP client you want to use with this server.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <span className="font-medium">Kairo AI Assistant</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Tools</CardTitle>
                    <CardDescription>What your MCP server can do with Kairo.</CardDescription>
                  </div>
                  <Button variant="outline"><Plus className="mr-2 h-4 w-4" /> Add tool</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {availableTools.map((tool, index) => (
                    <div key={index} className="border rounded-md p-3 flex items-center justify-between hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <tool.icon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{tool.name}</p>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
         {activeTab !== 'configure' && (
             <Card className="flex items-center justify-center h-96">
                <CardContent className="text-center p-6">
                    <p className="text-lg font-medium text-muted-foreground">This section is for demonstration purposes.</p>
                    <p className="text-sm text-muted-foreground">The '{activeTab}' functionality is not implemented.</p>
                </CardContent>
            </Card>
         )}
      </main>
    </div>
  );
}
