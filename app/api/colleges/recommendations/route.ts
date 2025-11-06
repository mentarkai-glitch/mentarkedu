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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category"); // 'safe', 'moderate', 'reach', 'dream'

    let query = supabase
      .from("college_recommendations")
      .select(`
        *,
        colleges (
          id,
          name,
          state,
          city,
          type,
          tier,
          nirf_rank
        ),
        college_courses (
          id,
          name,
          degree,
          fees_total,
          average_salary,
          placement_percentage
        )
      `)
      .eq("student_id", user.id)
      .order("match_score", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data: recommendations, error } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Group by category
    const byCategory = {
      safe: recommendations?.filter((r) => r.category === "safe") || [],
      moderate: recommendations?.filter((r) => r.category === "moderate") || [],
      reach: recommendations?.filter((r) => r.category === "reach") || [],
      dream: recommendations?.filter((r) => r.category === "dream") || [],
    };

    return successResponse({
      recommendations: recommendations || [],
      by_category: byCategory,
      total: recommendations?.length || 0,
    });
  } catch (error: any) {
    console.error("Recommendations fetch error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}


