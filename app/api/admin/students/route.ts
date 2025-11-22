import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      return errorResponse("Admin access required", 403);
    }

    // Get search params
    const { searchParams } = new URL(request.url);
    const batch = searchParams.get("batch");
    const grade = searchParams.get("grade");
    const search = searchParams.get("search");

    // Build query
    let query = supabase
      .from("students")
      .select(`
        user_id,
        grade,
        batch,
        interests,
        goals,
        risk_score,
        users (
          id,
          email,
          profile_data
        )
      `);

    if (batch) {
      query = query.eq("batch", batch);
    }
    if (grade) {
      query = query.eq("grade", grade);
    }

    const { data: students, error } = await query.order("created_at", { ascending: false }).limit(500);

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Transform and filter
    let transformedStudents = students?.map((student) => ({
      id: student.user_id,
      email: (student.users as any)?.email || "",
      full_name: `${(student.users as any)?.profile_data?.first_name || ""} ${
        (student.users as any)?.profile_data?.last_name || ""
      }`.trim() || "Unknown",
      grade: student.grade,
      batch: student.batch,
      interests: student.interests || [],
      goals: student.goals || [],
      risk_score: student.risk_score || 0,
    })) || [];

    // Client-side search filter
    if (search) {
      const searchLower = search.toLowerCase();
      transformedStudents = transformedStudents.filter(
        (s) =>
          s.full_name.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower) ||
          s.batch.toLowerCase().includes(searchLower)
      );
    }

    return successResponse({
      students: transformedStudents,
      total: transformedStudents.length,
    });
  } catch (error: any) {
    console.error("Failed to fetch admin student list", error);
    return errorResponse(error?.message || "Internal server error", 500);
  }
}
