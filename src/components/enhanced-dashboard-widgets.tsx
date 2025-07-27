'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Target,
  Rocket,
  Brain,
  Shield,
  RefreshCw,
  Plus,
  Settings,
  Maximize2,
  Minimize2,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Filter,
  Calendar,
  Download,
  Share,
  Bookmark,
  Play,
  Pause,
  SkipForward,
  Rewind,
  Volume2,
  Wifi,
  WifiOff,
  Database,
  Server,
  Monitor,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  AlertTriangle,
  Info,
  HelpCircle,
  Lightbulb,
  Flame,
  Gauge,
  PieChart,
  LineChart,
  DollarSign,
  Percent,
  Calculator,
  FileText,
  Mail,
  MessageSquare,
  Workflow
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Mock real-time data
const generateTimeSeriesData = (days = 7) => {
  return Array.from({ length: days * 24 }, (_, i) => ({
    time: new Date(Date.now() - (days * 24 - i) * 60 * 60 * 1000).toISOString(),
    executions: Math.floor(Math.random() * 100) + 50,
    success: Math.floor(Math.random() * 95) + 90,
    errors: Math.floor(Math.random() * 10),
    responseTime: Math.floor(Math.random() * 200) + 100
  }));
};

const performanceData = generateTimeSeriesData();

const systemMetrics = [
  { name: 'CPU Usage', value: 68, max: 100, color: 'text-blue-600', trend: '+2.1%' },
  { name: 'Memory', value: 45, max: 100, color: 'text-green-600', trend: '-1.5%' },
  { name: 'Disk I/O', value: 23, max: 100, color: 'text-purple-600', trend: '+0.8%' },
  { name: 'Network', value: 89, max: 100, color: 'text-orange-600', trend: '+5.2%' }
];

const workflowMetrics = [
  { category: 'Marketing', count: 23, success: 98.5, color: '#3b82f6' },
  { category: 'Sales', count: 18, success: 96.8, color: '#10b981' },
  { category: 'Support', count: 15, success: 94.2, color: '#f59e0b' },
  { category: 'E-commerce', count: 12, success: 97.1, color: '#ef4444' }
];

const aiInsights = [
  {
    id: 1,
    type: 'optimization',
    title: 'Performance Boost Available',
    description: 'Adding parallel processing could reduce execution time by 35%',
    impact: 'High',
    urgency: 'Medium',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    estimated_savings: '$247/month'
  },
  {
    id: 2,
    type: 'security',
    title: 'Security Enhancement',
    description: 'Enable 2FA for 3 high-risk integrations',
    impact: 'High',
    urgency: 'High',
    icon: Shield,
    color: 'from-red-500 to-pink-500',
    estimated_savings: null
  },
  {
    id: 3,
    type: 'cost',
    title: 'Cost Optimization',
    description: 'Migrate 2 workflows to lower-cost execution tier',
    impact: 'Medium',
    urgency: 'Low',
    icon: DollarSign,
    color: 'from-green-500 to-emerald-500',
    estimated_savings: '$89/month'
  }
];

