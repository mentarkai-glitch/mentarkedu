import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const testId = params.id;

    // Get student
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (studentError || !student) {
      return errorResponse("Student profile not found", 404);
    }

    // Get test details
    const { data: test, error: testError } = await supabase
      .from("mock_tests")
      .select("*")
      .eq("id", testId)
      .eq("is_active", true)
      .single();

    if (testError || !test) {
      return errorResponse("Test not found", 404);
    }

    // Check for existing in-progress attempt
    const { data: existingAttempt } = await supabase
      .from("test_attempts")
      .select("*")
      .eq("student_id", student.user_id)
      .eq("test_id", testId)
      .eq("status", "in_progress")
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    if (existingAttempt) {
      // Return existing attempt
      return successResponse({
        attempt_id: existingAttempt.id,
        test: test,
        started_at: existingAttempt.started_at,
        message: "Resuming existing attempt",
      });
    }

    // Create new attempt
    const { data: attempt, error: attemptError } = await supabase
      .from("test_attempts")
      .insert({
        student_id: student.user_id,
        test_id: testId,
        total_marks: test.total_marks,
        status: "in_progress",
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    // Get questions with answers (for test interface)
    const { data: questions, error: questionsError } = await supabase
      .from("test_questions")
      .select("*")
      .eq("test_id", testId)
      .order("question_number", { ascending: true });

    if (questionsError) throw questionsError;

    return successResponse({
      attempt_id: attempt.id,
      test: test,
      questions: questions || [],
      started_at: attempt.started_at,
      message: "Test started successfully",
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/mock-tests/[id]/start",
      method: "POST",
    });
  }
}

