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
      if (threshold && "min" in threshold) query = query.gte("risk_score", threshold.min);
      if (threshold && "max" in threshold) query = query.lte("risk_score", threshold.max);
    }

    const { data: students, error } = await query;

    if (error) {
      return errorResponse(error.message, 500);
    }

    // Get ARKs for all students
    const studentIds = students?.map((s) => s.user_id) || [];
    const { data: arksData } = await supabase
      .from("arks")
      .select("id, student_id, status")
      .in("student_id", studentIds);

    // Get practice sessions for engagement score
    const { data: practiceData } = await supabase
      .from("practice_sessions")
      .select("student_id, started_at")
      .in("student_id", studentIds)
      .gte("started_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    // Get last activity from daily checkins
    const { data: checkinsData } = await supabase
      .from("daily_checkins")
      .select("student_id, date")
      .in("student_id", studentIds)
      .order("date", { ascending: false })
      .limit(500);

    // Calculate ARK counts per student
    const arksByStudent = new Map<string, { active: number; completed: number }>();
    (arksData || []).forEach((ark: any) => {
      const existing = arksByStudent.get(ark.student_id) || { active: 0, completed: 0 };
      if (ark.status === "active") existing.active++;
      if (ark.status === "completed") existing.completed++;
      arksByStudent.set(ark.student_id, existing);
    });

    // Calculate engagement scores (practice sessions in last 7 days)
    const engagementByStudent = new Map<string, number>();
    (practiceData || []).forEach((p: any) => {
      engagementByStudent.set(p.student_id, (engagementByStudent.get(p.student_id) || 0) + 1);
    });

    // Get last activity dates
    const lastActivityByStudent = new Map<string, string>();
    (checkinsData || []).forEach((c: any) => {
      if (!lastActivityByStudent.has(c.student_id)) {
        lastActivityByStudent.set(c.student_id, c.date);
      }
    });

    // Transform data
    const transformedStudents = students
      ?.map((student) => {
        const arks = arksByStudent.get(student.user_id) || { active: 0, completed: 0 };
        const engagement = engagementByStudent.get(student.user_id) || 0;
        const lastActivity = lastActivityByStudent.get(student.user_id);
        
        return {
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
          active_arks: arks.active,
          completed_arks: arks.completed,
          engagement_score: Math.min(engagement * 10, 100), // 0-100 scale
          last_activity: lastActivity || null,
          interests: student.interests || [],
          goals: student.goals || [],
        };
      })
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
