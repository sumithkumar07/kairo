'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedAppLayout } from '@/components/enhanced-app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { AIFloatingAssistant } from '@/components/ai-chat-assistant';
import { RealTimeCharts } from '@/components/real-time-charts';
import { InteractiveGodTierFeatures } from '@/components/interactive-godtier-features';
import { IntegrationMarketplace } from '@/components/integration-marketplace';
import { TemplateLibrary } from '@/components/template-library';
import { EnhancedMonitoring } from '@/components/enhanced-monitoring';
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
  Puzzle
} from 'lucide-react';

// Mock data for dashboard
const dashboardStats = {
  totalWorkflows: 47,
  activeWorkflows: 23,
  totalExecutions: 152340,
  successRate: 98.7,
  totalIntegrations: 12,
  monthlyExecutions: 45230,
  avgResponseTime: 245,
  errorRate: 1.3
};

const recentActivity = [
  {
    id: 1,
    type: 'workflow_created',
    title: 'Customer Onboarding Flow',
    description: 'New workflow created for automated customer onboarding',
    timestamp: '2 minutes ago',
    status: 'success',
    icon: Workflow
  },
  {
    id: 2,
    type: 'execution_completed',
    title: 'Lead Notification System',
    description: 'Workflow executed successfully - 45 leads processed',
    timestamp: '5 minutes ago',
    status: 'success',
    icon: CheckCircle
  },
  {
    id: 3,
    type: 'integration_connected',
    title: 'Salesforce Integration',
    description: 'Successfully connected to Salesforce CRM',
    timestamp: '12 minutes ago',
    status: 'success',
    icon: Globe
  },
  {
    id: 4,
    type: 'execution_failed',
    title: 'Email Campaign Automation',
    description: 'Workflow failed due to API rate limit',
    timestamp: '18 minutes ago',
    status: 'error',
    icon: AlertCircle
  },
  {
    id: 5,
    type: 'ai_optimization',
    title: 'AI Workflow Optimization',
    description: 'AI suggestions applied to improve performance by 15%',
    timestamp: '25 minutes ago',
    status: 'success',
    icon: Brain
  }
];

const topWorkflows = [
  {
    id: 1,
    name: 'Lead Qualification & Routing',
    description: 'Automatically score and route incoming leads',
    executions: 1250,
    successRate: 99.2,
    status: 'running',
    lastRun: '2 minutes ago',
    avgDuration: '1.2s',
    category: 'Marketing'
  },
  {
    id: 2,
    name: 'Customer Support Automation',
    description: 'Route tickets and send auto-responses',
    executions: 890,
    successRate: 97.8,
    status: 'running',
    lastRun: '8 minutes ago',
    avgDuration: '2.1s',
    category: 'Support'
  },
  {
    id: 3,
    name: 'Order Processing Pipeline',
    description: 'End-to-end e-commerce order handling',
    executions: 670,
    successRate: 99.5,
    status: 'paused',
    lastRun: '1 hour ago',
    avgDuration: '5.3s',
    category: 'E-commerce'
  },
  {
    id: 4,
    name: 'Social Media Scheduler',
    description: 'Schedule and publish content across platforms',
    executions: 430,
    successRate: 95.6,
    status: 'running',
    lastRun: '15 minutes ago',
    avgDuration: '3.7s',
    category: 'Marketing'
  }
];

const aiInsights = [
  {
    id: 1,
    type: 'optimization',
    title: 'Workflow Performance Boost',
    description: 'Adding a condition check before API calls could reduce execution time by 23%',
    impact: 'High',
    workflowId: 1,
    icon: Zap,
    color: 'from-yellow-500 to-orange-500'
  },
  {
    id: 2,
    type: 'cost_saving',
    title: 'API Usage Optimization',
    description: 'Batch processing could reduce your monthly API costs by $127',
    impact: 'Medium',
    workflowId: 2,
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 3,
    type: 'reliability',
    title: 'Error Prevention Suggestion',
    description: 'Add error handling for network timeouts to prevent 15% of failures',
    impact: 'High',
    workflowId: 3,
    icon: Shield,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 4,
    type: 'scaling',
    title: 'Auto-scaling Recommendation',
    description: 'Enable auto-scaling to handle 300% traffic spikes during peak hours',
    impact: 'Medium',
    workflowId: 1,
    icon: TrendingUp,
    color: 'from-purple-500 to-pink-500'
  }
];

