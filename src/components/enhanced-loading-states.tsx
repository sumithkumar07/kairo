'use client';

import { useState, useEffect } from 'react';
import { Loader2, Zap, Database, Brain, Workflow, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface LoadingStateProps {
  type?: 'default' | 'quantum' | 'hipaa' | 'reality' | 'consciousness' | 'workflow' | 'database';
  message?: string;
  progress?: number;
  showSteps?: boolean;
  duration?: number;
}

export function EnhancedLoadingState({ 
  type = 'default', 
  message, 
  progress, 
  showSteps = false,
  duration = 3000 
}: LoadingStateProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);

  const loadingConfigs = {
    default: {
      icon: Loader2,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      title: 'Loading...',
      steps: ['Initializing', 'Processing', 'Completing']
    },
    quantum: {
      icon: Zap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      title: 'Quantum Processing',
      steps: [
        'Initializing quantum fields',
        'Analyzing probability matrices',
        'Computing optimal pathways',
        'Finalizing quantum state'
      ]
    },
    hipaa: {
      icon: Database,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      title: 'HIPAA Compliance Check',
      steps: [
        'Scanning for PHI data',
        'Validating security measures',
        'Checking audit requirements',
        'Generating compliance report'
      ]
    },
    reality: {
      icon: Brain,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      title: 'Reality Fabrication',
      steps: [
        'Mapping dimensional layers',
        'Analyzing reality matrices',
        'Calculating probability vectors',
        'Synthesizing reality options'
      ]
    },
    consciousness: {
      icon: Brain,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      title: 'Global Consciousness',
      steps: [
        'Connecting to consciousness network',
        'Analyzing collective patterns',
        'Processing global insights',
        'Synthesizing awareness data'
      ]
    },
    workflow: {
      icon: Workflow,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
      title: 'Building Workflow',
      steps: [
        'Analyzing requirements',
        'Designing workflow structure',
        'Configuring connections',
        'Optimizing performance'
      ]
    },
    database: {
      icon: Database,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      title: 'Database Operation',
      steps: [
        'Establishing connection',
        'Executing queries',
        'Processing results',
        'Updating cache'
      ]
    }
  };

  const config = loadingConfigs[type];
  const IconComponent = config.icon;

  useEffect(() => {
    if (!showSteps) return;

    const stepDuration = duration / config.steps.length;
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < config.steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [showSteps, duration, config.steps.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationProgress(prev => (prev + 1) % 100);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          {/* Animated Icon */}
          <div className={`relative mx-auto w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center`}>
            <IconComponent 
              className={`h-8 w-8 ${config.color} ${type === 'default' ? 'animate-spin' : 'animate-pulse'}`} 
            />
            {type !== 'default' && (
              <div className="absolute inset-0 rounded-full border-2 border-transparent">
                <div 
                  className={`h-full w-full rounded-full border-2 border-t-current ${config.color} animate-spin`}
                  style={{ opacity: 0.3 }}
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{config.title}</h3>
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </div>

          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {Math.round(progress)}% complete
              </div>
            </div>
          )}

          {/* Steps */}
          {showSteps && (
            <div className="space-y-3">
              {config.steps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                    index === currentStep 
                      ? `${config.bgColor} border border-current` 
                      : index < currentStep 
                        ? 'bg-green-50 dark:bg-green-950/20' 
                        : 'bg-muted/30'
                  }`}
                >
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                    index < currentStep 
                      ? 'bg-green-500' 
                      : index === currentStep 
                        ? config.color 
                        : 'bg-muted-foreground/30'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="h-3 w-3 text-white" />
                    ) : index === currentStep ? (
                      <div className={`w-2 h-2 rounded-full bg-current animate-pulse`} />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-current opacity-30" />
                    )}
                  </div>
                  
                  <span className={`text-sm ${
                    index === currentStep 
                      ? 'font-medium' 
                      : index < currentStep 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-muted-foreground'
                  }`}>
                    {step}
                  </span>

                  {index === currentStep && (
                    <Loader2 className={`h-3 w-3 animate-spin ml-auto ${config.color}`} />
                  )}
                  
                  {index < currentStep && (
                    <CheckCircle className="h-3 w-3 text-green-500 ml-auto" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Estimated time */}
          {showSteps && (
            <div className="text-xs text-muted-foreground">
              Estimated time: {Math.ceil(duration / 1000)}s
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonLoader({ 
  lines = 3, 
  showAvatar = false, 
  className = "" 
}: { 
  lines?: number; 
  showAvatar?: boolean; 
  className?: string;
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <div className="w-10 h-10 bg-muted rounded-full flex-shrink-0" />
        )}
        <div className="flex-1 space-y-3">
          {Array.from({ length: lines }).map((_, index) => (
            <div 
              key={index}
              className={`h-4 bg-muted rounded ${
                index === lines - 1 ? 'w-3/4' : 'w-full'
              }`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeletonLoader({ 
  rows = 5, 
  columns = 4,
  showHeader = true 
}: { 
  rows?: number; 
  columns?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="animate-pulse">
      {showHeader && (
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="h-6 bg-muted rounded" />
          ))}
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={rowIndex}
            className="grid gap-4" 
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div 
                key={colIndex} 
                className={`h-4 bg-muted rounded ${
                  colIndex === 0 ? 'w-full' : colIndex === columns - 1 ? 'w-3/4' : 'w-5/6'
                }`} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeletonLoader({ 
  showImage = false,
  showBadge = false 
}: { 
  showImage?: boolean;
  showBadge?: boolean;
}) {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        {showImage && (
          <div className="w-full h-48 bg-muted rounded-lg mb-4" />
        )}
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-3/4" />
            {showBadge && (
              <div className="h-5 bg-muted rounded w-16" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
          
          <div className="flex items-center gap-3 pt-4">
            <div className="h-8 bg-muted rounded w-20" />
            <div className="h-8 bg-muted rounded w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}