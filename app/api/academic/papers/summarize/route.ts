import { NextRequest } from "next/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { paperId, title, abstract, authors, year, url } = body;

    if (!paperId || !title || !abstract) {
      return errorResponse("Paper ID, title, and abstract are required", 400);
    }

    // Generate AI summary using orchestrator
    const prompt = `You are an academic research assistant. Create a comprehensive summary of this research paper.

**Title:** ${title}
**Authors:** ${authors ? authors.map((a: any) => a.name || a).join(", ") : "Unknown"}
**Year:** ${year || "Unknown"}
**Abstract:** ${abstract}

Provide a structured summary with:
1. Key Contributions (2-3 main points)
2. Methodology (brief overview)
3. Key Findings (most important results)
4. Implications (why this matters)
5. Related Topics (keywords/topics for further reading)
6. Complexity Level (beginner/intermediate/advanced)

Return ONLY a JSON object:
{
  "keyContributions": ["contribution1", "contribution2"],
  "methodology": "Brief methodology description",
  "keyFindings": ["finding1", "finding2"],
  "implications": "Why this research matters",
  "relatedTopics": ["topic1", "topic2"],
  "complexityLevel": "intermediate",
  "estimatedReadTime": 30,
  "quickSummary": "One-sentence summary"
}`;

    const aiContext: AIContext = {
      task: "research",
      session_id: `paper_summarize_${paperId}_${Date.now()}`,
      user_id: user.id,
      metadata: {
        system_prompt: "You are an expert academic paper summarizer creating clear, structured summaries.",
      },
    };

    const aiResponse = await aiOrchestrator(aiContext, prompt);

    // Parse JSON response
    const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return errorResponse("Failed to parse AI summary response", 500);
    }

    const summary = JSON.parse(jsonMatch[0]);

    return successResponse({
      paperId,
      summary,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Paper summarization error:", error);
    return errorResponse(error.message || "Failed to summarize paper", 500);
  }
}

