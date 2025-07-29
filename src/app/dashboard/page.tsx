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
// import { PerformanceDashboard } from '@/components/performance-dashboard';
// import { RealTimeDashboard } from '@/components/realtime-dashboard';
// import { TestingDashboard } from '@/components/testing-dashboard';
// import { EnhancedLoadingState, SkeletonLoader } from '@/components/enhanced-loading-states';
// import { EnhancedErrorHandler, useErrorHandler } from '@/components/enhanced-error-handling';
// import { MobileOptimizedLayout, ResponsiveGrid, MobileOptimizedCard } from '@/components/mobile-optimized-layout';
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
  TestTube
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

function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

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

  // Overview Tab with Enhanced Widgets
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Welcome back! 👋</h2>
          <p className="text-muted-foreground">Here's what's happening with your automations today</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm w-full sm:w-auto"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Enhanced Dashboard Widgets */}
      <EnhancedDashboardWidgets />

      {/* Quick Actions - Mobile Responsive */}
      <ResponsiveCard className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveGrid className="sm:grid-cols-2 xl:grid-cols-4">
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
                <CardContent className="p-4 sm:p-6">
                  <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base">{action.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">{action.description}</p>
                  <Button size="sm" variant="outline" className="w-full text-xs sm:text-sm">
                    {action.action}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </ResponsiveGrid>
        </CardContent>
      </ResponsiveCard>

      {/* Recent Activity & Top Workflows - Mobile Responsive */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ResponsiveCard>
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
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
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
        </ResponsiveCard>

        <ResponsiveCard>
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
                        <h4 className="font-medium text-sm line-clamp-1">{workflow.name}</h4>
                        <Badge 
                          variant={workflow.status === 'running' ? 'default' : 'secondary'}
                          className="text-xs flex-shrink-0 ml-2"
                        >
                          {workflow.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{workflow.description}</p>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                        <span>{workflow.executions.toLocaleString()} runs</span>
                        <span>{workflow.successRate}% success</span>
                        <span>{workflow.avgDuration} avg</span>
                      </div>
                      
                      <div className="mt-2">
                        <Progress value={workflow.successRate} className="h-1" />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
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
        </ResponsiveCard>
      </div>
    </div>
  );

  // Analytics Tab with Enhanced Real-time Charts
  const AnalyticsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Real-time insights into your automation performance</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <RealTimeCharts />
    </div>
  );

  // AI Intelligence Tab with Interactive God-Tier Features
  const AITab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">AI Intelligence Center</h2>
          <p className="text-muted-foreground">AI-powered insights and interactive advanced automation features</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
          <Brain className="h-4 w-4 mr-2" />
          AI Powered
        </Badge>
      </div>

      <InteractiveGodTierFeatures />
    </div>
  );

  // Monitoring Tab with Enhanced Real-time Monitoring
  const MonitoringTab = () => <EnhancedMonitoring />;

  // Integration Marketplace Tab
  const IntegrationsTab = () => <IntegrationMarketplace />;

  // Template Library Tab  
  const TemplatesTab = () => <TemplateLibrary />;

  return (
    <ResponsiveLayout>
      <div className="flex-1 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 lg:w-auto lg:grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center gap-1 sm:gap-2">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1 sm:gap-2">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-1 sm:gap-2">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Performance</span>
              </TabsTrigger>
              <TabsTrigger value="realtime" className="flex items-center gap-1 sm:gap-2">
                <Radio className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Real-time</span>
              </TabsTrigger>
              <TabsTrigger value="testing" className="flex items-center gap-1 sm:gap-2">
                <TestTube className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">Testing</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-1 sm:gap-2">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Dashboard
                </CardTitle>
                <CardDescription>System performance monitoring and optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">142ms</div>
                      <p className="text-sm text-muted-foreground">Average API response time</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cache Hit Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">87%</div>
                      <p className="text-sm text-muted-foreground">Cache efficiency</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Error Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0.3%</div>
                      <p className="text-sm text-muted-foreground">System error rate</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <RealTimeDashboard />
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Testing Dashboard
                </CardTitle>
                <CardDescription>Automated testing and quality assurance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Test Coverage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">94%</div>
                      <p className="text-sm text-muted-foreground">Code coverage</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Test Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-lg font-semibold">All Passed</span>
                      </div>
                      <p className="text-sm text-muted-foreground">156/156 tests passing</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <IntegrationsTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Floating Assistant - Hidden on mobile to save space */}
      <div className="hidden lg:block">
        <AIFloatingAssistant
          onWorkflowGenerate={handleWorkflowGenerate}
          onGodTierActivate={handleGodTierActivate}
          onIntegrationSetup={handleIntegrationSetup}
        />
      </div>
    </ResponsiveLayout>
  );
}

export default withAuth(DashboardPage);