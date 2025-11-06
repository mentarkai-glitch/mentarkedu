import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const college_id = searchParams.get("college_id");
    const course_id = searchParams.get("course_id");
    const target_year = parseInt(searchParams.get("target_year") || String(new Date().getFullYear() + 1));

    const supabase = await createClient();

    let query = supabase
      .from("cutoff_predictions")
      .select(`
        *,
        colleges (
          id,
          name
        ),
        college_courses (
          id,
          name
        )
      `)
      .eq("target_year", target_year);

    if (college_id) {
      query = query.eq("college_id", college_id);
    }

    if (course_id) {
      query = query.eq("course_id", course_id);
    }

    const { data: predictions, error } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({
      predictions: predictions || [],
      target_year,
      total: predictions?.length || 0,
    });
  } catch (error: any) {
    console.error("Cutoff predictions error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}


