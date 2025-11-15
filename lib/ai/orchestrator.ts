import { callGPT4o } from "./models/openai";
import { callClaude } from "./models/claude";
import { callGemini } from "./models/gemini";
import { callPerplexity } from "./models/perplexity";
import { callCohere } from "./models/cohere";
import { callMistral } from "./models/mistral";
import { callHumeEmotionAnalysis } from "./models/hume";
import { callDeepL } from "./models/deepl";
import { callGroq } from "./models/groq";
import type { AITask, AIContext, AIResponse, AIModel } from "@/lib/types";
import { selectOptimalModel } from "./orchestration/model-selector";
import { analyzeContext, determineRequirements } from "./orchestration/context-analyzer";
import { trackUsage } from "./orchestration/usage-tracker";
import { modelHealthCheck } from "./orchestration/health-monitor";
import { redisService } from "@/lib/services/redis";

/**
 * AI Orchestrator - Routes tasks to the most appropriate AI model
 * with automatic failover support and intelligent selection
 */
export async function aiOrchestrator(
  context: AIContext,
  prompt: string
): Promise<AIResponse> {
  const startTime = Date.now();

  try {
    // 1. Check for cached response first
    const userTier = context.metadata?.user_tier || 'free';
    const taskType = context.task;
    
    const cachedResponse = await redisService.getCachedAIResponse(prompt, userTier, taskType);
    if (cachedResponse) {
      console.log(`🎯 Cache Hit: Using cached response for ${taskType}`);
      return {
        content: cachedResponse.response,
        model: cachedResponse.model as AIModel,
        tokens_used: cachedResponse.tokens
      };
    }

    // 2. Check rate limiting
    const rateLimitResult = await redisService.checkRateLimit(
      context.user_id || 'anonymous',
      `ai_orchestrator:${taskType}`,
      100, // 100 requests per hour
      3600 // 1 hour window
    );

    if (!rateLimitResult.allowed) {
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000 / 60)} minutes.`);
    }

    // 3. Analyze the request
    const analysis = analyzeContext(prompt, context);
    const requirements = determineRequirements(analysis);

    console.log(`🎯 Context Analysis:`, {
      task: context.task,
      complexity: analysis.complexity,
      emotional: analysis.emotionalContent,
      reasoning: analysis.requiresReasoning,
      creativity: analysis.requiresCreativity,
      empathy: analysis.requiresEmpathy,
      domain: analysis.domain,
      urgency: analysis.urgency,
      userTier: analysis.userTier
    });
    
    // 2. Select optimal model
    const selection = selectOptimalModel(context.task, context, requirements);
    
    console.log(`🎯 Orchestrator Decision:`, {
      task: context.task,
      selectedModel: selection.model,
      score: selection.score,
      reason: selection.reason,
      estimatedCost: selection.estimatedCost,
      estimatedLatency: selection.estimatedLatency,
      confidence: selection.confidence
    });
    
    // 3. Check model health
        const isHealthy = await modelHealthCheck(selection.model);
    if (!isHealthy) {
      console.warn(`⚠️ Model ${selection.model} unhealthy, finding alternative...`);
      const fallbackSelection = selectOptimalModel(context.task, context, {
        ...requirements,
        excludeModels: [selection.model]
      });
      return await executeWithModel(fallbackSelection.model, prompt, context, startTime, analysis, selection, [selection.model]);
    }
    
    // 4. Execute with selected model
    return await executeWithModel(selection.model, prompt, context, startTime, analysis, selection, []);
    
  } catch (error) {
    console.error('Orchestration error:', error);
    
    // Emergency fallback to most reliable model
    return await executeWithModel('gpt-4o', prompt, context, startTime, null, null);
  }
}

/**
 * Execute request with a specific model and track usage
 */
async function executeWithModel(
  model: AIModel,
  prompt: string,
  context: AIContext,
  startTime: number,
  analysis: any,
  selection: any,
  excludedModels: AIModel[] = []
): Promise<AIResponse> {
  try {
    const result = await callModel(model, prompt, context);
    
    // Check if model refused the request (common refusal patterns)
    const refusalPatterns = [
      /I'm sorry,? I (can't|cannot)/i,
      /I (can't|cannot) assist/i,
      /I'm not able to/i,
      /I cannot (help|generate|create|provide)/i,
      /I don't (think|believe|feel) I can/i,
      /I'm unable to/i,
      /I (won't|will not)/i,
      /I (refuse|decline)/i
    ];
    
    const isRefusal = refusalPatterns.some(pattern => pattern.test(result.content));
    
    // Also check if response doesn't look like JSON (for roadmap tasks)
    const isInvalidForRoadmap = context.task === 'roadmap' && 
      !result.content.trim().startsWith('{') && 
      !result.content.trim().startsWith('[') &&
      !result.content.includes('```json') &&
      !result.content.includes('```');
    
    if (isRefusal || isInvalidForRoadmap) {
      console.warn(`⚠️ Model ${model} refused or returned invalid response:`, result.content.substring(0, 200));
      
      // Try fallback with excluded models
      const allExcluded = [...excludedModels, model];
      const fallbackSelection = selectOptimalModel(context.task, context, {
        excludeModels: allExcluded
      });
      
      if (fallbackSelection.model === model) {
        // No alternative found, throw error
        throw new Error(`Model ${model} refused request and no alternative available`);
      }
      
      console.log(`🔄 Retrying with fallback model: ${fallbackSelection.model}`);
      return await executeWithModel(
        fallbackSelection.model, 
        prompt, 
        context, 
        startTime, 
        analysis, 
        fallbackSelection,
        allExcluded
      );
    }
    
    // Cache the response for future use
    const userTier = context.metadata?.user_tier || 'free';
    await redisService.cacheAIResponse(prompt, {
      prompt,
      response: result.content,
      model: result.model,
      tokens: result.tokens_used || 0,
      timestamp: Date.now(),
      userTier,
      taskType: context.task
    }, {
      ttl: 3600, // Cache for 1 hour
      tags: [`model:${model}`, `task:${context.task}`, `tier:${userTier}`]
    });
    
    // Track usage for learning
    const duration = Date.now() - startTime;
        await trackUsage({
          model: model,
          task: context.task,
          tokensUsed: result.tokens_used || 0,
          duration,
          success: true,
          quality: estimateQuality(result.content),
          userId: context.user_id,
          complexityScore: analysis?.complexity ?? 5,
          emotionalContentScore: analysis?.emotionalContent ?? 1,
          selectionReason: selection?.reason
        });
    
    // Store analytics
    await redisService.storeAnalytics(model, {
      requests: 1,
      tokensUsed: result.tokens_used || 0,
      cost: (result.tokens_used || 0) * 0.000005, // Rough cost calculation
      avgResponseTime: duration,
      successRate: 1.0,
      timestamp: Date.now()
    });
    
    return result;
    
  } catch (error) {
    console.error(`Model ${model} failed:`, error);
    
    // Try fallback with excluded models
    const allExcluded = [...excludedModels, model];
    const fallbackSelection = selectOptimalModel(context.task, context, {
      excludeModels: allExcluded
    });
    
    if (fallbackSelection.model === model) {
      // No alternative found
      throw new Error(`All models failed or refused. Last error: ${error}`);
    }
    
    console.log(`🔄 Retrying with fallback model: ${fallbackSelection.model}`);
    const result = await callModel(fallbackSelection.model, prompt, context);
    const duration = Date.now() - startTime;
    
        await trackUsage({
          model: fallbackSelection.model,
          task: context.task,
          tokensUsed: result.tokens_used || 0,
          duration,
          success: true,
          usedFallback: true,
          originalModel: model,
          userId: context.user_id,
          complexityScore: analysis?.complexity ?? 5,
          emotionalContentScore: analysis?.emotionalContent ?? 1,
          selectionReason: fallbackSelection.reason
        });
    
    return result;
  }
}

