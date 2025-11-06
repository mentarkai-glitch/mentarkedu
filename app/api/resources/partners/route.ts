import { NextRequest } from "next/server";
import { getEducationalPartners } from "@/lib/services/resource-catalog";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

/**
 * GET /api/resources/partners
 * Get all educational partners
 */
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await getEducationalPartners();
    
    if (error) {
      return errorResponse("Failed to get educational partners", 500);
    }

    return successResponse(data);
  } catch (error) {
    return handleApiError(error);
  }
}

