import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { env, isProduction, isDevelopment } from '@/lib/env';

// Enhanced log format with structured data
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  winston.format.printf(({ timestamp, level, message, stack, metadata }) => {
    const metaString = Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message} ${metaString}`;
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple(),
  winston.format.printf(({ level, message, stack, ...meta }) => {
    const metaString = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${level}: ${stack || message}${metaString}`;
  })
);

// Create transports array
const transports: winston.transport[] = [];

// Console transport (always enabled)
transports.push(
  new winston.transports.Console({
    format: isDevelopment() ? consoleFormat : logFormat,
    silent: process.env.NODE_ENV === 'test',
  })
);

// File transports (only in production or when explicitly enabled)
if (isProduction() || process.env.ENABLE_FILE_LOGGING === 'true') {
  transports.push(
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
      createSymlink: true,
      symlinkName: 'application.log',
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat,
      createSymlink: true,
      symlinkName: 'error.log',
    })
  );
}

// Add JSON transport for structured logging in production
if (isProduction()) {
  transports.push(
    new DailyRotateFile({
      filename: 'logs/json-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction() ? 'info' : 'debug'),
  format: logFormat,
  transports,
  exitOnError: false,
  silent: process.env.NODE_ENV === 'test',
});

// Enhanced logging functions with better structure
export function logAPIRequest(
  method: string,
  path: string,
  userId?: string,
  duration?: number,
  statusCode?: number,
  userAgent?: string
) {
  logger.info('API Request', {
    method,
    path,
    userId,
    duration: duration ? `${duration}ms` : undefined,
    statusCode,
    userAgent,
    timestamp: new Date().toISOString(),
  });
}

export function logError(error: Error, context?: Record<string, any>) {
  logger.error(error.message, {
    name: error.name,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...context,
  });
}

export function logAuthEvent(
  event: string,
  userId?: string,
  details?: Record<string, any>
) {
  logger.info('Auth Event', {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  });
}

export function logDatabaseQuery(
  query: string,
  duration?: number,
  error?: Error,
  affected?: number
) {
  if (error) {
    logger.error('Database Query Failed', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      duration: duration ? `${duration}ms` : undefined,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  } else {
    logger.debug('Database Query', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      duration: duration ? `${duration}ms` : undefined,
      affected,
      timestamp: new Date().toISOString(),
    });
  }
}

export function logDatabaseOperation(
  operation: string,
  table: string,
  recordId?: string,
  duration?: number,
  error?: Error
) {
  const logData = {
    operation,
    table,
    recordId,
    duration: duration ? `${duration}ms` : undefined,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    logger.error('Database Operation Failed', {
      ...logData,
      error: error.message,
    });
  } else {
    logger.info('Database Operation', logData);
  }
}

export function logSecurityEvent(
  event: string,
  userId?: string,
  ipAddress?: string,
  userAgent?: string,
  details?: Record<string, any>
) {
  logger.warn('Security Event', {
    event,
    userId,
    ipAddress,
    userAgent,
    timestamp: new Date().toISOString(),
    ...details,
  });
}

export function logPerformanceMetric(
  operation: string,
  duration: number,
  metadata?: Record<string, any>
) {
  logger.info('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    slow: duration > 1000,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

export function logRateLimitEvent(
  identifier: string,
  action: string,
  limit: number,
  current: number,
  resetTime?: Date
) {
  logger.warn('Rate Limit Event', {
    identifier,
    action,
    limit,
    current,
    resetTime: resetTime?.toISOString(),
    exceeded: current >= limit,
    timestamp: new Date().toISOString(),
  });
}

export function logBusinessEvent(
  event: string,
  userId?: string,
  metadata?: Record<string, any>
) {
  logger.info('Business Event', {
    event,
    userId,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

// Helper function to create child loggers with context
export function createChildLogger(context: Record<string, any>) {
  return logger.child(context);
}

// Request/Response logging middleware helper
export function createRequestLogger(requestId: string) {
  return createChildLogger({ requestId });
}

export default logger;