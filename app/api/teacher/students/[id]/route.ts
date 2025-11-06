import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const studentId = id;

    // Verify teacher has access to this student
    const { data: assignment, error: assignmentError } = await supabase
      .from('teacher_student_assignments')
      .select('*')
      .eq('teacher_id', user.id)
      .eq('student_id', studentId)
      .eq('is_active', true)
      .single();

    if (assignmentError || !assignment) {
      return errorResponse("Student not found or not assigned to you", 404);
    }

    // Get detailed student info
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('user_id', studentId)
      .single();

    if (studentError) throw studentError;

    // Get user's profile data separately
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('email, profile_data')
      .eq('id', studentId)
      .single();

    if (userDataError) throw userDataError;

    // Extract full_name from profile_data
    const firstName = userData?.profile_data?.first_name || '';
    const lastName = userData?.profile_data?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || userData?.email || 'User';
    const avatarUrl = userData?.profile_data?.avatar_url || null;

    // Get student's ARKs
    const { data: arks, error: arksError } = await supabase
      .from('arks')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (arksError) throw arksError;

    // Get recent daily check-ins (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: checkIns, error: checkInsError } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('student_id', studentId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (checkInsError) throw checkInsError;

    // Get recent chat sessions
    const { data: chatSessions, error: chatError } = await supabase
      .from('chat_sessions')
      .select('id, created_at, updated_at')
      .eq('user_id', studentId)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (chatError) throw chatError;

    // Get XP and gamification stats
    const { data: xpData, error: xpError } = await supabase
      .from('xp_transactions')
      .select('amount')
      .eq('student_id', studentId);

    const totalXp = xpData?.reduce((sum, t) => sum + t.amount, 0) || 0;
    const level = Math.floor(Math.sqrt(totalXp / 100)) + 1;

    // Get earned badges
    const { data: badges, error: badgesError } = await supabase
      .from('badge_awards')
      .select(`
        *,
        achievements!inner (
          title,
          icon_url,
          type
        )
      `)
      .eq('student_id', studentId);

    // Get interventions for this student
    const { data: interventions, error: interventionsError } = await supabase
      .from('interventions')
      .select('*')
      .eq('student_id', studentId)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate emotion trends from check-ins
    const emotionTrend = checkIns?.map(c => ({
      date: c.created_at,
      energy: c.energy_level || 5,
      progress: c.progress_rating || 5,
      emotion: c.emotion_score || 5
    })) || [];

    return successResponse({
      student: {
        id: student.user_id,
        full_name: fullName,
        email: userData.email,
        avatar_url: avatarUrl,
        grade: student.grade,
        batch: student.batch,
        interests: student.interests,
        goals: student.goals,
        risk_score: student.risk_score,
        onboarding_profile: student.onboarding_profile
      },
      arks: arks || [],
      daily_checkins: checkIns || [],
      emotion_trend: emotionTrend,
      chat_sessions: chatSessions || [],
      gamification: {
        total_xp: totalXp,
        level,
        badges_earned: badges?.length || 0,
        badges: badges || []
      },
      interventions: interventions || []
    });
  } catch (error) {
    return handleApiError(error);
  }
}

