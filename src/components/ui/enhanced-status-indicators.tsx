'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
  Wifi,
  WifiOff,
  Zap,
  Shield,
  AlertCircle,
  Info,
  Pause,
  Play,
  Square
} from 'lucide-react';

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'pending' | 'active' | 'inactive' | 'critical' | 'healthy' | 'running' | 'paused' | 'stopped';
  label?: string;
  showIcon?: boolean;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface HealthIndicatorProps {
  health: 'excellent' | 'good' | 'warning' | 'critical';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  value: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusIndicator({
  status,
  label,
  showIcon = true,
  animated = false,
  size = 'md',
  className
}: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
      case 'healthy':
        return {
          icon: CheckCircle,
          color: 'text-green-500 bg-green-500/10 border-green-500/20',
          pulse: 'animate-pulse'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
          pulse: 'animate-pulse'
        };
      case 'error':
      case 'critical':
        return {
          icon: XCircle,
          color: 'text-red-500 bg-red-500/10 border-red-500/20',
          pulse: 'animate-bounce'
        };
      case 'info':
        return {
          icon: Info,
          color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
          pulse: 'animate-pulse'
        };
      case 'pending':
        return {
          icon: Clock,
          color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
          pulse: 'animate-spin'
        };
      case 'active':
      case 'running':
        return {
          icon: Play,
          color: 'text-green-500 bg-green-500/10 border-green-500/20',
          pulse: 'animate-pulse'
        };
      case 'paused':
        return {
          icon: Pause,
          color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
          pulse: ''
        };
      case 'stopped':
      case 'inactive':
        return {
          icon: Square,
          color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
          pulse: ''
        };
      default:
        return {
          icon: Activity,
          color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
          pulse: ''
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          icon: 'h-3 w-3',
          container: 'px-2 py-1 text-xs',
          dot: 'w-2 h-2'
        };
      case 'lg':
        return {
          icon: 'h-5 w-5',
          container: 'px-3 py-2 text-sm',
          dot: 'w-4 h-4'
        };
      default:
        return {
          icon: 'h-4 w-4',
          container: 'px-2.5 py-1.5 text-xs',
          dot: 'w-3 h-3'
        };
    }
  };

  const config = getStatusConfig();
  const sizeConfig = getSizeConfig();
  const Icon = config.icon;

  if (!label && !showIcon) {
    // Simple dot indicator
    return (
      <div className={cn(
        'rounded-full',
        config.color,
        sizeConfig.dot,
        animated && config.pulse,
        className
      )} />
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        config.color,
        sizeConfig.container,
        'flex items-center gap-1.5 border',
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(
          sizeConfig.icon,
          animated && config.pulse
        )} />
      )}
      {label && <span className="capitalize">{label}</span>}
    </Badge>
  );
}

export function HealthIndicator({
  health,
  size = 'md',
  showLabel = true,
  className
}: HealthIndicatorProps) {
  const getHealthConfig = () => {
    switch (health) {
      case 'excellent':
        return {
          color: 'text-green-500 bg-green-500/10 border-green-500/20',
          label: 'Excellent',
          icon: Shield
        };
      case 'good':
        return {
          color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
          label: 'Good',
          icon: CheckCircle
        };
      case 'warning':
        return {
          color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
          label: 'Warning',
          icon: AlertTriangle
        };
      case 'critical':
        return {
          color: 'text-red-500 bg-red-500/10 border-red-500/20',
          label: 'Critical',
          icon: AlertCircle
        };
      default:
        return {
          color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
          label: 'Unknown',
          icon: Activity
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return { icon: 'h-3 w-3', container: 'px-2 py-1 text-xs' };
      case 'lg':
        return { icon: 'h-5 w-5', container: 'px-3 py-2 text-sm' };
      default:
        return { icon: 'h-4 w-4', container: 'px-2.5 py-1.5 text-xs' };
    }
  };

  const config = getHealthConfig();
  const sizeConfig = getSizeConfig();
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        config.color,
        sizeConfig.container,
        'flex items-center gap-1.5 border',
        className
      )}
    >
      <Icon className={cn(sizeConfig.icon, 'animate-pulse')} />
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
}

export function TrendIndicator({
  trend,
  value,
  label,
  size = 'md',
  className
}: TrendIndicatorProps) {
  const getTrendConfig = () => {
    switch (trend) {
      case 'up':
        return {
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-500/10',
          arrow: '↗'
        };
      case 'down':
        return {
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-500/10',
          arrow: '↘'
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-500/10',
          arrow: '→'
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return { text: 'text-xs', container: 'px-2 py-1' };
      case 'lg':
        return { text: 'text-sm', container: 'px-3 py-2' };
      default:
        return { text: 'text-xs', container: 'px-2.5 py-1.5' };
    }
  };

  const config = getTrendConfig();
  const sizeConfig = getSizeConfig();

  return (
    <div className={cn(
      'inline-flex items-center gap-1 rounded-full border',
      config.color,
      config.bgColor,
      sizeConfig.container,
      sizeConfig.text,
      'font-medium',
      className
    )}>
      <span>{config.arrow}</span>
      <span>{Math.abs(value)}%</span>
      {label && <span className="text-muted-foreground">{label}</span>}
    </div>
  );
}

export function ConnectionStatus({
  isConnected,
  label,
  showIcon = true,
  className
}: {
  isConnected: boolean;
  label?: string;
  showIcon?: boolean;
  className?: string;
}) {
  const Icon = isConnected ? Wifi : WifiOff;
  const color = isConnected ? 'text-green-500' : 'text-red-500';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcon && <Icon className={cn('h-4 w-4', color)} />}
      {label && (
        <span className={cn('text-sm', color)}>
          {label}
        </span>
      )}
    </div>
  );
}