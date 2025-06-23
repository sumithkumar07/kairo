
'use client';

import { useState, useRef, useEffect } from 'react';
import type { SuggestNextNodeOutput } from '@/ai/flows/suggest-next-node';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Loader2, Send, XCircle, FileText, Wand2, ChevronRight, ListChecks, Trash2, MousePointer2, Link as LinkIcon, Play, RotateCcw, Settings2, MessageSquare, Bot, User } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import { Label } from '@/components/ui/label';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { LogEntry, ChatMessage } from '@/types/workflow';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';


interface AIWorkflowAssistantPanelProps {
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
  onRunWorkflow: () => void;
  onToggleSimulationMode: (isSimulating: boolean) => void;
  isSimulationMode: boolean;
  chatHistory: ChatMessage[];
  isChatLoading: boolean;
  onChatSubmit: (message: string) => void;
  onClearChat: () => void;
  isExplainingWorkflow: boolean;
  workflowExplanation: string | null;
  onClearExplanation: () => void;
  initialCanvasSuggestion: SuggestNextNodeOutput | null;
  isLoadingSuggestion: boolean; 
  onAddSuggestedNode: (suggestedNodeTypeString: string) => void;
}

export function AIWorkflowAssistantPanel({
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
  onRunWorkflow,
  onToggleSimulationMode,
  isSimulationMode,
  chatHistory,
  isChatLoading,
  onChatSubmit,
  onClearChat,
  isExplainingWorkflow,
  workflowExplanation,
  onClearExplanation,
  initialCanvasSuggestion,
  isLoadingSuggestion, 
  onAddSuggestedNode,
}: AIWorkflowAssistantPanelProps) {
  const [chatInput, setChatInput] = useState('');
  const logsScrollAreaRef = useRef<HTMLDivElement>(null);
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsScrollAreaRef.current) {
      logsScrollAreaRef.current.scrollTop = logsScrollAreaRef.current.scrollHeight;
    }
  }, [executionLogs]);

  useEffect(() => {
    if (chatScrollAreaRef.current) {
      chatScrollAreaRef.current.scrollTop = chatScrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleLocalChatSubmit = () => {
    if (!chatInput.trim()) return;
    onChatSubmit(chatInput);
    setChatInput('');
  };

  const currentIsLoadingAnyAIButChat = isExplainingWorkflow || isLoadingSuggestion || isWorkflowRunning;
  const suggestedNodeConfig = initialCanvasSuggestion?.suggestedNode
    ? AVAILABLE_NODES_CONFIG.find(n => n.type === initialCanvasSuggestion.suggestedNode)
    : null;


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
            <XCircle className="mr-2 h-4 w-4" /> Back to Assistant
          </Button>
        </div>
      </div>
    );
  }
  
  if (selectedConnectionId && !selectedNodeId && !workflowExplanation && !isConnecting) {
     return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-primary" />
              Connection Selected
            </h2>
            <Button variant="ghost" size="xs" onClick={onDeselectConnection} title="Deselect connection (Esc)" className="h-7 px-1.5 text-xs">
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Details of the selected connection.</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 text-sm space-y-3">
              <p className="text-xs text-muted-foreground">
                  ID: <code className="text-xs bg-muted p-1 rounded">{selectedConnectionId.substring(0,12)}...</code>
              </p>
              <div className="pt-2">
                  <Button variant="destructive" size="sm" onClick={onDeleteSelectedConnection} title="Delete selected connection (Delete/Backspace)" className="w-full h-8 text-xs">
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Connection
                  </Button>
              </div>
          </div>
        </ScrollArea>
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
                        log.type === 'success' && 'bg-green-500/10 text-green-300',
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
  
  if (isConnecting) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <MousePointer2 className="h-4 w-4 text-primary" />
            Creating Connection
          </h2>
           <p className="text-xs text-muted-foreground">
             Click an output handle to start, then an input handle to connect.
           </p>
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
                        log.type === 'success' && 'bg-green-500/10 text-green-300',
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

  if (selectedNodeId) { 
    return null; 
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <CardHeader className="p-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              AI Workflow Assistant
            </CardTitle>
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="xs" onClick={onClearChat} title="Clear chat history" className="h-7 px-1.5 text-xs">
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="ml-1 hidden sm:inline">Clear Chat</span>
                </Button>
                <div title={isSimulationMode ? "Running in Simulation Mode" : "Running in Live Mode"} className="flex items-center space-x-1">
                    <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <Label htmlFor="simulation-mode-switch" className="text-xs text-muted-foreground cursor-pointer select-none">
                        Simulate
                    </Label>
                    <Switch
                        id="simulation-mode-switch"
                        checked={isSimulationMode}
                        onCheckedChange={onToggleSimulationMode}
                        aria-label="Toggle simulation mode"
                        className="h-5 w-9 [&>span]:h-4 [&>span]:w-4 [&>span[data-state=checked]]:translate-x-4 [&>span[data-state=unchecked]]:translate-x-0.5"
                    />
                </div>
            </div>
          </div>
          <CardDescription className="text-xs pt-0.5">Controls, AI chat, and execution logs.</CardDescription>
        </CardHeader>
      </div>
      <Button onClick={onRunWorkflow} disabled={currentIsLoadingAnyAIButChat || isChatLoading} className="w-full h-9 text-sm rounded-none border-x-0 border-t-0">
        {isWorkflowRunning ? (
          <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        {isWorkflowRunning ? 'Executing...' : `Run Workflow ${isSimulationMode ? '(Simulated)' : '(Live)'}`}
      </Button>

      <ScrollArea className="flex-1 p-4" viewportRef={chatScrollAreaRef}>
        <div className="space-y-3">
          {chatHistory.length === 0 && isCanvasEmpty && !isLoadingSuggestion && initialCanvasSuggestion && suggestedNodeConfig && (
            <Card className="p-3.5 bg-primary/10 text-primary-foreground/90 border border-primary/30 space-y-2.5 shadow-md mb-3">
                <p className="font-semibold flex items-center gap-2 text-sm">
                  <Wand2 className="h-4 w-4 text-primary" />
                  Start with a <span className="text-primary">{suggestedNodeConfig.name}</span> node?
                </p>
                <p className="text-xs text-primary-foreground/80 italic ml-6 leading-relaxed break-words">{initialCanvasSuggestion.reason}</p>
                <Button
                  size="sm"
                  onClick={() => onAddSuggestedNode(initialCanvasSuggestion.suggestedNode)}
                  className="w-full bg-primary/80 hover:bg-primary text-primary-foreground mt-1.5 h-8 text-xs"
                  disabled={currentIsLoadingAnyAIButChat || isChatLoading}
                >
                  Add {suggestedNodeConfig.name} Node
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
              </Card>
          )}
          {chatHistory.length === 0 && isCanvasEmpty && isLoadingSuggestion && (
              <Card className="p-3 bg-muted/40 text-sm text-muted-foreground flex items-center justify-center gap-2 border-border shadow-sm mb-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>AI is thinking of a good starting point...</span>
              </Card>
            )}
          {chatHistory.length === 0 && isCanvasEmpty && !isLoadingSuggestion && !initialCanvasSuggestion && (
              <div className="p-3 bg-primary/5 text-sm text-primary-foreground/80 border border-primary/10 rounded-md mb-3">
                AI could not suggest a starting point. Try describing your workflow in the prompt below or drag a node from the library.
              </div>
            )}
          {chatHistory.map((chat) => (
            chat.sender === 'user' ? (
              <div key={chat.id} className="flex items-end justify-end gap-2.5 mb-3">
                <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-3 bg-primary text-primary-foreground rounded-xl rounded-ee-none shadow">
                  <p className="text-sm font-normal whitespace-pre-wrap break-words">{chat.message}</p>
                  <span className="text-xs text-primary-foreground/80 self-end mt-1.5">{chat.timestamp}</span>
                </div>
                <User className="h-7 w-7 text-foreground rounded-full p-1 bg-muted shadow-sm shrink-0" />
              </div>
            ) : (
              <div key={chat.id} className="flex items-end gap-2.5 mb-3">
                <Bot className="h-7 w-7 text-primary rounded-full p-1 bg-primary/10 shadow-sm shrink-0" />
                <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-3 border-border bg-muted rounded-xl rounded-es-none shadow">
                  <p className="text-sm font-normal text-foreground whitespace-pre-wrap break-words">{chat.message}</p>
                  <span className="text-xs text-muted-foreground/80 self-end mt-1.5">{chat.timestamp}</span>
                </div>
              </div>
            )
          ))}
          {isChatLoading && (
             <div className="flex items-end gap-2.5 mb-3">
              <Bot className="h-7 w-7 text-primary rounded-full p-1 bg-primary/10 shadow-sm shrink-0" />
              <div className="flex flex-col w-full max-w-[80px] leading-1.5 p-3.5 border-border bg-muted rounded-xl rounded-es-none shadow items-center">
                <div className="flex space-x-1.5 items-center justify-center">
                  <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t bg-background/80 space-y-1.5 flex flex-col mt-auto">
        <Label htmlFor="ai-chat-textarea" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 pl-0.5">
          <MessageSquare className="h-3.5 w-3.5 text-primary" /> Chat with Kairo (or describe a workflow to generate)
        </Label>
        <div className="flex gap-2 items-end">
          <Textarea
            id="ai-chat-textarea"
            placeholder="Ask about Kairo, or describe a workflow to generate..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 text-sm resize-none min-h-[40px] max-h-[120px]"
            rows={1}
            disabled={isChatLoading || currentIsLoadingAnyAIButChat}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleLocalChatSubmit(); } }}
          />
          <Button
            onClick={handleLocalChatSubmit}
            disabled={isChatLoading || currentIsLoadingAnyAIButChat || !chatInput.trim()}
            className="h-auto py-2.5 self-end min-h-[40px]"
            size="default"
            title="Send message (Enter)"
          >
            {isChatLoading ? (
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
                      log.type === 'success' && 'bg-green-500/10 text-green-300',
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
