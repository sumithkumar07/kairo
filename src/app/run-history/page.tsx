
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Workflow, History, CheckCircle2, XCircle, Trash2, Code2, Eye, ListChecks, FileJson, Edit3 } from 'lucide-react';
import type { WorkflowRunRecord, LogEntry } from '@/types/workflow';
import { format, formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const RUN_HISTORY_KEY = 'kairoRunHistory';

// Simple JSON syntax highlighter
const JsonSyntaxHighlighter = ({ jsonString }: { jsonString: string }) => {
  const highlighted = jsonString.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
    let cls = 'text-green-400'; // number, boolean, null
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'text-cyan-400'; // key
      } else {
        cls = 'text-amber-400'; // string
      }
    }
    return `<span class="${cls}">${match}</span>`;
  });
  return <pre className="text-xs p-2" dangerouslySetInnerHTML={{ __html: highlighted }} />;
};

export default function RunHistoryPage() {
  const [runHistory, setRunHistory] = useState<WorkflowRunRecord[]>([]);
  const [selectedRun, setSelectedRun] = useState<WorkflowRunRecord | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { toast } = useToast();

  const loadHistory = useCallback(() => {
    const historyJson = localStorage.getItem(RUN_HISTORY_KEY);
    if (historyJson) {
      try {
        setRunHistory(JSON.parse(historyJson));
      } catch (e) {
        console.error("Error parsing run history:", e);
        setRunHistory([]);
        localStorage.removeItem(RUN_HISTORY_KEY);
      }
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const clearHistory = () => {
    localStorage.removeItem(RUN_HISTORY_KEY);
    setRunHistory([]);
    setShowClearConfirm(false);
    toast({ title: 'Run History Cleared', description: 'All workflow execution records have been deleted.' });
  };
  
  const getLogsForRun = (run: WorkflowRunRecord): LogEntry[] => {
    if (!run || !run.executionResult || !run.executionResult.serverLogs) {
        return [];
    }
    return run.executionResult.serverLogs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp).toLocaleTimeString(),
    }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-primary flex items-center">
            <Workflow className="h-8 w-8 mr-2" />
            Kairo
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/workflow">
                <Edit3 className="mr-2 h-4 w-4" />
                Workflow Editor
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">
                Run History
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground">
                Review past executions of your workflows.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowClearConfirm(true)}
              disabled={runHistory.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear History
            </Button>
          </div>
        </section>

        {runHistory.length === 0 ? (
          <div className="text-center py-16 bg-card shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <History className="h-20 w-20 text-muted-foreground mx-auto mb-5 opacity-70" />
            <p className="text-2xl text-muted-foreground font-semibold">No run history found.</p>
            <p className="text-md text-muted-foreground mt-3 mb-8">
              Go to the <Link href="/workflow" className="text-primary hover:underline font-medium">Workflow Editor</Link> and run a workflow to see its history here.
            </p>
            <Button asChild>
                <Link href="/workflow">
                    <Workflow className="mr-2 h-4 w-4" /> Go to Editor
                </Link>
            </Button>
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <ScrollArea className="h-[60vh]">
                <div className="divide-y divide-border">
                  {runHistory.map((run) => (
                    <div key={run.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        {run.status === 'Success' ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="h-6 w-6 text-destructive shrink-0" />
                        )}
                        <div>
                          <p className="font-semibold text-foreground truncate" title={run.workflowName}>{run.workflowName}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(run.timestamp), 'PPpp')} ({formatDistanceToNow(new Date(run.timestamp), { addSuffix: true })})
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRun(run)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="text-center py-10 border-t mt-12">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Kairo. Automate intelligently.
        </p>
      </footer>
      
      {selectedRun && (
        <Dialog open={!!selectedRun} onOpenChange={(open) => !open && setSelectedRun(null)}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                <DialogTitle className="text-xl">Run Details: {selectedRun.workflowName}</DialogTitle>
                <DialogDescription>
                    Executed on {format(new Date(selectedRun.timestamp), 'PPpp')}
                </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
                    <div className="flex flex-col gap-3">
                        <h3 className="font-semibold flex items-center gap-2"><ListChecks className="h-4 w-4 text-primary" /> Execution Logs</h3>
                        <ScrollArea className="h-full border rounded-md bg-muted/30 p-2">
                           {getLogsForRun(selectedRun).length === 0 ? (
                                <p className="text-xs text-muted-foreground/70 italic py-2">No logs were recorded for this run.</p>
                            ) : (
                                <div className="space-y-1.5 text-xs font-mono p-1">
                                    {getLogsForRun(selectedRun).map((log, index) => (
                                    <div key={index} className={cn(
                                        "p-1.5 rounded-sm text-opacity-90 break-words",
                                        log.type === 'error' && 'bg-destructive/10 text-destructive-foreground/90',
                                        log.type === 'success' && 'bg-green-500/10 text-green-300',
                                        log.type === 'info' && 'bg-primary/5 text-primary-foreground/80'
                                    )}>
                                        <span className="font-medium opacity-70 mr-1.5">[{log.timestamp}]</span>
                                        <span>{log.message}</span>
                                    </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                    <div className="flex flex-col gap-3">
                        <h3 className="font-semibold flex items-center gap-2"><FileJson className="h-4 w-4 text-primary" /> Final Node Data</h3>
                         <ScrollArea className="h-full border rounded-md bg-muted/30 p-2">
                            <JsonSyntaxHighlighter jsonString={JSON.stringify(selectedRun.executionResult.finalWorkflowData, null, 2)} />
                        </ScrollArea>
                    </div>
                </div>
                 <DialogClose asChild>
                    <Button type="button" variant="outline" className="mt-4">Close</Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Run History?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All workflow execution records will be permanently deleted from your browser's local storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={clearHistory} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Yes, Clear History
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
