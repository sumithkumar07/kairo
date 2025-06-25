
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
        <div className="p-2 border-b bg-background/80 backdrop-blur-sm flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleNodeLibrary}>
                  {isNodeLibraryVisible ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{isNodeLibraryVisible ? 'Hide Node Library' : 'Show Node Library'}</p>
              </TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="h-5" />

            <Menubar className="border-none bg-transparent p-0 h-auto">
                <MenubarMenu>
                    <MenubarTrigger className="px-2.5 py-1.5 h-8">File</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={onNewWorkflow}>New <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
                        <MenubarItem onClick={onOpenWorkflow}>Open... <MenubarShortcut>⌘O</MenubarShortcut></MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem onClick={onSaveWorkflow}>Save <MenubarShortcut>⌘S</MenubarShortcut></MenubarItem>
                        <MenubarItem onClick={onSaveWorkflowAs}>Save As... <MenubarShortcut>⇧⌘S</MenubarShortcut></MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem onClick={onImportWorkflow}>Import from File...</MenubarItem>
                        <MenubarItem onClick={onExportWorkflow} disabled={!hasWorkflow}>Export to File...</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                 <MenubarMenu>
                    <MenubarTrigger className="px-2.5 py-1.5 h-8">Edit</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={onUndo} disabled={!canUndo}>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
                        <MenubarItem onClick={onRedo} disabled={!canRedo}>Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-1.5">
                <FileIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium max-w-[200px] truncate" title={workflowName}>{workflowName}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
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

            <Separator orientation="vertical" className="h-6 mx-1.5" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/run-history">
                        <History className="mr-1.5 h-4 w-4" />
                        Run History
                    </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>View execution history</p></TooltipContent>
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
            Drag nodes from the library on the left, or use the menu <code className="bg-muted px-1.5 py-1 rounded-sm text-xs font-semibold">File &gt; New</code> to start fresh.
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
