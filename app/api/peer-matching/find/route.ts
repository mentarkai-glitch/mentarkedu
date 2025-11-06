import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { preferences } = body;

    // Get current student's profile
    const { data: currentStudent, error: studentError } = await supabase
      .from('students')
      .select(`
        grade,
        batch,
        interests,
        goals,
        users!inner (
          institute_id,
          full_name
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (studentError) throw studentError;

    // Get current student's career profile
    const { data: currentCareerProfile, error: careerError } = await supabase
      .from('student_career_profiles')
      .select(`
        affinity_score,
        career_categories!inner (
          name
        )
      `)
      .eq('student_id', user.id)
      .order('affinity_score', { ascending: false });

    if (careerError) throw careerError;

    // Find potential matches within the same institute and batch
    const { data: potentialMatches, error: matchesError } = await supabase
      .from('students')
      .select(`
        user_id,
        grade,
        batch,
        interests,
        goals,
        users!inner (
          full_name,
          avatar_url,
          institute_id
        ),
        student_career_profiles (
          affinity_score,
          career_categories!inner (
            name
          )
        )
      `)
      .eq('users.institute_id', currentStudent.users.institute_id)
      .eq('batch', currentStudent.batch)
      .neq('user_id', user.id)
      .limit(20);

    if (matchesError) throw matchesError;

    // Calculate compatibility scores
    const scoredMatches = potentialMatches?.map(match => {
      let compatibilityScore = 0;
      const factors = [];

      // Interest overlap (40% weight)
      const commonInterests = match.interests.filter(interest => 
        currentStudent.interests.includes(interest)
      );
      const interestScore = commonInterests.length / Math.max(currentStudent.interests.length, 1);
      compatibilityScore += interestScore * 0.4;
      factors.push(`Shared interests: ${commonInterests.join(', ') || 'None'}`);

      // Goal similarity (30% weight)
      const commonGoals = match.goals.filter(goal => 
        currentStudent.goals.includes(goal)
      );
      const goalScore = commonGoals.length / Math.max(currentStudent.goals.length, 1);
      compatibilityScore += goalScore * 0.3;
      factors.push(`Shared goals: ${commonGoals.join(', ') || 'None'}`);

      // Career profile similarity (30% weight)
      const currentTopCategories = currentCareerProfile?.slice(0, 3).map(p => p.career_categories.name) || [];
      const matchTopCategories = match.student_career_profiles?.slice(0, 3).map(p => p.career_categories.name) || [];
      const commonCategories = currentTopCategories.filter(cat => matchTopCategories.includes(cat));
      const careerScore = commonCategories.length / Math.max(currentTopCategories.length, 1);
      compatibilityScore += careerScore * 0.3;
      factors.push(`Shared career interests: ${commonCategories.join(', ') || 'None'}`);

      // Determine match type
      let matchType = 'similar_interests';
      if (careerScore > 0.5) {
        matchType = 'complementary';
      }
      if (interestScore > 0.6 && goalScore > 0.6) {
        matchType = 'study_buddy';
      }

      return {
        student_id: match.user_id,
        name: match.users.full_name,
        avatar: match.users.avatar_url,
        grade: match.grade,
        interests: match.interests,
        goals: match.goals,
        compatibility_score: Math.round(compatibilityScore * 100) / 100,
        match_type: matchType,
        factors: factors.filter(f => !f.includes('None'))
      };
    }) || [];

    // Sort by compatibility score
    scoredMatches.sort((a, b) => b.compatibility_score - a.compatibility_score);

    // Take top 5 matches
    const topMatches = scoredMatches.slice(0, 5);

    // Save matches to database (or update existing ones)
    const matchInserts = topMatches.map(match => ({
      student_id: user.id,
      matched_student_id: match.student_id,
      compatibility_score: match.compatibility_score,
      match_type: match.match_type,
      status: 'pending'
    }));

    // Delete existing pending matches
    await supabase
      .from('peer_matches')
      .delete()
      .eq('student_id', user.id)
      .eq('status', 'pending');

    // Insert new matches
    if (matchInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('peer_matches')
        .insert(matchInserts);

      if (insertError) throw insertError;
    }

    return successResponse({
      matches: topMatches,
      total_found: potentialMatches?.length || 0,
      current_profile: {
        interests: currentStudent.interests,
        goals: currentStudent.goals,
        top_career_categories: currentCareerProfile?.slice(0, 3).map(p => p.career_categories.name) || []
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
