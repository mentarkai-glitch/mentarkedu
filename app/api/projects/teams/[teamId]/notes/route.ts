import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

// GET: Get notes for a team project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { teamId } = await params;

    // Verify user has access to this team
    const { data: memberCheck, error: memberCheckError } = await supabase
      .from("team_project_members")
      .select("team_project_id")
      .eq("team_project_id", teamId)
      .eq("student_id", user.id)
      .single();

    if (memberCheckError) {
      return errorResponse("You don't have access to this team project", 403);
    }

    // Get notes
    const { data: notes, error: notesError } = await supabase
      .from("project_notes")
      .select(`
        *,
        student:students!project_notes_student_id_fkey(
          user_id,
          users!inner(full_name, avatar_url)
        )
      `)
      .eq("team_project_id", teamId)
      .order("created_at", { ascending: false });

    if (notesError) throw notesError;

    const transformedNotes = notes?.map((note: any) => ({
      id: note.id,
      team_project_id: note.team_project_id,
      student_id: note.student_id,
      content: note.content,
      note_type: note.note_type,
      created_at: note.created_at,
      updated_at: note.updated_at,
      author_name: note.student?.users?.full_name || "Unknown",
      author_avatar: note.student?.users?.avatar_url
    })) || [];

    return successResponse({ notes: transformedNotes });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Add a note to a team project
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { teamId } = await params;
    const body = await request.json();
    const { content, note_type = "comment" } = body;

    if (!content || !content.trim()) {
      return errorResponse("Content is required", 400);
    }

    // Verify user is a member
    const { data: memberCheck, error: memberCheckError } = await supabase
      .from("team_project_members")
      .select("team_project_id")
      .eq("team_project_id", teamId)
      .eq("student_id", user.id)
      .single();

    if (memberCheckError) {
      return errorResponse("You must be a member to add notes", 403);
    }

    // Add note
    const { data: newNote, error: noteError } = await supabase
      .from("project_notes")
      .insert({
        team_project_id: teamId,
        student_id: user.id,
        content: content.trim(),
        note_type: note_type
      })
      .select()
      .single();

    if (noteError) throw noteError;

    return successResponse({ note: newNote });
  } catch (error) {
    return handleApiError(error);
  }
}

