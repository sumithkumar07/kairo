'use client';

import type { WorkflowNode, AvailableNodeType, ConfigFieldSchema } from '@/types/workflow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { produce } from 'immer';

interface NodeConfigPanelProps {
  node: WorkflowNode;
  nodeType?: AvailableNodeType; 
  onConfigChange: (nodeId: string, newConfig: Record<string, any>) => void;
  onNodeNameChange: (nodeId: string, newName: string) => void;
  onNodeDescriptionChange: (nodeId: string, newDescription: string) => void;
}

export function NodeConfigPanel({ node, nodeType, onConfigChange, onNodeNameChange, onNodeDescriptionChange }: NodeConfigPanelProps) {
  
  const handleInputChange = (fieldKey: string, value: any) => {
    const newConfig = produce(node.config, draftConfig => {
      draftConfig[fieldKey] = value;
    });
    onConfigChange(node.id, newConfig);
  };

  const renderFormField = (fieldKey: string, fieldSchema: ConfigFieldSchema) => {
    const currentValue = node.config[fieldKey] ?? fieldSchema.defaultValue ?? '';

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
        return (
          <Textarea
            id={`${node.id}-${fieldKey}`}
            value={currentValue}
            placeholder={fieldSchema.placeholder}
            onChange={(e) => handleInputChange(fieldKey, e.target.value)}
            className="mt-1 min-h-[80px]"
            rows={3}
          />
        );
      case 'select':
        return (
          <Select
            value={currentValue}
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

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Configure: {node.name || nodeType?.name}</CardTitle>
        <CardDescription>Node ID: {node.id} | Type: {node.type}</CardDescription>
      </CardHeader>
      <ScrollArea className="max-h-[calc(100vh-350px)]"> {/* Adjusted height slightly for new field */}
        <CardContent className="space-y-4">
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
          {nodeType?.configSchema ? (
            Object.entries(nodeType.configSchema).map(([key, schema]) => (
              <div key={key}>
                 {schema.type !== 'boolean' && <Label htmlFor={`${node.id}-${key}`} className="font-semibold">{schema.label}</Label>}
                {renderFormField(key, schema)}
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
                           // User will see invalid JSON in text area
                        }
                    }}
                    className="mt-1 font-mono text-xs min-h-[100px]"
                    rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">Edit raw JSON for this node's config. Use with caution.</p>
             </div>
          )}
          {(!nodeType?.configSchema && Object.keys(node.config || {}).length === 0) && (
             <p className="text-sm text-muted-foreground">No specific configuration available for this node type.</p>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
