// Simple in-memory cache implementation
// For production, consider using Redis or similar

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Create global cache instance
const cache = new MemoryCache();

// Run cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

export { cache };

// Helper functions for common cache patterns
export function cacheKey(...parts: (string | number)[]): string {
  return parts.join(':');
}

export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const result = await fetcher();
  cache.set(key, result, ttlSeconds);
  return result;
}

export function invalidatePattern(pattern: string): void {
  const keys = cache.keys();
  const regex = new RegExp(pattern);
  
  for (const key of keys) {
    if (regex.test(key)) {
      cache.delete(key);
    }
  }
}

// Specialized cache instances for different data types
export const projectCache = {
  get: (key: string) => cache.get(`project:${key}`),
  set: (key: string, value: any, ttl = 300) => cache.set(`project:${key}`, value, ttl),
  delete: (key: string) => cache.delete(`project:${key}`),
  invalidateAll: () => invalidatePattern('^project:'),
  
  // Project list caching
  getProjectList: (params: any) => {
    const key = `project:list:${JSON.stringify(params)}`;
    return cache.get(key);
  },
  setProjectList: (params: any, value: any, ttl = 300) => {
    const key = `project:list:${JSON.stringify(params)}`;
    cache.set(key, value, ttl);
  },
  invalidateProject: (projectId: string) => {
    cache.delete(`project:${projectId}`);
    invalidatePattern('^project:list:');
  },
};

export const statsCache = {
  get: (key: string) => cache.get(`stats:${key}`),
  set: (key: string, value: any, ttl = 600) => cache.set(`stats:${key}`, value, ttl),
  delete: (key: string) => cache.delete(`stats:${key}`),
  invalidateAll: () => invalidatePattern('^stats:'),
  
  // Stats caching
  getStats: () => cache.get('stats:main'),
  setStats: (value: any, ttl = 600) => cache.set('stats:main', value, ttl),
  invalidateStats: () => cache.delete('stats:main'),
};