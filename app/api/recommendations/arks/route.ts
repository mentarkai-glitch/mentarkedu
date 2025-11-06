import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { getARKRecommendations } from "@/lib/services/ark-recommendations";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') as 'general' | 'career') || 'general';
    const careerPath = searchParams.get('career') || undefined;

    // Get recommendations
    const recommendations = await getARKRecommendations(user.id, type, careerPath);
    
    return successResponse({ recommendations });
  } catch (error) {
    return handleApiError(error);
  }
}

