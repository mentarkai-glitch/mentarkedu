import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

const DAYS_FOR_TREND = 14;

function getStudentName(student: any) {
  const user = Array.isArray(student?.users) ? student.users[0] : student?.users;
  const profileName = user?.profile_data?.full_name;
  if (profileName && profileName.trim()) return profileName;
  if (user?.full_name) return user.full_name;
  return "Student";
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

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

    const { data: predictions } = await supabase
      .from("risk_predictions")
      .select(
        `id, student_id, risk_level, dropout_risk_score, burnout_risk_score, disengagement_risk_score, prediction_date, primary_risk_factors, early_warning_flags,
        students!inner(
          user_id,
          batch,
          users(full_name, profile_data)
        )`
      )
      .order("prediction_date", { ascending: false })
      .limit(200);

    const { data: alerts } = await supabase
      .from("risk_alerts")
      .select(
        `id, student_id, alert_type, severity, risk_score, status, message, created_at,
        students!inner(
          user_id,
          batch,
          users(full_name, profile_data)
        )`
      )
      .order("created_at", { ascending: false })
      .limit(20);

    const levelCounts = { critical: 0, high: 0, medium: 0, low: 0 };
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DAYS_FOR_TREND);

    const trendMap = new Map<string, { total: number; count: number }>();

    const topHighRisk = (predictions || [])
      .filter((prediction) =>
        ["critical", "high"].includes(prediction.risk_level || "")
      )
      .map((prediction) => ({
        student_id: prediction.student_id,
        name: getStudentName(prediction.students),
        risk_level: prediction.risk_level,
        dropout_risk_score: prediction.dropout_risk_score || 0,
        burnout_risk_score: prediction.burnout_risk_score || 0,
        disengagement_risk_score: prediction.disengagement_risk_score || 0,
        prediction_date: prediction.prediction_date,
        primary_risk_factors: prediction.primary_risk_factors || [],
        early_warning_flags: prediction.early_warning_flags || [],
      }))
      .sort((a, b) => b.dropout_risk_score - a.dropout_risk_score)
      .slice(0, 5);

    (predictions || []).forEach((prediction) => {
      const level = prediction.risk_level as keyof typeof levelCounts;
      if (levelCounts[level] !== undefined) {
        levelCounts[level] += 1;
      }

      const predictionDate = new Date(prediction.prediction_date);
      if (predictionDate >= cutoffDate) {
        const key = predictionDate.toISOString().split("T")[0];
        const entry = trendMap.get(key) || { total: 0, count: 0 };
        entry.total += prediction.dropout_risk_score || 0;
        entry.count += 1;
        trendMap.set(key, entry);
      }
    });

    const riskTrend = Array.from(trendMap.entries())
      .map(([date, value]) => ({
        date,
        average_dropout_risk: value.count > 0 ? value.total / value.count : 0,
      }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));

    const alertsBySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    const openStatuses = new Set(["new", "acknowledged"]);

    (alerts || []).forEach((alert) => {
      const severity = alert.severity as keyof typeof alertsBySeverity;
      if (alertsBySeverity[severity] !== undefined) {
        alertsBySeverity[severity] += 1;
      }
    });

    const recentAlerts = (alerts || [])
      .filter((alert) => openStatuses.has(alert.status))
      .slice(0, 5)
      .map((alert) => ({
        id: alert.id,
        student_id: alert.student_id,
        name: getStudentName(alert.students),
        severity: alert.severity,
        status: alert.status,
        risk_score: alert.risk_score,
        alert_type: alert.alert_type,
        message: alert.message,
        created_at: alert.created_at,
      }));

    return successResponse({
      level_counts: levelCounts,
      risk_trend: riskTrend,
      top_high_risk: topHighRisk,
      alerts: {
        recent: recentAlerts,
        by_severity: alertsBySeverity,
        open_count: recentAlerts.length,
      },
    });
  } catch (error: any) {
    console.error("Risk insights fetch error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

