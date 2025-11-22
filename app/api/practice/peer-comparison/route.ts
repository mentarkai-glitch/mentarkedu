import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

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
 * GET /api/practice/peer-comparison
 * Get peer comparison data for practice questions
 * Returns aggregated performance statistics compared to peers
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    if (!supabase) {
      return errorResponse("Database connection failed", 500);
    }
    
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found. Please complete your profile setup.", 404);
    }

    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic");
    const subject = searchParams.get("subject");
    const days = parseInt(searchParams.get("days") || "30", 10);
    const includeAnonymous = searchParams.get("include_anonymous") === "true";
    const batch = searchParams.get("batch"); // Optional: compare with same batch

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // First, get question IDs that match topic/subject filters if provided
    let questionIdsQuery = supabase
      .from("practice_questions")
      .select("id")
      .eq("student_id", studentId);
    
    if (topic) {
      questionIdsQuery = questionIdsQuery.eq("topic", topic);
    }
    
    if (subject) {
      questionIdsQuery = questionIdsQuery.eq("subject", subject);
    }
    
    const { data: filteredQuestions, error: questionError } = await questionIdsQuery;
    
    if (questionError) {
      console.error('Error fetching filtered questions:', questionError);
      throw questionError;
    }
    
    const filteredQuestionIds = filteredQuestions?.map((q: any) => q.id) || [];

    // Get current student's performance
    let studentAttemptsQuery = supabase
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
    
    // Filter by question IDs if topic/subject filters were applied
    if (filteredQuestionIds.length > 0) {
      studentAttemptsQuery = studentAttemptsQuery.in("question_id", filteredQuestionIds);
    } else if (topic || subject) {
      // If filters were provided but no questions match, return empty result
      studentAttemptsQuery = studentAttemptsQuery.eq("question_id", "00000000-0000-0000-0000-000000000000"); // Impossible UUID to return empty
    }

    const { data: studentAttempts, error: studentError } = await studentAttemptsQuery;

    if (studentError) {
      console.error('Error fetching student attempts:', studentError);
      throw studentError;
    }

    // Get student's batch if batch filtering is requested
    let studentBatch: string | null = null;
    if (batch) {
      const { data: student } = await supabase
        .from("students")
        .select("batch")
        .eq("user_id", studentId)
        .single();
      studentBatch = student?.batch || null;
    }

    // Get peer question IDs that match topic/subject filters
    let peerQuestionIdsQuery = supabase
      .from("practice_questions")
      .select("id");
    
    if (topic) {
      peerQuestionIdsQuery = peerQuestionIdsQuery.eq("topic", topic);
    }
    
    if (subject) {
      peerQuestionIdsQuery = peerQuestionIdsQuery.eq("subject", subject);
    }
    
    const { data: peerFilteredQuestions, error: peerQuestionError } = await peerQuestionIdsQuery;
    
    if (peerQuestionError) {
      console.error('Error fetching peer filtered questions:', peerQuestionError);
      throw peerQuestionError;
    }
    
    const peerFilteredQuestionIds = peerFilteredQuestions?.map((q: any) => q.id) || [];

    // Get peer attempts (exclude current student)
    let peerAttemptsQuery = supabase
      .from("practice_attempts")
      .select(`
        *,
        practice_questions (
          topic,
          subject,
          difficulty
        ),
        students!inner (
          user_id,
          batch
        )
      `)
      .neq("student_id", studentId)
      .gte("attempted_at", startDate.toISOString());

    // Filter by batch if requested
    if (batch && studentBatch) {
      peerAttemptsQuery = peerAttemptsQuery.eq("students.batch", studentBatch);
    }
    
    // Filter by question IDs if topic/subject filters were applied
    if (peerFilteredQuestionIds.length > 0) {
      peerAttemptsQuery = peerAttemptsQuery.in("question_id", peerFilteredQuestionIds);
    } else if (topic || subject) {
      // If filters were provided but no questions match, return empty result
      peerAttemptsQuery = peerAttemptsQuery.eq("question_id", "00000000-0000-0000-0000-000000000000"); // Impossible UUID to return empty
    }

    const { data: peerAttempts, error: peerError } = await peerAttemptsQuery;

    if (peerError) {
      console.error('Error fetching peer attempts:', peerError);
      throw peerError;
    }

    // Calculate student metrics
    const studentTotal = studentAttempts?.length || 0;
    const studentCorrect = studentAttempts?.filter((a: any) => a.is_correct).length || 0;
    const studentAccuracy = studentTotal > 0 ? (studentCorrect / studentTotal) * 100 : 0;
    const studentAvgTime = studentAttempts?.length > 0
      ? studentAttempts.reduce((sum: number, a: any) => sum + (a.time_spent_seconds || 0), 0) / studentAttempts.length
      : 0;

    // Calculate peer metrics (aggregated, anonymous)
    const peerTotal = peerAttempts?.length || 0;
    const peerCorrect = peerAttempts?.filter((a: any) => a.is_correct).length || 0;
    const peerAccuracy = peerTotal > 0 ? (peerCorrect / peerTotal) * 100 : 0;
    const peerAvgTime = peerAttempts?.length > 0
      ? peerAttempts.reduce((sum: number, a: any) => sum + (a.time_spent_seconds || 0), 0) / peerAttempts.length
      : 0;

    // Calculate percentile (how many peers the student outperforms)
    const allAccuracies: number[] = [];
    const peerGroups = new Map<string, number[]>();

    // Group peer attempts by student_id to calculate per-student accuracy
    peerAttempts?.forEach((attempt: any) => {
      const peerId = attempt.student_id;
      if (!peerGroups.has(peerId)) {
        peerGroups.set(peerId, []);
      }
      peerGroups.get(peerId)?.push(attempt.is_correct ? 1 : 0);
    });

    // Calculate accuracy for each peer
    peerGroups.forEach((scores) => {
      const accuracy = scores.reduce((sum, score) => sum + score, 0) / scores.length * 100;
      allAccuracies.push(accuracy);
    });

    // Add student accuracy for percentile calculation
    const percentileData = [...allAccuracies, studentAccuracy].sort((a, b) => a - b);
    const studentRank = percentileData.indexOf(studentAccuracy);
    const percentile = (studentRank / percentileData.length) * 100;

    // Get performance by topic
    const topicPerformance: Record<string, any> = {};
    
    // Student topic performance
    studentAttempts?.forEach((attempt: any) => {
      const topicName = attempt.practice_questions?.topic || "Unknown";
      if (!topicPerformance[topicName]) {
        topicPerformance[topicName] = {
          student: { total: 0, correct: 0 },
          peers: { total: 0, correct: 0 },
        };
      }
      topicPerformance[topicName].student.total++;
      if (attempt.is_correct) {
        topicPerformance[topicName].student.correct++;
      }
    });

    // Peer topic performance
    peerAttempts?.forEach((attempt: any) => {
      const topicName = attempt.practice_questions?.topic || "Unknown";
      if (!topicPerformance[topicName]) {
        topicPerformance[topicName] = {
          student: { total: 0, correct: 0 },
          peers: { total: 0, correct: 0 },
        };
      }
      topicPerformance[topicName].peers.total++;
      if (attempt.is_correct) {
        topicPerformance[topicName].peers.correct++;
      }
    });

    // Calculate topic accuracies
    Object.keys(topicPerformance).forEach((topic) => {
      const data = topicPerformance[topic];
      data.student.accuracy = data.student.total > 0
        ? (data.student.correct / data.student.total) * 100
        : 0;
      data.peers.accuracy = data.peers.total > 0
        ? (data.peers.correct / data.peers.total) * 100
        : 0;
      data.student.accuracyDelta = data.student.accuracy - data.peers.accuracy;
    });

    // Determine performance status
    let performanceStatus: "above" | "average" | "below" = "average";
    if (studentAccuracy > peerAccuracy + 5) {
      performanceStatus = "above";
    } else if (studentAccuracy < peerAccuracy - 5) {
      performanceStatus = "below";
    }

    return successResponse({
      student: {
        totalQuestions: studentTotal,
        correctAnswers: studentCorrect,
        accuracy: Math.round(studentAccuracy * 100) / 100,
        averageTime: Math.round(studentAvgTime * 100) / 100,
      },
      peers: {
        totalQuestions: peerTotal,
        totalStudents: peerGroups.size,
        averageAccuracy: Math.round(peerAccuracy * 100) / 100,
        averageTime: Math.round(peerAvgTime * 100) / 100,
      },
      comparison: {
        accuracyDelta: Math.round((studentAccuracy - peerAccuracy) * 100) / 100,
        timeDelta: Math.round((studentAvgTime - peerAvgTime) * 100) / 100,
        percentile: Math.round(percentile * 100) / 100,
        performanceStatus,
        rank: studentRank + 1,
        totalRanked: percentileData.length,
      },
      topicPerformance: Object.entries(topicPerformance)
        .map(([topic, data]) => ({
          topic,
          studentAccuracy: Math.round(data.student.accuracy * 100) / 100,
          peerAccuracy: Math.round(data.peers.accuracy * 100) / 100,
          accuracyDelta: Math.round(data.student.accuracyDelta * 100) / 100,
          studentQuestions: data.student.total,
          peerQuestions: data.peers.total,
        }))
        .sort((a, b) => b.studentQuestions - a.studentQuestions),
      filters: {
        topic: topic || null,
        subject: subject || null,
        days,
        batch: batch ? studentBatch : null,
      },
    });
  } catch (error: any) {
    console.error('Peer comparison API error:', error);
    // Provide more specific error messages
    if (error?.code === 'PGRST116' || error?.message?.includes('relation') || error?.message?.includes('does not exist')) {
      return errorResponse("Database tables not found. Please ensure the database is properly set up.", 500);
    }
    if (error?.message?.includes('JWT') || error?.message?.includes('auth')) {
      return errorResponse("Authentication failed. Please log in again.", 401);
    }
    return handleApiError(error, {
      endpoint: '/api/practice/peer-comparison',
      method: 'GET',
    });
  }
}




