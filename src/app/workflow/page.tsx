
'use client';

import { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import type { WorkflowNode, WorkflowConnection, Workflow, AvailableNodeType, LogEntry, ServerLogOutput, WorkflowExecutionResult, ChatMessage } from '@/types/workflow';
import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';
import type { SuggestNextNodeOutput } from '@/ai/flows/suggest-next-node';
import { executeWorkflow, suggestNextWorkflowNode, getWorkflowExplanation, generateWorkflow, assistantChat } from '@/app/actions';
import { isConfigComplete, isNodeDisconnected, hasUnconnectedInputs } from '@/lib/workflow-utils';
import { useSubscription } from '@/contexts/SubscriptionContext';


import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Undo2, Redo2, X, Bot, MessageSquareText, SaveAll, List } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


import { NodeLibrary } from '@/components/node-library';
import { AIWorkflowAssistantPanel } from '@/components/ai-workflow-assistant-panel';
import { NodeConfigPanel } from '@/components/node-config-panel';
import { AIWorkflowBuilderPanel } from '@/components/ai-workflow-builder-panel';


import { AVAILABLE_NODES_CONFIG, AI_NODE_TYPE_MAPPING, NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';
import { produce } from 'immer';

const CURRENT_WORKFLOW_KEY = 'kairoCurrentWorkflow';
const SAVED_WORKFLOWS_INDEX_KEY = 'kairoSavedWorkflowsIndex';
const WORKFLOW_PREFIX = 'kairoWorkflow_';
const ASSISTANT_PANEL_VISIBLE_KEY = 'kairoAssistantPanelVisible';
const CHAT_HISTORY_STORAGE_KEY = 'kairoChatHistory';
const CHAT_CONTEXT_MESSAGE_LIMIT = 6;
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
  const [isLoadingAiWorkflow, setIsLoadingAiWorkflow] = useState(false);
  const [isAssistantVisible, setIsAssistantVisible] = useState(true);
  const [executionLogs, setExecutionLogs] = useState<LogEntry[]>([]);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const { toast } = useToast();
  const { isProOrTrial, isLoggedIn } = useSubscription();
  const nextNodeIdRef = useRef(1);

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStartNodeId, setConnectionStartNodeId] = useState<string | null>(null);
  const [connectionStartHandleId, setConnectionStartHandleId] = useState<string | null>(null);
  const [connectionPreviewPosition, setConnectionPreviewPosition] = useState<{ x: number; y: number } | null>(null);

  const [suggestedNextNodeInfo, setSuggestedNextNodeInfo] = useState<{ suggestion: SuggestNextNodeOutput; forNodeId: string } | null>(null);
  const [initialCanvasSuggestion, setInitialCanvasSuggestion] = useState<SuggestNextNodeOutput | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [isLoadingInitialSuggestion, setIsLoadingInitialSuggestion] = useState(false);
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

  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');


  const selectedNode = useMemo(() => {
    return nodes.find(node => node.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  useEffect(() => {
    const storedHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (storedHistory) {
      try {
        setChatHistory(JSON.parse(storedHistory));
      } catch (error) {
        console.error("Failed to parse chat history from localStorage:", error);
        localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY); 
      }
    }
  }, []); 

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(chatHistory));
    } else {
      localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
    }
  }, [chatHistory]);

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
    setInitialSuggestionAttempted(false);
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
      toast({ title: "Action Undone", description: "Previous state restored." });
    }
  }, [history, historyIndex, toast]);

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
      toast({ title: "Action Redone", description: "Next state restored." });
    }
  }, [history, historyIndex, toast]);

  const handleCancelConnection = useCallback(() => {
    setIsConnecting(false);
    setConnectionStartNodeId(null);
    setConnectionStartHandleId(null);
    setConnectionPreviewPosition(null);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastHistoryState = history[historyIndex];

      let changed = false;
      if (!lastHistoryState) {
        if (nodes.length > 0 || connections.length > 0) changed = true;
      } else {
        if (JSON.stringify(lastHistoryState.nodes) !== JSON.stringify(nodes) ||
            JSON.stringify(lastHistoryState.connections) !== JSON.stringify(connections) ||
            JSON.stringify(lastHistoryState.canvasOffset) !== JSON.stringify(canvasOffset) ||
            lastHistoryState.zoomLevel !== zoomLevel) {
          changed = true;
        }
      }

      const savedWorkflowJson = localStorage.getItem(CURRENT_WORKFLOW_KEY);
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
      } else if (isSimulationMode !== true || nodes.length > 0 || connections.length > 0 ) {
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
        localStorage.setItem(CURRENT_WORKFLOW_KEY, JSON.stringify(workflowToSave));
      }
    }
  }, [nodes, connections, canvasOffset, zoomLevel, isSimulationMode, history, historyIndex]);

  const handleLoadWorkflow = useCallback((showToastMessage = true) => {
    if (typeof window !== 'undefined') {
      const savedWorkflowJson = localStorage.getItem(CURRENT_WORKFLOW_KEY);
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

          resetHistoryForNewWorkflow(loadedNodes, loadedConnections);
          if (showToastMessage) {
            toast({ title: 'Workflow Loaded', description: 'Your current working workflow has been loaded.' });
          }
        } catch (error: any) {
           console.error("Error loading workflow from local storage:", error);
           if (showToastMessage) {
            toast({ title: 'Load Error', description: `Failed to load workflow: ${error.message}`, variant: 'destructive'});
           }
           localStorage.removeItem(CURRENT_WORKFLOW_KEY);
           setNodes([]); setConnections([]); setCanvasOffset({x:0,y:0}); setZoomLevel(1);
           resetHistoryForNewWorkflow([], []);
        }
      } else {
        if (showToastMessage) {
          toast({ title: 'No Saved Workflow', description: 'No current working workflow found in local storage.', variant: 'default' });
        }
        setNodes([]); setConnections([]); setCanvasOffset({x:0,y:0}); setZoomLevel(1);
        resetHistoryForNewWorkflow([], []);
      }
    }
  }, [toast, resetHistoryForNewWorkflow]);

  const handleManualSaveWorkflow = useCallback(() => {
    if (typeof window !== 'undefined') {
      const workflowToSave = { nodes, connections, nextNodeId: nextNodeIdRef.current, canvasOffset, zoomLevel, isSimulationMode };
      localStorage.setItem(CURRENT_WORKFLOW_KEY, JSON.stringify(workflowToSave));
      toast({ title: 'Current Workflow Saved', description: 'Your current work has been saved locally.' });
      saveHistory();
    }
  }, [nodes, connections, toast, canvasOffset, zoomLevel, isSimulationMode, saveHistory]);

  const handleSaveWorkflowAs = useCallback(() => {
    if (nodes.length === 0 && connections.length === 0) {
      toast({ title: 'Empty Workflow', description: 'Cannot save an empty workflow with a name.', variant: 'default' });
      return;
    }
    setSaveAsName('');
    setShowSaveAsDialog(true);
  }, [nodes, connections, toast]);

  const confirmSaveAsWorkflow = useCallback(() => {
    if (!saveAsName.trim()) {
      toast({ title: 'Invalid Name', description: 'Please enter a valid name for the workflow.', variant: 'destructive' });
      return;
    }

    const workflowKey = `${WORKFLOW_PREFIX}${saveAsName}`;

    const indexJson = localStorage.getItem(SAVED_WORKFLOWS_INDEX_KEY);
    let names: string[] = [];
    if (indexJson) {
      try { names = JSON.parse(indexJson); } catch (e) { names = []; }
    }

    if (names.includes(saveAsName) || localStorage.getItem(workflowKey)) {

      const overwrite = confirm(`A workflow named "${saveAsName}" already exists. Overwrite it?`);
      if (!overwrite) {
        setShowSaveAsDialog(false);
        return;
      }
    }

    const workflowToSave = { nodes, connections, nextNodeId: nextNodeIdRef.current, canvasOffset, zoomLevel, isSimulationMode };
    localStorage.setItem(workflowKey, JSON.stringify(workflowToSave));

    if (!names.includes(saveAsName)) {
      names.push(saveAsName);
      localStorage.setItem(SAVED_WORKFLOWS_INDEX_KEY, JSON.stringify(names));
    }

    toast({ title: 'Workflow Saved As', description: `Workflow saved as "${saveAsName}".` });
    setShowSaveAsDialog(false);
    saveHistory();
  }, [saveAsName, nodes, connections, canvasOffset, zoomLevel, isSimulationMode, toast, saveHistory]);


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
      sourcePort: conn.sourcePort,
      targetNodeId: conn.targetNodeId,
      targetPort: conn.targetPort,
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

    setCanvasOffset({ x: 0, y: 0 });
    setZoomLevel(1);
    resetHistoryForNewWorkflow(newNodes, newConnections);
    toast({ title: 'Workflow Generated', description: 'New workflow created by AI.' });
  }, [mapAiWorkflowToInternal, toast, resetHistoryForNewWorkflow]);
  
  const handleChatSubmit = useCallback(async (messageContent: string, isSystemMessage: boolean = false) => {
    if (!messageContent.trim()) {
      toast({
        title: 'Message is empty',
        description: 'Please enter a message to send to the AI.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      message: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    const messagesForAIContext = chatHistory.slice(-CHAT_CONTEXT_MESSAGE_LIMIT);
    const historyForAI = messagesForAIContext.map(ch => ({ sender: ch.sender, message: ch.message }));
    
    if (!isSystemMessage) {
        setChatHistory(prev => [...prev, userMessage]);
    }
    
    setIsChatLoading(true);
    
    try {
      let workflowContextForAI = "User is on the main workflow canvas.";
      if (selectedNodeId) {
        const node = nodes.find(n => n.id === selectedNodeId);
        if (node) workflowContextForAI = `User has node "${node.name}" (Type: ${node.type}) selected. Description: ${node.description || 'N/A'}. Config (first 100 chars): ${JSON.stringify(node.config).substring(0,100)}`;
      } else if (nodes.length > 0) {
        workflowContextForAI = `Current workflow has ${nodes.length} nodes and ${connections.length} connections. Overall goal might be inferred from existing nodes if any.`;
      }
      
      const currentWorkflowNodesForAI = nodes.map(n => ({
        id: n.id,
        type: n.type,
        name: n.name,
        description: n.description,
        config: n.config, 
        inputHandles: n.inputHandles,
        outputHandles: n.outputHandles,
        aiExplanation: n.aiExplanation
      }));

      const currentWorkflowConnectionsForAI = connections.map(c => ({
        sourceNodeId: c.sourceNodeId,
        sourceHandle: c.sourceHandle,
        targetNodeId: c.targetNodeId,
        targetHandle: c.targetHandle,
      }));

      const chatResult = await assistantChat({ 
        userMessage: messageContent, 
        workflowContext: workflowContextForAI, 
        chatHistory: historyForAI,
        currentWorkflowNodes: currentWorkflowNodesForAI,
        currentWorkflowConnections: currentWorkflowConnectionsForAI
      });
      
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        message: chatResult.aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory(prev => [...prev, aiMessage]);

      if (chatResult.isWorkflowGenerationRequest && chatResult.workflowGenerationPrompt) {
        setIsLoadingAiWorkflow(true); 
        try {
          const generatedWorkflow = await generateWorkflow({ prompt: chatResult.workflowGenerationPrompt });
          handleAiPromptSubmit(generatedWorkflow);
          const successMessage: ChatMessage = {
            id: crypto.randomUUID(),
            sender: 'ai',
            message: "Workflow generated and placed on the canvas!",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setChatHistory(prev => [...prev, successMessage]);
        } catch (genError: any) {
          console.error('Error generating workflow from chat command:', genError);
          const genFailMessage: ChatMessage = {
            id: crypto.randomUUID(),
            sender: 'ai',
            message: `Sorry, I tried to generate the workflow, but encountered an error: ${genError.message}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setChatHistory(prev => [...prev, genFailMessage]);
        } finally {
          setIsLoadingAiWorkflow(false);
        }
      }
    } catch (error: any) { 
      console.error('AI chat error:', error);
      const errorMessageText = error.message || 'Sorry, I encountered an error communicating with the AI.';
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        message: errorMessageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false); 
    }
  }, [chatHistory, nodes, connections, selectedNodeId, handleAiPromptSubmit, toast]);


  const handleRunWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      await handleChatSubmit("The user tried to run an empty workflow. Please ask them to add some nodes or describe what they want to build.", true);
      return;
    }
  
    const validationErrors: string[] = [];
    nodes.forEach(node => {
      const nodeTypeConfig = AVAILABLE_NODES_CONFIG.find(nt => nt.type === node.type);
      if (!isConfigComplete(node, nodeTypeConfig)) {
        validationErrors.push(`- Node "${node.name || node.id}" (Type: ${node.type}) has incomplete or invalid configuration.`);
      }
      if (nodeTypeConfig?.category !== 'trigger') {
        const unconnectedInputs = nodeTypeConfig?.inputHandles?.filter(
          handleId => !connections.some(conn => conn.targetNodeId === node.id && conn.targetHandle === handleId)
        ) ?? [];
  
        if (unconnectedInputs.length > 0) {
          validationErrors.push(`- Node "${node.name || node.id}" (Type: ${node.type}) has required input(s) that are not connected: ${unconnectedInputs.join(', ')}.`);
        }
      }
    });
  
    if (validationErrors.length > 0) {
      const errorSummary = validationErrors.join('\n');
      const systemMessage = `The workflow failed pre-run validation. Please analyze these issues and help the user fix them:\n\nValidation Errors:\n${errorSummary}`;
      await handleChatSubmit(systemMessage, true);
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
  
      const updatedNodes = nodes.map(existingNode => {
        const executedNodeData = finalWorkflowData[existingNode.id];
        if (executedNodeData && executedNodeData.lastExecutionStatus) {
          return { ...existingNode, lastExecutionStatus: executedNodeData.lastExecutionStatus };
        }
        return { ...existingNode, lastExecutionStatus: 'skipped' as WorkflowNode['lastExecutionStatus'] };
      });
      setNodes(updatedNodes);
      saveHistory();
      
      const hasErrors = Object.values(finalWorkflowData).some((nodeOutput: any) => nodeOutput.lastExecutionStatus === 'error');
      let systemMessage = '';
      if(hasErrors) {
        const errorDetails = Object.entries(finalWorkflowData)
          .filter(([_, value]) => (value as any).lastExecutionStatus === 'error')
          .map(([key, value]) => {
            const node = nodes.find(n => n.id === key);
            return `- Node '${node?.name || key}' (ID: ${key}, Type: ${node?.type}): ${(value as any).error_message || 'An unknown error occurred.'}`;
          })
          .join('\n');
        systemMessage = `The workflow has just been executed. Result: FAILED.\n\nPlease analyze the following execution details and help me fix the workflow.\n\nExecution Errors:\n${errorDetails}`;
      } else {
        systemMessage = `I just ran the workflow and it completed successfully! Can you confirm everything looks good?`;
      }
      
      await handleChatSubmit(systemMessage, true);
  
  
    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred during workflow execution.';
      setExecutionLogs(prevLogs => [
        ...prevLogs,
        { timestamp: new Date().toLocaleTimeString(), message: `Execution Error: ${errorMessage}`, type: 'error' },
      ]);
      setNodes(prevNodes => prevNodes.map(n => ({ ...n, lastExecutionStatus: 'error' as WorkflowNode['lastExecutionStatus'] })));
      saveHistory();
      await handleChatSubmit(`The workflow execution failed with a critical error: ${errorMessage}. Please help me understand why.`, true);
    } finally {
      setIsWorkflowRunning(false);
    }
  }, [nodes, connections, isSimulationMode, saveHistory, handleChatSubmit]);

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

      const inputHandleAlreadyConnected = connections.some(
        conn => conn.targetNodeId === endNodeId && conn.targetHandle === endHandleId
      );

      if (inputHandleAlreadyConnected) {
        toast({
          title: 'Input Already Connected',
          description: `Input handle "${endHandleId}" on node "${targetNode.name}" is already connected. An input can only have one incoming connection.`,
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
  }, [isConnecting, connectionStartNodeId, connectionStartHandleId, nodes, connections, toast, saveHistory, handleCancelConnection]);

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

  const handleResetView = useCallback(() => {
    setCanvasOffset({ x: 0, y: 0 });
    setZoomLevel(1);
    saveHistory();
    toast({ title: "View Reset", description: "Canvas zoom and pan have been reset."});
  }, [saveHistory, toast]);

  useEffect(() => {
    handleLoadWorkflow(false);
    const savedAssistantVisibility = localStorage.getItem(ASSISTANT_PANEL_VISIBLE_KEY);
    if (savedAssistantVisibility !== null) {
      setIsAssistantVisible(JSON.parse(savedAssistantVisibility));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isInputField = (target: EventTarget | null): boolean => {
      return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && target.isContentEditable);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInputField(document.activeElement) || showDeleteNodeConfirmDialog || showClearCanvasConfirmDialog || showSaveAsDialog) return;

      const isCtrlOrMeta = event.ctrlKey || event.metaKey;

      if (isCtrlOrMeta && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (event.shiftKey) {
            handleSaveWorkflowAs();
        } else {
            handleManualSaveWorkflow();
        }
        return;
      }
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
        if (showSaveAsDialog) setShowSaveAsDialog(false);
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
    showDeleteNodeConfirmDialog, showClearCanvasConfirmDialog, showSaveAsDialog, handleCancelConnection,
    handleZoomIn, handleZoomOut, handleSaveWorkflowAs
  ]);

  useEffect(() => {
    let isActive = true;

    const fetchSuggestionsLogic = async () => {
      if (selectedNodeId) {
        if (isActive) {
          if (initialCanvasSuggestion) setInitialCanvasSuggestion(null);
          if (isLoadingInitialSuggestion) setIsLoadingInitialSuggestion(false);
          setIsLoadingSuggestion(true);
        }
        try {
          const currentNode = nodes.find(n => n.id === selectedNodeId);
          if (!isActive || !currentNode) {
            if (isActive) setSuggestedNextNodeInfo(null);
            return;
          }
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
      } else {
        if (isActive) {
          setSuggestedNextNodeInfo(null);
          if(isLoadingSuggestion) setIsLoadingSuggestion(false);
        }

        const shouldFetchInitial =
          isAssistantVisible &&
          nodes.length === 0 &&
          !selectedConnectionId &&
          !workflowExplanation &&
          !initialCanvasSuggestion &&
          !isLoadingInitialSuggestion &&
          !initialSuggestionAttempted;

        if (shouldFetchInitial) {
          if (isActive) {
            setIsLoadingInitialSuggestion(true);
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
            if (isActive) setIsLoadingInitialSuggestion(false);
          }
        } else if (initialCanvasSuggestion && (nodes.length > 0 || selectedConnectionId || workflowExplanation)) {
          if (isActive) setInitialCanvasSuggestion(null);
        }
      }
    };

    if (isAssistantVisible) {
      fetchSuggestionsLogic();
    } else {
      if (isActive) {
        setInitialCanvasSuggestion(null);
        setSuggestedNextNodeInfo(null);
        if (isLoadingSuggestion) setIsLoadingSuggestion(false);
        if (isLoadingInitialSuggestion) setIsLoadingInitialSuggestion(false);
      }
    }

    return () => { isActive = false; };
  }, [
    isAssistantVisible,
    selectedNodeId,
    nodes,
    selectedConnectionId,
    workflowExplanation,
    initialCanvasSuggestion,
    isLoadingInitialSuggestion,
    initialSuggestionAttempted,
  ]);

  const addNodeToCanvas = useCallback((nodeType: AvailableNodeType, position: { x: number; y: number }) => {
    if (nodeType.isAdvanced && !isProOrTrial) {
      toast({
        title: 'Pro Feature',
        description: `Node type "${nodeType.name}" is a Pro feature. Please ${isLoggedIn ? 'upgrade your plan' : 'sign up or log in to start a trial'}.`,
        variant: 'default',
        duration: 5000,
      });
      return;
    }

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
  }, [saveHistory, isProOrTrial, toast, isLoggedIn]);

  const handleAddSuggestedNode = useCallback((suggestedNodeTypeString: string) => {
    const nodeTypeToAdd = AVAILABLE_NODES_CONFIG.find(n => n.type === suggestedNodeTypeString);
    if (!nodeTypeToAdd) {
      toast({ title: "Error", description: `Cannot add suggested node: Type "${suggestedNodeTypeString}" not found.`, variant: "destructive" });
      return;
    }

    if (nodeTypeToAdd.isAdvanced && !isProOrTrial) {
      toast({
        title: 'Pro Feature Suggested',
        description: `The AI suggested "${nodeTypeToAdd.name}", which is a Pro feature. Please ${isLoggedIn ? 'upgrade your plan' : 'sign up or log in to start a trial'} to use it.`,
        variant: 'default',
        duration: 6000,
      });
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
  }, [selectedNode, addNodeToCanvas, toast, nodes, isProOrTrial, isLoggedIn]);

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
    if (!event) return;
    const target = event.target;
    if (target instanceof HTMLElement) {
        if (target.closest('[data-delete-connection-button="true"]') || target.closest('[data-connection-click-target="true"]')) {
            return;
        }
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
    if (!isProOrTrial) {
      toast({
        title: 'Pro Feature',
        description: `Workflow explanation is a Pro feature. Please ${isLoggedIn ? 'upgrade your plan' : 'sign up or log in to start a trial'}.`,
        variant: 'default',
        duration: 5000,
      });
      return;
    }
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
  }, [nodes, connections, toast, isProOrTrial, isLoggedIn]);


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
    link.download = `kairo_workflow_${timestamp}.json`;
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

            resetHistoryForNewWorkflow(importedNodes, importedData.connections || []);

            toast({ title: 'Workflow Imported', description: 'Workflow loaded from file and set as current.' });
            localStorage.setItem(CURRENT_WORKFLOW_KEY, JSON.stringify(importedData));
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
      {isLoadingAiWorkflow && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-foreground">
            AI is generating your workflow...
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
          onSaveWorkflowAs={handleSaveWorkflowAs}
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
          onResetView={handleResetView}
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
             {selectedNode && selectedNodeType && !isConnecting && !workflowExplanation && !selectedConnectionId ? (
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
              ) : (
                <AIWorkflowAssistantPanel
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
                  onRunWorkflow={handleRunWorkflow}
                  onToggleSimulationMode={handleToggleSimulationMode}
                  isSimulationMode={isSimulationMode}
                  chatHistory={chatHistory}
                  isChatLoading={isChatLoading}
                  onChatSubmit={handleChatSubmit}
                  onClearChat={() => setChatHistory([])}
                  isExplainingWorkflow={isExplainingWorkflow}
                  workflowExplanation={workflowExplanation}
                  onClearExplanation={() => {
                      setWorkflowExplanation(null);
                  }}
                  initialCanvasSuggestion={initialCanvasSuggestion}
                  isLoadingSuggestion={isLoadingInitialSuggestion || isLoadingSuggestion}
                  onAddSuggestedNode={handleAddSuggestedNode}
                />
              )}
          </aside>
        )}
      </div>
      <AlertDialog open={showDeleteNodeConfirmDialog} onOpenChange={setShowDeleteNodeConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Node?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this node and its connections? This action can be undone using the Undo feature (Ctrl+Z).
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
              Are you sure you want to delete all nodes and connections? This action can be undone using the Undo feature (Ctrl+Z).
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
      <Dialog open={showSaveAsDialog} onOpenChange={setShowSaveAsDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Workflow As</DialogTitle>
            <DialogDescription>
              Enter a name for your workflow. This will save the current state of the canvas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="save-as-name" className="text-right">
                Name
              </Label>
              <Input
                id="save-as-name"
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., My Awesome Automation"
                onKeyDown={(e) => { if (e.key === 'Enter') confirmSaveAsWorkflow(); }}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={confirmSaveAsWorkflow}>
                <SaveAll className="mr-2 h-4 w-4" /> Save Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
