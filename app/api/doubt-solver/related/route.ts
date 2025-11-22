import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext } from "@/lib/types";
import { safeParseJSON } from "@/lib/utils/json-repair";

async function requireStudentId(supabase: any): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: student } = await supabase
    .from("students")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  return student?.user_id ?? null;
}

/**
 * GET /api/doubt-solver/related
 * Get related doubts based on a question or topic
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const question = searchParams.get("question");
    const topic = searchParams.get("topic");
    const subject = searchParams.get("subject");
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    if (!question && !topic) {
      return errorResponse("Question or topic is required", 400);
    }

    // Get student's doubt history
    const { data: doubtHistory } = await supabase
      .from("doubt_solutions")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(100);

    // If we have question text, use AI to find semantically similar doubts
    let relatedDoubts: any[] = [];

    if (question) {
      // Build AI prompt for finding similar doubts
      const prompt = `Find similar or related questions from this doubt history that address the same concept or topic:

Current Question: "${question}"

Doubt History:
${doubtHistory?.slice(0, 50).map((d: any, idx: number) => 
  `${idx + 1}. Q: ${d.question || d.doubt_text || 'N/A'}\n   Topic: ${d.topic || 'Unknown'}\n   Subject: ${d.subject || 'Unknown'}`
).join('\n\n') || 'No previous doubts'}

Requirements:
- Find questions that address similar concepts, even if worded differently
- Consider topic and subject matching
- Return the most relevant ${limit} questions

Return a JSON array with this structure:
[
  {
    "id": "doubt_id or index",
    "question": "The similar question text",
    "topic": "Topic name",
    "subject": "Subject name",
    "similarityScore": 0.0-1.0,
    "reason": "Why this is similar (1 sentence)"
  }
]

Return ONLY the JSON array, no markdown formatting.`;

      // Use AI orchestrator to find similar doubts
      const aiContext: AIContext = {
        task: "doubt_analysis",
        user_id: studentId,
        metadata: {
          current_question: question,
          topic,
          subject,
          doubt_history_count: doubtHistory?.length || 0,
        },
      };

      const aiResponse = await aiOrchestrator(aiContext, prompt);

      try {
        // Parse AI response
        const jsonMatch = aiResponse.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          relatedDoubts = safeParseJSON(jsonMatch[0]);
        } else {
          relatedDoubts = safeParseJSON(aiResponse.content);
        }

        if (!Array.isArray(relatedDoubts)) {
          relatedDoubts = [];
        }

        // Map AI results to actual doubt records
        relatedDoubts = relatedDoubts
          .map((aiResult: any) => {
            // Try to find matching doubt by ID or by similarity
            const matchedDoubt = doubtHistory?.find((d: any) => {
              if (aiResult.id && d.id === aiResult.id) return true;
              if (d.question?.toLowerCase() === aiResult.question?.toLowerCase()) return true;
              if (d.doubt_text?.toLowerCase() === aiResult.question?.toLowerCase()) return true;
              return false;
            });

            if (matchedDoubt) {
              return {
                id: matchedDoubt.id,
                question: matchedDoubt.question || matchedDoubt.doubt_text || aiResult.question,
                topic: matchedDoubt.topic || aiResult.topic,
                subject: matchedDoubt.subject || aiResult.subject,
                solution: matchedDoubt.solution || matchedDoubt.answer,
                similarityScore: aiResult.similarityScore || 0.8,
                reason: aiResult.reason || "Similar topic or concept",
                createdAt: matchedDoubt.created_at,
                hasSolution: !!matchedDoubt.solution || !!matchedDoubt.answer,
              };
            }

            // If no match, return AI result (might be from other sources)
            return {
              id: aiResult.id || `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              question: aiResult.question,
              topic: aiResult.topic || topic,
              subject: aiResult.subject || subject,
              similarityScore: aiResult.similarityScore || 0.7,
              reason: aiResult.reason || "Related concept",
              hasSolution: false,
            };
          })
          .filter((d: any) => d.question)
          .slice(0, limit);
      } catch (parseError: any) {
        console.error("Failed to parse AI response:", parseError);
        relatedDoubts = [];
      }
    }

    // Fallback: If no AI results or if only topic/subject provided, find by topic/subject
    if (relatedDoubts.length === 0 && (topic || subject)) {
      let query = supabase
        .from("doubt_solutions")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (topic) {
        query = query.ilike("topic", `%${topic}%`);
      }

      if (subject) {
        query = query.ilike("subject", `%${subject}%`);
      }

      const { data: topicDoubts } = await query;

      relatedDoubts = (topicDoubts || []).map((d: any) => ({
        id: d.id,
        question: d.question || d.doubt_text,
        topic: d.topic,
        subject: d.subject,
        solution: d.solution || d.answer,
        similarityScore: 0.7,
        reason: "Same topic/subject",
        createdAt: d.created_at,
        hasSolution: !!d.solution || !!d.answer,
      }));
    }

    // Group by topic for better organization
    const groupedByTopic: Record<string, any[]> = {};
    relatedDoubts.forEach((doubt) => {
      const topicKey = doubt.topic || "Unknown";
      if (!groupedByTopic[topicKey]) {
        groupedByTopic[topicKey] = [];
      }
      groupedByTopic[topicKey].push(doubt);
    });

    return successResponse({
      relatedDoubts: relatedDoubts.slice(0, limit),
      groupedByTopic,
      totalFound: relatedDoubts.length,
      query: {
        question: question || null,
        topic: topic || null,
        subject: subject || null,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}





