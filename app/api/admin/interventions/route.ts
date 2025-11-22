import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");

    // Get all students in institute
    const { data: students } = await supabase
      .from("students")
      .select("id, user_id, users!inner (full_name)")
      .eq("institute_id", admin.institute_id);

    if (!students || students.length === 0) {
      return successResponse({ alerts: [] });
    }

    const studentIds = students.map((s) => s.id);

    // Get risk scores
    const { data: riskScores } = await supabase
      .from("student_risk_scores")
      .select("student_id, burnout_risk, dropout_risk, disengagement_risk")
      .in("student_id", studentIds);

    // Get interventions
    const { data: interventions } = await supabase
      .from("interventions")
      .select("*")
      .in("student_id", studentIds)
      .order("created_at", { ascending: false });

    // Get recent check-ins for context
    const { data: checkins } = await supabase
      .from("daily_checkins")
      .select("student_id, mood, energy, stress, date")
      .in("student_id", studentIds)
      .order("date", { ascending: false })
      .limit(500);

    // Get missed tasks/assignments
    const today = new Date().toISOString().split("T")[0];
    const { data: missedTasks } = await supabase
      .from("ark_tasks")
      .select(`
        id,
        student_id:ark_milestones!inner(arks!inner(student_id)),
        ark_milestones!inner(due_date)
      `)
      .lt("ark_milestones.due_date", today)
      .eq("completion_status", "pending");

    // Build alerts
    const alerts: any[] = [];

    riskScores?.forEach((risk) => {
      const student = students.find((s) => s.id === risk.student_id);
      if (!student) return;

      const overallRisk = Math.round(
        (risk.burnout_risk * 0.4 + risk.dropout_risk * 0.4 + risk.disengagement_risk * 0.2) * 100
      );

      let alertSeverity: "critical" | "high" | "medium" | "low";
      if (overallRisk >= 70) {
        alertSeverity = "critical";
      } else if (overallRisk >= 50) {
        alertSeverity = "high";
      } else if (overallRisk >= 30) {
        alertSeverity = "medium";
      } else {
        alertSeverity = "low";
      }

      // Filter by severity if specified
      if (severity && severity !== "all" && alertSeverity !== severity) {
        return;
      }

      // Get student's recent check-ins
      const studentCheckins = checkins?.filter((c) => c.student_id === risk.student_id) || [];
      const recentCheckins = studentCheckins.slice(0, 5);
      const avgMood = recentCheckins.length > 0
        ? recentCheckins.reduce((sum, c) => sum + (c.mood || 3), 0) / recentCheckins.length
        : 3;

      // Get missed tasks count
      const studentMissedTasks = missedTasks?.filter(
        (t: any) => t.student_id === risk.student_id
      ) || [];

      // Build risk factors
      const riskFactors: string[] = [];
      if (studentMissedTasks.length >= 3) {
        riskFactors.push(`Missed ${studentMissedTasks.length} assignments`);
      }
      if (avgMood < 2.5) {
        riskFactors.push(`Mood check-ins: 'Anxious' (${recentCheckins.length} days)`);
      }
      if (risk.dropout_risk > 0.7) {
        riskFactors.push("High dropout risk detected");
      }

      // Check if intervention exists
      const existingIntervention = interventions?.find(
        (i) => i.student_id === risk.student_id && i.status !== "resolved"
      );

      let alertStatus: "open" | "in_progress" | "resolved";
      if (existingIntervention) {
        alertStatus = existingIntervention.status === "in_progress" ? "in_progress" : "open";
      } else {
        alertStatus = "open";
      }

      // Filter by status if specified
      if (status && status !== "all" && alertStatus !== status) {
        return;
      }

      // Determine alert type
      let alertType = "general_risk";
      if (risk.dropout_risk > 0.7) {
        alertType = "dropout_risk";
      } else if (risk.burnout_risk > 0.7) {
        alertType = "burnout_risk";
      } else if (studentMissedTasks.length >= 3) {
        alertType = "performance_drop";
      }

      // Build message
      let message = "";
      if (alertType === "dropout_risk") {
        message = `Very high dropout risk. Student has not logged in recently.`;
      } else if (alertType === "burnout_risk") {
        message = `High burnout risk detected. Student has missed assignments and mood check-ins show consistent anxiety.`;
      } else if (alertType === "performance_drop") {
        message = `Significant performance drop detected in recent tests.`;
      } else {
        message = `Student shows elevated risk indicators requiring attention.`;
      }

      alerts.push({
        id: `alert-${risk.student_id}`,
        studentId: risk.student_id,
        studentName: (student.users as any)?.full_name || "Unknown",
        severity: alertSeverity,
        riskScore: overallRisk,
        alertType,
        message,
        status: alertStatus,
        createdAt: existingIntervention?.created_at || new Date().toISOString(),
        riskFactors: riskFactors.length > 0 ? riskFactors : ["General risk indicators"],
      });
    });

    // Sort by severity and risk score
    alerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (severityOrder[a.severity as keyof typeof severityOrder] !== severityOrder[b.severity as keyof typeof severityOrder]) {
        return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
      }
      return b.riskScore - a.riskScore;
    });

    return successResponse({ alerts });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/admin/interventions",
      method: "GET",
    });
  }
}

