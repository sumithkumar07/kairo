'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { StatusIndicator, TrendIndicator } from '@/components/ui/enhanced-status-indicators';
import { ProfessionalMetricCard, MetricsGrid } from '@/components/ui/professional-metric-cards';
import { InteractiveButton } from '@/components/ui/enhanced-interactive-elements';
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
  Brain,
  Sparkles,
  LineChart,
  PieChart,
  BarChart,
  Settings,
  Share,
  FileText,
  Gauge,
  Cpu,
  HardDrive,
  Network,
  Database,
  Monitor,
  Wifi,
  Shield,
  Lock,
  Key,
  AlertTriangle,
  Info,
  ThermometerSun,
  Timer,
  Server,
  Cloud
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  overview: {
    totalWorkflows: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
    totalExecutions: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
    successRate: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
    avgExecutionTime: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
    activeUsers: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
    costSavings: { value: number; change: number; trend: 'up' | 'down' | 'stable' };
  };
  performance: {
    cpuUsage: { current: number; average: number; peak: number; status: 'healthy' | 'warning' | 'critical' };
    memoryUsage: { current: number; average: number; peak: number; status: 'healthy' | 'warning' | 'critical' };
    diskUsage: { current: number; average: number; peak: number; status: 'healthy' | 'warning' | 'critical' };
    networkLatency: { current: string; status: 'healthy' | 'warning' | 'critical' };
    databasePerformance: { 
      connections: number; 
      maxConnections: number; 
      responseTime: string; 
      status: 'healthy' | 'warning' | 'critical' 
    };
  };
  insights: Array<{
    id: string;
    type: 'trend' | 'anomaly' | 'recommendation' | 'alert';
    severity: 'info' | 'warning' | 'critical' | 'success';
    title: string;
    description: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    action?: string;
  }>;
  predictions: Array<{
    id: string;
    metric: string;
    prediction: number;
    confidence: number;
    timeframe: string;
    reasoning: string;
  }>;
}

interface EnhancedAnalyticsDashboardProps {
  className?: string;
}

