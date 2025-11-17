import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';
import { createClient as createSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { name, description, subject, settings } = body;

    if (!name || !description || !subject) {
      return errorResponse('Name, description, and subject are required', 400);
    }

    // Get user profile for name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single();

    // In a real implementation, this would create a study group in the database
    // For now, return success
    return successResponse({
      group: {
        id: `group-${Date.now()}`,
        name,
        description,
        subject,
        creatorId: user.id,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

