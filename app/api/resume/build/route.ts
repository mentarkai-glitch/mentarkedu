import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';
import { generateResumeWithAI, analyzeSkillGaps } from '@/lib/services/resume-builder';
import type { ResumeData } from '@/lib/services/resume-builder';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { action, resumeData, templateId, jobDescription } = body;

    if (action === 'generate') {
      if (!resumeData || !templateId) {
        return errorResponse('Resume data and template ID are required', 400);
      }

      const enhancedResume = await generateResumeWithAI(
        resumeData as Partial<ResumeData>,
        templateId,
        jobDescription
      );

      return successResponse({ resume: enhancedResume });
    }

    if (action === 'analyze-gaps') {
      if (!resumeData || !jobDescription) {
        return errorResponse('Resume data and job description are required', 400);
      }

      const analysis = await analyzeSkillGaps(
        resumeData as ResumeData,
        jobDescription
      );

      return successResponse({ analysis });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    return handleApiError(error);
  }
}

