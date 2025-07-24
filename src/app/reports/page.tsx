'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  FileText, 
  Download,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  Workflow,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  Target,
  Zap,
  Crown,
  Shield,
  Database,
  Mail,
  MessageSquare,
  ShoppingCart,
  Eye,
  MousePointer,
  RefreshCw,
  Filter,
  Share,
  Bookmark,
  Settings,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';

// Sample report data
const executionReport = {
  period: 'Last 30 Days',
  totalExecutions: 45247,
  successfulExecutions: 44389,
  failedExecutions: 858,
  successRate: 98.1,
  avgResponseTime: 284,
  peakExecutions: 1847,
  totalWorkflows: 47,
  activeWorkflows: 42,
  pausedWorkflows: 5,
  trends: {
    executions: { value: 23.5, direction: 'up' },
    successRate: { value: 0.8, direction: 'up' },
    responseTime: { value: 12.3, direction: 'down' },
    workflows: { value: 3, direction: 'up' }
  }
};

const weeklyData = [
  { week: 'Week 1', executions: 8245, success: 8123, errors: 122, avgTime: 298 },
  { week: 'Week 2', executions: 9156, success: 8978, errors: 178, avgTime: 312 },
  { week: 'Week 3', executions: 11847, success: 11634, errors: 213, avgTime: 275 },
  { week: 'Week 4', executions: 15999, success: 15654, errors: 345, avgTime: 267 }
];

const workflowPerformance = [
  { name: 'Lead Nurturing', executions: 12847, success: 98.7, avgTime: 2.3, revenue: 145000 },
  { name: 'Customer Support', executions: 9823, success: 97.1, avgTime: 1.8, tickets: 1247 },
  { name: 'E-commerce Sync', executions: 7564, success: 99.2, avgTime: 3.1, orders: 3456 },
  { name: 'Social Publishing', executions: 5234, success: 96.8, avgTime: 1.5, posts: 789 },
  { name: 'Data Backup', executions: 3456, success: 99.8, avgTime: 45.2, backups: 234 }
];

const integrationStats = [
  { name: 'Salesforce', usage: 28, calls: 45234, success: 99.2, avgLatency: 145 },
  { name: 'Slack', usage: 22, calls: 34567, success: 98.8, avgLatency: 89 },
  { name: 'Shopify', usage: 18, calls: 28934, success: 99.5, avgLatency: 234 },
  { name: 'Notion', usage: 15, calls: 23456, success: 97.9, avgLatency: 167 },
  { name: 'Mailchimp', usage: 12, calls: 19876, success: 98.4, avgLatency: 123 },
  { name: 'Others', usage: 5, calls: 15432, success: 98.1, avgLatency: 198 }
];

const costAnalysis = {
  totalCost: 4250,
  compute: 2100,
  storage: 350,
  network: 180,
  integrations: 1620,
  projectedMonthlyCost: 4580,
  costPerExecution: 0.094,
  costOptimization: {
    potential: 640,
    recommendations: [
      { category: 'Compute', saving: 320, description: 'Optimize idle workflow instances' },
      { category: 'Integrations', saving: 180, description: 'Reduce API call frequency' },
      { category: 'Storage', saving: 140, description: 'Archive old execution logs' }
    ]
  }
};

const complianceReport = {
  overallScore: 94.2,
  categories: [
    { name: 'Data Protection', score: 96.8, status: 'compliant' },
    { name: 'Access Control', score: 93.4, status: 'compliant' },
    { name: 'Audit Logging', score: 98.1, status: 'compliant' },
    { name: 'Encryption', score: 91.7, status: 'review_needed' },
    { name: 'Backup & Recovery', score: 89.3, status: 'review_needed' }
  ],
  certifications: ['SOC 2 Type II', 'GDPR', 'HIPAA', 'PCI DSS'],
  lastAudit: '2025-01-15',
  nextAudit: '2025-04-15'
};

