import { NextRequest } from "next/server";
import { studyAnalyzerService } from "@/lib/services/study-analyzer";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mistakes, count } = body;

    if (!mistakes || !Array.isArray(mistakes)) {
      return errorResponse("Mistakes array is required", 400);
    }

    const questions = await studyAnalyzerService.generatePracticeQuestions(mistakes, count || 5);

    return successResponse({ questions });
  } catch (error: any) {
    console.error("Practice question generation error:", error);
    return errorResponse(error.message || "Failed to generate questions", 500);
  }
}

