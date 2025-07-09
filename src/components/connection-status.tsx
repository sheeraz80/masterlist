'use client';

import { useRealtime } from '@/contexts/realtime-context';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionStatusProps {
  variant?: 'default' | 'minimal' | 'detailed';
  className?: string;
}

export function ConnectionStatus({ variant = 'default', className }: ConnectionStatusProps) {
  const { connected } = useRealtime();

  if (variant === 'minimal') {
    return (
      <AnimatePresence mode="wait">
        {connected ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={className}
          >
            <Wifi className="h-4 w-4 text-green-500" />
          </motion.div>
        ) : (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={className}
          >
            <WifiOff className="h-4 w-4 text-red-500" />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  if (variant === 'detailed') {
    return (
      <AnimatePresence mode="wait">
        {connected ? (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={className}
          >
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Wifi className="h-3 w-3 mr-1" />
              Connected - Live Updates Active
            </Badge>
          </motion.div>
        ) : (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={className}
          >
            <Badge variant="outline" className="text-red-600 border-red-600">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline - Using Cached Data
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Default variant
  return (
    <AnimatePresence mode="wait">
      {connected ? (
        <motion.div
          key="connected"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={className}
        >
          <Badge variant="outline" className="text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
            Live
          </Badge>
        </motion.div>
      ) : (
        <motion.div
          key="disconnected"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={className}
        >
          <Badge variant="outline" className="text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-1" />
            Offline
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  );
}