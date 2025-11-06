import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import type { AIContext } from "@/lib/types";

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

    // Get high-risk students
    const { data: highRiskStudents, error } = await supabase
      .from("students")
      .select(`
        user_id,
        grade,
        batch,
        risk_score,
        dropout_predictions (
          risk_score,
          factors,
          predicted_date,
          recommended_interventions
        ),
        users (
          id,
          email,
          profile_data
        )
      `)
      .gte("risk_score", 60)
      .order("risk_score", { ascending: false });

    if (error) {
      return errorResponse(error.message, 500);
    }

    const alerts = highRiskStudents?.map((student) => ({
      student_id: student.user_id,
      student_name: `${(student.users as any)?.profile_data?.first_name || ""} ${
        (student.users as any)?.profile_data?.last_name || ""
      }`.trim() || "Unknown",
      email: (student.users as any)?.email || "",
      grade: student.grade,
      batch: student.batch,
      risk_score: student.risk_score,
      risk_level: student.risk_score >= 80 ? "critical" : student.risk_score >= 70 ? "high" : "medium",
      prediction: (student as any).dropout_predictions?.[0] || null,
      timestamp: new Date().toISOString(),
    }));

    return successResponse({
      alerts: alerts || [],
      total: alerts?.length || 0,
      critical: alerts?.filter((a) => a.risk_level === "critical").length || 0,
      high: alerts?.filter((a) => a.risk_level === "high").length || 0,
    });
  } catch (error: any) {
    console.error("Dropout alerts fetch error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { student_id, intervention_type, notes } = body;

    if (!student_id || !intervention_type) {
      return errorResponse("student_id and intervention_type are required", 400);
    }

    // Store intervention action
    const { data, error } = await supabase
      .from("interventions")
      .insert({
        student_id,
        teacher_id: user.id,
        type: "alert_response",
        title: "Dropout Alert Response",
        content: notes || "Admin responded to dropout alert",
        priority: "urgent",
        status: "in_progress",
        metadata: {
          intervention_type,
          triggered_by: "dropout_prediction",
        },
      })
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({
      intervention: data,
      message: "Intervention created successfully",
    });
  } catch (error: any) {
    console.error("Dropout intervention error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

