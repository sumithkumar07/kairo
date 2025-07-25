'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Zap,
  Clock,
  DollarSign,
  Target,
  Globe,
  Workflow,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Play,
  Pause,
  StopCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  PieChart,
  LineChart,
  MoreHorizontal,
  Settings,
  Share,
  FileText,
  Mail,
  MessageSquare,
  Database,
  Cloud,
  Server,
  Monitor,
  Smartphone,
  Cpu,
  HardDrive,
  MemoryStick,
  Gauge,
  ThermometerSun,
  Wifi,
  ShieldCheck,
  Lock,
  Move,
  Maximize2,
  Minimize2,
  Grid,
  Layers,
  RotateCcw,
  Bell,
  Sparkles,
  Crown,
  Brain,
  Rocket,
  Shield
} from 'lucide-react';

interface AnalyticsWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'gauge' | 'realtime';
  position: { x: number; y: number; width: number; height: number };
  data: any;
  settings: any;
  visible: boolean;
}

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'normal' | 'warning' | 'critical';
  timestamp: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  name: string;
  status: 'running' | 'success' | 'failed' | 'pending';
  startTime: string;
  endTime?: string;
  duration: number;
  steps: number;
  currentStep: number;
  errors: string[];
  resources: {
    cpu: number;
    memory: number;
    network: number;
  };
}

interface PerformanceData {
  timestamp: string;
  cpu: number;
  memory: number;
  network: number;
  activeExecutions: number;
  completedExecutions: number;
  errorRate: number;
  throughput: number;
}

const defaultWidgets: AnalyticsWidget[] = [
  {
    id: 'total-workflows',
    title: 'Total Workflows',
    type: 'metric',
    position: { x: 0, y: 0, width: 3, height: 2 },
    data: { value: 247, change: 12.5, trend: 'up' },
    settings: { color: 'blue', showTrend: true },
    visible: true
  },
  {
    id: 'executions-chart',
    title: 'Executions Over Time',
    type: 'chart',
    position: { x: 3, y: 0, width: 6, height: 4 },
    data: { chartType: 'line', dataPoints: [] },
    settings: { timeRange: '24h', refreshInterval: 30000 },
    visible: true
  },
  {
    id: 'success-rate',
    title: 'Success Rate',
    type: 'gauge',
    position: { x: 9, y: 0, width: 3, height: 2 },
    data: { value: 94.2, max: 100 },
    settings: { showTarget: true, target: 95 },
    visible: true
  },
  {
    id: 'realtime-executions',
    title: 'Real-time Executions',
    type: 'realtime',
    position: { x: 0, y: 4, width: 12, height: 6 },
    data: { executions: [] },
    settings: { maxItems: 50, autoRefresh: true },
    visible: true
  }
];

