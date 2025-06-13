
'use client';

import { useCallback, useState, useRef } from 'react';
import type { WorkflowNode, WorkflowConnection, Workflow, AvailableNodeType } from '@/types/workflow';
import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';

import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

import { AIPromptBar } from '@/components/ai-prompt-bar';
import { NodeLibrary } from '@/components/node-library';
import { WorkflowCanvas } from '@/components/workflow-canvas';
import { NodeConfigPanel } from '@/components/node-config-panel';
import { ExecutionLogPanel } from '@/components/execution-log-panel';

import { AVAILABLE_NODES_CONFIG, AI_NODE_TYPE_MAPPING, NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';
import { produce } from 'immer'; 

export default function FlowAIPage() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  
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
      id: `conn_${conn.source}_${conn.target}_${index}_${Date.now()}`, // Ensure unique ID
      sourceNodeId: conn.source, 
      targetNodeId: conn.target,
      sourceHandle: conn.sourcePort,
      targetHandle: conn.targetPort,
    }));

    return { nodes: newNodes, connections: newConnections };
  }, []);


  const handleAiPromptSubmit = useCallback(async (aiOutput: GenerateWorkflowFromPromptOutput) => {
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
  }, [mapAiWorkflowToInternal, toast]);

  const addNodeToCanvas = useCallback((nodeType: AvailableNodeType, position: { x: number; y: number }) => {
    const newNodeId = `${nodeType.type}_${nextNodeIdRef.current++}`;
    const newNode: WorkflowNode = {
      id: newNodeId,
      type: nodeType.type,
      name: nodeType.name,
      description: '',
      position,
      config: { ...nodeType.defaultConfig },
      inputHandles: nodeType.inputHandles,
      outputHandles: nodeType.outputHandles,
      aiExplanation: `Manually added ${nodeType.name} node.`, // Default explanation for manually added nodes
    };
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

  const handleNodeConfigChange = useCallback((nodeId: string, newConfig: Record<string, any>) => {
    setNodes((prevNodes) =>
      produce(prevNodes, draft => {
        const node = draft.find(n => n.id === nodeId);
        if (node) node.config = newConfig;
      })
    );
  }, []);
  
  const handleNodeNameChange = useCallback((nodeId: string, newName: string) => {
    setNodes((prevNodes) =>
      produce(prevNodes, draft => {
        const node = draft.find(n => n.id === nodeId);
        if (node) node.name = newName;
      })
    );
  }, []);

  const handleNodeDescriptionChange = useCallback((nodeId: string, newDescription: string) => {
    setNodes((prevNodes) =>
      produce(prevNodes, draft => {
        const node = draft.find(n => n.id === nodeId);
        if (node) node.description = newDescription;
      })
    );
  }, []);
  
  // Placeholder for future:
  // const handleNodeAiExplanationChange = useCallback((nodeId: string, newExplanation: string) => {
  //   setNodes((prevNodes) =>
  //     produce(prevNodes, draft => {
  //       const node = draft.find(n => n.id === nodeId);
  //       if (node) node.aiExplanation = newExplanation;
  //     })
  //   );
  // }, []);


  const selectedNodeFull = selectedNodeId ? nodes.find(n => n.id === selectedNodeId) : null;
  const selectedNodeTypeConfig = selectedNodeFull ? 
    AVAILABLE_NODES_CONFIG.find(nt => nt.type === selectedNodeFull.type) : undefined;

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      <header className="p-4 border-b flex justify-between items-center bg-primary text-primary-foreground shadow-lg shrink-0">
        <h1 className="text-xl font-bold font-headline">FlowAI</h1>
      </header>

      <AIPromptBar
        onWorkflowGenerated={handleAiPromptSubmit}
        setIsLoadingGlobal={setIsLoadingAi}
      />
      
      {isLoadingAi && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">AI is generating your workflow...</p>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <NodeLibrary
          availableNodes={AVAILABLE_NODES_CONFIG}
        />

        <WorkflowCanvas
          nodes={nodes}
          connections={connections}
          selectedNodeId={selectedNodeId}
          onNodeDragStop={updateNodePosition}
          onNodeClick={setSelectedNodeId}
          onCanvasDrop={addNodeToCanvas}
        />

        <aside className="w-96 border-l bg-card shadow-md flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 flex-grow min-h-0"> {/* min-h-0 allows scrollarea to shrink properly */}
            {selectedNodeFull && (
              <NodeConfigPanel
                node={selectedNodeFull}
                nodeType={selectedNodeTypeConfig}
                onConfigChange={handleNodeConfigChange}
                onNodeNameChange={handleNodeNameChange}
                onNodeDescriptionChange={handleNodeDescriptionChange}
                // onNodeAiExplanationChange={handleNodeAiExplanationChange} // For future use
              />
            )}
            {!selectedNodeFull && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground">
                  Select a node on the canvas to configure its properties.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Or, use the AI prompt to generate a new workflow.
                </p>
              </div>
            )}
          </div>
          <div className="p-4 border-t mt-auto shrink-0"> {/* mt-auto pushes this to bottom if content above is short */}
             <ExecutionLogPanel logs={[]} onRunWorkflow={() => {
                toast({ title: "Mock Run", description: "Workflow execution is not yet implemented." });
                console.log("Current workflow:", { nodes, connections });
             }} />
          </div>
        </aside>
      </div>
    </div>
  );
}
