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

    // Get teacher's assigned batches
    const { data: teacher, error: teacherError } = await supabase
      .from("teachers")
      .select("assigned_batches")
      .eq("user_id", user.id)
      .single();

    if (teacherError || !teacher) {
      return errorResponse("Teacher not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const batch = searchParams.get("batch");
    const riskLevel = searchParams.get("risk_level");
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

    // Filter by assigned batches
    if (teacher.assigned_batches && teacher.assigned_batches.length > 0) {
      query = query.in("batch", teacher.assigned_batches);
    }

    // Apply additional filters
    if (batch && batch !== "all") {
      query = query.eq("batch", batch);
    }

    if (riskLevel && riskLevel !== "all") {
      const riskThresholds = {
        high: { min: 70 },
        medium: { min: 40, max: 69 },
        low: { max: 39 },
      };
      const threshold = riskThresholds[riskLevel as keyof typeof riskThresholds];
      if (threshold.min) query = query.gte("risk_score", threshold.min);
      if (threshold.max) query = query.lte("risk_score", threshold.max);
    }

    const { data: students, error } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Transform data
    const transformedStudents = students
      ?.map((student) => ({
        id: student.user_id,
        full_name: `${(student.users as any)?.profile_data?.first_name || ""} ${
          (student.users as any)?.profile_data?.last_name || ""
        }`.trim() || "Unknown",
        email: (student.users as any)?.email || "",
        avatar_url: (student.users as any)?.profile_data?.avatar_url,
        grade: student.grade,
        batch: student.batch,
        risk_score: student.risk_score,
        risk_level: student.risk_score >= 70 ? "high" : student.risk_score >= 40 ? "medium" : "low",
        active_arks: 0, // TODO: Calculate from arks table
        completed_arks: 0, // TODO: Calculate from arks table
      }))
      .filter((s) => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
          s.full_name.toLowerCase().includes(searchLower) ||
          s.email.toLowerCase().includes(searchLower) ||
          s.grade.toLowerCase().includes(searchLower) ||
          s.batch.toLowerCase().includes(searchLower)
        );
      });

    return successResponse({
      students: transformedStudents || [],
      total: transformedStudents?.length || 0,
    });
  } catch (error: any) {
    console.error("Teacher students fetch error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}
