
'use client';

import { Zap, Bot, MessageSquareText, Sparkles, Loader2, Minus, Plus, Undo2, Redo2, File as FileIcon, FolderOpen, Save, FilePlus, UploadCloud, DownloadCloud, PanelLeftClose, PanelLeftOpen, SaveAll, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkflowCanvas } from '@/components/workflow-canvas';
import type { WorkflowNode, WorkflowConnection, AvailableNodeType } from '@/types/workflow';
import type { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from "@/components/ui/menubar";


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
  onGoToHub: () => void;
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
  handleGetWorkflowExplanation: () => void;
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
  onGoToHub,
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
  handleGetWorkflowExplanation,
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
    <main id="workflow-canvas-panel" className="flex-1 flex flex-col bg-background dot-grid-background relative overflow-hidden">
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-2">
            <Menubar id="menubar-file-button" className="rounded-md border shadow-sm bg-background/80 backdrop-blur-sm">
                <MenubarMenu>
                    <MenubarTrigger>File</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={onNewWorkflow}><FilePlus className="mr-2 h-4 w-4" />New <MenubarShortcut>Ctrl+N</MenubarShortcut></MenubarItem>
                        <MenubarItem onClick={onGoToHub}><FolderOpen className="mr-2 h-4 w-4" />Open Hub... <MenubarShortcut>Ctrl+O</MenubarShortcut></MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem onClick={onSaveWorkflow} disabled={!hasWorkflow}><Save className="mr-2 h-4 w-4" />Save <MenubarShortcut>Ctrl+S</MenubarShortcut></MenubarItem>
                        <MenubarItem onClick={onGoToHub} disabled={!hasWorkflow}><SaveAll className="mr-2 h-4 w-4" />Save As... <MenubarShortcut>Ctrl+Shift+S</MenubarShortcut></MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem onClick={onImportWorkflow}><UploadCloud className="mr-2 h-4 w-4" />Import from File...</MenubarItem>
                        <MenubarItem onClick={onExportWorkflow} disabled={!hasWorkflow}><DownloadCloud className="mr-2 h-4 w-4" />Export to File...</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Edit</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={onUndo} disabled={!canUndo}><Undo2 className="mr-2 h-4 w-4" />Undo <MenubarShortcut>Ctrl+Z</MenubarShortcut></MenubarItem>
                        <MenubarItem onClick={onRedo} disabled={!canRedo}><Redo2 className="mr-2 h-4 w-4" />Redo <MenubarShortcut>Ctrl+Y</MenubarShortcut></MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem onClick={onDeleteSelectedConnection} disabled={!selectedConnectionId}><Trash2 className="mr-2 h-4 w-4" />Delete Connection <MenubarShortcut>Del</MenubarShortcut></MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>View</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={onToggleNodeLibrary}>{isNodeLibraryVisible ? <PanelLeftClose className="mr-2 h-4 w-4" /> : <PanelLeftOpen className="mr-2 h-4 w-4" />}Toggle Node Library</MenubarItem>
                        <MenubarItem onClick={onToggleAssistant}><Bot className="mr-2 h-4 w-4" />Toggle AI Assistant</MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem onClick={onZoomIn}><Plus className="mr-2 h-4 w-4" />Zoom In <MenubarShortcut>Ctrl+=</MenubarShortcut></MenubarItem>
                        <MenubarItem onClick={onZoomOut}><Minus className="mr-2 h-4 w-4" />Zoom Out <MenubarShortcut>Ctrl+-</MenubarShortcut></MenubarItem>
                        <MenubarItem onClick={onResetView}>Reset View</MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Actions</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem onClick={handleGetWorkflowExplanation} disabled={!hasWorkflow || isExplainingWorkflow}>
                            {isExplainingWorkflow ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                            Explain Workflow
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <div className="mx-auto text-sm text-muted-foreground font-medium truncate px-4 bg-background/80 backdrop-blur-sm rounded-md border py-1.5 shadow-sm" title={workflowName}>
              {workflowName}
            </div>
             <Button variant="ghost" className="md:hidden" size="icon" onClick={onToggleNodeLibrary}>
                  {isNodeLibraryVisible ? <PanelLeftClose /> : <PanelLeftOpen />}
              </Button>
        </header>

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

        <div className="absolute bottom-4 right-4 flex flex-col items-center gap-2 z-10">
            <div className="flex flex-col gap-1 rounded-lg bg-background/80 p-1 border shadow-sm backdrop-blur-sm">
                <TooltipProvider delayDuration={100}>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onZoomIn} title="Zoom In (Ctrl+Plus)" className="w-8 h-8">
                        <Plus className="h-4 w-4"/>
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left"><p>Zoom In (Ctrl + =)</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 px-1.5 text-xs font-semibold" onClick={onResetView} title="Reset View">
                        {(zoomLevel * 100).toFixed(0)}%
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left"><p>Reset View</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={onZoomOut} title="Zoom Out (Ctrl+Minus)" className="w-8 h-8">
                        <Minus className="h-4 w-4"/>
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left"><p>Zoom Out (Ctrl + -)</p></TooltipContent>
                </Tooltip>
                </TooltipProvider>
            </div>
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
