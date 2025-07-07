
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Workflow, History, CheckCircle2, XCircle, Trash2, Code2, Eye, ListChecks, FileJson, Edit3, Loader2, RefreshCw, AlertTriangle, Database, Bot, Sparkles, Search } from 'lucide-react';
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
import {
  rerunWorkflowAction,
  diagnoseWorkflowError,
  getRunHistoryAction,
  clearRunHistoryAction,
} from '@/app/actions';
import type { DiagnoseWorkflowErrorOutput } from '@/ai/flows/diagnose-workflow-error-flow';
import { WorkflowCanvas } from '@/components/workflow-canvas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Input } from '@/components/ui/input';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from 'next/navigation';


const DataViewer = React.memo(({ data, className }: { data: any; className?: string; }) => {
    if (data === null || data === undefined) {
        return <pre className={cn("text-xs p-2 text-muted-foreground", className)}>null</pre>;
    }

    if (typeof data === 'string' && data.startsWith('data:audio/wav;base64,')) {
        return (
            <div className="p-2">
                <audio controls className="w-full">
                    <source src={data} type="audio/wav" />
                    Your browser does not support the audio element.
                </audio>
            </div>
        );
    }
    
    try {
        const jsonString = JSON.stringify(data, null, 2);
        const highlighted = jsonString.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
            let cls = 'text-green-400 dark:text-green-400';
            if (/^"/.test(match)) {
                cls = /:$/.test(match) ? 'text-cyan-400 dark:text-cyan-300' : 'text-amber-400 dark:text-amber-300';
            }
            return `<span class="${cls}">${match}</span>`;
        });
        return <pre className={cn("text-xs p-2", className)} dangerouslySetInnerHTML={{ __html: highlighted }} />;
    } catch {
        return <pre className={cn("text-xs p-2 text-destructive", className)}>{String(data)}</pre>;
    }
});
DataViewer.displayName = 'DataViewer';

