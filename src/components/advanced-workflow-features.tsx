'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  History,
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  GitBranch,
  Eye,
  Edit,
  Share,
  Download,
  RefreshCw,
  Play,
  Pause,
  StopCircle,
  BarChart3,
  Zap,
  Target,
  Gauge,
  Activity,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  GitCommit,
  Rewind,
  FastForward,
  MoreVertical,
  Filter,
  Search,
  Calendar,
  User,
  Settings,
  Lock,
  Unlock,
  Crown,
  Shield,
  Plus,
  X,
  ChevronRight,
  ArrowRight,
  Lightbulb,
  Rocket,
  Brain,
  Cpu
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

// Enhanced Workflow Editor Features

// Version History Component
interface WorkflowVersion {
  id: string;
  version: string;
  name: string;
  description: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
  changes: {
    type: 'node_added' | 'node_removed' | 'connection_added' | 'connection_removed' | 'config_changed';
    description: string;
    nodeId?: string;
    nodeName?: string;
  }[];
  stats: {
    nodes: number;
    connections: number;
    executions: number;
    successRate: number;
  };
  status: 'draft' | 'published' | 'deprecated';
  tags: string[];
}

const mockVersionHistory: WorkflowVersion[] = [
  {
    id: 'v1.3.0',
    version: '1.3.0',
    name: 'Customer Onboarding v1.3.0',
    description: 'Added error handling and notification improvements',
    author: {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@company.com'
    },
    createdAt: new Date(Date.now() - 86400000),
    changes: [
      {
        type: 'node_added',
        description: 'Added error handling node for API failures',
        nodeId: 'error-1',
        nodeName: 'Error Handler'
      },
      {
        type: 'config_changed',
        description: 'Updated email template configuration',
        nodeId: 'email-1',
        nodeName: 'Welcome Email'
      }
    ],
    stats: {
      nodes: 12,
      connections: 15,
      executions: 245,
      successRate: 97.2
    },
    status: 'published',
    tags: ['stable', 'production', 'customer-facing']
  },
  {
    id: 'v1.2.1',
    version: '1.2.1',
    name: 'Customer Onboarding v1.2.1',
    description: 'Bug fixes and performance optimizations',
    author: {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@company.com'
    },
    createdAt: new Date(Date.now() - 86400000 * 3),
    changes: [
      {
        type: 'config_changed',
        description: 'Optimized database query parameters',
        nodeId: 'db-1',
        nodeName: 'User Lookup'
      },
      {
        type: 'connection_added',
        description: 'Added fallback connection for API timeout',
      }
    ],
    stats: {
      nodes: 11,
      connections: 14,
      executions: 189,
      successRate: 94.7
    },
    status: 'deprecated',
    tags: ['bugfix', 'performance']
  }
];

