/**
 * Usage Tracker for AI Orchestration
 * 
 * This module tracks AI model usage, costs, and performance metrics
 * for intelligent optimization and cost management.
 */

import type { AITask, AIModel } from '@/lib/types';

// Lazy import to avoid importing next/headers in client components
async function getSupabaseClient() {
  const { createClient } = await import('@/lib/supabase/server');
  return createClient();
}

export interface UsageRecord {
  timestamp: Date;
  model: AIModel;
  task: AITask;
  tokensUsed: number;
  cost: number;
  duration: number; // milliseconds
  success: boolean;
  quality?: number; // 0-10
  usedFallback?: boolean;
  originalModel?: AIModel;
  userId?: string;
  complexityScore?: number;
  emotionalContentScore?: number;
  selectionReason?: string;
}

export interface ModelPerformanceStats {
  avgDuration: number;
  avgQuality: number;
  successRate: number;
  totalCost: number;
  totalTokens: number;
  fallbackRate: number;
  totalRequests: number;
}

export interface CostAnalytics {
  dailyCost: number;
  weeklyCost: number;
  monthlyCost: number;
  costByModel: Record<string, number>;
  costByTask: Record<string, number>;
  costByUser: Record<string, number>;
  avgCostPerRequest: number;
  costTrend: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Track AI model usage and store in database
 */
export async function trackUsage(record: Omit<UsageRecord, 'timestamp' | 'cost'>): Promise<void> {
  try {
    const supabase = await getSupabaseClient();
    
    // Calculate cost based on model and tokens
    const cost = calculateCost(record.model, record.tokensUsed);
    
    const usageRecord: UsageRecord = {
      ...record,
      timestamp: new Date(),
      cost
    };
    
    // Skip tracking if user_id is not a valid UUID (e.g., 'anonymous')
    const isValidUUID = usageRecord.userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(usageRecord.userId);
    
    // Insert into database (only include user_id if it's a valid UUID)
    const insertData: any = {
      model: usageRecord.model,
      task: usageRecord.task,
      tokens_used: usageRecord.tokensUsed,
      cost: usageRecord.cost,
      duration: usageRecord.duration,
      success: usageRecord.success,
      quality_score: usageRecord.quality,
      used_fallback: usageRecord.usedFallback,
      original_model: usageRecord.originalModel,
      complexity_score: usageRecord.complexityScore,
      emotional_content_score: usageRecord.emotionalContentScore,
      selection_reason: usageRecord.selectionReason
    };
    
    // Only add user_id if it's a valid UUID
    if (isValidUUID) {
      insertData.user_id = usageRecord.userId;
    }
    
    const { error } = await supabase.from('ai_usage_logs').insert(insertData);
    
    if (error) {
      console.error('Failed to track usage:', error);
    } else {
      console.log(`📊 Usage tracked: ${record.model} - ${record.task} - $${cost.toFixed(6)}`);
    }
    
    // Update real-time metrics
    await updateModelMetrics(usageRecord);
    
  } catch (error) {
    console.error('Error tracking usage:', error);
  }
}

/**
 * Get model performance statistics
 */
export async function getModelPerformanceStats(
  model: AIModel, 
  task?: AITask,
  timeWindow: 'hour' | 'day' | 'week' | 'month' = 'day'
): Promise<ModelPerformanceStats | null> {
  try {
    const supabase = await getSupabaseClient();
    
    // Calculate time window
    const timeWindowMs = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };
    
    const since = new Date(Date.now() - timeWindowMs[timeWindow]);
    
    let query = supabase
      .from('ai_usage_logs')
      .select('*')
      .eq('model', model)
      .gte('timestamp', since.toISOString());
    
    if (task) {
      query = query.eq('task', task);
    }
    
    const { data, error } = await query.order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Failed to get performance stats:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return null;
    }
    
