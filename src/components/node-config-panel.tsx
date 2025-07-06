
'use client';

import type { WorkflowNode, AvailableNodeType, ConfigFieldSchema, RetryConfig, OnErrorWebhookConfig, SuggestNextNodeOutput } from '@/types/workflow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { produce } from 'immer';
import { Info, Trash2, Wand2, Loader2, KeyRound, RotateCcw, ChevronRight, AlertCircle, AlertTriangle, Blocks, Anchor, Webhook, Waypoints, Plus } from 'lucide-react'; 
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import { findPlaceholdersInObject } from '@/lib/workflow-utils';
import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


interface NodeConfigPanelProps {
  node: WorkflowNode;
  nodeType?: AvailableNodeType; 
  onConfigChange: (nodeId: string, newConfig: Record<string, any>) => void;
  onInputMappingChange: (nodeId: string, newInputMapping: Record<string, any> | undefined) => void;
  onNodeNameChange: (nodeId: string, newName: string) => void;
  onNodeDescriptionChange: (nodeId: string, newDescription: string) => void;
  onDeleteNode: (nodeId: string) => void;
  suggestedNextNodeInfo: { suggestion: SuggestNextNodeOutput; forNodeId: string } | null;
  isLoadingSuggestion: boolean;
  onAddSuggestedNode: (nodeTypeString: string) => void;
  onGenerateTestData: (nodeId: string, configField: string) => void;
  isGeneratingTestDataFor?: string | null;
}

