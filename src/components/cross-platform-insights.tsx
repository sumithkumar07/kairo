'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Workflow,
  Globe,
  Brain,
  Activity,
  Clock,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  LineChart,
  PieChart,
  Download,
  Share,
  Filter,
  Calendar,
  Eye,
  Star,
  Flame,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { withAsyncCache } from '@/lib/advanced-cache';

interface CrossPlatformMetric {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  category: 'analytics' | 'account' | 'learning' | 'integrations' | 'workflows';
  description: string;
  source: string;
}

interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  category: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  actions: Array<{
    label: string;
    url: string;
    type: 'primary' | 'secondary';
  }>;
  relatedSections: string[];
}

interface PerformanceInsight {
  id: string;
  metric: string;
  current: number;
  target: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  recommendation: string;
  impact: string;
}

const mockCrossPlatformMetrics: CrossPlatformMetric[] = [
  {
    id: 'metric-1',
    name: 'Total Workflow Executions',
    value: 89247,
    previousValue: 82156,
    change: 8.6,
    trend: 'up',
    unit: 'executions',
    category: 'workflows',
    description: 'Combined executions across all workflows',
    source: 'Analytics Dashboard'
  },
  {
    id: 'metric-2',
    name: 'Active Integrations',
    value: 12,
    previousValue: 9,
    change: 33.3,
    trend: 'up',
    unit: 'integrations',
    category: 'integrations',
    description: 'Successfully connected and active integrations',
    source: 'Integration Center'
  },
  {
    id: 'metric-3',
    name: 'Team Members',
    value: 24,
    previousValue: 18,
    change: 33.3,
    trend: 'up',
    unit: 'members',
    category: 'account',
    description: 'Active team members across all roles',
    source: 'Account Management'
  },
  {
    id: 'metric-4',
    name: 'Learning Progress',
    value: 67,
    previousValue: 52,
    change: 28.8,
    trend: 'up',
    unit: '%',
    category: 'learning',
    description: 'Average completion rate across all learning paths',
    source: 'Learning Center'
  },
  {
    id: 'metric-5',
    name: 'System Uptime',
    value: 99.97,
    previousValue: 99.94,
    change: 0.03,
    trend: 'up',
    unit: '%',
    category: 'analytics',
    description: 'Overall system reliability and availability',
    source: 'Monitoring Dashboard'
  }
];

const mockRecommendations: SmartRecommendation[] = [
  {
    id: 'rec-1',
    title: 'Optimize Workflow Performance',
    description: 'Your lead nurturing workflow shows high usage but slower execution times. Consider implementing parallel processing for email steps.',
    confidence: 87,
    category: 'Performance',
    impact: 'high',
    effort: 'medium',
    actions: [
      { label: 'View Workflow', url: '/workflow/lead-nurturing', type: 'primary' },
      { label: 'Optimization Guide', url: '/learn?tab=tutorials&search=optimization', type: 'secondary' }
    ],
    relatedSections: ['workflows', 'analytics', 'learning']
  },
  {
    id: 'rec-2',
    title: 'Complete Team Training',
    description: 'Only 60% of team members have completed basic workflow training. Boost productivity by encouraging completion.',
    confidence: 94,
    category: 'Team Development',
    impact: 'medium',
    effort: 'low',
    actions: [
      { label: 'Assign Training', url: '/account?tab=team', type: 'primary' },
      { label: 'View Progress', url: '/learn?tab=courses', type: 'secondary' }
    ],
    relatedSections: ['account', 'learning']
  },
  {
    id: 'rec-3',
    title: 'Explore Advanced Integrations',
    description: 'Based on your workflow patterns, HubSpot and Zapier integrations could automate 40% more tasks.',
    confidence: 78,
    category: 'Integration Opportunity',
    impact: 'high',
    effort: 'medium',
    actions: [
      { label: 'Browse Integrations', url: '/integrations?tab=marketplace', type: 'primary' },
      { label: 'Integration Templates', url: '/integrations?tab=templates', type: 'secondary' }
    ],
    relatedSections: ['integrations', 'workflows']
  }
];

const mockPerformanceInsights: PerformanceInsight[] = [
  {
    id: 'perf-1',
    metric: 'Workflow Success Rate',
    current: 94.2,
    target: 96.0,
    status: 'good',
    recommendation: 'Implement better error handling in critical workflows',
    impact: 'Reduce failed executions by ~50 per day'
  },
  {
    id: 'perf-2',
    metric: 'Average Response Time',
    current: 2.8,
    target: 2.0,
    status: 'needs_improvement',
    recommendation: 'Optimize database queries and enable caching',
    impact: 'Improve user experience by 40%'
  },
  {
    id: 'perf-3',
    metric: 'Integration Reliability',
    current: 98.7,
    target: 99.5,
    status: 'excellent',
    recommendation: 'Continue current monitoring practices',
    impact: 'Maintain high system reliability'
  }
];

