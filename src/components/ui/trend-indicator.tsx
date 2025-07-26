'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  value: number;
  label?: string;
  format?: 'percentage' | 'number' | 'currency';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function TrendIndicator({ 
  value, 
  label, 
  format = 'percentage',
  size = 'md',
  showIcon = true 
}: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  const formatValue = (val: number) => {
    const absValue = Math.abs(val);
    switch (format) {
      case 'percentage':
        return `${isPositive ? '+' : isNegative ? '-' : ''}${absValue.toFixed(1)}%`;
      case 'currency':
        return `${isPositive ? '+' : isNegative ? '-' : ''}$${absValue.toLocaleString()}`;
      default:
        return `${isPositive ? '+' : isNegative ? '-' : ''}${absValue.toLocaleString()}`;
    }
  };

  const getIcon = () => {
    if (isPositive) return TrendingUp;
    if (isNegative) return TrendingDown;
    return Minus;
  };

  const getColorClass = () => {
    if (isPositive) return 'text-green-500';
    if (isNegative) return 'text-red-500';
    return 'text-gray-500';
  };

  const sizes = {
    sm: { icon: 'h-3 w-3', text: 'text-xs' },
    md: { icon: 'h-4 w-4', text: 'text-sm' },
    lg: { icon: 'h-5 w-5', text: 'text-base' }
  };

  const sizeConfig = sizes[size];
  const Icon = getIcon();
  const colorClass = getColorClass();

  return (
    <div className="flex items-center gap-1">
      {showIcon && <Icon className={cn(sizeConfig.icon, colorClass)} />}
      <span className={cn('font-medium', sizeConfig.text, colorClass)}>
        {formatValue(value)}
      </span>
      {label && (
        <span className={cn('text-muted-foreground', sizeConfig.text)}>
          {label}
        </span>
      )}
    </div>
  );
}