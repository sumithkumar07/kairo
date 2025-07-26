'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Workflow,
  Zap,
  Target,
  BarChart3,
  Eye,
  Sparkles,
  Robot,
  MessageSquare,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Star,
  Flame,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIInsight {
  id: string;
  type: 'optimization' | 'prediction' | 'anomaly' | 'recommendation' | 'trend';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  impact: string;
  actionable: boolean;
  actions?: Array<{
    label: string;
    type: 'primary' | 'secondary';
    url?: string;
  }>;
  metadata: {
    timestamp: string;
    dataPoints: number;
    timeFrame: string;
    relatedWorkflows?: string[];
  };
}

interface AIPrediction {
  id: string;
  title: string;
  prediction: string;
  probability: number;
  timeframe: string;
  factors: string[];
  recommendation: string;
}

interface AIChat {
  id: string;
  message: string;
  response: string;
  timestamp: string;
  helpful: boolean | null;
}

const mockInsights: AIInsight[] = [
  {
    id: 'insight-1',
    type: 'optimization',
    title: 'Workflow Optimization Opportunity',
    description: 'Your lead nurturing workflow could be optimized to reduce execution time by 40% by consolidating duplicate email steps.',
    confidence: 87,
    priority: 'high',
    category: 'Performance',
    impact: 'Reduce execution time by 2.3 seconds',
    actionable: true,
    actions: [
      { label: 'Optimize Workflow', type: 'primary', url: '/workflow/lead-nurturing/optimize' },
      { label: 'View Details', type: 'secondary' }
    ],
    metadata: {
      timestamp: '2 hours ago',
      dataPoints: 1247,
      timeFrame: 'Last 30 days',
      relatedWorkflows: ['lead-nurturing', 'email-campaign']
    }
  },
  {
    id: 'insight-2',
    type: 'anomaly',
    title: 'Unusual Error Pattern Detected',
    description: 'Shopify integration showing 15% higher error rate than usual. This may be due to API rate limiting during peak hours.',
    confidence: 92,
    priority: 'critical',
    category: 'Integration Health',
    impact: 'Affecting 8% of total executions',
    actionable: true,
    actions: [
      { label: 'Check Integration', type: 'primary', url: '/integrations?search=shopify' },
      { label: 'View Logs', type: 'secondary' }
    ],
    metadata: {
      timestamp: '45 minutes ago',
      dataPoints: 892,
      timeFrame: 'Last 24 hours'
    }
  },
  {
    id: 'insight-3',
    type: 'recommendation',
    title: 'Suggested Integration',
    description: 'Based on your workflow patterns, HubSpot integration could streamline your lead management by 60%.',
    confidence: 78,
    priority: 'medium',
    category: 'Growth Opportunity',
    impact: 'Potential 3.2 hours saved per week',
    actionable: true,
    actions: [
      { label: 'Explore Integration', type: 'primary', url: '/integrations?tab=marketplace&search=hubspot' },
      { label: 'Learn More', type: 'secondary' }
    ],
    metadata: {
      timestamp: '3 hours ago',
      dataPoints: 2341,
      timeFrame: 'Last 90 days'
    }
  },
  {
    id: 'insight-4',
    type: 'prediction',
    title: 'Usage Growth Forecast',
    description: 'AI predicts 35% increase in workflow executions next month based on historical patterns and current growth.',
    confidence: 84,
    priority: 'medium',
    category: 'Capacity Planning',
    impact: 'May require plan upgrade',
    actionable: true,
    actions: [
      { label: 'Review Capacity', type: 'primary', url: '/account?tab=billing' },
      { label: 'View Forecast', type: 'secondary' }
    ],
    metadata: {
      timestamp: '5 hours ago',
      dataPoints: 3456,
      timeFrame: 'Last 6 months'
    }
  }
];

const mockPredictions: AIPrediction[] = [
  {
    id: 'pred-1',
    title: 'Workflow Success Rate',
    prediction: 'Lead nurturing workflow will maintain 95%+ success rate',
    probability: 89,
    timeframe: 'Next 30 days',
    factors: ['Historical performance', 'Integration stability', 'Error patterns'],
    recommendation: 'Continue current configuration with minor optimizations'
  },
  {
    id: 'pred-2',
    title: 'Peak Usage Time',
    prediction: 'Highest usage will occur between 2-4 PM EST',
    probability: 92,
    timeframe: 'Next week',
    factors: ['Historical patterns', 'Seasonal trends', 'User behavior'],
    recommendation: 'Schedule maintenance outside peak hours'
  }
];

