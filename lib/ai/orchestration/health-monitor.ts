/**
 * Health Monitor for AI Orchestration
 * 
 * This module monitors the health and performance of AI models
 * to ensure optimal routing and failover capabilities.
 */

import { createClient } from '@/lib/supabase/server';
import type { AIModel } from '@/lib/types';

export interface ModelHealth {
  model: AIModel;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: Date;
  consecutiveFailures: number;
  avgResponseTime: number;
  errorRate: number;
  uptime: number;
  lastError?: string;
}

export interface HealthCheckResult {
  model: AIModel;
  isHealthy: boolean;
  responseTime: number;
  error?: string;
}

const healthCache = new Map<AIModel, ModelHealth>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check the health of a specific AI model
 */
export async function modelHealthCheck(model: AIModel): Promise<boolean> {
  try {
    const cached = healthCache.get(model);
    
    // Check cache first
    if (cached && Date.now() - cached.lastCheck.getTime() < CACHE_DURATION) {
      return cached.status !== 'down';
    }
    
    // Perform health check
    const result = await performHealthCheck(model);
    
    // Update cache
    const health: ModelHealth = {
      model: model,
      status: result.isHealthy ? 'healthy' : 'down',
      lastCheck: new Date(),
      consecutiveFailures: result.isHealthy ? 0 : (cached?.consecutiveFailures || 0) + 1,
      avgResponseTime: result.responseTime,
      errorRate: result.isHealthy ? 0 : 100,
      uptime: result.isHealthy ? 100 : 0,
      lastError: result.error
    };
    
    healthCache.set(model, health);
    
    // Update database
    await updateModelHealthStatus(health);
    
    return result.isHealthy;
    
  } catch (error) {
    console.error(`Health check failed for ${model}:`, error);
    return false;
  }
}

/**
 * Perform actual health check by making a test request
 */
async function performHealthCheck(model: AIModel): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Make a simple test request to the model
    const testPrompt = "Hello, this is a health check. Please respond with 'OK'.";
    
    // Import the model client dynamically
    let response;
    switch (model) {
      case 'gpt-4o':
      case 'gpt-4o-mini':
        const { callGPT4o } = await import('@/lib/ai/models/openai');
        response = await callGPT4o(testPrompt, { model: model });
        break;
        
      case 'claude-opus':
      case 'claude-sonnet':
        const { callClaude } = await import('@/lib/ai/models/claude');
        response = await callClaude(testPrompt, { model: model });
        break;
        
      case 'gemini-pro':
        const { callGemini } = await import('@/lib/ai/models/gemini');
        response = await callGemini(testPrompt);
        break;
        
      case 'o1-preview':
        const { callGPT4o: callO1 } = await import('@/lib/ai/models/openai');
        response = await callO1(testPrompt, { model: 'o1-preview' });
        break;
        
      default:
        throw new Error(`Unknown model type: ${model}`);
    }
    
    const responseTime = Date.now() - startTime;
    
    return {
      model: model,
      isHealthy: true,
      responseTime
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      model: model,
      isHealthy: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update model health status in database
 */
async function updateModelHealthStatus(health: ModelHealth): Promise<void> {
  try {
    const supabase = await createClient();
    
    await supabase.from('model_health_status').upsert({
      model: health.model,
      status: health.status,
      uptime_percentage: health.uptime,
      avg_response_time: health.avgResponseTime,
      error_rate: health.errorRate,
      last_check: health.lastCheck.toISOString(),
      consecutive_failures: health.consecutiveFailures,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'model'
    });
    
  } catch (error) {
    console.error('Failed to update model health status:', error);
  }
}

/**
 * Get model health status from database
 */
export async function getModelHealthStatus(model: AIModel): Promise<ModelHealth | null> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('model_health_status')
      .select('*')
      .eq('model', model)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return {
      model: data.model,
      status: data.status,
      lastCheck: new Date(data.last_check),
      consecutiveFailures: data.consecutive_failures,
      avgResponseTime: data.avg_response_time,
      errorRate: data.error_rate,
      uptime: data.uptime_percentage
    };
    
  } catch (error) {
    console.error('Failed to get model health status:', error);
    return null;
  }
}

/**
 * Get health status for all models
 */
export async function getAllModelHealthStatus(): Promise<ModelHealth[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('model_health_status')
      .select('*')
      .order('model');
    
    if (error || !data) {
      return [];
    }
    
    return data.map(record => ({
      model: record.model,
      status: record.status,
      lastCheck: new Date(record.last_check),
      consecutiveFailures: record.consecutive_failures,
      avgResponseTime: record.avg_response_time,
      errorRate: record.error_rate,
      uptime: record.uptime_percentage
    }));
    
  } catch (error) {
    console.error('Failed to get all model health status:', error);
    return [];
  }
}

/**
 * Run health checks for all models
 */
