
'use client';

import { Zap, Bot, Save, FolderOpen, ZoomIn, ZoomOut, Minus, Plus, MessageSquareText, Undo2, Redo2, Sparkles, Loader2, Trash2, UploadCloud, DownloadCloud, RefreshCw, ShieldQuestion, Link as LinkIcon, LogIn, UserPlus, SaveAll, List, User, History, File as FileIcon, FilePlus, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { WorkflowCanvas } from '@/components/workflow-canvas';
import type { WorkflowNode, WorkflowConnection, AvailableNodeType } from '@/types/workflow';
import { Separator } from '@/components/ui/separator';
import type { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { ThemeToggle } from '@/components/theme-toggle';


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
  const { currentTier, isProOrTrial, isLoggedIn } = useSubscription();

  const handleExplainWorkflowClick = () => {
    if (!isProOrTrial) {
      toast({
        title: 'Pro Feature',
        description: `Workflow explanation is available on the Pro plan. ${!isLoggedIn ? 'Sign up or log in to start a trial.' : 'Upgrade to use this feature.'}`,
        variant: 'default',
        duration: 5000,
      });
      return;
    }
    onExplainWorkflow();
  };

  const getExplainWorkflowTooltipContent = () => {
    if (!hasWorkflow) return "Add nodes to the canvas to enable explanation.";
    if (!isProOrTrial) {
      return `Workflow explanation is a Pro feature. ${!isLoggedIn ? 'Sign up for a trial.' : 'Upgrade your plan.'}`;
    }
    return "Let AI explain this workflow (Ctrl+E).";
  };


  return (
    <main className="flex-1 flex flex-col bg-background dot-grid-background relative overflow-hidden">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onZoomOut} title="Zoom Out (Ctrl+Minus)">
                  <Minus className="h-4 w-4"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Zoom Out (Ctrl + -)</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="h-10 w-20 px-3 py-2" onClick={onResetView} title="Reset View (Zoom & Pan)">
                  <span className="text-xs">{(zoomLevel * 100).toFixed(0)}%</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Reset View</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onZoomIn} title="Zoom In (Ctrl+Plus)">
                  <Plus className="h-4 w-4"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Zoom In (Ctrl + =)</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full shadow-lg w-12 h-12 bg-card hover:bg-accent"
                  onClick={handleExplainWorkflowClick}
                  disabled={!hasWorkflow || isExplainingWorkflow || !isProOrTrial}
                  title={getExplainWorkflowTooltipContent()}
                >
                  {isExplainingWorkflow ? <Loader2 className="h-5 w-5 animate-spin"/> :
                   !isProOrTrial ? <ShieldQuestion className="h-5 w-5 text-muted-foreground" /> : <MessageSquareText className="h-5 w-5" />}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="text-xs">{getExplainWorkflowTooltipContent()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </main>
  );
}
