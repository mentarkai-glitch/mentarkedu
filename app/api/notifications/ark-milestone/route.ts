import { NextRequest, NextResponse } from 'next/server';
import { sendARKMilestoneNotification } from '@/lib/services/firebase-admin';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, user_token, user_name, milestone_title, ark_id } = body;

    // Validate required fields
    if (!user_id || !user_token || !user_name || !milestone_title) {
      return errorResponse('user_id, user_token, user_name, and milestone_title are required', 400);
    }

    // Send ARK milestone notification
    const result = await sendARKMilestoneNotification(user_token, user_name, milestone_title);

    if (result) {
      // Log the notification in the database
      const supabase = await createClient();
      await supabase.from('notification_logs').insert({
        user_id,
        type: 'milestone_achieved',
        title: '🎉 Milestone Achieved!',
        body: `Congratulations ${user_name}! You've completed "${milestone_title}". Keep up the great work!`,
        sent_at: new Date().toISOString(),
        status: 'sent',
        metadata: {
          ark_id,
          milestone_title
        }
      });
    }

    return successResponse({
      success: result,
      message: result ? 'ARK milestone notification sent successfully' : 'Failed to send notification',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return handleApiError(error);
  }
}


