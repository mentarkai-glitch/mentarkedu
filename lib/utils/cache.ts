/**
 * Simple in-memory cache utility
 * For production, replace with Redis
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
}

export const cache = new SimpleCache();

/**
 * Cache key generators
 */
export const cacheKeys = {
  student: (studentId: string) => `student:${studentId}`,
  students: (filters: string) => `students:${filters}`,
  teachers: (filters: string) => `teachers:${filters}`,
  arks: (studentId: string) => `arks:${studentId}`,
  ark: (arkId: string) => `ark:${arkId}`,
  analytics: (type: string, params: string) => `analytics:${type}:${params}`,
  recommendations: (studentId: string) => `recommendations:${studentId}`,
};
