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

    // Get student's career profile with category details
    const { data: careerProfile, error } = await supabase
      .from('student_career_profiles')
      .select(`
        affinity_score,
        updated_at,
        career_categories!inner (
          id,
          name,
          description,
          icon,
          color
        )
      `)
      .eq('student_id', user.id)
      .order('affinity_score', { ascending: false });

    if (error) throw error;

    // Get student's basic info
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select(`
        grade,
        batch,
        users!inner (
          full_name,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (studentError) throw studentError;

    // Calculate top 3 categories
    const topCategories = careerProfile?.slice(0, 3) || [];
    const averageScore = careerProfile?.reduce((sum, p) => sum + p.affinity_score, 0) / (careerProfile?.length || 1);

    return successResponse({
      student: {
        name: student.users.full_name,
        avatar: student.users.avatar_url,
        grade: student.grade,
        batch: student.batch
      },
      career_profile: {
        categories: careerProfile || [],
        top_categories: topCategories,
        average_affinity: averageScore,
        last_updated: careerProfile?.[0]?.updated_at || null
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
