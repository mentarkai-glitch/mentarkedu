import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';
import { aiOrchestrator } from '@/lib/ai/orchestrator';
import type { AIContext } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch productivity data
    const [productivityData, checkins, agendaItems] = await Promise.all([
      // Productivity metrics
      supabase
        .from('productivity_metrics')
        .select('*')
        .eq('student_id', user.id)
        .gte('metric_date', startDate.toISOString().split('T')[0])
        .lte('metric_date', endDate.toISOString().split('T')[0])
        .order('metric_date', { ascending: true }),
      
      // Daily check-ins
      supabase
        .from('daily_checkins')
        .select('*')
        .eq('student_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true }),
      
      // Agenda items
      supabase
        .from('daily_agenda')
        .select('*')
        .eq('student_id', user.id)
        .gte('start_at', startDate.toISOString())
        .lte('start_at', endDate.toISOString())
        .order('start_at', { ascending: true })
    ]);

    // Calculate insights
    const insights = calculateProductivityInsights(
      productivityData.data || [],
      checkins.data || [],
      agendaItems.data || []
    );

    // Generate AI-powered recommendations
    let aiRecommendations: string[] = [];
    try {
      const prompt = `Analyze this student's productivity data and provide 3-5 actionable recommendations:

Productivity Metrics (last ${days} days):
- Average planned minutes: ${insights.avgPlannedMinutes}
- Average actual minutes: ${insights.avgActualMinutes}
- Completion rate: ${(insights.completionRate * 100).toFixed(1)}%
- Deep work minutes: ${insights.avgDeepWorkMinutes}
- Context switches: ${insights.avgContextSwitches}

Energy & Focus:
- Average energy: ${insights.avgEnergy}/5
- Average focus: ${insights.avgFocus}/5
- Energy trend: ${insights.energyTrend}

Task Performance:
- Tasks completed: ${insights.tasksCompleted}
- Tasks planned: ${insights.tasksPlanned}
- On-time completion: ${(insights.onTimeCompletion * 100).toFixed(1)}%

Provide 3-5 specific, actionable recommendations to improve productivity. Be concise and practical.`;

      const context: AIContext = {
        task: 'insights',
        user_id: user.id,
        metadata: { user_tier: 'free' }
      };

      const aiResponse = await aiOrchestrator(context, prompt);
      aiRecommendations = aiResponse.content
        .split('\n')
        .filter(line => line.trim().length > 0 && (line.includes('-') || line.match(/^\d+\./)))
        .slice(0, 5)
        .map(line => line.replace(/^[-•\d.]+\s*/, '').trim());
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
    }

    return successResponse({
      insights,
      aiRecommendations,
      period: { start: startDate.toISOString(), end: endDate.toISOString(), days }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

function calculateProductivityInsights(
  productivityData: any[],
  checkins: any[],
  agendaItems: any[]
) {
  // Calculate averages
  const avgPlannedMinutes = productivityData.length > 0
    ? productivityData.reduce((sum, p) => sum + (p.planned_minutes || 0), 0) / productivityData.length
    : 0;

  const avgActualMinutes = productivityData.length > 0
    ? productivityData.reduce((sum, p) => sum + (p.actual_minutes || 0), 0) / productivityData.length
    : 0;

  const avgDeepWorkMinutes = productivityData.length > 0
    ? productivityData.reduce((sum, p) => sum + (p.deep_work_minutes || 0), 0) / productivityData.length
    : 0;

  const avgContextSwitches = productivityData.length > 0
    ? productivityData.reduce((sum, p) => sum + (p.context_switches || 0), 0) / productivityData.length
    : 0;

  const avgEnergy = checkins.length > 0
    ? checkins.reduce((sum, c) => sum + (c.energy || 5), 0) / checkins.length
    : 5;

  const avgFocus = checkins.length > 0
    ? checkins.reduce((sum, c) => sum + (c.focus || 5), 0) / checkins.length
    : 5;

  // Calculate trends
  const recentCheckins = checkins.slice(-7);
  const olderCheckins = checkins.slice(0, -7);
  
  const recentAvgEnergy = recentCheckins.length > 0
    ? recentCheckins.reduce((sum, c) => sum + (c.energy || 5), 0) / recentCheckins.length
    : 5;
  
  const olderAvgEnergy = olderCheckins.length > 0
    ? olderCheckins.reduce((sum, c) => sum + (c.energy || 5), 0) / olderCheckins.length
    : 5;

  const energyTrend = recentAvgEnergy > olderAvgEnergy ? 'improving' : 
                      recentAvgEnergy < olderAvgEnergy ? 'declining' : 'stable';

  // Task completion metrics
  const tasksCompleted = agendaItems.filter(item => item.status === 'completed').length;
  const tasksPlanned = agendaItems.length;
  const completionRate = tasksPlanned > 0 ? tasksCompleted / tasksPlanned : 0;

  // On-time completion (within 1 hour of planned time)
  const onTimeTasks = agendaItems.filter(item => {
    if (item.status !== 'completed' || !item.start_at || !item.completed_at) return false;
    const planned = new Date(item.start_at).getTime();
    const actual = new Date(item.completed_at).getTime();
    return Math.abs(actual - planned) < 60 * 60 * 1000; // 1 hour
  }).length;

  const onTimeCompletion = tasksCompleted > 0 ? onTimeTasks / tasksCompleted : 0;

  return {
    avgPlannedMinutes: Math.round(avgPlannedMinutes),
    avgActualMinutes: Math.round(avgActualMinutes),
    avgDeepWorkMinutes: Math.round(avgDeepWorkMinutes),
    avgContextSwitches: Math.round(avgContextSwitches * 10) / 10,
    avgEnergy: Math.round(avgEnergy * 10) / 10,
    avgFocus: Math.round(avgFocus * 10) / 10,
    energyTrend,
    tasksCompleted,
    tasksPlanned,
    completionRate: Math.round(completionRate * 100) / 100,
    onTimeCompletion: Math.round(onTimeCompletion * 100) / 100,
    efficiency: avgPlannedMinutes > 0 
      ? Math.round((avgActualMinutes / avgPlannedMinutes) * 100) / 100 
      : 0
  };
}


