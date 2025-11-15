import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

// POST: Join a team project
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

    // Check if team exists
    const { data: team, error: teamError } = await supabase
      .from("team_projects")
      .select("status")
      .eq("id", teamId)
      .single();

    if (teamError || !team) {
      return errorResponse("Team project not found", 404);
    }

    if (team.status !== "active") {
      return errorResponse("This team project is not active", 400);
    }

    // Check if user is already a member
    const { data: existingMember, error: existingError } = await supabase
      .from("team_project_members")
      .select("id")
      .eq("team_project_id", teamId)
      .eq("student_id", user.id)
      .single();

    if (existingMember) {
      return errorResponse("You are already a member of this team project", 400);
    }

    // Add user as member (collaborator role)
    const { data: newMember, error: joinError } = await supabase
      .from("team_project_members")
      .insert({
        team_project_id: teamId,
        student_id: user.id,
        role: "collaborator"
      })
      .select()
      .single();

    if (joinError) throw joinError;

    return successResponse({ member: newMember });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE: Leave a team project
export async function DELETE(
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

    // Check if user is a member
    const { data: userMember, error: userMemberError } = await supabase
      .from("team_project_members")
      .select("role")
      .eq("team_project_id", teamId)
      .eq("student_id", user.id)
      .single();

    if (userMemberError || !userMember) {
      return errorResponse("You are not a member of this team project", 403);
    }

    // Owner cannot leave - must transfer ownership or delete project
    if (userMember.role === "owner") {
      // Check if there are other members
      const { count: memberCount, error: countError } = await supabase
        .from("team_project_members")
        .select("*", { count: "exact", head: true })
        .eq("team_project_id", teamId);

      if (countError) throw countError;

      if (memberCount && memberCount > 1) {
        return errorResponse("Cannot leave as owner. Transfer ownership first or delete the project", 400);
      }
    }

    // Remove user from team
    const { error: leaveError } = await supabase
      .from("team_project_members")
      .delete()
      .eq("team_project_id", teamId)
      .eq("student_id", user.id);

    if (leaveError) throw leaveError;

    // If owner left and was the only member, archive the project
    if (userMember.role === "owner") {
      await supabase
        .from("team_projects")
        .update({ status: "archived" })
        .eq("id", teamId);
    }

    return successResponse({ message: "Left team project successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

