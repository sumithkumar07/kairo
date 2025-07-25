'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

interface DashboardStats {
  totalWorkflows: number;
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  monthlyGrowth: number;
  costs: number;
  unreadNotifications: number;
  certificationsEarned: number;
}

interface RecentActivity {
  id: string;
  type: 'workflow_run' | 'workflow_saved' | 'ai_command' | 'certification_earned';
  title: string;
  status: 'success' | 'failed' | 'running';
  timestamp: string;
  metadata: any;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'create-workflow',
    title: 'Create Workflow',
    description: 'Build a new automation',
    icon: Plus,
    href: '/workflow',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'ai-studio',
    title: 'AI Studio',
    description: 'Generate with AI',
    icon: Brain,
    href: '/ai-studio',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'browse-integrations',
    title: 'Browse Integrations',
    description: 'Connect your apps',
    icon: Zap,
    href: '/integrations',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'view-analytics',
    title: 'View Analytics',
    description: 'Monitor performance',
    icon: BarChart3,
    href: '/reports',
    color: 'from-orange-500 to-red-500'
  }
];

const learningPaths = [
  {
    id: 'beginner',
    title: 'Automation Fundamentals',
    progress: 0,
    totalModules: 12,
    icon: BookOpen,
    color: 'text-green-500'
  },
  {
    id: 'intermediate',
    title: 'Advanced Workflow Design',
    progress: 65,
    totalModules: 18,
    icon: Rocket,
    color: 'text-blue-500'
  },
  {
    id: 'ai-powered',
    title: 'AI-Powered Automation',
    progress: 30,
    totalModules: 15,
    icon: Brain,
    color: 'text-purple-500'
  }
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
    certificationsEarned: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load dashboard data
    const loadDashboardData = async () => {
      try {
        // Simulate API calls
        setStats({
          totalWorkflows: 142,
          totalExecutions: 15674,
          successRate: 94.2,
          avgExecutionTime: 2.4,
          monthlyGrowth: 12.8,
          costs: 67.23,
          unreadNotifications: 3,
          certificationsEarned: 2
        });

        setRecentActivity([
          {
            id: '1',
            type: 'workflow_run',
            title: 'Welcome Email Automation',
            status: 'success',
            timestamp: new Date().toISOString(),
            metadata: { duration: '1.2s' }
          },
          {
            id: '2',
            type: 'ai_command',
            title: 'Generated workflow for data processing',
            status: 'success',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            metadata: { command: 'Generate a workflow...' }
          },
          {
            id: '3',
            type: 'certification_earned',
            title: 'Earned Automation Fundamentals Certificate',
            status: 'success',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            metadata: { score: 92 }
          }
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workflow_run':
        return <Play className="h-4 w-4" />;
      case 'workflow_saved':
        return <Workflow className="h-4 w-4" />;
      case 'ai_command':
        return <Brain className="h-4 w-4" />;
      case 'certification_earned':
        return <Award className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'running':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-r from-primary/5 via-purple-500/5 to-cyan-500/5 p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome back!</h1>
              <p className="text-muted-foreground">Here's what's happening with your automations</p>
            </div>
          </div>
          
          {stats.unreadNotifications > 0 && (
            <div className="flex items-center gap-2 mt-4">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm">
                You have {stats.unreadNotifications} unread notifications
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{stats.totalWorkflows}</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Workflow className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+{stats.monthlyGrowth}%</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Executions</p>
                <p className="text-2xl font-bold">{stats.totalExecutions.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Play className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">+{stats.monthlyGrowth}%</span>
              <span className="text-muted-foreground ml-1">this month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={stats.successRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Execution Time</p>
                <p className="text-2xl font-bold">{stats.avgExecutionTime}s</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-500">12.3% faster</span>
              <span className="text-muted-foreground ml-1">than last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Jump into common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto p-4 justify-start text-left"
                  asChild
                >
                  <a href={action.href}>
                    <div className="flex items-center gap-3 w-full">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color}`}>
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="learning">Learning Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest automations and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                      <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(activity.timestamp), 'PPp')}
                        </p>
                      </div>
                      <Badge variant="outline" className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
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
              <CardDescription>Continue your automation journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningPaths.map((path) => {
                  const PathIcon = path.icon;
                  return (
                    <div key={path.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card/50">
                      <div className="p-3 bg-muted rounded-lg">
                        <PathIcon className={`h-6 w-6 ${path.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{path.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={path.progress} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground">
                            {path.progress}% ({Math.round(path.progress / 100 * path.totalModules)}/{path.totalModules})
                          </span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        {path.progress > 0 ? 'Continue' : 'Start'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements & Certifications
              </CardTitle>
              <CardDescription>Your automation milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-card/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                      <Crown className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Automation Fundamentals</h4>
                      <p className="text-sm text-muted-foreground">Earned 2 days ago</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-yellow-600">
                    Certified
                  </Badge>
                </div>

                <div className="p-4 rounded-lg border bg-card/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">Security Specialist</h4>
                      <p className="text-sm text-muted-foreground">Earned 1 week ago</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-blue-600">
                    Certified
                  </Badge>
                </div>

                <div className="p-4 rounded-lg border bg-card/50 opacity-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Brain className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">AI Automation Expert</h4>
                      <p className="text-sm text-muted-foreground">60% complete</p>
                    </div>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}