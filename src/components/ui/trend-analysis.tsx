'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Brain,
  Zap,
  Target,
  Activity,
  BarChart3,
  LineChart,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Sparkles,
  Award,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendData {
  period: string;
  value: number;
  change: number;
  prediction?: number;
}

interface Insight {
  id: string;
  type: 'trend' | 'anomaly' | 'prediction' | 'recommendation';
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  description: string;
  metric: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timestamp: string;
  actionable?: boolean;
  suggestedAction?: string;
}

interface AnomalyDetection {
  metric: string;
  current: number;
  expected: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  description: string;
}

interface PredictiveModel {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  trend: 'up' | 'down' | 'stable';
  factors: string[];
}

const sampleTrendData: TrendData[] = [
  { period: 'Jan', value: 1200, change: 15.2 },
  { period: 'Feb', value: 1380, change: 12.8 },
  { period: 'Mar', value: 1560, change: 18.3 },
  { period: 'Apr', value: 1420, change: -9.0 },
  { period: 'May', value: 1680, change: 18.3 },
  { period: 'Jun', value: 1850, change: 10.1, prediction: 1920 }
];

const sampleInsights: Insight[] = [
  {
    id: '1',
    type: 'trend',
    severity: 'success',
    title: 'Workflow Performance Improving',
    description: '23% improvement in execution success rate over the last 30 days',
    metric: 'Success Rate',
    confidence: 94,
    impact: 'high',
    timestamp: '2 hours ago',
    actionable: true,
    suggestedAction: 'Consider scaling successful workflow patterns to other automations'
  },
  {
    id: '2',
    type: 'anomaly',
    severity: 'warning',
    title: 'Unusual API Response Times',
    description: 'Salesforce integration showing 40% slower response times than normal',
    metric: 'API Latency',
    confidence: 87,
    impact: 'medium',
    timestamp: '15 minutes ago',
    actionable: true,
    suggestedAction: 'Check Salesforce API status and consider implementing retry logic'
  },
  {
    id: '3',
    type: 'prediction',
    severity: 'info',
    title: 'Expected Traffic Increase',
    description: 'Workflow executions predicted to increase by 35% next week',
    metric: 'Execution Volume',
    confidence: 76,
    impact: 'medium',
    timestamp: '1 hour ago',
    actionable: true,
    suggestedAction: 'Consider scaling infrastructure to handle increased load'
  },
  {
    id: '4',
    type: 'recommendation',
    severity: 'info',
    title: 'Cost Optimization Opportunity',
    description: 'Unused integrations detected that could be optimized to reduce costs',
    metric: 'Resource Usage',
    confidence: 91,
    impact: 'low',
    timestamp: '3 hours ago',
    actionable: true,
    suggestedAction: 'Review and deactivate unused integrations to optimize costs'
  }
];

const sampleAnomalies: AnomalyDetection[] = [
  {
    metric: 'CPU Usage',
    current: 78,
    expected: 45,
    deviation: 73,
    severity: 'high',
    timestamp: '5 minutes ago',
    description: 'CPU usage significantly higher than normal patterns'
  },
  {
    metric: 'Error Rate',
    current: 3.2,
    expected: 1.1,
    deviation: 191,
    severity: 'medium',
    timestamp: '12 minutes ago',
    description: 'Error rate above acceptable threshold'
  }
];

const samplePredictions: PredictiveModel[] = [
  {
    metric: 'Monthly Executions',
    currentValue: 89247,
    predictedValue: 116521,
    confidence: 87,
    timeframe: 'Next 30 days',
    trend: 'up',
    factors: ['Increased user activity', 'New workflow deployments', 'Seasonal patterns']
  },
  {
    metric: 'Success Rate',
    currentValue: 94.2,
    predictedValue: 96.8,
    confidence: 78,
    timeframe: 'Next 7 days',
    trend: 'up',
    factors: ['Recent optimizations', 'Improved error handling', 'Better integration stability']
  }
];

