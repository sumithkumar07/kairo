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
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Zap,
  Globe,
  Target,
  ArrowRight,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Eye,
  MousePointer,
  Gauge,
  Timer,
  Database,
  Workflow,
  Cpu,
  Shield,
  Crown,
  Sparkles,
  LineChart,
  PieChart,
  BarChart,
  Map,
  Wifi
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Cell, Pie, AreaChart, Area } from 'recharts';

// Sample data for charts
const workflowExecutionData = [
  { name: 'Mon', executions: 124, success: 119, errors: 5 },
  { name: 'Tue', executions: 158, success: 152, errors: 6 },
  { name: 'Wed', executions: 201, success: 195, errors: 6 },
  { name: 'Thu', executions: 178, success: 171, errors: 7 },
  { name: 'Fri', executions: 234, success: 226, errors: 8 },
  { name: 'Sat', executions: 145, success: 140, errors: 5 },
  { name: 'Sun', executions: 167, success: 162, errors: 5 }
];

const performanceData = [
  { name: '00:00', responseTime: 245, throughput: 85 },
  { name: '04:00', responseTime: 198, throughput: 92 },
  { name: '08:00', responseTime: 312, throughput: 78 },
  { name: '12:00', responseTime: 428, throughput: 65 },
  { name: '16:00', responseTime: 378, throughput: 71 },
  { name: '20:00', responseTime: 289, throughput: 82 }
];

const integrationUsageData = [
  { name: 'Salesforce', value: 28, color: '#3b82f6' },
  { name: 'Slack', value: 22, color: '#10b981' },
  { name: 'Shopify', value: 18, color: '#8b5cf6' },
  { name: 'Notion', value: 15, color: '#f59e0b' },
  { name: 'Others', value: 17, color: '#6b7280' }
];

const geographicData = [
  { region: 'North America', executions: 45, percentage: 45 },
  { region: 'Europe', executions: 32, percentage: 32 },
  { region: 'Asia Pacific', executions: 18, percentage: 18 },
  { region: 'Other', executions: 5, percentage: 5 }
];

const topWorkflows = [
  { name: 'Lead Nurturing Campaign', executions: 1247, success: 98.4, avgTime: '2.3s' },
  { name: 'Customer Support Automation', executions: 982, success: 97.1, avgTime: '1.8s' },
  { name: 'E-commerce Order Processing', executions: 756, success: 99.2, avgTime: '3.1s' },
  { name: 'Social Media Publishing', executions: 623, success: 96.8, avgTime: '1.5s' },
  { name: 'Data Synchronization', executions: 445, success: 98.9, avgTime: '4.2s' }
];

const recentAlerts = [
  { id: 1, type: 'warning', workflow: 'Payment Processing', message: 'High error rate detected', time: '2 min ago' },
  { id: 2, type: 'info', workflow: 'Email Campaign', message: 'Execution completed successfully', time: '5 min ago' },
  { id: 3, type: 'error', workflow: 'Data Sync', message: 'Integration timeout', time: '12 min ago' },
  { id: 4, type: 'success', workflow: 'Lead Scoring', message: 'Performance threshold exceeded', time: '18 min ago' }
];

