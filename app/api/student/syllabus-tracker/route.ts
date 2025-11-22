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

    const { searchParams } = new URL(request.url);
    const examType = searchParams.get("exam_type") || (student.target_exams?.[0] || "JEE_MAIN");

    // Get syllabus tracker data
    const { data: tracker, error } = await supabase
      .from("syllabus_tracker")
      .select("*")
      .eq("student_id", user.id)
      .eq("exam_type", examType)
      .order("subject", { ascending: true })
      .order("chapter", { ascending: true })
      .order("topic", { ascending: true });

    if (error) throw error;

    // Group by subject and chapter
    const grouped: Record<string, Record<string, any[]>> = {};
    
    (tracker || []).forEach((item) => {
      const subject = item.subject || "General";
      const chapter = item.chapter || "General";
      
      if (!grouped[subject]) {
        grouped[subject] = {};
      }
      if (!grouped[subject][chapter]) {
        grouped[subject][chapter] = [];
      }
      
      grouped[subject][chapter].push(item);
    });

    // Calculate overall progress
    const totalTopics = tracker?.length || 0;
    const completedTopics = tracker?.filter((t) => t.mastery_level === "mastered").length || 0;
    const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;

    // Calculate subject-wise progress
    const subjectProgress: Record<string, number> = {};
    Object.keys(grouped).forEach((subject) => {
      const subjectTopics = Object.values(grouped[subject]).flat();
      const subjectCompleted = subjectTopics.filter((t) => t.mastery_level === "mastered").length;
      subjectProgress[subject] = subjectTopics.length > 0
        ? (subjectCompleted / subjectTopics.length) * 100
        : 0;
    });

    return successResponse({
      exam_type: examType,
      overall_progress: Math.round(overallProgress),
      total_topics: totalTopics,
      completed_topics: completedTopics,
      subject_progress: subjectProgress,
      syllabus: grouped,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/student/syllabus-tracker",
      method: "GET",
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: student } = await supabase
      .from("students")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    const body = await request.json();
    const { exam_type, subject, chapter, topic, completion_percentage, mastery_level } = body;

    if (!exam_type || !subject || !chapter) {
      return errorResponse("exam_type, subject, and chapter are required", 400);
    }

    // Upsert syllabus tracker entry
    const { data, error } = await supabase
      .from("syllabus_tracker")
      .upsert({
        student_id: student.user_id,
        exam_type,
        subject,
        chapter,
        topic: topic || null,
        completion_percentage: completion_percentage || 0,
        mastery_level: mastery_level || "not_started",
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "student_id,exam_type,subject,chapter,topic",
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(data, "Syllabus tracker updated successfully");
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/student/syllabus-tracker",
      method: "POST",
    });
  }
}

