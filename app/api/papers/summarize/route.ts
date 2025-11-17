import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';
import { summarizePaper } from '@/lib/services/paper-analyzer';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { title, abstract, fullText } = body;

    if (!title || !abstract) {
      return errorResponse('Title and abstract are required', 400);
    }

    const summary = await summarizePaper(title, abstract, fullText, user.id);

    return successResponse({ summary });
  } catch (error) {
    return handleApiError(error);
  }
}

