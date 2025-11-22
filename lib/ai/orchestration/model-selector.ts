/**
 * Intelligent Model Selector for AI Orchestration
 * 
 * This module provides intelligent model selection based on:
 * - Task requirements and complexity
 * - Cost optimization
 * - Quality requirements
 * - Performance metrics
 * - User tier and preferences
 * - Historical performance data
 * - Real-time health checks
 */

import type { AITask, AIContext, AIModel } from '@/lib/types';
import { modelSelectionCache, createCacheKey } from '@/lib/utils/cache';

export interface ModelCapabilities {
  // Performance metrics
  speed: number; // tokens per second
  quality: number; // 0-100 based on task type
  contextWindow: number; // max tokens
  multimodal: boolean;
  
  // Cost metrics
  costPerToken: number;
  costPerRequest: number;
  
  // Specializations
  strengths: AITask[];
  languages: string[];
  features: ('reasoning' | 'empathy' | 'creativity' | 'analysis' | 'research' | 'planning')[];
  
  // Reliability
  uptime: number; // percentage
  avgResponseTime: number; // ms
  errorRate: number; // percentage
  
  // Status
  isActive: boolean;
  description: string;
  modelVersion?: string; // Specific model version for API calls
}

export interface ModelRequirements {
  maxCost?: number;
  maxLatency?: number;
  minQuality?: number;
  requireMultimodal?: boolean;
  preferredFeatures?: string[];
  excludeModels?: AIModel[];
  userTier?: 'free' | 'premium' | 'enterprise';
}

export interface ModelSelection {
  model: AIModel;
  score: number;
  reason: string;
  estimatedCost: number;
  estimatedLatency: number;
  confidence: number;
}

