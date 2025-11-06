import { NextRequest } from "next/server";
import { searchYouTubeVideos, searchCourseVideos } from "@/lib/services/youtube";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, type, maxResults, gradeLevel } = body;

    if (!query) {
      return errorResponse("Query is required", 400);
    }

    let result;

    // Course-specific search
    if (type === "course" || gradeLevel) {
      result = await searchCourseVideos(query, gradeLevel);
    } else {
      // General video search
      result = await searchYouTubeVideos(query, {
        maxResults: maxResults || 10,
        order: "relevance",
        videoDuration: "medium",
      });
    }

    if (!result.success) {
      return errorResponse(result.error || "Failed to search YouTube", 500);
    }

    return successResponse({
      videos: result.videos,
      total_results: result.total_results,
    });
  } catch (error: any) {
    console.error("YouTube search API error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type");
    const maxResults = parseInt(searchParams.get("maxResults") || "10");

    if (!query) {
      return errorResponse("Query parameter 'q' is required", 400);
    }

    let result;

    if (type === "course") {
      result = await searchCourseVideos(query);
    } else {
      result = await searchYouTubeVideos(query, {
        maxResults,
        order: "relevance",
        videoDuration: "medium",
      });
    }

    if (!result.success) {
      return errorResponse(result.error || "Failed to search YouTube", 500);
    }

    return successResponse({
      videos: result.videos,
      total_results: result.total_results,
    });
  } catch (error: any) {
    console.error("YouTube search API error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}


