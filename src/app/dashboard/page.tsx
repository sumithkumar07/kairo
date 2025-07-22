'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, StatsCard, FeatureCard, MetricCard } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/enhanced-button';
import { SearchInput } from '@/components/ui/enhanced-input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardLayout } from '@/components/layout/enhanced-app-layout';
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
  List,
  LineChart,
  PieChart,
  Gauge,
  Flame,
  Fingerprint,
  Cpu,
  MousePointer,
  Palette,
  Wand2,
  Infinity,
  Lock,
  Boxes,
  FlaskConical,
  Microscope,
  Megaphone,
  Compass,
  Radar,
  Wrench,
  Cog,
  Crosshair,
  Sliders,
  AlertCircle,
  Lightbulb,
  Building,
  Headphones,
  FileText,
  Code,
  CreditCard,
  Network,
  Container,
  Zap as ZapIcon,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RotateCcw,
  FastForward,
  CloudLightning,
  Workflow as WorkflowIcon,
  GitBranch,
  MessageSquare,
  Webhook,
  MonitorSpeaker,
  Wifi,
  Server,
  HardDrive,
  MemoryStick,
  Cpu as CpuIcon
} from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

// Mock data - in real app this would come from API
const workflows = [
  {
    id: '1',
    name: 'Customer Onboarding Flow',
    description: 'Automated welcome email sequence and CRM sync with Puter.js AI personalization',
    status: 'active',
    lastRun: '2 hours ago',
    success: 98.5,
    runs: 1247,
    category: 'Marketing',
    nodes: 12,
    integrations: ['Mailchimp', 'Salesforce', 'Slack', 'Mistral AI'],
    created: '2024-01-15',
    isStarred: true,
    performance: 'excellent'
  },
  {
    id: '2',
    name: 'Invoice Processing Pipeline',
    description: 'Extract data from invoices using AI and update accounting systems automatically',
    status: 'active',
    lastRun: '30 minutes ago',
    success: 95.2,
    runs: 892,
    category: 'Finance',
    nodes: 8,
    integrations: ['QuickBooks', 'AWS S3', 'Stripe', 'Mistral AI'],
    created: '2024-01-20',
    isStarred: false,
    performance: 'good'
  },
  {
    id: '3',
    name: 'Social Media Analytics',
    description: 'Collect and analyze social media metrics with AI-powered insights',
    status: 'paused',
    lastRun: '1 day ago',
    success: 92.8,
    runs: 456,
    category: 'Analytics',
    nodes: 15,
    integrations: ['Twitter', 'Google Analytics', 'Notion', 'Mistral AI'],
    created: '2024-01-25',
    isStarred: false,
    performance: 'good'
  },
  {
    id: '4',
    name: 'AI Support Ticket Routing',
    description: 'Intelligent ticket assignment and priority setting with natural language processing',
    status: 'active',
    lastRun: '5 minutes ago',
    success: 99.1,
    runs: 2341,
    category: 'Support',
    nodes: 18,
    integrations: ['Zendesk', 'Slack', 'Mistral AI', 'Intercom'],
    created: '2024-02-01',
    isStarred: true,
    performance: 'excellent'
  },
  {
    id: '5',
    name: 'Lead Qualification Bot',
    description: 'Automatically qualify leads using AI conversation and scoring',
    status: 'active',
    lastRun: '1 hour ago',
    success: 94.7,
    runs: 1876,
    category: 'Sales',
    nodes: 22,
    integrations: ['HubSpot', 'Twilio', 'Mistral AI', 'Calendly'],
    created: '2024-02-05',
    isStarred: false,
    performance: 'good'
  },
  {
    id: '6',
    name: 'Content Generation Pipeline',
    description: 'AI-powered content creation and publishing workflow',
    status: 'active',
    lastRun: '45 minutes ago',
    success: 97.3,
    runs: 634,
    category: 'Marketing',
    nodes: 14,
    integrations: ['WordPress', 'Buffer', 'Mistral AI', 'Unsplash'],
    created: '2024-02-10',
    isStarred: true,
    performance: 'excellent'
  }
];

