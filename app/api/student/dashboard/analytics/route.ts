import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

async function requireStudentId(supabase: any): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: student } = await supabase.from("students").select("user_id").eq("user_id", user.id).single();
  return student?.user_id ?? null;
}

/**
 * GET /api/student/dashboard/analytics
 * Provides unified analytics for student dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week"; // week, month, semester

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "semester":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      default: // week
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // 1. ARKs Overview
    const { data: arksData } = await supabase
      .from("arks")
      .select("id, status, progress, created_at, completed_at")
      .eq("student_id", studentId);

    const activeArks = (arksData || []).filter((a: any) => a.status === "active");
    const completedArks = (arksData || []).filter((a: any) => a.status === "completed");
    const totalArks = arksData?.length || 0;

    // 2. Practice Questions Overview
    const { data: practiceData } = await supabase
      .from("practice_sessions")
      .select("total_questions, correct_answers, accuracy, started_at")
      .eq("student_id", studentId)
      .gte("started_at", startDate.toISOString());

    const totalPracticeSessions = practiceData?.length || 0;
    const totalPracticeQuestions = practiceData?.reduce((sum: number, p: any) => sum + (p.total_questions || 0), 0) || 0;
    const totalCorrectAnswers = practiceData?.reduce((sum: number, p: any) => sum + (p.correct_answers || 0), 0) || 0;
    const averagePracticeAccuracy = totalPracticeQuestions > 0 
      ? (totalCorrectAnswers / totalPracticeQuestions) * 100 
      : 0;

    // 3. Study Analyzer Overview
    const { data: studySessions } = await supabase
      .from("study_sessions")
      .select("duration_minutes, created_at")
      .eq("student_id", studentId)
      .gte("created_at", startDate.toISOString());

    const totalStudyHours = (studySessions || []).reduce((sum: number, s: any) => sum + ((s.duration_minutes || 0) / 60), 0);
    const totalStudySessions = studySessions?.length || 0;

    // 4. Daily Assistant Overview
    const { data: assistantTasks } = await supabase
      .from("daily_assistant_tasks")
      .select("status, created_at")
      .eq("student_id", studentId)
      .gte("created_at", startDate.toISOString());

    const completedTasks = (assistantTasks || []).filter((t: any) => t.status === "completed").length;
    const totalTasks = assistantTasks?.length || 0;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // 5. XP Overview
    const { data: xpData } = await supabase
      .from("xp_transactions")
      .select("amount, created_at")
      .eq("student_id", studentId)
      .gte("created_at", startDate.toISOString());

    const xpThisPeriod = (xpData || []).reduce((sum: number, xp: any) => sum + (xp.amount || 0), 0);

    // Get total XP and level
    const { data: statsData } = await supabase
      .from("student_stats")
      .select("xp_total, level")
      .eq("student_id", studentId)
      .single();

    // 6. Streak
    const { data: checkins } = await supabase
      .from("daily_checkins")
      .select("date")
      .eq("student_id", studentId)
      .order("date", { ascending: false })
      .limit(100);

    let currentStreak = 0;
    if (checkins && checkins.length > 0) {
      let expectedDate = new Date();
      expectedDate.setHours(0, 0, 0, 0);
      
      for (const checkin of checkins) {
        const checkinDate = new Date(checkin.date);
        checkinDate.setHours(0, 0, 0, 0);
        
        if (checkinDate.getTime() === expectedDate.getTime()) {
          currentStreak++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else if (checkinDate.getTime() < expectedDate.getTime()) {
          break;
        }
      }
    }

    // 7. Pending Items
    // Spaced Repetition Items
    const { data: srItems } = await supabase
      .from("spaced_repetition_queue")
      .select("id")
      .eq("student_id", studentId)
      .lte("due_at", new Date().toISOString());

    // Upcoming Deadlines (ARKs due in next 7 days)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const { data: upcomingArks } = await supabase
      .from("arks")
      .select("id, title, target_completion_date")
      .eq("student_id", studentId)
      .eq("status", "active")
      .lte("target_completion_date", nextWeek.toISOString())
      .not("target_completion_date", "is", null);

    // 8. Trends (daily for the period)
    const trends = {
      arks: [] as Array<{ date: string; completed: number }>,
      practice: [] as Array<{ date: string; accuracy: number; questions: number }>,
      xp: [] as Array<{ date: string; earned: number }>,
    };

    // ARK completion trends
    if (completedArks.length > 0) {
      const arksByDate = new Map<string, number>();
      completedArks.forEach((ark: any) => {
        if (ark.completed_at) {
          const date = new Date(ark.completed_at).toISOString().split("T")[0];
          arksByDate.set(date, (arksByDate.get(date) || 0) + 1);
        }
      });
      
      // Fill in missing dates with 0
      for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        trends.arks.push({
          date: dateStr,
          completed: arksByDate.get(dateStr) || 0,
        });
      }
    }

    // Practice trends
    if (practiceData && practiceData.length > 0) {
      const practiceByDate = new Map<string, { correct: number; total: number }>();
      practiceData.forEach((p: any) => {
        const date = new Date(p.started_at).toISOString().split("T")[0];
        const current = practiceByDate.get(date) || { correct: 0, total: 0 };
        practiceByDate.set(date, {
          correct: current.correct + (p.correct_answers || 0),
          total: current.total + (p.total_questions || 0),
        });
      });

      for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        const stats = practiceByDate.get(dateStr) || { correct: 0, total: 0 };
        trends.practice.push({
          date: dateStr,
          accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
          questions: stats.total,
        });
      }
    }

    // XP trends
    if (xpData && xpData.length > 0) {
      const xpByDate = new Map<string, number>();
      xpData.forEach((xp: any) => {
        const date = new Date(xp.created_at).toISOString().split("T")[0];
        xpByDate.set(date, (xpByDate.get(date) || 0) + (xp.amount || 0));
      });

      for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        trends.xp.push({
          date: dateStr,
          earned: xpByDate.get(dateStr) || 0,
        });
      }
    }

    return successResponse({
      overview: {
        arks: {
          active: activeArks.length,
          completed: completedArks.length,
          total: totalArks,
          avg_progress: activeArks.length > 0
            ? Math.round(activeArks.reduce((sum: number, a: any) => sum + (a.progress || 0), 0) / activeArks.length)
            : 0,
        },
        practice: {
          accuracy: Math.round(averagePracticeAccuracy * 100) / 100,
          sessions: totalPracticeSessions,
          questions: totalPracticeQuestions,
          correct: totalCorrectAnswers,
        },
        study: {
          hours: Math.round(totalStudyHours * 100) / 100,
          sessions: totalStudySessions,
          avg_session_hours: totalStudySessions > 0 ? Math.round((totalStudyHours / totalStudySessions) * 100) / 100 : 0,
        },
        daily_assistant: {
          tasks_completed: completedTasks,
          tasks_total: totalTasks,
          completion_rate: Math.round(taskCompletionRate * 100) / 100,
        },
        xp: {
          total: statsData?.xp_total || 0,
          this_period: xpThisPeriod,
          level: statsData?.level || 1,
        },
        streak: {
          current: currentStreak,
          longest: currentStreak, // TODO: Calculate longest streak from historical data
        },
      },
      trends,
      pending_items: {
        spaced_repetition: srItems?.length || 0,
        upcoming_deadlines: (upcomingArks || []).map((a: any) => ({
          ark_id: a.id,
          title: a.title,
          due_date: a.target_completion_date,
        })),
        practice_sessions: 0, // TODO: Calculate recommended practice sessions
      },
      period,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