export function TrendAnalysis() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [insights, setInsights] = useState<Insight[]>(sampleInsights);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>(sampleAnomalies);
  const [predictions, setPredictions] = useState<PredictiveModel[]>(samplePredictions);
  const [isLoading, setIsLoading] = useState(false);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'anomaly': return AlertTriangle;
      case 'prediction': return Brain;
      case 'recommendation': return Target;
      default: return Info;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'warning': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'success': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const refreshInsights = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI-Powered Analytics</h2>
          <p className="text-muted-foreground">
            Intelligent insights, trend analysis, and predictive recommendations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={refreshInsights} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="anomalies">Anomaly Detection</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-4">
            {insights.map((insight) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <Card key={insight.id} className={cn("border", getSeverityColor(insight.severity))}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          getSeverityColor(insight.severity)
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-base">{insight.title}</CardTitle>
                          <CardDescription>{insight.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                        <Badge 
                          variant={insight.impact === 'high' ? 'default' : 
                                 insight.impact === 'medium' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {insight.impact} impact
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {insight.metric}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {insight.timestamp}
                        </span>
                      </div>
                      {insight.actionable && (
                        <Button size="sm" variant="outline">
                          <Target className="h-3 w-3 mr-2" />
                          Take Action
                        </Button>
                      )}
                    </div>
                    {insight.suggestedAction && (
                      <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm font-medium mb-1">Suggested Action:</p>
                        <p className="text-sm text-muted-foreground">{insight.suggestedAction}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Trend Analysis Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>
                  Workflow execution patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <LineChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Trend visualization would be rendered here</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
                <CardDescription>
                  Key performance indicators and growth rates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sampleTrendData.slice(-3).map((data, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{data.period} Performance</p>
                      <p className="text-sm text-muted-foreground">
                        {data.value.toLocaleString()} executions
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {data.change > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-500" />
                      ) : data.change < 0 ? (
                        <ArrowDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <Minus className="h-4 w-4 text-gray-500" />
                      )}
                      <span className={cn(
                        "font-medium",
                        data.change > 0 ? "text-green-600" : 
                        data.change < 0 ? "text-red-600" : "text-gray-600"
                      )}>
                        {Math.abs(data.change)}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Anomaly Detection Tab */}
        <TabsContent value="anomalies" className="space-y-6">
          <div className="grid gap-4">
            {anomalies.map((anomaly, index) => (
              <Card key={index} className="border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-950/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          Anomaly Detected: {anomaly.metric}
                        </CardTitle>
                        <CardDescription>{anomaly.description}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={anomaly.severity === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {anomaly.severity} severity
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-card">
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="text-lg font-bold">{anomaly.current}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-card">
                      <p className="text-sm text-muted-foreground">Expected</p>
                      <p className="text-lg font-bold">{anomaly.expected}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-card">
                      <p className="text-sm text-muted-foreground">Deviation</p>
                      <p className="text-lg font-bold text-yellow-600">+{anomaly.deviation}%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Detected {anomaly.timestamp}
                    </span>
                    <Button size="sm">
                      <Eye className="h-3 w-3 mr-2" />
                      Investigate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid gap-6">
            {predictions.map((prediction, index) => (
              <Card key={index} className="border-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                        <Brain className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {prediction.metric} Prediction
                        </CardTitle>
                        <CardDescription>
                          {prediction.timeframe} forecast
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-xs">
                      {prediction.confidence}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-lg bg-card">
                      <p className="text-sm text-muted-foreground mb-1">Current Value</p>
                      <p className="text-2xl font-bold">
                        {prediction.currentValue.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-card">
                      <p className="text-sm text-muted-foreground mb-1">Predicted Value</p>
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-2xl font-bold">
                          {prediction.predictedValue.toLocaleString()}
                        </p>
                        {prediction.trend === 'up' && (
                          <ArrowUp className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Contributing Factors:</p>
                    <div className="space-y-1">
                      {prediction.factors.map((factor, factorIndex) => (
                        <div key={factorIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}