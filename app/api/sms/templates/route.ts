import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendSMS, sendBulkSMS } from '@/lib/sms/twilio';

/**
 * Get SMS templates for an institute
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const instituteId = searchParams.get('instituteId');
    const messageType = searchParams.get('type');

    if (!instituteId) {
      return NextResponse.json(
        { error: 'Missing instituteId parameter' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    let query = supabase
      .from('sms_templates')
      .select('*')
      .eq('institute_id', instituteId)
      .eq('is_active', true);

    if (messageType) {
      query = query.eq('message_type', messageType);
    }

    const { data: templates, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch SMS templates', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      templates: templates || []
    });

  } catch (error) {
    console.error('SMS templates API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Create a new SMS template
 */
export async function POST(request: NextRequest) {
  try {
    const { instituteId, name, template, messageType, variables, createdBy } = await request.json();
    
    if (!instituteId || !name || !template || !messageType) {
      return NextResponse.json(
        { error: 'Missing required fields: instituteId, name, template, messageType' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { data: newTemplate, error } = await supabase
      .from('sms_templates')
      .insert({
        institute_id: instituteId,
        name,
        template,
        message_type: messageType,
        variables: variables || [],
        created_by: createdBy,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create SMS template', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template: newTemplate
    });

  } catch (error) {
    console.error('SMS template creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Update an SMS template
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, name, template, messageType, variables, isActive } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing template ID' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (template !== undefined) updateData.template = template;
    if (messageType !== undefined) updateData.message_type = messageType;
    if (variables !== undefined) updateData.variables = variables;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data: updatedTemplate, error } = await supabase
      .from('sms_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update SMS template', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template: updatedTemplate
    });

  } catch (error) {
    console.error('SMS template update error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Delete an SMS template
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing template ID' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { error } = await supabase
      .from('sms_templates')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete SMS template', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SMS template deleted successfully'
    });

  } catch (error) {
    console.error('SMS template deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

