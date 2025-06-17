
'use client';

import { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import type { WorkflowNode, WorkflowConnection, Workflow, AvailableNodeType, LogEntry, ServerLogOutput, WorkflowExecutionResult } from '@/types/workflow';
import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';
import type { SuggestNextNodeOutput } from '@/ai/flows/suggest-next-node';
import { executeWorkflow, suggestNextWorkflowNode, getWorkflowExplanation, enhanceAndGenerateWorkflow } from '@/app/actions';
import { isConfigComplete, isNodeDisconnected, hasUnconnectedInputs } from '@/lib/workflow-utils';


import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Undo2, Redo2, X, Bot, MessageSquareText } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { NodeLibrary } from '@/components/node-library';
import { AIWorkflowBuilderPanel } from '@/components/ai-workflow-builder-panel';
import { AIWorkflowAssistantPanel } from '@/components/ai-workflow-assistant-panel';
import { NodeConfigPanel } from '@/components/node-config-panel';
import { ExecutionLogPanel } from '@/components/execution-log-panel';

import { AVAILABLE_NODES_CONFIG, AI_NODE_TYPE_MAPPING, NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';
import { produce } from 'immer';
import { MousePointer2 } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'flowAIWorkflow';
const ASSISTANT_PANEL_VISIBLE_KEY = 'flowAIAssistantPanelVisible';
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const MAX_HISTORY_STEPS = 30;

interface HistoryEntry {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  canvasOffset: { x: number; y: number };
  zoomLevel: number;
}

export default function WorkflowPage() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isAssistantVisible, setIsAssistantVisible] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<LogEntry[]>([]);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);

  const { toast } = useToast();
  const nextNodeIdRef = useRef(1);

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStartNodeId, setConnectionStartNodeId] = useState<string | null>(null);
  const [connectionStartHandleId, setConnectionStartHandleId] = useState<string | null>(null);
  const [connectionPreviewPosition, setConnectionPreviewPosition] = useState<{ x: number; y: number } | null>(null);

  const [suggestedNextNodeInfo, setSuggestedNextNodeInfo] = useState<{ suggestion: SuggestNextNodeOutput; forNodeId: string } | null>(null);
  const [initialCanvasSuggestion, setInitialCanvasSuggestion] = useState<SuggestNextNodeOutput | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false); // General suggestion loading (for selected node)
  const [isLoadingInitialSuggestion, setIsLoadingInitialSuggestion] = useState(false); // Specific for initial canvas suggestion
  const [initialSuggestionAttempted, setInitialSuggestionAttempted] = useState(false);


  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  const [isExplainingWorkflow, setIsExplainingWorkflow] = useState(false);
  const [workflowExplanation, setWorkflowExplanation] = useState<string | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState(true);

  const [showDeleteNodeConfirmDialog, setShowDeleteNodeConfirmDialog] = useState(false);
  const [nodeToDeleteId, setNodeToDeleteId] = useState<string | null>(null);
  const [showClearCanvasConfirmDialog, setShowClearCanvasConfirmDialog] = useState(false);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1); 


  const selectedNode = useMemo(() => {
    return nodes.find(node => node.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const saveHistory = useCallback(() => {
    setHistory(prevHistory => {
      const newHistoryRaw = prevHistory.slice(0, historyIndex + 1);
      const currentEntry: HistoryEntry = {
        nodes: nodes, 
        connections: connections,
        selectedNodeId: selectedNodeId,
        selectedConnectionId: selectedConnectionId,
        canvasOffset: canvasOffset,
        zoomLevel: zoomLevel,
      };
      
      if (newHistoryRaw.length > 0 && JSON.stringify(newHistoryRaw[newHistoryRaw.length -1]) === JSON.stringify(currentEntry) ) {
        return prevHistory;
      }

      const newHistoryWithCurrent = [...newHistoryRaw, currentEntry];
      const limitedHistory = newHistoryWithCurrent.slice(-MAX_HISTORY_STEPS);
      
      setHistoryIndex(limitedHistory.length - 1);
      return limitedHistory;
    });
  }, [historyIndex, nodes, connections, selectedNodeId, selectedConnectionId, canvasOffset, zoomLevel]);

  const resetHistoryForNewWorkflow = useCallback((initialNodes: WorkflowNode[], initialConnections: WorkflowConnection[]) => {
    const initialEntry: HistoryEntry = {
      nodes: initialNodes,
      connections: initialConnections,
      selectedNodeId: null,
      selectedConnectionId: null,
      canvasOffset: { x: 0, y: 0 },
      zoomLevel: 1,
    };
    setHistory([initialEntry]);
    setHistoryIndex(0);
  }, []); 
  
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const prevState = history[newIndex];
      setNodes(prevState.nodes);
      setConnections(prevState.connections);
      setSelectedNodeId(prevState.selectedNodeId);
      setSelectedConnectionId(prevState.selectedConnectionId);
      setCanvasOffset(prevState.canvasOffset);
      setZoomLevel(prevState.zoomLevel);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1 && historyIndex !== -1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      setNodes(nextState.nodes);
      setConnections(nextState.connections);
      setSelectedNodeId(nextState.selectedNodeId);
      setSelectedConnectionId(nextState.selectedConnectionId);
      setCanvasOffset(nextState.canvasOffset);
      setZoomLevel(nextState.zoomLevel);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const handleCancelConnection = useCallback(() => {
    setIsConnecting(false);
    setConnectionStartNodeId(null);
    setConnectionStartHandleId(null);
    setConnectionPreviewPosition(null);
  }, []);

  // Effect for automatic saving to local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastHistoryState = history[historyIndex];
      const currentLiveStateRelevantForStorage = {
        nodes,
        connections,
        canvasOffset,
        zoomLevel,
      };

      let changed = false;
      if (!lastHistoryState) {
        if (nodes.length > 0 || connections.length > 0) changed = true; // If history is empty but canvas is not
      } else {
        if (JSON.stringify(lastHistoryState.nodes) !== JSON.stringify(nodes) ||
            JSON.stringify(lastHistoryState.connections) !== JSON.stringify(connections) ||
            JSON.stringify(lastHistoryState.canvasOffset) !== JSON.stringify(canvasOffset) ||
            lastHistoryState.zoomLevel !== zoomLevel) {
          changed = true;
        }
      }
      // Also consider isSimulationMode change for saving
      const savedWorkflowJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedWorkflowJson) {
        try {
          const savedWorkflow = JSON.parse(savedWorkflowJson);
          if (savedWorkflow.isSimulationMode !== isSimulationMode) {
            changed = true;
          }
          if (savedWorkflow.nextNodeId !== nextNodeIdRef.current){
            changed = true;
          }
        } catch (e) { /* ignore parsing error for this check */ }
      } else if (isSimulationMode !== true) { // if no saved workflow, and sim mode is not default true
         changed = true;
      }


      if (changed) { 
        const workflowToSave = {
            nodes,
            connections,
            nextNodeId: nextNodeIdRef.current,
            canvasOffset,
            zoomLevel,
            isSimulationMode
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workflowToSave));
      }
    }
  }, [nodes, connections, canvasOffset, zoomLevel, isSimulationMode, history, historyIndex]);


  const handleLoadWorkflow = useCallback((showToast = true) => {
    if (typeof window !== 'undefined') {
      const savedWorkflowJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedWorkflowJson) {
        try {
          const savedWorkflow = JSON.parse(savedWorkflowJson);
          if (!Array.isArray(savedWorkflow.nodes) || !Array.isArray(savedWorkflow.connections)) {
             throw new Error("Invalid workflow structure in local storage.");
          }
          const loadedNodes = (savedWorkflow.nodes || []).map((n: WorkflowNode) => ({ ...n, lastExecutionStatus: 'pending' as WorkflowNode['lastExecutionStatus'] }));
          const loadedConnections = savedWorkflow.connections || [];

          setNodes(loadedNodes);
          setConnections(loadedConnections);
          nextNodeIdRef.current = savedWorkflow.nextNodeId || Math.max(0, ...loadedNodes.map((n: WorkflowNode) => parseInt(n.id.split('_').pop() || '0', 10))) + 1 || 1;
          setCanvasOffset(savedWorkflow.canvasOffset || { x: 0, y: 0 });
          setZoomLevel(savedWorkflow.zoomLevel || 1);
          setIsSimulationMode(savedWorkflow.isSimulationMode === undefined ? true : savedWorkflow.isSimulationMode);

          setSelectedNodeId(null);
          setSelectedConnectionId(null);
          setExecutionLogs([]);
          setWorkflowExplanation(null);
          setInitialCanvasSuggestion(null);
          setSuggestedNextNodeInfo(null);
          setInitialSuggestionAttempted(false); 
          resetHistoryForNewWorkflow(loadedNodes, loadedConnections);
          if (showToast) {
            toast({ title: 'Workflow Loaded', description: 'Your saved workflow has been loaded.' });
          }
        } catch (error: any) {
           console.error("Error loading workflow from local storage:", error);
           if (showToast) {
            toast({ title: 'Load Error', description: `Failed to load workflow: ${error.message}`, variant: 'destructive'});
           }
           localStorage.removeItem(LOCAL_STORAGE_KEY);
           setNodes([]); setConnections([]); setCanvasOffset({x:0,y:0}); setZoomLevel(1);
           setInitialSuggestionAttempted(false);
           resetHistoryForNewWorkflow([], []);
        }
      } else {
        if (showToast) {
          toast({ title: 'No Saved Workflow', description: 'No workflow found in local storage.', variant: 'default' });
        }
        setNodes([]); setConnections([]); setCanvasOffset({x:0,y:0}); setZoomLevel(1);
        setInitialSuggestionAttempted(false);
        resetHistoryForNewWorkflow([], []);
      }
    }
  }, [toast, resetHistoryForNewWorkflow]);

  const handleManualSaveWorkflow = useCallback(() => {
    if (typeof window !== 'undefined') {
      const workflowToSave = { nodes, connections, nextNodeId: nextNodeIdRef.current, canvasOffset, zoomLevel, isSimulationMode };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workflowToSave));
      toast({ title: 'Workflow Saved', description: 'Your current workflow has been saved locally.' });
      saveHistory(); 
    }
  }, [nodes, connections, toast, canvasOffset, zoomLevel, isSimulationMode, saveHistory]);

  const handleRunWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      toast({
        title: 'Empty Workflow',
        description: 'Add some nodes to the canvas before running.',
        variant: 'destructive',
      });
      return;
    }

    const validationErrors: string[] = [];
    nodes.forEach(node => {
      const nodeTypeConfig = AVAILABLE_NODES_CONFIG.find(nt => nt.type === node.type);
      if (!isConfigComplete(node, nodeTypeConfig)) {
        validationErrors.push(`Node "${node.name || node.id}" (Type: ${node.type}) has incomplete configuration.`);
      }
      if (nodeTypeConfig?.category !== 'trigger' && isNodeDisconnected(node, connections, nodeTypeConfig)) {
        validationErrors.push(`Node "${node.name || node.id}" (Type: ${node.type}) is disconnected or missing inputs.`);
      }
      if (nodeTypeConfig?.category !== 'trigger' && hasUnconnectedInputs(node, connections, nodeTypeConfig)) {
        validationErrors.push(`Node "${node.name || node.id}" (Type: ${node.type}) has unconnected input handles.`);
      }
    });

    if (validationErrors.length > 0) {
      const errorSummary = validationErrors.slice(0, 3).join('\n');
      const fullErrorMessage = validationErrors.length > 3
        ? `${errorSummary}\n...and ${validationErrors.length - 3} more issues.`
        : errorSummary;
      toast({
        title: 'Workflow Validation Failed',
        description: `Please fix the following issues before running:\n${fullErrorMessage}`,
        variant: 'destructive',
        duration: 7000,
      });
      setIsWorkflowRunning(false);
      return;
    }

    setIsWorkflowRunning(true);
    setNodes(prevNodes => prevNodes.map(n => ({ ...n, lastExecutionStatus: 'pending' as WorkflowNode['lastExecutionStatus'] })));
    const runModeMessage = isSimulationMode ? 'Simulation Mode' : 'Live Mode';
    setExecutionLogs(prevLogs => [{ timestamp: new Date().toLocaleTimeString(), message: `Workflow execution started in ${runModeMessage}...`, type: 'info' }]);

    try {
      const { serverLogs: newServerLogs, finalWorkflowData }: WorkflowExecutionResult = await executeWorkflow({ nodes, connections }, isSimulationMode, {});
      const newLogs: LogEntry[] = newServerLogs.map(log => ({
        ...log,
        timestamp: new Date(log.timestamp).toLocaleTimeString(),
      }));
      setExecutionLogs(prevLogs => [...prevLogs, ...newLogs]);

      setNodes(prevNodes =>
        prevNodes.map(existingNode => {
          const executedNodeData = finalWorkflowData[existingNode.id];
          if (executedNodeData && executedNodeData.lastExecutionStatus) {
            return { ...existingNode, lastExecutionStatus: executedNodeData.lastExecutionStatus };
          }
          return { ...existingNode, lastExecutionStatus: 'skipped' as WorkflowNode['lastExecutionStatus'] };
        })
      );
      saveHistory();

      toast({
        title: 'Workflow Execution Attempted',
        description: 'Check logs for details.',
      });
    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred during workflow execution.';
      setExecutionLogs(prevLogs => [
        ...prevLogs,
        { timestamp: new Date().toLocaleTimeString(), message: `Execution Error: ${errorMessage}`, type: 'error' },
      ]);
      setNodes(prevNodes => prevNodes.map(n => ({ ...n, lastExecutionStatus: 'error' as WorkflowNode['lastExecutionStatus'] })));
      saveHistory();
      toast({ title: 'Workflow Execution Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsWorkflowRunning(false);
    }
  }, [nodes, connections, toast, isSimulationMode, saveHistory]);

  const handleDeleteNode = useCallback((nodeIdToDelete: string) => {
    setNodeToDeleteId(nodeIdToDelete);
    setShowDeleteNodeConfirmDialog(true);
  }, []);

  const confirmDeleteNode = useCallback(() => {
    if (!nodeToDeleteId) return;

    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeToDeleteId));
    setConnections(prevConnections => prevConnections.filter(conn => conn.sourceNodeId !== nodeToDeleteId && conn.targetNodeId !== nodeToDeleteId));

    if (selectedNodeId === nodeToDeleteId) {
      setSelectedNodeId(null);
    }
    saveHistory();
    toast({ title: 'Node Deleted', description: `Node ${nodeToDeleteId} and its connections removed.` });
    setNodeToDeleteId(null);
    setShowDeleteNodeConfirmDialog(false);
  }, [nodeToDeleteId, selectedNodeId, toast, saveHistory]);

  const cancelDeleteNode = useCallback(() => {
    setNodeToDeleteId(null);
    setShowDeleteNodeConfirmDialog(false);
  }, []);

  const handleDeleteSelectedConnection = useCallback(() => {
    if (selectedConnectionId) {
      setConnections(prevConnections => prevConnections.filter(conn => conn.id !== selectedConnectionId));
      setSelectedConnectionId(null);
      saveHistory();
      toast({ title: "Connection Deleted", description: "The selected connection has been removed." });
    }
  }, [selectedConnectionId, toast, saveHistory]);


  const handleCompleteConnection = useCallback((endNodeId: string, endHandleId: string) => {
    if (isConnecting && connectionStartNodeId && connectionStartHandleId && connectionStartNodeId !== endNodeId) {
      const sourceNode = nodes.find(n => n.id === connectionStartNodeId);
      const targetNode = nodes.find(n => n.id === endNodeId);
      if (!sourceNode || !targetNode) {
        handleCancelConnection();
        return;
      }

      const sourceNodeConfig = AVAILABLE_NODES_CONFIG.find(n => n.type === sourceNode.type);
      const targetNodeConfig = AVAILABLE_NODES_CONFIG.find(n => n.type === targetNode.type);

      const sourceHandleIsOutput = sourceNodeConfig?.outputHandles?.includes(connectionStartHandleId);
      const targetHandleIsInput = targetNodeConfig?.inputHandles?.includes(endHandleId);

      if (!sourceHandleIsOutput || !targetHandleIsInput) {
         let invalidReason = "Cannot connect an input to an input, or an output to an output.";
         if (sourceHandleIsOutput && !targetHandleIsInput) {
            invalidReason = `Target handle "${endHandleId}" on node "${targetNode.name}" is not a valid input handle. Output handles can only connect to input handles.`;
         } else if (!sourceHandleIsOutput && targetHandleIsInput) {
            invalidReason = `Source handle "${connectionStartHandleId}" on node "${sourceNode.name}" is not a valid output handle. Input handles can only connect from output handles.`;
         }
         toast({
            title: 'Invalid Connection',
            description: invalidReason,
            variant: 'destructive'
         });
         handleCancelConnection();
         return;
      }

      const newConnection: WorkflowConnection = {
        id: crypto.randomUUID(),
        sourceNodeId: connectionStartNodeId,
        sourceHandle: connectionStartHandleId,
        targetNodeId: endNodeId,
        targetHandle: endHandleId,
      };
      setConnections(prevConnections => produce(prevConnections, draft => {
        const exists = draft.find(c =>
            c.sourceNodeId === newConnection.sourceNodeId && c.sourceHandle === newConnection.sourceHandle &&
            c.targetNodeId === newConnection.targetNodeId && c.targetHandle === newConnection.targetHandle
        );
        if (!exists) {
            draft.push(newConnection);
            toast({ title: 'Connection Created', description: `Connected ${sourceNode.name} to ${targetNode.name}.` });
        } else {
            toast({ title: 'Connection Exists', description: 'This connection already exists.', variant: 'default'});
        }
      }));
      saveHistory();
    }
    handleCancelConnection();
  }, [isConnecting, connectionStartNodeId, connectionStartHandleId, nodes, toast, saveHistory, handleCancelConnection]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.min(MAX_ZOOM, prev + ZOOM_STEP);
      if (newZoom !== prev) saveHistory(); 
      return newZoom;
    });
  }, [saveHistory]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.max(MIN_ZOOM, prev - ZOOM_STEP);
      if (newZoom !== prev) saveHistory(); 
      return newZoom;
    });
  }, [saveHistory]);


  // Effect for initial load from local storage
  useEffect(() => {
    handleLoadWorkflow(false); 
    const savedAssistantVisibility = localStorage.getItem(ASSISTANT_PANEL_VISIBLE_KEY);
    if (savedAssistantVisibility !== null) {
      setIsAssistantVisible(JSON.parse(savedAssistantVisibility));
    } else {
      setIsAssistantVisible(false); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  // Effect for keyboard shortcuts
  useEffect(() => {
    const isInputField = (target: EventTarget | null): boolean => {
      return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && target.isContentEditable);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInputField(document.activeElement) || showDeleteNodeConfirmDialog || showClearCanvasConfirmDialog) return;

      const isCtrlOrMeta = event.ctrlKey || event.metaKey;

      if (isCtrlOrMeta && event.key.toLowerCase() === 's') { event.preventDefault(); handleManualSaveWorkflow(); return; }
      if (isCtrlOrMeta && event.key.toLowerCase() === 'o') { event.preventDefault(); handleLoadWorkflow(true); return; }
      if (isCtrlOrMeta && event.key.toLowerCase() === 'enter') { event.preventDefault(); handleRunWorkflow(); return; }
      if (isCtrlOrMeta && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }
      if (isCtrlOrMeta && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        handleRedo();
        return;
      }
      if (isCtrlOrMeta && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        handleZoomIn();
        return;
      }
      if (isCtrlOrMeta && event.key === '-') {
        event.preventDefault();
        handleZoomOut();
        return;
      }


      if (event.key === 'Escape') {
        if (isConnecting) handleCancelConnection();
        if (selectedNodeId) setSelectedNodeId(null);
        if (selectedConnectionId) setSelectedConnectionId(null);
        if (workflowExplanation) setWorkflowExplanation(null);
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNodeId && !isInputField(document.activeElement)) handleDeleteNode(selectedNodeId);
        else if (selectedConnectionId && !isInputField(document.activeElement)) handleDeleteSelectedConnection();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isConnecting, selectedNodeId, selectedConnectionId, workflowExplanation,
    handleManualSaveWorkflow, handleLoadWorkflow, handleRunWorkflow,
    handleDeleteNode, handleDeleteSelectedConnection, handleUndo, handleRedo,
    showDeleteNodeConfirmDialog, showClearCanvasConfirmDialog, handleCancelConnection,
    handleZoomIn, handleZoomOut
  ]);

  // Effect for canvas panning
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (!isPanning) return;
      const deltaX = (event.clientX - panStartRef.current.x) / zoomLevel;
      const deltaY = (event.clientY - panStartRef.current.y) / zoomLevel;
      setCanvasOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      panStartRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleGlobalMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        document.body.style.cursor = 'default';
        saveHistory(); 
      }
    };

    if (isPanning) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      if (document.body.style.cursor === 'grabbing') {
        document.body.style.cursor = 'default';
      }
    };
  }, [isPanning, zoomLevel, saveHistory]);

  // Effect for AI Suggestions (Assistant Panel)
  useEffect(() => {
    let isActive = true;

    const fetchSuggestionsLogic = async () => {
        if (selectedNodeId) {
            // Clear initial suggestion related states if a node is selected
            if (initialCanvasSuggestion && isActive) setInitialCanvasSuggestion(null);
            if (isLoadingInitialSuggestion && isActive) setIsLoadingInitialSuggestion(false);

            const currentNode = nodes.find(n => n.id === selectedNodeId);
            if (!isActive || !currentNode) {
                if (isActive) setSuggestedNextNodeInfo(null);
                return;
            }

            // Fetch suggestion for the selected node
            if (!isLoadingSuggestion && suggestedNextNodeInfo?.forNodeId !== selectedNodeId) {
                if (isActive) setIsLoadingSuggestion(true);
                try {
                    let context = `Workflow in progress. Current node: "${currentNode.name}" (Type: ${currentNode.type}).`;
                    if (currentNode.aiExplanation) context += ` AI Explanation (summary): ${currentNode.aiExplanation.substring(0, 150)}...`;
                    else if (currentNode.description) context += ` Description: ${currentNode.description.substring(0,150)}...`;

                    const suggestionResult = await suggestNextWorkflowNode({
                        currentNodeType: currentNode.type,
                        workflowContext: context,
                    });
                    if (isActive) setSuggestedNextNodeInfo({ suggestion: suggestionResult, forNodeId: selectedNodeId });
                } catch (error: any) {
                    console.warn("Failed to fetch next node suggestion for selected node:", error);
                    if (isActive) setSuggestedNextNodeInfo(null);
                } finally {
                    if (isActive) setIsLoadingSuggestion(false);
                }
            }
        } else { // No node selected
            if (isActive) setSuggestedNextNodeInfo(null); // Clear per-node suggestion

            const shouldFetchInitial =
                nodes.length === 0 &&
                !selectedConnectionId &&
                !workflowExplanation &&
                !initialCanvasSuggestion &&  // We don't already have one
                !isLoadingInitialSuggestion && // Not already loading the initial one
                !initialSuggestionAttempted;   // We haven't tried this session

            if (shouldFetchInitial) {
                if (isActive) {
                    setIsLoadingInitialSuggestion(true); // Set specific loading for initial
                    setInitialSuggestionAttempted(true);
                }
                try {
                    const suggestionResult = await suggestNextWorkflowNode({
                        currentNodeType: undefined,
                        workflowContext: "User is starting a new empty workflow. Suggest a good first node type (e.g., a trigger or an initial action) to begin building an automation.",
                    });
                    if (isActive) setInitialCanvasSuggestion(suggestionResult);
                } catch (error: any) {
                    console.warn("Failed to fetch initial canvas suggestion:", error);
                    if (isActive) setInitialCanvasSuggestion(null);
                } finally {
                    if (isActive) setIsLoadingInitialSuggestion(false); // Clear specific loading
                }
            } else if (initialCanvasSuggestion && (nodes.length > 0 || selectedConnectionId || workflowExplanation)) {
                // If canvas is no longer eligible for initial suggestion, clear it
                if (isActive) setInitialCanvasSuggestion(null);
            }
        }
    };

    if (isAssistantVisible) {
        fetchSuggestionsLogic();
    } else {
        // If assistant panel is closed, clear all suggestions and loading states
        if (isActive) {
            setInitialCanvasSuggestion(null);
            setSuggestedNextNodeInfo(null);
            if (isLoadingSuggestion) setIsLoadingSuggestion(false);
            if (isLoadingInitialSuggestion) setIsLoadingInitialSuggestion(false);
        }
    }

    return () => { isActive = false; };
  }, [isAssistantVisible, selectedNodeId, nodes.length, selectedConnectionId, workflowExplanation]);


  const mapAiWorkflowToInternal = useCallback((aiWorkflow: GenerateWorkflowFromPromptOutput): Workflow => {
    let maxIdNum = nextNodeIdRef.current;
    const newNodes: WorkflowNode[] = aiWorkflow.nodes.map((aiNode, index) => {
      const idParts = aiNode.id.split('_');
      const numPart = parseInt(idParts[idParts.length - 1] || '0', 10);
      if (!isNaN(numPart) && numPart >= maxIdNum) {
        maxIdNum = numPart + 1;
      }

      const mappedTypeKey = aiNode.type.toLowerCase();
      const uiNodeTypeKey = AI_NODE_TYPE_MAPPING[mappedTypeKey] || AI_NODE_TYPE_MAPPING['default'] || 'unknown';
      const nodeConfigDef = AVAILABLE_NODES_CONFIG.find(n => n.type === uiNodeTypeKey) ||
                            AVAILABLE_NODES_CONFIG.find(n => n.type === 'unknown')!;

      const defaultX = (index % 5) * (NODE_WIDTH + 60) + 30;
      const defaultY = Math.floor(index / 5) * (NODE_HEIGHT + 40) + 30;

      return {
        id: aiNode.id || `${nodeConfigDef.type}_${maxIdNum++}`,
        type: nodeConfigDef.type,
        name: aiNode.name || nodeConfigDef.name || `Node ${aiNode.id}`,
        description: aiNode.description || '',
        position: aiNode.position || { x: defaultX, y: defaultY },
        config: { ...nodeConfigDef.defaultConfig, ...(aiNode.config || {}) },
        inputHandles: nodeConfigDef.inputHandles,
        outputHandles: nodeConfigDef.outputHandles,
        aiExplanation: aiNode.aiExplanation || `AI generated node: ${aiNode.name || nodeConfigDef.name}. Type: ${aiNode.type}. Check configuration.`,
        category: nodeConfigDef.category,
        lastExecutionStatus: 'pending' as WorkflowNode['lastExecutionStatus'],
      };
    });
    nextNodeIdRef.current = maxIdNum;

    const newConnections: WorkflowConnection[] = aiWorkflow.connections.map((conn) => ({
      id: conn.id || crypto.randomUUID(),
      sourceNodeId: conn.sourceNodeId,
      targetNodeId: conn.targetNodeId,
      sourceHandle: conn.sourcePort,
      targetHandle: conn.targetPort,
    }));

    return { nodes: newNodes, connections: newConnections };
  }, []);

  const handleAiPromptSubmit = useCallback((aiOutput: GenerateWorkflowFromPromptOutput) => {
    if (!aiOutput || !aiOutput.nodes) {
      toast({
        title: 'AI Error',
        description: 'The AI did not return a valid workflow structure.',
        variant: 'destructive',
      });
      return;
    }
    const { nodes: newNodes, connections: newConnections } = mapAiWorkflowToInternal(aiOutput);
    setNodes(newNodes);
    setConnections(newConnections);
    setSelectedNodeId(null);
    setSelectedConnectionId(null);
    setExecutionLogs([]);
    setWorkflowExplanation(null);
    setInitialCanvasSuggestion(null);
    setSuggestedNextNodeInfo(null);
    setInitialSuggestionAttempted(false);
    setCanvasOffset({ x: 0, y: 0 });
    setZoomLevel(1);
    resetHistoryForNewWorkflow(newNodes, newConnections);
    toast({ title: 'Workflow Generated', description: 'New workflow created by AI.' });
  }, [mapAiWorkflowToInternal, toast, resetHistoryForNewWorkflow]);

  const addNodeToCanvas = useCallback((nodeType: AvailableNodeType, position: { x: number; y: number }) => {
    const newNodeId = `${nodeType.type}_${nextNodeIdRef.current++}`;
    const newNode: WorkflowNode = {
      id: newNodeId,
      type: nodeType.type,
      name: nodeType.name,
      description: nodeType.description || '',
      position,
      config: { ...nodeType.defaultConfig },
      inputHandles: nodeType.inputHandles,
      outputHandles: nodeType.outputHandles,
      aiExplanation: `Manually added ${nodeType.name} node.`,
      category: nodeType.category,
      lastExecutionStatus: 'pending' as WorkflowNode['lastExecutionStatus'],
    };
    setNodes(prevNodes => produce(prevNodes, draft => {
      draft.push(newNode);
    }));

    setSelectedNodeId(newNodeId);
    setSelectedConnectionId(null);
    setWorkflowExplanation(null);
    setInitialCanvasSuggestion(null);
    saveHistory();
  }, [saveHistory]);

  const handleAddSuggestedNode = useCallback((suggestedNodeTypeString: string) => {
    const nodeTypeToAdd = AVAILABLE_NODES_CONFIG.find(n => n.type === suggestedNodeTypeString);
    if (!nodeTypeToAdd) {
      toast({ title: "Error", description: `Cannot add suggested node: Type "${suggestedNodeTypeString}" not found.`, variant: "destructive" });
      return;
    }

    let position: { x: number; y: number };
    if (selectedNode) {
      position = {
        x: selectedNode.position.x + NODE_WIDTH + 60,
        y: selectedNode.position.y,
      };
    } else {
      let newX = 50;
      let newY = 50;
      if (nodes.length > 0) {
        newX = Math.max(...nodes.map(n => n.position.x)) + NODE_WIDTH + 60;
        if (newX > 1000) { 
          newX = 50;
          newY = Math.max(...nodes.map(n => n.position.y)) + NODE_HEIGHT + 40;
        } else {
          newY = nodes[nodes.length -1].position.y; 
        }
      }
      position = { x: newX, y: newY };
    }

    addNodeToCanvas(nodeTypeToAdd, position);
    toast({ title: "Node Added", description: `Added suggested node: ${nodeTypeToAdd.name}`});
    setInitialCanvasSuggestion(null);
    setSuggestedNextNodeInfo(null);
  }, [selectedNode, addNodeToCanvas, toast, nodes]);

  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes(prevNodes => produce(prevNodes, draft => {
      const node = draft.find(n => n.id === nodeId);
      if (node) node.position = position;
    }));
  }, []);

  const handleNodeConfigChange = useCallback((nodeId: string, newConfig: Record<string, any>) => {
    setNodes(prevNodes => produce(prevNodes, draft => {
        const node = draft.find(n => n.id === nodeId);
        if (node) node.config = newConfig;
      }));
    saveHistory();
  }, [saveHistory]);

  const handleNodeNameChange = useCallback((nodeId: string, newName: string) => {
     setNodes(prevNodes => produce(prevNodes, draft => {
        const node = draft.find(n => n.id === nodeId);
        if (node) node.name = newName;
      }));
    saveHistory();
  }, [saveHistory]);

  const handleNodeDescriptionChange = useCallback((nodeId: string, newDescription: string) => {
    setNodes(prevNodes => produce(prevNodes, draft => {
        const node = draft.find(n => n.id === nodeId);
        if (node) node.description = newDescription;
      }));
    saveHistory();
  }, [saveHistory]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedConnectionId(null);
    if (isConnecting) handleCancelConnection();
    setWorkflowExplanation(null);
    setInitialCanvasSuggestion(null);
  };

  const handleStartConnection = useCallback((startNodeId: string, startHandleId: string, startHandlePos: { x: number; y: number }) => {
    setIsConnecting(true);
    setConnectionStartNodeId(startNodeId);
    setConnectionStartHandleId(startHandleId);
    setConnectionPreviewPosition(startHandlePos); 
    setSelectedNodeId(null);
    setSelectedConnectionId(null);
    setWorkflowExplanation(null);
    setInitialCanvasSuggestion(null);
  }, []);

  const handleUpdateConnectionPreview = useCallback((mousePosition: { x: number; y: number }) => {
    if (isConnecting) {
      setConnectionPreviewPosition(mousePosition);
    }
  }, [isConnecting]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-delete-connection-button="true"]') || target.closest('[data-connection-click-target="true"]')) {
        return;
    }

    setSelectedNodeId(null);
    setSelectedConnectionId(null);
    setWorkflowExplanation(null);
    if (isConnecting) {
      handleCancelConnection();
    }
  }, [isConnecting, handleCancelConnection]);

  const handleCanvasPanStart = useCallback((event: React.MouseEvent<Element, MouseEvent>) => {
    if (event.button !== 0) return;

    const targetElement = event.target as HTMLElement;
    if (targetElement.closest('.workflow-node-item') ||
        targetElement.closest('[data-handle-id]') ||
        targetElement.closest('[data-delete-connection-button="true"]') ||
        targetElement.closest('[data-connection-click-target="true"]')
        ) {
        return;
    }

    handleCanvasClick(event as React.MouseEvent<HTMLDivElement, MouseEvent>); 
    if (!isConnecting) { 
      setIsPanning(true);
      panStartRef.current = { x: event.clientX, y: event.clientY };
      document.body.style.cursor = 'grabbing';
    }
  }, [handleCanvasClick, isConnecting]);

  const handleConnectionClick = useCallback((connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setSelectedNodeId(null);
    if (isConnecting) handleCancelConnection();
    setWorkflowExplanation(null);
    setInitialCanvasSuggestion(null);
  }, [isConnecting, handleCancelConnection]);

  const toggleAssistantPanel = () => {
    setIsAssistantVisible(prev => {
      const newVisibility = !prev;
      localStorage.setItem(ASSISTANT_PANEL_VISIBLE_KEY, JSON.stringify(newVisibility));
      return newVisibility;
    });
  };

  const selectedNodeType = useMemo(() => {
    if (!selectedNode) return undefined;
    return AVAILABLE_NODES_CONFIG.find(nt => nt.type === selectedNode.type);
  }, [selectedNode]);

  const handleGetWorkflowExplanation = useCallback(async () => {
    if (nodes.length === 0) {
      toast({ title: 'Empty Workflow', description: 'Add nodes to the canvas to get an explanation.', variant: 'default' });
      return;
    }
    setIsExplainingWorkflow(true);
    setWorkflowExplanation(null); 
    setSelectedNodeId(null); 
    setSelectedConnectionId(null);
    setInitialCanvasSuggestion(null); 
    try {
      const explanation = await getWorkflowExplanation({ nodes, connections });
      setWorkflowExplanation(explanation);
      setIsAssistantVisible(true); 
      localStorage.setItem(ASSISTANT_PANEL_VISIBLE_KEY, JSON.stringify(true));
    } catch (error: any) {
      toast({ title: 'Error Explaining Workflow', description: error.message, variant: 'destructive' });
      setWorkflowExplanation('Failed to get explanation.');
    } finally {
      setIsExplainingWorkflow(false);
    }
  }, [nodes, connections, toast]);


  const handleToggleSimulationMode = useCallback((newMode: boolean) => {
    setIsSimulationMode(newMode);
    toast({
      title: `Execution Mode Changed`,
      description: `Workflow will now run in ${newMode ? 'Simulation Mode' : 'Live Mode'}.`,
    });
  }, [toast]);

  const handleClearLogs = useCallback(() => {
    setExecutionLogs([]);
    setNodes(prevNodes => prevNodes.map(n => ({ ...n, lastExecutionStatus: 'pending' as WorkflowNode['lastExecutionStatus'] }))); 
    toast({ title: 'Logs Cleared', description: 'Execution logs have been cleared and node statuses reset.' });
    saveHistory(); 
  }, [toast, saveHistory]);

  const handleConfirmClearCanvas = useCallback(() => {
    setNodes([]);
    setConnections([]);
    setSelectedNodeId(null);
    setSelectedConnectionId(null);
    nextNodeIdRef.current = 1;
    setExecutionLogs([]);
    setWorkflowExplanation(null);
    setInitialCanvasSuggestion(null);
    setSuggestedNextNodeInfo(null);
    setInitialSuggestionAttempted(false);
    setCanvasOffset({ x: 0, y: 0 });
    setZoomLevel(1);
    resetHistoryForNewWorkflow([], []);
    toast({ title: 'Canvas Cleared', description: 'All nodes and connections have been removed.' });
    setShowClearCanvasConfirmDialog(false);
  }, [toast, resetHistoryForNewWorkflow]);

  const handleExportWorkflow = useCallback(() => {
    const workflowData = {
      nodes,
      connections,
      nextNodeId: nextNodeIdRef.current,
      canvasOffset,
      zoomLevel,
      isSimulationMode,
    };
    const jsonString = JSON.stringify(workflowData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `flowai_workflow_${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Workflow Exported', description: 'Workflow saved as JSON file.' });
  }, [nodes, connections, canvasOffset, zoomLevel, isSimulationMode, toast]);

  const handleImportWorkflow = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const importedData = JSON.parse(content);

            if (!Array.isArray(importedData.nodes) || !Array.isArray(importedData.connections)) {
              throw new Error('Invalid workflow file structure.');
            }

            const importedNodes = (importedData.nodes || []).map((n: WorkflowNode) => ({ ...n, lastExecutionStatus: 'pending' as WorkflowNode['lastExecutionStatus']})); 
            setNodes(importedNodes);
            setConnections(importedData.connections || []);
            nextNodeIdRef.current = importedData.nextNodeId || Math.max(0, ...importedNodes.map((n: WorkflowNode) => parseInt(n.id.split('_').pop() || '0', 10))) + 1 || 1;
            setCanvasOffset(importedData.canvasOffset || { x: 0, y: 0 });
            setZoomLevel(importedData.zoomLevel || 1);
            setIsSimulationMode(importedData.isSimulationMode === undefined ? true : importedData.isSimulationMode);

            setSelectedNodeId(null);
            setSelectedConnectionId(null);
            setExecutionLogs([]);
            setWorkflowExplanation(null);
            setInitialCanvasSuggestion(null);
            setSuggestedNextNodeInfo(null);
            setInitialSuggestionAttempted(false);
            resetHistoryForNewWorkflow(importedNodes, importedData.connections || []);

            toast({ title: 'Workflow Imported', description: 'Workflow loaded from file.' });
          } catch (error: any) {
            toast({ title: 'Import Error', description: `Failed to import workflow: ${error.message}`, variant: 'destructive' });
          }
        };
        reader.readAsText(file);
      }
      document.body.removeChild(input);
    };

    document.body.appendChild(input);
    input.click();
  }, [toast, resetHistoryForNewWorkflow]);


  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1 && historyIndex !== -1;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      {(isLoadingAi || isExplainingWorkflow || isLoadingInitialSuggestion || (isLoadingSuggestion && selectedNodeId && !isLoadingInitialSuggestion)) && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-foreground">
            {isLoadingAi ? 'AI is generating your workflow...' :
             isExplainingWorkflow ? 'AI is explaining the workflow...' :
             isLoadingInitialSuggestion ? 'AI is suggesting a first step...' :
             (isLoadingSuggestion && selectedNodeId) ? 'AI is suggesting next step for selected node...' :
             'Processing...'}
          </p>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <NodeLibrary availableNodes={AVAILABLE_NODES_CONFIG} />
        <AIWorkflowBuilderPanel
          nodes={nodes}
          connections={connections}
          selectedNodeId={selectedNodeId}
          selectedConnectionId={selectedConnectionId}
          onNodeClick={handleNodeClick}
          onConnectionClick={handleConnectionClick}
          onNodeDragStop={(nodeId, position) => {
            updateNodePosition(nodeId, position);
            saveHistory(); 
          }}
          onCanvasDrop={addNodeToCanvas} 
          onToggleAssistant={toggleAssistantPanel}
          onSaveWorkflow={handleManualSaveWorkflow}
          onLoadWorkflow={() => handleLoadWorkflow(true)}
          onExportWorkflow={handleExportWorkflow}
          onImportWorkflow={handleImportWorkflow}
          onClearCanvas={() => setShowClearCanvasConfirmDialog(true)}
          isConnecting={isConnecting}
          onStartConnection={handleStartConnection}
          onCompleteConnection={handleCompleteConnection} 
          onUpdateConnectionPreview={handleUpdateConnectionPreview}
          connectionPreview={{
            startNodeId: connectionStartNodeId,
            startHandleId: connectionStartHandleId,
            previewPosition: connectionPreviewPosition,
          }}
          onCanvasClick={handleCanvasClick}
          onCanvasPanStart={handleCanvasPanStart}
          canvasOffset={canvasOffset}
          isPanningForCursor={isPanning}
          connectionStartNodeId={connectionStartNodeId}
          connectionStartHandleId={connectionStartHandleId}
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn} 
          onZoomOut={handleZoomOut} 
          onExplainWorkflow={handleGetWorkflowExplanation}
          isExplainingWorkflow={isExplainingWorkflow}
          onUndo={handleUndo}
          canUndo={canUndo}
          onRedo={handleRedo}
          canRedo={canRedo}
          toast={toast}
          onDeleteSelectedConnection={handleDeleteSelectedConnection} 
        />

        {isAssistantVisible && (
          <aside className="w-96 border-l bg-card shadow-sm flex flex-col overflow-hidden">
            <ExecutionLogPanel
              onRunWorkflow={handleRunWorkflow} 
              isWorkflowRunning={isWorkflowRunning}
              isSimulationMode={isSimulationMode}
              onToggleSimulationMode={handleToggleSimulationMode} 
            />
             <AIWorkflowAssistantPanel
                onWorkflowGenerated={handleAiPromptSubmit} 
                setIsLoadingGlobal={setIsLoadingAi}
                isExplainingWorkflow={isExplainingWorkflow}
                workflowExplanation={workflowExplanation}
                onClearExplanation={() => {
                    setWorkflowExplanation(null);
                }}
                initialCanvasSuggestion={initialCanvasSuggestion}
                isLoadingSuggestion={isLoadingInitialSuggestion || isLoadingSuggestion} // Combine for panel
                onAddSuggestedNode={handleAddSuggestedNode} 
                isCanvasEmpty={nodes.length === 0}
                executionLogs={executionLogs}
                onClearLogs={handleClearLogs} 
                isWorkflowRunning={isWorkflowRunning}
                selectedNodeId={selectedNodeId}
                selectedConnectionId={selectedConnectionId}
                onDeleteSelectedConnection={handleDeleteSelectedConnection} 
                onDeselectConnection={() => setSelectedConnectionId(null)} 
                isConnecting={isConnecting}
                onCancelConnection={handleCancelConnection}
              />

            <div className="flex-1 overflow-y-auto">
              {selectedNode && selectedNodeType && !isConnecting && !workflowExplanation && !selectedConnectionId ? (
                <NodeConfigPanel
                  node={selectedNode}
                  nodeType={selectedNodeType}
                  onConfigChange={handleNodeConfigChange} 
                  onNodeNameChange={handleNodeNameChange} 
                  onNodeDescriptionChange={handleNodeDescriptionChange} 
                  onDeleteNode={handleDeleteNode} 
                  suggestedNextNodeInfo={suggestedNextNodeInfo}
                  isLoadingSuggestion={isLoadingSuggestion} // For selected node suggestion
                  onAddSuggestedNode={handleAddSuggestedNode} 
                />
              ) : (
               null 
              )}
            </div>
          </aside>
        )}
      </div>
      <AlertDialog open={showDeleteNodeConfirmDialog} onOpenChange={setShowDeleteNodeConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Node?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this node and its connections? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteNode}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteNode} className={buttonVariants({ variant: "destructive" })}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={showClearCanvasConfirmDialog} onOpenChange={setShowClearCanvasConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Entire Canvas?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all nodes and connections? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowClearCanvasConfirmDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClearCanvas} className={buttonVariants({ variant: "destructive" })}>
              Clear Canvas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

