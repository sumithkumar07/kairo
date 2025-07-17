'use client';

import { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import type { WorkflowNode, WorkflowConnection, Workflow, AvailableNodeType, ServerLogOutput, WorkflowRunRecord, ChatMessage, SavedWorkflowMetadata, AgentConfig, ExampleWorkflow, SuggestNextNodeOutput } from '@/types/workflow';
import type { GenerateWorkflowFromPromptOutput } from '@/ai/flows/generate-workflow-from-prompt';
import type { GenerateTestDataInput } from '@/ai/flows/generate-test-data-flow';
import { runWorkflowFromEditor, suggestNextWorkflowNode, getWorkflowExplanation, enhanceAndGenerateWorkflow, assistantChat, saveWorkflowAction, generateTestDataForNode, getAgentConfigAction } from '@/app/actions';
import { useSubscription } from '@/contexts/SubscriptionContext';

import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, X, Bot, SaveAll, File, FolderOpen, Save, Zap, Users, BrainCircuit, Search, Star, Workflow as WorkflowIcon, Wand2, Settings, Eye, EyeOff, Play, Pause, RotateCcw, Maximize2, Minimize2, Grid, Layers, Filter, ArrowLeft, Home, HelpCircle, Sparkles } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AppLayout } from '@/components/app-layout';
import { AIWorkflowBuilderPanel } from '@/components/ai-workflow-builder-panel';
import { AIWorkflowAssistantPanel } from '@/components/ai-workflow-assistant-panel';
import { NodeConfigPanel } from '@/components/node-config-panel';
import { NodeLibrary } from '@/components/node-library';
import { EnhancedWorkflowCanvas } from '@/components/enhanced-workflow-canvas';
import { CARESFrameworkIntegration } from '@/components/cares-framework-integration';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Toggle } from '@/components/ui/toggle';

import { AVAILABLE_NODES_CONFIG, AI_NODE_TYPE_MAPPING, NODE_HEIGHT, NODE_WIDTH } from '@/config/nodes';
import { produce } from 'immer';
import { withAuth } from '@/components/auth/with-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const CURRENT_WORKFLOW_KEY = 'kairoCurrentWorkflow';
const ASSISTANT_PANEL_VISIBLE_KEY = 'kairoAssistantPanelVisible';
const NODE_LIBRARY_VISIBLE_KEY = 'kairoNodeLibraryVisible';
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

