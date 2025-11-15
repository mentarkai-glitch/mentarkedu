import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

/**
 * POST /api/teachers/[teacherId]/assign-batch
 * Assign a batch to a teacher
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify admin
    const { data: admin } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!admin) {
      return errorResponse("Admin access required", 403);
    }

    const { teacherId } = await params;
    const body = await request.json();
    const { batch } = body;

    if (!batch || typeof batch !== 'string') {
      return errorResponse("Batch name is required", 400);
    }

    // Get current assigned batches
    const { data: teacher, error: teacherError } = await supabase
      .from("teachers")
      .select("assigned_batches")
      .eq("user_id", teacherId)
      .single();

    if (teacherError || !teacher) {
      return errorResponse("Teacher not found", 404);
    }

    // Add batch if not already assigned
    const currentBatches = teacher.assigned_batches || [];
    if (currentBatches.includes(batch)) {
      return errorResponse("Batch already assigned to this teacher", 400);
    }

    const updatedBatches = [...currentBatches, batch];

    // Update teacher's assigned batches
    const { error: updateError } = await supabase
      .from("teachers")
      .update({ assigned_batches: updatedBatches })
      .eq("user_id", teacherId);

    if (updateError) throw updateError;

    return successResponse({
      message: `Batch "${batch}" assigned successfully`,
      assigned_batches: updatedBatches,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/teachers/[teacherId]/assign-batch
 * Remove a batch assignment from a teacher
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify admin
    const { data: admin } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!admin) {
      return errorResponse("Admin access required", 403);
    }

    const { teacherId } = await params;
    const { searchParams } = new URL(request.url);
    const batch = searchParams.get("batch");

    if (!batch) {
      return errorResponse("Batch name is required", 400);
    }

    // Get current assigned batches
    const { data: teacher, error: teacherError } = await supabase
      .from("teachers")
      .select("assigned_batches")
      .eq("user_id", teacherId)
      .single();

    if (teacherError || !teacher) {
      return errorResponse("Teacher not found", 404);
    }

    // Remove batch
    const currentBatches = teacher.assigned_batches || [];
    const updatedBatches = currentBatches.filter((b: string) => b !== batch);

    // Update teacher's assigned batches
    const { error: updateError } = await supabase
      .from("teachers")
      .update({ assigned_batches: updatedBatches })
      .eq("user_id", teacherId);

    if (updateError) throw updateError;

    return successResponse({
      message: `Batch "${batch}" removed successfully`,
      assigned_batches: updatedBatches,
    });
  } catch (error) {
    return handleApiError(error);
  }
}


