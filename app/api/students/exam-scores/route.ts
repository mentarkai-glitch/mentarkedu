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

    const { data: scores, error } = await supabase
      .from("student_exam_scores")
      .select("*")
      .eq("student_id", user.id)
      .order("exam_year", { ascending: false });

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({
      scores: scores || [],
      total: scores?.length || 0,
    });
  } catch (error: any) {
    console.error("Exam scores fetch error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { exam_type, exam_year, marks_obtained, max_marks, rank, percentile, category } = body;

    if (!exam_type || !exam_year || !marks_obtained) {
      return errorResponse("exam_type, exam_year, and marks_obtained are required", 400);
    }

    const examScore = {
      student_id: user.id,
      exam_type,
      exam_year,
      marks_obtained,
      max_marks,
      rank,
      percentile,
      category,
      percentage: max_marks ? (marks_obtained / max_marks) * 100 : null,
    };

    const { data, error } = await supabase
      .from("student_exam_scores")
      .upsert(examScore, {
        onConflict: "student_id,exam_type,exam_year",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error: any) {
    console.error("Exam score save error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}


