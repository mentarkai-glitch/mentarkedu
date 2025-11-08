import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  successResponse,
  errorResponse,
  handleApiError,
} from "@/lib/utils/api-helpers";
import type {
  DailyAgendaItem,
  DailyTaskDependency,
  AgendaStatus,
} from "@/lib/types";

type UpsertAgendaPayload = {
  item: Partial<DailyAgendaItem> & { title: string };
  dependencies?: Array<{
    depends_on_item_id: string;
    dependency_type?: "blocking" | "supporting";
  }>;
};

async function requireStudentId(supabase: any): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: student } = await supabase
    .from("students")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  return student?.user_id ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const status = searchParams.get("status") as AgendaStatus | null;

    let query = supabase
      .from("daily_agenda_items")
      .select("*")
      .eq("student_id", studentId)
      .order("start_at", { ascending: true });

    if (start) {
      query = query.gte("start_at", start);
    }

    if (end) {
      query = query.lte("end_at", end);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: items, error } = await query;

    if (error) throw error;

    let dependencies: DailyTaskDependency[] = [];
    if (items && items.length > 0) {
      const agendaIds = items.map((item: DailyAgendaItem) => item.id);
      const { data: deps, error: depsError } = await supabase
        .from("daily_task_dependencies")
        .select("*")
        .in("agenda_item_id", agendaIds);

      if (depsError) throw depsError;
      dependencies = (deps as DailyTaskDependency[]) || [];
    }

    return successResponse({
      items: (items as DailyAgendaItem[]) || [],
      dependencies,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const body = (await request.json()) as UpsertAgendaPayload;

    if (!body?.item?.title) {
      return errorResponse("Agenda item title is required", 400);
    }

    const now = new Date().toISOString();

    const payload: Record<string, any> = {
      student_id: studentId,
      title: body.item.title,
      description: body.item.description || null,
      category: body.item.category || null,
      start_at: body.item.start_at || null,
      end_at: body.item.end_at || null,
      energy_target: body.item.energy_target || null,
      priority: body.item.priority ?? 0,
      status: body.item.status || "planned",
      source: body.item.source || "manual",
      updated_at: now,
    };

    if (body.item.id) {
      payload.id = body.item.id;
    }

    const { data: upserted, error } = await supabase
      .from("daily_agenda_items")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;

    const agendaId = upserted.id;

    if (Array.isArray(body.dependencies)) {
      await supabase
        .from("daily_task_dependencies")
        .delete()
        .eq("agenda_item_id", agendaId);

      if (body.dependencies.length > 0) {
        const dependencyRows = body.dependencies.map((dep) => ({
          agenda_item_id: agendaId,
          depends_on_item_id: dep.depends_on_item_id,
          dependency_type: dep.dependency_type || "blocking",
        }));

        const { error: insertError } = await supabase
          .from("daily_task_dependencies")
          .insert(dependencyRows);

        if (insertError) throw insertError;
      }
    }

    return successResponse({
      item: upserted as DailyAgendaItem,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const studentId = await requireStudentId(supabase);

    if (!studentId) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Agenda item id is required", 400);
    }

    const { error } = await supabase
      .from("daily_agenda_items")
      .delete()
      .eq("id", id)
      .eq("student_id", studentId);

    if (error) throw error;

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}


