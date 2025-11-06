import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { processScheduledReminders } from "@/lib/services/ark-reminders";

/**
 * Process scheduled reminders (called by cron job)
 * This endpoint should be protected and only called by a cron service
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication for cron job
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return errorResponse("Unauthorized", 401);
    }

    // Process scheduled reminders
    const result = await processScheduledReminders();
    
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// Also support GET for manual triggering (for testing)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user (for manual testing)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Process scheduled reminders
    const result = await processScheduledReminders();
    
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

