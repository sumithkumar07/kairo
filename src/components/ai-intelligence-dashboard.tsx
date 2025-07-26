'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Shield,
  Cpu,
  Database,
  Network,
  FlaskConical
} from 'lucide-react';

interface AIModel {
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

interface WorkflowGeneration {
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

const mockAIModels: AIModel[] = [
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

const divineFeatures = [
  {
    id: 'quantum',
    name: 'Quantum Simulation Engine',
    description: 'Predict workflow outcomes with 99.1% accuracy using quantum computing',
    icon: FlaskConical,
    status: 'active',
    usage: 67,
    power: 'Quantum Powered',
    premium: true,
    metrics: {
      accuracy: '99.1%',
      predictions: '1.2M',
      quantum_states: '16,384'
    }
  },
  {
    id: 'hipaa',
    name: 'HIPAA Compliance Pack',
    description: 'Healthcare automation with full audit documentation',
    icon: Shield,
    status: 'active',
    usage: 85,
    power: 'Medical Grade',
    premium: true,
    metrics: {
      compliance: '95.8%',
      audits: '2,341',
      certifications: '12'
    }
  },
  {
    id: 'consciousness',
    name: 'Global Consciousness Feed',
    description: 'Live data from 1B+ devices training world-model AI',
    icon: Network,
    status: 'active',
    usage: 92,
    power: 'Collective Intelligence',
    premium: true,
    metrics: {
      devices: '1.2B',
      data_streams: '89M',
      insights: '234K'
    }
  }
];

export function AIIntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState('models');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* AI Intelligence Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 rounded-2xl" />
        <div className="relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">
                  AI Intelligence Center
                </h2>
                <p className="text-muted-foreground mt-1">
                  Advanced AI model management, performance monitoring, and divine automation powers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                <Activity className="h-3 w-3 mr-1" />
                All AI Systems Operational
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* AI Intelligence Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="models" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            AI Models
          </TabsTrigger>
          <TabsTrigger value="divine-powers" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Divine Powers
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
        </TabsList>

        {/* AI Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </TabsContent>

        {/* Divine Powers Tab */}
        <TabsContent value="divine-powers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {divineFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card key={feature.id} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
                  
                  <CardHeader className="pb-4 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs font-medium bg-gradient-to-r from-primary/10 to-purple-500/10">
                        {feature.power}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {feature.name}
                    </CardTitle>
                    
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {Object.entries(feature.metrics).map(([key, value]) => (
                        <div key={key}>
                          <div className="text-sm font-bold">{value}</div>
                          <div className="text-xs text-muted-foreground capitalize">{key.replace('_', ' ')}</div>
                        </div>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full group-hover:scale-105 transition-transform">
                      <Zap className="h-4 w-4 mr-2" />
                      Access Divine Powers
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                AI Model Performance Trends
              </CardTitle>
              <CardDescription>Real-time performance metrics across all AI models</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Performance charts visualization</p>
                  <p className="text-xs text-muted-foreground mt-1">Real-time accuracy, latency, and usage metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI System Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Processing Load</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Current Load</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Processing 1,247 requests/min
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Model Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Avg Response</span>
                    <span className="font-medium">1.2s</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    15% faster than last week
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Accuracy Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Overall Accuracy</span>
                    <span className="font-medium">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    Excellent performance
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      AI model accuracy improved by 12% this month
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Workflow generation success rate is at an all-time high
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Optimization opportunity detected
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                      2 models can benefit from additional training data
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg border">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Enable quantum simulation for complex workflows</p>
                      <p className="text-xs text-muted-foreground">Could improve accuracy by 15%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border">
                    <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Optimize model refresh intervals</p>
                      <p className="text-xs text-muted-foreground">Reduce latency by 20ms</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}