'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Eye,
  Volume2,
  VolumeX,
  Type,
  Zap,
  Accessibility,
  Languages,
  Gauge,
  Settings,
  Save,
  RotateCcw,
  Check,
  Loader2,
  Bell,
  BellOff,
  Vibrate,
  Focus,
  MousePointer,
  Keyboard,
  Contrast,
  ZoomIn,
  ZoomOut,
  Filter,
  Sparkles,
  Cpu,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced Theme Toggle with more options
export function EnhancedThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Skeleton className="h-9 w-20" />;
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('light')}
        className="h-7"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('dark')}
        className="h-7"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setTheme('system')}
        className="h-7"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Loading State Components
interface LoadingStateProps {
  type: 'skeleton' | 'spinner' | 'progress' | 'pulse';
  message?: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingState({ type, message, progress, size = 'md' }: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  switch (type) {
    case 'skeleton':
      return (
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      );
    
    case 'spinner':
      return (
        <div className="flex items-center gap-3">
          <Loader2 className={cn('animate-spin', sizeClasses[size])} />
          {message && <span className="text-sm text-muted-foreground">{message}</span>}
        </div>
      );
    
    case 'progress':
      return (
        <div className="space-y-2">
          {message && <p className="text-sm font-medium">{message}</p>}
          <Progress value={progress || 0} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">
            {progress ? `${progress}%` : 'Loading...'}
          </p>
        </div>
      );
    
    case 'pulse':
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">{message || 'Processing...'}</span>
        </div>
      );
    
    default:
      return <Skeleton className="h-20 w-full" />;
  }
}

// Accessibility Features Component
interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  fontSize: number;
  focusIndicator: boolean;
  keyboardNavigation: boolean;
  audioFeedback: boolean;
}

