import { NextRequest } from "next/server";
import { searchAgent } from "@/lib/services/search-agent";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import { createClient } from "@/lib/supabase/server";

/**
 * Personalized Search Endpoint
 * POST /api/search
 * 
 * Replaces traditional search with context-aware, actionable results
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user for personalization
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { query, context, filters } = body;

    if (!query || typeof query !== "string") {
      return errorResponse("Query is required", 400);
    }

    // Execute personalized search
    const result = await searchAgent.execute({
      query,
      userId: user?.id,
      context,
      filters,
    });

    return successResponse(result);
  } catch (error: any) {
    console.error("Search error:", error);
    return errorResponse(error.message || "Search failed", 500);
  }
}

/**
 * Quick search endpoint (GET for simple queries)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const context = searchParams.get("context") as any;

    if (!query) {
      return errorResponse("Query parameter 'q' is required", 400);
    }

    const result = await searchAgent.execute({
      query,
      userId: user?.id,
      context,
    });

    return successResponse(result);
  } catch (error: any) {
    console.error("Search error:", error);
    return errorResponse(error.message || "Search failed", 500);
  }
}

