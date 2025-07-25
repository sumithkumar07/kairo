'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Clock, 
  Users, 
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  Eye,
  Play,
  Pause,
  Square,
  Search,
  RefreshCw,
  FileText,
  LineChart,
  PieChart,
  BarChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Database,
  Globe,
  Cpu,
  Target,
  Workflow,
  Timer,
  DollarSign,
  Gauge,
  History,
  MoreVertical,
  ExternalLink,
  Info,
  Star
} from 'lucide-react';

// Mock data for analytics
const analyticsData = {
  overview: {
    totalWorkflows: 142,
    totalExecutions: 15674,
    successRate: 94.2,
    avgExecutionTime: 2.4,
    monthlyGrowth: 12.8,
    costs: 67.23
  },
  recentExecutions: [
    {
      id: 'exec_001',
      workflowName: 'Welcome Email Automation',
      status: 'success',
      duration: '1.2s',
      timestamp: '2024-01-20T10:30:00Z',
      cost: '$0.05',
      trigger: 'webhook'
    },
    {
      id: 'exec_002',
      workflowName: 'Slack Daily Report',
      status: 'failed',
      duration: '15.8s',
      timestamp: '2024-01-20T10:25:00Z',
      cost: '$0.12',
      trigger: 'schedule'
    },
    {
      id: 'exec_003',
      workflowName: 'Customer Onboarding',
      status: 'success',
      duration: '3.4s',
      timestamp: '2024-01-20T10:20:00Z',
      cost: '$0.08',
      trigger: 'manual'
    }
  ],
  topWorkflows: [
    {
      name: 'Daily Sales Report',
      executions: 1456,
      successRate: 98.2,
      avgTime: '2.1s',
      cost: '$12.34'
    },
    {
      name: 'Customer Support Bot',
      executions: 2341,
      successRate: 92.7,
      avgTime: '4.5s',
      cost: '$23.45'
    },
    {
      name: 'Inventory Sync',
      executions: 876,
      successRate: 89.3,
      avgTime: '8.2s',
      cost: '$8.76'
    }
  ]
};

// Mock data for execution history
const executionHistory = [
  {
    id: 'run_001',
    workflowId: 'wf_001',
    workflowName: 'Welcome Email Automation',
    status: 'completed',
    startTime: '2024-01-20T10:30:00Z',
    endTime: '2024-01-20T10:30:02Z',
    duration: 2.1,
    trigger: 'webhook',
    steps: 5,
    completedSteps: 5,
    cost: 0.05,
    inputs: { email: 'user@example.com', name: 'John Doe' },
    outputs: { messageId: 'msg_123', status: 'sent' }
  },
  {
    id: 'run_002',
    workflowId: 'wf_002',
    workflowName: 'Slack Daily Report',
    status: 'failed',
    startTime: '2024-01-20T10:25:00Z',
    endTime: '2024-01-20T10:25:15Z',
    duration: 15.8,
    trigger: 'schedule',
    steps: 8,
    completedSteps: 3,
    cost: 0.12,
    error: 'API rate limit exceeded',
    inputs: { date: '2024-01-20', recipients: ['team@company.com'] },
    outputs: null
  },
  {
    id: 'run_003',
    workflowId: 'wf_003',
    workflowName: 'Customer Onboarding',
    status: 'completed',
    startTime: '2024-01-20T10:20:00Z',
    endTime: '2024-01-20T10:20:03Z',
    duration: 3.4,
    trigger: 'manual',
    steps: 12,
    completedSteps: 12,
    cost: 0.08,
    inputs: { customerId: 'cust_456', email: 'customer@example.com' },
    outputs: { accountId: 'acc_789', welcomeEmailSent: true }
  }
];

// Performance metrics
const performanceMetrics = [
  {
    metric: 'Response Time',
    value: '2.4s',
    change: -12.3,
    trend: 'down',
    description: 'Average workflow execution time'
  },
  {
    metric: 'Success Rate',
    value: '94.2%',
    change: 2.1,
    trend: 'up',
    description: 'Workflows completed successfully'
  },
  {
    metric: 'Throughput',
    value: '1.2K/hr',
    change: 15.7,
    trend: 'up',
    description: 'Executions per hour'
  },
  {
    metric: 'Error Rate',
    value: '5.8%',
    change: -8.4,
    trend: 'down',
    description: 'Failed workflow executions'
  }
];

function ReportsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedWorkflow, setSelectedWorkflow] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab'));
    }
  }, [searchParams]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'running':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  const filteredHistory = executionHistory.filter(run => {
    const matchesSearch = run.workflowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         run.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || run.status === statusFilter;
    const matchesWorkflow = selectedWorkflow === 'all' || run.workflowId === selectedWorkflow;
    
    return matchesSearch && matchesStatus && matchesWorkflow;
  });

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Monitor workflow performance and execution history</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="run-history">Run History</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Workflows</p>
                      <p className="text-2xl font-bold">{analyticsData.overview.totalWorkflows}</p>
                    </div>
                    <Workflow className="h-8 w-8 text-primary" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">+{analyticsData.overview.monthlyGrowth}%</span>
                    <span className="text-muted-foreground ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Executions</p>
                      <p className="text-2xl font-bold">{analyticsData.overview.totalExecutions.toLocaleString()}</p>
                    </div>
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">+{analyticsData.overview.monthlyGrowth}%</span>
                    <span className="text-muted-foreground ml-1">vs last month</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <p className="text-2xl font-bold">{analyticsData.overview.successRate}%</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="mt-2">
                    <Progress value={analyticsData.overview.successRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Execution Time</p>
                      <p className="text-2xl font-bold">{analyticsData.overview.avgExecutionTime}s</p>
                    </div>
                    <Timer className="h-8 w-8 text-primary" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <ArrowDown className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-green-500">-12.3%</span>
                    <span className="text-muted-foreground ml-1">faster</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Executions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Executions
                </CardTitle>
                <CardDescription>Latest workflow executions across all workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.recentExecutions.map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(execution.status)}
                        <div>
                          <p className="font-medium">{execution.workflowName}</p>
                          <p className="text-sm text-muted-foreground">
                            {execution.id} • {new Date(execution.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline" className={getStatusColor(execution.status)}>
                          {execution.status}
                        </Badge>
                        <span className="text-muted-foreground">{execution.duration}</span>
                        <span className="text-muted-foreground">{execution.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Workflows */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Top Performing Workflows
                </CardTitle>
                <CardDescription>Workflows with highest execution volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topWorkflows.map((workflow, index) => (
                    <div key={workflow.name} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{workflow.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {workflow.executions.toLocaleString()} executions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-medium">{workflow.successRate}%</p>
                          <p className="text-xs text-muted-foreground">Success</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{workflow.avgTime}</p>
                          <p className="text-xs text-muted-foreground">Avg Time</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{workflow.cost}</p>
                          <p className="text-xs text-muted-foreground">Cost</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Execution Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Chart visualization would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Pie chart visualization would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Cost analysis chart would go here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Run History Tab */}
          <TabsContent value="run-history" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search workflows or run IDs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="running">Running</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Workflows" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Workflows</SelectItem>
                      <SelectItem value="wf_001">Welcome Email Automation</SelectItem>
                      <SelectItem value="wf_002">Slack Daily Report</SelectItem>
                      <SelectItem value="wf_003">Customer Onboarding</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Execution History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Execution History
                </CardTitle>
                <CardDescription>
                  Detailed history of all workflow executions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredHistory.map((run) => (
                    <div key={run.id} className="border rounded-lg p-4 bg-card/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(run.status)}
                          <div>
                            <h4 className="font-medium">{run.workflowName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {run.id} • Started {new Date(run.startTime).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStatusColor(run.status)}>
                            {run.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{formatDuration(run.duration)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Steps</p>
                          <p className="font-medium">{run.completedSteps}/{run.steps}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Trigger</p>
                          <p className="font-medium capitalize">{run.trigger}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cost</p>
                          <p className="font-medium">${run.cost.toFixed(2)}</p>
                        </div>
                      </div>

                      {run.status === 'completed' && (
                        <div className="mt-3 pt-3 border-t">
                          <Progress value={(run.completedSteps / run.steps) * 100} className="h-2" />
                        </div>
                      )}

                      {run.status === 'failed' && run.error && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            <p className="text-sm">{run.error}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceMetrics.map((metric) => (
                <Card key={metric.metric}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{metric.metric}</p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(metric.trend)}
                        <span className={`text-sm ${metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{metric.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Response Time Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Gauge className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Response time chart would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Throughput Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Throughput chart would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resource Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Resource Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">68%</div>
                    <div className="text-sm text-muted-foreground">CPU Usage</div>
                    <Progress value={68} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">45%</div>
                    <div className="text-sm text-muted-foreground">Memory Usage</div>
                    <Progress value={45} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">23%</div>
                    <div className="text-sm text-muted-foreground">Storage Usage</div>
                    <Progress value={23} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(ReportsPage);