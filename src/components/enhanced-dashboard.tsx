'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { EnhancedOnboarding } from './enhanced-onboarding';
import { 
  Workflow, 
  Plus, 
  Play, 
  TrendingUp, 
  Users, 
  Zap, 
  BarChart3, 
  Activity, 
  Bell, 
  Rocket,
  Bot,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  RefreshCw,
  Sparkles,
  Crown,
  Shield,
  Globe,
  ArrowRight,
  Calendar,
  Gauge,
  Cpu,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'workflow_created' | 'workflow_executed' | 'integration_connected' | 'ai_generated';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  icon: React.ComponentType<{ className?: string }>;
}

interface WorkflowStats {
  name: string;
  status: 'active' | 'paused' | 'error';
  executions: number;
  successRate: number;
  lastRun: string;
  performance: number;
}

export function EnhancedDashboard() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate loading real data
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const metrics: DashboardMetric[] = [
    {
      title: 'Active Workflows',
      value: '24',
      change: '+3 this week',
      trend: 'up',
      icon: Workflow,
      color: 'text-blue-600'
    },
    {
      title: 'Total Executions',
      value: '12.4K',
      change: '+18% from last month',
      trend: 'up',
      icon: Play,
      color: 'text-green-600'
    },
    {
      title: 'Success Rate',
      value: '99.2%',
      change: '+0.3% improvement',
      trend: 'up',
      icon: CheckCircle,
      color: 'text-emerald-600'
    },
    {
      title: 'AI Generations',
      value: '156',
      change: '+42 this week',
      trend: 'up',
      icon: Bot,
      color: 'text-purple-600'
    }
  ];

  const recentActivity: RecentActivity[] = [
    {
      id: '1',
      type: 'ai_generated',
      title: 'AI Generated Sales Pipeline',
      description: 'Created automated lead nurturing workflow',
      timestamp: '2 minutes ago',
      status: 'success',
      icon: Bot
    },
    {
      id: '2',
      type: 'workflow_executed',
      title: 'Daily Report Generation',
      description: 'Successfully processed 145 records',
      timestamp: '15 minutes ago',
      status: 'success',
      icon: BarChart3
    },
    {
      id: '3',
      type: 'integration_connected',
      title: 'Slack Integration Added',
      description: 'Connected team communication channel',
      timestamp: '1 hour ago',
      status: 'success',
      icon: Zap
    },
    {
      id: '4',
      type: 'workflow_created',
      title: 'Customer Onboarding Flow',
      description: 'New workflow template created',
      timestamp: '3 hours ago',
      status: 'success',
      icon: Users
    }
  ];

  const workflowStats: WorkflowStats[] = [
    {
      name: 'Sales Lead Processing',
      status: 'active',
      executions: 1243,
      successRate: 98.5,
      lastRun: '5 minutes ago',
      performance: 95
    },
    {
      name: 'Customer Support Routing',
      status: 'active',
      executions: 856,
      successRate: 99.8,
      lastRun: '2 minutes ago',
      performance: 98
    },
    {
      name: 'Invoice Processing',
      status: 'paused',
      executions: 234,
      successRate: 96.2,
      lastRun: '2 hours ago',
      performance: 85
    },
    {
      name: 'Social Media Posting',
      status: 'active',
      executions: 445,
      successRate: 100,
      lastRun: '30 minutes ago',
      performance: 92
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'paused':
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'error':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return CheckCircle;
      case 'paused':
      case 'warning':
        return Clock;
      case 'error':
        return AlertTriangle;
      default:
        return Activity;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-muted rounded-xl"></div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header with Mobile Optimization */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 rounded-2xl" />
        <div className="relative p-4 sm:p-6 lg:p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-primary to-purple-600 rounded-lg">
                  <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Welcome back!
                </h1>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                Your workflows have processed <span className="font-semibold text-primary">2,341 tasks</span> today
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Button onClick={() => setIsOnboardingOpen(true)} variant="outline" className="whitespace-nowrap">
                <Target className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Complete Setup</span>
                <span className="sm:hidden">Setup</span>
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                <Link href="/workflow">
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Create Workflow</span>
                  <span className="sm:hidden">Create</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title} className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={cn('h-4 w-4 sm:h-5 sm:w-5', metric.color)} />
                <Badge variant="outline" className="text-xs">
                  {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xl sm:text-2xl font-bold">{metric.value}</p>
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {metric.title}
                </p>
                <p className="text-xs text-green-600 truncate">
                  {metric.change}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Tabs with Mobile Optimization */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-3 sm:grid-cols-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="workflows" className="text-xs sm:text-sm">Workflows</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm">Activity</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm hidden sm:inline-flex">Analytics</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions - Mobile Optimized */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Get started with common tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: Bot, title: 'Generate with AI', href: '/ai-studio', color: 'purple' },
                  { icon: Target, title: 'Browse Templates', href: '/marketplace', color: 'blue' },
                  { icon: Zap, title: 'Connect Apps', href: '/integrations', color: 'green' },
                  { icon: Crown, title: 'God-Tier Features', href: '/god-tier', color: 'yellow' }
                ].map(({ icon: Icon, title, href, color }) => (
                  <Button
                    key={title}
                    variant="outline"
                    className="w-full justify-start h-12"
                    asChild
                  >
                    <Link href={href}>
                      <Icon className={cn('h-4 w-4 mr-3', {
                        'text-purple-500': color === 'purple',
                        'text-blue-500': color === 'blue',
                        'text-green-500': color === 'green',
                        'text-yellow-500': color === 'yellow'
                      })} />
                      <span className="truncate">{title}</span>
                      <ArrowRight className="h-4 w-4 ml-auto" />
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Status
                </CardTitle>
                <CardDescription>Real-time platform health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'API Gateway', status: 'Operational', uptime: '99.9%', icon: Globe },
                  { name: 'Workflow Engine', status: 'Operational', uptime: '99.8%', icon: Cpu },
                  { name: 'AI Services', status: 'Operational', uptime: '99.7%', icon: Brain },
                  { name: 'Database', status: 'Operational', uptime: '99.9%', icon: Database }
                ].map(({ name, status, uptime, icon: Icon }) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">{uptime} uptime</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      {status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>Monitor your workflow performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflowStats.map((workflow) => {
                  const StatusIcon = getStatusIcon(workflow.status);
                  return (
                    <div key={workflow.name} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <StatusIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{workflow.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>{workflow.executions.toLocaleString()} runs</span>
                            <span>{workflow.successRate}% success</span>
                            <span className="hidden sm:inline">Last run: {workflow.lastRun}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Badge className={getStatusColor(workflow.status)}>
                          {workflow.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates from your workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                      <activity.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{activity.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Analytics dashboard coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Usage Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Gauge className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Real-time metrics coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Onboarding Dialog */}
      <EnhancedOnboarding
        open={isOnboardingOpen}
        onOpenChange={setIsOnboardingOpen}
        onComplete={() => {
          setIsOnboardingOpen(false);
          // Show success toast or celebration
        }}
      />
    </div>
  );
}