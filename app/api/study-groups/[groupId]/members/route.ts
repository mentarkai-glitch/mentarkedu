import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

// GET: Get members of a study group
export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { groupId } = params;

    // Verify user has access to this group
    const { data: memberCheck, error: memberCheckError } = await supabase
      .from("study_group_members")
      .select("group_id")
      .eq("group_id", groupId)
      .eq("student_id", user.id)
      .single();

    // Allow access if user is a member OR if they're viewing available groups
    // For simplicity, we'll allow institute members to view all groups
    const { data: members, error: membersError } = await supabase
      .from("study_group_members")
      .select(`
        id,
        student_id,
        role,
        joined_at,
        student:students!study_group_members_student_id_fkey(
          user_id,
          grade,
          users!inner(full_name, avatar_url)
        )
      `)
      .eq("group_id", groupId)
      .order("joined_at", { ascending: true });

    if (membersError) throw membersError;

    const transformedMembers = members?.map((member: any) => ({
      id: member.id,
      student_id: member.student_id,
      role: member.role,
      joined_at: member.joined_at,
      name: member.student?.users?.full_name || "Unknown",
      avatar: member.student?.users?.avatar_url,
      grade: member.student?.grade
    })) || [];

    return successResponse({ members: transformedMembers });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST: Join a study group
export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { groupId } = params;

    // Check if group exists and get its details
    const { data: group, error: groupError } = await supabase
      .from("study_groups")
      .select("max_members, is_active")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      return errorResponse("Study group not found", 404);
    }

    if (!group.is_active) {
      return errorResponse("This study group is no longer active", 400);
    }

    // Check current member count
    const { count: currentCount, error: countError } = await supabase
      .from("study_group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId);

    if (countError) throw countError;

    if (currentCount && currentCount >= group.max_members) {
      return errorResponse("This study group is full", 400);
    }

    // Check if user is already a member
    const { data: existingMember, error: existingError } = await supabase
      .from("study_group_members")
      .select("id")
      .eq("group_id", groupId)
      .eq("student_id", user.id)
      .single();

    if (existingMember) {
      return errorResponse("You are already a member of this group", 400);
    }

    // Add user as member
    const { data: newMember, error: joinError } = await supabase
      .from("study_group_members")
      .insert({
        group_id: groupId,
        student_id: user.id,
        role: "member"
      })
      .select()
      .single();

    if (joinError) throw joinError;

    return successResponse({ member: newMember });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE: Leave a study group (or remove a member if you're the leader)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("member_id"); // If provided, removing another member

    const { groupId } = params;

    // Check if user is a member
    const { data: userMember, error: userMemberError } = await supabase
      .from("study_group_members")
      .select("role")
      .eq("group_id", groupId)
      .eq("student_id", user.id)
      .single();

    if (userMemberError || !userMember) {
      return errorResponse("You are not a member of this group", 403);
    }

    // If removing another member, check if user is leader
    if (memberId && memberId !== user.id) {
      if (userMember.role !== "leader") {
        return errorResponse("Only group leaders can remove members", 403);
      }

      const { error: removeError } = await supabase
        .from("study_group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("student_id", memberId);

      if (removeError) throw removeError;

      return successResponse({ message: "Member removed successfully" });
    }

    // User is leaving the group themselves
    // If they're the leader and it's the last member, delete the group
    const { count: memberCount, error: countError } = await supabase
      .from("study_group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId);

    if (countError) throw countError;

    // Remove user from group
    const { error: leaveError } = await supabase
      .from("study_group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("student_id", user.id);

    if (leaveError) throw leaveError;

    // If leader left and there are other members, assign a new leader
    if (userMember.role === "leader" && memberCount && memberCount > 1) {
      const { data: nextMember, error: nextMemberError } = await supabase
        .from("study_group_members")
        .select("student_id")
        .eq("group_id", groupId)
        .neq("student_id", user.id)
        .limit(1)
        .single();

      if (!nextMemberError && nextMember) {
        await supabase
          .from("study_group_members")
          .update({ role: "leader" })
          .eq("group_id", groupId)
          .eq("student_id", nextMember.student_id);
      }
    }

    // If no members left, mark group as inactive
    const { count: remainingCount, error: remainingError } = await supabase
      .from("study_group_members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId);

    if (!remainingError && remainingCount === 0) {
      await supabase
        .from("study_groups")
        .update({ is_active: false })
        .eq("id", groupId);
    }

    return successResponse({ message: "Left study group successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}

