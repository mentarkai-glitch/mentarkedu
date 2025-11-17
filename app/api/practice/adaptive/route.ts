import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';
import {
  calculateAdaptiveDifficulty,
  calculatePerformanceMetrics,
  analyzeMistakePatterns,
  getMistakesDueForReview,
  type DifficultyLevel
} from '@/lib/services/adaptive-practice';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    if (action === 'metrics') {
      // Get performance metrics
      // In production, would fetch from practice_sessions and practice_attempts tables
      const metrics = calculatePerformanceMetrics([], []);
      
      return successResponse({ metrics });
    }

    if (action === 'mistake-patterns') {
      // Get mistake patterns
      // In production, would fetch from mistakes table
      const patterns = analyzeMistakePatterns([], []);
      
      return successResponse({ patterns });
    }

    if (action === 'due-review') {
      // Get mistakes due for review
      // In production, would fetch from mistakes table
      const dueMistakes = getMistakesDueForReview([]);
      
      return successResponse({ mistakes: dueMistakes });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { action, attempts, currentDifficulty, questionId, selectedAnswer, correctAnswer, timeSpent } = body;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    if (action === 'calculate-difficulty') {
      // Calculate adaptive difficulty based on recent attempts
      const adaptiveDifficulty = calculateAdaptiveDifficulty(
        attempts || [],
        currentDifficulty || 'medium'
      );
      
      return successResponse({ difficulty: adaptiveDifficulty });
    }

    if (action === 'track-mistake') {
      // Track a mistake
      // In production, would save to mistakes table
      // For now, return success
      return successResponse({ tracked: true });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    return handleApiError(error);
  }
}

