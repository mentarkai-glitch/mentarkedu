import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSmartSuggestions } from "@/lib/services/ark-suggestion-service";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

/**
 * GET /api/ark-suggestions
 * Get AI-powered suggestions for ARK creation
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category_id");
    const suggestionType = searchParams.get("suggestion_type"); // 'commonGoals', 'timeframes', 'focusAreas', etc.
    const userInput = searchParams.get("user_input") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!categoryId || !suggestionType) {
      return errorResponse("category_id and suggestion_type are required", 400);
    }

    // Get onboarding profile for context
    let onboardingProfile = null;
    try {
      const profileResponse = await fetch(
        `${request.nextUrl.origin}/api/students/profile`,
        {
          headers: {
            Cookie: request.headers.get("Cookie") || "",
          },
        }
      );
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.success && profileData.data?.onboarding_profile) {
          onboardingProfile = profileData.data.onboarding_profile;
        }
      }
    } catch (error) {
      // Continue without profile if fetch fails
      console.warn("Failed to fetch onboarding profile for suggestions:", error);
    }

    // Get suggestions with AI ranking
    const suggestions = await getSmartSuggestions(
      categoryId,
      suggestionType,
      {
        userInput,
        onboardingProfile,
        userId: user.id,
        limit,
      }
    );

    return successResponse({
      suggestions,
      category_id: categoryId,
      suggestion_type: suggestionType,
      ai_powered: true,
    });
  } catch (error) {
    return handleApiError(error);
  }
}


