
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Workflow, Bot, User, Terminal, Loader2, Zap, Send } from 'lucide-react';
import { assistantChat, type ChatMessage } from '@/app/actions'; 
import { cn } from '@/lib/utils';
import { useSubscription } from '@/contexts/SubscriptionContext';

export default function MCPPage() {
  const [cliHistory, setCliHistory] = useState<ChatMessage[]>([]);
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useSubscription();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [cliHistory]);
  
  useEffect(() => {
    if (cliHistory.length === 0 && !isProcessing) {
      setIsProcessing(true);
      setTimeout(() => {
        setCliHistory([
          { id: crypto.randomUUID(), sender: 'ai', message: "Kairo MCP (Model Context Protocol) ready.\nType a command to begin. For example, try:\n- 'list all workflows'\n- 'run the test case workflow'", timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
        setIsProcessing(false);
      }, 500);
    }
  }, [cliHistory.length, isProcessing]);

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      message: command,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCliHistory(prev => [...prev, userMessage]);
    setCommand('');
    setIsProcessing(true);

    try {
      // The assistant chat flow is smart enough to handle commands without extra context here
      const result = await assistantChat({ userMessage: command });
      const aiResponse: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        message: result.aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCliHistory(prev => [...prev, aiResponse]);
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        message: `Error processing command: ${error.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCliHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const getInitials = (email: string | undefined) => {
    if (!email) return '..';
    const parts = email.split('@')[0].split(/[._-]/);
    return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="flex h-screen w-full bg-muted/30 text-foreground dark:bg-background">
      <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <Card className="w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
              <div>
                <CardTitle className="text-lg">Kairo MCP Console</CardTitle>
                <CardDescription className="text-xs">AI Command Interface</CardDescription>
              </div>
            </div>
             <Button variant="outline" asChild>
                <Link href="/workflow">
                  <Workflow className="mr-2 h-4 w-4" />
                  Go to Editor
                </Link>
             </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full" viewportRef={scrollAreaRef}>
              <div className="p-4 font-mono text-sm space-y-4">
                {cliHistory.map((item) => (
                  <div key={item.id} className="flex flex-col">
                    {item.sender === 'user' ? (
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">{user?.email || 'user'}@kairo:~$</span>
                        <p className="flex-1 text-foreground whitespace-pre-wrap break-words">{item.message}</p>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                         <span className="text-primary font-bold shrink-0">[Kairo AI]:</span>
                         <p className="text-muted-foreground whitespace-pre-wrap break-words">{item.message}</p>
                      </div>
                    )}
                  </div>
                ))}
                 {isProcessing && (
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold shrink-0">[Kairo AI]:</span>
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                  )}
              </div>
            </ScrollArea>
          </CardContent>
          <form onSubmit={handleCommandSubmit} className="p-4 border-t bg-card/80">
            <div className="relative flex items-center">
              <Terminal className="absolute left-3 h-5 w-5 text-muted-foreground" />
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Type a command for the Kairo AI..."
                className="pl-10 h-10 text-base"
                disabled={isProcessing}
                autoComplete="off"
              />
               <Button type="submit" disabled={isProcessing || !command.trim()} size="icon" className="absolute right-1.5 h-8 w-8">
                  <Send className="h-4 w-4" />
               </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  );
}
