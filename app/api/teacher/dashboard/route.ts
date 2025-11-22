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

    // Get teacher info
    const { data: teacher, error: teacherError } = await supabase
      .from("teachers")
      .select("assigned_batches, specialization")
      .eq("user_id", user.id)
      .single();

    if (teacherError || !teacher) {
      return errorResponse("Teacher not found", 404);
    }

    // Get students in assigned batches
    const { data: students } = await supabase
      .from("students")
      .select("user_id, risk_score, batch")
      .in("batch", teacher.assigned_batches || []);

    const studentCount = students?.length || 0;
    const highRiskCount = students?.filter((s) => s.risk_score >= 70).length || 0;
    const activeBatches = new Set(students?.map((s) => s.batch) || []).size;

    // Get recent interventions
    const { data: recentInterventions } = await supabase
      .from("interventions")
      .select("id, status, priority, created_at")
      .in("student_id", students?.map((s) => s.user_id) || [])
      .order("created_at", { ascending: false })
      .limit(10);

    const pendingInterventions = recentInterventions?.filter((i) => i.status === "pending").length || 0;

    // Get ARKs
    const { data: arks } = await supabase
      .from("arks")
      .select("status")
      .in("student_id", students?.map((s) => s.user_id) || []);

    const activeArks = arks?.filter((a) => a.status === "active").length || 0;
    const completedArks = arks?.filter((a) => a.status === "completed").length || 0;

    return successResponse({
      stats: {
        total_students: studentCount,
        active_batches: activeBatches,
        high_risk_students: highRiskCount,
        pending_interventions: pendingInterventions,
        active_arks: activeArks,
        completed_arks: completedArks,
      },
      assigned_batches: teacher.assigned_batches || [],
      specialization: teacher.specialization || [],
    });
  } catch (error: any) {
    console.error("Teacher dashboard error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