export function EnhancedAnalyticsDashboard({ className }: EnhancedAnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real app this would come from API
  const [analyticsData] = useState<AnalyticsData>({
    overview: {
      totalWorkflows: { value: 247, change: 12.5, trend: 'up' },
      totalExecutions: { value: 89247, change: 8.3, trend: 'up' },
      successRate: { value: 94.2, change: -1.2, trend: 'down' },
      avgExecutionTime: { value: 2.8, change: -15.7, trend: 'up' },
      activeUsers: { value: 156, change: 23.1, trend: 'up' },
      costSavings: { value: 45289, change: 18.9, trend: 'up' }
    },
    performance: {
      cpuUsage: { current: 45, average: 38, peak: 72, status: 'healthy' },
      memoryUsage: { current: 67, average: 58, peak: 89, status: 'warning' },
      diskUsage: { current: 23, average: 28, peak: 45, status: 'healthy' },
      networkLatency: { current: '23ms', status: 'healthy' },
      databasePerformance: { 
        connections: 15, 
        maxConnections: 100, 
        responseTime: '12ms', 
        status: 'healthy' 
      }
    },
    insights: [
      {
        id: '1',
        type: 'trend',
        severity: 'success',
        title: 'Workflow Performance Improving',
        description: '23% improvement in execution success rate over the last 30 days',
        confidence: 94,
        impact: 'high',
        timestamp: '2 hours ago',
        action: 'View Details'
      },
      {
        id: '2',
        type: 'anomaly',
        severity: 'warning',
        title: 'Unusual API Response Times',
        description: 'Salesforce integration showing 40% slower response times than normal',
        confidence: 87,
        impact: 'medium',
        timestamp: '15 minutes ago',
        action: 'Investigate'
      },
      {
        id: '3',
        type: 'recommendation',
        severity: 'info',
        title: 'Scale Optimization Opportunity',
        description: 'Consider upgrading to premium tier for better performance',
        confidence: 78,
        impact: 'medium',
        timestamp: '1 hour ago',
        action: 'Learn More'
      }
    ],
    predictions: [
      {
        id: '1',
        metric: 'Monthly Executions',
        prediction: 125000,
        confidence: 89,
        timeframe: 'Next 30 days',
        reasoning: 'Based on current growth trend and seasonal patterns'
      },
      {
        id: '2',
        metric: 'Resource Usage',
        prediction: 78,
        confidence: 92,
        timeframe: 'Next 7 days',
        reasoning: 'Historical usage patterns and scheduled workflows'
      }
    ]
  });

  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'anomaly': return AlertTriangle;
      case 'recommendation': return Sparkles;
      case 'alert': return AlertCircle;
      default: return Info;
    }
  };

  const getInsightColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  // Convert analytics data to metric cards format
  const overviewMetrics = [
    {
      id: 'total-workflows',
      title: 'Total Workflows',
      value: analyticsData.overview.totalWorkflows.value,
      change: analyticsData.overview.totalWorkflows.change,
      trend: analyticsData.overview.totalWorkflows.trend,
      changeLabel: 'this month',
      icon: Workflow,
      color: 'text-blue-500',
      category: 'Workflows',
      status: 'healthy' as const,
      isClickable: true
    },
    {
      id: 'total-executions',
      title: 'Total Executions',
      value: formatNumber(analyticsData.overview.totalExecutions.value),
      change: analyticsData.overview.totalExecutions.change,
      trend: analyticsData.overview.totalExecutions.trend,
      changeLabel: 'this month', 
      icon: Zap,
      color: 'text-green-500',
      category: 'Activity',
      status: 'healthy' as const,
      isClickable: true
    },
    {
      id: 'success-rate',
      title: 'Success Rate',
      value: `${analyticsData.overview.successRate.value}%`,
      change: analyticsData.overview.successRate.change,
      trend: analyticsData.overview.successRate.trend,
      changeLabel: 'last 30 days',
      icon: Target,
      color: 'text-purple-500',
      category: 'Performance',
      status: analyticsData.overview.successRate.value > 90 ? 'healthy' as const : 'warning' as const,
      target: 95,
      isClickable: true
    },
    {
      id: 'avg-execution-time',
      title: 'Avg Execution Time',
      value: `${analyticsData.overview.avgExecutionTime.value}s`,
      change: analyticsData.overview.avgExecutionTime.change,
      trend: analyticsData.overview.avgExecutionTime.trend,
      changeLabel: 'faster than last month',
      icon: Clock,
      color: 'text-orange-500', 
      category: 'Performance',
      status: 'healthy' as const,
      unit: 's',
      isClickable: true
    },
    {
      id: 'active-users',
      title: 'Active Users',
      value: analyticsData.overview.activeUsers.value,
      change: analyticsData.overview.activeUsers.change,
      trend: analyticsData.overview.activeUsers.trend,
      changeLabel: 'this month',
      icon: Users,
      color: 'text-teal-500',
      category: 'Users',
      status: 'healthy' as const,
      isClickable: true
    },
    {
      id: 'cost-savings',
      title: 'Cost Savings',
      value: `$${formatNumber(analyticsData.overview.costSavings.value)}`,
      change: analyticsData.overview.costSavings.change,
      trend: analyticsData.overview.costSavings.trend,
      changeLabel: 'this quarter',
      icon: DollarSign,
      color: 'text-yellow-500',
      category: 'Finance',
      status: 'healthy' as const,
      isClickable: true
    }
  ];

  return (
    <div className={cn("space-y-8", className)}>
      {/* Enhanced Header */}
      <Card className="p-8 bg-gradient-to-r from-primary/5 via-purple-500/5 to-cyan-500/5 border-border/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-primary to-purple-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Analytics Intelligence Hub</h1>
              <p className="text-muted-foreground text-lg">
                AI-powered insights, predictive analytics, and real-time performance monitoring
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <StatusIndicator
              status="healthy"
              label="All Systems Operational"
              size="md"
            />
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                checked={autoRefresh} 
                onCheckedChange={setAutoRefresh}
                id="auto-refresh" 
              />
              <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            </div>
            
            <InteractiveButton
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              loading={isLoading}
              icon={RefreshCw}
            >
              Refresh
            </InteractiveButton>
          </div>
        </div>

        {/* AI Insights Preview */}
        <div className="grid md:grid-cols-3 gap-4">
          {analyticsData.insights.slice(0, 3).map((insight) => {
            const InsightIcon = getInsightIcon(insight.type);
            return (
              <Card key={insight.id} className="border border-border/30 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      getInsightColor(insight.severity)
                    )}>
                      <InsightIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                        <span className="text-xs text-muted-foreground">{insight.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Performance Overview</h2>
            <div className="flex items-center gap-4">
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
              
              <InteractiveButton variant="outline" size="sm" icon={Download}>
                Export
              </InteractiveButton>
            </div>
          </div>

          {/* Enhanced Metrics Grid */}
          <MetricsGrid metrics={overviewMetrics} columns={3} />

          {/* Chart Section Placeholder */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Execution Trends
                </CardTitle>
                <CardDescription>
                  Workflow execution patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Interactive execution trend chart would appear here</p>
                    <p className="text-sm">With drill-down capabilities and comparative analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Success Rate Distribution
                </CardTitle>
                <CardDescription>
                  Workflow success rates by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Interactive pie chart would appear here</p>
                    <p className="text-sm">Showing success rate breakdowns by workflow type</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  System Resources
                </CardTitle>
                <CardDescription>Real-time system performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* CPU Usage */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      CPU Usage
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusIndicator 
                        status={analyticsData.performance.cpuUsage.status} 
                        size="sm" 
                        showIcon={false}
                      />
                      <span className="font-medium">{analyticsData.performance.cpuUsage.current}%</span>
                    </div>
                  </div>
                  <Progress value={analyticsData.performance.cpuUsage.current} className="h-2 mb-1" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg: {analyticsData.performance.cpuUsage.average}%</span>
                    <span>Peak: {analyticsData.performance.cpuUsage.peak}%</span>
                  </div>
                </div>

                {/* Memory Usage */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      Memory Usage
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusIndicator 
                        status={analyticsData.performance.memoryUsage.status} 
                        size="sm" 
                        showIcon={false}
                      />
                      <span className="font-medium">{analyticsData.performance.memoryUsage.current}%</span>
                    </div>
                  </div>
                  <Progress value={analyticsData.performance.memoryUsage.current} className="h-2 mb-1" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg: {analyticsData.performance.memoryUsage.average}%</span>
                    <span>Peak: {analyticsData.performance.memoryUsage.peak}%</span>
                  </div>
                </div>

                {/* Disk Usage */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Disk Usage
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusIndicator 
                        status={analyticsData.performance.diskUsage.status} 
                        size="sm" 
                        showIcon={false}
                      />
                      <span className="font-medium">{analyticsData.performance.diskUsage.current}%</span>
                    </div>
                  </div>
                  <Progress value={analyticsData.performance.diskUsage.current} className="h-2 mb-1" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg: {analyticsData.performance.diskUsage.average}%</span>
                    <span>Peak: {analyticsData.performance.diskUsage.peak}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network & Database
                </CardTitle>
                <CardDescription>Connection health and performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Network Latency</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIndicator 
                        status={analyticsData.performance.networkLatency.status} 
                        size="sm" 
                        showIcon={false}
                      />
                      <span className="font-medium">{analyticsData.performance.networkLatency.current}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">DB Connections</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIndicator 
                        status={analyticsData.performance.databasePerformance.status} 
                        size="sm" 
                        showIcon={false}
                      />
                      <span className="font-medium">
                        {analyticsData.performance.databasePerformance.connections}/
                        {analyticsData.performance.databasePerformance.maxConnections}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">DB Response Time</span>
                    </div>
                    <span className="font-medium">{analyticsData.performance.databasePerformance.responseTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
            <InteractiveButton icon={Sparkles} gradient="from-purple-500 to-pink-500">
              Generate New Insights
            </InteractiveButton>
          </div>

          <div className="space-y-4">
            {analyticsData.insights.map((insight) => {
              const InsightIcon = getInsightIcon(insight.type);
              return (
                <Card key={insight.id} className={cn("border", getInsightColor(insight.severity))}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn("p-3 rounded-lg", getInsightColor(insight.severity))}>
                        <InsightIcon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{insight.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {insight.type}
                            </Badge>
                            <Badge 
                              variant={insight.impact === 'critical' ? 'destructive' : 
                                      insight.impact === 'high' ? 'default' : 'secondary'}
                            >
                              {insight.impact} impact
                            </Badge>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Confidence:</span>
                              <Badge variant="secondary">{insight.confidence}%</Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">{insight.timestamp}</span>
                          </div>
                          {insight.action && (
                            <InteractiveButton variant="outline" size="sm">
                              {insight.action}
                            </InteractiveButton>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Predictive Analytics</h2>
            <InteractiveButton icon={Brain} gradient="from-blue-500 to-purple-500">
              Run Predictions
            </InteractiveButton>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {analyticsData.predictions.map((prediction) => (
              <Card key={prediction.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {prediction.metric}
                  </CardTitle>
                  <CardDescription>{prediction.timeframe}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {typeof prediction.prediction === 'number' 
                          ? formatNumber(prediction.prediction)
                          : prediction.prediction}
                      </div>
                      <Badge variant="outline" className="text-sm">
                        {prediction.confidence}% confidence
                      </Badge>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Reasoning:</h4>
                      <p className="text-sm text-muted-foreground">{prediction.reasoning}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Analytics Reports</h2>
            <div className="flex items-center gap-2">
              <InteractiveButton variant="outline" icon={FileText}>
                Create Report
              </InteractiveButton>
              <InteractiveButton icon={Download}>
                Export All
              </InteractiveButton>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Executive Summary', description: 'High-level metrics for leadership', icon: Target },
              { title: 'Performance Report', description: 'Detailed performance analysis', icon: BarChart3 },
              { title: 'Cost Analysis', description: 'ROI and cost breakdown', icon: DollarSign },
              { title: 'Security Report', description: 'Security metrics and compliance', icon: Shield },
              { title: 'User Activity', description: 'Team engagement and usage', icon: Users },
              { title: 'System Health', description: 'Infrastructure performance', icon: Monitor }
            ].map((report, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <report.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                  <InteractiveButton className="w-full" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Report
                  </InteractiveButton>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}