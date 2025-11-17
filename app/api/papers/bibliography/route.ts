import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';
import { generateBibliography } from '@/lib/services/paper-analyzer';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { papers, format = 'apa' } = body;

    if (!papers || !Array.isArray(papers)) {
      return errorResponse('Papers array is required', 400);
    }

    const bibliography = generateBibliography(papers, format);

    return successResponse({ bibliography, format });
  } catch (error) {
    return handleApiError(error);
  }
}

