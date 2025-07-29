'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, AlertCircle, Wifi, WifiOff, RefreshCw, Clock, Zap, Brain, Database, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Enhanced Loading States with Animation and Context
interface EnhancedLoadingStateProps {
  type?: 'quantum' | 'hipaa' | 'reality' | 'consciousness' | 'general' | 'api' | 'database';
  message?: string;
  progress?: number;
  subMessage?: string;
  duration?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'success' | 'error' | 'warning';
  showProgress?: boolean;
  animated?: boolean;
  className?: string;
}

export const EnhancedLoadingState: React.FC<EnhancedLoadingStateProps> = ({
  type = 'general',
  message,
  progress,
  subMessage,
  duration,
  size = 'md',
  variant = 'default',
  showProgress = false,
  animated = true,
  className
}) => {
  const [currentProgress, setCurrentProgress] = useState(progress || 0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (showProgress && progress !== undefined) {
      setCurrentProgress(progress);
    }
  }, [progress, showProgress]);

  useEffect(() => {
    if (duration) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 100);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [duration]);

  const getLoadingConfig = () => {
    switch (type) {
      case 'quantum':
        return {
          icon: Brain,
          color: 'from-purple-500 to-pink-500',
          message: message || 'Quantum simulation in progress...',
          subMessage: subMessage || 'Computing infinite possibilities across multiple universes',
          glowColor: 'purple'
        };
      case 'hipaa':
        return {
          icon: CheckCircle,
          color: 'from-green-500 to-emerald-500',
          message: message || 'HIPAA compliance check in progress...',
          subMessage: subMessage || 'Ensuring healthcare data privacy and security',
          glowColor: 'green'
        };
      case 'reality':
        return {
          icon: Zap,
          color: 'from-orange-500 to-red-500',
          message: message || 'Reality fabrication in progress...',
          subMessage: subMessage || 'Manipulating physical realm through IoT devices',
          glowColor: 'orange'
        };
      case 'consciousness':
        return {
          icon: Activity,
          color: 'from-blue-500 to-cyan-500',
          message: message || 'Accessing global consciousness feed...',
          subMessage: subMessage || 'Tapping into collective intelligence network',
          glowColor: 'blue'
        };
      case 'api':
        return {
          icon: Wifi,
          color: 'from-indigo-500 to-purple-500',
          message: message || 'API request in progress...',
          subMessage: subMessage || 'Communicating with server',
          glowColor: 'indigo'
        };
      case 'database':
        return {
          icon: Database,
          color: 'from-teal-500 to-blue-500',
          message: message || 'Database operation in progress...',
          subMessage: subMessage || 'Processing data query',
          glowColor: 'teal'
        };
      default:
        return {
          icon: Loader2,
          color: 'from-primary to-primary-foreground',
          message: message || 'Loading...',
          subMessage: subMessage || 'Please wait while we process your request',
          glowColor: 'primary'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { icon: 'h-4 w-4', text: 'text-sm', container: 'p-4' };
      case 'md':
        return { icon: 'h-6 w-6', text: 'text-base', container: 'p-6' };
      case 'lg':
        return { icon: 'h-8 w-8', text: 'text-lg', container: 'p-8' };
      case 'xl':
        return { icon: 'h-12 w-12', text: 'text-xl', container: 'p-10' };
      default:
        return { icon: 'h-6 w-6', text: 'text-base', container: 'p-6' };
    }
  };

  const config = getLoadingConfig();
  const sizeClasses = getSizeClasses();
  const IconComponent = config.icon;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center space-y-4",
      sizeClasses.container,
      className
    )}>
      {/* Animated Icon with Glow Effect */}
      <div className="relative">
        <div className={cn(
          "absolute inset-0 rounded-full blur-xl opacity-20",
          `bg-gradient-to-r ${config.color}`,
          animated && "animate-pulse"
        )} />
        <div className={cn(
          "relative p-4 rounded-full",
          `bg-gradient-to-r ${config.color}`,
          animated && "animate-spin"
        )}>
          <IconComponent className={cn(sizeClasses.icon, "text-white")} />
        </div>
      </div>

      {/* Messages */}
      <div className="text-center space-y-2 max-w-md">
        <h3 className={cn("font-semibold", sizeClasses.text)}>
          {config.message}
        </h3>
        {config.subMessage && (
          <p className="text-muted-foreground text-sm">
            {config.subMessage}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full max-w-xs space-y-2">
          <Progress 
            value={currentProgress} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(currentProgress)}%</span>
            {duration && (
              <span>
                {Math.floor(elapsedTime / 1000)}s / {Math.floor(duration / 1000)}s
              </span>
            )}
          </div>
        </div>
      )}

      {/* Status Indicators */}
      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Connected</span>
        </div>
        {variant === 'error' && (
          <div className="flex items-center space-x-1">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span className="text-red-500">Error occurred</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Error Handler with Retry Logic
interface EnhancedErrorHandlerProps {
  error: Error | string;
  type?: 'api' | 'network' | 'validation' | 'authentication' | 'permission' | 'server';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  retryCount?: number;
  maxRetries?: number;
  showTechnicalDetails?: boolean;
}

export const EnhancedErrorHandler: React.FC<EnhancedErrorHandlerProps> = ({
  error,
  type = 'api',
  onRetry,
  onDismiss,
  className,
  retryCount = 0,
  maxRetries = 3,
  showTechnicalDetails = false
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const errorMessage = typeof error === 'string' ? error : error.message;

  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: WifiOff,
          title: 'Connection Error',
          description: 'Unable to connect to the server. Please check your internet connection.',
          color: 'red',
          suggestion: 'Try refreshing the page or check your network connection.'
        };
      case 'validation':
        return {
          icon: AlertCircle,
          title: 'Validation Error',
          description: 'The provided information is invalid or incomplete.',
          color: 'yellow',
          suggestion: 'Please review your input and try again.'
        };
      case 'authentication':
        return {
          icon: AlertCircle,
          title: 'Authentication Required',
          description: 'You need to be signed in to access this feature.',
          color: 'blue',
          suggestion: 'Please sign in to continue.'
        };
      case 'permission':
        return {
          icon: AlertCircle,
          title: 'Access Denied',
          description: 'You don\'t have permission to perform this action.',
          color: 'orange',
          suggestion: 'Contact support if you believe this is an error.'
        };
      case 'server':
        return {
          icon: AlertCircle,
          title: 'Server Error',
          description: 'An internal server error occurred.',
          color: 'red',
          suggestion: 'Our team has been notified. Please try again later.'
        };
      default:
        return {
          icon: AlertCircle,
          title: 'Something went wrong',
          description: errorMessage,
          color: 'red',
          suggestion: 'Please try again or contact support if the problem persists.'
        };
    }
  };

  const handleRetry = async () => {
    if (onRetry && retryCount < maxRetries) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  const config = getErrorConfig();
  const IconComponent = config.icon;

  return (
    <Card className={cn("border-red-200 bg-red-50/50", className)}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-2 rounded-full bg-${config.color}-100`}>
            <IconComponent className={`h-5 w-5 text-${config.color}-600`} />
          </div>
          
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900">{config.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{config.description}</p>
            </div>

            {/* Technical Details */}
            {showTechnicalDetails && (
              <div className="space-y-2">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  {showDetails ? 'Hide' : 'Show'} technical details
                </button>
                {showDetails && (
                  <div className="p-3 bg-gray-100 rounded-md text-xs font-mono text-gray-700">
                    <div>Error: {errorMessage}</div>
                    <div>Type: {type}</div>
                    <div>Retry Count: {retryCount}/{maxRetries}</div>
                    <div>Timestamp: {new Date().toISOString()}</div>
                  </div>
                )}
              </div>
            )}

            {/* Suggestion */}
            <p className="text-sm text-gray-500">{config.suggestion}</p>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {onRetry && retryCount < maxRetries && (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry ({maxRetries - retryCount} attempts left)
                    </>
                  )}
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Dismiss
                </button>
              )}

              {retryCount >= maxRetries && (
                <Badge variant="destructive" className="text-xs">
                  Max retries reached
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mobile-Responsive Container
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  breakpoint = 'lg'
}) => {
  return (
    <div className={cn(
      "w-full mx-auto px-4 sm:px-6",
      {
        'max-w-screen-sm': breakpoint === 'sm',
        'max-w-screen-md': breakpoint === 'md', 
        'max-w-screen-lg': breakpoint === 'lg',
        'max-w-screen-xl': breakpoint === 'xl',
        'max-w-screen-2xl': breakpoint === '2xl'
      },
      className
    )}>
      {children}
    </div>
  );
};

// Accessibility-Enhanced Button
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  ariaLabel?: string;
  tooltipText?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText = 'Loading...',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  ariaLabel,
  tooltipText,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "bg-transparent text-foreground hover:bg-muted focus:ring-muted"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base", 
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      title={tooltipText}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {LeftIcon && <LeftIcon className="w-4 h-4 mr-2" />}
          {children}
          {RightIcon && <RightIcon className="w-4 h-4 ml-2" />}
        </>
      )}
    </button>
  );
};