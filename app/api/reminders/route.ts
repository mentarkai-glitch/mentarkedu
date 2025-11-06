import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUpcomingReminders, createReminder, ReminderConfig, generateTimelineReminders, markReminderRead } from "@/lib/services/reminder-service";
import { successResponse, errorResponse, handleApiError, validateRequiredFields } from "@/lib/utils/api-helpers";

/**
 * GET /api/reminders
 * Get upcoming reminders for current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const { data, error } = await getUpcomingReminders(user.id, limit);

    if (error) {
      return errorResponse("Failed to get reminders", 500);
    }

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/reminders
 * Create a new reminder or generate timeline reminders
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();

    // Check if this is a timeline generation request
    if (body.action === 'generate_timeline' && body.arkId) {
      const { data, error } = await generateTimelineReminders(body.arkId, user.id);
      
      if (error) {
        return errorResponse("Failed to generate timeline reminders", 500);
      }

      return successResponse({ generated: data?.length || 0, reminders: data });
    }

    // Otherwise, create a single reminder
    const validation = validateRequiredFields(body, ["arkId", "title", "message", "scheduledAt"]);
    if (!validation.valid) {
      return errorResponse(`Missing required fields: ${validation.missing?.join(", ")}`, 400);
    }

    const config: ReminderConfig = {
      arkId: body.arkId,
      milestoneId: body.milestoneId,
      reminderType: body.reminderType || 'task_start',
      title: body.title,
      message: body.message,
      scheduledAt: new Date(body.scheduledAt),
      deliveryChannel: body.deliveryChannel || 'in_app',
      metadata: body.metadata
    };

    const { data, error } = await createReminder(config, user.id);

    if (error) {
      return errorResponse("Failed to create reminder", 500);
    }

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/reminders/[id]
 * Mark reminder as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const reminderId = searchParams.get('id');

    if (!reminderId) {
      return errorResponse("Reminder ID required", 400);
    }

    const { data, error } = await markReminderRead(reminderId);

    if (error) {
      return errorResponse("Failed to mark reminder as read", 500);
    }

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}


