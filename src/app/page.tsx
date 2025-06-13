
'use client';

import { useCallback, useState, useRef, useMemo } from 'react';
import type { WorkflowNode, WorkflowConnection, Workflow, AvailableNodeType, LogEntry, ServerLogOutput } from '@/types/workflow';
import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';
import { executeWorkflow } from '@/app/actions'; 

import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

import { NodeLibrary } from '@/components/node-library';
import { AIWorkflowBuilderPanel } from '@/components/ai-workflow-builder-panel';
import { AIWorkflowAssistantPanel } from '@/components/ai-workflow-assistant-panel';
import { NodeConfigPanel } from '@/components/node-config-panel';
import { ExecutionLogPanel } from '@/components/execution-log-panel';


import { AVAILABLE_NODES_CONFIG, AI_NODE_TYPE_MAPPING, NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';
import { produce } from 'immer';

export default function FlowAIPage() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isAssistantVisible, setIsAssistantVisible] = useState(true);
  const [executionLogs, setExecutionLogs] = useState<LogEntry[]>([]);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  
  const { toast } = useToast();
  const nextNodeIdRef = useRef(1);

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

    const newConnections: WorkflowConnection[] = aiWorkflow.connections.map((conn, index) => ({
      id: `conn_${conn.sourceNodeId}_${conn.targetNodeId}_${index}_${Date.now()}`,
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
    setExecutionLogs([]); 
    // Automatically hide assistant and select nothing to show canvas if workflow generated
    // setIsAssistantVisible(true); // Keep assistant panel visible by default or let user toggle
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
    setIsAssistantVisible(true); // Ensure right panel is visible to show config
  }, []);

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
        if (node) {
          node.config = newConfig;
        }
      })
    );
  }, []);

  const handleNodeNameChange = useCallback((nodeId: string, newName: string) => {
    setNodes(prevNodes => 
      produce(prevNodes, draft => {
        const node = draft.find(n => n.id === nodeId);
        if (node) {
          node.name = newName;
        }
      })
    );
  }, []);
  
  const handleNodeDescriptionChange = useCallback((nodeId: string, newDescription: string) => {
    setNodes(prevNodes => 
      produce(prevNodes, draft => {
        const node = draft.find(n => n.id === nodeId);
        if (node) {
          node.description = newDescription;
        }
      })
    );
  }, []);

  const handleRunWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      toast({
        title: 'Empty Workflow',
        description: 'Add some nodes to the canvas before running.',
        variant: 'destructive',
      });
      return;
    }

    setIsWorkflowRunning(true);
    setExecutionLogs([{ timestamp: new Date().toLocaleTimeString(), message: 'Workflow execution started...', type: 'info' }]);

    try {
      const serverLogs: ServerLogOutput[] = await executeWorkflow({ nodes, connections });
      const newLogs: LogEntry[] = serverLogs.map(log => ({
        ...log,
        timestamp: new Date().toLocaleTimeString(),
      }));
      setExecutionLogs(prevLogs => [...prevLogs, ...newLogs]);
      toast({
        title: 'Workflow Execution Attempted',
        description: 'Check logs for details. Some nodes may not be fully implemented.',
      });
    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred during workflow execution.';
      setExecutionLogs(prevLogs => [
        ...prevLogs,
        { timestamp: new Date().toLocaleTimeString(), message: `Execution Error: ${errorMessage}`, type: 'error' },
      ]);
      toast({
        title: 'Workflow Execution Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsWorkflowRunning(false);
    }
  }, [nodes, connections, toast]);
  
  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setIsAssistantVisible(true); // Ensure right panel is visible to show config
  };

  const toggleAssistantPanel = () => {
    setIsAssistantVisible(prev => {
      const newVisibility = !prev;
      // If we are hiding the assistant, and a node was selected, deselect the node.
      if (!newVisibility && selectedNodeId) {
        setSelectedNodeId(null);
      }
      return newVisibility;
    });
  };

  const selectedNode = useMemo(() => {
    return nodes.find(node => node.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const selectedNodeType = useMemo(() => {
    if (!selectedNode) return undefined;
    return AVAILABLE_NODES_CONFIG.find(nt => nt.type === selectedNode.type);
  }, [selectedNode]);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      {isLoadingAi && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-foreground">AI is generating your workflow...</p>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <NodeLibrary availableNodes={AVAILABLE_NODES_CONFIG} />
        <AIWorkflowBuilderPanel
          nodes={nodes}
          connections={connections}
          selectedNodeId={selectedNodeId}
          onNodeClick={handleNodeClick}
          onNodeDragStop={updateNodePosition}
          onCanvasDrop={addNodeToCanvas}
          onToggleAssistant={toggleAssistantPanel}
          isAssistantVisible={isAssistantVisible}
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
              />
            ) : (
              <AIWorkflowAssistantPanel
                onWorkflowGenerated={handleAiPromptSubmit}
                setIsLoadingGlobal={setIsLoadingAi}
              />
            )}
            <div className="mt-auto border-t">
              <ExecutionLogPanel 
                logs={executionLogs} 
                onRunWorkflow={handleRunWorkflow} 
                isWorkflowRunning={isWorkflowRunning} 
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

