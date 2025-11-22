import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import { z } from "zod";

const saveAnswerSchema = z.object({
  question_id: z.string().uuid(),
  question_number: z.number(),
  selected_answer: z.enum(["A", "B", "C", "D"]).nullable(),
  is_skipped: z.boolean().default(false),
  is_marked_for_review: z.boolean().default(false),
  time_spent_seconds: z.number().default(0),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; attempt_id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { attempt_id } = params;
    const body = await request.json();
    const validated = saveAnswerSchema.parse(body);

    // Get student
    const { data: student } = await supabase
      .from("students")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    // Verify attempt belongs to student
    const { data: attempt, error: attemptError } = await supabase
      .from("test_attempts")
      .select("*")
      .eq("id", attempt_id)
      .eq("student_id", student.user_id)
      .single();

    if (attemptError || !attempt) {
      return errorResponse("Test attempt not found", 404);
    }

    if (attempt.status === "completed") {
      return errorResponse("Test already submitted", 400);
    }

    // Upsert answer (save or update)
    const { data: answer, error: answerError } = await supabase
      .from("test_attempt_answers")
      .upsert(
        {
          attempt_id: attempt_id,
          question_id: validated.question_id,
          question_number: validated.question_number,
          selected_answer: validated.selected_answer,
          is_skipped: validated.is_skipped,
          is_marked_for_review: validated.is_marked_for_review,
          time_spent_seconds: validated.time_spent_seconds,
          answered_at: new Date().toISOString(),
        },
        { onConflict: "attempt_id,question_id" }
      )
      .select()
      .single();

    if (answerError) {
      return errorResponse(answerError.message, 500);
    }

    return successResponse({
      answer,
      message: "Answer saved successfully",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return errorResponse(`Validation error: ${error.errors.map(e => e.message).join(", ")}`, 400);
    }
    console.error("Error saving answer:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; attempt_id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { attempt_id } = params;

    // Get student
    const { data: student } = await supabase
      .from("students")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    // Verify attempt belongs to student
    const { data: attempt, error: attemptError } = await supabase
      .from("test_attempts")
      .select("*")
      .eq("id", attempt_id)
      .eq("student_id", student.user_id)
      .single();

    if (attemptError || !attempt) {
      return errorResponse("Test attempt not found", 404);
    }

    // Get all saved answers for this attempt
    const { data: answers, error: answersError } = await supabase
      .from("test_attempt_answers")
      .select("*")
      .eq("attempt_id", attempt_id)
      .order("question_number", { ascending: true });

    if (answersError) {
      return errorResponse(answersError.message, 500);
    }

    // Transform to match frontend format
    const answersMap: Record<string, any> = {};
    answers?.forEach((answer) => {
      answersMap[answer.question_id] = {
        selected: answer.selected_answer,
        isMarked: answer.is_marked_for_review,
        timeSpent: answer.time_spent_seconds || 0,
      };
    });

    return successResponse({
      answers: answersMap,
      attempt: {
        id: attempt.id,
        status: attempt.status,
        started_at: attempt.started_at,
      },
    });
  } catch (error: any) {
    console.error("Error loading answers:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

