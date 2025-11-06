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

    // Get all batches
    const { data: batchData } = await supabase
      .from("students")
      .select("batch, risk_score");

    if (!batchData) {
      return successResponse({ batches: [] });
    }

    // Calculate metrics per batch
    const batchGroups = batchData.reduce((acc: any, student) => {
      if (!acc[student.batch]) {
        acc[student.batch] = {
          students: [],
          risks: [],
        };
      }
      acc[student.batch].students.push(student);
      acc[student.batch].risks.push(student.risk_score);
      return acc;
    }, {});

    const batches = Object.entries(batchGroups).map(([batch, data]: [string, any]) => {
      const studentCount = data.students.length;
      const highRiskCount = data.risks.filter((r: number) => r >= 70).length;
      const avgRisk = data.risks.reduce((a: number, b: number) => a + b, 0) / studentCount;

      // Calculate health score (0-100)
      const healthScore = Math.max(
        0,
        Math.min(
          100,
          100 - (avgRisk * 0.7) + // Lower risk = higher score
          (studentCount >= 20 ? 10 : 0) // Bonus for larger batches
        )
      );

      return {
        batch,
        student_count: studentCount,
        avg_motivation: 65, // TODO: Calculate from check-ins
        avg_engagement: 70, // TODO: Calculate from activity
        completion_rate: 55, // TODO: Calculate from ARKs
        high_risk_count: highRiskCount,
        health_score: Math.round(healthScore),
      };
    });

    return successResponse({ batches });
  } catch (error: any) {
    console.error("Batch health fetch error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

