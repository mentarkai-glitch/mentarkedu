import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { getMistakePatterns, analyzeMistakePatterns } from "@/lib/services/mistake-analyzer";

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
 * GET /api/practice/mistake-patterns
 * Get mistake patterns for the authenticated student
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic");
    const subject = searchParams.get("subject");
    const analyze = searchParams.get("analyze") === "true";

    if (analyze) {
      // Get detailed analysis
      const analysis = await analyzeMistakePatterns(
        studentId,
        topic || undefined,
        subject || undefined
      );

      return successResponse({ analysis });
    } else {
      // Get raw patterns
      const patterns = await getMistakePatterns(
        studentId,
        topic || undefined,
        subject || undefined
      );

      return successResponse({ patterns });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

