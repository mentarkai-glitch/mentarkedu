import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Check if user is admin
    const { data: admin } = await supabase
      .from("admins")
      .select("institute_id")
      .eq("user_id", user.id)
      .single();

    if (!admin) {
      return errorResponse("Admin access required", 403);
    }

    const batchId = params.id === "all" ? null : params.id;

    // Get students in batch
    let studentsQuery = supabase
      .from("students")
      .select(`
        id,
        user_id,
        users!inner (full_name, email),
        batch_id
      `)
      .eq("institute_id", admin.institute_id);

    if (batchId) {
      studentsQuery = studentsQuery.eq("batch_id", batchId);
    }

    const { data: students, error: studentsError } = await studentsQuery;

    if (studentsError) throw studentsError;

    if (!students || students.length === 0) {
      return successResponse({ students: [] });
    }

    const studentIds = students.map((s) => s.id);

    // Get risk scores for all students
    const { data: riskScores } = await supabase
      .from("student_risk_scores")
      .select("student_id, burnout_risk, dropout_risk, disengagement_risk, last_computed_at")
      .in("student_id", studentIds);

    // Get last activity from check-ins
    const { data: checkins } = await supabase
      .from("daily_checkins")
      .select("student_id, date")
      .in("student_id", studentIds)
      .order("date", { ascending: false });

    // Create a map of last activity
    const lastActivityMap = new Map<string, string>();
    checkins?.forEach((checkin) => {
      if (!lastActivityMap.has(checkin.student_id)) {
        lastActivityMap.set(checkin.student_id, checkin.date);
      }
    });

    // Process students with risk scores
    const radarData = students.map((student) => {
      const riskScore = riskScores?.find((r) => r.student_id === student.id);
      const overallRisk = riskScore
        ? Math.round(
            (riskScore.burnout_risk * 0.4 +
              riskScore.dropout_risk * 0.4 +
              riskScore.disengagement_risk * 0.2) *
              100
          )
        : 0;

      let status: "on_track" | "at_risk" | "critical";
      if (overallRisk >= 70) {
        status = "critical";
      } else if (overallRisk >= 40) {
        status = "at_risk";
      } else {
        status = "on_track";
      }

      const lastActivity = lastActivityMap.get(student.id);
      const daysSinceActivity = lastActivity
        ? Math.floor(
            (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24)
          )
        : 999;

      return {
        id: student.id,
        name: (student.users as any)?.full_name || "Unknown",
        riskScore: overallRisk,
        status,
        lastActivity: daysSinceActivity === 0
          ? "Today"
          : daysSinceActivity === 1
          ? "1 day ago"
          : daysSinceActivity < 7
          ? `${daysSinceActivity} days ago`
          : `${Math.floor(daysSinceActivity / 7)} weeks ago`,
        batch: batchId || "All Batches",
      };
    });

    return successResponse({ students: radarData });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/batches/[id]/radar",
      method: "GET",
    });
  }
}

