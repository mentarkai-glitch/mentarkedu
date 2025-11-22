import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function POST(request: NextRequest) {
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

    // Get institute_id
    const { data: adminUser } = await supabase
      .from("users")
      .select("institute_id")
      .eq("id", user.id)
      .single();

    if (!adminUser) {
      return errorResponse("Institute not found", 404);
    }

    const body = await request.json();
    const { students, type } = body; // type: 'students' | 'teachers'

    if (!students || !Array.isArray(students) || students.length === 0) {
      return errorResponse("Students array is required", 400);
    }

    const results = {
      success: [] as any[],
      errors: [] as any[],
    };

    for (const studentData of students) {
      try {
        const { email, first_name, last_name, grade, batch, phone, interests, goals } = studentData;

        if (!email || !first_name || !grade || !batch) {
          results.errors.push({
            row: studentData,
            error: "Missing required fields: email, first_name, grade, batch",
          });
          continue;
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .single();

        if (existingUser) {
          results.errors.push({
            row: studentData,
            error: "User with this email already exists",
          });
          continue;
        }

        // In production, you'd create auth user first, then create user record
        // For now, this is a stub that shows the structure
        results.success.push({
          email,
          first_name,
          last_name,
          grade,
          batch,
          status: "Would be created",
        });
      } catch (error: any) {
        results.errors.push({
          row: studentData,
          error: error.message,
        });
      }
    }

    return successResponse({
      message: `Processed ${students.length} records`,
      results: {
        successful: results.success.length,
        failed: results.errors.length,
        details: results,
      },
    });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

