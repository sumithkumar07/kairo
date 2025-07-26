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
  Brain,
  Zap,
  AlertTriangle,
  Target,
  Activity,
  Clock,
  Users,
  Workflow,
  Globe,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Star,
  ArrowRight,
  Eye,
  CheckCircle,
  XCircle,
  Lightbulb,
  Cpu,
  Database,
  Shield,
  Flame,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Prediction {
  id: string;
  title: string;
  category: 'usage' | 'performance' | 'growth' | 'risk' | 'opportunity';
  prediction: string;
  confidence: number;
  timeframe: string;
  probability: number;
  impact: 'high' | 'medium' | 'low';
  factors: string[];
  recommendation: string;
  dataPoints: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  status: 'active' | 'monitoring' | 'resolved';
}

interface ForecastData {
  metric: string;
  current: number;
  predicted: number;
  timeframe: string;
  accuracy: number;
  confidence: number;
  factors: Array<{
    name: string;
    impact: number;
    weight: number;
  }>;
}

interface RiskAssessment {
  id: string;
  risk: string;
  probability: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  mitigation: string;
  timeToImpact: string;
  relatedSystems: string[];
}

const mockPredictions: Prediction[] = [
  {
    id: 'pred-1',
    title: 'Workflow Usage Surge',
    category: 'usage',
    prediction: 'Lead nurturing workflow will experience 45% increase in usage',
    confidence: 87,
    timeframe: 'Next 2 weeks',
    probability: 85,
    impact: 'high',
    factors: ['Historical patterns', 'Marketing campaign launch', 'Team growth'],
    recommendation: 'Scale infrastructure and optimize workflow performance',
    dataPoints: 2341,
    trend: 'increasing',
    status: 'active'
  },
  {
    id: 'pred-2',
    title: 'Integration Performance Decline',
    category: 'performance',
    prediction: 'Salesforce integration may show latency issues during peak hours',
    confidence: 73,
    timeframe: 'Next 5 days',
    probability: 68,
    impact: 'medium',
    factors: ['API rate limits', 'Increased data volume', 'Network congestion'],
    recommendation: 'Implement request queuing and optimize batch processing',
    dataPoints: 1567,
    trend: 'decreasing',
    status: 'monitoring'
  },
  {
    id: 'pred-3',
    title: 'Team Adoption Growth',
    category: 'growth',
    prediction: 'Team adoption of automation features will grow by 60%',
    confidence: 91,
    timeframe: 'Next month',
    probability: 88,
    impact: 'high',
    factors: ['Training completion rates', 'Success stories', 'Feature improvements'],
    recommendation: 'Prepare advanced training materials and support resources',
    dataPoints: 892,
    trend: 'increasing',
    status: 'active'
  },
  {
    id: 'pred-4',
    title: 'Security Risk Alert',
    category: 'risk',
    prediction: 'Potential security concern with increased API key usage',
    confidence: 82,
    timeframe: 'Next 10 days',
    probability: 65,
    impact: 'high',
    factors: ['Key rotation schedule', 'Access patterns', 'Usage anomalies'],
    recommendation: 'Review API key security and implement automated rotation',
    dataPoints: 634,
    trend: 'stable',
    status: 'monitoring'
  }
];

const mockForecasts: ForecastData[] = [
  {
    metric: 'Monthly Executions',
    current: 89247,
    predicted: 125650,
    timeframe: 'Next 30 days',
    accuracy: 89,
    confidence: 87,
    factors: [
      { name: 'Historical Growth', impact: 35, weight: 40 },
      { name: 'New Workflows', impact: 28, weight: 30 },
      { name: 'Team Expansion', impact: 22, weight: 20 },
      { name: 'Feature Adoption', impact: 15, weight: 10 }
    ]
  },
  {
    metric: 'System Load',
    current: 68,
    predicted: 84,
    timeframe: 'Next 15 days',
    accuracy: 93,
    confidence: 91,
    factors: [
      { name: 'Peak Hour Patterns', impact: 42, weight: 45 },
      { name: 'Concurrent Users', impact: 38, weight: 35 },
      { name: 'Workflow Complexity', impact: 20, weight: 20 }
    ]
  }
];

