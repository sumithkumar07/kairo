
'use client';

import { Zap, Bot, Save, FolderOpen, ZoomIn, ZoomOut, Minus, Plus, MessageSquareText, Undo2, Redo2, Sparkles, Loader2, Trash2, UploadCloud, DownloadCloud, RefreshCw, ShieldQuestion, Link as LinkIcon, LogIn, UserPlus, SaveAll, List, User, History, FileIcon, FilePlus, PanelLeftOpen, PanelLeftClose, ChevronsUpDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { useToast } from '@/hooks/use-toast';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ThemeToggle } from '@/components/theme-toggle';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface WorkflowEditorMenubarProps {
  hasWorkflow: boolean;
  isLoggedIn: boolean;
  isProOrTrial: boolean;
  workflowName: string;
  selectedConnectionId: string | null;
  isNodeLibraryVisible: boolean;
  isExplainingWorkflow: boolean;
  canUndo: boolean;
  canRedo: boolean;
  zoomLevel: number;
  onNewWorkflow: () => void;
  onOpenWorkflow: () => void;
  onSaveWorkflow: () => void;
  onSaveWorkflowAs: () => void;
  onImportWorkflow: () => void;
  onExportWorkflow: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDeleteSelectedConnection: () => void;
  onToggleNodeLibrary: () => void;
  onToggleAssistant: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onExplainWorkflow: () => void;
  toast: ReturnType<typeof useToast>['toast'];
}

export function WorkflowEditorMenubar({
  hasWorkflow,
  isLoggedIn,
  isProOrTrial,
  workflowName,
  selectedConnectionId,
  isNodeLibraryVisible,
  isExplainingWorkflow,
  canUndo,
  canRedo,
  zoomLevel,
  onNewWorkflow,
  onOpenWorkflow,
  onSaveWorkflow,
  onSaveWorkflowAs,
  onImportWorkflow,
  onExportWorkflow,
  onUndo,
  onRedo,
  onDeleteSelectedConnection,
  onToggleNodeLibrary,
  onToggleAssistant,
  onZoomIn,
  onZoomOut,
  onResetView,
  onExplainWorkflow,
  toast,
}: WorkflowEditorMenubarProps) {

  const handleExplainWorkflowClick = () => {
    if (!isProOrTrial) {
      toast({
        title: 'Diamond Feature',
        description: `Workflow explanation is a Diamond feature. Please ${!isLoggedIn ? 'sign up or log in to start a trial' : 'upgrade your plan'}.`,
        variant: 'default',
        duration: 5000,
      });
      return;
    }
    onExplainWorkflow();
  };

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center p-2 bg-background/80 backdrop-blur-sm">
          <Menubar className="rounded-md border shadow-sm">
              <MenubarMenu>
                  <MenubarTrigger>File</MenubarTrigger>
                  <MenubarContent>
                      <MenubarItem onClick={onNewWorkflow}>New <MenubarShortcut>Ctrl+N</MenubarShortcut></MenubarItem>
                      <MenubarItem onClick={onOpenWorkflow}>Open... <MenubarShortcut>Ctrl+O</MenubarShortcut></MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem onClick={onSaveWorkflow} disabled={!hasWorkflow}>Save <MenubarShortcut>Ctrl+S</MenubarShortcut></MenubarItem>
                      <MenubarItem onClick={onSaveWorkflowAs} disabled={!hasWorkflow}>Save As... <MenubarShortcut>Ctrl+Shift+S</MenubarShortcut></MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem onClick={onImportWorkflow}>Import from File...</MenubarItem>
                      <MenubarItem onClick={onExportWorkflow} disabled={!hasWorkflow}>Export to File...</MenubarItem>
                  </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                  <MenubarTrigger>Edit</MenubarTrigger>
                  <MenubarContent>
                      <MenubarItem onClick={onUndo} disabled={!canUndo}>Undo <MenubarShortcut>Ctrl+Z</MenubarShortcut></MenubarItem>
                      <MenubarItem onClick={onRedo} disabled={!canRedo}>Redo <MenubarShortcut>Ctrl+Y</MenubarShortcut></MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem onClick={onDeleteSelectedConnection} disabled={!selectedConnectionId}>Delete Connection <MenubarShortcut>Del</MenubarShortcut></MenubarItem>
                  </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                  <MenubarTrigger>View</MenubarTrigger>
                  <MenubarContent>
                      <MenubarItem onClick={onToggleNodeLibrary}>Toggle Node Library</MenubarItem>
                      <MenubarItem onClick={onToggleAssistant}>Toggle AI Assistant</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem onClick={onZoomIn}>Zoom In <MenubarShortcut>Ctrl+=</MenubarShortcut></MenubarItem>
                      <MenubarItem onClick={onZoomOut}>Zoom Out <MenubarShortcut>Ctrl+-</MenubarShortcut></MenubarItem>
                      <MenubarItem onClick={onResetView}>Reset View</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem><ThemeToggle /></MenubarItem>
                  </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                  <MenubarTrigger>Actions</MenubarTrigger>
                  <MenubarContent>
                      <MenubarItem onClick={handleExplainWorkflowClick} disabled={!hasWorkflow || isExplainingWorkflow}>
                          {isExplainingWorkflow ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                          Explain Workflow
                      </MenubarItem>
                  </MenubarContent>
              </MenubarMenu>
          </Menubar>
          <div className="mx-auto text-sm text-muted-foreground font-medium truncate px-4" title={workflowName}>
              {workflowName}
          </div>
          <div className="flex items-center gap-2">
              <Button variant="ghost" className="md:hidden" size="icon" onClick={onToggleNodeLibrary}>
                  {isNodeLibraryVisible ? <PanelLeftClose /> : <PanelLeftOpen />}
              </Button>
          </div>
    </div>
    <div className="absolute top-14 right-4 z-10 flex items-center gap-2">
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
  </>
  );
}
