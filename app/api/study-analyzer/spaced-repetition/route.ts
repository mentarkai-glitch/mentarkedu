import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/utils/api-helpers";
import type { SpacedRepetitionQueueItem } from "@/lib/types";
import { sm2Algorithm, scoreToQuality } from "@/lib/algorithms/sm2";

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
  // Convert performance score to SM-2 quality (0-5)
  const quality = scoreToQuality(performanceScore);
  
  // Build SM-2 card from existing data
  const sm2Card = {
    easeFactor: existing?.ease_factor ?? 2.5,
    interval: existing?.interval_days ?? 1,
    repetitions: existing?.success_streak ?? 0,
    lastReviewed: existing?.last_reviewed_at ? new Date(existing.last_reviewed_at) : undefined,
  };

  // Apply SM-2 algorithm
  const updatedCard = sm2Algorithm(sm2Card, quality);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + updatedCard.interval);

  return {
    interval_days: updatedCard.interval,
    ease_factor: updatedCard.easeFactor,
    success_streak: updatedCard.repetitions,
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


