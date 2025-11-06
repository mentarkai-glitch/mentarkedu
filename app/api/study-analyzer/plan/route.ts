import { NextRequest } from "next/server";
import { studyAnalyzerService } from "@/lib/services/study-analyzer";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gaps, constraints } = body;

    if (!gaps || !Array.isArray(gaps)) {
      return errorResponse("Knowledge gaps are required", 400);
    }

    const plan = await studyAnalyzerService.generateStudyPlan(gaps, constraints);

    return successResponse(plan);
  } catch (error: any) {
    console.error("Study plan generation error:", error);
    return errorResponse(error.message || "Failed to generate plan", 500);
  }
}

