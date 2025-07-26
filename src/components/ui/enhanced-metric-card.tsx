'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ChevronRight,
  Eye,
  MoreHorizontal,
  Sparkles,
  Activity,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SparklinePoint {
  value: number;
  timestamp: string;
}

interface EnhancedMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  trend?: {
    value: number;
    label: string;
    direction?: 'up' | 'down' | 'stable';
  };
  subtitle?: string;
  sparklineData?: SparklinePoint[];
  onClick?: () => void;
  className?: string;
  showProgress?: boolean;
  progressValue?: number;
  status?: 'healthy' | 'warning' | 'critical' | 'info';
  children?: React.ReactNode;
}

export function EnhancedMetricCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  subtitle,
  sparklineData = [],
  onClick,
  className,
  showProgress,
  progressValue,
  status = 'healthy',
  children
}: EnhancedMetricCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'border-green-500/20 bg-green-50/50 dark:bg-green-950/20';
      case 'warning': return 'border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-950/20';
      case 'critical': return 'border-red-500/20 bg-red-50/50 dark:bg-red-950/20';
      case 'info': return 'border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20';
      default: return 'border-border/50';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    const direction = trend.direction || (trend.value > 0 ? 'up' : trend.value < 0 ? 'down' : 'stable');
    
    switch (direction) {
      case 'up':
        return <ArrowUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';
    
    const direction = trend.direction || (trend.value > 0 ? 'up' : trend.value < 0 ? 'down' : 'stable');
    
    switch (direction) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const generateSparkline = () => {
    if (sparklineData.length === 0) return null;

    const maxValue = Math.max(...sparklineData.map(p => p.value));
    const minValue = Math.min(...sparklineData.map(p => p.value));
    const range = maxValue - minValue || 1;

    const points = sparklineData.map((point, index) => {
      const x = (index / (sparklineData.length - 1)) * 100;
      const y = 100 - ((point.value - minValue) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="h-8 w-20 flex items-center">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            points={points}
            className={color.replace('text-', 'text-')}
          />
        </svg>
      </div>
    );
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        getStatusColor(status),
        onClick && "cursor-pointer hover:shadow-xl",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Animated Background Gradient */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 transition-opacity duration-500",
        isHovered && "opacity-10",
        color.includes('blue') && "bg-gradient-to-br from-blue-500/30 to-cyan-500/30",
        color.includes('green') && "bg-gradient-to-br from-green-500/30 to-emerald-500/30",
        color.includes('purple') && "bg-gradient-to-br from-purple-500/30 to-pink-500/30",
        color.includes('orange') && "bg-gradient-to-br from-orange-500/30 to-yellow-500/30",
        color.includes('red') && "bg-gradient-to-br from-red-500/30 to-pink-500/30",
        !color.includes('blue') && !color.includes('green') && !color.includes('purple') && 
        !color.includes('orange') && !color.includes('red') && "bg-gradient-to-br from-gray-500/30 to-slate-500/30"
      )} style={{ transform: 'translate(50%, -50%)' }} />

      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110",
              color.includes('blue') && "bg-gradient-to-r from-blue-500 to-cyan-500",
              color.includes('green') && "bg-gradient-to-r from-green-500 to-emerald-500",
              color.includes('purple') && "bg-gradient-to-r from-purple-500 to-pink-500",
              color.includes('orange') && "bg-gradient-to-r from-orange-500 to-yellow-500",
              color.includes('red') && "bg-gradient-to-r from-red-500 to-pink-500",
              !color.includes('blue') && !color.includes('green') && !color.includes('purple') && 
              !color.includes('orange') && !color.includes('red') && "bg-gradient-to-r from-gray-500 to-slate-500"
            )}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </CardTitle>
              {subtitle && (
                <CardDescription className="text-xs">
                  {subtitle}
                </CardDescription>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className={cn(
            "flex items-center gap-1 opacity-0 transition-opacity duration-200",
            isHovered && "opacity-100"
          )}>
            {sparklineData.length > 0 && generateSparkline()}
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
        <div className="flex items-end justify-between mb-3">
          <div className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {value}
          </div>
          
          {trend && (
            <div className={cn("flex items-center gap-1 text-sm font-medium", getTrendColor())}>
              {getTrendIcon()}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && progressValue !== undefined && (
          <div className="mb-3">
            <Progress value={progressValue} className="h-2" />
          </div>
        )}

        {/* Trend Label */}
        {trend && (
          <p className="text-xs text-muted-foreground mb-2">
            {trend.label}
          </p>
        )}

        {/* Status Indicator */}
        <div className="flex items-center justify-between">
          <Badge 
            variant={status === 'healthy' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}
            className="text-xs"
          >
            <Activity className="h-3 w-3 mr-1" />
            {status}
          </Badge>
          
          {onClick && (
            <ChevronRight className={cn(
              "h-4 w-4 text-muted-foreground transition-all duration-200",
              isHovered && "translate-x-1 text-foreground"
            )} />
          )}
        </div>

        {/* Detailed View */}
        {showDetails && children && (
          <div className="mt-4 pt-4 border-t border-border/50">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}