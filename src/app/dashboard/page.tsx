'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { withAuth } from '@/components/auth/with-auth';
import { AIFloatingAssistant } from '@/components/ai-chat-assistant';
import { RealTimeCharts } from '@/components/real-time-charts';
import { InteractiveGodTierFeatures } from '@/components/interactive-godtier-features';
import { IntegrationMarketplace } from '@/components/integration-marketplace';
import { TemplateLibrary } from '@/components/template-library';
import { EnhancedMonitoring } from '@/components/enhanced-monitoring';
import { EnhancedDashboardWidgets } from '@/components/enhanced-dashboard-widgets';
import { ResponsiveLayout, ResponsiveGrid, ResponsiveCard } from '@/components/responsive-layout';
import { RealTimeDashboard } from '@/components/dashboard/realtime-dashboard';
import { EnhancedLoadingState, EnhancedErrorHandler, ResponsiveContainer } from '@/components/ui/enhanced-ui';
import {
  Activity,
  BarChart3,
  Users,
  Globe,
  Zap,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Settings,
  Eye,
  Plus,
  ArrowRight,
  Brain,
  Workflow,
  Database,
  MessageSquare,
  Mail,
  Calendar,
  FileText,
  Shield,
  Rocket,
  Star,
  Award,
  Target,
  Sparkles,
  Bot,
  Crown,
  Gauge,
  RefreshCw,
  Filter,
  Download,
  Share,
  Bookmark,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  MoreHorizontal,
  ChevronRight,
  LineChart,
  PieChart,
  DollarSign,
  Percent,
  Monitor,
  AlertTriangle,
  Info,
  HelpCircle,
  History,
  PlayCircle,
  StopCircle,
  SkipForward,
  Rewind,
  FastForward,
  Puzzle,
  Radio,
  TestTube,
  Flame,
  TestTube2,
  MousePointer,
  Cpu,
  Server,
  BarChart,
  Layers,
  Code,
  Atom,
  Network,
  PlusCircle,
  ArrowUpRight,
  Timer,
  Gift,
  Diamond,
  Verified,
  Infinity,
  KeyRound,
  Lock,
  Unlock,
  Laptop,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Home,
  Search,
  Bell,
  User,
  Mic,
  Camera,
  Video,
  Image,
  FileImage,
  CloudDownload,
  CloudUpload,
  Upload,
  Folder,
  FolderOpen,
  Archive,
  Package,
  Briefcase,
  Building,
  Lightbulb,
  Palette,
  Wrench,
  Cog,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Maximize,
  Minimize,
  VolumeX,
  Volume2
} from 'lucide-react';

// Enhanced Mock data for dashboard with demo account specific data
const dashboardStats = {
  totalWorkflows: 47,
  activeWorkflows: 23,
  totalExecutions: 152340,
  successRate: 98.7,
  totalIntegrations: 12,
  monthlyExecutions: 45230,
  avgResponseTime: 245,
  errorRate: 1.3,
  demoMode: true,
  subscriptionType: 'Diamond',
  trialDaysLeft: 365
};

const recentActivity = [
  {
    id: 1,
    type: 'workflow_created',
    title: 'Customer Onboarding Flow',
    description: 'New workflow created for automated customer onboarding with AI optimization',
    timestamp: '2 minutes ago',
    status: 'success',
    icon: Workflow,
    category: 'Workflow',
    priority: 'high'
  },
  {
    id: 2,
    type: 'execution_completed',
    title: 'Lead Notification System',
    description: 'Workflow executed successfully - 45 leads processed with 99.2% accuracy',
    timestamp: '5 minutes ago',
    status: 'success',
    icon: CheckCircle,
    category: 'Execution',
    priority: 'medium'
  },
  {
    id: 3,
    type: 'integration_connected',
    title: 'Salesforce Integration',
    description: 'Successfully connected to Salesforce CRM with OAuth authentication',
    timestamp: '12 minutes ago',
    status: 'success',
    icon: Globe,
    category: 'Integration',
    priority: 'high'
  },
  {
    id: 4,
    type: 'ai_optimization',
    title: 'God-Tier AI Optimization',
    description: 'Reality Fabricator applied quantum improvements - 25% performance boost',
    timestamp: '18 minutes ago',
    status: 'success',
    icon: Brain,
    category: 'AI Enhancement',
    priority: 'critical'
  },
  {
    id: 5,
    type: 'execution_warning',
    title: 'Email Campaign Automation',
    description: 'Workflow throttled due to API rate limit - auto-recovery initiated',
    timestamp: '25 minutes ago',
    status: 'warning',
    icon: AlertTriangle,
    category: 'Performance',
    priority: 'low'
  }
];

