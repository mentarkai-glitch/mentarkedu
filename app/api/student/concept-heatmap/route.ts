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
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    // Get skill matrix data
    // Note: This assumes student_skill_matrix and micro_concepts tables exist
    // If they don't, we'll use practice_sessions as fallback
    
    const { data: skillMatrix } = await supabase
      .from("student_skill_matrix")
      .select(`
        micro_concept_id,
        proficiency,
        last_tested_at,
        micro_concepts!inner (
          id,
          name,
          subject,
          chapter,
          weightage
        )
      `)
      .eq("student_id", student.id);

    // If skill matrix doesn't exist, use practice sessions
    if (!skillMatrix || skillMatrix.length === 0) {
      const { data: practiceSessions } = await supabase
        .from("practice_sessions")
        .select("subject, topic, accuracy, created_at")
        .eq("student_id", student.id)
        .order("created_at", { ascending: false })
        .limit(100);

      // Group by subject and topic
      const subjectMap = new Map<string, any[]>();
      
      (practiceSessions || []).forEach((session: any) => {
        const subject = session.subject || "Unknown";
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, []);
        }
        subjectMap.get(subject)!.push({
          name: session.topic || "Unknown Topic",
          chapter: session.subject || "General",
          mastery: session.accuracy || 0,
          attempts: 1,
          lastPracticed: session.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
          examWeightage: 5,
          status: session.accuracy >= 80 ? "mastered" : session.accuracy >= 50 ? "learning" : "needs_focus",
        });
      });

      const subjects = Array.from(subjectMap.entries()).map(([subject, concepts]) => {
        const overallMastery = concepts.length > 0
          ? concepts.reduce((sum, c) => sum + c.mastery, 0) / concepts.length
          : 0;

        return {
          subject,
          overallMastery: Math.round(overallMastery),
          concepts: concepts.map((c, idx) => ({
            id: `${subject}-${idx}`,
            ...c,
          })),
        };
      });

      return successResponse({ subjects });
    }

    // Process skill matrix data
    const subjectMap = new Map<string, any[]>();
    
    skillMatrix.forEach((item: any) => {
      const concept = item.micro_concepts;
      if (!concept) return;

      const subject = concept.subject || "Unknown";
      if (!subjectMap.has(subject)) {
        subjectMap.set(subject, []);
      }

      const mastery = item.proficiency || 0;
      subjectMap.get(subject)!.push({
        id: concept.id || item.micro_concept_id,
        name: concept.name || "Unknown",
        subject: concept.subject || "Unknown",
        chapter: concept.chapter || "General",
        mastery: Math.round(mastery),
        attempts: 1, // Would need to calculate from practice attempts
        lastPracticed: item.last_tested_at?.split("T")[0] || new Date().toISOString().split("T")[0],
        examWeightage: concept.weightage || 5,
        status: mastery >= 80 ? "mastered" : mastery >= 50 ? "learning" : "needs_focus",
      });
    });

    const subjects = Array.from(subjectMap.entries()).map(([subject, concepts]) => {
      const overallMastery = concepts.length > 0
        ? concepts.reduce((sum, c) => sum + c.mastery, 0) / concepts.length
        : 0;

      return {
        subject,
        overallMastery: Math.round(overallMastery),
        concepts,
      };
    });

    return successResponse({ subjects });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/student/concept-heatmap",
      method: "GET",
    });
  }
}

