import { NextRequest } from "next/server";
import { FormFillerAgent } from "@/lib/services/learning-agents/form-filler-agent";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, college_id, course_id, form_template_id } = body;

    if (!student_id || !college_id || !course_id) {
      return errorResponse("student_id, college_id, and course_id are required", 400);
    }

    const agent = new FormFillerAgent();

    const result = await agent.execute({
      arkId: "form_filler",
      studentId: student_id,
      metadata: {
        college_id,
        course_id,
        form_template_id,
      },
    });

    if (!result.success) {
      return errorResponse(result.error || "Form filling failed", 500);
    }

    return successResponse({
      success: true,
      form_data: result.data?.form_data,
      career_guidance: result.data?.career_guidance,
      documents: result.data?.documents,
      ai_recommendations: result.data?.ai_recommendations,
      course: result.data?.course,
      college: result.data?.college,
      actions: result.actions,
    });
  } catch (error: any) {
    console.error("Form Filler API error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}


