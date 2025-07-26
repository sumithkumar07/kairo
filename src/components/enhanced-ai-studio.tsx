'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain,
  Bot,
  TrendingUp,
  Activity,
  Gauge,
  MessageSquare,
  History,
  Settings,
  Zap,
  Target,
  BarChart3,
  Clock,
  Users,
  Star,
  Award,
  FileText,
  Sparkles,
  Crown,
  Eye,
  Play,
  Pause,
  RefreshCw,
  Download,
  Filter,
  Search,
  Plus,
  ChevronRight,
  Lightbulb,
  Rocket,
  Shield
} from 'lucide-react';

// Enhanced AI Studio with Advanced Features
interface AIModelMetrics {
  id: string;
  name: string;
  type: 'workflow_generation' | 'text_analysis' | 'code_generation' | 'image_analysis';
  accuracy: number;
  latency: number;
  usage: number;
  cost: number;
  status: 'active' | 'training' | 'disabled';
  lastTrained: Date;
}

interface WorkflowGenerationHistory {
  id: string;
  prompt: string;
  generatedWorkflow: string;
  timestamp: Date;
  rating: number;
  status: 'success' | 'failed' | 'partial';
  executionTime: number;
  modelUsed: string;
  tokens: number;
}

interface TrainingSession {
  id: string;
  modelId: string;
  datasetSize: number;
  accuracy: number;
  loss: number;
  epochs: number;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
}

interface NaturalLanguageQuery {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
  confidence: number;
  executionTime: number;
  context: string;
}

const mockAIModels: AIModelMetrics[] = [
  {
    id: 'wf-gen-v2',
    name: 'Workflow Generator v2.0',
    type: 'workflow_generation',
    accuracy: 94.2,
    latency: 1.2,
    usage: 89,
    cost: 0.025,
    status: 'active',
    lastTrained: new Date(Date.now() - 86400000 * 2)
  },
  {
    id: 'code-analysis',
    name: 'Code Analyzer Pro',
    type: 'code_generation',
    accuracy: 87.6,
    latency: 0.8,
    usage: 67,
    cost: 0.018,
    status: 'active',
    lastTrained: new Date(Date.now() - 86400000 * 7)
  },
  {
    id: 'text-processor',
    name: 'Text Processing Engine',
    type: 'text_analysis',
    accuracy: 91.8,
    latency: 0.5,
    usage: 78,
    cost: 0.012,
    status: 'training',
    lastTrained: new Date(Date.now() - 86400000 * 1)
  }
];

const mockGenerationHistory: WorkflowGenerationHistory[] = [
  {
    id: '1',
    prompt: 'Create a workflow to process customer feedback and send notifications',
    generatedWorkflow: 'Email Processing + Sentiment Analysis + Slack Integration',
    timestamp: new Date(Date.now() - 3600000),
    rating: 4.8,
    status: 'success',
    executionTime: 2.3,
    modelUsed: 'Workflow Generator v2.0',
    tokens: 1240
  },
  {
    id: '2',
    prompt: 'Build automation for social media content scheduling',
    generatedWorkflow: 'Content Calendar + Multi-platform Publishing + Analytics',
    timestamp: new Date(Date.now() - 7200000),
    rating: 4.2,
    status: 'success',
    executionTime: 3.1,
    modelUsed: 'Workflow Generator v2.0',
    tokens: 1850
  },
  {
    id: '3',
    prompt: 'Automate invoice processing and approval workflow',
    generatedWorkflow: 'PDF Parser + Validation Rules + Approval Chain',
    timestamp: new Date(Date.now() - 10800000),
    rating: 3.9,
    status: 'partial',
    executionTime: 4.7,
    modelUsed: 'Workflow Generator v2.0',
    tokens: 2150
  }
];

const mockTrainingSessions: TrainingSession[] = [
  {
    id: 't1',
    modelId: 'wf-gen-v2',
    datasetSize: 15600,
    accuracy: 94.2,
    loss: 0.087,
    epochs: 50,
    status: 'completed',
    startTime: new Date(Date.now() - 172800000),
    endTime: new Date(Date.now() - 86400000)
  },
  {
    id: 't2',
    modelId: 'text-processor',
    datasetSize: 8900,
    accuracy: 91.8,
    loss: 0.124,
    epochs: 32,
    status: 'running',
    startTime: new Date(Date.now() - 3600000)
  }
];

