import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';
import { parseSMARTGoal, validateSMARTGoal } from '@/lib/services/smart-goals';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { text, goal } = body;

    if (text) {
      // Parse natural language into SMART goal
      const parsed = parseSMARTGoal(text);
      const validation = validateSMARTGoal(parsed);
      
      return successResponse({
        goal: parsed,
        validation
      });
    }

    if (goal) {
      // Validate existing goal
      const validation = validateSMARTGoal(goal);
      
      return successResponse({ validation });
    }

    return errorResponse('Text or goal is required', 400);
  } catch (error) {
    return handleApiError(error);
  }
}

