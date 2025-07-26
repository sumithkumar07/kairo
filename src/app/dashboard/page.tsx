'use client';

import { useState, useEffect } from 'react';
import { EnhancedAppLayout } from '@/components/enhanced-app-layout';
import { withAuth } from '@/components/auth/with-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  LayoutDashboard, 
  Brain, 
  BarChart3, 
  Activity, 
  Lightbulb,
  TrendingUp,
  Monitor,
  History,
  Crown,
  Sparkles,
  Zap,
  Users,
  Globe,
  Database,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Download,
  Filter,
  Search,
  Eye,
  Play,
  Pause,
  MoreVertical,
  Settings,
  Target,
  Rocket,
  Shield,
  Cpu,
  MemoryStick,
  HardDrive,
  Wifi,
  Calendar,
  MessageSquare,
  FileText,
  Star,
  Award,
  Flame,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockMetrics = {
  totalWorkflows: 1247,
  activeWorkflows: 892,
  totalExecutions: 45620,
  successRate: 98.7,
  avgExecutionTime: 2.3,
  monthlyGrowth: 23.5,
  systemUptime: 99.94,
  apiCalls: 156789
};

const mockRecentActivity = [
  { id: 1, type: 'workflow_run', name: 'Email Campaign Automation', status: 'success', time: '2 minutes ago', duration: '1.2s' },
  { id: 2, type: 'integration_sync', name: 'Salesforce Lead Sync', status: 'success', time: '5 minutes ago', duration: '0.8s' },
  { id: 3, type: 'ai_generation', name: 'Customer Journey Workflow', status: 'success', time: '8 minutes ago', duration: '3.1s' },
  { id: 4, type: 'workflow_run', name: 'Inventory Update Process', status: 'failed', time: '12 minutes ago', duration: '2.7s' },
  { id: 5, type: 'integration_sync', name: 'Slack Notification System', status: 'success', time: '15 minutes ago', duration: '0.5s' }
];

const mockAIInsights = [
  { type: 'optimization', title: 'Performance Opportunity', description: 'Your email workflow could run 40% faster with parallel processing', priority: 'high' },
  { type: 'cost', title: 'Cost Savings', description: 'Switch to batch processing for inventory updates to save $120/month', priority: 'medium' },
  { type: 'reliability', title: 'Reliability Improvement', description: 'Add retry logic to payment processing workflow', priority: 'high' },
  { type: 'integration', title: 'New Integration', description: 'Consider adding HubSpot integration for better lead management', priority: 'low' }
];

const mockRunHistory = [
  { id: 'run_001', workflow: 'Email Marketing Campaign', status: 'success', startTime: '2024-01-15 10:30:00', duration: '2.1s', executions: 1250 },
  { id: 'run_002', workflow: 'Lead Qualification Process', status: 'success', startTime: '2024-01-15 10:25:00', duration: '1.8s', executions: 89 },
  { id: 'run_003', workflow: 'Inventory Sync', status: 'failed', startTime: '2024-01-15 10:20:00', duration: '5.2s', executions: 450 },
  { id: 'run_004', workflow: 'Customer Onboarding', status: 'success', startTime: '2024-01-15 10:15:00', duration: '3.4s', executions: 23 },
  { id: 'run_005', workflow: 'Data Backup Process', status: 'success', startTime: '2024-01-15 10:10:00', duration: '12.8s', executions: 1 }
];

function ConsolidatedDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('tab') || 'overview';
    }
    return 'overview';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
    toast({ title: 'Dashboard Updated', description: 'All data has been refreshed successfully.' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-950/20';
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20';
      case 'low': return 'border-blue-200 bg-blue-50 dark:bg-blue-950/20';
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  // Overview Dashboard Component
  const OverviewDashboard = () => (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Command Center
          </h2>
          <p className="text-muted-foreground text-lg">
            Unified dashboard with real-time insights and AI intelligence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
                <p className="text-3xl font-bold">{mockMetrics.totalWorkflows.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+{mockMetrics.monthlyGrowth}%</span>
                  <span className="text-sm text-muted-foreground ml-1">this month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-full">
                <LayoutDashboard className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                <p className="text-3xl font-bold">{mockMetrics.activeWorkflows.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <Activity className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">Running</span>
                </div>
              </div>
              <div className="p-3 bg-green-500/10 rounded-full">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold">{mockMetrics.successRate}%</p>
                <div className="flex items-center mt-2">
                  <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+0.3%</span>
                  <span className="text-sm text-muted-foreground ml-1">vs last week</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-full">
                <Target className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Execution Time</p>
                <p className="text-3xl font-bold">{mockMetrics.avgExecutionTime}s</p>
                <div className="flex items-center mt-2">
                  <ArrowDown className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">-15%</span>
                  <span className="text-sm text-muted-foreground ml-1">faster</span>
                </div>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest workflow executions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {mockRecentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{activity.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{activity.time}</span>
                        <span>•</span>
                        <span>{activity.duration}</span>
                      </div>
                    </div>
                    <Badge variant={activity.status === 'success' ? 'default' : 'destructive'} className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights
            </CardTitle>
            <CardDescription>Smart recommendations to improve your workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-4">
                {mockAIInsights.map((insight, index) => (
                  <Card key={index} className={cn("border", getPriorityColor(insight.priority))}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Lightbulb className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{insight.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {insight.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            Apply Suggestion
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Analytics Dashboard Component
  const AnalyticsDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Advanced Analytics</h2>
          <p className="text-muted-foreground">Comprehensive metrics and performance insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Execution Performance</CardTitle>
            <CardDescription>Workflow execution times over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/10">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Performance Chart</p>
                <p className="text-xs text-muted-foreground">Interactive analytics visualization</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate Trends</CardTitle>
            <CardDescription>Workflow success rates and error patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/10">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Success Rate Chart</p>
                <p className="text-xs text-muted-foreground">Real-time trend analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Monthly API Calls</span>
                  <span className="font-medium">{mockMetrics.apiCalls.toLocaleString()}</span>
                </div>
                <Progress value={65} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">65% of monthly limit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">{mockMetrics.systemUptime}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Connections</span>
                <span className="text-sm font-medium">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Avg Response Time</span>
                <span className="text-sm font-medium">120ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resource Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>CPU Usage</span>
                  <span className="font-medium">34%</span>
                </div>
                <Progress value={34} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Memory Usage</span>
                  <span className="font-medium">67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // AI Intelligence Dashboard Component  
  const AIIntelligenceDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Intelligence Center
          </h2>
          <p className="text-muted-foreground">Advanced AI capabilities and god-tier features</p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2">
          <Crown className="h-4 w-4 mr-2" />
          God-Tier Enabled
        </Badge>
      </div>

      {/* AI Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="group hover:shadow-lg transition-all duration-300 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Quantum Simulation</h3>
                <p className="text-sm text-muted-foreground">99.1% accuracy predictions</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Simulations</span>
                <span className="font-medium">47</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Processing Power</span>
                <span className="font-medium">1.18 Quintillion states</span>
              </div>
            </div>
            <Button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500">
              Launch Simulation
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">HIPAA Compliance</h3>
                <p className="text-sm text-muted-foreground">95.8% compliance score</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Audit Trails</span>
                <span className="font-medium">Complete</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>PHI Protection</span>
                <span className="font-medium">Verified</span>
              </div>
            </div>
            <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500">
              View Compliance
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Global Consciousness</h3>
                <p className="text-sm text-muted-foreground">1B+ connected devices</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Streams</span>
                <span className="font-medium">89M</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Countries</span>
                <span className="font-medium">195</span>
              </div>
            </div>
            <Button className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500">
              Access Feed
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Performance Metrics
          </CardTitle>
          <CardDescription>Real-time AI model performance and capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">10+</div>
              <div className="text-sm text-muted-foreground">AI Models</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">50+</div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <div className="text-sm text-muted-foreground">Accuracy</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">< 1s</div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Performance Monitoring Component
  const PerformanceDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Performance Monitor</h2>
          <p className="text-muted-foreground">Real-time system performance and monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live Monitoring</span>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CPU Usage</p>
                <p className="text-2xl font-bold">34.2%</p>
              </div>
              <Cpu className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={34.2} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Memory Usage</p>
                <p className="text-2xl font-bold">67.8%</p>
              </div>
              <MemoryStick className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={67.8} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Disk Usage</p>
                <p className="text-2xl font-bold">23.4%</p>
              </div>
              <HardDrive className="h-8 w-8 text-purple-500" />
            </div>
            <Progress value={23.4} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Network I/O</p>
                <p className="text-2xl font-bold">156 MB/s</p>
              </div>
              <Wifi className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              ↑ 89 MB/s ↓ 67 MB/s
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Run History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Workflow Runs
          </CardTitle>
          <CardDescription>Detailed execution history and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflow runs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <div className="space-y-2">
            {mockRunHistory.map((run) => (
              <div key={run.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                {getStatusIcon(run.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{run.workflow}</p>
                    <Badge variant="outline" className="text-xs">
                      {run.id}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>{run.startTime}</span>
                    <span>Duration: {run.duration}</span>
                    <span>Executions: {run.executions}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Insights Dashboard Component
  const InsightsDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">AI-Powered Insights</h2>
          <p className="text-muted-foreground">Smart analytics and predictive recommendations</p>
        </div>
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2">
          <Flame className="h-4 w-4 mr-2" />
          Live Insights
        </Badge>
      </div>

      {/* Insight Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <TrendingUp className="h-5 w-5" />
              Performance Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-background rounded-lg">
                <h4 className="font-medium text-sm mb-1">Parallel Processing</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Run email and database operations in parallel for 40% speed improvement
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">High Impact</Badge>
                  <Button size="sm" variant="outline" className="h-6 text-xs">Apply</Button>
                </div>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <h4 className="font-medium text-sm mb-1">Caching Strategy</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Add Redis caching to reduce API response times by 65%
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">Medium Impact</Badge>
                  <Button size="sm" variant="outline" className="h-6 text-xs">Apply</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Shield className="h-5 w-5" />
              Reliability Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-background rounded-lg">
                <h4 className="font-medium text-sm mb-1">Retry Logic</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Add exponential backoff to payment processing workflows
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">High Priority</Badge>
                  <Button size="sm" variant="outline" className="h-6 text-xs">Implement</Button>
                </div>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <h4 className="font-medium text-sm mb-1">Health Checks</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Monitor integration endpoints for proactive error handling
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">Medium Priority</Badge>
                  <Button size="sm" variant="outline" className="h-6 text-xs">Enable</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Star className="h-5 w-5" />
              Feature Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-background rounded-lg">
                <h4 className="font-medium text-sm mb-1">Smart Routing</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Route high-priority leads to senior sales team members
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">New Feature</Badge>
                  <Button size="sm" variant="outline" className="h-6 text-xs">Add</Button>
                </div>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <h4 className="font-medium text-sm mb-1">AI Validation</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Use ML to validate data quality before processing
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">AI Enhanced</Badge>
                  <Button size="sm" variant="outline" className="h-6 text-xs">Enable</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Predictive Analytics
          </CardTitle>
          <CardDescription>AI-powered predictions and trend analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
              <div className="text-3xl font-bold text-blue-600 mb-2">+127%</div>
              <div className="text-sm font-medium mb-1">Predicted Growth</div>
              <div className="text-xs text-muted-foreground">Next 30 days</div>
            </div>
            <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <div className="text-3xl font-bold text-green-600 mb-2">99.2%</div>
              <div className="text-sm font-medium mb-1">Expected Uptime</div>
              <div className="text-xs text-muted-foreground">This month</div>
            </div>
            <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <div className="text-3xl font-bold text-purple-600 mb-2">$2.4K</div>
              <div className="text-sm font-medium mb-1">Cost Savings</div>
              <div className="text-xs text-muted-foreground">Potential monthly</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <EnhancedAppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Consolidated Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="ai-intelligence" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">AI Intelligence</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Performance</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewDashboard />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          {/* AI Intelligence Tab */}
          <TabsContent value="ai-intelligence" className="space-y-6">
            <AIIntelligenceDashboard />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceDashboard />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <InsightsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </EnhancedAppLayout>
  );
}

export default withAuth(ConsolidatedDashboard);