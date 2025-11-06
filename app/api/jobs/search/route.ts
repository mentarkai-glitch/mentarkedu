import { NextRequest } from "next/server";
import { jSearchService, searchJobs, searchJobsBySkills } from "@/lib/services/jobs/jsearch";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import type { JobSearchOptions } from "@/lib/services/jobs/jsearch";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, skills, location, ...options } = body;

    // Check if query or skills provided
    if (!query && !skills) {
      return errorResponse("Query or skills is required", 400);
    }

    // Check if service is available
    if (!jSearchService.isAvailable()) {
      return errorResponse("JSearch API key not configured", 500);
    }

    let result;

    // Search by skills if provided
    if (skills && Array.isArray(skills)) {
      result = await searchJobsBySkills(skills, {
        location,
        ...options,
      });
    } else {
      // Regular job search
      const searchOptions: JobSearchOptions = {
        query: query || "",
        location,
        ...options,
      };
      result = await jSearchService.searchJobs(searchOptions);
    }

    if (!result.success) {
      return errorResponse(result.error || "Failed to search jobs", 500);
    }

    return successResponse({
      jobs: result.jobs || [],
      total_jobs: result.total_jobs || 0,
      page: result.page || 1,
    });
  } catch (error: any) {
    console.error("Job search API error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const skills = searchParams.get("skills");
    const location = searchParams.get("location");
    const page = parseInt(searchParams.get("page") || "1");
    const numPages = parseInt(searchParams.get("num_pages") || "1");

    if (!query && !skills) {
      return errorResponse("Query parameter 'q' or 'skills' is required", 400);
    }

    if (!jSearchService.isAvailable()) {
      return errorResponse("JSearch API key not configured", 500);
    }

    let result;

    if (skills) {
      result = await searchJobsBySkills(skills.split(","), {
        location: location || undefined,
        datePosted: (searchParams.get("date_posted") as any) || "all",
        remoteOnly: searchParams.get("remote_only") === "true",
      });
    } else {
      const searchOptions: JobSearchOptions = {
        query: query!,
        location: location || undefined,
        page,
        numPages,
        datePosted: (searchParams.get("date_posted") as any) || "all",
        remoteOnly: searchParams.get("remote_only") === "true",
        country: searchParams.get("country") || "IN",
      };
      result = await jSearchService.searchJobs(searchOptions);
    }

    if (!result.success) {
      return errorResponse(result.error || "Failed to search jobs", 500);
    }

    return successResponse({
      jobs: result.jobs || [],
      total_jobs: result.total_jobs || 0,
      page: result.page || 1,
    });
  } catch (error: any) {
    console.error("Job search API error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}


