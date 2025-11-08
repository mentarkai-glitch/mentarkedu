import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/utils/api-helpers";
import type { EnergySnapshot, EnergySnapshotSource } from "@/lib/types";

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
    const energyScore = body.energy_score ?? body.energyScore;

    if (energyScore === undefined) {
      return errorResponse("energy_score is required", 400);
    }

    const payload = {
      student_id: studentId,
      captured_at: body.captured_at || new Date().toISOString(),
      energy_score: Number(energyScore),
      focus_score:
        body.focus_score !== undefined ? Number(body.focus_score) : null,
      notes: body.notes || null,
      source: (body.source as EnergySnapshotSource) || "checkin",
    };

    const { data, error } = await supabase
      .from("energy_snapshots")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return successResponse({ snapshot: data as EnergySnapshot }, "Snapshot saved");
  } catch (error) {
    return handleApiError(error);
  }
}