/**
 * Call specific AI model based on model name
 */
async function callModel(
  model: AIModel,
  prompt: string,
  context: AIContext
): Promise<AIResponse> {
  let content: string;
  let tokens_used: number;

  switch (model) {
        case "gpt-4o": {
          const result = await callGPT4o(prompt, {
            model: "gpt-4o-2024-08-06",
            system_prompt: getSystemPrompt(context),
          });
          content = result.content;
          tokens_used = result.tokens_used;
          break;
        }

    case "claude-opus": {
      const result = await callClaude(prompt, {
        model: "claude-sonnet-4-5-20250929", // Use latest Sonnet model
        system_prompt: getSystemPrompt(context),
      });
      content = result.content;
      tokens_used = result.tokens_used;
      break;
    }

    case "claude-sonnet": {
      const result = await callClaude(prompt, {
        model: "claude-sonnet-4-5-20250929",
        system_prompt: getSystemPrompt(context),
      });
      content = result.content;
      tokens_used = result.tokens_used;
      break;
    }

        case "gemini-pro": {
          const result = await callGemini(prompt, {
            model: "gemini-1.5-pro",
            system_prompt: getSystemPrompt(context),
          });
          content = result.content;
          tokens_used = result.tokens_used;
          break;
        }

        case "gemini-2.5-flash": {
          const result = await callGemini(prompt, {
            model: "gemini-2.0-flash-exp",
            system_prompt: getSystemPrompt(context),
          });
          content = result.content;
          tokens_used = result.tokens_used;
          break;
        }

        case "o1-preview": {
          const result = await callGPT4o(prompt, {
            model: "o1-preview",
            system_prompt: getSystemPrompt(context),
          });
          content = result.content;
          tokens_used = result.tokens_used;
          break;
        }

        case "o1-mini": {
          const result = await callGPT4o(prompt, {
            model: "o1-mini",
            system_prompt: getSystemPrompt(context),
          });
          content = result.content;
          tokens_used = result.tokens_used;
          break;
        }

    case "gpt-4o-mini": {
      const result = await callGPT4o(prompt, {
        model: "gpt-4o-mini",
        system_prompt: getSystemPrompt(context),
      });
      content = result.content;
      tokens_used = result.tokens_used;
      break;
    }


    case "llama-3.1": {
      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY environment variable is not set for Llama models");
      }
      const result = await callGroq(prompt, {
        model: "llama-3.1-70b-versatile",
        system_prompt: getSystemPrompt(context),
        temperature: 0.7,
        max_tokens: 2048,
      });
      content = result.content;
      tokens_used = result.tokens_used;
      break;
    }

    case "cohere-command-r-plus": {
      const result = await callCohere(prompt, {
        model: "command-r-plus",
        system_prompt: getSystemPrompt(context),
      });
      content = result.content;
      tokens_used = result.tokens_used;
      break;
    }

    case "cohere-command-r": {
      const result = await callCohere(prompt, {
        model: "command-r",
        system_prompt: getSystemPrompt(context),
      });
      content = result.content;
      tokens_used = result.tokens_used;
      break;
    }

    case "mistral-large": {
      const result = await callMistral(prompt, {
        model: "mistral-large-latest",
        system_prompt: getSystemPrompt(context),
      });
      content = result.content;
      tokens_used = result.tokens_used;
      break;
    }

        case "hume-emotional-analysis": {
          const result = await callHumeEmotionAnalysis(prompt, {});
          content = result.content;
          tokens_used = result.tokens_used;
          break;
        }

    case "perplexity-pro": {
      const result = await callPerplexity(prompt, {
        userTier: context.metadata?.user_tier || 'free',
        taskComplexity: context.metadata?.complexity || 5,
        taskType: context.task,
      });
      content = result.content;
      tokens_used = result.tokens_used;
      break;
    }

    case "deepl-translation": {
      const result = await callDeepL(prompt, {
        target_lang: context.metadata?.target_language || 'EN',
        source_lang: context.metadata?.source_language
      });
      content = result.content;
      tokens_used = result.tokens_used;
      break;
    }

    default:
      throw new Error(`Unknown model: ${model}`);
  }

  return {
    content,
    model,
    tokens_used,
  };
}

