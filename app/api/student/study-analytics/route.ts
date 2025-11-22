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

    // Get student
    const { data: student } = await supabase
      .from("students")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      return errorResponse("Student not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "week";

    // Calculate date range
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

    // Get practice sessions
    const { data: practiceSessions } = await supabase
      .from("practice_sessions")
      .select("*")
      .eq("student_id", student.user_id)
      .gte("started_at", startDate.toISOString())
      .order("started_at", { ascending: false });

    // Get daily check-ins
    const { data: checkIns } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("student_id", student.user_id)
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date", { ascending: false });

    // Get test attempts
    const { data: testAttempts } = await supabase
      .from("test_attempts")
      .select("*, mock_tests!inner(exam_type, subject)")
      .eq("student_id", student.user_id)
      .gte("started_at", startDate.toISOString())
      .order("started_at", { ascending: false });

    // Calculate time spent per subject
    const timeBySubject = new Map<string, number>();
    (practiceSessions || []).forEach((session: any) => {
      const subject = session.subject || "General";
      const timeSpent = session.time_spent_minutes || 0;
      timeBySubject.set(subject, (timeBySubject.get(subject) || 0) + timeSpent);
    });

    // Calculate daily study time
    const studyTimeByDate = new Map<string, number>();
    (practiceSessions || []).forEach((session: any) => {
      const date = new Date(session.started_at).toISOString().split("T")[0];
      const timeSpent = session.time_spent_minutes || 0;
      studyTimeByDate.set(date, (studyTimeByDate.get(date) || 0) + timeSpent);
    });

    // Calculate average metrics from check-ins
    const avgEnergy =
      checkIns && checkIns.length > 0
        ? checkIns.reduce((sum: number, ci: any) => sum + (ci.energy || 0), 0) / checkIns.length
        : 0;
    const avgFocus =
      checkIns && checkIns.length > 0
        ? checkIns.reduce((sum: number, ci: any) => sum + (ci.focus || 0), 0) / checkIns.length
        : 0;
    const avgStress =
      checkIns && checkIns.length > 0
        ? checkIns.reduce((sum: number, ci: any) => sum + (ci.stress || 0), 0) / checkIns.length
        : 0;

    // Calculate accuracy trends
    const accuracyByDate = new Map<string, { correct: number; total: number }>();
    (practiceSessions || []).forEach((session: any) => {
      const date = new Date(session.started_at).toISOString().split("T")[0];
      const current = accuracyByDate.get(date) || { correct: 0, total: 0 };
      accuracyByDate.set(date, {
        correct: current.correct + (session.correct_answers || 0),
        total: current.total + (session.total_questions || 0),
      });
    });

    // Identify weak areas (low accuracy topics)
    const topicAccuracy = new Map<string, { correct: number; total: number }>();
    (practiceSessions || []).forEach((session: any) => {
      const topic = session.topic || "General";
      const current = topicAccuracy.get(topic) || { correct: 0, total: 0 };
      topicAccuracy.set(topic, {
        correct: current.correct + (session.correct_answers || 0),
        total: current.total + (session.total_questions || 0),
      });
    });

    const weakAreas = Array.from(topicAccuracy.entries())
      .map(([topic, stats]) => ({
        topic,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        attempts: stats.total,
      }))
      .filter((area) => area.accuracy < 60 && area.attempts >= 5)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    // Study patterns (best time of day)
    const timeOfDayStats = new Map<string, number>();
    (practiceSessions || []).forEach((session: any) => {
      const hour = new Date(session.started_at).getHours();
      const timeSlot =
        hour >= 5 && hour < 12
          ? "Morning"
          : hour >= 12 && hour < 17
          ? "Afternoon"
          : hour >= 17 && hour < 22
          ? "Evening"
          : "Night";
      timeOfDayStats.set(
        timeSlot,
        (timeOfDayStats.get(timeSlot) || 0) + (session.time_spent_minutes || 0)
      );
    });

    const bestStudyTime =
      timeOfDayStats.size > 0
        ? Array.from(timeOfDayStats.entries()).sort((a, b) => b[1] - a[1])[0][0]
        : "Evening";

    // Build timeline data
    const timeline = [];
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const studyTime = studyTimeByDate.get(dateStr) || 0;
      const accuracy = accuracyByDate.get(dateStr);
      timeline.push({
        date: dateStr,
        study_time_minutes: studyTime,
        accuracy: accuracy && accuracy.total > 0 ? (accuracy.correct / accuracy.total) * 100 : null,
        sessions: (practiceSessions || []).filter(
          (s: any) => new Date(s.started_at).toISOString().split("T")[0] === dateStr
        ).length,
      });
    }

    return successResponse({
      period,
      summary: {
        total_study_time_minutes: Array.from(studyTimeByDate.values()).reduce((a, b) => a + b, 0),
        total_sessions: practiceSessions?.length || 0,
        total_test_attempts: testAttempts?.length || 0,
        avg_energy: Math.round(avgEnergy * 20), // Convert 1-5 to 0-100
        avg_focus: Math.round(avgFocus * 20),
        avg_stress: Math.round(avgStress * 20),
      },
      time_by_subject: Array.from(timeBySubject.entries()).map(([subject, minutes]) => ({
        subject,
        minutes,
        hours: Math.round((minutes / 60) * 100) / 100,
      })),
      timeline,
      weak_areas: weakAreas,
      study_patterns: {
        best_time_of_day: bestStudyTime,
        time_of_day_distribution: Array.from(timeOfDayStats.entries()).map(([time, minutes]) => ({
          time,
          minutes,
        })),
      },
    });
  } catch (error: any) {
    console.error("Study analytics error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

