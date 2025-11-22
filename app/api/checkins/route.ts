import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { z } from "zod";

const checkinSchema = z.object({
  mood: z.number().min(1).max(5),
  energy: z.number().min(1).max(5),
  stress: z.number().min(1).max(5),
  focus: z.number().min(1).max(5),
  note: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Get student record
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (studentError || !student) {
      return errorResponse("Student profile not found", 404);
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = checkinSchema.parse(body);

    // Check if check-in already exists for today
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("daily_checkins")
      .select("id")
      .eq("student_id", student.id)
      .eq("date", today)
      .single();

    let checkin;
    if (existing) {
      // Update existing check-in
      const { data, error } = await supabase
        .from("daily_checkins")
        .update({
          mood: validated.mood,
          energy: validated.energy,
          stress: validated.stress,
          focus: validated.focus,
          note: validated.note || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      checkin = data;
    } else {
      // Create new check-in
      const { data, error } = await supabase
        .from("daily_checkins")
        .insert({
          student_id: student.id,
          date: today,
          mood: validated.mood,
          energy: validated.energy,
          stress: validated.stress,
          focus: validated.focus,
          note: validated.note || null,
        })
        .select()
        .single();

      if (error) throw error;
      checkin = data;
    }

    // Trigger risk score recalculation (async)
    fetch(`${request.nextUrl.origin}/api/ml/predict-risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: student.id }),
    }).catch(console.error);

    return successResponse(checkin, "Check-in submitted successfully");
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/checkins",
      method: "POST",
    });
  }
}

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

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: checkins, error } = await supabase
      .from("daily_checkins")
      .select("*")
      .eq("student_id", student.id)
      .gte("date", startDate.toISOString().split("T")[0])
      .order("date", { ascending: false });

    if (error) throw error;

    return successResponse(checkins || []);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/checkins",
      method: "GET",
    });
  }
}

