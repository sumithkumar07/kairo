'use client';

import React from 'react';
import { Loader2, Zap, Activity, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedLoadingProps {
  variant?: 'default' | 'spinner' | 'dots' | 'pulse' | 'brain' | 'skeleton';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
}

const loadingVariants = {
  default: Loader2,
  spinner: Loader2,
  dots: Activity,
  pulse: Zap,
  brain: Brain,
};

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

export function EnhancedLoading({ 
  variant = 'default', 
  size = 'md', 
  text,
  className 
}: EnhancedLoadingProps) {
  const LoadingIcon = loadingVariants[variant];

  if (variant === 'skeleton') {
    return (
      <div className={cn('animate-pulse space-y-4', className)}>
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center justify-center space-x-1', className)}>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
        {text && <span className="ml-3 text-sm text-muted-foreground">{text}</span>}
      </div>
    );
  }

  const animationClass = variant === 'pulse' ? 'animate-pulse-subtle' : 
                        variant === 'brain' ? 'animate-pulse text-purple-500' : 
                        'animate-spin';

  return (
    <div className={cn('flex items-center justify-center space-x-3', className)}>
      <LoadingIcon className={cn(sizeClasses[size], animationClass, 'text-primary')} />
      {text && (
        <span className="text-sm text-muted-foreground animate-fade-in-up">
          {text}
        </span>
      )}
    </div>
  );
}

// Skeleton components for different layouts
export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-8 p-8">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-4 bg-muted rounded w-2/3"></div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
              <div className="h-3 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-8">
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-muted rounded"></div>
              <div className="space-y-1">
                <div className="h-6 bg-muted rounded w-16"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="border rounded-lg p-6">
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}