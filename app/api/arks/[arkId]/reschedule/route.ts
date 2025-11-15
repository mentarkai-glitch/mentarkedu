import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

/**
 * POST /api/arks/[arkId]/reschedule
 * Reschedule an ARK or milestone
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ arkId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { arkId } = await params;
    const body = await request.json();
    const { target_completion_date, milestone_id, milestone_target_date } = body;

    // Verify ARK belongs to user
    const { data: ark, error: arkError } = await supabase
      .from("arks")
      .select("student_id")
      .eq("id", arkId)
      .single();

    if (arkError || !ark) {
      return errorResponse("ARK not found", 404);
    }

    // Get student_id for the user
    const { data: student } = await supabase
      .from("students")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!student || ark.student_id !== student.user_id) {
      return errorResponse("Unauthorized", 403);
    }

    // If rescheduling a specific milestone
    if (milestone_id && milestone_target_date) {
      const { error: milestoneError } = await supabase
        .from("ark_milestones")
        .update({ 
          target_date: milestone_target_date,
          updated_at: new Date().toISOString()
        })
        .eq("id", milestone_id)
        .eq("ark_id", arkId);

      if (milestoneError) throw milestoneError;

      return successResponse({ 
        message: "Milestone rescheduled successfully",
        milestone_id,
        target_date: milestone_target_date
      });
    }

    // If rescheduling the entire ARK
    if (target_completion_date) {
      const { error: updateError } = await supabase
        .from("arks")
        .update({ 
          target_completion_date,
          updated_at: new Date().toISOString()
        })
        .eq("id", arkId);

      if (updateError) throw updateError;

      return successResponse({ 
        message: "ARK rescheduled successfully",
        target_completion_date
      });
    }

    return errorResponse("Either target_completion_date or milestone_id with milestone_target_date is required", 400);
  } catch (error) {
    return handleApiError(error);
  }
}


