import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const batch = searchParams.get('batch') || 'all';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get user's institute and batch
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('institute_id')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    // Get student's batch
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('batch')
      .eq('user_id', user.id)
      .single();

    if (studentError) throw studentError;

    // Build query for leaderboard
    let query = supabase
      .from('leaderboard_entries')
      .select(`
        rank,
        xp_total,
        level,
        students!inner (
          user_id,
          users!inner (
            full_name,
            avatar_url
          )
        )
      `)
      .eq('institute_id', userData.institute_id)
      .order('rank', { ascending: true })
      .limit(limit);

    // Filter by batch if specified
    if (batch !== 'all') {
      query = query.eq('batch_id', batch);
    }

    const { data: leaderboard, error } = await query;

    if (error) throw error;

    // Get current user's position
    const { data: userPosition, error: positionError } = await supabase
      .from('leaderboard_entries')
      .select('rank, xp_total, level')
      .eq('student_id', user.id)
      .eq('institute_id', userData.institute_id)
      .single();

    if (positionError && positionError.code !== 'PGRST116') {
      throw positionError;
    }

    return successResponse({
      leaderboard: leaderboard || [],
      userPosition: userPosition || null,
      totalStudents: leaderboard?.length || 0
    });
  } catch (error) {
    return handleApiError(error);
  }
}
