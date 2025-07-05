
'use client';

import { Zap, Bot, MessageSquareText, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WorkflowCanvas } from '@/components/workflow-canvas';
import type { WorkflowNode, WorkflowConnection, AvailableNodeType } from '@/types/workflow';
import type { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WorkflowEditorMenubar } from './workflow-editor-menubar';


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
  onToggleNodeLibrary: () => void;
  isNodeLibraryVisible: boolean;
  onSaveWorkflow: () => void;
  onSaveWorkflowAs: () => void;
  onOpenWorkflow: () => void;
  onNewWorkflow: () => void;
  onExportWorkflow: () => void;
  onImportWorkflow: () => void;
  workflowName: string;
  isConnecting: boolean;
  onStartConnection: (nodeId: string, handleId: string, handlePosition: { x: number, y: number }) => void;
  onCompleteConnection: (nodeId: string, handleId: string) => void;
  onUpdateConnectionPreview: (position: { x: number; y: number }) => void;
  connectionPreview: {
    startNodeId: string | null;
    startHandleId: string | null;
    previewPosition: { x: number; y: number } | null;
  } | null;
  onCanvasClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void; // Updated signature
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
  EmptyCanvasComponent: React.ReactNode;
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
  onToggleNodeLibrary,
  isNodeLibraryVisible,
  onSaveWorkflow,
  onSaveWorkflowAs,
  onOpenWorkflow,
  onNewWorkflow,
  onExportWorkflow,
  onImportWorkflow,
  workflowName,
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
  EmptyCanvasComponent,
}: AIWorkflowBuilderPanelProps) {
  const hasWorkflow = nodes.length > 0;
  const { isLoggedIn, isDiamondOrTrial } = useSubscription();

  return (
    <main className="flex-1 flex flex-col bg-background dot-grid-background relative overflow-hidden">
        <WorkflowEditorMenubar
          hasWorkflow={hasWorkflow}
          isLoggedIn={isLoggedIn}
          isProOrTrial={isDiamondOrTrial}
          workflowName={workflowName}
          onNewWorkflow={onNewWorkflow}
          onOpenWorkflow={onOpenWorkflow}
          onSaveWorkflow={onSaveWorkflow}
          onSaveWorkflowAs={onSaveWorkflowAs}
          onImportWorkflow={onImportWorkflow}
          onExportWorkflow={onExportWorkflow}
          onUndo={onUndo}
          canUndo={canUndo}
          onRedo={onRedo}
          canRedo={canRedo}
          onDeleteSelectedConnection={onDeleteSelectedConnection}
          selectedConnectionId={selectedConnectionId}
          onToggleNodeLibrary={onToggleNodeLibrary}
          onToggleAssistant={onToggleAssistant}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onResetView={onResetView}
          onExplainWorkflow={onExplainWorkflow}
          isExplainingWorkflow={isExplainingWorkflow}
          isNodeLibraryVisible={isNodeLibraryVisible}
          zoomLevel={zoomLevel}
          toast={toast}
        />
      
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
        EmptyCanvasComponent
      )}

      <div className="absolute bottom-8 right-8 flex flex-col gap-3 z-10">
         <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="rounded-full shadow-lg w-12 h-12 bg-primary hover:bg-primary/90"
                onClick={onToggleAssistant}
                title="Toggle AI Assistant Panel"
              >
                <Bot className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left"><p>Toggle AI Assistant Panel</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </main>
  );
}
