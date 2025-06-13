
'use client';

import { useCallback, useState, useRef } from 'react';
import type { WorkflowNode, WorkflowConnection, Workflow, AvailableNodeType, LogEntry, ServerLogOutput } from '@/types/workflow';
import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';
// import { executeWorkflow } from '@/app/actions'; // We'll re-add execution later

import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

import { NodeLibrary } from '@/components/node-library';
import { AIWorkflowBuilderPanel } from '@/components/ai-workflow-builder-panel';
import { AIWorkflowAssistantPanel } from '@/components/ai-workflow-assistant-panel';

import { AVAILABLE_NODES_CONFIG, AI_NODE_TYPE_MAPPING, NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';
import { produce } from 'immer';

export default function FlowAIPage() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isAssistantVisible, setIsAssistantVisible] = useState(true);
  // const [executionLogs, setExecutionLogs] = useState<LogEntry[]>([]); // For later re-integration
  // const [isWorkflowRunning, setIsWorkflowRunning] = useState(false); // For later re-integration
  
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
        aiExplanation: aiNode.aiExplanation || '',
      };
    });
    nextNodeIdRef.current = maxId + 1;

    const newConnections: WorkflowConnection[] = aiWorkflow.connections.map((conn, index) => ({
      id: `conn_${conn.source}_${conn.target}_${index}_${Date.now()}`,
      sourceNodeId: conn.source, 
      targetNodeId: conn.target,
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
    // setExecutionLogs([]); // For later
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
      category: nodeType.category, // Ensure category is passed if needed by node item
    } as WorkflowNode; // Cast if category is not on WorkflowNode type yet
    setNodes((prevNodes) => produce(prevNodes, draft => {
      draft.push(newNode);
    }));
    setSelectedNodeId(newNodeId);
  }, []);

  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes((prevNodes) =>
      produce(prevNodes, draft => {
        const node = draft.find(n => n.id === nodeId);
        if (node) node.position = position;
      })
    );
  }, []);

  // Node config, name, description change handlers - will be used when config panel is re-integrated
  // const handleNodeConfigChange = useCallback((nodeId: string, newConfig: Record<string, any>) => {/* ... */}, []);
  // const handleNodeNameChange = useCallback((nodeId: string, newName: string) => {/* ... */}, []);
  // const handleNodeDescriptionChange = useCallback((nodeId: string, newDescription: string) => {/* ... */}, []);
  // const handleRunWorkflow = useCallback(async () => {/* ... */}, [nodes, connections, toast]);
  
  const toggleAssistantPanel = () => {
    setIsAssistantVisible(prev => !prev);
  };

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
          onNodeClick={setSelectedNodeId}
          onNodeDragStop={updateNodePosition}
          onCanvasDrop={addNodeToCanvas}
          onToggleAssistant={toggleAssistantPanel}
          isAssistantVisible={isAssistantVisible}
        />
        {isAssistantVisible && (
          <AIWorkflowAssistantPanel
            onWorkflowGenerated={handleAiPromptSubmit}
            setIsLoadingGlobal={setIsLoadingAi}
          />
        )}
      </div>
    </div>
  );
}
