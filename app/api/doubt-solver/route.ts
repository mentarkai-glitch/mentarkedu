import { NextRequest } from "next/server";
import { doubtSolverService } from "@/lib/services/doubt-solver";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import { createClient } from "@/lib/supabase/server";

/**
 * Doubt Solver Endpoint
 * POST /api/doubt-solver
 * 
 * Hybrid GPT + Wolfram Alpha for verified academic answers
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { question, subject, difficulty } = body;

    if (!question || typeof question !== "string") {
      return errorResponse("Question is required", 400);
    }

    const solution = await doubtSolverService.solve({
      question,
      userId: user?.id,
      subject,
      difficulty,
    });

    return successResponse(solution);
  } catch (error: any) {
    console.error("Doubt solver error:", error);
    return errorResponse(error.message || "Failed to solve doubt", 500);
  }
}

