/**
 * Personalized Search Agent
 * Replaces Google with context-aware, actionable search results
 */

import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { callPerplexity } from "@/lib/ai/models/perplexity";
import { retrieveMemories } from "@/lib/ai/memory";
import { createClient } from "@/lib/supabase/server";
import { redisService } from "@/lib/services/redis";
import { safeParseJSON } from "@/lib/utils/json-repair";
import type { AIContext } from "@/lib/types";

export interface SearchQuery {
  query: string;
  userId?: string;
  context?: "academic" | "career" | "personal" | "general";
  filters?: {
    dateRange?: string;
    language?: string;
    type?: "web" | "academic" | "video" | "news";
    gradeLevel?: string;
  };
}

export interface SearchResult {
  answer: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  actions: Array<{
    type: "learn" | "apply" | "connect" | "explore";
    label: string;
    description: string;
    actionUrl?: string;
  }>;
  relatedQueries: string[];
  confidence: number;
}

export interface PersonalizedContext {
  arks?: Array<{
    title: string;
    progress: number;
    category: string;
  }>;
  interests: string[];
  goals: string[];
  grade: string;
  recentActivity?: string[];
  cognitiveProfile?: {
    learning_style: string;
    focus_level: number;
    motivation_level: number;
  };
}

/**
 * Personalized Search Agent
 * Returns actionable results instead of just links
 */
export class PersonalizedSearchAgent {
  /**
   * Execute personalized search
   */
  async execute(searchQuery: SearchQuery): Promise<SearchResult> {
    const { query, userId, context, filters } = searchQuery;

    // 1. Build personalized context
    const personalizedContext = await this.buildPersonalizedContext(userId, context);

    // 2. Enhance query with context
    const enhancedQuery = await this.enhanceQueryWithContext(query, personalizedContext);

    // 3. Search via Perplexity (already configured)
    const perplexityResult = await callPerplexity(enhancedQuery, {
      userTier: 'premium', // Use best model for search
      taskType: context || 'general',
      max_tokens: 3000,
    });

    // 4. Extract answer and sources
    const { answer, sources } = await this.parsePerplexityResult(perplexityResult.content, query);

    // 5. Generate actionable recommendations
    const actions = await this.generateActions(answer, query, personalizedContext);

    // 6. Suggest related queries
    const relatedQueries = await this.generateRelatedQueries(query, answer, personalizedContext);

    return {
      answer,
      sources,
      actions,
      relatedQueries,
      confidence: this.calculateConfidence(sources, answer),
    };
  }

