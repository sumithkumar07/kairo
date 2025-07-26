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
  Smartphone
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced Metric Card Component with Professional Features
function EnhancedMetricCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  subtitle,
  onClick,
  className,
  showSparkline = false,
  status = 'healthy'
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: { value: number; label: string };
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  showSparkline?: boolean;
  status?: 'healthy' | 'warning' | 'critical';
}) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case 'healthy': return 'border-green-500/20 bg-green-50/50 dark:bg-green-950/20';
      case 'warning': return 'border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-950/20';
      case 'critical': return 'border-red-500/20 bg-red-50/50 dark:bg-red-950/20';
      default: return 'border-border/50';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (trend.value < 0) return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        getStatusColor(),
        onClick && "cursor-pointer hover:shadow-xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Animated Background */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 transition-opacity duration-500",
        isHovered && "opacity-10",
        color.includes('blue') && "bg-gradient-to-br from-blue-500/30 to-cyan-500/30",
        color.includes('green') && "bg-gradient-to-br from-green-500/30 to-emerald-500/30",
        color.includes('purple') && "bg-gradient-to-br from-purple-500/30 to-pink-500/30"
      )} style={{ transform: 'translate(50%, -50%)' }} />

      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110",
              color.includes('blue') && "bg-gradient-to-r from-blue-500 to-cyan-500",
              color.includes('green') && "bg-gradient-to-r from-green-500 to-emerald-500",
              color.includes('purple') && "bg-gradient-to-r from-purple-500 to-pink-500",
              color.includes('orange') && "bg-gradient-to-r from-orange-500 to-yellow-500"
            )}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </CardTitle>
              {subtitle && (
                <CardDescription className="text-xs">
                  {subtitle}
                </CardDescription>
              )}
            </div>
          </div>
          
          {/* Hover Actions */}
          <div className={cn(
            "flex items-center gap-1 opacity-0 transition-opacity duration-200",
            isHovered && "opacity-100"
          )}>
            {showSparkline && (
              <div className="h-8 w-16 flex items-center">
                <svg width="100%" height="100%" viewBox="0 0 100 50" className={color}>
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    points="0,40 25,30 50,35 75,20 100,25"
                  />
                </svg>
              </div>
            )}
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Eye className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-end justify-between mb-3">
          <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {value}
          </div>
          
          {trend && (
            <div className="flex items-center gap-1 text-sm font-medium">
              {getTrendIcon()}
              <span className={trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-gray-600'}>
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>

        {trend && (
          <p className="text-xs text-muted-foreground mb-2">
            {trend.label}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Badge variant={status === 'healthy' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'} className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            {status}
          </Badge>
          
          {onClick && (
            <ChevronRight className={cn(
              "h-4 w-4 text-muted-foreground transition-all duration-200",
              isHovered && "translate-x-1 text-foreground"
            )} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Search and Filter Bar
function SearchFilterBar({
  searchTerm,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  filterOptions,
  placeholder = "Search...",
  showViewToggle = true
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedFilter: string;
  onFilterChange: (value: string) => void;
  filterOptions: Array<{ value: string; label: string; count?: number }>;
  placeholder?: string;
  showViewToggle?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-muted/50 border-none focus:bg-background"
        />
      </div>
      <Select value={selectedFilter} onValueChange={onFilterChange}>
        <SelectTrigger className="w-40">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {filterOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {option.count !== undefined && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {option.count}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showViewToggle && (
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <BarChart3 className="h-3 w-3" />
          </Button>
          <Button variant="default" size="sm" className="h-7 w-7 p-0">
            <Layers className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function EnhancedDashboardV2() {
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionCategory, setSelectedActionCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');

  // Enhanced metrics with professional data
  const [stats] = useState({
    totalWorkflows: { value: 247, change: 12.5, status: 'healthy' as const },
    totalExecutions: { value: 89247, change: 8.3, status: 'healthy' as const },
    successRate: { value: 94.2, change: -1.2, status: 'warning' as const },
    avgExecutionTime: { value: 2.8, change: -15.7, status: 'healthy' as const },
    activeIntegrations: { value: 12, change: 4.2, status: 'healthy' as const },
    teamMembers: { value: 8, change: 25.0, status: 'healthy' as const },
    costs: { value: '156.78', change: -8.4, status: 'healthy' as const },
    certificationsEarned: { value: 4, change: 100.0, status: 'healthy' as const },
    monthlyGrowth: 12.5,
    systemHealth: 'excellent' as const
  });

  // Enhanced system metrics
  const [systemMetrics] = useState({
    cpu: { current: 45, average: 38, peak: 72, status: 'healthy' as const },
    memory: { current: 67, average: 58, peak: 89, status: 'warning' as const },
    disk: { current: 23, average: 28, peak: 45, status: 'healthy' as const },
    network: { latency: '23ms', throughput: '1.2 GB/s', status: 'healthy' as const },
    database: { connections: 15, maxConnections: 100, responseTime: '12ms', status: 'healthy' as const }
  });

  // Enhanced quick actions with better categorization
  const quickActions = [
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
    }
  ];

  const [recentActivity] = useState([
    {
      id: '1',
      type: 'workflow_run',
      title: 'Lead Nurturing Campaign executed successfully',
      status: 'success' as const,
      timestamp: new Date().toISOString(),
      metadata: { executionTime: '2.3s', recordsProcessed: 156 },
      category: 'workflows',
      user: 'Sarah Johnson'
    },
    {
      id: '2',
      type: 'integration_connected',
      title: 'Shopify integration connected',
      status: 'success' as const,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      metadata: { integration: 'Shopify', version: 'v2.1' },
      category: 'integrations',
      user: 'Michael Chen'
    }
  ]);

  // AI-powered insights
  const [insights] = useState([
    {
      id: '1',
      type: 'trend',
      severity: 'success' as const,
      title: 'Workflow Performance Improving',
      description: '23% improvement in execution success rate over the last 30 days',
      confidence: 94,
      impact: 'high' as const,
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'anomaly',
      severity: 'warning' as const,
      title: 'Unusual API Response Times',
      description: 'Salesforce integration showing 40% slower response times than normal',
      confidence: 87,
      impact: 'medium' as const,
      timestamp: '15 minutes ago'
    }
  ]);

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

  const filteredActions = quickActions.filter(action => {
    if (selectedActionCategory !== 'all' && action.category !== selectedActionCategory) return false;
    if (searchTerm && !action.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !action.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
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
      {/* Enhanced Header */}
      <Card className="p-8 bg-gradient-to-r from-primary/5 via-purple-500/5 to-cyan-500/5 border-border/50">
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
            <Badge variant="outline" className="flex items-center gap-2">
              <Activity className="h-3 w-3 text-green-500" />
              All Systems Operational
            </Badge>
            
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
            
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* AI Insights Preview */}
        <div className="grid md:grid-cols-2 gap-4">
          {insights.slice(0, 2).map((insight) => (
            <div key={insight.id} className="p-4 rounded-lg bg-card/50 border border-border/30">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  insight.severity === 'success' && "bg-green-500/10 text-green-500",
                  insight.severity === 'warning' && "bg-yellow-500/10 text-yellow-500"
                )}>
                  {insight.type === 'trend' ? <TrendingUp className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {insight.confidence}% confidence
                    </Badge>
                    <span className="text-xs text-muted-foreground">{insight.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Enhanced Key Metrics - Professional 4x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedMetricCard
          title="Total Workflows"
          value={stats.totalWorkflows.value}
          icon={Workflow}
          color="text-blue-500"
          trend={{ value: stats.totalWorkflows.change, label: 'this month' }}
          status={stats.totalWorkflows.status}
          showSparkline={true}
        />

        <EnhancedMetricCard
          title="Total Executions"
          value={stats.totalExecutions.value.toLocaleString()}
          icon={Play}
          color="text-green-500"
          trend={{ value: stats.totalExecutions.change, label: 'this month' }}
          status={stats.totalExecutions.status}
          showSparkline={true}
        />

        <EnhancedMetricCard
          title="Success Rate"
          value={`${stats.successRate.value}%`}
          icon={CheckCircle2}
          color="text-purple-500"
          trend={{ value: stats.successRate.change, label: 'last 30 days' }}
          status={stats.successRate.status}
          subtitle="Last 30 days"
        />

        <EnhancedMetricCard
          title="Avg Execution Time"
          value={`${stats.avgExecutionTime.value}s`}
          icon={Clock}
          color="text-orange-500"
          trend={{ value: stats.avgExecutionTime.change, label: 'faster than last month' }}
          status={stats.avgExecutionTime.status}
        />

        <EnhancedMetricCard
          title="Active Integrations"
          value={stats.activeIntegrations.value}
          icon={Globe}
          color="text-indigo-500"
          trend={{ value: stats.activeIntegrations.change, label: 'this month' }}
          status={stats.activeIntegrations.status}
        />

        <EnhancedMetricCard
          title="Team Members"
          value={stats.teamMembers.value}
          icon={Users}
          color="text-teal-500"
          trend={{ value: stats.teamMembers.change, label: 'team growth' }}
          status={stats.teamMembers.status}
        />

        <EnhancedMetricCard
          title="Monthly Costs"
          value={`$${stats.costs.value}`}
          icon={DollarSign}
          color="text-yellow-500"
          trend={{ value: stats.costs.change, label: 'cost reduction' }}
          status={stats.costs.status}
        />

        <EnhancedMetricCard
          title="Certifications"
          value={stats.certificationsEarned.value}
          icon={Award}
          color="text-rose-500"
          trend={{ value: stats.certificationsEarned.change, label: 'this quarter' }}
          status={stats.certificationsEarned.status}
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
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto p-4 justify-start text-left group hover:shadow-lg transition-all duration-300"
                  asChild
                >
                  <a href={action.href}>
                    <div className="flex items-center gap-3 w-full">
                      <div className={cn(
                        "p-2 rounded-lg bg-gradient-to-r group-hover:scale-110 transition-transform duration-300",
                        action.color
                      )}>
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
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced System Health Monitoring */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              System Resources
            </CardTitle>
            <CardDescription>Real-time system performance metrics</CardDescription>
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
                  <Timer className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">DB Response</span>
                </div>
                <span className="font-medium">{systemMetrics.database.responseTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}