export function EnhancedAIStudio() {
  const [activeTab, setActiveTab] = useState('performance');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [queryInput, setQueryInput] = useState('');
  const [isProcessingQuery, setIsProcessingQuery] = useState(false);
  const [queryHistory, setQueryHistory] = useState<NaturalLanguageQuery[]>([]);
  const [trainingData, setTrainingData] = useState<TrainingSession[]>(mockTrainingSessions);

  // AI Model Performance Metrics Tab
  const ModelPerformanceTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockAIModels.map((model) => (
          <Card key={model.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{model.name}</CardTitle>
                <Badge variant={model.status === 'active' ? 'default' : model.status === 'training' ? 'secondary' : 'destructive'}>
                  {model.status}
                </Badge>
              </div>
              <CardDescription className="text-xs">{model.type.replace('_', ' ')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Accuracy</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={model.accuracy} className="flex-1 h-2" />
                    <span className="font-medium">{model.accuracy}%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Usage</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={model.usage} className="flex-1 h-2" />
                    <span className="font-medium">{model.usage}%</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <Label className="text-muted-foreground">Latency</Label>
                  <p className="font-medium">{model.latency}s</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Cost/1K</Label>
                  <p className="font-medium">${model.cost}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Trained</Label>
                  <p className="font-medium">{Math.floor((Date.now() - model.lastTrained.getTime()) / 86400000)}d</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="h-3 w-3 mr-1" />
                  Configure
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Activity className="h-3 w-3 mr-1" />
                  Monitor
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Model Performance Trends
          </CardTitle>
          <CardDescription>Real-time performance metrics across all AI models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Performance charts visualization would go here</p>
              <p className="text-xs text-muted-foreground mt-1">Real-time accuracy, latency, and usage metrics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Natural Language Query Interface Tab
  const QueryInterfaceTab = () => {
    const handleSendQuery = async () => {
      if (!queryInput.trim() || isProcessingQuery) return;
      
      setIsProcessingQuery(true);
      const query = queryInput;
      setQueryInput('');
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newQuery: NaturalLanguageQuery = {
        id: crypto.randomUUID(),
        query,
        response: `Based on your query "${query}", I found 3 relevant workflows and 5 integration patterns that match your requirements. Here are the recommendations...`,
        timestamp: new Date(),
        confidence: 87.5,
        executionTime: 1.8,
        context: 'workflow_analysis'
      };
      
      setQueryHistory(prev => [newQuery, ...prev]);
      setIsProcessingQuery(false);
    };

    return (
      <div className="space-y-6">
        {/* Query Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Natural Language Query Interface
            </CardTitle>
            <CardDescription>Ask questions about your workflows, data, and automations in plain English</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask me anything about your workflows, performance metrics, or suggestions for improvements..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                className="flex-1"
                rows={3}
              />
              <Button onClick={handleSendQuery} disabled={!queryInput.trim() || isProcessingQuery}>
                {isProcessingQuery ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Suggested Queries */}
            <div className="flex flex-wrap gap-2">
              {[
                "Which workflows are consuming the most resources?",
                "Show me the most frequently failing automation steps",
                "What optimizations can improve my workflow performance?",
                "Find workflows that haven't been used in the last 30 days"
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQueryInput(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Query History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Query History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {queryHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                    <p>No queries yet. Ask your first question above!</p>
                  </div>
                ) : (
                  queryHistory.map((query) => (
                    <div key={query.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{query.confidence}% confidence</Badge>
                            <span className="text-sm text-muted-foreground">
                              {query.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="font-medium text-sm mb-2">{query.query}</p>
                          <p className="text-sm text-muted-foreground">{query.response}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Response time: {query.executionTime}s</span>
                        <span>Context: {query.context}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Workflow Generation History Tab
  const GenerationHistoryTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Workflow Generation History
          </CardTitle>
          <CardDescription>Track and analyze all AI-generated workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockGenerationHistory.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">{item.prompt}</p>
                    <p className="text-xs text-muted-foreground mb-2">{item.generatedWorkflow}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Model: {item.modelUsed}</span>
                      <span>Execution: {item.executionTime}s</span>
                      <span>Tokens: {item.tokens.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={item.status === 'success' ? 'default' : item.status === 'partial' ? 'secondary' : 'destructive'}>
                      {item.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{item.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {item.timestamp.toLocaleString()}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // AI Assistant Training Interface Tab
  const TrainingInterfaceTab = () => (
    <div className="space-y-6">
      {/* Training Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Training Sessions
          </CardTitle>
          <CardDescription>Monitor and manage AI model training processes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trainingData.map((session) => (
              <div key={session.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-sm">Model: {session.modelId}</p>
                    <p className="text-xs text-muted-foreground">
                      Dataset: {session.datasetSize.toLocaleString()} samples
                    </p>
                  </div>
                  <Badge variant={session.status === 'completed' ? 'default' : session.status === 'running' ? 'secondary' : 'destructive'}>
                    {session.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Accuracy</Label>
                    <p className="font-medium">{session.accuracy}%</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Loss</Label>
                    <p className="font-medium">{session.loss}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Epochs</Label>
                    <p className="font-medium">{session.epochs}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Duration</Label>
                    <p className="font-medium">
                      {session.endTime 
                        ? `${Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 3600000)}h`
                        : 'Running...'
                      }
                    </p>
                  </div>
                </div>
                
                {session.status === 'running' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Training Progress</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              New Training Session
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Export Training Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Training Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Training Configuration
          </CardTitle>
          <CardDescription>Configure parameters for new training sessions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Model Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select model type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workflow_generation">Workflow Generation</SelectItem>
                  <SelectItem value="text_analysis">Text Analysis</SelectItem>
                  <SelectItem value="code_generation">Code Generation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Learning Rate</Label>
              <Input type="number" placeholder="0.001" step="0.0001" />
            </div>
            <div>
              <Label>Batch Size</Label>
              <Input type="number" placeholder="32" />
            </div>
            <div>
              <Label>Epochs</Label>
              <Input type="number" placeholder="50" />
            </div>
          </div>
          
          <div>
            <Label>Training Data Source</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select data source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user_workflows">User Workflows</SelectItem>
                <SelectItem value="public_datasets">Public Datasets</SelectItem>
                <SelectItem value="custom_upload">Custom Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button className="w-full">
            <Rocket className="h-4 w-4 mr-2" />
            Start Training Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 rounded-2xl" />
        <div className="relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Advanced AI Features
              </h2>
              <p className="text-muted-foreground mt-1">
                Model performance monitoring, natural language queries, and training management
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                <Activity className="h-3 w-3 mr-1" />
                All Systems Operational
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="query" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Query Interface
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Generation History
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Training
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <ModelPerformanceTab />
        </TabsContent>

        <TabsContent value="query">
          <QueryInterfaceTab />
        </TabsContent>

        <TabsContent value="history">
          <GenerationHistoryTab />
        </TabsContent>

        <TabsContent value="training">
          <TrainingInterfaceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}