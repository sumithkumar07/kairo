
'use client';

import { useState } from 'react';
import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';
// import type { ExampleWorkflow } from '@/config/example-workflows'; // Removed
import type { SuggestNextNodeOutput } from '@/ai/flows/suggest-next-node';
import { enhanceAndGenerateWorkflow } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2, Send, XCircle, FileText, Wand2, ChevronRight, Sparkles } from 'lucide-react'; // Removed Zap
import { ScrollArea } from './ui/scroll-area';
// import { Separator } from './ui/separator'; // Removed
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import { Label } from '@/components/ui/label';

interface AIWorkflowAssistantPanelProps {
  onWorkflowGenerated: (workflow: GenerateWorkflowFromPromptOutput) => void;
  setIsLoadingGlobal: (isLoading: boolean) => void;
  isExplainingWorkflow: boolean;
  workflowExplanation: string | null;
  onClearExplanation: () => void;
  // exampleWorkflows: ExampleWorkflow[]; // Removed
  // onLoadExampleWorkflow: (example: ExampleWorkflow) => void; // Removed
  initialCanvasSuggestion: SuggestNextNodeOutput | null;
  isLoadingSuggestion: boolean;
  onAddSuggestedNode: (suggestedNodeTypeString: string) => void;
  isCanvasEmpty: boolean;
}

export function AIWorkflowAssistantPanel({
  onWorkflowGenerated,
  setIsLoadingGlobal,
  isExplainingWorkflow,
  workflowExplanation,
  onClearExplanation,
  // exampleWorkflows, // Removed
  // onLoadExampleWorkflow, // Removed
  initialCanvasSuggestion,
  isLoadingSuggestion,
  onAddSuggestedNode,
  isCanvasEmpty,
}: AIWorkflowAssistantPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt is empty',
        description: 'Please describe the workflow you want to generate.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoadingLocal(true);
    setIsLoadingGlobal(true);
    try {
      const result = await enhanceAndGenerateWorkflow({ originalPrompt: prompt });
      onWorkflowGenerated(result);
      toast({
        title: 'Workflow Generated!',
        description: 'The AI has processed your prompt and generated a workflow.',
      });
      // setPrompt('');
    } catch (error: any) {
      console.error('AI generation error:', error);
      toast({
        title: 'Error Generating Workflow',
        description: error.message || 'An unknown error occurred while contacting the AI.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingLocal(false);
      setIsLoadingGlobal(false);
    }
  };

  // const handleExampleWorkflowClick = (example: ExampleWorkflow) => { // Removed
  //   onLoadExampleWorkflow(example); // Removed
  //   if (workflowExplanation) { // Removed
  //       onClearExplanation(); // Removed
  //   } // Removed
  // } // Removed

  const currentIsLoading = isLoadingLocal || isExplainingWorkflow || isLoadingSuggestion;

  const suggestedNodeConfig = initialCanvasSuggestion?.suggestedNode
    ? AVAILABLE_NODES_CONFIG.find(n => n.type === initialCanvasSuggestion.suggestedNode)
    : null;

  if (workflowExplanation || isExplainingWorkflow) {
    return (
      <>
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
            <div className="p-3 bg-accent/10 rounded-md text-sm text-accent-foreground/90 space-y-2 whitespace-pre-wrap leading-relaxed border border-accent/20 shadow-sm break-words">
              {workflowExplanation}
            </div>
          ) : (
             <p className="text-muted-foreground text-center p-4 text-sm">No explanation available.</p>
          )}
        </ScrollArea>
        <div className="p-3 border-t bg-background/50 mt-auto">
          <Button variant="outline" onClick={onClearExplanation} className="w-full h-9 text-sm">
            <XCircle className="mr-2 h-4 w-4" /> Back to AI Prompt
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="p-4 border-b">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          AI Workflow Assistant
        </h2>
        <p className="text-xs text-muted-foreground">Describe your automation needs to the AI.</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {isCanvasEmpty && isLoadingSuggestion && (
            <div className="p-3 bg-muted/40 rounded-md text-sm text-muted-foreground flex items-center justify-center gap-2 border border-border shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI is thinking of a good starting point...</span>
            </div>
          )}

          {isCanvasEmpty && !isLoadingSuggestion && initialCanvasSuggestion && suggestedNodeConfig && (
            <div className="p-3.5 bg-primary/10 rounded-lg text-sm text-primary-foreground/90 border border-primary/30 space-y-2.5 shadow-md">
              <p className="font-semibold flex items-center gap-2 text-sm">
                <Wand2 className="h-4 w-4 text-primary" />
                Start with a <span className="text-primary">{suggestedNodeConfig.name}</span> node?
              </p>
              <p className="text-xs text-primary-foreground/80 italic ml-6 leading-relaxed">{initialCanvasSuggestion.reason}</p>
              <Button
                size="sm"
                onClick={() => onAddSuggestedNode(initialCanvasSuggestion.suggestedNode)}
                className="w-full bg-primary/80 hover:bg-primary text-primary-foreground mt-1.5 h-8 text-xs"
                disabled={currentIsLoading}
              >
                Add {suggestedNodeConfig.name} Node
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </div>
          )}

          {!isCanvasEmpty && !workflowExplanation && (
            <div className="p-3 bg-primary/5 rounded-md text-sm text-primary-foreground/80 border border-primary/10">
              Hi! I&apos;m your AI assistant. Describe what you want to automate.
            </div>
          )}

          {isCanvasEmpty && !initialCanvasSuggestion && !isLoadingSuggestion && (
             <div className="p-3 bg-primary/5 rounded-md text-sm text-primary-foreground/80 border border-primary/10">
              Your canvas is empty! Describe your desired workflow to the AI below.
            </div>
          )}
          
          {/* Removed Example Workflows Section */}
        </div>
      </ScrollArea>

      <div className="p-3 border-t bg-background/60 mt-auto space-y-2">
        <Label htmlFor="ai-prompt-textarea" className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 pl-0.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Describe your workflow to the AI
        </Label>
        <div className="flex gap-2 items-end">
          <Textarea
            id="ai-prompt-textarea"
            placeholder="e.g., 'When a new file is uploaded to a folder, read its content, summarize it with AI, and then send the summary to a Slack channel...'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-grow min-h-[60px] resize-none text-sm"
            rows={3}
            disabled={currentIsLoading}
          />
          <Button
            onClick={handleSubmit}
            disabled={currentIsLoading || !prompt.trim()}
            className="h-auto py-2 self-end min-h-[40px]"
            size="default"
            title="Generate workflow with AI (Ctrl+Enter)"
          >
            {isLoadingLocal ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