/**
 * Generate system prompt based on task context
 */
function getSystemPrompt(context: AIContext): string {
  // Use custom system prompt if provided in metadata (for mentor_chat with persona)
  if (context.metadata?.system_prompt) {
    return context.metadata.system_prompt;
  }

  const basePrompt = `You are Mentark, an empathetic AI mentor designed to guide students academically, emotionally, and personally. You understand emotions, logic, and motivation. Help students with clarity, not judgment.`;

  switch (context.task) {
    case "roadmap":
      return `${basePrompt}\n\nYour task is to generate personalized learning roadmaps (ARKs - Adaptive Roadmaps of Knowledge) that are practical, achievable, and tailored to the student's interests and goals.`;

    case "emotion":
      return `${basePrompt}\n\nYour task is to analyze emotional states from student check-ins and provide supportive, actionable insights.`;

    case "insights":
      return `${basePrompt}\n\nYour task is to generate deep insights for teachers about their students' progress, motivation, and areas needing attention.`;

    case "mentor_chat":
      return `${basePrompt}\n\nYou are in a one-on-one conversation with a student. Be warm, understanding, and provide practical guidance.`;

    case "research":
      return `${basePrompt}\n\nYour task is to research current trends, resources, and information relevant to the student's learning goals.`;

    case "resource_recommendation":
      return `${basePrompt}\n\nYour task is to recommend high-quality educational resources (videos, articles, courses) tailored to the student's needs.`;

    case "prediction":
      return `${basePrompt}\n\nYour task is to analyze patterns and predict potential outcomes to help prevent student burnout and dropout.`;

    default:
      return basePrompt;
  }
}

/**
 * Estimate quality of AI response (0-10 scale)
 */
function estimateQuality(content: string): number {
  let quality = 5; // Base quality
  
  // Length factor (0-2 points)
  if (content.length > 500) quality += 2;
  else if (content.length > 200) quality += 1;
  
  // Structure factor (0-2 points)
  if (content.includes('\n') || content.includes('•') || content.includes('1.')) {
    quality += 1; // Well-structured
  }
  
  // Completeness factor (0-1 point)
  if (content.length > 100 && !content.includes('...') && !content.includes('truncated')) {
    quality += 1;
  }
  
  return Math.min(10, Math.max(0, quality));
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Truncate context to fit within token limits
 */
export function truncateContext(text: string, maxTokens: number = 4000): string {
  const estimatedTokens = estimateTokens(text);

  if (estimatedTokens <= maxTokens) {
    return text;
  }

  // Truncate to approximately maxTokens
  const maxChars = maxTokens * 4;
  return text.slice(0, maxChars) + "...[truncated]";
}

