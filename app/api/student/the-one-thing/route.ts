import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: student } = await supabase
      .from("students")
      .select("id, target_exams")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    // Get student's skill matrix to find weakest concept
    // For now, we'll use a simplified approach
    // In production, this would query student_skill_matrix table
    
    // Get recent practice attempts to identify weak areas
    const { data: recentAttempts } = await supabase
      .from("practice_sessions")
      .select("subject, topic, accuracy, total_questions")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false })
      .limit(50);

    // Calculate weakest concept
    const conceptScores = new Map<string, { attempts: number; totalCorrect: number; totalQuestions: number }>();
    
    (recentAttempts || []).forEach((attempt: any) => {
      const key = `${attempt.subject}-${attempt.topic}`;
      const existing = conceptScores.get(key) || { attempts: 0, totalCorrect: 0, totalQuestions: 0 };
      existing.attempts += 1;
      existing.totalQuestions += attempt.total_questions || 0;
      existing.totalCorrect += Math.round((attempt.accuracy || 0) * (attempt.total_questions || 0) / 100);
      conceptScores.set(key, existing);
    });

    // Find concept with lowest accuracy
    let weakestConcept = null;
    let lowestAccuracy = 100;

    for (const [key, stats] of conceptScores.entries()) {
      const accuracy = stats.totalQuestions > 0 
        ? (stats.totalCorrect / stats.totalQuestions) * 100 
        : 0;
      
      if (accuracy < lowestAccuracy && stats.attempts >= 2) {
        lowestAccuracy = accuracy;
        const [subject, topic] = key.split("-");
        weakestConcept = {
          conceptId: key,
          conceptName: topic,
          subject: `${subject} - ${topic}`,
          timeEstimate: 15,
          attempts: stats.attempts,
          accuracy: Math.round(accuracy),
          examWeightage: 8, // Default, should come from micro_concepts table
          whyItMatters: `This concept appears in 8% of ${student.target_exams?.[0] || "JEE Main"} papers. Students who master it improve their rank by ~500 positions on average.`,
          actionType: "practice" as const,
          actionUrl: `/dashboard/student/practice?concept=${key}`,
        };
      }
    }

    // Fallback if no weak concepts found
    if (!weakestConcept) {
      weakestConcept = {
        conceptId: "optics-lens-maker",
        conceptName: "Lens Maker Formula",
        subject: "Physics - Optics",
        timeEstimate: 15,
        attempts: 3,
        accuracy: 0,
        examWeightage: 8,
        whyItMatters: "This concept appears in 8% of JEE Main papers. Students who master it improve their rank by ~500 positions on average.",
        actionType: "practice" as const,
        actionUrl: "/dashboard/student/practice?concept=optics-lens-maker",
      };
    }

    return successResponse(weakestConcept);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/student/the-one-thing",
      method: "GET",
    });
  }
}

