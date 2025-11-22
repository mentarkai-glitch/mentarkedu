import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext } from "@/lib/types";
import { safeParseJSON } from "@/lib/utils/json-repair";

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
 * POST /api/practice/generate-custom
 * Generate practice questions from custom topic with context
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
      topic,
      context,
      count = 5,
      mode = 'general', // 'grade_exam' or 'general'
      grade,
      exam,
      difficulty,
      subject,
    } = body;

    if (!topic || topic.trim().length === 0) {
      return errorResponse("Topic is required", 400);
    }

    if (count < 1 || count > 50) {
      return errorResponse("Question count must be between 1 and 50", 400);
    }

    // Build AI prompt based on mode
    let prompt: string;
    
    if (mode === 'grade_exam') {
      // Grade & Exam Specific mode
      const gradeInfo = grade ? `Grade ${grade}` : '';
      const examInfo = exam ? ` for ${exam} exam` : '';
      const subjectInfo = subject ? ` in ${subject}` : '';
      
      prompt = `Generate ${count} high-quality practice questions${examInfo}${subjectInfo}${gradeInfo ? ` suitable for ${gradeInfo}` : ''} on the topic: "${topic}".

${context ? `Additional context: ${context}` : ''}

Requirements:
- Questions should align with ${exam || 'the specified exam'} curriculum and difficulty level
- Each question should have exactly 4 multiple-choice options
- Include clear explanations for each answer
- Vary difficulty levels appropriately for ${grade || 'the grade level'}
- Questions should test understanding, application, and critical thinking
- Format: JSON array with structure:
  [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0-3 (index of correct option),
      "explanation": "Detailed explanation",
      "difficulty": "easy|medium|hard",
      "topic": "Topic name",
      "subject": "Subject name"
    }
  ]

Return ONLY valid JSON array, no markdown formatting.`;
    } else {
      // General mode - any field in the world
      prompt = `Generate ${count} high-quality practice questions on the topic: "${topic}".

${context ? `Additional context: ${context}` : ''}

Requirements:
- Questions can be from ANY field or domain (academic, professional, technical, creative, etc.)
- Each question should have exactly 4 multiple-choice options
- Include clear explanations for each answer
- Questions should be well-researched and accurate
- Format: JSON array with structure:
  [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0-3 (index of correct option),
      "explanation": "Detailed explanation",
      "difficulty": "easy|medium|hard",
      "topic": "Topic name",
      "subject": "Subject/Field name"
    }
  ]

Return ONLY valid JSON array, no markdown formatting.`;
    }

    // Get student profile for context
    const { data: student } = await supabase
      .from("students")
      .select("onboarding_profile")
      .eq("user_id", studentId)
      .single();

    const studentProfile = student?.onboarding_profile as any;

    // Use AI orchestrator to generate questions
    const aiContext: AIContext = {
      task: "practice_questions",
      user_id: studentId,
      metadata: {
        topic,
        context,
        count,
        mode,
        grade,
        exam,
        student_profile: studentProfile,
      },
    };

    const aiResponse = await aiOrchestrator(aiContext, prompt);

    // Parse AI response
    let questions: any[] = [];
    
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = safeParseJSON(jsonMatch[0]);
      } else {
        questions = safeParseJSON(aiResponse.content);
      }

      // Validate questions structure
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Invalid question format received from AI");
      }

      // Ensure all questions have required fields
      questions = questions.map((q, idx) => ({
        question: q.question || `Question ${idx + 1}`,
        options: Array.isArray(q.options) && q.options.length === 4 
          ? q.options 
          : ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer < 4
          ? q.correctAnswer
          : 0,
        explanation: q.explanation || "See explanation above",
        difficulty: q.difficulty || difficulty || "medium",
        topic: q.topic || topic,
        subject: q.subject || subject || "General",
      })).slice(0, count); // Ensure we don't exceed requested count

    } catch (parseError: any) {
      console.error("Failed to parse AI response:", parseError);
      return errorResponse(
        `Failed to parse generated questions. AI response: ${aiResponse.content.substring(0, 200)}`,
        500
      );
    }

    return successResponse({
      questions,
      topic,
      mode,
      generated_at: new Date().toISOString(),
      model_used: aiResponse.model,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

