
'use client';

import type { WorkflowNode, AvailableNodeType, ConfigFieldSchema, RetryConfig } from '@/types/workflow';
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
import { Info, Trash2, Wand2, Loader2, KeyRound, RotateCcwIcon } from 'lucide-react'; 
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import { findPlaceholdersInObject } from '@/lib/workflow-utils';
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


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
  
  const handleInputChange = (fieldKey: string, value: any, isRetryField = false) => {
    // const updatePath = isRetryField ? ['config', 'retry', fieldKey] : ['config', fieldKey]; // Not used directly with immer
    
    let valueToSet = value;
    const schema = isRetryField ? null : nodeType?.configSchema?.[fieldKey];

    if (schema?.type === 'json') {
        // For JSON fields, we expect the value to be a string from the textarea
        // The actual parsing (if needed by the backend) or validation happens elsewhere.
        // We store it as a string as entered by the user, unless it's explicitly an object already (e.g. from AI)
        // If it's already an object (e.g. from AI generation), keep it as an object.
        // If it's a string (from user input), keep it as a string.
        // No automatic parsing to JSON object here, to avoid premature errors for invalid user JSON input.
    }
    
    const newConfig = produce(node.config, draftConfig => {
      if (isRetryField) {
        if (!draftConfig.retry) draftConfig.retry = {};
        (draftConfig.retry as Record<string, any>)[fieldKey] = valueToSet;
        // Clean up empty retry fields
        if (valueToSet === undefined || valueToSet === null || (typeof valueToSet === 'string' && valueToSet.trim() === '') || (Array.isArray(valueToSet) && valueToSet.length === 0) ) {
           delete (draftConfig.retry as Record<string, any>)[fieldKey];
        }
        if (Object.keys(draftConfig.retry).length === 0) {
          delete draftConfig.retry;
        }

      } else {
        draftConfig[fieldKey] = valueToSet;
      }
    });
    onConfigChange(node.id, newConfig);
  };


  const renderFormField = (fieldKey: string, fieldSchema: ConfigFieldSchema) => {
    let currentValue: any;
    if (node.config[fieldKey] !== undefined) {
        currentValue = node.config[fieldKey];
    } else if (fieldSchema.defaultValue !== undefined) {
        currentValue = fieldSchema.defaultValue;
    } else {
        // Fallback if no value and no schema default
        if (fieldSchema.type === 'json') {
            currentValue = '{}'; // Default to empty object string for JSON
        } else if (fieldSchema.type === 'number') {
            currentValue = ''; // Allow empty string for number input, it will coerce to 0 on change if needed by backend
        } else if (fieldSchema.type === 'boolean') {
            currentValue = false; 
        }
        else {
            currentValue = '';
        }
    }

    // Ensure JSON is stringified for textarea if it's an object
    if (fieldSchema.type === 'json' && typeof currentValue !== 'string') {
        currentValue = JSON.stringify(currentValue, null, 2);
    }


    switch (fieldSchema.type) {
      case 'string':
      case 'number':
        return (
          <Input
            type={fieldSchema.type === 'number' ? 'number' : 'text'}
            id={`${node.id}-${fieldKey}`}
            value={currentValue} // Directly use currentValue, which can be '' for number initially
            placeholder={fieldSchema.placeholder}
            onChange={(e) => handleInputChange(fieldKey, fieldSchema.type === 'number' ? e.target.value : e.target.value)} // Send string for number, parse in handleInputChange or backend
            className="mt-1"
          />
        );
      case 'textarea':
      case 'json':
        return (
          <Textarea
            id={`${node.id}-${fieldKey}`}
            value={String(currentValue)} 
            placeholder={fieldSchema.placeholder}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            className="mt-1 min-h-[80px] font-mono text-xs"
            rows={fieldSchema.type === 'json' ? 5 : 3}
          />
        );
      case 'select':
        return (
          <Select
            value={String(currentValue)}
            onValueChange={(value) => handleInputChange(fieldKey, value)}
          >
            <SelectTrigger id={`${node.id}-${fieldKey}`} className="mt-1">
              <SelectValue placeholder={fieldSchema.placeholder || `Select ${fieldSchema.label}`} />
            </SelectTrigger>
            <SelectContent>
              {fieldSchema.options?.map((option, index) => {
                const val = typeof option === 'string' ? option : option.value;
                const lab = typeof option === 'string' ? option : option.label;
                return <SelectItem key={`${val}-${index}`} value={val}>{lab}</SelectItem>
              })}
            </SelectContent>
          </Select>
        );
      case 'boolean':
        return (
          <div className="flex items-center space-x-2 mt-2">
            <Switch
              id={`${node.id}-${fieldKey}`}
              checked={!!currentValue}
              onCheckedChange={(checked) => handleInputChange(fieldKey, checked)}
            />
            <Label htmlFor={`${node.id}-${fieldKey}`} className="text-sm cursor-pointer">
              {fieldSchema.label} {currentValue ? "(Enabled)" : "(Disabled)"}
            </Label>
          </div>
        );
      default:
        return <p className="text-destructive text-xs mt-1">Unsupported field type: {fieldSchema.type}</p>;
    }
  };
  
  const suggestedNodeConfig = suggestedNextNodeInfo?.suggestion?.suggestedNode 
    ? AVAILABLE_NODES_CONFIG.find(n => n.type === suggestedNextNodeInfo.suggestion.suggestedNode) 
    : null;

  const { envPlaceholders, secretPlaceholders } = React.useMemo(() => {
    const configEnv = findPlaceholdersInObject(node.config, 'env');
    const configSecret = findPlaceholdersInObject(node.config, 'secret');

    const explanationEnv = new Set<string>();
    const explanationSecret = new Set<string>();

    if (node.aiExplanation) {
        const envRegex = /{{\s*env\.([^}\s]+)\s*}}/g;
        let match;
        while ((match = envRegex.exec(node.aiExplanation)) !== null) {
            explanationEnv.add(match[0]);
        }
        const secretRegex = /{{\s*secret\.([^}\s]+)\s*}}/g;
        while ((match = secretRegex.exec(node.aiExplanation)) !== null) {
            explanationSecret.add(match[0]);
        }
    }
    
    return {
        envPlaceholders: Array.from(new Set([...configEnv, ...Array.from(explanationEnv)])),
        secretPlaceholders: Array.from(new Set([...configSecret, ...Array.from(explanationSecret)])),
    };
  }, [node.config, node.aiExplanation]);

  const currentRetryConfig: Partial<RetryConfig> = node.config.retry || {};

  const handleRetryConfigChange = (field: keyof RetryConfig, value: string) => {
    let processedValue: any = value;
    if (field === 'attempts' || field === 'delayMs' || field === 'backoffFactor') {
      processedValue = value.trim() === '' ? undefined : parseInt(value, 10);
      if (isNaN(processedValue as number)) processedValue = undefined;
    } else if (field === 'retryOnStatusCodes') {
      processedValue = value.trim() === '' ? undefined : value.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n));
      if (processedValue && processedValue.length === 0) processedValue = undefined;
    } else if (field === 'retryOnErrorKeywords') {
      processedValue = value.trim() === '' ? undefined : value.split(',').map((s: string) => s.trim()).filter(Boolean);
      if (processedValue && processedValue.length === 0) processedValue = undefined;
    }
    handleInputChange(field, processedValue, true);
  };

  const toggleRetryConfig = () => {
    const newConfig = produce(node.config, draft => {
        if (draft.retry) {
            delete draft.retry;
        } else {
            draft.retry = { attempts: 3, delayMs: 1000 }; // Default retry
        }
    });
    onConfigChange(node.id, newConfig);
  };

  return (
    <Card className="shadow-lg flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Configure: {node.name || nodeType?.name}</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => onDeleteNode(node.id)} title="Delete Node">
                <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
        </div>
        <CardDescription>Node ID: {node.id} | Type: {node.type}</CardDescription>
      </CardHeader>
      <ScrollArea className="flex-grow">
        <CardContent className="space-y-4 pb-6">
          <div>
            <Label htmlFor={`${node.id}-nodeName`} className="font-semibold">Node Name</Label>
            <Input
              id={`${node.id}-nodeName`}
              value={node.name}
              onChange={(e) => onNodeNameChange(node.id, e.target.value)}
              placeholder="Enter node name"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`${node.id}-nodeDescription`} className="font-semibold">Node Description</Label>
            <Textarea
              id={`${node.id}-nodeDescription`}
              value={node.description || ''}
              onChange={(e) => onNodeDescriptionChange(node.id, e.target.value)}
              placeholder="Enter a brief description for this node"
              className="mt-1 min-h-[60px]"
              rows={2}
            />
          </div>

          {node.aiExplanation && (
            <div className="p-3 bg-accent/10 rounded-md border border-accent/30">
              <Label className="font-semibold text-accent-foreground/90 flex items-center gap-2">
                <Info className="h-4 w-4" />
                AI Explanation
              </Label>
              <Textarea
                value={node.aiExplanation}
                readOnly
                className="mt-1 text-xs text-muted-foreground bg-background/50 min-h-[100px] max-h-[200px] font-mono leading-relaxed"
                rows={5}
              />
              <p className="text-xs text-muted-foreground mt-1">This is how the AI understands and configured this node.</p>
            </div>
          )}

          {/* Main Config Fields */}
          {nodeType?.configSchema && Object.keys(nodeType.configSchema)
            .filter(key => key !== 'retry' && key !== 'onErrorWebhook') // Filter out retry/webhook as they are handled separately
            .length > 0 ? (
            Object.entries(nodeType.configSchema)
              .filter(([key]) => key !== 'retry' && key !== 'onErrorWebhook')
              .map(([key, schema]) => (
              <div key={key}>
                 {schema.type !== 'boolean' && <Label htmlFor={`${node.id}-${key}`} className="font-semibold">{schema.label}</Label>}
                {renderFormField(key, schema)}
                {schema.helperText && <p className="text-xs text-muted-foreground mt-1">{schema.helperText}</p>}
              </div>
            ))
          ) : (
             <div className="mt-4">
                <Label className="font-semibold text-sm">Raw Configuration (JSON)</Label>
                <Textarea
                    value={typeof node.config === 'string' ? node.config : JSON.stringify(node.config, null, 2)}
                    onChange={(e) => {
                        try {
                            const newConfig = JSON.parse(e.target.value); // Attempt to parse if user types JSON
                            onConfigChange(node.id, newConfig);
                        } catch (err) {
                           // If parsing fails, it means user is typing non-JSON or incomplete JSON.
                           // Store as string. The backend or AI prompt output structure will handle the final JSON.
                           onConfigChange(node.id, e.target.value); 
                        }
                    }}
                    className="mt-1 font-mono text-xs min-h-[100px]"
                    rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">Edit raw JSON for this node's config. Use with caution.</p>
             </div>
          )}
          {(!nodeType?.configSchema || Object.keys(nodeType.configSchema).filter(key => key !== 'retry' && key !== 'onErrorWebhook').length === 0) && 
           Object.keys(node.config || {}).filter(key => key !== 'retry' && key !== 'onErrorWebhook').length === 0 && (
             <p className="text-sm text-muted-foreground mt-2">No specific configuration schema or raw config available for this node type (excluding retry/webhook).</p>
          )}

          {/* Retry Configuration Section */}
          {nodeType?.configSchema?.retry && (
             <Accordion type="single" collapsible className="w-full mt-3" defaultValue={node.config.retry && Object.keys(node.config.retry).length > 0 ? "retry-config" : undefined}>
                <AccordionItem value="retry-config">
                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                            <RotateCcwIcon className="h-4 w-4 text-primary" />
                            Retry Configuration
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground">
                                {currentRetryConfig.attempts ? 'Customize retry behavior.' : 'Retries are currently disabled.'}
                            </Label>
                            <Button variant="outline" size="sm" onClick={toggleRetryConfig} className="text-xs">
                                {node.config.retry ? 'Disable Retries' : 'Enable Retries'}
                            </Button>
                        </div>
                        {node.config.retry && (
                            <>
                                <div>
                                    <Label htmlFor={`${node.id}-retry-attempts`} className="text-xs">Attempts</Label>
                                    <Input type="number" id={`${node.id}-retry-attempts`}
                                           value={currentRetryConfig.attempts ?? ''}
                                           onChange={(e) => handleRetryConfigChange('attempts', e.target.value)}
                                           placeholder="e.g., 3" className="mt-1 text-xs h-8" />
                                    <p className="text-xs text-muted-foreground mt-0.5">Total execution attempts.</p>
                                </div>
                                <div>
                                    <Label htmlFor={`${node.id}-retry-delayMs`} className="text-xs">Initial Delay (ms)</Label>
                                    <Input type="number" id={`${node.id}-retry-delayMs`}
                                           value={currentRetryConfig.delayMs ?? ''}
                                           onChange={(e) => handleRetryConfigChange('delayMs', e.target.value)}
                                           placeholder="e.g., 1000" className="mt-1 text-xs h-8" />
                                    <p className="text-xs text-muted-foreground mt-0.5">Delay before the first retry.</p>
                                </div>
                                <div>
                                    <Label htmlFor={`${node.id}-retry-backoffFactor`} className="text-xs">Backoff Factor</Label>
                                    <Input type="number" id={`${node.id}-retry-backoffFactor`}
                                           value={currentRetryConfig.backoffFactor ?? ''}
                                           onChange={(e) => handleRetryConfigChange('backoffFactor', e.target.value)}
                                           placeholder="e.g., 2 (for exponential)" className="mt-1 text-xs h-8" />
                                     <p className="text-xs text-muted-foreground mt-0.5">Multiplier for subsequent delays.</p>
                                </div>
                                <div>
                                    <Label htmlFor={`${node.id}-retry-statusCodes`} className="text-xs">Retry on Status Codes (HTTP only)</Label>
                                    <Input type="text" id={`${node.id}-retry-statusCodes`}
                                           value={(currentRetryConfig.retryOnStatusCodes || []).join(', ')}
                                           onChange={(e) => handleRetryConfigChange('retryOnStatusCodes', e.target.value)}
                                           placeholder="e.g., 500, 503, 429 (comma-separated)" className="mt-1 text-xs h-8" />
                                    <p className="text-xs text-muted-foreground mt-0.5">Comma-separated HTTP status codes.</p>
                                </div>
                                <div>
                                    <Label htmlFor={`${node.id}-retry-keywords`} className="text-xs">Retry on Error Keywords</Label>
                                    <Input type="text" id={`${node.id}-retry-keywords`}
                                           value={(currentRetryConfig.retryOnErrorKeywords || []).join(', ')}
                                           onChange={(e) => handleRetryConfigChange('retryOnErrorKeywords', e.target.value)}
                                           placeholder="e.g., timeout, unavailable (comma-separated)" className="mt-1 text-xs h-8" />
                                    <p className="text-xs text-muted-foreground mt-0.5">Case-insensitive keywords in error messages.</p>
                                </div>
                            </>
                        )}
                    </AccordionContent>
                </AccordionItem>
             </Accordion>
          )}

          {/* Placeholder for OnErrorWebhook - can be implemented similarly to Retry if needed */}
          {nodeType?.configSchema?.onErrorWebhook && (
             <div className="mt-3 p-3 border rounded-md bg-muted/30">
                 <Label className="font-semibold text-sm">On-Error Webhook (JSON)</Label>
                 <Textarea
                    value={node.config.onErrorWebhook ? JSON.stringify(node.config.onErrorWebhook, null, 2) : ''}
                    onChange={(e) => handleInputChange('onErrorWebhook', e.target.value)} // Value is string from textarea
                    placeholder={'{\n  "url": "...",\n  "method": "POST",\n  ...\n}'}
                    className="mt-1 font-mono text-xs min-h-[80px]"
                    rows={4}
                 />
                 <p className="text-xs text-muted-foreground mt-1">Configure webhook for notifications on final failure.</p>
             </div>
          )}


          <Separator className="my-4" />
          
          <div>
            <Label className="font-semibold text-muted-foreground flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                Environment & Secret Placeholders
            </Label>
            {envPlaceholders.length === 0 && secretPlaceholders.length === 0 ? (
                <p className="text-xs text-muted-foreground mt-2 p-3 border rounded-md bg-muted/30 italic">
                No <code className="font-mono text-xs">{`{{env...}}`}</code> or <code className="font-mono text-xs">{`{{secret...}}`}</code> placeholders detected for this node.
                </p>
            ) : (
                <div className="mt-2 space-y-1">
                {envPlaceholders.map(ph => (
                    <div key={ph} className="text-xs p-1.5 border rounded-md bg-card shadow-sm">
                    <code className="font-mono text-primary">{ph}</code>
                    <span className="text-muted-foreground ml-2">(Environment Variable)</span>
                    </div>
                ))}
                {secretPlaceholders.map(ph => (
                    <div key={ph} className="text-xs p-1.5 border rounded-md bg-card shadow-sm">
                    <code className="font-mono text-primary">{ph}</code>
                    <span className="text-muted-foreground ml-2">(Secret - uses env var for local dev)</span>
                    </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2 pt-1">
                    Ensure these are defined in your <code>.env</code> file (e.g., <code>VAR_NAME=your_value</code>). Secrets are typically managed by a vault in production.
                </p>
                </div>
            )}
         </div>


          <Separator className="my-4" />

          <div>
            <Label className="font-semibold text-primary flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                AI Node Suggestion
            </Label>
            {isLoadingSuggestion && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 p-3 border rounded-md bg-muted/30">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Fetching suggestions...</span>
                </div>
            )}
            {!isLoadingSuggestion && suggestedNextNodeInfo && suggestedNextNodeInfo.forNodeId === node.id && suggestedNodeConfig && (
                <div className="mt-2 p-3 border rounded-md bg-primary/5 space-y-2">
                    <p className="text-sm">
                        Consider adding: <span className="font-semibold text-primary">{suggestedNodeConfig.name}</span>
                        <span className="text-xs text-muted-foreground ml-1">({suggestedNextNodeInfo.suggestion.suggestedNode})</span>
                    </p>
                    <p className="text-xs text-muted-foreground italic">Reason: {suggestedNextNodeInfo.suggestion.reason}</p>
                    <Button 
                        size="sm" 
                        onClick={() => onAddSuggestedNode(suggestedNextNodeInfo.suggestion.suggestedNode)}
                        className="w-full"
                    >
                       <Wand2 className="mr-2 h-4 w-4" /> Add Suggested Node
                    </Button>
                </div>
            )}
            {!isLoadingSuggestion && (!suggestedNextNodeInfo || suggestedNextNodeInfo.forNodeId !== node.id || !suggestedNodeConfig) && (
                 <p className="text-xs text-muted-foreground mt-2 p-3 border rounded-md bg-muted/30 italic">No specific suggestion available right now, or suggestion type not found.</p>
            )}
          </div>

        </CardContent>
      </ScrollArea>
    </Card>
  );
}
