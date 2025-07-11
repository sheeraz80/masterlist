/**
 * @jest-environment node
 */

import logger, {
  logAPIRequest,
  logError,
  logAuthEvent,
  logDatabaseQuery,
  logDatabaseOperation,
  logSecurityEvent,
  logPerformanceMetric,
  logRateLimitEvent,
  logBusinessEvent,
  createChildLogger,
  createRequestLogger,
} from '../logger';

// Mock winston to avoid file system operations during testing
jest.mock('winston', () => ({
  format: {
    combine: jest.fn(() => ({})),
    timestamp: jest.fn(() => ({})),
    errors: jest.fn(() => ({})),
    metadata: jest.fn(() => ({})),
    printf: jest.fn(() => ({})),
    colorize: jest.fn(() => ({})),
    simple: jest.fn(() => ({})),
    json: jest.fn(() => ({})),
  },
  transports: {
    Console: jest.fn(),
  },
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    child: jest.fn(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    })),
  })),
}));

jest.mock('winston-daily-rotate-file', () => jest.fn());

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logAPIRequest', () => {
    it('should log API request with all parameters', () => {
      const mockInfo = jest.spyOn(logger, 'info');
      
      logAPIRequest('GET', '/api/test', 'user123', 150, 200, 'Mozilla/5.0');
      
      expect(mockInfo).toHaveBeenCalledWith('API Request', {
        method: 'GET',
        path: '/api/test',
        userId: 'user123',
        duration: '150ms',
        statusCode: 200,
        userAgent: 'Mozilla/5.0',
        timestamp: expect.any(String),
      });
    });

    it('should log API request with minimal parameters', () => {
      const mockInfo = jest.spyOn(logger, 'info');
      
      logAPIRequest('POST', '/api/create');
      
      expect(mockInfo).toHaveBeenCalledWith('API Request', {
        method: 'POST',
        path: '/api/create',
        userId: undefined,
        duration: undefined,
        statusCode: undefined,
        userAgent: undefined,
        timestamp: expect.any(String),
      });
    });
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const mockError = jest.spyOn(logger, 'error');
      const error = new Error('Test error');
      const context = { userId: 'user123', action: 'test' };
      
      logError(error, context);
      
      expect(mockError).toHaveBeenCalledWith('Test error', {
        name: 'Error',
        stack: expect.any(String),
        timestamp: expect.any(String),
        userId: 'user123',
        action: 'test',
      });
    });
  });

  describe('logAuthEvent', () => {
    it('should log authentication event', () => {
      const mockInfo = jest.spyOn(logger, 'info');
      
      logAuthEvent('login', 'user123', { ipAddress: '127.0.0.1' });
      
      expect(mockInfo).toHaveBeenCalledWith('Auth Event', {
        event: 'login',
        userId: 'user123',
        timestamp: expect.any(String),
        ipAddress: '127.0.0.1',
      });
    });
  });

  describe('logDatabaseQuery', () => {
    it('should log successful database query', () => {
      const mockDebug = jest.spyOn(logger, 'debug');
      
      logDatabaseQuery('SELECT * FROM users', 50, undefined, 10);
      
      expect(mockDebug).toHaveBeenCalledWith('Database Query', {
        query: 'SELECT * FROM users',
        duration: '50ms',
        affected: 10,
        timestamp: expect.any(String),
      });
    });

    it('should log failed database query', () => {
      const mockError = jest.spyOn(logger, 'error');
      const error = new Error('Database connection failed');
      
      logDatabaseQuery('SELECT * FROM users', 1000, error);
      
      expect(mockError).toHaveBeenCalledWith('Database Query Failed', {
        query: 'SELECT * FROM users',
        duration: '1000ms',
        error: 'Database connection failed',
        timestamp: expect.any(String),
      });
    });

    it('should truncate long queries', () => {
      const mockDebug = jest.spyOn(logger, 'debug');
      const longQuery = 'SELECT * FROM users WHERE name = "very long name that exceeds the limit and should be truncated for sure because it is way too long and exceeds 100 characters"';
      
      logDatabaseQuery(longQuery, 50);
      
      expect(mockDebug).toHaveBeenCalledWith('Database Query', {
        query: longQuery.substring(0, 100) + '...',
        duration: '50ms',
        affected: undefined,
        timestamp: expect.any(String),
      });
    });
  });

  describe('logDatabaseOperation', () => {
    it('should log successful database operation', () => {
      const mockInfo = jest.spyOn(logger, 'info');
      
      logDatabaseOperation('CREATE', 'users', 'user123', 25);
      
      expect(mockInfo).toHaveBeenCalledWith('Database Operation', {
        operation: 'CREATE',
        table: 'users',
        recordId: 'user123',
        duration: '25ms',
        timestamp: expect.any(String),
      });
    });

    it('should log failed database operation', () => {
      const mockError = jest.spyOn(logger, 'error');
      const error = new Error('Operation failed');
      
      logDatabaseOperation('DELETE', 'users', 'user123', 100, error);
      
      expect(mockError).toHaveBeenCalledWith('Database Operation Failed', {
        operation: 'DELETE',
        table: 'users',
        recordId: 'user123',
        duration: '100ms',
        timestamp: expect.any(String),
        error: 'Operation failed',
      });
    });
  });

  describe('logSecurityEvent', () => {
    it('should log security event', () => {
      const mockWarn = jest.spyOn(logger, 'warn');
      
      logSecurityEvent('failed_login', 'user123', '192.168.1.1', 'Mozilla/5.0', { attempts: 3 });
      
      expect(mockWarn).toHaveBeenCalledWith('Security Event', {
        event: 'failed_login',
        userId: 'user123',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        timestamp: expect.any(String),
        attempts: 3,
      });
    });
  });

  describe('logPerformanceMetric', () => {
    it('should log performance metric', () => {
      const mockInfo = jest.spyOn(logger, 'info');
      
      logPerformanceMetric('api_call', 500, { endpoint: '/api/users' });
      
      expect(mockInfo).toHaveBeenCalledWith('Performance Metric', {
        operation: 'api_call',
        duration: '500ms',
        slow: false,
        timestamp: expect.any(String),
        endpoint: '/api/users',
      });
    });

    it('should mark slow operations', () => {
      const mockInfo = jest.spyOn(logger, 'info');
      
      logPerformanceMetric('slow_operation', 1500);
      
      expect(mockInfo).toHaveBeenCalledWith('Performance Metric', {
        operation: 'slow_operation',
        duration: '1500ms',
        slow: true,
        timestamp: expect.any(String),
      });
    });
  });

  describe('logRateLimitEvent', () => {
    it('should log rate limit event', () => {
      const mockWarn = jest.spyOn(logger, 'warn');
      const resetTime = new Date();
      
      logRateLimitEvent('user123', 'api_call', 100, 95, resetTime);
      
      expect(mockWarn).toHaveBeenCalledWith('Rate Limit Event', {
        identifier: 'user123',
        action: 'api_call',
        limit: 100,
        current: 95,
        resetTime: resetTime.toISOString(),
        exceeded: false,
        timestamp: expect.any(String),
      });
    });

    it('should mark exceeded rate limits', () => {
      const mockWarn = jest.spyOn(logger, 'warn');
      
      logRateLimitEvent('user123', 'api_call', 100, 100);
      
      expect(mockWarn).toHaveBeenCalledWith('Rate Limit Event', {
        identifier: 'user123',
        action: 'api_call',
        limit: 100,
        current: 100,
        resetTime: undefined,
        exceeded: true,
        timestamp: expect.any(String),
      });
    });
  });

  describe('logBusinessEvent', () => {
    it('should log business event', () => {
      const mockInfo = jest.spyOn(logger, 'info');
      
      logBusinessEvent('user_signup', 'user123', { plan: 'pro' });
      
      expect(mockInfo).toHaveBeenCalledWith('Business Event', {
        event: 'user_signup',
        userId: 'user123',
        timestamp: expect.any(String),
        plan: 'pro',
      });
    });
  });

  describe('createChildLogger', () => {
    it('should create child logger with context', () => {
      const mockChild = jest.spyOn(logger, 'child');
      
      createChildLogger({ requestId: 'req123' });
      
      expect(mockChild).toHaveBeenCalledWith({ requestId: 'req123' });
    });
  });

  describe('createRequestLogger', () => {
    it('should create request logger', () => {
      const mockChild = jest.spyOn(logger, 'child');
      
      createRequestLogger('req123');
      
      expect(mockChild).toHaveBeenCalledWith({ requestId: 'req123' });
    });
  });
});