import { NextRequest } from "next/server";
import { JobMatcherAgent } from "@/lib/services/learning-agents/job-matcher-agent";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ark_id, student_id, milestone_id, location } = body;

    if (!ark_id || !student_id) {
      return errorResponse("ark_id and student_id are required", 400);
    }

    const agent = new JobMatcherAgent();
    
    const result = await agent.execute({
      arkId: ark_id,
      studentId: student_id,
      milestoneId: milestone_id,
      metadata: {
        location: location || "India",
      },
    });

    if (!result.success) {
      return errorResponse(result.error || "Job matching failed", 500);
    }

    return successResponse({
      success: true,
      actions: result.actions,
      data: result.data,
      metadata: result.metadata,
    });
  } catch (error: any) {
    console.error("Job Matcher API error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}


