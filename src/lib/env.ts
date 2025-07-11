import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Next.js
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').optional(),
  
  // GitHub Integration
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // AI Services
  OPENAI_API_KEY: z.string().optional(),
  OLLAMA_HOST: z.string().default('http://localhost:11434'),
  
  // Optional Services
  REDIS_URL: z.string().optional(),
  WEBHOOK_SECRET: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_ENABLED: z.enum(['true', 'false']).default('true'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  ENABLE_FILE_LOGGING: z.enum(['true', 'false']).default('false'),
  
  // Features
  FEATURE_AI_INSIGHTS: z.enum(['true', 'false']).default('true'),
  FEATURE_GITHUB_INTEGRATION: z.enum(['true', 'false']).default('true'),
  FEATURE_DEPLOYMENTS: z.enum(['true', 'false']).default('true'),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

try {
  env = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  Continuing in development mode with validation errors');
      // Provide fallback values for development
      env = {
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/masterlist',
        NODE_ENV: (process.env.NODE_ENV as any) || 'development',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        JWT_SECRET: process.env.JWT_SECRET,
        GITHUB_TOKEN: process.env.GITHUB_TOKEN,
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://localhost:11434',
        REDIS_URL: process.env.REDIS_URL,
        WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
        SENTRY_DSN: process.env.SENTRY_DSN,
        RATE_LIMIT_ENABLED: (process.env.RATE_LIMIT_ENABLED as any) || 'true',
        LOG_LEVEL: (process.env.LOG_LEVEL as any) || 'info',
        ENABLE_FILE_LOGGING: (process.env.ENABLE_FILE_LOGGING as any) || 'false',
        FEATURE_AI_INSIGHTS: (process.env.FEATURE_AI_INSIGHTS as any) || 'true',
        FEATURE_GITHUB_INTEGRATION: (process.env.FEATURE_GITHUB_INTEGRATION as any) || 'true',
        FEATURE_DEPLOYMENTS: (process.env.FEATURE_DEPLOYMENTS as any) || 'true',
      };
    }
  } else {
    throw error;
  }
}

export { env };

// Helper functions
export const isProduction = () => env.NODE_ENV === 'production';
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isTest = () => env.NODE_ENV === 'test';

export const isFeatureEnabled = (feature: keyof Pick<Env, 'FEATURE_AI_INSIGHTS' | 'FEATURE_GITHUB_INTEGRATION' | 'FEATURE_DEPLOYMENTS'>) => {
  return env[feature] === 'true';
};

export const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
};

export const getOptionalEnv = (key: string, defaultValue?: string): string | undefined => {
  return process.env[key] || defaultValue;
};