import { NextRequest } from "next/server";
import { CutoffPredictorAgent } from "@/lib/services/learning-agents/cutoff-predictor-agent";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { college_ids, course_ids, target_year } = body;

    const targetYear = target_year || new Date().getFullYear() + 1;

    const agent = new CutoffPredictorAgent();

    const result = await agent.execute({
      arkId: "cutoff_prediction",
      studentId: "system",
      metadata: {
        college_ids,
        course_ids,
        target_year: targetYear,
      },
    });

    if (!result.success) {
      return errorResponse(result.error || "Cutoff prediction failed", 500);
    }

    return successResponse({
      success: true,
      predictions: result.data?.predictions,
      total: result.data?.total,
      avg_confidence: result.data?.avg_confidence,
      target_year: targetYear,
      actions: result.actions,
    });
  } catch (error: any) {
    console.error("Cutoff Predictor API error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}


