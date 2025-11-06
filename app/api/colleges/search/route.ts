import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const city = searchParams.get("city");
    const type = searchParams.get("type");
    const tier = searchParams.get("tier");
    const course = searchParams.get("course");
    const limit = parseInt(searchParams.get("limit") || "20");

    const supabase = await createClient();

    let query = supabase
      .from("colleges")
      .select(`
        *,
        college_courses (
          id,
          name,
          degree,
          fees_total,
          average_salary,
          cutoff_last_year
        )
      `)
      .eq("is_active", true)
      .limit(limit);

    if (state) {
      query = query.eq("state", state);
    }

    if (city) {
      query = query.eq("city", city);
    }

    if (type) {
      query = query.eq("type", type);
    }

    if (tier) {
      query = query.eq("tier", tier);
    }

    // Search by course
    if (course) {
      query = query.contains("specializations", [course]);
    }

    const { data: colleges, error } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({
      colleges: colleges || [],
      total: colleges?.length || 0,
    });
  } catch (error: any) {
    console.error("College search error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}


