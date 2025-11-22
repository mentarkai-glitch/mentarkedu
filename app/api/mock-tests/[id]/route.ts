import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function GET(
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

    // Get questions (without answers for security)
    const { data: questions, error: questionsError } = await supabase
      .from("test_questions")
      .select("id, question_number, question_text, question_image_url, options, subject, topic, difficulty, marks")
      .eq("test_id", testId)
      .order("question_number", { ascending: true });

    if (questionsError) throw questionsError;

    // Get student's previous attempts
    const { data: student } = await supabase
      .from("students")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    let attempts = [];
    if (student) {
      const { data: studentAttempts } = await supabase
        .from("test_attempts")
        .select("*")
        .eq("student_id", student.user_id)
        .eq("test_id", testId)
        .order("started_at", { ascending: false })
        .limit(5);

      attempts = studentAttempts || [];
    }

    return successResponse({
      ...test,
      questions: questions || [],
      previous_attempts: attempts,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/mock-tests/[id]",
      method: "GET",
    });
  }
}