export async function runHealthChecks(): Promise<HealthCheckResult[]> {
  const models: AIModel[] = [
    'gpt-4o',
    'o1-preview',
    'claude-opus',
    'gemini-pro',
    'claude-sonnet',
    'gpt-4o-mini',
    'mistral-large',
    'llama-3.1'
  ];
  
  const results: HealthCheckResult[] = [];
  
  for (const model of models) {
    try {
      const result = await performHealthCheck(model);
      results.push(result);
      
      console.log(`🏥 Health Check: ${model} - ${result.isHealthy ? '✅' : '❌'} (${result.responseTime}ms)`);
      
      if (!result.isHealthy) {
        console.warn(`⚠️ Model ${model} is unhealthy: ${result.error}`);
      }
      
    } catch (error) {
      console.error(`Health check failed for ${model}:`, error);
      results.push({
        model: model,
        isHealthy: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}

/**
 * Check if a model should be excluded due to poor health
 */
export async function shouldExcludeModel(model: AIModel): Promise<boolean> {
  try {
    const health = await getModelHealthStatus(model);
    
    if (!health) {
      return false; // No health data, assume healthy
    }
    
    // Exclude if status is down
    if (health.status === 'down') {
      return true;
    }
    
    // Exclude if too many consecutive failures
    if (health.consecutiveFailures >= 3) {
      return true;
    }
    
    // Exclude if error rate is too high
    if (health.errorRate > 50) {
      return true;
    }
    
    // Exclude if response time is too slow
    if (health.avgResponseTime > 10000) { // 10 seconds
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error('Error checking if model should be excluded:', error);
    return false;
  }
}

/**
 * Get healthy models for a specific task
 */
export async function getHealthyModelsForTask(task: string): Promise<AIModel[]> {
  try {
    const supabase = await createClient();
    
    // Get models that are healthy and suitable for the task
    const { data, error } = await supabase
      .from('model_health_status')
      .select(`
        model,
        status,
        consecutive_failures,
        error_rate,
        avg_response_time,
        model_capabilities!inner(strengths)
      `)
      .eq('status', 'healthy')
      .lt('consecutive_failures', 3)
      .lt('error_rate', 50)
      .lt('avg_response_time', 10000);
    
    if (error || !data) {
      return [];
    }
    
    // Filter by task suitability
    const suitableModels = data.filter(record => {
      // Handle model_capabilities as array (Supabase join type inference)
      const capabilities = Array.isArray(record.model_capabilities) 
        ? record.model_capabilities[0] 
        : record.model_capabilities;
      return capabilities?.strengths?.includes(task);
    });
    
    return suitableModels.map(record => record.model as AIModel);
    
  } catch (error) {
    console.error('Error getting healthy models for task:', error);
    return [];
  }
}

/**
 * Schedule regular health checks
 */
export function scheduleHealthChecks(intervalMs: number = 5 * 60 * 1000): void {
  console.log(`🕐 Scheduling health checks every ${intervalMs / 1000 / 60} minutes`);
  
  setInterval(async () => {
    try {
      await runHealthChecks();
    } catch (error) {
      console.error('Scheduled health check failed:', error);
    }
  }, intervalMs);
}

/**
 * Get health summary for dashboard
 */
export async function getHealthSummary(): Promise<{
  totalModels: number;
  healthyModels: number;
  degradedModels: number;
  downModels: number;
  avgResponseTime: number;
  overallUptime: number;
}> {
  try {
    const allHealth = await getAllModelHealthStatus();
    
    if (allHealth.length === 0) {
      return {
        totalModels: 0,
        healthyModels: 0,
        degradedModels: 0,
        downModels: 0,
        avgResponseTime: 0,
        overallUptime: 0
      };
    }
    
    const healthyModels = allHealth.filter(h => h.status === 'healthy').length;
    const degradedModels = allHealth.filter(h => h.status === 'degraded').length;
    const downModels = allHealth.filter(h => h.status === 'down').length;
    
    const avgResponseTime = allHealth.reduce((sum, h) => sum + h.avgResponseTime, 0) / allHealth.length;
    const overallUptime = allHealth.reduce((sum, h) => sum + h.uptime, 0) / allHealth.length;
    
    return {
      totalModels: allHealth.length,
      healthyModels,
      degradedModels,
      downModels,
      avgResponseTime,
      overallUptime
    };
    
  } catch (error) {
    console.error('Error getting health summary:', error);
    return {
      totalModels: 0,
      healthyModels: 0,
      degradedModels: 0,
      downModels: 0,
      avgResponseTime: 0,
      overallUptime: 0
    };
  }
}

/**
 * Initialize health monitoring system
 */
export async function initializeHealthMonitoring(): Promise<void> {
  console.log('🏥 Initializing health monitoring system...');
  
  // Run initial health check
  await runHealthChecks();
  
  // Schedule regular health checks
  scheduleHealthChecks();
  
  console.log('✅ Health monitoring system initialized');
}