const godTierFeatures = [
  {
    id: 1,
    name: 'Quantum Workflow Processing',
    description: 'Leverage quantum computing for complex optimization',
    status: 'active',
    accuracy: 99.1,
    speedup: '50x',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    name: 'AI Prophet Predictions',
    description: 'Predict workflow outcomes before execution',
    status: 'active',
    accuracy: 94.8,
    speedup: '10x',
    icon: Brain,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 3,
    name: 'Reality Fabrication Engine',
    description: 'Control IoT devices and physical systems',
    status: 'active',
    accuracy: 97.3,
    speedup: '25x',
    icon: Globe,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 4,
    name: 'Global Consciousness Network',
    description: 'Tap into worldwide data streams and insights',
    status: 'training',
    accuracy: 91.2,
    speedup: '100x',
    icon: Monitor,
    color: 'from-orange-500 to-red-500'
  }
];

function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  // AI Assistant handlers
  const handleWorkflowGenerate = (description: string) => {
    console.log('Generating workflow:', description);
    setActiveTab('templates'); // Navigate to templates tab
  };

  const handleGodTierActivate = (feature: string) => {
    console.log('Activating god-tier feature:', feature);
    setActiveTab('ai'); // Navigate to AI tab
  };

  const handleIntegrationSetup = (service: string) => {
    console.log('Setting up integration:', service);
    setActiveTab('integrations'); // Navigate to integrations tab
  };

  // Overview Tab
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Welcome back! 👋</h2>
          <p className="text-muted-foreground">Here's what's happening with your automations today</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{dashboardStats.totalWorkflows}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Workflow className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Executions</p>
                <p className="text-2xl font-bold">{dashboardStats.totalExecutions.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +18% from last month
                </p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{dashboardStats.successRate}%</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.3% from last month
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Integrations</p>
                <p className="text-2xl font-bold">{dashboardStats.totalIntegrations}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  +3 new this month
                </p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Build with AI',
                description: 'Create workflows using natural language',
                icon: Brain,
                color: 'from-purple-500 to-pink-500',
                action: 'Create'
              },
              {
                title: 'Connect Service',
                description: 'Add a new integration to your toolkit',
                icon: Globe,
                color: 'from-blue-500 to-cyan-500',
                action: 'Browse'
              },
              {
                title: 'Use Template',
                description: 'Start with a pre-built workflow',
                icon: FileText,
                color: 'from-green-500 to-emerald-500',
                action: 'Explore'
              },
              {
                title: 'View Analytics',
                description: 'Analyze your automation performance',
                icon: BarChart3,
                color: 'from-orange-500 to-red-500',
                action: 'Analyze'
              }
            ].map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-all group">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                  <Button size="sm" variant="outline" className="w-full">
                    {action.action}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Top Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from your workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      <activity.icon className={`h-4 w-4 ${
                        activity.status === 'success' ? 'text-green-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Performing Workflows
            </CardTitle>
            <CardDescription>Your most active automations</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {topWorkflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{workflow.name}</h4>
                        <Badge 
                          variant={workflow.status === 'running' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {workflow.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{workflow.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{workflow.executions.toLocaleString()} runs</span>
                        <span>{workflow.successRate}% success</span>
                        <span>{workflow.avgDuration} avg</span>
                      </div>
                      
                      <div className="mt-2">
                        <Progress value={workflow.successRate} className="h-1" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Analytics Tab with Enhanced Real-time Charts
  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Real-time insights into your automation performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Enhanced Real-time Charts Component */}
      <RealTimeCharts />
    </div>
  );

  // AI Intelligence Tab with Interactive God-Tier Features
  const AITab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">AI Intelligence Center</h2>
          <p className="text-muted-foreground">AI-powered insights and interactive advanced automation features</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
          <Brain className="h-4 w-4 mr-2" />
          AI Powered
        </Badge>
      </div>

      {/* Interactive God-Tier Features Component */}
      <InteractiveGodTierFeatures />
    </div>
  );

  // Monitoring Tab with Enhanced Real-time Monitoring
  const MonitoringTab = () => <EnhancedMonitoring />;

  return (
    <EnhancedAppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">AI Intelligence</span>
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">Monitoring</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <AITab />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <MonitoringTab />
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedAppLayout>
  );
}

export default withAuth(DashboardPage);