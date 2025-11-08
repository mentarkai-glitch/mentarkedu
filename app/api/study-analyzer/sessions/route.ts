import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/utils/api-helpers";
import type { StudySession, StudyPerformanceSnapshot } from "@/lib/types";

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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const body = await request.json();
    const sessionPayload = body.session || body;

    if (!sessionPayload.started_at && !sessionPayload.startedAt) {
      return errorResponse("started_at is required", 400);
    }

    const newSession = {
      student_id: studentId,
      ark_id: sessionPayload.ark_id || sessionPayload.arkId || null,
      session_type: sessionPayload.session_type || sessionPayload.sessionType || "solo",
      material_type: sessionPayload.material_type || sessionPayload.materialType || null,
      started_at: sessionPayload.started_at || sessionPayload.startedAt,
      ended_at: sessionPayload.ended_at || sessionPayload.endedAt || null,
      notes: sessionPayload.notes || null,
      tags: sessionPayload.tags || null,
    };

    const { data: insertedSession, error } = await supabase
      .from("study_sessions")
      .insert(newSession)
      .select()
      .single();

    if (error) throw error;

    let performanceSnapshot: StudyPerformanceSnapshot | null = null;

    if (sessionPayload.performance) {
      const perfPayload = {
        student_id: studentId,
        session_id: insertedSession.id,
        snapshot_date: sessionPayload.performance.snapshot_date ||
          sessionPayload.performance.snapshotDate ||
          new Date().toISOString().split("T")[0],
        engagement_score: sessionPayload.performance.engagement_score ?? sessionPayload.performance.engagementScore ?? null,
        retention_score: sessionPayload.performance.retention_score ?? sessionPayload.performance.retentionScore ?? null,
        completion_rate: sessionPayload.performance.completion_rate ?? sessionPayload.performance.completionRate ?? null,
        difficulty_rating: sessionPayload.performance.difficulty_rating ?? sessionPayload.performance.difficultyRating ?? null,
        ml_confidence: sessionPayload.performance.ml_confidence ?? sessionPayload.performance.mlConfidence ?? null,
      };

      const { data: insertedPerformance, error: perfError } = await supabase
        .from("study_performance_snapshots")
        .insert(perfPayload)
        .select()
        .single();

      if (perfError) throw perfError;
      performanceSnapshot = insertedPerformance as StudyPerformanceSnapshot;
    }

    return successResponse({
      session: insertedSession as StudySession,
      performance: performanceSnapshot,
    });
  } catch (error) {
    return handleApiError(error);
  }
}


