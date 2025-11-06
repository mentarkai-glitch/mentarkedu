import { Redis } from '@upstash/redis';

// Initialize Redis client with fallback
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (error) {
  console.warn('Redis client initialization failed:', error);
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

export interface SessionData {
  userId: string;
  sessionId: string;
  context: any;
  timestamp: number;
  lastActivity: number;
}

export interface AIResponseCache {
  prompt: string;
  response: string;
  model: string;
  tokens: number;
  timestamp: number;
  userTier: string;
  taskType: string;
}

export interface RateLimitData {
  requests: number;
  resetTime: number;
  limit: number;
}

export interface AnalyticsData {
  requests: number;
  tokensUsed: number;
  cost: number;
  avgResponseTime: number;
  successRate: number;
  timestamp: number;
}

class RedisService {
  /**
   * Get Redis instance, return null if not available
   */
  getRedisInstance(): Redis | null {
    return redis;
  }

  /**
   * Cache AI responses with intelligent key generation
   */
  async cacheAIResponse(
    prompt: string,
    response: AIResponseCache,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const redisInstance = this.getRedisInstance();
      if (!redisInstance) {
        console.warn('Redis not available, skipping cache');
        return;
      }

      // Generate cache key based on prompt hash and context
      const cacheKey = this.generateAIResponseKey(prompt, response.userTier, response.taskType);
      
      // Set cache with TTL (default 1 hour)
      const ttl = options.ttl || 3600;
      await redisInstance.setex(cacheKey, ttl, JSON.stringify(response));
      
      // Add to cache tags for bulk operations
      if (options.tags) {
        for (const tag of options.tags) {
          await redisInstance.sadd(`cache_tags:${tag}`, cacheKey);
        }
      }
    } catch (error) {
      console.error('Error caching AI response:', error);
    }
  }

  /**
   * Get cached AI response
   */
  async getCachedAIResponse(
    prompt: string,
    userTier: string,
    taskType: string
  ): Promise<AIResponseCache | null> {
    const redisInstance = this.getRedisInstance();
    if (!redisInstance) {
      return null;
    }
    
    try {
      const cacheKey = this.generateAIResponseKey(prompt, userTier, taskType);
      const cached = await redisInstance.get(cacheKey);
      
      if (cached) {
        // Handle both string and already-parsed objects
        if (typeof cached === 'string') {
          return JSON.parse(cached) as AIResponseCache;
        }
        // If it's already an object, return it directly with type assertion
        return cached as AIResponseCache;
      }
      return null;
    } catch (error) {
      console.error('Error getting cached AI response:', error);
      return null;
    }
  }

  /**
   * Store session data
   */
  async storeSession(sessionData: SessionData, ttl: number = 3600): Promise<void> {
    const redisInstance = this.getRedisInstance();
    if (!redisInstance) return;
    
    try {
      const sessionKey = `session:${sessionData.userId}:${sessionData.sessionId}`;
      await redisInstance.setex(sessionKey, ttl, JSON.stringify(sessionData));
      
      // Also store user's active sessions
      await redisInstance.sadd(`user_sessions:${sessionData.userId}`, sessionData.sessionId);
      await redisInstance.expire(`user_sessions:${sessionData.userId}`, ttl);
    } catch (error) {
      console.error('Error storing session:', error);
    }
  }

  /**
   * Get session data
   */
  async getSession(userId: string, sessionId: string): Promise<SessionData | null> {
    const redisInstance = this.getRedisInstance();
    if (!redisInstance) return null;
    
    try {
      const sessionKey = `session:${userId}:${sessionId}`;
      const sessionData = await redisInstance.get(sessionKey);
      
      if (sessionData) {
        return JSON.parse(sessionData as string);
      }
      return null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(userId: string, sessionId: string): Promise<void> {
    const redisInstance = this.getRedisInstance();
    if (!redisInstance) return;
    
    try {
      const sessionKey = `session:${userId}:${sessionId}`;
      const sessionData = await this.getSession(userId, sessionId);
      
      if (sessionData) {
        sessionData.lastActivity = Date.now();
        await redisInstance.setex(sessionKey, 3600, JSON.stringify(sessionData));
      }
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }

  /**
   * Rate limiting for API calls
   */
  async checkRateLimit(
    userId: string,
    endpoint: string,
    limit: number = 100,
    window: number = 3600
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const redisInstance = this.getRedisInstance();
    if (!redisInstance) {
      return { allowed: true, remaining: limit, resetTime: Date.now() + (window * 1000) };
    }
    
    try {
      const rateLimitKey = `rate_limit:${userId}:${endpoint}`;
      const current = await redisInstance.get(rateLimitKey);
      
      if (current === null) {
        // First request in window
        await redisInstance.setex(rateLimitKey, window, 1);
        return { allowed: true, remaining: limit - 1, resetTime: Date.now() + (window * 1000) };
      }
      
      const count = parseInt(current as string);
      if (count >= limit) {
        // Rate limit exceeded
        const ttl = await redisInstance.ttl(rateLimitKey);
        return { allowed: false, remaining: 0, resetTime: Date.now() + (ttl * 1000) };
      }
      
      // Increment counter
      await redisInstance.incr(rateLimitKey);
      return { allowed: true, remaining: limit - count - 1, resetTime: Date.now() + (window * 1000) };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return { allowed: true, remaining: limit, resetTime: Date.now() + (window * 1000) };
    }
  }

  /**
   * Store analytics data
   */
  async storeAnalytics(model: string, analytics: AnalyticsData): Promise<void> {
    const redisInstance = this.getRedisInstance();
    if (!redisInstance) return;
    
    try {
      const date = new Date().toISOString().split('T')[0];
      const analyticsKey = `analytics:${model}:${date}`;
      
      // Store daily analytics
      await redisInstance.hincrby(analyticsKey, 'requests', analytics.requests);
      await redisInstance.hincrby(analyticsKey, 'tokensUsed', analytics.tokensUsed);
      await redisInstance.hincrbyfloat(analyticsKey, 'cost', analytics.cost);
      await redisInstance.hincrby(analyticsKey, 'totalResponseTime', analytics.avgResponseTime);
      
      // Set expiration to 30 days
      await redisInstance.expire(analyticsKey, 30 * 24 * 3600);
    } catch (error) {
      console.error('Error storing analytics:', error);
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(model: string, date?: string): Promise<AnalyticsData | null> {
    const redisInstance = this.getRedisInstance();
    if (!redisInstance) return null;
    
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const analyticsKey = `analytics:${model}:${targetDate}`;
      
      const data = await redisInstance.hgetall(analyticsKey);
      
      if (!data || Object.keys(data).length === 0) {
        return null;
      }
      
      return {
        requests: parseInt(data.requests as string) || 0,
        tokensUsed: parseInt(data.tokensUsed as string) || 0,
        cost: parseFloat(data.cost as string) || 0,
        avgResponseTime: parseInt(data.totalResponseTime as string) || 0,
        successRate: parseFloat(data.successRate as string) || 0,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  }

  /**
   * Cache user preferences
   */
  async cacheUserPreferences(userId: string, preferences: any, ttl: number = 86400): Promise<void> {
    const redisInstance = this.getRedisInstance();
    if (!redisInstance) return;
    
    try {
      const preferencesKey = `user_preferences:${userId}`;
      await redisInstance.setex(preferencesKey, ttl, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error caching user preferences:', error);
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<any | null> {
    const redisInstance = this.getRedisInstance();
    if (!redisInstance) return null;
    
    try {
      const preferencesKey = `user_preferences:${userId}`;
      const preferences = await redisInstance.get(preferencesKey);
      
      if (preferences) {
        return JSON.parse(preferences as string);
      }
      return null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateCacheByTags(tags: string[]): Promise<void> {
    const redisInstance = this.getRedisInstance();
    if (!redisInstance) return;
    
    try {
      for (const tag of tags) {
        const keys = await redisInstance.smembers(`cache_tags:${tag}`);
        if (keys.length > 0) {
          await redisInstance.del(...keys);
          await redisInstance.del(`cache_tags:${tag}`);
        }
      }
    } catch (error) {
      console.error('Error invalidating cache by tags:', error);
    }
  }

  /**
   * Generate AI response cache key
   */
  private generateAIResponseKey(prompt: string, userTier: string, taskType: string): string {
    // Create a hash of the prompt for consistent key generation
    const promptHash = this.simpleHash(prompt);
    return `ai_response:${promptHash}:${userTier}:${taskType}`;
  }

  /**
   * Simple hash function for prompt hashing
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<boolean> {
    const redisInstance = this.getRedisInstance();
    if (!redisInstance) return false;
    
    try {
      await redisInstance.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const redisService = new RedisService();
export default redisService;
