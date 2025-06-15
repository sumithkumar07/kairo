
'use client';

import type { WorkflowNode, AvailableNodeType, ConfigFieldSchema } from '@/types/workflow';
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
import { Info, Trash2, Wand2, Loader2 } from 'lucide-react'; 
import { AVAILABLE_NODES_CONFIG } from '@/config/nodes';


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
  
  const handleInputChange = (fieldKey: string, value: any) => {
    if (nodeType?.configSchema?.[fieldKey]?.type === 'json') {
        try {
            const parsedValue = JSON.parse(value);
            const newConfig = produce(node.config, draftConfig => {
              draftConfig[fieldKey] = parsedValue;
            });
            onConfigChange(node.id, newConfig);
            return;
        } catch (e) {
            // If parsing fails but user is typing, we might want to update with raw string
            // For simplicity, let's allow the raw string if parsing fails,
            // but a better UX might show a validation error.
            const newConfig = produce(node.config, draftConfig => {
              draftConfig[fieldKey] = value; // Store as string if JSON parse fails
            });
            onConfigChange(node.id, newConfig);
            console.warn(`[NodeConfigPanel] Invalid JSON for field '${fieldKey}' in node '${node.id}'. Storing as string. Error:`, e);
            return; 
        }
    }

    const newConfig = produce(node.config, draftConfig => {
      draftConfig[fieldKey] = value;
    });
    onConfigChange(node.id, newConfig);
  };

  const renderFormField = (fieldKey: string, fieldSchema: ConfigFieldSchema) => {
    let currentValue = node.config[fieldKey] ?? fieldSchema.defaultValue ?? '';
    // For JSON type, always display as string in textarea, even if it's an object in config
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
            value={currentValue}
            placeholder={fieldSchema.placeholder}
            onChange={(e) => handleInputChange(fieldKey, fieldSchema.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
            className="mt-1"
          />
        );
      case 'textarea':
      case 'json':
        return (
          <Textarea
            id={`${node.id}-${fieldKey}`}
            value={String(currentValue)} // Ensure it's always a string for textarea
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
              {schema.label} {currentValue ? "(Enabled)" : "(Disabled)"}
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

          {nodeType?.configSchema && Object.keys(nodeType.configSchema).length > 0 ? (
            Object.entries(nodeType.configSchema).map(([key, schema]) => (
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
                    value={JSON.stringify(node.config, null, 2)}
                    onChange={(e) => {
                        try {
                            const newConfig = JSON.parse(e.target.value);
                            onConfigChange(node.id, newConfig);
                        } catch (err) {
                           // Allow storing malformed JSON as string for live editing
                           onConfigChange(node.id, e.target.value);
                           console.warn(`[NodeConfigPanel] Invalid raw JSON for node '${node.id}'. Storing as string. Error:`, err);
                        }
                    }}
                    className="mt-1 font-mono text-xs min-h-[100px]"
                    rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">Edit raw JSON for this node's config. Use with caution.</p>
             </div>
          )}
          {(!nodeType?.configSchema || Object.keys(nodeType.configSchema).length === 0) && Object.keys(node.config || {}).length === 0 && (
             <p className="text-sm text-muted-foreground mt-2">No specific configuration schema or raw config available for this node type.</p>
          )}

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
