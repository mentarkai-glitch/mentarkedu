import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { z } from "zod";

const createTestSchema = z.object({
  exam_type: z.enum(["JEE_MAIN", "JEE_ADVANCED", "NEET", "AIIMS", "BITSAT", "WBJEE", "NDA", "CUSTOM"]),
  subject: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  year: z.number().optional(),
  total_questions: z.number().min(1).default(90),
  duration_minutes: z.number().min(1).default(180),
  total_marks: z.number().min(1).default(360),
  is_pyq: z.boolean().default(false),
  question_ids: z.array(z.string().uuid()).optional(), // For custom tests
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const examType = searchParams.get("exam_type");
    const subject = searchParams.get("subject");
    const isPyq = searchParams.get("is_pyq") === "true";
    const instituteId = searchParams.get("institute_id");

    // Build query
    let query = supabase
      .from("mock_tests")
      .select(`
        *,
        test_questions(count)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (examType) {
      query = query.eq("exam_type", examType);
    }

    if (subject) {
      query = query.eq("subject", subject);
    }

    if (isPyq) {
      query = query.eq("is_pyq", true);
    }

    if (instituteId) {
      query = query.eq("institute_id", instituteId);
    } else {
      // Show public tests (no institute_id) or user's institute tests
      const { data: student } = await supabase
        .from("students")
        .select("institute_id")
        .eq("user_id", user.id)
        .single();

      if (student?.institute_id) {
        query = query.or(`institute_id.is.null,institute_id.eq.${student.institute_id}`);
      } else {
        query = query.is("institute_id", null);
      }
    }

    const { data: tests, error } = await query;

    if (error) throw error;

    // Get attempt counts for each test
    const { data: student } = await supabase
      .from("students")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (student) {
      const testIds = tests?.map((t) => t.id) || [];
      if (testIds.length > 0) {
        const { data: attempts } = await supabase
          .from("test_attempts")
          .select("test_id, status")
          .eq("student_id", student.user_id)
          .in("test_id", testIds);

        // Add attempt info to tests
        tests?.forEach((test) => {
          const testAttempts = attempts?.filter((a) => a.test_id === test.id) || [];
          (test as any).attempts_count = testAttempts.length;
          (test as any).completed_count = testAttempts.filter((a) => a.status === "completed").length;
          (test as any).best_score = null; // Would need to calculate from attempts
        });
      }
    }

    return successResponse(tests || []);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/mock-tests",
      method: "GET",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Check if user is admin (for creating custom tests)
    const { data: admin } = await supabase
      .from("admins")
      .select("institute_id")
      .eq("user_id", user.id)
      .single();

    const body = await request.json();
    const validated = createTestSchema.parse(body);

    // Create test
    const { data: test, error: testError } = await supabase
      .from("mock_tests")
      .insert({
        institute_id: admin?.institute_id || null,
        exam_type: validated.exam_type,
        subject: validated.subject || null,
        title: validated.title,
        description: validated.description || null,
        year: validated.year || null,
        total_questions: validated.total_questions,
        duration_minutes: validated.duration_minutes,
        total_marks: validated.total_marks,
        is_pyq: validated.is_pyq,
        created_by: user.id,
      })
      .select()
      .single();

    if (testError) throw testError;

    // If question_ids provided, link questions to test
    if (validated.question_ids && validated.question_ids.length > 0) {
      // Update test_questions to link to this test
      const { error: linkError } = await supabase
        .from("test_questions")
        .update({ test_id: test.id })
        .in("id", validated.question_ids);

      if (linkError) {
        console.error("Error linking questions:", linkError);
        // Don't fail the request, just log
      }
    }

    return successResponse(test, "Mock test created successfully");
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/mock-tests",
      method: "POST",
    });
  }
}