function RunHistoryPage() {
  const [runHistory, setRunHistory] = useState<WorkflowRunRecord[]>([]);
  const [selectedRun, setSelectedRun] = useState<WorkflowRunRecord | null>(null);
  const [selectedNodeInSnapshot, setSelectedNodeInSnapshot] = useState<WorkflowNode | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState('logs');
  const [isRerunning, setIsRerunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { toast } = useToast();
  const { isDiamondOrTrial } = useSubscription();
  const router = useRouter();

  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnoseWorkflowErrorOutput | null>(null);
  const [diagnosingRunId, setDiagnosingRunId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'success', 'failed'


  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const history = await getRunHistoryAction();
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

  const filteredHistory = useMemo(() => {
    return runHistory
      .filter(run => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'success' && run.status === 'Success') return true;
        if (statusFilter === 'failed' && run.status === 'Failed') return true;
        return false;
      })
      .filter(run => {
        if (!searchTerm.trim()) return true;
        return run.workflowName.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [runHistory, searchTerm, statusFilter]);
  
  const handleRerun = async (runId: string) => {
    setIsRerunning(true);
    try {
      await rerunWorkflowAction(runId);
      toast({ title: 'Workflow Re-run', description: 'The workflow has been successfully re-run. Check history for new record.' });
      handleCloseDialog();
      await loadHistory();
    } catch (e: any) {
      toast({ title: 'Re-run Failed', description: e.message, variant: 'destructive' });
    } finally {
      setIsRerunning(false);
    }
  };

  const handleDiagnoseError = useCallback(async (run: WorkflowRunRecord) => {
    if (!isDiamondOrTrial) {
      toast({ title: 'Diamond Feature', description: 'AI Error Diagnosis is a premium feature. Please upgrade your plan.', variant: 'default' });
      return;
    }
    if (diagnosingRunId === run.id) return; // Prevent re-running if already done for this run

    setIsDiagnosing(true);
    setDiagnosingRunId(run.id);
    setDiagnosis(null);
    setActiveDetailTab('diagnosis');
    try {
        const result = await diagnoseWorkflowError({
            nodes: run.workflowSnapshot.nodes,
            connections: run.workflowSnapshot.connections,
            serverLogs: run.executionResult.serverLogs,
        });
        setDiagnosis(result);
    } catch (e: any) {
        toast({ title: 'Diagnosis Failed', description: e.message, variant: 'destructive' });
        setDiagnosis({ diagnosis: 'AI analysis failed.', recommendedFix: 'Could not generate a recommendation. Please check the server logs for more details.' });
    } finally {
        setIsDiagnosing(false);
    }
  }, [isDiamondOrTrial, toast, diagnosingRunId]);
  
  useEffect(() => {
    if (selectedRun && selectedRun.status === 'Failed' && diagnosingRunId !== selectedRun.id) {
        handleDiagnoseError(selectedRun);
    }
  }, [selectedRun, diagnosingRunId, handleDiagnoseError]);

  const clearHistory = async () => {
    try {
      await clearRunHistoryAction();
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
    setDiagnosis(null);
    setDiagnosingRunId(null);
  };
  
  const handleLoadCorrectedWorkflow = (correctedWorkflow: any) => {
    if (typeof window !== 'undefined' && correctedWorkflow) {
        localStorage.setItem('kairoCorrectedWorkflow', JSON.stringify(correctedWorkflow));
        localStorage.setItem('kairoCorrectedWorkflowOriginalName', selectedRun?.workflowName || 'Workflow');
        router.push('/workflow');
        handleCloseDialog();
    }
  };

  const handleViewDetails = (run: WorkflowRunRecord) => {
    setSelectedRun(run);
    if (run.status === 'Failed') {
      setActiveDetailTab('diagnosis');
    } else {
      setActiveDetailTab('logs');
    }
  };

  const handleLoadSnapshot = (run: WorkflowRunRecord) => {
    if (!run.workflowSnapshot) {
      toast({
        title: 'Snapshot Not Available',
        description: 'This run record does not contain a workflow snapshot.',
        variant: 'destructive',
      });
      return;
    }

    const snapshotName = `${run.workflowName} (Snapshot @ ${format(new Date(run.timestamp), 'h:mm a')})`;
    
    localStorage.setItem('kairoCurrentWorkflow', JSON.stringify({
        name: snapshotName, 
        workflow: run.workflowSnapshot 
    }));
    
    toast({
      title: 'Workflow Snapshot Loaded',
      description: 'The exact workflow version from this run is now in the editor.',
    });
    router.push('/workflow');
    handleCloseDialog();
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
              <DataViewer data={input || {}} className="bg-background rounded-md"/>
           </div>
           <div>
              <h4 className="font-medium text-sm mb-1.5">Outputs</h4>
              <DataViewer data={outputs || {}} className="bg-background rounded-md"/>
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

  const renderDiagnosis = () => {
    if (isDiagnosing) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">AI is analyzing the error...</p>
            </div>
        );
    }

    if (!diagnosis) {
         return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <p className="text-sm text-muted-foreground">Click the "Ask AI to Debug" button to get an analysis of this error.</p>
            </div>
        );
    }
    
    return (
        <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
                <div>
                    <h4 className="font-semibold text-sm mb-1.5 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Diagnosis</h4>
                    <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">{diagnosis.diagnosis}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-sm mb-1.5 flex items-center gap-2"><Edit3 className="h-4 w-4 text-green-500" /> Recommended Fix</h4>
                    <p className="text-sm p-3 bg-muted rounded-md whitespace-pre-wrap">{diagnosis.recommendedFix}</p>
                </div>
                {diagnosis.correctedWorkflow && (
                    <div className="pt-2">
                        <Button onClick={() => handleLoadCorrectedWorkflow(diagnosis.correctedWorkflow)} className="w-full">
                            <Workflow className="mr-2 h-4 w-4" /> Load Corrected Workflow into Editor
                        </Button>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center py-16 flex-1 flex flex-col items-center justify-center bg-card shadow-lg rounded-lg"><Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" /><p className="mt-4 text-muted-foreground">Loading Run History...</p></div>;
    }
    if (runHistory.length === 0) {
      return (
        <div className="text-center py-16 flex-1 flex flex-col items-center justify-center bg-card shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
          <History className="h-20 w-20 text-muted-foreground mx-auto mb-5 opacity-70" />
          <p className="text-2xl text-muted-foreground font-semibold">No run history found.</p>
          <p className="text-md text-muted-foreground mt-3 mb-8">Go to the <Link href="/workflow" className="text-primary hover:underline font-medium">Workflow Editor</Link> and run a workflow to see its history here.</p>
          <Button asChild><Link href="/workflow"><Workflow className="mr-2 h-4 w-4" /> Go to Editor</Link></Button>
        </div>
      );
    }
    return (
      <Card className="shadow-sm flex-1 flex flex-col">
        <CardContent className="p-0 flex-1">
          <ScrollArea className="h-full">
            <div className="divide-y divide-border">
              {filteredHistory.length > 0 ? filteredHistory.map((run) => (
                <div key={run.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">{getStatusIndicator(run.status)}
                    <div>
                      <p className="font-semibold text-foreground truncate" title={run.workflowName}>{run.workflowName}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(run.timestamp), 'PPpp')} ({formatDistanceToNow(new Date(run.timestamp), { addSuffix: true })})</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(run)}><Eye className="mr-2 h-4 w-4" />View Details</Button>
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-16">
                    <p className="text-lg font-medium">No runs match your filters.</p>
                    <p className="text-sm">Try adjusting your search term or status filter.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }


  return (
    <AppLayout>
      <div className="flex-1 flex flex-col p-6 bg-muted/40">
        <section className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Run History</h1>
              <p className="max-w-2xl text-muted-foreground">Review past executions, inspect data, and re-run failed jobs.</p>
            </div>
            <Button variant="outline" onClick={() => setShowClearConfirm(true)} disabled={runHistory.length === 0 || isLoading}><Trash2 className="mr-2 h-4 w-4" />Clear History</Button>
          </div>
        </section>

        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by workflow name..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={runHistory.length === 0 || isLoading}
            />
          </div>
          <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
            <TabsList className="h-9" aria-disabled={runHistory.length === 0 || isLoading}>
              <TabsTrigger value="all" disabled={runHistory.length === 0 || isLoading}>All</TabsTrigger>
              <TabsTrigger value="success" disabled={runHistory.length === 0 || isLoading}>Success</TabsTrigger>
              <TabsTrigger value="failed" disabled={runHistory.length === 0 || isLoading}>Failed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {renderContent()}
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
                      <TabsList className="grid w-full grid-cols-3 h-9">
                        <TabsTrigger value="diagnosis" className="text-xs gap-1.5" disabled={selectedRun.status !== 'Failed'}>
                          <Bot className="h-4 w-4"/>AI Diagnosis
                        </TabsTrigger>
                        <TabsTrigger value="logs" className="text-xs gap-1.5"><ListChecks className="h-4 w-4"/>Logs</TabsTrigger>
                        <TabsTrigger value="data" className="text-xs gap-1.5" disabled={!selectedNodeInSnapshot}>
                          <Database className="h-4 w-4"/>Node Data
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="diagnosis" className="flex-1 overflow-hidden mt-0">
                       <div className="flex flex-col h-full">
                          <div className="p-3 border-b bg-muted/30">
                            <h3 className="font-semibold text-foreground flex items-center gap-2"><Bot className="h-4 w-4 text-primary"/>AI Error Diagnosis</h3>
                            <p className="text-xs text-muted-foreground">AI-powered analysis of the workflow failure.</p>
                          </div>
                          {renderDiagnosis()}
                       </div>
                    </TabsContent>
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
            <DialogFooter className="pt-4 border-t flex justify-between">
                <div>
                   {selectedRun.status === 'Failed' && (
                     <TooltipProvider>
                       <Tooltip>
                         <TooltipTrigger asChild>
                           <span>
                             <Button variant="outline" onClick={() => handleDiagnoseError(selectedRun)} disabled={isDiagnosing || !isDiamondOrTrial}>
                               {isDiagnosing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Bot className="mr-2 h-4 w-4"/>}
                               {isDiagnosing ? 'Diagnosing...' : 'Re-run Diagnosis'}
                             </Button>
                           </span>
                         </TooltipTrigger>
                         {!isDiamondOrTrial && (
                           <TooltipContent>
                             <p>AI Error Diagnosis is a Diamond tier feature. Please upgrade your plan.</p>
                           </TooltipContent>
                         )}
                       </Tooltip>
                     </TooltipProvider>
                   )}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        disabled={!selectedRun.workflowSnapshot}
                        onClick={() => handleLoadSnapshot(selectedRun)}
                        title="Load this exact workflow version into the editor."
                    >
                        <FileJson className="mr-2 h-4 w-4" />
                        Load Snapshot
                    </Button>
                    <Button 
                        variant="outline" 
                        disabled={isRerunning || !selectedRun.workflowSnapshot} 
                        onClick={() => handleRerun(selectedRun.id)}
                        title={!selectedRun.workflowSnapshot ? "Cannot re-run a workflow without a saved snapshot." : "Re-run this workflow with the same initial data."}
                    >
                        {isRerunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
                        {isRerunning ? 'Re-running...' : 'Re-run'}
                    </Button>
                    <DialogClose asChild><Button type="button" variant="default">Close</Button></DialogClose>
                </div>
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
