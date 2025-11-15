import { NextRequest } from "next/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import type { AIContext } from "@/lib/types";

/**
 * POST /api/ark-suggestions/timeframe
 * Get AI-powered timeframe recommendation for ARK creation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goal, categoryId, timeframes, onboardingProfile, deepDiveAnswers } = body;

    if (!goal || !categoryId || !timeframes || !Array.isArray(timeframes)) {
      return errorResponse("goal, categoryId, and timeframes array are required", 400);
    }

    // Build context for AI
    const contextParts: string[] = [];
    contextParts.push(`Goal: "${goal}"`);
    contextParts.push(`Category: ${categoryId}`);

    if (onboardingProfile) {
      if (onboardingProfile.academic_stage) {
        contextParts.push(`Academic Stage: ${onboardingProfile.academic_stage}`);
      }
      if (onboardingProfile.available_hours_per_week) {
        contextParts.push(`Available Hours/Week: ${onboardingProfile.available_hours_per_week}`);
      }
    }

    if (deepDiveAnswers) {
      if (deepDiveAnswers.previous_experience) {
        contextParts.push(`Previous Experience: ${deepDiveAnswers.previous_experience}`);
      }
      if (deepDiveAnswers.urgency) {
        contextParts.push(`Urgency: ${deepDiveAnswers.urgency}`);
      }
    }

    const availableTimeframes = timeframes.map((t: any) => `${t.id}: ${t.name} (${t.duration})`).join(', ');

    const prompt = `Based on the following context, recommend the most appropriate timeframe ID from the available options.

**Context:**
${contextParts.join('\n')}

**Available Timeframes:**
${availableTimeframes}

**Task:**
Analyze the goal complexity, student availability, academic stage, and any urgency factors to recommend the best timeframe ID.

Return JSON format:
{
  "recommended_timeframe_id": "medium",
  "reason": "Your goal requires moderate effort and you have 10 hours/week available, making a 3-month timeframe ideal."
}`;

    const aiContext: AIContext = {
      task: "mentor_chat",
      user_id: "ark_creation",
      session_id: "timeframe_recommendation",
      metadata: {
        system_prompt: "You are an expert at matching learning goals with appropriate timeframes based on complexity, student availability, and academic stage.",
        user_tier: "pro",
      },
    };

    const response = await aiOrchestrator(aiContext, prompt);

    if (!response.content) {
      return errorResponse("AI recommendation failed", 500);
    }

    // Parse JSON response
    let jsonContent = response.content.trim();
    const jsonMatch = jsonContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    const objMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (objMatch) {
      jsonContent = objMatch[0];
    }

    const result = JSON.parse(jsonContent);

    return successResponse({
      recommended_timeframe_id: result.recommended_timeframe_id,
      reason: result.reason || "Based on your goal and availability",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