export function WorkflowVersionHistory({ workflowId }: { workflowId: string }) {
  const [selectedVersion, setSelectedVersion] = useState<WorkflowVersion | null>(null);
  const [compareWith, setCompareWith] = useState<string | null>(null);

  const handleVersionSelect = (version: WorkflowVersion) => {
    setSelectedVersion(version);
  };

  const handleRevertToVersion = (versionId: string) => {
    // Implement version revert logic
    console.log('Reverting to version:', versionId);
  };

  const getStatusColor = (status: WorkflowVersion['status']) => {
    switch (status) {
      case 'published': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'draft': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'deprecated': return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getChangeIcon = (type: WorkflowVersion['changes'][0]['type']) => {
    switch (type) {
      case 'node_added': return <Plus className="h-3 w-3 text-green-500" />;
      case 'node_removed': return <X className="h-3 w-3 text-red-500" />;
      case 'connection_added': return <GitBranch className="h-3 w-3 text-blue-500" />;
      case 'connection_removed': return <X className="h-3 w-3 text-red-500" />;
      case 'config_changed': return <Settings className="h-3 w-3 text-orange-500" />;
      default: return <GitCommit className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Version History</h3>
          <p className="text-sm text-muted-foreground">
            Track changes and manage workflow versions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <GitBranch className="h-4 w-4 mr-2" />
            Create Branch
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Save Version
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {mockVersionHistory.map((version) => (
                  <div 
                    key={version.id} 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedVersion?.id === version.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleVersionSelect(version)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{version.version}</span>
                          <Badge className={getStatusColor(version.status)}>
                            {version.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {version.description}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>{version.author.name}</span>
                      </div>
                      <span>{formatDistanceToNow(version.createdAt, { addSuffix: true })}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <div className="flex gap-4">
                        <span>{version.stats.nodes} nodes</span>
                        <span>{version.stats.connections} connections</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{version.stats.successRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Version Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedVersion ? `Version ${selectedVersion.version}` : 'Version Details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedVersion ? (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Changes</Label>
                  <div className="mt-2 space-y-2">
                    {selectedVersion.changes.map((change, index) => (
                      <div key={index} className="flex items-start gap-3 p-2 bg-muted/30 rounded">
                        {getChangeIcon(change.type)}
                        <div className="flex-1">
                          <p className="text-sm">{change.description}</p>
                          {change.nodeName && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Node: {change.nodeName}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Statistics</Label>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Executions</p>
                      <p className="font-medium">{selectedVersion.stats.executions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="font-medium">{selectedVersion.stats.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nodes</p>
                      <p className="font-medium">{selectedVersion.stats.nodes}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Connections</p>
                      <p className="font-medium">{selectedVersion.stats.connections}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedVersion.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleRevertToVersion(selectedVersion.id)}
                  >
                    <Rewind className="h-4 w-4 mr-2" />
                    Revert
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-8 w-8 mx-auto mb-2" />
                <p>Select a version to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Performance Optimization Suggestions Component
interface OptimizationSuggestion {
  id: string;
  type: 'performance' | 'reliability' | 'cost' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  nodeId?: string;
  nodeName?: string;
  recommendation: string;
  estimatedImprovement: {
    metric: string;
    value: number;
    unit: string;
  };
}

const mockOptimizationSuggestions: OptimizationSuggestion[] = [
  {
    id: '1',
    type: 'performance',
    severity: 'high',
    title: 'Optimize Database Query',
    description: 'The user lookup node is performing a full table scan',
    impact: 'Execution time could be reduced by 60%',
    effort: 'low',
    nodeId: 'db-1',
    nodeName: 'User Lookup',
    recommendation: 'Add an index on the email column or use a more specific query',
    estimatedImprovement: {
      metric: 'Execution Time',
      value: 60,
      unit: '% faster'
    }
  },
  {
    id: '2',
    type: 'reliability',
    severity: 'medium',
    title: 'Add Retry Logic',
    description: 'API calls may fail due to rate limiting or temporary outages',
    impact: 'Reduce workflow failures by 40%',
    effort: 'medium',
    nodeId: 'api-1',
    nodeName: 'External API Call',
    recommendation: 'Implement exponential backoff retry strategy with circuit breaker',
    estimatedImprovement: {
      metric: 'Success Rate',
      value: 40,
      unit: '% improvement'
    }
  },
  {
    id: '3',
    type: 'cost',
    severity: 'low',
    title: 'Reduce API Calls',
    description: 'Multiple sequential API calls can be batched',
    impact: 'Reduce API costs by 25%',
    effort: 'high',
    nodeId: 'api-2',
    nodeName: 'Data Enrichment',
    recommendation: 'Use batch API endpoints where available',
    estimatedImprovement: {
      metric: 'Cost',
      value: 25,
      unit: '% reduction'
    }
  }
];

export function PerformanceOptimizationSuggestions({ workflowId }: { workflowId: string }) {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>(mockOptimizationSuggestions);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => {
      const typeMatch = selectedType === 'all' || suggestion.type === selectedType;
      const severityMatch = selectedSeverity === 'all' || suggestion.severity === selectedSeverity;
      return typeMatch && severityMatch;
    });
  }, [suggestions, selectedType, selectedSeverity]);

  const getSeverityColor = (severity: OptimizationSuggestion['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-700 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getTypeIcon = (type: OptimizationSuggestion['type']) => {
    switch (type) {
      case 'performance': return <Zap className="h-4 w-4 text-blue-500" />;
      case 'reliability': return <Shield className="h-4 w-4 text-green-500" />;
      case 'cost': return <Target className="h-4 w-4 text-purple-500" />;
      case 'security': return <Lock className="h-4 w-4 text-red-500" />;
      default: return <Lightbulb className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEffortBadge = (effort: OptimizationSuggestion['effort']) => {
    const colors = {
      low: 'bg-green-500/10 text-green-700',
      medium: 'bg-yellow-500/10 text-yellow-700',
      high: 'bg-red-500/10 text-red-700'
    };
    return <Badge className={colors[effort]}>{effort} effort</Badge>;
  };

  const handleApplySuggestion = (suggestionId: string) => {
    // Implement suggestion application logic
    console.log('Applying suggestion:', suggestionId);
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Optimization</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered suggestions to improve your workflow
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Analysis
          </Button>
          <Button size="sm">
            <Brain className="h-4 w-4 mr-2" />
            Run Deep Analysis
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div>
          <Label className="text-sm">Type</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="reliability">Reliability</SelectItem>
              <SelectItem value="cost">Cost</SelectItem>
              <SelectItem value="security">Security</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm">Severity</Label>
          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {filteredSuggestions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Lightbulb className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No optimization suggestions found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your workflow is already well optimized!
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredSuggestions.map((suggestion) => (
            <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {getTypeIcon(suggestion.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{suggestion.title}</h4>
                        <Badge className={getSeverityColor(suggestion.severity)}>
                          {suggestion.severity}
                        </Badge>
                        {getEffortBadge(suggestion.effort)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {suggestion.description}
                      </p>
                      {suggestion.nodeName && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Settings className="h-3 w-3" />
                          <span>Affects: {suggestion.nodeName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDismissSuggestion(suggestion.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Recommendation</Label>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-green-600">
                        {suggestion.estimatedImprovement.value}{suggestion.estimatedImprovement.unit}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm">{suggestion.recommendation}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Impact:</span>
                    <span className="text-muted-foreground ml-1">{suggestion.impact}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button size="sm" onClick={() => handleApplySuggestion(suggestion.id)}>
                      <Rocket className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}