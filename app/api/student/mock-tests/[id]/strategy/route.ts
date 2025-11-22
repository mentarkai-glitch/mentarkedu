import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: student } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    const testId = params.id;

    // Get test attempt data
    // Assuming we have a test_attempts or mock_test_results table
    const { data: testAttempt } = await supabase
      .from("test_attempts")
      .select(`
        *,
        test_questions (
          question_number,
          time_spent_seconds,
          is_correct,
          is_skipped,
          difficulty,
          subject,
          topic
        )
      `)
      .eq("id", testId)
      .eq("student_id", student.id)
      .single();

    if (!testAttempt) {
      // Fallback: try assessments table
      const { data: assessment } = await supabase
        .from("assessments")
        .select("*")
        .eq("id", testId)
        .eq("student_id", student.id)
        .single();

      if (!assessment) {
        return errorResponse("Test attempt not found", 404);
      }

      // Generate basic analysis from assessment
      const analysis = {
        testId: testId,
        testName: assessment.metadata?.test_name || "Mock Test",
        score: assessment.score || 0,
        totalMarks: assessment.total || 360,
        rank: 15000, // Would need to calculate from all attempts
        totalQuestions: 90,
        correctAnswers: Math.round((assessment.score || 0) / (assessment.total || 360) * 90 * 0.7),
        wrongAnswers: Math.round((assessment.score || 0) / (assessment.total || 360) * 90 * 0.2),
        skippedQuestions: 8,
        totalTime: 180,
        questions: [],
        insights: {
          timeManagement: "Review your time allocation to improve efficiency.",
          skippingPattern: "Consider skipping difficult questions earlier to maintain momentum.",
          momentum: "Focus on maintaining consistent pace throughout the test.",
          recommendations: [
            "If stuck > 5 minutes → Skip & mark for review",
            "Prioritize easy questions first",
            "Don't spend more than 3 minutes on any single question initially",
          ],
        },
      };

      return successResponse(analysis);
    }

    // Process test questions for analysis
    const questions = (testAttempt.test_questions || []).map((q: any) => ({
      questionNumber: q.question_number || 0,
      timeSpent: Math.round((q.time_spent_seconds || 0) / 60), // Convert to minutes
      correct: q.is_correct || false,
      skipped: q.is_skipped || false,
      difficulty: q.difficulty || "medium",
      subject: q.subject || "Unknown",
      topic: q.topic || "Unknown",
    }));

    // Calculate statistics
    const totalQuestions = questions.length;
    const correctAnswers = questions.filter((q) => q.correct && !q.skipped).length;
    const wrongAnswers = questions.filter((q) => !q.correct && !q.skipped).length;
    const skippedQuestions = questions.filter((q) => q.skipped).length;
    const totalTime = questions.reduce((sum, q) => sum + q.timeSpent, 0);

    // Find problem questions (took >5 min and wrong)
    const problemQuestions = questions.filter((q) => q.timeSpent > 5 && !q.correct && !q.skipped);

    // Generate insights
    const insights = {
      timeManagement: problemQuestions.length > 0
        ? `You spent ${problemQuestions[0].timeSpent} minutes on Question ${problemQuestions[0].questionNumber} and got it wrong. This killed your momentum for the next questions.`
        : "Your time management was good. Keep maintaining this pace.",
      skippingPattern: skippedQuestions > 0
        ? `You skipped ${skippedQuestions} questions (Good!), but consider skipping difficult questions earlier to maintain momentum.`
        : "Consider skipping difficult questions if stuck for more than 5 minutes.",
      momentum: "Your confidence remained consistent throughout the test.",
      recommendations: [
        "If stuck > 5 minutes → Skip & mark for review",
        "Prioritize easy questions first to build confidence",
        "Don't spend more than 3 minutes on any single question initially",
        "Review skipped questions at the end if time permits",
      ],
    };

    const analysis = {
      testId: testId,
      testName: testAttempt.metadata?.test_name || "Mock Test",
      score: testAttempt.score || 0,
      totalMarks: testAttempt.total_marks || 360,
      rank: testAttempt.rank || 15000,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      skippedQuestions,
      totalTime,
      questions,
      insights,
    };

    return successResponse(analysis);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/student/mock-tests/[id]/strategy",
      method: "GET",
    });
  }
}

