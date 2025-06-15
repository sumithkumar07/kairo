
'use client';

import { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import type { WorkflowNode, WorkflowConnection, Workflow, AvailableNodeType, LogEntry, ServerLogOutput } from '@/types/workflow';
import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';
import type { SuggestNextNodeOutput } from '@/ai/flows/suggest-next-node';
import { executeWorkflow, suggestNextWorkflowNode, getWorkflowExplanation } from '@/app/actions'; 
import { isConfigComplete, isNodeDisconnected, hasUnconnectedInputs } from '@/lib/workflow-utils';
import { EXAMPLE_WORKFLOWS, type ExampleWorkflow } from '@/config/example-workflows';


import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react'; 
import { Button, buttonVariants } from '@/components/ui/button'; // Import buttonVariants
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
import { MousePointer2, X } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'flowAIWorkflow';
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

export default function FlowAIPage() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isAssistantVisible, setIsAssistantVisible] = useState(true);
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
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  const [isExplainingWorkflow, setIsExplainingWorkflow] = useState(false);
  const [workflowExplanation, setWorkflowExplanation] = useState<string | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState(true);

  const [showDeleteNodeConfirmDialog, setShowDeleteNodeConfirmDialog] = useState(false);
  const [nodeToDeleteId, setNodeToDeleteId] = useState<string | null>(null);


  const selectedNode = useMemo(() => {
    return nodes.find(node => node.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  useEffect(() => {
    const fetchSuggestion = async () => {
      if (selectedNodeId && selectedNode) {
        setIsLoadingSuggestion(true);
        setInitialCanvasSuggestion(null); 
        setWorkflowExplanation(null); 
        try {
          let context = `Workflow in progress. Current node: "${selectedNode.name}" (Type: ${selectedNode.type}).`;
          if (selectedNode.aiExplanation) {
            context += ` AI Explanation (summary): ${selectedNode.aiExplanation.substring(0, 150)}...`;
          } else if (selectedNode.description) {
            context += ` Description: ${selectedNode.description.substring(0,150)}...`;
          }
          const suggestionResult = await suggestNextWorkflowNode({
            currentNodeType: selectedNode.type,
            workflowContext: context,
          });
          setSuggestedNextNodeInfo({ suggestion: suggestionResult, forNodeId: selectedNodeId });
        } catch (error: any) {
          console.warn("Failed to fetch next node suggestion for selected node:", error);
          setSuggestedNextNodeInfo(null);
        } finally {
          setIsLoadingSuggestion(false);
        }
      } else if (!selectedNodeId && nodes.length === 0 && !selectedConnectionId && !workflowExplanation && !initialCanvasSuggestion && !isLoadingSuggestion) { 
        setIsLoadingSuggestion(true);
        setSuggestedNextNodeInfo(null); 
        try {
          const suggestionResult = await suggestNextWorkflowNode({
            currentNodeType: undefined,
            workflowContext: "User is starting a new empty workflow. Suggest a good first node type (e.g., a trigger or an initial action) to begin building an automation.",
          });
          setInitialCanvasSuggestion(suggestionResult);
        } catch (error: any) {
          console.warn("Failed to fetch initial canvas suggestion:", error);
          setInitialCanvasSuggestion(null);
        } finally {
           setIsLoadingSuggestion(false);
        }
      } else if (!selectedNodeId) {
         setSuggestedNextNodeInfo(null); 
         if (workflowExplanation || selectedConnectionId || nodes.length > 0) {
           setInitialCanvasSuggestion(null); 
         }
      }
    };
    
    fetchSuggestion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId, nodes.length, selectedConnectionId, workflowExplanation]); // Added workflowExplanation


  const handleSaveWorkflow = useCallback(() => {
    if (typeof window !== 'undefined') {
      const workflowToSave = { nodes, connections, nextNodeId: nextNodeIdRef.current, canvasOffset, zoomLevel, isSimulationMode };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(workflowToSave));
      toast({ title: 'Workflow Saved', description: 'Your current workflow has been saved locally.' });
    }
  }, [nodes, connections, toast, canvasOffset, zoomLevel, isSimulationMode]);

  const handleLoadWorkflow = useCallback((showToast = true) => {
    if (typeof window !== 'undefined') {
      const savedWorkflowJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedWorkflowJson) {
        const savedWorkflow = JSON.parse(savedWorkflowJson);
        setNodes(savedWorkflow.nodes || []);
        setConnections(savedWorkflow.connections || []);
        nextNodeIdRef.current = savedWorkflow.nextNodeId || 1;
        setCanvasOffset(savedWorkflow.canvasOffset || { x: 0, y: 0 });
        setZoomLevel(savedWorkflow.zoomLevel || 1);
        setIsSimulationMode(savedWorkflow.isSimulationMode === undefined ? true : savedWorkflow.isSimulationMode);
        setSelectedNodeId(null);
        setSelectedConnectionId(null);
        setExecutionLogs([]);
        setWorkflowExplanation(null); 
        setInitialCanvasSuggestion(null);
        setSuggestedNextNodeInfo(null);
        if (showToast) {
          toast({ title: 'Workflow Loaded', description: 'Your saved workflow has been loaded.' });
        }
      } else {
        if (showToast) {
          toast({ title: 'No Saved Workflow', description: 'No workflow found in local storage.', variant: 'default' });
        }
      }
    }
  }, [toast]);

  const calculateNextNodeId = (currentNodes: WorkflowNode[]): number => {
    if (currentNodes.length === 0) return 1;
    let maxIdNum = 0;
    currentNodes.forEach(node => {
      const parts = node.id.split('_');
      const numPart = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(numPart) && numPart > maxIdNum) {
        maxIdNum = numPart;
      }
    });
    return maxIdNum + 1;
  };
  
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
    const runModeMessage = isSimulationMode ? 'Simulation Mode' : 'Live Mode';
    setExecutionLogs([{ timestamp: new Date().toLocaleTimeString(), message: `Workflow execution started in ${runModeMessage}...`, type: 'info' }]);
    try {
      const serverLogs: ServerLogOutput[] = await executeWorkflow({ nodes, connections }, isSimulationMode);
      const newLogs: LogEntry[] = serverLogs.map(log => ({
        ...log,
        timestamp: new Date().toLocaleTimeString(),
      }));
      setExecutionLogs(prevLogs => [...prevLogs, ...newLogs]);
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
      toast({ title: 'Workflow Execution Failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsWorkflowRunning(false);
    }
  }, [nodes, connections, toast, isSimulationMode]);

  const handleDeleteNode = useCallback((nodeIdToDelete: string) => {
    setNodeToDeleteId(nodeIdToDelete);
    setShowDeleteNodeConfirmDialog(true);
  }, []);

  const confirmDeleteNode = useCallback(() => {
    if (!nodeToDeleteId) return;
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeToDeleteId));
    setConnections(prevConns => prevConns.filter(conn => conn.sourceNodeId !== nodeToDeleteId && conn.targetNodeId !== nodeToDeleteId));
    if (selectedNodeId === nodeToDeleteId) {
      setSelectedNodeId(null); 
    }
    toast({ title: 'Node Deleted', description: `Node ${nodeToDeleteId} and its connections removed.` });
    setNodeToDeleteId(null);
    setShowDeleteNodeConfirmDialog(false);
  }, [nodeToDeleteId, selectedNodeId, toast]);

  const cancelDeleteNode = useCallback(() => {
    setNodeToDeleteId(null);
    setShowDeleteNodeConfirmDialog(false);
  }, []);

  const handleDeleteSelectedConnection = useCallback(() => {
    if (selectedConnectionId) {
      setConnections(prev => prev.filter(conn => conn.id !== selectedConnectionId));
      setSelectedConnectionId(null);
      toast({ title: "Connection Deleted", description: "The selected connection has been removed." });
    }
  }, [selectedConnectionId, toast]);

  useEffect(() => {
    handleLoadWorkflow(false); 
    
    const isInputField = (target: EventTarget | null): boolean => {
      return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && target.isContentEditable);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInputField(event.target)) return;

      const isCtrlOrMeta = event.ctrlKey || event.metaKey;

      if (isCtrlOrMeta && event.key.toLowerCase() === 's') { event.preventDefault(); handleSaveWorkflow(); return; }
      if (isCtrlOrMeta && event.key.toLowerCase() === 'o') { event.preventDefault(); handleLoadWorkflow(true); return; }
      if (isCtrlOrMeta && event.key.toLowerCase() === 'enter') { event.preventDefault(); handleRunWorkflow(); return; }
      
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isConnecting, selectedNodeId, selectedConnectionId, workflowExplanation,
    handleSaveWorkflow, handleLoadWorkflow, handleRunWorkflow, 
    handleDeleteNode, handleDeleteSelectedConnection
  ]); 

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
  }, [isPanning, zoomLevel]);

  const mapAiWorkflowToInternal = useCallback((aiWorkflow: GenerateWorkflowFromPromptOutput): Workflow => {
    let maxId = 0;
    const newNodes: WorkflowNode[] = aiWorkflow.nodes.map((aiNode, index) => {
      const currentIdNum = parseInt(aiNode.id.split('_').pop() || '0', 10) || index;
      if (currentIdNum > maxId) maxId = currentIdNum;

      const mappedTypeKey = aiNode.type.toLowerCase();
      const uiNodeTypeKey = AI_NODE_TYPE_MAPPING[mappedTypeKey] || AI_NODE_TYPE_MAPPING['default'] || 'unknown';
      const nodeConfigDef = AVAILABLE_NODES_CONFIG.find(n => n.type === uiNodeTypeKey) || 
                            AVAILABLE_NODES_CONFIG.find(n => n.type === 'unknown')!;
      
      return {
        id: aiNode.id || `${nodeConfigDef.type}_${nextNodeIdRef.current++}`,
        type: nodeConfigDef.type, 
        name: aiNode.name || nodeConfigDef.name || `Node ${aiNode.id}`,
        description: aiNode.description || '',
        position: aiNode.position || { x: (index % 5) * (NODE_WIDTH + 60) + 30, y: Math.floor(index / 5) * (NODE_HEIGHT + 40) + 30 },
        config: { ...nodeConfigDef.defaultConfig, ...(aiNode.config || {}) },
        inputHandles: nodeConfigDef.inputHandles,
        outputHandles: nodeConfigDef.outputHandles,
        aiExplanation: aiNode.aiExplanation || `AI generated node: ${aiNode.name || nodeConfigDef.name}. Type: ${aiNode.type}. Check configuration.`,
        category: nodeConfigDef.category,
      };
    });
    nextNodeIdRef.current = maxId + 1;

    const newConnections: WorkflowConnection[] = aiWorkflow.connections.map((conn) => ({
      id: crypto.randomUUID(),
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
    setWorkflowExplanation(null); // Clear global explanation
    setInitialCanvasSuggestion(null);
    setSuggestedNextNodeInfo(null);
    setCanvasOffset({ x: 0, y: 0 }); 
    setZoomLevel(1);
    toast({ title: 'Workflow Generated', description: 'New workflow created by AI.' });
  }, [mapAiWorkflowToInternal, toast]);

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
    };
    setNodes((prevNodes) => produce(prevNodes, draft => {
      draft.push(newNode);
    }));
    setSelectedNodeId(newNodeId);
    setSelectedConnectionId(null);
    setIsAssistantVisible(true); 
    setWorkflowExplanation(null);
    setInitialCanvasSuggestion(null); 
  }, []);

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
      position = { x: 50, y: 50 };
    }
    
    addNodeToCanvas(nodeTypeToAdd, position);
    toast({ title: "Node Added", description: `Added suggested node: ${nodeTypeToAdd.name}`});
    setInitialCanvasSuggestion(null); 
    setSuggestedNextNodeInfo(null); 
  }, [selectedNode, addNodeToCanvas, toast]);

  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes((prevNodes) =>
      produce(prevNodes, draft => {
        const node = draft.find(n => n.id === nodeId);
        if (node) node.position = position;
      })
    );
  }, []);

  const handleNodeConfigChange = useCallback((nodeId: string, newConfig: Record<string, any>) => {
    setNodes(prevNodes => 
      produce(prevNodes, draft => {
        const node = draft.find(n => n.id === nodeId);
        if (node) node.config = newConfig;
      })
    );
  }, []);

  const handleNodeNameChange = useCallback((nodeId: string, newName: string) => {
    setNodes(prevNodes => 
      produce(prevNodes, draft => {
        const node = draft.find(n => n.id === nodeId);
        if (node) node.name = newName;
      })
    );
  }, []);
  
  const handleNodeDescriptionChange = useCallback((nodeId: string, newDescription: string) => {
    setNodes(prevNodes => 
      produce(prevNodes, draft => {
        const node = draft.find(n => n.id === nodeId);
        if (node) node.description = newDescription;
      })
    );
  }, []);
  
  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedConnectionId(null);
    setIsAssistantVisible(true);
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
      setConnections(prev => produce(prev, draft => {
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
    }
    handleCancelConnection();
  }, [isConnecting, connectionStartNodeId, connectionStartHandleId, nodes, toast]);

  const handleCancelConnection = useCallback(() => {
    setIsConnecting(false);
    setConnectionStartNodeId(null);
    setConnectionStartHandleId(null);
    setConnectionPreviewPosition(null);
  }, []);
  
  const handleCanvasClick = useCallback(() => {
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
    if (targetElement.closest('.workflow-node-item') || targetElement.closest('[data-handle-id]')) {
        return;
    }
    
    handleCanvasClick(); 
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
    setIsAssistantVisible(true); 
    setWorkflowExplanation(null); 
    setInitialCanvasSuggestion(null);
  }, [isConnecting, handleCancelConnection]);

  const toggleAssistantPanel = () => {
    setIsAssistantVisible(prev => {
      const newVisibility = !prev;
      if (!newVisibility && (selectedNodeId || selectedConnectionId || workflowExplanation || initialCanvasSuggestion)) {
        setSelectedNodeId(null);
        setSelectedConnectionId(null);
        setWorkflowExplanation(null); 
      }
      return newVisibility;
    });
  };

  const selectedNodeType = useMemo(() => {
    if (!selectedNode) return undefined;
    return AVAILABLE_NODES_CONFIG.find(nt => nt.type === selectedNode.type);
  }, [selectedNode]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(MIN_ZOOM, prev - ZOOM_STEP));
  }, []);

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
    } catch (error: any) {
      toast({ title: 'Error Explaining Workflow', description: error.message, variant: 'destructive' });
      setWorkflowExplanation('Failed to get explanation.');
    } finally {
      setIsExplainingWorkflow(false);
    }
  }, [nodes, connections, toast]);

  const handleLoadExampleWorkflow = useCallback((example: ExampleWorkflow) => {
    setNodes(example.nodes);
    setConnections(example.connections);
    setSelectedNodeId(null);
    setSelectedConnectionId(null);
    setExecutionLogs([]);
    setWorkflowExplanation(null);
    setInitialCanvasSuggestion(null);
    setSuggestedNextNodeInfo(null);
    setCanvasOffset({ x: 0, y: 0 });
    setZoomLevel(1);
    nextNodeIdRef.current = calculateNextNodeId(example.nodes);
    toast({ title: 'Example Loaded', description: `${example.name} workflow is now on the canvas.` });
  }, [toast]);

  const handleToggleSimulationMode = useCallback((newMode: boolean) => {
    setIsSimulationMode(newMode);
    toast({
      title: `Execution Mode Changed`,
      description: `Workflow will now run in ${newMode ? 'Simulation Mode' : 'Live Mode'}.`,
    });
  }, [toast]);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      {(isLoadingAi || isExplainingWorkflow || (isLoadingSuggestion && nodes.length === 0 && !initialCanvasSuggestion)) && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-foreground">
            {isLoadingAi ? 'AI is generating your workflow...' : 
             isExplainingWorkflow ? 'AI is explaining the workflow...' : 
             isLoadingSuggestion ? 'AI is suggesting a first step...' :
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
          onNodeDragStop={updateNodePosition}
          onCanvasDrop={addNodeToCanvas}
          onToggleAssistant={toggleAssistantPanel}
          isAssistantVisible={isAssistantVisible}
          onSaveWorkflow={handleSaveWorkflow}
          onLoadWorkflow={() => handleLoadWorkflow(true)}
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
        />
        
        {isAssistantVisible && (
          <aside className="w-96 border-l bg-card shadow-sm flex flex-col overflow-y-auto">
            {selectedNode && selectedNodeType ? (
              <NodeConfigPanel
                node={selectedNode}
                nodeType={selectedNodeType}
                onConfigChange={handleNodeConfigChange}
                onNodeNameChange={handleNodeNameChange}
                onNodeDescriptionChange={handleNodeDescriptionChange}
                onDeleteNode={handleDeleteNode}
                suggestedNextNodeInfo={suggestedNextNodeInfo}
                isLoadingSuggestion={isLoadingSuggestion}
                onAddSuggestedNode={handleAddSuggestedNode}
              />
            ) : selectedConnectionId ? (
                <div className="p-6 text-center flex flex-col items-center justify-center h-full space-y-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 mx-auto text-primary mb-2"><path d="M5 12s2.545-5 7-5c4.454 0 7 5 7 5s-2.546 5-7 5c-4.455 0-7-5-7-5z"></path><line x1="12" y1="13" x2="12" y2="17"></line><line x1="12" y1="8" x2="12" y2="10"></line></svg>
                    <p className="text-md font-semibold text-foreground">Connection Selected</p>
                    <p className="text-sm text-muted-foreground">
                        Press <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-neutral-700 dark:text-gray-100 dark:border-neutral-600">Delete</kbd> or <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-neutral-700 dark:text-gray-100 dark:border-neutral-600">Backspace</kbd> to remove. <br/>Press <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-neutral-700 dark:text-gray-100 dark:border-neutral-600">Esc</kbd> to deselect.
                    </p>
                    <div className="flex gap-2">
                        <Button variant="destructive" size="sm" onClick={handleDeleteSelectedConnection}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Connection
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedConnectionId(null)}>
                            <X className="mr-2 h-4 w-4" /> Deselect
                        </Button>
                    </div>
                </div>
            ) : isConnecting ? (
                 <div className="p-6 text-center flex flex-col items-center justify-center h-full">
                    <MousePointer2 className="h-10 w-10 mx-auto text-primary mb-3" />
                    <p className="text-md font-semibold text-foreground mb-1">Creating Connection</p>
                    <p className="text-sm text-muted-foreground mb-4">
                        Click an input handle on a target node to complete the connection. <br/>Press <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-neutral-700 dark:text-gray-100 dark:border-neutral-600">Esc</kbd> to cancel.
                    </p>
                    <Button variant="outline" size="sm" onClick={handleCancelConnection}>
                        <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                </div>
            ) : (
              <AIWorkflowAssistantPanel
                onWorkflowGenerated={handleAiPromptSubmit}
                setIsLoadingGlobal={setIsLoadingAi}
                isExplainingWorkflow={isExplainingWorkflow}
                workflowExplanation={workflowExplanation}
                onClearExplanation={() => {
                    setWorkflowExplanation(null);
                }}
                exampleWorkflows={EXAMPLE_WORKFLOWS}
                onLoadExampleWorkflow={handleLoadExampleWorkflow}
                initialCanvasSuggestion={initialCanvasSuggestion}
                isLoadingSuggestion={isLoadingSuggestion}
                onAddSuggestedNode={handleAddSuggestedNode}
                isCanvasEmpty={nodes.length === 0}
              />
            )}
            <div className="mt-auto border-t">
              <ExecutionLogPanel 
                logs={executionLogs} 
                onRunWorkflow={handleRunWorkflow} 
                isWorkflowRunning={isWorkflowRunning}
                isSimulationMode={isSimulationMode}
                onToggleSimulationMode={handleToggleSimulationMode}
              />
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
    </div>
  );
}