function ReportsPage() {
  const [dateRange, setDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: new Date(2025, 0, 1),
    to: new Date()
  });
  const [reportType, setReportType] = useState('execution');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-500 bg-green-500/10';
      case 'review_needed': return 'text-yellow-500 bg-yellow-500/10';
      case 'non_compliant': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'down': return <ArrowDown className="h-3 w-3 text-red-500" />;
      default: return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Analytics <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Reports</span>
            </h1>
            <p className="text-muted-foreground">
              Comprehensive reports and insights for data-driven decisions
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Share className="h-4 w-4" />
              Share
            </Button>
            <Button size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        <Tabs defaultValue="executive" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="executive">Executive</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* Executive Summary */}
          <TabsContent value="executive" className="space-y-8">
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
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {executionReport.totalExecutions.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(executionReport.trends.executions.direction)}
                    <span className={`font-medium ${
                      executionReport.trends.executions.direction === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {executionReport.trends.executions.value}%
                    </span>
                    <span className="text-muted-foreground">vs last period</span>
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
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {executionReport.successRate}%
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(executionReport.trends.successRate.direction)}
                    <span className="text-green-600 font-medium">
                      +{executionReport.trends.successRate.value}%
                    </span>
                    <span className="text-muted-foreground">vs last period</span>
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
                    <Clock className="h-4 w-4 text-purple-500" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {executionReport.avgResponseTime}ms
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(executionReport.trends.responseTime.direction)}
                    <span className="text-green-600 font-medium">
                      -{executionReport.trends.responseTime.value}%
                    </span>
                    <span className="text-muted-foreground">vs last period</span>
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
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {executionReport.activeWorkflows}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon(executionReport.trends.workflows.direction)}
                    <span className="text-green-600 font-medium">
                      +{executionReport.trends.workflows.value}
                    </span>
                    <span className="text-muted-foreground">new this period</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Execution Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Execution Trends</CardTitle>
                <CardDescription>Weekly execution volume and success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" className="text-muted-foreground" />
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
                        dataKey="executions" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary) / 0.2)"
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="success" 
                        stroke="hsl(142 76% 36% / 1)" 
                        fill="hsl(142 76% 36% / 0.2)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Workflows */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Workflows</CardTitle>
                <CardDescription>Workflows ranked by execution volume and business impact</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflowPerformance.slice(0, 5).map((workflow, index) => (
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
                          <div className="font-semibold">{workflow.avgTime}s</div>
                          <div className="text-muted-foreground">Avg Time</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">
                            {workflow.revenue ? formatCurrency(workflow.revenue) :
                             workflow.tickets ? `${workflow.tickets} tickets` :
                             workflow.orders ? `${workflow.orders} orders` :
                             workflow.posts ? `${workflow.posts} posts` :
                             `${workflow.backups} backups`}
                          </div>
                          <div className="text-muted-foreground">Impact</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Analysis */}
          <TabsContent value="performance" className="space-y-8">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Peak Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-foreground mb-1">{executionReport.peakExecutions}</div>
                  <div className="text-sm text-muted-foreground">executions/hour</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Error Rate
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-foreground mb-1">1.9%</div>
                  <div className="text-sm text-muted-foreground">
                    {executionReport.failedExecutions} failures
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Reliability Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-foreground mb-1">98.7</div>
                  <div className="text-sm text-muted-foreground">out of 100</div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Response Time Analysis</CardTitle>
                <CardDescription>Weekly average response times by workflow category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="week" className="text-muted-foreground" />
                      <YAxis className="text-muted-foreground" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="avgTime" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Error Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Error Analysis</CardTitle>
                <CardDescription>Most common error types and their resolution times</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <h4 className="font-semibold">Connection Timeout</h4>
                      <p className="text-sm text-muted-foreground">45% of all errors</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">245 occurrences</div>
                      <div className="text-sm text-muted-foreground">Avg resolution: 12min</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <h4 className="font-semibold">API Rate Limit</h4>
                      <p className="text-sm text-muted-foreground">28% of all errors</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">152 occurrences</div>
                      <div className="text-sm text-muted-foreground">Avg resolution: 5min</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <h4 className="font-semibold">Data Validation</h4>
                      <p className="text-sm text-muted-foreground">18% of all errors</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">97 occurrences</div>
                      <div className="text-sm text-muted-foreground">Avg resolution: 8min</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usage Analytics */}
          <TabsContent value="usage" className="space-y-8">
            {/* Integration Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Usage Statistics</CardTitle>
                <CardDescription>API calls, success rates, and performance by integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrationStats.map((integration, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                          <Globe className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{integration.name}</h4>
                          <p className="text-sm text-muted-foreground">{integration.usage}% usage share</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{integration.calls.toLocaleString()}</div>
                          <div className="text-muted-foreground">API Calls</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{integration.success}%</div>
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

            {/* Usage Patterns */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Peak Usage Hours</CardTitle>
                  <CardDescription>When your workflows are most active</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>9:00 AM - 12:00 PM</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }} />
                        </div>
                        <span className="text-sm font-medium">Peak</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>1:00 PM - 5:00 PM</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }} />
                        </div>
                        <span className="text-sm font-medium">High</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>6:00 PM - 10:00 PM</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }} />
                        </div>
                        <span className="text-sm font-medium">Medium</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>11:00 PM - 8:00 AM</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: '20%' }} />
                        </div>
                        <span className="text-sm font-medium">Low</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Execution origins by region</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>North America</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
                        </div>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Europe</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '32%' }} />
                        </div>
                        <span className="text-sm font-medium">32%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Asia Pacific</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '18%' }} />
                        </div>
                        <span className="text-sm font-medium">18%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Other</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: '5%' }} />
                        </div>
                        <span className="text-sm font-medium">5%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cost Analysis */}
          <TabsContent value="cost" className="space-y-8">
            {/* Cost Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {formatCurrency(costAnalysis.totalCost)}
                  </div>
                  <div className="text-sm text-muted-foreground">This month</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Cost per Execution</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    ${costAnalysis.costPerExecution}
                  </div>
                  <div className="text-sm text-muted-foreground">Average</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Projected Monthly</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {formatCurrency(costAnalysis.projectedMonthlyCost)}
                  </div>
                  <div className="text-sm text-muted-foreground">+8% vs current</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Potential Savings</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {formatCurrency(costAnalysis.costOptimization.potential)}
                  </div>
                  <div className="text-sm text-muted-foreground">15% reduction</div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                  <CardDescription>Resource utilization and costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-blue-500" />
                        <span>Compute</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(costAnalysis.compute)}</div>
                        <div className="text-sm text-muted-foreground">49.4%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-500" />
                        <span>Integrations</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(costAnalysis.integrations)}</div>
                        <div className="text-sm text-muted-foreground">38.1%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-purple-500" />
                        <span>Storage</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(costAnalysis.storage)}</div>
                        <div className="text-sm text-muted-foreground">8.2%</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-orange-500" />
                        <span>Network</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(costAnalysis.network)}</div>
                        <div className="text-sm text-muted-foreground">4.2%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cost Optimization</CardTitle>
                  <CardDescription>Recommendations to reduce costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {costAnalysis.costOptimization.recommendations.map((rec, index) => (
                      <div key={index} className="p-3 rounded-lg border bg-card/50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{rec.category}</h4>
                          <span className="text-green-600 font-medium">
                            {formatCurrency(rec.saving)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Report */}
          <TabsContent value="compliance" className="space-y-8">
            {/* Compliance Score */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>Overall compliance score and certification status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-green-600 mb-2">
                      {complianceReport.overallScore}
                    </div>
                    <div className="text-muted-foreground mb-4">Overall Compliance Score</div>
                    <div className="flex justify-center gap-2">
                      {complianceReport.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Last Audit</span>
                      <span className="font-medium">{complianceReport.lastAudit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Next Audit</span>
                      <span className="font-medium">{complianceReport.nextAudit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Status</span>
                      <Badge variant="secondary" className="text-green-600">
                        Compliant
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Categories</CardTitle>
                <CardDescription>Detailed breakdown by compliance area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complianceReport.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${getStatusColor(category.status)}`}>
                          <Shield className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{category.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {category.status.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">{category.score}</div>
                          <div className="text-sm text-muted-foreground">Score</div>
                        </div>
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              category.score >= 95 ? 'bg-green-500' :
                              category.score >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${category.score}%` }}
                          />
                        </div>
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

export default withAuth(ReportsPage);