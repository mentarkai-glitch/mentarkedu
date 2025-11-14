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

    // Get teacher info
    const { data: teacher } = await supabase
      .from("teachers")
      .select("assigned_batches")
      .eq("user_id", user.id)
      .single();

    if (!teacher) {
      return errorResponse("Teacher not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const batch = searchParams.get("batch");

    if (!batch) {
      return errorResponse("batch parameter is required", 400);
    }

    // Get students in batch
    const { data: students } = await supabase
      .from("students")
      .select("user_id, risk_score")
      .eq("batch", batch);

    const studentCount = students?.length || 0;
    const highRiskCount = students?.filter((s) => s.risk_score >= 70).length || 0;
    const mediumRiskCount = students?.filter((s) => s.risk_score >= 40 && s.risk_score < 70).length || 0;
    const lowRiskCount = students?.filter((s) => s.risk_score < 40).length || 0;

    // Get ARKs in batch
    const { data: arks } = await supabase
      .from("arks")
      .select("status, progress")
      .in("student_id", students?.map((s) => s.user_id) || []);

    const activeArksCount = arks?.filter((a) => a.status === "active").length || 0;
    const completedArksCount = arks?.filter((a) => a.status === "completed").length || 0;
    const avgProgress = arks && arks.length > 0
      ? Math.round(arks.reduce((acc: number, a: any) => acc + a.progress, 0) / arks.length)
      : 0;

    // Get check-ins
    const { data: checkIns } = await supabase
      .from("daily_checkins")
      .select("energy, focus")
      .in("student_id", students?.map((s) => s.user_id) || []);

    const avgEnergy = checkIns && checkIns.length > 0
      ? Number((checkIns.reduce((acc: number, ci: any) => acc + ci.energy, 0) / checkIns.length).toFixed(1))
      : 0;
    const avgFocus = checkIns && checkIns.length > 0
      ? Number((checkIns.reduce((acc: number, ci: any) => acc + ci.focus, 0) / checkIns.length).toFixed(1))
      : 0;

    // Get practice questions data
    const { data: practiceSessions } = await supabase
      .from("practice_sessions")
      .select("total_questions, correct_answers, accuracy, started_at")
      .in("student_id", students?.map((s) => s.user_id) || []);

    const totalPracticeSessions = practiceSessions?.length || 0;
    const totalPracticeQuestions = practiceSessions?.reduce((sum: number, p: any) => sum + (p.total_questions || 0), 0) || 0;
    const totalCorrectAnswers = practiceSessions?.reduce((sum: number, p: any) => sum + (p.correct_answers || 0), 0) || 0;
    const avgPracticeAccuracy = totalPracticeQuestions > 0
      ? Math.round((totalCorrectAnswers / totalPracticeQuestions) * 100 * 100) / 100
      : 0;

    // Calculate engagement (practice sessions in last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentPracticeSessions = practiceSessions?.filter((p: any) => 
      new Date(p.started_at) >= weekAgo
    ).length || 0;
    const avgEngagement = studentCount > 0 
      ? Math.round((recentPracticeSessions / studentCount) * 100) / 100
      : 0;

    // Get period parameter for trends
    const periodParam = searchParams.get("period") || "week";
    const now = new Date();
    let startDate: Date;
    
    switch (periodParam) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "semester":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      default: // week
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Calculate trends
    const trends = {
      engagement: [] as Array<{ date: string; value: number }>,
      arks: [] as Array<{ date: string; completion_rate: number }>,
      practice: [] as Array<{ date: string; accuracy: number }>,
      risk: [] as Array<{ date: string; high: number; medium: number; low: number }>,
    };

    // Engagement trends (based on check-ins)
    const checkInsByDate = new Map<string, number>();
    (checkIns || []).forEach((ci: any) => {
      const date = new Date(ci.date || ci.created_at).toISOString().split("T")[0];
      checkInsByDate.set(date, (checkInsByDate.get(date) || 0) + 1);
    });

    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      trends.engagement.push({
        date: dateStr,
        value: (checkInsByDate.get(dateStr) || 0) / studentCount * 100,
      });
    }

    // ARK completion trends
    const completedArks = arks?.filter((a: any) => a.status === "completed") || [];
    const arksByDate = new Map<string, number>();
    completedArks.forEach((ark: any) => {
      if (ark.completed_at) {
        const date = new Date(ark.completed_at).toISOString().split("T")[0];
        arksByDate.set(date, (arksByDate.get(date) || 0) + 1);
      }
    });

    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      trends.arks.push({
        date: dateStr,
        completion_rate: studentCount > 0 ? (arksByDate.get(dateStr) || 0) / studentCount * 100 : 0,
      });
    }

    // Practice accuracy trends
    const practiceByDate = new Map<string, { correct: number; total: number }>();
    (practiceSessions || []).forEach((p: any) => {
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
      });
    }

    // Top performers and needs attention
    const studentScores = students?.map((s: any) => {
      const studentArks = arks?.filter((a: any) => a.student_id === s.user_id) || [];
      const completedCount = studentArks.filter((a: any) => a.status === "completed").length;
      const studentPractice = practiceSessions?.filter((p: any) => p.student_id === s.user_id) || [];
      const practiceAcc = studentPractice.length > 0
        ? studentPractice.reduce((sum: number, p: any) => 
            sum + ((p.correct_answers || 0) / (p.total_questions || 1) * 100), 0) / studentPractice.length
        : 0;
      
      return {
        student_id: s.user_id,
        ark_completion: completedCount,
        practice_accuracy: practiceAcc,
        engagement: studentPractice.length,
        risk_score: s.risk_score,
      };
    }) || [];

    const topPerformers = studentScores
      .sort((a, b) => (b.ark_completion + b.practice_accuracy / 100) - (a.ark_completion + a.practice_accuracy / 100))
      .slice(0, 5)
      .map((s: any) => ({
        student_id: s.student_id,
        metrics: {
          ark_completion: s.ark_completion,
          practice_accuracy: Math.round(s.practice_accuracy),
          engagement: s.engagement,
        },
      }));

    const needsAttention = studentScores
      .filter((s: any) => s.risk_score >= 70 || s.engagement < 2)
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 5)
      .map((s: any) => ({
        student_id: s.student_id,
        issues: [
          s.risk_score >= 70 ? "High risk score" : null,
          s.engagement < 2 ? "Low engagement" : null,
          s.practice_accuracy < 50 ? "Low practice accuracy" : null,
        ].filter(Boolean) as string[],
      }));

    const analytics = {
      batch,
      student_count: studentCount,
      active_arks_count: activeArksCount,
      completed_arks_count: completedArksCount,
      avg_completion_rate: studentCount > 0 ? Math.round((completedArksCount / studentCount) * 100) : 0,
      avg_progress: Math.round(avgProgress),
      avg_motivation: Math.round(avgEnergy * 20),
      avg_stress: Math.round(100 - avgFocus * 20),
      avg_confidence: Math.round(avgFocus * 20),
      practice: {
        sessions: totalPracticeSessions,
        questions: totalPracticeQuestions,
        avg_accuracy: avgPracticeAccuracy,
        engagement: avgEngagement,
      },
      high_risk_count: highRiskCount,
      medium_risk_count: mediumRiskCount,
      low_risk_count: lowRiskCount,
      trends,
      top_performers: topPerformers,
      needs_attention: needsAttention,
      period: periodParam,
    };

    return successResponse({ analytics });
  } catch (error: any) {
    console.error("Batch analytics error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}
