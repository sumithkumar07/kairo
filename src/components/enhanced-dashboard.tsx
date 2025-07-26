'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Workflow, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Clock,
  Zap,
  Star,
  BookOpen,
  Award,
  Users,
  BarChart3,
  Activity,
  Bell,
  Settings,
  Plus,
  ArrowRight,
  Eye,
  Coffee,
  Sparkles,
  Target,
  Crown,
  Brain,
  Rocket,
  Shield,
  Globe,
  Database,
  MessageSquare,
  Mail,
  CreditCard,
  Smartphone,
  Calendar,
  FileText,
  Gauge,
  Cpu,
  HardDrive,
  Wifi,
  Network,
  Monitor,
  Lock,
  Key,
  Code,
  GitBranch,
  Layers,
  RefreshCw,
  DollarSign,
  TrendingDown,
  Minus,
  AlertTriangle,
  Info,
  Search,
  Filter,
  MoreHorizontal,
  Maximize2,
  Download,
  Upload,
  Share2,
  ChevronRight,
  ChevronDown,
  Grid,
  List,
  Edit,
  Trash2,
  Archive,
  Bookmark,
  Tag,
  Move,
  Copy,
  Link,
  ExternalLink,
  Pause,
  Square,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  Image,
  Video,
  Music,
  Folder,
  FolderOpen,
  Save,
  Download as DownloadIcon,
  Upload as UploadIcon
} from 'lucide-react';
import { format } from 'date-fns';

// Enhanced Dashboard with comprehensive command center functionality
// Integrates data from all consolidated pages: Analytics, Account, Learning, Integrations

interface DashboardStats {
  totalWorkflows: number;
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  monthlyGrowth: number;
  costs: number;
  unreadNotifications: number;
  certificationsEarned: number;
  activeIntegrations: number;
  teamMembers: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
}

interface RecentActivity {
  id: string;
  type: 'workflow_run' | 'workflow_saved' | 'ai_command' | 'certification_earned' | 'integration_connected' | 'team_joined' | 'alert_generated';
  title: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  timestamp: string;
  metadata: any;
  category?: string;
  user?: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  category: string;
}

interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'progress' | 'status';
  size: 'small' | 'medium' | 'large';
  enabled: boolean;
  position: { x: number; y: number };
  data: any;
}

const quickActions: QuickAction[] = [
  // Workflow Actions
  {
    id: 'create-workflow',
    title: 'Create Workflow',
    description: 'Build a new automation',
    icon: Plus,
    href: '/workflow',
    color: 'from-blue-500 to-cyan-500',
    category: 'workflows'
  },
  {
    id: 'ai-studio',
    title: 'AI Studio',
    description: 'Generate with AI',
    icon: Brain,
    href: '/ai-studio',
    color: 'from-purple-500 to-pink-500',
    category: 'ai'
  },
  {
    id: 'workflow-templates',
    title: 'Browse Templates',
    description: 'Pre-built workflows',
    icon: FileText,
    href: '/workflow?tab=templates',
    color: 'from-indigo-500 to-purple-500',
    category: 'workflows'
  },
  // Integration Actions
  {
    id: 'browse-integrations',
    title: 'Browse Integrations',
    description: 'Connect your apps',
    icon: Zap,
    href: '/integrations',
    color: 'from-green-500 to-emerald-500',
    category: 'integrations'
  },
  {
    id: 'marketplace',
    title: 'App Marketplace',
    description: 'Discover new apps',
    icon: Globe,
    href: '/integrations?tab=marketplace',
    color: 'from-orange-500 to-red-500',
    category: 'integrations'
  },
  // Analytics Actions
  {
    id: 'view-analytics',
    title: 'View Analytics',
    description: 'Monitor performance',
    icon: BarChart3,
    href: '/analytics',
    color: 'from-teal-500 to-blue-500',
    category: 'analytics'
  },
  {
    id: 'real-time-monitoring',
    title: 'Live Monitoring',
    description: 'Real-time insights',
    icon: Activity,
    href: '/analytics?tab=real-time',
    color: 'from-red-500 to-pink-500',
    category: 'analytics'
  },
  // Learning Actions
  {
    id: 'learning-center',
    title: 'Learning Center',
    description: 'Expand your skills',
    icon: BookOpen,
    href: '/learn',
    color: 'from-yellow-500 to-orange-500',
    category: 'learning'
  },
  {
    id: 'certifications',
    title: 'Get Certified',
    description: 'Earn certificates',
    icon: Award,
    href: '/learn?tab=courses',
    color: 'from-emerald-500 to-teal-500',
    category: 'learning'
  },
  // Account Actions
  {
    id: 'team-management',
    title: 'Manage Team',
    description: 'Invite & organize',
    icon: Users,
    href: '/account?tab=team',
    color: 'from-violet-500 to-purple-500',
    category: 'account'
  },
  {
    id: 'account-settings',
    title: 'Account Settings',
    description: 'Profile & preferences',
    icon: Settings,
    href: '/account',
    color: 'from-gray-500 to-slate-500',
    category: 'account'
  },
  {
    id: 'security-settings',
    title: 'Security Center',
    description: 'Keys & permissions',
    icon: Shield,
    href: '/account?tab=security',
    color: 'from-red-500 to-rose-500',
    category: 'account'
  }
];

