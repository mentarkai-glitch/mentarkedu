import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import type { AIContext } from "@/lib/types";

/**
 * POST /api/ark-suggestions/psychology
 * Get AI-powered psychology profile recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { goal, motivation, stress, confidence, onboardingProfile } = body;

    if (!goal) {
      return errorResponse("Goal is required", 400);
    }

    // Build context for AI
    const contextParts: string[] = [];
    contextParts.push(`Goal: "${goal}"`);

    if (onboardingProfile) {
      if (onboardingProfile.motivation_level) {
        contextParts.push(`Historical Motivation: ${onboardingProfile.motivation_level}/10`);
      }
      if (onboardingProfile.stress_level) {
        contextParts.push(`Historical Stress: ${onboardingProfile.stress_level}/10`);
      }
      if (onboardingProfile.confidence_level) {
        contextParts.push(`Historical Confidence: ${onboardingProfile.confidence_level}/10`);
      }
    }

    contextParts.push(`Current Motivation: ${motivation}/10`);
    contextParts.push(`Current Stress: ${stress}/10`);
    contextParts.push(`Current Confidence: ${confidence}/10`);

    const prompt = `As an educational psychology expert, analyze the student's current psychology profile in relation to their goal "${goal}". 

Current Profile:
- Motivation: ${motivation}/10
- Stress: ${stress}/10
- Confidence: ${confidence}/10

${contextParts.slice(1).join("\n")}

Provide recommendations for optimal motivation, stress, and confidence levels for this goal. Return a JSON object with:
- motivation: recommended value (0-10)
- stress: recommended value (0-10)
- confidence: recommended value (0-10)
- reason: brief explanation (1-2 sentences)

Format: {"motivation": number, "stress": number, "confidence": number, "reason": "string"}`;

    const aiContext: AIContext = {
      task: "mentor_chat",
      user_id: user.id,
      metadata: {
        goal,
        current_motivation: motivation,
        current_stress: stress,
        current_confidence: confidence,
      },
    };

    const response = await aiOrchestrator(aiContext, prompt);

    if (!response || !response.content) {
      return errorResponse("Failed to get AI recommendation", 500);
    }

    // Parse JSON response
    let recommendation;
    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendation = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: extract values from text
        const motivationMatch = response.content.match(/motivation[:\s]+(\d+)/i);
        const stressMatch = response.content.match(/stress[:\s]+(\d+)/i);
        const confidenceMatch = response.content.match(/confidence[:\s]+(\d+)/i);
        const reasonMatch = response.content.match(/reason[:\s]+"([^"]+)"/i);

        recommendation = {
          motivation: motivationMatch ? parseInt(motivationMatch[1]) : motivation,
          stress: stressMatch ? parseInt(stressMatch[1]) : stress,
          confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : confidence,
          reason: reasonMatch ? reasonMatch[1] : "AI-recommended values based on your goal",
        };
      }
    } catch (parseError) {
      // If parsing fails, return current values with a generic reason
      recommendation = {
        motivation,
        stress,
        confidence,
        reason: "Using current values. AI analysis unavailable.",
      };
    }

    return successResponse({
      recommendation,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

