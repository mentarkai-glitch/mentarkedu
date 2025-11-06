import { NextRequest, NextResponse } from 'next/server';
import { sendSMS, validatePhoneNumber } from '@/lib/sms/msg91';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message, studentId, type = 'manual' } = await request.json();
    
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Missing phoneNumber or message' },
        { status: 400 }
      );
    }

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { error: phoneValidation.error },
        { status: 400 }
      );
    }

    // Send SMS
    const result = await sendSMS(phoneValidation.formatted!, message);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send SMS', details: result.error },
        { status: 500 }
      );
    }

    // Store SMS in database if studentId provided
    if (studentId) {
      try {
        const supabase = await createClient();
        
        // Find or create SMS conversation
        const { data: conversation, error: convError } = await supabase
          .from('sms_conversations')
          .select('id')
          .eq('student_id', studentId)
          .eq('phone_number', phoneValidation.formatted)
          .single();

        let conversationId: string;
        
        if (convError || !conversation) {
          // Create new conversation
          const { data: newConv, error: newConvError } = await supabase
            .from('sms_conversations')
            .insert({
              student_id: studentId,
              phone_number: phoneValidation.formatted,
              twilio_sid: result.sid,
              status: 'active'
            })
            .select('id')
            .single();

          if (newConvError || !newConv) {
            console.error('Failed to create SMS conversation:', newConvError);
          } else {
            conversationId = newConv.id;
          }
        } else {
          conversationId = conversation.id;
        }

        // Store outgoing message
        if (conversationId) {
          const { error: msgError } = await supabase
            .from('sms_messages')
            .insert({
              conversation_id: conversationId,
              direction: 'outbound',
              message: message,
              twilio_sid: result.sid,
              status: 'sent'
            });

          if (msgError) {
            console.error('Error storing SMS message:', msgError);
          }
        }
      } catch (error) {
        console.error('Error storing SMS in database:', error);
        // Don't fail the request if database storage fails
      }
    }

    return NextResponse.json({
      success: true,
      requestId: result.request_id,
      phoneNumber: phoneValidation.formatted
    });

  } catch (error) {
    console.error('SMS send API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Send bulk SMS to multiple students
 */
export async function PUT(request: NextRequest) {
  try {
    const { studentIds, message, type = 'bulk' } = await request.json();
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0 || !message) {
      return NextResponse.json(
        { error: 'Missing studentIds array or message' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get student phone numbers
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, name, phone_number')
      .in('id', studentIds)
      .eq('sms_enabled', true)
      .not('phone_number', 'is', null);

    if (studentsError) {
      return NextResponse.json(
        { error: 'Failed to fetch students', details: studentsError.message },
        { status: 500 }
      );
    }

    if (!students || students.length === 0) {
      return NextResponse.json(
        { error: 'No students found with SMS enabled' },
        { status: 404 }
      );
    }

    // Prepare recipients for bulk SMS
    const recipients = students.map(student => ({
      phone: student.phone_number!,
      message: message.replace('{name}', student.name),
      studentId: student.id
    }));

    // Send bulk SMS
    const { sendBulkSMS } = await import('@/lib/sms/twilio');
    const results = await sendBulkSMS(recipients, {
      delayBetween: 1000 // 1 second delay between messages
    });

    // Store results in database
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: true,
      totalSent: results.length,
      successCount,
      failureCount,
      results: results.map(r => ({
        phone: r.phone,
        success: r.success,
        error: r.error
      }))
    });

  } catch (error) {
    console.error('Bulk SMS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
