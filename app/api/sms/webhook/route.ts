import { NextRequest, NextResponse } from 'next/server';
import { processIncomingSMS } from '@/lib/sms/handlers';
import { sendSMS } from '@/lib/sms/msg91';

export async function POST(request: NextRequest) {
  try {
    // Parse MSG91 webhook data (JSON format)
    const webhookData = await request.json();
    
    const { 
      mobile, 
      message, 
      request_id, 
      status, 
      delivery_time,
      error_code 
    } = webhookData;

    console.log(`📱 MSG91 Webhook received:`, {
      mobile,
      message: message?.substring(0, 50) + '...',
      request_id,
      status,
      delivery_time,
      error_code
    });

    // Handle incoming messages (if MSG91 supports two-way SMS)
    if (message && mobile && status === 'received') {
      const result = await processIncomingSMS(mobile, message, request_id);
      
      if (result.success && result.response) {
        // Send AI response back to student
        const smsResult = await sendSMS(mobile, result.response);
        
        if (smsResult.success) {
          console.log(`✅ SMS response sent: ${smsResult.request_id}`);
        } else {
          console.error('❌ Failed to send SMS response:', smsResult.error);
        }
      }
    }

    // Handle delivery status updates
    if (request_id && status) {
      // Update message status in database
      const supabase = await import('@/lib/supabase/server').then(m => m.createClient());
      
      const { error } = await supabase
        .from('sms_messages')
        .update({
          status: status,
          ...(error_code && { error_code: error_code })
        })
        .eq('twilio_sid', request_id); // Using twilio_sid field for MSG91 request_id

      if (error) {
        console.error('Error updating SMS status:', error);
      } else {
        console.log(`✅ SMS status updated: ${request_id} -> ${status}`);
      }
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('SMS webhook error:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}

/**
 * Handle SMS status callbacks from Twilio
 */
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    const errorCode = formData.get('ErrorCode') as string;

    console.log(`📊 SMS Status Update:`, {
      messageSid,
      status: messageStatus,
      errorCode
    });

    // Update message status in database
    if (messageSid && messageStatus) {
      const supabase = await import('@/lib/supabase/server').then(m => m.createClient());
      
      const { error } = await supabase
        .from('sms_messages')
        .update({
          status: messageStatus,
          ...(errorCode && { error_code: errorCode })
        })
        .eq('twilio_sid', messageSid);

      if (error) {
        console.error('Error updating SMS status:', error);
      } else {
        console.log(`✅ SMS status updated: ${messageSid} -> ${messageStatus}`);
      }
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('SMS status callback error:', error);
    return new Response('Error processing status callback', { status: 500 });
  }
}

/**
 * Handle GET requests (for webhook verification)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'SMS webhook endpoint active',
    timestamp: new Date().toISOString()
  });
}
