
'use client';

import { Zap, Bot, Radio, Save, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowCanvas } from '@/components/workflow-canvas';
import type { WorkflowNode, WorkflowConnection, AvailableNodeType } from '@/types/workflow';

interface AIWorkflowBuilderPanelProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null; // Added
  onNodeClick: (nodeId: string) => void;
  onConnectionClick: (connectionId: string) => void; // Added
  onNodeDragStop: (nodeId: string, position: { x: number; y: number }) => void;
  onCanvasDrop: (nodeType: AvailableNodeType, position: { x: number; y: number }) => void;
  onToggleAssistant: () => void;
  isAssistantVisible: boolean;
  onSaveWorkflow: () => void;
  onLoadWorkflow: () => void;
  isConnecting: boolean;
  onStartConnection: (nodeId: string, handleId: string, handlePosition: { x: number, y: number }) => void;
  onCompleteConnection: (nodeId: string, handleId: string) => void;
  onUpdateConnectionPreview: (position: { x: number, y: number }) => void;
  connectionPreview: {
    startNodeId: string | null;
    startHandleId: string | null;
    previewPosition: { x: number; y: number } | null;
  } | null;
  onCanvasClick: () => void;
}

export function AIWorkflowBuilderPanel({
  nodes,
  connections,
  selectedNodeId,
  selectedConnectionId, // Added
  onNodeClick,
  onConnectionClick, // Added
  onNodeDragStop,
  onCanvasDrop,
  onToggleAssistant,
  isAssistantVisible,
  onSaveWorkflow,
  onLoadWorkflow,
  isConnecting,
  onStartConnection,
  onCompleteConnection,
  onUpdateConnectionPreview,
  connectionPreview,
  onCanvasClick,
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
          <Button variant="outline" size="sm" onClick={onLoadWorkflow}>
            <FolderOpen className="h-4 w-4 mr-2" />
            Load
          </Button>
          <Button variant="outline" size="sm" onClick={onSaveWorkflow}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
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

      {hasWorkflow || isConnecting ? (
        <WorkflowCanvas
          nodes={nodes}
          connections={connections}
          selectedNodeId={selectedNodeId}
          selectedConnectionId={selectedConnectionId} // Pass down
          onNodeClick={onNodeClick}
          onConnectionClick={onConnectionClick} // Pass down
          onNodeDragStop={onNodeDragStop}
          onCanvasDrop={onCanvasDrop}
          isConnecting={isConnecting}
          onStartConnection={onStartConnection}
          onCompleteConnection={onCompleteConnection}
          onUpdateConnectionPreview={onUpdateConnectionPreview}
          connectionPreview={connectionPreview}
          onCanvasClick={onCanvasClick}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="p-6 bg-primary/10 rounded-full mb-6">
            <Zap className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Start Building Your Workflow</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Describe what you want to automate using our AI Assistant, drag nodes from the library, or load a saved workflow.
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
             <span className="flex items-center gap-1">
              <span className="h-2 w-2 bg-accent rounded-full"></span>
              Save & Load
            </span>
          </div>
        </div>
      )}
    </main>
  );
}

