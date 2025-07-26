'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TransitionWrapperProps {
  children: ReactNode;
  variant?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'bounce';
  duration?: number;
  delay?: number;
  className?: string;
  stagger?: boolean;
}

const transitionVariants: Record<string, Variants> = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  'slide-up': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  'slide-down': {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  'slide-left': {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  'slide-right': {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    },
    exit: { opacity: 0, scale: 0.3 }
  }
};

export function TransitionWrapper({ 
  children, 
  variant = 'fade',
  duration = 0.3,
  delay = 0,
  className,
  stagger = false
}: TransitionWrapperProps) {
  const variants = transitionVariants[variant];

  if (stagger && React.Children.count(children) > 1) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1,
              delayChildren: delay,
            }
          }
        }}
        className={className}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div key={index} variants={variants}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Page transition component
export function PageTransition({ 
  children,
  className 
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={cn('min-h-screen', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Staggered list animation
export function StaggeredList({
  children,
  className,
  delay = 0
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.05,
            delayChildren: delay,
          }
        }
      }}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0 }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// Smooth hover animations
export function HoverCard({
  children,
  className,
  scale = 1.02,
  duration = 0.2
}: {
  children: ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
}) {
  return (
    <motion.div
      whileHover={{ 
        scale,
        y: -2,
        transition: { duration, ease: 'easeOut' }
      }}
      whileTap={{ scale: 0.98 }}
      className={cn('cursor-pointer', className)}
    >
      {children}
    </motion.div>
  );
}

// Progress bar animation
export function ProgressBar({
  progress,
  className,
  duration = 1
}: {
  progress: number;
  className?: string;
  duration?: number;
}) {
  return (
    <div className={cn('bg-muted rounded-full overflow-hidden', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration, ease: 'easeOut' }}
        className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
      />
    </div>
  );
}