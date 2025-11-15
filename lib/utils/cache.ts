/**
 * Simple in-memory cache with TTL support
 * For production, consider using Redis or a distributed cache
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
}

class Cache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl ?? 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize ?? 1000,
    };
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.options.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const now = Date.now();
    const expiresAt = now + (ttl ?? this.options.ttl);

    this.cache.set(key, {
      data: value,
      expiresAt,
      createdAt: now,
    });
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Get cache statistics
   */
  stats(): {
    size: number;
    maxSize: number;
    entries: Array<{
      key: string;
      age: number;
      expiresIn: number;
    }>;
  } {
    const now = Date.now();
    const entries: Array<{ key: string; age: number; expiresIn: number }> = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now <= entry.expiresAt) {
        entries.push({
          key,
          age: now - entry.createdAt,
          expiresIn: entry.expiresAt - now,
        });
      }
    }

    return {
      size: entries.length,
      maxSize: this.options.maxSize,
      entries,
    };
  }
}

// Default cache instance
export const defaultCache = new Cache();

// Specialized cache instances
export const modelSelectionCache = new Cache<{ model: string; score: number; reason: string }>({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 500,
});

export const analyticsCache = new Cache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 200,
});

export const apiResponseCache = new Cache({
  ttl: 2 * 60 * 1000, // 2 minutes
  maxSize: 1000,
});

/**
 * Cache decorator for functions
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    cache?: Cache<Awaited<ReturnType<T>>>;
    keyGenerator?: (...args: Parameters<T>) => string;
    ttl?: number;
  }
): T {
  const cache = options?.cache ?? defaultCache;
  const keyGenerator =
    options?.keyGenerator ??
    ((...args: Parameters<T>) => `${fn.name}:${JSON.stringify(args)}`);

  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const cached = cache.get(key);

    if (cached !== null) {
      return cached;
    }

    const result = await fn(...args);
    cache.set(key, result, options?.ttl);

    return result;
  }) as T;
}

/**
 * Create cache key from parameters
 */
export function createCacheKey(prefix: string, ...parts: (string | number | boolean | null | undefined)[]): string {
  const cleanParts = parts
    .filter((part) => part !== null && part !== undefined)
    .map((part) => String(part));
  return `${prefix}:${cleanParts.join(":")}`;
}

// Periodic cleanup (every 5 minutes)
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    defaultCache.cleanup();
    modelSelectionCache.cleanup();
    analyticsCache.cleanup();
    apiResponseCache.cleanup();
  }, 5 * 60 * 1000);
}

export default Cache;

