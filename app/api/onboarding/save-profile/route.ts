import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { StudentProfile } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { profile }: { profile: StudentProfile } = await request.json();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile data is required' },
        { status: 400 }
      );
    }

    // Update the student record with onboarding profile
    const { error: updateError } = await supabase
      .from('students')
      .update({
        onboarding_profile: profile,
        grade: profile.grade,
        interests: profile.interests,
        goals: profile.goals
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating student profile:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to save profile' },
        { status: 500 }
      );
    }

    // Also update the user's profile_data with basic info
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        profile_data: {
          first_name: profile.grade, // We'll use grade as identifier for now
          last_name: profile.level,
          onboarding_completed: true
        }
      })
      .eq('id', user.id);

    if (userUpdateError) {
      console.error('Error updating user profile:', userUpdateError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully',
      data: { profile }
    });

  } catch (error) {
    console.error('Error in save-profile API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
