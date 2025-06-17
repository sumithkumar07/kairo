
'use client';

import { Zap, Bot, Save, FolderOpen, ZoomIn, ZoomOut, Minus, Plus, MessageSquareText, Undo2, Redo2, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowCanvas } from '@/components/workflow-canvas';
import type { WorkflowNode, WorkflowConnection, AvailableNodeType } from '@/types/workflow';
import { Separator } from '@/components/ui/separator';
import type { useToast } from '@/hooks/use-toast';

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
  onSaveWorkflow: () => void;
  onLoadWorkflow: () => void;
  onClearCanvas: () => void;
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
  onUndo: () => void; 
  canUndo: boolean; 
  onRedo: () => void; 
  canRedo: boolean; 
  toast: ReturnType<typeof useToast>['toast'];
  onDeleteSelectedConnection: () => void;
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
  onSaveWorkflow,
  onLoadWorkflow,
  onClearCanvas,
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
  onUndo,
  canUndo,
  onRedo,
  canRedo,
  toast,
  onDeleteSelectedConnection,
}: AIWorkflowBuilderPanelProps) {
  const hasWorkflow = nodes.length > 0;

  const handleUpgradeClick = () => {
    toast({
      title: 'Upgrade Your Plan',
      description: 'Unlock powerful AI features like advanced generation, in-depth explanations, and smart suggestions by upgrading your plan!',
      duration: 5000,
    });
  };

  return (
    <main className="flex-1 flex flex-col bg-background dot-grid-background relative overflow-hidden">
      <div className="p-3 border-b bg-background/80 backdrop-blur-sm flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-foreground">FlowAI Studio</h1>
          <p className="text-xs text-muted-foreground">Build, simulate, and deploy AI-driven automations.</p>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Zoom Controls */}
          <Button variant="outline" size="icon" onClick={onZoomOut} title="Zoom Out (Ctrl+Minus)">
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center select-none" title="Current Zoom Level">{(zoomLevel * 100).toFixed(0)}%</span>
          <Button variant="outline" size="icon" onClick={onZoomIn} title="Zoom In (Ctrl+Plus)">
            <Plus className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1.5" />
          
          {/* Undo/Redo */}
          <Button variant="outline" size="icon" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
            <Redo2 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1.5" />

          {/* File Operations */}
           <Button variant="outline" size="sm" onClick={onClearCanvas} title="Clear Canvas (Delete all nodes and connections)" disabled={!hasWorkflow}>
            <Trash2 className="h-4 w-4 mr-1.5" />
            Clear
          </Button>
          <Button variant="outline" size="sm" onClick={onLoadWorkflow} title="Load Workflow (Ctrl+O)">
            <FolderOpen className="h-4 w-4 mr-1.5" />
            Load
          </Button>
          <Button variant="outline" size="sm" onClick={onSaveWorkflow} title="Save Workflow (Ctrl+S)">
            <Save className="h-4 w-4 mr-1.5" />
            Save
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1.5" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpgradeClick}
            title="Upgrade to unlock more AI features"
            className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 hover:shadow-lg"
          >
            <Sparkles className="h-4 w-4 mr-1.5 text-primary" />
            Upgrade Plan
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
          onDeleteSelectedConnection={onDeleteSelectedConnection}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <div className="p-5 bg-primary/10 rounded-full mb-5 shadow-lg">
            <Zap className="h-16 w-16 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Start Building Your Workflow</h2>
          <p className="text-muted-foreground mb-6 max-w-md text-sm">
            Drag nodes from the library on the left, or click the AI Assistant button <Bot className="inline h-4 w-4 align-text-bottom"/> (bottom-right) to generate a workflow.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse"></span>
              AI-Powered
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-accent rounded-full"></span>
              Drag & Drop
            </span>
             <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-secondary rounded-full"></span>
              Save & Load
            </span>
          </div>
        </div>
      )}

      {/* Floating Action Buttons for AI */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-3 z-10">
         <Button
          variant="default"
          size="icon"
          className="rounded-full shadow-lg w-12 h-12 bg-primary hover:bg-primary/90"
          onClick={onToggleAssistant}
          title="Toggle AI Assistant Panel"
        >
          <Bot className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-lg w-12 h-12 bg-card hover:bg-accent"
          onClick={onExplainWorkflow}
          disabled={!hasWorkflow || isExplainingWorkflow}
          title="Let AI Explain this workflow"
        >
          {isExplainingWorkflow ? <Loader2 className="h-5 w-5 animate-spin"/> : <MessageSquareText className="h-5 w-5" />}
        </Button>
      </div>
    </main>
  );
}