// Real-time metric component
const RealTimeMetric = ({ 
  title, 
  value, 
  unit, 
  trend, 
  trendDirection, 
  icon: Icon, 
  color = "text-primary" 
}: {
  title: string;
  value: string | number;
  unit?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'stable';
  icon: any;
  color?: string;
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  
  useEffect(() => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    const timer = setTimeout(() => setAnimatedValue(numValue), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up': return ArrowUpRight;
      case 'down': return ArrowDownRight;
      default: return Activity;
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Icon className={`h-8 w-8 ${color}`} />
          <div className="flex items-center gap-2">
            {trend && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                trendDirection === 'up' ? 'text-green-600' : 
                trendDirection === 'down' ? 'text-red-600' : 
                'text-muted-foreground'
              }`}>
                <TrendIcon className="h-3 w-3" />
                {trend}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-bold">
            {animatedValue.toLocaleString()}{unit}
          </div>
          <div className="text-sm text-muted-foreground">{title}</div>
        </div>
      </CardContent>
    </Card>
  );
};

// Interactive chart widget
const InteractiveChartWidget = ({ title, data, type = 'line' }: {
  title: string;
  data: any[];
  type?: 'line' | 'area' | 'bar';
}) => {
  const [chartType, setChartType] = useState(type);
  const [timeRange, setTimeRange] = useState('24h');

  const renderChart = () => {
    const commonProps = {
      data: data.slice(-24),
      height: 200
    };

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={commonProps.data}>
              <defs>
                <linearGradient id="colorExecutions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(value) => new Date(value).getHours() + ':00'} 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => new Date(value as string).toLocaleTimeString()}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="executions" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorExecutions)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={commonProps.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(value) => new Date(value).getHours() + ':00'} 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => new Date(value as string).toLocaleTimeString()}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="executions" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={commonProps.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(value) => new Date(value).getHours() + ':00'} 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => new Date(value as string).toLocaleTimeString()}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="executions" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <Button variant="ghost" size="sm" onClick={() => setChartType('line')}>
            <LineChart className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setChartType('area')}>
            <BarChart3 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setChartType('bar')}>
            <BarChart className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

// System status widget
const SystemStatusWidget = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {systemMetrics.map((metric) => (
          <div key={metric.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{metric.name}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${metric.color}`}>
                  {metric.value}%
                </span>
                <Badge variant="secondary" className="text-xs">
                  {metric.trend}
                </Badge>
              </div>
            </div>
            <Progress value={metric.value} className="h-2" />
          </div>
        ))}
        
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last updated</span>
            <span className="font-medium">2 minutes ago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// AI insights widget
const AIInsightsWidget = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {aiInsights.map((insight) => (
          <div key={insight.id} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${insight.color} flex-shrink-0`}>
                <insight.icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <Badge variant={insight.urgency === 'High' ? 'destructive' : insight.urgency === 'Medium' ? 'default' : 'secondary'} className="text-xs">
                    {insight.urgency}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {insight.description}
                </p>
                {insight.estimated_savings && (
                  <div className="text-xs font-medium text-green-600">
                    Est. savings: {insight.estimated_savings}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Workflow performance widget
const WorkflowPerformanceWidget = () => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <PieChart className="h-4 w-4" />
          Workflow Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={workflowMetrics}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                label={({category, count}) => `${category}: ${count}`}
              >
                {workflowMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-2">
          {workflowMetrics.map((metric, index) => (
            <div key={metric.category} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span>{metric.category}</span>
              </div>
              <div className="text-right">
                <div className="font-medium">{metric.count} workflows</div>
                <div className="text-xs text-muted-foreground">{metric.success}% success</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main dashboard widgets component
export const EnhancedDashboardWidgets = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Real-time Analytics</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Customize
          </Button>
        </div>
      </div>

      {/* Real-time metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RealTimeMetric
          title="Active Workflows"
          value={47}
          trend="+12%"
          trendDirection="up"
          icon={Workflow}
          color="text-blue-600"
        />
        <RealTimeMetric
          title="Executions Today"
          value="2,347"
          trend="+8.2%"
          trendDirection="up"
          icon={Play}
          color="text-green-600"
        />
        <RealTimeMetric
          title="Success Rate"
          value="99.1"
          unit="%"
          trend="+0.3%"
          trendDirection="up"
          icon={CheckCircle}
          color="text-emerald-600"
        />
        <RealTimeMetric
          title="Avg Response"
          value="234"
          unit="ms"
          trend="-15ms"
          trendDirection="down"
          icon={Zap}
          color="text-orange-600"
        />
      </div>

      {/* Interactive charts and widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InteractiveChartWidget
          title="Workflow Executions"
          data={performanceData}
          type="area"
        />
        <SystemStatusWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIInsightsWidget />
        <WorkflowPerformanceWidget />
      </div>
    </div>
  );
};