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
    const categoryId = searchParams.get('category');

    // Get user's institute and grade
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('institute_id, role')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    // Get student's grade if they're a student
    let studentGrade = null;
    if (userData.role === 'student') {
      const { data: studentData } = await supabase
        .from('students')
        .select('grade')
        .eq('user_id', user.id)
        .single();
      
      studentGrade = studentData?.grade;
    }

    // Build query for templates
    let query = supabase
      .from('ark_templates')
      .select(`
        *,
        users!ark_templates_created_by_fkey (
          profile_data
        )
      `);
    
    // Filter by institute_id if available
    if (userData.institute_id) {
      query = query.eq('institute_id', userData.institute_id);
    } else {
      // If no institute_id, return empty array (or could be made public templates)
      return successResponse({
        templates: [],
        count: 0
      });
    }

    // Students can only see published templates
    if (userData.role === 'student') {
      query = query.eq('is_published', true);
      
      // Filter by grade if available
      if (studentGrade) {
        query = query.or(`target_grade.eq.${studentGrade},target_grade.is.null`);
      }
    }

    // Filter by category if specified
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    query = query.order('created_at', { ascending: false });

    const { data: templates, error } = await query;

    if (error) throw error;

    return successResponse({
      templates: templates || [],
      count: templates?.length || 0
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify user is teacher or admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('institute_id, role')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;

    if (userData.role !== 'teacher' && userData.role !== 'admin') {
      return errorResponse("Only teachers and admins can create templates", 403);
    }

    const body = await request.json();
    const {
      category_id,
      title,
      description,
      target_batch,
      target_grade,
      milestones,
      resources,
      is_published
    } = body;

    if (!category_id || !title || !milestones) {
      return errorResponse("Category, title, and milestones are required", 400);
    }

    // Create template
    const { data: template, error } = await supabase
      .from('ark_templates')
      .insert({
        institute_id: userData.institute_id,
        category_id,
        title,
        description,
        target_batch,
        target_grade,
        milestones,
        resources: resources || [],
        created_by: user.id,
        is_published: is_published || false
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(template);
  } catch (error) {
    return handleApiError(error);
  }
}