export function EnhancedAnalyticsDashboard() {
  const [widgets, setWidgets] = useState<AnalyticsWidget[]>(defaultWidgets);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetric[]>([]);
  const [activeExecutions, setActiveExecutions] = useState<WorkflowExecution[]>([]);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceData[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [showWidgetDialog, setShowWidgetDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize real-time monitoring
  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        loadAnalyticsData();
      }, refreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);

  // WebSocket for real-time updates
  useEffect(() => {
    // Initialize WebSocket connection for real-time updates
    // wsRef.current = new WebSocket('ws://localhost:3000/analytics');
    
    // wsRef.current.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   handleRealTimeUpdate(data);
    // };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls for real-time data
      const mockMetrics: RealTimeMetric[] = [
        {
          id: 'active-workflows',
          name: 'Active Workflows',
          value: 34,
          unit: 'count',
          trend: 'up',
          change: 12.5,
          status: 'normal',
          timestamp: new Date().toISOString()
        },
        {
          id: 'avg-execution-time',
          name: 'Avg Execution Time',
          value: 2.4,
          unit: 'seconds',
          trend: 'down',
          change: -15.2,
          status: 'normal',
          timestamp: new Date().toISOString()
        },
        {
          id: 'error-rate',
          name: 'Error Rate',
          value: 2.1,
          unit: '%',
          trend: 'up',
          change: 0.8,
          status: 'warning',
          timestamp: new Date().toISOString()
        },
        {
          id: 'resource-usage',
          name: 'Resource Usage',
          value: 67,
          unit: '%',
          trend: 'stable',
          change: 0.2,
          status: 'normal',
          timestamp: new Date().toISOString()
        }
      ];

      const mockExecutions: WorkflowExecution[] = [
        {
          id: 'exec-1',
          workflowId: 'wf-1',
          name: 'Customer Onboarding',
          status: 'running',
          startTime: new Date(Date.now() - 120000).toISOString(),
          duration: 120,
          steps: 5,
          currentStep: 3,
          errors: [],
          resources: { cpu: 45, memory: 67, network: 23 }
        },
        {
          id: 'exec-2',
          workflowId: 'wf-2',
          name: 'Invoice Processing',
          status: 'success',
          startTime: new Date(Date.now() - 300000).toISOString(),
          endTime: new Date(Date.now() - 180000).toISOString(),
          duration: 120,
          steps: 3,
          currentStep: 3,
          errors: [],
          resources: { cpu: 23, memory: 34, network: 12 }
        },
        {
          id: 'exec-3',
          workflowId: 'wf-3',
          name: 'Lead Qualification',
          status: 'failed',
          startTime: new Date(Date.now() - 480000).toISOString(),
          endTime: new Date(Date.now() - 360000).toISOString(),
          duration: 120,
          steps: 4,
          currentStep: 2,
          errors: ['Rate limit exceeded', 'Invalid API key'],
          resources: { cpu: 12, memory: 23, network: 8 }
        }
      ];

      setRealTimeMetrics(mockMetrics);
      setActiveExecutions(mockExecutions);
      
      // Generate performance history
      const now = Date.now();
      const history: PerformanceData[] = [];
      for (let i = 0; i < 24; i++) {
        history.push({
          timestamp: new Date(now - i * 3600000).toISOString(),
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          network: Math.random() * 50,
          activeExecutions: Math.floor(Math.random() * 50),
          completedExecutions: Math.floor(Math.random() * 200),
          errorRate: Math.random() * 10,
          throughput: Math.floor(Math.random() * 1000)
        });
      }
      setPerformanceHistory(history.reverse());
      
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealTimeUpdate = (data: any) => {
    if (data.type === 'execution_update') {
      setActiveExecutions(prev => 
        prev.map(exec => 
          exec.id === data.executionId ? { ...exec, ...data.update } : exec
        )
      );
    } else if (data.type === 'metric_update') {
      setRealTimeMetrics(prev => 
        prev.map(metric => 
          metric.id === data.metricId ? { ...metric, ...data.update } : metric
        )
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-500 bg-blue-500/10';
      case 'success': return 'text-green-500 bg-green-500/10';
      case 'failed': return 'text-red-500 bg-red-500/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      case 'warning': return 'text-orange-500 bg-orange-500/10';
      case 'critical': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleWidgetMove = (widgetId: string, position: any) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId ? { ...widget, position } : widget
      )
    );
  };

  const handleWidgetResize = (widgetId: string, size: any) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === widgetId ? { ...widget, position: { ...widget.position, ...size } } : widget
      )
    );
  };

  const exportData = () => {
    const data = {
      metrics: realTimeMetrics,
      executions: activeExecutions,
      performance: performanceHistory,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">
            Advanced <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Analytics</span>
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring and comprehensive insights into your automation performance
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => setIsEditMode(!isEditMode)}>
            <Settings className="h-4 w-4 mr-2" />
            {isEditMode ? 'Done' : 'Customize'}
          </Button>
          
          <Button variant="outline" onClick={() => loadAnalyticsData()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {realTimeMetrics.map((metric) => (
          <Card key={metric.id} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                  <p className="text-2xl font-bold">
                    {metric.value.toFixed(1)}{metric.unit}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                  {getTrendIcon(metric.trend)}
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                {getTrendIcon(metric.trend)}
                <span className={metric.trend === 'up' ? 'text-green-500 ml-1' : 'text-red-500 ml-1'}>
                  {Math.abs(metric.change)}%
                </span>
                <span className="text-muted-foreground ml-1">vs last period</span>
              </div>
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Execution Trends</CardTitle>
                <CardDescription>Success rate and execution volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Chart visualization would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System resource utilization and efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>CPU Usage</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Memory Usage</span>
                      <span>67%</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Network I/O</span>
                      <span>23%</span>
                    </div>
                    <Progress value={23} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Workflow Executions
              </CardTitle>
              <CardDescription>Monitor active and recent workflow executions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {activeExecutions.map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${getStatusColor(execution.status)}`}>
                          {execution.status === 'running' && <Play className="h-4 w-4" />}
                          {execution.status === 'success' && <CheckCircle className="h-4 w-4" />}
                          {execution.status === 'failed' && <XCircle className="h-4 w-4" />}
                          {execution.status === 'pending' && <Clock className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium">{execution.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Step {execution.currentStep} of {execution.steps}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <p className="font-medium">{execution.duration}s</p>
                          <p className="text-muted-foreground">Duration</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{execution.resources.cpu}%</p>
                          <p className="text-muted-foreground">CPU</p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Real-time resource monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Performance charts would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Throughput Analysis</CardTitle>
                <CardDescription>Execution throughput over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Throughput charts would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>CPU Usage</CardTitle>
                <CardDescription>Processor utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-500 mb-2">45%</div>
                  <Progress value={45} className="mb-4" />
                  <p className="text-sm text-muted-foreground">Average: 52%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>RAM utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-500 mb-2">67%</div>
                  <Progress value={67} className="mb-4" />
                  <p className="text-sm text-muted-foreground">6.7GB / 10GB</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network I/O</CardTitle>
                <CardDescription>Network utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-500 mb-2">23%</div>
                  <Progress value={23} className="mb-4" />
                  <p className="text-sm text-muted-foreground">230 MB/s</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>Automated performance recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Optimization Opportunity</p>
                      <p className="text-sm text-muted-foreground">
                        Your "Customer Onboarding" workflow could be 15% faster with parallel processing
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Performance Improvement</p>
                      <p className="text-sm text-muted-foreground">
                        Error rate decreased by 25% after implementing retry logic
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Resource Alert</p>
                      <p className="text-sm text-muted-foreground">
                        Memory usage consistently above 80% during peak hours
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Predictions</CardTitle>
                <CardDescription>AI-powered forecasting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Next Hour Load</span>
                      <Badge variant="outline">High Confidence</Badge>
                    </div>
                    <div className="text-2xl font-bold text-primary">+23%</div>
                    <p className="text-sm text-muted-foreground">Expected increase in executions</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Resource Scaling</span>
                      <Badge variant="outline">Recommended</Badge>
                    </div>
                    <div className="text-2xl font-bold text-orange-500">+2 GB</div>
                    <p className="text-sm text-muted-foreground">Memory upgrade suggested</p>
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