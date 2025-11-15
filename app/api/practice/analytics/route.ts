import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { analyzeMistakePatterns } from "@/lib/services/mistake-analyzer";
import type { PracticeAnalytics, DifficultyLevel } from "@/lib/types";

async function requireStudentId(supabase: any): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: student } = await supabase
    .from("students")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  return student?.user_id ?? null;
}

/**
 * GET /api/practice/analytics
 * Get comprehensive practice analytics for the authenticated student
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic");
    const subject = searchParams.get("subject");
    const days = parseInt(searchParams.get("days") || "30", 10);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get practice sessions
    let sessionsQuery = supabase
      .from("practice_sessions")
      .select("*")
      .eq("student_id", studentId)
      .gte("started_at", startDate.toISOString())
      .not("completed_at", "is", null);

    if (topic) {
      sessionsQuery = sessionsQuery.eq("topic", topic);
    }

    if (subject) {
      sessionsQuery = sessionsQuery.eq("subject", subject);
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery;

    if (sessionsError) throw sessionsError;

    // Get practice attempts
    let attemptsQuery = supabase
      .from("practice_attempts")
      .select(`
        *,
        practice_questions (
          topic,
          subject,
          difficulty
        )
      `)
      .eq("student_id", studentId)
      .gte("attempted_at", startDate.toISOString());

    if (topic) {
      attemptsQuery = attemptsQuery.eq("practice_questions.topic", topic);
    }

    if (subject) {
      attemptsQuery = attemptsQuery.eq("practice_questions.subject", subject);
    }

    const { data: attempts, error: attemptsError } = await attemptsQuery;

    if (attemptsError) throw attemptsError;

    // Calculate aggregate metrics
    const totalSessions = sessions?.length || 0;
    const totalQuestions = attempts?.length || 0;
    const correctAnswers = attempts?.filter((a: any) => a.is_correct).length || 0;
    const averageAccuracy = totalQuestions > 0 
      ? (correctAnswers / totalQuestions) * 100 
      : 0;

    // Calculate total time spent
    const totalTimeSpentSeconds = sessions?.reduce(
      (sum: number, s: any) => sum + (s.time_spent_seconds || 0),
      0
    ) || 0;

    // Calculate accuracy trend (daily)
    const accuracyTrend: Array<{ date: string; accuracy: number; questions: number }> = [];
    const dailyStats: Record<string, { correct: number; total: number }> = {};

    attempts?.forEach((attempt: any) => {
      const date = new Date(attempt.attempted_at).toISOString().split("T")[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { correct: 0, total: 0 };
      }
      dailyStats[date].total++;
      if (attempt.is_correct) {
        dailyStats[date].correct++;
      }
    });

    Object.entries(dailyStats).forEach(([date, stats]) => {
      accuracyTrend.push({
        date,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        questions: stats.total,
      });
    });

    accuracyTrend.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate topic breakdown
    const topicStats: Record<string, {
      topic: string;
      subject?: string;
      attempts: number;
      correct: number;
      accuracy: number;
      average_difficulty: DifficultyLevel;
      difficulties: Record<DifficultyLevel, number>;
    }> = {};

    attempts?.forEach((attempt: any) => {
      const question = attempt.practice_questions;
      if (!question) return;

      const topicKey = `${question.topic || "unknown"}:${question.subject || "unknown"}`;
      
      if (!topicStats[topicKey]) {
        topicStats[topicKey] = {
          topic: question.topic || "unknown",
          subject: question.subject || undefined,
          attempts: 0,
          correct: 0,
          accuracy: 0,
          average_difficulty: "medium",
          difficulties: { easy: 0, medium: 0, hard: 0 },
        };
      }

      topicStats[topicKey].attempts++;
      if (attempt.is_correct) {
        topicStats[topicKey].correct++;
      }

      const difficulty: DifficultyLevel = 
        (question.difficulty && ["easy", "medium", "hard"].includes(question.difficulty)) 
          ? question.difficulty as DifficultyLevel 
          : "medium";
      topicStats[topicKey].difficulties[difficulty] = 
        (topicStats[topicKey].difficulties[difficulty] || 0) + 1;
    });

    const topicBreakdown = Object.values(topicStats).map((stats) => {
      stats.accuracy = stats.attempts > 0 
        ? (stats.correct / stats.attempts) * 100 
        : 0;

      // Calculate average difficulty
      const { easy, medium, hard } = stats.difficulties;
      if (hard > medium && hard > easy) {
        stats.average_difficulty = "hard";
      } else if (easy > medium && easy > hard) {
        stats.average_difficulty = "easy";
      } else {
        stats.average_difficulty = "medium";
      }

      return stats;
    });

    // Get mistake patterns
    const mistakeAnalysis = await analyzeMistakePatterns(studentId, topic || undefined, subject || undefined);

    // Calculate strengths (topics with >80% accuracy and >=5 attempts)
    const strengths = topicBreakdown
      .filter((t) => t.accuracy >= 80 && t.attempts >= 5)
      .map((t) => ({
        topic: t.topic,
        subject: t.subject,
        accuracy: t.accuracy,
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);

    // Calculate weaknesses (topics with <60% accuracy and >=3 attempts)
    const weaknesses = topicBreakdown
      .filter((t) => t.accuracy < 60 && t.attempts >= 3)
      .map((t) => {
        const topicMistakes = mistakeAnalysis.patterns.filter(
          (p) => p.topic === t.topic && (!t.subject || p.subject === t.subject)
        );
        
        return {
          topic: t.topic,
          subject: t.subject,
          accuracy: t.accuracy,
          common_mistakes: [
            ...new Set(topicMistakes.map((m) => m.mistake_type)),
          ] as any[],
        };
      })
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    const analytics: PracticeAnalytics = {
      total_sessions: totalSessions,
      total_questions: totalQuestions,
      average_accuracy: averageAccuracy,
      total_time_spent_seconds: totalTimeSpentSeconds,
      accuracy_trend: accuracyTrend,
      topic_breakdown: topicBreakdown,
      mistake_patterns: mistakeAnalysis.patterns,
      strengths,
      weaknesses,
    };

    return successResponse({ analytics });
  } catch (error) {
    return handleApiError(error);
  }
}

