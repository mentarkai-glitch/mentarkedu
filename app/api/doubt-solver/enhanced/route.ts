import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';
import {
  generateStepByStepSolution,
  findRelatedConcepts,
  discoverRelatedDoubts,
  verifySolution
} from '@/lib/services/enhanced-doubt-solver';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { question, category } = body;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    if (!question) {
      return errorResponse('Question is required', 400);
    }

    // Generate step-by-step solution
    const solution = await generateStepByStepSolution(
      question,
      category || 'general',
      user.id
    );

    // Find related concepts
    const relatedConcepts = await findRelatedConcepts(
      question,
      solution,
      user.id
    );

    // Discover related doubts from history
    // Get doubt history from localStorage or database
    // For now, we'll pass empty array - this would be fetched from a doubts table
    const relatedDoubts = await discoverRelatedDoubts(
      question,
      solution.conceptTags,
      [],
      user.id
    );

    // Verify solution if requested
    let verification: string | undefined;
    try {
      verification = await verifySolution(question, solution, user.id);
    } catch (error) {
      console.error('Verification failed (non-critical):', error);
    }

    return successResponse({
      solution: {
        ...solution,
        verification: verification || solution.verification
      },
      relatedConcepts,
      relatedDoubts,
      videos: [] // Will be populated by main doubt-solver route
    });
  } catch (error) {
    return handleApiError(error);
  }
}


