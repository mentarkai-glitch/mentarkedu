import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { scheduleTaskReminders, type ReminderTask } from "@/lib/services/ark-reminders";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const task: ReminderTask = {
      id: body.id || body.task_id,
      ark_id: body.ark_id,
      milestone_id: body.milestone_id,
      task_id: body.task_id,
      title: body.title,
      description: body.description,
      task_date: body.task_date,
      priority: body.priority || 'medium',
      estimated_hours: body.estimated_hours || 1,
      milestone_order: body.milestone_order,
      total_milestones: body.total_milestones,
      user_id: user.id,
      user_email: user.email,
      user_phone: body.user_phone,
      fcm_token: body.fcm_token
    };

    // Validate required fields
    if (!task.ark_id || !task.title || !task.task_date) {
      return errorResponse("Missing required fields: ark_id, title, task_date", 400);
    }

    // Schedule reminders
    const results = await scheduleTaskReminders(task);
    
    return successResponse({ 
      scheduled: results.length,
      results 
    });
  } catch (error) {
    return handleApiError(error);
  }
}

