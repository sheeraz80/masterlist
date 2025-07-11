'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Brain, Sparkles, Code, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dots' | 'pulse' | 'spin' | 'ai' | 'bars';
  text?: string;
  className?: string;
}

export function Loading({ 
  size = 'md', 
  variant = 'default', 
  text, 
  className 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-2', className)} data-testid="loading-container">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 bg-primary rounded-full"
              data-testid="loading-dot"
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
        {text && (
          <span className={cn('text-muted-foreground', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center gap-2', className)} data-testid="loading-container">
        <motion.div
          className={cn('bg-primary rounded-full', sizeClasses[size])}
          data-testid="loading-pulse"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        {text && (
          <span className={cn('text-muted-foreground', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'ai') {
    return (
      <div className={cn('flex items-center gap-3', className)} data-testid="loading-ai">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Brain className={cn('text-purple-500', sizeClasses[size])} />
          </motion.div>
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="h-3 w-3 text-yellow-500" />
          </motion.div>
        </div>
        {text && (
          <span className={cn('text-muted-foreground', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className={cn('flex items-center gap-2', className)} data-testid="loading-container">
        <div className="flex space-x-1">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-1 bg-primary rounded-full"
              data-testid="loading-bar"
              animate={{ height: [8, 24, 8] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
        {text && (
          <span className={cn('text-muted-foreground', textSizeClasses[size])}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn('flex items-center gap-2', className)} data-testid="loading-container">
      <Loader2 className={cn('animate-spin', sizeClasses[size])} data-testid="loading-spinner" />
      {text && (
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          {text}
        </span>
      )}
    </div>
  );
}

// Specialized loading components
export function PageLoading({ title = 'Loading...' }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <Loading variant="ai" size="lg" />
      <div className="text-center">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground text-sm">Please wait while we load your data</p>
      </div>
    </div>
  );
}

export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <Loading variant="dots" text={text} />
    </div>
  );
}

export function ButtonLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Loading size="sm" />
      <span>{text}</span>
    </div>
  );
}

// Full screen loading overlay
export function LoadingOverlay({ 
  isOpen, 
  text = 'Processing...',
  variant = 'ai' 
}: { 
  isOpen: boolean;
  text?: string;
  variant?: LoadingProps['variant'];
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
      data-testid="loading-overlay"
    >
      <div className="text-center space-y-4">
        <Loading variant={variant} size="lg" />
        <div>
          <h3 className="text-lg font-semibold">{text}</h3>
          <p className="text-muted-foreground text-sm">This may take a moment...</p>
        </div>
      </div>
    </motion.div>
  );
}

// Analytics specific loading
export function AnalyticsLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <BarChart3 className="h-12 w-12 text-blue-500" />
        </motion.div>
        <motion.div
          className="absolute -top-2 -right-2"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="h-4 w-4 text-yellow-500" />
        </motion.div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold">Analyzing Data</h3>
        <p className="text-muted-foreground text-sm">Generating insights and reports...</p>
      </div>
    </div>
  );
}

// Repository loading
export function RepositoryLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Code className="h-8 w-8 text-green-500" />
        </motion.div>
      </div>
      <div className="text-center">
        <h3 className="text-base font-semibold">Setting up Repository</h3>
        <p className="text-muted-foreground text-sm">This may take a few moments...</p>
      </div>
    </div>
  );
}

// Error state with retry
export function LoadingError({ 
  error, 
  onRetry, 
  retryText = 'Try Again' 
}: { 
  error: string;
  onRetry: () => void;
  retryText?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-red-600">Loading Failed</h3>
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        {retryText}
      </button>
    </div>
  );
}