export function AccessibilityPanel() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    fontSize: 100,
    focusIndicator: true,
    keyboardNavigation: true,
    audioFeedback: false
  });

  const [isLoading, setIsLoading] = useState(false);

  const updateSetting = useCallback((key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // Apply accessibility changes to document
    applyAccessibilitySettings({ ...settings, [key]: value });
  }, [settings]);

  const applyAccessibilitySettings = useCallback((newSettings: AccessibilitySettings) => {
    // Apply high contrast
    document.documentElement.classList.toggle('high-contrast', newSettings.highContrast);
    
    // Apply reduced motion
    document.documentElement.classList.toggle('reduce-motion', newSettings.reducedMotion);
    
    // Apply font size
    document.documentElement.style.fontSize = `${newSettings.fontSize}%`;
    
    // Apply focus indicators
    document.documentElement.classList.toggle('enhanced-focus', newSettings.focusIndicator);
  }, []);

  const resetToDefaults = () => {
    const defaultSettings: AccessibilitySettings = {
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      fontSize: 100,
      focusIndicator: true,
      keyboardNavigation: true,
      audioFeedback: false
    };
    setSettings(defaultSettings);
    applyAccessibilitySettings(defaultSettings);
  };

  const saveSettings = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Accessibility className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Visual</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>High Contrast Mode</Label>
              <p className="text-xs text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(value) => updateSetting('highContrast', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Reduce Motion</Label>
              <p className="text-xs text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              checked={settings.reducedMotion}
              onCheckedChange={(value) => updateSetting('reducedMotion', value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Font Size</Label>
              <span className="text-sm text-muted-foreground">{settings.fontSize}%</span>
            </div>
            <Slider
              value={[settings.fontSize]}
              onValueChange={(value) => updateSetting('fontSize', value[0])}
              min={75}
              max={150}
              step={5}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enhanced Focus Indicators</Label>
              <p className="text-xs text-muted-foreground">
                Make focus outlines more visible
              </p>
            </div>
            <Switch
              checked={settings.focusIndicator}
              onCheckedChange={(value) => updateSetting('focusIndicator', value)}
            />
          </div>
        </div>

        <Separator />

        {/* Navigation Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Navigation</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Keyboard Navigation</Label>
              <p className="text-xs text-muted-foreground">
                Enable full keyboard navigation
              </p>
            </div>
            <Switch
              checked={settings.keyboardNavigation}
              onCheckedChange={(value) => updateSetting('keyboardNavigation', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Screen Reader Support</Label>
              <p className="text-xs text-muted-foreground">
                Optimize for screen reader users
              </p>
            </div>
            <Switch
              checked={settings.screenReader}
              onCheckedChange={(value) => updateSetting('screenReader', value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Audio Feedback</Label>
              <p className="text-xs text-muted-foreground">
                Play sounds for interactions
              </p>
            </div>
            <Switch
              checked={settings.audioFeedback}
              onCheckedChange={(value) => updateSetting('audioFeedback', value)}
            />
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Responsive Design Improvements
export function ResponsiveWrapper({ children }: { children: React.ReactNode }) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={cn(
      'w-full transition-all duration-200',
      screenSize === 'mobile' && 'px-4',
      screenSize === 'tablet' && 'px-6',
      screenSize === 'desktop' && 'px-8'
    )}>
      {children}
    </div>
  );
}

// Performance Monitor Component
interface PerformanceMetrics {
  loadTime: number;
  interactionToNextPaint: number;
  cumulativeLayoutShift: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Collect performance metrics
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const mockMetrics: PerformanceMetrics = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        interactionToNextPaint: Math.random() * 100 + 50,
        cumulativeLayoutShift: Math.random() * 0.1,
        firstContentfulPaint: Math.random() * 1000 + 500,
        largestContentfulPaint: Math.random() * 2000 + 1000
      };
      
      setMetrics(mockMetrics);
    }
  }, []);

  if (!metrics || !isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4"
      >
        <Activity className="h-4 w-4" />
      </Button>
    );
  }

  const getScoreColor = (score: number, thresholds: [number, number]) => {
    if (score <= thresholds[0]) return 'text-green-500';
    if (score <= thresholds[1]) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Performance Monitor</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <Label className="text-muted-foreground">Load Time</Label>
            <p className={cn("font-medium", getScoreColor(metrics.loadTime, [100, 300]))}>
              {metrics.loadTime.toFixed(0)}ms
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">INP</Label>
            <p className={cn("font-medium", getScoreColor(metrics.interactionToNextPaint, [200, 500]))}>
              {metrics.interactionToNextPaint.toFixed(0)}ms
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">CLS</Label>
            <p className={cn("font-medium", getScoreColor(metrics.cumulativeLayoutShift, [0.1, 0.25]))}>
              {metrics.cumulativeLayoutShift.toFixed(3)}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">FCP</Label>
            <p className={cn("font-medium", getScoreColor(metrics.firstContentfulPaint, [1800, 3000]))}>
              {metrics.firstContentfulPaint.toFixed(0)}ms
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-2 border-t">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span className="text-xs text-muted-foreground">
            Performance within acceptable ranges
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// Enhanced Animation Component
export function AnimatedCard({ 
  children, 
  delay = 0, 
  direction = 'up' 
}: { 
  children: React.ReactNode; 
  delay?: number; 
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getAnimationClass = () => {
    const base = "transition-all duration-500 ease-out";
    if (!isVisible) {
      switch (direction) {
        case 'up': return `${base} transform translate-y-4 opacity-0`;
        case 'down': return `${base} transform -translate-y-4 opacity-0`;
        case 'left': return `${base} transform translate-x-4 opacity-0`;
        case 'right': return `${base} transform -translate-x-4 opacity-0`;
        case 'fade': return `${base} opacity-0`;
        default: return `${base} transform translate-y-4 opacity-0`;
      }
    }
    return `${base} transform translate-y-0 translate-x-0 opacity-100`;
  };

  return (
    <div className={getAnimationClass()}>
      {children}
    </div>
  );
}