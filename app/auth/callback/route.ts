import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);
    
    if (user) {
      // Check if user exists in our database
      const { data: userProfile } = await supabase
        .from('users')
        .select('role, institute_id')
        .eq('id', user.id)
        .single();

      let role = 'student';

      // If user doesn't exist, create them as a student with a demo institute
      if (!userProfile) {
        // Create or get a default demo institute
        let instituteId: string;
        const { data: existingInstitute } = await supabase
          .from('institutes')
          .select('id')
          .eq('name', 'Demo Institute')
          .single();

        if (existingInstitute) {
          instituteId = existingInstitute.id;
        } else {
          const { data: newInstitute, error: instError } = await supabase
            .from('institutes')
            .insert({
              name: 'Demo Institute',
              plan_type: 'quantum'
            })
            .select('id')
            .single();
          
          if (instError) {
            console.error('Error creating institute:', instError);
          } else {
            instituteId = newInstitute?.id || '';
          }
        }

        // Create user record
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            institute_id: instituteId,
            role: 'student',
            email: user.email || '',
            profile_data: {
              first_name: user.user_metadata?.full_name || '',
              last_name: ''
            }
          });

        if (userError) {
          console.error('Error creating user:', userError);
        }

        // Create student record
        const { error: studentError } = await supabase
          .from('students')
          .insert({
            user_id: user.id,
            grade: 'Class 10', // Default grade
            batch: '2024-2025' // Default batch
          });

        if (studentError) {
          console.error('Error creating student:', studentError);
        }

        // Also create student_stats record
        await supabase
          .from('student_stats')
          .insert({
            user_id: user.id,
            xp: 0,
            level: 1,
            streak_days: 0,
            coins: 0,
            badges: []
          });
      } else {
        role = userProfile.role;
      }

      // Redirect based on role
      switch (role) {
        case 'admin':
          return NextResponse.redirect(`${origin}/dashboard/admin`);
        case 'teacher':
          return NextResponse.redirect(`${origin}/dashboard/teacher`);
        case 'student':
        default:
          return NextResponse.redirect(`${origin}/dashboard/student`);
      }
    }
  }

  // Fallback to student dashboard
  return NextResponse.redirect(`${origin}/dashboard`);
}

