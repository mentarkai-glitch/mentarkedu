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

    // Verify admin
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      return errorResponse("Admin access required", 403);
    }

    const { data: teachers, error } = await supabase
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
      `);

    if (error) {
      return errorResponse(error.message, 500);
    }

    const transformedTeachers = teachers?.map((teacher) => ({
      id: teacher.user_id,
      full_name: `${(teacher.users as any)?.profile_data?.first_name || ""} ${
        (teacher.users as any)?.profile_data?.last_name || ""
      }`.trim() || "Unknown",
      email: (teacher.users as any)?.email || "",
      avatar_url: (teacher.users as any)?.profile_data?.avatar_url,
      specialization: teacher.specialization || [],
      assigned_batches: teacher.assigned_batches || [],
    }));

    return successResponse({
      teachers: transformedTeachers || [],
      total: transformedTeachers?.length || 0,
    });
  } catch (error: any) {
    console.error("Teachers fetch error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify admin
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      return errorResponse("Admin access required", 403);
    }

    const body = await request.json();
    const { email, full_name, specialization, assigned_batches } = body;

    if (!email || !full_name) {
      return errorResponse("email and full_name are required", 400);
    }

    // Create user (stub - in production, use auth.signUp)
    // For now, we'll just create the teacher record
    // In production, this should create auth user first

    const [firstName, ...lastNameParts] = full_name.split(" ");
    const lastName = lastNameParts.join(" ");

    return successResponse({
      message: "Teacher creation requires proper auth flow. This is a stub.",
      data: {
        email,
        full_name,
        specialization: specialization || [],
        assigned_batches: assigned_batches || [],
      },
    });
  } catch (error: any) {
    console.error("Teacher creation error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}