    const stats: ModelPerformanceStats = {
      avgDuration: data.reduce((sum, r) => sum + r.duration, 0) / data.length,
      avgQuality: data.reduce((sum, r) => sum + (r.quality_score || 0), 0) / data.length,
      successRate: data.filter(r => r.success).length / data.length * 100,
      totalCost: data.reduce((sum, r) => sum + parseFloat(r.cost), 0),
      totalTokens: data.reduce((sum, r) => sum + r.tokens_used, 0),
      fallbackRate: data.filter(r => r.used_fallback).length / data.length * 100,
      totalRequests: data.length
    };
    
    return stats;
    
  } catch (error) {
    console.error('Error getting performance stats:', error);
    return null;
  }
}

/**
 * Get cost analytics for a given time period
 */
export async function getCostAnalytics(
  timeWindow: 'day' | 'week' | 'month' = 'day'
): Promise<CostAnalytics | null> {
  try {
    const supabase = await createClient();
    
    // Calculate time window
    const timeWindowMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };
    
    const since = new Date(Date.now() - timeWindowMs[timeWindow]);
    
    const { data, error } = await supabase
      .from('ai_usage_logs')
      .select('*')
      .gte('timestamp', since.toISOString());
    
    if (error) {
      console.error('Failed to get cost analytics:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return {
        dailyCost: 0,
        weeklyCost: 0,
        monthlyCost: 0,
        costByModel: {},
        costByTask: {},
        costByUser: {},
        avgCostPerRequest: 0,
        costTrend: 'stable'
      };
    }
    
    // Calculate analytics
    const totalCost = data.reduce((sum, r) => sum + parseFloat(r.cost), 0);
    const costByModel: Record<string, number> = {};
    const costByTask: Record<string, number> = {};
    const costByUser: Record<string, number> = {};
    
    data.forEach(record => {
      // Cost by model
      costByModel[record.model] = (costByModel[record.model] || 0) + parseFloat(record.cost);
      
      // Cost by task
      costByTask[record.task] = (costByTask[record.task] || 0) + parseFloat(record.cost);
      
      // Cost by user
      if (record.user_id) {
        costByUser[record.user_id] = (costByUser[record.user_id] || 0) + parseFloat(record.cost);
      }
    });
    
    // Calculate trend (compare with previous period)
    const previousSince = new Date(Date.now() - timeWindowMs[timeWindow] * 2);
    const { data: previousData } = await supabase
      .from('ai_usage_logs')
      .select('cost')
      .gte('timestamp', previousSince.toISOString())
      .lt('timestamp', since.toISOString());
    
    const previousCost = previousData?.reduce((sum, r) => sum + parseFloat(r.cost), 0) || 0;
    const costTrend: 'increasing' | 'decreasing' | 'stable' = 
      totalCost > previousCost * 1.1 ? 'increasing' :
      totalCost < previousCost * 0.9 ? 'decreasing' : 'stable';
    
    return {
      dailyCost: timeWindow === 'day' ? totalCost : 0,
      weeklyCost: timeWindow === 'week' ? totalCost : 0,
      monthlyCost: timeWindow === 'month' ? totalCost : 0,
      costByModel,
      costByTask,
      costByUser,
      avgCostPerRequest: totalCost / data.length,
      costTrend
    };
    
  } catch (error) {
    console.error('Error getting cost analytics:', error);
    return null;
  }
}

/**
 * Get usage statistics for a specific user
 */