const learningPaths = [
  {
    id: 'beginner',
    title: 'Automation Fundamentals',
    progress: 78,
    totalModules: 12,
    icon: BookOpen,
    color: 'text-green-500',
    nextModule: 'Error Handling Basics',
    estimatedTime: '2h left'
  },
  {
    id: 'intermediate',
    title: 'Advanced Workflow Design',
    progress: 65,
    totalModules: 18,
    icon: Rocket,
    color: 'text-blue-500',
    nextModule: 'Complex Conditional Logic',
    estimatedTime: '5h left'
  },
  {
    id: 'ai-powered',
    title: 'AI-Powered Automation',
    progress: 30,
    totalModules: 15,
    icon: Brain,
    color: 'text-purple-500',
    nextModule: 'Natural Language Processing',
    estimatedTime: '8h left'
  },
  {
    id: 'enterprise',
    title: 'Enterprise Security & Compliance',
    progress: 12,
    totalModules: 20,
    icon: Shield,
    color: 'text-red-500',
    nextModule: 'SOC 2 Requirements',
    estimatedTime: '15h left'
  }
];

const systemMetrics = {
  cpu: { current: 42, average: 38, peak: 78, status: 'healthy' },
  memory: { current: 68, average: 65, peak: 89, status: 'healthy' },
  disk: { current: 23, average: 25, peak: 45, status: 'healthy' },
  network: { latency: '45ms', throughput: '125 Mbps', status: 'healthy' },
  database: { connections: 15, maxConnections: 100, responseTime: '12ms', status: 'healthy' },
  services: { active: 8, total: 8, status: 'healthy' }
};

const integrationHealth = [
  { name: 'Salesforce', status: 'healthy', latency: '120ms', requests: 1247, success: 99.2 },
  { name: 'Slack', status: 'healthy', latency: '85ms', requests: 856, success: 99.8 },
  { name: 'Google Sheets', status: 'warning', latency: '200ms', requests: 634, success: 96.5 },
  { name: 'Shopify', status: 'healthy', latency: '150ms', requests: 423, success: 98.7 }
];

const topWorkflows = [
  { id: '1', name: 'Lead Nurturing Campaign', executions: 12847, successRate: 96.8, avgTime: 3.2, status: 'running' },
  { id: '2', name: 'Customer Onboarding', executions: 8934, successRate: 94.1, avgTime: 5.7, status: 'running' },
  { id: '3', name: 'Invoice Processing', executions: 6521, successRate: 98.3, avgTime: 1.4, status: 'paused' },
  { id: '4', name: 'Social Media Automation', executions: 4392, successRate: 92.7, avgTime: 2.1, status: 'running' }
];

