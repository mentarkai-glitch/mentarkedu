import { NextRequest, NextResponse } from 'next/server';
import { sendDailyCheckInReminder } from '@/lib/services/firebase-admin';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, user_token, user_name } = body;

    // Validate required fields
    if (!user_id || !user_token || !user_name) {
      return errorResponse('user_id, user_token, and user_name are required', 400);
    }

    // Send daily check-in reminder
    const result = await sendDailyCheckInReminder(user_token, user_name);

    if (result) {
      // Log the notification in the database
      const supabase = await createClient();
      await supabase.from('notification_logs').insert({
        user_id,
        type: 'daily_checkin_reminder',
        title: 'Daily Check-in Reminder',
        body: `Hi ${user_name}! How are you feeling today? Take a moment to check in with Mentark.`,
        sent_at: new Date().toISOString(),
        status: 'sent'
      });
    }

    return successResponse({
      success: result,
      message: result ? 'Daily check-in reminder sent successfully' : 'Failed to send reminder',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return handleApiError(error);
  }
}


