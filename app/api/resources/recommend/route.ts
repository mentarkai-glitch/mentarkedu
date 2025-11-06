import { NextRequest } from "next/server";
import { getRecommendedResources, ResourceRecommendationParams } from "@/lib/services/resource-catalog";
import { successResponse, errorResponse, handleApiError, validateRequiredFields } from "@/lib/utils/api-helpers";

/**
 * POST /api/resources/recommend
 * Get AI-recommended resources for a milestone
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = validateRequiredFields(body, ["arkCategory", "milestoneTitle", "studentGrade"]);
    if (!validation.valid) {
      return errorResponse(`Missing required fields: ${validation.missing?.join(", ")}`, 400);
    }

    const params: ResourceRecommendationParams = {
      arkCategory: body.arkCategory,
      milestoneTitle: body.milestoneTitle,
      studentGrade: body.studentGrade,
      learningStyle: body.learningStyle || 'mixed',
      preferredProviders: body.preferredProviders,
      isFree: body.isFree
    };

    const { data, error } = await getRecommendedResources(params);
    
    if (error) {
      return errorResponse("Failed to get recommended resources", 500);
    }

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

