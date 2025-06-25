
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Workflow, History, CheckCircle2, XCircle, Trash2, Code2, Eye, ListChecks, FileJson, Edit3, Loader2, Play, RefreshCw, AlertTriangle } from 'lucide-react';
import type { WorkflowRunRecord, LogEntry, WorkflowNode } from '@/types/workflow';
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
import * as WorkflowStorage from '@/services/workflow-storage-service';
import { rerunWorkflowAction } from '@/app/actions';
import { WorkflowNodeItem } from '@/components/workflow-node-item';
import { AVAILABLE_NODES_CONFIG, getCanvasNodeStyling, NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';
import { WorkflowCanvas } from '@/components/workflow-canvas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const JsonSyntaxHighlighter = ({ jsonString }: { jsonString: string }) => {
  try {
    const obj = JSON.parse(jsonString);
    const highlighted = JSON.stringify(obj, null, 2).replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'text-green-400';
      if (/^"/.test(match)) cls = /:$/.test(match) ? 'text-cyan-400' : 'text-amber-400';
      return `<span class="${cls}">${match}</span>`;
    });
    return <pre className="text-xs p-2" dangerouslySetInnerHTML={{ __html: highlighted }} />;
  } catch {
    return <pre className="text-xs p-2 text-destructive">{jsonString}</pre>;
  }
};

