import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

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

    // Get student
    const { data: student } = await supabase
      .from("students")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      return errorResponse("Student not found", 404);
    }

    const body = await request.json();
    const { completion_status, completed_at } = body;

    // Verify task belongs to student's ARK
    const { data: task, error: taskError } = await supabase
      .from("ark_tasks")
      .select(`
        *,
        ark_milestones!inner (
          ark_id,
          arks!inner (
            student_id
          )
        )
      `)
      .eq("id", params.id)
      .single();

    if (taskError || !task) {
      return errorResponse("Task not found", 404);
    }

    // Check if task belongs to student's ARK
    const milestone = task.ark_milestones as any;
    const ark = milestone?.arks as any;
    if (ark?.student_id !== student.user_id) {
      return errorResponse("Unauthorized", 403);
    }

    // Update task
    const updateData: any = {};
    if (completion_status !== undefined) updateData.completion_status = completion_status;
    if (completed_at !== undefined) updateData.completed_at = completed_at;

    const { data: updatedTask, error: updateError } = await supabase
      .from("ark_tasks")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (updateError) {
      return errorResponse(updateError.message, 500);
    }

    return successResponse({ task: updatedTask });
  } catch (error: any) {
    console.error("Task update error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

