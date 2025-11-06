import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendBulkSMS } from '@/lib/sms/msg91';

/**
 * Create and execute SMS campaign
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      instituteId, 
      name, 
      templateId, 
      targetStudents, 
      targetCriteria, 
      scheduledAt,
      createdBy 
    } = await request.json();
    
    if (!instituteId || !name || !templateId) {
      return NextResponse.json(
        { error: 'Missing required fields: instituteId, name, templateId' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get SMS template
    const { data: template, error: templateError } = await supabase
      .from('sms_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'SMS template not found or inactive' },
        { status: 404 }
      );
    }

    // Get target students
    let studentsQuery = supabase
      .from('students')
      .select(`
        user_id,
        phone_number,
        users!inner(email, profile_data)
      `)
      .eq('sms_enabled', true)
      .not('phone_number', 'is', null);

    if (targetStudents && targetStudents.length > 0) {
      studentsQuery = studentsQuery.in('user_id', targetStudents);
    } else if (targetCriteria) {
      // Apply target criteria filters
      if (targetCriteria.batch) {
        studentsQuery = studentsQuery.eq('batch', targetCriteria.batch);
      }
      if (targetCriteria.grade) {
        studentsQuery = studentsQuery.eq('grade', targetCriteria.grade);
      }
      if (targetCriteria.minRiskScore) {
        studentsQuery = studentsQuery.gte('risk_score', targetCriteria.minRiskScore);
      }
    }

    const { data: students, error: studentsError } = await studentsQuery;

    if (studentsError) {
      return NextResponse.json(
        { error: 'Failed to fetch target students', details: studentsError.message },
        { status: 500 }
      );
    }

    if (!students || students.length === 0) {
      return NextResponse.json(
        { error: 'No students found matching criteria' },
        { status: 404 }
      );
    }

    // Create campaign record
    const { data: campaign, error: campaignError } = await supabase
      .from('sms_campaigns')
      .insert({
        institute_id: instituteId,
        name,
        template_id: templateId,
        target_students: students.map(s => s.user_id),
        target_criteria: targetCriteria,
        scheduled_at: scheduledAt || new Date().toISOString(),
        status: 'sending',
        total_recipients: students.length,
        created_by: createdBy
      })
      .select()
      .single();

    if (campaignError) {
      return NextResponse.json(
        { error: 'Failed to create SMS campaign', details: campaignError.message },
        { status: 500 }
      );
    }

    // Prepare messages for bulk sending
    const recipients = students.map(student => {
      let message = template.template;
      
      // Replace template variables
      if (template.variables && template.variables.length > 0) {
        // Handle users as array (TypeScript inference issue with Supabase joins)
        const studentUser = Array.isArray(student.users) ? student.users[0] : student.users;
        const profileData = studentUser?.profile_data || {};
        template.variables.forEach(variable => {
          const cleanVar = variable.replace(/[{}]/g, '');
          const value = profileData[cleanVar] || cleanVar;
          message = message.replace(new RegExp(variable, 'g'), value);
        });
      }
      
      return {
        phone: student.phone_number,
        message,
        studentId: student.user_id
      };
    });

    // Send bulk SMS
    const results = await sendBulkSMS(recipients, {
      delayBetween: 1000 // 1 second delay between messages
    });

    // Update campaign with results
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    const { error: updateError } = await supabase
      .from('sms_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        success_count: successCount,
        failure_count: failureCount
      })
      .eq('id', campaign.id);

    if (updateError) {
      console.error('Error updating campaign results:', updateError);
    }

    // Store delivery log
    const deliveryLogs = results.map(result => ({
      campaign_id: campaign.id,
      student_id: recipients.find(r => r.phone === result.phone)?.studentId,
      phone_number: result.phone,
      message_sid: result.sid,
      status: result.success ? 'sent' : 'failed',
      error_code: result.error
    }));

    const { error: logError } = await supabase
      .from('sms_delivery_log')
      .insert(deliveryLogs);

    if (logError) {
      console.error('Error storing delivery logs:', logError);
    }

    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign,
        success_count: successCount,
        failure_count: failureCount,
        status: 'sent'
      },
        results: results.map(r => ({
        phone: r.phone,
        success: r.success,
        request_id: r.request_id,
        error: r.error
      }))
    });

  } catch (error) {
    console.error('SMS campaign API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Get SMS campaigns for an institute
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instituteId = searchParams.get('instituteId');
    const status = searchParams.get('status');

    if (!instituteId) {
      return NextResponse.json(
        { error: 'Missing instituteId parameter' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    let query = supabase
      .from('sms_campaigns')
      .select(`
        *,
        sms_templates(name, template),
        users!sms_campaigns_created_by_fkey(email, profile_data)
      `)
      .eq('institute_id', instituteId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: campaigns, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch SMS campaigns', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      campaigns: campaigns || []
    });

  } catch (error) {
    console.error('SMS campaigns API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