export default function RunHistoryPage() {
  const [runHistory, setRunHistory] = useState<WorkflowRunRecord[]>([]);
  const [selectedRun, setSelectedRun] = useState<WorkflowRunRecord | null>(null);
  const [isRerunning, setIsRerunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { toast } = useToast();

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const history = await WorkflowStorage.getRunHistory();
      setRunHistory(history);
    } catch (e: any) {
      console.error("Error loading run history:", e);
      toast({ title: 'Error', description: 'Could not load run history from server.', variant: 'destructive' });
      setRunHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);
  
  const handleRerun = async (runId: string) => {
    setIsRerunning(true);
    try {
      await rerunWorkflowAction(runId);
      toast({ title: 'Workflow Re-run', description: 'The workflow has been successfully re-run. Check history for new record.' });
      setSelectedRun(null);
      await loadHistory(); // Refresh the history list
    } catch (e: any) {
      toast({ title: 'Re-run Failed', description: e.message, variant: 'destructive' });
    } finally {
      setIsRerunning(false);
    }
  };
  
  const clearHistory = async () => {
    try {
      await WorkflowStorage.clearRunHistory();
      setRunHistory([]);
      setShowClearConfirm(false);
      toast({ title: 'Run History Cleared', description: 'All workflow execution records have been deleted.' });
    } catch (e: any)
    {
      toast({ title: 'Error', description: 'Could not clear run history.', variant: 'destructive' });
    }
  };

  const getLogsForRun = (run: WorkflowRunRecord): LogEntry[] => {
    if (!run?.executionResult?.serverLogs) return [];
    return run.executionResult.serverLogs.map(log => ({ ...log, timestamp: new Date(log.timestamp).toLocaleTimeString() }));
  };

  const getStatusIndicator = (status: 'Success' | 'Failed') => {
      const styles = {
          Success: { Icon: CheckCircle2, color: 'text-green-500' },
          Failed: { Icon: XCircle, color: 'text-destructive' }
      };
      const { Icon, color } = styles[status];
      return <Icon className={cn("h-6 w-6 shrink-0", color)} />;
  };

  const getNodesForRun = (run: WorkflowRunRecord): WorkflowNode[] => {
    if (!run.workflowSnapshot?.nodes) return [];
    
    return run.workflowSnapshot.nodes.map(node => {
      const resultData = run.executionResult.finalWorkflowData[node.id];
      return {
        ...node,
        lastExecutionStatus: resultData?.lastExecutionStatus || 'skipped',
      };
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-primary flex items-center"><Workflow className="h-8 w-8 mr-2" />Kairo</Link>
          <nav><Button variant="outline" asChild><Link href="/workflow"><Edit3 className="mr-2 h-4 w-4" />Workflow Editor</Link></Button></nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="mb-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">Run History</h1>
              <p className="max-w-2xl text-lg text-muted-foreground">Review past executions of your workflows, inspect their data, and re-run failed jobs.</p>
            </div>
            <Button variant="destructive" onClick={() => setShowClearConfirm(true)} disabled={runHistory.length === 0 || isLoading}><Trash2 className="mr-2 h-4 w-4" />Clear History</Button>
          </div>
        </section>

        {isLoading ? (
          <div className="text-center py-16 bg-card shadow-lg rounded-lg"><Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" /><p className="mt-4 text-muted-foreground">Loading Run History...</p></div>
        ) : runHistory.length === 0 ? (
          <div className="text-center py-16 bg-card shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <History className="h-20 w-20 text-muted-foreground mx-auto mb-5 opacity-70" />
            <p className="text-2xl text-muted-foreground font-semibold">No run history found.</p>
            <p className="text-md text-muted-foreground mt-3 mb-8">Go to the <Link href="/workflow" className="text-primary hover:underline font-medium">Workflow Editor</Link> and run a workflow to see its history here.</p>
            <Button asChild><Link href="/workflow"><Workflow className="mr-2 h-4 w-4" /> Go to Editor</Link></Button>
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <ScrollArea className="h-[60vh]">
                <div className="divide-y divide-border">
                  {runHistory.map((run) => (
                    <div key={run.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">{getStatusIndicator(run.status)}
                        <div>
                          <p className="font-semibold text-foreground truncate" title={run.workflowName}>{run.workflowName}</p>
                          <p className="text-sm text-muted-foreground">{format(new Date(run.timestamp), 'PPpp')} ({formatDistanceToNow(new Date(run.timestamp), { addSuffix: true })})</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedRun(run)}><Eye className="mr-2 h-4 w-4" />View Details</Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="text-center py-10 border-t mt-12"><p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Kairo. Automate intelligently.</p></footer>
      
      {selectedRun && (
        <Dialog open={!!selectedRun} onOpenChange={(open) => !open && setSelectedRun(null)}>
          <DialogContent className="max-w-7xl w-[90vw] h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl">Run Details: {selectedRun.workflowName}</DialogTitle>
              <DialogDescription>Executed on {format(new Date(selectedRun.timestamp), 'PPpp')}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
                <div className="col-span-2 border rounded-md relative bg-muted/20 dot-grid-background">
                    <WorkflowCanvas
                        nodes={getNodesForRun(selectedRun)}
                        connections={selectedRun.workflowSnapshot.connections}
                        executionData={selectedRun.executionResult.finalWorkflowData}
                        readOnly={true}
                        canvasOffset={selectedRun.workflowSnapshot.canvasOffset}
                        zoomLevel={selectedRun.workflowSnapshot.zoomLevel}
                    />
                </div>
                <div className="col-span-1 flex flex-col gap-3">
                    <Tabs defaultValue="logs" className="flex flex-col h-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="logs"><ListChecks className="mr-2 h-4 w-4"/>Logs</TabsTrigger>
                          <TabsTrigger value="data"><FileJson className="mr-2 h-4 w-4"/>Final Data</TabsTrigger>
                        </TabsList>
                        <TabsContent value="logs" className="flex-grow overflow-hidden">
                            <ScrollArea className="h-full border rounded-md bg-muted/30 p-2">
                                {getLogsForRun(selectedRun).length === 0 ? <p className="text-xs text-muted-foreground/70 italic py-2">No logs recorded.</p> : (
                                    <div className="space-y-1.5 text-xs font-mono p-1">
                                    {getLogsForRun(selectedRun).map((log, index) => (
                                        <div key={index} className={cn("p-1.5 rounded-sm text-opacity-90 break-words", log.type === 'error' && 'bg-destructive/10 text-destructive-foreground/90', log.type === 'success' && 'bg-green-500/10 text-green-300', log.type === 'info' && 'bg-primary/5 text-primary-foreground/80' )}>
                                        <span className="font-medium opacity-70 mr-1.5">[{log.timestamp}]</span><span>{log.message}</span>
                                        </div>
                                    ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="data" className="flex-grow overflow-hidden">
                            <ScrollArea className="h-full border rounded-md bg-muted/30 p-2">
                                <JsonSyntaxHighlighter jsonString={JSON.stringify(selectedRun.executionResult.finalWorkflowData, null, 2)} />
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
              </div>
            </div>
            <DialogFooter className="pt-4 border-t">
                {selectedRun.status === 'Failed' && (
                    <Button variant="outline" disabled={isRerunning} onClick={() => handleRerun(selectedRun.id)}>
                        {isRerunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                        {isRerunning ? 'Re-running...' : 'Re-run Failed Workflow'}
                    </Button>
                )}
                <DialogClose asChild><Button type="button" variant="default">Close</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Clear All Run History?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. All workflow execution records will be permanently deleted from the server.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={clearHistory} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Yes, Clear History</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
