import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const topic = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");
    const examType = searchParams.get("exam_type");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("pyqs")
      .select("*", { count: "exact" });

    if (subject) query = query.eq("subject", subject);
    if (topic) query = query.eq("topic", topic);
    if (difficulty) query = query.eq("difficulty", difficulty);
    if (examType) query = query.eq("exam_type", examType);

    // Get random questions for practice
    const { data: questions, error, count } = await query
      .order("year", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Transform to practice question format
    const practiceQuestions = (questions || []).map((q: any) => ({
      id: q.id,
      question: q.question_text,
      options: q.options ? Object.values(q.options) : [],
      correctAnswer: q.correct_answer === "A" ? 0 : q.correct_answer === "B" ? 1 : q.correct_answer === "C" ? 2 : 3,
      explanation: q.explanation || "",
      difficulty: q.difficulty || "medium",
      topic: q.topic,
      subject: q.subject,
      exam_type: q.exam_type,
      year: q.year,
    }));

    return successResponse({
      questions: practiceQuestions,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("Practice questions error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

