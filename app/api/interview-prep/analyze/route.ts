import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';
import { analyzeAnswer } from '@/lib/services/interview-prep';
import type { InterviewQuestion } from '@/lib/services/interview-prep';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { question, answer, jobContext } = body;

    if (!question || !answer) {
      return errorResponse('Question and answer are required', 400);
    }

    const feedback = await analyzeAnswer(
      question as InterviewQuestion,
      answer,
      jobContext
    );

    return successResponse({ feedback });
  } catch (error) {
    return handleApiError(error);
  }
}

