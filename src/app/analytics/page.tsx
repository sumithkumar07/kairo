'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { EnhancedAppLayout } from '@/components/enhanced-app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { TrendAnalysis } from '@/components/ui/trend-analysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
  Network,
  Brain,
  Sparkles
} from 'lucide-react';

function AnalyticsEnhancedDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Enhanced metrics with professional data
  const overviewMetrics = {
    totalWorkflows: { value: 247, change: 12.5, trend: 'up' as const },
    totalExecutions: { value: 89247, change: 8.3, trend: 'up' as const },
    successRate: { value: 94.2, change: -1.2, trend: 'down' as const },
    avgExecutionTime: { value: 2.8, change: -15.7, trend: 'up' as const },
    activeUsers: { value: 156, change: 23.1, trend: 'up' as const },
    costSavings: { value: 45289, change: 18.9, trend: 'up' as const }
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
      { name: 'AI Processing', status: 'healthy', uptime: '99.96%', responseTime: '300ms' }
    ]
  };

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500 bg-green-500/10';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10';
      case 'error': 
      case 'critical': return 'text-red-500 bg-red-500/10';
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
    <EnhancedAppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Analytics <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Intelligence Hub</span>
            </h1>
            <p className="text-muted-foreground">
              AI-powered insights, trend analysis, and predictive intelligence
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2">
              <Switch 
                checked={autoRefresh} 
                onCheckedChange={setAutoRefresh} 
                id="auto-refresh"
              />
              <Label htmlFor="auto-refresh" className="text-sm text-muted-foreground">
                Auto-refresh
              </Label>
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

        {/* AI Insights Banner */}
        <Card className="mb-8 p-6 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 border-border/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">AI-Powered Intelligence Active</h3>
              <p className="text-muted-foreground">
                Our AI is continuously analyzing your workflows, detecting anomalies, and generating predictive insights to optimize your automation performance.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500">
                <Sparkles className="h-3 w-3 mr-1" />
                23 Insights Generated
              </Badge>
              <Button variant="outline">
                View All Insights
                <ArrowUp className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Enhanced Overview Metrics */}
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

        {/* Enhanced Tabs with AI Intelligence */}
        <Tabs defaultValue="intelligence" className="space-y-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Intelligence
            </TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="real-time">Real-time</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* AI Intelligence Tab - NEW ENHANCED FEATURE */}
          <TabsContent value="intelligence" className="space-y-6">
            <TrendAnalysis />
          </TabsContent>

          {/* Other existing tabs with enhanced content */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health Overview</CardTitle>
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

              <Card>
                <CardHeader>
                  <CardTitle>Quick Insights</CardTitle>
                  <CardDescription>AI-generated insights from your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-green-900 dark:text-green-100">Performance Improvement</h4>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Workflow success rate increased by 23% over the last 30 days
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 dark:text-blue-100">Optimization Opportunity</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            3 workflows can be optimized to reduce execution time by 40%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Additional tabs would go here with similar enhancements */}
          <TabsContent value="real-time" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Monitoring</CardTitle>
                <CardDescription>Live system metrics and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-2" />
                    <p>Real-time monitoring dashboard would be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Detailed performance metrics and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Performance analytics would be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Insights</CardTitle>
                <CardDescription>Deep dive into your automation patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Brain className="h-12 w-12 mx-auto mb-2" />
                    <p>Advanced insights dashboard would be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
    </EnhancedAppLayout>
  );
}

export default withAuth(AnalyticsEnhancedDashboard);