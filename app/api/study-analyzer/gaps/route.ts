import { NextRequest } from "next/server";
import { studyAnalyzerService } from "@/lib/services/study-analyzer";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { materials } = body;

    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return errorResponse("Study materials are required", 400);
    }

    // Get student context
    let studentContext = null;
    if (user?.id) {
      const { data: student } = await supabase
        .from("students")
        .select("grade, interests, goals, onboarding_profile")
        .eq("user_id", user.id)
        .single();

      studentContext = student ? { userId: user.id, ...student } : null;
    }

    const result = await studyAnalyzerService.analyzeGaps(materials, studentContext);

    return successResponse(result);
  } catch (error: any) {
    console.error("Study gap analysis error:", error);
    return errorResponse(error.message || "Failed to analyze gaps", 500);
  }
}

