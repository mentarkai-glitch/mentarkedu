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

    // Verify admin
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      return errorResponse("Admin access required", 403);
    }

    // Get institute_id
    const { data: userData } = await supabase
      .from("users")
      .select("institute_id")
      .eq("id", user.id)
      .single();

    const instituteId = userData?.institute_id;

    // Get total students in institute (via users table)
    const { count: totalStudents } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("institute_id", instituteId)
      .eq("role", "student");

    // Get total teachers
    const { count: totalTeachers } = await supabase
      .from("teachers")
      .select("*", { count: "exact", head: true });

    // Get ARKs
    const { count: activeArks } = await supabase
      .from("arks")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const { count: completedArks } = await supabase
      .from("arks")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    // Get risk distribution
    const { data: students } = await supabase
      .from("students")
      .select("risk_score");

    const riskDistribution = {
      high: students?.filter((s) => s.risk_score >= 70).length || 0,
      medium: students?.filter((s) => s.risk_score >= 40 && s.risk_score < 70).length || 0,
      low: students?.filter((s) => s.risk_score < 40).length || 0,
    };

    // Get student distribution by grade
    const { data: gradeData } = await supabase
      .from("students")
      .select("grade");

    const byGrade = gradeData?.reduce((acc: any, student) => {
      acc[student.grade] = (acc[student.grade] || 0) + 1;
      return acc;
    }, {});

    // Get student distribution by batch
    const { data: batchData } = await supabase
      .from("students")
      .select("batch");

    const byBatch = batchData?.reduce((acc: any, student) => {
      acc[student.batch] = (acc[student.batch] || 0) + 1;
      return acc;
    }, {});

    const analytics = {
      overview: {
        total_students: totalStudents || 0,
        total_teachers: totalTeachers || 0,
        active_arks: activeArks || 0,
        completed_arks: completedArks || 0,
        completion_rate: totalStudents
          ? Math.round(((completedArks || 0) / (totalStudents || 1)) * 100)
          : 0,
        engagement_rate: 75, // TODO: Calculate from daily check-ins
        growth_rate: 12.5, // TODO: Calculate month-over-month
        avg_students_per_teacher:
          totalTeachers && totalStudents ? Math.round(totalStudents / totalTeachers) : 0,
      },
      risk_distribution: riskDistribution,
      student_distribution: {
        by_grade: byGrade || {},
        by_batch: byBatch || {},
      },
    };

    return successResponse(analytics);
  } catch (error: any) {
    console.error("Analytics fetch error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}
