import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { updateAdaptiveDifficulty } from "@/lib/services/adaptive-difficulty";
import { recordMistakePattern, analyzeMistakePatterns } from "@/lib/services/mistake-analyzer";
import { addMistakeToSpacedRepetition } from "@/lib/services/spaced-repetition-mistakes";
import type { PracticeAttempt } from "@/lib/types";

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
 * POST /api/practice/attempts
 * Record a practice question attempt and update analytics
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const body = await request.json();
    const {
      question_id,
      session_id,
      selected_answer_index,
      time_spent_seconds,
    } = body;

    if (!question_id) {
      return errorResponse("question_id is required", 400);
    }

    // Get question to check correct answer
    const { data: question, error: questionError } = await supabase
      .from("practice_questions")
      .select("*")
      .eq("id", question_id)
      .single();

    if (questionError || !question) {
      return errorResponse("Question not found", 404);
    }

    // Check if attempt is correct
    const isCorrect = selected_answer_index === question.correct_answer_index;

    // Record attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("practice_attempts")
      .insert({
        question_id,
        student_id: studentId,
        session_id: session_id || null,
        selected_answer_index: selected_answer_index ?? null,
        is_correct: isCorrect,
        time_spent_seconds: time_spent_seconds || null,
        attempted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    // Update practice session stats
    if (session_id) {
      const { data: session } = await supabase
        .from("practice_sessions")
        .select("total_questions, correct_answers")
        .eq("id", session_id)
        .single();

      if (session) {
        const newCorrectAnswers = isCorrect
          ? session.correct_answers + 1
          : session.correct_answers;

        await supabase
          .from("practice_sessions")
          .update({
            correct_answers: newCorrectAnswers,
            updated_at: new Date().toISOString(),
          })
          .eq("id", session_id);
      }
    }

    // Update adaptive difficulty
    if (question.topic) {
      await updateAdaptiveDifficulty(
        studentId,
        question.topic,
        isCorrect,
        question.subject || undefined
      );
    }

    // Record mistake pattern if incorrect
    if (!isCorrect && question.topic) {
      const mistakeAnalysis = {
        question_text: question.question_text,
        attempted_answer: question.options[selected_answer_index] || "",
        correct_answer: question.options[question.correct_answer_index] || "",
        topic: question.topic,
        subject: question.subject || undefined,
        time_spent_seconds: time_spent_seconds || undefined,
      };

      const mistakePattern = await recordMistakePattern(studentId, mistakeAnalysis);

      // Add to spaced repetition if mistake pattern created
      if (mistakePattern) {
        // Performance score: 0 for incorrect
        await addMistakeToSpacedRepetition(studentId, mistakePattern, 0);
      }
    }

    return successResponse({
      attempt: attempt as PracticeAttempt,
      is_correct: isCorrect,
      correct_answer_index: question.correct_answer_index,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