export function CrossPlatformInsights() {
  const [metrics, setMetrics] = useState<CrossPlatformMetric[]>(mockCrossPlatformMetrics);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>(mockRecommendations);
  const [insights, setInsights] = useState<PerformanceInsight[]>(mockPerformanceInsights);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(false);

  const categories = ['all', 'analytics', 'account', 'learning', 'integrations', 'workflows'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'analytics': return BarChart3;
      case 'account': return Users;
      case 'learning': return Brain;
      case 'integrations': return Globe;
      case 'workflows': return Workflow;
      default: return Activity;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analytics': return 'text-blue-600 bg-blue-100';
      case 'account': return 'text-green-600 bg-green-100';
      case 'learning': return 'text-purple-600 bg-purple-100';
      case 'integrations': return 'text-orange-600 bg-orange-100';
      case 'workflows': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') return <ArrowUp className="h-3 w-3 text-green-500" />;
    if (trend === 'down') return <ArrowDown className="h-3 w-3 text-red-500" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs_improvement': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <Flame className="h-4 w-4 text-red-500" />;
      case 'medium': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const refreshData = async () => {
    setLoading(true);
    
    try {
      // Simulate API calls to different platform sections
      const cacheKey = `cross-platform:${timeRange}:${selectedCategory}`;
      
      await withAsyncCache(cacheKey, async () => {
        // Simulate data aggregation from all platform sections
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true };
      }, 60000);
      
      // Simulate data refresh
      setMetrics(prev => [...prev].map(m => ({
        ...m,
        value: m.value + Math.floor(Math.random() * 100) - 50
      })));
      
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary to-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            Cross-Platform Intelligence Hub
          </h2>
          <p className="text-muted-foreground">
            Unified insights from Analytics, Account, Learning, and Integration centers
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            {loading ? (
              <Activity className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Unified Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {filteredMetrics.map((metric) => {
          const CategoryIcon = getCategoryIcon(metric.category);
          
          return (
            <Card key={metric.id} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn('p-2 rounded-lg', getCategoryColor(metric.category))}>
                    <CategoryIcon className="h-4 w-4" />
                  </div>
                  {getTrendIcon(metric.trend, metric.change)}
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-foreground">
                    {formatNumber(metric.value)}{metric.unit === '%' && '%'}
                  </div>
                  <div className="text-sm text-muted-foreground">{metric.name}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      metric.change > 0 ? 'text-green-600 bg-green-100' : 
                      metric.change < 0 ? 'text-red-600 bg-red-100' : 
                      'text-gray-600 bg-gray-100'
                    )}>
                      {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                    </span>
                    <span className="text-muted-foreground">vs last period</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Smart Recommendations
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Performance Insights
          </TabsTrigger>
          <TabsTrigger value="cross-analysis" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Cross-Section Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid gap-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">{rec.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {rec.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {rec.description}
                        </p>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="flex items-center gap-1">
                          {getImpactIcon(rec.impact)}
                          <span className="text-xs text-muted-foreground capitalize">
                            {rec.impact} Impact
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {rec.confidence}% confidence
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Related sections:</span>
                        {rec.relatedSections.map((section) => {
                          const SectionIcon = getCategoryIcon(section);
                          return (
                            <div key={section} className={cn('p-1 rounded', getCategoryColor(section))}>
                              <SectionIcon className="h-3 w-3" />
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {rec.actions.map((action, index) => (
                          <Button
                            key={index}
                            variant={action.type === 'primary' ? 'default' : 'outline'}
                            size="sm"
                            className="text-xs"
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{insight.metric}</h3>
                      <Badge className={getStatusColor(insight.status)}>
                        {insight.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Current: {insight.current}{insight.metric.includes('Rate') ? '%' : insight.metric.includes('Time') ? 's' : ''}</span>
                        <span>Target: {insight.target}{insight.metric.includes('Rate') ? '%' : insight.metric.includes('Time') ? 's' : ''}</span>
                      </div>
                      
                      <Progress 
                        value={(insight.current / insight.target) * 100} 
                        className="h-3"
                      />
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <h4 className="text-sm font-medium text-foreground">Recommendation</h4>
                      <p className="text-sm text-muted-foreground">{insight.recommendation}</p>
                      <div className="flex items-center gap-2 text-xs text-primary">
                        <Zap className="h-3 w-3" />
                        Expected Impact: {insight.impact}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cross-analysis" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Usage Distribution
                </CardTitle>
                <CardDescription>
                  How different platform sections are being utilized
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.slice(1).map((category) => {
                    const categoryMetrics = metrics.filter(m => m.category === category);
                    const usage = categoryMetrics.reduce((sum, m) => sum + m.value, 0);
                    const percentage = (usage / metrics.reduce((sum, m) => sum + m.value, 0)) * 100;
                    const CategoryIcon = getCategoryIcon(category);
                    
                    return (
                      <div key={category} className="flex items-center gap-4">
                        <div className={cn('p-2 rounded-lg', getCategoryColor(category))}>
                          <CategoryIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium capitalize">{category}</span>
                            <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Growth Trends
                </CardTitle>
                <CardDescription>
                  Growth rates across different platform areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics
                    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
                    .slice(0, 5)
                    .map((metric) => {
                      const CategoryIcon = getCategoryIcon(metric.category);
                      
                      return (
                        <div key={metric.id} className="flex items-center gap-4">
                          <div className={cn('p-2 rounded-lg', getCategoryColor(metric.category))}>
                            <CategoryIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{metric.name}</span>
                              <div className="flex items-center gap-1">
                                {getTrendIcon(metric.trend, metric.change)}
                                <span className={cn(
                                  'text-sm font-medium',
                                  metric.change > 0 ? 'text-green-600' : 
                                  metric.change < 0 ? 'text-red-600' : 
                                  'text-gray-600'
                                )}>
                                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              From {metric.source}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}