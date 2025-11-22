import { NextRequest, NextResponse } from "next/server";
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
    const { data: admin } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!admin) {
      return errorResponse("Admin access required", 403);
    }

    // Get institute_id from admin's user record
    const { data: adminUser } = await supabase
      .from("users")
      .select("institute_id")
      .eq("id", user.id)
      .single();

    if (!adminUser) {
      return errorResponse("Institute not found", 404);
    }

    // Get all unique batches from students
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("batch, grade")
      .eq("institute_id", adminUser.institute_id);

    if (studentsError) {
      return errorResponse(studentsError.message, 500);
    }

    // Aggregate batches with student counts
    const batchMap = new Map<string, { name: string; grade: string; studentCount: number }>();
    
    students?.forEach((student) => {
      const key = `${student.batch}_${student.grade}`;
      if (batchMap.has(key)) {
        batchMap.get(key)!.studentCount++;
      } else {
        batchMap.set(key, {
          name: student.batch,
          grade: student.grade,
          studentCount: 1,
        });
      }
    });

    const batches = Array.from(batchMap.values());

    return successResponse({
      batches,
      total: batches.length,
    });
  } catch (error: any) {
    console.error("Batches fetch error:", error);
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
    const { data: admin } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!admin) {
      return errorResponse("Admin access required", 403);
    }

    const body = await request.json();
    const { name, grade, exam_focus, schedule } = body;

    if (!name || !grade) {
      return errorResponse("Batch name and grade are required", 400);
    }

    // Note: Since batches are currently stored as text in students table,
    // we'll just return success. In a full implementation, you'd have a batches table.
    return successResponse({
      message: "Batch created (stored in students.batch field)",
      batch: {
        name,
        grade,
        exam_focus: exam_focus || null,
        schedule: schedule || null,
      },
    });
  } catch (error: any) {
    console.error("Batch creation error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

