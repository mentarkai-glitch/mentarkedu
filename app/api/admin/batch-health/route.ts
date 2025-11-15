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

    // Get all batches with student IDs
    const { data: batchData } = await supabase
      .from("students")
      .select("batch, risk_score, user_id");

    if (!batchData) {
      return successResponse({ batches: [] });
    }

    // Get student IDs for each batch
    const batchGroups = batchData.reduce((acc: any, student) => {
      if (!acc[student.batch]) {
        acc[student.batch] = {
          students: [],
          risks: [],
          studentIds: [],
        };
      }
      acc[student.batch].students.push(student);
      acc[student.batch].risks.push(student.risk_score || 0);
      acc[student.batch].studentIds.push(student.user_id);
      return acc;
    }, {});

    // Fetch check-ins and engagement data for all students in batches
    const allStudentIds = batchData.map((s: any) => s.user_id);
    
    // Get motivation from daily check-ins (average mood/energy over last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: checkins } = await supabase
      .from("daily_checkins")
      .select("student_id, mood, energy_level")
      .in("student_id", allStudentIds)
      .gte("date", thirtyDaysAgo.toISOString().split('T')[0]);

    // Get engagement logs (last 30 days)
    const { data: engagementLogs } = await supabase
      .from("engagement_logs")
      .select("student_id, time_spent_minutes, login_count")
      .in("student_id", allStudentIds)
      .gte("date", thirtyDaysAgo.toISOString().split('T')[0]);

    // Get ARK completion data
    const { data: arks } = await supabase
      .from("arks")
      .select("student_id, status")
      .in("student_id", allStudentIds);

    // Calculate metrics per batch
    const batches = Object.entries(batchGroups).map(([batch, data]: [string, any]) => {
      const studentCount = data.students.length;
      const studentIds = data.studentIds;
      const highRiskCount = data.risks.filter((r: number) => r >= 70).length;
      const avgRisk = data.risks.reduce((a: number, b: number) => a + b, 0) / studentCount;

      // Calculate average motivation from check-ins (mood + energy / 2, normalized to 0-100)
      const batchCheckins = (checkins || []).filter((c: any) => studentIds.includes(c.student_id));
      let avgMotivation = 65; // Default
      if (batchCheckins.length > 0) {
        const totalMotivation = batchCheckins.reduce((sum: number, c: any) => {
          const mood = c.mood || 3; // Default to neutral (1-5 scale)
          const energy = c.energy_level || 3; // Default to neutral (1-5 scale)
          const combined = ((mood + energy) / 2) * 20; // Convert to 0-100 scale
          return sum + combined;
        }, 0);
        avgMotivation = Math.round(totalMotivation / batchCheckins.length);
      }

      // Calculate average engagement from engagement logs
      const batchEngagement = (engagementLogs || []).filter((e: any) => studentIds.includes(e.student_id));
      let avgEngagement = 70; // Default
      if (batchEngagement.length > 0) {
        const totalMinutes = batchEngagement.reduce((sum: number, e: any) => sum + (e.time_spent_minutes || 0), 0);
        const totalLogins = batchEngagement.reduce((sum: number, e: any) => sum + (e.login_count || 0), 0);
        // Engagement score: (avg daily minutes / 60) * 50 + (avg daily logins) * 10, capped at 100
        const avgDailyMinutes = totalMinutes / Math.max(batchEngagement.length, 1);
        const avgDailyLogins = totalLogins / Math.max(batchEngagement.length, 1);
        avgEngagement = Math.min(100, Math.round((avgDailyMinutes / 60) * 50 + avgDailyLogins * 10));
      }

      // Calculate completion rate from ARKs
      const batchArks = (arks || []).filter((a: any) => studentIds.includes(a.student_id));
      let completionRate = 55; // Default
      if (batchArks.length > 0) {
        const completedArks = batchArks.filter((a: any) => a.status === 'completed').length;
        completionRate = Math.round((completedArks / batchArks.length) * 100);
      }

      // Calculate health score (0-100)
      const healthScore = Math.max(
        0,
        Math.min(
          100,
          100 - (avgRisk * 0.7) + // Lower risk = higher score
          (studentCount >= 20 ? 10 : 0) + // Bonus for larger batches
          (avgMotivation / 10) + // Motivation contributes
          (avgEngagement / 10) + // Engagement contributes
          (completionRate / 10) // Completion contributes
        )
      );

      return {
        batch,
        student_count: studentCount,
        avg_motivation: avgMotivation,
        avg_engagement: avgEngagement,
        completion_rate: completionRate,
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