const topWorkflows = [
  {
    id: 1,
    name: 'Lead Qualification & Routing',
    description: 'AI-powered lead scoring and intelligent routing system',
    executions: 1250,
    successRate: 99.2,
    status: 'running',
    lastRun: '2 minutes ago',
    avgDuration: '1.2s',
    category: 'Marketing',
    integrations: ['Salesforce', 'HubSpot', 'Slack'],
    aiEnabled: true,
    complexity: 'Advanced'
  },
  {
    id: 2,
    name: 'Customer Support Automation',
    description: 'Intelligent ticket routing with sentiment analysis and auto-responses',
    executions: 890,
    successRate: 97.8,
    status: 'running',
    lastRun: '8 minutes ago',
    avgDuration: '2.1s',
    category: 'Support',
    integrations: ['Zendesk', 'Discord', 'Notion'],
    aiEnabled: true,
    complexity: 'Intermediate'
  },
  {
    id: 3,
    name: 'Order Processing Pipeline',
    description: 'End-to-end e-commerce order handling with fraud detection',
    executions: 670,
    successRate: 99.5,
    status: 'paused',
    lastRun: '1 hour ago',
    avgDuration: '5.3s',
    category: 'E-commerce',
    integrations: ['Shopify', 'Stripe', 'Mailchimp'],
    aiEnabled: false,
    complexity: 'Basic'
  },
  {
    id: 4,
    name: 'Social Media Scheduler',
    description: 'Multi-platform content publishing with optimal timing AI',
    executions: 430,
    successRate: 95.6,
    status: 'running',
    lastRun: '15 minutes ago',
    avgDuration: '3.7s',
    category: 'Marketing',
    integrations: ['Twitter', 'LinkedIn', 'Instagram'],
    aiEnabled: true,
    complexity: 'Advanced'
  }
];

const quickActions = [
  {
    title: 'Build with AI',
    description: 'Create workflows using natural language with Puter.js AI',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    action: 'Create',
    category: 'AI',
    featured: true
  },
  {
    title: 'Connect Service',
    description: 'Add new integrations from 100+ available services',
    icon: Globe,
    color: 'from-blue-500 to-cyan-500',
    action: 'Browse',
    category: 'Integration',
    featured: false
  },
  {
    title: 'Use Template',
    description: 'Start with proven workflow templates',
    icon: FileText,
    color: 'from-green-500 to-emerald-500',
    action: 'Explore',
    category: 'Template',
    featured: true
  },
  {
    title: 'View Analytics',
    description: 'Deep-dive into performance metrics and insights',
    icon: BarChart3,
    color: 'from-orange-500 to-red-500',
    action: 'Analyze',
    category: 'Analytics',
    featured: false
  },
  {
    title: 'God-Tier Features',
    description: 'Access Reality Fabricator and Quantum Simulation',
    icon: Crown,
    color: 'from-yellow-400 to-yellow-600',
    action: 'Unleash',
    category: 'God-Tier',
    featured: true
  },
  {
    title: 'Monitor Real-time',
    description: 'Live monitoring dashboard for all workflows',
    icon: Radio,
    color: 'from-red-500 to-pink-500',
    action: 'Monitor',
    category: 'Monitoring',
    featured: false
  }
];

const demoAccountInfo = {
  email: 'demo.user.2025@kairo.test',
  subscriptionType: 'Diamond',
  trialDaysLeft: 365,
  features: [
    'Full God-Tier Access',
    'Unlimited Workflows',
    'Premium Integrations',
    'Advanced AI Features'
  ],
  usage: {
    workflows: { used: 47, limit: 'Unlimited' },
    executions: { used: 152340, limit: 'Unlimited' },
    integrations: { used: 12, limit: 'Unlimited' }
  }
};

