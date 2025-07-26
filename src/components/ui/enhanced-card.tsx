'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  gradient?: string;
  interactive?: boolean;
}

export function EnhancedCard({ 
  children, 
  className, 
  hover = false, 
  glow = false, 
  gradient,
  interactive = false,
  ...props 
}: EnhancedCardProps) {
  return (
    <Card 
      className={cn(
        "relative overflow-hidden border border-border/50",
        hover && "hover:shadow-xl hover:-translate-y-1 transition-all duration-300",
        glow && "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/20 before:to-purple-500/20 before:blur-xl before:-z-10",
        gradient && `bg-gradient-to-br ${gradient}`,
        interactive && "cursor-pointer group",
        className
      )}
      {...props}
    >
      {gradient && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
      )}
      {children}
    </Card>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    label: string;
  };
  color: string;
  subtitle?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, color, subtitle }: MetricCardProps) {
  return (
    <EnhancedCard hover interactive className="group">
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color}/10 to-transparent rounded-full -translate-y-10 translate-x-10`} />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 ${color}/10 rounded-xl group-hover:${color}/20 transition-colors`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center text-sm">
            <span className={trend.value > 0 ? 'text-green-500' : trend.value < 0 ? 'text-red-500' : 'text-gray-500'}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            <span className="text-muted-foreground ml-1">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </EnhancedCard>
  );
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle };