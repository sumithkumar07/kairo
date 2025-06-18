
'use client';

import { useState, useRef, useEffect } from 'react';
import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';
import type { SuggestNextNodeOutput } from '@/ai/flows/suggest-next-node';
import { enhanceAndGenerateWorkflow } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2, Send, XCircle, FileText, Wand2, ChevronRight, Sparkles, ListChecks, Trash2, MousePointer2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { LogEntry } from '@/types/workflow';
import { cn } from '@/lib/utils';


interface AIWorkflowAssistantPanelProps {
  onWorkflowGenerated: (workflow: GenerateWorkflowFromPromptOutput) => void;
  setIsLoadingGlobal: (isLoading: boolean) => void; // For full workflow generation overlay
  isExplainingWorkflow: boolean;
  workflowExplanation: string | null;
  onClearExplanation: () => void;
  initialCanvasSuggestion: SuggestNextNodeOutput | null;
  isLoadingSuggestion: boolean; // For suggestions, explanations within this panel
  onAddSuggestedNode: (suggestedNodeTypeString: string) => void;
  isCanvasEmpty: boolean;
  executionLogs: LogEntry[];
  onClearLogs: () => void;
  isWorkflowRunning: boolean;
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  onDeleteSelectedConnection: () => void;
  onDeselectConnection: () => void;
  isConnecting: boolean;
  onCancelConnection: () => void;
}