export async function getUserUsageStats(userId: string, timeWindow: 'day' | 'week' | 'month' = 'day'): Promise<{
  totalRequests: number;
  totalCost: number;
  totalTokens: number;
  modelsUsed: Record<string, number>;
  tasksUsed: Record<string, number>;
  avgResponseTime: number;
  successRate: number;
} | null> {
  try {
    const supabase = await createClient();
    
    // Calculate time window
    const timeWindowMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };
    
    const since = new Date(Date.now() - timeWindowMs[timeWindow]);
    
    const { data, error } = await supabase
      .from('ai_usage_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', since.toISOString());
    
    if (error) {
      console.error('Failed to get user usage stats:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return {
        totalRequests: 0,
        totalCost: 0,
        totalTokens: 0,
        modelsUsed: {},
        tasksUsed: {},
        avgResponseTime: 0,
        successRate: 0
      };
    }
    
    const totalCost = data.reduce((sum, r) => sum + parseFloat(r.cost), 0);
    const totalTokens = data.reduce((sum, r) => sum + r.tokens_used, 0);
    const avgResponseTime = data.reduce((sum, r) => sum + r.duration, 0) / data.length;
    const successRate = data.filter(r => r.success).length / data.length * 100;
    
    const modelsUsed: Record<string, number> = {};
    const tasksUsed: Record<string, number> = {};
    
    data.forEach(record => {
      modelsUsed[record.model] = (modelsUsed[record.model] || 0) + 1;
      tasksUsed[record.task] = (tasksUsed[record.task] || 0) + 1;
    });
    
    return {
      totalRequests: data.length,
      totalCost,
      totalTokens,
      modelsUsed,
      tasksUsed,
      avgResponseTime,
      successRate
    };
    
  } catch (error) {
    console.error('Error getting user usage stats:', error);
    return null;
  }
}

/**
 * Check if user has exceeded their usage limits
 */
