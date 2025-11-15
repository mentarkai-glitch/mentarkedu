/**
 * ARK Suggestion Service
 * Merges static suggestions with database overrides
 * Provides AI-powered filtering and autocomplete
 */

import { createClient } from '@/lib/supabase/server';
import { 
  getAllSuggestions, 
  getSuggestions, 
  searchSuggestions 
} from '@/lib/data/ark-suggestions';
import { aiOrchestrator } from '@/lib/ai/orchestrator';
import type { AIContext } from '@/lib/types';

export interface SuggestionOptions {
  categoryId: string;
  suggestionType: string;
  instituteId?: string;
  searchQuery?: string;
  limit?: number;
}

export interface MergedSuggestion {
  text: string;
  source: 'static' | 'institute' | 'ai';
  priority: number;
}

/**
 * Get merged suggestions (static + database overrides)
 */
export async function getMergedSuggestions(
  options: SuggestionOptions
): Promise<string[]> {
  const { categoryId, suggestionType, instituteId, searchQuery, limit = 20 } = options;
  
  // Start with static suggestions
  const staticSuggestions = getSuggestions(categoryId, suggestionType);
  
  // Get database overrides if institute_id provided
  let dbOverrides: string[] = [];
  if (instituteId) {
    dbOverrides = await getDatabaseSuggestions(instituteId, categoryId, suggestionType);
  }
  
  // Merge with priority: DB overrides first, then static
  const merged = [...dbOverrides, ...staticSuggestions];
  
  // Remove duplicates while preserving order
  const unique = Array.from(new Set(merged.map(s => s.toLowerCase())))
    .map(lower => merged.find(s => s.toLowerCase() === lower)!);
  
  // Apply search filter if provided
  const filtered = searchQuery 
    ? unique.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : unique;
  
  // Limit results
  return filtered.slice(0, limit);
}

/**
 * Get database suggestions for an institute
 */
async function getDatabaseSuggestions(
  instituteId: string,
  categoryId: string,
  suggestionType: string
): Promise<string[]> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('ark_suggestion_overrides')
      .select('suggestion_text, priority')
      .eq('institute_id', instituteId)
      .eq('category_id', categoryId)
      .eq('suggestion_type', suggestionType)
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .order('suggestion_text', { ascending: true });
    
    if (error) {
      console.error('Error fetching database suggestions:', error);
      return [];
    }
    
    return data.map(row => row.suggestion_text);
  } catch (error) {
    console.error('Error in getDatabaseSuggestions:', error);
    return [];
  }
}

/**
 * AI-powered smart suggestions based on user input context
 * Returns top N suggestions most relevant to user's current state
 */
export async function getSmartSuggestions(
  categoryId: string,
  suggestionType: string,
  context: {
    userInput?: string;
    previousAnswers?: Record<string, any>;
    onboardingProfile?: any;
    userId?: string;
    limit?: number;
  }
): Promise<string[]> {
  try {
    // Get base suggestions
    const allSuggestions = getSuggestions(categoryId, suggestionType);
    
    // If no context provided, return basic filtered results
    if (!context.userInput && !context.previousAnswers && !context.onboardingProfile) {
      return allSuggestions.slice(0, context.limit || 20);
    }

    // Build context for AI ranking
    const contextSummary = buildContextSummary(context);
    
    // If we have enough context, use AI to rank suggestions
    if (contextSummary && allSuggestions.length > 0) {
      const rankedSuggestions = await rankSuggestionsWithAI(
        allSuggestions,
        categoryId,
        suggestionType,
        contextSummary,
        context.userId || 'anonymous'
      );
      
      return rankedSuggestions.slice(0, context.limit || 20);
    }

    // Fallback: Simple text search if user input provided
    if (context.userInput) {
      return searchSuggestions(categoryId, suggestionType, context.userInput).slice(0, context.limit || 20);
    }
    
    return allSuggestions.slice(0, context.limit || 20);
  } catch (error) {
    console.error('Error in getSmartSuggestions:', error);
    // Fallback to basic suggestions on error
    const suggestions = getSuggestions(categoryId, suggestionType);
    if (context.userInput) {
      return searchSuggestions(categoryId, suggestionType, context.userInput).slice(0, context.limit || 20);
    }
    return suggestions.slice(0, context.limit || 20);
  }
}

/**
 * Build a summary of user context for AI ranking
 */
function buildContextSummary(context: {
  userInput?: string;
  previousAnswers?: Record<string, any>;
  onboardingProfile?: any;
}): string | null {
  const parts: string[] = [];

  if (context.userInput) {
    parts.push(`Current input: "${context.userInput}"`);
  }

  if (context.previousAnswers && Object.keys(context.previousAnswers).length > 0) {
    const answers = Object.entries(context.previousAnswers)
      .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
      .slice(0, 5); // Limit to first 5 answers
    parts.push(`Previous answers: ${answers.join(', ')}`);
  }

  if (context.onboardingProfile) {
    const profile = context.onboardingProfile;
    const profileParts: string[] = [];
    
    if (profile.interests && Array.isArray(profile.interests)) {
      profileParts.push(`Interests: ${profile.interests.slice(0, 3).join(', ')}`);
    }
    if (profile.academic_stage) {
      profileParts.push(`Academic stage: ${profile.academic_stage}`);
    }
    if (profile.career_goals) {
      profileParts.push(`Career goals: ${profile.career_goals}`);
    }
    if (profile.learning_style) {
      profileParts.push(`Learning style: ${profile.learning_style}`);
    }

    if (profileParts.length > 0) {
      parts.push(`Profile: ${profileParts.join('; ')}`);
    }
  }

  return parts.length > 0 ? parts.join('\n') : null;
}