// Model Capabilities Registry
const MODEL_REGISTRY: Record<AIModel, ModelCapabilities> = {
  'gpt-4o': {
    speed: 80,
    quality: 90,
    contextWindow: 128000,
    multimodal: true,
    costPerToken: 0.000005,
    costPerRequest: 0,
    strengths: ['roadmap', 'mentor_chat', 'resource_recommendation', 'research', 'doubt_analysis', 'practice_questions', 'content_recommendation'],
    languages: ['en'],
    features: ['reasoning', 'creativity', 'analysis'],
    uptime: 99.9,
    avgResponseTime: 1200,
    errorRate: 0.1,
    isActive: true,
    description: 'Best general-purpose model with multimodal capabilities',
    modelVersion: 'gpt-4o-2024-08-06'
  },
  
  'o1-preview': {
    speed: 30,
    quality: 98,
    contextWindow: 128000,
    multimodal: false,
    costPerToken: 0.000015,
    costPerRequest: 0,
    strengths: ['prediction', 'insights', 'roadmap', 'research'],
    languages: ['en'],
    features: ['reasoning', 'analysis', 'planning'],
    uptime: 99.5,
    avgResponseTime: 5000,
    errorRate: 0.5,
    isActive: false, // Not available in current API
    description: 'Advanced reasoning model for complex problem-solving (Beta - Not Available)',
    modelVersion: 'o1-preview'
  },
  
  'o1-mini': {
    speed: 50,
    quality: 95,
    contextWindow: 128000,
    multimodal: false,
    costPerToken: 0.000003,
    costPerRequest: 0,
    strengths: ['prediction', 'insights', 'roadmap'],
    languages: ['en'],
    features: ['reasoning', 'analysis'],
    uptime: 99.6,
    avgResponseTime: 3000,
    errorRate: 0.3,
    isActive: true,
    description: 'Fast reasoning model for complex problem-solving',
    modelVersion: 'o1-mini'
  },
  
  'claude-opus': {
    speed: 60,
    quality: 95,
    contextWindow: 200000,
    multimodal: true,
    costPerToken: 0.000015,
    costPerRequest: 0,
    strengths: ['emotion', 'mentor_chat', 'insights', 'roadmap'],
    languages: ['en'],
    features: ['empathy', 'reasoning', 'creativity', 'analysis'],
    uptime: 99.8,
    avgResponseTime: 1500,
    errorRate: 0.2,
    isActive: true,
    description: 'High-quality model with excellent empathy and reasoning'
  },
  
  'claude-sonnet': {
    speed: 70,
    quality: 88,
    contextWindow: 200000,
    multimodal: true,
    costPerToken: 0.000003,
    costPerRequest: 0,
    strengths: ['mentor_chat', 'emotion', 'research', 'insights', 'doubt_analysis', 'content_recommendation'],
    languages: ['en'],
    features: ['empathy', 'reasoning', 'analysis'],
    uptime: 99.6,
    avgResponseTime: 1100,
    errorRate: 0.2,
    isActive: true,
    description: 'Balanced model with good empathy and performance'
  },
  
  'gemini-pro': {
    speed: 90,
    quality: 85,
    contextWindow: 2000000,
    multimodal: true,
    costPerToken: 0.0000025,
    costPerRequest: 0,
    strengths: ['research', 'insights', 'mentor_chat', 'doubt_analysis'],
    languages: ['en'],
    features: ['reasoning', 'analysis', 'research'],
    uptime: 99.7,
    avgResponseTime: 1000,
    errorRate: 0.3,
    isActive: true,
    description: 'Cost-effective model with massive context window'
  },
  
  'gemini-2.5-flash': {
    speed: 95,
    quality: 82,
    contextWindow: 1000000,
    multimodal: true,
    costPerToken: 0.0000015,
    costPerRequest: 0,
    strengths: ['mentor_chat', 'resource_recommendation', 'research', 'content_recommendation', 'practice_questions'],
    languages: ['en'],
    features: ['reasoning', 'analysis'],
    uptime: 99.8,
    avgResponseTime: 800,
    errorRate: 0.2,
    isActive: true,
    description: 'Ultra-fast and cost-effective model for high-volume tasks',
    modelVersion: 'gemini-2.0-flash-exp'
  },
  
  'gpt-4o-mini': {
    speed: 100,
    quality: 80,
    contextWindow: 128000,
    multimodal: true,
    costPerToken: 0.00000015,
    costPerRequest: 0,
    strengths: ['mentor_chat', 'resource_recommendation', 'content_recommendation', 'practice_questions'],
    languages: ['en'],
    features: ['reasoning', 'creativity'],
    uptime: 99.8,
    avgResponseTime: 800,
    errorRate: 0.1,
    isActive: true,
    description: 'Fast and cost-effective model for simple tasks',
    modelVersion: 'gpt-4o-mini'
  },
  
  'mistral-large': {
    speed: 75,
    quality: 82,
    contextWindow: 32000,
    multimodal: false,
    costPerToken: 0.000008,
    costPerRequest: 0,
    strengths: ['research', 'insights', 'mentor_chat', 'doubt_analysis'],
    languages: ['en', 'fr', 'de', 'es'],
    features: ['reasoning', 'analysis'],
    uptime: 99.5,
    avgResponseTime: 900,
    errorRate: 0.3,
    isActive: true,
    description: 'Multilingual model with strong reasoning capabilities'
  },
  
  'llama-3.1': {
    speed: 65,
    quality: 78,
    contextWindow: 128000,
    multimodal: false,
    costPerToken: 0.000005,
    costPerRequest: 0,
    strengths: ['research', 'insights'],
    languages: ['en'],
    features: ['reasoning', 'analysis'],
    uptime: 99.4,
    avgResponseTime: 1200,
    errorRate: 0.4,
    isActive: true,
    description: 'Open-source model with good reasoning capabilities'
  },
  
  'cohere-command-r-plus': {
    speed: 85,
    quality: 87,
    contextWindow: 128000,
    multimodal: false,
    costPerToken: 0.000005,
    costPerRequest: 0,
    strengths: ['research', 'insights', 'mentor_chat', 'doubt_analysis'],
    languages: ['en'],
    features: ['reasoning', 'analysis', 'research'],
    uptime: 99.6,
    avgResponseTime: 950,
    errorRate: 0.2,
    isActive: true,
    description: 'High-quality model with excellent reasoning and research capabilities'
  },
  
  'cohere-command-r': {
    speed: 90,
    quality: 84,
    contextWindow: 128000,
    multimodal: false,
    costPerToken: 0.000003,
    costPerRequest: 0,
    strengths: ['mentor_chat', 'research', 'insights'],
    languages: ['en'],
    features: ['reasoning', 'analysis'],
    uptime: 99.7,
    avgResponseTime: 850,
    errorRate: 0.2,
    isActive: true,
    description: 'Fast and efficient model for general tasks'
  },
  
  'hume-emotional-analysis': {
    speed: 60,
    quality: 92,
    contextWindow: 32000,
    multimodal: false,
    costPerToken: 0.000007,
    costPerRequest: 0,
    strengths: ['emotion', 'insights', 'mentor_chat'],
    languages: ['en'],
    features: ['empathy', 'analysis'],
    uptime: 99.5,
    avgResponseTime: 1200,
    errorRate: 0.3,
    isActive: true,
    description: 'Specialized model for emotional analysis and empathy'
  },
  
  'perplexity-pro': {
    speed: 75,
    quality: 92,
    contextWindow: 128000,
    multimodal: false,
    costPerToken: 0.000005,
    costPerRequest: 0,
    strengths: ['research', 'insights', 'mentor_chat', 'roadmap'],
    languages: ['en'],
    features: ['reasoning', 'analysis', 'research'],
    uptime: 99.8,
    avgResponseTime: 1200,
    errorRate: 0.1,
    isActive: true,
    description: 'Smart research model with intelligent tier selection (Sonar/Sonar Reasoning Pro/Sonar Deep Research)',
    modelVersion: 'sonar-reasoning-pro'
  },
  
  'deepl-translation': {
    speed: 85,
    quality: 96,
    contextWindow: 128000,
    multimodal: false,
    costPerToken: 0.000002,
    costPerRequest: 0,
    strengths: ['mentor_chat', 'resource_recommendation', 'content_recommendation', 'practice_questions'],
    languages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh'],
    features: ['analysis'],
    uptime: 99.9,
    avgResponseTime: 600,
    errorRate: 0.1,
    isActive: true,
    description: 'Ultra-accurate translation service with 30+ languages',
    modelVersion: 'deepl-free'
  }
};

