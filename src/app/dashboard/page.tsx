'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/app-layout';
import { withAuth } from '@/components/auth/with-auth';
import Link from 'next/link';
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Calendar,
  Activity,
  Settings,
  Bell,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Copy,
  Share,
  Star,
  Rocket,
  Bot,
  Database,
  Mail,
  Smartphone,
  Globe,
  ArrowRight,
  ChevronRight,
  MoreVertical,
  RefreshCw,
  Target,
  Brain,
  Sparkles,
  Timer,
  Shield,
  Award,
  Layers,
  Search,
  SortAsc,
  Grid,
  List
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

// Mock data - in real app this would come from API
const workflows = [
  {
    id: '1',
    name: 'Customer Onboarding Flow',
    description: 'Automated welcome email sequence and CRM sync',
    status: 'active',
    lastRun: '2 hours ago',
    success: 98.5,
    runs: 1247,
    category: 'Marketing',
    nodes: 12,
    integrations: ['Mailchimp', 'Salesforce', 'Slack'],
    created: '2024-01-15',
    isStarred: true
  },
  {
    id: '2',
    name: 'Invoice Processing Pipeline',
    description: 'Extract data from invoices and update accounting system',
    status: 'active',
    lastRun: '30 minutes ago',
    success: 95.2,
    runs: 892,
    category: 'Finance',
    nodes: 8,
    integrations: ['QuickBooks', 'AWS S3', 'Stripe'],
    created: '2024-01-20',
    isStarred: false
  },
  {
    id: '3',
    name: 'Social Media Analytics',
    description: 'Collect and analyze social media metrics daily',
    status: 'paused',
    lastRun: '1 day ago',
    success: 92.8,
    runs: 456,
    category: 'Analytics',
    nodes: 15,
    integrations: ['Twitter', 'Google Analytics', 'Notion'],
    created: '2024-01-25',
    isStarred: false
  },
  {
    id: '4',
    name: 'Support Ticket Routing',
    description: 'Intelligent ticket assignment and priority setting',
    status: 'active',
    lastRun: '5 minutes ago',
    success: 99.1,
    runs: 2341,
    category: 'Support',
    nodes: 18,
    integrations: ['Zendesk', 'Slack', 'Mistral AI'],
    created: '2024-02-01',
    isStarred: true
  }
];

const recentRuns = [
  { id: '1', workflow: 'Customer Onboarding Flow', status: 'success', duration: '2.3s', time: '5 minutes ago' },
  { id: '2', workflow: 'Invoice Processing Pipeline', status: 'success', duration: '1.8s', time: '12 minutes ago' },
  { id: '3', workflow: 'Support Ticket Routing', status: 'success', duration: '0.9s', time: '18 minutes ago' },
  { id: '4', workflow: 'Customer Onboarding Flow', status: 'failed', duration: '3.2s', time: '25 minutes ago' },
  { id: '5', workflow: 'Social Media Analytics', status: 'success', duration: '4.1s', time: '1 hour ago' }
];

const stats = [
  {
    title: 'Total Workflows',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: Workflow,
    color: 'text-blue-500'
  },
  {
    title: 'Successful Runs',
    value: '1,247',
    change: '+23%',
    trend: 'up',
    icon: CheckCircle,
    color: 'text-green-500'
  },
  {
    title: 'Active Integrations',
    value: '18',
    change: '+3',
    trend: 'up',
    icon: Globe,
    color: 'text-purple-500'
  },
  {
    title: 'Avg Response Time',
    value: '1.4s',
    change: '-15%',
    trend: 'down',
    icon: Timer,
    color: 'text-orange-500'
  }
];

const quickActions = [
  {
    title: 'Create Workflow',
    description: 'Build a new automation from scratch',
    icon: Plus,
    href: '/workflow',
    color: 'bg-blue-500'
  },
  {
    title: 'AI Generator',
    description: 'Generate workflow with Mistral AI',
    icon: Brain,
    href: '/workflow?ai=true',
    color: 'bg-purple-500'
  },
  {
    title: 'Templates',
    description: 'Start from proven templates',
    icon: Layers,
    href: '/templates',
    color: 'bg-green-500'
  },
  {
    title: 'Integrations',
    description: 'Connect your favorite tools',
    icon: Globe,
    href: '/integrations',
    color: 'bg-orange-500'
  }
];

