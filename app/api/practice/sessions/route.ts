import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { getAdaptiveDifficulty } from "@/lib/services/adaptive-difficulty";
import { studyAnalyzerService } from "@/lib/services/study-analyzer";
import type { PracticeSession, PracticeQuestion, DifficultyLevel } from "@/lib/types";

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
 * GET /api/practice/sessions
 * Get practice sessions for the authenticated student
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
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    let query = supabase
      .from("practice_sessions")
      .select("*")
      .eq("student_id", studentId)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (topic) {
      query = query.eq("topic", topic);
    }

    if (subject) {
      query = query.eq("subject", subject);
    }

    const { data, error } = await query;

    if (error) throw error;

    return successResponse({
      sessions: (data || []) as PracticeSession[],
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/practice/sessions
 * Create a new practice session with adaptive difficulty questions
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const body = await request.json();
    const {
      subject,
      topic,
      difficulty_level,
      count = 5,
      mistakes = [],
    } = body;

    // Get adaptive difficulty if topic is provided
    let adaptiveDifficulty: DifficultyLevel = difficulty_level || "medium";
    
    if (topic) {
      const adaptive = await getAdaptiveDifficulty(studentId, topic, subject);
      if (adaptive) {
        adaptiveDifficulty = adaptive.current_difficulty;
      }
    }

    // Generate questions based on mistakes or topic
    let questions: PracticeQuestion[] = [];

    if (mistakes.length > 0) {
      // Generate questions from mistakes
      const generated = await studyAnalyzerService.generatePracticeQuestions(
        mistakes,
        count
      );

      questions = generated.map((q: any, idx: number) => ({
        id: `temp-${idx}`,
        student_id: studentId,
        question_text: q.question,
        options: q.options,
        correct_answer_index: q.correctAnswer,
        difficulty: q.difficulty || adaptiveDifficulty,
        topic: topic || q.topic || "",
        subject: subject || q.subject || "",
        explanation: q.explanation || "",
        generated_at: new Date().toISOString(),
      }));
    } else if (topic) {
      // Generate questions for topic (enhanced implementation needed)
      const generated = await studyAnalyzerService.generatePracticeQuestions(
        [{ topic, subject, question: `Generate ${count} questions about ${topic}` }],
        count
      );

      questions = generated.map((q: any, idx: number) => ({
        id: `temp-${idx}`,
        student_id: studentId,
        question_text: q.question,
        options: q.options,
        correct_answer_index: q.correctAnswer,
        difficulty: q.difficulty || adaptiveDifficulty,
        topic: topic,
        subject: subject || "",
        explanation: q.explanation || "",
        generated_at: new Date().toISOString(),
      }));
    } else {
      return errorResponse("Topic or mistakes array is required", 400);
    }

    // Create practice session
    const { data: session, error: sessionError } = await supabase
      .from("practice_sessions")
      .insert({
        student_id: studentId,
        subject: subject || null,
        topic: topic || null,
        difficulty_level: adaptiveDifficulty,
        total_questions: questions.length,
        correct_answers: 0,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Insert questions
    const questionsToInsert = questions.map((q) => ({
      student_id: studentId,
      session_id: session.id,
      question_text: q.question_text,
      options: q.options,
      correct_answer_index: q.correct_answer_index,
      difficulty: q.difficulty,
      topic: q.topic || null,
      subject: q.subject || null,
      explanation: q.explanation || null,
      generated_at: q.generated_at,
    }));

    const { data: insertedQuestions, error: questionsError } = await supabase
      .from("practice_questions")
      .insert(questionsToInsert)
      .select();

    if (questionsError) throw questionsError;

    return successResponse({
      session: session as PracticeSession,
      questions: insertedQuestions as PracticeQuestion[],
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/practice/sessions
 * Update a practice session (e.g., complete it)
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id) {
      return errorResponse("Session ID is required", 400);
    }

    const { data: session, error } = await supabase
      .from("practice_sessions")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("student_id", studentId)
      .select()
      .single();

    if (error) throw error;

    return successResponse({
      session: session as PracticeSession,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