/**
 * Select the optimal AI model based on task requirements and context
 * Now with caching and performance tracking
 */
export function selectOptimalModel(
  task: AITask,
  context: AIContext,
  requirements: ModelRequirements = {}
): ModelSelection {
  // Check cache first
  const cacheKey = createCacheKey('model_selection', task, JSON.stringify(context.metadata || {}), requirements.userTier || 'free');
  const cached = modelSelectionCache.get(cacheKey);
  if (cached) {
    return {
      model: cached.model as AIModel,
      score: cached.score,
      reason: cached.reason,
      estimatedCost: calculateCost(cached.model as AIModel, context.metadata?.expectedLength || 1000),
      estimatedLatency: estimateResponseTime(cached.model as AIModel, context.metadata?.expectedLength || 0),
      confidence: 85, // Slightly lower confidence for cached results
    };
  }

  console.log(`🎯 Selecting model for task: ${task}`, {
    requirements,
    userTier: requirements.userTier || 'free'
  });

  // Helper function to check if API key is configured for a model
  const hasApiKey = (model: AIModel): boolean => {
    const keyMap: Record<AIModel, string> = {
      'gpt-4o': 'OPENAI_API_KEY',
      'gpt-4o-mini': 'OPENAI_API_KEY',
      'o1-preview': 'OPENAI_API_KEY',
      'o1-mini': 'OPENAI_API_KEY',
      'claude-opus': 'CLAUDE_API_KEY',
      'claude-sonnet': 'CLAUDE_API_KEY',
      'gemini-pro': 'GEMINI_API_KEY',
      'gemini-2.5-flash': 'GEMINI_API_KEY',
      'perplexity-pro': 'PERPLEXITY_API_KEY',
      'cohere-command-r-plus': 'COHERE_API_KEY',
      'cohere-command-r': 'COHERE_API_KEY',
      'mistral-large': 'MISTRAL_API_KEY',
      'llama-3.1': 'GROQ_API_KEY',
      'hume-emotional-analysis': 'HUME_API_KEY',
      'deepl-translation': 'DEEPL_API_KEY'
    };
    
    const envKey = keyMap[model];
    if (!envKey) return false; // Unknown model
    
    return !!process.env[envKey];
  };

  // Score each model based on requirements
  const scores = Object.entries(MODEL_REGISTRY)
    .filter(([modelName, caps]) => {
      // Filter by active status
      if (!caps.isActive) return false;
      
      // Filter by API key availability (critical!)
      if (!hasApiKey(modelName as AIModel)) {
        console.warn(`⚠️ Skipping model ${modelName}: API key not configured`);
        return false;
      }
      
      // Filter by exclusions
      if (requirements.excludeModels?.includes(modelName as AIModel)) {
        return false;
      }
      
      return true;
    })
    .map(([modelName, caps]) => {
      let score = 0;
      const reasons: string[] = [];
      
      // Task specialization (40% weight)
      if (caps.strengths.includes(task)) {
        score += 40;
        reasons.push(`Strong in ${task}`);
      } else {
        // Partial credit for related tasks
        const relatedTasks = getRelatedTasks(task);
        const relatedStrength = caps.strengths.some(strength => relatedTasks.includes(strength));
        if (relatedStrength) {
          score += 20;
          reasons.push(`Related to ${task}`);
        }
      }
      
      // Quality requirement (30% weight)
      const qualityScore = caps.quality / 100 * 30;
      score += qualityScore;
      reasons.push(`Quality: ${caps.quality}/100`);
      
      // Speed requirement (15% weight)
      if (requirements.maxLatency) {
        const speedScore = Math.max(0, (requirements.maxLatency - caps.avgResponseTime) / requirements.maxLatency * 15);
        score += speedScore;
        reasons.push(`Response time: ${caps.avgResponseTime}ms`);
      } else {
        score += caps.speed / 100 * 15;
        reasons.push(`Speed: ${caps.speed}/100`);
      }
      
      // Cost efficiency (15% weight)
      if (requirements.maxCost) {
        const costScore = Math.max(0, (requirements.maxCost - caps.costPerToken) / requirements.maxCost * 15);
        score += costScore;
        reasons.push(`Cost: $${caps.costPerToken.toFixed(6)}/token`);
      } else {
        // Lower cost = higher score
        const avgCost = 0.00001; // average cost across models
        const costScore = Math.max(0, (avgCost - caps.costPerToken) / avgCost * 15);
        score += costScore;
        reasons.push(`Cost efficient: $${caps.costPerToken.toFixed(6)}/token`);
      }
      
      // Feature requirements
      if (requirements.preferredFeatures) {
        const featureMatch = requirements.preferredFeatures.filter(feature => 
          caps.features.includes(feature as any)
        ).length;
        const featureScore = (featureMatch / requirements.preferredFeatures.length) * 10;
        score += featureScore;
        if (featureMatch > 0) {
          reasons.push(`Features: ${requirements.preferredFeatures.filter(f => caps.features.includes(f as any)).join(', ')}`);
        }
      }
      
      // Context window requirement
      if (context.metadata?.expectedLength && context.metadata.expectedLength > caps.contextWindow) {
        return null; // Can't handle this request
      }
      
      // Multimodal requirement
      if (requirements.requireMultimodal && !caps.multimodal) {
        return null;
      }
      
      // User tier optimization
      if (requirements.userTier === 'free') {
        // Prefer cheaper models for free tier
        if (caps.costPerToken > 0.000005) {
          score *= 0.8; // Penalty for expensive models
          reasons.push('Cost-optimized for free tier');
        }
      } else if (requirements.userTier === 'premium') {
        // Balance cost and quality
        score += 5; // Small bonus for premium users
        reasons.push('Premium tier optimization');
      } else if (requirements.userTier === 'enterprise') {
        // Prioritize quality over cost
        score += 10; // Bonus for enterprise users
        reasons.push('Enterprise tier - quality prioritized');
      }
      
      // Reliability penalty
      score *= (caps.uptime / 100);
      reasons.push(`Reliability: ${caps.uptime}%`);
      
      return { 
        model: modelName as AIModel, 
        score, 
        caps,
        reasons: reasons.join(', ')
      };
    })
    .filter(Boolean) as Array<{ model: AIModel; score: number; caps: ModelCapabilities; reasons: string }>;
  
  if (scores.length === 0) {
    throw new Error('No suitable model found for the given requirements');
  }
  
  // Sort by score and return best
  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  
  // Calculate confidence based on score difference
  const scoreDifference = scores.length > 1 ? best.score - scores[1].score : 100;
  const confidence = Math.min(100, Math.max(50, scoreDifference + 50));
  
  const selection: ModelSelection = {
    model: best.model,
    score: best.score,
    reason: best.reasons,
    estimatedCost: best.caps.costPerToken * (context.metadata?.expectedLength || 1000),
    estimatedLatency: best.caps.avgResponseTime,
    confidence
  };

  // Cache the selection
  modelSelectionCache.set(cacheKey, {
    model: selection.model,
    score: selection.score,
    reason: selection.reason,
  }, 10 * 60 * 1000); // 10 minutes

  return selection;
}

