import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import type {
  LearningPathNode,
  ContentRecommendation,
  SpacedRepetitionQueueItem,
  StudyPathProgressEntry,
} from "@/lib/types";

async function requireStudentId(supabase: any): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: student } = await supabase
    .from("students")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  return student?.user_id ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") || 10);
    const queueLimit = Number(searchParams.get("queue_limit") || 20);

    const [{ data: learningPath, error: pathError }, { data: recommendations, error: recError }, { data: queue, error: queueError }, { data: masteryJson, error: masteryError }] =
      await Promise.all([
        supabase
          .from("learning_path_nodes")
          .select("*")
          .eq("student_id", studentId)
          .order("mastery_level", { ascending: false }),
        supabase
          .from("content_recommendations")
          .select("*")
          .eq("student_id", studentId)
          .order("presented_at", { ascending: false })
          .limit(Math.max(1, limit)),
        supabase
          .from("spaced_repetition_queue")
          .select("*")
          .eq("student_id", studentId)
          .order("due_at", { ascending: true })
          .limit(Math.max(1, queueLimit)),
        supabase.rpc("fn_study_path_progress", { p_student_id: studentId }),
      ]);

    if (pathError) throw pathError;
    if (recError) throw recError;
    if (queueError) throw queueError;
    if (masteryError) throw masteryError;

    const masterySummary: StudyPathProgressEntry[] = Array.isArray(masteryJson)
      ? (masteryJson as any[]).map((entry) => ({
          topicId: entry.topicId,
          topicName: entry.topicName ?? null,
          masteryLevel: typeof entry.masteryLevel === "number" ? entry.masteryLevel : Number(entry.masteryLevel) || 0,
          lastAssessedAt: entry.lastAssessedAt ?? null,
          recommendedNext: entry.recommendedNext ?? null,
        }))
      : [];

    return successResponse({
      learning_path: (learningPath as LearningPathNode[]) || [],
      mastery_summary: masterySummary,
      recommendations: (recommendations as ContentRecommendation[]) || [],
      spaced_repetition_queue: (queue as SpacedRepetitionQueueItem[]) || [],
    });
  } catch (error) {
    return handleApiError(error);
  }
}


