'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Gauge
} from 'lucide-react';

interface ExecutionData {
  timestamp: string;
  executions: number;
  success_rate: number;
  response_time: number;
  errors: number;
}

interface WorkflowCategory {
  name: string;
  value: number;
  color: string;
}

export function RealTimeCharts() {
  const [executionData, setExecutionData] = useState<ExecutionData[]>([]);
  const [categories, setCategories] = useState<WorkflowCategory[]>([]);
  const [liveMetrics, setLiveMetrics] = useState({
    currentExecutions: 0,
    avgResponseTime: 0,
    successRate: 0,
    errorRate: 0
  });
  const [isLive, setIsLive] = useState(true);

  // Generate initial data
  useEffect(() => {
    const now = Date.now();
    const initialData: ExecutionData[] = [];
    
    for (let i = 23; i >= 0; i--) {
      const timestamp = new Date(now - i * 60 * 60 * 1000);
      initialData.push({
        timestamp: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        executions: Math.floor(Math.random() * 1000) + 500,
        success_rate: Math.random() * 10 + 90,
        response_time: Math.random() * 200 + 100,
        errors: Math.floor(Math.random() * 50) + 5
      });
    }
    
    setExecutionData(initialData);
    
    const categoryData: WorkflowCategory[] = [
      { name: 'Marketing', value: 35, color: '#8884d8' },
      { name: 'Sales', value: 25, color: '#82ca9d' },
      { name: 'Support', value: 20, color: '#ffc658' },
      { name: 'Data Processing', value: 15, color: '#ff7300' },
      { name: 'Other', value: 5, color: '#a4de6c' }
    ];
    
    setCategories(categoryData);
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const newPoint: ExecutionData = {
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        executions: Math.floor(Math.random() * 1000) + 500,
        success_rate: Math.random() * 10 + 90,
        response_time: Math.random() * 200 + 100,
        errors: Math.floor(Math.random() * 50) + 5
      };

      setExecutionData(prev => {
        const updated = [...prev.slice(1), newPoint];
        return updated;
      });

      // Update live metrics
      setLiveMetrics({
        currentExecutions: newPoint.executions,
        avgResponseTime: newPoint.response_time,
        successRate: newPoint.success_rate,
        errorRate: (newPoint.errors / newPoint.executions) * 100
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const MetricCard = ({ 
    title, 
    value, 
    unit = '', 
    trend, 
    icon: Icon, 
    color = 'text-foreground' 
  }: {
    title: string;
    value: number;
    unit?: string;
    trend?: 'up' | 'down';
    icon: React.ElementType;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className={`text-2xl font-bold ${color}`}>
                {typeof value === 'number' ? value.toFixed(unit === '%' ? 1 : 0) : value}{unit}
              </p>
              {trend && (
                <div className={`flex items-center text-xs ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                </div>
              )}
            </div>
          </div>
          <div className={`p-2 rounded-lg bg-opacity-10 ${
            color.includes('green') ? 'bg-green-500' :
            color.includes('red') ? 'bg-red-500' :
            color.includes('blue') ? 'bg-blue-500' :
            'bg-gray-500'
          }`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Live Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge 
            variant={isLive ? "default" : "secondary"}
            className={`${isLive ? 'bg-green-500' : 'bg-gray-500'} text-white`}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${isLive ? 'bg-white animate-pulse' : 'bg-gray-300'}`} />
            {isLive ? 'Live Data' : 'Paused'}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Updates every 30 seconds
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsLive(!isLive)}
        >
          {isLive ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Pause Updates
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Resume Live Updates
            </>
          )}
        </Button>
      </div>

      {/* Real-Time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Current Executions"
          value={liveMetrics.currentExecutions}
          icon={Activity}
          color="text-blue-600"
          trend="up"
        />
        <MetricCard
          title="Avg Response Time"
          value={liveMetrics.avgResponseTime}
          unit="ms"
          icon={Gauge}
          color="text-green-600"
          trend="down"
        />
        <MetricCard
          title="Success Rate"
          value={liveMetrics.successRate}
          unit="%"
          icon={CheckCircle}
          color="text-green-600"
          trend="up"
        />
        <MetricCard
          title="Error Rate"
          value={liveMetrics.errorRate}
          unit="%"
          icon={AlertTriangle}
          color="text-red-600"
          trend="down"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-Time Execution Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={executionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="executions" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                  name="Executions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Success Rate & Response Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={executionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="success_rate" 
                  stroke="#82ca9d" 
                  name="Success Rate (%)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="response_time" 
                  stroke="#ffc658" 
                  name="Response Time (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Error Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={executionData.slice(-12)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="errors" fill="#ff7300" name="Errors" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workflow Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Workflow Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Live Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {executionData.slice(-5).reverse().map((data, index) => (
              <div key={index} className="flex items-center justify-between text-sm p-2 hover:bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>{data.timestamp}</span>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>{data.executions} executions</span>
                  <span>{data.success_rate.toFixed(1)}% success</span>
                  <span>{data.response_time.toFixed(0)}ms avg</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}