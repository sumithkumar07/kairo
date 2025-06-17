
'use client';

import { Zap, Bot, Save, FolderOpen, ZoomIn, ZoomOut, Minus, Plus, MessageSquareText, Undo2, Redo2, Sparkles, Loader2, Trash2, UploadCloud, DownloadCloud, RefreshCw, ShieldQuestion, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WorkflowCanvas } from '@/components/workflow-canvas';
import type { WorkflowNode, WorkflowConnection, AvailableNodeType } from '@/types/workflow';
import { Separator } from '@/components/ui/separator';
import type { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

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
  onExportWorkflow: () => void;
  onImportWorkflow: () => void;
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
  onResetView: () => void; 
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
  onExportWorkflow,
  onImportWorkflow,
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
  onResetView,
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
  const { currentTier, features, isProTier } = useSubscription();

  const handleExplainWorkflowClick = () => {
    if (!features.canExplainWorkflow) {
      toast({
        title: 'Pro Feature',
        description: 'Workflow explanation is available on the Pro plan. Please upgrade to use this feature.',
        variant: 'default', 
        duration: 5000,
      });
      return;
    }
    onExplainWorkflow();
  };
  

  return (
    <main className="flex-1 flex flex-col bg-background dot-grid-background relative overflow-hidden">
      <div className="p-3 border-b bg-background/80 backdrop-blur-sm flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-foreground">FlowAI Studio</h1>
          <p className="text-xs text-muted-foreground">Build, simulate, and deploy AI-driven automations. Current Tier: <span className={cn("font-semibold", isProTier ? "text-primary" : "text-amber-500")}>{currentTier}</span></p>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Zoom Controls */}
          <Button variant="outline" size="icon" onClick={onZoomOut} title="Zoom Out (Ctrl+Minus)">
            <Minus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="w-12 text-xs" onClick={onResetView} title="Reset View (Zoom & Pan)">
            <RefreshCw className="h-3.5 w-3.5 mr-0.5" />
            {(zoomLevel * 100).toFixed(0)}%
          </Button>
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
          <Button variant="outline" size="sm" onClick={onImportWorkflow} title="Import Workflow from JSON">
            <UploadCloud className="h-4 w-4 mr-1.5" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={onExportWorkflow} title="Export Workflow to JSON" disabled={!hasWorkflow}>
            <DownloadCloud className="h-4 w-4 mr-1.5" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onSaveWorkflow} title="Save Workflow Locally (Ctrl+S)">
            <Save className="h-4 w-4 mr-1.5" />
            Save
          </Button>
           <Button variant="outline" size="sm" onClick={onLoadWorkflow} title="Load Workflow from Local (Ctrl+O)">
            <FolderOpen className="h-4 w-4 mr-1.5" />
            Load
          </Button>

          <Separator orientation="vertical" className="h-6 mx-1.5" />
          
          {isProTier ? (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="cursor-default text-primary hover:bg-primary/10">
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Pro Plan Active
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">You are on the Pro plan with all features unlocked!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Link href="/subscriptions">
              <Button variant="ghost" size="sm" title="Upgrade to unlock more AI features" className="text-amber-500 hover:bg-amber-500/10 hover:text-amber-600">
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Unlock AI Features
              </Button>
            </Link>
          )}
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
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div> {/* Wrapper div for TooltipTrigger when button is disabled */}
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full shadow-lg w-12 h-12 bg-card hover:bg-accent"
                  onClick={handleExplainWorkflowClick}
                  disabled={!hasWorkflow || isExplainingWorkflow || !features.canExplainWorkflow}
                  title={!features.canExplainWorkflow ? "Upgrade to Pro for AI Explanations" : "Let AI Explain this workflow"}
                >
                  {isExplainingWorkflow ? <Loader2 className="h-5 w-5 animate-spin"/> : 
                   !features.canExplainWorkflow ? <ShieldQuestion className="h-5 w-5 text-muted-foreground" /> : <MessageSquareText className="h-5 w-5" />}
                </Button>
              </div>
            </TooltipTrigger>
            {!features.canExplainWorkflow && (
              <TooltipContent side="left">
                <p className="text-xs">Workflow explanation is a Pro feature. <Link href="/subscriptions" className="text-primary underline">Upgrade Plan</Link></p>
              </TooltipContent>
            )}
             {features.canExplainWorkflow && hasWorkflow && (
              <TooltipContent side="left">
                <p className="text-xs">Let AI Explain this workflow</p>
              </TooltipContent>
            )}
            {features.canExplainWorkflow && !hasWorkflow && (
              <TooltipContent side="left">
                <p className="text-xs">Add nodes to the canvas to enable explanation.</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </main>
  );
}

