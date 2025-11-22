import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    const { id } = await params;
    const pyqId = id;

    // Get PYQ details
    const { data: pyq, error } = await supabase
      .from("pyqs")
      .select("*")
      .eq("id", pyqId)
      .single();

    if (error || !pyq) {
      return errorResponse("PYQ not found", 404);
    }

    // Get similar questions (same topic, different year)
    const { data: similar } = await supabase
      .from("pyqs")
      .select("id, year, question_number, question_text")
      .eq("exam_type", pyq.exam_type)
      .eq("topic", pyq.topic)
      .neq("id", pyqId)
      .limit(5);

    return successResponse({
      ...pyq,
      similar_questions: similar || [],
    });
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/pyqs/[id]",
      method: "GET",
    });
  }
}

