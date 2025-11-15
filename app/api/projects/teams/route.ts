import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

// GET: List team projects (user's teams or all from institute)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "my_teams"; // "my_teams" | "available" | "all"

    // Get user's institute_id
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("institute_id")
      .eq("id", user.id)
      .single();

    if (userDataError || !userData?.institute_id) {
      return errorResponse("Failed to get user institute", 400);
    }

    let query = supabase
      .from("team_projects")
      .select(`
        *,
        created_by_user:users!team_projects_created_by_fkey(full_name, avatar_url),
        members:team_project_members(
          id,
          student_id,
          role,
          joined_at,
          student:students!team_project_members_student_id_fkey(
            user_id,
            grade,
            users!inner(full_name, avatar_url)
          )
        )
      `)
      .eq("institute_id", userData.institute_id)
      .eq("status", "active");

    if (filter === "my_teams") {
      // Get teams where user is a member
      const { data: myTeams, error: myTeamsError } = await supabase
        .from("team_project_members")
        .select("team_project_id")
        .eq("student_id", user.id);

      if (myTeamsError) throw myTeamsError;

      const teamIds = myTeams?.map(t => t.team_project_id) || [];
      if (teamIds.length === 0) {
        return successResponse({ teams: [] });
      }

      query = query.in("id", teamIds);
    }

    const { data: teams, error: teamsError } = await query.order("created_at", { ascending: false });

    if (teamsError) throw teamsError;

    // Transform data
    const transformedTeams = teams?.map(team => ({
      id: team.id,
      name: team.name,
      description: team.description,
      subject_id: team.subject_id,
      project_type: team.project_type,
      institute_id: team.institute_id,
      batch_id: team.batch_id,
      created_by: team.created_by,
      created_by_name: team.created_by_user?.full_name || "Unknown",
      created_by_avatar: team.created_by_user?.avatar_url,
      status: team.status,
      deadline: team.deadline,
      created_at: team.created_at,
      updated_at: team.updated_at,
      member_count: team.members?.length || 0,
      members: team.members?.map((member: any) => ({
        id: member.id,
        student_id: member.student_id,
        role: member.role,
        joined_at: member.joined_at,
        name: member.student?.users?.full_name || "Unknown",
        avatar: member.student?.users?.avatar_url,
        grade: member.student?.grade
      })) || []
    })) || [];

    return successResponse({ teams: transformedTeams });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Create a new team project
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { name, description, subject_id, project_type, batch_id, deadline } = body;

    if (!name || !batch_id) {
      return errorResponse("Name and batch_id are required", 400);
    }

    // Get user's institute_id and batch
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("institute_id")
      .eq("id", user.id)
      .single();

    if (userDataError || !userData?.institute_id) {
      return errorResponse("Failed to get user institute", 400);
    }

    // Get student's batch if not provided
    let finalBatchId = batch_id;
    if (!finalBatchId) {
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("batch")
        .eq("user_id", user.id)
        .single();

      if (!studentError && student?.batch) {
        finalBatchId = student.batch;
      }
    }

    // Create team project
    const { data: newTeam, error: teamError } = await supabase
      .from("team_projects")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        subject_id: subject_id || null,
        project_type: project_type || null,
        institute_id: userData.institute_id,
        batch_id: finalBatchId.trim(),
        created_by: user.id,
        deadline: deadline || null,
        status: "active"
      })
      .select()
      .single();

    if (teamError) throw teamError;

    // Add creator as owner
    const { error: memberError } = await supabase
      .from("team_project_members")
      .insert({
        team_project_id: newTeam.id,
        student_id: user.id,
        role: "owner"
      });

    if (memberError) throw memberError;

    return successResponse({ team: newTeam });
  } catch (error) {
    return handleApiError(error);
  }
}

