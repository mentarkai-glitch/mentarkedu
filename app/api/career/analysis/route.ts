import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { analyzeCareerAlignment, calculateConfidenceScore } from "@/lib/services/career-integration";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const careerPath = searchParams.get('career') || undefined;
    const type = searchParams.get('type');

    // Handle confidence analysis request
    if (type === 'confidence') {
      const confidence = await calculateConfidenceScore(user.id);
      return successResponse({ confidence });
    }

    // Handle career alignment analysis
    const alignment = await analyzeCareerAlignment(user.id, careerPath);
    return successResponse({ alignment });
  } catch (error) {
    return handleApiError(error);
  }
}

