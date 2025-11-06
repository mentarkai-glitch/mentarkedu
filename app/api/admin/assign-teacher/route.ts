import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, institute_id')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;
    
    if (userData.role !== 'admin') {
      return errorResponse("Only admins can access this endpoint", 403);
    }

    const body = await request.json();
    const {
      teacher_id,
      batch,
      subject,
      student_ids // Optional: assign specific students instead of whole batch
    } = body;

    if (!teacher_id || !batch) {
      return errorResponse("teacher_id and batch are required", 400);
    }

    // Verify teacher belongs to same institute
    const { data: teacher, error: teacherError } = await supabase
      .from('users')
      .select('id, institute_id')
      .eq('id', teacher_id)
      .eq('role', 'teacher')
      .single();

    if (teacherError || !teacher) {
      return errorResponse("Teacher not found", 404);
    }

    if (teacher.institute_id !== userData.institute_id) {
      return errorResponse("Teacher not in your institute", 403);
    }

    if (student_ids && student_ids.length > 0) {
      // Assign specific students
      const assignments = student_ids.map((student_id: string) => ({
        teacher_id,
        student_id,
        batch,
        subject,
        assigned_by: user.id
      }));

      const { data, error } = await supabase
        .from('teacher_student_assignments')
        .upsert(assignments, { onConflict: 'teacher_id,student_id' })
        .select();

      if (error) throw error;

      return successResponse({
        assigned_count: data?.length || 0,
        assignments: data || []
      });
    } else {
      // Assign whole batch using the stored function
      const { data, error } = await supabase
        .rpc('assign_teacher_to_batch', {
          p_teacher_id: teacher_id,
          p_batch: batch,
          p_subject: subject
        });

      if (error) throw error;

      return successResponse({
        assigned_count: data || 0,
        batch,
        teacher_id
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError) throw userError;
    
    if (userData.role !== 'admin') {
      return errorResponse("Only admins can access this endpoint", 403);
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignment_id');
    const teacherId = searchParams.get('teacher_id');
    const batch = searchParams.get('batch');

    if (!assignmentId && (!teacherId || !batch)) {
      return errorResponse("Either assignment_id or (teacher_id + batch) is required", 400);
    }

    if (assignmentId) {
      // Remove specific assignment
      const { error } = await supabase
        .from('teacher_student_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      return successResponse({ removed: 1 });
    } else {
      // Remove all assignments for teacher in batch
      const { data, error } = await supabase
        .from('teacher_student_assignments')
        .delete()
        .eq('teacher_id', teacherId!)
        .eq('batch', batch!)
        .select('id');

      if (error) throw error;

      return successResponse({ removed: data?.length || 0 });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