const recentRuns = [
  { id: '1', workflow: 'AI Support Ticket Routing', status: 'success', duration: '0.9s', time: '2 minutes ago', nodes: 18 },
  { id: '2', workflow: 'Customer Onboarding Flow', status: 'success', duration: '2.3s', time: '5 minutes ago', nodes: 12 },
  { id: '3', workflow: 'Invoice Processing Pipeline', status: 'success', duration: '1.8s', time: '12 minutes ago', nodes: 8 },
  { id: '4', workflow: 'Lead Qualification Bot', status: 'success', duration: '3.2s', time: '18 minutes ago', nodes: 22 },
  { id: '5', workflow: 'Content Generation Pipeline', status: 'success', duration: '4.1s', time: '25 minutes ago', nodes: 14 },
  { id: '6', workflow: 'Customer Onboarding Flow', status: 'failed', duration: '2.7s', time: '1 hour ago', nodes: 12 }
];

const stats = [
  {
    title: 'Total Workflows',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: WorkflowIcon,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  {
    title: 'Successful Runs',
    value: '1,247',
    change: '+23%',
    trend: 'up',
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  {
    title: 'AI Integrations',
    value: '18',
    change: '+6',
    trend: 'up',
    icon: Brain,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  },
  {
    title: 'Avg Response Time',
    value: '1.4s',
    change: '-15%',
    trend: 'down',
    icon: Zap,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  }
];

const quickActions = [
  {
    title: 'Create Workflow',
    description: 'Build a new automation from scratch',
    icon: Plus,
    href: '/workflow',
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    textColor: 'text-white'
  },
  {
    title: 'AI Generator',
    description: 'Generate workflow with Mistral AI',
    icon: Brain,
    href: '/workflow?ai=true',
    color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    textColor: 'text-white'
  },
  {
    title: 'Templates',
    description: 'Start from proven templates',
    icon: Layers,
    href: '/templates',
    color: 'bg-gradient-to-r from-green-500 to-green-600',
    textColor: 'text-white'
  },
  {
    title: 'Integrations',
    description: 'Connect your favorite tools',
    icon: Globe,
    href: '/integrations',
    color: 'bg-gradient-to-r from-orange-500 to-orange-600',
    textColor: 'text-white'
  }
];

const performanceMetrics = [
  { label: 'CPU Usage', value: 34, color: 'bg-blue-500', icon: Cpu },
  { label: 'Memory', value: 67, color: 'bg-green-500', icon: MemoryStick },
  { label: 'Network', value: 23, color: 'bg-purple-500', icon: Wifi },
  { label: 'Storage', value: 45, color: 'bg-orange-500', icon: HardDrive }
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
      case 'active': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'paused': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'error': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
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

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent': return <Flame className="h-4 w-4 text-green-500" />;
      case 'good': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'fair': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Enhanced Welcome Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5 rounded-2xl" />
          <div className="relative p-8 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-primary to-purple-600 rounded-xl">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">
                      Welcome back, {user?.displayName || 'User'}!
                    </h1>
                    <p className="text-muted-foreground text-lg">
                      Your AI automation workspace is ready
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>All systems operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span>PostgreSQL connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    <span>Mistral AI ready</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  animation="glow"
                >
                  Refresh
                </Button>
                <Button 
                  variant="gradient" 
                  leftIcon={<Plus className="h-4 w-4" />}
                  animation="scale"
                  asChild
                >
                  <Link href="/workflow">
                    New Workflow
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className={`animate-fade-in-up stagger-${index + 1}`}>
              <StatsCard
                title={stat.title}
                value={stat.value}
                change={stat.change}
                trend={stat.trend}
                icon={<stat.icon className="h-6 w-6" />}
                className="hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>

        {/* Enhanced Quick Actions */}
        <Card variant="premium" className="animate-fade-in-up stagger-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Rocket className="h-6 w-6" />
              Quick Actions
            </CardTitle>
            <CardDescription size="lg">
              Get started with common tasks and AI-powered workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50"
                  animation="scale"
                  asChild
                >
                  <Link href={action.href}>
                    <div className={`p-4 rounded-xl ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon className={`h-6 w-6 ${action.textColor}`} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-base">{action.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Performance Metrics */}
        <Card variant="premium" className="animate-fade-in-up stagger-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Gauge className="h-6 w-6" />
              System Performance
            </CardTitle>
            <CardDescription size="lg">
              Real-time monitoring of your automation infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceMetrics.map((metric, index) => (
                <MetricCard
                  key={index}
                  label={metric.label}
                  value={metric.value}
                  color={metric.color}
                  showProgress={true}
                  className="hover:scale-105 transition-transform duration-300"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="workflows" className="space-y-6 animate-fade-in-up stagger-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3 h-12">
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <WorkflowIcon className="h-4 w-4" />
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
            {/* Enhanced Workflow Filters */}
            <Card variant="glass">
              <CardContent className="p-6">
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
                    <Button
                      variant={selectedCategory === 'sales' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('sales')}
                    >
                      Sales
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <SearchInput
                      placeholder="Search workflows..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
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

            {/* Enhanced Workflows Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredWorkflows.map((workflow) => (
                <Card key={workflow.id} variant="premium" hover="scale" className="group">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <CardTitle className="text-xl font-bold line-clamp-1">
                            {workflow.name}
                          </CardTitle>
                          {workflow.isStarred && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                          {getPerformanceIcon(workflow.performance)}
                        </div>
                        <CardDescription className="line-clamp-2 text-base">
                          {workflow.description}
                        </CardDescription>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3">
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                      <Badge variant="outline" className="bg-primary/10">
                        {workflow.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
                        <div className="flex items-center gap-2">
                          <Progress value={workflow.success} className="flex-1 h-2" />
                          <span className="font-bold text-sm">{workflow.success}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Total Runs</p>
                        <p className="font-bold text-lg">{workflow.runs.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">Nodes</p>
                        <span className="font-medium">{workflow.nodes}</span>
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
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
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
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredWorkflows.length === 0 && (
              <Card variant="glass" className="text-center py-16">
                <CardContent>
                  <div className="p-4 bg-primary/10 rounded-full inline-block mb-6">
                    <WorkflowIcon className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No workflows found</h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    {searchQuery ? 'Try adjusting your search criteria' : 'Create your first workflow to get started'}
                  </p>
                  <Button variant="gradient" size="lg" asChild>
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
            <Card variant="premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="h-6 w-6" />
                  Recent Workflow Runs
                </CardTitle>
                <CardDescription size="lg">
                  Latest execution results from your AI-powered workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentRuns.map((run) => (
                    <div key={run.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors border-border/50">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${getRunStatusColor(run.status)}`}>
                          {run.status === 'success' ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : run.status === 'failed' ? (
                            <XCircle className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-base">{run.workflow}</p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {run.duration} • {run.nodes} nodes • {run.time}
                          </p>
                        </div>
                      </div>
                      <Badge variant={run.status === 'success' ? 'default' : 'destructive'} className="capitalize">
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
              <Card variant="premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <BarChart3 className="h-6 w-6" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription size="lg">
                    Workflow execution statistics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Executions</span>
                      <span className="font-bold text-lg">4,936</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="font-bold text-lg text-green-500">96.8%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Duration</span>
                      <span className="font-bold text-lg">1.4s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Error Rate</span>
                      <span className="font-bold text-lg text-red-500">3.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">AI Processing Time</span>
                      <span className="font-bold text-lg text-purple-500">0.8s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <PieChart className="h-6 w-6" />
                    Resource Usage
                  </CardTitle>
                  <CardDescription size="lg">
                    Current plan utilization and limits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Workflow Runs</span>
                        <span className="text-sm text-muted-foreground">1,247 / 10,000</span>
                      </div>
                      <Progress value={12.47} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Active Workflows</span>
                        <span className="text-sm text-muted-foreground">24 / 100</span>
                      </div>
                      <Progress value={24} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">API Calls</span>
                        <span className="text-sm text-muted-foreground">8,432 / 50,000</span>
                      </div>
                      <Progress value={16.86} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">AI Processing</span>
                        <span className="text-sm text-muted-foreground">2,341 / 25,000</span>
                      </div>
                      <Progress value={9.36} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default withAuth(DashboardPage);