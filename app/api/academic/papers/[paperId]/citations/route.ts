import { NextRequest } from "next/server";
import { semanticScholarService } from "@/lib/services/semantic-scholar";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: { paperId: string } }
) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { paperId } = params;

    if (!paperId) {
      return errorResponse("Paper ID is required", 400);
    }

    // Fetch citations and references in parallel
    const [citations, references] = await Promise.all([
      semanticScholarService.getCitations(paperId, 10),
      semanticScholarService.getReferences(paperId, 10),
    ]);

    return successResponse({
      paperId,
      citations,
      references,
    });
  } catch (error: any) {
    console.error("Citations fetch error:", error);
    return errorResponse(error.message || "Failed to fetch citations", 500);
  }
}