/**
 * Get related tasks for partial scoring
 */
function getRelatedTasks(task: AITask): AITask[] {
  const taskRelations: Record<AITask, AITask[]> = {
    'roadmap': ['prediction', 'insights', 'research'],
    'emotion': ['mentor_chat', 'insights'],
    'insights': ['emotion', 'prediction', 'research'],
    'research': ['roadmap', 'insights', 'resource_recommendation'],
    'prediction': ['roadmap', 'insights'],
    'resource_recommendation': ['research', 'mentor_chat'],
    'mentor_chat': ['emotion', 'insights', 'resource_recommendation']
  };
  
  return taskRelations[task] || [];
}

/**
 * Get model capabilities by name
 */
export function getModelCapabilities(model: AIModel): ModelCapabilities | null {
  return MODEL_REGISTRY[model] || null;
}

/**
 * Get all available models
 */
export function getAvailableModels(): AIModel[] {
  return Object.keys(MODEL_REGISTRY).filter(model => 
    MODEL_REGISTRY[model as AIModel].isActive
  ) as AIModel[];
}

/**
 * Get models by feature
 */
export function getModelsByFeature(feature: string): AIModel[] {
  return Object.entries(MODEL_REGISTRY)
    .filter(([_, caps]) => caps.isActive && caps.features.includes(feature as any))
    .map(([model, _]) => model as AIModel);
}

