import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

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

    const horizon = Number(new URL(request.url).searchParams.get("days") || 14);

    const { data: energyBands, error: energyError } = await supabase.rpc(
      "fn_recompute_energy_bands",
      { p_student_id: studentId }
    );

    if (energyError) throw energyError;

    const { data: productivity, error: productivityError } = await supabase
      .from("view_daily_productivity_summary")
      .select("*")
      .eq("student_id", studentId)
      .order("metric_date", { ascending: false })
      .limit(Math.max(1, Math.min(horizon, 30)));

    if (productivityError) throw productivityError;

    return successResponse({
      energy_bands: energyBands || [],
      productivity: productivity || [],
    });
  } catch (error) {
    return handleApiError(error);
  }
}


