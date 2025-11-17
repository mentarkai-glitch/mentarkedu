import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';
import { analyzeSkillGaps } from '@/lib/services/resume-builder';
import type { ResumeData } from '@/lib/services/resume-builder';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { resumeData, jobDescription } = body;

    if (!resumeData || !jobDescription) {
      return errorResponse('Resume data and job description are required', 400);
    }

    const analysis = await analyzeSkillGaps(
      resumeData as ResumeData,
      jobDescription
    );

    return successResponse({ analysis });
  } catch (error) {
    return handleApiError(error);
  }
}