/**
 * Rank suggestions using AI based on context
 */
async function rankSuggestionsWithAI(
  suggestions: string[],
  categoryId: string,
  suggestionType: string,
  contextSummary: string,
  userId: string
): Promise<string[]> {
  try {
    // Limit suggestions to rank (AI costs increase with more items)
    const suggestionsToRank = suggestions.slice(0, 50);
    
    const prompt = `You are an AI assistant helping a student create personalized learning goals (ARKs).

Category: ${categoryId}
Suggestion Type: ${suggestionType}

Student Context:
${contextSummary}

Available Suggestions:
${suggestionsToRank.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Task: Rank these suggestions from most relevant to least relevant based on the student's context.

Return ONLY a JSON array of the suggestions in ranked order (most relevant first). No explanations, no markdown, just the JSON array.

Example format: ["Suggestion 1", "Suggestion 2", "Suggestion 3"]`;

    const aiContext: AIContext = {
      task: "mentor_chat",
      user_id: userId,
      session_id: "ark_suggestion_ranking",
      metadata: {
        system_prompt: "You are an expert at understanding student learning goals and preferences.",
        user_tier: "pro",
      },
    };

    const response = await aiOrchestrator(aiContext, prompt);

    if (!response.content) {
      throw new Error("No response from AI");
    }

    // Parse JSON response
    let ranked: string[] = [];
    try {
      // Try to extract JSON from markdown code blocks if present
      let jsonContent = response.content.trim();
      const jsonMatch = jsonContent.match(/```(?:json)?\s*(\[[\s\S]*\])\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
      
      // Remove any leading/trailing non-JSON text
      const arrayMatch = jsonContent.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        jsonContent = arrayMatch[0];
      }

      ranked = JSON.parse(jsonContent);
      
      if (!Array.isArray(ranked)) {
        throw new Error("Response is not an array");
      }

      // Validate that all ranked items exist in original suggestions
      const suggestionLower = new Set(suggestions.map(s => s.toLowerCase()));
      ranked = ranked.filter(item => 
        typeof item === 'string' && 
        suggestionLower.has(item.toLowerCase())
      );

      // Add any suggestions not ranked by AI (in original order)
      const rankedLower = new Set(ranked.map(s => s.toLowerCase()));
      suggestions.forEach(s => {
        if (!rankedLower.has(s.toLowerCase()) && !ranked.includes(s)) {
          ranked.push(s);
        }
      });

      return ranked;
    } catch (parseError) {
      console.error("Error parsing AI ranking response:", parseError);
      // Fallback: Use simple text matching
      return rankSuggestionsByTextMatch(suggestions, contextSummary);
    }
  } catch (error) {
    console.error("Error in rankSuggestionsWithAI:", error);
    // Fallback to text-based ranking
    return rankSuggestionsByTextMatch(suggestions, contextSummary);
  }
}

/**
 * Fallback ranking based on text matching when AI fails
 */
function rankSuggestionsByTextMatch(
  suggestions: string[],
  contextSummary: string
): string[] {
  const contextLower = contextSummary.toLowerCase();
  const contextWords = contextLower.split(/\s+/).filter(w => w.length > 3);

  const scored = suggestions.map(suggestion => {
    let score = 0;
    const suggestionLower = suggestion.toLowerCase();

    // Exact phrase match
    if (contextLower.includes(suggestionLower) || suggestionLower.includes(contextLower)) {
      score += 100;
    }

    // Word matches
    contextWords.forEach(word => {
      if (suggestionLower.includes(word)) {
        score += 10;
      }
    });

    return { suggestion, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map(item => item.suggestion);
}

/**
 * Get suggestion counts for a category
 */
export function getSuggestionCounts(categoryId: string): Record<string, number> {
  const all = getAllSuggestions(categoryId);
  const counts: Record<string, number> = {};
  
  Object.keys(all).forEach(key => {
    counts[key] = Array.isArray(all[key]) ? all[key].length : 0;
  });
  
  return counts;
}

/**
 * Check if a suggestion exists
 */
export function suggestionExists(
  categoryId: string,
  suggestionType: string,
  text: string
): boolean {
  const suggestions = getSuggestions(categoryId, suggestionType);
  return suggestions.some(s => s.toLowerCase() === text.toLowerCase());
}

/**
 * Get popular/pinned suggestions (utility for highlighting)
 */
export function getPopularSuggestions(
  categoryId: string,
  suggestionType: string,
  limit: number = 5
): string[] {
  const all = getSuggestions(categoryId, suggestionType);
  // First N are considered "popular" (can be enhanced with analytics later)
  return all.slice(0, limit);
}

