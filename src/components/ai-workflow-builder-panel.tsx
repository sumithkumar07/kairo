
'use client';

import { Zap, Bot, Save, FolderOpen, ZoomIn, ZoomOut, Minus, Plus, MessageSquareText, Undo2, Redo2, Sparkles, Loader2, Trash2, UploadCloud, DownloadCloud, RefreshCw, ShieldQuestion, Link as LinkIcon, LogIn, UserPlus, SaveAll, List, User } from 'lucide-react';
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
  onSaveWorkflowAs: () => void; 
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
  onSaveWorkflowAs, 
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
  const { currentTier, isProOrTrial, isLoggedIn } = useSubscription();

  const handleExplainWorkflowClick = () => {
    if (!isProOrTrial) {
      toast({
        title: 'Pro Feature',
        description: `Workflow explanation is available on the Pro plan. ${!isLoggedIn ? 'Sign up or log in to start a trial.' : 'Please upgrade to use this feature.'}`,
        variant: 'default', 
        duration: 5000,
      });
      return;
    }
    onExplainWorkflow();
  };
  
  const getSubscriptionButton = () => {
    let tooltipContent: string;
    let buttonContent = <Sparkles className="h-4 w-4 mr-1.5" />;
    let buttonText = "Subscription";
    let href: string | undefined = "/subscriptions";
    let variant: "ghost" | "default" = "ghost";
    let className = "text-amber-500 hover:bg-amber-500/10 hover:text-amber-600";

    if (isLoggedIn && isProOrTrial) {
      tooltipContent = `You are on the ${currentTier === 'Pro Trial' ? 'Pro trial' : 'Pro plan'}. All features unlocked!`;
      buttonText = currentTier === 'Pro Trial' ? 'Pro Trial Active' : 'Pro Plan Active';
      href = undefined; 
      className = "cursor-default text-primary hover:bg-primary/10";
    } else if (!isLoggedIn) {
      tooltipContent = "Sign up for a 15-day Pro trial to unlock all features.";
      buttonText = "Sign Up for Trial";
      href = "/signup";
      buttonContent = <UserPlus className="h-4 w-4 mr-1.5" />;
    } else { 
      tooltipContent = "Upgrade to Pro to unlock more AI features and capabilities.";
      buttonText = "Upgrade to Pro";
      href = "/subscriptions";
    }

    const buttonElement = (
      <Button asChild={!!href} variant={variant} size="sm" className={className}>
        {href ? (
          <Link href={href}>
            {buttonContent}
            {buttonText}
          </Link>
        ) : (
          <span> 
            {buttonContent}
            {buttonText}
          </span>
        )}
      </Button>
    );
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    );
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
      <TooltipProvider delayDuration={200}>
        <div className="p-3 border-b bg-background/80 backdrop-blur-sm flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Kairo Studio</h1>
            <p className="text-xs text-muted-foreground">
              Build, simulate, and deploy AI-driven automations. Current Tier: 
              <span className={cn("font-semibold ml-1", isProOrTrial ? "text-primary" : "text-amber-500")}>
                {currentTier}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onZoomOut} title="Zoom Out (Ctrl+Minus)">
                  <Minus />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Zoom Out (Ctrl + -)</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="h-10 px-3 py-2" onClick={onResetView} title="Reset View (Zoom & Pan)">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-xs">{(zoomLevel * 100).toFixed(0)}%</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Reset View</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onZoomIn} title="Zoom In (Ctrl+Plus)">
                  <Plus />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Zoom In (Ctrl + =)</p></TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-1.5" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
                  <Undo2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Undo (Ctrl + Z)</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
                  <Redo2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Redo (Ctrl + Y / Shift+Ctrl+Z)</p></TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-1.5" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onClearCanvas} disabled={!hasWorkflow} title="Clear Canvas (Delete all nodes and connections)">
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Clear
                </Button>
              </TooltipTrigger>
               <TooltipContent><p>Clear Canvas (Delete all nodes and connections)</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onImportWorkflow}>
                  <UploadCloud className="h-4 w-4 mr-1.5" />
                  Import
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Import Workflow from JSON</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onExportWorkflow} disabled={!hasWorkflow}>
                  <DownloadCloud className="h-4 w-4 mr-1.5" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Export Workflow to JSON</p></TooltipContent>
            </Tooltip>
             <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onSaveWorkflowAs} disabled={!hasWorkflow}>
                  <SaveAll className="h-4 w-4 mr-1.5" />
                  Save As...
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Save Workflow with a Name (Ctrl + Shift + S)</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onSaveWorkflow}>
                  <Save className="h-4 w-4 mr-1.5" />
                  Save Current
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Save Current Workflow Locally (Ctrl + S)</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onLoadWorkflow}>
                  <FolderOpen className="h-4 w-4 mr-1.5" />
                  Load Current
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Load Current Workflow from Local (Ctrl + O)</p></TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                 <Button variant="ghost" size="sm" asChild>
                    <Link href="/saved-workflows">
                        <List className="mr-1.5 h-4 w-4" />
                        My Workflows
                    </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>View all saved workflows</p></TooltipContent>
            </Tooltip>
            {isLoggedIn && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/profile">
                      <User className="mr-1.5 h-4 w-4" />
                      Profile
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>View your profile</p></TooltipContent>
              </Tooltip>
            )}


            <Separator orientation="vertical" className="h-6 mx-1.5" />
            
            {getSubscriptionButton()}
          </div>
        </div>
      </TooltipProvider>

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
