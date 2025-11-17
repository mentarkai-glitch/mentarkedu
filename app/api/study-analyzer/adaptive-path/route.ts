import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';
import { generateAdaptivePath, analyzeLearningStyle, type LearningStyle } from '@/lib/services/adaptive-learning';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { goal, currentKnowledge, learningStyle } = body;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // Get performance history
    const { data: performanceData } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('student_id', user.id)
      .order('started_at', { ascending: false })
      .limit(50);

    // Get resource usage to determine learning style
    const { data: recommendations } = await supabase
      .from('resource_recommendations')
      .select('resource_type, action')
      .eq('student_id', user.id)
      .order('presented_at', { ascending: false })
      .limit(100);

    // Calculate learning style from resource usage
    const resourceUsage = {
      videos: recommendations?.filter(r => r.resource_type === 'video' && r.action === 'viewed').length || 0,
      articles: recommendations?.filter(r => r.resource_type === 'article' && r.action === 'viewed').length || 0,
      exercises: recommendations?.filter(r => r.resource_type === 'exercise' && r.action === 'completed').length || 0,
      interactive: recommendations?.filter(r => r.resource_type === 'interactive' && r.action === 'viewed').length || 0
    };

    const detectedLearningStyle = learningStyle || analyzeLearningStyle(
      performanceData?.map(p => ({
        nodeId: p.id,
        attempts: 1,
        correctAnswers: 1,
        timeSpent: p.duration_minutes || 0,
        masteryLevel: 50
      })) || [],
      resourceUsage
    );

    // Generate adaptive path
    const path = await generateAdaptivePath(
      goal || 'Master the subject',
      currentKnowledge || [],
      detectedLearningStyle as LearningStyle,
      performanceData?.map(p => ({
        nodeId: p.id,
        attempts: 1,
        correctAnswers: 1,
        timeSpent: p.duration_minutes || 0,
        masteryLevel: 50
      })) || [],
      user.id
    );

    return successResponse({
      path,
      learningStyle: detectedLearningStyle,
      resourceUsage
    });
  } catch (error) {
    return handleApiError(error);
  }
}


