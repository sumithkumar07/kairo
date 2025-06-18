
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
import { Info, Trash2, Wand2, Loader2, KeyRound, RotateCcwIcon, ChevronRight, AlertCircle, AlertTriangle } from 'lucide-react'; 
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';
import { findPlaceholdersInObject } from '@/lib/workflow-utils';
import React, { useState } from 'react'; // Import useState
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
  const [numberValidationErrors, setNumberValidationErrors] = useState<Record<string, string | null>>({});
  const [requiredFieldErrors, setRequiredFieldErrors] = useState<Record<string, string | null>>({});


  const handleInputChange = (fieldKey: string, value: any, isRetryField = false, isOnErrorWebhookField = false) => {
    let valueToSet = value;
    const schema = isRetryField || isOnErrorWebhookField ? null : nodeType?.configSchema?.[fieldKey];

    // Required field validation
    if (schema?.required) {
      const isEffectivelyEmpty = (val: any) => {
        if (val === undefined || val === null) return true;
        if (typeof val === 'string' && val.trim() === '') return true;
        if (schema.type === 'json' && typeof val === 'string') {
          const trimmed = val.trim();
          return (trimmed === '{}' || trimmed === '[]') && !schema.allowEmptyJson;
        }
        return false;
      };
      if (isEffectivelyEmpty(valueToSet)) {
        setRequiredFieldErrors(prev => ({ ...prev, [fieldKey]: 'This field is required.' }));
      } else {
        setRequiredFieldErrors(prev => ({ ...prev, [fieldKey]: null }));
      }
    }


    // Validation for JSON fields
    if (schema?.type === 'json') {
      try {
        const trimmedValue = String(valueToSet).trim();
        if (trimmedValue === '') { 
            if (schema.required && !schema.allowEmptyJson) {
                 setJsonValidationErrors(prev => ({ ...prev, [fieldKey]: 'This JSON field is required and cannot be empty.' }));
            } else {
                 setJsonValidationErrors(prev => ({ ...prev, [fieldKey]: null }));
            }
        } else {
            JSON.parse(trimmedValue); 
            setJsonValidationErrors(prev => ({ ...prev, [fieldKey]: null })); 
        }
      } catch (e) {
        setJsonValidationErrors(prev => ({ ...prev, [fieldKey]: 'Invalid JSON format.' }));
      }
    }

    // Validation for Number fields
    if (schema?.type === 'number') {
      const numValue = parseFloat(String(valueToSet));
      if (String(valueToSet).trim() !== '' && isNaN(numValue)) {
        setNumberValidationErrors(prev => ({ ...prev, [fieldKey]: 'Must be a valid number.' }));
      } else {
        setNumberValidationErrors(prev => ({ ...prev, [fieldKey]: null }));
        if (String(valueToSet).trim() === '') valueToSet = undefined; 
        else valueToSet = numValue;
      }
    }
    
    const newConfig = produce(node.config, draftConfig => {
      if (isRetryField) {
        if (!draftConfig.retry) draftConfig.retry = {};
        (draftConfig.retry as Record<string, any>)[fieldKey] = valueToSet;
        if (valueToSet === undefined || valueToSet === null || (typeof valueToSet === 'string' && valueToSet.trim() === '') || (Array.isArray(valueToSet) && valueToSet.length === 0) ) {
           delete (draftConfig.retry as Record<string, any>)[fieldKey];
        }
      } else if (isOnErrorWebhookField) {
        if (fieldKey === 'onErrorWebhook') {
            try {
                const parsedValue = JSON.parse(String(valueToSet));
                draftConfig.onErrorWebhook = parsedValue;
                 setJsonValidationErrors(prev => ({ ...prev, [fieldKey]: null }));
            } catch (e) {
                draftConfig.onErrorWebhook = valueToSet; 
                setJsonValidationErrors(prev => ({ ...prev, [fieldKey]: 'Invalid JSON for Webhook Config.' }));
            }
        }
      } else {
        draftConfig[fieldKey] = valueToSet;
      }
    });
    onConfigChange(node.id, newConfig);
  };


  const renderFormField = (fieldKey: string, fieldSchema: ConfigFieldSchema, isOnErrorWebhook = false) => {
    let currentValue: any;

    if (isOnErrorWebhook) {
        currentValue = node.config.onErrorWebhook;
    } else if (node.config[fieldKey] !== undefined) {
        currentValue = node.config[fieldKey];
    } else if (fieldSchema.defaultValue !== undefined) {
        currentValue = fieldSchema.defaultValue;
    } else {
        if (fieldSchema.type === 'json') currentValue = (fieldSchema.allowEmptyJson && fieldSchema.required) ? '{}' : ''; 
        else if (fieldSchema.type === 'number') currentValue = ''; 
        else if (fieldSchema.type === 'boolean') currentValue = false; 
        else currentValue = '';
    }

    if (fieldSchema.type === 'json' && typeof currentValue !== 'string') {
        currentValue = JSON.stringify(currentValue, null, 2);
    }
    
    const requiredError = requiredFieldErrors[fieldKey];
    const jsonError = jsonValidationErrors[fieldKey];
    const numberError = numberValidationErrors[fieldKey];
    const hasError = !!requiredError || !!jsonError || !!numberError;

    let errorMessage = requiredError || jsonError || numberError;


    switch (fieldSchema.type) {
      case 'string':
      case 'number':
        return (
          <>
            <Input
              type={fieldSchema.type === 'number' ? 'text' : 'text'} 
              id={`${node.id}-${fieldKey}`}
              value={currentValue}
              placeholder={fieldSchema.placeholder}
              onChange={(e) => handleInputChange(fieldKey, e.target.value, false, isOnErrorWebhook)}
              className={cn("mt-1 text-sm", hasError && "border-destructive focus-visible:ring-destructive")}
            />
            {errorMessage && <p className="text-xs text-destructive mt-0.5">{errorMessage}</p>}
          </>
        );
      case 'textarea':
      case 'json':
        return (
          <>
            <Textarea
              id={`${node.id}-${fieldKey}`}
              value={String(currentValue)} 
              placeholder={fieldSchema.placeholder}
              onChange={(e) => handleInputChange(fieldKey, e.target.value, false, isOnErrorWebhook)}
              className={cn("mt-1 min-h-[70px] font-mono text-xs max-h-[200px]", hasError && "border-destructive focus-visible:ring-destructive")}
              rows={fieldSchema.type === 'json' ? 4 : 3}
            />
            {errorMessage && <p className="text-xs text-destructive mt-0.5">{errorMessage}</p>}
          </>
        );
      case 'select':
        return (
          <>
            <Select
              value={String(currentValue)}
              onValueChange={(value) => handleInputChange(fieldKey, value, false, isOnErrorWebhook)}
            >
              <SelectTrigger id={`${node.id}-${fieldKey}`} className={cn("mt-1 text-sm", hasError && "border-destructive focus-visible:ring-destructive")}>
                <SelectValue placeholder={fieldSchema.placeholder || `Select ${fieldSchema.label}`} />
              </SelectTrigger>
              <SelectContent>
                {fieldSchema.options?.map((option, index) => {
                  const val = typeof option === 'string' ? option : option.value;
                  const lab = typeof option === 'string' ? option : option.label;
                  return <SelectItem key={`${val}-${index}`} value={val} className="text-sm">{lab}</SelectItem>
                })}
              </SelectContent>
            </Select>
            {errorMessage && <p className="text-xs text-destructive mt-0.5">{errorMessage}</p>}
          </>
        );
      case 'boolean':
        return (
          <div className="flex items-center space-x-2 mt-2 py-1">
            <Switch
              id={`${node.id}-${fieldKey}`}
              checked={!!currentValue}
              onCheckedChange={(checked) => handleInputChange(fieldKey, checked, false, isOnErrorWebhook)}
              className={cn(hasError && "ring-2 ring-destructive focus:ring-destructive")}
            />
            <Label htmlFor={`${node.id}-${fieldKey}`} className="text-sm cursor-pointer text-muted-foreground">
              {fieldSchema.label} {currentValue ? <span className="text-primary/80">(Enabled)</span> : <span className="text-muted-foreground/70">(Disabled)</span>}
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
    const configSecret = findPlaceholdersInObject(node.config, 'credential');


    const explanationEnv = new Set<string>();
    const explanationSecret = new Set<string>();

    if (node.aiExplanation) {
        const envRegex = /{{\s*env\.([^}\s]+)\s*}}/g;
        let match;
        while ((match = envRegex.exec(node.aiExplanation)) !== null) {
            explanationEnv.add(match[0]);
        }
        const secretRegex = /{{\s*(?:secret|credential)\.([^}\s]+)\s*}}/g; 
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
  const currentOnErrorWebhookConfig: Partial<OnErrorWebhookConfig> = node.config.onErrorWebhook || {};


  const handleRetryConfigChange = (field: keyof RetryConfig, value: string) => {
    let processedValue: any = value;
    if (field === 'attempts' || field === 'delayMs' || field === 'backoffFactor') {
      processedValue = value.trim() === '' ? undefined : parseInt(value, 10);
      if (isNaN(processedValue as number)) processedValue = undefined;
    } else if (field === 'retryOnStatusCodes') {
      processedValue = value.trim() === '' ? undefined : value.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n));
      if (Array.isArray(processedValue) && processedValue.length === 0) processedValue = undefined;
    } else if (field === 'retryOnErrorKeywords') {
      processedValue = value.trim() === '' ? undefined : value.split(',').map((s: string) => s.trim()).filter(Boolean);
      if (Array.isArray(processedValue) && processedValue.length === 0) processedValue = undefined;
    }
    handleInputChange(field, processedValue, true);
  };

  const toggleRetryConfig = () => {
    const newConfig = produce(node.config, draft => {
        if (draft.retry) {
            delete draft.retry;
        } else {
            draft.retry = { attempts: 3, delayMs: 1000 }; 
        }
    });
    onConfigChange(node.id, newConfig);
  };

  const toggleOnErrorWebhookConfig = () => {
    const newConfig = produce(node.config, draft => {
        if (draft.onErrorWebhook) {
            delete draft.onErrorWebhook;
        } else {
            draft.onErrorWebhook = { url: "https://example.com/webhook" }; // Default starter
        }
    });
    onConfigChange(node.id, newConfig);
  };


  const nodeSupportsRetry = nodeType?.configSchema?.hasOwnProperty('retry');
  const nodeSupportsOnErrorWebhook = nodeType?.configSchema?.hasOwnProperty('onErrorWebhook');

  const currentDataTransformType = node.type === 'dataTransform' ? node.config.transformType : null;

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
          <div className="space-y-1">
            <Label htmlFor={`${node.id}-nodeName`} className="text-xs font-medium">Node Name</Label>
            <Input
              id={`${node.id}-nodeName`}
              value={node.name}
              onChange={(e) => onNodeNameChange(node.id, e.target.value)}
              placeholder="Enter node name"
              className="mt-1 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${node.id}-nodeDescription`} className="text-xs font-medium">Node Description</Label>
            <Textarea
              id={`${node.id}-nodeDescription`}
              value={node.description || ''}
              onChange={(e) => onNodeDescriptionChange(node.id, e.target.value)}
              placeholder="Enter a brief description for this node"
              className="mt-1 min-h-[50px] text-sm"
              rows={2}
            />
          </div>
          <Separator className="my-3" />

          {node.aiExplanation && (
            <>
              <div className="p-3 bg-accent/10 rounded-md border border-accent/20 shadow-sm space-y-1.5">
                <Label className="text-xs font-medium text-accent-foreground/90 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5" />
                  AI Explanation & Guidance
                </Label>
                <Textarea
                  value={node.aiExplanation}
                  readOnly
                  className="mt-1 text-xs text-muted-foreground bg-background/30 min-h-[80px] max-h-[180px] font-mono leading-relaxed resize-none border-accent/10"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground/80 italic">This is how the AI understands and configured this node. Check for any setup steps.</p>
              </div>
              <Separator className="my-3" />
            </>
          )}
          
          <Label className="text-sm font-semibold text-foreground">Parameters</Label>
          {nodeType?.configSchema && Object.keys(nodeType.configSchema)
            .filter(key => key !== 'retry' && key !== 'onErrorWebhook') 
            .length > 0 ? (
            Object.entries(nodeType.configSchema)
              .filter(([key, schema]) => {
                if (key === 'retry' || key === 'onErrorWebhook') return false;
                if (node.type === 'dataTransform' && schema.relevantForTypes && currentDataTransformType) {
                  return schema.relevantForTypes.includes(currentDataTransformType);
                }
                return true; 
              })
              .map(([key, schema]) => {
                const hasError = !!requiredFieldErrors[key] || !!jsonValidationErrors[key] || !!numberValidationErrors[key];
                const errorMessage = requiredFieldErrors[key] || jsonValidationErrors[key] || numberValidationErrors[key];
                return (
                <div key={key} className="space-y-1 mt-2">
                   {schema.type !== 'boolean' && 
                    <Label htmlFor={`${node.id}-${key}`} className={cn("text-xs font-medium", hasError && "text-destructive")}>
                        {schema.label}
                        {schema.required && <span className="text-destructive ml-1">*</span>}
                    </Label>}
                  {renderFormField(key, schema)}
                  {schema.helperText && !errorMessage && <p className="text-xs text-muted-foreground/80 mt-0.5">{schema.helperText}</p>}
                </div>
              )})
          ) : (
             <div className="mt-2">
                <Label className="text-xs font-medium">Raw Configuration (JSON)</Label>
                <Textarea
                    value={typeof node.config === 'string' ? node.config : JSON.stringify(Object.fromEntries(Object.entries(node.config).filter(([key]) => key !== 'retry' && key !== 'onErrorWebhook')), null, 2)}
                    onChange={(e) => {
                        try {
                            const val = e.target.value.trim();
                            let newConfig = {};
                            if (val) {
                                newConfig = JSON.parse(val);
                            }
                            
                            const updatedFullConfig = {
                                ...newConfig,
                                ...(node.config.retry && { retry: node.config.retry }),
                                ...(node.config.onErrorWebhook && { onErrorWebhook: node.config.onErrorWebhook }),
                            };
                            onConfigChange(node.id, updatedFullConfig);
                             setJsonValidationErrors(prev => ({ ...prev, ["rawConfig"]: null }));
                        } catch (err) {
                           setJsonValidationErrors(prev => ({ ...prev, ["rawConfig"]: "Invalid JSON format."}));
                        }
                    }}
                    className={cn("mt-1 font-mono text-xs min-h-[80px] max-h-[200px]", jsonValidationErrors["rawConfig"] && "border-destructive")}
                    rows={4}
                    placeholder='Enter valid JSON or leave empty. Example: {"key": "value"}'
                />
                {jsonValidationErrors["rawConfig"] && <p className="text-xs text-destructive mt-0.5">{jsonValidationErrors["rawConfig"]}</p>}
                <p className="text-xs text-muted-foreground/80 mt-0.5">Edit raw JSON for this node's config. Use with caution. This is shown if no specific parameters are defined (excluding retry/webhook).</p>
             </div>
          )}
          {(!nodeType?.configSchema || Object.keys(nodeType.configSchema).filter(key => key !== 'retry' && key !== 'onErrorWebhook').length === 0) && 
           Object.keys(node.config || {}).filter(key => key !== 'retry' && key !== 'onErrorWebhook').length === 0 && (
             <p className="text-xs text-muted-foreground mt-2 p-2 bg-muted/30 rounded-sm italic">No specific configuration parameters defined for this node type (excluding retry/webhook).</p>
          )}
          <Separator className="my-3" />

          {nodeSupportsRetry && (
             <Accordion type="single" collapsible className="w-full mt-3 border rounded-md shadow-sm" defaultValue={node.config.retry && Object.keys(node.config.retry).length > 0 ? "retry-config" : undefined}>
                <AccordionItem value="retry-config" className="border-b-0">
                    <AccordionTrigger className="text-xs font-medium hover:no-underline px-3 py-2.5 bg-muted/30 hover:bg-muted/50 rounded-t-md [&[data-state=open]]:rounded-b-none">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <RotateCcwIcon className="h-3.5 w-3.5" />
                            Retry Configuration
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 px-3 pb-3 space-y-2.5 bg-card">
                        <div className="flex items-center justify-between pt-1">
                            <Label className="text-xs text-muted-foreground">
                                {currentRetryConfig.attempts ? 'Customize retry behavior.' : 'Retries are currently disabled.'}
                            </Label>
                            <Button variant="outline" size="xs" onClick={toggleRetryConfig} className="text-xs h-7">
                                {node.config.retry ? 'Disable Retries' : 'Enable Retries'}
                            </Button>
                        </div>
                        {node.config.retry && (
                            <>
                                <div className="space-y-0.5">
                                    <Label htmlFor={`${node.id}-retry-attempts`} className="text-xs">Attempts</Label>
                                    <Input type="number" id={`${node.id}-retry-attempts`}
                                           value={currentRetryConfig.attempts ?? ''}
                                           onChange={(e) => handleRetryConfigChange('attempts', e.target.value)}
                                           placeholder="e.g., 3" className="mt-0.5 text-xs h-8" />
                                    <p className="text-xs text-muted-foreground/80 mt-0.5">Total execution attempts.</p>
                                </div>
                                <div className="space-y-0.5">
                                    <Label htmlFor={`${node.id}-retry-delayMs`} className="text-xs">Initial Delay (ms)</Label>
                                    <Input type="number" id={`${node.id}-retry-delayMs`}
                                           value={currentRetryConfig.delayMs ?? ''}
                                           onChange={(e) => handleRetryConfigChange('delayMs', e.target.value)}
                                           placeholder="e.g., 1000" className="mt-0.5 text-xs h-8" />
                                    <p className="text-xs text-muted-foreground/80 mt-0.5">Delay before the first retry.</p>
                                </div>
                                <div className="space-y-0.5">
                                    <Label htmlFor={`${node.id}-retry-backoffFactor`} className="text-xs">Backoff Factor</Label>
                                    <Input type="number" id={`${node.id}-retry-backoffFactor`}
                                           value={currentRetryConfig.backoffFactor ?? ''}
                                           onChange={(e) => handleRetryConfigChange('backoffFactor', e.target.value)}
                                           placeholder="e.g., 2 (for exponential)" className="mt-0.5 text-xs h-8" />
                                     <p className="text-xs text-muted-foreground/80 mt-0.5">Multiplier for subsequent delays.</p>
                                </div>
                                <div className="space-y-0.5">
                                    <Label htmlFor={`${node.id}-retry-statusCodes`} className="text-xs">Retry on Status Codes (HTTP only)</Label>
                                    <Input type="text" id={`${node.id}-retry-statusCodes`}
                                           value={(currentRetryConfig.retryOnStatusCodes || []).join(', ')}
                                           onChange={(e) => handleRetryConfigChange('retryOnStatusCodes', e.target.value)}
                                           placeholder="500, 503, 429 (comma-separated)" className="mt-0.5 text-xs h-8" />
                                    <p className="text-xs text-muted-foreground/80 mt-0.5">Comma-separated HTTP status codes.</p>
                                </div>
                                <div className="space-y-0.5">
                                    <Label htmlFor={`${node.id}-retry-keywords`} className="text-xs">Retry on Error Keywords</Label>
                                    <Input type="text" id={`${node.id}-retry-keywords`}
                                           value={(currentRetryConfig.retryOnErrorKeywords || []).join(', ')}
                                           onChange={(e) => handleRetryConfigChange('retryOnErrorKeywords', e.target.value)}
                                           placeholder="timeout, unavailable (comma-separated)" className="mt-0.5 text-xs h-8" />
                                    <p className="text-xs text-muted-foreground/80 mt-0.5">Case-insensitive keywords in error messages.</p>
                                </div>
                            </>
                        )}
                    </AccordionContent>
                </AccordionItem>
             </Accordion>
          )}
          
          {nodeSupportsOnErrorWebhook && nodeType?.configSchema?.onErrorWebhook && (
             <Accordion type="single" collapsible className="w-full mt-3 border rounded-md shadow-sm" defaultValue={node.config.onErrorWebhook && Object.keys(node.config.onErrorWebhook).length > 0 ? "webhook-config" : undefined}>
                <AccordionItem value="webhook-config" className="border-b-0">
                    <AccordionTrigger className="text-xs font-medium hover:no-underline px-3 py-2.5 bg-muted/30 hover:bg-muted/50 rounded-t-md [&[data-state=open]]:rounded-b-none">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <AlertCircle className="h-3.5 w-3.5" />
                            On-Error Webhook
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 px-3 pb-3 space-y-1 bg-card">
                         <div className="flex items-center justify-between pt-1">
                            <Label className="text-xs text-muted-foreground">
                                {currentOnErrorWebhookConfig.url ? 'Customize on-error webhook.' : 'On-error webhook is currently disabled.'}
                            </Label>
                            <Button variant="outline" size="xs" onClick={toggleOnErrorWebhookConfig} className="text-xs h-7">
                                {node.config.onErrorWebhook ? 'Disable Webhook' : 'Enable Webhook'}
                            </Button>
                        </div>
                        {node.config.onErrorWebhook && (
                          <>
                            <Label htmlFor={`${node.id}-onErrorWebhook`} className={cn("text-xs", jsonValidationErrors[`onErrorWebhook`] && "text-destructive")}>
                                Webhook Configuration (JSON)
                                {nodeType.configSchema.onErrorWebhook.required && <span className="text-destructive ml-1">*</span>}
                            </Label>
                            {renderFormField('onErrorWebhook', nodeType.configSchema.onErrorWebhook, true)}
                            {nodeType.configSchema.onErrorWebhook.helperText && <p className="text-xs text-muted-foreground/80 mt-0.5">{nodeType.configSchema.onErrorWebhook.helperText}</p>}
                          </>
                        )}
                    </AccordionContent>
                </AccordionItem>
             </Accordion>
          )}
          <Separator className="my-3" />
          
          <div className="p-3 border rounded-md bg-muted/20 shadow-sm space-y-2">
            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                {(envPlaceholders.length > 0 || secretPlaceholders.length > 0) && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                <KeyRound className="h-3.5 w-3.5" />
                Required Placeholders
            </Label>
            {envPlaceholders.length === 0 && secretPlaceholders.length === 0 ? (
                <p className="text-xs text-muted-foreground/80 p-1.5 bg-background/40 rounded-sm italic">
                  No <code className="font-mono text-xs bg-muted/50 px-1 py-0.5 rounded break-words">{`{{env...}}`}</code> or <code className="font-mono text-xs bg-muted/50 px-1 py-0.5 rounded break-words">{`{{credential...}}`}</code> placeholders detected.
                </p>
            ) : (
                <div className="space-y-1.5">
                  {envPlaceholders.map(ph => (
                      <div key={ph} className="text-xs p-1.5 border border-transparent rounded-md bg-background/40 flex items-center justify-between">
                        <code className="font-mono text-primary/90 bg-primary/10 px-1.5 py-0.5 rounded shadow-sm break-words">{ph}</code>
                        <span className="text-muted-foreground/70 ml-2 text-[10px] tracking-wide">(ENV VAR)</span>
                      </div>
                  ))}
                  {secretPlaceholders.map(ph => (
                      <div key={ph} className="text-xs p-1.5 border border-transparent rounded-md bg-background/40 flex items-center justify-between">
                        <code className="font-mono text-orange-600 dark:text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded shadow-sm break-words">{ph}</code>
                        <span className="text-muted-foreground/70 ml-2 text-[10px] tracking-wide">(SECRET/CREDENTIAL)</span>
                      </div>
                  ))}
                  <p className="text-xs text-muted-foreground/80 pt-1 italic">
                      Define these in your <code>.env</code> file or server environment. Secrets/Credentials are typically managed by a vault or Credential Manager in production.
                  </p>
                </div>
            )}
         </div>
          <Separator className="my-3" />

          <div className="p-3 border rounded-md bg-primary/5 border-primary/20 shadow-sm space-y-1.5">
            <Label className="text-xs font-medium text-primary flex items-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5" />
                AI Node Suggestion
            </Label>
            {isLoadingSuggestion && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 p-2 border border-transparent rounded-md bg-muted/30">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="text-xs">AI is thinking...</span>
                </div>
            )}
            {!isLoadingSuggestion && suggestedNextNodeInfo && suggestedNextNodeInfo.forNodeId === node.id && suggestedNodeConfig && (
                <div className="mt-1 space-y-1.5">
                    <p className="text-xs">
                        Next, consider adding: <span className="font-semibold text-primary">{suggestedNodeConfig.name}</span>
                        <span className="text-muted-foreground/80 ml-1">({suggestedNextNodeInfo.suggestion.suggestedNode})</span>
                    </p>
                    <p className="text-xs text-muted-foreground/90 italic leading-relaxed break-words">{suggestedNextNodeInfo.suggestion.reason}</p>
                    <Button 
                        size="sm" 
                        onClick={() => onAddSuggestedNode(suggestedNextNodeInfo.suggestion.suggestedNode)}
                        className="w-full bg-primary/90 hover:bg-primary text-primary-foreground h-8 text-xs mt-1"
                    >
                       <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Add Suggested Node <ChevronRight className="ml-auto h-3.5 w-3.5" />
                    </Button>
                </div>
            )}
            {!isLoadingSuggestion && (!suggestedNextNodeInfo || suggestedNextNodeInfo.forNodeId !== node.id || !suggestedNodeConfig) && (
                 <p className="text-xs text-muted-foreground/80 mt-1 p-2 border border-transparent rounded-md bg-muted/30 italic">No specific suggestion available, or suggestion type not found.</p>
            )}
          </div>

        </CardContent>
      </ScrollArea>
    </Card>
  );
}