const mockRisks: RiskAssessment[] = [
  {
    id: 'risk-1',
    risk: 'Integration Rate Limiting',
    probability: 72,
    severity: 'medium',
    category: 'Performance',
    mitigation: 'Implement request batching and retry mechanisms',
    timeToImpact: '7-14 days',
    relatedSystems: ['Salesforce', 'Shopify', 'Google Sheets']
  },
  {
    id: 'risk-2',
    risk: 'Database Connection Pool Exhaustion',
    probability: 45,
    severity: 'high',
    category: 'Infrastructure',
    mitigation: 'Increase connection pool size and optimize queries',
    timeToImpact: '3-7 days',
    relatedSystems: ['Workflow Engine', 'Analytics', 'User Management']
  },
  {
    id: 'risk-3',
    risk: 'Security Key Exposure',
    probability: 28,
    severity: 'critical',
    category: 'Security',
    mitigation: 'Implement automated key rotation and monitoring',
    timeToImpact: '1-30 days',
    relatedSystems: ['All Integrations', 'API Gateway']
  }
];

export function PredictiveAnalytics() {
  const [predictions, setPredictions] = useState<Prediction[]>(mockPredictions);
  const [forecasts, setForecasts] = useState<ForecastData[]>(mockForecasts);
  const [risks, setRisks] = useState<RiskAssessment[]>(mockRisks);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');
  const [loading, setLoading] = useState(false);

  const categories = ['all', 'usage', 'performance', 'growth', 'risk', 'opportunity'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'usage': return Activity;
      case 'performance': return Zap;
      case 'growth': return TrendingUp;
      case 'risk': return AlertTriangle;
      case 'opportunity': return Target;
      default: return Brain;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'usage': return 'text-blue-600 bg-blue-100';
      case 'performance': return 'text-green-600 bg-green-100';
      case 'growth': return 'text-purple-600 bg-purple-100';
      case 'risk': return 'text-red-600 bg-red-100';
      case 'opportunity': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const filteredPredictions = selectedCategory === 'all' 
    ? predictions 
    : predictions.filter(p => p.category === selectedCategory);

  const refreshPredictions = () => {
    setLoading(true);
    // Simulate AI model computation
    setTimeout(() => {
      setPredictions(prev => [...prev].sort(() => Math.random() - 0.5));
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            Predictive Analytics Engine
          </h2>
          <p className="text-muted-foreground">
            AI-powered predictions and forecasts for proactive decision making
          </p>
        </div>
        
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.slice(1).map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={refreshPredictions} disabled={loading}>
            {loading ? (
              <Cpu className="h-4 w-4 animate-pulse" />
            ) : (
              <Brain className="h-4 w-4" />
            )}
            {loading ? 'Computing...' : 'Refresh AI'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="predictions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Smart Predictions
          </TabsTrigger>
          <TabsTrigger value="forecasts" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Growth Forecasts
          </TabsTrigger>
          <TabsTrigger value="risks" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Risk Assessment
          </TabsTrigger>
          <TabsTrigger value="model-insights" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Model Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid gap-4">
            {filteredPredictions.map((prediction) => {
              const CategoryIcon = getCategoryIcon(prediction.category);
              
              return (
                <Card key={prediction.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2 rounded-lg', getCategoryColor(prediction.category))}>
                              <CategoryIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{prediction.title}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {prediction.category.charAt(0).toUpperCase() + prediction.category.slice(1)}
                                </Badge>
                                <Badge className={cn('text-xs', 
                                  prediction.status === 'active' ? 'bg-green-100 text-green-700' :
                                  prediction.status === 'monitoring' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-gray-100 text-gray-700'
                                )}>
                                  {prediction.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {prediction.prediction}
                          </p>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <div className="flex items-center gap-2">
                            {getImpactIcon(prediction.impact)}
                            <span className="text-xs text-muted-foreground capitalize">
                              {prediction.impact} Impact
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(prediction.trend)}
                            <span className="text-xs text-muted-foreground capitalize">
                              {prediction.trend}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-foreground">Confidence</div>
                          <div className="flex items-center gap-2">
                            <Progress value={prediction.confidence} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground">{prediction.confidence}%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-foreground">Probability</div>
                          <div className="flex items-center gap-2">
                            <Progress value={prediction.probability} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground">{prediction.probability}%</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-foreground">Timeframe</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {prediction.timeframe}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-foreground mb-2">
                          <Lightbulb className="h-3 w-3" />
                          AI Recommendation
                        </div>
                        <p className="text-sm text-muted-foreground">{prediction.recommendation}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>Based on {prediction.dataPoints.toLocaleString()} data points</span>
                          <span>Key factors: {prediction.factors.slice(0, 2).join(', ')}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                          View Details <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {forecasts.map((forecast, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {forecast.metric}
                  </CardTitle>
                  <CardDescription>
                    Forecast for {forecast.timeframe} • {forecast.accuracy}% accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">
                        {forecast.current.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Current</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {forecast.predicted.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Predicted</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-foreground">Prediction Confidence</div>
                    <Progress value={forecast.confidence} className="h-3" />
                    <div className="text-xs text-muted-foreground">{forecast.confidence}% confident</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-xs font-medium text-foreground">Contributing Factors</div>
                    {forecast.factors.map((factor, factorIndex) => (
                      <div key={factorIndex} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{factor.name}</span>
                          <span className="text-muted-foreground">{factor.impact}% impact</span>
                        </div>
                        <Progress value={factor.weight} className="h-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <div className="grid gap-4">
            {risks.map((risk) => (
              <Card key={risk.id} className={cn('border-l-4', 
                risk.severity === 'critical' ? 'border-l-red-600' :
                risk.severity === 'high' ? 'border-l-red-500' :
                risk.severity === 'medium' ? 'border-l-yellow-500' :
                'border-l-green-500'
              )}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground">{risk.risk}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(risk.severity)}>
                            {risk.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {risk.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="text-2xl font-bold text-foreground">{risk.probability}%</div>
                        <div className="text-xs text-muted-foreground">Probability</div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-medium text-foreground mb-1">Mitigation Strategy</div>
                        <p className="text-sm text-muted-foreground">{risk.mitigation}</p>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-foreground mb-1">Time to Impact</div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {risk.timeToImpact}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs font-medium text-foreground mb-2">Related Systems</div>
                      <div className="flex flex-wrap gap-1">
                        {risk.relatedSystems.map((system, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="model-insights" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Model Performance
                </CardTitle>
                <CardDescription>
                  AI prediction model accuracy and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overall Accuracy</span>
                    <span className="text-sm font-medium">87.3%</span>
                  </div>
                  <Progress value={87.3} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Prediction Confidence</span>
                    <span className="text-sm font-medium">91.2%</span>
                  </div>
                  <Progress value={91.2} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Quality Score</span>
                    <span className="text-sm font-medium">94.7%</span>
                  </div>
                  <Progress value={94.7} className="h-2" />
                </div>
                
                <div className="pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    Model last updated: 2 hours ago • Training data: 125k samples
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Sources
                </CardTitle>
                <CardDescription>
                  Information sources feeding the predictive models
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Workflow Execution Data', weight: 35, status: 'active' },
                  { name: 'User Behavior Analytics', weight: 25, status: 'active' },
                  { name: 'System Performance Metrics', weight: 20, status: 'active' },
                  { name: 'Integration Health Data', weight: 12, status: 'active' },
                  { name: 'External Market Indicators', weight: 8, status: 'limited' }
                ].map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{source.name}</div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={source.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {source.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{source.weight}% weight</span>
                      </div>
                    </div>
                    {source.status === 'active' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}