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
import { 
  Activity, 
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Server,
  Database,
  Wifi,
  WifiOff,
  Eye,
  Bell,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Square,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Gauge,
  Timer,
  Cpu,
  HardDrive,
  MemoryStick,
  Globe,
  Shield,
  Lock,
  Unlock,
  AlertOctagon,
  Info,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Download,
  Calendar,
  MapPin,
  Users,
  Terminal,
  Code
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Sample monitoring data
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
  },
  { 
    id: 3, 
    level: 'info', 
    title: 'Scheduled Maintenance', 
    description: 'Notification service maintenance window starting', 
    time: '1 hour ago',
    service: 'Notifications',
    status: 'acknowledged'
  },
  { 
    id: 4, 
    level: 'warning', 
    title: 'API Rate Limit', 
    description: 'Salesforce integration approaching rate limit', 
    time: '2 hours ago',
    service: 'Integrations',
    status: 'resolved'
  },
  { 
    id: 5, 
    level: 'error', 
    title: 'Workflow Timeout', 
    description: 'Data sync workflow exceeded 30s timeout', 
    time: '3 hours ago',
    service: 'Workflow Engine',
    status: 'resolved'
  }
];

const workflowStatus = [
  { name: 'Lead Nurturing Campaign', status: 'running', executions: 1247, lastExecution: '30s ago', avgTime: '2.3s' },
  { name: 'Customer Support Bot', status: 'running', executions: 856, lastExecution: '1m ago', avgTime: '1.8s' },
  { name: 'E-commerce Sync', status: 'paused', executions: 0, lastExecution: '2h ago', avgTime: '4.2s' },
  { name: 'Social Media Publisher', status: 'running', executions: 432, lastExecution: '5m ago', avgTime: '1.5s' },
  { name: 'Data Backup Process', status: 'error', executions: 0, lastExecution: '1h ago', avgTime: '45s' }
];

const recentLogs = [
  { timestamp: '2025-01-24 10:15:32', level: 'ERROR', service: 'Payment Gateway', message: 'Connection timeout to payment processor' },
  { timestamp: '2025-01-24 10:14:15', level: 'WARN', service: 'Database', message: 'Slow query detected: SELECT * FROM workflows (2.3s)' },
  { timestamp: '2025-01-24 10:13:45', level: 'INFO', service: 'Workflow Engine', message: 'Workflow "Lead Nurturing" completed successfully' },
  { timestamp: '2025-01-24 10:12:30', level: 'DEBUG', service: 'API Gateway', message: 'Rate limit reset for client 127.0.0.1' },
  { timestamp: '2025-01-24 10:11:22', level: 'INFO', service: 'Integration Hub', message: 'Salesforce OAuth token refreshed' }
];

function MonitoringPage() {
  const [alertFilter, setAlertFilter] = useState('all');
  const [logFilter, setLogFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      case 'error': case 'critical': return 'text-red-500 bg-red-500/10';
      case 'maintenance': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertOctagon className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (alertFilter !== 'all' && alert.level !== alertFilter) return false;
    if (searchTerm && !alert.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !alert.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const filteredLogs = recentLogs.filter(log => {
    if (logFilter !== 'all' && log.level.toLowerCase() !== logFilter) return false;
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !log.service.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              System <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Monitoring</span>
            </h1>
            <p className="text-muted-foreground">
              Real-time monitoring, alerts, and system health overview
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
            <Badge variant="outline" className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              {systemStatus.overall === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
            </Badge>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Clock className="h-4 w-4" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  System Health
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-green-600 mb-1">Healthy</div>
              <div className="text-sm text-muted-foreground">Uptime: {systemStatus.uptime}</div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Alerts
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-foreground mb-1">{systemStatus.activeAlerts}</div>
              <div className="text-sm text-muted-foreground">1 Critical, 2 Warning</div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Response Time
                </CardTitle>
                <Timer className="h-4 w-4 text-blue-500" />  
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-foreground mb-1">{liveMetrics.latency.p50}</div>
              <div className="text-sm text-muted-foreground">P95: {liveMetrics.latency.p95}</div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Requests/min
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-foreground mb-1">{liveMetrics.requests.current}</div>
              <div className="text-sm text-muted-foreground">Errors: {liveMetrics.requests.errors}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="services" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
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
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            {/* Alert Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={alertFilter} onValueChange={setAlertFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Recent alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card/50">
                      <div className={`p-2 rounded-full ${getStatusColor(alert.level)}`}>
                        {getAlertIcon(alert.level)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge 
                            variant={alert.status === 'active' ? 'destructive' : 
                                   alert.status === 'acknowledged' ? 'secondary' : 'outline'}
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
                      <div className="flex gap-2">
                        {alert.status === 'active' && (
                          <Button variant="outline" size="sm">
                            Acknowledge
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Status</CardTitle>
                <CardDescription>Current status of all active workflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflowStatus.map((workflow, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          workflow.status === 'running' ? 'text-green-500 bg-green-500/10' :
                          workflow.status === 'paused' ? 'text-yellow-500 bg-yellow-500/10' :
                          'text-red-500 bg-red-500/10'
                        }`}>
                          {workflow.status === 'running' ? <Play className="h-4 w-4" /> :
                           workflow.status === 'paused' ? <Pause className="h-4 w-4" /> :
                           <Square className="h-4 w-4" />}
                        </div>
                        <div>
                          <h4 className="font-semibold">{workflow.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">{workflow.status}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{workflow.executions}</div>
                          <div className="text-muted-foreground">Executions</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{workflow.lastExecution}</div>
                          <div className="text-muted-foreground">Last Run</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{workflow.avgTime}</div>
                          <div className="text-muted-foreground">Avg Time</div>
                        </div>
                        <Button variant="outline" size="sm">
                          Monitor
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
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

              {/* Disk Usage */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                    <HardDrive className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current</span>
                      <span className="font-bold">{liveMetrics.disk.current}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${liveMetrics.disk.current}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Avg: {liveMetrics.disk.average}%</span>
                      <span>Peak: {liveMetrics.disk.peak}%</span>
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

              {/* Request Metrics */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Requests</CardTitle>
                    <BarChart3 className="h-4 w-4 text-red-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Current</span>
                      <span className="font-bold">{liveMetrics.requests.current}/min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Average</span>
                      <span>{liveMetrics.requests.average}/min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Errors</span>
                      <span className="text-red-500 font-medium">{liveMetrics.requests.errors}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Latency */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Latency</CardTitle>
                    <Timer className="h-4 w-4 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>P50</span>
                      <span className="font-bold">{liveMetrics.latency.p50}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>P95</span>
                      <span>{liveMetrics.latency.p95}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>P99</span>
                      <span className="text-yellow-600 font-medium">{liveMetrics.latency.p99}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            {/* Log Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={logFilter} onValueChange={setLogFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Recent system logs and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredLogs.map((log, index) => (
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
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(MonitoringPage);