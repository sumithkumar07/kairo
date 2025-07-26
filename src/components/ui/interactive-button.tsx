'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  gradient?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  loading?: boolean;
  glow?: boolean;
}

export function InteractiveButton({ 
  children, 
  icon: Icon, 
  iconPosition = 'left',
  gradient,
  size = 'default',
  variant = 'default',
  className,
  loading = false,
  glow = false,
  asChild = false,
  ...props 
}: InteractiveButtonProps & { asChild?: boolean }) {
  const Comp = asChild ? 'span' : 'button';
  
  const buttonContent = (
    <>
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      <div className="relative flex items-center gap-2">
        {Icon && iconPosition === 'left' && (
          <Icon className={cn(
            "transition-transform duration-300",
            loading ? "animate-spin" : "group-hover:scale-110",
            size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-5 w-5" : "h-4 w-4"
          )} />
        )}
        
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : (
          children
        )}
        
        {Icon && iconPosition === 'right' && !loading && (
          <Icon className={cn(
            "transition-transform duration-300 group-hover:translate-x-1",
            size === 'sm' ? "h-3 w-3" : size === 'lg' ? "h-5 w-5" : "h-4 w-4"
          )} />
        )}
      </div>
    </>
  );

  if (asChild) {
    return (
      <Button
        asChild
        size={size}
        variant={variant}
        className={cn(
          "relative overflow-hidden group transition-all duration-300",
          gradient && `bg-gradient-to-r ${gradient} hover:shadow-lg hover:scale-105`,
          glow && "hover:shadow-xl hover:shadow-primary/25",
          "hover:scale-105 active:scale-95",
          className
        )}
        disabled={loading}
        {...props}
      >
        <span>{buttonContent}</span>
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      className={cn(
        "relative overflow-hidden group transition-all duration-300",
        gradient && `bg-gradient-to-r ${gradient} hover:shadow-lg hover:scale-105`,
        glow && "hover:shadow-xl hover:shadow-primary/25",
        "hover:scale-105 active:scale-95",
        className
      )}
      disabled={loading}
      {...props}
    >
      {buttonContent}
    </Button>
  );
}