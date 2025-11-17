import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';
import { createSmartSchedule, type Task, type EnergyProfile } from '@/lib/services/smart-scheduler';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { tasks, date, existingEvents } = body;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // Get student's energy profile from daily check-ins
    const { data: checkins } = await supabase
      .from('daily_checkins')
      .select('energy, focus, date')
      .eq('student_id', user.id)
      .order('date', { ascending: false })
      .limit(30);

    // Calculate average energy profile
    const energyProfile: EnergyProfile = {
      morning: 7,
      afternoon: 6,
      evening: 5,
      night: 4
    };

    if (checkins && checkins.length > 0) {
      // Simple heuristic: map check-in times to energy bands
      // In production, would track actual check-in times
      const avgEnergy = checkins.reduce((sum, c) => sum + (c.energy || 5), 0) / checkins.length;
      energyProfile.morning = Math.min(10, Math.max(1, avgEnergy + 2));
      energyProfile.afternoon = Math.min(10, Math.max(1, avgEnergy + 1));
      energyProfile.evening = Math.min(10, Math.max(1, avgEnergy));
      energyProfile.night = Math.min(10, Math.max(1, avgEnergy - 1));
    }

    // Get user's preferred working hours (from profile or defaults)
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(6, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(22, 0, 0, 0);

    // Create available hours (default: 6am-10pm with breaks)
    const availableHours = [
      { start: startOfDay.toISOString(), end: new Date(targetDate.setHours(12, 0, 0, 0)).toISOString() }, // Morning
      { start: new Date(targetDate.setHours(13, 0, 0, 0)).toISOString(), end: new Date(targetDate.setHours(17, 0, 0, 0)).toISOString() }, // Afternoon
      { start: new Date(targetDate.setHours(18, 0, 0, 0)).toISOString(), end: endOfDay.toISOString() } // Evening
    ];

    // Validate and transform tasks
    const validatedTasks: Task[] = tasks.map((t: any) => ({
      id: t.id || `task-${Date.now()}-${Math.random()}`,
      title: t.title,
      description: t.description,
      estimatedMinutes: t.estimatedMinutes || 60,
      priority: t.priority || 3,
      energyRequired: t.energyRequired || 'medium',
      category: t.category || 'general',
      dependencies: t.dependencies || [],
      deadline: t.deadline,
      flexible: t.flexible !== false
    }));

    // Create smart schedule
    const scheduleResult = await createSmartSchedule(
      validatedTasks,
      energyProfile,
      availableHours,
      existingEvents || [],
      user.id
    );

    return successResponse(scheduleResult);
  } catch (error) {
    return handleApiError(error);
  }
}