function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const { hasProFeatures, user } = useSubscription();

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesCategory = selectedCategory === 'all' || workflow.category.toLowerCase() === selectedCategory;
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-500/10';
      case 'paused': return 'text-yellow-500 bg-yellow-500/10';
      case 'error': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getRunStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'running': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.displayName || 'User'}! Here's your automation overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm" asChild>
              <Link href="/workflow">
                <Plus className="h-4 w-4 mr-2" />
                New Workflow
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className={`text-xs flex items-center gap-1 mt-1 ${
                      stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      <TrendingUp className={`h-3 w-3 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-muted/50`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Get started with common tasks and workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-3 hover:shadow-md transition-all"
                  asChild
                >
                  <Link href={action.href}>
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Activity
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-6">
            {/* Workflow Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={selectedCategory === 'marketing' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('marketing')}
                    >
                      Marketing
                    </Button>
                    <Button
                      variant={selectedCategory === 'finance' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('finance')}
                    >
                      Finance
                    </Button>
                    <Button
                      variant={selectedCategory === 'support' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('support')}
                    >
                      Support
                    </Button>
                    <Button
                      variant={selectedCategory === 'analytics' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('analytics')}
                    >
                      Analytics
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search workflows..."
                        className="pl-10 pr-4 py-2 border rounded-md text-sm w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    >
                      {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflows Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredWorkflows.map((workflow) => (
                <Card key={workflow.id} className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg font-semibold line-clamp-1">
                            {workflow.name}
                          </CardTitle>
                          {workflow.isStarred && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {workflow.description}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                      <Badge variant="outline">
                        {workflow.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <div className="flex items-center gap-2">
                          <Progress value={workflow.success} className="flex-1 h-2" />
                          <span className="font-medium">{workflow.success}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Runs</p>
                        <p className="font-medium">{workflow.runs.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Integrations</p>
                      <div className="flex flex-wrap gap-1">
                        {workflow.integrations.slice(0, 3).map((integration, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {integration}
                          </Badge>
                        ))}
                        {workflow.integrations.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{workflow.integrations.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-sm text-muted-foreground">
                        Last run: {workflow.lastRun}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/workflow/${workflow.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/workflow/${workflow.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredWorkflows.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Workflow className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No workflows found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Try adjusting your search criteria' : 'Create your first workflow to get started'}
                  </p>
                  <Button asChild>
                    <Link href="/workflow">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Workflow
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Workflow Runs</CardTitle>
                <CardDescription>
                  Latest execution results from your workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRuns.map((run) => (
                    <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${getRunStatusColor(run.status)}`}>
                          {run.status === 'success' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : run.status === 'failed' ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{run.workflow}</p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {run.duration} • {run.time}
                          </p>
                        </div>
                      </div>
                      <Badge variant={run.status === 'success' ? 'default' : 'destructive'}>
                        {run.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>
                    Workflow execution statistics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Executions</span>
                      <span className="font-medium">4,936</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Success Rate</span>
                      <span className="font-medium text-green-500">96.8%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Duration</span>
                      <span className="font-medium">1.4s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Error Rate</span>
                      <span className="font-medium text-red-500">3.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage</CardTitle>
                  <CardDescription>
                    Current plan utilization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Workflow Runs</span>
                        <span className="text-sm text-muted-foreground">1,247 / 10,000</span>
                      </div>
                      <Progress value={12.47} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Active Workflows</span>
                        <span className="text-sm text-muted-foreground">24 / 100</span>
                      </div>
                      <Progress value={24} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">API Calls</span>
                        <span className="text-sm text-muted-foreground">8,432 / 50,000</span>
                      </div>
                      <Progress value={16.86} className="h-2" />
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

export default withAuth(DashboardPage);