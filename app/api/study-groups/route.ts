import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

// GET: List study groups (user's groups or all from institute)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "my_groups"; // "my_groups" | "available" | "all"

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
      .from("study_groups")
      .select(`
        *,
        created_by_user:users!study_groups_created_by_fkey(full_name, avatar_url),
        members:study_group_members(
          id,
          student_id,
          role,
          joined_at,
          student:students!study_group_members_student_id_fkey(
            user_id,
            grade,
            users!inner(full_name, avatar_url)
          )
        )
      `)
      .eq("institute_id", userData.institute_id)
      .eq("is_active", true);

    if (filter === "my_groups") {
      // Get groups where user is a member
      const { data: myGroups, error: myGroupsError } = await supabase
        .from("study_group_members")
        .select("group_id")
        .eq("student_id", user.id);

      if (myGroupsError) throw myGroupsError;

      const groupIds = myGroups?.map(g => g.group_id) || [];
      if (groupIds.length === 0) {
        return successResponse({ groups: [] });
      }

      query = query.in("id", groupIds);
    }

    const { data: groups, error: groupsError } = await query.order("created_at", { ascending: false });

    if (groupsError) throw groupsError;

    // Transform data for easier consumption
    const transformedGroups = groups?.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      institute_id: group.institute_id,
      batch_id: group.batch_id,
      created_by: group.created_by,
      created_by_name: group.created_by_user?.full_name || "Unknown",
      created_by_avatar: group.created_by_user?.avatar_url,
      max_members: group.max_members,
      is_active: group.is_active,
      created_at: group.created_at,
      member_count: group.members?.length || 0,
      members: group.members?.map((member: any) => ({
        id: member.id,
        student_id: member.student_id,
        role: member.role,
        joined_at: member.joined_at,
        name: member.student?.users?.full_name || "Unknown",
        avatar: member.student?.users?.avatar_url,
        grade: member.student?.grade
      })) || []
    })) || [];

    return successResponse({ groups: transformedGroups });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Create a new study group
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { name, description, batch_id, max_members = 4 } = body;

    if (!name || !batch_id) {
      return errorResponse("Name and batch_id are required", 400);
    }

    // Get user's institute_id
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("institute_id")
      .eq("id", user.id)
      .single();

    if (userDataError || !userData?.institute_id) {
      return errorResponse("Failed to get user institute", 400);
    }

    // Create study group
    const { data: newGroup, error: groupError } = await supabase
      .from("study_groups")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        institute_id: userData.institute_id,
        batch_id: batch_id.trim(),
        created_by: user.id,
        max_members: Math.min(Math.max(max_members, 2), 10) // Between 2 and 10
      })
      .select()
      .single();

    if (groupError) throw groupError;

    // Add creator as leader
    const { error: memberError } = await supabase
      .from("study_group_members")
      .insert({
        group_id: newGroup.id,
        student_id: user.id,
        role: "leader"
      });

    if (memberError) throw memberError;

    return successResponse({ group: newGroup });
  } catch (error) {
    return handleApiError(error);
  }
}

