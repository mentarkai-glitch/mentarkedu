import { NextRequest } from "next/server";
import { visualExplainerService } from "@/lib/services/visual-explainer";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { concept, subject, level } = body;

    if (!concept || typeof concept !== "string") {
      return errorResponse("Concept is required", 400);
    }

    const explanation = await visualExplainerService.generateExplanation(
      concept,
      subject,
      level
    );

    return successResponse(explanation);
  } catch (error: any) {
    console.error("Visual explainer error:", error);
    return errorResponse(error.message || "Failed to generate explanation", 500);
  }
}

