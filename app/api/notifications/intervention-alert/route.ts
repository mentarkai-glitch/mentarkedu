import { NextRequest, NextResponse } from 'next/server';
import { sendInterventionAlert } from '@/lib/services/firebase-admin';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacher_id, teacher_token, student_name, alert_type, student_id } = body;

    // Validate required fields
    if (!teacher_id || !teacher_token || !student_name || !alert_type) {
      return errorResponse('teacher_id, teacher_token, student_name, and alert_type are required', 400);
    }

    // Send intervention alert
    const result = await sendInterventionAlert(teacher_token, student_name, alert_type);

    if (result) {
      // Log the notification in the database
      const supabase = await createClient();
      await supabase.from('notification_logs').insert({
        user_id: teacher_id,
        type: 'intervention_alert',
        title: '⚠️ Student Intervention Alert',
        body: `${student_name} may need your attention. Alert type: ${alert_type}`,
        sent_at: new Date().toISOString(),
        status: 'sent',
        metadata: {
          student_id,
          student_name,
          alert_type
        }
      });
    }

    return successResponse({
      success: result,
      message: result ? 'Intervention alert sent successfully' : 'Failed to send alert',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return handleApiError(error);
  }
}


