
'use client';

import type { WorkflowNode, AvailableNodeType, ConfigFieldSchema, RetryConfig, OnErrorWebhookConfig } from '@/types/workflow';
import type { SuggestNextNodeOutput } from '@/ai/flows/suggest-next-node';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { produce } from 'immer';
import { Info, Trash2, Wand2, Loader2, KeyRound, RotateCcwIcon, ChevronRight, AlertCircle, AlertTriangle, Blocks, Anchor } from 'lucide-react'; 
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import { findPlaceholdersInObject } from '@/lib/workflow-utils';
import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';


interface NodeConfigPanelProps {
  node: WorkflowNode;
  nodeType?: AvailableNodeType; 
  onConfigChange: (nodeId: string, newConfig: Record<string, any>) => void;
  onNodeNameChange: (nodeId: string, newName: string) => void;
  onNodeDescriptionChange: (nodeId: string, newDescription: string) => void;
  onDeleteNode: (nodeId: string) => void;
  suggestedNextNodeInfo: { suggestion: SuggestNextNodeOutput; forNodeId: string } | null;
  isLoadingSuggestion: boolean;
  onAddSuggestedNode: (nodeTypeString: string) => void;
}

export function NodeConfigPanel({ 
  node, 
  nodeType, 
  onConfigChange, 
  onNodeNameChange, 
  onNodeDescriptionChange,
  onDeleteNode,
  suggestedNextNodeInfo,
  isLoadingSuggestion,
  onAddSuggestedNode
}: NodeConfigPanelProps) {
  
  const [jsonValidationErrors, setJsonValidationErrors] = useState<Record<string, string | null>>({});

  const handleInputChange = (fieldKey: string, value: any, isRetryField = false) => {
    let valueToSet = value;
    const schema = nodeType?.configSchema?.[fieldKey];

    if (schema?.type === 'json') {
      try {
        if (String(valueToSet).trim() !== '') JSON.parse(String(valueToSet)); 
        setJsonValidationErrors(prev => ({ ...prev, [fieldKey]: null })); 
      } catch (e) {
        setJsonValidationErrors(prev => ({ ...prev, [fieldKey]: 'Invalid JSON format.' }));
      }
    }

    if (schema?.type === 'number') {
      valueToSet = value.trim() === '' ? undefined : parseFloat(value);
      if (isNaN(valueToSet)) valueToSet = undefined;
    }
    
    const newConfig = produce(node.config, draftConfig => {
      if (isRetryField) {
        if (!draftConfig.retry) draftConfig.retry = {};
        (draftConfig.retry as Record<string, any>)[fieldKey] = valueToSet;
        if (valueToSet === undefined || valueToSet === null || (typeof valueToSet === 'string' && valueToSet.trim() === '') || (Array.isArray(valueToSet) && valueToSet.length === 0) ) {
           delete (draftConfig.retry as Record<string, any>)[fieldKey];
        }
      } else {
        draftConfig[fieldKey] = valueToSet;
      }
    });
    onConfigChange(node.id, newConfig);
  };


  const renderFormField = (fieldKey: string, fieldSchema: ConfigFieldSchema) => {
    const currentValue = node.config[fieldKey] ?? fieldSchema.defaultValue ?? '';
    const error = jsonValidationErrors[fieldKey];

    const inputProps = {
      id: `${node.id}-${fieldKey}`,
      value: (fieldSchema.type === 'json' && typeof currentValue !== 'string') ? JSON.stringify(currentValue, null, 2) : currentValue,
      placeholder: fieldSchema.placeholder,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange(fieldKey, e.target.value),
      className: cn("mt-1 text-sm", error && "border-destructive"),
    };

    switch (fieldSchema.type) {
      case 'string':
      case 'number':
        return <Input type={fieldSchema.type} {...inputProps} />;
      case 'textarea':
      case 'json':
        return <Textarea {...inputProps} rows={fieldSchema.type === 'json' ? 4 : 3} className={cn(inputProps.className, "font-mono text-xs")} />;
      case 'select':
        return (
          <Select value={String(currentValue)} onValueChange={(value) => handleInputChange(fieldKey, value)}>
            <SelectTrigger id={`${node.id}-${fieldKey}`} className="mt-1 text-sm">
              <SelectValue placeholder={fieldSchema.placeholder || `Select...`} />
            </SelectTrigger>
            <SelectContent>
              {fieldSchema.options?.map((option, index) => (
                <SelectItem key={index} value={typeof option === 'string' ? option : option.value}>{typeof option === 'string' ? option : option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'boolean':
        return (
          <div className="flex items-center space-x-2 mt-2">
            <Switch id={`${node.id}-${fieldKey}`} checked={!!currentValue} onCheckedChange={(checked) => handleInputChange(fieldKey, checked)} />
            <Label htmlFor={`${node.id}-${fieldKey}`} className="text-sm">{fieldSchema.label}</Label>
          </div>
        );
      default:
        return <p className="text-destructive text-xs mt-1">Unsupported field type: {fieldSchema.type}</p>;
    }
  };
  
  const suggestedNodeConfig = suggestedNextNodeInfo?.suggestion?.suggestedNode ? AVAILABLE_NODES_CONFIG.find(n => n.type === suggestedNextNodeInfo.suggestion.suggestedNode) : null;

  const { env: envPlaceholders, secrets: secretPlaceholders } = React.useMemo(() => {
    return findPlaceholdersInObject(node.config);
  }, [node.config]);

  const currentRetryConfig: Partial<RetryConfig> = node.config.retry || {};

  const handleRetryConfigChange = (field: keyof RetryConfig, value: string) => {
    let processedValue: any = value;
    if (field === 'attempts' || field === 'delayMs' || field === 'backoffFactor') {
      processedValue = value.trim() === '' ? undefined : parseInt(value, 10);
      if (isNaN(processedValue as number)) processedValue = undefined;
    } else if (field === 'retryOnStatusCodes' || field === 'retryOnErrorKeywords') {
      processedValue = value.trim() === '' ? [] : value.split(',').map(s => s.trim()).filter(Boolean);
      if (field === 'retryOnStatusCodes') processedValue = processedValue.map((n: string) => parseInt(n, 10)).filter((n: number) => !isNaN(n));
    }
    handleInputChange(field, processedValue, true);
  };

  return (
    <Card className="shadow-none border-0 rounded-none flex flex-col h-full bg-transparent">
      <CardHeader className="px-4 pt-4 pb-3 border-b">
        <div className="flex justify-between items-center">
            <CardTitle className="text-base font-semibold text-foreground">Configure: {node.name || nodeType?.name}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => onDeleteNode(node.id)} title="Delete Node" className="h-7 w-7">
                <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
            </Button>
        </div>
        <CardDescription className="text-xs">Node ID: {node.id} | Type: {node.type}</CardDescription>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="space-y-4 p-4">
          
          <Accordion type="multiple" defaultValue={['ai-explanation', 'general', 'parameters']} className="w-full">

            {node.aiExplanation && (
              <AccordionItem value="ai-explanation">
                  <AccordionTrigger className="text-xs font-medium text-muted-foreground hover:no-underline [&[data-state=open]]:text-primary">
                    <div className="flex items-center gap-2"><Info className="h-4 w-4"/>AI Explanation</div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                      <Card className="p-3 bg-accent/20 dark:bg-accent/10 text-xs text-accent-foreground/90 space-y-2 whitespace-pre-wrap leading-relaxed border-accent/30 shadow-sm break-words">
                        {node.aiExplanation}
                      </Card>
                  </AccordionContent>
              </AccordionItem>
            )}
            
            <AccordionItem value="general">
              <AccordionTrigger className="text-xs font-medium text-muted-foreground hover:no-underline [&[data-state=open]]:text-primary">
                <div className="flex items-center gap-2"><Blocks className="h-4 w-4"/>General</div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor={`${node.id}-nodeName`} className="text-xs font-medium">Node Name</Label>
                    <Input id={`${node.id}-nodeName`} value={node.name} onChange={(e) => onNodeNameChange(node.id, e.target.value)} className="mt-1 text-sm h-9" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`${node.id}-nodeDescription`} className="text-xs font-medium">Node Description</Label>
                    <Textarea id={`${node.id}-nodeDescription`} value={node.description || ''} onChange={(e) => onNodeDescriptionChange(node.id, e.target.value)} className="mt-1 min-h-[50px] text-sm" rows={2} />
                  </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="parameters">
              <AccordionTrigger className="text-xs font-medium text-muted-foreground hover:no-underline [&[data-state=open]]:text-primary">
                <div className="flex items-center gap-2"><Anchor className="h-4 w-4"/>Parameters</div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-3">
                 {nodeType?.configSchema && Object.keys(nodeType.configSchema).filter(k => k !== 'retry' && k !== 'onErrorWebhook').length > 0 ? (
                  Object.entries(nodeType.configSchema).filter(([key]) => key !== 'retry' && key !== 'onErrorWebhook').map(([key, schema]) => (
                    <div key={key} className="space-y-1">
                      {schema.type !== 'boolean' && <Label htmlFor={`${node.id}-${key}`} className="text-xs font-medium">{schema.label}</Label>}
                      {renderFormField(key, schema)}
                      {schema.helperText && <p className="text-xs text-muted-foreground/80 mt-1">{schema.helperText}</p>}
                      {jsonValidationErrors[key] && <p className="text-xs text-destructive mt-1">{jsonValidationErrors[key]}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-2">No specific configuration parameters for this node.</p>
                )}
              </AccordionContent>
            </AccordionItem>

            {(envPlaceholders.length > 0 || secretPlaceholders.length > 0) && (
              <AccordionItem value="dependencies">
                  <AccordionTrigger className="text-xs font-medium text-muted-foreground hover:no-underline [&[data-state=open]]:text-primary">
                    <div className="flex items-center gap-2"><KeyRound className="h-4 w-4"/>Dependencies Detected</div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 space-y-3">
                     <p className="text-xs text-muted-foreground">The AI has detected the following placeholders in your configuration, which need to be available at runtime.</p>
                     {secretPlaceholders.length > 0 && (
                        <div className="space-y-1">
                            <Label className="text-xs">Credentials:</Label>
                            <ul className="list-disc list-inside pl-2 text-xs font-mono text-amber-600 dark:text-amber-400">
                                {secretPlaceholders.map(p => <li key={p}>{p}</li>)}
                            </ul>
                        </div>
                     )}
                     {envPlaceholders.length > 0 && (
                        <div className="space-y-1">
                            <Label className="text-xs">Environment Variables:</Label>
                            <ul className="list-disc list-inside pl-2 text-xs font-mono text-cyan-600 dark:text-cyan-400">
                                {envPlaceholders.map(p => <li key={p}>{p}</li>)}
                            </ul>
                        </div>
                     )}
                  </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="advanced-config">
              <AccordionTrigger className="text-xs font-medium text-muted-foreground hover:no-underline [&[data-state=open]]:text-primary">
                <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4"/>Advanced Error Handling</div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-3">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="retry-config" className="border-b-0">
                      <AccordionTrigger className="text-xs font-medium text-muted-foreground hover:no-underline p-2 rounded hover:bg-muted/50 [&[data-state=open]]:bg-muted/40">
                        <div className="flex items-center gap-2"><RotateCcwIcon className="h-4 w-4"/>Retry Configuration</div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 space-y-2 px-1">
                        <div className="space-y-1"><Label className="text-xs">Attempts</Label><Input type="number" value={currentRetryConfig.attempts ?? ''} onChange={e => handleRetryConfigChange('attempts', e.target.value)} placeholder="e.g., 3" className="h-8 text-xs"/></div>
                        <div className="space-y-1"><Label className="text-xs">Initial Delay (ms)</Label><Input type="number" value={currentRetryConfig.delayMs ?? ''} onChange={e => handleRetryConfigChange('delayMs', e.target.value)} placeholder="e.g., 1000" className="h-8 text-xs"/></div>
                        <div className="space-y-1"><Label className="text-xs">Backoff Factor</Label><Input type="number" value={currentRetryConfig.backoffFactor ?? ''} onChange={e => handleRetryConfigChange('backoffFactor', e.target.value)} placeholder="e.g., 2" className="h-8 text-xs"/></div>
                        <div className="space-y-1"><Label className="text-xs">Retry on Status Codes</Label><Input value={(currentRetryConfig.retryOnStatusCodes || []).join(', ')} onChange={e => handleRetryConfigChange('retryOnStatusCodes', e.target.value)} placeholder="500, 503, 429" className="h-8 text-xs"/></div>
                        <div className="space-y-1"><Label className="text-xs">Retry on Error Keywords</Label><Input value={(currentRetryConfig.retryOnErrorKeywords || []).join(', ')} onChange={e => handleRetryConfigChange('retryOnErrorKeywords', e.target.value)} placeholder="timeout, unavailable" className="h-8 text-xs"/></div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="webhook-config" className="border-b-0">
                      <AccordionTrigger className="text-xs font-medium text-muted-foreground hover:no-underline p-2 rounded hover:bg-muted/50 [&[data-state=open]]:bg-muted/40">
                        <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4"/>On-Error Webhook</div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 space-y-2 px-1">
                        <p className="text-xs text-muted-foreground italic">Configuration for on-error webhooks would go here.</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
          

        </CardContent>
      </ScrollArea>
       <div className="p-3 border-t mt-auto bg-background/50">
        {isLoadingSuggestion ? (
          <Button variant="outline" className="w-full h-9 text-sm" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            AI is thinking...
          </Button>
        ) : suggestedNextNodeInfo && suggestedNextNodeInfo.forNodeId === node.id && suggestedNodeConfig ? (
          <Card className="p-3 bg-primary/10 text-primary-foreground/90 border border-primary/30 space-y-2 shadow-md">
            <p className="font-semibold flex items-center gap-2 text-sm"><Wand2 className="h-4 w-4 text-primary"/> Next Step Suggestion:</p>
            <p className="text-xs text-primary-foreground/80 italic ml-6 leading-relaxed break-words">{suggestedNextNodeInfo.suggestion.reason}</p>
            <Button size="sm" onClick={() => onAddSuggestedNode(suggestedNextNodeInfo.suggestion.suggestedNode)} className="w-full bg-primary/80 hover:bg-primary text-primary-foreground mt-1.5 h-8 text-xs">
              Add {suggestedNodeConfig.name} Node
              <ChevronRight className="ml-auto h-4 w-4" />
            </Button>
          </Card>
        ) : null}
      </div>
    </Card>
  );
}
