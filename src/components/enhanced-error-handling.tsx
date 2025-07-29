'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Bug, 
  Wifi, 
  Server, 
  Clock,
  CheckCircle,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface ErrorInfo {
  type: 'network' | 'server' | 'client' | 'timeout' | 'auth' | 'validation' | 'unknown';
  message: string;
  code?: string;
  details?: any;
  timestamp?: number;
  endpoint?: string;
  userAction?: string;
  stackTrace?: string;
  retryable?: boolean;
  suggestions?: string[];
}

interface ErrorHandlerProps {
  error: ErrorInfo;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  compact?: boolean;
}

export function EnhancedErrorHandler({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  compact = false
}: ErrorHandlerProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const getErrorConfig = (type: ErrorInfo['type']) => {
    const configs = {
      network: {
        icon: Wifi,
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        borderColor: 'border-red-200 dark:border-red-800',
        title: 'Network Error',
        severity: 'high'
      },
      server: {
        icon: Server,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50 dark:bg-orange-950/20',
        borderColor: 'border-orange-200 dark:border-orange-800',
        title: 'Server Error',
        severity: 'high'
      },
      timeout: {
        icon: Clock,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800',
        title: 'Request Timeout',
        severity: 'medium'
      },
      auth: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        borderColor: 'border-red-200 dark:border-red-800',
        title: 'Authentication Error',
        severity: 'high'
      },
      validation: {
        icon: AlertTriangle,
        color: 'text-amber-500',
        bgColor: 'bg-amber-50 dark:bg-amber-950/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        title: 'Validation Error',
        severity: 'low'
      },
      client: {
        icon: Bug,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50 dark:bg-purple-950/20',
        borderColor: 'border-purple-200 dark:border-purple-800',
        title: 'Client Error',
        severity: 'medium'
      },
      unknown: {
        icon: AlertTriangle,
        color: 'text-gray-500',
        bgColor: 'bg-gray-50 dark:bg-gray-950/20',
        borderColor: 'border-gray-200 dark:border-gray-800',
        title: 'Unknown Error',
        severity: 'medium'
      }
    };

    return configs[type] || configs.unknown;
  };

  const config = getErrorConfig(error.type);
  const IconComponent = config.icon;

  const copyErrorDetails = async () => {
    const errorDetails = {
      type: error.type,
      message: error.message,
      code: error.code,
      timestamp: error.timestamp ? new Date(error.timestamp).toISOString() : new Date().toISOString(),
      endpoint: error.endpoint,
      userAction: error.userAction,
      details: error.details,
      stackTrace: error.stackTrace
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getDefaultSuggestions = (type: ErrorInfo['type']): string[] => {
    const suggestions = {
      network: [
        'Check your internet connection',
        'Try refreshing the page',
        'Wait a moment and try again'
      ],
      server: [
        'The server may be temporarily unavailable',
        'Try again in a few minutes',
        'Contact support if the problem persists'
      ],
      timeout: [
        'The request is taking longer than expected',
        'Check your internet connection',
        'Try again with a more specific query'
      ],
      auth: [
        'Please sign in again',
        'Check your credentials',
        'Clear your browser cache and cookies'
      ],
      validation: [
        'Please check your input and try again',
        'Make sure all required fields are filled',
        'Verify the format of your data'
      ],
      client: [
        'Please refresh the page',
        'Clear your browser cache',
        'Try using a different browser'
      ],
      unknown: [
        'Please try again',
        'Refresh the page',
        'Contact support if the issue persists'
      ]
    };

    return suggestions[type] || suggestions.unknown;
  };

  const suggestions = error.suggestions || getDefaultSuggestions(error.type);

  if (compact) {
    return (
      <Alert className={`${config.bgColor} ${config.borderColor}`}>
        <IconComponent className={`h-4 w-4 ${config.color}`} />
        <AlertDescription className="flex items-center justify-between">
          <span>{error.message}</span>
          <div className="flex items-center gap-2 ml-4">
            {error.retryable !== false && onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                <XCircle className="h-3 w-3" />
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={`${config.borderColor} border-2`}>
      <CardHeader className={config.bgColor}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${config.color}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {config.title}
                <Badge 
                  variant={config.severity === 'high' ? 'destructive' : config.severity === 'medium' ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {config.severity}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                {error.message}
              </CardDescription>
            </div>
          </div>

          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Code and Timestamp */}
        {(error.code || error.timestamp) && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {error.code && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Code:</span>
                <code className="px-2 py-1 bg-muted rounded text-xs">{error.code}</code>
              </div>
            )}
            {error.timestamp && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(error.timestamp).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              What you can try:
            </h4>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          {error.retryable !== false && onRetry && (
            <Button onClick={onRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          
          <Button variant="outline" onClick={copyErrorDetails}>
            {copiedToClipboard ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Details
              </>
            )}
          </Button>

          {error.endpoint && (
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View Documentation
            </Button>
          )}
        </div>

        {/* Collapsible Details */}
        {(showDetails || error.details || error.stackTrace) && (
          <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto">
                {isDetailsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                Technical Details
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4 space-y-4">
              {error.endpoint && (
                <div>
                  <h5 className="font-medium mb-2">Endpoint</h5>
                  <code className="block p-3 bg-muted rounded text-sm">{error.endpoint}</code>
                </div>
              )}
              
              {error.userAction && (
                <div>
                  <h5 className="font-medium mb-2">User Action</h5>
                  <p className="text-sm text-muted-foreground">{error.userAction}</p>
                </div>
              )}
              
              {error.details && (
                <div>
                  <h5 className="font-medium mb-2">Additional Details</h5>
                  <pre className="p-3 bg-muted rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                </div>
              )}
              
              {error.stackTrace && (
                <div>
                  <h5 className="font-medium mb-2">Stack Trace</h5>
                  <pre className="p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                    {error.stackTrace}
                  </pre>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}

export function useErrorHandler() {
  const [errors, setErrors] = useState<(ErrorInfo & { id: string })[]>([]);

  const addError = (error: ErrorInfo) => {
    const errorWithId = { ...error, id: Date.now().toString() };
    setErrors(prev => [...prev, errorWithId]);
    
    // Auto-dismiss non-critical errors after 5 seconds
    if (error.type === 'validation' || error.type === 'client') {
      setTimeout(() => {
        dismissError(errorWithId.id);
      }, 5000);
    }
  };

  const dismissError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  const clearAllErrors = () => {
    setErrors([]);
  };

  return {
    errors,
    addError,
    dismissError,
    clearAllErrors
  };
}