
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Workflow, Bot, Terminal, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { assistantChat } from '@/app/actions';
import type { ChatMessage } from '@/types/workflow';

export default function MCPPage() {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollAreaRef.current) {
      chatScrollAreaRef.current.scrollTop = chatScrollAreaRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      toast({
        title: 'Empty Command',
        description: 'Please enter a command for the AI.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      message: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await assistantChat({ 
        userMessage: input,
        chatHistory: history.slice(-6).map(h => ({ sender: h.sender, message: h.message }))
      });

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        message: result.aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setHistory(prev => [...prev, aiMessage]);

    } catch (error: any) {
      toast({
        title: 'MCP Error',
        description: error.message,
        variant: 'destructive',
      });
       const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        message: `Error: ${error.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-primary flex items-center">
            <Workflow className="h-8 w-8 mr-2" />
            Kairo
          </Link>
          <nav>
            <Button variant="ghost" asChild>
              <Link href="/workflow">
                Workflow Editor
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center border-b pb-4">
            <Bot className="h-12 w-12 text-primary mx-auto mb-3" />
            <CardTitle className="text-2xl">MCP Console</CardTitle>
            <CardDescription className="text-sm">
              Issue commands to the Kairo AI Orchestrator. e.g., "run the test case workflow"
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            <ScrollArea className="h-80 border rounded-md bg-muted/40 p-3" viewportRef={chatScrollAreaRef}>
              {history.length === 0 ? (
                 <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Command history will appear here.</p>
                 </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div key={item.id} className={`flex ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2 rounded-lg max-w-[80%] ${item.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                           <pre className="text-sm whitespace-pre-wrap break-words font-sans">{item.message}</pre>
                        </div>
                    </div>
                  ))}
                  {isLoading && (
                     <div className="flex justify-start">
                        <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                     </div>
                  )}
                </div>
              )}
            </ScrollArea>
             <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                placeholder="e.g., 'Run the test case workflow' or 'list available workflows'"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 resize-none"
                disabled={isLoading}
                onKeyDown={(e) => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e as any);
                    }
                }}
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                <span className="sr-only">Execute</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <footer className="text-center py-10 border-t mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Kairo. Automate intelligently.
        </p>
      </footer>
    </div>
  );
}
