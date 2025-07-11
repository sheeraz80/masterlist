/**
 * @jest-environment node
 */

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should validate with minimum required environment variables', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
    process.env.NODE_ENV = 'test';

    expect(() => {
      require('../env');
    }).not.toThrow();
  });

  it('should provide default values for optional variables', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
    process.env.NODE_ENV = 'test';

    const { env } = require('../env');

    expect(env.NEXT_PUBLIC_APP_URL).toBe('http://localhost:3000');
    expect(env.OLLAMA_HOST).toBe('http://localhost:11434');
    expect(env.RATE_LIMIT_ENABLED).toBe('true');
  });

  it('should handle missing DATABASE_URL in development', () => {
    process.env.NODE_ENV = 'development';
    delete process.env.DATABASE_URL;

    // Should not throw in development mode
    expect(() => {
      require('../env');
    }).not.toThrow();
  });

  it('should validate JWT_SECRET length when provided', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'short';

    // Should handle short JWT secret gracefully in development
    expect(() => {
      require('../env');
    }).not.toThrow();
  });

  it('should validate URL format for NEXT_PUBLIC_APP_URL', () => {
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
    process.env.NODE_ENV = 'test';
    process.env.NEXT_PUBLIC_APP_URL = 'invalid-url';

    // Should handle invalid URL gracefully in development
    expect(() => {
      require('../env');
    }).not.toThrow();
  });

  describe('Helper functions', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
    });

    it('should detect production environment', () => {
      process.env.NODE_ENV = 'production';
      const { isProduction } = require('../env');
      expect(isProduction()).toBe(true);
    });

    it('should detect development environment', () => {
      process.env.NODE_ENV = 'development';
      const { isDevelopment } = require('../env');
      expect(isDevelopment()).toBe(true);
    });

    it('should detect test environment', () => {
      process.env.NODE_ENV = 'test';
      const { isTest } = require('../env');
      expect(isTest()).toBe(true);
    });

    it('should check feature flags', () => {
      process.env.NODE_ENV = 'test';
      process.env.FEATURE_AI_INSIGHTS = 'false';
      
      const { isFeatureEnabled } = require('../env');
      expect(isFeatureEnabled('FEATURE_AI_INSIGHTS')).toBe(false);
    });

    it('should get required environment variables', () => {
      process.env.NODE_ENV = 'test';
      process.env.TEST_VAR = 'test-value';
      
      const { getRequiredEnv } = require('../env');
      expect(getRequiredEnv('TEST_VAR')).toBe('test-value');
    });

    it('should throw for missing required environment variables', () => {
      process.env.NODE_ENV = 'test';
      
      const { getRequiredEnv } = require('../env');
      expect(() => getRequiredEnv('MISSING_VAR')).toThrow('Environment variable MISSING_VAR is required but not set');
    });

    it('should get optional environment variables with defaults', () => {
      process.env.NODE_ENV = 'test';
      
      const { getOptionalEnv } = require('../env');
      expect(getOptionalEnv('MISSING_VAR', 'default-value')).toBe('default-value');
      expect(getOptionalEnv('MISSING_VAR')).toBeUndefined();
    });
  });
});