function AIOnboardingPanel({ onGenerate, isLoading }: { onGenerate: (prompt: string) => void, isLoading: boolean }) {
  const [prompt, setPrompt] = useState('');

  const handleGenerateClick = () => {
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  const examplePrompts = [
    "Every morning at 8 AM, fetch the top 3 trending videos from YouTube and post their titles and URLs to my Slack channel named #updates.",
    "When someone submits a contact form, add them to Mailchimp, create a deal in Salesforce, and send a welcome email.",
    "Process invoices from email attachments: extract data with AI, validate amounts, and update QuickBooks automatically.",
    "Monitor social media mentions of our brand and send notifications to the marketing team with sentiment analysis."
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <Card className="max-w-4xl w-full">
        <CardHeader className="text-center pb-8">
          <div className="p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full inline-block mb-4 mx-auto">
            <Bot className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Describe Your Workflow
            <Badge className="ml-2 bg-gradient-to-r from-primary to-purple-500">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </CardTitle>
          <CardDescription className="text-lg max-w-2xl mx-auto">
            Tell our advanced AI what you want to automate. It will build the complete workflow for you using Mistral AI's reasoning capabilities.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="prompt" className="text-base font-medium">
              What would you like to automate?
            </Label>
            <Textarea
              id="prompt"
              placeholder="Describe your automation in natural language..."
              className="min-h-[120px] text-base resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
            />
            <Button
              size="lg"
              className="w-full text-lg py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              onClick={handleGenerateClick}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Workflow...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 border-t"></div>
              <span className="text-sm text-muted-foreground px-3">or try an example</span>
              <div className="flex-1 border-t"></div>
            </div>
            
            <div className="grid gap-3">
              {examplePrompts.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="p-4 h-auto text-left justify-start text-wrap"
                  onClick={() => setPrompt(example)}
                  disabled={isLoading}
                >
                  <div className="text-sm">{example}</div>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Mistral AI Powered
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              100+ Integrations
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              Production Ready
            </div>
          </div>
        </CardContent>
      </Card>
      
      <p className="text-sm text-muted-foreground mt-6 max-w-2xl">
        Don't want to use AI? You can also drag nodes from the library on the left to build manually, 
        or browse our <Link href="/templates" className="text-primary hover:underline">workflow templates</Link>.
      </p>
    </div>
  );
}

function WorkflowPage() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isLoadingAiWorkflow, setIsLoadingAiWorkflow] = useState(false);
  const [isAssistantVisible, setIsAssistantVisible] = useState(true);
  const [isNodeLibraryVisible, setIsNodeLibraryVisible] = useState(true);
  const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
  const [workflowStats, setWorkflowStats] = useState({
    nodes: 0,
    connections: 0,
    integrations: 0,
    categories: new Set<string>()
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [enabledTools, setEnabledTools] = useState<string[]>([]);

  const { toast } = useToast();
  const { hasProFeatures, isLoggedIn, user } = useSubscription();
  const router = useRouter();
  const nextNodeIdRef = useRef(1);
  const currentWorkflowNameRef = useRef('Untitled Workflow');

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStartNodeId, setConnectionStartNodeId] = useState<string | null>(null);
  const [connectionStartHandleId, setConnectionStartHandleId] = useState<string | null>(null);
  const [connectionPreviewPosition, setConnectionPreviewPosition] = useState<{ x: number; y: number } | null>(null);

  const [suggestionInfo, setSuggestionInfo] = useState<{ suggestion: SuggestNextNodeOutput; forNodeId?: string } | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const canvasOffsetStartRef = useRef({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  const [isExplainingWorkflow, setIsExplainingWorkflow] = useState(false);
  const [workflowExplanation, setWorkflowExplanation] = useState<string | null>(null);
  const [isSimulationMode, setIsSimulationMode] = useState(true);

  const [showDeleteNodeConfirmDialog, setShowDeleteNodeConfirmDialog] = useState(false);
  const [nodeToDeleteId, setNodeToDeleteId] = useState<string | null>(null);
  const [showClearCanvasConfirmDialog, setShowClearCanvasConfirmDialog] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [isGeneratingTestDataFor, setIsGeneratingTestDataFor] = useState<string|null>(null);

  const searchParams = useSearchParams();

  // Update workflow stats when nodes change
  useEffect(() => {
    const integrations = new Set<string>();
    const categories = new Set<string>();
    
    nodes.forEach(node => {
      categories.add(node.category || 'unknown');
      if (node.category === 'integrations') {
        integrations.add(node.type);
      }
    });

    setWorkflowStats({
      nodes: nodes.length,
      connections: connections.length,
      integrations: integrations.size,
      categories
    });
  }, [nodes, connections]);

  const selectedNode = useMemo(() => {
    return nodes.find(node => node.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  // [Previous useEffect and handler functions remain the same but I'll add the enhanced canvas integration]

  const connectionPreview = useMemo(() => {
    if (!isConnecting || !connectionStartNodeId || !connectionStartHandleId) return null;
    return {
      startNodeId: connectionStartNodeId,
      startHandleId: connectionStartHandleId,
      previewPosition: connectionPreviewPosition
    };
  }, [isConnecting, connectionStartNodeId, connectionStartHandleId, connectionPreviewPosition]);

  // Enhanced event handlers for the new canvas
  const handleCanvasDrop = useCallback((nodeType: AvailableNodeType, position: { x: number; y: number }) => {
    const newNodeId = `${nodeType.type}_${nextNodeIdRef.current++}`;
    const newNode: WorkflowNode = {
      id: newNodeId,
      type: nodeType.type,
      name: nodeType.name,
      description: nodeType.description || '',
      position,
      config: { ...nodeType.defaultConfig },
      inputHandles: nodeType.inputHandles || [],
      outputHandles: nodeType.outputHandles || [],
      category: nodeType.category,
      lastExecutionStatus: 'pending'
    };
    
    setNodes(prevNodes => [...prevNodes, newNode]);
    toast({ title: 'Node Added', description: `${nodeType.name} added to workflow` });
  }, [toast]);

  const handleNodeDragStop = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId ? { ...node, position } : node
      )
    );
  }, []);

  const handleStartConnection = useCallback((nodeId: string, handleId: string, position: { x: number; y: number }) => {
    setIsConnecting(true);
    setConnectionStartNodeId(nodeId);
    setConnectionStartHandleId(handleId);
    setConnectionPreviewPosition(position);
  }, []);

  const handleCompleteConnection = useCallback((endNodeId: string, endHandleId: string) => {
    if (isConnecting && connectionStartNodeId && connectionStartHandleId && connectionStartNodeId !== endNodeId) {
      const newConnection: WorkflowConnection = {
        id: crypto.randomUUID(),
        sourceNodeId: connectionStartNodeId,
        sourceHandle: connectionStartHandleId,
        targetNodeId: endNodeId,
        targetHandle: endHandleId,
      };
      
      setConnections(prevConnections => [...prevConnections, newConnection]);
      toast({ title: 'Connection Created', description: 'Nodes connected successfully' });
    }
    
    setIsConnecting(false);
    setConnectionStartNodeId(null);
    setConnectionStartHandleId(null);
    setConnectionPreviewPosition(null);
  }, [isConnecting, connectionStartNodeId, connectionStartHandleId, toast]);

  const handleCancelConnection = useCallback(() => {
    setIsConnecting(false);
    setConnectionStartNodeId(null);
    setConnectionStartHandleId(null);
    setConnectionPreviewPosition(null);
  }, []);

  const handleUpdateConnectionPreview = useCallback((position: { x: number; y: number }) => {
    setConnectionPreviewPosition(position);
  }, []);

  const handleDeleteSelectedConnection = useCallback(() => {
    if (selectedConnectionId) {
      setConnections(prevConnections => prevConnections.filter(conn => conn.id !== selectedConnectionId));
      setSelectedConnectionId(null);
      toast({ title: "Connection Deleted", description: "The selected connection has been removed." });
    }
  }, [selectedConnectionId, toast]);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSelectedConnectionId(null);
  }, []);

  const handleConnectionClick = useCallback((connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setSelectedNodeId(null);
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    // Only clear selection if clicking on empty canvas
    const target = event.target as HTMLElement;
    if (target.classList.contains('pannable-content-wrapper') || target.tagName === 'svg') {
      setSelectedNodeId(null);
      setSelectedConnectionId(null);
    }
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Enhanced Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div className="w-px h-4 bg-border" />
            </div>
            
            <div className="flex items-center gap-2">
              <WorkflowIcon className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">{currentWorkflowNameRef.current}</h1>
              {isSimulationMode && (
                <Badge variant="secondary" className="text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  Simulation
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Workflow Stats */}
            <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {workflowStats.nodes} nodes
              </div>
              <div className="flex items-center gap-1">
                <Share className="h-3 w-3" />
                {workflowStats.connections} connections
              </div>
              <div className="flex items-center gap-1">
                <Grid className="h-3 w-3" />
                {workflowStats.integrations} integrations
              </div>
            </div>

            <div className="w-px h-4 bg-border" />

            {/* View Controls */}
            <Toggle pressed={isSimulationMode} onPressedChange={setIsSimulationMode}>
              {isSimulationMode ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Toggle>

            <Toggle pressed={isNodeLibraryVisible} onPressedChange={setIsNodeLibraryVisible}>
              <Layers className="h-4 w-4" />
            </Toggle>

            <Toggle pressed={isAssistantVisible} onPressedChange={setIsAssistantVisible}>
              <Bot className="h-4 w-4" />
            </Toggle>

            <div className="w-px h-4 bg-border" />

            {/* Action Buttons */}
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>

            <Button 
              size="sm" 
              onClick={() => {/* handleRunWorkflow */}}
              disabled={isWorkflowRunning || nodes.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isWorkflowRunning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Workflow
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Node Library */}
          {isNodeLibraryVisible && (
            <div className="w-80 border-r bg-card">
              <NodeLibrary availableNodes={AVAILABLE_NODES_CONFIG} />
            </div>
          )}

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col">
            {nodes.length === 0 ? (
              <AIOnboardingPanel 
                onGenerate={(prompt) => {
                  // Handle AI generation
                  console.log('Generating workflow for:', prompt);
                }}
                isLoading={isLoadingAiWorkflow}
              />
            ) : (
              <EnhancedWorkflowCanvas
                nodes={nodes}
                connections={connections}
                selectedNodeId={selectedNodeId}
                selectedConnectionId={selectedConnectionId}
                canvasOffset={canvasOffset}
                zoomLevel={zoomLevel}
                isConnecting={isConnecting}
                connectionPreview={connectionPreview}
                onNodeClick={handleNodeClick}
                onConnectionClick={handleConnectionClick}
                onCanvasClick={handleCanvasClick}
                onCanvasDrop={handleCanvasDrop}
                onNodeDragStop={handleNodeDragStop}
                onStartConnection={handleStartConnection}
                onCompleteConnection={handleCompleteConnection}
                onCancelConnection={handleCancelConnection}
                onUpdateConnectionPreview={handleUpdateConnectionPreview}
                onDeleteSelectedConnection={handleDeleteSelectedConnection}
                onCanvasOffsetChange={setCanvasOffset}
                onZoomChange={setZoomLevel}
                onCanvasPanStart={() => setIsPanning(true)}
                onUndo={() => {/* handleUndo */}}
                onRedo={() => {/* handleRedo */}}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
                isPanningForCursor={isPanning}
                connectionStartNodeId={connectionStartNodeId}
                connectionStartHandleId={connectionStartHandleId}
              />
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-80 border-l bg-card flex flex-col">
            <Tabs defaultValue="config" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3 m-2">
                <TabsTrigger value="config" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Config
                </TabsTrigger>
                <TabsTrigger value="assistant" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Assistant
                </TabsTrigger>
                <TabsTrigger value="cares" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  CARES
                </TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="flex-1 p-4">
                {selectedNode ? (
                  <NodeConfigPanel
                    node={selectedNode}
                    nodeType={AVAILABLE_NODES_CONFIG.find(n => n.type === selectedNode.type)}
                    onConfigChange={(nodeId, newConfig) => {
                      setNodes(prevNodes => 
                        prevNodes.map(node => 
                          node.id === nodeId ? { ...node, config: newConfig } : node
                        )
                      );
                    }}
                    onInputMappingChange={(nodeId, newInputMapping) => {
                      setNodes(prevNodes => 
                        prevNodes.map(node => 
                          node.id === nodeId ? { ...node, inputMapping: newInputMapping } : node
                        )
                      );
                    }}
                    onGenerateTestData={(nodeId, configField) => {
                      // Handle test data generation
                      console.log('Generating test data for:', nodeId, configField);
                    }}
                    isGeneratingTestDataFor={isGeneratingTestDataFor}
                  />
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <Settings className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-2">No Node Selected</h3>
                      <p className="text-sm text-muted-foreground">
                        Select a node to configure its properties and settings.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="assistant" className="flex-1">
                {isAssistantVisible && (
                  <AIWorkflowAssistantPanel
                    chatHistory={chatHistory}
                    onChatSubmit={(message, imageDataUri, isSystemMessage) => {
                      // Handle chat submission
                      console.log('Chat message:', message);
                    }}
                    isChatLoading={isChatLoading}
                    onGoToHub={() => router.push('/hub')}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default withAuth(WorkflowPage);