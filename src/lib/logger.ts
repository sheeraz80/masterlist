import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

export function logAPIRequest(
  method: string,
  path: string,
  userId?: string,
  duration?: number
) {
  logger.info('API Request', {
    method,
    path,
    userId,
    duration: duration ? `${duration}ms` : undefined,
  });
}

export function logError(error: Error, context?: Record<string, any>) {
  logger.error(error.message, {
    stack: error.stack,
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
    ...details,
  });
}

export function logDatabaseQuery(
  query: string,
  duration?: number,
  error?: Error
) {
  if (error) {
    logger.error('Database Query Failed', {
      query,
      duration: duration ? `${duration}ms` : undefined,
      error: error.message,
    });
  } else {
    logger.debug('Database Query', {
      query,
      duration: duration ? `${duration}ms` : undefined,
    });
  }
}

export default logger;