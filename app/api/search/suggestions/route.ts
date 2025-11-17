import { NextRequest } from "next/server";
import { searchAgent } from "@/lib/services/search-agent";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import { createClient } from "@/lib/supabase/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { safeParseJSON } from "@/lib/utils/json-repair";
import type { AIContext } from "@/lib/types";

/**
 * Search Suggestions Endpoint
 * GET /api/search/suggestions?q=query&ctx=context
 * 
 * Returns AI-powered search suggestions based on partial query
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const context = (searchParams.get("ctx") || "general") as "academic" | "career" | "personal" | "general";

    if (!query || query.length < 2) {
      return successResponse([]);
    }

    // Get user context for personalized suggestions
    let studentProfile: any = null;
    if (user?.id) {
      const { data: student } = await supabase
        .from("students")
        .select("onboarding_profile, interests, goals, grade")
        .eq("user_id", user.id)
        .single();
      
      studentProfile = student;
    }

    // Generate AI-powered suggestions
    const suggestionsPrompt = `User is searching for: "${query}" in context: ${context}.
${studentProfile ? `
User Profile:
- Grade: ${studentProfile.grade || "Not specified"}
- Interests: ${(studentProfile.interests || []).join(", ") || "Not specified"}
- Goals: ${(studentProfile.goals || []).join(", ") || "Not specified"}
` : ""}
Generate 5 helpful search query suggestions that would be relevant. Return ONLY a JSON array of strings, no other text.
Example format: ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4", "suggestion 5"]`;

    try {
      const aiResponse = await aiOrchestrator({
        user_id: user?.id,
        task: "resource_recommendation",
      } as AIContext, suggestionsPrompt);

      if (aiResponse.content) {
        // Try to parse JSON array from response
        const jsonMatch = aiResponse.content.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          const parsed = safeParseJSON(jsonMatch[0]);
          if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            return successResponse(parsed.slice(0, 5));
          }
        }

        // Fallback: try to parse the entire content
        const parsed = safeParseJSON(aiResponse.content);
        if (parsed && Array.isArray(parsed)) {
          return successResponse(parsed.slice(0, 5));
        }
      }
    } catch (aiError) {
      console.error("AI suggestions failed, using keyword-based suggestions:", aiError);
    }

    // Fallback: Generate basic keyword-based suggestions
    const keywords = query.split(" ").filter(w => w.length > 2);
    const basicSuggestions: string[] = [];

    if (keywords.length > 0) {
      const questionWords = ["what", "how", "why", "when", "where", "which", "who"];
      const actionWords = ["learn", "study", "understand", "explain", "find", "get"];
      
      questionWords.forEach(qw => {
        if (!query.toLowerCase().startsWith(qw)) {
          basicSuggestions.push(`${qw} ${query}`);
        }
      });

      actionWords.forEach(aw => {
        if (!query.toLowerCase().includes(aw)) {
          basicSuggestions.push(`${aw} ${query}`);
        }
      });

      // Add context-specific suggestions
      if (context === "academic") {
        basicSuggestions.push(`courses on ${query}`);
        basicSuggestions.push(`tutorials for ${query}`);
      } else if (context === "career") {
        basicSuggestions.push(`careers in ${query}`);
        basicSuggestions.push(`jobs related to ${query}`);
      }
    }

    return successResponse([...new Set(basicSuggestions)].slice(0, 5));
  } catch (error: any) {
    console.error("Suggestions error:", error);
    return errorResponse(error.message || "Failed to generate suggestions", 500);
  }
}

