import { NextRequest, NextResponse } from 'next/server';
import { redisService } from '@/lib/services/redis';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model') || 'all';
    const date = searchParams.get('date');
    const endpoint = searchParams.get('endpoint') || 'analytics';

    let data;

    switch (endpoint) {
      case 'analytics':
        if (model === 'all') {
          // Get analytics for all models
          const models = ['gpt-4o', 'claude-opus', 'claude-sonnet', 'gemini-pro', 'perplexity-pro', 'cohere-command-r-plus'];
          const analytics = await Promise.all(
            models.map(async (m) => ({
              model: m,
              data: await redisService.getAnalytics(m, date || undefined)
            }))
          );
          data = analytics.filter(a => a.data !== null);
        } else {
          data = await redisService.getAnalytics(model, date || undefined);
        }
        break;

      case 'cache-stats':
        // Get cache statistics
        data = {
          cacheHitRate: await getCacheHitRate(),
          totalCachedResponses: await getTotalCachedResponses(),
          cacheSize: await getCacheSize()
        };
        break;

      case 'rate-limits':
        // Get rate limit statistics
        data = await getRateLimitStats();
        break;

      case 'sessions':
        // Get active session statistics
        data = await getSessionStats();
        break;

      case 'health':
        // Redis health check
        data = {
          healthy: await redisService.healthCheck(),
          timestamp: Date.now()
        };
        break;

      default:
        return errorResponse('Invalid endpoint', 400);
    }

    return successResponse(data);

  } catch (error) {
    return handleApiError(error);
  }
}

// Helper functions for analytics
async function getCacheHitRate(): Promise<number> {
  try {
    // This would need to be implemented based on your specific metrics
    // For now, return a mock value
    return 0.75; // 75% cache hit rate
  } catch (error) {
    console.error('Error getting cache hit rate:', error);
    return 0;
  }
}

async function getTotalCachedResponses(): Promise<number> {
  try {
    // Count total cached responses
    const redis = redisService.getRedisInstance();
    const keys = await redis.keys('ai_response:*');
    return keys.length;
  } catch (error) {
    console.error('Error getting total cached responses:', error);
    return 0;
  }
}

async function getCacheSize(): Promise<string> {
  try {
    // Get approximate cache size in MB
    const redis = redisService.getRedisInstance();
    const info = await redis.info('memory');
    // Parse memory info to get used memory
    const usedMemory = info.match(/used_memory:(\d+)/)?.[1] || '0';
    const sizeInMB = Math.round(parseInt(usedMemory) / 1024 / 1024);
    return `${sizeInMB} MB`;
  } catch (error) {
    console.error('Error getting cache size:', error);
    return 'Unknown';
  }
}

async function getRateLimitStats(): Promise<any> {
  try {
    const redis = redisService.getRedisInstance();
    const rateLimitKeys = await redis.keys('rate_limit:*');
    
    const stats = {
      totalRateLimitedUsers: rateLimitKeys.length,
      activeRateLimits: 0,
      rateLimitBreakdown: {} as Record<string, number>
    };

    for (const key of rateLimitKeys) {
      const count = await redis.get(key);
      if (count && parseInt(count as string) > 0) {
        stats.activeRateLimits++;
        
        // Parse endpoint from key
        const endpoint = key.split(':').pop();
        if (endpoint) {
          stats.rateLimitBreakdown[endpoint] = (stats.rateLimitBreakdown[endpoint] || 0) + 1;
        }
      }
    }

    return stats;
  } catch (error) {
    console.error('Error getting rate limit stats:', error);
    return { totalRateLimitedUsers: 0, activeRateLimits: 0, rateLimitBreakdown: {} };
  }
}

async function getSessionStats(): Promise<any> {
  try {
    const redis = redisService.getRedisInstance();
    const sessionKeys = await redis.keys('session:*');
    const userSessionKeys = await redis.keys('user_sessions:*');
    
    return {
      totalActiveSessions: sessionKeys.length,
      totalUsersWithSessions: userSessionKeys.length,
      averageSessionsPerUser: userSessionKeys.length > 0 ? Math.round(sessionKeys.length / userSessionKeys.length * 100) / 100 : 0
    };
  } catch (error) {
    console.error('Error getting session stats:', error);
    return { totalActiveSessions: 0, totalUsersWithSessions: 0, averageSessionsPerUser: 0 };
  }
}

// POST endpoint for cache operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'invalidate-cache':
        const { tags } = data;
        await redisService.invalidateCacheByTags(tags);
        return successResponse({ message: 'Cache invalidated successfully' });

      case 'clear-user-cache':
        const { userId } = data;
        // Clear all cache entries for a specific user
        const redis = redisService.getRedisInstance();
        const userCacheKeys = await redis.keys(`*:${userId}:*`);
        if (userCacheKeys.length > 0) {
          await redis.del(...userCacheKeys);
        }
        return successResponse({ message: 'User cache cleared successfully' });

      case 'clear-all-cache':
        // Clear all AI response cache
        const allCacheKeys = await redis.keys('ai_response:*');
        if (allCacheKeys.length > 0) {
          await redis.del(...allCacheKeys);
        }
        return successResponse({ message: 'All cache cleared successfully' });

      default:
        return errorResponse('Invalid action', 400);
    }

  } catch (error) {
    return handleApiError(error);
  }
}