  /**
   * Build personalized context from user profile
   */
  private async buildPersonalizedContext(
    userId?: string,
    contextType?: string
  ): Promise<PersonalizedContext> {
    const defaultContext: PersonalizedContext = {
      interests: [],
      goals: [],
      grade: "General",
    };

    if (!userId) return defaultContext;

    try {
      const supabase = await createClient();

      // Get student profile
      const { data: student } = await supabase
        .from("students")
        .select(`
          grade,
          interests,
          goals,
          onboarding_profile
        `)
        .eq("user_id", userId)
        .single();

      if (!student) return defaultContext;

      // Get active ARKs
      const { data: arks } = await supabase
        .from("arks")
        .select("title, progress, category")
        .eq("student_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5);

      // Get recent memories for context
      const memories = await retrieveMemories(userId, contextType || "general", { topK: 5 });

      return {
        arks: arks || [],
        interests: student.interests || [],
        goals: student.goals || [],
        grade: student.grade || "General",
        recentActivity: memories.map((m) => m.content),
        cognitiveProfile: (student.onboarding_profile as any) || {},
      };
    } catch (error) {
      console.error("Failed to build personalized context:", error);
      return defaultContext;
    }
  }

  /**
   * Enhance query with personalized context
   */
  private async enhanceQueryWithContext(
    query: string,
    context: PersonalizedContext
  ): Promise<string> {
    const contextStr = `
Current Goals: ${context.goals.join(", ") || "Not specified"}
Interests: ${context.interests.join(", ") || "Not specified"}
Active Learning ARKs: ${context.arks?.map((a) => `${a.title} (${a.progress}% complete)`).join(", ") || "None"}
Grade Level: ${context.grade}
Recent Activity: ${context.recentActivity?.slice(0, 3).join("; ") || "None"}

User's Query: "${query}"

Please provide a comprehensive answer that:
1. Directly answers the query
2. Connects it to their current learning goals if relevant
3. Suggests actionable next steps
4. References their interests where applicable
5. Includes verified sources for further reading
`;

    return contextStr;
  }

  /**
   * Parse Perplexity result into structured format
   * Handles both JSON and text responses
   */
  private async parsePerplexityResult(content: string, originalQuery: string): Promise<{
    answer: string;
    sources: Array<{ title: string; url: string; snippet: string }>;
  }> {
    // Try to parse as JSON first (Perplexity sometimes returns JSON)
    try {
      // Check if content is JSON or contains JSON
      let jsonContent = content.trim();
      
      // Try to extract JSON from code blocks
      const jsonMatch = jsonContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }
      
      // Use safe JSON parsing utility
      const parsed = safeParseJSON(jsonContent);
      if (parsed) {
        
        // Handle structured JSON response
        if (parsed.answer || parsed.response || parsed.content) {
          const answer = parsed.answer || parsed.response || parsed.content || '';
          const jsonSources = parsed.sources || parsed.references || [];
          
          const sources = jsonSources.map((src: any) => ({
            title: src.title || this.extractTitleFromUrl(src.url || ''),
            url: src.url || '',
            snippet: src.snippet || src.description || content.substring(0, 200),
          }));

          // Clean answer (remove citation markers)
          const cleanAnswer = answer
            .replace(/\[\d+\]/g, "")
            .replace(/\*\*Source:\*\*/gi, "")
            .replace(/\*\*Reference:\*\*/gi, "")
            .trim();

          return { answer: cleanAnswer, sources };
        }
      }
    } catch (jsonError) {
      // Not JSON, fall through to text parsing
      console.log('Perplexity response is not JSON, parsing as text');
    }

    // Fallback to text parsing
    // Extract sources (Perplexity includes citations like [1], [2] or **Source** format)
    const sourceRegex = /\[?(\d+)\]?\s*(?:https?:\/\/[^\s)]+|(?:Source|Reference):\s*([^\n]+))/gi;
    const urlRegex = /https?:\/\/[^\s)]+/g;

    const extractedUrls = content.match(urlRegex) || [];
    const uniqueUrls = [...new Set(extractedUrls)].slice(0, 5);

    const sources = uniqueUrls.map((url, idx) => ({
      title: this.extractTitleFromUrl(url),
      url,
      snippet: content.substring(0, 200), // First 200 chars as snippet
    }));

    // Clean answer (remove citation markers)
    const answer = content
      .replace(/\[\d+\]/g, "")
      .replace(/\*\*Source:\*\*/gi, "")
      .replace(/\*\*Reference:\*\*/gi, "")
      .trim();

    return { answer, sources };
  }

  /**
   * Extract title from URL (basic extraction)
   */
  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      const lastPart = pathParts[pathParts.length - 1] || urlObj.hostname;
      return decodeURIComponent(lastPart.replace(/[-_]/g, " ")).replace(/\.[^/.]+$/, "");
    } catch {
      return url;
    }
  }

  /**
   * Generate actionable recommendations
   */
  private async generateActions(
    answer: string,
    query: string,
    context: PersonalizedContext
  ): Promise<Array<{ type: "learn" | "apply" | "connect" | "explore"; label: string; description: string; actionUrl?: string }>> {
    const actions: any[] = [];

    // Auto-suggest actions based on query intent
    if (this.isAcademicQuery(query)) {
      actions.push({
        type: "learn",
        label: "Start Learning ARK",
        description: "Begin a personalized learning path on this topic",
        actionUrl: `/dashboard/student/arks/create?topic=${encodeURIComponent(query)}`,
      });
    }

    if (this.isCareerQuery(query)) {
      actions.push({
        type: "career",
        label: "Explore Career Path",
        description: "See how this relates to your career goals",
        actionUrl: `/dashboard/student/career`,
      });
    }

    if (this.mentionsCollege(query)) {
      actions.push({
        type: "explore",
        label: "College Recommendations",
        description: "Get personalized college suggestions",
        actionUrl: `/dashboard/student/colleges`,
      });
    }

    // Generic learn action
    if (actions.length === 0) {
      actions.push({
        type: "explore",
        label: "Learn More",
        description: "Explore resources related to this topic",
      });
    }

    return actions.slice(0, 3);
  }

  /**
   * Generate related queries and suggestions
   */
  private async generateRelatedQueries(
    originalQuery: string,
    answer: string,
    context: PersonalizedContext
  ): Promise<string[]> {
    const relatedQueries: string[] = [];

    // Use AI to generate intelligent suggestions if available
    try {
      const suggestionsPrompt = `Based on the user's query "${originalQuery}" and this answer summary: "${answer.substring(0, 300)}", generate 4 related search queries that would be helpful. Return ONLY a JSON array of strings, no other text. Example: ["query 1", "query 2", "query 3", "query 4"]`;
      
      const aiSuggestions = await aiOrchestrator({
        user_id: context.goals[0] ? "user" : undefined,
        task: "resource_recommendation",
      }, suggestionsPrompt);

      if (aiSuggestions.content) {
        try {
          // Try to parse JSON array from AI response
          const jsonMatch = aiSuggestions.content.match(/\[[\s\S]*?\]/);
          if (jsonMatch) {
          const parsed = safeParseJSON(jsonMatch[0]);
          if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            relatedQueries.push(...parsed.slice(0, 4));
          }
          }
        } catch (parseError) {
          // Fall through to keyword-based extraction
          console.log('Failed to parse AI suggestions, using keyword extraction');
        }
      }
    } catch (error) {
      console.log('AI suggestions failed, using keyword extraction', error);
    }

    // Fallback: Basic related query extraction from answer
    if (relatedQueries.length < 2) {
      const capitalizedKeywords = answer.match(/\b[A-Z][a-z]+\b/g) || [];
      const keywords = [...new Set(capitalizedKeywords)]
        .filter((word) => word.length > 4)
        .slice(0, 3);

      keywords.forEach((keyword) => {
        if (!relatedQueries.includes(`${keyword} ${originalQuery}`)) {
          relatedQueries.push(`${keyword} ${originalQuery}`);
        }
      });
    }

    // Add context-specific queries
    if (context.goals.length > 0 && relatedQueries.length < 4) {
      const goalQuery = `How ${context.goals[0]} relates to ${originalQuery}`;
      if (!relatedQueries.includes(goalQuery)) {
        relatedQueries.push(goalQuery);
      }
    }

    return relatedQueries.slice(0, 4);
  }

  /**
   * Helper methods
   */
  private isAcademicQuery(query: string): boolean {
    const academicKeywords = ["learn", "study", "course", "tutorial", "how to", "what is", "explain"];
    return academicKeywords.some((keyword) => query.toLowerCase().includes(keyword));
  }

  private isCareerQuery(query: string): boolean {
    const careerKeywords = ["career", "job", "salary", "skills", "employment", "profession"];
    return careerKeywords.some((keyword) => query.toLowerCase().includes(keyword));
  }

  private mentionsCollege(query: string): boolean {
    const collegeKeywords = ["college", "university", "admission", "cutoff", "course", "degree"];
    return collegeKeywords.some((keyword) => query.toLowerCase().includes(keyword));
  }

  private calculateConfidence(sources: any[], answer: string): number {
    // Base confidence on number and quality of sources
    let confidence = 0.5;

    if (sources.length >= 3) confidence += 0.2;
    if (sources.length >= 5) confidence += 0.1;

    // Longer answer usually means more comprehensive
    if (answer.length > 500) confidence += 0.1;
    if (answer.length > 1000) confidence += 0.1;

    return Math.min(1.0, confidence);
  }
}

// Singleton instance
export const searchAgent = new PersonalizedSearchAgent();

