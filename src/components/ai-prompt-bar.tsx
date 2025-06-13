'use client';

import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';
import { generateWorkflow } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bot, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AIPromptBarProps {
  onWorkflowGenerated: (workflow: GenerateWorkflowFromPromptOutput) => void;
  setIsLoadingGlobal: (isLoading: boolean) => void;
}

export function AIPromptBar({ onWorkflowGenerated, setIsLoadingGlobal }: AIPromptBarProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a description for the workflow you want to generate.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setIsLoadingGlobal(true);
    try {
      const result = await generateWorkflow({ prompt });
      onWorkflowGenerated(result);
      toast({
        title: 'Workflow Generated!',
        description: 'The AI has generated a workflow based on your prompt.',
        variant: 'default', 
      });
      setPrompt(''); 
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

  return (
    <div className="p-4 border-b bg-card shadow-sm">
      <div className="flex gap-2 items-start">
        <Textarea
          placeholder="Describe the workflow you want to create (e.g., 'Fetch data from an API, parse the JSON, then log the first item')..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-grow min-h-[60px] resize-none"
          rows={2}
          disabled={isLoading}
        />
        <Button onClick={handleSubmit} disabled={isLoading || !prompt.trim()} className="h-auto py-2 px-4 self-stretch">
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Bot className="mr-2 h-5 w-5" />
          )}
          Generate
        </Button>
      </div>
    </div>
  );
}
