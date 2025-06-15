'use client';

import { useState } from 'react';
import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';
// import type { SuggestNextNodeOutput } from '@/ai/flows/suggest-next-node'; // Not directly used here
import { enhanceAndGenerateWorkflow } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2, Send, XCircle, FileText, Trash2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface AIWorkflowAssistantPanelProps {
  onWorkflowGenerated: (workflow: GenerateWorkflowFromPromptOutput) => void;
  setIsLoadingGlobal: (isLoading: boolean) => void;
  isExplainingWorkflow: boolean;
  workflowExplanation: string | null;
  onClearExplanation: () => void;
  // Props for connection selection (though the view is now in page.tsx)
  selectedConnectionId: string | null; 
  handleDeleteSelectedConnection?: () => void;
  setSelectedConnectionId?: (id: string | null) => void;
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
  selectedConnectionId, // Keep for conditional rendering logic if needed elsewhere
  handleDeleteSelectedConnection, 
  setSelectedConnectionId,
}: AIWorkflowAssistantPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoadingLocal, setIsLoadingLocal] = useState(false); // Local loading for prompt generation
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
    setIsLoadingGlobal(true); // Also set global loading for AI generation
    try {
      const result = await enhanceAndGenerateWorkflow({ originalPrompt: prompt });
      onWorkflowGenerated(result);
      toast({
        title: 'Workflow Generated!',
        description: 'The AI has processed your prompt and generated a workflow.',
      });
      // setPrompt(''); // Keep prompt for potential refinement
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
    if (workflowExplanation) onClearExplanation(); // Clear explanation if user picks an example
  };

  const currentIsLoading = isLoadingLocal || isExplainingWorkflow;

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


  // The connection selected view is now primarily handled in page.tsx's aside structure.
  // This panel will focus on prompting and displaying explanations.
  // If selectedConnectionId and its handlers were needed here, this is where the logic would go.
  // Example (though redundant with page.tsx's current structure):
  // if (selectedConnectionId && handleDeleteSelectedConnection && setSelectedConnectionId) {
  //   return (
  //     <div className="p-6 text-center flex flex-col items-center justify-center h-full space-y-3">
  //       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 mx-auto text-primary mb-2"><path d="M5 12s2.545-5 7-5c4.454 0 7 5 7 5s-2.546 5-7 5c-4.455 0-7-5-7-5z"></path><line x1="12" y1="13" x2="12" y2="17"></line><line x1="12" y1="8" x2="12" y2="10"></line></svg>
  //       <p className="text-md font-semibold text-foreground">Connection Selected</p>
  //       <div className="flex gap-2">
  //         <Button variant="destructive" size="sm" onClick={handleDeleteSelectedConnection}>
  //             <Trash2 className="mr-2 h-4 w-4" /> Delete
  //         </Button>
  //         <Button variant="outline" size="sm" onClick={() => setSelectedConnectionId(null)}>
  //             <XCircle className="mr-2 h-4 w-4" /> Deselect
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          AI Workflow Assistant
        </h2>
        <p className="text-sm text-muted-foreground">Describe your automation in natural language</p>
      </div>
      
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <div className="p-3 bg-primary/5 rounded-md text-sm text-primary-foreground/80">
            Hi! I&apos;m your AI workflow assistant. Describe what you want to automate and I&apos;ll generate a complete workflow for you. I can even try to enhance your prompt first!
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Try these examples:</h3>
          <div className="space-y-2">
            {examplePrompts.map((ex, index) => (
              <Button 
                key={index} 
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
      </div>

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
            {isLoadingLocal ? ( // Use local loading for this button specifically
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
