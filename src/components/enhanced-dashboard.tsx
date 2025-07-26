'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchFilterBar } from '@/components/ui/search-filter-bar';
import { StatusIndicator, HealthIndicator } from '@/components/ui/status-indicator';
import { TrendIndicator } from '@/components/ui/trend-indicator';
import { MetricCard, EnhancedCard } from '@/components/ui/enhanced-card';
import { InteractiveButton } from '@/components/ui/interactive-button';
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
  Settings
} from 'lucide-react';

interface DashboardStats {
  totalWorkflows: number;
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  activeIntegrations: number;
  teamMembers: number;
  costs: string;
  certificationsEarned: number;
  monthlyGrowth: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  category: string;
  color: string;
  popular?: boolean;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  timestamp: string;
  metadata?: any;
  category: string;
  user?: string;
}

interface SystemMetrics {
  cpu: { current: number; average: number; peak: number };
  memory: { current: number; average: number; peak: number };
  disk: { current: number; average: number; peak: number };
  network: { latency: string; throughput: string };
  database: { connections: number; maxConnections: number; responseTime: string };
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  time: string;
}

export function EnhancedDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionCategory, setSelectedActionCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');

  const [stats, setStats] = useState<DashboardStats>({
    totalWorkflows: 247,
    totalExecutions: 89247,
    successRate: 94.2,
    avgExecutionTime: 2.8,
    activeIntegrations: 12,
    teamMembers: 8,
    costs: '156.78',
    certificationsEarned: 4,
    monthlyGrowth: 12.5,
    systemHealth: 'excellent' as const
  });

  const [systemMetrics] = useState<SystemMetrics>({
    cpu: { current: 45, average: 38, peak: 72 },
    memory: { current: 67, average: 58, peak: 89 },
    disk: { current: 23, average: 28, peak: 45 },
    network: { latency: '23ms', throughput: '1.2 GB/s' },
    database: { connections: 15, maxConnections: 100, responseTime: '12ms' }
  });

  const [alerts] = useState<Alert[]>([
    { id: '1', type: 'warning', title: 'High Memory Usage', time: '5m ago' },
    { id: '2', type: 'info', title: 'New Integration Available', time: '1h ago' },
    { id: '3', type: 'success', title: 'Certification Earned', time: '2h ago' }
  ]);

  const quickActions: QuickAction[] = [
    {
      id: 'create-workflow',
      title: 'Create Workflow',
      description: 'Build a new automation',
      icon: Plus,
      href: '/workflow',
      category: 'workflows',
      color: 'from-blue-500 to-cyan-500',
      popular: true
    },
    {
      id: 'ai-studio',
      title: 'AI Studio',
      description: 'Generate with AI',
      icon: Brain,
      href: '/ai-studio',
      category: 'ai',
      color: 'from-purple-500 to-pink-500',
      popular: true
    },
    {
      id: 'browse-templates',
      title: 'Browse Templates',
      description: 'Pre-built workflows',
      icon: Code2,
      href: '/templates',
      category: 'workflows',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'browse-integrations',
      title: 'Browse Integrations',
      description: 'Connect your apps',
      icon: Globe,
      href: '/integrations',
      category: 'integrations',
      color: 'from-orange-500 to-red-500',
      popular: true
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'Performance insights',
      icon: BarChart3,
      href: '/analytics',
      category: 'analytics',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'manage-team',
      title: 'Manage Team',
      description: 'Team collaboration',
      icon: Users,
      href: '/account?tab=team',
      category: 'account',
      color: 'from-teal-500 to-blue-500'
    },
    {
      id: 'learning-paths',
      title: 'Learning Paths',
      description: 'Expand your skills',
      icon: BookOpen,
      href: '/learn',
      category: 'learning',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      description: 'Developer resources',
      icon: Code2,
      href: '/learn?tab=api',
      category: 'learning',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  const topWorkflows = [
    {
      id: '1',
      name: 'Lead Nurturing Automation',
      status: 'running',
      executions: 12800,
      successRate: 96.8,
      avgTime: 2.3
    },
    {
      id: '2', 
      name: 'Customer Onboarding',
      status: 'running',
      executions: 8900,
      successRate: 94.1,
      avgTime: 1.8
    },
    {
      id: '3',
      name: 'Invoice Processing',
      status: 'paused',
      executions: 5400,
      successRate: 97.2,
      avgTime: 3.1
    }
  ];

  const integrationHealth = [
    { name: 'Salesforce', status: 'healthy', requests: '1.2k', success: 98.2, latency: '245ms' },
    { name: 'Slack', status: 'healthy', requests: '890', success: 99.1, latency: '120ms' },
    { name: 'Shopify', status: 'warning', requests: '654', success: 94.8, latency: '380ms' }
  ];

  const learningPaths = [
    {
      id: '1',
      title: 'Automation Fundamentals',
      progress: 65,
      totalModules: 12,
      nextModule: 'Advanced Triggers',
      estimatedTime: '2 hours left',
      color: 'text-green-500',
      icon: BookOpen
    },
    {
      id: '2',
      title: 'AI-Powered Workflows',
      progress: 30,
      totalModules: 8,
      nextModule: 'Natural Language Processing',
      estimatedTime: '4 hours left',
      color: 'text-purple-500',
      icon: Brain
    }
  ];

  useEffect(() => {
    loadDashboardData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadDashboardData();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'workflow_run',
          title: 'Lead Nurturing Campaign executed successfully',
          status: 'success',
          timestamp: new Date().toISOString(),
          metadata: { executionTime: '2.3s', recordsProcessed: 156 },
          category: 'workflows',
          user: 'Sarah Johnson'
        },
        {
          id: '2',
          type: 'integration_connected',
          title: 'Shopify integration connected',
          status: 'success',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          metadata: { integration: 'Shopify', version: 'v2.1' },
          category: 'integrations',
          user: 'Michael Chen'
        },
        {
          id: '3',
          type: 'ai_command',
          title: 'AI generated workflow for data processing',
          status: 'success',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          metadata: { command: 'Create a workflow to process customer data from Shopify and sync to HubSpot' },
          category: 'ai',
          user: 'Michael Chen'
        },
        {
          id: '4',
          type: 'certification_earned',
          title: 'Advanced Workflow Design certification earned',
          status: 'success',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          metadata: { score: 94, certification: 'Advanced Workflow Design' },
          category: 'learning',
          user: 'Emily Rodriguez'
        },
        {
          id: '5',
          type: 'team_joined',
          title: 'New team member joined',
          status: 'success',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          metadata: { member: 'Alex Thompson', role: 'Editor' },
          category: 'team',
          user: 'Sarah Johnson'
        }
      ]);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workflow_run': return <Play className="h-4 w-4" />;
      case 'workflow_saved': return <Workflow className="h-4 w-4" />;
      case 'ai_command': return <Brain className="h-4 w-4" />;
      case 'certification_earned': return <Award className="h-4 w-4" />;
      case 'integration_connected': return <Zap className="h-4 w-4" />;
      case 'team_joined': return <Users className="h-4 w-4" />;
      case 'alert_generated': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const filteredActions = quickActions.filter(action => {
    if (selectedActionCategory !== 'all' && action.category !== selectedActionCategory) return false;
    if (searchTerm && !action.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !action.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const filteredActivity = recentActivity.filter(activity => {
    if (activeFilter !== 'all' && activity.category !== activeFilter) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Live Status */}
      <EnhancedCard className="p-8 bg-gradient-to-r from-primary/5 via-purple-500/5 to-cyan-500/5 border-border/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Command Center</h1>
              <p className="text-muted-foreground text-lg">Complete overview of your automation ecosystem</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <HealthIndicator health={stats.systemHealth} size="md" />
            
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
              onClick={loadDashboardData}
              icon={RefreshCw}
            >
              Refresh
            </InteractiveButton>
          </div>
        </div>

        {/* Quick Alerts */}
        {alerts.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {alerts.slice(0, 3).map((alert) => (
              <StatusIndicator 
                key={alert.id}
                status={alert.type === 'warning' ? 'warning' : alert.type === 'info' ? 'pending' : 'success'}
                label={`${alert.title} • ${alert.time}`}
                size="sm"
              />
            ))}
            {alerts.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{alerts.length - 3} more alerts
              </Badge>
            )}
          </div>
        )}
      </EnhancedCard>

      {/* Enhanced Key Metrics - Now with 8 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Workflows"
          value={stats.totalWorkflows}
          icon={Workflow}
          color="text-blue-500"
          trend={{ value: stats.monthlyGrowth, label: 'this month' }}
        />

        <MetricCard
          title="Total Executions"
          value={stats.totalExecutions.toLocaleString()}
          icon={Play}
          color="text-green-500"
          trend={{ value: 8.3, label: 'this month' }}
        />

        <MetricCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={CheckCircle2}
          color="text-purple-500"
          subtitle="Last 30 days"
        />

        <MetricCard
          title="Avg Execution Time"
          value={`${stats.avgExecutionTime}s`}
          icon={Clock}
          color="text-orange-500"
          trend={{ value: 15.7, label: 'faster than last month' }}
        />

        <MetricCard
          title="Active Integrations"
          value={stats.activeIntegrations}
          icon={Globe}
          color="text-indigo-500"
          trend={{ value: 4.2, label: 'this month' }}
        />

        <MetricCard
          title="Team Members"
          value={stats.teamMembers}
          icon={Users}
          color="text-teal-500"
          trend={{ value: 25.0, label: 'team growth' }}
        />

        <MetricCard
          title="Monthly Costs"
          value={`$${stats.costs}`}
          icon={DollarSign}
          color="text-yellow-500"
          trend={{ value: -8.4, label: 'cost reduction' }}
        />

        <MetricCard
          title="Certifications"
          value={stats.certificationsEarned}
          icon={Award}
          color="text-rose-500"
          trend={{ value: 100.0, label: 'this quarter' }}
        />
      </div>

      {/* Enhanced Quick Actions with Search and Filtering */}
      <EnhancedCard>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Jump into common tasks across all platforms</CardDescription>
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
                { value: 'workflows', label: 'Workflows', count: 3 },
                { value: 'integrations', label: 'Integrations', count: 1 },
                { value: 'analytics', label: 'Analytics', count: 1 },
                { value: 'learning', label: 'Learning', count: 2 },
                { value: 'account', label: 'Account', count: 1 },
                { value: 'ai', label: 'AI & Automation', count: 1 }
              ]}
              placeholder="Search actions..."
              showViewToggle={false}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <InteractiveButton
                  key={action.id}
                  variant="outline"
                  className="h-auto p-4 justify-start text-left group hover:shadow-lg transition-all duration-300"
                  asChild
                >
                  <a href={action.href}>
                    <div className="flex items-center gap-3 w-full">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                        <ActionIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{action.title}</p>
                          {action.popular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </a>
                </InteractiveButton>
              );
            })}
          </div>
        </CardContent>
      </EnhancedCard>

      {/* Main Content Tabs - Enhanced with more comprehensive data */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="workflows">Top Workflows</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="integrations">Integration Status</TabsTrigger>
          <TabsTrigger value="learning">Learning Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <EnhancedCard>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest actions across your automation ecosystem</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={activeFilter} onValueChange={setActiveFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Activity</SelectItem>
                      <SelectItem value="workflows">Workflows</SelectItem>
                      <SelectItem value="integrations">Integrations</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="ai">AI</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {filteredActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-colors">
                      <StatusIndicator
                        status={activity.status}
                        showIcon={true}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">{activity.title}</p>
                          <Badge variant="secondary" className="text-xs">
                            {activity.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {format(new Date(activity.timestamp), 'PPp')}
                        </p>
                        {activity.user && (
                          <p className="text-xs text-muted-foreground">by {activity.user}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <EnhancedCard>
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
                  <div key={workflow.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50 hover:bg-card/70 transition-colors">
                    <div className="flex items-center gap-4">
                      <StatusIndicator
                        status={workflow.status === 'running' ? 'active' : 'warning'}
                        showIcon={false}
                        size="sm"
                        animated={workflow.status === 'running'}
                      />
                      <div>
                        <h4 className="font-semibold">{workflow.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          Status: {workflow.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8 text-sm">
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
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <EnhancedCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      CPU Usage
                    </span>
                    <span className="font-medium">{systemMetrics.cpu.current}%</span>
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
                    <span className="font-medium">{systemMetrics.memory.current}%</span>
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
                    <span className="font-medium">{systemMetrics.disk.current}%</span>
                  </div>
                  <Progress value={systemMetrics.disk.current} className="h-2 mb-1" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg: {systemMetrics.disk.average}%</span>
                    <span>Peak: {systemMetrics.disk.peak}%</span>
                  </div>
                </div>
              </CardContent>
            </EnhancedCard>

            <EnhancedCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network & Database
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Network Latency</span>
                    </div>
                    <span className="font-medium">{systemMetrics.network.latency}</span>
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
                    <span className="font-medium">
                      {systemMetrics.database.connections}/{systemMetrics.database.maxConnections}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">DB Response</span>
                    </div>
                    <span className="font-medium">{systemMetrics.database.responseTime}</span>
                  </div>
                </div>
              </CardContent>
            </EnhancedCard>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <EnhancedCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Integration Health
              </CardTitle>
              <CardDescription>Monitor the performance of your connected services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrationHealth.map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                    <div className="flex items-center gap-4">
                      <StatusIndicator
                        status={integration.status === 'healthy' ? 'success' : 'warning'}
                        showIcon={false}
                        size="sm"
                      />
                      <div>
                        <h4 className="font-semibold">{integration.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          Status: {integration.status}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{integration.requests}</div>
                        <div className="text-muted-foreground">Requests</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{integration.success}%</div>
                        <div className="text-muted-foreground">Success</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{integration.latency}</div>
                        <div className="text-muted-foreground">Latency</div>
                      </div>
                      <StatusIndicator
                        status={integration.status === 'healthy' ? 'success' : 'warning'}
                        label={integration.status}
                        size="sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </EnhancedCard>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <EnhancedCard>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Learning Progress
              </CardTitle>
              <CardDescription>Continue your automation journey with personalized learning paths</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {learningPaths.map((path) => {
                  const PathIcon = path.icon;
                  const progressPercentage = Math.round((path.progress / 100) * path.totalModules);
                  
                  return (
                    <div key={path.id} className="group p-6 rounded-lg border bg-card/50 hover:bg-card/70 transition-all duration-300">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-muted rounded-lg group-hover:bg-muted/70 transition-colors">
                          <PathIcon className={`h-6 w-6 ${path.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-lg">{path.title}</h4>
                            <Badge variant="outline" className={`${path.color.replace('text-', 'border-')} ${path.color}`}>
                              {path.progress}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span>{progressPercentage}/{path.totalModules} modules completed</span>
                            <span>•</span>
                            <span>{path.estimatedTime}</span>
                          </div>
                          <Progress value={path.progress} className="h-2 mb-3" />
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              <strong>Next:</strong> {path.nextModule}
                            </p>
                            <InteractiveButton size="sm" className="group-hover:shadow-md transition-shadow">
                              {path.progress > 0 ? (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Continue
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-4 w-4 mr-2" />
                                  Start Learning
                                </>
                              )}
                            </InteractiveButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </EnhancedCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}