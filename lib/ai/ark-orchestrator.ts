/**
 * ARK Orchestration System
 * 
 * This module provides intelligent orchestration for ARK generation,
 * including model selection, navigation, and enhanced user experience.
 */

import { aiOrchestrator } from "./orchestrator";
import type { AIContext, StudentProfile } from "@/lib/types";

export interface ARKGenerationRequest {
  category: string;
  goal: string;
  studentProfile?: StudentProfile;
  psychologyProfile?: any;
  userTier?: 'free' | 'premium' | 'enterprise';
  specificFocus?: string;
  timeframe?: string;
}

export interface ARKGenerationResponse {
  ark: any;
  model: string;
  tokens_used: number;
  orchestration_metadata: {
    selected_model: string;
    selection_reason: string;
    complexity_score: number;
    user_tier: string;
    cost_optimization: string;
  };
}

/**
 * Calculate complexity score for ARK generation
 */
function calculateComplexityScore(request: ARKGenerationRequest): number {
  let score = 5; // Base complexity
  
  // Category-based complexity
  const complexCategories = ['stem', 'engineering', 'medicine', 'research', 'advanced', 'competitive'];
  if (complexCategories.some(cat => request.category.toLowerCase().includes(cat))) {
    score += 3;
  }
  
  // Goal-based complexity
  const complexGoals = ['career', 'advanced', 'professional', 'research', 'competitive', 'exam'];
  if (complexGoals.some(g => request.goal.toLowerCase().includes(g))) {
    score += 2;
  }
  
  // Psychology profile complexity
  if (request.psychologyProfile?.stress_level > 7) score += 1;
  if (request.psychologyProfile?.confidence_level < 4) score += 1;
  if (request.psychologyProfile?.motivation_level < 5) score += 1;
  
  // User tier complexity boost
  if (request.userTier === 'premium') score += 1;
  if (request.userTier === 'enterprise') score += 2;
  
  return Math.min(10, Math.max(1, score));
}

/**
 * Generate ARK with intelligent orchestration
 */
export async function generateARKWithOrchestration(
  request: ARKGenerationRequest,
  prompt: string
): Promise<ARKGenerationResponse> {
  
  const complexityScore = calculateComplexityScore(request);
  
  // Build enhanced AI context for better orchestration
  const context: AIContext = {
    task: "roadmap",
    user_id: (request.studentProfile as any)?.user_id || 'anonymous',
    metadata: {
      category: request.category,
      goal: request.goal,
      user_tier: request.userTier || 'free',
      complexity: complexityScore,
      ark_type: 'orchestrated_generation',
      requires_research: true,
      requires_reasoning: true,
      requires_empathy: request.psychologyProfile?.stress_level > 6,
      student_profile: request.studentProfile,
      psychology_profile: request.psychologyProfile,
      specific_focus: request.specificFocus,
      timeframe: request.timeframe
    },
  };

  console.log(`🎯 ARK Orchestration:`, {
    category: request.category,
    goal: request.goal,
    userTier: request.userTier,
    complexityScore,
    requiresResearch: context.metadata?.requires_research,
    requiresReasoning: context.metadata?.requires_reasoning,
    requiresEmpathy: context.metadata?.requires_empathy
  });

  // Get AI response with orchestration
  const aiResponse = await aiOrchestrator(context, prompt);
  
  // Determine selection reason for transparency
  const selectionReason = getSelectionReason(context, aiResponse.model);
  const costOptimization = getCostOptimizationStrategy(context);

  return {
    ark: aiResponse.content,
    model: aiResponse.model,
    tokens_used: aiResponse.tokens_used || 0,
    orchestration_metadata: {
      selected_model: aiResponse.model,
      selection_reason: selectionReason,
      complexity_score: complexityScore,
      user_tier: request.userTier || 'free',
      cost_optimization: costOptimization
    }
  };
}

/**
 * Get selection reason for transparency
 */
function getSelectionReason(context: AIContext, selectedModel: string): string {
  const userTier = context.metadata?.user_tier || 'free';
  const complexity = context.metadata?.complexity || 5;
  
  if (selectedModel === 'perplexity-pro') {
    if (userTier === 'enterprise') {
      return 'Enterprise user - Deep Research for comprehensive analysis';
    } else if (userTier === 'premium' || complexity > 7) {
      return 'Premium user or high complexity - Sonar Reasoning Pro for step-by-step analysis';
    } else {
      return 'Cost-optimized - Sonar for efficient research';
    }
  } else if (selectedModel === 'claude-opus') {
    return 'High empathy requirement - Claude Opus for emotional understanding';
  } else if (selectedModel === 'gpt-4o') {
    return 'Balanced approach - GPT-4o for general roadmap generation';
  } else if (selectedModel === 'gemini-pro') {
    return 'Large context window - Gemini Pro for comprehensive planning';
  }
  
  return 'Intelligent model selection based on task requirements';
}

