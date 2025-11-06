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
    const { data: teacher } = await supabase
      .from("teachers")
      .select("assigned_batches")
      .eq("user_id", user.id)
      .single();

    if (!teacher) {
      return errorResponse("Teacher not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const batch = searchParams.get("batch");

    if (!batch) {
      return errorResponse("batch parameter is required", 400);
    }

    // Get students in batch
    const { data: students } = await supabase
      .from("students")
      .select("user_id, risk_score")
      .eq("batch", batch);

    const studentCount = students?.length || 0;
    const highRiskCount = students?.filter((s) => s.risk_score >= 70).length || 0;
    const mediumRiskCount = students?.filter((s) => s.risk_score >= 40 && s.risk_score < 70).length || 0;
    const lowRiskCount = students?.filter((s) => s.risk_score < 40).length || 0;

    // Get ARKs in batch
    const { data: arks } = await supabase
      .from("arks")
      .select("status, progress")
      .in("student_id", students?.map((s) => s.user_id) || []);

    const activeArksCount = arks?.filter((a) => a.status === "active").length || 0;
    const completedArksCount = arks?.filter((a) => a.status === "completed").length || 0;
    const avgProgress = arks && arks.length > 0
      ? Math.round(arks.reduce((acc: number, a: any) => acc + a.progress, 0) / arks.length)
      : 0;

    // Get check-ins
    const { data: checkIns } = await supabase
      .from("daily_checkins")
      .select("energy, focus")
      .in("student_id", students?.map((s) => s.user_id) || []);

    const avgEnergy = checkIns && checkIns.length > 0
      ? Number((checkIns.reduce((acc: number, ci: any) => acc + ci.energy, 0) / checkIns.length).toFixed(1))
      : 0;
    const avgFocus = checkIns && checkIns.length > 0
      ? Number((checkIns.reduce((acc: number, ci: any) => acc + ci.focus, 0) / checkIns.length).toFixed(1))
      : 0;

    const analytics = {
      batch,
      student_count: studentCount,
      active_arks_count: activeArksCount,
      completed_arks_count: completedArksCount,
      avg_completion_rate: studentCount > 0 ? Math.round((completedArksCount / studentCount) * 100) : 0,
      avg_motivation: avgEnergy * 20, // Convert 1-5 scale to percentage
      avg_stress: 100 - avgFocus * 20, // Inverted for stress
      avg_confidence: avgFocus * 20,
      high_risk_count: highRiskCount,
      medium_risk_count: mediumRiskCount,
      low_risk_count: lowRiskCount,
    };

    return successResponse({ analytics });
  } catch (error: any) {
    console.error("Batch analytics error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}
