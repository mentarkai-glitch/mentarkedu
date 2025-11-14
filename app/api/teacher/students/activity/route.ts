import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

async function requireTeacherId(supabase: any): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: teacher } = await supabase.from("teachers").select("user_id").eq("user_id", user.id).single();
  return teacher?.user_id ?? null;
}

/**
 * GET /api/teacher/students/activity
 * Get recent activity feed for a specific student
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const teacherId = await requireTeacherId(supabase);

    if (!teacherId) {
      return errorResponse("Teacher profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("student_id");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!studentId) {
      return errorResponse("student_id parameter is required", 400);
    }

    // Verify teacher has access to this student
    const { data: teacher } = await supabase
      .from("teachers")
      .select("assigned_batches")
      .eq("user_id", teacherId)
      .single();

    if (!teacher) {
      return errorResponse("Teacher not found", 404);
    }

    const { data: student } = await supabase
      .from("students")
      .select("batch")
      .eq("user_id", studentId)
      .single();

    if (!student || !teacher.assigned_batches?.includes(student.batch)) {
      return errorResponse("Student not found or not accessible", 404);
    }

    const activities: Array<{
      type: string;
      description: string;
      timestamp: string;
      metadata?: any;
    }> = [];

    // 1. Recent ARK completions
    const { data: recentArks } = await supabase
      .from("arks")
      .select("id, title, status, completed_at, created_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(10);

    (recentArks || []).forEach((ark: any) => {
      if (ark.status === "completed" && ark.completed_at) {
        activities.push({
          type: "ark_completed",
          description: `Completed ARK: ${ark.title}`,
          timestamp: ark.completed_at,
          metadata: { ark_id: ark.id },
        });
      } else if (ark.status === "active") {
        activities.push({
          type: "ark_created",
          description: `Started ARK: ${ark.title}`,
          timestamp: ark.created_at,
          metadata: { ark_id: ark.id },
        });
      }
    });

    // 2. Recent practice sessions
    const { data: practiceSessions } = await supabase
      .from("practice_sessions")
      .select("id, accuracy, total_questions, started_at")
      .eq("student_id", studentId)
      .order("started_at", { ascending: false })
      .limit(10);

    (practiceSessions || []).forEach((session: any) => {
      activities.push({
        type: "practice_session",
        description: `Completed practice session: ${Math.round(session.accuracy || 0)}% accuracy (${session.total_questions} questions)`,
        timestamp: session.started_at,
        metadata: { session_id: session.id, accuracy: session.accuracy },
      });
    });

    // 3. Recent check-ins
    const { data: checkins } = await supabase
      .from("daily_checkins")
      .select("id, energy, focus, emotion, date")
      .eq("student_id", studentId)
      .order("date", { ascending: false })
      .limit(10);

    (checkins || []).forEach((checkin: any) => {
      activities.push({
        type: "checkin",
        description: `Daily check-in: Energy ${checkin.energy}/5, Focus ${checkin.focus}/5`,
        timestamp: checkin.date,
        metadata: { checkin_id: checkin.id, emotion: checkin.emotion },
      });
    });

    // 4. Recent XP transactions
    const { data: xpTransactions } = await supabase
      .from("xp_transactions")
      .select("id, amount, source, description, created_at")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
      .limit(10);

    (xpTransactions || []).forEach((xp: any) => {
      if (xp.amount > 0) {
        activities.push({
          type: "xp_earned",
          description: `Earned ${xp.amount} XP: ${xp.description || xp.source}`,
          timestamp: xp.created_at,
          metadata: { xp_id: xp.id, amount: xp.amount },
        });
      }
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const limitedActivities = activities.slice(0, limit);

    return successResponse({
      student_id: studentId,
      activities: limitedActivities,
      total_count: activities.length,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