const alerts = [
  { id: '1', type: 'warning', title: 'High Memory Usage', message: 'Memory usage above 80%', time: '5m ago', category: 'system' },
  { id: '2', type: 'info', title: 'New Integration Available', message: 'Microsoft Teams integration is now available', time: '1h ago', category: 'integration' },
  { id: '3', type: 'success', title: 'Certification Earned', message: 'Team member completed AI Fundamentals', time: '2h ago', category: 'learning' }
];

export function EnhancedDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkflows: 0,
    totalExecutions: 0,
    successRate: 0,
    avgExecutionTime: 0,
    monthlyGrowth: 0,
    costs: 0,
    unreadNotifications: 0,
    certificationsEarned: 0,
    activeIntegrations: 0,
    teamMembers: 0,
    systemHealth: 'excellent',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkLatency: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionCategory, setSelectedActionCategory] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    if (autoRefresh) {
      const interval = setInterval(loadDashboardData, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadDashboardData = async () => {
    try {
      // Simulate comprehensive API calls from all consolidated pages
      setStats({
        totalWorkflows: 247,
        totalExecutions: 89247,
        successRate: 94.2,
        avgExecutionTime: 2.8,
        monthlyGrowth: 12.8,
        costs: 156.78,
        unreadNotifications: 7,
        certificationsEarned: 4,
        activeIntegrations: 12,
        teamMembers: 8,
        systemHealth: 'excellent',
        cpuUsage: 42,
        memoryUsage: 68,
        diskUsage: 23,
        networkLatency: 45
      });

      setRecentActivity([
        {
          id: '1',
          type: 'workflow_run',
          title: 'Lead Nurturing Campaign completed successfully',
          status: 'success',
          timestamp: new Date().toISOString(),
          metadata: { duration: '3.2s', executions: 147 },
          category: 'workflows',
          user: 'System'
        },
        {
          id: '2',
          type: 'integration_connected',
          title: 'Microsoft Teams integration connected',
          status: 'success',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          metadata: { integration: 'Microsoft Teams' },
          category: 'integrations',
          user: 'Sarah Johnson'
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
        },
        {
          id: '6',
          type: 'alert_generated',
          title: 'High memory usage detected',
          status: 'failed',
          timestamp: new Date(Date.now() - 2700000).toISOString(),
          metadata: { usage: '87%', threshold: '80%' },
          category: 'system',
          user: 'System Monitor'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-500 bg-green-500/10';
      case 'failed': return 'text-red-500 bg-red-500/10';
      case 'running': return 'text-blue-500 bg-blue-500/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getHealthStatus = (health: string) => {
    switch (health) {
      case 'excellent': return { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Excellent' };
      case 'good': return { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Good' };
      case 'warning': return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Warning' };
      case 'critical': return { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Critical' };
      default: return { color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'Unknown' };
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
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

  const healthStatus = getHealthStatus(stats.systemHealth);

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Live Status */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-primary/5 via-purple-500/5 to-cyan-500/5 p-8">
        <div className="relative z-10">
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
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${healthStatus.bg}`}>
                <div className={`w-2 h-2 rounded-full ${healthStatus.color.replace('text-', 'bg-')} animate-pulse`}></div>
                <span className={`text-sm font-medium ${healthStatus.color}`}>
                  System {healthStatus.label}
                </span>
              </div>
              
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
              
              <Button variant="outline" size="sm" onClick={loadDashboardData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Alerts */}
          {alerts.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {alerts.slice(0, 3).map((alert) => (
                <Badge key={alert.id} variant="outline" className="flex items-center gap-2">
                  {alert.type === 'warning' && <AlertTriangle className="h-3 w-3 text-yellow-500" />}
                  {alert.type === 'info' && <Info className="h-3 w-3 text-blue-500" />}
                  {alert.type === 'success' && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                  <span className="text-xs">{alert.title}</span>
                  <span className="text-xs text-muted-foreground">• {alert.time}</span>
                </Badge>
              ))}
              {alerts.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{alerts.length - 3} more alerts
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Key Metrics - Now with 8 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Workflows</p>
                <p className="text-3xl font-bold">{stats.totalWorkflows}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                <Workflow className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              {getTrendIcon(stats.monthlyGrowth)}
              <span className={stats.monthlyGrowth > 0 ? 'text-green-500' : 'text-red-500'}>
                {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth}%
              </span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Executions</p>
                <p className="text-3xl font-bold">{stats.totalExecutions.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
                <Play className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              {getTrendIcon(8.3)}
              <span className="text-green-500">+8.3%</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold">{stats.successRate}%</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                <CheckCircle2 className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={stats.successRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Avg Execution Time</p>
                <p className="text-3xl font-bold">{stats.avgExecutionTime}s</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              {getTrendIcon(15.7)}
              <span className="text-green-500">15.7% faster</span>
              <span className="text-muted-foreground ml-1">than last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Active Integrations</p>
                <p className="text-3xl font-bold">{stats.activeIntegrations}</p>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-xl group-hover:bg-indigo-500/20 transition-colors">
                <Globe className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              {getTrendIcon(4.2)}
              <span className="text-green-500">+4.2%</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Team Members</p>
                <p className="text-3xl font-bold">{stats.teamMembers}</p>
              </div>
              <div className="p-3 bg-teal-500/10 rounded-xl group-hover:bg-teal-500/20 transition-colors">
                <Users className="h-6 w-6 text-teal-500" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              {getTrendIcon(25.0)}
              <span className="text-green-500">+25.0%</span>
              <span className="text-muted-foreground ml-1">team growth</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Costs</p>
                <p className="text-3xl font-bold">${stats.costs}</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl group-hover:bg-yellow-500/20 transition-colors">
                <DollarSign className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              {getTrendIcon(-8.4)}
              <span className="text-green-500">-8.4%</span>
              <span className="text-muted-foreground ml-1">cost reduction</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-500/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Certifications</p>
                <p className="text-3xl font-bold">{stats.certificationsEarned}</p>
              </div>
              <div className="p-3 bg-rose-500/10 rounded-xl group-hover:bg-rose-500/20 transition-colors">
                <Award className="h-6 w-6 text-rose-500" />
              </div>
            </div>
            <div className="flex items-center text-sm">
              {getTrendIcon(100.0)}
              <span className="text-green-500">+100%</span>
              <span className="text-muted-foreground ml-1">this quarter</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions with Search and Filtering */}
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
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search actions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              <Select value={selectedActionCategory} onValueChange={setSelectedActionCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="workflows">Workflows</SelectItem>
                  <SelectItem value="integrations">Integrations</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="ai">AI & Automation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                        <ActionIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </a>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
          <Card>
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
                      <SelectItem value="system">System</SelectItem>
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
                      <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">{activity.title}</p>
                          <Badge variant="outline" className={`${getStatusColor(activity.status)} text-xs`}>
                            {activity.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {format(new Date(activity.timestamp), 'PPp')}
                        </p>
                        {activity.user && (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {activity.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">by {activity.user}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card>
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
                      <div className={`w-3 h-3 rounded-full ${
                        workflow.status === 'running' ? 'bg-green-500 animate-pulse' : 
                        workflow.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <h4 className="font-semibold">{workflow.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Status: <span className="capitalize">{workflow.status}</span>
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
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
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
                  <Progress value={systemMetrics.cpu.current} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
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
                  <Progress value={systemMetrics.memory.current} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
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
                  <Progress value={systemMetrics.disk.current} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
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
                    <span className="font-medium">{systemMetrics.database.connections}/{systemMetrics.database.maxConnections}</span>
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
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
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
                      <div className={`w-3 h-3 rounded-full ${
                        integration.status === 'healthy' ? 'bg-green-500' : 
                        integration.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
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
                      <Badge variant="outline" className={`${
                        integration.status === 'healthy' ? 'text-green-600 border-green-200' :
                        integration.status === 'warning' ? 'text-yellow-600 border-yellow-200' :
                        'text-red-600 border-red-200'
                      }`}>
                        {integration.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <Card>
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
                            <Button size="sm" className="group-hover:shadow-md transition-shadow">
                              {path.progress > 0 ? (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Continue
                                </>
                              ) : (
                                <>
                                  <Rocket className="h-4 w-4 mr-2" />
                                  Start Learning
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}