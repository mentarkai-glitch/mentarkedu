import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { z } from "zod";

const submitTestSchema = z.object({
  attempt_id: z.string().uuid(),
  answers: z.array(z.object({
    question_id: z.string().uuid(),
    question_number: z.number(),
    selected_answer: z.enum(["A", "B", "C", "D"]).nullable(),
    is_skipped: z.boolean().default(false),
    is_marked_for_review: z.boolean().default(false),
    time_spent_seconds: z.number().default(0),
  })),
  time_spent_seconds: z.number().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const testId = id;
    const body = await request.json();
    const validated = submitTestSchema.parse(body);

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
      .eq("id", validated.attempt_id)
      .eq("student_id", student.user_id)
      .eq("test_id", testId)
      .single();

    if (attemptError || !attempt) {
      return errorResponse("Test attempt not found", 404);
    }

    if (attempt.status === "completed") {
      return errorResponse("Test already submitted", 400);
    }

    // Get test details for marking scheme
    const { data: test } = await supabase
      .from("mock_tests")
      .select("marking_scheme, total_marks")
      .eq("id", testId)
      .single();

    const markingScheme = test?.marking_scheme || { correct: 4, incorrect: -1, unanswered: 0 };

    // Process answers and calculate scores
    const answerInserts = [];
    let totalScore = 0;

    for (const answer of validated.answers) {
      // Get question details
      const { data: question } = await supabase
        .from("test_questions")
        .select("correct_answer, marks, negative_marks")
        .eq("id", answer.question_id)
        .single();

      if (!question) continue;

      const isCorrect = answer.selected_answer === question.correct_answer;
      let marksObtained = 0;

      if (answer.is_skipped || !answer.selected_answer) {
        marksObtained = markingScheme.unanswered || 0;
      } else if (isCorrect) {
        marksObtained = (markingScheme.correct || question.marks) as number;
      } else {
        marksObtained = (markingScheme.incorrect || -(question.negative_marks || 1)) as number;
      }

      totalScore += marksObtained;

      answerInserts.push({
        attempt_id: validated.attempt_id,
        question_id: answer.question_id,
        question_number: answer.question_number,
        selected_answer: answer.selected_answer,
        is_correct: isCorrect,
        is_skipped: answer.is_skipped,
        is_marked_for_review: answer.is_marked_for_review,
        time_spent_seconds: answer.time_spent_seconds,
        marks_obtained: marksObtained,
        answered_at: new Date().toISOString(),
      });
    }

    // Insert all answers
    if (answerInserts.length > 0) {
      const { error: answersError } = await supabase
        .from("test_attempt_answers")
        .upsert(answerInserts, { onConflict: "attempt_id,question_id" });

      if (answersError) throw answersError;
    }

    // Update attempt status
    const percentage = test?.total_marks 
      ? Math.round((totalScore / test.total_marks) * 100 * 100) / 100 
      : 0;

    const { data: updatedAttempt, error: updateError } = await supabase
      .from("test_attempts")
      .update({
        status: "completed",
        score: totalScore,
        percentage: percentage,
        submitted_at: new Date().toISOString(),
        time_spent_seconds: validated.time_spent_seconds || null,
      })
      .eq("id", validated.attempt_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Calculate rank estimate (simplified - would use ML model in production)
    const { data: allAttempts } = await supabase
      .from("test_attempts")
      .select("score, percentage")
      .eq("test_id", testId)
      .eq("status", "completed")
      .order("score", { ascending: false });

    const rank = allAttempts 
      ? allAttempts.findIndex((a) => a.score <= totalScore) + 1
      : 1;

    const percentile = allAttempts && allAttempts.length > 0
      ? Math.round(((allAttempts.length - rank) / allAttempts.length) * 100 * 100) / 100
      : 100;

    // Update rank and percentile
    await supabase
      .from("test_attempts")
      .update({ rank, percentile })
      .eq("id", validated.attempt_id);

    return successResponse({
      attempt: {
        ...updatedAttempt,
        rank,
        percentile,
      },
      message: "Test submitted successfully",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/mock-tests/[id]/submit",
      method: "POST",
    });
  }
}