/**
 * Get cost optimization strategy explanation
 */
function getCostOptimizationStrategy(context: AIContext): string {
  const userTier = context.metadata?.user_tier || 'free';
  const complexity = context.metadata?.complexity || 5;
  
  if (userTier === 'free') {
    return 'Free tier - Cost-optimized model selection';
  } else if (userTier === 'premium') {
    return 'Premium tier - Balanced quality and cost optimization';
  } else if (userTier === 'enterprise') {
    return 'Enterprise tier - Maximum quality for comprehensive analysis';
  }
  
  return 'Adaptive cost optimization based on user tier and complexity';
}

/**
 * Enhanced ARK generation with navigation suggestions
 */
export async function generateARKWithNavigation(
  request: ARKGenerationRequest,
  prompt: string
): Promise<ARKGenerationResponse & { navigation_suggestions: any[] }> {
  
  const response = await generateARKWithOrchestration(request, prompt);
  
  // Generate navigation suggestions based on the ARK
  // Only generate if ark is a string (we'll parse it properly in the route handler)
  let navigationSuggestions: any[] = [];
  try {
    navigationSuggestions = await generateNavigationSuggestions(request, response.ark);
  } catch (error) {
    console.warn('Failed to generate navigation suggestions:', error);
    // Continue without suggestions - don't fail the whole request
  }
  
  return {
    ...response,
    navigation_suggestions: navigationSuggestions
  };
}

/**
 * Generate navigation suggestions for ARK
 */
async function generateNavigationSuggestions(request: ARKGenerationRequest, arkContent: string): Promise<any[]> {
  const suggestions: any[] = [];
  
  // Parse ARK content to generate suggestions
  try {
    let arkData;
    
    // Handle if arkContent is already an object
    if (typeof arkContent === 'object') {
      arkData = arkContent;
    } else if (typeof arkContent === 'string') {
      // Try to parse - if it fails, return empty suggestions (don't fail the whole request)
      try {
        // Extract JSON from markdown code blocks if present
        let jsonToParse = arkContent;
        
        // More robust extraction - handle multiple code block formats
        if (arkContent.includes('```')) {
          // Try to extract JSON from code blocks
          const jsonBlockMatch = arkContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
          if (jsonBlockMatch) {
            jsonToParse = jsonBlockMatch[1];
          } else {
            // Fallback: remove all code block markers
            jsonToParse = arkContent.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
          }
        }
        
        // Use safeParseJSON which handles incomplete/malformed JSON
        const { safeParseJSON } = await import('@/lib/utils/json-repair');
        arkData = safeParseJSON(jsonToParse, null);
        
        if (!arkData) {
          // If parsing fails, return empty suggestions - don't fail the whole request
          console.warn('Failed to parse ARK content for navigation suggestions - returning empty suggestions');
          return suggestions;
        }
      } catch (parseError) {
        // If parsing fails, return empty suggestions - don't fail the whole request
        console.warn('Failed to parse ARK content for navigation suggestions:', parseError);
        return suggestions;
      }
    } else {
      return suggestions; // Return empty if can't parse
    }
    
    if (arkData.milestones && arkData.milestones.length > 0) {
      suggestions.push({
        type: 'milestone_tracking',
        title: 'Track Your Progress',
        description: 'Monitor your ARK milestones and celebrate achievements',
        action: 'view_milestones',
        priority: 'high'
      });
    }
    
    if (request.psychologyProfile?.stress_level > 6) {
      suggestions.push({
        type: 'stress_management',
        title: 'Stress Management',
        description: 'Your stress level is high. Consider stress management techniques',
        action: 'view_stress_tools',
        priority: 'high'
      });
    }
    
    if (request.userTier === 'free') {
      suggestions.push({
        type: 'upgrade_prompt',
        title: 'Upgrade for Better ARKs',
        description: 'Get premium ARKs with advanced AI models and detailed analysis',
        action: 'view_upgrade_options',
        priority: 'medium'
      });
    }
    
    suggestions.push({
      type: 'peer_connection',
      title: 'Connect with Peers',
      description: 'Find study buddies working on similar ARKs',
      action: 'find_peers',
      priority: 'medium'
    });
    
  } catch (error) {
    console.error('Error generating navigation suggestions:', error);
  }
  
  return suggestions;
}