/**
 * Get models by task strength
 */
export function getModelsByTask(task: AITask): AIModel[] {
  return Object.entries(MODEL_REGISTRY)
    .filter(([_, caps]) => caps.isActive && caps.strengths.includes(task))
    .map(([model, _]) => model as AIModel);
}

/**
 * Calculate cost for a given model and token count
 */
export function calculateCost(model: AIModel, tokens: number): number {
  const caps = MODEL_REGISTRY[model];
  if (!caps) return 0;
  
  return caps.costPerToken * tokens + caps.costPerRequest;
}

/**
 * Estimate response time for a given model and context
 */
export function estimateResponseTime(model: AIModel, contextLength: number): number {
  const caps = MODEL_REGISTRY[model];
  if (!caps) return 1000; // Default fallback
  
  // Base response time + additional time for longer contexts
  const baseTime = caps.avgResponseTime;
  const contextFactor = Math.min(2, contextLength / 10000); // Max 2x for very long contexts
  
  return Math.round(baseTime * (1 + contextFactor));
}

/**
 * Check if model can handle the context length
 */
export function canHandleContext(model: AIModel, contextLength: number): boolean {
  const caps = MODEL_REGISTRY[model];
  if (!caps) return false;
  
  return contextLength <= caps.contextWindow;
}

/**
 * Get model recommendations for a task
 */
export function getModelRecommendations(task: AITask, userTier: 'free' | 'premium' | 'enterprise' = 'free'): Array<{
  model: AIModel;
  reason: string;
  score: number;
}> {
  const requirements: ModelRequirements = {
    userTier,
    minQuality: userTier === 'enterprise' ? 90 : userTier === 'premium' ? 80 : 70
  };
  
  // Get multiple recommendations by excluding the best model each time
  const recommendations = [];
  const excludeModels: AIModel[] = [];
  
  for (let i = 0; i < 3; i++) {
    try {
      const selection = selectOptimalModel(task, { task }, { ...requirements, excludeModels });
      recommendations.push({
        model: selection.model,
        reason: selection.reason,
        score: selection.score
      });
      excludeModels.push(selection.model);
    } catch (error) {
      break; // No more models available
    }
  }
  
  return recommendations;
}
