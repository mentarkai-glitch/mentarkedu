import { NextRequest } from "next/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { scrapingBeeService } from "@/lib/services/scraping/scrapingbee";

/**
 * GET /api/resources/khan-academy?q=query
 * Search Khan Academy for educational content
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return errorResponse("Search query is required", 400);
    }

    // Search Khan Academy
    const result = await scrapingBeeService.searchKhanAcademy(query.trim());

    if (!result.success) {
      return errorResponse(result.error || "Failed to search Khan Academy", 500);
    }

    return successResponse({
      query: query.trim(),
      results: result.results || [],
      count: result.results?.length || 0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}


