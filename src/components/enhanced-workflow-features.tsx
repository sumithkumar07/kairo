'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  GitBranch, 
  Filter, 
  RotateCcw, 
  Repeat, 
  Plus, 
  Trash2, 
  Copy, 
  Settings, 
  Zap,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

// Enhanced Conditional Branching Component
export function ConditionalBranchingEditor({ 
  conditions, 
  onConditionsChange, 
  defaultBranch, 
  onDefaultBranchChange 
}: {
  conditions: Array<{ id: string; expression: string; label: string }>;
  onConditionsChange: (conditions: Array<{ id: string; expression: string; label: string }>) => void;
  defaultBranch: string;
  onDefaultBranchChange: (branch: string) => void;
}) {
  const [newCondition, setNewCondition] = useState({ expression: '', label: '' });

  const addCondition = () => {
    if (newCondition.expression && newCondition.label) {
      onConditionsChange([
        ...conditions,
        { 
          id: `condition_${Date.now()}`, 
          expression: newCondition.expression, 
          label: newCondition.label 
        }
      ]);
      setNewCondition({ expression: '', label: '' });
    }
  };

  const removeCondition = (id: string) => {
    onConditionsChange(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, field: 'expression' | 'label', value: string) => {
    onConditionsChange(conditions.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Conditional Branching
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Conditions</Label>
          {conditions.map((condition) => (
            <div key={condition.id} className="flex items-start gap-2 p-3 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Condition label"
                  value={condition.label}
                  onChange={(e) => updateCondition(condition.id, 'label', e.target.value)}
                  className="text-sm"
                />
                <Input
                  placeholder="Expression (e.g., {{input.value}} > 10)"
                  value={condition.expression}
                  onChange={(e) => updateCondition(condition.id, 'expression', e.target.value)}
                  className="text-sm font-mono"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCondition(condition.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <div className="flex items-start gap-2 p-3 border-2 border-dashed rounded-lg">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="New condition label"
                value={newCondition.label}
                onChange={(e) => setNewCondition({ ...newCondition, label: e.target.value })}
                className="text-sm"
              />
              <Input
                placeholder="Expression (e.g., {{input.value}} > 10)"
                value={newCondition.expression}
                onChange={(e) => setNewCondition({ ...newCondition, expression: e.target.value })}
                className="text-sm font-mono"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={addCondition}
              disabled={!newCondition.expression || !newCondition.label}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-sm font-medium">Default Branch</Label>
          <Input
            placeholder="else"
            value={defaultBranch}
            onChange={(e) => onDefaultBranchChange(e.target.value)}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Branch to take if no conditions match
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Error Recovery Component
export function ErrorRecoveryEditor({ 
  strategy, 
  onStrategyChange, 
  config, 
  onConfigChange 
}: {
  strategy: 'retry' | 'fallback' | 'circuit-breaker' | 'dead-letter-queue';
  onStrategyChange: (strategy: 'retry' | 'fallback' | 'circuit-breaker' | 'dead-letter-queue') => void;
  config: any;
  onConfigChange: (config: any) => void;
}) {
  const strategies = [
    { value: 'retry', label: 'Retry', icon: RefreshCw, description: 'Retry failed operation with exponential backoff' },
    { value: 'fallback', label: 'Fallback', icon: GitBranch, description: 'Execute alternative workflow path' },
    { value: 'circuit-breaker', label: 'Circuit Breaker', icon: Zap, description: 'Prevent cascading failures' },
    { value: 'dead-letter-queue', label: 'Dead Letter Queue', icon: AlertCircle, description: 'Queue failed messages for later processing' }
  ];

  const renderConfigEditor = () => {
    switch (strategy) {
      case 'retry':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">Max Attempts</Label>
                <Input
                  type="number"
                  value={config.maxAttempts || 3}
                  onChange={(e) => onConfigChange({ ...config, maxAttempts: parseInt(e.target.value) })}
                  className="text-sm"
                />
              </div>
              <div>
                <Label className="text-sm">Backoff (ms)</Label>
                <Input
                  type="number"
                  value={config.backoffMs || 1000}
                  onChange={(e) => onConfigChange({ ...config, backoffMs: parseInt(e.target.value) })}
                  className="text-sm"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">Backoff Factor</Label>
              <Input
                type="number"
                step="0.1"
                value={config.backoffFactor || 2}
                onChange={(e) => onConfigChange({ ...config, backoffFactor: parseFloat(e.target.value) })}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Multiplier for exponential backoff (e.g., 2 = double delay each retry)
              </p>
            </div>
          </div>
        );
      case 'fallback':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Fallback Node ID</Label>
              <Input
                value={config.fallbackNodeId || ''}
                onChange={(e) => onConfigChange({ ...config, fallbackNodeId: e.target.value })}
                placeholder="node_id_to_execute_on_failure"
                className="text-sm"
              />
            </div>
          </div>
        );
      case 'circuit-breaker':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Failure Threshold</Label>
              <Input
                type="number"
                value={config.circuitBreakerThreshold || 5}
                onChange={(e) => onConfigChange({ ...config, circuitBreakerThreshold: parseInt(e.target.value) })}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of failures before opening circuit
              </p>
            </div>
            <div>
              <Label className="text-sm">Recovery Timeout (ms)</Label>
              <Input
                type="number"
                value={config.recoveryTimeout || 30000}
                onChange={(e) => onConfigChange({ ...config, recoveryTimeout: parseInt(e.target.value) })}
                className="text-sm"
              />
            </div>
          </div>
        );
      case 'dead-letter-queue':
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-sm">DLQ Endpoint</Label>
              <Input
                value={config.dlqEndpoint || ''}
                onChange={(e) => onConfigChange({ ...config, dlqEndpoint: e.target.value })}
                placeholder="https://api.example.com/dlq"
                className="text-sm"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Error Recovery Strategy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Strategy</Label>
          <div className="grid grid-cols-1 gap-2">
            {strategies.map((strat) => (
              <Button
                key={strat.value}
                variant={strategy === strat.value ? "default" : "outline"}
                onClick={() => onStrategyChange(strat.value as any)}
                className="justify-start h-auto p-3"
              >
                <div className="flex items-center gap-3">
                  <strat.icon className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">{strat.label}</div>
                    <div className="text-xs text-muted-foreground">{strat.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-sm font-medium">Configuration</Label>
          {renderConfigEditor()}
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Data Transformation Component
export function DataTransformEditor({ 
  transformType, 
  onTransformTypeChange, 
  mappingRules, 
  onMappingRulesChange 
}: {
  transformType: 'map' | 'filter' | 'reduce' | 'group';
  onTransformTypeChange: (type: 'map' | 'filter' | 'reduce' | 'group') => void;
  mappingRules: Array<{ source: string; target: string; transform?: string }>;
  onMappingRulesChange: (rules: Array<{ source: string; target: string; transform?: string }>) => void;
}) {
  const [newRule, setNewRule] = useState({ source: '', target: '', transform: '' });

  const addRule = () => {
    if (newRule.source && newRule.target) {
      onMappingRulesChange([
        ...mappingRules,
        { ...newRule }
      ]);
      setNewRule({ source: '', target: '', transform: '' });
    }
  };

  const removeRule = (index: number) => {
    onMappingRulesChange(mappingRules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: string, value: string) => {
    onMappingRulesChange(mappingRules.map((rule, i) => 
      i === index ? { ...rule, [field]: value } : rule
    ));
  };

  const transformTypes = [
    { value: 'map', label: 'Map', icon: Filter, description: 'Transform each item in array' },
    { value: 'filter', label: 'Filter', icon: Filter, description: 'Filter items based on condition' },
    { value: 'reduce', label: 'Reduce', icon: Filter, description: 'Reduce array to single value' },
    { value: 'group', label: 'Group', icon: Filter, description: 'Group items by property' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Data Transformation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Transform Type</Label>
          <Select value={transformType} onValueChange={onTransformTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {transformTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Mapping Rules</Label>
          {mappingRules.map((rule, index) => (
            <div key={index} className="flex items-start gap-2 p-3 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Source (e.g., {{input.name}})"
                  value={rule.source}
                  onChange={(e) => updateRule(index, 'source', e.target.value)}
                  className="text-sm font-mono"
                />
                <Input
                  placeholder="Target property name"
                  value={rule.target}
                  onChange={(e) => updateRule(index, 'target', e.target.value)}
                  className="text-sm"
                />
                {transformType === 'map' && (
                  <Input
                    placeholder="Transform function (optional)"
                    value={rule.transform || ''}
                    onChange={(e) => updateRule(index, 'transform', e.target.value)}
                    className="text-sm font-mono"
                  />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRule(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <div className="flex items-start gap-2 p-3 border-2 border-dashed rounded-lg">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Source (e.g., {{input.name}})"
                value={newRule.source}
                onChange={(e) => setNewRule({ ...newRule, source: e.target.value })}
                className="text-sm font-mono"
              />
              <Input
                placeholder="Target property name"
                value={newRule.target}
                onChange={(e) => setNewRule({ ...newRule, target: e.target.value })}
                className="text-sm"
              />
              {transformType === 'map' && (
                <Input
                  placeholder="Transform function (optional)"
                  value={newRule.transform}
                  onChange={(e) => setNewRule({ ...newRule, transform: e.target.value })}
                  className="text-sm font-mono"
                />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={addRule}
              disabled={!newRule.source || !newRule.target}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Loop Editor Component
export function LoopEditor({ 
  loopType, 
  onLoopTypeChange,
  condition,
  onConditionChange,
  maxIterations,
  onMaxIterationsChange,
  continueOnError,
  onContinueOnErrorChange,
  inputArrayPath,
  onInputArrayPathChange
}: {
  loopType: 'forEach' | 'while' | 'doWhile';
  onLoopTypeChange: (type: 'forEach' | 'while' | 'doWhile') => void;
  condition?: string;
  onConditionChange?: (condition: string) => void;
  maxIterations?: number;
  onMaxIterationsChange?: (max: number) => void;
  continueOnError?: boolean;
  onContinueOnErrorChange?: (continue: boolean) => void;
  inputArrayPath?: string;
  onInputArrayPathChange?: (path: string) => void;
}) {
  const loopTypes = [
    { value: 'forEach', label: 'For Each', icon: Repeat, description: 'Iterate over array items' },
    { value: 'while', label: 'While', icon: RotateCcw, description: 'Loop while condition is true' },
    { value: 'doWhile', label: 'Do While', icon: RotateCcw, description: 'Execute once, then loop while condition is true' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Loop Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Loop Type</Label>
          <Select value={loopType} onValueChange={onLoopTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {loopTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {loopType === 'forEach' && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Input Array Path</Label>
            <Input
              placeholder="{{previous_node.response.items}}"
              value={inputArrayPath || ''}
              onChange={(e) => onInputArrayPathChange?.(e.target.value)}
              className="text-sm font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Path to the array to iterate over
            </p>
          </div>
        )}

        {(loopType === 'while' || loopType === 'doWhile') && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Loop Condition</Label>
            <Input
              placeholder="{{data.status}} === 'pending'"
              value={condition || ''}
              onChange={(e) => onConditionChange?.(e.target.value)}
              className="text-sm font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Condition to evaluate for continuing the loop
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-sm font-medium">Max Iterations</Label>
          <Input
            type="number"
            value={maxIterations || 100}
            onChange={(e) => onMaxIterationsChange?.(parseInt(e.target.value))}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Safety limit to prevent infinite loops
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">Continue on Error</Label>
            <p className="text-xs text-muted-foreground">
              Continue loop if an iteration fails
            </p>
          </div>
          <Switch
            checked={continueOnError || false}
            onCheckedChange={onContinueOnErrorChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}