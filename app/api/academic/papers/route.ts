import { NextRequest } from "next/server";
import { semanticScholarService } from "@/lib/services/semantic-scholar";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const limit = parseInt(searchParams.get("limit") || "10");
    const yearMin = searchParams.get("yearMin") ? parseInt(searchParams.get("yearMin")!) : undefined;
    const yearMax = searchParams.get("yearMax") ? parseInt(searchParams.get("yearMax")!) : undefined;
    const sortBy = searchParams.get("sortBy") as any || "relevance";

    if (!query) {
      return errorResponse("Query parameter is required", 400);
    }

    const result = await semanticScholarService.searchPapers(query, {
      limit,
      yearMin,
      yearMax,
      sortBy,
    });

    return successResponse(result);
  } catch (error: any) {
    console.error("Academic paper search error:", error);
    return errorResponse(error.message || "Failed to search papers", 500);
  }
}

