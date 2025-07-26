'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
  Square,
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
  WifiOff,
  ShieldCheck,
  Lock,
  Bell,
  AlertTriangle,
  Info,
  CheckCircle2,
  Search,
  MapPin,
  Terminal,
  Code,
  Timer,
  Network
} from 'lucide-react';

// Analytics Super Dashboard - Consolidated from /reports, /analytics, /monitoring
// This combines all analytics, reporting, and monitoring functionality in one unified interface

// Sample data (consolidated from all three previous pages)
const overviewMetrics = {
  totalWorkflows: { value: 247, change: 12.5, trend: 'up' },
  totalExecutions: { value: 89247, change: 8.3, trend: 'up' },
  successRate: { value: 94.2, change: -1.2, trend: 'down' },
  avgExecutionTime: { value: 2.8, change: -15.7, trend: 'up' },
  activeUsers: { value: 156, change: 23.1, trend: 'up' },
  costSavings: { value: 45289, change: 18.9, trend: 'up' }
};

const systemStatus = {
  overall: 'healthy',
  uptime: '99.98%',
  lastIncident: '12 days ago',
  activeAlerts: 3,
  services: [
    { name: 'API Gateway', status: 'healthy', uptime: '99.99%', responseTime: '45ms' },
    { name: 'Workflow Engine', status: 'healthy', uptime: '99.97%', responseTime: '120ms' },
    { name: 'Database Cluster', status: 'warning', uptime: '99.95%', responseTime: '200ms' },
    { name: 'Integration Hub', status: 'healthy', uptime: '99.98%', responseTime: '85ms' },
    { name: 'AI Processing', status: 'healthy', uptime: '99.96%', responseTime: '300ms' },
    { name: 'Notification Service', status: 'maintenance', uptime: '99.94%', responseTime: '60ms' }
  ]
};

const liveMetrics = {
  cpu: { current: 42, average: 38, peak: 78 },
  memory: { current: 68, average: 65, peak: 89 },
  disk: { current: 23, average: 25, peak: 45 },
  network: { in: '45.2 MB/s', out: '32.1 MB/s' },
  requests: { current: 1247, average: 1156, errors: 12 },
  latency: { p50: '124ms', p95: '450ms', p99: '800ms' }
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
  }
];

const integrationMetrics = [
  { name: 'Salesforce', requests: 23847, success: 98.2, avgLatency: 245, status: 'healthy' },
  { name: 'Slack', requests: 15634, success: 99.1, avgLatency: 120, status: 'healthy' },
  { name: 'Google Sheets', requests: 12456, success: 96.8, avgLatency: 180, status: 'healthy' },
  { name: 'Shopify', requests: 8923, success: 94.7, avgLatency: 320, status: 'warning' }
];

const alerts = [
  { 
    id: 1, 
    level: 'critical', 
    title: 'High Error Rate', 
    description: 'Payment processing workflow showing 5% error rate', 
    time: '2 minutes ago',
    service: 'Payment Gateway',
    status: 'active'
  },
  { 
    id: 2, 
    level: 'warning', 
    title: 'Database Connection Pool', 
    description: 'Connection pool utilization above 80%', 
    time: '15 minutes ago',
    service: 'Database',
    status: 'active'
  }
];

const recentLogs = [
  { timestamp: '2025-01-24 10:15:32', level: 'ERROR', service: 'Payment Gateway', message: 'Connection timeout to payment processor' },
  { timestamp: '2025-01-24 10:14:15', level: 'WARN', service: 'Database', message: 'Slow query detected: SELECT * FROM workflows (2.3s)' },
  { timestamp: '2025-01-24 10:13:45', level: 'INFO', service: 'Workflow Engine', message: 'Workflow "Lead Nurturing" completed successfully' }
];

function AnalyticsSuperDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [alertFilter, setAlertFilter] = useState('all');
  const [logFilter, setLogFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': 
      case 'healthy': return 'text-green-500 bg-green-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      case 'error': 
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'maintenance': return 'text-blue-500 bg-blue-500/10';
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

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Analytics <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Super Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              Unified analytics, monitoring, and reporting - all your insights in one place
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2">
              <Switch 
                checked={autoRefresh} 
                onCheckedChange={setAutoRefresh} 
                id="auto-refresh"
              />
              <label htmlFor="auto-refresh" className="text-sm text-muted-foreground">
                Auto-refresh
              </label>
            </div>
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
            <Badge variant="outline" className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              {systemStatus.overall === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
            </Badge>
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

        {/* Last Updated */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Clock className="h-4 w-4" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Workflows
                </CardTitle>
                <Workflow className="h-4 w-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{overviewMetrics.totalWorkflows.value}</div>
              <div className="flex items-center gap-1 text-sm">
                {getTrendIcon(overviewMetrics.totalWorkflows.trend, overviewMetrics.totalWorkflows.change)}
                <span className={overviewMetrics.totalWorkflows.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(overviewMetrics.totalWorkflows.change)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Executions
                </CardTitle>
                <Play className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{formatNumber(overviewMetrics.totalExecutions.value)}</div>
              <div className="flex items-center gap-1 text-sm">
                {getTrendIcon(overviewMetrics.totalExecutions.trend, overviewMetrics.totalExecutions.change)}
                <span className={overviewMetrics.totalExecutions.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(overviewMetrics.totalExecutions.change)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Success Rate
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{overviewMetrics.successRate.value}%</div>
              <div className="flex items-center gap-1 text-sm">
                {getTrendIcon(overviewMetrics.successRate.trend, overviewMetrics.successRate.change)}
                <span className={overviewMetrics.successRate.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(overviewMetrics.successRate.change)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Execution Time
                </CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{overviewMetrics.avgExecutionTime.value}s</div>
              <div className="flex items-center gap-1 text-sm">
                {getTrendIcon('up', overviewMetrics.avgExecutionTime.change)}
                <span className="text-green-500">
                  {Math.abs(overviewMetrics.avgExecutionTime.change)}% faster
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Users
                </CardTitle>
                <Users className="h-4 w-4 text-indigo-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{overviewMetrics.activeUsers.value}</div>
              <div className="flex items-center gap-1 text-sm">
                {getTrendIcon(overviewMetrics.activeUsers.trend, overviewMetrics.activeUsers.change)}
                <span className={overviewMetrics.activeUsers.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(overviewMetrics.activeUsers.change)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Cost Savings
                </CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">${formatNumber(overviewMetrics.costSavings.value)}</div>
              <div className="flex items-center gap-1 text-sm">
                {getTrendIcon(overviewMetrics.costSavings.trend, overviewMetrics.costSavings.change)}
                <span className={overviewMetrics.costSavings.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                  {Math.abs(overviewMetrics.costSavings.change)}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Consolidated Tabs */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="real-time">Real-time</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Key metrics & KPIs */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Performance</CardTitle>
                  <CardDescription>Top performing workflows and their metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {workflowMetrics.map((workflow) => (
                      <div key={workflow.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(workflow.status)}`} />
                          <div>
                            <div className="font-semibold">{workflow.name}</div>
                            <div className="text-sm text-muted-foreground">{workflow.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8 text-sm">
                          <div className="text-center">
                            <div className="font-semibold">{formatNumber(workflow.executions)}</div>
                            <div className="text-muted-foreground">Executions</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{workflow.successRate}%</div>
                            <div className="text-muted-foreground">Success</div>
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

              <Card>
                <CardHeader>
                  <CardTitle>Integration Health</CardTitle>
                  <CardDescription>Monitor the health of your integrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {integrationMetrics.map((integration) => (
                      <div key={integration.name} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(integration.status)}`} />
                          <span className="font-medium">{integration.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold">{integration.success}%</div>
                            <div className="text-muted-foreground">Success</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{integration.avgLatency}ms</div>
                            <div className="text-muted-foreground">Latency</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Real-time Tab - Live monitoring & alerts */}
          <TabsContent value="real-time" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* CPU Usage */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                    <Cpu className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current</span>
                      <span className="font-bold">{liveMetrics.cpu.current}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${liveMetrics.cpu.current}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Avg: {liveMetrics.cpu.average}%</span>
                      <span>Peak: {liveMetrics.cpu.peak}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Memory Usage */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                    <MemoryStick className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current</span>
                      <span className="font-bold">{liveMetrics.memory.current}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${liveMetrics.memory.current}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Avg: {liveMetrics.memory.average}%</span>
                      <span>Peak: {liveMetrics.memory.peak}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Network I/O */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Network I/O</CardTitle>
                    <Wifi className="h-4 w-4 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Inbound</span>
                      <span className="font-bold">{liveMetrics.network.in}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Outbound</span>
                      <span className="font-bold">{liveMetrics.network.out}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
                <CardDescription>Recent alerts and system notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card/50">
                      <div className={`p-2 rounded-full ${getStatusColor(alert.level)}`}>
                        {getAlertIcon(alert.level)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge 
                            variant={alert.status === 'active' ? 'destructive' : 'outline'}
                            className="text-xs"
                          >
                            {alert.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {alert.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Server className="h-3 w-3" />
                            {alert.service}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab - System health & resources */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
                <CardDescription>Real-time status of all system components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemStatus.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${getStatusColor(service.status)}`}>
                          {service.status === 'healthy' ? <CheckCircle className="h-4 w-4" /> :
                           service.status === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
                           service.status === 'maintenance' ? <Settings className="h-4 w-4" /> :
                           <XCircle className="h-4 w-4" />}
                        </div>
                        <div>
                          <h4 className="font-semibold">{service.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{service.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{service.uptime}</div>
                          <div className="text-muted-foreground">Uptime</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{service.responseTime}</div>
                          <div className="text-muted-foreground">Response</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Insights Tab - Advanced analytics & trends */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Workflow performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Performance chart visualization would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Analytics</CardTitle>
                  <CardDescription>User activity and engagement metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto mb-2" />
                      <p>Usage analytics chart would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring Tab - System logs and monitoring */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Recent system events and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentLogs.map((log, index) => (
                    <div key={index} className="font-mono text-xs p-3 rounded-lg border bg-card/30 hover:bg-card/50 transition-colors">
                      <div className="flex items-start gap-4">
                        <span className="text-muted-foreground shrink-0">
                          {log.timestamp}
                        </span>
                        <Badge 
                          variant={log.level === 'ERROR' ? 'destructive' : 
                                 log.level === 'WARN' ? 'secondary' : 'outline'}
                          className="text-xs shrink-0"
                        >
                          {log.level}
                        </Badge>
                        <span className="text-primary font-medium shrink-0">
                          [{log.service}]
                        </span>
                        <span className="text-foreground">
                          {log.message}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab - Generate and export reports */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Report</CardTitle>
                  <CardDescription>Comprehensive workflow performance analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Summary</CardTitle>
                  <CardDescription>Monthly usage and billing summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Summary
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Executive Dashboard</CardTitle>
                  <CardDescription>High-level metrics for leadership</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Dashboard
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(AnalyticsSuperDashboard);