import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify admin
    const { data: admin } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!admin) {
      return errorResponse("Admin access required", 403);
    }

    const { data: student, error } = await supabase
      .from("students")
      .select(`
        user_id,
        grade,
        batch,
        interests,
        goals,
        risk_score,
        onboarding_profile,
        users (
          id,
          email,
          profile_data
        )
      `)
      .eq("user_id", params.id)
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({
      student: {
        id: student.user_id,
        email: (student.users as any)?.email,
        full_name: `${(student.users as any)?.profile_data?.first_name || ""} ${
          (student.users as any)?.profile_data?.last_name || ""
        }`.trim() || "Unknown",
        grade: student.grade,
        batch: student.batch,
        interests: student.interests || [],
        goals: student.goals || [],
        risk_score: student.risk_score || 0,
        onboarding_profile: student.onboarding_profile,
      },
    });
  } catch (error: any) {
    console.error("Student fetch error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify admin
    const { data: admin } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!admin) {
      return errorResponse("Admin access required", 403);
    }

    const body = await request.json();
    const { grade, batch, interests, goals, risk_score } = body;

    // Update student record
    const updateData: any = {};
    if (grade !== undefined) updateData.grade = grade;
    if (batch !== undefined) updateData.batch = batch;
    if (interests !== undefined) updateData.interests = interests;
    if (goals !== undefined) updateData.goals = goals;
    if (risk_score !== undefined) updateData.risk_score = risk_score;

    const { data, error } = await supabase
      .from("students")
      .update(updateData)
      .eq("user_id", params.id)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({ student: data });
  } catch (error: any) {
    console.error("Student update error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify admin
    const { data: admin } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!admin) {
      return errorResponse("Admin access required", 403);
    }

    // Delete student (cascade will handle related records)
    const { error } = await supabase
      .from("students")
      .delete()
      .eq("user_id", params.id);

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({ message: "Student deleted successfully" });
  } catch (error: any) {
    console.error("Student delete error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