export function AIWorkflowAssistantPanel({
  onWorkflowGenerated,
  setIsLoadingGlobal,
  isExplainingWorkflow,
  workflowExplanation,
  onClearExplanation,
  initialCanvasSuggestion,
  isLoadingSuggestion,
  onAddSuggestedNode,
  isCanvasEmpty,
  executionLogs,
  onClearLogs,
  isWorkflowRunning,
  selectedNodeId,
  selectedConnectionId,
  onDeleteSelectedConnection,
  onDeselectConnection,
  isConnecting,
  onCancelConnection,
}: AIWorkflowAssistantPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoadingLocalPrompt, setIsLoadingLocalPrompt] = useState(false); // For AI prompt bar in this panel
  const { toast } = useToast();
  const logsScrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsScrollAreaRef.current) {
      logsScrollAreaRef.current.scrollTop = logsScrollAreaRef.current.scrollHeight;
    }
  }, [executionLogs]);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt is empty',
        description: 'Please describe the workflow you want to generate.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingLocalPrompt(true);
    setIsLoadingGlobal(true); // Trigger full-screen loader for major AI task
    try {
      const result = await enhanceAndGenerateWorkflow({ originalPrompt: prompt });
      onWorkflowGenerated(result);
      toast({
        title: 'Workflow Generated!',
        description: 'The AI has processed your prompt and generated a workflow.',
      });
      // setPrompt(''); // Keep prompt for refinement
    } catch (error: any) {
      console.error('AI generation error:', error);
      toast({
        title: 'Error Generating Workflow',
        description: error.message || 'An unknown error occurred while contacting the AI.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLocalPrompt(false);
      setIsLoadingGlobal(false);
    }
  };


  const currentIsLoadingAnyAI = isLoadingLocalPrompt || isExplainingWorkflow || isLoadingSuggestion || isWorkflowRunning;

  const suggestedNodeConfig = initialCanvasSuggestion?.suggestedNode
    ? AVAILABLE_NODES_CONFIG.find(n => n.type === initialCanvasSuggestion.suggestedNode)
    : null;

  // If explaining workflow, show only explanation and clear button
  if (workflowExplanation || isExplainingWorkflow) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Workflow Explanation
          </h2>
          <p className="text-xs text-muted-foreground">AI-generated summary of the current workflow.</p>
        </div>
        <ScrollArea className="p-4 flex-1">
          {isExplainingWorkflow ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="ml-2.5 text-sm text-muted-foreground">AI is analyzing...</p>
            </div>
          ) : workflowExplanation ? (
            <Card className="p-3 bg-accent/10 text-sm text-accent-foreground/90 space-y-2 whitespace-pre-wrap leading-relaxed border-accent/20 shadow-sm break-words">
              {workflowExplanation}
            </Card>
          ) : (
             <p className="text-muted-foreground text-center p-4 text-sm">No explanation available.</p>
          )}
        </ScrollArea>
        <div className="p-3 border-t bg-background/50 mt-auto">
          <Button variant="outline" onClick={onClearExplanation} className="w-full h-9 text-sm">
            <XCircle className="mr-2 h-4 w-4" /> Back to AI Prompt
          </Button>
        </div>
      </div>
    );
  }

  // If a connection is selected, show connection management UI
  if (selectedConnectionId && !selectedNodeId && !workflowExplanation && !isConnecting) {
     return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <MousePointer2 className="h-4 w-4 text-primary" />
            Connection Selected
          </h2>
           <p className="text-xs text-muted-foreground">Manage the selected connection.</p>
        </div>
        <div className="p-6 text-center flex flex-col items-center justify-center flex-1 space-y-3">
            <p className="text-sm text-muted-foreground">
                Connection ID: <code className="text-xs bg-muted p-1 rounded">{selectedConnectionId.substring(0,8)}...</code>
            </p>
            <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={onDeleteSelectedConnection} title="Delete selected connection (Delete/Backspace)">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Connection
                </Button>
                <Button variant="outline" size="sm" onClick={onDeselectConnection} title="Deselect connection (Esc)">
                    <XCircle className="mr-2 h-4 w-4" /> Deselect
                </Button>
            </div>
        </div>
        <Accordion type="single" collapsible className="w-full border-t mt-auto">
          <AccordionItem value="logs" className="border-b-0">
            <AccordionTrigger className="px-4 py-2.5 text-xs font-medium text-muted-foreground hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Execution Logs {isWorkflowRunning && <Loader2 className="h-3 w-3 animate-spin" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-muted/20">
              <div className="flex justify-between items-center px-4 pt-2 pb-1">
                <p className="text-xs text-muted-foreground">Workflow execution output will appear here.</p>
                <Button variant="ghost" size="xs" onClick={onClearLogs} disabled={executionLogs.length === 0 || isWorkflowRunning} className="h-6 text-xs">
                  <Trash2 className="mr-1.5 h-3 w-3" /> Clear Logs
                </Button>
              </div>
              <ScrollArea className="h-40 px-4 pb-2" viewportRef={logsScrollAreaRef}>
                {executionLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground/70 italic py-2 break-words">No logs yet. Run the workflow to see output.</p>
                ) : (
                  <div className="space-y-1.5 text-xs font-mono">
                    {executionLogs.map((log, index) => (
                      <div key={index} className={cn(
                        "p-1.5 rounded-sm text-opacity-90 break-words",
                        log.type === 'error' && 'bg-destructive/10 text-destructive-foreground/90',
                        log.type === 'success' && 'bg-green-500/10 text-green-700 dark:text-green-300',
                        log.type === 'info' && 'bg-primary/5 text-primary-foreground/80'
                      )}>
                        <span className="font-medium opacity-70 mr-1.5">[{log.timestamp || new Date().toLocaleTimeString()}]</span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }
  
  // If currently making a connection
  if (isConnecting) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <MousePointer2 className="h-4 w-4 text-primary" />
            Creating Connection
          </h2>
           <p className="text-xs text-muted-foreground">Connect nodes on the canvas.</p>
        </div>
        <div className="p-6 text-center flex flex-col items-center justify-center flex-1">
            <p className="text-sm text-muted-foreground mb-4">
                Click an input handle on a target node to complete the connection. <br/>Press <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-neutral-700 dark:text-gray-100 dark:border-neutral-600">Esc</kbd> to cancel.
            </p>
            <Button variant="outline" size="sm" onClick={onCancelConnection}>
                <XCircle className="mr-2 h-4 w-4" /> Cancel Connection
            </Button>
        </div>
         <Accordion type="single" collapsible className="w-full border-t mt-auto">
          <AccordionItem value="logs" className="border-b-0">
            <AccordionTrigger className="px-4 py-2.5 text-xs font-medium text-muted-foreground hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/30">
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Execution Logs {isWorkflowRunning && <Loader2 className="h-3 w-3 animate-spin" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-muted/20">
              <div className="flex justify-between items-center px-4 pt-2 pb-1">
                <p className="text-xs text-muted-foreground">Workflow execution output will appear here.</p>
                <Button variant="ghost" size="xs" onClick={onClearLogs} disabled={executionLogs.length === 0 || isWorkflowRunning} className="h-6 text-xs">
                  <Trash2 className="mr-1.5 h-3 w-3" /> Clear Logs
                </Button>
              </div>
              <ScrollArea className="h-40 px-4 pb-2" viewportRef={logsScrollAreaRef}>
                {executionLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground/70 italic py-2 break-words">No logs yet. Run the workflow to see output.</p>
                ) : (
                  <div className="space-y-1.5 text-xs font-mono">
                    {executionLogs.map((log, index) => (
                      <div key={index} className={cn(
                        "p-1.5 rounded-sm text-opacity-90 break-words",
                        log.type === 'error' && 'bg-destructive/10 text-destructive-foreground/90',
                        log.type === 'success' && 'bg-green-500/10 text-green-700 dark:text-green-300',
                        log.type === 'info' && 'bg-primary/5 text-primary-foreground/80'
                      )}>
                        <span className="font-medium opacity-70 mr-1.5">[{log.timestamp || new Date().toLocaleTimeString()}]</span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  }


  // Default view: AI prompt and initial suggestions (unless a node is selected)
  if (selectedNodeId) { // NodeConfigPanel is expected to be rendered by the parent if selectedNodeId is set
    return null; 
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          AI Workflow Assistant
        </h2>
        <p className="text-xs text-muted-foreground">Describe your automation needs to the AI.</p>
      </div>

      <ScrollArea className="flex-shrink-0"> 
        <div className="p-4 space-y-5">
          {isCanvasEmpty && isLoadingSuggestion && (
            <Card className="p-3 bg-muted/40 text-sm text-muted-foreground flex items-center justify-center gap-2 border-border shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI is thinking of a good starting point...</span>
            </Card>
          )}

          {isCanvasEmpty && !isLoadingSuggestion && initialCanvasSuggestion && suggestedNodeConfig && (
            <Card className="p-3.5 bg-primary/10 text-primary-foreground/90 border border-primary/30 space-y-2.5 shadow-md">
              <p className="font-semibold flex items-center gap-2 text-sm">
                <Wand2 className="h-4 w-4 text-primary" />
                Start with a <span className="text-primary">{suggestedNodeConfig.name}</span> node?
              </p>
              <p className="text-xs text-primary-foreground/80 italic ml-6 leading-relaxed break-words">{initialCanvasSuggestion.reason}</p>
              <Button
                size="sm"
                onClick={() => onAddSuggestedNode(initialCanvasSuggestion.suggestedNode)}
                className="w-full bg-primary/80 hover:bg-primary text-primary-foreground mt-1.5 h-8 text-xs"
                disabled={currentIsLoadingAnyAI}
              >
                Add {suggestedNodeConfig.name} Node
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </Card>
          )}

          {!isCanvasEmpty && !workflowExplanation && !selectedNodeId && !selectedConnectionId && !isConnecting && (
             <div className="p-3 bg-primary/5 text-sm text-primary-foreground/80 border border-primary/10 rounded-md"> 
              Hi! I&apos;m your AI assistant. Describe what you want to automate, or select a node/connection for more options.
            </div>
          )}

          {isCanvasEmpty && !initialCanvasSuggestion && !isLoadingSuggestion && (
             <div className="p-3 bg-primary/5 text-sm text-primary-foreground/80 border border-primary/10 rounded-md">
              Your canvas is empty! Describe your desired workflow to the AI below.
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t bg-background/60 space-y-2 flex flex-col flex-1 mt-auto">
        <Label htmlFor="ai-prompt-textarea" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 pl-0.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Describe your workflow to the AI
        </Label>
        
        <div className="flex gap-2 flex-1 items-stretch">
          <Textarea
            id="ai-prompt-textarea"
            placeholder="e.g., 'When a new file is uploaded to a folder, read its content, summarize it with AI, and then send the summary to a Slack channel...'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 text-sm resize-none min-h-[60px]"
            disabled={currentIsLoadingAnyAI}
          />
          <Button
            onClick={handleSubmit}
            disabled={currentIsLoadingAnyAI || !prompt.trim()}
            className="h-auto py-2 self-end min-h-[40px]"
            size="default"
            title="Generate workflow with AI (Ctrl+Enter)"
          >
            {isLoadingLocalPrompt ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <Accordion type="single" collapsible className="w-full border-t">
        <AccordionItem value="logs" className="border-b-0">
          <AccordionTrigger className="px-4 py-2.5 text-xs font-medium text-muted-foreground hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/30">
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Execution Logs {isWorkflowRunning && <Loader2 className="h-3 w-3 animate-spin" />}
            </div>
          </AccordionTrigger>
          <AccordionContent className="bg-muted/20">
            <div className="flex justify-between items-center px-4 pt-2 pb-1">
              <p className="text-xs text-muted-foreground">Workflow execution output will appear here.</p>
              <Button variant="ghost" size="xs" onClick={onClearLogs} disabled={executionLogs.length === 0 || isWorkflowRunning} className="h-6 text-xs">
                <Trash2 className="mr-1.5 h-3 w-3" /> Clear Logs
              </Button>
            </div>
            <ScrollArea className="h-40 px-4 pb-2" viewportRef={logsScrollAreaRef}>
              {executionLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground/70 italic py-2 break-words">No logs yet. Run the workflow to see output.</p>
              ) : (
                <div className="space-y-1.5 text-xs font-mono">
                  {executionLogs.map((log, index) => (
                    <div key={index} className={cn(
                      "p-1.5 rounded-sm text-opacity-90 break-words",
                      log.type === 'error' && 'bg-destructive/10 text-destructive-foreground/90',
                      log.type === 'success' && 'bg-green-500/10 text-green-700 dark:text-green-300',
                      log.type === 'info' && 'bg-primary/5 text-primary-foreground/80'
                    )}>
                      <span className="font-medium opacity-70 mr-1.5">[{log.timestamp || new Date().toLocaleTimeString()}]</span>
                      <span>{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

