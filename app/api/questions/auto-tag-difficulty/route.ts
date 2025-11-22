import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import { callGPT4o } from "@/lib/ai/models/openai";

/**
 * Auto-tag question difficulty using AI
 * POST /api/questions/auto-tag-difficulty
 * Body: { question_ids?: string[], batch_size?: number }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Check if user is admin
    const { data: admin } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!admin) {
      return errorResponse("Admin access required", 403);
    }

    const body = await request.json();
    const { question_ids, batch_size = 10 } = body;

    // Get questions to tag
    let query = supabase
      .from("pyqs")
      .select("id, question_text, options, subject, topic, difficulty");

    if (question_ids && question_ids.length > 0) {
      query = query.in("id", question_ids);
    } else {
      // Get questions without difficulty or with default 'medium'
      query = query.or("difficulty.is.null,difficulty.eq.medium").limit(100);
    }

    const { data: questions, error: fetchError } = await query;

    if (fetchError) {
      return errorResponse(fetchError.message, 500);
    }

    if (!questions || questions.length === 0) {
      return successResponse({ message: "No questions to tag", tagged: 0 });
    }

    // Process in batches
    const results = [];
    for (let i = 0; i < questions.length; i += batch_size) {
      const batch = questions.slice(i, i + batch_size);

      for (const question of batch) {
        try {
          const options = typeof question.options === "string" 
            ? JSON.parse(question.options) 
            : question.options || {};

          const optionsText = Object.entries(options)
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n");

          const prompt = `Analyze the difficulty level of this competitive exam question (JEE/NEET level).

Subject: ${question.subject || "General"}
Topic: ${question.topic || "General"}

Question:
${question.question_text}

Options:
${optionsText}

Consider:
1. Conceptual complexity
2. Number of steps required
3. Common mistakes students make
4. Typical performance on similar questions

Return ONLY one word: "easy", "medium", or "hard"

Difficulty:`;

          const aiResponse = await callGPT4o(prompt, { max_tokens: 10 });
          let difficulty = aiResponse.content.trim().toLowerCase();

          // Validate response
          if (!["easy", "medium", "hard"].includes(difficulty)) {
            // Fallback: analyze based on question length
            const wordCount = question.question_text.split(/\s+/).length;
            difficulty = wordCount < 30 ? "easy" : wordCount < 60 ? "medium" : "hard";
          }

          // Update question
          const { error: updateError } = await supabase
            .from("pyqs")
            .update({ difficulty })
            .eq("id", question.id);

          if (!updateError) {
            results.push({ id: question.id, difficulty, status: "success" });
          } else {
            results.push({ id: question.id, status: "error", error: updateError.message });
          }
        } catch (error: any) {
          results.push({ id: question.id, status: "error", error: error.message });
        }
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;

    return successResponse({
      message: `Tagged ${successCount} of ${questions.length} questions`,
      tagged: successCount,
      total: questions.length,
      results,
    });
  } catch (error: any) {
    console.error("Auto-tag difficulty error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

