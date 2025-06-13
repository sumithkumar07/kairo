
'use client';

import { Zap, Bot, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowCanvas } from '@/components/workflow-canvas';
import type { WorkflowNode, WorkflowConnection, AvailableNodeType } from '@/types/workflow';

interface AIWorkflowBuilderPanelProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  onNodeDragStop: (nodeId: string, position: { x: number; y: number }) => void;
  onCanvasDrop: (nodeType: AvailableNodeType, position: { x: number; y: number }) => void;
  onToggleAssistant: () => void;
  isAssistantVisible: boolean;
}

export function AIWorkflowBuilderPanel({
  nodes,
  connections,
  selectedNodeId,
  onNodeClick,
  onNodeDragStop,
  onCanvasDrop,
  onToggleAssistant,
  isAssistantVisible,
}: AIWorkflowBuilderPanelProps) {
  const hasWorkflow = nodes.length > 0;

  return (
    <main className="flex-1 flex flex-col bg-background dot-grid-background relative overflow-hidden">
      <div className="p-4 border-b bg-background/80 backdrop-blur-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-foreground">AI Workflow Builder</h1>
          <p className="text-sm text-muted-foreground">Create powerful automations with natural language</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
            <Radio className="h-4 w-4 mr-2" />
            AI Ready
          </Button>
          <Button
            variant={isAssistantVisible ? "default" : "outline"}
            size="sm"
            onClick={onToggleAssistant}
            aria-pressed={isAssistantVisible}
          >
            <Bot className="h-4 w-4 mr-2" />
            {isAssistantVisible ? "Hide Assistant" : "Show Assistant"}
          </Button>
        </div>
      </div>

      {hasWorkflow ? (
        <WorkflowCanvas
          nodes={nodes}
          connections={connections}
          selectedNodeId={selectedNodeId}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          onCanvasDrop={onCanvasDrop}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="p-6 bg-primary/10 rounded-full mb-6">
            <Zap className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Start Building Your Workflow</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Describe what you want to automate using our AI Assistant, or drag nodes from the library to get started.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 bg-primary rounded-full"></span>
              AI-Powered
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 bg-green-500 rounded-full"></span>
              Drag & Drop
            </span>
          </div>
        </div>
      )}
    </main>
  );
}