export async function checkUsageLimits(userId: string, userTier: 'free' | 'premium' | 'enterprise'): Promise<{
  exceeded: boolean;
  limit: number;
  used: number;
  remaining: number;
  resetTime: Date;
}> {
  try {
    const limits = {
      free: { requests: 100, cost: 5.0 }, // 100 requests or $5 per day
      premium: { requests: 1000, cost: 50.0 }, // 1000 requests or $50 per day
      enterprise: { requests: 10000, cost: 500.0 } // 10000 requests or $500 per day
    };
    
    const limit = limits[userTier];
    
    // Get today's usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('ai_usage_logs')
      .select('tokens_used, cost')
      .eq('user_id', userId)
      .gte('timestamp', today.toISOString());
    
    if (error) {
      console.error('Failed to check usage limits:', error);
      return {
        exceeded: false,
        limit: limit.requests,
        used: 0,
        remaining: limit.requests,
        resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };
    }
    
    const usedRequests = data?.length || 0;
    const usedCost = data?.reduce((sum, r) => sum + parseFloat(r.cost), 0) || 0;
    
    const exceeded = usedRequests >= limit.requests || usedCost >= limit.cost;
    const remaining = Math.min(limit.requests - usedRequests, Math.floor((limit.cost - usedCost) / 0.01)); // Rough estimate
    
    return {
      exceeded,
      limit: limit.requests,
      used: usedRequests,
      remaining: Math.max(0, remaining),
      resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    };
    
  } catch (error) {
    console.error('Error checking usage limits:', error);
    return {
      exceeded: false,
      limit: 100,
      used: 0,
      remaining: 100,
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }
}

/**
 * Calculate cost for a given model and token count
 */
function calculateCost(model: AIModel, tokens: number): number {
  // Model cost per token (in USD)
  const modelCosts: Record<AIModel, number> = {
    'gpt-4o': 0.000005,
    'o1-preview': 0.000015,
    'o1-mini': 0.000003,
    'claude-opus': 0.000015,
    'claude-sonnet': 0.000003,
    'gemini-pro': 0.0000025,
    'gemini-2.5-flash': 0.0000015, // Ultra cost-effective
    'gpt-4o-mini': 0.00000015,
    'mistral-large': 0.000008,
    'llama-3.1': 0.000005,
    'cohere-command-r-plus': 0.000005,
    'cohere-command-r': 0.000003,
        'hume-emotional-analysis': 0.000007,
        'perplexity-pro': 0.000005, // Sonar Pro cost (Deep Research is higher)
        'deepl-translation': 0.000002
  };
  
  const costPerToken = modelCosts[model] || 0.000005; // Default to GPT-4o cost
  return costPerToken * tokens;
}

/**
 * Update model metrics in real-time
 */
async function updateModelMetrics(record: UsageRecord): Promise<void> {
  try {
    const supabase = await createClient();
    
    // Update performance metrics
    await supabase.from('performance_metrics').insert({
      model: record.model,
      task: record.task,
      metric_type: 'response_time',
      metric_value: record.duration,
      sample_size: 1,
      time_window: 'hour'
    });
    
    await supabase.from('performance_metrics').insert({
      model: record.model,
      task: record.task,
      metric_type: 'success_rate',
      metric_value: record.success ? 100 : 0,
      sample_size: 1,
      time_window: 'hour'
    });
    
    if (record.quality) {
      await supabase.from('performance_metrics').insert({
        model: record.model,
        task: record.task,
        metric_type: 'quality',
        metric_value: record.quality,
        sample_size: 1,
        time_window: 'hour'
      });
    }
    
  } catch (error) {
    console.error('Error updating model metrics:', error);
  }
}

/**
 * Get top performing models for a specific task
 */
export async function getTopModelsForTask(task: AITask, limit: number = 3): Promise<Array<{
  model: AIModel;
  score: number;
  avgResponseTime: number;
  successRate: number;
  avgQuality: number;
  totalCost: number;
}>> {
  try {
    const supabase = await createClient();
    
    // Get performance data for the last 7 days
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const { data, error } = await supabase
      .from('ai_usage_logs')
      .select('model, duration, success, quality_score, cost, tokens_used')
      .eq('task', task)
      .gte('timestamp', since.toISOString());
    
    if (error || !data) {
      return [];
    }
    
    // Group by model and calculate metrics
    const modelStats: Record<string, {
      requests: number;
      totalDuration: number;
      successes: number;
      totalQuality: number;
      totalCost: number;
      totalTokens: number;
    }> = {};
    
    data.forEach(record => {
      if (!modelStats[record.model]) {
        modelStats[record.model] = {
          requests: 0,
          totalDuration: 0,
          successes: 0,
          totalQuality: 0,
          totalCost: 0,
          totalTokens: 0
        };
      }
      
      const stats = modelStats[record.model];
      stats.requests++;
      stats.totalDuration += record.duration;
      stats.totalCost += parseFloat(record.cost);
      stats.totalTokens += record.tokens_used;
      
      if (record.success) {
        stats.successes++;
      }
      
      if (record.quality_score) {
        stats.totalQuality += record.quality_score;
      }
    });
    
    // Calculate scores and sort
    const modelScores = Object.entries(modelStats).map(([model, stats]) => {
      const avgResponseTime = stats.totalDuration / stats.requests;
      const successRate = stats.successes / stats.requests * 100;
      const avgQuality = stats.totalQuality / stats.requests;
      
      // Calculate composite score (higher is better)
      const score = (successRate * 0.4) + (avgQuality * 0.3) + (Math.max(0, 100 - avgResponseTime / 10) * 0.3);
      
      return {
        model: model as AIModel,
        score,
        avgResponseTime,
        successRate,
        avgQuality,
        totalCost: stats.totalCost
      };
    });
    
    return modelScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
  } catch (error) {
    console.error('Error getting top models for task:', error);
    return [];
  }
}

/**
 * Clean up old usage logs (keep only last 30 days)
 */
export async function cleanupOldLogs(): Promise<void> {
  try {
    const supabase = await createClient();
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const { error } = await supabase
      .from('ai_usage_logs')
      .delete()
      .lt('timestamp', cutoffDate.toISOString());
    
    if (error) {
      console.error('Failed to cleanup old logs:', error);
    } else {
      console.log('🧹 Cleaned up old usage logs');
    }
    
  } catch (error) {
    console.error('Error cleaning up old logs:', error);
  }
}
