import { NextRequest } from "next/server";
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

    const { data: teacher, error } = await supabase
      .from("teachers")
      .select(`
        user_id,
        specialization,
        assigned_batches,
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
      teacher: {
        id: teacher.user_id,
        email: (teacher.users as any)?.email || "",
        full_name: `${(teacher.users as any)?.profile_data?.first_name || ""} ${
          (teacher.users as any)?.profile_data?.last_name || ""
        }`.trim() || "Unknown",
        avatar_url: (teacher.users as any)?.profile_data?.avatar_url,
        specialization: teacher.specialization || [],
        assigned_batches: teacher.assigned_batches || [],
      },
    });
  } catch (error: any) {
    console.error("Teacher fetch error:", error);
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
    const { specialization, assigned_batches } = body;

    // Update teacher record
    const updateData: any = {};
    if (specialization !== undefined) updateData.specialization = specialization;
    if (assigned_batches !== undefined) updateData.assigned_batches = assigned_batches;

    const { data, error } = await supabase
      .from("teachers")
      .update(updateData)
      .eq("user_id", params.id)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({ teacher: data });
  } catch (error: any) {
    console.error("Teacher update error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

