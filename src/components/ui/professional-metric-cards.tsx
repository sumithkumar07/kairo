'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatusIndicator, TrendIndicator } from '@/components/ui/enhanced-status-indicators';
import { 
  ChevronRight,
  Eye,
  MoreHorizontal,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  Target,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardData {
  id: string;
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'healthy' | 'warning' | 'critical';
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  target?: number;
  unit?: string;
  category?: string;
  sparklineData?: Array<{ value: number; timestamp: string }>;
  isClickable?: boolean;
  onClick?: () => void;
}

interface ProfessionalMetricCardProps {
  data: MetricCardData;
  className?: string;
  showSparkline?: boolean;
  showComparison?: boolean;
}

export function ProfessionalMetricCard({
  data,
  className,
  showSparkline = true,
  showComparison = true
}: ProfessionalMetricCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formatValue = (value: string | number, unit?: string) => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M${unit || ''}`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K${unit || ''}`;
      }
      return `${value}${unit || ''}`;
    }
    return `${value}${unit || ''}`;
  };

  const generateSparkline = () => {
    if (!data.sparklineData || data.sparklineData.length === 0) return null;

    const points = data.sparklineData.map((point, index) => {
      const x = (index / (data.sparklineData!.length - 1)) * 100;
      const y = 50 + (Math.sin(index * 0.5) * 20); // Simple wave for demo
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="h-8 w-20 opacity-60 group-hover:opacity-100 transition-opacity">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            points={points}
            className={data.color}
          />
        </svg>
      </div>
    );
  };

  const Icon = data.icon;

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        data.status === 'warning' && "border-yellow-500/20 bg-yellow-50/30 dark:bg-yellow-950/10",
        data.status === 'critical' && "border-red-500/20 bg-red-50/30 dark:bg-red-950/10",
        data.isClickable && "cursor-pointer hover:shadow-xl",
        "border-border/50 bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={data.onClick}
    >
      {/* Animated Background Gradient */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 transition-opacity duration-500",
        isHovered && "opacity-10",
        data.color.includes('blue') && "bg-gradient-to-br from-blue-500/30 to-cyan-500/30",
        data.color.includes('green') && "bg-gradient-to-br from-green-500/30 to-emerald-500/30",
        data.color.includes('purple') && "bg-gradient-to-br from-purple-500/30 to-pink-500/30",
        data.color.includes('orange') && "bg-gradient-to-br from-orange-500/30 to-yellow-500/30"
      )} style={{ transform: 'translate(50%, -50%)' }} />

      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-xl transition-all duration-300 group-hover:scale-110 shadow-sm",
              data.color.includes('blue') && "bg-gradient-to-r from-blue-500 to-cyan-500",
              data.color.includes('green') && "bg-gradient-to-r from-green-500 to-emerald-500",
              data.color.includes('purple') && "bg-gradient-to-r from-purple-500 to-pink-500",
              data.color.includes('orange') && "bg-gradient-to-r from-orange-500 to-yellow-500",
              data.color.includes('red') && "bg-gradient-to-r from-red-500 to-pink-500"
            )}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground mb-1">
                {data.title}
              </CardTitle>
              {data.subtitle && (
                <CardDescription className="text-xs">
                  {data.subtitle}
                </CardDescription>
              )}
            </div>
          </div>
          
          {/* Hover Actions */}
          <div className={cn(
            "flex items-center gap-1 opacity-0 transition-opacity duration-200",
            isHovered && "opacity-100"
          )}>
            {showSparkline && generateSparkline()}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Main Value */}
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {formatValue(data.value, data.unit)}
            </div>
            
            {data.change !== undefined && (
              <TrendIndicator
                trend={data.trend || (data.change > 0 ? 'up' : data.change < 0 ? 'down' : 'stable')}
                value={data.change}
                label={data.changeLabel}
                size="sm"
              />
            )}
          </div>

          {/* Progress to Target */}
          {data.target && typeof data.value === 'number' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress to target</span>
                <span className="font-medium">{Math.round((data.value / data.target) * 100)}%</span>
              </div>
              <Progress value={(data.value / data.target) * 100} className="h-2" />
            </div>
          )}

          {/* Comparison with Previous */}
          {showComparison && data.previousValue && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Previous: {formatValue(data.previousValue, data.unit)}</span>
              {data.change && (
                <span className={cn(
                  "flex items-center gap-1 font-medium",
                  data.change > 0 ? "text-green-600" : data.change < 0 ? "text-red-600" : "text-gray-600"
                )}>
                  {data.change > 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : data.change < 0 ? (
                    <ArrowDownRight className="h-3 w-3" />
                  ) : null}
                  {Math.abs(data.change)}%
                </span>
              )}
            </div>
          )}

          {/* Status and Category */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {data.status && (
                <StatusIndicator
                  status={data.status}
                  size="sm"
                  showIcon={false}
                />
              )}
              {data.category && (
                <Badge variant="outline" className="text-xs">
                  {data.category}
                </Badge>
              )}
            </div>
            
            {data.isClickable && (
              <ChevronRight className={cn(
                "h-4 w-4 text-muted-foreground transition-all duration-200",
                isHovered && "translate-x-1 text-foreground"
              )} />
            )}
          </div>

          {/* Detailed View */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <span className="ml-1 font-mono">{data.id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="ml-1">Just now</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Pre-built metric card configurations
export const METRIC_PRESETS = {
  totalWorkflows: {
    id: 'total-workflows',
    title: 'Total Workflows',
    icon: Activity,
    color: 'text-blue-500',
    category: 'Workflows',
    unit: ''
  },
  executions: {
    id: 'executions',
    title: 'Total Executions',
    icon: Zap,
    color: 'text-green-500',
    category: 'Activity',
    unit: ''
  },
  successRate: {
    id: 'success-rate',
    title: 'Success Rate',
    icon: Target,
    color: 'text-purple-500',
    category: 'Performance',
    unit: '%'
  },
  avgExecutionTime: {
    id: 'avg-execution-time',
    title: 'Avg Execution Time',
    icon: Clock,
    color: 'text-orange-500',
    category: 'Performance',
    unit: 's'
  },
  teamMembers: {
    id: 'team-members',
    title: 'Team Members',
    icon: Users,
    color: 'text-teal-500',
    category: 'Team',
    unit: ''
  },
  monthlyCosts: {
    id: 'monthly-costs',
    title: 'Monthly Costs',
    icon: DollarSign,
    color: 'text-yellow-500',
    category: 'Finance',
    unit: ''
  }
};

// Dashboard metrics grid component
export function MetricsGrid({
  metrics,
  columns = 4,
  className
}: {
  metrics: MetricCardData[];
  columns?: number;
  className?: string;
}) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={cn('grid gap-6', gridClass, className)}>
      {metrics.map((metric) => (
        <ProfessionalMetricCard key={metric.id} data={metric} />
      ))}
    </div>
  );
}