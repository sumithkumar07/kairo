'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Maximize2,
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
  Lock
} from 'lucide-react';

// Sample analytics data
const overviewMetrics = {
  totalWorkflows: { value: 247, change: 12.5, trend: 'up' },
  totalExecutions: { value: 89247, change: 8.3, trend: 'up' },
  successRate: { value: 94.2, change: -1.2, trend: 'down' },
  avgExecutionTime: { value: 2.8, change: -15.7, trend: 'up' },
  activeUsers: { value: 156, change: 23.1, trend: 'up' },
  costSavings: { value: 45289, change: 18.9, trend: 'up' }
};

const workflowMetrics = [
  {
    id: 1,
    name: 'Lead Nurturing Automation',
    category: 'Marketing',
    executions: 12847,
    successRate: 96.8,
    avgTime: 3.2,
    lastRun: '2 minutes ago',
    status: 'active',
    trend: 'up'
  },
  {
    id: 2,
    name: 'Customer Onboarding',
    category: 'Sales',
    executions: 8934,
    successRate: 94.1,
    avgTime: 5.7,
    lastRun: '5 minutes ago',
    status: 'active',
    trend: 'up'
  },
  {
    id: 3,
    name: 'Invoice Processing',
    category: 'Finance',
    executions: 15623,
    successRate: 98.3,
    avgTime: 1.4,
    lastRun: '8 minutes ago',
    status: 'active',
    trend: 'stable'
  },
  {
    id: 4,
    name: 'Support Ticket Routing',
    category: 'Support',
    executions: 6745,
    successRate: 89.7,
    avgTime: 0.8,
    lastRun: '12 minutes ago',
    status: 'warning',
    trend: 'down'
  },
  {
    id: 5,
    name: 'Inventory Management',
    category: 'Operations',
    executions: 4356,
    successRate: 92.4,
    avgTime: 4.1,
    lastRun: '1 hour ago',
    status: 'active',
    trend: 'up'
  }
];

const integrationMetrics = [
  { name: 'Salesforce', requests: 23847, success: 98.2, avgLatency: 245, status: 'healthy' },
  { name: 'Slack', requests: 15634, success: 99.1, avgLatency: 120, status: 'healthy' },
  { name: 'Google Sheets', requests: 12456, success: 96.8, avgLatency: 180, status: 'healthy' },
  { name: 'Shopify', requests: 8923, success: 94.7, avgLatency: 320, status: 'warning' },
  { name: 'Airtable', requests: 6745, success: 97.3, avgLatency: 150, status: 'healthy' },
  { name: 'HubSpot', requests: 5634, success: 95.8, avgLatency: 280, status: 'healthy' }
];

const errorAnalysis = [
  { type: 'Rate Limit Exceeded', count: 45, percentage: 32.1, category: 'Integration' },
  { type: 'Authentication Failed', count: 28, percentage: 20.0, category: 'Security' },
  { type: 'Timeout Error', count: 23, percentage: 16.4, category: 'Performance' },
  { type: 'Invalid Data Format', count: 19, percentage: 13.6, category: 'Data' },
  { type: 'Service Unavailable', count: 15, percentage: 10.7, category: 'External' },
  { type: 'Other', count: 10, percentage: 7.1, category: 'Misc' }
];

const userActivity = [
  { name: 'Sarah Johnson', role: 'Admin', workflows: 23, executions: 1247, lastActive: '2 min ago' },
  { name: 'Michael Chen', role: 'Editor', workflows: 18, executions: 934, lastActive: '5 min ago' },
  { name: 'Emily Rodriguez', role: 'Editor', workflows: 15, executions: 789, lastActive: '12 min ago' },
  { name: 'David Kim', role: 'Viewer', workflows: 8, executions: 456, lastActive: '1 hour ago' },
  { name: 'Lisa Wang', role: 'Editor', workflows: 12, executions: 623, lastActive: '2 hours ago' }
];

const performanceData = {
  cpu: { current: 45, average: 52, peak: 78 },
  memory: { current: 62, average: 58, peak: 84 },
  storage: { used: 2.3, total: 10, percentage: 23 },
  network: { inbound: 125, outbound: 89 },
  apiCalls: { current: 1247, limit: 10000, percentage: 12.47 }
};

