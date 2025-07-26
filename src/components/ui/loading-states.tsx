'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';

// Enhanced loading spinner with different variants
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'spin';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  color = 'primary',
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full animate-pulse',
              sizeClasses[size],
              colorClasses[color],
              'bg-current'
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.4s'
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div
        className={cn(
          'rounded-full animate-pulse bg-current',
          sizeClasses[size],
          colorClasses[color],
          className
        )}
      />
    );
  }

  return (
    <Loader2
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

// Enhanced loading state component
export interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  success?: string | null;
  children: React.ReactNode;
  loadingText?: string;
  errorAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function LoadingState({
  isLoading,
  error,
  success,
  children,
  loadingText = 'Loading...',
  errorAction,
  className
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 space-y-4', className)}>
        <LoadingSpinner size="lg" />
        <p className="text-sm text-muted-foreground">{loadingText}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 space-y-4', className)}>
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <p className="text-sm font-medium text-red-600 mb-2">Error</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          {errorAction && (
            <button
              onClick={errorAction.onClick}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              {errorAction.label}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8 space-y-4', className)}>
        <CheckCircle className="w-12 h-12 text-green-500" />
        <p className="text-sm font-medium text-green-600">{success}</p>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

// Skeleton loading components
export function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-muted rounded',
        className
      )}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-3 p-4', className)}>
      <SkeletonLine className="h-4 w-3/4" />
      <SkeletonLine className="h-4 w-1/2" />
      <SkeletonLine className="h-4 w-5/6" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLine key={i} className="h-4" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLine key={colIndex} className="h-3" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Progress indicator component
export interface ProgressIndicatorProps {
  steps: Array<{
    title: string;
    description?: string;
    status: 'pending' | 'current' | 'completed' | 'error';
  }>;
  className?: string;
}

export function ProgressIndicator({ steps, className }: ProgressIndicatorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {step.status === 'completed' && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            {step.status === 'current' && (
              <LoadingSpinner size="sm" />
            )}
            {step.status === 'error' && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            {step.status === 'pending' && (
              <Clock className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-medium',
              step.status === 'completed' && 'text-green-600',
              step.status === 'current' && 'text-primary',
              step.status === 'error' && 'text-red-600',
              step.status === 'pending' && 'text-muted-foreground'
            )}>
              {step.title}
            </p>
            {step.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {step.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Loading overlay component
export interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  className?: string;
}

export function LoadingOverlay({ 
  isVisible, 
  message = 'Loading...', 
  progress,
  className 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed inset-0 z-50 flex items-center justify-center',
      'bg-background/80 backdrop-blur-sm',
      className
    )}>
      <div className="bg-card p-6 rounded-lg shadow-lg border max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-medium text-center">{message}</p>
          
          {progress !== undefined && (
            <div className="w-full">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for managing loading states
export function useLoadingState() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const setErrorState = React.useCallback((errorMessage: string) => {
    setIsLoading(false);
    setError(errorMessage);
    setSuccess(null);
  }, []);

  const setSuccessState = React.useCallback((successMessage: string) => {
    setIsLoading(false);
    setError(null);
    setSuccess(successMessage);
  }, []);

  const reset = React.useCallback(() => {
    setIsLoading(false);
    setError(null);
    setSuccess(null);
  }, []);

  return {
    isLoading,
    error,
    success,
    startLoading,
    stopLoading,
    setErrorState,
    setSuccessState,
    reset
  };
}

// Async operation wrapper with loading states
export function useAsyncOperation<T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>
) {
  const { 
    isLoading, 
    error, 
    success, 
    startLoading, 
    setErrorState, 
    setSuccessState 
  } = useLoadingState();

  const execute = React.useCallback(async (...args: T): Promise<R | null> => {
    try {
      startLoading();
      const result = await asyncFn(...args);
      setSuccessState('Operation completed successfully');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorState(errorMessage);
      return null;
    }
  }, [asyncFn, startLoading, setErrorState, setSuccessState]);

  return {
    execute,
    isLoading,
    error,
    success
  };
}