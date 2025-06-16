
'use client';

import { Zap, Bot, Radio, Save, FolderOpen, ZoomIn, ZoomOut, Minus, Plus, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowCanvas } from '@/components/workflow-canvas';
import type { WorkflowNode, WorkflowConnection, AvailableNodeType } from '@/types/workflow';
import { Separator } from '@/components/ui/separator'; // Import Separator

interface AIWorkflowBuilderPanelProps {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null; 
  onNodeClick: (nodeId: string) => void;
  onConnectionClick: (connectionId: string) => void; 
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
  onCanvasPanStart: (event: React.MouseEvent) => void; 
  canvasOffset: { x: number; y: number }; 
  isPanningForCursor: boolean; 
  connectionStartNodeId: string | null; 
  connectionStartHandleId: string | null; 
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExplainWorkflow: () => void;
  isExplainingWorkflow: boolean;
}

export function AIWorkflowBuilderPanel({
  nodes,
  connections,
  selectedNodeId,
  selectedConnectionId,
  onNodeClick,
  onConnectionClick,
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
  onCanvasPanStart,
  canvasOffset,
  isPanningForCursor,
  connectionStartNodeId,
  connectionStartHandleId,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onExplainWorkflow,
  isExplainingWorkflow,
}: AIWorkflowBuilderPanelProps) {
  const hasWorkflow = nodes.length > 0;

  return (
    <main className="flex-1 flex flex-col bg-background dot-grid-background relative overflow-hidden">
      <div className="p-4 border-b bg-background/80 backdrop-blur-sm flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-xl font-bold text-foreground">FlowAI Builder</h1>
          <p className="text-sm text-muted-foreground">Automate with AI-driven workflows</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <Button variant="outline" size="icon" onClick={onZoomOut} title="Zoom Out">
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">{(zoomLevel * 100).toFixed(0)}%</span>
          <Button variant="outline" size="icon" onClick={onZoomIn} title="Zoom In">
            <Plus className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* File Operations */}
          <Button variant="outline" size="sm" onClick={onLoadWorkflow} title="Load Workflow (Ctrl+O)">
            <FolderOpen className="h-4 w-4 mr-2" />
            Load
          </Button>
          <Button variant="outline" size="sm" onClick={onSaveWorkflow} title="Save Workflow (Ctrl+S)">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1" />
          
          {/* AI & Assistant Controls */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExplainWorkflow} 
            disabled={!hasWorkflow || isExplainingWorkflow}
            title="Let AI Explain this workflow"
          >
            <MessageSquareText className="h-4 w-4 mr-2" />
            Explain
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-accent-foreground bg-accent hover:bg-accent/90 border-accent"
            title="Indicates if workflow is ready for AI execution (simulated or live)"
          >
            <Radio className="h-4 w-4 mr-2" />
            AI Ready
          </Button>
          <Button
            variant={isAssistantVisible ? "default" : "outline"}
            size="sm"
            onClick={onToggleAssistant}
            aria-pressed={isAssistantVisible}
            title={isAssistantVisible ? "Hide AI Assistant Panel" : "Show AI Assistant Panel"}
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
          selectedConnectionId={selectedConnectionId} 
          onNodeClick={onNodeClick}
          onConnectionClick={onConnectionClick} 
          onNodeDragStop={onNodeDragStop}
          onCanvasDrop={onCanvasDrop}
          isConnecting={isConnecting}
          onStartConnection={onStartConnection}
          onCompleteConnection={onCompleteConnection}
          onUpdateConnectionPreview={onUpdateConnectionPreview}
          connectionPreview={connectionPreview}
          onCanvasClick={onCanvasClick}
          onCanvasPanStart={onCanvasPanStart}
          canvasOffset={canvasOffset}
          isPanningForCursor={isPanningForCursor}
          connectionStartNodeId={connectionStartNodeId}
          connectionStartHandleId={connectionStartHandleId}
          zoomLevel={zoomLevel}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="p-6 bg-primary/10 rounded-full mb-6 shadow-lg">
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
              <span className="h-2 w-2 bg-accent rounded-full"></span>
              Drag & Drop
            </span>
             <span className="flex items-center gap-1">
              <span className="h-2 w-2 bg-secondary rounded-full"></span>
              Save & Load
            </span>
          </div>
        </div>
      )}
    </main>
  );
}

