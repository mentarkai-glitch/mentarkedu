import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Get student's earned badges
    const { data: badges, error } = await supabase
      .from('badge_awards')
      .select(`
        *,
        achievements (
          type,
          title,
          description,
          icon_url
        )
      `)
      .eq('student_id', user.id)
      .order('earned_at', { ascending: false });

    if (error) throw error;

    // Get all available achievements for comparison
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: true });

    if (achievementsError) throw achievementsError;

    const earnedBadgeIds = new Set(badges?.map(b => b.badge_id) || []);
    
    return successResponse({
      earned: badges || [],
      available: allAchievements?.filter(a => !earnedBadgeIds.has(a.id)) || [],
      totalEarned: badges?.length || 0,
      totalAvailable: allAchievements?.length || 0
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { badge_id, metadata } = body;

    if (!badge_id) {
      return errorResponse("Badge ID is required", 400);
    }

    // Check if badge is already earned
    const { data: existing, error: checkError } = await supabase
      .from('badge_awards')
      .select('id')
      .eq('student_id', user.id)
      .eq('badge_id', badge_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
      return errorResponse("Badge already earned", 400);
    }

    // Award badge
    const { data: badgeAward, error } = await supabase
      .from('badge_awards')
      .insert({
        student_id: user.id,
        badge_id,
        metadata: metadata || {}
      })
      .select(`
        *,
        achievements (
          type,
          title,
          description,
          icon_url
        )
      `)
      .single();

    if (error) throw error;

    // Award bonus XP for earning badge
    await supabase
      .from('xp_transactions')
      .insert({
        student_id: user.id,
        amount: 100, // Bonus XP for badge
        source: 'badge_earned',
        description: `Earned badge: ${badgeAward.achievements.title}`,
        metadata: { badge_id }
      });

    return successResponse(badgeAward);
  } catch (error) {
    return handleApiError(error);
  }
}
