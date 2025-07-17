'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  PieChart,
  Cpu,
  Memory,
  Network,
  Database,
  Timer,
  Gauge,
  Target,
  RefreshCw
} from 'lucide-react';

interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  throughput: number;
  errorRate: number;
  successRate: number;
  bottlenecks: string[];
  recommendations: string[];
}

interface NodePerformance {
  nodeId: string;
  nodeName: string;
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  errorCount: number;
  successCount: number;
  averageResponseTime: number;
  throughput: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface WorkflowPerformanceMonitorProps {
  workflowId: string;
  isExecuting: boolean;
  nodes: any[];
  onOptimize: (recommendations: string[]) => void;
  onRefresh: () => void;
  className?: string;
}

export function WorkflowPerformanceMonitor({
  workflowId,
  isExecuting,
  nodes,
  onOptimize,
  onRefresh,
  className
}: WorkflowPerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    executionTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    throughput: 0,
    errorRate: 0,
    successRate: 0,
    bottlenecks: [],
    recommendations: []
  });

  const [nodePerformance, setNodePerformance] = useState<NodePerformance[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  // Mock data generation for demonstration
  useEffect(() => {
    const generateMockData = () => {
      const mockMetrics: PerformanceMetrics = {
        executionTime: Math.random() * 5000 + 1000,
        memoryUsage: Math.random() * 80 + 20,
        cpuUsage: Math.random() * 60 + 10,
        networkLatency: Math.random() * 100 + 50,
        throughput: Math.random() * 1000 + 500,
        errorRate: Math.random() * 5,
        successRate: 95 + Math.random() * 5,
        bottlenecks: [
          'HTTP Request node experiencing high latency',
          'Database query taking longer than expected',
          'Memory usage approaching limits in data transformation'
        ],
        recommendations: [
          'Consider adding caching to reduce database load',
          'Optimize data transformation algorithms',
          'Implement connection pooling for HTTP requests',
          'Add parallel processing for independent operations'
        ]
      };

      const mockNodePerformance: NodePerformance[] = nodes.map(node => ({
        nodeId: node.id,
        nodeName: node.name,
        executionTime: Math.random() * 2000 + 500,
        memoryUsage: Math.random() * 50 + 10,
        cpuUsage: Math.random() * 40 + 5,
        errorCount: Math.floor(Math.random() * 3),
        successCount: Math.floor(Math.random() * 100) + 50,
        averageResponseTime: Math.random() * 1000 + 200,
        throughput: Math.random() * 500 + 100,
        status: Math.random() > 0.8 ? 'critical' : Math.random() > 0.6 ? 'warning' : 'healthy'
      }));

      setMetrics(mockMetrics);
      setNodePerformance(mockNodePerformance);
    };

    generateMockData();
    const interval = setInterval(generateMockData, 5000);
    return () => clearInterval(interval);
  }, [nodes]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'critical': return XCircle;
      default: return Clock;
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes.toFixed(0)}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Monitor</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isExecuting}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOptimize(metrics.recommendations)}
          >
            <Target className="h-4 w-4 mr-2" />
            Optimize
          </Button>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Execution Time</p>
                <p className="text-2xl font-bold">{formatTime(metrics.executionTime)}</p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  12% faster
                </p>
              </div>
              <Timer className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.3%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Throughput</p>
                <p className="text-2xl font-bold">{metrics.throughput.toFixed(0)}/min</p>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +8.1%
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{metrics.errorRate.toFixed(1)}%</p>
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +0.3%
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Resource Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  <span className="text-sm">CPU Usage</span>
                </div>
                <span className="text-sm font-medium">{metrics.cpuUsage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.cpuUsage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Memory className="h-4 w-4" />
                  <span className="text-sm">Memory Usage</span>
                </div>
                <span className="text-sm font-medium">{metrics.memoryUsage.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.memoryUsage} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  <span className="text-sm">Network Latency</span>
                </div>
                <span className="text-sm font-medium">{metrics.networkLatency.toFixed(0)}ms</span>
              </div>
              <Progress value={metrics.networkLatency} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="nodes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="nodes">Node Performance</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Node Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {nodePerformance.map((node) => {
                    const StatusIcon = getStatusIcon(node.status);
                    return (
                      <div key={node.nodeId} className="flex items-center gap-4 p-4 border rounded-lg">
                        <StatusIcon className={cn("h-5 w-5", getStatusColor(node.status))} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{node.nodeName}</h3>
                            <Badge variant={node.status === 'healthy' ? 'default' : 
                                          node.status === 'warning' ? 'secondary' : 'destructive'}>
                              {node.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Execution Time</p>
                              <p className="font-medium">{formatTime(node.executionTime)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Memory</p>
                              <p className="font-medium">{node.memoryUsage.toFixed(1)}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Throughput</p>
                              <p className="font-medium">{node.throughput.toFixed(0)}/min</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Success Rate</p>
                              <p className="font-medium">
                                {((node.successCount / (node.successCount + node.errorCount)) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Identified Bottlenecks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.bottlenecks.map((bottleneck, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{bottleneck}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Impact: High • Priority: Medium
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Investigate
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                    <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{recommendation}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Expected improvement: 15-25% performance boost
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button 
                    variant={selectedTimeRange === '1h' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedTimeRange('1h')}
                  >
                    1H
                  </Button>
                  <Button 
                    variant={selectedTimeRange === '24h' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedTimeRange('24h')}
                  >
                    24H
                  </Button>
                  <Button 
                    variant={selectedTimeRange === '7d' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedTimeRange('7d')}
                  >
                    7D
                  </Button>
                  <Button 
                    variant={selectedTimeRange === '30d' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedTimeRange('30d')}
                  >
                    30D
                  </Button>
                </div>
                
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Performance chart for {selectedTimeRange} would be displayed here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}