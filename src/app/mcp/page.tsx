
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Workflow, Bot, Terminal, Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { assistantChat } from '@/app/actions';

export default function MCPPage() {
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) {
      toast({
        title: 'Empty Command',
        description: 'Please enter a command for the AI.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      const result = await assistantChat({ userMessage: command });
      setResponse(result.aiResponse);
    } catch (error: any) {
      toast({
        title: 'MCP Error',
        description: error.message,
        variant: 'destructive',
      });
      setResponse(`Error: ${error.message}`);
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

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              <Textarea
                placeholder="e.g., 'Run the test case workflow' or 'list available workflows'"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                className="min-h-[80px] text-base"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                {isLoading ? 'Executing...' : 'Execute Command'}
              </Button>

              {response && (
                <div className="mt-6">
                  <h3 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    AI Response
                  </h3>
                  <ScrollArea className="h-40 border rounded-md bg-muted/40 p-3">
                    <pre className="text-sm whitespace-pre-wrap break-words font-mono">
                      {response}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </form>
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