const mockChats: AIChat[] = [
  {
    id: 'chat-1',
    message: 'How can I optimize my email workflow for better delivery rates?',
    response: 'Based on your current email workflow, I recommend implementing these optimizations: 1) Add email validation before sending, 2) Implement send-time optimization, 3) Add bounce handling and list cleaning. These changes could improve delivery rates by 15-20%.',
    timestamp: '10 minutes ago',
    helpful: null
  },
  {
    id: 'chat-2',
    message: 'Which integration would help automate my customer support tickets?',
    response: 'For customer support automation, I recommend integrating with Zendesk or Freshdesk. Based on your current workflow patterns, Zendesk would be the best fit as it offers better API capabilities for complex ticket routing and automated responses.',
    timestamp: '2 hours ago',
    helpful: true
  }
];

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<AIInsight[]>(mockInsights);
  const [predictions, setPredictions] = useState<AIPrediction[]>(mockPredictions);
  const [chats, setChats] = useState<AIChat[]>(mockChats);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'optimization': return Zap;
      case 'prediction': return TrendingUp;
      case 'anomaly': return AlertTriangle;
      case 'recommendation': return Lightbulb;
      case 'trend': return BarChart3;
      default: return Eye;
    }
  };

  const handleChatSubmit = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);
    const messageToSend = newMessage;
    setNewMessage('');

    // Simulate AI response
    setTimeout(() => {
      const newChat: AIChat = {
        id: `chat-${Date.now()}`,
        message: messageToSend,
        response: 'This is a simulated AI response. In a real implementation, this would connect to your AI service to provide intelligent insights based on your workflow data and patterns.',
        timestamp: 'Just now',
        helpful: null
      };
      
      setChats(prev => [newChat, ...prev]);
      setIsLoading(false);
    }, 1500);
  };

  const handleChatFeedback = (chatId: string, helpful: boolean) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, helpful } : chat
    ));
  };

  const refreshInsights = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setInsights(prev => [...prev].sort(() => Math.random() - 0.5));
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Insights Hub
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Powered by Advanced AI
                </Badge>
              </CardTitle>
              <CardDescription>
                Smart insights, predictions, and recommendations for your workflows
              </CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={refreshInsights} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Insights ({insights.length})
              </TabsTrigger>
              <TabsTrigger value="predictions" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Predictions
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                AI Chat
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="insights" className="mt-0 h-96">
            <ScrollArea className="h-full px-6">
              <div className="space-y-4 pb-4">
                {insights.map((insight) => {
                  const TypeIcon = getTypeIcon(insight.type);
                  
                  return (
                    <Card key={insight.id} className="border-l-4 border-l-primary/20">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <TypeIcon className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-sm">{insight.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getPriorityColor(insight.priority)} size="sm">
                                    {insight.priority.toUpperCase()}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{insight.category}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Shield className="h-3 w-3" />
                                {insight.confidence}% confident
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {insight.description}
                          </p>
                          
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-xs font-medium text-foreground mb-1">
                              <Target className="h-3 w-3" />
                              Expected Impact
                            </div>
                            <p className="text-sm text-muted-foreground">{insight.impact}</p>
                          </div>
                          
                          {insight.actionable && insight.actions && (
                            <div className="flex items-center gap-2 pt-2">
                              {insight.actions.map((action, index) => (
                                <Button
                                  key={index}
                                  variant={action.type === 'primary' ? 'default' : 'outline'}
                                  size="sm"
                                  className="text-xs"
                                >
                                  {action.label}
                                  <ArrowRight className="h-3 w-3 ml-1" />
                                </Button>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <span>{insight.metadata.timestamp}</span>
                            <span>{insight.metadata.dataPoints} data points</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="predictions" className="mt-0 h-96">
            <ScrollArea className="h-full px-6">
              <div className="space-y-4 pb-4">
                {predictions.map((prediction) => (
                  <Card key={prediction.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">{prediction.title}</h3>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3" />
                            {prediction.probability}% probability
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Progress value={prediction.probability} className="h-2" />
                          <p className="text-sm text-muted-foreground">{prediction.prediction}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <div className="font-medium text-foreground mb-1">Timeframe</div>
                            <div className="text-muted-foreground">{prediction.timeframe}</div>
                          </div>
                          <div>
                            <div className="font-medium text-foreground mb-1">Key Factors</div>
                            <div className="text-muted-foreground">
                              {prediction.factors.slice(0, 2).join(', ')}
                              {prediction.factors.length > 2 && '...'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">
                            <Lightbulb className="h-3 w-3" />
                            AI Recommendation
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-300">
                            {prediction.recommendation}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="chat" className="mt-0 h-96 flex flex-col">
            <div className="flex-1">
              <ScrollArea className="h-full px-6">
                <div className="space-y-4 pb-4">
                  {chats.map((chat) => (
                    <div key={chat.id} className="space-y-3">
                      <div className="bg-muted/30 rounded-lg p-3 ml-8">
                        <p className="text-sm text-foreground">{chat.message}</p>
                        <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                      </div>
                      
                      <div className="bg-primary/5 rounded-lg p-3 mr-8">
                        <div className="flex items-start gap-3">
                          <div className="p-1 bg-primary/10 rounded">
                            <Robot className="h-3 w-3 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-foreground leading-relaxed">{chat.response}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-muted-foreground">Was this helpful?</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  'h-6 w-6 p-0',
                                  chat.helpful === true && 'text-green-600 bg-green-100'
                                )}
                                onClick={() => handleChatFeedback(chat.id, true)}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  'h-6 w-6 p-0',
                                  chat.helpful === false && 'text-red-600 bg-red-100'
                                )}
                                onClick={() => handleChatFeedback(chat.id, false)}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="bg-primary/5 rounded-lg p-3 mr-8">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-primary/10 rounded">
                          <Robot className="h-3 w-3 text-primary animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
            
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask AI about your workflows, optimizations, or best practices..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleChatSubmit} 
                  disabled={!newMessage.trim() || isLoading}
                  size="sm"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}