import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/utils/api-helpers";
import type { SpacedRepetitionQueueItem } from "@/lib/types";

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

function calculateNextReview(
  existing: Partial<SpacedRepetitionQueueItem> | null,
  performanceScore: number
) {
  const baseEase = existing?.ease_factor ?? 2.5;
  const baseInterval = existing?.interval_days ?? 1;
  const successStreak = existing?.success_streak ?? 0;

  const isSuccessful = performanceScore >= 3;
  const easeDelta = isSuccessful ? 0.1 : -0.2;
  const newEase = Math.max(1.3, baseEase + easeDelta);
  const newInterval = isSuccessful ? Math.max(1, Math.round(baseInterval * newEase)) : 1;
  const newStreak = isSuccessful ? successStreak + 1 : 0;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + newInterval);

  return {
    interval_days: newInterval,
    ease_factor: Number(newEase.toFixed(2)),
    success_streak: newStreak,
    due_at: dueDate.toISOString(),
    last_reviewed_at: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const body = await request.json();
    const cardId = body.card_identifier || body.cardId;
    const performanceScore = Number(body.performance_score ?? body.performanceScore ?? body.score ?? 3);

    if (!cardId) {
      return errorResponse("card_identifier is required", 400);
    }

    const { data: existing } = await supabase
      .from("spaced_repetition_queue")
      .select("*")
      .eq("student_id", studentId)
      .eq("card_identifier", cardId)
      .single();

    const next = calculateNextReview(existing, performanceScore);

    if (existing) {
      const { data, error } = await supabase
        .from("spaced_repetition_queue")
        .update({
          interval_days: next.interval_days,
          ease_factor: next.ease_factor,
          success_streak: next.success_streak,
          due_at: next.due_at,
          last_reviewed_at: next.last_reviewed_at,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return successResponse({ item: data as SpacedRepetitionQueueItem });
    }

    const insertPayload = {
      student_id: studentId,
      card_identifier: cardId,
      origin: body.origin || "manual",
      due_at: next.due_at,
      interval_days: next.interval_days,
      ease_factor: next.ease_factor,
      success_streak: next.success_streak,
      last_reviewed_at: next.last_reviewed_at,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("spaced_repetition_queue")
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) throw insertError;

    return successResponse({ item: inserted as SpacedRepetitionQueueItem });
  } catch (error) {
    return handleApiError(error);
  }
}


