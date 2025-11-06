import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: preferences, error } = await supabase
      .from("admission_preferences")
      .select("*")
      .eq("student_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      return errorResponse(error.message, 500);
    }

    return successResponse(preferences || null);
  } catch (error: any) {
    console.error("Preferences fetch error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const {
      preferred_states,
      preferred_cities,
      preferred_college_types,
      budget_max,
      budget_min,
      interested_degrees,
      interested_fields,
      willing_for_loans,
    } = body;

    const preferences = {
      student_id: user.id,
      preferred_states,
      preferred_cities,
      preferred_college_types,
      budget_max,
      budget_min,
      interested_degrees,
      interested_fields,
      willing_for_loans,
    };

    const { data, error } = await supabase
      .from("admission_preferences")
      .upsert(preferences, {
        onConflict: "student_id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error: any) {
    console.error("Preferences save error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}


