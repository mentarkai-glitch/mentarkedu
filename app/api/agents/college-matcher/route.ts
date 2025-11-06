import { NextRequest } from "next/server";
import { CollegeMatcherAgent } from "@/lib/services/learning-agents/college-matcher-agent";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, location, preferences } = body;

    if (!student_id) {
      return errorResponse("student_id is required", 400);
    }

    const agent = new CollegeMatcherAgent();

    const result = await agent.execute({
      arkId: "college_search",
      studentId: student_id,
      metadata: {
        location: location || "India",
        preferences,
      },
    });

    if (!result.success) {
      return errorResponse(result.error || "College matching failed", 500);
    }

    return successResponse({
      success: true,
      recommendations: result.data?.recommendations,
      categories: result.data?.categories,
      total_matched: result.data?.total_matched,
      actions: result.actions,
    });
  } catch (error: any) {
    console.error("College Matcher API error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}


