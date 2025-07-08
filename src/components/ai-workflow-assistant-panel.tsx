
'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import type { SuggestNextNodeOutput, Tool } from '@/types/workflow';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Loader2, Send, XCircle, FileText, Wand2, ChevronRight, ListChecks, Trash2, MousePointer2, Link as LinkIcon, Play, RotateCcw, Settings2, MessageSquare, Bot, User, Power, TestTube2, AlertTriangle, Paperclip, X, StopCircle, Volume2, AlertCircle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import { Label } from '@/components/ui/label';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { ChatMessage } from '@/types/workflow';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { textToSpeechAction } from '@/app/actions';
import { ALL_AVAILABLE_TOOLS } from '@/ai/tools';


interface AIWorkflowAssistantPanelProps {
  isCanvasEmpty: boolean;
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
  onChatSubmit: (message: string, imageDataUri?: string) => void;
  onClearChat: () => void;
  isExplainingWorkflow: boolean;
  workflowExplanation: string | null;
  onClearExplanation: () => void;
  initialCanvasSuggestion: SuggestNextNodeOutput | null;
  isLoadingSuggestion: boolean;
  onAddSuggestedNode: (suggestedNodeTypeString: string) => void;
  enabledTools: string[];
}

export function AIWorkflowAssistantPanel({
  isCanvasEmpty,
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
  enabledTools,
}: AIWorkflowAssistantPanelProps) {
  const [chatInput, setChatInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatScrollAreaRef = useRef<HTMLDivElement>(null);
  const [activeAudio, setActiveAudio] = useState<{ id: string; status: 'loading' | 'playing' | 'error'; audio?: HTMLAudioElement } | null>(null);

  const availableSkills = useMemo(() => {
    return ALL_AVAILABLE_TOOLS.filter(tool => enabledTools.includes(tool.name));
  }, [enabledTools]);

  useEffect(() => {
    if (chatScrollAreaRef.current) {
      chatScrollAreaRef.current.scrollTop = chatScrollAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleLocalChatSubmit = () => {
    if (!chatInput.trim() && !attachedImage) return;
    onChatSubmit(chatInput, attachedImage || undefined);
    setChatInput('');
    setAttachedImage(null);
  };
  
  const handleAttachImage = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        alert('File is too large. Please select an image under 4MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleListen = async (message: ChatMessage) => {
    if (activeAudio?.id === message.id && activeAudio.status === 'playing') {
      activeAudio.audio?.pause();
      setActiveAudio(null);
      return;
    }
    
    if (activeAudio?.audio) {
      activeAudio.audio.pause();
    }

    setActiveAudio({ id: message.id, status: 'loading' });

    try {
      const result = await textToSpeechAction({ text: message.message });
      const audio = new Audio(result.audioDataUri);
      
      audio.onended = () => setActiveAudio(null);
      audio.onerror = () => setActiveAudio({ id: message.id, status: 'error' });

      await audio.play();
      setActiveAudio({ id: message.id, status: 'playing', audio });
    } catch (error) {
      console.error("TTS Error:", error);
      setActiveAudio({ id: message.id, status: 'error' });
    }
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
            <Card className="p-3 bg-accent/20 dark:bg-accent/10 text-sm text-accent-foreground/90 space-y-2 whitespace-pre-wrap leading-relaxed border-accent/20 shadow-sm break-words">
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
      </div>
    );
  }

  if (selectedNodeId) { 
    return null; 
  }

  return (
    <div className="flex flex-col h-full bg-card">
      <div id="run-controls-panel" className="p-3 border-b space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2 select-none">
            <Power className="h-4 w-4 text-muted-foreground" /> Run Controls
          </Label>
          <div title={isSimulationMode ? "Simulation Mode: Uses mock data, no real API calls." : "Live Mode: Interacts with real services, may incur costs."} className="flex items-center space-x-2">
            <TestTube2 className={cn("h-4 w-4", !isSimulationMode && "text-muted-foreground")} />
            <Switch id="simulation-mode-switch" checked={!isSimulationMode} onCheckedChange={(checked) => onToggleSimulationMode(!checked)} aria-label="Toggle simulation mode" className="h-5 w-9 [&>span]:h-4 [&>span]:w-4 data-[state=checked]:bg-green-600 [&>span[data-state=checked]]:translate-x-4 [&>span[data-state=unchecked]]:translate-x-0.5" />
            <AlertTriangle className={cn("h-4 w-4", isSimulationMode && "text-muted-foreground")} />
          </div>
        </div>
        <Button onClick={onRunWorkflow} disabled={currentIsLoadingAnyAIButChat || isChatLoading} className="w-full h-9 text-sm">
          {isWorkflowRunning ? <RotateCcw className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
          {isWorkflowRunning ? 'Executing...' : `Run in ${isSimulationMode ? 'Simulation Mode' : 'Live Mode'}`}
        </Button>
      </div>

      <div className="p-3 border-b flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2 select-none">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          AI Assistant Chat
        </Label>
        {chatHistory.length > 0 && (
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClearChat} title="Clear chat history">
                  <Trash2 className="h-4 w-4 text-destructive/80 hover:text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Clear chat history</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <Accordion type="single" collapsible className="px-3 py-1 border-b">
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="text-xs hover:no-underline py-2">
              <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <span>AI has {availableSkills.length} skills available</span>
              </div>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-xs text-muted-foreground pb-2">The assistant can use these tools to help you:</p>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
              {availableSkills.map(skill => (
                <div key={skill.name} className="flex items-start gap-2 text-xs p-2 bg-muted/50 rounded-md">
                  <skill.icon className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <div>
                    <p className="font-semibold">{skill.name}</p>
                    <p className="text-muted-foreground">{skill.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>


       <ScrollArea className="flex-1 p-4" viewportRef={chatScrollAreaRef}>
        <div className="space-y-4">
          {chatHistory.length === 0 && isCanvasEmpty && !isLoadingSuggestion && initialCanvasSuggestion && suggestedNodeConfig && (
            <Card className="p-3.5 bg-primary/10 text-primary-foreground/90 border border-primary/30 space-y-2.5 shadow-md mb-3">
              <p className="font-semibold flex items-center gap-2 text-sm"><Wand2 className="h-4 w-4 text-primary" /> Start with a <span className="text-primary">{suggestedNodeConfig.name}</span> node?</p>
              <p className="text-xs text-primary-foreground/80 italic ml-6 leading-relaxed break-words">{initialCanvasSuggestion.reason}</p>
              <Button size="sm" onClick={() => onAddSuggestedNode(initialCanvasSuggestion.suggestedNode)} className="w-full bg-primary/80 hover:bg-primary text-primary-foreground mt-1.5 h-8 text-xs" disabled={currentIsLoadingAnyAIButChat || isChatLoading}>
                Add {suggestedNodeConfig.name} Node <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </Card>
          )}
          {chatHistory.length === 0 && isCanvasEmpty && isLoadingSuggestion && (
            <Card className="p-3 bg-muted/40 text-sm text-muted-foreground flex items-center justify-center gap-2 border-border shadow-sm mb-3">
              <Loader2 className="h-4 w-4 animate-spin" /> <span>AI is thinking of a good starting point...</span>
            </Card>
          )}
          {chatHistory.map((chat) => (
            chat.sender === 'user' ? (
              <div key={chat.id} className="flex items-start justify-end gap-2.5">
                <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-3 bg-primary text-primary-foreground rounded-s-xl rounded-ee-xl shadow">
                  <p className="text-sm font-normal whitespace-pre-wrap break-words">{chat.message}</p>
                  <span className="text-xs text-primary-foreground/80 self-end mt-1.5">{chat.timestamp}</span>
                </div>
                <div className="p-1.5 bg-muted rounded-full shadow-sm shrink-0">
                    <User className="h-5 w-5 text-foreground" />
                </div>
              </div>
            ) : (
              <div key={chat.id} className="flex items-start gap-2.5">
                <div className="p-1.5 bg-primary/10 rounded-full shadow-sm shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="flex flex-col w-full max-w-[320px] leading-1.5">
                  <div className="p-3 border-border bg-muted rounded-e-xl rounded-es-xl shadow">
                    <p className="text-sm font-normal text-foreground whitespace-pre-wrap break-words">{chat.message}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1 px-1">
                    <span className="text-xs text-muted-foreground/80">{chat.timestamp}</span>
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleListen(chat)} disabled={!!activeAudio && activeAudio.id !== chat.id}>
                            {activeAudio?.id === chat.id && activeAudio.status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                            {activeAudio?.id === chat.id && activeAudio.status === 'playing' && <StopCircle className="h-4 w-4 text-primary" />}
                            {activeAudio?.id === chat.id && activeAudio.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
                            {(!activeAudio || activeAudio.id !== chat.id) && <Volume2 className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>Listen to message</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            )
          ))}
          {isChatLoading && (
            <div className="flex items-end gap-2.5">
              <div className="p-1.5 bg-primary/10 rounded-full shadow-sm shrink-0">
                  <Bot className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col w-full max-w-[80px] leading-1.5 p-3.5 border-border bg-muted rounded-e-xl rounded-es-xl shadow items-center">
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
      <div className="p-3 border-t bg-background/80 flex flex-col gap-2 mt-auto">
        {attachedImage && (
          <div className="relative group w-full p-2 border rounded-md bg-muted">
            <img src={attachedImage} alt="Attached preview" className="max-h-24 w-auto rounded-md mx-auto" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              onClick={() => setAttachedImage(null)}
              title="Remove image"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        <div className="flex w-full gap-2 items-center">
          <Textarea 
            id="ai-chat-textarea" 
            placeholder="Ask a question or describe a workflow..." 
            value={chatInput} 
            onChange={(e) => setChatInput(e.target.value)} 
            className="flex-1 text-sm resize-none" 
            rows={1} 
            disabled={isChatLoading || currentIsLoadingAnyAIButChat} 
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleLocalChatSubmit(); } }} 
          />
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <Button onClick={handleAttachImage} disabled={isChatLoading || currentIsLoadingAnyAIButChat} variant="ghost" size="icon" title="Attach Image">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button onClick={handleLocalChatSubmit} disabled={isChatLoading || currentIsLoadingAnyAIButChat || (!chatInput.trim() && !attachedImage)} size="icon" title="Send message (Enter)">
            {isChatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
