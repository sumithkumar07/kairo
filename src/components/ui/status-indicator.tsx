'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertTriangle, XCircle, Clock, Zap } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'pending' | 'active';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  animated?: boolean;
}

export function StatusIndicator({ 
  status, 
  label, 
  size = 'md', 
  showIcon = true, 
  animated = false 
}: StatusIndicatorProps) {
  const configs = {
    success: {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
      dot: 'bg-green-500'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      dot: 'bg-yellow-500'
    },
    error: {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      dot: 'bg-red-500'
    },
    pending: {
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      dot: 'bg-blue-500'
    },
    active: {
      icon: Zap,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      dot: 'bg-primary'
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  const sizes = {
    sm: {
      container: 'px-2 py-1',
      icon: 'h-3 w-3',
      dot: 'w-2 h-2',
      text: 'text-xs'
    },
    md: {
      container: 'px-3 py-1.5',
      icon: 'h-4 w-4',
      dot: 'w-3 h-3',
      text: 'text-sm'
    },
    lg: {
      container: 'px-4 py-2',
      icon: 'h-5 w-5',
      dot: 'w-4 h-4',
      text: 'text-base'
    }
  };

  const sizeConfig = sizes[size];

  if (!label) {
    return (
      <div 
        className={cn(
          'rounded-full',
          sizeConfig.dot,
          config.dot,
          animated && status === 'active' && 'animate-pulse'
        )}
      />
    );
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-full border',
      sizeConfig.container,
      config.bg,
      config.border
    )}>
      {showIcon && (
        <Icon className={cn(
          sizeConfig.icon,
          config.color,
          animated && (status === 'pending' || status === 'active') && 'animate-pulse'
        )} />
      )}
      <span className={cn(
        'font-medium',
        sizeConfig.text,
        config.color
      )}>
        {label}
      </span>
    </div>
  );
}

export function HealthIndicator({ 
  health, 
  label = 'System Health',
  size = 'md' 
}: { 
  health: 'excellent' | 'good' | 'warning' | 'critical';
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const statusMap = {
    excellent: 'success' as const,
    good: 'active' as const,
    warning: 'warning' as const,
    critical: 'error' as const
  };

  return (
    <StatusIndicator 
      status={statusMap[health]} 
      label={label}
      size={size}
      animated={health === 'critical'}
    />
  );
}