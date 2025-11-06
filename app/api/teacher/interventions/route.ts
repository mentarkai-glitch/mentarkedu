import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: interventions, error } = await supabase
      .from("interventions")
      .select(`
        *,
        students!inner (
          users (
            id,
            profile_data
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return errorResponse(error.message, 500);
    }

    const transformedInterventions = interventions?.map((iv) => ({
      id: iv.id,
      student_id: iv.student_id,
      type: iv.type,
      title: iv.title,
      content: iv.content,
      priority: iv.priority,
      status: iv.status,
      created_at: iv.created_at,
      students: {
        users: (() => {
          // Handle users as array (TypeScript inference issue with Supabase joins)
          const studentUsers = Array.isArray(iv.students?.users) ? iv.students.users[0] : iv.students?.users;
          const firstName = studentUsers?.profile_data?.first_name || "";
          const lastName = studentUsers?.profile_data?.last_name || "";
          return {
            full_name: `${firstName} ${lastName}`.trim(),
            avatar_url: studentUsers?.profile_data?.avatar_url || null,
          };
        })(),
      },
    }));

    return successResponse({
      interventions: transformedInterventions || [],
      total: transformedInterventions?.length || 0,
    });
  } catch (error: any) {
    console.error("Interventions fetch error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { student_id, type, title, content, priority, due_date } = body;

    if (!student_id || !title || !content) {
      return errorResponse("student_id, title, and content are required", 400);
    }

    const intervention = {
      student_id,
      type: type || "note",
      title,
      content,
      priority: priority || "medium",
      status: "pending",
      due_date: due_date || null,
    };

    const { data, error } = await supabase
      .from("interventions")
      .insert(intervention)
      .select()
      .single();

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse(data);
  } catch (error: any) {
    console.error("Intervention creation error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}
