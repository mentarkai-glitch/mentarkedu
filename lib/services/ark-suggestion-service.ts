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
    const supabase = createClient();
    
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
  }
): Promise<string[]> {
  // For now, return merged suggestions
  // TODO: Integrate with AI to rank suggestions based on context
  const suggestions = getSuggestions(categoryId, suggestionType);
  
  // Filter based on user input if provided
  if (context.userInput) {
    return searchSuggestions(categoryId, suggestionType, context.userInput);
  }
  
  return suggestions;
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

