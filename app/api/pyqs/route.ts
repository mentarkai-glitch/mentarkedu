import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get("exam_type");
    const year = searchParams.get("year");
    const subject = searchParams.get("subject");
    const topic = searchParams.get("topic");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query
    let query = supabase
      .from("pyqs")
      .select("*", { count: "exact" })
      .order("year", { ascending: false })
      .order("question_number", { ascending: true })
      .range(offset, offset + limit - 1);

    if (examType) {
      query = query.eq("exam_type", examType);
    }

    if (year) {
      query = query.eq("year", parseInt(year));
    }

    if (subject) {
      query = query.eq("subject", subject);
    }

    if (topic) {
      query = query.ilike("topic", `%${topic}%`);
    }

    const { data: pyqs, error, count } = await query;

    if (error) throw error;

    return successResponse({
      pyqs: pyqs || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/pyqs",
      method: "GET",
    });
  }
}

