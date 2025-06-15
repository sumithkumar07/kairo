
'use client';

import { useState } from 'react';
import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';
import type { ExampleWorkflow } from '@/config/example-workflows'; // Import ExampleWorkflow
import type { SuggestNextNodeOutput } from '@/ai/flows/suggest-next-node';
import { enhanceAndGenerateWorkflow } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2, Send, XCircle, FileText, Zap, Wand2 } from 'lucide-react'; // Added Zap
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';

interface AIWorkflowAssistantPanelProps {
  onWorkflowGenerated: (workflow: GenerateWorkflowFromPromptOutput) => void;
  setIsLoadingGlobal: (isLoading: boolean) => void;
  isExplainingWorkflow: boolean;
  workflowExplanation: string | null;
  onClearExplanation: () => void;
  exampleWorkflows: ExampleWorkflow[];
  onLoadExampleWorkflow: (example: ExampleWorkflow) => void;
  initialCanvasSuggestion: SuggestNextNodeOutput | null;
  isLoadingSuggestion: boolean;
  onAddSuggestedNode: (suggestedNodeTypeString: string) => void;
  isCanvasEmpty: boolean;
}

const examplePrompts = [
  "When someone fills out a contact form, send an email and save to database",
  "Every day at 9 AM, fetch weather data and send a summary email",
  "When a new order is placed, update inventory and notify shipping team",
  "Process uploaded CSV files and generate reports"
];

export function AIWorkflowAssistantPanel({ 
  onWorkflowGenerated, 
  setIsLoadingGlobal,
  isExplainingWorkflow,
  workflowExplanation,
  onClearExplanation,
  exampleWorkflows,
  onLoadExampleWorkflow,
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

  const handleExamplePromptClick = (example: string) => {
    setPrompt(example);
    if (workflowExplanation) onClearExplanation(); 
  };

  const handleExampleWorkflowClick = (example: ExampleWorkflow) => {
    onLoadExampleWorkflow(example);
    if (workflowExplanation) onClearExplanation();
  }

  const currentIsLoading = isLoadingLocal || isExplainingWorkflow || isLoadingSuggestion;

  const suggestedNodeConfig = initialCanvasSuggestion?.suggestedNode
    ? AVAILABLE_NODES_CONFIG.find(n => n.type === initialCanvasSuggestion.suggestedNode)
    : null;

  if (workflowExplanation || isExplainingWorkflow) {
    return (
      <>
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Workflow Explanation
          </h2>
          <p className="text-sm text-muted-foreground">AI-generated summary of the current workflow.</p>
        </div>
        <ScrollArea className="p-4 flex-1">
          {isExplainingWorkflow ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-3 text-muted-foreground">AI is analyzing...</p>
            </div>
          ) : workflowExplanation ? (
            <div className="p-3 bg-accent/10 rounded-md text-sm text-accent-foreground/90 space-y-2 whitespace-pre-wrap leading-relaxed">
              {workflowExplanation}
            </div>
          ) : (
             <p className="text-muted-foreground text-center p-4">No explanation available.</p>
          )}
        </ScrollArea>
        <div className="p-4 border-t bg-background/50 mt-auto">
          <Button variant="outline" onClick={onClearExplanation} className="w-full">
            <XCircle className="mr-2 h-4 w-4" /> Back to Prompt
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          AI Workflow Assistant
        </h2>
        <p className="text-sm text-muted-foreground">Describe your automation or load an example</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {isCanvasEmpty && isLoadingSuggestion && (
            <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>AI is thinking of a good starting point...</span>
            </div>
          )}

          {isCanvasEmpty && !isLoadingSuggestion && initialCanvasSuggestion && suggestedNodeConfig && (
            <div className="p-3 bg-primary/10 rounded-md text-sm text-primary-foreground/90 border border-primary/30 space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary" />
                Start with a <span className="text-primary">{suggestedNodeConfig.name}</span> node?
              </p>
              <p className="text-xs text-primary-foreground/70 italic ml-6">{initialCanvasSuggestion.reason}</p>
              <Button 
                size="sm" 
                onClick={() => onAddSuggestedNode(initialCanvasSuggestion.suggestedNode)}
                className="w-full bg-primary/80 hover:bg-primary text-primary-foreground"
                disabled={currentIsLoading}
              >
                Add {suggestedNodeConfig.name} Node
              </Button>
            </div>
          )}

          {!isCanvasEmpty && !workflowExplanation && (
            <div className="p-3 bg-primary/5 rounded-md text-sm text-primary-foreground/80">
              Hi! I&apos;m your AI workflow assistant. Describe what you want to automate and I&apos;ll generate a complete workflow for you. I can even try to enhance your prompt first!
            </div>
          )}
          
          {isCanvasEmpty && !initialCanvasSuggestion && !isLoadingSuggestion && (
             <div className="p-3 bg-primary/5 rounded-md text-sm text-primary-foreground/80">
              Your canvas is empty! Describe your desired workflow below, or try an example.
            </div>
          )}


          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 mt-3">Try these example prompts:</h3>
            <div className="space-y-2">
              {examplePrompts.map((ex, index) => (
                <Button 
                  key={`prompt-${index}`} 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-left justify-start h-auto py-1.5 text-xs"
                  onClick={() => handleExamplePromptClick(ex)}
                  disabled={currentIsLoading}
                >
                  &quot;{ex}&quot;
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Or load an example workflow:</h3>
            <div className="space-y-2">
              {exampleWorkflows.map((ex, index) => (
                <Button 
                  key={`workflow-${index}`}
                  variant="outline" 
                  size="sm" 
                  className="w-full text-left justify-start h-auto py-1.5 text-xs flex flex-col items-start"
                  onClick={() => handleExampleWorkflowClick(ex)}
                  disabled={currentIsLoading}
                  title={ex.description}
                >
                  <span className="font-semibold flex items-center gap-1.5"><Zap className="h-3 w-3 text-primary" /> {ex.name}</span>
                  <span className="text-muted-foreground/80 text-xs pl-[18px]">{ex.description}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-background/50 mt-auto">
        <div className="flex gap-2 items-end">
          <Textarea
            placeholder="Describe your workflow..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-grow min-h-[60px] resize-none text-sm"
            rows={3}
            disabled={currentIsLoading}
          />
          <Button 
            onClick={handleSubmit} 
            disabled={currentIsLoading || !prompt.trim()} 
            className="h-auto py-2.5 self-end"
            size="lg"
          >
            {isLoadingLocal ? ( 
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