function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': 
      case 'healthy': return 'text-green-500 bg-green-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      case 'error': 
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'paused': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Analytics <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your automation performance and usage
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
                  <div className="text-2xl font-bold">{overviewMetrics.totalWorkflows.value}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(overviewMetrics.totalWorkflows.trend, overviewMetrics.totalWorkflows.change)}
                    <span className={overviewMetrics.totalWorkflows.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(overviewMetrics.totalWorkflows.change)}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Workflow className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Executions</p>
                  <div className="text-2xl font-bold">{formatNumber(overviewMetrics.totalExecutions.value)}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(overviewMetrics.totalExecutions.trend, overviewMetrics.totalExecutions.change)}
                    <span className={overviewMetrics.totalExecutions.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(overviewMetrics.totalExecutions.change)}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Play className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <div className="text-2xl font-bold">{overviewMetrics.successRate.value}%</div>
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(overviewMetrics.successRate.trend, overviewMetrics.successRate.change)}
                    <span className={overviewMetrics.successRate.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(overviewMetrics.successRate.change)}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Execution Time</p>
                  <div className="text-2xl font-bold">{overviewMetrics.avgExecutionTime.value}s</div>
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon('up', overviewMetrics.avgExecutionTime.change)}
                    <span className="text-green-500">
                      {Math.abs(overviewMetrics.avgExecutionTime.change)}% faster
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <div className="text-2xl font-bold">{overviewMetrics.activeUsers.value}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(overviewMetrics.activeUsers.trend, overviewMetrics.activeUsers.change)}
                    <span className={overviewMetrics.activeUsers.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(overviewMetrics.activeUsers.change)}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Users className="h-5 w-5 text-indigo-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cost Savings</p>
                  <div className="text-2xl font-bold">${formatNumber(overviewMetrics.costSavings.value)}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(overviewMetrics.costSavings.trend, overviewMetrics.costSavings.change)}
                    <span className={overviewMetrics.costSavings.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                      {Math.abs(overviewMetrics.costSavings.change)}%
                    </span>
                  </div>
                </div>
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="workflows" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="errors">Error Analysis</TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Performance</CardTitle>
                <CardDescription>Detailed metrics for your active workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflowMetrics.map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(workflow.status)}`} />
                          <div>
                            <div className="font-semibold">{workflow.name}</div>
                            <div className="text-sm text-muted-foreground">{workflow.category}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{formatNumber(workflow.executions)}</div>
                          <div className="text-muted-foreground">Executions</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{workflow.successRate}%</div>
                          <div className="text-muted-foreground">Success Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{workflow.avgTime}s</div>
                          <div className="text-muted-foreground">Avg Time</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{workflow.lastRun}</div>
                          <div className="text-muted-foreground">Last Run</div>
                        </div>
                        <div className="text-center">
                          {getTrendIcon(workflow.trend, 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Health</CardTitle>
                <CardDescription>Monitor the health and performance of your integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {integrationMetrics.map((integration) => (
                    <Card key={integration.name} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{integration.name}</h3>
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Requests:</span>
                          <span className="font-medium">{formatNumber(integration.requests)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Success Rate:</span>
                          <span className="font-medium">{integration.success}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg Latency:</span>
                          <span className="font-medium">{integration.avgLatency}ms</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>Real-time system resource usage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">CPU Usage</span>
                        <span className="text-sm text-muted-foreground">{performanceData.cpu.current}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${performanceData.cpu.current}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Avg: {performanceData.cpu.average}%</span>
                        <span>Peak: {performanceData.cpu.peak}%</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Memory Usage</span>
                        <span className="text-sm text-muted-foreground">{performanceData.memory.current}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${performanceData.memory.current}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Avg: {performanceData.memory.average}%</span>
                        <span>Peak: {performanceData.memory.peak}%</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Storage Usage</span>
                        <span className="text-sm text-muted-foreground">
                          {performanceData.storage.used}GB / {performanceData.storage.total}GB
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${performanceData.storage.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {performanceData.storage.percentage}% used
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">API Usage</span>
                        <span className="text-sm text-muted-foreground">
                          {performanceData.apiCalls.current} / {formatNumber(performanceData.apiCalls.limit)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${performanceData.apiCalls.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {performanceData.apiCalls.percentage.toFixed(1)}% of limit
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Network Activity</CardTitle>
                  <CardDescription>Real-time network usage statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {performanceData.network.inbound + performanceData.network.outbound} MB/s
                      </div>
                      <div className="text-sm text-muted-foreground">Total Network Traffic</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg bg-green-500/10">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {performanceData.network.inbound} MB/s
                        </div>
                        <div className="text-sm text-muted-foreground">Inbound</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-blue-500/10">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {performanceData.network.outbound} MB/s
                        </div>
                        <div className="text-sm text-muted-foreground">Outbound</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Wifi className="h-4 w-4 text-green-500" />
                          Connection Status
                        </span>
                        <Badge className="text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                          Stable
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          Latency
                        </span>
                        <span className="font-medium">24ms</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-purple-500" />
                          CDN Status
                        </span>
                        <Badge className="text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                          Optimal
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Monitor team member engagement and usage patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userActivity.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{user.workflows}</div>
                          <div className="text-muted-foreground">Workflows</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{user.executions}</div>
                          <div className="text-muted-foreground">Executions</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{user.lastActive}</div>
                          <div className="text-muted-foreground">Last Active</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Error Analysis Tab */}
          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Error Analysis</CardTitle>
                <CardDescription>Identify and analyze workflow execution errors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Error Breakdown</h3>
                    <div className="space-y-3">
                      {errorAnalysis.map((error, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div>
                              <div className="font-medium">{error.type}</div>
                              <div className="text-sm text-muted-foreground">{error.category}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{error.count}</div>
                            <div className="text-sm text-muted-foreground">{error.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Resolution Recommendations</h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg border bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-yellow-800 dark:text-yellow-200">Rate Limiting</div>
                            <div className="text-sm text-yellow-700 dark:text-yellow-300">
                              Consider implementing exponential backoff in your integrations to handle rate limits more gracefully.
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-blue-800 dark:text-blue-200">Authentication</div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                              Review API credentials and ensure they haven't expired. Consider implementing automatic token refresh.
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <div className="font-semibold text-green-800 dark:text-green-200">Overall Health</div>
                            <div className="text-sm text-green-700 dark:text-green-300">
                              Your workflow error rate is within acceptable limits. Keep monitoring for any sudden spikes.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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

export default withAuth(AnalyticsPage);