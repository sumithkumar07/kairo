'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Workflow, History, CheckCircle2, XCircle, Trash2, Code2, Eye, ListChecks, FileJson, Edit3, Loader2, RefreshCw, AlertTriangle, Database, Bot } from 'lucide-react';
import type { WorkflowRunRecord, WorkflowNode } from '@/types/workflow';
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
import { WorkflowCanvas } from '@/components/workflow-canvas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';


const JsonSyntaxHighlighter = ({ jsonString, className }: { jsonString: string; className?: string; }) => {
  try {
    const obj = JSON.parse(jsonString);
    const highlighted = JSON.stringify(obj, null, 2).replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'text-green-400 dark:text-green-400';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'text-cyan-400 dark:text-cyan-300' : 'text-amber-400 dark:text-amber-300';
      }
      return `<span class="${cls}">${match}</span>`;
    });
    return <pre className={cn("text-xs p-2", className)} dangerouslySetInnerHTML={{ __html: highlighted }} />;
  } catch {
    return <pre className={cn("text-xs p-2 text-destructive", className)}>{jsonString}</pre>;
  }
};

function RunHistoryPage() {
  const [runHistory, setRunHistory] = useState<WorkflowRunRecord[]>([]);
  const [selectedRun, setSelectedRun] = useState<WorkflowRunRecord | null>(null);
  const [selectedNodeInSnapshot, setSelectedNodeInSnapshot] = useState<WorkflowNode | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState('logs');
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
      setSelectedRun(null); // Close the dialog
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

  const handleNodeClickInSnapshot = (nodeId: string) => {
    setSelectedNodeInSnapshot(selectedRun?.workflowSnapshot.nodes.find(n => n.id === nodeId) || null);
    setActiveDetailTab('data');
  };

  const handleCloseDialog = () => {
    setSelectedRun(null);
    setSelectedNodeInSnapshot(null);
    setActiveDetailTab('logs');
  };

  const renderNodeRunData = () => {
    if (!selectedNodeInSnapshot || !selectedRun) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <p className="text-sm text-muted-foreground">Select a node on the canvas to view its execution data.</p>
        </div>
      );
    }
    
    const nodeData = selectedRun.executionResult.finalWorkflowData[selectedNodeInSnapshot.id];
    if (!nodeData) return <div className="p-4 text-sm text-muted-foreground">No execution data found for this node.</div>;

    const { input, lastExecutionStatus, error_message, ...outputs } = nodeData;

    return (
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
           <div>
              <h4 className="font-medium text-sm mb-1.5">Status</h4>
              <p className="text-sm font-mono p-2 bg-background rounded-md">{lastExecutionStatus || 'unknown'}</p>
           </div>
           {error_message && (
              <div>
                <h4 className="font-medium text-sm mb-1.5 text-destructive">Error Message</h4>
                <p className="text-sm font-mono p-2 bg-destructive/10 text-destructive rounded-md">{error_message}</p>
              </div>
           )}
           <div>
              <h4 className="font-medium text-sm mb-1.5">Inputs</h4>
              <JsonSyntaxHighlighter jsonString={JSON.stringify(input || {}, null, 2)} className="bg-background rounded-md"/>
           </div>
           <div>
              <h4 className="font-medium text-sm mb-1.5">Outputs</h4>
              <JsonSyntaxHighlighter jsonString={JSON.stringify(outputs || {}, null, 2)} className="bg-background rounded-md"/>
           </div>
        </div>
      </ScrollArea>
    );
  }

  const renderLogs = () => {
    if (!selectedRun) return null;
    const logs = selectedRun.executionResult.serverLogs.map(log => ({ ...log, timestamp: new Date(log.timestamp).toLocaleTimeString() }));

    return (
       <ScrollArea className="flex-1 p-2">
          {logs.length === 0 ? <p className="text-xs text-muted-foreground/70 italic py-2 text-center">No logs recorded.</p> : (
              <div className="space-y-1.5 text-xs font-mono p-1">
              {logs.map((log, index) => (
                  <div key={index} className={cn("p-1.5 rounded-sm break-words", log.type === 'error' && 'bg-destructive/10 text-destructive', log.type === 'success' && 'bg-green-500/10 text-green-600 dark:text-green-400', log.type === 'info' && 'bg-primary/5 text-muted-foreground' )}>
                  <span className="font-medium opacity-70 mr-1.5">[{log.timestamp}]</span><span>{log.message}</span>
                  </div>
              ))}
              </div>
          )}
      </ScrollArea>
    );
  }


  return (
    <AppLayout>
      <div className="flex-1 flex flex-col p-6 bg-muted/40">
        <section className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Run History</h1>
              <p className="max-w-2xl text-muted-foreground">Review past executions, inspect data, and re-run failed jobs.</p>
            </div>
            <Button variant="outline" onClick={() => setShowClearConfirm(true)} disabled={runHistory.length === 0 || isLoading}><Trash2 className="mr-2 h-4 w-4" />Clear History</Button>
          </div>
        </section>

        {isLoading ? (
          <div className="text-center py-16 flex-1 flex flex-col items-center justify-center bg-card shadow-lg rounded-lg"><Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" /><p className="mt-4 text-muted-foreground">Loading Run History...</p></div>
        ) : runHistory.length === 0 ? (
          <div className="text-center py-16 flex-1 flex flex-col items-center justify-center bg-card shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
            <History className="h-20 w-20 text-muted-foreground mx-auto mb-5 opacity-70" />
            <p className="text-2xl text-muted-foreground font-semibold">No run history found.</p>
            <p className="text-md text-muted-foreground mt-3 mb-8">Go to the <Link href="/workflow" className="text-primary hover:underline font-medium">Workflow Editor</Link> and run a workflow to see its history here.</p>
            <Button asChild><Link href="/workflow"><Workflow className="mr-2 h-4 w-4" /> Go to Editor</Link></Button>
          </div>
        ) : (
          <Card className="shadow-sm flex-1 flex flex-col">
            <CardContent className="p-0 flex-1">
              <ScrollArea className="h-full">
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
      </div>
      
      {selectedRun && (
        <Dialog open={!!selectedRun} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="max-w-7xl w-[90vw] h-[90vh] flex flex-col">
            <DialogHeader>
               <div className="flex justify-between items-start">
                <div>
                    <DialogTitle className="text-xl">Run Details: {selectedRun.workflowName}</DialogTitle>
                    <DialogDescription>Executed on {format(new Date(selectedRun.timestamp), 'PPpp')}</DialogDescription>
                </div>
                <div className={cn("flex items-center gap-2 text-base font-semibold px-3 py-1 rounded-full",
                  selectedRun.status === 'Success' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-destructive/10 text-destructive dark:bg-destructive/40'
                )}>
                  {selectedRun.status === 'Success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  <span>{selectedRun.status}</span>
                </div>
              </div>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
                <div className="col-span-2 border rounded-md relative bg-muted/20 dot-grid-background">
                    <WorkflowCanvas
                        nodes={getNodesForRun(selectedRun)}
                        connections={selectedRun.workflowSnapshot.connections}
                        executionData={selectedRun.executionResult.finalWorkflowData}
                        readOnly={true}
                        onNodeClick={handleNodeClickInSnapshot}
                        selectedNodeId={selectedNodeInSnapshot?.id}
                        canvasOffset={selectedRun.workflowSnapshot.canvasOffset}
                        zoomLevel={selectedRun.workflowSnapshot.zoomLevel}
                    />
                </div>
                <div className="col-span-1 flex flex-col overflow-hidden border rounded-md bg-card">
                  <Tabs value={activeDetailTab} onValueChange={setActiveDetailTab} className="flex-1 flex flex-col">
                    <div className="p-2 border-b">
                      <TabsList className="grid w-full grid-cols-2 h-9">
                        <TabsTrigger value="logs" className="text-xs gap-1.5"><ListChecks className="h-4 w-4"/>Logs</TabsTrigger>
                        <TabsTrigger value="data" className="text-xs gap-1.5" disabled={!selectedNodeInSnapshot}>
                          <Database className="h-4 w-4"/>Node Data
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="logs" className="flex-1 overflow-hidden mt-0">
                       <div className="flex flex-col h-full">
                          <div className="p-3 border-b bg-muted/30">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><ListChecks className="h-4 w-4 text-primary"/>Execution Logs</h3>
                            <p className="text-xs text-muted-foreground">Server-side logs from the workflow execution.</p>
                          </div>
                          {renderLogs()}
                        </div>
                    </TabsContent>
                    <TabsContent value="data" className="flex-1 overflow-hidden mt-0">
                       <div className="flex flex-col h-full">
                          <div className="p-3 border-b bg-muted/30">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><Database className="h-4 w-4 text-primary"/>Node Data: {selectedNodeInSnapshot?.name}</h3>
                            <p className="text-xs text-muted-foreground">Snapshot of data for this node during the run.</p>
                          </div>
                          {renderNodeRunData()}
                       </div>
                    </TabsContent>
                  </Tabs>
                </div>
            </div>
            <DialogFooter className="pt-4 border-t">
                <Button 
                    variant="outline" 
                    disabled={isRerunning || !selectedRun.workflowSnapshot} 
                    onClick={() => handleRerun(selectedRun.id)}
                    title={!selectedRun.workflowSnapshot ? "Cannot re-run a workflow without a saved snapshot." : "Re-run this workflow with the same initial data."}
                >
                    {isRerunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                    {isRerunning ? 'Re-running...' : 'Re-run Workflow'}
                </Button>
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
    </AppLayout>
  );
}

export default withAuth(RunHistoryPage);
