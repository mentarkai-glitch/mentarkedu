import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';
import { generateInterviewQuestions, getCommonQuestions } from '@/lib/services/interview-prep';
import type { InterviewQuestion } from '@/lib/services/interview-prep';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { action, jobTitle, company, jobDescription, skills, category } = body;

    if (action === 'generate') {
      if (!jobTitle || !jobDescription) {
        return errorResponse('Job title and description are required', 400);
      }

      const questions = await generateInterviewQuestions(
        jobTitle,
        company || '',
        jobDescription,
        skills || []
      );

      return successResponse({ questions });
    }

    if (action === 'common') {
      if (!category) {
        return errorResponse('Category is required', 400);
      }

      const questions = getCommonQuestions(category as InterviewQuestion['category']);

      return successResponse({ questions });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    return handleApiError(error);
  }
}

