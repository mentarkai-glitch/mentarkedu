import { NextRequest } from "next/server";
import { searchResources, ResourceSearchParams } from "@/lib/services/resource-catalog";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

/**
 * GET /api/resources/search
 * Search global educational resources
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params: ResourceSearchParams = {
      subject: searchParams.get('subject') || undefined,
      gradeLevel: searchParams.get('gradeLevel') || undefined,
      type: searchParams.get('type') as any,
      isFree: searchParams.get('isFree') === 'true' ? true : 
              searchParams.get('isFree') === 'false' ? false : undefined,
      provider: searchParams.get('provider') || undefined,
      tags: searchParams.get('tags')?.split(','),
      minimumRating: searchParams.get('minimumRating') ? parseFloat(searchParams.get('minimumRating') || '0') : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit') || '20') : 20
    };

    const { data, error } = await searchResources(params);
    
    if (error) {
      return errorResponse("Failed to search resources", 500);
    }

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