function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [isDemoUser, setIsDemoUser] = useState(true); // This would come from auth context

  // AI Assistant handlers
  const handleWorkflowGenerate = (description: string) => {
    console.log('Generating workflow:', description);
    setActiveTab('templates');
  };

  const handleGodTierActivate = (feature: string) => {
    console.log('Activating god-tier feature:', feature);
    setActiveTab('ai');
  };

  const handleIntegrationSetup = (service: string) => {
    console.log('Setting up integration:', service);
    setActiveTab('integrations');
  };

  // Enhanced Overview Tab with better visual hierarchy
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Enhanced Welcome Section with Demo Account Info */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold">Welcome back! 👋</h2>
              {isDemoUser && (
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 text-sm hover:scale-105 transition-transform">
                  <TestTube className="h-3 w-3 mr-1" />
                  Demo Mode
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">Here's what's happening with your automations today</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm w-full sm:w-auto bg-background hover:bg-muted/50 transition-colors"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 hover:scale-105 transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        </div>

        {/* Demo Account Status Card */}
        {isDemoUser && (
          <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <Diamond className="h-5 w-5" />
                Diamond Demo Account
                <Badge variant="outline" className="bg-white/50 text-emerald-700 border-emerald-300">
                  {demoAccountInfo.trialDaysLeft} days remaining
                </Badge>
              </CardTitle>
              <CardDescription className="text-emerald-600 dark:text-emerald-400">
                You're experiencing the full power of Kairo's premium features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {demoAccountInfo.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-700 dark:text-emerald-300">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Dashboard Widgets */}
      <EnhancedDashboardWidgets />

      {/* Enhanced Quick Actions - More Interactive */}
      <ResponsiveCard className="mt-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
            <Badge variant="outline" className="ml-2">6 available</Badge>
          </CardTitle>
          <CardDescription>Get started with common tasks and unlock advanced features</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveGrid className="sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className={cn(
                "cursor-pointer hover:shadow-lg transition-all duration-300 group border-border/50 hover:border-primary/20",
                action.featured && "ring-2 ring-primary/10 bg-gradient-to-br from-primary/5 to-purple-500/5"
              )}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    {action.featured && (
                      <Badge className="bg-gradient-to-r from-primary to-purple-600 text-white text-xs">
                        <Star className="h-2 w-2 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base group-hover:text-primary transition-colors">{action.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">{action.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {action.category}
                    </Badge>
                    <Button size="sm" variant="outline" className="text-xs sm:text-sm hover:scale-105 transition-transform">
                      {action.action}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        </CardContent>
      </ResponsiveCard>

      {/* Enhanced Recent Activity & Top Workflows */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ResponsiveCard className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </div>
              <Badge variant="outline" className="text-xs">
                Live
                <div className="w-2 h-2 bg-green-500 rounded-full ml-1 animate-pulse" />
              </Badge>
            </CardTitle>
            <CardDescription>Latest updates from your workflows and integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-all duration-300 cursor-pointer group">
                    <div className={cn(
                      "p-2 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300",
                      activity.status === 'success' && "bg-green-500/10",
                      activity.status === 'warning' && "bg-yellow-500/10",
                      activity.status === 'error' && "bg-red-500/10"
                    )}>
                      <activity.icon className={cn(
                        "h-4 w-4",
                        activity.status === 'success' && "text-green-600",
                        activity.status === 'warning' && "text-yellow-600", 
                        activity.status === 'error' && "text-red-600"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{activity.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs flex-shrink-0 ml-2",
                            activity.priority === 'critical' && "border-red-500 text-red-600",
                            activity.priority === 'high' && "border-orange-500 text-orange-600",
                            activity.priority === 'medium' && "border-blue-500 text-blue-600",
                            activity.priority === 'low' && "border-gray-500 text-gray-600"
                          )}
                        >
                          {activity.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-1">{activity.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {activity.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </ResponsiveCard>

        <ResponsiveCard className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Performing Workflows
              </div>
              <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform">
                <Eye className="h-3 w-3 mr-1" />
                View All
              </Button>
            </CardTitle>
            <CardDescription>Your most active and successful automations</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {topWorkflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-all duration-300 cursor-pointer group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{workflow.name}</h4>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {workflow.aiEnabled && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0">
                              <Brain className="h-2 w-2 mr-1" />
                              AI
                            </Badge>
                          )}
                          <Badge 
                            variant={workflow.status === 'running' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {workflow.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{workflow.description}</p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {workflow.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {workflow.complexity}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                        <span>{workflow.executions.toLocaleString()} runs</span>
                        <span>{workflow.successRate}% success</span>
                        <span>{workflow.avgDuration} avg</span>
                      </div>
                      
                      <div className="mb-2">
                        <Progress value={workflow.successRate} className="h-1" />
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        <span>{workflow.integrations.length} integrations</span>
                        <span className="mx-1">•</span>
                        <span>Last run: {workflow.lastRun}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </ResponsiveCard>
      </div>
    </div>
  );

  // Enhanced Analytics Tab with better visualizations
  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Real-time insights into your automation performance</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button variant="outline" size="sm" className="w-full sm:w-auto hover:scale-105 transition-transform">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto hover:scale-105 transition-transform">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:scale-105 transition-transform">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Insights
          </Button>
        </div>
      </div>

      <RealTimeCharts />
    </div>
  );

  // Enhanced AI Tab with better organization
  const AITab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">AI Intelligence Center</h2>
          <p className="text-muted-foreground">AI-powered insights and interactive advanced automation features</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
            <Brain className="h-4 w-4 mr-2" />
            AI Powered
          </Badge>
          {isDemoUser && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2">
              <Crown className="h-4 w-4 mr-2" />
              God-Tier Access
            </Badge>
          )}
        </div>
      </div>

      <InteractiveGodTierFeatures />
    </div>
  );

  // Enhanced Performance Tab
  const PerformanceTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">System performance monitoring and optimization insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            All Systems Operational
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Response Time', value: '142ms', description: 'Average API response time', icon: Timer, trend: '+5%', color: 'text-green-600' },
          { title: 'Cache Hit Rate', value: '87%', description: 'Cache efficiency', icon: Database, trend: '+12%', color: 'text-blue-600' },
          { title: 'Error Rate', value: '0.3%', description: 'System error rate', icon: AlertTriangle, trend: '-2%', color: 'text-red-600' },
          { title: 'Uptime', value: '99.9%', description: 'System availability', icon: Shield, trend: '0%', color: 'text-green-600' }
        ].map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{metric.title}</span>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{metric.value}</div>
              <p className="text-xs text-muted-foreground mb-2">{metric.description}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={`text-xs ${metric.color}`}>
                  {metric.trend}
                </Badge>
                <span className="text-xs text-muted-foreground">vs last week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Enhanced Monitoring Tab
  const MonitoringTab = () => <EnhancedMonitoring />;

  // Enhanced Integration Marketplace Tab
  const IntegrationsTab = () => <IntegrationMarketplace />;

  // Enhanced Template Library Tab  
  const TemplatesTab = () => <TemplateLibrary />;

  return (
    <ResponsiveLayout>
      <div className="flex-1 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 lg:w-auto lg:grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2 hover:scale-105 transition-transform">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2 hover:scale-105 transition-transform">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-1 sm:gap-2 hover:scale-105 transition-transform">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Performance</span>
              </TabsTrigger>
              <TabsTrigger value="realtime" className="flex items-center gap-1 sm:gap-2 hover:scale-105 transition-transform">
                <Radio className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Real-time</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-1 sm:gap-2 hover:scale-105 transition-transform">
                <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">AI Center</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-1 sm:gap-2 hover:scale-105 transition-transform">
                <Puzzle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Integrations</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceTab />
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <RealTimeDashboard />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AITab />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <IntegrationsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced AI Floating Assistant with demo mode awareness */}
      <div className="hidden lg:block">
        <AIFloatingAssistant
          onWorkflowGenerate={handleWorkflowGenerate}
          onGodTierActivate={handleGodTierActivate}
          onIntegrationSetup={handleIntegrationSetup}
          demoMode={isDemoUser}
        />
      </div>
    </ResponsiveLayout>
  );
}

// Helper function for className concatenation
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default withAuth(DashboardPage);