import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

/**
 * GET /api/arks/[arkId]/notes
 * Get notes for an ARK
 */
export async function GET(
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

    // Get notes (stored in ark_timeline or we can create a separate table)
    // For now, using metadata field in arks table
    const { data: arkData } = await supabase
      .from("arks")
      .select("metadata")
      .eq("id", arkId)
      .single();

    const notes = (arkData?.metadata as any)?.notes || [];

    return successResponse({ notes });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/arks/[arkId]/notes
 * Add a note to an ARK
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
    const { content, milestone_id } = body;

    if (!content || typeof content !== 'string') {
      return errorResponse("Note content is required", 400);
    }

    // Verify ARK belongs to user
    const { data: ark, error: arkError } = await supabase
      .from("arks")
      .select("student_id, metadata")
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

    // Add note to metadata
    const metadata = (ark.metadata as any) || {};
    const notes = metadata.notes || [];
    
    const newNote = {
      id: crypto.randomUUID(),
      content,
      milestone_id: milestone_id || null,
      created_at: new Date().toISOString(),
      created_by: user.id,
    };

    notes.push(newNote);
    metadata.notes = notes;

    // Update ARK metadata
    const { error: updateError } = await supabase
      .from("arks")
      .update({ metadata, updated_at: new Date().toISOString() })
      .eq("id", arkId);

    if (updateError) throw updateError;

    return successResponse({ note: newNote, message: "Note added successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