function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('executions');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setLastUpdated(new Date());
    setIsLoading(false);
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
              Comprehensive insights into your workflow performance and usage patterns
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Badge variant="outline" className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              Live Data
            </Badge>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm" className="flex items-center gap-2">
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

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Executions
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-foreground mb-1">12,847</div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">+23.5%</span>
                    <span className="text-muted-foreground">vs last {timeRange === '24h' ? 'day' : timeRange}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Success Rate
                    </CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-foreground mb-1">98.7%</div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">+0.8%</span>
                    <span className="text-muted-foreground">vs last {timeRange === '24h' ? 'day' : timeRange}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Avg Response Time
                    </CardTitle>
                    <Timer className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-foreground mb-1">284ms</div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingDown className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">-12.3%</span>
                    <span className="text-muted-foreground">vs last {timeRange === '24h' ? 'day' : timeRange}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Workflows
                    </CardTitle>
                    <Workflow className="h-4 w-4 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-foreground mb-1">47</div>
                  <div className="flex items-center gap-1 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-600 font-medium">+3</span>
                    <span className="text-muted-foreground">new this {timeRange === '24h' ? 'day' : 'week'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Execution Trends */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Workflow Executions</CardTitle>
                      <CardDescription>Daily execution trends and success rates</CardDescription>
                    </div>
                    <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="executions">Executions</SelectItem>
                        <SelectItem value="success">Success Rate</SelectItem>
                        <SelectItem value="errors">Error Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={workflowExecutionData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-muted-foreground" />
                        <YAxis className="text-muted-foreground" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="executions" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="success" 
                          stroke="hsl(142 76% 36% / 1)" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(142 76% 36% / 1)', strokeWidth: 2, r: 4 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Integration Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Integration Usage</CardTitle>
                  <CardDescription>Most used integrations this {timeRange === '24h' ? 'day' : 'week'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={integrationUsageData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {integrationUsageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {integrationUsageData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Alerts</CardTitle>
                    <CardDescription>Latest system notifications and alerts</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/monitoring">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card/50">
                      <div className={`p-2 rounded-full ${
                        alert.type === 'error' ? 'bg-red-500/10 text-red-500' :
                        alert.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                        alert.type === 'success' ? 'bg-green-500/10 text-green-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> :
                         alert.type === 'warning' ? <AlertCircle className="h-4 w-4" /> :
                         alert.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
                         <Activity className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{alert.workflow}</h4>
                          <Badge variant="outline" className="text-xs">
                            {alert.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{alert.message}</p>
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-8">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Avg Response Time
                    </CardTitle>
                    <Gauge className="h-4 w-4 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-foreground mb-1">284ms</div>
                  <div className="text-sm text-muted-foreground">Target: <300ms</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Throughput
                    </CardTitle>
                    <Zap className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-foreground mb-1">78.5/min</div>
                  <div className="text-sm text-muted-foreground">Peak: 142/min</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      CPU Usage
                    </CardTitle>
                    <Cpu className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-foreground mb-1">42%</div>
                  <div className="text-sm text-muted-foreground">Memory: 68%</div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Response time and throughput over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="responseTime" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary) / 0.2)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-8">
            {/* Top Workflows */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Workflows</CardTitle>
                <CardDescription>Most executed workflows with performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topWorkflows.map((workflow, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{workflow.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {workflow.executions.toLocaleString()} executions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{workflow.success}%</div>
                          <div className="text-muted-foreground">Success</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{workflow.avgTime}</div>
                          <div className="text-muted-foreground">Avg Time</div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-8">
            {/* Integration Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-foreground">23</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    API Calls Today
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-foreground">8,247</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-foreground">99.2%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Avg Latency
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-foreground">156ms</div>
                </CardContent>
              </Card>
            </div>

            {/* Integration Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Usage by Service</CardTitle>
                <CardDescription>API calls and success rates by integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={integrationUsageData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Tab */}
          <TabsContent value="usage" className="space-y-8">
            {/* Geographic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Workflow executions by region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {geographicData.map((region, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Map className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{region.region}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${region.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {region.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Usage Trends */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Peak Usage Hours</CardTitle>
                  <CardDescription>When your workflows are most active</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>9:00 AM - 12:00 PM</span>
                      <span className="font-medium">Peak</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>1:00 PM - 5:00 PM</span>
                      <span className="font-medium">High</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>6:00 PM - 10:00 PM</span>
                      <span className="font-medium">Medium</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>11:00 PM - 8:00 AM</span>
                      <span className="font-medium">Low</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Consumption</CardTitle>
                  <CardDescription>Current usage vs limits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Monthly Executions</span>
                        <span>12,847 / 50,000</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '25.7%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>API Calls</span>
                        <span>8,247 / 100,000</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '8.2%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Storage Used</span>
                        <span>4.2 GB / 50 GB</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '8.4%' }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

export default withAuth(AnalyticsPage);