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

    // Get complete student profile with onboarding data
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        *,
        users!inner (
          email,
          institute_id,
          profile_data
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (studentError) {
      // If student record doesn't exist, return user data only
      if (studentError.code === 'PGRST116') {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        const firstName = userData?.profile_data?.first_name || '';
        const lastName = userData?.profile_data?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || userData?.email || 'User';
        
        return successResponse({
          user_id: user.id,
          email: userData?.email,
          full_name: fullName,
          onboarding_profile: null
        });
      }
      throw studentError;
    }

    // Format the response - get full_name from profile_data
    const firstName = student.users?.profile_data?.first_name || '';
    const lastName = student.users?.profile_data?.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || student.users?.email || 'User';

    const profileData = {
      user_id: student.user_id,
      email: student.users.email,
      full_name: fullName,
      grade: student.grade,
      batch: student.batch,
      interests: student.interests || [],
      goals: student.goals || [],
      risk_score: student.risk_score,
      onboarding_profile: student.onboarding_profile,
      institute_id: student.users.institute_id
    };

    return successResponse(profileData);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { grade, batch, interests, goals, onboarding_profile } = body;

    // Update student profile
    const { data: student, error } = await supabase
      .from('students')
      .update({
        grade,
        batch,
        interests,
        goals,
        onboarding_profile
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return successResponse(student);
  } catch (error) {
    return handleApiError(error);
  }
}

