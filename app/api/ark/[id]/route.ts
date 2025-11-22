import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    // Get ARK with milestones and tasks
    const { data: ark, error: arkError } = await supabase
      .from("arks")
      .select("*")
      .eq("id", id)
      .eq("student_id", student.user_id)
      .single();

    if (arkError || !ark) {
      return errorResponse("ARK not found", 404);
    }

    // Get milestones
    const { data: milestones, error: milestonesError } = await supabase
      .from("ark_milestones")
      .select("*")
      .eq("ark_id", id)
      .order("due_date", { ascending: true });

    if (milestonesError) {
      console.error("Error fetching milestones:", milestonesError);
    }

    // Get tasks for each milestone
    const milestoneIds = milestones?.map((m) => m.id) || [];
    const { data: tasks, error: tasksError } = await supabase
      .from("ark_tasks")
      .select("*")
      .in("milestone_id", milestoneIds)
      .order("created_at", { ascending: true });

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError);
    }

    // Organize tasks by milestone
    const tasksByMilestone = new Map<string, any[]>();
    (tasks || []).forEach((task) => {
      const existing = tasksByMilestone.get(task.milestone_id) || [];
      existing.push(task);
      tasksByMilestone.set(task.milestone_id, existing);
    });

    // Attach tasks to milestones
    const milestonesWithTasks = (milestones || []).map((milestone) => ({
      ...milestone,
      tasks: tasksByMilestone.get(milestone.id) || [],
    }));

    // Calculate progress
    const totalTasks = (tasks || []).length;
    const completedTasks = (tasks || []).filter(
      (t) => t.completion_status === "completed"
    ).length;
    const calculatedProgress =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return successResponse({
      ark: {
        ...ark,
        calculated_progress: calculatedProgress,
      },
      milestones: milestonesWithTasks,
      stats: {
        total_milestones: milestones?.length || 0,
        completed_milestones:
          milestones?.filter((m) => m.status === "completed").length || 0,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
      },
    });
  } catch (error: any) {
    console.error("ARK fetch error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();
    const { status, progress } = body;

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (progress !== undefined) updateData.progress = progress;

    const { data, error } = await supabase
      .from("arks")
      .update(updateData)
      .eq("id", id)
      .eq("student_id", student.user_id)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({ ark: data });
  } catch (error: any) {
    console.error("ARK update error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

