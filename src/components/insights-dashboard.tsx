'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  Brain, 
  TrendingUp, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Zap,
  Clock,
  DollarSign,
  Users,
  Workflow,
  BarChart3,
  Eye,
  ArrowRight,
  Star,
  Sparkles
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'performance' | 'cost' | 'optimization' | 'security' | 'usage';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  confidence: number;
  action: string;
  estimatedSavings?: string;
  timestamp: Date;
}

const insights: Insight[] = [
  {
    id: '1',
    type: 'optimization',
    priority: 'high',
    title: 'Workflow Execution Time Optimization',
    description: 'AI detected that 3 workflows can reduce execution time by 40% through parallel processing optimization.',
    impact: 'High performance gain',
    confidence: 94,
    action: 'Optimize workflows',
    estimatedSavings: '2.3 hours/day',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: '2',
    type: 'cost',
    priority: 'high',
    title: 'Resource Usage Optimization',
    description: 'Analysis shows potential cost savings by optimizing integration API call patterns during off-peak hours.',
    impact: 'Cost reduction opportunity',
    confidence: 87,
    action: 'Schedule optimization',
    estimatedSavings: '$245/month',
    timestamp: new Date(Date.now() - 7200000)
  },
  {
    id: '3',
    type: 'performance',
    priority: 'medium',
    title: 'Cache Hit Rate Improvement',
    description: 'Cache efficiency can be improved by 25% through intelligent cache warming strategies.',
    impact: 'Faster response times',
    confidence: 91,
    action: 'Configure cache warming',
    estimatedSavings: '15% faster responses',
    timestamp: new Date(Date.now() - 10800000)
  },
  {
    id: '4',
    type: 'usage',
    priority: 'medium',
    title: 'Underutilized Integrations',
    description: '2 integrations have low usage patterns and may benefit from workflow recommendations.',
    impact: 'Improved ROI',
    confidence: 78,
    action: 'Review integration usage',
    timestamp: new Date(Date.now() - 14400000)
  },
  {
    id: '5',
    type: 'security',
    priority: 'low',
    title: 'API Key Rotation Recommendation',
    description: 'Some API keys haven\'t been rotated in 6 months. Consider implementing automatic rotation.',
    impact: 'Enhanced security',
    confidence: 85,
    action: 'Enable key rotation',
    timestamp: new Date(Date.now() - 18000000)
  }
];

const trendAnalysis = [
  {
    metric: 'Workflow Success Rate',
    current: 94.2,
    trend: 'up',
    change: 2.3,
    forecast: 'Expected to reach 96% by next month',
    icon: CheckCircle,
    color: 'text-green-500'
  },
  {
    metric: 'Average Execution Time',
    current: 2.8,
    trend: 'down', // down is good for execution time
    change: -15.7,
    forecast: 'Continuing downward trend expected',
    icon: Clock,
    color: 'text-green-500'
  },
  {
    metric: 'Cost Per Execution',
    current: 0.23,
    trend: 'down',
    change: -8.4,
    forecast: 'Further optimization opportunities identified',
    icon: DollarSign,
    color: 'text-green-500'
  },
  {
    metric: 'User Engagement',
    current: 78,
    trend: 'up',
    change: 12.1,
    forecast: 'Strong adoption growth continuing',
    icon: Users,
    color: 'text-blue-500'
  }
];

export function InsightsDashboard() {
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'performance': return 'from-blue-500 to-cyan-500';
      case 'cost': return 'from-green-500 to-emerald-500';
      case 'optimization': return 'from-purple-500 to-pink-500';
      case 'security': return 'from-red-500 to-orange-500';
      case 'usage': return 'from-yellow-500 to-amber-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const filteredInsights = insights.filter(insight => {
    if (selectedPriority !== 'all' && insight.priority !== selectedPriority) return false;
    if (selectedType !== 'all' && insight.type !== selectedType) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Insights Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 rounded-2xl" />
        <div className="relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent">
                  AI-Powered Insights
                </h2>
                <p className="text-muted-foreground mt-1">
                  Intelligent recommendations and predictive analytics to optimize your workflows
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-700">
                <Brain className="h-3 w-3 mr-1" />
                {insights.length} Active Insights
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trend Analysis
          </CardTitle>
          <CardDescription>
            AI-powered trend analysis and forecasting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendAnalysis.map((trend, index) => {
              const IconComponent = trend.icon;
              return (
                <div key={index} className="p-4 rounded-lg border bg-card/50">
                  <div className="flex items-center justify-between mb-3">
                    <IconComponent className={`h-5 w-5 ${trend.color}`} />
                    <Badge variant="outline" className="text-xs">
                      {trend.change > 0 ? '+' : ''}{trend.change}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-sm">{trend.metric}</p>
                    <p className="text-2xl font-bold">{trend.current}{trend.metric.includes('Time') ? 's' : trend.metric.includes('Cost') ? '$' : trend.metric.includes('Rate') ? '%' : ''}</p>
                    <p className="text-xs text-muted-foreground">{trend.forecast}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Priority:</span>
          <div className="flex gap-1">
            {['all', 'high', 'medium', 'low'].map((priority) => (
              <Button
                key={priority}
                variant={selectedPriority === priority ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority(priority)}
                className="capitalize"
              >
                {priority}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Type:</span>
          <div className="flex gap-1">
            {['all', 'performance', 'cost', 'optimization', 'security', 'usage'].map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights Grid */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <Card key={insight.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getInsightColor(insight.type)} opacity-5 rounded-full -translate-y-12 translate-x-12`} />
            
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-3 bg-gradient-to-r ${getInsightColor(insight.type)} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{insight.title}</h3>
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority} priority
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {insight.type}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-3 leading-relaxed">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Impact:</span>
                        <span>{insight.impact}</span>
                      </div>
                      
                      {insight.estimatedSavings && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span className="font-medium">Savings:</span>
                          <span className="text-green-600 font-medium">{insight.estimatedSavings}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">Confidence:</span>
                        <span>{insight.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <span className="text-xs text-muted-foreground">
                    {insight.timestamp.toLocaleTimeString()}
                  </span>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                    <Button size="sm" className="group-hover:scale-105 transition-transform">
                      <Zap className="h-4 w-4 mr-1" />
                      {insight.action}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Confidence Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">AI Confidence Score</span>
                  <span className="font-medium">{insight.confidence}%</span>
                </div>
                <Progress value={insight.confidence} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Insights Summary
          </CardTitle>
          <CardDescription>
            Overall impact and recommendations summary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 mb-2">$2,847</div>
              <div className="text-sm text-green-700 dark:text-green-300">Potential Monthly Savings</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 mb-2">34%</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Average Performance Improvement</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
              <div className="text-2xl font-bold text-purple-600 mb-2">89%</div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Average Confidence Score</div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Apply All High-Priority Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}