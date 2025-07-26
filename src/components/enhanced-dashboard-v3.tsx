'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

import { 
  Play, 
  Workflow, 
  Users, 
  Globe, 
  Clock,
  DollarSign,
  Award,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Filter,
  Search,
  RefreshCw,
  Eye,
  AlertTriangle,
  Info,
  Sparkles,
  Target,
  Brain,
  Zap,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Database,
  Network,
  Gauge,
  BookOpen,
  BarChart3,
  Plus,
  ArrowRight,
  Code2,
  Palette,
  MessageSquare,
  Settings,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  ChevronRight,
  Layers,
  Timer,
  Server,
  Smartphone,
  Bell,
  Calendar,
  FileText,
  Mail,
  CreditCard,
  Shield,
  Building,
  LineChart,
  PieChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  action?: string;
  dismissed?: boolean;
}

interface WorkflowSummary {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'stopped' | 'error';
  executions: number;
  successRate: number;
  avgTime: number;
  lastRun: string;
  category: string;
}

interface IntegrationHealth {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  requests: number;
  successRate: number;
  avgLatency: number;
  lastCheck: string;
}

export function EnhancedDashboardV3() {
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionCategory, setSelectedActionCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  // Enhanced state management
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'success',
      title: 'Performance Optimization Complete',
      message: 'System performance improved by 15% after recent optimizations',
      timestamp: '5 minutes ago',
      action: 'View Details'
    },
    {
      id: '2',
      type: 'warning',
      title: 'High Memory Usage Detected',
      message: 'Memory usage is at 87%. Consider reviewing large workflows',
      timestamp: '1 hour ago',
      action: 'Investigate'
    }
  ]);

  // Enhanced metrics with comprehensive data
  const [dashboardMetrics] = useState([
    {
      ...METRIC_PRESETS.totalWorkflows,
      value: 247,
      previousValue: 235,
      change: 12.5,
      trend: 'up' as const,
      changeLabel: 'this month',
      target: 300,
      sparklineData: [
        { value: 200, timestamp: '2024-01-01' },
        { value: 215, timestamp: '2024-01-08' },
        { value: 235, timestamp: '2024-01-15' },
        { value: 247, timestamp: '2024-01-22' }
      ]
    },
    {
      ...METRIC_PRESETS.executions,
      value: 89247,
      previousValue: 82134,
      change: 8.3,
      trend: 'up' as const,
      changeLabel: 'this month',
      sparklineData: [
        { value: 70000, timestamp: '2024-01-01' },
        { value: 75000, timestamp: '2024-01-08' },
        { value: 82134, timestamp: '2024-01-15' },
        { value: 89247, timestamp: '2024-01-22' }
      ]
    },
    {
      ...METRIC_PRESETS.successRate,
      value: 94.2,
      previousValue: 95.4,
      change: -1.2,
      trend: 'down' as const,
      changeLabel: 'last 30 days',
      target: 95,
      status: 'warning' as const
    },
    {
      ...METRIC_PRESETS.avgExecutionTime,
      value: 2.8,
      previousValue: 3.32,
      change: 15.7,
      trend: 'up' as const,
      changeLabel: 'improvement this month',
      unit: 's'
    },
    {
      id: 'active-integrations',
      title: 'Active Integrations',
      value: 12,
      previousValue: 11,
      change: 9.1,
      trend: 'up' as const,
      changeLabel: 'new integrations',
      icon: Globe,
      color: 'text-indigo-500',
      category: 'Integrations',
      status: 'healthy' as const,
      isClickable: true
    },
    {
      ...METRIC_PRESETS.teamMembers,
      value: 8,
      previousValue: 6,
      change: 33.3,
      trend: 'up' as const,
      changeLabel: 'team growth'
    },
    {
      ...METRIC_PRESETS.monthlyCosts,
      value: '$156.78',
      previousValue: '$171.45',
      change: -8.6,
      trend: 'up' as const,
      changeLabel: 'cost reduction'
    },
    {
      id: 'ai-operations',
      title: 'AI Operations',
      value: 1247,
      previousValue: 934,
      change: 33.5,
      trend: 'up' as const,
      changeLabel: 'AI-powered executions',
      icon: Brain,
      color: 'text-purple-500',
      category: 'AI',
      status: 'healthy' as const,
      isClickable: true
    }
  ]);

  // Enhanced system metrics
  const [systemMetrics] = useState({
    cpu: { current: 45, average: 38, peak: 72, status: 'healthy' as const },
    memory: { current: 67, average: 58, peak: 89, status: 'warning' as const },
    disk: { current: 23, average: 28, peak: 45, status: 'healthy' as const },
    network: { latency: '23ms', throughput: '1.2 GB/s', status: 'healthy' as const },
    database: { connections: 15, maxConnections: 100, responseTime: '12ms', status: 'healthy' as const }
  });

  // Enhanced workflow summaries
  const [topWorkflows] = useState<WorkflowSummary[]>([
    {
      id: '1',
      name: 'Lead Nurturing Automation',
      status: 'running',
      executions: 12847,
      successRate: 96.8,
      avgTime: 2.3,
      lastRun: '2 minutes ago',
      category: 'Marketing'
    },
    {
      id: '2',
      name: 'Customer Onboarding Flow',
      status: 'running',
      executions: 8934,
      successRate: 94.1,
      avgTime: 1.8,
      lastRun: '5 minutes ago',
      category: 'Customer Success'
    },
    {
      id: '3',
      name: 'Invoice Processing Pipeline',
      status: 'paused',
      executions: 5476,
      successRate: 97.2,
      avgTime: 3.1,
      lastRun: '1 hour ago',
      category: 'Finance'
    }
  ]);

  // Enhanced integration health
  const [integrationHealth] = useState<IntegrationHealth[]>([
    {
      id: '1',
      name: 'Salesforce',
      status: 'healthy',
      requests: 1247,
      successRate: 98.2,
      avgLatency: 245,
      lastCheck: '1 minute ago'
    },
    {
      id: '2',
      name: 'Slack',
      status: 'healthy',
      requests: 890,
      successRate: 99.1,
      avgLatency: 120,
      lastCheck: '2 minutes ago'
    },
    {
      id: '3',
      name: 'Shopify',
      status: 'warning',
      requests: 654,
      successRate: 94.8,
      avgLatency: 380,
      lastCheck: '3 minutes ago'
    }
  ]);

  // Enhanced quick actions
  const enhancedQuickActions = [
    {
      ...QUICK_ACTIONS.createWorkflow,
      onClick: () => console.log('Create workflow clicked')
    },
    {
      ...QUICK_ACTIONS.aiStudio,
      onClick: () => console.log('AI Studio clicked')
    },
    {
      ...QUICK_ACTIONS.browseTemplates,
      onClick: () => console.log('Browse templates clicked')
    },
    {
      ...QUICK_ACTIONS.integrations,
      onClick: () => console.log('Integrations clicked')
    },
    {
      ...QUICK_ACTIONS.analytics,
      onClick: () => console.log('Analytics clicked')
    },
    {
      ...QUICK_ACTIONS.teamManagement,
      onClick: () => console.log('Team management clicked')
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);
      setLastUpdated(new Date());
    };

    loadData();
    
    if (autoRefresh) {
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filteredActions = enhancedQuickActions.filter(action => {
    if (selectedActionCategory !== 'all' && action.category !== selectedActionCategory) return false;
    if (searchTerm && !action.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !action.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const dismissAlert = (alertId: string) => {
    setSystemAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with System Alerts */}
      <Card className="p-8 bg-gradient-to-r from-primary/5 via-purple-500/5 to-cyan-500/5 border-border/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-primary to-purple-600 rounded-xl shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Command Center
              </h1>
              <p className="text-muted-foreground text-lg">
                Advanced automation intelligence with predictive insights
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <HealthIndicator health="excellent" size="md" />
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Updated {format(lastUpdated, 'HH:mm:ss')}</span>
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
              icon={RefreshCw}
              onClick={() => {
                setLastUpdated(new Date());
              }}
            >
              Refresh
            </InteractiveButton>
          </div>
        </div>

        {/* System Alerts */}
        {systemAlerts.some(alert => !alert.dismissed) && (
          <div className="space-y-3 mb-6">
            {systemAlerts
              .filter(alert => !alert.dismissed)
              .slice(0, 2)
              .map((alert) => (
                <div key={alert.id} className={cn(
                  "flex items-center justify-between p-4 rounded-lg border",
                  alert.type === 'success' && "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
                  alert.type === 'warning' && "bg-yellow-50/50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800",
                  alert.type === 'error' && "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
                  alert.type === 'info' && "bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800"
                )}>
                  <div className="flex items-center gap-3">
                    <StatusIndicator 
                      status={alert.type === 'success' ? 'success' : 
                             alert.type === 'warning' ? 'warning' : 
                             alert.type === 'error' ? 'error' : 'info'}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                    {alert.action && (
                      <InteractiveButton variant="outline" size="sm">
                        {alert.action}
                      </InteractiveButton>
                    )}
                    <InteractiveButton 
                      variant="ghost" 
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      ×
                    </InteractiveButton>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* AI Insights Preview */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border border-border/30 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Performance Trending Up</p>
                  <p className="text-xs text-muted-foreground">Success rate improved 15% this week</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-border/30 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Brain className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">AI Optimization Ready</p>
                  <p className="text-xs text-muted-foreground">3 workflows can benefit from AI enhancement</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border border-border/30 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Target className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Cost Optimization</p>
                  <p className="text-xs text-muted-foreground">Potential $45/month savings identified</p>
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>

      {/* Enhanced Professional Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Performance Metrics</h2>
          <div className="flex items-center gap-4">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
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
            <InteractiveButton variant="outline" size="sm" icon={BarChart3}>
              View Details
            </InteractiveButton>
          </div>
        </div>
        
        <MetricsGrid 
          metrics={dashboardMetrics} 
          columns={4}
          className="mb-8"
        />
      </div>

      {/* Enhanced Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Jump into common tasks with enhanced workflows</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <SearchFilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedFilter={selectedActionCategory}
              onFilterChange={setSelectedActionCategory}
              filterOptions={[
                { value: 'all', label: 'All Categories' },
                { value: 'Creation', label: 'Creation', count: 1 },
                { value: 'AI', label: 'AI & Automation', count: 1 },
                { value: 'Templates', label: 'Templates', count: 1 },
                { value: 'Integration', label: 'Integration', count: 1 },
                { value: 'Analytics', label: 'Analytics', count: 1 },
                { value: 'Team', label: 'Team', count: 1 }
              ]}
              placeholder="Search actions..."
              showViewToggle={false}
            />
          </div>
          
          <QuickActionGrid 
            actions={filteredActions}
            columns={3}
          />
        </CardContent>
      </Card>

      {/* Enhanced Main Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Activity
              </CardTitle>
              <CardDescription>Live updates from your automation ecosystem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Activity Stream Coming Soon</p>
                <p>Real-time workflow executions, team activities, and system events will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Top Performing Workflows
              </CardTitle>
              <CardDescription>Your most active and successful automations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topWorkflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                    <div className="flex items-center gap-4">
                      <StatusIndicator
                        status={workflow.status === 'running' ? 'active' : 
                               workflow.status === 'paused' ? 'paused' : 
                               workflow.status === 'error' ? 'error' : 'inactive'}
                        size="sm"
                        animated={workflow.status === 'running'}
                      />
                      <div>
                        <h4 className="font-semibold">{workflow.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {workflow.category} • Last run: {workflow.lastRun}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{workflow.executions.toLocaleString()}</div>
                        <div className="text-muted-foreground">Executions</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{workflow.successRate}%</div>
                        <div className="text-muted-foreground">Success</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{workflow.avgTime}s</div>
                        <div className="text-muted-foreground">Avg Time</div>
                      </div>
                      <InteractiveButton variant="outline" size="sm" icon={Eye}>
                        View
                      </InteractiveButton>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  System Resources
                </CardTitle>
                <CardDescription>Real-time performance monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      CPU Usage
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusIndicator status={systemMetrics.cpu.status} size="sm" showIcon={false} />
                      <span className="font-medium">{systemMetrics.cpu.current}%</span>
                    </div>
                  </div>
                  <Progress value={systemMetrics.cpu.current} className="h-2 mb-1" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg: {systemMetrics.cpu.average}%</span>
                    <span>Peak: {systemMetrics.cpu.peak}%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      Memory Usage
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusIndicator status={systemMetrics.memory.status} size="sm" showIcon={false} />
                      <span className="font-medium">{systemMetrics.memory.current}%</span>
                    </div>
                  </div>
                  <Progress value={systemMetrics.memory.current} className="h-2 mb-1" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg: {systemMetrics.memory.average}%</span>
                    <span>Peak: {systemMetrics.memory.peak}%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Disk Usage
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusIndicator status={systemMetrics.disk.status} size="sm" showIcon={false} />
                      <span className="font-medium">{systemMetrics.disk.current}%</span>
                    </div>
                  </div>
                  <Progress value={systemMetrics.disk.current} className="h-2 mb-1" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg: {systemMetrics.disk.average}%</span>
                    <span>Peak: {systemMetrics.disk.peak}%</span>
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
                      <StatusIndicator status={systemMetrics.network.status} size="sm" showIcon={false} />
                      <span className="font-medium">{systemMetrics.network.latency}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Throughput</span>
                    </div>
                    <span className="font-medium">{systemMetrics.network.throughput}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">DB Connections</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIndicator status={systemMetrics.database.status} size="sm" showIcon={false} />
                      <span className="font-medium">
                        {systemMetrics.database.connections}/{systemMetrics.database.maxConnections}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">DB Response</span>
                    </div>
                    <span className="font-medium">{systemMetrics.database.responseTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Integration Health Monitor
              </CardTitle>
              <CardDescription>Real-time status of your connected services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrationHealth.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-4">
                      <StatusIndicator
                        status={integration.status === 'healthy' ? 'success' : 
                               integration.status === 'warning' ? 'warning' : 'error'}
                        size="sm"
                      />
                      <div>
                        <h4 className="font-semibold">{integration.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Last check: {integration.lastCheck}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{integration.requests.toLocaleString()}</div>
                        <div className="text-muted-foreground">Requests</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{integration.successRate}%</div>
                        <div className="text-muted-foreground">Success</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{integration.avgLatency}ms</div>
                        <div className="text-muted-foreground">Latency</div>
                      </div>
                      <StatusIndicator
                        status={integration.status === 'healthy' ? 'success' : 
                               integration.status === 'warning' ? 'warning' : 'error'}
                        label={integration.status}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>Intelligent recommendations and trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">AI Insights Engine</p>
                <p>Advanced predictive analytics, anomaly detection, and optimization recommendations</p>
                <InteractiveButton 
                  className="mt-4" 
                  icon={Sparkles}
                  gradient="from-purple-500 to-pink-500"
                >
                  Generate Insights
                </InteractiveButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}