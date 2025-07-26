'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  MoreHorizontal,
  RefreshCw,
  Maximize2,
  Filter,
  Calendar
} from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  change?: number;
  color?: string;
}

interface ChartContainerProps {
  title: string;
  description?: string;
  data: ChartData[];
  type?: 'bar' | 'line' | 'area' | 'pie' | 'metric';
  height?: number;
  className?: string;
  showTrend?: boolean;
  showActions?: boolean;
  loading?: boolean;
}

export function ChartContainer({
  title,
  description,
  data,
  type = 'bar',
  height = 300,
  className,
  showTrend = true,
  showActions = true,
  loading = false
}: ChartContainerProps) {
  // Calculate trend for the chart
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const averageChange = data.reduce((sum, item) => sum + (item.change || 0), 0) / data.length;

  const renderChart = () => {
    if (loading) {
      return (
        <div className={`h-[${height}px] bg-muted/20 rounded-lg animate-pulse flex items-center justify-center`}>
          <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
        </div>
      );
    }

    switch (type) {
      case 'metric':
        return (
          <div className="space-y-6">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="font-semibold text-lg">{item.name}</div>
                  <div className="text-3xl font-bold text-primary">{item.value.toLocaleString()}</div>
                </div>
                {item.change !== undefined && showTrend && (
                  <div className="flex items-center gap-2">
                    {item.change > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : item.change < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : null}
                    <span className={cn(
                      'text-sm font-medium',
                      item.change > 0 ? 'text-green-500' : item.change < 0 ? 'text-red-500' : 'text-muted-foreground'
                    )}>
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      
      case 'bar':
        const maxValue = Math.max(...data.map(item => item.value));
        return (
          <div className={`h-[${height}px] flex items-end justify-between gap-2 p-4`}>
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className={cn(
                    'w-full rounded-t-lg transition-all duration-500 hover:opacity-80',
                    item.color || 'bg-primary'
                  )}
                  style={{ 
                    height: `${(item.value / maxValue) * (height - 80)}px`,
                    minHeight: '4px'
                  }}
                />
                <div className="text-xs text-center">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-muted-foreground">{item.value.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className={`h-[${height}px] bg-muted/10 rounded-lg flex items-center justify-center`}>
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Chart visualization coming soon</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showTrend && averageChange !== 0 && (
            <Badge 
              variant="outline" 
              className={cn(
                'text-xs',
                averageChange > 0 ? 'text-green-600 border-green-200' : 'text-red-600 border-red-200'
              )}
            >
              {averageChange > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {averageChange > 0 ? '+' : ''}{averageChange.toFixed(1)}%
            </Badge>
          )}
          
          {showActions && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Download className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Maximize2 className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {renderChart()}
        
        {type !== 'metric' && showTrend && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Total: {totalValue.toLocaleString()}</span>
            {averageChange !== 0 && (
              <span className="flex items-center gap-1">
                {averageChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {averageChange > 0 ? '+' : ''}{averageChange.toFixed(1)}% vs last period
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
  };
  icon?: React.ElementType;
  color?: string;
  loading?: boolean;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon: Icon,
  color = 'text-primary',
  loading = false 
}: KPICardProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={cn("p-3 rounded-xl bg-muted/20 group-hover:bg-muted/40 transition-colors", color)}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
        
        {trend && (
          <div className="flex items-center gap-2 text-sm">
            {trend.value > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : trend.value < 0 ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <div className="h-4 w-4" />
            )}
            <span className={cn(
              'font-medium',
              trend.value > 0 ? 'text-green-500' : trend.value < 0 ? 'text-red-500' : 'text-muted-foreground'
            )}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}