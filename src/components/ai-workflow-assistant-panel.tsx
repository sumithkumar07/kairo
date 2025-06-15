
'use client';

import { useState } from 'react';
import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';
import type { SuggestNextNodeOutput } from '@/ai/flows/suggest-next-node';
import { enhanceAndGenerateWorkflow } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2, Send } from 'lucide-react';

interface AIWorkflowAssistantPanelProps {
  onWorkflowGenerated: (workflow: GenerateWorkflowFromPromptOutput) => void;
  setIsLoadingGlobal: (isLoading: boolean) => void;
  // Props for node suggestions are passed to NodeConfigPanel, not directly used here
  // but need to be accepted if this component wraps NodeConfigPanel conditionally.
  // However, since FlowAIPage directly renders NodeConfigPanel or this,
  // these props are not strictly needed here if NodeConfigPanel is chosen directly.
  // For simplicity, we assume FlowAIPage handles the conditional rendering.
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
}: AIWorkflowAssistantPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

    setIsLoading(true);
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
      setIsLoading(false);
      setIsLoadingGlobal(false);
    }
  };

  const handleExamplePromptClick = (example: string) => {
    setPrompt(example);
  };

  return (
    // This component is rendered when NO node is selected.
    // NodeConfigPanel is rendered by FlowAIPage when a node IS selected.
    // So, no need to handle suggestion props directly here.
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
            disabled={isLoading}
          />
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !prompt.trim()} 
            className="h-auto py-2.5 self-end"
            size="lg"
          >
            {isLoading ? (
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
