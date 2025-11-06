import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const college_id = searchParams.get("college_id");
    const degree = searchParams.get("degree");

    const supabase = await createClient();

    let query = supabase
      .from("college_courses")
      .select(`
        *,
        colleges (
          id,
          name,
          state,
          city,
          type,
          tier
        )
      `);

    if (college_id) {
      query = query.eq("college_id", college_id);
    }

    if (degree) {
      query = query.eq("degree", degree);
    }

    const { data: courses, error } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({
      courses: courses || [],
      total: courses?.length || 0,
    });
  } catch (error: any) {
    console.error("Course search error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}