export function NodeConfigPanel({ 
  node, 
  nodeType, 
  onConfigChange, 
  onInputMappingChange,
  onNodeNameChange, 
  onNodeDescriptionChange,
  onDeleteNode,
  suggestedNextNodeInfo,
  isLoadingSuggestion,
  onAddSuggestedNode,
  onGenerateTestData,
  isGeneratingTestDataFor,
}: NodeConfigPanelProps) {
  
  const { hasProFeatures } = useSubscription();
  const [jsonValidationErrors, setJsonValidationErrors] = useState<Record<string, string | null>>({});

  const handleConfigUpdate = (updater: (draft: Record<string, any>) => void) => {
    const newConfig = produce(node.config, updater);
    onConfigChange(node.id, newConfig);
  };
  
  const handleInputChange = (fieldKey: string, value: any, isRetryField = false, isWebhookField = false) => {
    let valueToSet = value;
    const schema = nodeType?.configSchema?.[fieldKey];

    if (schema?.type === 'json' || (isWebhookField && (fieldKey === 'headers' || fieldKey === 'bodyTemplate'))) {
      try {
        if (String(valueToSet).trim() !== '') JSON.parse(String(valueToSet));
        setJsonValidationErrors(prev => ({ ...prev, [fieldKey]: null })); 
      } catch (e) {
        setJsonValidationErrors(prev => ({ ...prev, [fieldKey]: 'Invalid JSON format.' }));
      }
    }

    if (schema?.type === 'number' || isRetryField && (fieldKey === 'attempts' || fieldKey === 'delayMs' || fieldKey === 'backoffFactor')) {
        valueToSet = value.trim() === '' ? undefined : parseFloat(value);
        if (isNaN(valueToSet)) valueToSet = undefined;
    }
     if (isRetryField && (fieldKey === 'retryOnStatusCodes' || fieldKey === 'retryOnErrorKeywords')) {
      valueToSet = value.trim() === '' ? undefined : value.split(',').map((s: string) => s.trim()).filter(Boolean);
      if (fieldKey === 'retryOnStatusCodes' && valueToSet) {
        valueToSet = valueToSet.map((n: string) => parseInt(n, 10)).filter((n: number) => !isNaN(n));
      }
    }
    
    handleConfigUpdate(draftConfig => {
      if (isRetryField) {
        if (!draftConfig.retry) draftConfig.retry = {};
        (draftConfig.retry as Record<string, any>)[fieldKey] = valueToSet;
        if (valueToSet === undefined || valueToSet === null || (typeof valueToSet === 'string' && valueToSet.trim() === '') || (Array.isArray(valueToSet) && valueToSet.length === 0) ) {
           delete (draftConfig.retry as Record<string, any>)[fieldKey];
           if(Object.keys(draftConfig.retry).length === 0) delete draftConfig.retry;
        }
      } else if (isWebhookField) {
          if(!draftConfig.onErrorWebhook) draftConfig.onErrorWebhook = {};
          (draftConfig.onErrorWebhook as Record<string, any>)[fieldKey] = valueToSet;
          if (valueToSet === undefined || valueToSet === null || (typeof valueToSet === 'string' && valueToSet.trim() === '')) {
            delete (draftConfig.onErrorWebhook as Record<string, any>)[fieldKey];
            if(Object.keys(draftConfig.onErrorWebhook).length === 0) delete draftConfig.onErrorWebhook;
          }
      } else {
        draftConfig[fieldKey] = valueToSet;
      }
    });
  };

  const handleMappingChange = (oldKey: string, newKey: string, newValue: string) => {
    const newMapping = { ...(node.inputMapping || {}) };
    const value = newMapping[oldKey];
    delete newMapping[oldKey];
    newMapping[newKey] = newValue ?? value;
    onInputMappingChange(node.id, newMapping);
  };

  const handleAddNewMapping = () => {
    let newKey = 'new_mapping';
    let count = 1;
    while ((node.inputMapping || {}).hasOwnProperty(newKey)) {
        newKey = `new_mapping_${count++}`;
    }
    const newMapping = { ...(node.inputMapping || {}), [newKey]: '' };
    onInputMappingChange(node.id, newMapping);
  };
  
  const handleRemoveMapping = (keyToRemove: string) => {
    const newMapping = { ...(node.inputMapping || {}) };
    delete newMapping[keyToRemove];
    onInputMappingChange(node.id, newMapping);
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
    return findPlaceholdersInObject({ config: node.config, inputMapping: node.inputMapping });
  }, [node.config, node.inputMapping]);

  const currentRetryConfig: Partial<RetryConfig> = node.config.retry || {};
  const currentWebhookConfig: Partial<OnErrorWebhookConfig> = node.config.onErrorWebhook || {};

  const renderParameters = () => {
    if (!nodeType?.configSchema || Object.keys(nodeType.configSchema).filter(k => k !== 'retry' && k !== 'onErrorWebhook').length === 0) {
      return <p className="text-xs text-muted-foreground italic text-center py-2">No specific configuration parameters for this node.</p>;
    }
  
    return Object.entries(nodeType.configSchema)
      .filter(([key]) => key !== 'retry' && key !== 'onErrorWebhook')
      .map(([key, schema]) => {
        const canGenerateAiData = [
          'simulatedResponse', 'simulatedStatusCode', 'simulatedRequestBody',
          'simulatedRequestHeaders', 'simulatedRequestQuery', 'simulatedOutput',
          'simulatedResults', 'simulatedRowCount', 'simulatedMessageId',
          'simulatedFileEvent', 'simulated_config'
        ].includes(key);
        const isLoading = isGeneratingTestDataFor === key;
  
        return (
          <div key={key} className="space-y-1">
            {schema.type !== 'boolean' ? (
              <div className="flex justify-between items-center">
                <Label htmlFor={`${node.id}-${key}`} className="text-xs font-medium">{schema.label}</Label>
                {canGenerateAiData && (
                   <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span> {/* Span wrapper for tooltip on disabled button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-auto"
                            onClick={() => onGenerateTestData(node.id, key)}
                            disabled={isLoading || !hasProFeatures}
                            title={`Generate test data for ${key}`}
                          >
                            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5 text-primary" />}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {!hasProFeatures && (
                        <TooltipContent>
                          <p>AI Test Data Generation is a premium feature. Please upgrade.</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            ) : null}
            {renderFormField(key, schema)}
            {schema.helperText && <p className="text-xs text-muted-foreground/80 mt-1">{schema.helperText}</p>}
            {jsonValidationErrors[key] && <p className="text-xs text-destructive mt-1">{jsonValidationErrors[key]}</p>}
          </div>
        );
      });
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
          
          <Accordion type="multiple" defaultValue={['ai-explanation', 'general', 'parameters', 'input-mapping']} className="w-full">

            {node.aiExplanation && (
              <AccordionItem value="ai-explanation">
                  <AccordionTrigger className="text-xs font-medium text-muted-foreground hover:no-underline [&[data-state=open]]:text-primary">
                    <div className="flex items-center gap-2"><Info className="h-4 w-4 text-sky-500"/>AI Explanation</div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                      <Card className="p-3 bg-accent/10 dark:bg-accent/10 text-xs text-accent-foreground/90 space-y-2 whitespace-pre-wrap leading-relaxed border-accent/20 shadow-sm break-words">
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
            
            <AccordionItem value="input-mapping">
              <AccordionTrigger className="text-xs font-medium text-muted-foreground hover:no-underline [&[data-state=open]]:text-primary">
                <div className="flex items-center gap-2"><Waypoints className="h-4 w-4"/>Input Mapping</div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-3">
                <div className="space-y-2">
                  {(Object.entries(node.inputMapping || {})).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Input
                        value={key}
                        onChange={(e) => handleMappingChange(key, e.target.value, value)}
                        placeholder="Local Name"
                        className="h-8 text-xs font-mono"
                      />
                      <Input
                        value={value}
                        onChange={(e) => handleMappingChange(key, key, e.target.value)}
                        placeholder="{{node.output}}"
                        className="h-8 text-xs font-mono"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => handleRemoveMapping(key)}
                        title={`Remove mapping for ${key}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive/80" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs mt-2"
                    onClick={handleAddNewMapping}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Mapping
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground/80 mt-1">Explicitly map data from other nodes to local variables for this node.</p>
              </AccordionContent>
            </AccordionItem>


            <AccordionItem value="parameters">
              <AccordionTrigger className="text-xs font-medium text-muted-foreground hover:no-underline [&[data-state=open]]:text-primary">
                <div className="flex items-center gap-2"><Anchor className="h-4 w-4"/>Parameters</div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 space-y-3">
                 {renderParameters()}
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
                    <AccordionItem value="retry-config" className="border rounded-md mb-2">
                      <AccordionTrigger className="text-xs font-medium text-muted-foreground hover:no-underline p-2 rounded-t-md hover:bg-muted/50 [&[data-state=open]]:bg-muted/40">
                        <div className="flex items-center gap-2"><RotateCcw className="h-4 w-4"/>Retry Configuration</div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 space-y-2 px-2 border-t">
                        <div className="space-y-1"><Label className="text-xs">Attempts</Label><Input type="number" value={currentRetryConfig.attempts ?? ''} onChange={e => handleInputChange('attempts', e.target.value, true)} placeholder="e.g., 3" className="h-8 text-xs"/></div>
                        <div className="space-y-1"><Label className="text-xs">Initial Delay (ms)</Label><Input type="number" value={currentRetryConfig.delayMs ?? ''} onChange={e => handleInputChange('delayMs', e.target.value, true)} placeholder="e.g., 1000" className="h-8 text-xs"/></div>
                        <div className="space-y-1"><Label className="text-xs">Backoff Factor</Label><Input type="number" value={currentRetryConfig.backoffFactor ?? ''} onChange={e => handleInputChange('backoffFactor', e.target.value, true)} placeholder="e.g., 2" className="h-8 text-xs"/></div>
                        <div className="space-y-1"><Label className="text-xs">Retry on Status Codes (CSV)</Label><Input value={(currentRetryConfig.retryOnStatusCodes || []).join(', ')} onChange={e => handleInputChange('retryOnStatusCodes', e.target.value, true)} placeholder="500, 503, 429" className="h-8 text-xs"/></div>
                        <div className="space-y-1"><Label className="text-xs">Retry on Error Keywords (CSV)</Label><Input value={(currentRetryConfig.retryOnErrorKeywords || []).join(', ')} onChange={e => handleInputChange('retryOnErrorKeywords', e.target.value, true)} placeholder="timeout, unavailable" className="h-8 text-xs"/></div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="webhook-config" className="border rounded-md">
                      <AccordionTrigger className="text-xs font-medium text-muted-foreground hover:no-underline p-2 rounded-t-md hover:bg-muted/50 [&[data-state=open]]:bg-muted/40">
                        <div className="flex items-center gap-2"><Webhook className="h-4 w-4"/>On-Error Webhook</div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 space-y-2 px-2 border-t">
                        <div className="space-y-1"><Label className="text-xs">Webhook URL</Label><Input type="text" value={currentWebhookConfig.url ?? ''} onChange={e => handleInputChange('url', e.target.value, false, true)} placeholder="https://my-error-handler.com" className="h-8 text-xs"/></div>
                        <div className="space-y-1"><Label className="text-xs">Method</Label>
                          <Select value={currentWebhookConfig.method ?? 'POST'} onValueChange={(value) => handleInputChange('method', value, false, true)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger>
                            <SelectContent><SelectItem value="POST">POST</SelectItem><SelectItem value="PUT">PUT</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1"><Label className="text-xs">Headers (JSON)</Label><Textarea value={typeof currentWebhookConfig.headers === 'object' ? JSON.stringify(currentWebhookConfig.headers, null, 2) : currentWebhookConfig.headers ?? ''} onChange={e => handleInputChange('headers', e.target.value, false, true)} placeholder={'{\\n  "X-API-Key": "{{env.ERROR_KEY}}"\\n}'} className="h-20 text-xs font-mono"/></div>
                        <div className="space-y-1"><Label className="text-xs">Body Template (JSON)</Label><Textarea value={typeof currentWebhookConfig.bodyTemplate === 'object' ? JSON.stringify(currentWebhookConfig.bodyTemplate, null, 2) : currentWebhookConfig.bodyTemplate ?? ''} onChange={e => handleInputChange('bodyTemplate', e.target.value, false, true)} placeholder={'{\\n  "error": "{{error_message}}"\\n}'} className="h-24 text-xs font-mono"/></div>
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
