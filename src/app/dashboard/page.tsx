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
  FastForward
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

  // Analytics Tab
  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Detailed insights into your automation performance</p>
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

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Executions</p>
                <p className="text-2xl font-bold">{dashboardStats.monthlyExecutions.toLocaleString()}</p>
              </div>
              <LineChart className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">75% of quota used</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{dashboardStats.avgResponseTime}ms</p>
              </div>
              <Gauge className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                12% faster than last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                <p className="text-2xl font-bold">{dashboardStats.errorRate}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                0.5% improvement
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold">{dashboardStats.activeWorkflows}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                {dashboardStats.totalWorkflows - dashboardStats.activeWorkflows} paused
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Execution Trends
            </CardTitle>
            <CardDescription>Workflow executions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Execution trend chart would appear here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Workflow Categories
            </CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center text-muted-foreground">
                <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Category distribution chart would appear here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Breakdown
          </CardTitle>
          <CardDescription>Detailed performance metrics by workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topWorkflows.map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Workflow className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{workflow.name}</h4>
                    <p className="text-sm text-muted-foreground">{workflow.category}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-8 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Executions</p>
                    <p className="font-semibold">{workflow.executions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="font-semibold">{workflow.successRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Duration</p>
                    <p className="font-semibold">{workflow.avgDuration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={workflow.status === 'running' ? 'default' : 'secondary'}>
                      {workflow.status}
                    </Badge>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // AI Intelligence Tab
  const AITab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">AI Intelligence Center</h2>
          <p className="text-muted-foreground">AI-powered insights and advanced automation features</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
          <Brain className="h-4 w-4 mr-2" />
          AI Powered
        </Badge>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
          <CardDescription>Intelligent suggestions to optimize your workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiInsights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${insight.color} rounded-lg flex items-center justify-center`}>
                      <insight.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <Badge variant={
                          insight.impact === 'High' ? 'destructive' : 
                          insight.impact === 'Medium' ? 'default' : 'secondary'
                        }>
                          {insight.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>
                      <div className="flex gap-2">
                        <Button size="sm">
                          Apply Suggestion
                        </Button>
                        <Button size="sm" variant="outline">
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* God-Tier Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            God-Tier Features
          </CardTitle>
          <CardDescription>Advanced AI capabilities for enterprise automation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {godTierFeatures.map((feature) => (
              <Card key={feature.id} className="border-primary/20 hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{feature.name}</h3>
                        <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                          {feature.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Accuracy:</span>
                          <span className="font-medium">{feature.accuracy}%</span>
                        </div>
                        <Progress value={feature.accuracy} className="h-2" />
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Speed Improvement:</span>
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            {feature.speedup}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Performance Metrics
          </CardTitle>
          <CardDescription>Real-time AI system performance and usage statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg">
              <Bot className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-2xl font-bold mb-2">94.7%</h3>
              <p className="text-sm text-muted-foreground">AI Prediction Accuracy</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg">
              <Zap className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-2xl font-bold mb-2">127ms</h3>
              <p className="text-sm text-muted-foreground">Average AI Response Time</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg">
              <Target className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-2xl font-bold mb-2">12.3K</h3>
              <p className="text-sm text-muted-foreground">AI-Generated Workflows</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Monitoring Tab
  const MonitoringTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">System Monitoring</h2>
          <p className="text-muted-foreground">Real-time monitoring of workflows and system health</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            All Systems Operational
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'API Gateway', status: 'healthy', uptime: '99.9%', responseTime: '45ms', color: 'text-green-600' },
          { name: 'Workflow Engine', status: 'healthy', uptime: '99.8%', responseTime: '120ms', color: 'text-green-600' },
          { name: 'Database', status: 'healthy', uptime: '100%', responseTime: '12ms', color: 'text-green-600' },
          { name: 'AI Services', status: 'warning', uptime: '98.2%', responseTime: '340ms', color: 'text-yellow-600' }
        ].map((service, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{service.name}</h3>
                <div className={`w-3 h-3 rounded-full ${
                  service.status === 'healthy' ? 'bg-green-500' : 
                  service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uptime:</span>
                  <span className="font-medium">{service.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Response:</span>
                  <span className="font-medium">{service.responseTime}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Workflows Monitor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Workflows
          </CardTitle>
          <CardDescription>Real-time workflow execution monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topWorkflows.filter(w => w.status === 'running').map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <PlayCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{workflow.name}</h4>
                    <p className="text-sm text-muted-foreground">Last run: {workflow.lastRun}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Executions</p>
                    <p className="font-semibold">{workflow.executions.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="font-semibold text-green-600">{workflow.successRate}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Avg Duration</p>
                    <p className="font-semibold">{workflow.avgDuration}</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Errors & Warnings
          </CardTitle>
          <CardDescription>System errors and warnings from the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                type: 'error',
                message: 'API rate limit exceeded for Shopify integration',
                workflow: 'Order Processing Pipeline',
                timestamp: '2 minutes ago',
                count: 3
              },
              {
                type: 'warning',
                message: 'Slow response time detected for email service',
                workflow: 'Customer Onboarding Flow',
                timestamp: '15 minutes ago',
                count: 1
              },
              {
                type: 'error',
                message: 'Database connection timeout',
                workflow: 'Lead Qualification & Routing',
                timestamp: '1 hour ago',
                count: 2
              }
            ].map((log, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`p-1 rounded ${
                  log.type === 'error' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                }`}>
                  <AlertTriangle className={`h-4 w-4 ${
                    log.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{log.message}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {log.count}x
                      </Badge>
                      <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Workflow: {log.workflow}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

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